var bt=Object.defineProperty;var ke=t=>{throw TypeError(t)};var gt=(t,n,e)=>n in t?bt(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var $e=(t,n,e)=>gt(t,typeof n!="symbol"?n+"":n,e),se=(t,n,e)=>n.has(t)||ke("Cannot "+e);var m=(t,n,e)=>(se(t,n,"read from private field"),e?e.call(t):n.get(t)),G=(t,n,e)=>n.has(t)?ke("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,e),q=(t,n,e,a)=>(se(t,n,"write to private field"),a?a.call(t,e):n.set(t,e),e),C=(t,n,e)=>(se(t,n,"access private method"),e);class yt extends HTMLElement{async connectedCallback(){const n=this.getAttribute("src");if(!n){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const a=await e.text(),r=document.createElement("template");r.innerHTML=a;const i=r.content.cloneNode(!0);this.innerHTML="",this.appendChild(i),this.querySelectorAll("script").forEach(p=>{const f=document.createElement("script");Array.from(p.attributes).forEach(b=>{f.setAttribute(b.name,b.value)}),f.textContent=p.textContent,p.parentNode.replaceChild(f,p)})}catch(e){console.error(`HtmlInclude: failed to load ${n}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",yt);class vt extends HTMLElement{connectedCallback(){const n=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const a=e.textContent.trim();a&&n.push(a)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&n.push(e.outerHTML);this._triggerContent=n.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var n;(n=this._abortController)==null||n.abort()}escapeHtml(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}sanitizeHref(n){return n?/^(javascript|data|vbscript):/i.test(n)?(console.warn("PopupDialog: Blocked potentially dangerous href:",n),""):n:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var n;(n=this.querySelector("dialog"))==null||n.showModal()}close(){var n;(n=this.querySelector("dialog"))==null||n.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const n=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),a=n?n.innerHTML:this.escapeHtml(this.body),r=this.escapeHtml(this.title);let i="";if(e)i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const f=`button button--${this.escapeHtml(this.confirmVariant)}`,b=[];this.cancelLabel&&b.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&b.push(this.confirmHref?`<a href="${this.confirmHref}" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${b.join("")}</footer>`}const u=r?`<header class="cluster cluster-between cluster-nowrap">
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
          ${i}
        </div>
      </dialog>
    `}setupEvents(){const n=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),a=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:r}=this._abortController;n.addEventListener("click",i=>{i.preventDefault(),e.showModal()},{signal:r}),a.addEventListener("click",()=>{e.close()},{signal:r}),e.addEventListener("click",i=>{const u=i.target.closest("[data-action]");if(u){const p=u.dataset.action;p==="cancel"||p==="close"?(i.preventDefault(),e.close()):p==="confirm"&&u.tagName!=="A"&&(i.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}i.target===e&&e.close()},{signal:r})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",vt);const Me=`
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
`;let oe=null;const He=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";He&&(oe=new CSSStyleSheet,oe.replaceSync(Me));const X=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],W={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},St={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},Re="design-panel:state",xt=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function Et(){return X.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function Ct(){return Object.entries(W).map(([t,n])=>{let e;if(n.type==="number")e=`<input type="number" data-setting="${t}" min="${n.min}" max="${n.max}" />`;else{const a=n.options.map(r=>`<option value="${r.value}">${r.label}</option>`).join("");e=`<select data-setting="${t}">${a}</select>`}return`
      <div class="setting">
        <label for="dp-setting-${t}">${n.label}</label>
        ${e.replace("data-setting=",`id="dp-setting-${t}" data-setting=`)}
      </div>
    `}).join("")}const wt=`
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
          <div class="tools">${Et()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${Ct()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${xt}</button>
`;var S,D,V,H,N,g,ce,_e,Z,de,Q,ue,pe,Pe,Ne,Ie,De,Be,U;class Oe extends HTMLElement{constructor(){super();G(this,g);G(this,S,{...St});G(this,D,null);G(this,V,!1);G(this,H,null);G(this,N,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),He&&oe)this.shadowRoot.adoptedStyleSheets=[oe];else{const e=document.createElement("style");e.textContent=Me,this.shadowRoot.appendChild(e)}}connectedCallback(){q(this,H,new AbortController),C(this,g,Be).call(this),C(this,g,ce).call(this),C(this,g,_e).call(this),C(this,g,Q).call(this),C(this,g,Ne).call(this),this.inert=!this.hasAttribute("open"),C(this,g,Ie).call(this),C(this,g,De).call(this)}disconnectedCallback(){m(this,H)&&(m(this,H).abort(),q(this,H,null)),m(this,D)&&(clearTimeout(m(this,D)),q(this,D,null))}attributeChangedCallback(e,a,r){a!==r&&(e==="open"?(m(this,S).open=r!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(m(this,S).activeTab=r||"guides",m(this,V)&&C(this,g,Q).call(this)):e==="overlay-target"&&C(this,g,ce).call(this))}}S=new WeakMap,D=new WeakMap,V=new WeakMap,H=new WeakMap,N=new WeakMap,g=new WeakSet,ce=function(){const e=this.getAttribute("overlay-target")||"body";try{q(this,N,document.querySelector(e)||document.body)}catch{q(this,N,document.body)}},_e=function(){const e=document.createRange().createContextualFragment(wt);this.shadowRoot.appendChild(e),q(this,V,!0);const a=m(this,H)?m(this,H).signal:void 0,r=a?{signal:a}:void 0,i=this.shadowRoot.querySelector(".close");i&&i.addEventListener("click",()=>C(this,g,Z).call(this,!1),r);const u=this.shadowRoot.querySelector(".trigger");u&&u.addEventListener("click",()=>C(this,g,Z).call(this,!0),r),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(p=>{p.addEventListener("click",()=>C(this,g,de).call(this,p.dataset.tab),r)}),this.shadowRoot.querySelectorAll(".tool").forEach(p=>{p.addEventListener("click",()=>C(this,g,ue).call(this,p.dataset.tool),r)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(p=>{const f=p.dataset.setting,b=W[f];if(!b)return;const $=b.type==="number"?"input":"change";p.addEventListener($,O=>{const R=b.type==="number"?Number(O.target.value):O.target.value;C(this,g,pe).call(this,f,R)},r)})},Z=function(e){m(this,S).open=!!e,m(this,S).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",m(this,S).open),C(this,g,U).call(this)},de=function(e){e&&(m(this,S).activeTab=e,this.setAttribute("active-tab",e),C(this,g,Q).call(this),C(this,g,U).call(this))},Q=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const a=e.dataset.tab===m(this,S).activeTab;e.setAttribute("aria-selected",a?"true":"false"),e.toggleAttribute("data-active",a)})},ue=function(e){const a=X.find(i=>i.name===e);if(!a)return;m(this,S)[e]=!m(this,S)[e],m(this,N)&&m(this,N).classList.toggle(a.className,m(this,S)[e]);const r=this.shadowRoot.querySelector(`[data-tool="${e}"]`);r&&(r.setAttribute("aria-pressed",m(this,S)[e]?"true":"false"),r.toggleAttribute("data-active",m(this,S)[e])),C(this,g,U).call(this)},pe=function(e,a){m(this,S)[e]=a;const r=W[e];if(r){if(r.target==="cssvar")document.documentElement.style.setProperty(r.cssvar,String(a));else if(r.target==="overlayattr")m(this,N)&&m(this,N).setAttribute(r.attr,String(a));else if(r.target==="overlay-data-margin-mode"){const i=document.getElementById("dev-column-overlay"),u=document.getElementById("dev-margin-overlay");i&&i.setAttribute("data-margin-mode",String(a)),u&&u.setAttribute("data-margin-mode",String(a))}C(this,g,U).call(this)}},Pe=function(e){const a=this.shadowRoot.querySelector(`[data-setting="${e}"]`);a&&a.value!==String(m(this,S)[e])&&(a.value=String(m(this,S)[e]))},Ne=function(){for(const e of X){const a=!!m(this,S)[e.name];m(this,N)&&m(this,N).classList.toggle(e.className,a);const r=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);r&&(r.setAttribute("aria-pressed",a?"true":"false"),r.toggleAttribute("data-active",a))}for(const e of Object.keys(W))m(this,S)[e]!==void 0&&(C(this,g,pe).call(this,e,m(this,S)[e]),C(this,g,Pe).call(this,e));document.body.toggleAttribute("data-panel-open",!!m(this,S).open)},Ie=function(){const e=m(this,H)?m(this,H).signal:void 0,a=e?{signal:e}:void 0,r=i=>{const u=i.composedPath(),p=u&&u[0];if(p&&p.matches&&p.matches("input,textarea,[contenteditable]")||i.metaKey||i.ctrlKey||i.altKey)return;const f=(i.key||"").toLowerCase();if(!f)return;if(f==="t"){C(this,g,Z).call(this,!m(this,S).open),i.preventDefault();return}const b=X.find($=>$.key===f);b&&(C(this,g,ue).call(this,b.name),i.preventDefault())};window.addEventListener("keydown",r,a)},De=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const a=m(this,H)?m(this,H).signal:void 0,r=a?{signal:a}:void 0,i=()=>{const u=e.assignedElements(),p=new Set(u.map(f=>f.getAttribute("data-tab")).filter(f=>!!f));for(const f of this.shadowRoot.querySelectorAll('[role="tab"]')){const b=f.dataset.tab;b!=="guides"&&f.classList.toggle("hidden",!p.has(b))}m(this,S).activeTab!=="guides"&&!p.has(m(this,S).activeTab)&&C(this,g,de).call(this,"guides")};e.addEventListener("slotchange",i,r),i()},Be=function(){try{const e=localStorage.getItem(Re);if(e){const a=JSON.parse(e);a&&typeof a=="object"&&Object.assign(m(this,S),a)}}catch{}m(this,S).open?this.setAttribute("open",""):this.removeAttribute("open"),m(this,S).activeTab&&this.setAttribute("active-tab",m(this,S).activeTab)},U=function(){m(this,D)&&clearTimeout(m(this,D)),q(this,D,setTimeout(()=>{try{localStorage.setItem(Re,JSON.stringify(m(this,S)))}catch{}q(this,D,null)},200))},$e(Oe,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",Oe);(function(){const t="design-panel-runtime-schemes";function n(){let r=document.getElementById(t);r||(r=document.createElement("style"),r.id=t,document.head.appendChild(r),r.sheet.insertRule("@layer tokens {}",0),r.sheet.insertRule("@layer utilities {}",1));const i={};for(let u=0;u<r.sheet.cssRules.length;u++){const p=r.sheet.cssRules[u];p.name&&(i[p.name]=p)}return i}let e=null;function a(){return e||(e=n()),e}window.__dpSchemeUpdate=function(r,i,u,p){const f=a()[p||"tokens"];if(f){for(let b=0;b<f.cssRules.length;b++)if(f.cssRules[b].selectorText===r){f.cssRules[b].style.setProperty(i,u);return}f.insertRule(r+"{"+i+":"+u+"}",f.cssRules.length)}},window.__dpSchemeReset=function(){const r=a();for(const i in r){const u=r[i];for(;u.cssRules.length>0;)u.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(i=>i.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(i=>{for(let u=0;u<i.options.length;u++)if(i.options[u].defaultSelected){i.selectedIndex=u;break}})},window.__dpSchemeSerialize=function(){const r=[];return document.querySelectorAll(".dp-scheme-card").forEach(i=>{const u=i.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!u)return;const p=u.className.replace(/^scheme-/,""),f=i.querySelectorAll(".dp-scheme-mode-column"),b=["light","dark"];f.forEach(($,O)=>{const R=b[O];R&&$.querySelectorAll(".dp-scheme-mapping-row").forEach(_=>{const M=_.querySelector("label"),h=_.querySelector("select");if(!M||!h)return;const I=M.textContent.trim(),B=h.value,P=h.getAttribute("data-library-default")||"";B&&B!==P&&r.push({scheme:p,token:I,mode:R,value:B})})})}),r}})();function qe(t){const n=String(t).replace(/^#/,"");if(n.length!==6||/[^0-9a-fA-F]/.test(n))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(n,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function re(t){if(!Number.isFinite(t))return 0;const n=Math.round(t*255);return n<0?0:n>255?255:n}function Fe({R:t,G:n,B:e}){const a=re(t),r=re(n),i=re(e);return"#"+a.toString(16).padStart(2,"0")+r.toString(16).padStart(2,"0")+i.toString(16).padStart(2,"0")}function ae(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function ie(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function Ge({R:t,G:n,B:e}){return{R:ae(t),G:ae(n),B:ae(e)}}function je({R:t,G:n,B:e}){return{R:ie(t),G:ie(n),B:ie(e)}}function le(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function ze({R:t,G:n,B:e}){let a=.4122214708*t+.5363325363*n+.0514459929*e,r=.2119034982*t+.6806995451*n+.1073969566*e,i=.0883024619*t+.2817188376*n+.6299787005*e;a=le(a),r=le(r),i=le(i);const u=.2104542553*a+.793617785*r-.0040720468*i,p=1.9779984951*a-2.428592205*r+.4505937099*i,f=.0259040371*a+.7827717662*r-.808675766*i;return{L:u,a:p,b:f}}function he({L:t,a:n,b:e}){let a=t+.3963377774*n+.2158037573*e,r=t-.1055613458*n-.0638541728*e,i=t-.0894841775*n-1.291485548*e;a=a*a*a,r=r*r*r,i=i*i*i;const u=4.0767416621*a-3.3077115913*r+.2309699292*i,p=-1.2684380046*a+2.6097574011*r-.3413193965*i,f=-.0041960863*a-.7034186147*r+1.707614701*i;return{R:u,G:p,B:f}}function Ue({L:t,a:n,b:e}){const a=Math.sqrt(n*n+e*e),i=(Math.atan2(e,n)*180/Math.PI%360+360)%360;return{L:t,C:a,H:i}}function me({L:t,C:n,H:e}){const a=e*Math.PI/180;return{L:t,a:n*Math.cos(a),b:n*Math.sin(a)}}function Ve(t){return Ue(ze(Ge(qe(t))))}function ee({L:t,C:n,H:e}){return Fe(je(he(me({L:t,C:n,H:e}))))}function fe({L:t,C:n,H:e}){const a=me({L:t,C:n,H:e}),r=he(a),i=.002;return r.R>=-i&&r.R<=1+i&&r.G>=-i&&r.G<=1+i&&r.B>=-i&&r.B<=1+i}function be(t,n){let e=0,a=.4;for(let r=0;r<40;r++){const i=(e+a)/2;fe({L:t,C:i,H:n})?e=i:a=i}return e}function te({L:t,C:n,H:e}){return fe({L:t,C:n,H:e})?{L:t,C:n,H:e}:{L:t,C:be(t,e),H:e}}function Ke(t,n,e){return t<n?n:t>e?e:t}function At(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:qe,sRGBToHex:Fe,sRGBToLinearRGB:Ge,linearRGBToSRGB:je,linearRGBToOKLab:ze,oklabToLinearRGB:he,oklabToOKLCH:Ue,oklchToOKLab:me,hexToOKLCH:Ve,oklchToHex:ee,isInSRGBGamut:fe,maxChromaSRGB:be,clampChroma:te,clampFloat:Ke}))}const ge=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),Tt=Object.freeze(["blue","red","orange","yellow","green","grey"]),Ye=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),ye=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function Lt(t,n){const e=t||ye,a=Math.max(0,Math.min(100,n))/100,r={};for(const i of ge){const u=Number(i),p=e[u]??e[String(u)]??.5;r[u]=p*a}return r}function kt(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const n=Ve(t.anchorHex),e=t.lTargets||Ye,a=t.chromaProfile||ye,r=t.overrides||{},i=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const u=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,p=n.L-u,f=[];for(const b of ge){if(Object.prototype.hasOwnProperty.call(r,b)){const[h,I,B]=r[b],P=te({L:h,C:I,H:B});f.push({step:b,hex:ee(P),L:P.L,C:P.C,H:P.H});continue}if(b===t.anchorStep){const h=te(n);f.push({step:b,hex:ee(h),L:h.L,C:h.C,H:h.H});continue}const $=Object.prototype.hasOwnProperty.call(e,b)?e[b]:.58,O=Ke($+p,.06,.985);let R=i?i(b):n.H,_;if(t.isNeutral)_=t.neutralChroma,R=t.neutralHue;else{const h=be(O,R),I=Object.prototype.hasOwnProperty.call(a,b)?a[b]:.5;_=h*I}const M=te({L:O,C:_,H:R});f.push({step:b,hex:ee(M),L:M.L,C:M.C,H:M.H})}return f}function $t(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:ge,FAMILY_NAMES:Tt,DEFAULT_L_TARGETS:Ye,DEFAULT_CHROMA_PROFILE:ye,generateRamp:kt,scaleChromaProfile:Lt}))}function Rt(t=globalThis){At(t),$t(t)}(function(){const t=typeof window<"u"&&window.DesignPanelColor||{},n=t.FAMILY_NAMES?Array.from(t.FAMILY_NAMES):["blue","red","orange","yellow","green","grey"],e=t.STEPS?t.STEPS.map(String):["50","100","200","300","400","500","600","700","800","900","950"],a=["default","subtle","accent"],r=["light","dark"],i=["bg","fg","accent","muted","subtle"],u="design-panel:schemes",p="design-panel:ramps",f=300,b={blue:"#1f75ff",red:"#e10600",orange:"#ff4f00",yellow:"#ffa300",green:"#00b312",grey:"#808080"},$={};for(const o of n)$[o]=o.charAt(0).toUpperCase()+o.slice(1);const O=new RegExp(`^(?:${n.join("|")})-(?:${e.join("|")})$`);let R=!1,_=!1,M=!1;function h(o,s,l){const c=document.createElement(o);if(s)for(const d in s)d==="text"?c.textContent=s[d]:d in c&&typeof s[d]!="string"?c[d]=s[d]:c.setAttribute(d,s[d]);if(l)for(const d of l)d!=null&&c.appendChild(d);return c}function I(o){const s=$[o],l=`dp-ramp-settings-${o}`,c=h("span",{class:"dp-ramp-label",text:s}),d=h("span",{class:"dp-ramp-grid","aria-hidden":"true"});for(const z of e)d.appendChild(h("span",{class:"dp-ramp-swatch","data-step":z}));const v=h("button",{class:"dp-ramp-row",type:"button","aria-expanded":"false","aria-controls":l,"aria-label":`${s} ramp settings`},[c,d]),x=h("legend",{class:"dp-ramp-settings-legend",text:`${s} ramp settings`}),k=h("label",{for:`dp-anchor-${o}`,text:"Anchor color"}),F=h("input",{type:"color",id:`dp-anchor-${o}`}),J=h("label",{for:`dp-step-${o}`,text:"Anchor step"}),j=h("select",{id:`dp-step-${o}`});for(const z of e){const Le=h("option",{value:z,text:z});z==="500"&&(Le.selected=!0),j.appendChild(Le)}const ht=h("label",{for:`dp-chroma-${o}`,text:"Chroma intensity"}),mt=h("input",{type:"range",id:`dp-chroma-${o}`,min:"0",max:"100",value:"80"}),ft=h("fieldset",{class:"dp-ramp-settings",id:l,hidden:""},[x,k,F,J,j,ht,mt]);return h("div",{class:"dp-ramp-row-wrapper","data-family":o},[v,ft])}function B(o,s){const l=o.charAt(0).toUpperCase()+o.slice(1);return h("div",{class:`dp-scheme-preview ${s==="dark"?"dp-scheme-preview-dark dark-mode":"dp-scheme-preview-light"}`,"aria-hidden":"true"},[h("div",{class:`scheme-${o}`},[h("div",{class:"dp-scheme-heading",text:l}),h("div",{class:"dp-scheme-divider"}),h("div",{class:"dp-scheme-body",text:"Sample body text"}),h("div",{class:"dp-scheme-meta"},[h("span",{class:"dp-scheme-accent-text",text:"Accent"}),h("span",{class:"dp-scheme-subtle-swatch"}),h("span",{class:"dp-scheme-muted-text",text:"Muted"})])])])}function P(o,s,l){const c=`dp-scheme-${o}-${s}-${l}`;return h("div",{class:"dp-scheme-mapping-row"},[h("label",{for:c,text:l}),h("select",{id:c,"data-scheme":o,"data-mode":s,"data-token":l,"aria-busy":"true"},[h("option",{value:"",disabled:!0,selected:!0,text:"Loading…"})])])}function y(o,s){const l=w(o),c=s.charAt(0).toUpperCase()+s.slice(1),d=h("summary",{"aria-label":`${l} scheme, ${c} mode`},[B(o,s)]),v=h("legend",{class:"dp-scheme-mode-label",text:c}),x=h("fieldset",{class:"dp-scheme-mode-column"},[v]);for(const k of i)x.appendChild(P(o,s,k));return h("details",{class:"dp-scheme-card-mode","data-mode":s},[d,x])}function E(o){const s=w(o);return h("div",{class:"dp-scheme-card","data-scheme":o,role:"listitem","aria-label":`${s} scheme`},[y(o,"light"),y(o,"dark")])}function w(o){return o.charAt(0).toUpperCase()+o.slice(1)}function T(){const o=document.querySelector("[data-dp-ramp-matrix]");if(o&&!o.firstChild)for(const l of n)o.appendChild(I(l));const s=document.querySelector("[data-dp-scheme-list]");if(s&&!s.firstChild)for(const l of a)s.appendChild(E(l))}function L(){const o=document.documentElement,s=getComputedStyle(o),l={};for(const c of n){l[c]={};for(const d of e){const v=s.getPropertyValue(`--color-${c}-${d}`).trim();l[c][d]=v||null}}return l}function A(o){for(const s of n){const l=document.querySelector(`.dp-ramp-row-wrapper[data-family="${s}"]`);if(l)for(const c of e){const d=l.querySelector(`.dp-ramp-swatch[data-step="${c}"]`);if(!d)continue;const v=o[s][c];v?d.style.backgroundColor=v:R||(console.warn(`[design-panel-colors] Missing --color-${s}-${c} token; leaving swatch unpainted.`),R=!0)}}}function K(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o){for(;s.firstChild;)s.removeChild(s.firstChild);const l=document.createElement("option");l.value="",l.textContent="—",s.appendChild(l);for(const c of n){const d=$[c],v=document.createElement("optgroup");v.label=d;for(const x of e){const k=document.createElement("option");k.value=`${c}-${x}`,k.textContent=`${d} ${x}`,v.appendChild(k)}s.appendChild(v)}s.removeAttribute("aria-busy")}}function ve(o){let s;try{s=localStorage.getItem(o)}catch{return{}}if(!s)return{};try{const l=JSON.parse(s);return l&&typeof l=="object"?l:{}}catch{return{}}}function Se(o){return typeof o=="string"&&O.test(o)}function Je(){const o=ve(u);for(const s of a){const l=o[s];if(!(!l||typeof l!="object"))for(const c of r){const d=l[c];if(!(!d||typeof d!="object"))for(const v of i){const x=d[v];if(!Se(x))continue;const k=document.getElementById(`dp-scheme-${s}-${c}-${v}`);k&&(k.value=x,xe(s,c,v,x))}}}}function Xe(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o)s.addEventListener("change",We)}function We(o){const s=o.currentTarget,{scheme:l,mode:c,token:d}=s.dataset;if(!(!l||!c||!d)){if(s.value!==""&&!Se(s.value)){console.warn(`[design-panel-colors] ignoring invalid scheme value "${s.value}"`);return}xe(l,c,d,s.value),Qe()}}function xe(o,s,l,c){if(typeof window.__dpSchemeUpdate!="function"){_||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),_=!0);return}const d=`--color-${l}`,v=c?`var(--color-${c})`:"initial";if(o==="default"){const x=s==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(x,d,v,"utilities")}else{const x=s==="dark"?`.scheme-${o}.dark-mode`:`.scheme-${o}`;window.__dpSchemeUpdate(x,d,v,"tokens")}}function Ee(o,s){let l=null;return function(){l&&clearTimeout(l),l=setTimeout(()=>{l=null;try{localStorage.setItem(o,JSON.stringify(s()))}catch{}},f)}}function Ze(){const o={};for(const s of a){o[s]={light:{},dark:{}};for(const l of r)for(const c of i){const d=document.getElementById(`dp-scheme-${s}-${l}-${c}`);d&&d.value&&(o[s][l][c]=d.value)}}return o}const Qe=Ee(u,Ze);function et(){const o=document.querySelectorAll(".dp-ramp-row");for(const s of o)s.addEventListener("click",()=>{const l=s.getAttribute("aria-controls");if(!l)return;const c=document.getElementById(l);if(!c)return;c.hasAttribute("hidden")?(c.removeAttribute("hidden"),s.setAttribute("aria-expanded","true")):(c.setAttribute("hidden",""),s.setAttribute("aria-expanded","false"))})}function tt(){const o=window.DesignPanelColor;return!o||typeof o.generateRamp!="function"?(M||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),M=!0),null):o}function ot(){const o=getComputedStyle(document.documentElement),s={};for(const l of n){const c=o.getPropertyValue(`--color-${l}-500`).trim(),d=b[l]||"#808080";s[l]={anchorHex:(c||d).toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return s}function Ce(){return ve(p)}const nt=/^#[0-9a-f]{6}$/,st=new Set(e.map(o=>Number(o)));function rt(o){if(!o||typeof o!="object")return{};const s={};if(typeof o.anchorHex=="string"){const l=o.anchorHex.toLowerCase();nt.test(l)&&(s.anchorHex=l)}return Number.isFinite(o.anchorStep)&&st.has(o.anchorStep)&&(s.anchorStep=o.anchorStep),Number.isFinite(o.chroma)&&o.chroma>=0&&o.chroma<=100&&(s.chroma=o.chroma),typeof o.isNeutral=="boolean"&&(s.isNeutral=o.isNeutral),Number.isFinite(o.neutralChroma)&&o.neutralChroma>=0&&o.neutralChroma<=.5&&(s.neutralChroma=o.neutralChroma),Number.isFinite(o.neutralHue)&&o.neutralHue>=0&&o.neutralHue<360&&(s.neutralHue=o.neutralHue),s}function at(){const o=ot(),s=Ce(),l={};for(const c of n)l[c]={...o[c],...rt(s[c])};return l}function it(){const o=Ce();return Object.keys(o).length>0}function lt(o,s){if(typeof o.scaleChromaProfile=="function")return o.scaleChromaProfile(o.DEFAULT_CHROMA_PROFILE,s);const l=Math.max(0,Math.min(100,s))/100,c=o.DEFAULT_CHROMA_PROFILE||{},d={};for(const v of e){const x=Number(v),k=c[x]??c[v]??.5;d[x]=k*l}return d}function Y(o,s){const l=tt();if(!l)return;const c=s[o];if(!c)return;const d=lt(l,c.chroma);let v;try{v=l.generateRamp({anchorHex:c.anchorHex,anchorStep:c.anchorStep,chromaProfile:d,isNeutral:!!c.isNeutral,neutralChroma:c.neutralChroma,neutralHue:c.neutralHue})}catch(F){console.warn(`[design-panel-colors] generateRamp failed for ${o}: ${F.message}`);return}const x=document.querySelector(`.dp-ramp-row-wrapper[data-family="${o}"]`),k=document.documentElement;for(const F of v){const J=String(F.step);if(k.style.setProperty(`--color-${o}-${J}`,F.hex),x){const j=x.querySelector(`.dp-ramp-swatch[data-step="${J}"]`);j&&(j.style.backgroundColor=F.hex)}}}function ct(o){for(const s of n)Y(s,o)}function we(o,s){o.setAttribute("aria-valuetext",`Chroma ${s} percent`)}function dt(o){const s=Ee(p,()=>o);for(const l of n){const c=document.getElementById(`dp-anchor-${l}`),d=document.getElementById(`dp-step-${l}`),v=document.getElementById(`dp-chroma-${l}`);c&&o[l].anchorHex&&(c.value=o[l].anchorHex),d&&(d.value=String(o[l].anchorStep)),v&&(v.value=String(o[l].chroma),we(v,o[l].chroma)),c&&c.addEventListener("input",()=>{o[l].anchorHex=(c.value||"").toLowerCase(),Y(l,o),s()}),d&&d.addEventListener("change",()=>{const x=parseInt(d.value,10);Number.isFinite(x)&&(o[l].anchorStep=x,Y(l,o),s())}),v&&v.addEventListener("input",()=>{const x=parseInt(v.value,10);Number.isFinite(x)&&(o[l].chroma=x,we(v,x),Y(l,o),s())})}}const ut=5e3;function Ae(){return document.querySelector("[data-dp-ramp-matrix]")||document.querySelector("[data-dp-scheme-list]")}function pt(){return Ae()?Promise.resolve(!0):new Promise(o=>{const s=new MutationObserver(()=>{Ae()&&(c(),o(!0))}),l=setTimeout(()=>{c(),o(!1)},ut);function c(){s.disconnect(),clearTimeout(l)}s.observe(document.body,{childList:!0,subtree:!0})})}function Te(){pt().then(o=>{o&&ne()})}function ne(){if(ne.done)return;ne.done=!0,T();const o=L();A(o),K(),Je(),Xe(),et();const s=at();it()&&ct(s),dt(s)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Te,{once:!0}):Te()})();(function(){const t="design-panel:typography",a=Object.freeze({"dp-type-ratio":"--type-scale-ratio","dp-text-base-min":"--text-base-min","dp-text-base-max":"--text-base-max","dp-lh-body":"--line-height-ratio-body","dp-lh-heading":"--line-height-ratio-heading","dp-font-body":"--font-body","dp-font-heading":"--font-heading","dp-line-height-min":"--line-height-min","dp-line-height-max":"--line-height-max"}),r=Object.freeze({"1.125":"Minor second","1.2":"Minor third","1.25":"Major third","1.333":"Perfect fourth","1.414":"Augmented fourth","1.5":"Perfect fifth","1.618":"Golden ratio"});function i(y){return y==="dp-font-body"||y==="dp-font-heading"}function u(y){const E=a[y.id],w=y.value;if(i(y.id)){const T=w.trim();T?document.documentElement.style.setProperty(E,T):document.documentElement.style.removeProperty(E)}else document.documentElement.style.setProperty(E,String(w))}function p(y){if(y.type==="range")if(y.id==="dp-type-ratio"){const E=r[y.value]||"";y.setAttribute("aria-valuetext",E?`Scale ratio ${y.value}, ${E}`:`Scale ratio ${y.value}`)}else{const E=y.id==="dp-lh-body"?"Body":"Heading";y.setAttribute("aria-valuetext",`${E} line height ${y.value}`)}}function f(){const y=document.getElementById("dp-type-ratio");if(!y)return;const E=Number(y.value),w=document.querySelectorAll("[data-preset-ratio]");for(const T of w){const L=Number(T.dataset.presetRatio),A=Math.abs(E-L)<.001;T.setAttribute("aria-pressed",A?"true":"false")}}function b(y,E){let w=null;return function(){w&&clearTimeout(w),w=setTimeout(()=>{w=null;try{localStorage.setItem(y,JSON.stringify(E()))}catch{}},200)}}function $(){const y={};for(const E of Object.keys(a)){const w=document.getElementById(E);w&&(y[E]=w.value)}return y}const O=b(t,$);function R(){try{const y=localStorage.getItem(t);if(!y)return null;const E=JSON.parse(y);if(!E||typeof E!="object"||Array.isArray(E))return null;const w={};for(const T of Object.keys(a)){const L=E[T];typeof L=="string"&&(w[T]=L)}return w}catch{return null}}const _=5e3;function M(){return!!document.querySelector('[slot="editor"][data-tab="typography"] #dp-type-ratio')}function h(){return M()?Promise.resolve(!0):new Promise(y=>{const E=new MutationObserver(()=>{M()&&(T(),y(!0))}),w=setTimeout(()=>{T(),y(!1)},_);function T(){E.disconnect(),clearTimeout(w)}E.observe(document.body,{childList:!0,subtree:!0})})}let I=!1;function B(){if(I||!document.querySelector('[slot="editor"][data-tab="typography"]'))return;I=!0;const E=R()||{},w=getComputedStyle(document.documentElement);for(const L of Object.keys(a)){const A=document.getElementById(L);if(!A)continue;const K=E[L];K!=null?(A.value=K,u(A)):i(L)?A.value="":(A.value=w.getPropertyValue(a[L]).trim(),u(A)),p(A),A.addEventListener("input",()=>{u(A),p(A),A.id==="dp-type-ratio"&&f(),O()})}const T=document.querySelectorAll("[data-preset-ratio]");for(const L of T)L.addEventListener("click",()=>{const A=document.getElementById("dp-type-ratio");A&&(A.value=L.dataset.presetRatio,A.dispatchEvent(new Event("input",{bubbles:!0})))});f()}function P(){h().then(y=>{y&&B()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P,{once:!0}):P()})();Rt();function Mt(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function Ht(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function Ot(){document.querySelectorAll(".grid").forEach(t=>{const n=getComputedStyle(t),e=n.gridTemplateColumns.split(" ").filter(r=>r!=="none"&&r.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const a=n.columnGap||n.rowGap||n.gap;a&&a!=="normal"&&t.style.setProperty("--grid-gap",a)})}function _t(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&Ot()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let n;window.addEventListener("resize",()=>{clearTimeout(n),n=setTimeout(t,100)}),t()}Mt(()=>{Ht(),_t()});
