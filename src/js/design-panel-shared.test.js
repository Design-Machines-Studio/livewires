import { describe, it, expect, vi } from 'vitest';
import {
  TYPOGRAPHY_SIGNAL_MAP,
  DEFAULT_THEME_ID,
  ACTIVE_THEME_ID_KEY,
  isDefaultActive,
  makeDebouncedSaver,
  registerPanelShared,
} from './design-panel-shared.js';

function makeStubStorage(initial) {
  const data = new Map(Object.entries(initial || {}));
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
    get size() {
      return data.size;
    },
    _data: data,
  };
}

function makeFakeTimers() {
  let nextId = 1;
  const timers = new Map();
  return {
    setTimeout(fn, _ms) {
      const id = nextId++;
      timers.set(id, fn);
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    fire(id) {
      const fn = timers.get(id);
      timers.delete(id);
      if (fn) fn();
    },
    fireAll() {
      for (const fn of timers.values()) fn();
      timers.clear();
    },
    get pending() {
      return timers.size;
    },
  };
}

describe('TYPOGRAPHY_SIGNAL_MAP', () => {
  it('has exactly 9 entries matching the Typography editor inputs', () => {
    expect(Object.keys(TYPOGRAPHY_SIGNAL_MAP)).toHaveLength(9);
  });

  it('every value is a CSS custom property name', () => {
    for (const cssProp of Object.values(TYPOGRAPHY_SIGNAL_MAP)) {
      expect(cssProp).toMatch(/^--[a-z][a-z0-9-]*$/);
    }
  });

  it('is frozen so runtime mutation throws or silently fails', () => {
    expect(Object.isFrozen(TYPOGRAPHY_SIGNAL_MAP)).toBe(true);
  });
});

describe('isDefaultActive', () => {
  it('returns true when the storage has no active-theme-id', () => {
    const s = makeStubStorage();
    expect(isDefaultActive(s)).toBe(true);
  });

  it('returns true when the active-theme-id matches DEFAULT_THEME_ID', () => {
    const s = makeStubStorage({ [ACTIVE_THEME_ID_KEY]: DEFAULT_THEME_ID });
    expect(isDefaultActive(s)).toBe(true);
  });

  it('returns false for any other thm_ id', () => {
    const s = makeStubStorage({ [ACTIVE_THEME_ID_KEY]: 'thm_dusk' });
    expect(isDefaultActive(s)).toBe(false);
  });

  it('returns true when storage.getItem throws', () => {
    const s = {
      getItem() {
        throw new Error('private browsing quota');
      },
    };
    expect(isDefaultActive(s)).toBe(true);
  });

  it('returns true when no storage is provided and no window exists', () => {
    expect(isDefaultActive(null)).toBe(true);
  });
});

describe('makeDebouncedSaver', () => {
  function setup({ debounceMs = 200 } = {}) {
    const storage = makeStubStorage();
    const timers = makeFakeTimers();
    const serialize = vi.fn(() => ({ a: 1 }));
    const save = makeDebouncedSaver('k', serialize, debounceMs, {
      storage,
      setTimeout: timers.setTimeout,
      clearTimeout: timers.clearTimeout,
    });
    return { storage, timers, serialize, save };
  }

  it('does not persist before the debounce timer fires', () => {
    const { storage, serialize, save } = setup();
    save();
    expect(storage.getItem('k')).toBeNull();
    expect(serialize).not.toHaveBeenCalled();
  });

  it('persists when the timer fires', () => {
    const { storage, timers, serialize, save } = setup();
    save();
    expect(timers.pending).toBe(1);
    timers.fireAll();
    expect(storage.getItem('k')).toBe(JSON.stringify({ a: 1 }));
    expect(serialize).toHaveBeenCalledOnce();
  });

  it('consecutive save() calls reset the timer (debounce)', () => {
    const { storage, timers, serialize, save } = setup();
    save();
    save();
    save();
    expect(timers.pending).toBe(1); // only the latest timer is alive
    timers.fireAll();
    expect(serialize).toHaveBeenCalledOnce();
    expect(storage.getItem('k')).toBe(JSON.stringify({ a: 1 }));
  });

  it('flush() is a no-op when no save is pending', () => {
    const { storage, serialize, save } = setup();
    save.flush();
    expect(storage.getItem('k')).toBeNull();
    expect(serialize).not.toHaveBeenCalled();
  });

  it('flush() synchronously persists when a save is pending', () => {
    const { storage, timers, serialize, save } = setup();
    save();
    expect(storage.getItem('k')).toBeNull();
    save.flush();
    expect(storage.getItem('k')).toBe(JSON.stringify({ a: 1 }));
    expect(serialize).toHaveBeenCalledOnce();
    expect(timers.pending).toBe(0); // timer cancelled
  });

  it('flush() after save() after flush() writes the latest value once per schedule', () => {
    const { storage, serialize, save } = setup();
    let payload = { a: 1 };
    serialize.mockImplementation(() => payload);
    save();
    save.flush();
    expect(storage.getItem('k')).toBe(JSON.stringify({ a: 1 }));
    payload = { a: 2 };
    save();
    save.flush();
    expect(storage.getItem('k')).toBe(JSON.stringify({ a: 2 }));
    expect(serialize).toHaveBeenCalledTimes(2);
  });

  it('double-flush does not double-write', () => {
    const { serialize, save } = setup();
    save();
    save.flush();
    save.flush();
    expect(serialize).toHaveBeenCalledOnce();
  });

  it('silently skips when storage.setItem throws (quota / disabled)', () => {
    const throwingStorage = {
      getItem: () => null,
      setItem() {
        throw new Error('QuotaExceeded');
      },
    };
    const timers = makeFakeTimers();
    const save = makeDebouncedSaver('k', () => ({}), 50, {
      storage: throwingStorage,
      setTimeout: timers.setTimeout,
      clearTimeout: timers.clearTimeout,
    });
    // Must not throw
    expect(() => {
      save();
      timers.fireAll();
    }).not.toThrow();
  });
});

describe('registerPanelShared', () => {
  it('attaches four globals onto the target', () => {
    const target = { localStorage: makeStubStorage() };
    registerPanelShared(target);
    expect(target.__dpTypographySignalMap).toBe(TYPOGRAPHY_SIGNAL_MAP);
    expect(target.__dpDefaultThemeId).toBe(DEFAULT_THEME_ID);
    expect(typeof target.__dpIsDefaultActive).toBe('function');
    expect(typeof target.__dpMakeDebouncedSaver).toBe('function');
  });

  it('is idempotent - second registration is a silent no-op', () => {
    const target = { localStorage: makeStubStorage() };
    registerPanelShared(target);
    const firstMap = target.__dpTypographySignalMap;
    registerPanelShared(target);
    expect(target.__dpTypographySignalMap).toBe(firstMap);
  });

  it('bound __dpIsDefaultActive reads the target storage', () => {
    const target = {
      localStorage: makeStubStorage({ [ACTIVE_THEME_ID_KEY]: 'thm_dusk' }),
    };
    registerPanelShared(target);
    expect(target.__dpIsDefaultActive()).toBe(false);
    target.localStorage.setItem(ACTIVE_THEME_ID_KEY, DEFAULT_THEME_ID);
    expect(target.__dpIsDefaultActive()).toBe(true);
  });
});
