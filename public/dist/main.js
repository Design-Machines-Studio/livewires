var yt=Object.defineProperty;var ke=t=>{throw TypeError(t)};var vt=(t,n,e)=>n in t?yt(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var $e=(t,n,e)=>vt(t,typeof n!="symbol"?n+"":n,e),ie=(t,n,e)=>n.has(t)||ke("Cannot "+e);var m=(t,n,e)=>(ie(t,n,"read from private field"),e?e.call(t):n.get(t)),G=(t,n,e)=>n.has(t)?ke("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,e),q=(t,n,e,r)=>(ie(t,n,"write to private field"),r?r.call(t,e):n.set(t,e),e),C=(t,n,e)=>(ie(t,n,"access private method"),e);class St extends HTMLElement{async connectedCallback(){const n=this.getAttribute("src");if(!n){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const r=await e.text(),a=document.createElement("template");a.innerHTML=r;const i=a.content.cloneNode(!0);this.innerHTML="",this.appendChild(i),this.querySelectorAll("script").forEach(f=>{const p=document.createElement("script");Array.from(f.attributes).forEach(b=>{p.setAttribute(b.name,b.value)}),p.textContent=f.textContent,f.parentNode.replaceChild(p,f)})}catch(e){console.error(`HtmlInclude: failed to load ${n}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",St);class Et extends HTMLElement{connectedCallback(){const n=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const r=e.textContent.trim();r&&n.push(r)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&n.push(e.outerHTML);this._triggerContent=n.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var n;(n=this._abortController)==null||n.abort()}escapeHtml(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}sanitizeHref(n){return n?/^(javascript|data|vbscript):/i.test(n)?(console.warn("PopupDialog: Blocked potentially dangerous href:",n),""):n:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var n;(n=this.querySelector("dialog"))==null||n.showModal()}close(){var n;(n=this.querySelector("dialog"))==null||n.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const n=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),r=n?n.innerHTML:this.escapeHtml(this.body),a=this.escapeHtml(this.title);let i="";if(e)i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const p=`button button--${this.escapeHtml(this.confirmVariant)}`,b=[];this.cancelLabel&&b.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&b.push(this.confirmHref?`<a href="${this.confirmHref}" class="${p}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${p}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${b.join("")}</footer>`}const d=a?`<header class="cluster cluster-between cluster-nowrap">
          <h2>${a}</h2>
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
          <div>${r}</div>
          ${i}
        </div>
      </dialog>
    `}setupEvents(){const n=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),r=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:a}=this._abortController;n.addEventListener("click",i=>{i.preventDefault(),e.showModal()},{signal:a}),r.addEventListener("click",()=>{e.close()},{signal:a}),e.addEventListener("click",i=>{const d=i.target.closest("[data-action]");if(d){const f=d.dataset.action;f==="cancel"||f==="close"?(i.preventDefault(),e.close()):f==="confirm"&&d.tagName!=="A"&&(i.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}i.target===e&&e.close()},{signal:a})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",Et);const Re=`
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
`;let ne=null;const He=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";He&&(ne=new CSSStyleSheet,ne.replaceSync(Re));const W=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],Z={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},xt={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},Me="design-panel:state",wt=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function Ct(){return W.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function At(){return Object.entries(Z).map(([t,n])=>{let e;if(n.type==="number")e=`<input type="number" data-setting="${t}" min="${n.min}" max="${n.max}" />`;else{const r=n.options.map(a=>`<option value="${a.value}">${a.label}</option>`).join("");e=`<select data-setting="${t}">${r}</select>`}return`
      <div class="setting">
        <label for="dp-setting-${t}">${n.label}</label>
        ${e.replace("data-setting=",`id="dp-setting-${t}" data-setting=`)}
      </div>
    `}).join("")}const Tt=`
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
          <div class="tools">${Ct()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${At()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${wt}</button>
`;var x,N,Y,M,P,g,pe,Pe,Q,fe,ee,he,me,De,Ie,Ne,Be,qe,K;class Oe extends HTMLElement{constructor(){super();G(this,g);G(this,x,{...xt});G(this,N,null);G(this,Y,!1);G(this,M,null);G(this,P,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),He&&ne)this.shadowRoot.adoptedStyleSheets=[ne];else{const e=document.createElement("style");e.textContent=Re,this.shadowRoot.appendChild(e)}}connectedCallback(){q(this,M,new AbortController),C(this,g,qe).call(this),C(this,g,pe).call(this),C(this,g,Pe).call(this),C(this,g,ee).call(this),C(this,g,Ie).call(this),this.inert=!this.hasAttribute("open"),C(this,g,Ne).call(this),C(this,g,Be).call(this)}disconnectedCallback(){m(this,M)&&(m(this,M).abort(),q(this,M,null)),m(this,N)&&(clearTimeout(m(this,N)),q(this,N,null))}attributeChangedCallback(e,r,a){r!==a&&(e==="open"?(m(this,x).open=a!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(m(this,x).activeTab=a||"guides",m(this,Y)&&C(this,g,ee).call(this)):e==="overlay-target"&&C(this,g,pe).call(this))}}x=new WeakMap,N=new WeakMap,Y=new WeakMap,M=new WeakMap,P=new WeakMap,g=new WeakSet,pe=function(){const e=this.getAttribute("overlay-target")||"body";try{q(this,P,document.querySelector(e)||document.body)}catch{q(this,P,document.body)}},Pe=function(){const e=document.createRange().createContextualFragment(Tt);this.shadowRoot.appendChild(e),q(this,Y,!0);const r=m(this,M)?m(this,M).signal:void 0,a=r?{signal:r}:void 0,i=this.shadowRoot.querySelector(".close");i&&i.addEventListener("click",()=>C(this,g,Q).call(this,!1),a);const d=this.shadowRoot.querySelector(".trigger");d&&d.addEventListener("click",()=>C(this,g,Q).call(this,!0),a),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(f=>{f.addEventListener("click",()=>C(this,g,fe).call(this,f.dataset.tab),a)}),this.shadowRoot.querySelectorAll(".tool").forEach(f=>{f.addEventListener("click",()=>C(this,g,he).call(this,f.dataset.tool),a)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(f=>{const p=f.dataset.setting,b=Z[p];if(!b)return;const T=b.type==="number"?"input":"change";f.addEventListener(T,k=>{const _=b.type==="number"?Number(k.target.value):k.target.value;C(this,g,me).call(this,p,_)},a)})},Q=function(e){m(this,x).open=!!e,m(this,x).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",m(this,x).open),C(this,g,K).call(this)},fe=function(e){e&&(m(this,x).activeTab=e,this.setAttribute("active-tab",e),C(this,g,ee).call(this),C(this,g,K).call(this))},ee=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const r=e.dataset.tab===m(this,x).activeTab;e.setAttribute("aria-selected",r?"true":"false"),e.toggleAttribute("data-active",r)})},he=function(e){const r=W.find(i=>i.name===e);if(!r)return;m(this,x)[e]=!m(this,x)[e],m(this,P)&&m(this,P).classList.toggle(r.className,m(this,x)[e]);const a=this.shadowRoot.querySelector(`[data-tool="${e}"]`);a&&(a.setAttribute("aria-pressed",m(this,x)[e]?"true":"false"),a.toggleAttribute("data-active",m(this,x)[e])),C(this,g,K).call(this)},me=function(e,r){m(this,x)[e]=r;const a=Z[e];if(a){if(a.target==="cssvar")document.documentElement.style.setProperty(a.cssvar,String(r));else if(a.target==="overlayattr")m(this,P)&&m(this,P).setAttribute(a.attr,String(r));else if(a.target==="overlay-data-margin-mode"){const i=document.getElementById("dev-column-overlay"),d=document.getElementById("dev-margin-overlay");i&&i.setAttribute("data-margin-mode",String(r)),d&&d.setAttribute("data-margin-mode",String(r))}C(this,g,K).call(this)}},De=function(e){const r=this.shadowRoot.querySelector(`[data-setting="${e}"]`);r&&r.value!==String(m(this,x)[e])&&(r.value=String(m(this,x)[e]))},Ie=function(){for(const e of W){const r=!!m(this,x)[e.name];m(this,P)&&m(this,P).classList.toggle(e.className,r);const a=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);a&&(a.setAttribute("aria-pressed",r?"true":"false"),a.toggleAttribute("data-active",r))}for(const e of Object.keys(Z))m(this,x)[e]!==void 0&&(C(this,g,me).call(this,e,m(this,x)[e]),C(this,g,De).call(this,e));document.body.toggleAttribute("data-panel-open",!!m(this,x).open)},Ne=function(){const e=m(this,M)?m(this,M).signal:void 0,r=e?{signal:e}:void 0,a=i=>{const d=i.composedPath(),f=d&&d[0];if(f&&f.matches&&f.matches("input,textarea,[contenteditable]")||i.metaKey||i.ctrlKey||i.altKey)return;const p=(i.key||"").toLowerCase();if(!p)return;if(p==="t"){C(this,g,Q).call(this,!m(this,x).open),i.preventDefault();return}const b=W.find(T=>T.key===p);b&&(C(this,g,he).call(this,b.name),i.preventDefault())};window.addEventListener("keydown",a,r)},Be=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const r=m(this,M)?m(this,M).signal:void 0,a=r?{signal:r}:void 0,i=()=>{const d=e.assignedElements(),f=new Set(d.map(p=>p.getAttribute("data-tab")).filter(p=>!!p));for(const p of this.shadowRoot.querySelectorAll('[role="tab"]')){const b=p.dataset.tab;b!=="guides"&&p.classList.toggle("hidden",!f.has(b))}m(this,x).activeTab!=="guides"&&!f.has(m(this,x).activeTab)&&C(this,g,fe).call(this,"guides")};e.addEventListener("slotchange",i,a),i()},qe=function(){try{const e=localStorage.getItem(Me);if(e){const r=JSON.parse(e);r&&typeof r=="object"&&Object.assign(m(this,x),r)}}catch{}m(this,x).open?this.setAttribute("open",""):this.removeAttribute("open"),m(this,x).activeTab&&this.setAttribute("active-tab",m(this,x).activeTab)},K=function(){m(this,N)&&clearTimeout(m(this,N)),q(this,N,setTimeout(()=>{try{localStorage.setItem(Me,JSON.stringify(m(this,x)))}catch{}q(this,N,null)},200))},$e(Oe,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",Oe);(function(){const t="design-panel-runtime-schemes";function n(){let a=document.getElementById(t);a||(a=document.createElement("style"),a.id=t,document.head.appendChild(a),a.sheet.insertRule("@layer tokens {}",0),a.sheet.insertRule("@layer utilities {}",1));const i={};for(let d=0;d<a.sheet.cssRules.length;d++){const f=a.sheet.cssRules[d];f.name&&(i[f.name]=f)}return i}let e=null;function r(){return e||(e=n()),e}window.__dpSchemeUpdate=function(a,i,d,f){const p=r()[f||"tokens"];if(p){for(let b=0;b<p.cssRules.length;b++)if(p.cssRules[b].selectorText===a){p.cssRules[b].style.setProperty(i,d);return}p.insertRule(a+"{"+i+":"+d+"}",p.cssRules.length)}},window.__dpSchemeReset=function(){const a=r();for(const i in a){const d=a[i];for(;d.cssRules.length>0;)d.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(i=>i.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(i=>{for(let d=0;d<i.options.length;d++)if(i.options[d].defaultSelected){i.selectedIndex=d;break}})},window.__dpSchemeSerialize=function(){const a=[];return document.querySelectorAll(".dp-scheme-card").forEach(i=>{const d=i.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!d)return;const f=d.className.replace(/^scheme-/,""),p=i.querySelectorAll(".dp-scheme-mode-column"),b=["light","dark"];p.forEach((T,k)=>{const _=b[k];_&&T.querySelectorAll(".dp-scheme-mapping-row").forEach(R=>{const H=R.querySelector("label"),h=R.querySelector("select");if(!H||!h)return;const D=H.textContent.trim(),B=h.value,I=h.getAttribute("data-library-default")||"";B&&B!==I&&a.push({scheme:f,token:D,mode:_,value:B})})})}),a}})();function Fe(t){const n=String(t).replace(/^#/,"");if(n.length!==6||/[^0-9a-fA-F]/.test(n))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(n,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function le(t){if(!Number.isFinite(t))return 0;const n=Math.round(t*255);return n<0?0:n>255?255:n}function Ge({R:t,G:n,B:e}){const r=le(t),a=le(n),i=le(e);return"#"+r.toString(16).padStart(2,"0")+a.toString(16).padStart(2,"0")+i.toString(16).padStart(2,"0")}function ce(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function de(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function je({R:t,G:n,B:e}){return{R:ce(t),G:ce(n),B:ce(e)}}function ze({R:t,G:n,B:e}){return{R:de(t),G:de(n),B:de(e)}}function ue(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function Ue({R:t,G:n,B:e}){let r=.4122214708*t+.5363325363*n+.0514459929*e,a=.2119034982*t+.6806995451*n+.1073969566*e,i=.0883024619*t+.2817188376*n+.6299787005*e;r=ue(r),a=ue(a),i=ue(i);const d=.2104542553*r+.793617785*a-.0040720468*i,f=1.9779984951*r-2.428592205*a+.4505937099*i,p=.0259040371*r+.7827717662*a-.808675766*i;return{L:d,a:f,b:p}}function be({L:t,a:n,b:e}){let r=t+.3963377774*n+.2158037573*e,a=t-.1055613458*n-.0638541728*e,i=t-.0894841775*n-1.291485548*e;r=r*r*r,a=a*a*a,i=i*i*i;const d=4.0767416621*r-3.3077115913*a+.2309699292*i,f=-1.2684380046*r+2.6097574011*a-.3413193965*i,p=-.0041960863*r-.7034186147*a+1.707614701*i;return{R:d,G:f,B:p}}function Ve({L:t,a:n,b:e}){const r=Math.sqrt(n*n+e*e),i=(Math.atan2(e,n)*180/Math.PI%360+360)%360;return{L:t,C:r,H:i}}function ge({L:t,C:n,H:e}){const r=e*Math.PI/180;return{L:t,a:n*Math.cos(r),b:n*Math.sin(r)}}function Ke(t){return Ve(Ue(je(Fe(t))))}function te({L:t,C:n,H:e}){return Ge(ze(be(ge({L:t,C:n,H:e}))))}function ye({L:t,C:n,H:e}){const r=ge({L:t,C:n,H:e}),a=be(r),i=.002;return a.R>=-i&&a.R<=1+i&&a.G>=-i&&a.G<=1+i&&a.B>=-i&&a.B<=1+i}function ve(t,n){let e=0,r=.4;for(let a=0;a<40;a++){const i=(e+r)/2;ye({L:t,C:i,H:n})?e=i:r=i}return e}function oe({L:t,C:n,H:e}){return ye({L:t,C:n,H:e})?{L:t,C:n,H:e}:{L:t,C:ve(t,e),H:e}}function Ye(t,n,e){return t<n?n:t>e?e:t}function Lt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:Fe,sRGBToHex:Ge,sRGBToLinearRGB:je,linearRGBToSRGB:ze,linearRGBToOKLab:Ue,oklabToLinearRGB:be,oklabToOKLCH:Ve,oklchToOKLab:ge,hexToOKLCH:Ke,oklchToHex:te,isInSRGBGamut:ye,maxChromaSRGB:ve,clampChroma:oe,clampFloat:Ye}))}const Se=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),_t=Object.freeze(["blue","red","orange","yellow","green","grey"]),Je=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),Ee=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function kt(t,n){const e=t||Ee,r=Math.max(0,Math.min(100,n))/100,a={};for(const i of Se){const d=Number(i),f=e[d]??e[String(d)]??.5;a[d]=f*r}return a}function $t(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const n=Ke(t.anchorHex),e=t.lTargets||Je,r=t.chromaProfile||Ee,a=t.overrides||{},i=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const d=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,f=n.L-d,p=[];for(const b of Se){if(Object.prototype.hasOwnProperty.call(a,b)){const[h,D,B]=a[b],I=oe({L:h,C:D,H:B});p.push({step:b,hex:te(I),L:I.L,C:I.C,H:I.H});continue}if(b===t.anchorStep){const h=oe(n);p.push({step:b,hex:te(h),L:h.L,C:h.C,H:h.H});continue}const T=Object.prototype.hasOwnProperty.call(e,b)?e[b]:.58,k=Ye(T+f,.06,.985);let _=i?i(b):n.H,R;if(t.isNeutral)R=t.neutralChroma,_=t.neutralHue;else{const h=ve(k,_),D=Object.prototype.hasOwnProperty.call(r,b)?r[b]:.5;R=h*D}const H=oe({L:k,C:R,H:_});p.push({step:b,hex:te(H),L:H.L,C:H.C,H:H.H})}return p}function Mt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:Se,FAMILY_NAMES:_t,DEFAULT_L_TARGETS:Je,DEFAULT_CHROMA_PROFILE:Ee,generateRamp:$t,scaleChromaProfile:kt}))}function Rt(t=globalThis){Lt(t),Mt(t)}const Ht=Object.freeze({"dp-type-ratio":"--type-scale-ratio","dp-text-base-min":"--text-base-min","dp-text-base-max":"--text-base-max","dp-lh-body":"--line-height-ratio-body","dp-lh-heading":"--line-height-ratio-heading","dp-font-body":"--font-body","dp-font-heading":"--font-heading","dp-line-height-min":"--line-height-min","dp-line-height-max":"--line-height-max"}),Xe="thm_default",Ot="design-panel:active-theme-id";function Pt(t){const n=t||(typeof window<"u"?window.localStorage:null);if(!n)return!0;let e=null;try{e=n.getItem(Ot)}catch{return!0}return e===null||e===Xe}function Dt(t,n,e,r){const a=typeof e=="number"?e:200,i=typeof localStorage<"u"?localStorage:null,d=typeof setTimeout<"u"?setTimeout:null,f=typeof clearTimeout<"u"?clearTimeout:null;let p=null,b=!1;function T(){if(b=!1,p&&(f(p),p=null),!!i)try{i.setItem(t,JSON.stringify(n()))}catch{}}function k(){if(!d){T();return}p&&f(p),b=!0,p=d(T,a)}return k.flush=function(){b&&T()},k}function It(t){!t||t.__dpTypographySignalMap||(t.__dpTypographySignalMap=Ht,t.__dpDefaultThemeId=Xe,t.__dpIsDefaultActive=function(){return Pt(t.localStorage)},t.__dpMakeDebouncedSaver=function(n,e,r){return Dt(n,e,r)})}typeof window<"u"&&It(window);(function(){const t=typeof window<"u"&&window.DesignPanelColor||{},n=t.FAMILY_NAMES?Array.from(t.FAMILY_NAMES):["blue","red","orange","yellow","green","grey"],e=t.STEPS?t.STEPS.map(String):["50","100","200","300","400","500","600","700","800","900","950"],r=["default","subtle","accent"],a=["light","dark"],i=["bg","fg","accent","muted","subtle"],d="design-panel:schemes",f="design-panel:ramps",p=300,b={blue:"#1f75ff",red:"#e10600",orange:"#ff4f00",yellow:"#ffa300",green:"#00b312",grey:"#808080"},T={};for(const o of n)T[o]=o.charAt(0).toUpperCase()+o.slice(1);const k=new RegExp(`^(?:${n.join("|")})-(?:${e.join("|")})$`);let _=!1,R=!1,H=!1;function h(o,s,l){const c=document.createElement(o);if(s)for(const u in s)u==="text"?c.textContent=s[u]:u in c&&typeof s[u]!="string"?c[u]=s[u]:c.setAttribute(u,s[u]);if(l)for(const u of l)u!=null&&c.appendChild(u);return c}function D(o){const s=T[o],l=`dp-ramp-settings-${o}`,c=h("span",{class:"dp-ramp-label",text:s}),u=h("span",{class:"dp-ramp-grid","aria-hidden":"true"});for(const V of e)u.appendChild(h("span",{class:"dp-ramp-swatch","data-step":V}));const v=h("button",{class:"dp-ramp-row",type:"button","aria-expanded":"false","aria-controls":l,"aria-label":`${s} ramp settings`},[c,u]),S=h("legend",{class:"dp-ramp-settings-legend",text:`${s} ramp settings`}),L=h("label",{for:`dp-anchor-${o}`,text:"Anchor color"}),F=h("input",{type:"color",id:`dp-anchor-${o}`}),X=h("label",{for:`dp-step-${o}`,text:"Anchor step"}),U=h("select",{id:`dp-step-${o}`});for(const V of e){const _e=h("option",{value:V,text:V});V==="500"&&(_e.selected=!0),U.appendChild(_e)}const mt=h("label",{for:`dp-chroma-${o}`,text:"Chroma intensity"}),bt=h("input",{type:"range",id:`dp-chroma-${o}`,min:"0",max:"100",value:"80"}),gt=h("fieldset",{class:"dp-ramp-settings",id:l,hidden:""},[S,L,F,X,U,mt,bt]);return h("div",{class:"dp-ramp-row-wrapper","data-family":o},[v,gt])}function B(o,s){const l=o.charAt(0).toUpperCase()+o.slice(1);return h("div",{class:`dp-scheme-preview ${s==="dark"?"dp-scheme-preview-dark dark-mode":"dp-scheme-preview-light"}`,"aria-hidden":"true"},[h("div",{class:`scheme-${o}`},[h("div",{class:"dp-scheme-heading",text:l}),h("div",{class:"dp-scheme-divider"}),h("div",{class:"dp-scheme-body",text:"Sample body text"}),h("div",{class:"dp-scheme-meta"},[h("span",{class:"dp-scheme-accent-text",text:"Accent"}),h("span",{class:"dp-scheme-subtle-swatch"}),h("span",{class:"dp-scheme-muted-text",text:"Muted"})])])])}function I(o,s,l){const c=`dp-scheme-${o}-${s}-${l}`;return h("div",{class:"dp-scheme-mapping-row"},[h("label",{for:c,text:l}),h("select",{id:c,"data-scheme":o,"data-mode":s,"data-token":l,"aria-busy":"true"},[h("option",{value:"",disabled:!0,selected:!0,text:"Loading…"})])])}function z(o,s){const l=E(o),c=s.charAt(0).toUpperCase()+s.slice(1),u=h("summary",{"aria-label":`${l} scheme, ${c} mode`},[B(o,s)]),v=h("legend",{class:"dp-scheme-mode-label",text:c}),S=h("fieldset",{class:"dp-scheme-mode-column"},[v]);for(const L of i)S.appendChild(I(o,s,L));return h("details",{class:"dp-scheme-card-mode","data-mode":s},[u,S])}function y(o){const s=E(o);return h("div",{class:"dp-scheme-card","data-scheme":o,role:"listitem","aria-label":`${s} scheme`},[z(o,"light"),z(o,"dark")])}function E(o){return o.charAt(0).toUpperCase()+o.slice(1)}function A(){const o=document.querySelector("[data-dp-ramp-matrix]");if(o&&!o.firstChild)for(const l of n)o.appendChild(D(l));const s=document.querySelector("[data-dp-scheme-list]");if(s&&!s.firstChild)for(const l of r)s.appendChild(y(l))}function w(){const o=document.documentElement,s=getComputedStyle(o),l={};for(const c of n){l[c]={};for(const u of e){const v=s.getPropertyValue(`--color-${c}-${u}`).trim();l[c][u]=v||null}}return l}function O(o){for(const s of n){const l=document.querySelector(`.dp-ramp-row-wrapper[data-family="${s}"]`);if(l)for(const c of e){const u=l.querySelector(`.dp-ramp-swatch[data-step="${c}"]`);if(!u)continue;const v=o[s][c];v?u.style.backgroundColor=v:_||(console.warn(`[design-panel-colors] Missing --color-${s}-${c} token; leaving swatch unpainted.`),_=!0)}}}function $(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o){for(;s.firstChild;)s.removeChild(s.firstChild);const l=document.createElement("option");l.value="",l.textContent="—",s.appendChild(l);for(const c of n){const u=T[c],v=document.createElement("optgroup");v.label=u;for(const S of e){const L=document.createElement("option");L.value=`${c}-${S}`,L.textContent=`${u} ${S}`,v.appendChild(L)}s.appendChild(v)}s.removeAttribute("aria-busy")}}function j(o){let s;try{s=localStorage.getItem(o)}catch{return{}}if(!s)return{};try{const l=JSON.parse(s);return l&&typeof l=="object"?l:{}}catch{return{}}}function se(o){return typeof o=="string"&&k.test(o)}function We(){const o=j(d);for(const s of r){const l=o[s];if(!(!l||typeof l!="object"))for(const c of a){const u=l[c];if(!(!u||typeof u!="object"))for(const v of i){const S=u[v];if(!se(S))continue;const L=document.getElementById(`dp-scheme-${s}-${c}-${v}`);L&&(L.value=S,re(s,c,v,S))}}}}function Ze(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o)s.addEventListener("change",Qe)}function Qe(o){const s=o.currentTarget,{scheme:l,mode:c,token:u}=s.dataset;if(!(!l||!c||!u)){if(s.value!==""&&!se(s.value)){console.warn(`[design-panel-colors] ignoring invalid scheme value "${s.value}"`);return}re(l,c,u,s.value),xe()}}function re(o,s,l,c){if(typeof window.__dpSchemeUpdate!="function"){R||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),R=!0);return}const u=`--color-${l}`,v=c?`var(--color-${c})`:"initial";if(o==="default"){const S=s==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(S,u,v,"utilities")}else{const S=s==="dark"?`.scheme-${o}.dark-mode`:`.scheme-${o}`;window.__dpSchemeUpdate(S,u,v,"tokens")}}function et(){const o={};for(const s of r){o[s]={light:{},dark:{}};for(const l of a)for(const c of i){const u=document.getElementById(`dp-scheme-${s}-${l}-${c}`);u&&u.value&&(o[s][l][c]=u.value)}}return o}const xe=window.__dpMakeDebouncedSaver(d,et,p);function tt(){const o=document.querySelectorAll(".dp-ramp-row");for(const s of o)s.addEventListener("click",()=>{const l=s.getAttribute("aria-controls");if(!l)return;const c=document.getElementById(l);if(!c)return;c.hasAttribute("hidden")?(c.removeAttribute("hidden"),s.setAttribute("aria-expanded","true")):(c.setAttribute("hidden",""),s.setAttribute("aria-expanded","false"))})}function ot(){const o=window.DesignPanelColor;return!o||typeof o.generateRamp!="function"?(H||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),H=!0),null):o}function nt(){const o=getComputedStyle(document.documentElement),s={};for(const l of n){const c=o.getPropertyValue(`--color-${l}-500`).trim(),u=b[l]||"#808080";s[l]={anchorHex:(c||u).toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return s}function we(){return j(f)}const st=/^#[0-9a-f]{6}$/,rt=new Set(e.map(o=>Number(o)));function at(o){if(!o||typeof o!="object")return{};const s={};if(typeof o.anchorHex=="string"){const l=o.anchorHex.toLowerCase();st.test(l)&&(s.anchorHex=l)}return Number.isFinite(o.anchorStep)&&rt.has(o.anchorStep)&&(s.anchorStep=o.anchorStep),Number.isFinite(o.chroma)&&o.chroma>=0&&o.chroma<=100&&(s.chroma=o.chroma),typeof o.isNeutral=="boolean"&&(s.isNeutral=o.isNeutral),Number.isFinite(o.neutralChroma)&&o.neutralChroma>=0&&o.neutralChroma<=.5&&(s.neutralChroma=o.neutralChroma),Number.isFinite(o.neutralHue)&&o.neutralHue>=0&&o.neutralHue<360&&(s.neutralHue=o.neutralHue),s}function it(){const o=nt(),s=we(),l={};for(const c of n)l[c]={...o[c],...at(s[c])};return l}function lt(){const o=we();return Object.keys(o).length>0}function ct(o,s){if(typeof o.scaleChromaProfile=="function")return o.scaleChromaProfile(o.DEFAULT_CHROMA_PROFILE,s);const l=Math.max(0,Math.min(100,s))/100,c=o.DEFAULT_CHROMA_PROFILE||{},u={};for(const v of e){const S=Number(v),L=c[S]??c[v]??.5;u[S]=L*l}return u}function J(o,s){const l=ot();if(!l)return;const c=s[o];if(!c)return;const u=ct(l,c.chroma);let v;try{v=l.generateRamp({anchorHex:c.anchorHex,anchorStep:c.anchorStep,chromaProfile:u,isNeutral:!!c.isNeutral,neutralChroma:c.neutralChroma,neutralHue:c.neutralHue})}catch(F){console.warn(`[design-panel-colors] generateRamp failed for ${o}: ${F.message}`);return}const S=document.querySelector(`.dp-ramp-row-wrapper[data-family="${o}"]`),L=document.documentElement;for(const F of v){const X=String(F.step);if(L.style.setProperty(`--color-${o}-${X}`,F.hex),S){const U=S.querySelector(`.dp-ramp-swatch[data-step="${X}"]`);U&&(U.style.backgroundColor=F.hex)}}}function dt(o){for(const s of n)J(s,o)}function Ce(o,s){o.setAttribute("aria-valuetext",`Chroma ${s} percent`)}function ut(o){const s=window.__dpMakeDebouncedSaver(f,()=>o,p);for(const l of n){const c=document.getElementById(`dp-anchor-${l}`),u=document.getElementById(`dp-step-${l}`),v=document.getElementById(`dp-chroma-${l}`);c&&o[l].anchorHex&&(c.value=o[l].anchorHex),u&&(u.value=String(o[l].anchorStep)),v&&(v.value=String(o[l].chroma),Ce(v,o[l].chroma)),c&&c.addEventListener("input",()=>{o[l].anchorHex=(c.value||"").toLowerCase(),J(l,o),s()}),u&&u.addEventListener("change",()=>{const S=parseInt(u.value,10);Number.isFinite(S)&&(o[l].anchorStep=S,J(l,o),s())}),v&&v.addEventListener("input",()=>{const S=parseInt(v.value,10);Number.isFinite(S)&&(o[l].chroma=S,Ce(v,S),J(l,o),s())})}}const pt=5e3;function Ae(){return document.querySelector("[data-dp-ramp-matrix]")||document.querySelector("[data-dp-scheme-list]")}function ft(){return Ae()?Promise.resolve(!0):new Promise(o=>{const s=new MutationObserver(()=>{Ae()&&(c(),o(!0))}),l=setTimeout(()=>{c(),o(!1)},pt);function c(){s.disconnect(),clearTimeout(l)}s.observe(document.body,{childList:!0,subtree:!0})})}function Te(){ft().then(o=>{o&&ae()})}function Le(){if(!document.querySelector("[data-dp-scheme-list]"))return;We();const s=j(d);for(const l of r){const c=s&&s[l]||{};for(const u of a){const v=c[u]||{};for(const S of i){const L=document.getElementById(`dp-scheme-${l}-${u}-${S}`);if(!L)continue;se(v[S])||(L.value="",re(l,u,S,""))}}}ht()}function ht(){const o=window.__dpIsDefaultActive();document.querySelectorAll('[slot="editor"][data-tab="colors"] :is(input, button, select)').forEach(s=>{s.disabled=o})}function ae(){if(ae.done)return;ae.done=!0,A();const o=w();O(o),$(),Ze(),tt();const s=it();lt()&&dt(s),ut(s),window.__dpColorsSave||(document.addEventListener("design-panel:reactivate",Le),window.__dpColorsSave={flush:xe.flush}),Le()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Te,{once:!0}):Te()})();(function(){const t="design-panel:typography",r=window.__dpTypographySignalMap,a=Object.freeze({"1.125":"Minor second","1.2":"Minor third","1.25":"Major third","1.333":"Perfect fourth","1.414":"Augmented fourth","1.5":"Perfect fifth","1.618":"Golden ratio"});function i(y){return y==="dp-font-body"||y==="dp-font-heading"}function d(y){const E=r[y.id],A=y.value;if(i(y.id)){const w=A.trim();w?document.documentElement.style.setProperty(E,w):document.documentElement.style.removeProperty(E)}else document.documentElement.style.setProperty(E,String(A))}function f(y){if(y.type==="range")if(y.id==="dp-type-ratio"){const E=a[y.value]||"";y.setAttribute("aria-valuetext",E?`Scale ratio ${y.value}, ${E}`:`Scale ratio ${y.value}`)}else{const E=y.id==="dp-lh-body"?"Body":"Heading";y.setAttribute("aria-valuetext",`${E} line height ${y.value}`)}}function p(){const y=document.getElementById("dp-type-ratio");if(!y)return;const E=Number(y.value),A=document.querySelectorAll("[data-preset-ratio]");for(const w of A){const O=Number(w.dataset.presetRatio),$=Math.abs(E-O)<.001;w.setAttribute("aria-pressed",$?"true":"false")}}function b(){const y={};for(const E of Object.keys(r)){const A=document.getElementById(E);A&&(y[E]=A.value)}return y}const T=window.__dpMakeDebouncedSaver(t,b,200);function k(){try{const y=localStorage.getItem(t);if(!y)return null;const E=JSON.parse(y);if(!E||typeof E!="object"||Array.isArray(E))return null;const A={};for(const w of Object.keys(r)){const O=E[w];typeof O=="string"&&(A[w]=O)}return A}catch{return null}}const _=5e3;function R(){return!!document.querySelector('[slot="editor"][data-tab="typography"] #dp-type-ratio')}function H(){return R()?Promise.resolve(!0):new Promise(y=>{const E=new MutationObserver(()=>{R()&&(w(),y(!0))}),A=setTimeout(()=>{w(),y(!1)},_);function w(){E.disconnect(),clearTimeout(A)}E.observe(document.body,{childList:!0,subtree:!0})})}let h=!1;function D(){if(!document.querySelector('[slot="editor"][data-tab="typography"]'))return;const E=k()||{},A=getComputedStyle(document.documentElement),w=window.__dpIsDefaultActive();for(const O of Object.keys(r)){const $=document.getElementById(O);if(!$)continue;const j=E[O];j!=null?($.value=j,d($)):w?($.value="",document.documentElement.style.removeProperty(r[O])):i(O)?($.value="",d($)):($.value=A.getPropertyValue(r[O]).trim(),d($)),f($)}B(),p()}function B(){const y=window.__dpIsDefaultActive();document.querySelectorAll('[slot="editor"][data-tab="typography"] :is(input, button, select)').forEach(E=>{E.disabled=y})}function I(){if(h||!document.querySelector('[slot="editor"][data-tab="typography"]'))return;h=!0;for(const A of Object.keys(r)){const w=document.getElementById(A);w&&w.addEventListener("input",()=>{d(w),f(w),w.id==="dp-type-ratio"&&p(),T()})}const E=document.querySelectorAll("[data-preset-ratio]");for(const A of E)A.addEventListener("click",()=>{const w=document.getElementById("dp-type-ratio");w&&(w.value=A.dataset.presetRatio,w.dispatchEvent(new Event("input",{bubbles:!0})))});window.__dpTypographySave||(document.addEventListener("design-panel:reactivate",D),window.__dpTypographySave={flush:T.flush}),D()}function z(){H().then(y=>{y&&I()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",z,{once:!0}):z()})();Rt();function Nt(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function Bt(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function qt(){document.querySelectorAll(".grid").forEach(t=>{const n=getComputedStyle(t),e=n.gridTemplateColumns.split(" ").filter(a=>a!=="none"&&a.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const r=n.columnGap||n.rowGap||n.gap;r&&r!=="normal"&&t.style.setProperty("--grid-gap",r)})}function Ft(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&qt()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let n;window.addEventListener("resize",()=>{clearTimeout(n),n=setTimeout(t,100)}),t()}Nt(()=>{Bt(),Ft()});
