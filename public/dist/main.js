var de=Object.defineProperty;var J=s=>{throw TypeError(s)};var ue=(s,t,e)=>t in s?de(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var X=(s,t,e)=>ue(s,typeof t!="symbol"?t+"":t,e),j=(s,t,e)=>t.has(s)||J("Cannot "+e);var i=(s,t,e)=>(j(s,t,"read from private field"),e?e.call(s):t.get(s)),A=(s,t,e)=>t.has(s)?J("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(s):t.set(s,e),k=(s,t,e,n)=>(j(s,t,"write to private field"),n?n.call(s,e):t.set(s,e),e),v=(s,t,e)=>(j(s,t,"access private method"),e);class pe extends HTMLElement{async connectedCallback(){const t=this.getAttribute("src");if(!t){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(t);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const n=await e.text(),o=document.createElement("template");o.innerHTML=n;const a=o.content.cloneNode(!0);this.innerHTML="",this.appendChild(a),this.querySelectorAll("script").forEach(c=>{const d=document.createElement("script");Array.from(c.attributes).forEach(m=>{d.setAttribute(m.name,m.value)}),d.textContent=c.textContent,c.parentNode.replaceChild(d,c)})}catch(e){console.error(`HtmlInclude: failed to load ${t}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",pe);class he extends HTMLElement{connectedCallback(){const t=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const n=e.textContent.trim();n&&t.push(n)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&t.push(e.outerHTML);this._triggerContent=t.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var t;(t=this._abortController)==null||t.abort()}escapeHtml(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}sanitizeHref(t){return t?/^(javascript|data|vbscript):/i.test(t)?(console.warn("PopupDialog: Blocked potentially dangerous href:",t),""):t:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var t;(t=this.querySelector("dialog"))==null||t.showModal()}close(){var t;(t=this.querySelector("dialog"))==null||t.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const t=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),n=t?t.innerHTML:this.escapeHtml(this.body),o=this.escapeHtml(this.title);let a="";if(e)a=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const d=`button button--${this.escapeHtml(this.confirmVariant)}`,m=[];this.cancelLabel&&m.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&m.push(this.confirmHref?`<a href="${this.confirmHref}" class="${d}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${d}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),a=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${m.join("")}</footer>`}const l=o?`<header class="cluster cluster-between cluster-nowrap">
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
          ${l}
          <div>${n}</div>
          ${a}
        </div>
      </dialog>
    `}setupEvents(){const t=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),n=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:o}=this._abortController;t.addEventListener("click",a=>{a.preventDefault(),e.showModal()},{signal:o}),n.addEventListener("click",()=>{e.close()},{signal:o}),e.addEventListener("click",a=>{const l=a.target.closest("[data-action]");if(l){const c=l.dataset.action;c==="cancel"||c==="close"?(a.preventDefault(),e.close()):c==="confirm"&&l.tagName!=="A"&&(a.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}a.target===e&&e.close()},{signal:o})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",he);const Z=`
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
`;let B=null;const Q=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";Q&&(B=new CSSStyleSheet,B.replaceSync(Z));const D=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],N={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},me={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},W="design-panel:state",be=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function fe(){return D.map(s=>`
    <button type="button" class="tool" data-tool="${s.name}" aria-pressed="false" title="Toggle ${s.label} (${s.key.toUpperCase()})">
      <span class="tool-key">${s.key.toUpperCase()}</span>
      <span class="tool-label">${s.label}</span>
    </button>
  `).join("")}function ge(){return Object.entries(N).map(([s,t])=>{let e;if(t.type==="number")e=`<input type="number" data-setting="${s}" min="${t.min}" max="${t.max}" />`;else{const n=t.options.map(o=>`<option value="${o.value}">${o.label}</option>`).join("");e=`<select data-setting="${s}">${n}</select>`}return`
      <div class="setting">
        <label for="dp-setting-${s}">${t.label}</label>
        ${e.replace("data-setting=",`id="dp-setting-${s}" data-setting=`)}
      </div>
    `}).join("")}const ve=`
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
          <div class="tools">${fe()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${ge()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${be}</button>
`;var p,E,O,S,x,r,F,te,z,U,I,K,V,oe,se,ne,ae,ie,H;class ee extends HTMLElement{constructor(){super();A(this,r);A(this,p,{...me});A(this,E,null);A(this,O,!1);A(this,S,null);A(this,x,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),Q&&B)this.shadowRoot.adoptedStyleSheets=[B];else{const e=document.createElement("style");e.textContent=Z,this.shadowRoot.appendChild(e)}}connectedCallback(){k(this,S,new AbortController),v(this,r,ie).call(this),v(this,r,F).call(this),v(this,r,te).call(this),v(this,r,I).call(this),v(this,r,se).call(this),this.inert=!this.hasAttribute("open"),v(this,r,ne).call(this),v(this,r,ae).call(this)}disconnectedCallback(){i(this,S)&&(i(this,S).abort(),k(this,S,null)),i(this,E)&&(clearTimeout(i(this,E)),k(this,E,null))}attributeChangedCallback(e,n,o){n!==o&&(e==="open"?(i(this,p).open=o!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(i(this,p).activeTab=o||"guides",i(this,O)&&v(this,r,I).call(this)):e==="overlay-target"&&v(this,r,F).call(this))}}p=new WeakMap,E=new WeakMap,O=new WeakMap,S=new WeakMap,x=new WeakMap,r=new WeakSet,F=function(){const e=this.getAttribute("overlay-target")||"body";try{k(this,x,document.querySelector(e)||document.body)}catch{k(this,x,document.body)}},te=function(){const e=document.createRange().createContextualFragment(ve);this.shadowRoot.appendChild(e),k(this,O,!0);const n=i(this,S)?i(this,S).signal:void 0,o=n?{signal:n}:void 0,a=this.shadowRoot.querySelector(".close");a&&a.addEventListener("click",()=>v(this,r,z).call(this,!1),o);const l=this.shadowRoot.querySelector(".trigger");l&&l.addEventListener("click",()=>v(this,r,z).call(this,!0),o),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(c=>{c.addEventListener("click",()=>v(this,r,U).call(this,c.dataset.tab),o)}),this.shadowRoot.querySelectorAll(".tool").forEach(c=>{c.addEventListener("click",()=>v(this,r,K).call(this,c.dataset.tool),o)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(c=>{const d=c.dataset.setting,m=N[d];if(!m)return;const T=m.type==="number"?"input":"change";c.addEventListener(T,C=>{const L=m.type==="number"?Number(C.target.value):C.target.value;v(this,r,V).call(this,d,L)},o)})},z=function(e){i(this,p).open=!!e,i(this,p).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",i(this,p).open),v(this,r,H).call(this)},U=function(e){e&&(i(this,p).activeTab=e,this.setAttribute("active-tab",e),v(this,r,I).call(this),v(this,r,H).call(this))},I=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const n=e.dataset.tab===i(this,p).activeTab;e.setAttribute("aria-selected",n?"true":"false"),e.toggleAttribute("data-active",n)})},K=function(e){const n=D.find(a=>a.name===e);if(!n)return;i(this,p)[e]=!i(this,p)[e],i(this,x)&&i(this,x).classList.toggle(n.className,i(this,p)[e]);const o=this.shadowRoot.querySelector(`[data-tool="${e}"]`);o&&(o.setAttribute("aria-pressed",i(this,p)[e]?"true":"false"),o.toggleAttribute("data-active",i(this,p)[e])),v(this,r,H).call(this)},V=function(e,n){i(this,p)[e]=n;const o=N[e];if(o){if(o.target==="cssvar")document.documentElement.style.setProperty(o.cssvar,String(n));else if(o.target==="overlayattr")i(this,x)&&i(this,x).setAttribute(o.attr,String(n));else if(o.target==="overlay-data-margin-mode"){const a=document.getElementById("dev-column-overlay"),l=document.getElementById("dev-margin-overlay");a&&a.setAttribute("data-margin-mode",String(n)),l&&l.setAttribute("data-margin-mode",String(n))}v(this,r,H).call(this)}},oe=function(e){const n=this.shadowRoot.querySelector(`[data-setting="${e}"]`);n&&n.value!==String(i(this,p)[e])&&(n.value=String(i(this,p)[e]))},se=function(){for(const e of D){const n=!!i(this,p)[e.name];i(this,x)&&i(this,x).classList.toggle(e.className,n);const o=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);o&&(o.setAttribute("aria-pressed",n?"true":"false"),o.toggleAttribute("data-active",n))}for(const e of Object.keys(N))i(this,p)[e]!==void 0&&(v(this,r,V).call(this,e,i(this,p)[e]),v(this,r,oe).call(this,e));document.body.toggleAttribute("data-panel-open",!!i(this,p).open)},ne=function(){const e=i(this,S)?i(this,S).signal:void 0,n=e?{signal:e}:void 0,o=a=>{const l=a.composedPath(),c=l&&l[0];if(c&&c.matches&&c.matches("input,textarea,[contenteditable]")||a.metaKey||a.ctrlKey||a.altKey)return;const d=(a.key||"").toLowerCase();if(!d)return;if(d==="t"){v(this,r,z).call(this,!i(this,p).open),a.preventDefault();return}const m=D.find(T=>T.key===d);m&&(v(this,r,K).call(this,m.name),a.preventDefault())};window.addEventListener("keydown",o,n)},ae=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const n=i(this,S)?i(this,S).signal:void 0,o=n?{signal:n}:void 0,a=()=>{const l=e.assignedElements(),c=new Set(l.map(d=>d.getAttribute("data-tab")).filter(d=>!!d));for(const d of this.shadowRoot.querySelectorAll('[role="tab"]')){const m=d.dataset.tab;m!=="guides"&&d.classList.toggle("hidden",!c.has(m))}i(this,p).activeTab!=="guides"&&!c.has(i(this,p).activeTab)&&v(this,r,U).call(this,"guides")};e.addEventListener("slotchange",a,o),a()},ie=function(){try{const e=localStorage.getItem(W);if(e){const n=JSON.parse(e);n&&typeof n=="object"&&Object.assign(i(this,p),n)}}catch{}i(this,p).open?this.setAttribute("open",""):this.removeAttribute("open"),i(this,p).activeTab&&this.setAttribute("active-tab",i(this,p).activeTab)},H=function(){i(this,E)&&clearTimeout(i(this,E)),k(this,E,setTimeout(()=>{try{localStorage.setItem(W,JSON.stringify(i(this,p)))}catch{}k(this,E,null)},200))},X(ee,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",ee);(function(){const s="design-panel-runtime-schemes";function t(){let o=document.getElementById(s);o||(o=document.createElement("style"),o.id=s,document.head.appendChild(o),o.sheet.insertRule("@layer tokens {}",0),o.sheet.insertRule("@layer utilities {}",1));const a={};for(let l=0;l<o.sheet.cssRules.length;l++){const c=o.sheet.cssRules[l];c.name&&(a[c.name]=c)}return a}let e=null;function n(){return e||(e=t()),e}window.__dpSchemeUpdate=function(o,a,l,c){const d=n()[c||"tokens"];if(d){for(let m=0;m<d.cssRules.length;m++)if(d.cssRules[m].selectorText===o){d.cssRules[m].style.setProperty(a,l);return}d.insertRule(o+"{"+a+":"+l+"}",d.cssRules.length)}},window.__dpSchemeReset=function(){const o=n();for(const a in o){const l=o[a];for(;l.cssRules.length>0;)l.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(a=>a.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(a=>{for(let l=0;l<a.options.length;l++)if(a.options[l].defaultSelected){a.selectedIndex=l;break}})},window.__dpSchemeSerialize=function(){const o=[];return document.querySelectorAll(".dp-scheme-card").forEach(a=>{const l=a.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!l)return;const c=l.className.replace(/^scheme-/,""),d=a.querySelectorAll(".dp-scheme-mode-column"),m=["light","dark"];d.forEach((T,C)=>{const L=m[C];L&&T.querySelectorAll(".dp-scheme-mapping-row").forEach(R=>{const q=R.querySelector("label"),_=R.querySelector("select");if(!q||!_)return;const G=q.textContent.trim(),$=_.value,P=_.getAttribute("data-library-default")||"";$&&$!==P&&o.push({scheme:c,token:G,mode:L,value:$})})})}),o}})();(function(){const s=["blue","red","orange","yellow","green","grey"],t=["50","100","200","300","400","500","600","700","800","900","950"],e=["default","subtle","accent"],n=["light","dark"],o=["bg","fg","accent","muted","subtle"],a="design-panel:schemes";let d=null,m=!1;function T(){const h=document.documentElement,u=getComputedStyle(h),f={};for(const b of s){f[b]={};for(const g of t){const y=u.getPropertyValue(`--color-${b}-${g}`).trim();f[b][g]=y||null}}return f}function C(h){for(const u of s){const f=document.querySelector(`.dp-ramp-row-wrapper[data-family="${u}"]`);if(f)for(const b of t){const g=f.querySelector(`.dp-ramp-swatch[data-step="${b}"]`);if(!g)continue;const y=h[u][b];y?g.style.backgroundColor=y:m||(console.warn(`[design-panel-colors] Missing --color-${u}-${b} token; leaving swatch unpainted.`),m=!0)}}}function L(){const h=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const u of h){for(;u.firstChild;)u.removeChild(u.firstChild);const f=document.createElement("option");f.value="",f.textContent="—",u.appendChild(f);for(const b of s){const g=b.charAt(0).toUpperCase()+b.slice(1),y=document.createElement("optgroup");y.label=g;for(const w of t){const M=document.createElement("option");M.value=`${b}-${w}`,M.textContent=`${g} ${w}`,y.appendChild(M)}u.appendChild(y)}}}function R(){let h;try{h=localStorage.getItem(a)}catch{return{}}if(!h)return{};try{const u=JSON.parse(h);return u&&typeof u=="object"?u:{}}catch{return{}}}function q(){const h=R();for(const u of e){const f=h[u];if(!(!f||typeof f!="object"))for(const b of n){const g=f[b];if(!(!g||typeof g!="object"))for(const y of o){const w=g[y];if(!w)continue;const M=document.getElementById(`dp-scheme-${u}-${b}-${y}`);M&&(M.value=w,$(u,b,y,w))}}}}function _(){const h=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const u of h)u.addEventListener("change",G)}function G(h){const u=h.currentTarget,{scheme:f,mode:b,token:g}=u.dataset;!f||!b||!g||($(f,b,g,u.value),P())}function $(h,u,f,b){if(typeof window.__dpSchemeUpdate!="function"){m||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),m=!0);return}const g=`--color-${f}`,y=b?`var(--color-${b})`:"initial";if(h==="default"){const w=u==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(w,g,y,"utilities")}else{const w=u==="dark"?`.scheme-${h}.dark-mode`:`.scheme-${h}`;window.__dpSchemeUpdate(w,g,y,"tokens")}}function P(){d&&clearTimeout(d),d=setTimeout(()=>{d=null;try{localStorage.setItem(a,JSON.stringify(re()))}catch{}},300)}function re(){const h={};for(const u of e){h[u]={light:{},dark:{}};for(const f of n)for(const b of o){const g=document.getElementById(`dp-scheme-${u}-${f}-${b}`);g&&g.value&&(h[u][f][b]=g.value)}}return h}function le(){return document.querySelector(".dp-scheme-card")?Promise.resolve():new Promise((h,u)=>{const f=new MutationObserver(()=>{document.querySelector(".dp-scheme-card")&&(g(),h())}),b=setTimeout(()=>{g(),u(new Error("Colours editor DOM not found after 5s"))},5e3);function g(){f.disconnect(),clearTimeout(b)}f.observe(document.body,{childList:!0,subtree:!0})})}function ce(){const h=T();C(h),L(),q(),_()}function Y(){le().then(ce).catch(h=>{console.warn(`[design-panel-colors] init skipped: ${h.message}`)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Y,{once:!0}):Y()})();function ye(s){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",s,{once:!0}):s()}function Se(){if(!document.getElementById("dev-column-overlay")){const s=document.createElement("div");s.id="dev-column-overlay",document.body.appendChild(s)}if(!document.getElementById("dev-margin-overlay")){const s=document.createElement("div");s.id="dev-margin-overlay",document.body.appendChild(s)}}function xe(){document.querySelectorAll(".grid").forEach(s=>{const t=getComputedStyle(s),e=t.gridTemplateColumns.split(" ").filter(o=>o!=="none"&&o.trim()).length;e>0&&(s.dataset.devCols=e,s.style.setProperty("--grid-columns",e));const n=t.columnGap||t.rowGap||t.gap;n&&n!=="normal"&&s.style.setProperty("--grid-gap",n)})}function we(){const s=()=>{document.body.classList.contains("dev-outline-grids")&&xe()};new MutationObserver(s).observe(document.body,{attributes:!0,attributeFilter:["class"]});let t;window.addEventListener("resize",()=>{clearTimeout(t),t=setTimeout(s,100)}),s()}ye(()=>{Se(),we()});
