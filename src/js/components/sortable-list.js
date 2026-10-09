import { createMoveState, createRequestId, shouldRestoreFocus } from './sortable-list-state.js';

const ITEM_SELECTOR = '[data-sortable-item][data-item-id]';
const HANDLE_SELECTOR = '[data-sortable-handle]';
const CONTROL_SELECTOR = '[data-sortable-move]';

class LWSortableList extends HTMLElement {
  constructor() {
    super();
    this._moveState = createMoveState();
    this._stage = null;
    this._pointer = null;
    this._pendingFocusAbort = null;
    this._stageFocusAbort = null;
    this._moveAnimationCleanup = null;
  }

  connectedCallback() {
    if (this._abortController) return;
    this._abortController = new AbortController();
    const { signal } = this._abortController;
    this.addEventListener('click', this._onClick, { signal });
    this.addEventListener('keydown', this._onKeyDown, { signal });
    this.addEventListener('pointerdown', this._onPointerDown, { signal });
    this.addEventListener('pointermove', this._onPointerMove, { signal });
    this.addEventListener('pointerup', this._onPointerUp, { signal });
    this.addEventListener('pointercancel', this._onPointerCancel, { signal });
    this._validateItems();
  }

  disconnectedCallback() {
    this._abortController?.abort();
    this._abortController = null;
    this._cancelPointer();
    this._clearStage();
    this._clearMoveAnimation();
    if (this._moveState.pending) this._rollbackOptimisticMove(this._moveState.pending, false);
    this._moveState.disconnect();
    this.removeAttribute('data-pending');
    this._setControlsPending(false);
    this._pendingFocusAbort?.abort();
    this._pendingFocusAbort = null;
    this._clearMoveAnimation();
    this._announce('');
  }

  resolveMove({ requestId, status, message } = {}) {
    const resolved = this._moveState.resolve(requestId, status);
    if (!resolved || resolved.connection !== this._moveState.connection) return false;

    if (status === 'rejected') this._rollbackOptimisticMove(resolved);
    this.removeAttribute('data-pending');
    this._setControlsPending(false);
    this._pendingFocusAbort?.abort();
    this._pendingFocusAbort = null;

    const item = this._itemById(resolved.itemId);
    const statusNode = this._statusNode();
    if (status === 'accepted') {
      this._announce(`${item?.getAttribute('data-item-label') || resolved.itemId} moved.`);
      this._restoreFocus(resolved);
    } else {
      this._announce(message || `Move of ${item?.getAttribute('data-item-label') || resolved.itemId} was not applied.`);
      if (statusNode) statusNode.dataset.state = 'rejected';
    }
    return true;
  }

  _items() {
    const list = this._ownedElements('[data-sortable-list]')[0];
    if (!list) return [];
    return [...list.querySelectorAll(ITEM_SELECTOR)].filter((item) => item.closest('lw-sortable-list') === this);
  }

  _ownedElements(selector) {
    return [...this.querySelectorAll(selector)].filter((element) => element.closest('lw-sortable-list') === this);
  }

  _statusNode() {
    return this._ownedElements('[data-sortable-status]')[0];
  }

  _validateItems() {
    const rawIds = this._items().map((item) => item.dataset.itemId);
    const ids = rawIds.map((id) => id?.trim());
    const valid = ids.every(Boolean)
      && rawIds.every((id, index) => id === ids[index])
      && new Set(ids).size === ids.length;
    this.toggleAttribute('data-sortable-ready', valid && ids.length > 1);
    if (!valid) console.warn('lw-sortable-list requires unique, non-empty data-item-id values.');
    return valid;
  }

  _itemById(id) {
    return this._items().find((item) => item.dataset.itemId === id);
  }

  _handleFrom(target) {
    const handle = target instanceof Element ? target.closest(HANDLE_SELECTOR) : null;
    return handle && handle.closest('lw-sortable-list') === this ? handle : null;
  }

  _itemFrom(target) {
    const item = target instanceof Element ? target.closest(ITEM_SELECTOR) : null;
    return item && item.closest('lw-sortable-list') === this ? item : null;
  }

  _onClick = (event) => {
    const control = event.target instanceof Element ? event.target.closest(CONTROL_SELECTOR) : null;
    if (!control || control.closest('lw-sortable-list') !== this) return;
    if (this._moveState.pending) {
      event.preventDefault();
      return;
    }
    const source = this._itemFrom(control);
    const items = this._items();
    if (!source || !items.includes(source)) return;
    if (this._stage) {
      this._clearStage();
      this._announce('Staged move cancelled.');
    }
    event.preventDefault();
    const direction = control.dataset.sortableMove;
    const index = items.indexOf(source);
    const target = direction === 'up' ? items[index - 1] : direction === 'down' ? items[index + 1] : null;
    if (!target) return;
    this._dispatchMove(source, direction === 'up' ? target.dataset.itemId : this._idAfter(target));
  };

