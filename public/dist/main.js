var vt=Object.defineProperty;var Oe=t=>{throw TypeError(t)};var St=(t,n,e)=>n in t?vt(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var He=(t,n,e)=>St(t,typeof n!="symbol"?n+"":n,e),ce=(t,n,e)=>n.has(t)||Oe("Cannot "+e);var b=(t,n,e)=>(ce(t,n,"read from private field"),e?e.call(t):n.get(t)),z=(t,n,e)=>n.has(t)?Oe("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,e),F=(t,n,e,a)=>(ce(t,n,"write to private field"),a?a.call(t,e):n.set(t,e),e),A=(t,n,e)=>(ce(t,n,"access private method"),e);class xt extends HTMLElement{async connectedCallback(){const n=this.getAttribute("src");if(!n){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const a=await e.text(),r=document.createElement("template");r.innerHTML=a;const i=r.content.cloneNode(!0);this.innerHTML="",this.appendChild(i),this.querySelectorAll("script").forEach(m=>{const g=document.createElement("script");Array.from(m.attributes).forEach(y=>{g.setAttribute(y.name,y.value)}),g.textContent=m.textContent,m.parentNode.replaceChild(g,m)})}catch(e){console.error(`HtmlInclude: failed to load ${n}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",xt);class Et extends HTMLElement{connectedCallback(){const n=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const a=e.textContent.trim();a&&n.push(a)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&n.push(e.outerHTML);this._triggerContent=n.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var n;(n=this._abortController)==null||n.abort()}escapeHtml(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}sanitizeHref(n){return n?/^(javascript|data|vbscript):/i.test(n)?(console.warn("PopupDialog: Blocked potentially dangerous href:",n),""):n:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var n;(n=this.querySelector("dialog"))==null||n.showModal()}close(){var n;(n=this.querySelector("dialog"))==null||n.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const n=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),a=n?n.innerHTML:this.escapeHtml(this.body),r=this.escapeHtml(this.title);let i="";if(e)i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const g=`button button--${this.escapeHtml(this.confirmVariant)}`,y=[];this.cancelLabel&&y.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&y.push(this.confirmHref?`<a href="${this.confirmHref}" class="${g}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${g}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${y.join("")}</footer>`}const p=r?`<header class="cluster cluster-between cluster-nowrap">
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
          ${p}
          <div>${a}</div>
          ${i}
        </div>
      </dialog>
    `}setupEvents(){const n=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),a=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:r}=this._abortController;n.addEventListener("click",i=>{i.preventDefault(),e.showModal()},{signal:r}),a.addEventListener("click",()=>{e.close()},{signal:r}),e.addEventListener("click",i=>{const p=i.target.closest("[data-action]");if(p){const m=p.dataset.action;m==="cancel"||m==="close"?(i.preventDefault(),e.close()):m==="confirm"&&p.tagName!=="A"&&(i.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}i.target===e&&e.close()},{signal:r})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",Et);const Pe=`
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
`;let ae=null;const Ne=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";Ne&&(ae=new CSSStyleSheet,ae.replaceSync(Pe));const ee=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],te={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},Ct={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},_e="design-panel:state",wt=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function At(){return ee.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function Tt(){return Object.entries(te).map(([t,n])=>{let e;if(n.type==="number")e=`<input type="number" data-setting="${t}" min="${n.min}" max="${n.max}" />`;else{const a=n.options.map(r=>`<option value="${r.value}">${r.label}</option>`).join("");e=`<select data-setting="${t}">${a}</select>`}return`
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
`;var C,B,K,O,N,S,me,Be,oe,fe,ne,be,ge,De,qe,Fe,je,ze,V;class Ie extends HTMLElement{constructor(){super();z(this,S);z(this,C,{...Ct});z(this,B,null);z(this,K,!1);z(this,O,null);z(this,N,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),Ne&&ae)this.shadowRoot.adoptedStyleSheets=[ae];else{const e=document.createElement("style");e.textContent=Pe,this.shadowRoot.appendChild(e)}}connectedCallback(){F(this,O,new AbortController),A(this,S,ze).call(this),A(this,S,me).call(this),A(this,S,Be).call(this),A(this,S,ne).call(this),A(this,S,qe).call(this),this.inert=!this.hasAttribute("open"),A(this,S,Fe).call(this),A(this,S,je).call(this)}disconnectedCallback(){b(this,O)&&(b(this,O).abort(),F(this,O,null)),b(this,B)&&(clearTimeout(b(this,B)),F(this,B,null))}attributeChangedCallback(e,a,r){a!==r&&(e==="open"?(b(this,C).open=r!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(b(this,C).activeTab=r||"guides",b(this,K)&&A(this,S,ne).call(this)):e==="overlay-target"&&A(this,S,me).call(this))}}C=new WeakMap,B=new WeakMap,K=new WeakMap,O=new WeakMap,N=new WeakMap,S=new WeakSet,me=function(){const e=this.getAttribute("overlay-target")||"body";try{F(this,N,document.querySelector(e)||document.body)}catch{F(this,N,document.body)}},Be=function(){const e=document.createRange().createContextualFragment(Lt);this.shadowRoot.appendChild(e),F(this,K,!0);const a=b(this,O)?b(this,O).signal:void 0,r=a?{signal:a}:void 0,i=this.shadowRoot.querySelector(".close");i&&i.addEventListener("click",()=>A(this,S,oe).call(this,!1),r);const p=this.shadowRoot.querySelector(".trigger");p&&p.addEventListener("click",()=>A(this,S,oe).call(this,!0),r),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(m=>{m.addEventListener("click",()=>A(this,S,fe).call(this,m.dataset.tab),r)}),this.shadowRoot.querySelectorAll(".tool").forEach(m=>{m.addEventListener("click",()=>A(this,S,be).call(this,m.dataset.tool),r)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(m=>{const g=m.dataset.setting,y=te[g];if(!y)return;const k=y.type==="number"?"input":"change";m.addEventListener(k,H=>{const R=y.type==="number"?Number(H.target.value):H.target.value;A(this,S,ge).call(this,g,R)},r)})},oe=function(e){b(this,C).open=!!e,b(this,C).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",b(this,C).open),A(this,S,V).call(this)},fe=function(e){e&&(b(this,C).activeTab=e,this.setAttribute("active-tab",e),A(this,S,ne).call(this),A(this,S,V).call(this))},ne=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const a=e.dataset.tab===b(this,C).activeTab;e.setAttribute("aria-selected",a?"true":"false"),e.toggleAttribute("data-active",a)})},be=function(e){const a=ee.find(i=>i.name===e);if(!a)return;b(this,C)[e]=!b(this,C)[e],b(this,N)&&b(this,N).classList.toggle(a.className,b(this,C)[e]);const r=this.shadowRoot.querySelector(`[data-tool="${e}"]`);r&&(r.setAttribute("aria-pressed",b(this,C)[e]?"true":"false"),r.toggleAttribute("data-active",b(this,C)[e])),A(this,S,V).call(this)},ge=function(e,a){b(this,C)[e]=a;const r=te[e];if(r){if(r.target==="cssvar")document.documentElement.style.setProperty(r.cssvar,String(a));else if(r.target==="overlayattr")b(this,N)&&b(this,N).setAttribute(r.attr,String(a));else if(r.target==="overlay-data-margin-mode"){const i=document.getElementById("dev-column-overlay"),p=document.getElementById("dev-margin-overlay");i&&i.setAttribute("data-margin-mode",String(a)),p&&p.setAttribute("data-margin-mode",String(a))}A(this,S,V).call(this)}},De=function(e){const a=this.shadowRoot.querySelector(`[data-setting="${e}"]`);a&&a.value!==String(b(this,C)[e])&&(a.value=String(b(this,C)[e]))},qe=function(){for(const e of ee){const a=!!b(this,C)[e.name];b(this,N)&&b(this,N).classList.toggle(e.className,a);const r=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);r&&(r.setAttribute("aria-pressed",a?"true":"false"),r.toggleAttribute("data-active",a))}for(const e of Object.keys(te))b(this,C)[e]!==void 0&&(A(this,S,ge).call(this,e,b(this,C)[e]),A(this,S,De).call(this,e));document.body.toggleAttribute("data-panel-open",!!b(this,C).open)},Fe=function(){const e=b(this,O)?b(this,O).signal:void 0,a=e?{signal:e}:void 0,r=i=>{const p=i.composedPath(),m=p&&p[0];if(m&&m.matches&&m.matches("input,textarea,[contenteditable]")||i.metaKey||i.ctrlKey||i.altKey)return;const g=(i.key||"").toLowerCase();if(!g)return;if(g==="t"){A(this,S,oe).call(this,!b(this,C).open),i.preventDefault();return}const y=ee.find(k=>k.key===g);y&&(A(this,S,be).call(this,y.name),i.preventDefault())};window.addEventListener("keydown",r,a)},je=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const a=b(this,O)?b(this,O).signal:void 0,r=a?{signal:a}:void 0,i=()=>{const p=e.assignedElements(),m=new Set(p.map(g=>g.getAttribute("data-tab")).filter(g=>!!g));for(const g of this.shadowRoot.querySelectorAll('[role="tab"]')){const y=g.dataset.tab;y!=="guides"&&g.classList.toggle("hidden",!m.has(y))}b(this,C).activeTab!=="guides"&&!m.has(b(this,C).activeTab)&&A(this,S,fe).call(this,"guides")};e.addEventListener("slotchange",i,r),i()},ze=function(){try{const e=localStorage.getItem(_e);if(e){const a=JSON.parse(e);a&&typeof a=="object"&&Object.assign(b(this,C),a)}}catch{}b(this,C).open?this.setAttribute("open",""):this.removeAttribute("open"),b(this,C).activeTab&&this.setAttribute("active-tab",b(this,C).activeTab)},V=function(){b(this,B)&&clearTimeout(b(this,B)),F(this,B,setTimeout(()=>{try{localStorage.setItem(_e,JSON.stringify(b(this,C)))}catch{}F(this,B,null)},200))},He(Ie,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",Ie);(function(){const t="design-panel-runtime-schemes";function n(){let r=document.getElementById(t);r||(r=document.createElement("style"),r.id=t,document.head.appendChild(r),r.sheet.insertRule("@layer tokens {}",0),r.sheet.insertRule("@layer utilities {}",1));const i={};for(let p=0;p<r.sheet.cssRules.length;p++){const m=r.sheet.cssRules[p];m.name&&(i[m.name]=m)}return i}let e=null;function a(){return e||(e=n()),e}window.__dpSchemeUpdate=function(r,i,p,m){const g=a()[m||"tokens"];if(g){for(let y=0;y<g.cssRules.length;y++)if(g.cssRules[y].selectorText===r){g.cssRules[y].style.setProperty(i,p);return}g.insertRule(r+"{"+i+":"+p+"}",g.cssRules.length)}},window.__dpSchemeReset=function(){const r=a();for(const i in r){const p=r[i];for(;p.cssRules.length>0;)p.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(i=>i.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(i=>{for(let p=0;p<i.options.length;p++)if(i.options[p].defaultSelected){i.selectedIndex=p;break}})},window.__dpSchemeSerialize=function(){const r=[];return document.querySelectorAll(".dp-scheme-card").forEach(i=>{const p=i.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!p)return;const m=p.className.replace(/^scheme-/,""),g=i.querySelectorAll(".dp-scheme-mode-column"),y=["light","dark"];g.forEach((k,H)=>{const R=y[H];R&&k.querySelectorAll(".dp-scheme-mapping-row").forEach(_=>{const M=_.querySelector("label"),h=_.querySelector("select");if(!M||!h)return;const D=M.textContent.trim(),q=h.value,I=h.getAttribute("data-library-default")||"";q&&q!==I&&r.push({scheme:m,token:D,mode:R,value:q})})})}),r}})();function Ge(t){const n=String(t).replace(/^#/,"");if(n.length!==6||/[^0-9a-fA-F]/.test(n))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(n,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function de(t){if(!Number.isFinite(t))return 0;const n=Math.round(t*255);return n<0?0:n>255?255:n}function Ue({R:t,G:n,B:e}){const a=de(t),r=de(n),i=de(e);return"#"+a.toString(16).padStart(2,"0")+r.toString(16).padStart(2,"0")+i.toString(16).padStart(2,"0")}function ue(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function pe(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function Ve({R:t,G:n,B:e}){return{R:ue(t),G:ue(n),B:ue(e)}}function Ke({R:t,G:n,B:e}){return{R:pe(t),G:pe(n),B:pe(e)}}function he(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function Ye({R:t,G:n,B:e}){let a=.4122214708*t+.5363325363*n+.0514459929*e,r=.2119034982*t+.6806995451*n+.1073969566*e,i=.0883024619*t+.2817188376*n+.6299787005*e;a=he(a),r=he(r),i=he(i);const p=.2104542553*a+.793617785*r-.0040720468*i,m=1.9779984951*a-2.428592205*r+.4505937099*i,g=.0259040371*a+.7827717662*r-.808675766*i;return{L:p,a:m,b:g}}function ye({L:t,a:n,b:e}){let a=t+.3963377774*n+.2158037573*e,r=t-.1055613458*n-.0638541728*e,i=t-.0894841775*n-1.291485548*e;a=a*a*a,r=r*r*r,i=i*i*i;const p=4.0767416621*a-3.3077115913*r+.2309699292*i,m=-1.2684380046*a+2.6097574011*r-.3413193965*i,g=-.0041960863*a-.7034186147*r+1.707614701*i;return{R:p,G:m,B:g}}function Je({L:t,a:n,b:e}){const a=Math.sqrt(n*n+e*e),i=(Math.atan2(e,n)*180/Math.PI%360+360)%360;return{L:t,C:a,H:i}}function ve({L:t,C:n,H:e}){const a=e*Math.PI/180;return{L:t,a:n*Math.cos(a),b:n*Math.sin(a)}}function Xe(t){return Je(Ye(Ve(Ge(t))))}function se({L:t,C:n,H:e}){return Ue(Ke(ye(ve({L:t,C:n,H:e}))))}function Se({L:t,C:n,H:e}){const a=ve({L:t,C:n,H:e}),r=ye(a),i=.002;return r.R>=-i&&r.R<=1+i&&r.G>=-i&&r.G<=1+i&&r.B>=-i&&r.B<=1+i}function xe(t,n){let e=0,a=.4;for(let r=0;r<40;r++){const i=(e+a)/2;Se({L:t,C:i,H:n})?e=i:a=i}return e}function re({L:t,C:n,H:e}){return Se({L:t,C:n,H:e})?{L:t,C:n,H:e}:{L:t,C:xe(t,e),H:e}}function We(t,n,e){return t<n?n:t>e?e:t}function kt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:Ge,sRGBToHex:Ue,sRGBToLinearRGB:Ve,linearRGBToSRGB:Ke,linearRGBToOKLab:Ye,oklabToLinearRGB:ye,oklabToOKLCH:Je,oklchToOKLab:ve,hexToOKLCH:Xe,oklchToHex:se,isInSRGBGamut:Se,maxChromaSRGB:xe,clampChroma:re,clampFloat:We}))}const Ee=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),$t=Object.freeze(["blue","red","orange","yellow","green","grey"]),Ze=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),Ce=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function Rt(t,n){const e=t||Ce,a=Math.max(0,Math.min(100,n))/100,r={};for(const i of Ee){const p=Number(i),m=e[p]??e[String(p)]??.5;r[p]=m*a}return r}function Mt(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const n=Xe(t.anchorHex),e=t.lTargets||Ze,a=t.chromaProfile||Ce,r=t.overrides||{},i=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const p=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,m=n.L-p,g=[];for(const y of Ee){if(Object.prototype.hasOwnProperty.call(r,y)){const[h,D,q]=r[y],I=re({L:h,C:D,H:q});g.push({step:y,hex:se(I),L:I.L,C:I.C,H:I.H});continue}if(y===t.anchorStep){const h=re(n);g.push({step:y,hex:se(h),L:h.L,C:h.C,H:h.H});continue}const k=Object.prototype.hasOwnProperty.call(e,y)?e[y]:.58,H=We(k+m,.06,.985);let R=i?i(y):n.H,_;if(t.isNeutral)_=t.neutralChroma,R=t.neutralHue;else{const h=xe(H,R),D=Object.prototype.hasOwnProperty.call(a,y)?a[y]:.5;_=h*D}const M=re({L:H,C:_,H:R});g.push({step:y,hex:se(M),L:M.L,C:M.C,H:M.H})}return g}function Ot(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:Ee,FAMILY_NAMES:$t,DEFAULT_L_TARGETS:Ze,DEFAULT_CHROMA_PROFILE:Ce,generateRamp:Mt,scaleChromaProfile:Rt}))}function Ht(t=globalThis){kt(t),Ot(t)}(function(){const t=typeof window<"u"&&window.DesignPanelColor||{},n=t.FAMILY_NAMES?Array.from(t.FAMILY_NAMES):["blue","red","orange","yellow","green","grey"],e=t.STEPS?t.STEPS.map(String):["50","100","200","300","400","500","600","700","800","900","950"],a=["default","subtle","accent"],r=["light","dark"],i=["bg","fg","accent","muted","subtle"],p="design-panel:schemes",m="design-panel:ramps",g=300,y={blue:"#1f75ff",red:"#e10600",orange:"#ff4f00",yellow:"#ffa300",green:"#00b312",grey:"#808080"},k={};for(const o of n)k[o]=o.charAt(0).toUpperCase()+o.slice(1);const H=new RegExp(`^(?:${n.join("|")})-(?:${e.join("|")})$`);let R=!1,_=!1,M=!1;function h(o,s,l){const c=document.createElement(o);if(s)for(const u in s)u==="text"?c.textContent=s[u]:u in c&&typeof s[u]!="string"?c[u]=s[u]:c.setAttribute(u,s[u]);if(l)for(const u of l)u!=null&&c.appendChild(u);return c}function D(o){const s=k[o],l=`dp-ramp-settings-${o}`,c=h("span",{class:"dp-ramp-label",text:s}),u=h("span",{class:"dp-ramp-grid","aria-hidden":"true"});for(const U of e)u.appendChild(h("span",{class:"dp-ramp-swatch","data-step":U}));const v=h("button",{class:"dp-ramp-row",type:"button","aria-expanded":"false","aria-controls":l,"aria-label":`${s} ramp settings`},[c,u]),x=h("legend",{class:"dp-ramp-settings-legend",text:`${s} ramp settings`}),$=h("label",{for:`dp-anchor-${o}`,text:"Anchor color"}),j=h("input",{type:"color",id:`dp-anchor-${o}`}),Q=h("label",{for:`dp-step-${o}`,text:"Anchor step"}),G=h("select",{id:`dp-step-${o}`});for(const U of e){const Me=h("option",{value:U,text:U});U==="500"&&(Me.selected=!0),G.appendChild(Me)}const bt=h("label",{for:`dp-chroma-${o}`,text:"Chroma intensity"}),gt=h("input",{type:"range",id:`dp-chroma-${o}`,min:"0",max:"100",value:"80"}),yt=h("fieldset",{class:"dp-ramp-settings",id:l,hidden:""},[x,$,j,Q,G,bt,gt]);return h("div",{class:"dp-ramp-row-wrapper","data-family":o},[v,yt])}function q(o,s){const l=o.charAt(0).toUpperCase()+o.slice(1);return h("div",{class:`dp-scheme-preview ${s==="dark"?"dp-scheme-preview-dark dark-mode":"dp-scheme-preview-light"}`,"aria-hidden":"true"},[h("div",{class:`scheme-${o}`},[h("div",{class:"dp-scheme-heading",text:l}),h("div",{class:"dp-scheme-divider"}),h("div",{class:"dp-scheme-body",text:"Sample body text"}),h("div",{class:"dp-scheme-meta"},[h("span",{class:"dp-scheme-accent-text",text:"Accent"}),h("span",{class:"dp-scheme-subtle-swatch"}),h("span",{class:"dp-scheme-muted-text",text:"Muted"})])])])}function I(o,s,l){const c=`dp-scheme-${o}-${s}-${l}`;return h("div",{class:"dp-scheme-mapping-row"},[h("label",{for:c,text:l}),h("select",{id:c,"data-scheme":o,"data-mode":s,"data-token":l,"aria-busy":"true"},[h("option",{value:"",disabled:!0,selected:!0,text:"Loading…"})])])}function Y(o,s){const l=X(o),c=s.charAt(0).toUpperCase()+s.slice(1),u=h("summary",{"aria-label":`${l} scheme, ${c} mode`},[q(o,s)]),v=h("legend",{class:"dp-scheme-mode-label",text:c}),x=h("fieldset",{class:"dp-scheme-mode-column"},[v]);for(const $ of i)x.appendChild(I(o,s,$));return h("details",{class:"dp-scheme-card-mode","data-mode":s},[u,x])}function J(o){const s=X(o);return h("div",{class:"dp-scheme-card","data-scheme":o,role:"listitem","aria-label":`${s} scheme`},[Y(o,"light"),Y(o,"dark")])}function X(o){return o.charAt(0).toUpperCase()+o.slice(1)}function W(){const o=document.querySelector("[data-dp-ramp-matrix]");if(o&&!o.firstChild)for(const l of n)o.appendChild(D(l));const s=document.querySelector("[data-dp-scheme-list]");if(s&&!s.firstChild)for(const l of a)s.appendChild(J(l))}function f(){const o=document.documentElement,s=getComputedStyle(o),l={};for(const c of n){l[c]={};for(const u of e){const v=s.getPropertyValue(`--color-${c}-${u}`).trim();l[c][u]=v||null}}return l}function d(o){for(const s of n){const l=document.querySelector(`.dp-ramp-row-wrapper[data-family="${s}"]`);if(l)for(const c of e){const u=l.querySelector(`.dp-ramp-swatch[data-step="${c}"]`);if(!u)continue;const v=o[s][c];v?u.style.backgroundColor=v:R||(console.warn(`[design-panel-colors] Missing --color-${s}-${c} token; leaving swatch unpainted.`),R=!0)}}}function E(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o){for(;s.firstChild;)s.removeChild(s.firstChild);const l=document.createElement("option");l.value="",l.textContent="—",s.appendChild(l);for(const c of n){const u=k[c],v=document.createElement("optgroup");v.label=u;for(const x of e){const $=document.createElement("option");$.value=`${c}-${x}`,$.textContent=`${u} ${x}`,v.appendChild($)}s.appendChild(v)}s.removeAttribute("aria-busy")}}function T(o){let s;try{s=localStorage.getItem(o)}catch{return{}}if(!s)return{};try{const l=JSON.parse(s);return l&&typeof l=="object"?l:{}}catch{return{}}}function L(o){return typeof o=="string"&&H.test(o)}function w(){const o=T(p);for(const s of a){const l=o[s];if(!(!l||typeof l!="object"))for(const c of r){const u=l[c];if(!(!u||typeof u!="object"))for(const v of i){const x=u[v];if(!L(x))continue;const $=document.getElementById(`dp-scheme-${s}-${c}-${v}`);$&&($.value=x,we(s,c,v,x))}}}}function P(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o)s.addEventListener("change",ie)}function ie(o){const s=o.currentTarget,{scheme:l,mode:c,token:u}=s.dataset;if(!(!l||!c||!u)){if(s.value!==""&&!L(s.value)){console.warn(`[design-panel-colors] ignoring invalid scheme value "${s.value}"`);return}we(l,c,u,s.value),et()}}function we(o,s,l,c){if(typeof window.__dpSchemeUpdate!="function"){_||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),_=!0);return}const u=`--color-${l}`,v=c?`var(--color-${c})`:"initial";if(o==="default"){const x=s==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(x,u,v,"utilities")}else{const x=s==="dark"?`.scheme-${o}.dark-mode`:`.scheme-${o}`;window.__dpSchemeUpdate(x,u,v,"tokens")}}function Ae(o,s){let l=null;return function(){l&&clearTimeout(l),l=setTimeout(()=>{l=null;try{localStorage.setItem(o,JSON.stringify(s()))}catch{}},g)}}function Qe(){const o={};for(const s of a){o[s]={light:{},dark:{}};for(const l of r)for(const c of i){const u=document.getElementById(`dp-scheme-${s}-${l}-${c}`);u&&u.value&&(o[s][l][c]=u.value)}}return o}const et=Ae(p,Qe);function tt(){const o=document.querySelectorAll(".dp-ramp-row");for(const s of o)s.addEventListener("click",()=>{const l=s.getAttribute("aria-controls");if(!l)return;const c=document.getElementById(l);if(!c)return;c.hasAttribute("hidden")?(c.removeAttribute("hidden"),s.setAttribute("aria-expanded","true")):(c.setAttribute("hidden",""),s.setAttribute("aria-expanded","false"))})}function ot(){const o=window.DesignPanelColor;return!o||typeof o.generateRamp!="function"?(M||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),M=!0),null):o}function nt(){const o=getComputedStyle(document.documentElement),s={};for(const l of n){const c=o.getPropertyValue(`--color-${l}-500`).trim(),u=y[l]||"#808080";s[l]={anchorHex:(c||u).toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return s}function Te(){return T(m)}const Le=/^#[0-9a-f]{6}$/,st=new Set(e.map(o=>Number(o)));function rt(o){if(!o||typeof o!="object")return{};const s={};if(typeof o.anchorHex=="string"){const l=o.anchorHex.toLowerCase();Le.test(l)&&(s.anchorHex=l)}return Number.isFinite(o.anchorStep)&&st.has(o.anchorStep)&&(s.anchorStep=o.anchorStep),Number.isFinite(o.chroma)&&o.chroma>=0&&o.chroma<=100&&(s.chroma=o.chroma),typeof o.isNeutral=="boolean"&&(s.isNeutral=o.isNeutral),Number.isFinite(o.neutralChroma)&&o.neutralChroma>=0&&o.neutralChroma<=.5&&(s.neutralChroma=o.neutralChroma),Number.isFinite(o.neutralHue)&&o.neutralHue>=0&&o.neutralHue<360&&(s.neutralHue=o.neutralHue),s}function at(){const o=nt(),s=Te(),l={};for(const c of n)l[c]={...o[c],...rt(s[c])};return l}function it(){const o=Te();return Object.keys(o).length>0}function lt(o,s){if(typeof o.scaleChromaProfile=="function")return o.scaleChromaProfile(o.DEFAULT_CHROMA_PROFILE,s);const l=Math.max(0,Math.min(100,s))/100,c=o.DEFAULT_CHROMA_PROFILE||{},u={};for(const v of e){const x=Number(v),$=c[x]??c[v]??.5;u[x]=$*l}return u}function Z(o,s){const l=ot();if(!l)return;const c=s[o];if(!c)return;const u=lt(l,c.chroma);let v;try{v=l.generateRamp({anchorHex:c.anchorHex,anchorStep:c.anchorStep,chromaProfile:u,isNeutral:!!c.isNeutral,neutralChroma:c.neutralChroma,neutralHue:c.neutralHue})}catch(j){console.warn(`[design-panel-colors] generateRamp failed for ${o}: ${j.message}`);return}const x=document.querySelector(`.dp-ramp-row-wrapper[data-family="${o}"]`),$=document.documentElement;for(const j of v){const Q=String(j.step);if($.style.setProperty(`--color-${o}-${Q}`,j.hex),x){const G=x.querySelector(`.dp-ramp-swatch[data-step="${Q}"]`);G&&(G.style.backgroundColor=j.hex)}}}function ct(o){for(const s of n)Z(s,o)}function ke(o,s){o.setAttribute("aria-valuetext",`Chroma ${s} percent`)}function dt(o){const s=Ae(m,()=>o);for(const l of n){const c=document.getElementById(`dp-anchor-${l}`),u=document.getElementById(`dp-step-${l}`),v=document.getElementById(`dp-chroma-${l}`);c&&o[l].anchorHex&&(c.value=o[l].anchorHex),u&&(u.value=String(o[l].anchorStep)),v&&(v.value=String(o[l].chroma),ke(v,o[l].chroma)),c&&c.addEventListener("input",()=>{o[l].anchorHex=(c.value||"").toLowerCase(),Z(l,o),s()}),u&&u.addEventListener("change",()=>{const x=parseInt(u.value,10);Number.isFinite(x)&&(o[l].anchorStep=x,Z(l,o),s())}),v&&v.addEventListener("input",()=>{const x=parseInt(v.value,10);Number.isFinite(x)&&(o[l].chroma=x,ke(v,x),Z(l,o),s())})}}function ut(){const o=getComputedStyle(document.documentElement),s=["@layer tokens {","  :root {"];for(const l of n){const c=k[l];s.push(`    /* ${c} */`);for(const u of e){const x=o.getPropertyValue(`--color-${l}-${u}`).trim().toLowerCase();x&&Le.test(x)&&s.push(`    --color-${l}-${u}: ${x};`)}s.push("")}return s.push("  }","}"),s.join(`
`)}function pt(o){let s=document.getElementById("dp-copy-css-status");return s||(s=h("span",{id:"dp-copy-css-status",class:"visually-hidden",role:"status","aria-live":"polite","aria-atomic":"true"}),o.insertAdjacentElement("afterend",s)),s}function ht(){const o=document.querySelector(".dp-copy-css");if(!o)return;const s=pt(o);o.addEventListener("click",()=>{const l=ut(),c=o.textContent,u=(v,x)=>{o.textContent=v,s.textContent=v,setTimeout(()=>{o.textContent=c,s.textContent=""},x)};if(!navigator.clipboard||typeof navigator.clipboard.writeText!="function"){console.warn("[design-panel-colors] navigator.clipboard unavailable"),u("Unavailable",2e3);return}navigator.clipboard.writeText(l).then(()=>{u("Copied",2e3)},v=>{console.error("[design-panel-colors] clipboard write failed:",v),u("Failed",2e3)})})}const mt=5e3;function $e(){return document.querySelector("[data-dp-ramp-matrix]")||document.querySelector("[data-dp-scheme-list]")}function ft(){return $e()?Promise.resolve(!0):new Promise(o=>{const s=new MutationObserver(()=>{$e()&&(c(),o(!0))}),l=setTimeout(()=>{c(),o(!1)},mt);function c(){s.disconnect(),clearTimeout(l)}s.observe(document.body,{childList:!0,subtree:!0})})}function Re(){ft().then(o=>{o&&le()})}function le(){if(le.done)return;le.done=!0,W();const o=f();d(o),E(),w(),P(),tt();const s=at();it()&&ct(s),dt(s),ht()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Re,{once:!0}):Re()})();(function(){const t="design-panel:typography",a=Object.freeze({"dp-type-ratio":"--type-scale-ratio","dp-text-base-min":"--text-base-min","dp-text-base-max":"--text-base-max","dp-lh-body":"--line-height-ratio-body","dp-lh-heading":"--line-height-ratio-heading","dp-font-body":"--font-body","dp-font-heading":"--font-heading","dp-line-height-min":"--line-height-min","dp-line-height-max":"--line-height-max"}),r=Object.freeze({"1.125":"Minor second","1.2":"Minor third","1.25":"Major third","1.333":"Perfect fourth","1.414":"Augmented fourth","1.5":"Perfect fifth","1.618":"Golden ratio"});function i(f){return f==="dp-font-body"||f==="dp-font-heading"}function p(f){const d=a[f.id],E=f.value;if(i(f.id)){const T=E.trim();T?document.documentElement.style.setProperty(d,T):document.documentElement.style.removeProperty(d)}else document.documentElement.style.setProperty(d,String(E))}function m(f){if(f.type==="range")if(f.id==="dp-type-ratio"){const d=r[f.value]||"";f.setAttribute("aria-valuetext",d?`Scale ratio ${f.value}, ${d}`:`Scale ratio ${f.value}`)}else{const d=f.id==="dp-lh-body"?"Body":"Heading";f.setAttribute("aria-valuetext",`${d} line height ${f.value}`)}}function g(){const f=document.getElementById("dp-type-ratio");if(!f)return;const d=Number(f.value),E=document.querySelectorAll("[data-preset-ratio]");for(const T of E){const L=Number(T.dataset.presetRatio),w=Math.abs(d-L)<.001;T.setAttribute("aria-pressed",w?"true":"false")}}function y(f,d){let E=null;return function(){E&&clearTimeout(E),E=setTimeout(()=>{E=null;try{localStorage.setItem(f,JSON.stringify(d()))}catch{}},200)}}function k(){const f={};for(const d of Object.keys(a)){const E=document.getElementById(d);E&&(f[d]=E.value)}return f}const H=y(t,k);function R(){try{const f=localStorage.getItem(t);if(!f)return null;const d=JSON.parse(f);if(!d||typeof d!="object"||Array.isArray(d))return null;const E={};for(const T of Object.keys(a)){const L=d[T];typeof L=="string"&&(E[T]=L)}return E}catch{return null}}const _=5e3;function M(){return!!document.querySelector('[slot="editor"][data-tab="typography"] #dp-type-ratio')}function h(){return M()?Promise.resolve(!0):new Promise(f=>{const d=new MutationObserver(()=>{M()&&(T(),f(!0))}),E=setTimeout(()=>{T(),f(!1)},_);function T(){d.disconnect(),clearTimeout(E)}d.observe(document.body,{childList:!0,subtree:!0})})}const D=Object.freeze({"dp-type-ratio":"scale","dp-text-base-min":"scale","dp-text-base-max":"scale","dp-lh-body":"scale","dp-lh-heading":"scale","dp-font-body":"base","dp-font-heading":"base","dp-line-height-min":"base","dp-line-height-max":"base"});function q(){const f={scale:[],base:[]};for(const E of Object.keys(a)){const T=document.getElementById(E);if(!T)continue;const L=T.value;if(i(E)&&!L.trim())continue;const w=a[E],P=i(E)?L.trim():String(L);f[D[E]].push(`    ${w}: ${P};`)}const d=[];return f.scale.length&&(d.push("/* Paste into src/css/1_tokens/typography-scale-auto.css :root */"),d.push("@layer tokens {"),d.push("  :root {"),d.push(...f.scale),d.push("  }"),d.push("}")),f.base.length&&(d.length&&d.push(""),d.push("/* Paste into src/css/1_tokens/typography-base.css :root */"),d.push("@layer tokens {"),d.push("  :root {"),d.push(...f.base),d.push("  }"),d.push("}")),d.join(`
`)}function I(f){let d=document.getElementById("dp-copy-typography-status");return d||(d=document.createElement("span"),d.id="dp-copy-typography-status",d.className="visually-hidden",d.setAttribute("role","status"),d.setAttribute("aria-live","polite"),d.setAttribute("aria-atomic","true"),f.insertAdjacentElement("afterend",d)),d}function Y(f){const d=f.querySelector('[data-dp-copy="typography"]');if(!d)return;const E=I(d);d.addEventListener("click",()=>{const T=q(),L=d.textContent,w=(P,ie)=>{d.textContent=P,E.textContent=P,setTimeout(()=>{d.textContent=L,E.textContent=""},ie)};if(!navigator.clipboard||typeof navigator.clipboard.writeText!="function"){console.warn("[design-panel-typography] navigator.clipboard unavailable"),w("Unavailable",2e3);return}navigator.clipboard.writeText(T).then(()=>w("Copied",2e3),P=>{console.error("[design-panel-typography] clipboard write failed:",P),w("Failed",2e3)})})}let J=!1;function X(){if(J)return;const f=document.querySelector('[slot="editor"][data-tab="typography"]');if(!f)return;J=!0;const d=R()||{},E=getComputedStyle(document.documentElement);for(const L of Object.keys(a)){const w=document.getElementById(L);if(!w)continue;const P=d[L];P!=null?(w.value=P,p(w)):i(L)?w.value="":(w.value=E.getPropertyValue(a[L]).trim(),p(w)),m(w),w.addEventListener("input",()=>{p(w),m(w),w.id==="dp-type-ratio"&&g(),H()})}const T=document.querySelectorAll("[data-preset-ratio]");for(const L of T)L.addEventListener("click",()=>{const w=document.getElementById("dp-type-ratio");w&&(w.value=L.dataset.presetRatio,w.dispatchEvent(new Event("input",{bubbles:!0})))});g(),Y(f)}function W(){h().then(f=>{f&&X()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",W,{once:!0}):W()})();Ht();function _t(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function Pt(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function Nt(){document.querySelectorAll(".grid").forEach(t=>{const n=getComputedStyle(t),e=n.gridTemplateColumns.split(" ").filter(r=>r!=="none"&&r.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const a=n.columnGap||n.rowGap||n.gap;a&&a!=="normal"&&t.style.setProperty("--grid-gap",a)})}function It(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&Nt()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let n;window.addEventListener("resize",()=>{clearTimeout(n),n=setTimeout(t,100)}),t()}_t(()=>{Pt(),It()});
