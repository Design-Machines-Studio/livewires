var yt=Object.defineProperty;var Re=t=>{throw TypeError(t)};var vt=(t,n,e)=>n in t?yt(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var Me=(t,n,e)=>vt(t,typeof n!="symbol"?n+"":n,e),ie=(t,n,e)=>n.has(t)||Re("Cannot "+e);var m=(t,n,e)=>(ie(t,n,"read from private field"),e?e.call(t):n.get(t)),j=(t,n,e)=>n.has(t)?Re("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,e),q=(t,n,e,a)=>(ie(t,n,"write to private field"),a?a.call(t,e):n.set(t,e),e),A=(t,n,e)=>(ie(t,n,"access private method"),e);class St extends HTMLElement{async connectedCallback(){const n=this.getAttribute("src");if(!n){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const a=await e.text(),r=document.createElement("template");r.innerHTML=a;const l=r.content.cloneNode(!0);this.innerHTML="",this.appendChild(l),this.querySelectorAll("script").forEach(p=>{const f=document.createElement("script");Array.from(p.attributes).forEach(g=>{f.setAttribute(g.name,g.value)}),f.textContent=p.textContent,p.parentNode.replaceChild(f,p)})}catch(e){console.error(`HtmlInclude: failed to load ${n}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",St);class xt extends HTMLElement{connectedCallback(){const n=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const a=e.textContent.trim();a&&n.push(a)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&n.push(e.outerHTML);this._triggerContent=n.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var n;(n=this._abortController)==null||n.abort()}escapeHtml(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}sanitizeHref(n){return n?/^(javascript|data|vbscript):/i.test(n)?(console.warn("PopupDialog: Blocked potentially dangerous href:",n),""):n:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var n;(n=this.querySelector("dialog"))==null||n.showModal()}close(){var n;(n=this.querySelector("dialog"))==null||n.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const n=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),a=n?n.innerHTML:this.escapeHtml(this.body),r=this.escapeHtml(this.title);let l="";if(e)l=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const f=`button button--${this.escapeHtml(this.confirmVariant)}`,g=[];this.cancelLabel&&g.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&g.push(this.confirmHref?`<a href="${this.confirmHref}" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),l=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${g.join("")}</footer>`}const u=r?`<header class="cluster cluster-between cluster-nowrap">
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
    `}setupEvents(){const n=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),a=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:r}=this._abortController;n.addEventListener("click",l=>{l.preventDefault(),e.showModal()},{signal:r}),a.addEventListener("click",()=>{e.close()},{signal:r}),e.addEventListener("click",l=>{const u=l.target.closest("[data-action]");if(u){const p=u.dataset.action;p==="cancel"||p==="close"?(l.preventDefault(),e.close()):p==="confirm"&&u.tagName!=="A"&&(l.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}l.target===e&&e.close()},{signal:r})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",xt);const _e=`
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
`;let se=null;const He=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";He&&(se=new CSSStyleSheet,se.replaceSync(_e));const Z=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],Q={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},Et={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},Oe="design-panel:state",wt=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function Ct(){return Z.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function At(){return Object.entries(Q).map(([t,n])=>{let e;if(n.type==="number")e=`<input type="number" data-setting="${t}" min="${n.min}" max="${n.max}" />`;else{const a=n.options.map(r=>`<option value="${r.value}">${r.label}</option>`).join("");e=`<select data-setting="${t}">${a}</select>`}return`
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
`;var C,B,V,M,I,y,pe,Pe,ee,he,te,me,fe,Ne,De,Be,qe,Fe,U;class Ie extends HTMLElement{constructor(){super();j(this,y);j(this,C,{...Et});j(this,B,null);j(this,V,!1);j(this,M,null);j(this,I,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),He&&se)this.shadowRoot.adoptedStyleSheets=[se];else{const e=document.createElement("style");e.textContent=_e,this.shadowRoot.appendChild(e)}}connectedCallback(){q(this,M,new AbortController),A(this,y,Fe).call(this),A(this,y,pe).call(this),A(this,y,Pe).call(this),A(this,y,te).call(this),A(this,y,De).call(this),this.inert=!this.hasAttribute("open"),A(this,y,Be).call(this),A(this,y,qe).call(this)}disconnectedCallback(){m(this,M)&&(m(this,M).abort(),q(this,M,null)),m(this,B)&&(clearTimeout(m(this,B)),q(this,B,null))}attributeChangedCallback(e,a,r){a!==r&&(e==="open"?(m(this,C).open=r!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(m(this,C).activeTab=r||"guides",m(this,V)&&A(this,y,te).call(this)):e==="overlay-target"&&A(this,y,pe).call(this))}}C=new WeakMap,B=new WeakMap,V=new WeakMap,M=new WeakMap,I=new WeakMap,y=new WeakSet,pe=function(){const e=this.getAttribute("overlay-target")||"body";try{q(this,I,document.querySelector(e)||document.body)}catch{q(this,I,document.body)}},Pe=function(){const e=document.createRange().createContextualFragment(Tt);this.shadowRoot.appendChild(e),q(this,V,!0);const a=m(this,M)?m(this,M).signal:void 0,r=a?{signal:a}:void 0,l=this.shadowRoot.querySelector(".close");l&&l.addEventListener("click",()=>A(this,y,ee).call(this,!1),r);const u=this.shadowRoot.querySelector(".trigger");u&&u.addEventListener("click",()=>A(this,y,ee).call(this,!0),r),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(p=>{p.addEventListener("click",()=>A(this,y,he).call(this,p.dataset.tab),r)}),this.shadowRoot.querySelectorAll(".tool").forEach(p=>{p.addEventListener("click",()=>A(this,y,me).call(this,p.dataset.tool),r)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(p=>{const f=p.dataset.setting,g=Q[f];if(!g)return;const k=g.type==="number"?"input":"change";p.addEventListener(k,O=>{const $=g.type==="number"?Number(O.target.value):O.target.value;A(this,y,fe).call(this,f,$)},r)})},ee=function(e){m(this,C).open=!!e,m(this,C).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",m(this,C).open),A(this,y,U).call(this)},he=function(e){e&&(m(this,C).activeTab=e,this.setAttribute("active-tab",e),A(this,y,te).call(this),A(this,y,U).call(this))},te=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const a=e.dataset.tab===m(this,C).activeTab;e.setAttribute("aria-selected",a?"true":"false"),e.toggleAttribute("data-active",a)})},me=function(e){const a=Z.find(l=>l.name===e);if(!a)return;m(this,C)[e]=!m(this,C)[e],m(this,I)&&m(this,I).classList.toggle(a.className,m(this,C)[e]);const r=this.shadowRoot.querySelector(`[data-tool="${e}"]`);r&&(r.setAttribute("aria-pressed",m(this,C)[e]?"true":"false"),r.toggleAttribute("data-active",m(this,C)[e])),A(this,y,U).call(this)},fe=function(e,a){m(this,C)[e]=a;const r=Q[e];if(r){if(r.target==="cssvar")document.documentElement.style.setProperty(r.cssvar,String(a));else if(r.target==="overlayattr")m(this,I)&&m(this,I).setAttribute(r.attr,String(a));else if(r.target==="overlay-data-margin-mode"){const l=document.getElementById("dev-column-overlay"),u=document.getElementById("dev-margin-overlay");l&&l.setAttribute("data-margin-mode",String(a)),u&&u.setAttribute("data-margin-mode",String(a))}A(this,y,U).call(this)}},Ne=function(e){const a=this.shadowRoot.querySelector(`[data-setting="${e}"]`);a&&a.value!==String(m(this,C)[e])&&(a.value=String(m(this,C)[e]))},De=function(){for(const e of Z){const a=!!m(this,C)[e.name];m(this,I)&&m(this,I).classList.toggle(e.className,a);const r=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);r&&(r.setAttribute("aria-pressed",a?"true":"false"),r.toggleAttribute("data-active",a))}for(const e of Object.keys(Q))m(this,C)[e]!==void 0&&(A(this,y,fe).call(this,e,m(this,C)[e]),A(this,y,Ne).call(this,e));document.body.toggleAttribute("data-panel-open",!!m(this,C).open)},Be=function(){const e=m(this,M)?m(this,M).signal:void 0,a=e?{signal:e}:void 0,r=l=>{const u=l.composedPath(),p=u&&u[0];if(p&&p.matches&&p.matches("input,textarea,[contenteditable]")||l.metaKey||l.ctrlKey||l.altKey)return;const f=(l.key||"").toLowerCase();if(!f)return;if(f==="t"){A(this,y,ee).call(this,!m(this,C).open),l.preventDefault();return}const g=Z.find(k=>k.key===f);g&&(A(this,y,me).call(this,g.name),l.preventDefault())};window.addEventListener("keydown",r,a)},qe=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const a=m(this,M)?m(this,M).signal:void 0,r=a?{signal:a}:void 0,l=()=>{const u=e.assignedElements(),p=new Set(u.map(f=>f.getAttribute("data-tab")).filter(f=>!!f));for(const f of this.shadowRoot.querySelectorAll('[role="tab"]')){const g=f.dataset.tab;g!=="guides"&&f.classList.toggle("hidden",!p.has(g))}m(this,C).activeTab!=="guides"&&!p.has(m(this,C).activeTab)&&A(this,y,he).call(this,"guides")};e.addEventListener("slotchange",l,r),l()},Fe=function(){try{const e=localStorage.getItem(Oe);if(e){const a=JSON.parse(e);a&&typeof a=="object"&&Object.assign(m(this,C),a)}}catch{}m(this,C).open?this.setAttribute("open",""):this.removeAttribute("open"),m(this,C).activeTab&&this.setAttribute("active-tab",m(this,C).activeTab)},U=function(){m(this,B)&&clearTimeout(m(this,B)),q(this,B,setTimeout(()=>{try{localStorage.setItem(Oe,JSON.stringify(m(this,C)))}catch{}q(this,B,null)},200))},Me(Ie,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",Ie);(function(){const t="design-panel-runtime-schemes";function n(){let r=document.getElementById(t);r||(r=document.createElement("style"),r.id=t,document.head.appendChild(r),r.sheet.insertRule("@layer tokens {}",0),r.sheet.insertRule("@layer utilities {}",1));const l={};for(let u=0;u<r.sheet.cssRules.length;u++){const p=r.sheet.cssRules[u];p.name&&(l[p.name]=p)}return l}let e=null;function a(){return e||(e=n()),e}window.__dpSchemeUpdate=function(r,l,u,p){const f=a()[p||"tokens"];if(f){for(let g=0;g<f.cssRules.length;g++)if(f.cssRules[g].selectorText===r){f.cssRules[g].style.setProperty(l,u);return}f.insertRule(r+"{"+l+":"+u+"}",f.cssRules.length)}},window.__dpSchemeReset=function(){const r=a();for(const l in r){const u=r[l];for(;u.cssRules.length>0;)u.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(l=>l.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(l=>{for(let u=0;u<l.options.length;u++)if(l.options[u].defaultSelected){l.selectedIndex=u;break}})},window.__dpSchemeSerialize=function(){const r=[];return document.querySelectorAll(".dp-scheme-card").forEach(l=>{const u=l.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!u)return;const p=u.className.replace(/^scheme-/,""),f=l.querySelectorAll(".dp-scheme-mode-column"),g=["light","dark"];f.forEach((k,O)=>{const $=g[O];$&&k.querySelectorAll(".dp-scheme-mapping-row").forEach(_=>{const R=_.querySelector("label"),h=_.querySelector("select");if(!R||!h)return;const P=R.textContent.trim(),N=h.value,D=h.getAttribute("data-library-default")||"";N&&N!==D&&r.push({scheme:p,token:P,mode:$,value:N})})})}),r}})();function je(t){const n=String(t).replace(/^#/,"");if(n.length!==6||/[^0-9a-fA-F]/.test(n))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(n,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function le(t){if(!Number.isFinite(t))return 0;const n=Math.round(t*255);return n<0?0:n>255?255:n}function Ge({R:t,G:n,B:e}){const a=le(t),r=le(n),l=le(e);return"#"+a.toString(16).padStart(2,"0")+r.toString(16).padStart(2,"0")+l.toString(16).padStart(2,"0")}function ce(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function de(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function ze({R:t,G:n,B:e}){return{R:ce(t),G:ce(n),B:ce(e)}}function Ue({R:t,G:n,B:e}){return{R:de(t),G:de(n),B:de(e)}}function ue(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function Ve({R:t,G:n,B:e}){let a=.4122214708*t+.5363325363*n+.0514459929*e,r=.2119034982*t+.6806995451*n+.1073969566*e,l=.0883024619*t+.2817188376*n+.6299787005*e;a=ue(a),r=ue(r),l=ue(l);const u=.2104542553*a+.793617785*r-.0040720468*l,p=1.9779984951*a-2.428592205*r+.4505937099*l,f=.0259040371*a+.7827717662*r-.808675766*l;return{L:u,a:p,b:f}}function be({L:t,a:n,b:e}){let a=t+.3963377774*n+.2158037573*e,r=t-.1055613458*n-.0638541728*e,l=t-.0894841775*n-1.291485548*e;a=a*a*a,r=r*r*r,l=l*l*l;const u=4.0767416621*a-3.3077115913*r+.2309699292*l,p=-1.2684380046*a+2.6097574011*r-.3413193965*l,f=-.0041960863*a-.7034186147*r+1.707614701*l;return{R:u,G:p,B:f}}function Ke({L:t,a:n,b:e}){const a=Math.sqrt(n*n+e*e),l=(Math.atan2(e,n)*180/Math.PI%360+360)%360;return{L:t,C:a,H:l}}function ge({L:t,C:n,H:e}){const a=e*Math.PI/180;return{L:t,a:n*Math.cos(a),b:n*Math.sin(a)}}function Ye(t){return Ke(Ve(ze(je(t))))}function oe({L:t,C:n,H:e}){return Ge(Ue(be(ge({L:t,C:n,H:e}))))}function ye({L:t,C:n,H:e}){const a=ge({L:t,C:n,H:e}),r=be(a),l=.002;return r.R>=-l&&r.R<=1+l&&r.G>=-l&&r.G<=1+l&&r.B>=-l&&r.B<=1+l}function ve(t,n){let e=0,a=.4;for(let r=0;r<40;r++){const l=(e+a)/2;ye({L:t,C:l,H:n})?e=l:a=l}return e}function ne({L:t,C:n,H:e}){return ye({L:t,C:n,H:e})?{L:t,C:n,H:e}:{L:t,C:ve(t,e),H:e}}function Je(t,n,e){return t<n?n:t>e?e:t}function Lt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:je,sRGBToHex:Ge,sRGBToLinearRGB:ze,linearRGBToSRGB:Ue,linearRGBToOKLab:Ve,oklabToLinearRGB:be,oklabToOKLCH:Ke,oklchToOKLab:ge,hexToOKLCH:Ye,oklchToHex:oe,isInSRGBGamut:ye,maxChromaSRGB:ve,clampChroma:ne,clampFloat:Je}))}const Se=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),kt=Object.freeze(["blue","red","orange","yellow","green","grey"]),Xe=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),xe=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function $t(t,n){const e=t||xe,a=Math.max(0,Math.min(100,n))/100,r={};for(const l of Se){const u=Number(l),p=e[u]??e[String(u)]??.5;r[u]=p*a}return r}function Rt(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const n=Ye(t.anchorHex),e=t.lTargets||Xe,a=t.chromaProfile||xe,r=t.overrides||{},l=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const u=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,p=n.L-u,f=[];for(const g of Se){if(Object.prototype.hasOwnProperty.call(r,g)){const[h,P,N]=r[g],D=ne({L:h,C:P,H:N});f.push({step:g,hex:oe(D),L:D.L,C:D.C,H:D.H});continue}if(g===t.anchorStep){const h=ne(n);f.push({step:g,hex:oe(h),L:h.L,C:h.C,H:h.H});continue}const k=Object.prototype.hasOwnProperty.call(e,g)?e[g]:.58,O=Je(k+p,.06,.985);let $=l?l(g):n.H,_;if(t.isNeutral)_=t.neutralChroma,$=t.neutralHue;else{const h=ve(O,$),P=Object.prototype.hasOwnProperty.call(a,g)?a[g]:.5;_=h*P}const R=ne({L:O,C:_,H:$});f.push({step:g,hex:oe(R),L:R.L,C:R.C,H:R.H})}return f}function Mt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:Se,FAMILY_NAMES:kt,DEFAULT_L_TARGETS:Xe,DEFAULT_CHROMA_PROFILE:xe,generateRamp:Rt,scaleChromaProfile:$t}))}function Ot(t=globalThis){Lt(t),Mt(t)}(function(){const t=typeof window<"u"&&window.DesignPanelColor||{},n=t.FAMILY_NAMES?Array.from(t.FAMILY_NAMES):["blue","red","orange","yellow","green","grey"],e=t.STEPS?t.STEPS.map(String):["50","100","200","300","400","500","600","700","800","900","950"],a=["default","subtle","accent"],r=["light","dark"],l=["bg","fg","accent","muted","subtle"],u="design-panel:schemes",p="design-panel:ramps",f=300,g={blue:"#1f75ff",red:"#e10600",orange:"#ff4f00",yellow:"#ffa300",green:"#00b312",grey:"#808080"},k={};for(const o of n)k[o]=o.charAt(0).toUpperCase()+o.slice(1);const O=new RegExp(`^(?:${n.join("|")})-(?:${e.join("|")})$`);let $=!1,_=!1,R=!1;function h(o,s,i){const c=document.createElement(o);if(s)for(const d in s)d==="text"?c.textContent=s[d]:d in c&&typeof s[d]!="string"?c[d]=s[d]:c.setAttribute(d,s[d]);if(i)for(const d of i)d!=null&&c.appendChild(d);return c}function P(o){const s=k[o],i=`dp-ramp-settings-${o}`,c=h("span",{class:"dp-ramp-label",text:s}),d=h("span",{class:"dp-ramp-grid","aria-hidden":"true"});for(const z of e)d.appendChild(h("span",{class:"dp-ramp-swatch","data-step":z}));const v=h("button",{class:"dp-ramp-row",type:"button","aria-expanded":"false","aria-controls":i,"aria-label":`${s} ramp settings`},[c,d]),x=h("legend",{class:"dp-ramp-settings-legend",text:`${s} ramp settings`}),L=h("label",{for:`dp-anchor-${o}`,text:"Anchor color"}),F=h("input",{type:"color",id:`dp-anchor-${o}`}),W=h("label",{for:`dp-step-${o}`,text:"Anchor step"}),G=h("select",{id:`dp-step-${o}`});for(const z of e){const $e=h("option",{value:z,text:z});z==="500"&&($e.selected=!0),G.appendChild($e)}const ft=h("label",{for:`dp-chroma-${o}`,text:"Chroma intensity"}),bt=h("input",{type:"range",id:`dp-chroma-${o}`,min:"0",max:"100",value:"80"}),gt=h("fieldset",{class:"dp-ramp-settings",id:i,hidden:""},[x,L,F,W,G,ft,bt]);return h("div",{class:"dp-ramp-row-wrapper","data-family":o},[v,gt])}function N(o,s){const i=o.charAt(0).toUpperCase()+o.slice(1);return h("div",{class:`dp-scheme-preview ${s==="dark"?"dp-scheme-preview-dark dark-mode":"dp-scheme-preview-light"}`,"aria-hidden":"true"},[h("div",{class:`scheme-${o}`},[h("div",{class:"dp-scheme-heading",text:i}),h("div",{class:"dp-scheme-divider"}),h("div",{class:"dp-scheme-body",text:"Sample body text"}),h("div",{class:"dp-scheme-meta"},[h("span",{class:"dp-scheme-accent-text",text:"Accent"}),h("span",{class:"dp-scheme-subtle-swatch"}),h("span",{class:"dp-scheme-muted-text",text:"Muted"})])])])}function D(o,s,i){const c=`dp-scheme-${o}-${s}-${i}`;return h("div",{class:"dp-scheme-mapping-row"},[h("label",{for:c,text:i}),h("select",{id:c,"data-scheme":o,"data-mode":s,"data-token":i,"aria-busy":"true"},[h("option",{value:"",disabled:!0,selected:!0,text:"Loading…"})])])}function K(o,s){const i=b(o),c=s.charAt(0).toUpperCase()+s.slice(1),d=h("summary",{"aria-label":`${i} scheme, ${c} mode`},[N(o,s)]),v=h("legend",{class:"dp-scheme-mode-label",text:c}),x=h("fieldset",{class:"dp-scheme-mode-column"},[v]);for(const L of l)x.appendChild(D(o,s,L));return h("details",{class:"dp-scheme-card-mode","data-mode":s},[d,x])}function Y(o){const s=b(o);return h("div",{class:"dp-scheme-card","data-scheme":o,role:"listitem","aria-label":`${s} scheme`},[K(o,"light"),K(o,"dark")])}function b(o){return o.charAt(0).toUpperCase()+o.slice(1)}function E(){const o=document.querySelector("[data-dp-ramp-matrix]");if(o&&!o.firstChild)for(const i of n)o.appendChild(P(i));const s=document.querySelector("[data-dp-scheme-list]");if(s&&!s.firstChild)for(const i of a)s.appendChild(Y(i))}function w(){const o=document.documentElement,s=getComputedStyle(o),i={};for(const c of n){i[c]={};for(const d of e){const v=s.getPropertyValue(`--color-${c}-${d}`).trim();i[c][d]=v||null}}return i}function S(o){for(const s of n){const i=document.querySelector(`.dp-ramp-row-wrapper[data-family="${s}"]`);if(i)for(const c of e){const d=i.querySelector(`.dp-ramp-swatch[data-step="${c}"]`);if(!d)continue;const v=o[s][c];v?d.style.backgroundColor=v:$||(console.warn(`[design-panel-colors] Missing --color-${s}-${c} token; leaving swatch unpainted.`),$=!0)}}}function T(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o){for(;s.firstChild;)s.removeChild(s.firstChild);const i=document.createElement("option");i.value="",i.textContent="—",s.appendChild(i);for(const c of n){const d=k[c],v=document.createElement("optgroup");v.label=d;for(const x of e){const L=document.createElement("option");L.value=`${c}-${x}`,L.textContent=`${d} ${x}`,v.appendChild(L)}s.appendChild(v)}s.removeAttribute("aria-busy")}}function H(o){let s;try{s=localStorage.getItem(o)}catch{return{}}if(!s)return{};try{const i=JSON.parse(s);return i&&typeof i=="object"?i:{}}catch{return{}}}function J(o){return typeof o=="string"&&O.test(o)}function We(){const o=H(u);for(const s of a){const i=o[s];if(!(!i||typeof i!="object"))for(const c of r){const d=i[c];if(!(!d||typeof d!="object"))for(const v of l){const x=d[v];if(!J(x))continue;const L=document.getElementById(`dp-scheme-${s}-${c}-${v}`);L&&(L.value=x,re(s,c,v,x))}}}}function Ze(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o)s.addEventListener("change",Qe)}function Qe(o){const s=o.currentTarget,{scheme:i,mode:c,token:d}=s.dataset;if(!(!i||!c||!d)){if(s.value!==""&&!J(s.value)){console.warn(`[design-panel-colors] ignoring invalid scheme value "${s.value}"`);return}re(i,c,d,s.value),we()}}function re(o,s,i,c){if(typeof window.__dpSchemeUpdate!="function"){_||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),_=!0);return}const d=`--color-${i}`,v=c?`var(--color-${c})`:"initial";if(o==="default"){const x=s==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(x,d,v,"utilities")}else{const x=s==="dark"?`.scheme-${o}.dark-mode`:`.scheme-${o}`;window.__dpSchemeUpdate(x,d,v,"tokens")}}function Ee(o,s){let i=null,c=null;const d=()=>{i&&(clearTimeout(i),i=null),c=null;try{localStorage.setItem(o,JSON.stringify(s()))}catch{}},v=function(){i&&clearTimeout(i),c=d,i=setTimeout(()=>{i=null,c=null;try{localStorage.setItem(o,JSON.stringify(s()))}catch{}},f)};return v.flush=function(){c&&d()},v}function et(){const o={};for(const s of a){o[s]={light:{},dark:{}};for(const i of r)for(const c of l){const d=document.getElementById(`dp-scheme-${s}-${i}-${c}`);d&&d.value&&(o[s][i][c]=d.value)}}return o}const we=Ee(u,et);function tt(){const o=document.querySelectorAll(".dp-ramp-row");for(const s of o)s.addEventListener("click",()=>{const i=s.getAttribute("aria-controls");if(!i)return;const c=document.getElementById(i);if(!c)return;c.hasAttribute("hidden")?(c.removeAttribute("hidden"),s.setAttribute("aria-expanded","true")):(c.setAttribute("hidden",""),s.setAttribute("aria-expanded","false"))})}function ot(){const o=window.DesignPanelColor;return!o||typeof o.generateRamp!="function"?(R||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),R=!0),null):o}function nt(){const o=getComputedStyle(document.documentElement),s={};for(const i of n){const c=o.getPropertyValue(`--color-${i}-500`).trim(),d=g[i]||"#808080";s[i]={anchorHex:(c||d).toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return s}function Ce(){return H(p)}const st=/^#[0-9a-f]{6}$/,rt=new Set(e.map(o=>Number(o)));function at(o){if(!o||typeof o!="object")return{};const s={};if(typeof o.anchorHex=="string"){const i=o.anchorHex.toLowerCase();st.test(i)&&(s.anchorHex=i)}return Number.isFinite(o.anchorStep)&&rt.has(o.anchorStep)&&(s.anchorStep=o.anchorStep),Number.isFinite(o.chroma)&&o.chroma>=0&&o.chroma<=100&&(s.chroma=o.chroma),typeof o.isNeutral=="boolean"&&(s.isNeutral=o.isNeutral),Number.isFinite(o.neutralChroma)&&o.neutralChroma>=0&&o.neutralChroma<=.5&&(s.neutralChroma=o.neutralChroma),Number.isFinite(o.neutralHue)&&o.neutralHue>=0&&o.neutralHue<360&&(s.neutralHue=o.neutralHue),s}function it(){const o=nt(),s=Ce(),i={};for(const c of n)i[c]={...o[c],...at(s[c])};return i}function lt(){const o=Ce();return Object.keys(o).length>0}function ct(o,s){if(typeof o.scaleChromaProfile=="function")return o.scaleChromaProfile(o.DEFAULT_CHROMA_PROFILE,s);const i=Math.max(0,Math.min(100,s))/100,c=o.DEFAULT_CHROMA_PROFILE||{},d={};for(const v of e){const x=Number(v),L=c[x]??c[v]??.5;d[x]=L*i}return d}function X(o,s){const i=ot();if(!i)return;const c=s[o];if(!c)return;const d=ct(i,c.chroma);let v;try{v=i.generateRamp({anchorHex:c.anchorHex,anchorStep:c.anchorStep,chromaProfile:d,isNeutral:!!c.isNeutral,neutralChroma:c.neutralChroma,neutralHue:c.neutralHue})}catch(F){console.warn(`[design-panel-colors] generateRamp failed for ${o}: ${F.message}`);return}const x=document.querySelector(`.dp-ramp-row-wrapper[data-family="${o}"]`),L=document.documentElement;for(const F of v){const W=String(F.step);if(L.style.setProperty(`--color-${o}-${W}`,F.hex),x){const G=x.querySelector(`.dp-ramp-swatch[data-step="${W}"]`);G&&(G.style.backgroundColor=F.hex)}}}function dt(o){for(const s of n)X(s,o)}function Ae(o,s){o.setAttribute("aria-valuetext",`Chroma ${s} percent`)}function ut(o){const s=Ee(p,()=>o);for(const i of n){const c=document.getElementById(`dp-anchor-${i}`),d=document.getElementById(`dp-step-${i}`),v=document.getElementById(`dp-chroma-${i}`);c&&o[i].anchorHex&&(c.value=o[i].anchorHex),d&&(d.value=String(o[i].anchorStep)),v&&(v.value=String(o[i].chroma),Ae(v,o[i].chroma)),c&&c.addEventListener("input",()=>{o[i].anchorHex=(c.value||"").toLowerCase(),X(i,o),s()}),d&&d.addEventListener("change",()=>{const x=parseInt(d.value,10);Number.isFinite(x)&&(o[i].anchorStep=x,X(i,o),s())}),v&&v.addEventListener("input",()=>{const x=parseInt(v.value,10);Number.isFinite(x)&&(o[i].chroma=x,Ae(v,x),X(i,o),s())})}}const pt=5e3;function Te(){return document.querySelector("[data-dp-ramp-matrix]")||document.querySelector("[data-dp-scheme-list]")}function ht(){return Te()?Promise.resolve(!0):new Promise(o=>{const s=new MutationObserver(()=>{Te()&&(c(),o(!0))}),i=setTimeout(()=>{c(),o(!1)},pt);function c(){s.disconnect(),clearTimeout(i)}s.observe(document.body,{childList:!0,subtree:!0})})}function Le(){ht().then(o=>{o&&ae()})}function ke(){if(!document.querySelector("[data-dp-scheme-list]"))return;We();const s=H(u);for(const i of a){const c=s&&s[i]||{};for(const d of r){const v=c[d]||{};for(const x of l){const L=document.getElementById(`dp-scheme-${i}-${d}-${x}`);if(!L)continue;J(v[x])||(L.value="",re(i,d,x,""))}}}mt()}function mt(){const o=localStorage.getItem("design-panel:active-theme-id"),s=o==="thm_default"||o===null;document.querySelectorAll('[slot="editor"][data-tab="colors"] :is(input, button, select)').forEach(i=>{i.disabled=s})}function ae(){if(ae.done)return;ae.done=!0,E();const o=w();S(o),T(),Ze(),tt();const s=it();lt()&&dt(s),ut(s),document.addEventListener("design-panel:reactivate",ke),window.__dpColorsSave||(window.__dpColorsSave={flush:we.flush}),ke()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Le,{once:!0}):Le()})();(function(){const t="design-panel:typography",a=Object.freeze({"dp-type-ratio":"--type-scale-ratio","dp-text-base-min":"--text-base-min","dp-text-base-max":"--text-base-max","dp-lh-body":"--line-height-ratio-body","dp-lh-heading":"--line-height-ratio-heading","dp-font-body":"--font-body","dp-font-heading":"--font-heading","dp-line-height-min":"--line-height-min","dp-line-height-max":"--line-height-max"}),r=Object.freeze({"1.125":"Minor second","1.2":"Minor third","1.25":"Major third","1.333":"Perfect fourth","1.414":"Augmented fourth","1.5":"Perfect fifth","1.618":"Golden ratio"});function l(b){return b==="dp-font-body"||b==="dp-font-heading"}function u(b){const E=a[b.id],w=b.value;if(l(b.id)){const S=w.trim();S?document.documentElement.style.setProperty(E,S):document.documentElement.style.removeProperty(E)}else document.documentElement.style.setProperty(E,String(w))}function p(b){if(b.type==="range")if(b.id==="dp-type-ratio"){const E=r[b.value]||"";b.setAttribute("aria-valuetext",E?`Scale ratio ${b.value}, ${E}`:`Scale ratio ${b.value}`)}else{const E=b.id==="dp-lh-body"?"Body":"Heading";b.setAttribute("aria-valuetext",`${E} line height ${b.value}`)}}function f(){const b=document.getElementById("dp-type-ratio");if(!b)return;const E=Number(b.value),w=document.querySelectorAll("[data-preset-ratio]");for(const S of w){const T=Number(S.dataset.presetRatio),H=Math.abs(E-T)<.001;S.setAttribute("aria-pressed",H?"true":"false")}}function g(b,E){let w=null,S=null;const T=()=>{w&&(clearTimeout(w),w=null),S=null;try{localStorage.setItem(b,JSON.stringify(E()))}catch{}},H=function(){w&&clearTimeout(w),S=T,w=setTimeout(()=>{w=null,S=null;try{localStorage.setItem(b,JSON.stringify(E()))}catch{}},200)};return H.flush=function(){S&&T()},H}function k(){const b={};for(const E of Object.keys(a)){const w=document.getElementById(E);w&&(b[E]=w.value)}return b}const O=g(t,k);function $(){try{const b=localStorage.getItem(t);if(!b)return null;const E=JSON.parse(b);if(!E||typeof E!="object"||Array.isArray(E))return null;const w={};for(const S of Object.keys(a)){const T=E[S];typeof T=="string"&&(w[S]=T)}return w}catch{return null}}const _=5e3;function R(){return!!document.querySelector('[slot="editor"][data-tab="typography"] #dp-type-ratio')}function h(){return R()?Promise.resolve(!0):new Promise(b=>{const E=new MutationObserver(()=>{R()&&(S(),b(!0))}),w=setTimeout(()=>{S(),b(!1)},_);function S(){E.disconnect(),clearTimeout(w)}E.observe(document.body,{childList:!0,subtree:!0})})}let P=!1;function N(){if(!document.querySelector('[slot="editor"][data-tab="typography"]'))return;const E=$()||{},w=getComputedStyle(document.documentElement);for(const S of Object.keys(a)){const T=document.getElementById(S);if(!T)continue;const H=E[S];H!=null?(T.value=H,u(T)):l(S)?(T.value="",u(T)):(T.value=w.getPropertyValue(a[S]).trim(),u(T)),p(T)}D(),f()}function D(){const b=localStorage.getItem("design-panel:active-theme-id"),E=b==="thm_default"||b===null;document.querySelectorAll('[slot="editor"][data-tab="typography"] :is(input, button, select)').forEach(w=>{w.disabled=E})}function K(){if(P||!document.querySelector('[slot="editor"][data-tab="typography"]'))return;P=!0;for(const w of Object.keys(a)){const S=document.getElementById(w);S&&S.addEventListener("input",()=>{u(S),p(S),S.id==="dp-type-ratio"&&f(),O()})}const E=document.querySelectorAll("[data-preset-ratio]");for(const w of E)w.addEventListener("click",()=>{const S=document.getElementById("dp-type-ratio");S&&(S.value=w.dataset.presetRatio,S.dispatchEvent(new Event("input",{bubbles:!0})))});document.addEventListener("design-panel:reactivate",N),window.__dpTypographySave||(window.__dpTypographySave={flush:O.flush}),N()}function Y(){h().then(b=>{b&&K()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Y,{once:!0}):Y()})();Ot();function _t(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function Ht(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function It(){document.querySelectorAll(".grid").forEach(t=>{const n=getComputedStyle(t),e=n.gridTemplateColumns.split(" ").filter(r=>r!=="none"&&r.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const a=n.columnGap||n.rowGap||n.gap;a&&a!=="normal"&&t.style.setProperty("--grid-gap",a)})}function Pt(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&It()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let n;window.addEventListener("resize",()=>{clearTimeout(n),n=setTimeout(t,100)}),t()}_t(()=>{Ht(),Pt()});
