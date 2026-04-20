var vt=Object.defineProperty;var $e=t=>{throw TypeError(t)};var St=(t,n,e)=>n in t?vt(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var Re=(t,n,e)=>St(t,typeof n!="symbol"?n+"":n,e),se=(t,n,e)=>n.has(t)||$e("Cannot "+e);var h=(t,n,e)=>(se(t,n,"read from private field"),e?e.call(t):n.get(t)),j=(t,n,e)=>n.has(t)?$e("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,e),q=(t,n,e,a)=>(se(t,n,"write to private field"),a?a.call(t,e):n.set(t,e),e),C=(t,n,e)=>(se(t,n,"access private method"),e);class xt extends HTMLElement{async connectedCallback(){const n=this.getAttribute("src");if(!n){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const a=await e.text(),r=document.createElement("template");r.innerHTML=a;const l=r.content.cloneNode(!0);this.innerHTML="",this.appendChild(l),this.querySelectorAll("script").forEach(m=>{const f=document.createElement("script");Array.from(m.attributes).forEach(b=>{f.setAttribute(b.name,b.value)}),f.textContent=m.textContent,m.parentNode.replaceChild(f,m)})}catch(e){console.error(`HtmlInclude: failed to load ${n}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",xt);class Et extends HTMLElement{connectedCallback(){const n=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const a=e.textContent.trim();a&&n.push(a)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&n.push(e.outerHTML);this._triggerContent=n.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var n;(n=this._abortController)==null||n.abort()}escapeHtml(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}sanitizeHref(n){return n?/^(javascript|data|vbscript):/i.test(n)?(console.warn("PopupDialog: Blocked potentially dangerous href:",n),""):n:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var n;(n=this.querySelector("dialog"))==null||n.showModal()}close(){var n;(n=this.querySelector("dialog"))==null||n.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const n=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),a=n?n.innerHTML:this.escapeHtml(this.body),r=this.escapeHtml(this.title);let l="";if(e)l=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const f=`button button--${this.escapeHtml(this.confirmVariant)}`,b=[];this.cancelLabel&&b.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&b.push(this.confirmHref?`<a href="${this.confirmHref}" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),l=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${b.join("")}</footer>`}const u=r?`<header class="cluster cluster-between cluster-nowrap">
          <h2>${r}</h2>
          <button class="dialog-close" data-close type="button" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </header>`:`<header class="cluster cluster-end">
          <button class="dialog-close" data-close type="button" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </header>`;this.innerHTML=`
      <span class="dialog-trigger" data-trigger>${this._triggerContent}</span>
      <dialog class="dialog imposter imposter-fixed">
        <div class="box stack">
          ${u}
          <div>${a}</div>
          ${l}
        </div>
      </dialog>
    `}setupEvents(){const n=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),a=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:r}=this._abortController;n.addEventListener("click",l=>{l.preventDefault(),e.showModal()},{signal:r}),a.addEventListener("click",()=>{e.close()},{signal:r}),e.addEventListener("click",l=>{const u=l.target.closest("[data-action]");if(u){const m=u.dataset.action;m==="cancel"||m==="close"?(l.preventDefault(),e.close()):m==="confirm"&&u.tagName!=="A"&&(l.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}l.target===e&&e.close()},{signal:r})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",Et);const He=`
  :host {
    /* Panel-scoped design tokens (hardcoded hex, immune to app scheme changes) */
    --dp-bg: #1A1A1A;
    --dp-bg-input: #252525;
    --dp-bg-elevated: #2E2E2E;
    --dp-border: #4A4A4A;
    --dp-text-muted: #A8A8A8;
    --dp-text-secondary: #D1D1D1;
    --dp-text: #F5F5F5;
    --dp-accent: #1966D9;
    --dp-accent-light: #5DAEFF;
    --dp-radius: 3px;
    --dp-space-xs: 6px;
    --dp-space-sm: 12px;
    --dp-space-md: 18px;
    --dp-width: 320px;

    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--dp-text);
  }

  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--dp-width);
    background: var(--dp-bg);
    color: var(--dp-text);
    border-left: 1px solid var(--dp-border);
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 250ms ease;
    box-sizing: border-box;
  }

  :host([open]) .panel {
    transform: translateX(0);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--dp-space-sm) var(--dp-space-md);
    border-bottom: 1px solid var(--dp-border);
    position: sticky;
    top: 0;
    background: var(--dp-bg);
    z-index: 1;
  }

  .header h2 {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
    color: var(--dp-text);
  }

  .close {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-block-size: 0;
    padding: var(--dp-space-xs);
    background: none;
    color: var(--dp-text-muted);
    border: none;
    border-radius: var(--dp-radius);
    font-size: 1rem;
    line-height: 0;
    cursor: pointer;
    box-sizing: border-box;
    transition: color 150ms ease;
  }

  .close:hover { color: var(--dp-text); }
  .close:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--dp-border);
  }

  .tabs [role="tab"] {
    appearance: none;
    -webkit-appearance: none;
    flex: 1;
    padding: 4px 0;
    margin: 0;
    background: none;
    color: var(--dp-text-muted);
    border: none;
    border-radius: 0;
    border-bottom: 1px solid transparent;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.5625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    text-align: center;
    box-sizing: border-box;
    min-block-size: 0;
    line-height: 1;
    transition: color 150ms ease, border-color 150ms ease;
  }

  .tabs [role="tab"]:hover { color: var(--dp-text-secondary); }
  .tabs [role="tab"][aria-selected="true"] {
    color: var(--dp-text);
    border-bottom: 2px solid var(--dp-text);
  }
  .tabs [role="tab"]:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }

  .body { }

  .section {
    padding: var(--dp-space-sm) var(--dp-space-md);
    border-bottom: 1px solid var(--dp-bg-elevated);
  }

  .section-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--dp-text-muted);
    margin: 0 0 var(--dp-space-sm) 0;
  }

  /* Tool button grid */
  .tools {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--dp-space-xs);
  }

  .tool {
    appearance: none;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-block-size: 0;
    padding: 4px;
    background: var(--dp-bg-elevated);
    color: var(--dp-text-secondary);
    border: 1px solid var(--dp-border);
    border-radius: var(--dp-radius);
    font-size: 0;
    line-height: 1;
    cursor: pointer;
    text-align: center;
    user-select: none;
    box-sizing: border-box;
    transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
  }

  .tool:hover {
    background: var(--dp-border);
    color: var(--dp-text);
  }

  .tool[data-active] {
    background: var(--dp-accent);
    border-color: var(--dp-accent-light);
    color: var(--dp-text);
  }

  .tool:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }

  .tool-key {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    line-height: 1;
  }

  .tool-label {
    display: block;
    font-size: 0.5625rem;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.55;
    line-height: 1;
    margin-top: 2px;
  }

  /* Settings */
  .settings {
    display: grid;
    gap: var(--dp-space-xs);
  }

  .setting {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: var(--dp-space-sm);
  }

  .setting label {
    font-size: 0.75rem;
    color: var(--dp-text-muted);
  }

  .setting select,
  .setting input[type="number"] {
    appearance: none;
    -webkit-appearance: none;
    min-block-size: 0;
    background: var(--dp-bg-elevated);
    border: 1px solid var(--dp-border);
    color: var(--dp-text);
    padding: var(--dp-space-xs) var(--dp-space-sm);
    border-radius: var(--dp-radius);
    font-family: inherit;
    font-size: 0.75rem;
    min-width: 80px;
    box-sizing: border-box;
  }

  .setting select:focus-visible,
  .setting input[type="number"]:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }

  /* Trigger FAB */
  .trigger {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-block-size: 0;
    position: fixed;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: rgba(255, 255, 255, 0.7);
    border: none;
    padding: 10px;
    line-height: 0;
    border-radius: 3px;
    font-size: 0.75rem;
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
    z-index: 10000;
    opacity: 0.4;
    transition: opacity 150ms ease;
  }

  .trigger:hover { opacity: 1; color: #fff; }
  .trigger:focus-visible {
    outline: 2px solid var(--dp-accent-light);
    outline-offset: 2px;
  }
  .trigger svg { display: block; }

  :host([open]) .trigger { visibility: hidden; }

  /* Slot for Datastar-driven token editor partials (Chunk 3).
     Slotted children are light DOM; shadow CSS can only target :host and
     the slot descendant selector ::slotted(). */
  .body > slot {
    display: contents;
  }

  /* Hide the Guides body when a non-Guides tab is active. */
  :host(:not([active-tab="guides"])) .guides-body {
    display: none;
  }

  /* Hide all slotted editors by default. */
  ::slotted([slot="editor"][data-tab]) {
    display: none;
  }

  /* Show the slotted editor whose data-tab matches the active tab. */
  :host([active-tab="typography"]) ::slotted([slot="editor"][data-tab="typography"]) { display: block; }
  :host([active-tab="colors"])     ::slotted([slot="editor"][data-tab="colors"])     { display: block; }
  :host([active-tab="theme"])      ::slotted([slot="editor"][data-tab="theme"])      { display: block; }

  /* Hidden tab button (slotchange empty-slot detection). */
  .tabs [role="tab"].hidden {
    display: none;
  }
`;let oe=null;const Oe=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";Oe&&(oe=new CSSStyleSheet,oe.replaceSync(He));const X=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],W={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},Ct={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},Me="design-panel:state",wt=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function At(){return X.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function Tt(){return Object.entries(W).map(([t,n])=>{let e;if(n.type==="number")e=`<input type="number" data-setting="${t}" min="${n.min}" max="${n.max}" />`;else{const a=n.options.map(r=>`<option value="${r.value}">${r.label}</option>`).join("");e=`<select data-setting="${t}">${a}</select>`}return`
      <div class="setting">
        <label for="dp-setting-${t}">${n.label}</label>
        ${e.replace("data-setting=",`id="dp-setting-${t}" data-setting=`)}
      </div>
    `}).join("")}const Lt=`
  <aside class="panel" part="panel">
    <div class="header">
      <h2>Design Tools</h2>
      <button type="button" class="close" aria-label="Close design tools">&times;</button>
    </div>
    <div class="tabs" role="tablist">
      <button type="button" role="tab" data-tab="guides" aria-label="Guides tab">Guides</button>
      <button type="button" role="tab" data-tab="typography" aria-label="Typography tab">Type</button>
      <button type="button" role="tab" data-tab="colors" aria-label="Colors tab">Colour</button>
      <button type="button" role="tab" data-tab="theme" aria-label="Theme tab">Theme</button>
    </div>
    <div class="body">
      <div class="guides-body">
        <div class="section">
          <h3 class="section-title">Overlays</h3>
          <div class="tools">${At()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${Tt()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${wt}</button>
`;var x,D,V,H,N,y,ce,Pe,Z,de,Q,ue,pe,Ne,Ie,De,Be,qe,U;class _e extends HTMLElement{constructor(){super();j(this,y);j(this,x,{...Ct});j(this,D,null);j(this,V,!1);j(this,H,null);j(this,N,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),Oe&&oe)this.shadowRoot.adoptedStyleSheets=[oe];else{const e=document.createElement("style");e.textContent=He,this.shadowRoot.appendChild(e)}}connectedCallback(){q(this,H,new AbortController),C(this,y,qe).call(this),C(this,y,ce).call(this),C(this,y,Pe).call(this),C(this,y,Q).call(this),C(this,y,Ie).call(this),this.inert=!this.hasAttribute("open"),C(this,y,De).call(this),C(this,y,Be).call(this)}disconnectedCallback(){h(this,H)&&(h(this,H).abort(),q(this,H,null)),h(this,D)&&(clearTimeout(h(this,D)),q(this,D,null))}attributeChangedCallback(e,a,r){a!==r&&(e==="open"?(h(this,x).open=r!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(h(this,x).activeTab=r||"guides",h(this,V)&&C(this,y,Q).call(this)):e==="overlay-target"&&C(this,y,ce).call(this))}}x=new WeakMap,D=new WeakMap,V=new WeakMap,H=new WeakMap,N=new WeakMap,y=new WeakSet,ce=function(){const e=this.getAttribute("overlay-target")||"body";try{q(this,N,document.querySelector(e)||document.body)}catch{q(this,N,document.body)}},Pe=function(){const e=document.createRange().createContextualFragment(Lt);this.shadowRoot.appendChild(e),q(this,V,!0);const a=h(this,H)?h(this,H).signal:void 0,r=a?{signal:a}:void 0,l=this.shadowRoot.querySelector(".close");l&&l.addEventListener("click",()=>C(this,y,Z).call(this,!1),r);const u=this.shadowRoot.querySelector(".trigger");u&&u.addEventListener("click",()=>C(this,y,Z).call(this,!0),r),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(m=>{m.addEventListener("click",()=>C(this,y,de).call(this,m.dataset.tab),r)}),this.shadowRoot.querySelectorAll(".tool").forEach(m=>{m.addEventListener("click",()=>C(this,y,ue).call(this,m.dataset.tool),r)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(m=>{const f=m.dataset.setting,b=W[f];if(!b)return;const L=b.type==="number"?"input":"change";m.addEventListener(L,O=>{const R=b.type==="number"?Number(O.target.value):O.target.value;C(this,y,pe).call(this,f,R)},r)})},Z=function(e){h(this,x).open=!!e,h(this,x).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",h(this,x).open),C(this,y,U).call(this)},de=function(e){e&&(h(this,x).activeTab=e,this.setAttribute("active-tab",e),C(this,y,Q).call(this),C(this,y,U).call(this))},Q=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const a=e.dataset.tab===h(this,x).activeTab;e.setAttribute("aria-selected",a?"true":"false"),e.toggleAttribute("data-active",a)})},ue=function(e){const a=X.find(l=>l.name===e);if(!a)return;h(this,x)[e]=!h(this,x)[e],h(this,N)&&h(this,N).classList.toggle(a.className,h(this,x)[e]);const r=this.shadowRoot.querySelector(`[data-tool="${e}"]`);r&&(r.setAttribute("aria-pressed",h(this,x)[e]?"true":"false"),r.toggleAttribute("data-active",h(this,x)[e])),C(this,y,U).call(this)},pe=function(e,a){h(this,x)[e]=a;const r=W[e];if(r){if(r.target==="cssvar")document.documentElement.style.setProperty(r.cssvar,String(a));else if(r.target==="overlayattr")h(this,N)&&h(this,N).setAttribute(r.attr,String(a));else if(r.target==="overlay-data-margin-mode"){const l=document.getElementById("dev-column-overlay"),u=document.getElementById("dev-margin-overlay");l&&l.setAttribute("data-margin-mode",String(a)),u&&u.setAttribute("data-margin-mode",String(a))}C(this,y,U).call(this)}},Ne=function(e){const a=this.shadowRoot.querySelector(`[data-setting="${e}"]`);a&&a.value!==String(h(this,x)[e])&&(a.value=String(h(this,x)[e]))},Ie=function(){for(const e of X){const a=!!h(this,x)[e.name];h(this,N)&&h(this,N).classList.toggle(e.className,a);const r=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);r&&(r.setAttribute("aria-pressed",a?"true":"false"),r.toggleAttribute("data-active",a))}for(const e of Object.keys(W))h(this,x)[e]!==void 0&&(C(this,y,pe).call(this,e,h(this,x)[e]),C(this,y,Ne).call(this,e));document.body.toggleAttribute("data-panel-open",!!h(this,x).open)},De=function(){const e=h(this,H)?h(this,H).signal:void 0,a=e?{signal:e}:void 0,r=l=>{const u=l.composedPath(),m=u&&u[0];if(m&&m.matches&&m.matches("input,textarea,[contenteditable]")||l.metaKey||l.ctrlKey||l.altKey)return;const f=(l.key||"").toLowerCase();if(!f)return;if(f==="t"){C(this,y,Z).call(this,!h(this,x).open),l.preventDefault();return}const b=X.find(L=>L.key===f);b&&(C(this,y,ue).call(this,b.name),l.preventDefault())};window.addEventListener("keydown",r,a)},Be=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const a=h(this,H)?h(this,H).signal:void 0,r=a?{signal:a}:void 0,l=()=>{const u=e.assignedElements(),m=new Set(u.map(f=>f.getAttribute("data-tab")).filter(f=>!!f));for(const f of this.shadowRoot.querySelectorAll('[role="tab"]')){const b=f.dataset.tab;b!=="guides"&&f.classList.toggle("hidden",!m.has(b))}h(this,x).activeTab!=="guides"&&!m.has(h(this,x).activeTab)&&C(this,y,de).call(this,"guides")};e.addEventListener("slotchange",l,r),l()},qe=function(){try{const e=localStorage.getItem(Me);if(e){const a=JSON.parse(e);a&&typeof a=="object"&&Object.assign(h(this,x),a)}}catch{}h(this,x).open?this.setAttribute("open",""):this.removeAttribute("open"),h(this,x).activeTab&&this.setAttribute("active-tab",h(this,x).activeTab)},U=function(){h(this,D)&&clearTimeout(h(this,D)),q(this,D,setTimeout(()=>{try{localStorage.setItem(Me,JSON.stringify(h(this,x)))}catch{}q(this,D,null)},200))},Re(_e,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",_e);(function(){const t="design-panel-runtime-schemes";function n(){let r=document.getElementById(t);r||(r=document.createElement("style"),r.id=t,document.head.appendChild(r),r.sheet.insertRule("@layer tokens {}",0),r.sheet.insertRule("@layer utilities {}",1));const l={};for(let u=0;u<r.sheet.cssRules.length;u++){const m=r.sheet.cssRules[u];m.name&&(l[m.name]=m)}return l}let e=null;function a(){return e||(e=n()),e}window.__dpSchemeUpdate=function(r,l,u,m){const f=a()[m||"tokens"];if(f){for(let b=0;b<f.cssRules.length;b++)if(f.cssRules[b].selectorText===r){f.cssRules[b].style.setProperty(l,u);return}f.insertRule(r+"{"+l+":"+u+"}",f.cssRules.length)}},window.__dpSchemeReset=function(){const r=a();for(const l in r){const u=r[l];for(;u.cssRules.length>0;)u.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(l=>l.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(l=>{for(let u=0;u<l.options.length;u++)if(l.options[u].defaultSelected){l.selectedIndex=u;break}})},window.__dpSchemeSerialize=function(){const r=[];return document.querySelectorAll(".dp-scheme-card").forEach(l=>{const u=l.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!u)return;const m=u.className.replace(/^scheme-/,""),f=l.querySelectorAll(".dp-scheme-mode-column"),b=["light","dark"];f.forEach((L,O)=>{const R=b[O];R&&L.querySelectorAll(".dp-scheme-mapping-row").forEach(_=>{const M=_.querySelector("label"),p=_.querySelector("select");if(!M||!p)return;const I=M.textContent.trim(),B=p.value,P=p.getAttribute("data-library-default")||"";B&&B!==P&&r.push({scheme:m,token:I,mode:R,value:B})})})}),r}})();function Fe(t){const n=String(t).replace(/^#/,"");if(n.length!==6||/[^0-9a-fA-F]/.test(n))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(n,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function re(t){if(!Number.isFinite(t))return 0;const n=Math.round(t*255);return n<0?0:n>255?255:n}function je({R:t,G:n,B:e}){const a=re(t),r=re(n),l=re(e);return"#"+a.toString(16).padStart(2,"0")+r.toString(16).padStart(2,"0")+l.toString(16).padStart(2,"0")}function ae(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function ie(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function Ge({R:t,G:n,B:e}){return{R:ae(t),G:ae(n),B:ae(e)}}function ze({R:t,G:n,B:e}){return{R:ie(t),G:ie(n),B:ie(e)}}function le(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function Ue({R:t,G:n,B:e}){let a=.4122214708*t+.5363325363*n+.0514459929*e,r=.2119034982*t+.6806995451*n+.1073969566*e,l=.0883024619*t+.2817188376*n+.6299787005*e;a=le(a),r=le(r),l=le(l);const u=.2104542553*a+.793617785*r-.0040720468*l,m=1.9779984951*a-2.428592205*r+.4505937099*l,f=.0259040371*a+.7827717662*r-.808675766*l;return{L:u,a:m,b:f}}function me({L:t,a:n,b:e}){let a=t+.3963377774*n+.2158037573*e,r=t-.1055613458*n-.0638541728*e,l=t-.0894841775*n-1.291485548*e;a=a*a*a,r=r*r*r,l=l*l*l;const u=4.0767416621*a-3.3077115913*r+.2309699292*l,m=-1.2684380046*a+2.6097574011*r-.3413193965*l,f=-.0041960863*a-.7034186147*r+1.707614701*l;return{R:u,G:m,B:f}}function Ve({L:t,a:n,b:e}){const a=Math.sqrt(n*n+e*e),l=(Math.atan2(e,n)*180/Math.PI%360+360)%360;return{L:t,C:a,H:l}}function he({L:t,C:n,H:e}){const a=e*Math.PI/180;return{L:t,a:n*Math.cos(a),b:n*Math.sin(a)}}function Ke(t){return Ve(Ue(Ge(Fe(t))))}function ee({L:t,C:n,H:e}){return je(ze(me(he({L:t,C:n,H:e}))))}function fe({L:t,C:n,H:e}){const a=he({L:t,C:n,H:e}),r=me(a),l=.002;return r.R>=-l&&r.R<=1+l&&r.G>=-l&&r.G<=1+l&&r.B>=-l&&r.B<=1+l}function be(t,n){let e=0,a=.4;for(let r=0;r<40;r++){const l=(e+a)/2;fe({L:t,C:l,H:n})?e=l:a=l}return e}function te({L:t,C:n,H:e}){return fe({L:t,C:n,H:e})?{L:t,C:n,H:e}:{L:t,C:be(t,e),H:e}}function Ye(t,n,e){return t<n?n:t>e?e:t}function kt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:Fe,sRGBToHex:je,sRGBToLinearRGB:Ge,linearRGBToSRGB:ze,linearRGBToOKLab:Ue,oklabToLinearRGB:me,oklabToOKLCH:Ve,oklchToOKLab:he,hexToOKLCH:Ke,oklchToHex:ee,isInSRGBGamut:fe,maxChromaSRGB:be,clampChroma:te,clampFloat:Ye}))}const ge=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),$t=Object.freeze(["blue","red","orange","yellow","green","grey"]),Je=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),ye=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function Rt(t,n){const e=t||ye,a=Math.max(0,Math.min(100,n))/100,r={};for(const l of ge){const u=Number(l),m=e[u]??e[String(u)]??.5;r[u]=m*a}return r}function Mt(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const n=Ke(t.anchorHex),e=t.lTargets||Je,a=t.chromaProfile||ye,r=t.overrides||{},l=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const u=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,m=n.L-u,f=[];for(const b of ge){if(Object.prototype.hasOwnProperty.call(r,b)){const[p,I,B]=r[b],P=te({L:p,C:I,H:B});f.push({step:b,hex:ee(P),L:P.L,C:P.C,H:P.H});continue}if(b===t.anchorStep){const p=te(n);f.push({step:b,hex:ee(p),L:p.L,C:p.C,H:p.H});continue}const L=Object.prototype.hasOwnProperty.call(e,b)?e[b]:.58,O=Ye(L+m,.06,.985);let R=l?l(b):n.H,_;if(t.isNeutral)_=t.neutralChroma,R=t.neutralHue;else{const p=be(O,R),I=Object.prototype.hasOwnProperty.call(a,b)?a[b]:.5;_=p*I}const M=te({L:O,C:_,H:R});f.push({step:b,hex:ee(M),L:M.L,C:M.C,H:M.H})}return f}function Ht(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:ge,FAMILY_NAMES:$t,DEFAULT_L_TARGETS:Je,DEFAULT_CHROMA_PROFILE:ye,generateRamp:Mt,scaleChromaProfile:Rt}))}function Ot(t=globalThis){kt(t),Ht(t)}(function(){const t=typeof window<"u"&&window.DesignPanelColor||{},n=t.FAMILY_NAMES?Array.from(t.FAMILY_NAMES):["blue","red","orange","yellow","green","grey"],e=t.STEPS?t.STEPS.map(String):["50","100","200","300","400","500","600","700","800","900","950"],a=["default","subtle","accent"],r=["light","dark"],l=["bg","fg","accent","muted","subtle"],u="design-panel:schemes",m="design-panel:ramps",f=300,b={blue:"#1f75ff",red:"#e10600",orange:"#ff4f00",yellow:"#ffa300",green:"#00b312",grey:"#808080"},L={};for(const o of n)L[o]=o.charAt(0).toUpperCase()+o.slice(1);const O=new RegExp(`^(?:${n.join("|")})-(?:${e.join("|")})$`);let R=!1,_=!1,M=!1;function p(o,s,i){const c=document.createElement(o);if(s)for(const d in s)d==="text"?c.textContent=s[d]:d in c&&typeof s[d]!="string"?c[d]=s[d]:c.setAttribute(d,s[d]);if(i)for(const d of i)d!=null&&c.appendChild(d);return c}function I(o){const s=L[o],i=`dp-ramp-settings-${o}`,c=p("span",{class:"dp-ramp-label",text:s}),d=p("span",{class:"dp-ramp-grid","aria-hidden":"true"});for(const z of e)d.appendChild(p("span",{class:"dp-ramp-swatch","data-step":z}));const g=p("button",{class:"dp-ramp-row",type:"button","aria-expanded":"false","aria-controls":i,"aria-label":`${s} ramp settings`},[c,d]),S=p("legend",{class:"dp-ramp-settings-legend",text:`${s} ramp settings`}),$=p("label",{for:`dp-anchor-${o}`,text:"Anchor color"}),F=p("input",{type:"color",id:`dp-anchor-${o}`}),J=p("label",{for:`dp-step-${o}`,text:"Anchor step"}),G=p("select",{id:`dp-step-${o}`});for(const z of e){const ke=p("option",{value:z,text:z});z==="500"&&(ke.selected=!0),G.appendChild(ke)}const bt=p("label",{for:`dp-chroma-${o}`,text:"Chroma intensity"}),gt=p("input",{type:"range",id:`dp-chroma-${o}`,min:"0",max:"100",value:"80"}),yt=p("fieldset",{class:"dp-ramp-settings",id:i,hidden:""},[S,$,F,J,G,bt,gt]);return p("div",{class:"dp-ramp-row-wrapper","data-family":o},[g,yt])}function B(o,s){const i=o.charAt(0).toUpperCase()+o.slice(1);return p("div",{class:`dp-scheme-preview ${s==="dark"?"dp-scheme-preview-dark dark-mode":"dp-scheme-preview-light"}`,"aria-hidden":"true"},[p("div",{class:`scheme-${o}`},[p("div",{class:"dp-scheme-heading",text:i}),p("div",{class:"dp-scheme-divider"}),p("div",{class:"dp-scheme-body",text:"Sample body text"}),p("div",{class:"dp-scheme-meta"},[p("span",{class:"dp-scheme-accent-text",text:"Accent"}),p("span",{class:"dp-scheme-subtle-swatch"}),p("span",{class:"dp-scheme-muted-text",text:"Muted"})])])])}function P(o,s,i){const c=`dp-scheme-${o}-${s}-${i}`;return p("div",{class:"dp-scheme-mapping-row"},[p("label",{for:c,text:i}),p("select",{id:c,"data-scheme":o,"data-mode":s,"data-token":i,"aria-busy":"true"},[p("option",{value:"",disabled:!0,selected:!0,text:"Loading…"})])])}function v(o,s){const i=w(o),c=s.charAt(0).toUpperCase()+s.slice(1),d=p("summary",{"aria-label":`${i} scheme, ${c} mode`},[B(o,s)]),g=p("legend",{class:"dp-scheme-mode-label",text:c}),S=p("fieldset",{class:"dp-scheme-mode-column"},[g]);for(const $ of l)S.appendChild(P(o,s,$));return p("details",{class:"dp-scheme-card-mode","data-mode":s},[d,S])}function E(o){const s=w(o);return p("div",{class:"dp-scheme-card","data-scheme":o,role:"listitem","aria-label":`${s} scheme`},[v(o,"light"),v(o,"dark")])}function w(o){return o.charAt(0).toUpperCase()+o.slice(1)}function T(){const o=document.querySelector("[data-dp-ramp-matrix]");if(o&&!o.firstChild)for(const i of n)o.appendChild(I(i));const s=document.querySelector("[data-dp-scheme-list]");if(s&&!s.firstChild)for(const i of a)s.appendChild(E(i))}function k(){const o=document.documentElement,s=getComputedStyle(o),i={};for(const c of n){i[c]={};for(const d of e){const g=s.getPropertyValue(`--color-${c}-${d}`).trim();i[c][d]=g||null}}return i}function A(o){for(const s of n){const i=document.querySelector(`.dp-ramp-row-wrapper[data-family="${s}"]`);if(i)for(const c of e){const d=i.querySelector(`.dp-ramp-swatch[data-step="${c}"]`);if(!d)continue;const g=o[s][c];g?d.style.backgroundColor=g:R||(console.warn(`[design-panel-colors] Missing --color-${s}-${c} token; leaving swatch unpainted.`),R=!0)}}}function K(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o){for(;s.firstChild;)s.removeChild(s.firstChild);const i=document.createElement("option");i.value="",i.textContent="—",s.appendChild(i);for(const c of n){const d=L[c],g=document.createElement("optgroup");g.label=d;for(const S of e){const $=document.createElement("option");$.value=`${c}-${S}`,$.textContent=`${d} ${S}`,g.appendChild($)}s.appendChild(g)}s.removeAttribute("aria-busy")}}function ve(o){let s;try{s=localStorage.getItem(o)}catch{return{}}if(!s)return{};try{const i=JSON.parse(s);return i&&typeof i=="object"?i:{}}catch{return{}}}function Se(o){return typeof o=="string"&&O.test(o)}function Xe(){const o=ve(u);for(const s of a){const i=o[s];if(!(!i||typeof i!="object"))for(const c of r){const d=i[c];if(!(!d||typeof d!="object"))for(const g of l){const S=d[g];if(!Se(S))continue;const $=document.getElementById(`dp-scheme-${s}-${c}-${g}`);$&&($.value=S,xe(s,c,g,S))}}}}function We(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o)s.addEventListener("change",Ze)}function Ze(o){const s=o.currentTarget,{scheme:i,mode:c,token:d}=s.dataset;if(!(!i||!c||!d)){if(s.value!==""&&!Se(s.value)){console.warn(`[design-panel-colors] ignoring invalid scheme value "${s.value}"`);return}xe(i,c,d,s.value),et()}}function xe(o,s,i,c){if(typeof window.__dpSchemeUpdate!="function"){_||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),_=!0);return}const d=`--color-${i}`,g=c?`var(--color-${c})`:"initial";if(o==="default"){const S=s==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(S,d,g,"utilities")}else{const S=s==="dark"?`.scheme-${o}.dark-mode`:`.scheme-${o}`;window.__dpSchemeUpdate(S,d,g,"tokens")}}function Ee(o,s){let i=null;return function(){i&&clearTimeout(i),i=setTimeout(()=>{i=null;try{localStorage.setItem(o,JSON.stringify(s()))}catch{}},f)}}function Qe(){const o={};for(const s of a){o[s]={light:{},dark:{}};for(const i of r)for(const c of l){const d=document.getElementById(`dp-scheme-${s}-${i}-${c}`);d&&d.value&&(o[s][i][c]=d.value)}}return o}const et=Ee(u,Qe);function tt(){const o=document.querySelectorAll(".dp-ramp-row");for(const s of o)s.addEventListener("click",()=>{const i=s.getAttribute("aria-controls");if(!i)return;const c=document.getElementById(i);if(!c)return;c.hasAttribute("hidden")?(c.removeAttribute("hidden"),s.setAttribute("aria-expanded","true")):(c.setAttribute("hidden",""),s.setAttribute("aria-expanded","false"))})}function ot(){const o=window.DesignPanelColor;return!o||typeof o.generateRamp!="function"?(M||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),M=!0),null):o}function nt(){const o=getComputedStyle(document.documentElement),s={};for(const i of n){const c=o.getPropertyValue(`--color-${i}-500`).trim(),d=b[i]||"#808080";s[i]={anchorHex:(c||d).toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return s}function Ce(){return ve(m)}const we=/^#[0-9a-f]{6}$/,st=new Set(e.map(o=>Number(o)));function rt(o){if(!o||typeof o!="object")return{};const s={};if(typeof o.anchorHex=="string"){const i=o.anchorHex.toLowerCase();we.test(i)&&(s.anchorHex=i)}return Number.isFinite(o.anchorStep)&&st.has(o.anchorStep)&&(s.anchorStep=o.anchorStep),Number.isFinite(o.chroma)&&o.chroma>=0&&o.chroma<=100&&(s.chroma=o.chroma),typeof o.isNeutral=="boolean"&&(s.isNeutral=o.isNeutral),Number.isFinite(o.neutralChroma)&&o.neutralChroma>=0&&o.neutralChroma<=.5&&(s.neutralChroma=o.neutralChroma),Number.isFinite(o.neutralHue)&&o.neutralHue>=0&&o.neutralHue<360&&(s.neutralHue=o.neutralHue),s}function at(){const o=nt(),s=Ce(),i={};for(const c of n)i[c]={...o[c],...rt(s[c])};return i}function it(){const o=Ce();return Object.keys(o).length>0}function lt(o,s){if(typeof o.scaleChromaProfile=="function")return o.scaleChromaProfile(o.DEFAULT_CHROMA_PROFILE,s);const i=Math.max(0,Math.min(100,s))/100,c=o.DEFAULT_CHROMA_PROFILE||{},d={};for(const g of e){const S=Number(g),$=c[S]??c[g]??.5;d[S]=$*i}return d}function Y(o,s){const i=ot();if(!i)return;const c=s[o];if(!c)return;const d=lt(i,c.chroma);let g;try{g=i.generateRamp({anchorHex:c.anchorHex,anchorStep:c.anchorStep,chromaProfile:d,isNeutral:!!c.isNeutral,neutralChroma:c.neutralChroma,neutralHue:c.neutralHue})}catch(F){console.warn(`[design-panel-colors] generateRamp failed for ${o}: ${F.message}`);return}const S=document.querySelector(`.dp-ramp-row-wrapper[data-family="${o}"]`),$=document.documentElement;for(const F of g){const J=String(F.step);if($.style.setProperty(`--color-${o}-${J}`,F.hex),S){const G=S.querySelector(`.dp-ramp-swatch[data-step="${J}"]`);G&&(G.style.backgroundColor=F.hex)}}}function ct(o){for(const s of n)Y(s,o)}function Ae(o,s){o.setAttribute("aria-valuetext",`Chroma ${s} percent`)}function dt(o){const s=Ee(m,()=>o);for(const i of n){const c=document.getElementById(`dp-anchor-${i}`),d=document.getElementById(`dp-step-${i}`),g=document.getElementById(`dp-chroma-${i}`);c&&o[i].anchorHex&&(c.value=o[i].anchorHex),d&&(d.value=String(o[i].anchorStep)),g&&(g.value=String(o[i].chroma),Ae(g,o[i].chroma)),c&&c.addEventListener("input",()=>{o[i].anchorHex=(c.value||"").toLowerCase(),Y(i,o),s()}),d&&d.addEventListener("change",()=>{const S=parseInt(d.value,10);Number.isFinite(S)&&(o[i].anchorStep=S,Y(i,o),s())}),g&&g.addEventListener("input",()=>{const S=parseInt(g.value,10);Number.isFinite(S)&&(o[i].chroma=S,Ae(g,S),Y(i,o),s())})}}function ut(){const o=getComputedStyle(document.documentElement),s=["@layer tokens {","  :root {"];for(const i of n){const c=L[i];s.push(`    /* ${c} */`);for(const d of e){const S=o.getPropertyValue(`--color-${i}-${d}`).trim().toLowerCase();S&&we.test(S)&&s.push(`    --color-${i}-${d}: ${S};`)}s.push("")}return s.push("  }","}"),s.join(`
`)}function pt(o){let s=document.getElementById("dp-copy-css-status");return s||(s=p("span",{id:"dp-copy-css-status",class:"visually-hidden",role:"status","aria-live":"polite","aria-atomic":"true"}),o.insertAdjacentElement("afterend",s)),s}function mt(){const o=document.querySelector(".dp-copy-css");if(!o)return;const s=pt(o);o.addEventListener("click",()=>{const i=ut(),c=o.textContent,d=(g,S)=>{o.textContent=g,s.textContent=g,setTimeout(()=>{o.textContent=c,s.textContent=""},S)};if(!navigator.clipboard||typeof navigator.clipboard.writeText!="function"){console.warn("[design-panel-colors] navigator.clipboard unavailable"),d("Unavailable",2e3);return}navigator.clipboard.writeText(i).then(()=>{d("Copied",2e3)},g=>{console.error("[design-panel-colors] clipboard write failed:",g),d("Failed",2e3)})})}const ht=5e3;function Te(){return document.querySelector("[data-dp-ramp-matrix]")||document.querySelector("[data-dp-scheme-list]")}function ft(){return Te()?Promise.resolve(!0):new Promise(o=>{const s=new MutationObserver(()=>{Te()&&(c(),o(!0))}),i=setTimeout(()=>{c(),o(!1)},ht);function c(){s.disconnect(),clearTimeout(i)}s.observe(document.body,{childList:!0,subtree:!0})})}function Le(){ft().then(o=>{o&&ne()})}function ne(){if(ne.done)return;ne.done=!0,T();const o=k();A(o),K(),Xe(),We(),tt();const s=at();it()&&ct(s),dt(s),mt()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Le,{once:!0}):Le()})();(function(){const t="design-panel:typography",a=Object.freeze({"dp-type-ratio":"--type-scale-ratio","dp-text-base-min":"--text-base-min","dp-text-base-max":"--text-base-max","dp-lh-body":"--line-height-ratio-body","dp-lh-heading":"--line-height-ratio-heading","dp-font-body":"--font-body","dp-font-heading":"--font-heading","dp-line-height-min":"--line-height-min","dp-line-height-max":"--line-height-max"}),r=Object.freeze({"1.125":"Minor second","1.2":"Minor third","1.25":"Major third","1.333":"Perfect fourth","1.414":"Augmented fourth","1.5":"Perfect fifth","1.618":"Golden ratio"});function l(v){return v==="dp-font-body"||v==="dp-font-heading"}function u(v){const E=a[v.id],w=v.value;if(l(v.id)){const T=w.trim();T?document.documentElement.style.setProperty(E,T):document.documentElement.style.removeProperty(E)}else document.documentElement.style.setProperty(E,String(w))}function m(v){if(v.type==="range")if(v.id==="dp-type-ratio"){const E=r[v.value]||"";v.setAttribute("aria-valuetext",E?`Scale ratio ${v.value}, ${E}`:`Scale ratio ${v.value}`)}else{const E=v.id==="dp-lh-body"?"Body":"Heading";v.setAttribute("aria-valuetext",`${E} line height ${v.value}`)}}function f(){const v=document.getElementById("dp-type-ratio");if(!v)return;const E=Number(v.value),w=document.querySelectorAll("[data-preset-ratio]");for(const T of w){const k=Number(T.dataset.presetRatio),A=Math.abs(E-k)<.001;T.setAttribute("aria-pressed",A?"true":"false")}}function b(v,E){let w=null;return function(){w&&clearTimeout(w),w=setTimeout(()=>{w=null;try{localStorage.setItem(v,JSON.stringify(E()))}catch{}},200)}}function L(){const v={};for(const E of Object.keys(a)){const w=document.getElementById(E);w&&(v[E]=w.value)}return v}const O=b(t,L);function R(){try{const v=localStorage.getItem(t);if(!v)return null;const E=JSON.parse(v);if(!E||typeof E!="object"||Array.isArray(E))return null;const w={};for(const T of Object.keys(a)){const k=E[T];typeof k=="string"&&(w[T]=k)}return w}catch{return null}}const _=5e3;function M(){return!!document.querySelector('[slot="editor"][data-tab="typography"] #dp-type-ratio')}function p(){return M()?Promise.resolve(!0):new Promise(v=>{const E=new MutationObserver(()=>{M()&&(T(),v(!0))}),w=setTimeout(()=>{T(),v(!1)},_);function T(){E.disconnect(),clearTimeout(w)}E.observe(document.body,{childList:!0,subtree:!0})})}let I=!1;function B(){if(I||!document.querySelector('[slot="editor"][data-tab="typography"]'))return;I=!0;const E=R()||{},w=getComputedStyle(document.documentElement);for(const k of Object.keys(a)){const A=document.getElementById(k);if(!A)continue;const K=E[k];K!=null?(A.value=K,u(A)):l(k)?A.value="":(A.value=w.getPropertyValue(a[k]).trim(),u(A)),m(A),A.addEventListener("input",()=>{u(A),m(A),A.id==="dp-type-ratio"&&f(),O()})}const T=document.querySelectorAll("[data-preset-ratio]");for(const k of T)k.addEventListener("click",()=>{const A=document.getElementById("dp-type-ratio");A&&(A.value=k.dataset.presetRatio,A.dispatchEvent(new Event("input",{bubbles:!0})))});f()}function P(){p().then(v=>{v&&B()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P,{once:!0}):P()})();Ot();function _t(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function Pt(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function Nt(){document.querySelectorAll(".grid").forEach(t=>{const n=getComputedStyle(t),e=n.gridTemplateColumns.split(" ").filter(r=>r!=="none"&&r.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const a=n.columnGap||n.rowGap||n.gap;a&&a!=="normal"&&t.style.setProperty("--grid-gap",a)})}function It(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&Nt()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let n;window.addEventListener("resize",()=>{clearTimeout(n),n=setTimeout(t,100)}),t()}_t(()=>{Pt(),It()});
