var Ze=Object.defineProperty;var me=t=>{throw TypeError(t)};var Qe=(t,o,e)=>o in t?Ze(t,o,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[o]=e;var fe=(t,o,e)=>Qe(t,typeof o!="symbol"?o+"":o,e),J=(t,o,e)=>o.has(t)||me("Cannot "+e);var d=(t,o,e)=>(J(t,o,"read from private field"),e?e.call(t):o.get(t)),N=(t,o,e)=>o.has(t)?me("Cannot add the same private member more than once"):o instanceof WeakSet?o.add(t):o.set(t,e),$=(t,o,e,s)=>(J(t,o,"write to private field"),s?s.call(t,e):o.set(t,e),e),v=(t,o,e)=>(J(t,o,"access private method"),e);class et extends HTMLElement{async connectedCallback(){const o=this.getAttribute("src");if(!o){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(o);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const s=await e.text(),n=document.createElement("template");n.innerHTML=s;const r=n.content.cloneNode(!0);this.innerHTML="",this.appendChild(r),this.querySelectorAll("script").forEach(m=>{const p=document.createElement("script");Array.from(m.attributes).forEach(f=>{p.setAttribute(f.name,f.value)}),p.textContent=m.textContent,m.parentNode.replaceChild(p,m)})}catch(e){console.error(`HtmlInclude: failed to load ${o}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",et);class tt extends HTMLElement{connectedCallback(){const o=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const s=e.textContent.trim();s&&o.push(s)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&o.push(e.outerHTML);this._triggerContent=o.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var o;(o=this._abortController)==null||o.abort()}escapeHtml(o){const e=document.createElement("div");return e.textContent=o,e.innerHTML}sanitizeHref(o){return o?/^(javascript|data|vbscript):/i.test(o)?(console.warn("PopupDialog: Blocked potentially dangerous href:",o),""):o:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var o;(o=this.querySelector("dialog"))==null||o.showModal()}close(){var o;(o=this.querySelector("dialog"))==null||o.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const o=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),s=o?o.innerHTML:this.escapeHtml(this.body),n=this.escapeHtml(this.title);let r="";if(e)r=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const p=`button button--${this.escapeHtml(this.confirmVariant)}`,f=[];this.cancelLabel&&f.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&f.push(this.confirmHref?`<a href="${this.confirmHref}" class="${p}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${p}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),r=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${f.join("")}</footer>`}const h=n?`<header class="cluster cluster-between cluster-nowrap">
          <h2>${n}</h2>
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
          ${h}
          <div>${s}</div>
          ${r}
        </div>
      </dialog>
    `}setupEvents(){const o=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),s=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:n}=this._abortController;o.addEventListener("click",r=>{r.preventDefault(),e.showModal()},{signal:n}),s.addEventListener("click",()=>{e.close()},{signal:n}),e.addEventListener("click",r=>{const h=r.target.closest("[data-action]");if(h){const m=h.dataset.action;m==="cancel"||m==="close"?(r.preventDefault(),e.close()):m==="confirm"&&h.tagName!=="A"&&(r.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}r.target===e&&e.close()},{signal:n})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",tt);const ge=`
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
`;let V=null;const ye=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";ye&&(V=new CSSStyleSheet,V.replaceSync(ge));const G=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],z={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},ot={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},be="design-panel:state",nt=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function st(){return G.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function rt(){return Object.entries(z).map(([t,o])=>{let e;if(o.type==="number")e=`<input type="number" data-setting="${t}" min="${o.min}" max="${o.max}" />`;else{const s=o.options.map(n=>`<option value="${n.value}">${n.label}</option>`).join("");e=`<select data-setting="${t}">${s}</select>`}return`
      <div class="setting">
        <label for="dp-setting-${t}">${o.label}</label>
        ${e.replace("data-setting=",`id="dp-setting-${t}" data-setting=`)}
      </div>
    `}).join("")}const at=`
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
          <div class="tools">${st()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${rt()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${nt}</button>
`;var y,A,q,w,E,b,ee,Se,j,te,F,oe,ne,xe,we,Ee,Ce,Te,P;class ve extends HTMLElement{constructor(){super();N(this,b);N(this,y,{...ot});N(this,A,null);N(this,q,!1);N(this,w,null);N(this,E,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),ye&&V)this.shadowRoot.adoptedStyleSheets=[V];else{const e=document.createElement("style");e.textContent=ge,this.shadowRoot.appendChild(e)}}connectedCallback(){$(this,w,new AbortController),v(this,b,Te).call(this),v(this,b,ee).call(this),v(this,b,Se).call(this),v(this,b,F).call(this),v(this,b,we).call(this),this.inert=!this.hasAttribute("open"),v(this,b,Ee).call(this),v(this,b,Ce).call(this)}disconnectedCallback(){d(this,w)&&(d(this,w).abort(),$(this,w,null)),d(this,A)&&(clearTimeout(d(this,A)),$(this,A,null))}attributeChangedCallback(e,s,n){s!==n&&(e==="open"?(d(this,y).open=n!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(d(this,y).activeTab=n||"guides",d(this,q)&&v(this,b,F).call(this)):e==="overlay-target"&&v(this,b,ee).call(this))}}y=new WeakMap,A=new WeakMap,q=new WeakMap,w=new WeakMap,E=new WeakMap,b=new WeakSet,ee=function(){const e=this.getAttribute("overlay-target")||"body";try{$(this,E,document.querySelector(e)||document.body)}catch{$(this,E,document.body)}},Se=function(){const e=document.createRange().createContextualFragment(at);this.shadowRoot.appendChild(e),$(this,q,!0);const s=d(this,w)?d(this,w).signal:void 0,n=s?{signal:s}:void 0,r=this.shadowRoot.querySelector(".close");r&&r.addEventListener("click",()=>v(this,b,j).call(this,!1),n);const h=this.shadowRoot.querySelector(".trigger");h&&h.addEventListener("click",()=>v(this,b,j).call(this,!0),n),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(m=>{m.addEventListener("click",()=>v(this,b,te).call(this,m.dataset.tab),n)}),this.shadowRoot.querySelectorAll(".tool").forEach(m=>{m.addEventListener("click",()=>v(this,b,oe).call(this,m.dataset.tool),n)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(m=>{const p=m.dataset.setting,f=z[p];if(!f)return;const k=f.type==="number"?"input":"change";m.addEventListener(k,L=>{const C=f.type==="number"?Number(L.target.value):L.target.value;v(this,b,ne).call(this,p,C)},n)})},j=function(e){d(this,y).open=!!e,d(this,y).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",d(this,y).open),v(this,b,P).call(this)},te=function(e){e&&(d(this,y).activeTab=e,this.setAttribute("active-tab",e),v(this,b,F).call(this),v(this,b,P).call(this))},F=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const s=e.dataset.tab===d(this,y).activeTab;e.setAttribute("aria-selected",s?"true":"false"),e.toggleAttribute("data-active",s)})},oe=function(e){const s=G.find(r=>r.name===e);if(!s)return;d(this,y)[e]=!d(this,y)[e],d(this,E)&&d(this,E).classList.toggle(s.className,d(this,y)[e]);const n=this.shadowRoot.querySelector(`[data-tool="${e}"]`);n&&(n.setAttribute("aria-pressed",d(this,y)[e]?"true":"false"),n.toggleAttribute("data-active",d(this,y)[e])),v(this,b,P).call(this)},ne=function(e,s){d(this,y)[e]=s;const n=z[e];if(n){if(n.target==="cssvar")document.documentElement.style.setProperty(n.cssvar,String(s));else if(n.target==="overlayattr")d(this,E)&&d(this,E).setAttribute(n.attr,String(s));else if(n.target==="overlay-data-margin-mode"){const r=document.getElementById("dev-column-overlay"),h=document.getElementById("dev-margin-overlay");r&&r.setAttribute("data-margin-mode",String(s)),h&&h.setAttribute("data-margin-mode",String(s))}v(this,b,P).call(this)}},xe=function(e){const s=this.shadowRoot.querySelector(`[data-setting="${e}"]`);s&&s.value!==String(d(this,y)[e])&&(s.value=String(d(this,y)[e]))},we=function(){for(const e of G){const s=!!d(this,y)[e.name];d(this,E)&&d(this,E).classList.toggle(e.className,s);const n=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);n&&(n.setAttribute("aria-pressed",s?"true":"false"),n.toggleAttribute("data-active",s))}for(const e of Object.keys(z))d(this,y)[e]!==void 0&&(v(this,b,ne).call(this,e,d(this,y)[e]),v(this,b,xe).call(this,e));document.body.toggleAttribute("data-panel-open",!!d(this,y).open)},Ee=function(){const e=d(this,w)?d(this,w).signal:void 0,s=e?{signal:e}:void 0,n=r=>{const h=r.composedPath(),m=h&&h[0];if(m&&m.matches&&m.matches("input,textarea,[contenteditable]")||r.metaKey||r.ctrlKey||r.altKey)return;const p=(r.key||"").toLowerCase();if(!p)return;if(p==="t"){v(this,b,j).call(this,!d(this,y).open),r.preventDefault();return}const f=G.find(k=>k.key===p);f&&(v(this,b,oe).call(this,f.name),r.preventDefault())};window.addEventListener("keydown",n,s)},Ce=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const s=d(this,w)?d(this,w).signal:void 0,n=s?{signal:s}:void 0,r=()=>{const h=e.assignedElements(),m=new Set(h.map(p=>p.getAttribute("data-tab")).filter(p=>!!p));for(const p of this.shadowRoot.querySelectorAll('[role="tab"]')){const f=p.dataset.tab;f!=="guides"&&p.classList.toggle("hidden",!m.has(f))}d(this,y).activeTab!=="guides"&&!m.has(d(this,y).activeTab)&&v(this,b,te).call(this,"guides")};e.addEventListener("slotchange",r,n),r()},Te=function(){try{const e=localStorage.getItem(be);if(e){const s=JSON.parse(e);s&&typeof s=="object"&&Object.assign(d(this,y),s)}}catch{}d(this,y).open?this.setAttribute("open",""):this.removeAttribute("open"),d(this,y).activeTab&&this.setAttribute("active-tab",d(this,y).activeTab)},P=function(){d(this,A)&&clearTimeout(d(this,A)),$(this,A,setTimeout(()=>{try{localStorage.setItem(be,JSON.stringify(d(this,y)))}catch{}$(this,A,null)},200))},fe(ve,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",ve);(function(){const t="design-panel-runtime-schemes";function o(){let n=document.getElementById(t);n||(n=document.createElement("style"),n.id=t,document.head.appendChild(n),n.sheet.insertRule("@layer tokens {}",0),n.sheet.insertRule("@layer utilities {}",1));const r={};for(let h=0;h<n.sheet.cssRules.length;h++){const m=n.sheet.cssRules[h];m.name&&(r[m.name]=m)}return r}let e=null;function s(){return e||(e=o()),e}window.__dpSchemeUpdate=function(n,r,h,m){const p=s()[m||"tokens"];if(p){for(let f=0;f<p.cssRules.length;f++)if(p.cssRules[f].selectorText===n){p.cssRules[f].style.setProperty(r,h);return}p.insertRule(n+"{"+r+":"+h+"}",p.cssRules.length)}},window.__dpSchemeReset=function(){const n=s();for(const r in n){const h=n[r];for(;h.cssRules.length>0;)h.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(r=>r.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(r=>{for(let h=0;h<r.options.length;h++)if(r.options[h].defaultSelected){r.selectedIndex=h;break}})},window.__dpSchemeSerialize=function(){const n=[];return document.querySelectorAll(".dp-scheme-card").forEach(r=>{const h=r.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!h)return;const m=h.className.replace(/^scheme-/,""),p=r.querySelectorAll(".dp-scheme-mode-column"),f=["light","dark"];p.forEach((k,L)=>{const C=f[L];C&&k.querySelectorAll(".dp-scheme-mapping-row").forEach(H=>{const R=H.querySelector("label"),x=H.querySelector("select");if(!R||!x)return;const _=R.textContent.trim(),O=x.value,M=x.getAttribute("data-library-default")||"";O&&O!==M&&n.push({scheme:m,token:_,mode:C,value:O})})})}),n}})();function Ae(t){const o=String(t).replace(/^#/,"");if(o.length!==6||/[^0-9a-fA-F]/.test(o))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(o,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function W(t){if(!Number.isFinite(t))return 0;const o=Math.round(t*255);return o<0?0:o>255?255:o}function ke({R:t,G:o,B:e}){const s=W(t),n=W(o),r=W(e);return"#"+s.toString(16).padStart(2,"0")+n.toString(16).padStart(2,"0")+r.toString(16).padStart(2,"0")}function X(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function Z(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function Le({R:t,G:o,B:e}){return{R:X(t),G:X(o),B:X(e)}}function Re({R:t,G:o,B:e}){return{R:Z(t),G:Z(o),B:Z(e)}}function Q(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function $e({R:t,G:o,B:e}){let s=.4122214708*t+.5363325363*o+.0514459929*e,n=.2119034982*t+.6806995451*o+.1073969566*e,r=.0883024619*t+.2817188376*o+.6299787005*e;s=Q(s),n=Q(n),r=Q(r);const h=.2104542553*s+.793617785*n-.0040720468*r,m=1.9779984951*s-2.428592205*n+.4505937099*r,p=.0259040371*s+.7827717662*n-.808675766*r;return{L:h,a:m,b:p}}function se({L:t,a:o,b:e}){let s=t+.3963377774*o+.2158037573*e,n=t-.1055613458*o-.0638541728*e,r=t-.0894841775*o-1.291485548*e;s=s*s*s,n=n*n*n,r=r*r*r;const h=4.0767416621*s-3.3077115913*n+.2309699292*r,m=-1.2684380046*s+2.6097574011*n-.3413193965*r,p=-.0041960863*s-.7034186147*n+1.707614701*r;return{R:h,G:m,B:p}}function He({L:t,a:o,b:e}){const s=Math.sqrt(o*o+e*e),r=(Math.atan2(e,o)*180/Math.PI%360+360)%360;return{L:t,C:s,H:r}}function re({L:t,C:o,H:e}){const s=e*Math.PI/180;return{L:t,a:o*Math.cos(s),b:o*Math.sin(s)}}function Oe(t){return He($e(Le(Ae(t))))}function U({L:t,C:o,H:e}){return ke(Re(se(re({L:t,C:o,H:e}))))}function ae({L:t,C:o,H:e}){const s=re({L:t,C:o,H:e}),n=se(s),r=.002;return n.R>=-r&&n.R<=1+r&&n.G>=-r&&n.G<=1+r&&n.B>=-r&&n.B<=1+r}function ie(t,o){let e=0,s=.4;for(let n=0;n<40;n++){const r=(e+s)/2;ae({L:t,C:r,H:o})?e=r:s=r}return e}function K({L:t,C:o,H:e}){return ae({L:t,C:o,H:e})?{L:t,C:o,H:e}:{L:t,C:ie(t,e),H:e}}function Me(t,o,e){return t<o?o:t>e?e:t}function it(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:Ae,sRGBToHex:ke,sRGBToLinearRGB:Le,linearRGBToSRGB:Re,linearRGBToOKLab:$e,oklabToLinearRGB:se,oklabToOKLCH:He,oklchToOKLab:re,hexToOKLCH:Oe,oklchToHex:U,isInSRGBGamut:ae,maxChromaSRGB:ie,clampChroma:K,clampFloat:Me}))}const _e=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),lt=Object.freeze(["blue","red","orange","yellow","green","grey"]),Ne=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),De=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function ct(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const o=Oe(t.anchorHex),e=t.lTargets||Ne,s=t.chromaProfile||De,n=t.overrides||{},r=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const h=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,m=o.L-h,p=[];for(const f of _e){if(Object.prototype.hasOwnProperty.call(n,f)){const[x,_,O]=n[f],M=K({L:x,C:_,H:O});p.push({step:f,hex:U(M),L:M.L,C:M.C,H:M.H});continue}if(f===t.anchorStep){const x=K(o);p.push({step:f,hex:U(x),L:x.L,C:x.C,H:x.H});continue}const k=Object.prototype.hasOwnProperty.call(e,f)?e[f]:.58,L=Me(k+m,.06,.985);let C=r?r(f):o.H,H;if(t.isNeutral)H=t.neutralChroma,C=t.neutralHue;else{const x=ie(L,C),_=Object.prototype.hasOwnProperty.call(s,f)?s[f]:.5;H=x*_}const R=K({L,C:H,H:C});p.push({step:f,hex:U(R),L:R.L,C:R.C,H:R.H})}return p}function dt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:_e,FAMILY_NAMES:lt,DEFAULT_L_TARGETS:Ne,DEFAULT_CHROMA_PROFILE:De,generateRamp:ct}))}(function(){const t=["blue","red","orange","yellow","green","grey"],o=["50","100","200","300","400","500","600","700","800","900","950"],e=["default","subtle","accent"],s=["light","dark"],n=["bg","fg","accent","muted","subtle"],r="design-panel:schemes";let p=null,f=!1;function k(){const i=document.documentElement,a=getComputedStyle(i),c={};for(const l of t){c[l]={};for(const u of o){const g=a.getPropertyValue(`--color-${l}-${u}`).trim();c[l][u]=g||null}}return c}function L(i){for(const a of t){const c=document.querySelector(`.dp-ramp-row-wrapper[data-family="${a}"]`);if(c)for(const l of o){const u=c.querySelector(`.dp-ramp-swatch[data-step="${l}"]`);if(!u)continue;const g=i[a][l];g?u.style.backgroundColor=g:f||(console.warn(`[design-panel-colors] Missing --color-${a}-${l} token; leaving swatch unpainted.`),f=!0)}}}function C(){const i=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const a of i){for(;a.firstChild;)a.removeChild(a.firstChild);const c=document.createElement("option");c.value="",c.textContent="—",a.appendChild(c);for(const l of t){const u=l.charAt(0).toUpperCase()+l.slice(1),g=document.createElement("optgroup");g.label=u;for(const S of o){const T=document.createElement("option");T.value=`${l}-${S}`,T.textContent=`${u} ${S}`,g.appendChild(T)}a.appendChild(g)}}}function H(){let i;try{i=localStorage.getItem(r)}catch{return{}}if(!i)return{};try{const a=JSON.parse(i);return a&&typeof a=="object"?a:{}}catch{return{}}}function R(){const i=H();for(const a of e){const c=i[a];if(!(!c||typeof c!="object"))for(const l of s){const u=c[l];if(!(!u||typeof u!="object"))for(const g of n){const S=u[g];if(!S)continue;const T=document.getElementById(`dp-scheme-${a}-${l}-${g}`);T&&(T.value=S,O(a,l,g,S))}}}}function x(){const i=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const a of i)a.addEventListener("change",_)}function _(i){const a=i.currentTarget,{scheme:c,mode:l,token:u}=a.dataset;!c||!l||!u||(O(c,l,u,a.value),M())}function O(i,a,c,l){if(typeof window.__dpSchemeUpdate!="function"){f||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),f=!0);return}const u=`--color-${c}`,g=l?`var(--color-${l})`:"initial";if(i==="default"){const S=a==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(S,u,g,"utilities")}else{const S=a==="dark"?`.scheme-${i}.dark-mode`:`.scheme-${i}`;window.__dpSchemeUpdate(S,u,g,"tokens")}}function M(){p&&clearTimeout(p),p=setTimeout(()=>{p=null;try{localStorage.setItem(r,JSON.stringify(Pe()))}catch{}},300)}function Pe(){const i={};for(const a of e){i[a]={light:{},dark:{}};for(const c of s)for(const l of n){const u=document.getElementById(`dp-scheme-${a}-${c}-${l}`);u&&u.value&&(i[a][c][l]=u.value)}}return i}function qe(){return document.querySelector(".dp-scheme-card")?Promise.resolve():new Promise((i,a)=>{const c=new MutationObserver(()=>{document.querySelector(".dp-scheme-card")&&(u(),i())}),l=setTimeout(()=>{u(),a(new Error("Colours editor DOM not found after 5s"))},5e3);function u(){c.disconnect(),clearTimeout(l)}c.observe(document.body,{childList:!0,subtree:!0})})}function Be(){const i=document.querySelectorAll(".dp-ramp-row");for(const a of i)a.addEventListener("click",()=>{const c=a.getAttribute("aria-controls");if(!c)return;const l=document.getElementById(c);if(!l)return;l.hasAttribute("hidden")?(l.removeAttribute("hidden"),a.setAttribute("aria-expanded","true")):(l.setAttribute("hidden",""),a.setAttribute("aria-expanded","false"))})}const le="design-panel:ramps",Ie=300;let B=null,ce=!1;function Ge(){const i=window.DesignPanelColor;return!i||typeof i.generateRamp!="function"?(ce||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),ce=!0),null):i}function ze(){const i=getComputedStyle(document.documentElement),a={};for(const c of t){const l=i.getPropertyValue(`--color-${c}-500`).trim();a[c]={anchorHex:(l||"#808080").toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return a}function de(){try{const i=localStorage.getItem(le);if(!i)return{};const a=JSON.parse(i);return a&&typeof a=="object"?a:{}}catch{return{}}}function je(){const i=ze(),a=de(),c={};for(const l of t)c[l]={...i[l],...a[l]&&typeof a[l]=="object"?a[l]:{}};return c}function Fe(){const i=de();return Object.keys(i).length>0}function Ue(i){try{localStorage.setItem(le,JSON.stringify(i))}catch{}}function Y(i){B&&clearTimeout(B),B=setTimeout(()=>{B=null,Ue(i)},Ie)}function Ke(i,a){const c=Math.max(0,Math.min(100,a))/100,l=i.DEFAULT_CHROMA_PROFILE||{},u={};for(const g of o){const S=Number(g),T=l[S]??l[g]??.5;u[S]=T*c}return u}function I(i,a){const c=Ge();if(!c)return;const l=a[i];if(!l)return;const u=Ke(c,l.chroma);let g;try{g=c.generateRamp({anchorHex:l.anchorHex,anchorStep:l.anchorStep,chromaProfile:u,isNeutral:!!l.isNeutral,neutralChroma:l.neutralChroma,neutralHue:l.neutralHue})}catch(D){console.warn(`[design-panel-colors] generateRamp failed for ${i}: ${D.message}`);return}const S=document.querySelector(`.dp-ramp-row-wrapper[data-family="${i}"]`),T=document.documentElement;for(const D of g){const pe=String(D.step);if(T.style.setProperty(`--color-${i}-${pe}`,D.hex),S){const he=S.querySelector(`.dp-ramp-swatch[data-step="${pe}"]`);he&&(he.style.backgroundColor=D.hex)}}}function Ve(i){for(const a of t)I(a,i)}function Ye(i){for(const a of t){const c=document.getElementById(`dp-anchor-${a}`),l=document.getElementById(`dp-step-${a}`),u=document.getElementById(`dp-chroma-${a}`);c&&i[a].anchorHex&&(c.value=i[a].anchorHex),l&&(l.value=String(i[a].anchorStep)),u&&(u.value=String(i[a].chroma),u.setAttribute("aria-valuetext",`Chroma ${i[a].chroma} percent`)),c&&c.addEventListener("input",()=>{i[a].anchorHex=(c.value||"").toLowerCase(),I(a,i),Y(i)}),l&&l.addEventListener("change",()=>{const g=parseInt(l.value,10);Number.isFinite(g)&&(i[a].anchorStep=g,I(a,i),Y(i))}),u&&u.addEventListener("input",()=>{const g=parseInt(u.value,10);Number.isFinite(g)&&(i[a].chroma=g,u.setAttribute("aria-valuetext",`Chroma ${g} percent`),I(a,i),Y(i))})}}function Je(){const i=getComputedStyle(document.documentElement),a=["@layer tokens {","  :root {"];for(const c of t){const l=c.charAt(0).toUpperCase()+c.slice(1);a.push(`    /* ${l} */`);for(const u of o){const g=i.getPropertyValue(`--color-${c}-${u}`).trim();g&&a.push(`    --color-${c}-${u}: ${g};`)}a.push("")}return a.push("  }","}"),a.join(`
`)}function We(){const i=document.querySelector(".dp-copy-css");i&&i.addEventListener("click",()=>{const a=Je(),c=i.textContent,l=(u,g)=>{i.textContent=u,setTimeout(()=>{i.textContent=c},g)};if(!navigator.clipboard||typeof navigator.clipboard.writeText!="function"){console.warn("[design-panel-colors] navigator.clipboard unavailable"),l("Clipboard unavailable",2e3);return}navigator.clipboard.writeText(a).then(()=>{l("Copied 66 tokens",2e3)},u=>{console.error("[design-panel-colors] clipboard write failed:",u),l("Copy failed",2e3)})})}function Xe(){const i=k();L(i),C(),R(),x(),Be();const a=je();Fe()&&Ve(a),Ye(a),We()}function ue(){qe().then(Xe).catch(i=>{console.warn(`[design-panel-colors] init skipped: ${i.message}`)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ue,{once:!0}):ue()})();it();dt();function ut(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function pt(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function ht(){document.querySelectorAll(".grid").forEach(t=>{const o=getComputedStyle(t),e=o.gridTemplateColumns.split(" ").filter(n=>n!=="none"&&n.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const s=o.columnGap||o.rowGap||o.gap;s&&s!=="normal"&&t.style.setProperty("--grid-gap",s)})}function mt(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&ht()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let o;window.addEventListener("resize",()=>{clearTimeout(o),o=setTimeout(t,100)}),t()}ut(()=>{pt(),mt()});