  _onKeyDown = (event) => {
    const handle = this._handleFrom(event.target);
    if (!handle || this._moveState.pending) return;
    const item = this._itemFrom(handle);
    if (!item) return;

    if (event.key === 'Escape' && (this._stage || this._pointer)) {
      event.preventDefault();
      this._cancelPointer();
      this._clearStage();
      this._announce('Move cancelled.');
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (this._stage && this._stage.item !== item) {
        this._clearStage();
        this._announce('Previous staged move cancelled.');
      }
      if (!this._stage) {
        const next = this._idAfter(item);
        this._setStage(item, next, handle, 'keyboard');
        this._announce('Move staged. Use the arrow keys to choose a position, Space to request it, or Escape to cancel.');
      } else {
        this._commitStage();
      }
      return;
    }
    if (!this._stage || this._stage.item !== item || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const points = this._insertionPoints(item);
    const currentIndex = Math.max(0, points.findIndex((point) => point.before === this._stage.before));
    const nextIndex = Math.min(points.length - 1, Math.max(0, currentIndex + (event.key === 'ArrowUp' ? -1 : 1)));
    this._setStage(item, points[nextIndex].before, handle, 'keyboard');
    this._announce(`Position ${nextIndex + 1} of ${points.length}. Press Space to request this move, or Escape to cancel.`);
  };

  _onPointerDown = (event) => {
    const handle = this._handleFrom(event.target);
    const item = handle && this._itemFrom(handle);
    if (!item || this._moveState.pending || event.button !== 0) return;
    if (this._stage) this._clearStage();
    this._pointer = {
      pointerId: event.pointerId,
      handle,
      item,
      before: this._idAfter(item),
      startX: event.clientX,
      startY: event.clientY,
    };
    item.dataset.sortableDragging = '';
    item.style.setProperty('--sortable-pointer-x', '0px');
    item.style.setProperty('--sortable-pointer-y', '0px');
    handle.setPointerCapture?.(event.pointerId);
  };

  _onPointerMove = (event) => {
    if (!this._pointer || this._pointer.pointerId !== event.pointerId) return;
    this._pointer.item.style.setProperty('--sortable-pointer-x', `${event.clientX - this._pointer.startX}px`);
    this._pointer.item.style.setProperty('--sortable-pointer-y', `${event.clientY - this._pointer.startY}px`);
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const target = this._itemFrom(hit);
    let before = this._pointer.before;
    if (target && target !== this._pointer.item) {
      const rect = target.getBoundingClientRect();
      const afterTarget = event.clientY >= rect.top + rect.height / 2;
      before = afterTarget ? this._idAfter(target, this._pointer.item) : target.dataset.itemId;
    } else if (this._ownedElements('[data-sortable-list]')[0]?.contains(hit)) {
      before = '';
    }
    const changed = this._stage?.item !== this._pointer.item || this._stage?.before !== before;
    if (changed) {
      this._setStage(this._pointer.item, before, this._pointer.handle, 'pointer');
      const target = before ? this._itemById(before) : null;
      const position = this._items().filter((item) => item !== this._pointer.item).findIndex((item) => item === target);
      const description = target ? `before ${target.getAttribute('data-item-label') || target.dataset.itemId}` : 'at the end';
      this._announce(`Drop ${this._pointer.item.getAttribute('data-item-label') || this._pointer.item.dataset.itemId} ${description}. Position ${position < 0 ? this._items().length : position + 1}.`);
    }
  };

  _onPointerUp = (event) => {
    if (!this._pointer || this._pointer.pointerId !== event.pointerId) return;
    event.preventDefault();
    const pointer = this._pointer;
    const list = this._ownedElements('[data-sortable-list]')[0];
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const origin = pointer.item.getBoundingClientRect();
    this._pointer = null;
    this._clearPointerVisual(pointer);
    if (!list?.contains(hit)) {
      this._clearStage();
      this._announce('Move cancelled.');
      return;
    }
    this._commitStage(origin);
  };

  _onPointerCancel = (event) => {
    if (!this._pointer || this._pointer.pointerId !== event.pointerId) return;
    this._cancelPointer();
    this._clearStage();
    this._announce('Move cancelled.');
  };

  _cancelPointer() {
    const pointer = this._pointer;
    this._pointer = null;
    this._clearPointerVisual(pointer);
    if (pointer?.handle?.hasPointerCapture?.(pointer.pointerId)) {
      pointer.handle.releasePointerCapture(pointer.pointerId);
    }
  }

  _clearPointerVisual(pointer) {
    if (!pointer?.item) return;
    pointer.item.removeAttribute('data-sortable-dragging');
    pointer.item.style.removeProperty('--sortable-pointer-x');
    pointer.item.style.removeProperty('--sortable-pointer-y');
  }

  _onStageFocus = (event) => {
    if (!this._stage) return;
    const item = this._itemFrom(event.target);
    if (item !== this._stage.item) {
      this._cancelPointer();
      this._clearStage();
      this._announce('Staged move cancelled.');
    }
  };

  _idAfter(item, excluding = null) {
    const items = this._items().filter((candidate) => candidate !== excluding);
    const index = items.indexOf(item);
    return items[index + 1]?.dataset.itemId || '';
  }

  _insertionPoints(item) {
    const items = this._items().filter((candidate) => candidate !== item);
    return [...items.map((candidate) => ({ before: candidate.dataset.itemId })), { before: '' }];
  }

  _setStage(item, before, handle, input) {
    this._clearStage();
    this._stage = { item, before, handle, input };
    this._stageFocusAbort = new AbortController();
    document.addEventListener('focusin', this._onStageFocus, { signal: this._stageFocusAbort.signal });
    item.toggleAttribute('data-sortable-source', true);
    const target = before ? this._itemById(before) : null;
    target?.toggleAttribute('data-sortable-target', true);
    if (!before) this.toggleAttribute('data-sortable-end-target', true);
  }

  _clearStage() {
    this._stageFocusAbort?.abort();
    this._stageFocusAbort = null;
    this._ownedElements('[data-sortable-source], [data-sortable-target]').forEach((node) => {
      node.removeAttribute('data-sortable-source');
      node.removeAttribute('data-sortable-target');
    });
    this.removeAttribute('data-sortable-end-target');
    this._stage = null;
  }

  _commitStage(origin) {
    const stage = this._stage;
    if (!stage) return;
    const currentItem = this._itemById(stage.item.dataset.itemId);
    const items = this._items();
    this._clearStage();
    if (!currentItem || (stage.before && !items.some((item) => item.dataset.itemId === stage.before))) {
      this._announce('The list changed. Move cancelled.');
      return;
    }
    const currentBefore = this._idAfter(currentItem);
    if (stage.before === currentBefore) {
      this._announce('Item is already in that position.');
      return;
    }
    this._dispatchMove(currentItem, stage.before, this._handleInItem(currentItem), origin);
  }

  _dispatchMove(item, before, handle = this._handleInItem(item), origin = null) {
    const items = this._items();
    if (!this._validateItems()) {
      this._announce('This list needs unique, non-empty item IDs before items can move.');
      return false;
    }
    if (!items.includes(item) || (before && !items.some((candidate) => candidate.dataset.itemId === before))
      || before === item.dataset.itemId) {
      this._announce('The list changed. Move cancelled.');
      return false;
    }
    const requestId = createRequestId();
    const activeElement = document.activeElement;
    const originRect = origin || item.getBoundingClientRect();
    const orderBefore = items.map((candidate) => candidate.dataset.itemId);
    const reordered = items.filter((candidate) => candidate !== item);
    const insertionIndex = before ? reordered.findIndex((candidate) => candidate.dataset.itemId === before) : reordered.length;
    reordered.splice(insertionIndex < 0 ? reordered.length : insertionIndex, 0, item);
    const pending = this._moveState.begin({
      itemId: item.dataset.itemId,
      itemIndex: this._items().indexOf(item),
      origin: { left: originRect.left, top: originRect.top },
      orderBefore,
      orderOptimistic: reordered.map((candidate) => candidate.dataset.itemId),
      itemNodesBefore: items,
      before,
      requestId,
      focusItemId: item.dataset.itemId,
      focusWasInside: this.contains(activeElement),
      focusElement: activeElement,
      fallbackHandle: handle,
      focusChanged: false,
      connection: this._moveState.connection,
    });
    if (!pending) return false;

    const list = this._ownedElements('[data-sortable-list]')[0];
    const target = before ? this._itemById(before) : null;
    list.insertBefore(item, target);
    this._animateMove(item, pending.origin);
    this.setAttribute('data-pending', '');
    this._setControlsPending(true);
    this._pendingFocusAbort = new AbortController();
    document.addEventListener('focusin', this._onPendingFocus, { signal: this._pendingFocusAbort.signal });
    this._announce(`Move requested for ${item.getAttribute('data-item-label') || pending.itemId}.`);
    this.dispatchEvent(new CustomEvent('sortable-move-request', {
      bubbles: true,
      detail: { itemId: pending.itemId, before: pending.before, requestId },
    }));
    return true;
  }

  _handleInItem(item) {
    if (!item?.querySelectorAll) return null;
    return [...item.querySelectorAll(HANDLE_SELECTOR)].find((handle) => handle.closest('lw-sortable-list') === this);
  }

  _restoreFocus(resolved) {
    const active = document.activeElement;
    if (!shouldRestoreFocus({
      wasInside: resolved.focusWasInside,
      focusChanged: resolved.focusChanged,
      previousStillConnected: resolved.focusElement?.isConnected,
      activeIsBodyOrHost: active === document.body || active === this,
    })) return;
    const items = this._items();
    const nearby = items[Math.min(resolved.itemIndex, items.length - 1)];
    const replacement = this._handleInItem(this._itemById(resolved.focusItemId) || {})
      || (nearby && this._handleInItem(nearby))
      || this._statusNode();
    replacement?.focus({ preventScroll: true });
  }

  _rollbackOptimisticMove(resolved, animate = true) {
    if (!Array.isArray(resolved.orderBefore) || !Array.isArray(resolved.orderOptimistic)) return false;
    const items = this._items();
    const currentOrder = items.map((item) => item.dataset.itemId);
    if (currentOrder.length !== resolved.orderOptimistic.length
      || currentOrder.some((id, index) => id !== resolved.orderOptimistic[index])) return false;

    const itemsById = new Map(items.map((item) => [item.dataset.itemId, item]));
    if (resolved.orderBefore.length !== items.length
      || resolved.orderBefore.some((id, index) => !itemsById.has(id)
        || itemsById.get(id) !== resolved.itemNodesBefore?.[index])) return false;

    const movedItem = itemsById.get(resolved.itemId);
    const currentRect = movedItem.getBoundingClientRect();
    const list = this._ownedElements('[data-sortable-list]')[0];
    const restored = document.createDocumentFragment();
    resolved.orderBefore.forEach((id) => restored.append(itemsById.get(id)));
    list.append(restored);
    if (animate) {
      const item = itemsById.get(resolved.itemId);
      this._animateMove(item, { left: currentRect.left, top: currentRect.top });
    }
    return true;
  }

  _animateMove(item, origin) {
    if (!item || !origin || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = item.getBoundingClientRect();
    const deltaX = origin.left - rect.left;
    const deltaY = origin.top - rect.top;
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

    this._clearMoveAnimation();
    item.style.setProperty('--sortable-from-x', `${deltaX}px`);
    item.style.setProperty('--sortable-from-y', `${deltaY}px`);
    item.dataset.sortableMotion = 'moving';

    const cleanup = (event) => {
      if (event && event.animationName !== 'sortable-move-land') return;
      item.removeEventListener('animationend', cleanup);
      item.removeAttribute('data-sortable-motion');
      item.style.removeProperty('--sortable-from-x');
      item.style.removeProperty('--sortable-from-y');
      clearTimeout(this._moveAnimationTimer);
      this._moveAnimationTimer = null;
      if (this._moveAnimationCleanup === cleanup) this._moveAnimationCleanup = null;
    };

    this._moveAnimationCleanup = cleanup;
    item.addEventListener('animationend', cleanup);
    this._moveAnimationTimer = setTimeout(cleanup, 450);
  }

  _clearMoveAnimation() {
    this._moveAnimationCleanup?.();
  }

  _setControlsPending(pending) {
    this._ownedElements(`${CONTROL_SELECTOR}, ${HANDLE_SELECTOR}`).forEach((control) => {
      if (pending) control.setAttribute('aria-disabled', 'true');
      else control.removeAttribute('aria-disabled');
    });
  }

  _onPendingFocus = (event) => {
    const pending = this._moveState.pending;
    if (pending && event.target !== pending.focusElement) pending.focusChanged = true;
  };

  _announce(message) {
    const statusNode = this._statusNode();
    if (statusNode) {
      statusNode.dataset.state = message ? 'active' : '';
      statusNode.textContent = message;
    }
  }
}

if (!customElements.get('lw-sortable-list')) {
  customElements.define('lw-sortable-list', LWSortableList);
}
