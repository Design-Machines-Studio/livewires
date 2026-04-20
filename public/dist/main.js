var Z=Object.defineProperty;var _=o=>{throw TypeError(o)};var Q=(o,t,e)=>t in o?Z(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var G=(o,t,e)=>Q(o,typeof t!="symbol"?t+"":t,e),R=(o,t,e)=>t.has(o)||_("Cannot "+e);var n=(o,t,e)=>(R(o,t,"read from private field"),e?e.call(o):t.get(o)),v=(o,t,e)=>t.has(o)?_("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(o):t.set(o,e),f=(o,t,e,a)=>(R(o,t,"write to private field"),a?a.call(o,e):t.set(o,e),e),p=(o,t,e)=>(R(o,t,"access private method"),e);class ee extends HTMLElement{async connectedCallback(){const t=this.getAttribute("src");if(!t){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(t);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const a=await e.text(),s=document.createElement("template");s.innerHTML=a;const i=s.content.cloneNode(!0);this.innerHTML="",this.appendChild(i),this.querySelectorAll("script").forEach(c=>{const u=document.createElement("script");Array.from(c.attributes).forEach(h=>{u.setAttribute(h.name,h.value)}),u.textContent=c.textContent,c.parentNode.replaceChild(u,c)})}catch(e){console.error(`HtmlInclude: failed to load ${t}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",ee);class te extends HTMLElement{connectedCallback(){const t=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const a=e.textContent.trim();a&&t.push(a)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&t.push(e.outerHTML);this._triggerContent=t.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var t;(t=this._abortController)==null||t.abort()}escapeHtml(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}sanitizeHref(t){return t?/^(javascript|data|vbscript):/i.test(t)?(console.warn("PopupDialog: Blocked potentially dangerous href:",t),""):t:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var t;(t=this.querySelector("dialog"))==null||t.showModal()}close(){var t;(t=this.querySelector("dialog"))==null||t.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const t=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),a=t?t.innerHTML:this.escapeHtml(this.body),s=this.escapeHtml(this.title);let i="";if(e)i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const u=`button button--${this.escapeHtml(this.confirmVariant)}`,h=[];this.cancelLabel&&h.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&h.push(this.confirmHref?`<a href="${this.confirmHref}" class="${u}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${u}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),i=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${h.join("")}</footer>`}const l=s?`<header class="cluster cluster-between cluster-nowrap">
          <h2>${s}</h2>
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
          ${l}
          <div>${a}</div>
          ${i}
        </div>
      </dialog>
    `}setupEvents(){const t=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),a=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:s}=this._abortController;t.addEventListener("click",i=>{i.preventDefault(),e.showModal()},{signal:s}),a.addEventListener("click",()=>{e.close()},{signal:s}),e.addEventListener("click",i=>{const l=i.target.closest("[data-action]");if(l){const c=l.dataset.action;c==="cancel"||c==="close"?(i.preventDefault(),e.close()):c==="confirm"&&l.tagName!=="A"&&(i.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}i.target===e&&e.close()},{signal:s})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",te);const P=`
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
    --dp-width: 280px;

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
`;let L=null;const I=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";I&&(L=new CSSStyleSheet,L.replaceSync(P));const k=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],A={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},se={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},B="design-panel:state",oe=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function ae(){return k.map(o=>`
    <button type="button" class="tool" data-tool="${o.name}" aria-pressed="false" title="Toggle ${o.label} (${o.key.toUpperCase()})">
      <span class="tool-key">${o.key.toUpperCase()}</span>
      <span class="tool-label">${o.label}</span>
    </button>
  `).join("")}function ie(){return Object.entries(A).map(([o,t])=>{let e;if(t.type==="number")e=`<input type="number" data-setting="${o}" min="${t.min}" max="${t.max}" />`;else{const a=t.options.map(s=>`<option value="${s.value}">${s.label}</option>`).join("");e=`<select data-setting="${o}">${a}</select>`}return`
      <div class="setting">
        <label for="dp-setting-${o}">${t.label}</label>
        ${e.replace("data-setting=",`id="dp-setting-${o}" data-setting=`)}
      </div>
    `}).join("")}const ne=`
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
          <div class="tools">${ae()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${ie()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${oe}</button>
`;var d,g,S,b,m,r,q,F,T,z,C,N,M,K,U,V,X,J,x;class j extends HTMLElement{constructor(){super();v(this,r);v(this,d,{...se});v(this,g,null);v(this,S,!1);v(this,b,null);v(this,m,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),I&&L)this.shadowRoot.adoptedStyleSheets=[L];else{const e=document.createElement("style");e.textContent=P,this.shadowRoot.appendChild(e)}}connectedCallback(){f(this,b,new AbortController),p(this,r,J).call(this),p(this,r,q).call(this),p(this,r,F).call(this),p(this,r,C).call(this),p(this,r,U).call(this),this.inert=!this.hasAttribute("open"),p(this,r,V).call(this),p(this,r,X).call(this)}disconnectedCallback(){n(this,b)&&(n(this,b).abort(),f(this,b,null)),n(this,g)&&(clearTimeout(n(this,g)),f(this,g,null))}attributeChangedCallback(e,a,s){a!==s&&(e==="open"?(n(this,d).open=s!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(n(this,d).activeTab=s||"guides",n(this,S)&&p(this,r,C).call(this)):e==="overlay-target"&&p(this,r,q).call(this))}}d=new WeakMap,g=new WeakMap,S=new WeakMap,b=new WeakMap,m=new WeakMap,r=new WeakSet,q=function(){const e=this.getAttribute("overlay-target")||"body";try{f(this,m,document.querySelector(e)||document.body)}catch{f(this,m,document.body)}},F=function(){const e=document.createRange().createContextualFragment(ne);this.shadowRoot.appendChild(e),f(this,S,!0);const a=n(this,b)?n(this,b).signal:void 0,s=a?{signal:a}:void 0,i=this.shadowRoot.querySelector(".close");i&&i.addEventListener("click",()=>p(this,r,T).call(this,!1),s);const l=this.shadowRoot.querySelector(".trigger");l&&l.addEventListener("click",()=>p(this,r,T).call(this,!0),s),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(c=>{c.addEventListener("click",()=>p(this,r,z).call(this,c.dataset.tab),s)}),this.shadowRoot.querySelectorAll(".tool").forEach(c=>{c.addEventListener("click",()=>p(this,r,N).call(this,c.dataset.tool),s)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(c=>{const u=c.dataset.setting,h=A[u];if(!h)return;const y=h.type==="number"?"input":"change";c.addEventListener(y,w=>{const E=h.type==="number"?Number(w.target.value):w.target.value;p(this,r,M).call(this,u,E)},s)})},T=function(e){n(this,d).open=!!e,n(this,d).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",n(this,d).open),p(this,r,x).call(this)},z=function(e){e&&(n(this,d).activeTab=e,this.setAttribute("active-tab",e),p(this,r,C).call(this),p(this,r,x).call(this))},C=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const a=e.dataset.tab===n(this,d).activeTab;e.setAttribute("aria-selected",a?"true":"false"),e.toggleAttribute("data-active",a)})},N=function(e){const a=k.find(i=>i.name===e);if(!a)return;n(this,d)[e]=!n(this,d)[e],n(this,m)&&n(this,m).classList.toggle(a.className,n(this,d)[e]);const s=this.shadowRoot.querySelector(`[data-tool="${e}"]`);s&&(s.setAttribute("aria-pressed",n(this,d)[e]?"true":"false"),s.toggleAttribute("data-active",n(this,d)[e])),p(this,r,x).call(this)},M=function(e,a){n(this,d)[e]=a;const s=A[e];if(s){if(s.target==="cssvar")document.documentElement.style.setProperty(s.cssvar,String(a));else if(s.target==="overlayattr")n(this,m)&&n(this,m).setAttribute(s.attr,String(a));else if(s.target==="overlay-data-margin-mode"){const i=document.getElementById("dev-column-overlay"),l=document.getElementById("dev-margin-overlay");i&&i.setAttribute("data-margin-mode",String(a)),l&&l.setAttribute("data-margin-mode",String(a))}p(this,r,x).call(this)}},K=function(e){const a=this.shadowRoot.querySelector(`[data-setting="${e}"]`);a&&a.value!==String(n(this,d)[e])&&(a.value=String(n(this,d)[e]))},U=function(){for(const e of k){const a=!!n(this,d)[e.name];n(this,m)&&n(this,m).classList.toggle(e.className,a);const s=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);s&&(s.setAttribute("aria-pressed",a?"true":"false"),s.toggleAttribute("data-active",a))}for(const e of Object.keys(A))n(this,d)[e]!==void 0&&(p(this,r,M).call(this,e,n(this,d)[e]),p(this,r,K).call(this,e));document.body.toggleAttribute("data-panel-open",!!n(this,d).open)},V=function(){const e=n(this,b)?n(this,b).signal:void 0,a=e?{signal:e}:void 0,s=i=>{const l=i.composedPath(),c=l&&l[0];if(c&&c.matches&&c.matches("input,textarea,[contenteditable]")||i.metaKey||i.ctrlKey||i.altKey)return;const u=(i.key||"").toLowerCase();if(!u)return;if(u==="t"){p(this,r,T).call(this,!n(this,d).open),i.preventDefault();return}const h=k.find(y=>y.key===u);h&&(p(this,r,N).call(this,h.name),i.preventDefault())};window.addEventListener("keydown",s,a)},X=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const a=n(this,b)?n(this,b).signal:void 0,s=a?{signal:a}:void 0,i=()=>{const l=e.assignedElements(),c=new Set(l.map(u=>u.getAttribute("data-tab")).filter(u=>!!u));for(const u of this.shadowRoot.querySelectorAll('[role="tab"]')){const h=u.dataset.tab;h!=="guides"&&u.classList.toggle("hidden",!c.has(h))}n(this,d).activeTab!=="guides"&&!c.has(n(this,d).activeTab)&&p(this,r,z).call(this,"guides")};e.addEventListener("slotchange",i,s),i()},J=function(){try{const e=localStorage.getItem(B);if(e){const a=JSON.parse(e);a&&typeof a=="object"&&Object.assign(n(this,d),a)}}catch{}n(this,d).open?this.setAttribute("open",""):this.removeAttribute("open"),n(this,d).activeTab&&this.setAttribute("active-tab",n(this,d).activeTab)},x=function(){n(this,g)&&clearTimeout(n(this,g)),f(this,g,setTimeout(()=>{try{localStorage.setItem(B,JSON.stringify(n(this,d)))}catch{}f(this,g,null)},200))},G(j,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",j);(function(){const o="design-panel-runtime-schemes";function t(){let s=document.getElementById(o);s||(s=document.createElement("style"),s.id=o,document.head.appendChild(s),s.sheet.insertRule("@layer tokens {}",0),s.sheet.insertRule("@layer utilities {}",1));const i={};for(let l=0;l<s.sheet.cssRules.length;l++){const c=s.sheet.cssRules[l];c.name&&(i[c.name]=c)}return i}let e=null;function a(){return e||(e=t()),e}window.__dpSchemeUpdate=function(s,i,l,c){const u=a()[c||"tokens"];if(u){for(let h=0;h<u.cssRules.length;h++)if(u.cssRules[h].selectorText===s){u.cssRules[h].style.setProperty(i,l);return}u.insertRule(s+"{"+i+":"+l+"}",u.cssRules.length)}},window.__dpSchemeReset=function(){const s=a();for(const i in s){const l=s[i];for(;l.cssRules.length>0;)l.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(i=>i.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(i=>{for(let l=0;l<i.options.length;l++)if(i.options[l].defaultSelected){i.selectedIndex=l;break}})},window.__dpSchemeSerialize=function(){const s=[];return document.querySelectorAll(".dp-scheme-card").forEach(i=>{const l=i.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!l)return;const c=l.className.replace(/^scheme-/,""),u=i.querySelectorAll(".dp-scheme-mode-column"),h=["light","dark"];u.forEach((y,w)=>{const E=h[w];E&&y.querySelectorAll(".dp-scheme-mapping-row").forEach(D=>{const O=D.querySelector("label"),$=D.querySelector("select");if(!O||!$)return;const Y=O.textContent.trim(),H=$.value,W=$.getAttribute("data-library-default")||"";H&&H!==W&&s.push({scheme:c,token:Y,mode:E,value:H})})})}),s}})();function re(o){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o,{once:!0}):o()}function le(){if(!document.getElementById("dev-column-overlay")){const o=document.createElement("div");o.id="dev-column-overlay",document.body.appendChild(o)}if(!document.getElementById("dev-margin-overlay")){const o=document.createElement("div");o.id="dev-margin-overlay",document.body.appendChild(o)}}function ce(){document.querySelectorAll(".grid").forEach(o=>{const t=getComputedStyle(o),e=t.gridTemplateColumns.split(" ").filter(s=>s!=="none"&&s.trim()).length;e>0&&(o.dataset.devCols=e,o.style.setProperty("--grid-columns",e));const a=t.columnGap||t.rowGap||t.gap;a&&a!=="normal"&&o.style.setProperty("--grid-gap",a)})}function de(){const o=()=>{document.body.classList.contains("dev-outline-grids")&&ce()};new MutationObserver(o).observe(document.body,{attributes:!0,attributeFilter:["class"]});let t;window.addEventListener("resize",()=>{clearTimeout(t),t=setTimeout(o,100)}),o()}re(()=>{le(),de()});
