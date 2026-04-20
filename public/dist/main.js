var ue=Object.defineProperty;var J=s=>{throw TypeError(s)};var pe=(s,t,e)=>t in s?ue(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var X=(s,t,e)=>pe(s,typeof t!="symbol"?t+"":t,e),j=(s,t,e)=>t.has(s)||J("Cannot "+e);var i=(s,t,e)=>(j(s,t,"read from private field"),e?e.call(s):t.get(s)),T=(s,t,e)=>t.has(s)?J("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(s):t.set(s,e),k=(s,t,e,n)=>(j(s,t,"write to private field"),n?n.call(s,e):t.set(s,e),e),v=(s,t,e)=>(j(s,t,"access private method"),e);class he extends HTMLElement{async connectedCallback(){const t=this.getAttribute("src");if(!t){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(t);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const n=await e.text(),o=document.createElement("template");o.innerHTML=n;const a=o.content.cloneNode(!0);this.innerHTML="",this.appendChild(a),this.querySelectorAll("script").forEach(d=>{const u=document.createElement("script");Array.from(d.attributes).forEach(b=>{u.setAttribute(b.name,b.value)}),u.textContent=d.textContent,d.parentNode.replaceChild(u,d)})}catch(e){console.error(`HtmlInclude: failed to load ${t}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",he);class me extends HTMLElement{connectedCallback(){const t=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const n=e.textContent.trim();n&&t.push(n)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&t.push(e.outerHTML);this._triggerContent=t.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var t;(t=this._abortController)==null||t.abort()}escapeHtml(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}sanitizeHref(t){return t?/^(javascript|data|vbscript):/i.test(t)?(console.warn("PopupDialog: Blocked potentially dangerous href:",t),""):t:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var t;(t=this.querySelector("dialog"))==null||t.showModal()}close(){var t;(t=this.querySelector("dialog"))==null||t.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const t=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),n=t?t.innerHTML:this.escapeHtml(this.body),o=this.escapeHtml(this.title);let a="";if(e)a=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const u=`button button--${this.escapeHtml(this.confirmVariant)}`,b=[];this.cancelLabel&&b.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&b.push(this.confirmHref?`<a href="${this.confirmHref}" class="${u}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${u}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),a=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${b.join("")}</footer>`}const c=o?`<header class="cluster cluster-between cluster-nowrap">
          <h2>${o}</h2>
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
          ${c}
          <div>${n}</div>
          ${a}
        </div>
      </dialog>
    `}setupEvents(){const t=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),n=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:o}=this._abortController;t.addEventListener("click",a=>{a.preventDefault(),e.showModal()},{signal:o}),n.addEventListener("click",()=>{e.close()},{signal:o}),e.addEventListener("click",a=>{const c=a.target.closest("[data-action]");if(c){const d=c.dataset.action;d==="cancel"||d==="close"?(a.preventDefault(),e.close()):d==="confirm"&&c.tagName!=="A"&&(a.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}a.target===e&&e.close()},{signal:o})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",me);const Z=`
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
`;let B=null;const Q=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";Q&&(B=new CSSStyleSheet,B.replaceSync(Z));const D=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],N={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},be={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},W="design-panel:state",fe=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function ge(){return D.map(s=>`
    <button type="button" class="tool" data-tool="${s.name}" aria-pressed="false" title="Toggle ${s.label} (${s.key.toUpperCase()})">
      <span class="tool-key">${s.key.toUpperCase()}</span>
      <span class="tool-label">${s.label}</span>
    </button>
  `).join("")}function ve(){return Object.entries(N).map(([s,t])=>{let e;if(t.type==="number")e=`<input type="number" data-setting="${s}" min="${t.min}" max="${t.max}" />`;else{const n=t.options.map(o=>`<option value="${o.value}">${o.label}</option>`).join("");e=`<select data-setting="${s}">${n}</select>`}return`
      <div class="setting">
        <label for="dp-setting-${s}">${t.label}</label>
        ${e.replace("data-setting=",`id="dp-setting-${s}" data-setting=`)}
      </div>
    `}).join("")}const ye=`
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
          <div class="tools">${ge()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${ve()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${fe}</button>
`;var m,E,_,S,x,r,F,te,z,U,I,K,V,oe,se,ne,ae,ie,R;class ee extends HTMLElement{constructor(){super();T(this,r);T(this,m,{...be});T(this,E,null);T(this,_,!1);T(this,S,null);T(this,x,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),Q&&B)this.shadowRoot.adoptedStyleSheets=[B];else{const e=document.createElement("style");e.textContent=Z,this.shadowRoot.appendChild(e)}}connectedCallback(){k(this,S,new AbortController),v(this,r,ie).call(this),v(this,r,F).call(this),v(this,r,te).call(this),v(this,r,I).call(this),v(this,r,se).call(this),this.inert=!this.hasAttribute("open"),v(this,r,ne).call(this),v(this,r,ae).call(this)}disconnectedCallback(){i(this,S)&&(i(this,S).abort(),k(this,S,null)),i(this,E)&&(clearTimeout(i(this,E)),k(this,E,null))}attributeChangedCallback(e,n,o){n!==o&&(e==="open"?(i(this,m).open=o!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(i(this,m).activeTab=o||"guides",i(this,_)&&v(this,r,I).call(this)):e==="overlay-target"&&v(this,r,F).call(this))}}m=new WeakMap,E=new WeakMap,_=new WeakMap,S=new WeakMap,x=new WeakMap,r=new WeakSet,F=function(){const e=this.getAttribute("overlay-target")||"body";try{k(this,x,document.querySelector(e)||document.body)}catch{k(this,x,document.body)}},te=function(){const e=document.createRange().createContextualFragment(ye);this.shadowRoot.appendChild(e),k(this,_,!0);const n=i(this,S)?i(this,S).signal:void 0,o=n?{signal:n}:void 0,a=this.shadowRoot.querySelector(".close");a&&a.addEventListener("click",()=>v(this,r,z).call(this,!1),o);const c=this.shadowRoot.querySelector(".trigger");c&&c.addEventListener("click",()=>v(this,r,z).call(this,!0),o),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(d=>{d.addEventListener("click",()=>v(this,r,U).call(this,d.dataset.tab),o)}),this.shadowRoot.querySelectorAll(".tool").forEach(d=>{d.addEventListener("click",()=>v(this,r,K).call(this,d.dataset.tool),o)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(d=>{const u=d.dataset.setting,b=N[u];if(!b)return;const A=b.type==="number"?"input":"change";d.addEventListener(A,C=>{const L=b.type==="number"?Number(C.target.value):C.target.value;v(this,r,V).call(this,u,L)},o)})},z=function(e){i(this,m).open=!!e,i(this,m).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",i(this,m).open),v(this,r,R).call(this)},U=function(e){e&&(i(this,m).activeTab=e,this.setAttribute("active-tab",e),v(this,r,I).call(this),v(this,r,R).call(this))},I=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const n=e.dataset.tab===i(this,m).activeTab;e.setAttribute("aria-selected",n?"true":"false"),e.toggleAttribute("data-active",n)})},K=function(e){const n=D.find(a=>a.name===e);if(!n)return;i(this,m)[e]=!i(this,m)[e],i(this,x)&&i(this,x).classList.toggle(n.className,i(this,m)[e]);const o=this.shadowRoot.querySelector(`[data-tool="${e}"]`);o&&(o.setAttribute("aria-pressed",i(this,m)[e]?"true":"false"),o.toggleAttribute("data-active",i(this,m)[e])),v(this,r,R).call(this)},V=function(e,n){i(this,m)[e]=n;const o=N[e];if(o){if(o.target==="cssvar")document.documentElement.style.setProperty(o.cssvar,String(n));else if(o.target==="overlayattr")i(this,x)&&i(this,x).setAttribute(o.attr,String(n));else if(o.target==="overlay-data-margin-mode"){const a=document.getElementById("dev-column-overlay"),c=document.getElementById("dev-margin-overlay");a&&a.setAttribute("data-margin-mode",String(n)),c&&c.setAttribute("data-margin-mode",String(n))}v(this,r,R).call(this)}},oe=function(e){const n=this.shadowRoot.querySelector(`[data-setting="${e}"]`);n&&n.value!==String(i(this,m)[e])&&(n.value=String(i(this,m)[e]))},se=function(){for(const e of D){const n=!!i(this,m)[e.name];i(this,x)&&i(this,x).classList.toggle(e.className,n);const o=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);o&&(o.setAttribute("aria-pressed",n?"true":"false"),o.toggleAttribute("data-active",n))}for(const e of Object.keys(N))i(this,m)[e]!==void 0&&(v(this,r,V).call(this,e,i(this,m)[e]),v(this,r,oe).call(this,e));document.body.toggleAttribute("data-panel-open",!!i(this,m).open)},ne=function(){const e=i(this,S)?i(this,S).signal:void 0,n=e?{signal:e}:void 0,o=a=>{const c=a.composedPath(),d=c&&c[0];if(d&&d.matches&&d.matches("input,textarea,[contenteditable]")||a.metaKey||a.ctrlKey||a.altKey)return;const u=(a.key||"").toLowerCase();if(!u)return;if(u==="t"){v(this,r,z).call(this,!i(this,m).open),a.preventDefault();return}const b=D.find(A=>A.key===u);b&&(v(this,r,K).call(this,b.name),a.preventDefault())};window.addEventListener("keydown",o,n)},ae=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const n=i(this,S)?i(this,S).signal:void 0,o=n?{signal:n}:void 0,a=()=>{const c=e.assignedElements(),d=new Set(c.map(u=>u.getAttribute("data-tab")).filter(u=>!!u));for(const u of this.shadowRoot.querySelectorAll('[role="tab"]')){const b=u.dataset.tab;b!=="guides"&&u.classList.toggle("hidden",!d.has(b))}i(this,m).activeTab!=="guides"&&!d.has(i(this,m).activeTab)&&v(this,r,U).call(this,"guides")};e.addEventListener("slotchange",a,o),a()},ie=function(){try{const e=localStorage.getItem(W);if(e){const n=JSON.parse(e);n&&typeof n=="object"&&Object.assign(i(this,m),n)}}catch{}i(this,m).open?this.setAttribute("open",""):this.removeAttribute("open"),i(this,m).activeTab&&this.setAttribute("active-tab",i(this,m).activeTab)},R=function(){i(this,E)&&clearTimeout(i(this,E)),k(this,E,setTimeout(()=>{try{localStorage.setItem(W,JSON.stringify(i(this,m)))}catch{}k(this,E,null)},200))},X(ee,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",ee);(function(){const s="design-panel-runtime-schemes";function t(){let o=document.getElementById(s);o||(o=document.createElement("style"),o.id=s,document.head.appendChild(o),o.sheet.insertRule("@layer tokens {}",0),o.sheet.insertRule("@layer utilities {}",1));const a={};for(let c=0;c<o.sheet.cssRules.length;c++){const d=o.sheet.cssRules[c];d.name&&(a[d.name]=d)}return a}let e=null;function n(){return e||(e=t()),e}window.__dpSchemeUpdate=function(o,a,c,d){const u=n()[d||"tokens"];if(u){for(let b=0;b<u.cssRules.length;b++)if(u.cssRules[b].selectorText===o){u.cssRules[b].style.setProperty(a,c);return}u.insertRule(o+"{"+a+":"+c+"}",u.cssRules.length)}},window.__dpSchemeReset=function(){const o=n();for(const a in o){const c=o[a];for(;c.cssRules.length>0;)c.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(a=>a.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(a=>{for(let c=0;c<a.options.length;c++)if(a.options[c].defaultSelected){a.selectedIndex=c;break}})},window.__dpSchemeSerialize=function(){const o=[];return document.querySelectorAll(".dp-scheme-card").forEach(a=>{const c=a.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!c)return;const d=c.className.replace(/^scheme-/,""),u=a.querySelectorAll(".dp-scheme-mode-column"),b=["light","dark"];u.forEach((A,C)=>{const L=b[C];L&&A.querySelectorAll(".dp-scheme-mapping-row").forEach(q=>{const O=q.querySelector("label"),H=q.querySelector("select");if(!O||!H)return;const G=O.textContent.trim(),$=H.value,P=H.getAttribute("data-library-default")||"";$&&$!==P&&o.push({scheme:d,token:G,mode:L,value:$})})})}),o}})();(function(){const s=["blue","red","orange","yellow","green","grey"],t=["50","100","200","300","400","500","600","700","800","900","950"],e=["default","subtle","accent"],n=["light","dark"],o=["bg","fg","accent","muted","subtle"],a="design-panel:schemes";let u=null,b=!1;function A(){const p=document.documentElement,l=getComputedStyle(p),f={};for(const h of s){f[h]={};for(const g of t){const y=l.getPropertyValue(`--color-${h}-${g}`).trim();f[h][g]=y||null}}return f}function C(p){for(const l of s){const f=document.querySelector(`.dp-ramp-row-wrapper[data-family="${l}"]`);if(f)for(const h of t){const g=f.querySelector(`.dp-ramp-swatch[data-step="${h}"]`);if(!g)continue;const y=p[l][h];y?g.style.backgroundColor=y:b||(console.warn(`[design-panel-colors] Missing --color-${l}-${h} token; leaving swatch unpainted.`),b=!0)}}}function L(){const p=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const l of p){for(;l.firstChild;)l.removeChild(l.firstChild);const f=document.createElement("option");f.value="",f.textContent="—",l.appendChild(f);for(const h of s){const g=h.charAt(0).toUpperCase()+h.slice(1),y=document.createElement("optgroup");y.label=g;for(const w of t){const M=document.createElement("option");M.value=`${h}-${w}`,M.textContent=`${g} ${w}`,y.appendChild(M)}l.appendChild(y)}}}function q(){let p;try{p=localStorage.getItem(a)}catch{return{}}if(!p)return{};try{const l=JSON.parse(p);return l&&typeof l=="object"?l:{}}catch{return{}}}function O(){const p=q();for(const l of e){const f=p[l];if(!(!f||typeof f!="object"))for(const h of n){const g=f[h];if(!(!g||typeof g!="object"))for(const y of o){const w=g[y];if(!w)continue;const M=document.getElementById(`dp-scheme-${l}-${h}-${y}`);M&&(M.value=w,$(l,h,y,w))}}}}function H(){const p=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const l of p)l.addEventListener("change",G)}function G(p){const l=p.currentTarget,{scheme:f,mode:h,token:g}=l.dataset;!f||!h||!g||($(f,h,g,l.value),P())}function $(p,l,f,h){if(typeof window.__dpSchemeUpdate!="function"){b||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),b=!0);return}const g=`--color-${f}`,y=h?`var(--color-${h})`:"initial";if(p==="default"){const w=l==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(w,g,y,"utilities")}else{const w=l==="dark"?`.scheme-${p}.dark-mode`:`.scheme-${p}`;window.__dpSchemeUpdate(w,g,y,"tokens")}}function P(){u&&clearTimeout(u),u=setTimeout(()=>{u=null;try{localStorage.setItem(a,JSON.stringify(re()))}catch{}},300)}function re(){const p={};for(const l of e){p[l]={light:{},dark:{}};for(const f of n)for(const h of o){const g=document.getElementById(`dp-scheme-${l}-${f}-${h}`);g&&g.value&&(p[l][f][h]=g.value)}}return p}function le(){return document.querySelector(".dp-scheme-card")?Promise.resolve():new Promise((p,l)=>{const f=new MutationObserver(()=>{document.querySelector(".dp-scheme-card")&&(g(),p())}),h=setTimeout(()=>{g(),l(new Error("Colours editor DOM not found after 5s"))},5e3);function g(){f.disconnect(),clearTimeout(h)}f.observe(document.body,{childList:!0,subtree:!0})})}function ce(){const p=document.querySelectorAll(".dp-ramp-row");for(const l of p)l.addEventListener("click",()=>{const f=l.getAttribute("aria-controls");if(!f)return;const h=document.getElementById(f);if(!h)return;h.hasAttribute("hidden")?(h.removeAttribute("hidden"),l.setAttribute("aria-expanded","true")):(h.setAttribute("hidden",""),l.setAttribute("aria-expanded","false"))})}function de(){const p=A();C(p),L(),O(),H(),ce()}function Y(){le().then(de).catch(p=>{console.warn(`[design-panel-colors] init skipped: ${p.message}`)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Y,{once:!0}):Y()})();function Se(s){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",s,{once:!0}):s()}function xe(){if(!document.getElementById("dev-column-overlay")){const s=document.createElement("div");s.id="dev-column-overlay",document.body.appendChild(s)}if(!document.getElementById("dev-margin-overlay")){const s=document.createElement("div");s.id="dev-margin-overlay",document.body.appendChild(s)}}function we(){document.querySelectorAll(".grid").forEach(s=>{const t=getComputedStyle(s),e=t.gridTemplateColumns.split(" ").filter(o=>o!=="none"&&o.trim()).length;e>0&&(s.dataset.devCols=e,s.style.setProperty("--grid-columns",e));const n=t.columnGap||t.rowGap||t.gap;n&&n!=="normal"&&s.style.setProperty("--grid-gap",n)})}function Ee(){const s=()=>{document.body.classList.contains("dev-outline-grids")&&we()};new MutationObserver(s).observe(document.body,{attributes:!0,attributeFilter:["class"]});let t;window.addEventListener("resize",()=>{clearTimeout(t),t=setTimeout(s,100)}),s()}Se(()=>{xe(),Ee()});
