var gt=Object.defineProperty;var ke=t=>{throw TypeError(t)};var yt=(t,n,e)=>n in t?gt(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var $e=(t,n,e)=>yt(t,typeof n!="symbol"?n+"":n,e),ie=(t,n,e)=>n.has(t)||ke("Cannot "+e);var f=(t,n,e)=>(ie(t,n,"read from private field"),e?e.call(t):n.get(t)),G=(t,n,e)=>n.has(t)?ke("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,e),q=(t,n,e,a)=>(ie(t,n,"write to private field"),a?a.call(t,e):n.set(t,e),e),C=(t,n,e)=>(ie(t,n,"access private method"),e);class vt extends HTMLElement{async connectedCallback(){const n=this.getAttribute("src");if(!n){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const a=await e.text(),r=document.createElement("template");r.innerHTML=a;const i=r.content.cloneNode(!0);this.innerHTML="",this.appendChild(i),this.querySelectorAll("script").forEach(p=>{const m=document.createElement("script");Array.from(p.attributes).forEach(b=>{m.setAttribute(b.name,b.value)}),m.textContent=p.textContent,p.parentNode.replaceChild(m,p)})}catch(e){console.error(`HtmlInclude: failed to load ${n}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",vt);class St extends HTMLElement{connectedCallback(){const n=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const a=e.textContent.trim();a&&n.push(a)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&n.push(e.outerHTML);this._triggerContent=n.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var n;(n=this._abortController)==null||n.abort()}escapeHtml(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}sanitizeHref(n){return n?/^(javascript|data|vbscript):/i.test(n)?(console.warn("PopupDialog: Blocked potentially dangerous href:",n),""):n:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var n;(n=this.querySelector("dialog"))==null||n.showModal()}close(){var n;(n=this.querySelector("dialog"))==null||n.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const n=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),a=n?n.innerHTML:this.escapeHtml(this.body),r=this.escapeHtml(this.title);let i="";if(e)i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const m=`button button--${this.escapeHtml(this.confirmVariant)}`,b=[];this.cancelLabel&&b.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&b.push(this.confirmHref?`<a href="${this.confirmHref}" class="${m}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${m}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${b.join("")}</footer>`}const d=r?`<header class="cluster cluster-between cluster-nowrap">
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
          ${d}
          <div>${a}</div>
          ${i}
        </div>
      </dialog>
    `}setupEvents(){const n=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),a=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:r}=this._abortController;n.addEventListener("click",i=>{i.preventDefault(),e.showModal()},{signal:r}),a.addEventListener("click",()=>{e.close()},{signal:r}),e.addEventListener("click",i=>{const d=i.target.closest("[data-action]");if(d){const p=d.dataset.action;p==="cancel"||p==="close"?(i.preventDefault(),e.close()):p==="confirm"&&d.tagName!=="A"&&(i.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}i.target===e&&e.close()},{signal:r})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",St);const Re=`
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
`;let ne=null;const Oe=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";Oe&&(ne=new CSSStyleSheet,ne.replaceSync(Re));const W=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],Z={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},xt={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},Me="design-panel:state",Et=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function wt(){return W.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function Ct(){return Object.entries(Z).map(([t,n])=>{let e;if(n.type==="number")e=`<input type="number" data-setting="${t}" min="${n.min}" max="${n.max}" />`;else{const a=n.options.map(r=>`<option value="${r.value}">${r.label}</option>`).join("");e=`<select data-setting="${t}">${a}</select>`}return`
      <div class="setting">
        <label for="dp-setting-${t}">${n.label}</label>
        ${e.replace("data-setting=",`id="dp-setting-${t}" data-setting=`)}
      </div>
    `}).join("")}const At=`
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
          <div class="tools">${wt()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${Ct()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${Et}</button>
`;var E,N,Y,$,P,g,pe,Pe,Q,he,ee,me,fe,Ie,De,Ne,Be,qe,K;class He extends HTMLElement{constructor(){super();G(this,g);G(this,E,{...xt});G(this,N,null);G(this,Y,!1);G(this,$,null);G(this,P,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),Oe&&ne)this.shadowRoot.adoptedStyleSheets=[ne];else{const e=document.createElement("style");e.textContent=Re,this.shadowRoot.appendChild(e)}}connectedCallback(){q(this,$,new AbortController),C(this,g,qe).call(this),C(this,g,pe).call(this),C(this,g,Pe).call(this),C(this,g,ee).call(this),C(this,g,De).call(this),this.inert=!this.hasAttribute("open"),C(this,g,Ne).call(this),C(this,g,Be).call(this)}disconnectedCallback(){f(this,$)&&(f(this,$).abort(),q(this,$,null)),f(this,N)&&(clearTimeout(f(this,N)),q(this,N,null))}attributeChangedCallback(e,a,r){a!==r&&(e==="open"?(f(this,E).open=r!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(f(this,E).activeTab=r||"guides",f(this,Y)&&C(this,g,ee).call(this)):e==="overlay-target"&&C(this,g,pe).call(this))}}E=new WeakMap,N=new WeakMap,Y=new WeakMap,$=new WeakMap,P=new WeakMap,g=new WeakSet,pe=function(){const e=this.getAttribute("overlay-target")||"body";try{q(this,P,document.querySelector(e)||document.body)}catch{q(this,P,document.body)}},Pe=function(){const e=document.createRange().createContextualFragment(At);this.shadowRoot.appendChild(e),q(this,Y,!0);const a=f(this,$)?f(this,$).signal:void 0,r=a?{signal:a}:void 0,i=this.shadowRoot.querySelector(".close");i&&i.addEventListener("click",()=>C(this,g,Q).call(this,!1),r);const d=this.shadowRoot.querySelector(".trigger");d&&d.addEventListener("click",()=>C(this,g,Q).call(this,!0),r),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(p=>{p.addEventListener("click",()=>C(this,g,he).call(this,p.dataset.tab),r)}),this.shadowRoot.querySelectorAll(".tool").forEach(p=>{p.addEventListener("click",()=>C(this,g,me).call(this,p.dataset.tool),r)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(p=>{const m=p.dataset.setting,b=Z[m];if(!b)return;const L=b.type==="number"?"input":"change";p.addEventListener(L,H=>{const _=b.type==="number"?Number(H.target.value):H.target.value;C(this,g,fe).call(this,m,_)},r)})},Q=function(e){f(this,E).open=!!e,f(this,E).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",f(this,E).open),C(this,g,K).call(this)},he=function(e){e&&(f(this,E).activeTab=e,this.setAttribute("active-tab",e),C(this,g,ee).call(this),C(this,g,K).call(this))},ee=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const a=e.dataset.tab===f(this,E).activeTab;e.setAttribute("aria-selected",a?"true":"false"),e.toggleAttribute("data-active",a)})},me=function(e){const a=W.find(i=>i.name===e);if(!a)return;f(this,E)[e]=!f(this,E)[e],f(this,P)&&f(this,P).classList.toggle(a.className,f(this,E)[e]);const r=this.shadowRoot.querySelector(`[data-tool="${e}"]`);r&&(r.setAttribute("aria-pressed",f(this,E)[e]?"true":"false"),r.toggleAttribute("data-active",f(this,E)[e])),C(this,g,K).call(this)},fe=function(e,a){f(this,E)[e]=a;const r=Z[e];if(r){if(r.target==="cssvar")document.documentElement.style.setProperty(r.cssvar,String(a));else if(r.target==="overlayattr")f(this,P)&&f(this,P).setAttribute(r.attr,String(a));else if(r.target==="overlay-data-margin-mode"){const i=document.getElementById("dev-column-overlay"),d=document.getElementById("dev-margin-overlay");i&&i.setAttribute("data-margin-mode",String(a)),d&&d.setAttribute("data-margin-mode",String(a))}C(this,g,K).call(this)}},Ie=function(e){const a=this.shadowRoot.querySelector(`[data-setting="${e}"]`);a&&a.value!==String(f(this,E)[e])&&(a.value=String(f(this,E)[e]))},De=function(){for(const e of W){const a=!!f(this,E)[e.name];f(this,P)&&f(this,P).classList.toggle(e.className,a);const r=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);r&&(r.setAttribute("aria-pressed",a?"true":"false"),r.toggleAttribute("data-active",a))}for(const e of Object.keys(Z))f(this,E)[e]!==void 0&&(C(this,g,fe).call(this,e,f(this,E)[e]),C(this,g,Ie).call(this,e));document.body.toggleAttribute("data-panel-open",!!f(this,E).open)},Ne=function(){const e=f(this,$)?f(this,$).signal:void 0,a=e?{signal:e}:void 0,r=i=>{const d=i.composedPath(),p=d&&d[0];if(p&&p.matches&&p.matches("input,textarea,[contenteditable]")||i.metaKey||i.ctrlKey||i.altKey)return;const m=(i.key||"").toLowerCase();if(!m)return;if(m==="t"){C(this,g,Q).call(this,!f(this,E).open),i.preventDefault();return}const b=W.find(L=>L.key===m);b&&(C(this,g,me).call(this,b.name),i.preventDefault())};window.addEventListener("keydown",r,a)},Be=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const a=f(this,$)?f(this,$).signal:void 0,r=a?{signal:a}:void 0,i=()=>{const d=e.assignedElements(),p=new Set(d.map(m=>m.getAttribute("data-tab")).filter(m=>!!m));for(const m of this.shadowRoot.querySelectorAll('[role="tab"]')){const b=m.dataset.tab;b!=="guides"&&m.classList.toggle("hidden",!p.has(b))}f(this,E).activeTab!=="guides"&&!p.has(f(this,E).activeTab)&&C(this,g,he).call(this,"guides")};e.addEventListener("slotchange",i,r),i()},qe=function(){try{const e=localStorage.getItem(Me);if(e){const a=JSON.parse(e);a&&typeof a=="object"&&Object.assign(f(this,E),a)}}catch{}f(this,E).open?this.setAttribute("open",""):this.removeAttribute("open"),f(this,E).activeTab&&this.setAttribute("active-tab",f(this,E).activeTab)},K=function(){f(this,N)&&clearTimeout(f(this,N)),q(this,N,setTimeout(()=>{try{localStorage.setItem(Me,JSON.stringify(f(this,E)))}catch{}q(this,N,null)},200))},$e(He,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",He);(function(){const t="design-panel-runtime-schemes";function n(){let r=document.getElementById(t);r||(r=document.createElement("style"),r.id=t,document.head.appendChild(r),r.sheet.insertRule("@layer tokens {}",0),r.sheet.insertRule("@layer utilities {}",1));const i={};for(let d=0;d<r.sheet.cssRules.length;d++){const p=r.sheet.cssRules[d];p.name&&(i[p.name]=p)}return i}let e=null;function a(){return e||(e=n()),e}window.__dpSchemeUpdate=function(r,i,d,p){const m=a()[p||"tokens"];if(m){for(let b=0;b<m.cssRules.length;b++)if(m.cssRules[b].selectorText===r){m.cssRules[b].style.setProperty(i,d);return}m.insertRule(r+"{"+i+":"+d+"}",m.cssRules.length)}},window.__dpSchemeReset=function(){const r=a();for(const i in r){const d=r[i];for(;d.cssRules.length>0;)d.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(i=>i.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(i=>{for(let d=0;d<i.options.length;d++)if(i.options[d].defaultSelected){i.selectedIndex=d;break}})},window.__dpSchemeSerialize=function(){const r=[];return document.querySelectorAll(".dp-scheme-card").forEach(i=>{const d=i.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!d)return;const p=d.className.replace(/^scheme-/,""),m=i.querySelectorAll(".dp-scheme-mode-column"),b=["light","dark"];m.forEach((L,H)=>{const _=b[H];_&&L.querySelectorAll(".dp-scheme-mapping-row").forEach(M=>{const R=M.querySelector("label"),h=M.querySelector("select");if(!R||!h)return;const I=R.textContent.trim(),B=h.value,D=h.getAttribute("data-library-default")||"";B&&B!==D&&r.push({scheme:p,token:I,mode:_,value:B})})})}),r}})();function Fe(t){const n=String(t).replace(/^#/,"");if(n.length!==6||/[^0-9a-fA-F]/.test(n))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(n,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function le(t){if(!Number.isFinite(t))return 0;const n=Math.round(t*255);return n<0?0:n>255?255:n}function Ge({R:t,G:n,B:e}){const a=le(t),r=le(n),i=le(e);return"#"+a.toString(16).padStart(2,"0")+r.toString(16).padStart(2,"0")+i.toString(16).padStart(2,"0")}function ce(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function de(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function je({R:t,G:n,B:e}){return{R:ce(t),G:ce(n),B:ce(e)}}function ze({R:t,G:n,B:e}){return{R:de(t),G:de(n),B:de(e)}}function ue(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function Ue({R:t,G:n,B:e}){let a=.4122214708*t+.5363325363*n+.0514459929*e,r=.2119034982*t+.6806995451*n+.1073969566*e,i=.0883024619*t+.2817188376*n+.6299787005*e;a=ue(a),r=ue(r),i=ue(i);const d=.2104542553*a+.793617785*r-.0040720468*i,p=1.9779984951*a-2.428592205*r+.4505937099*i,m=.0259040371*a+.7827717662*r-.808675766*i;return{L:d,a:p,b:m}}function be({L:t,a:n,b:e}){let a=t+.3963377774*n+.2158037573*e,r=t-.1055613458*n-.0638541728*e,i=t-.0894841775*n-1.291485548*e;a=a*a*a,r=r*r*r,i=i*i*i;const d=4.0767416621*a-3.3077115913*r+.2309699292*i,p=-1.2684380046*a+2.6097574011*r-.3413193965*i,m=-.0041960863*a-.7034186147*r+1.707614701*i;return{R:d,G:p,B:m}}function Ve({L:t,a:n,b:e}){const a=Math.sqrt(n*n+e*e),i=(Math.atan2(e,n)*180/Math.PI%360+360)%360;return{L:t,C:a,H:i}}function ge({L:t,C:n,H:e}){const a=e*Math.PI/180;return{L:t,a:n*Math.cos(a),b:n*Math.sin(a)}}function Ke(t){return Ve(Ue(je(Fe(t))))}function te({L:t,C:n,H:e}){return Ge(ze(be(ge({L:t,C:n,H:e}))))}function ye({L:t,C:n,H:e}){const a=ge({L:t,C:n,H:e}),r=be(a),i=.002;return r.R>=-i&&r.R<=1+i&&r.G>=-i&&r.G<=1+i&&r.B>=-i&&r.B<=1+i}function ve(t,n){let e=0,a=.4;for(let r=0;r<40;r++){const i=(e+a)/2;ye({L:t,C:i,H:n})?e=i:a=i}return e}function oe({L:t,C:n,H:e}){return ye({L:t,C:n,H:e})?{L:t,C:n,H:e}:{L:t,C:ve(t,e),H:e}}function Ye(t,n,e){return t<n?n:t>e?e:t}function Tt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:Fe,sRGBToHex:Ge,sRGBToLinearRGB:je,linearRGBToSRGB:ze,linearRGBToOKLab:Ue,oklabToLinearRGB:be,oklabToOKLCH:Ve,oklchToOKLab:ge,hexToOKLCH:Ke,oklchToHex:te,isInSRGBGamut:ye,maxChromaSRGB:ve,clampChroma:oe,clampFloat:Ye}))}const Se=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),Lt=Object.freeze(["blue","red","orange","yellow","green","grey"]),Je=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),xe=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function _t(t,n){const e=t||xe,a=Math.max(0,Math.min(100,n))/100,r={};for(const i of Se){const d=Number(i),p=e[d]??e[String(d)]??.5;r[d]=p*a}return r}function kt(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const n=Ke(t.anchorHex),e=t.lTargets||Je,a=t.chromaProfile||xe,r=t.overrides||{},i=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const d=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,p=n.L-d,m=[];for(const b of Se){if(Object.prototype.hasOwnProperty.call(r,b)){const[h,I,B]=r[b],D=oe({L:h,C:I,H:B});m.push({step:b,hex:te(D),L:D.L,C:D.C,H:D.H});continue}if(b===t.anchorStep){const h=oe(n);m.push({step:b,hex:te(h),L:h.L,C:h.C,H:h.H});continue}const L=Object.prototype.hasOwnProperty.call(e,b)?e[b]:.58,H=Ye(L+p,.06,.985);let _=i?i(b):n.H,M;if(t.isNeutral)M=t.neutralChroma,_=t.neutralHue;else{const h=ve(H,_),I=Object.prototype.hasOwnProperty.call(a,b)?a[b]:.5;M=h*I}const R=oe({L:H,C:M,H:_});m.push({step:b,hex:te(R),L:R.L,C:R.C,H:R.H})}return m}function $t(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:Se,FAMILY_NAMES:Lt,DEFAULT_L_TARGETS:Je,DEFAULT_CHROMA_PROFILE:xe,generateRamp:kt,scaleChromaProfile:_t}))}function Mt(t=globalThis){Tt(t),$t(t)}(function(){if(!window.__dpTypographySignalMap){var t=Object.freeze({"dp-type-ratio":"--type-scale-ratio","dp-text-base-min":"--text-base-min","dp-text-base-max":"--text-base-max","dp-lh-body":"--line-height-ratio-body","dp-lh-heading":"--line-height-ratio-heading","dp-font-body":"--font-body","dp-font-heading":"--font-heading","dp-line-height-min":"--line-height-min","dp-line-height-max":"--line-height-max"});window.__dpTypographySignalMap=t,window.__dpDefaultThemeId="thm_default",window.__dpIsDefaultActive=function(){var n=null;try{n=localStorage.getItem("design-panel:active-theme-id")}catch{}return n===null||n===window.__dpDefaultThemeId},window.__dpMakeDebouncedSaver=function(n,e,a){var r=typeof a=="number"?a:200,i=null,d=!1;function p(){d=!1,i&&(clearTimeout(i),i=null);try{localStorage.setItem(n,JSON.stringify(e()))}catch{}}function m(){i&&clearTimeout(i),d=!0,i=setTimeout(p,r)}return m.flush=function(){d&&p()},m}}})();(function(){const t=typeof window<"u"&&window.DesignPanelColor||{},n=t.FAMILY_NAMES?Array.from(t.FAMILY_NAMES):["blue","red","orange","yellow","green","grey"],e=t.STEPS?t.STEPS.map(String):["50","100","200","300","400","500","600","700","800","900","950"],a=["default","subtle","accent"],r=["light","dark"],i=["bg","fg","accent","muted","subtle"],d="design-panel:schemes",p="design-panel:ramps",m=300,b={blue:"#1f75ff",red:"#e10600",orange:"#ff4f00",yellow:"#ffa300",green:"#00b312",grey:"#808080"},L={};for(const o of n)L[o]=o.charAt(0).toUpperCase()+o.slice(1);const H=new RegExp(`^(?:${n.join("|")})-(?:${e.join("|")})$`);let _=!1,M=!1,R=!1;function h(o,s,l){const c=document.createElement(o);if(s)for(const u in s)u==="text"?c.textContent=s[u]:u in c&&typeof s[u]!="string"?c[u]=s[u]:c.setAttribute(u,s[u]);if(l)for(const u of l)u!=null&&c.appendChild(u);return c}function I(o){const s=L[o],l=`dp-ramp-settings-${o}`,c=h("span",{class:"dp-ramp-label",text:s}),u=h("span",{class:"dp-ramp-grid","aria-hidden":"true"});for(const V of e)u.appendChild(h("span",{class:"dp-ramp-swatch","data-step":V}));const v=h("button",{class:"dp-ramp-row",type:"button","aria-expanded":"false","aria-controls":l,"aria-label":`${s} ramp settings`},[c,u]),S=h("legend",{class:"dp-ramp-settings-legend",text:`${s} ramp settings`}),T=h("label",{for:`dp-anchor-${o}`,text:"Anchor color"}),F=h("input",{type:"color",id:`dp-anchor-${o}`}),X=h("label",{for:`dp-step-${o}`,text:"Anchor step"}),U=h("select",{id:`dp-step-${o}`});for(const V of e){const _e=h("option",{value:V,text:V});V==="500"&&(_e.selected=!0),U.appendChild(_e)}const mt=h("label",{for:`dp-chroma-${o}`,text:"Chroma intensity"}),ft=h("input",{type:"range",id:`dp-chroma-${o}`,min:"0",max:"100",value:"80"}),bt=h("fieldset",{class:"dp-ramp-settings",id:l,hidden:""},[S,T,F,X,U,mt,ft]);return h("div",{class:"dp-ramp-row-wrapper","data-family":o},[v,bt])}function B(o,s){const l=o.charAt(0).toUpperCase()+o.slice(1);return h("div",{class:`dp-scheme-preview ${s==="dark"?"dp-scheme-preview-dark dark-mode":"dp-scheme-preview-light"}`,"aria-hidden":"true"},[h("div",{class:`scheme-${o}`},[h("div",{class:"dp-scheme-heading",text:l}),h("div",{class:"dp-scheme-divider"}),h("div",{class:"dp-scheme-body",text:"Sample body text"}),h("div",{class:"dp-scheme-meta"},[h("span",{class:"dp-scheme-accent-text",text:"Accent"}),h("span",{class:"dp-scheme-subtle-swatch"}),h("span",{class:"dp-scheme-muted-text",text:"Muted"})])])])}function D(o,s,l){const c=`dp-scheme-${o}-${s}-${l}`;return h("div",{class:"dp-scheme-mapping-row"},[h("label",{for:c,text:l}),h("select",{id:c,"data-scheme":o,"data-mode":s,"data-token":l,"aria-busy":"true"},[h("option",{value:"",disabled:!0,selected:!0,text:"Loading…"})])])}function z(o,s){const l=x(o),c=s.charAt(0).toUpperCase()+s.slice(1),u=h("summary",{"aria-label":`${l} scheme, ${c} mode`},[B(o,s)]),v=h("legend",{class:"dp-scheme-mode-label",text:c}),S=h("fieldset",{class:"dp-scheme-mode-column"},[v]);for(const T of i)S.appendChild(D(o,s,T));return h("details",{class:"dp-scheme-card-mode","data-mode":s},[u,S])}function y(o){const s=x(o);return h("div",{class:"dp-scheme-card","data-scheme":o,role:"listitem","aria-label":`${s} scheme`},[z(o,"light"),z(o,"dark")])}function x(o){return o.charAt(0).toUpperCase()+o.slice(1)}function A(){const o=document.querySelector("[data-dp-ramp-matrix]");if(o&&!o.firstChild)for(const l of n)o.appendChild(I(l));const s=document.querySelector("[data-dp-scheme-list]");if(s&&!s.firstChild)for(const l of a)s.appendChild(y(l))}function w(){const o=document.documentElement,s=getComputedStyle(o),l={};for(const c of n){l[c]={};for(const u of e){const v=s.getPropertyValue(`--color-${c}-${u}`).trim();l[c][u]=v||null}}return l}function O(o){for(const s of n){const l=document.querySelector(`.dp-ramp-row-wrapper[data-family="${s}"]`);if(l)for(const c of e){const u=l.querySelector(`.dp-ramp-swatch[data-step="${c}"]`);if(!u)continue;const v=o[s][c];v?u.style.backgroundColor=v:_||(console.warn(`[design-panel-colors] Missing --color-${s}-${c} token; leaving swatch unpainted.`),_=!0)}}}function k(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o){for(;s.firstChild;)s.removeChild(s.firstChild);const l=document.createElement("option");l.value="",l.textContent="—",s.appendChild(l);for(const c of n){const u=L[c],v=document.createElement("optgroup");v.label=u;for(const S of e){const T=document.createElement("option");T.value=`${c}-${S}`,T.textContent=`${u} ${S}`,v.appendChild(T)}s.appendChild(v)}s.removeAttribute("aria-busy")}}function j(o){let s;try{s=localStorage.getItem(o)}catch{return{}}if(!s)return{};try{const l=JSON.parse(s);return l&&typeof l=="object"?l:{}}catch{return{}}}function se(o){return typeof o=="string"&&H.test(o)}function Xe(){const o=j(d);for(const s of a){const l=o[s];if(!(!l||typeof l!="object"))for(const c of r){const u=l[c];if(!(!u||typeof u!="object"))for(const v of i){const S=u[v];if(!se(S))continue;const T=document.getElementById(`dp-scheme-${s}-${c}-${v}`);T&&(T.value=S,re(s,c,v,S))}}}}function We(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o)s.addEventListener("change",Ze)}function Ze(o){const s=o.currentTarget,{scheme:l,mode:c,token:u}=s.dataset;if(!(!l||!c||!u)){if(s.value!==""&&!se(s.value)){console.warn(`[design-panel-colors] ignoring invalid scheme value "${s.value}"`);return}re(l,c,u,s.value),Ee()}}function re(o,s,l,c){if(typeof window.__dpSchemeUpdate!="function"){M||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),M=!0);return}const u=`--color-${l}`,v=c?`var(--color-${c})`:"initial";if(o==="default"){const S=s==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(S,u,v,"utilities")}else{const S=s==="dark"?`.scheme-${o}.dark-mode`:`.scheme-${o}`;window.__dpSchemeUpdate(S,u,v,"tokens")}}function Qe(){const o={};for(const s of a){o[s]={light:{},dark:{}};for(const l of r)for(const c of i){const u=document.getElementById(`dp-scheme-${s}-${l}-${c}`);u&&u.value&&(o[s][l][c]=u.value)}}return o}const Ee=window.__dpMakeDebouncedSaver(d,Qe,m);function et(){const o=document.querySelectorAll(".dp-ramp-row");for(const s of o)s.addEventListener("click",()=>{const l=s.getAttribute("aria-controls");if(!l)return;const c=document.getElementById(l);if(!c)return;c.hasAttribute("hidden")?(c.removeAttribute("hidden"),s.setAttribute("aria-expanded","true")):(c.setAttribute("hidden",""),s.setAttribute("aria-expanded","false"))})}function tt(){const o=window.DesignPanelColor;return!o||typeof o.generateRamp!="function"?(R||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),R=!0),null):o}function ot(){const o=getComputedStyle(document.documentElement),s={};for(const l of n){const c=o.getPropertyValue(`--color-${l}-500`).trim(),u=b[l]||"#808080";s[l]={anchorHex:(c||u).toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return s}function we(){return j(p)}const nt=/^#[0-9a-f]{6}$/,st=new Set(e.map(o=>Number(o)));function rt(o){if(!o||typeof o!="object")return{};const s={};if(typeof o.anchorHex=="string"){const l=o.anchorHex.toLowerCase();nt.test(l)&&(s.anchorHex=l)}return Number.isFinite(o.anchorStep)&&st.has(o.anchorStep)&&(s.anchorStep=o.anchorStep),Number.isFinite(o.chroma)&&o.chroma>=0&&o.chroma<=100&&(s.chroma=o.chroma),typeof o.isNeutral=="boolean"&&(s.isNeutral=o.isNeutral),Number.isFinite(o.neutralChroma)&&o.neutralChroma>=0&&o.neutralChroma<=.5&&(s.neutralChroma=o.neutralChroma),Number.isFinite(o.neutralHue)&&o.neutralHue>=0&&o.neutralHue<360&&(s.neutralHue=o.neutralHue),s}function at(){const o=ot(),s=we(),l={};for(const c of n)l[c]={...o[c],...rt(s[c])};return l}function it(){const o=we();return Object.keys(o).length>0}function lt(o,s){if(typeof o.scaleChromaProfile=="function")return o.scaleChromaProfile(o.DEFAULT_CHROMA_PROFILE,s);const l=Math.max(0,Math.min(100,s))/100,c=o.DEFAULT_CHROMA_PROFILE||{},u={};for(const v of e){const S=Number(v),T=c[S]??c[v]??.5;u[S]=T*l}return u}function J(o,s){const l=tt();if(!l)return;const c=s[o];if(!c)return;const u=lt(l,c.chroma);let v;try{v=l.generateRamp({anchorHex:c.anchorHex,anchorStep:c.anchorStep,chromaProfile:u,isNeutral:!!c.isNeutral,neutralChroma:c.neutralChroma,neutralHue:c.neutralHue})}catch(F){console.warn(`[design-panel-colors] generateRamp failed for ${o}: ${F.message}`);return}const S=document.querySelector(`.dp-ramp-row-wrapper[data-family="${o}"]`),T=document.documentElement;for(const F of v){const X=String(F.step);if(T.style.setProperty(`--color-${o}-${X}`,F.hex),S){const U=S.querySelector(`.dp-ramp-swatch[data-step="${X}"]`);U&&(U.style.backgroundColor=F.hex)}}}function ct(o){for(const s of n)J(s,o)}function Ce(o,s){o.setAttribute("aria-valuetext",`Chroma ${s} percent`)}function dt(o){const s=window.__dpMakeDebouncedSaver(p,()=>o,m);for(const l of n){const c=document.getElementById(`dp-anchor-${l}`),u=document.getElementById(`dp-step-${l}`),v=document.getElementById(`dp-chroma-${l}`);c&&o[l].anchorHex&&(c.value=o[l].anchorHex),u&&(u.value=String(o[l].anchorStep)),v&&(v.value=String(o[l].chroma),Ce(v,o[l].chroma)),c&&c.addEventListener("input",()=>{o[l].anchorHex=(c.value||"").toLowerCase(),J(l,o),s()}),u&&u.addEventListener("change",()=>{const S=parseInt(u.value,10);Number.isFinite(S)&&(o[l].anchorStep=S,J(l,o),s())}),v&&v.addEventListener("input",()=>{const S=parseInt(v.value,10);Number.isFinite(S)&&(o[l].chroma=S,Ce(v,S),J(l,o),s())})}}const ut=5e3;function Ae(){return document.querySelector("[data-dp-ramp-matrix]")||document.querySelector("[data-dp-scheme-list]")}function pt(){return Ae()?Promise.resolve(!0):new Promise(o=>{const s=new MutationObserver(()=>{Ae()&&(c(),o(!0))}),l=setTimeout(()=>{c(),o(!1)},ut);function c(){s.disconnect(),clearTimeout(l)}s.observe(document.body,{childList:!0,subtree:!0})})}function Te(){pt().then(o=>{o&&ae()})}function Le(){if(!document.querySelector("[data-dp-scheme-list]"))return;Xe();const s=j(d);for(const l of a){const c=s&&s[l]||{};for(const u of r){const v=c[u]||{};for(const S of i){const T=document.getElementById(`dp-scheme-${l}-${u}-${S}`);if(!T)continue;se(v[S])||(T.value="",re(l,u,S,""))}}}ht()}function ht(){const o=window.__dpIsDefaultActive();document.querySelectorAll('[slot="editor"][data-tab="colors"] :is(input, button, select)').forEach(s=>{s.disabled=o})}function ae(){if(ae.done)return;ae.done=!0,A();const o=w();O(o),k(),We(),et();const s=at();it()&&ct(s),dt(s),window.__dpColorsSave||(document.addEventListener("design-panel:reactivate",Le),window.__dpColorsSave={flush:Ee.flush}),Le()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Te,{once:!0}):Te()})();(function(){const t="design-panel:typography",a=window.__dpTypographySignalMap,r=Object.freeze({"1.125":"Minor second","1.2":"Minor third","1.25":"Major third","1.333":"Perfect fourth","1.414":"Augmented fourth","1.5":"Perfect fifth","1.618":"Golden ratio"});function i(y){return y==="dp-font-body"||y==="dp-font-heading"}function d(y){const x=a[y.id],A=y.value;if(i(y.id)){const w=A.trim();w?document.documentElement.style.setProperty(x,w):document.documentElement.style.removeProperty(x)}else document.documentElement.style.setProperty(x,String(A))}function p(y){if(y.type==="range")if(y.id==="dp-type-ratio"){const x=r[y.value]||"";y.setAttribute("aria-valuetext",x?`Scale ratio ${y.value}, ${x}`:`Scale ratio ${y.value}`)}else{const x=y.id==="dp-lh-body"?"Body":"Heading";y.setAttribute("aria-valuetext",`${x} line height ${y.value}`)}}function m(){const y=document.getElementById("dp-type-ratio");if(!y)return;const x=Number(y.value),A=document.querySelectorAll("[data-preset-ratio]");for(const w of A){const O=Number(w.dataset.presetRatio),k=Math.abs(x-O)<.001;w.setAttribute("aria-pressed",k?"true":"false")}}function b(){const y={};for(const x of Object.keys(a)){const A=document.getElementById(x);A&&(y[x]=A.value)}return y}const L=window.__dpMakeDebouncedSaver(t,b,200);function H(){try{const y=localStorage.getItem(t);if(!y)return null;const x=JSON.parse(y);if(!x||typeof x!="object"||Array.isArray(x))return null;const A={};for(const w of Object.keys(a)){const O=x[w];typeof O=="string"&&(A[w]=O)}return A}catch{return null}}const _=5e3;function M(){return!!document.querySelector('[slot="editor"][data-tab="typography"] #dp-type-ratio')}function R(){return M()?Promise.resolve(!0):new Promise(y=>{const x=new MutationObserver(()=>{M()&&(w(),y(!0))}),A=setTimeout(()=>{w(),y(!1)},_);function w(){x.disconnect(),clearTimeout(A)}x.observe(document.body,{childList:!0,subtree:!0})})}let h=!1;function I(){if(!document.querySelector('[slot="editor"][data-tab="typography"]'))return;const x=H()||{},A=getComputedStyle(document.documentElement),w=window.__dpIsDefaultActive();for(const O of Object.keys(a)){const k=document.getElementById(O);if(!k)continue;const j=x[O];j!=null?(k.value=j,d(k)):w?(k.value="",document.documentElement.style.removeProperty(a[O])):i(O)?(k.value="",d(k)):(k.value=A.getPropertyValue(a[O]).trim(),d(k)),p(k)}B(),m()}function B(){const y=window.__dpIsDefaultActive();document.querySelectorAll('[slot="editor"][data-tab="typography"] :is(input, button, select)').forEach(x=>{x.disabled=y})}function D(){if(h||!document.querySelector('[slot="editor"][data-tab="typography"]'))return;h=!0;for(const A of Object.keys(a)){const w=document.getElementById(A);w&&w.addEventListener("input",()=>{d(w),p(w),w.id==="dp-type-ratio"&&m(),L()})}const x=document.querySelectorAll("[data-preset-ratio]");for(const A of x)A.addEventListener("click",()=>{const w=document.getElementById("dp-type-ratio");w&&(w.value=A.dataset.presetRatio,w.dispatchEvent(new Event("input",{bubbles:!0})))});window.__dpTypographySave||(document.addEventListener("design-panel:reactivate",I),window.__dpTypographySave={flush:L.flush}),I()}function z(){R().then(y=>{y&&D()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",z,{once:!0}):z()})();Mt();function Rt(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function Ot(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function Ht(){document.querySelectorAll(".grid").forEach(t=>{const n=getComputedStyle(t),e=n.gridTemplateColumns.split(" ").filter(r=>r!=="none"&&r.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const a=n.columnGap||n.rowGap||n.gap;a&&a!=="normal"&&t.style.setProperty("--grid-gap",a)})}function Pt(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&Ht()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let n;window.addEventListener("resize",()=>{clearTimeout(n),n=setTimeout(t,100)}),t()}Rt(()=>{Ot(),Pt()});
