var yt=Object.defineProperty;var Me=t=>{throw TypeError(t)};var vt=(t,n,e)=>n in t?yt(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var Oe=(t,n,e)=>vt(t,typeof n!="symbol"?n+"":n,e),le=(t,n,e)=>n.has(t)||Me("Cannot "+e);var h=(t,n,e)=>(le(t,n,"read from private field"),e?e.call(t):n.get(t)),G=(t,n,e)=>n.has(t)?Me("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,e),F=(t,n,e,a)=>(le(t,n,"write to private field"),a?a.call(t,e):n.set(t,e),e),A=(t,n,e)=>(le(t,n,"access private method"),e);class St extends HTMLElement{async connectedCallback(){const n=this.getAttribute("src");if(!n){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const a=await e.text(),r=document.createElement("template");r.innerHTML=a;const l=r.content.cloneNode(!0);this.innerHTML="",this.appendChild(l),this.querySelectorAll("script").forEach(p=>{const f=document.createElement("script");Array.from(p.attributes).forEach(g=>{f.setAttribute(g.name,g.value)}),f.textContent=p.textContent,p.parentNode.replaceChild(f,p)})}catch(e){console.error(`HtmlInclude: failed to load ${n}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",St);class xt extends HTMLElement{connectedCallback(){const n=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const a=e.textContent.trim();a&&n.push(a)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&n.push(e.outerHTML);this._triggerContent=n.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var n;(n=this._abortController)==null||n.abort()}escapeHtml(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}sanitizeHref(n){return n?/^(javascript|data|vbscript):/i.test(n)?(console.warn("PopupDialog: Blocked potentially dangerous href:",n),""):n:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var n;(n=this.querySelector("dialog"))==null||n.showModal()}close(){var n;(n=this.querySelector("dialog"))==null||n.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const n=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),a=n?n.innerHTML:this.escapeHtml(this.body),r=this.escapeHtml(this.title);let l="";if(e)l=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const f=`button button--${this.escapeHtml(this.confirmVariant)}`,g=[];this.cancelLabel&&g.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&g.push(this.confirmHref?`<a href="${this.confirmHref}" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),l=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${g.join("")}</footer>`}const u=r?`<header class="cluster cluster-between cluster-nowrap">
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
    `}setupEvents(){const n=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),a=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:r}=this._abortController;n.addEventListener("click",l=>{l.preventDefault(),e.showModal()},{signal:r}),a.addEventListener("click",()=>{e.close()},{signal:r}),e.addEventListener("click",l=>{const u=l.target.closest("[data-action]");if(u){const p=u.dataset.action;p==="cancel"||p==="close"?(l.preventDefault(),e.close()):p==="confirm"&&u.tagName!=="A"&&(l.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}l.target===e&&e.close()},{signal:r})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",xt);const He=`
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
`;let re=null;const Ie=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";Ie&&(re=new CSSStyleSheet,re.replaceSync(He));const Q=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],ee={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},Et={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},_e="design-panel:state",wt=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function Ct(){return Q.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function At(){return Object.entries(ee).map(([t,n])=>{let e;if(n.type==="number")e=`<input type="number" data-setting="${t}" min="${n.min}" max="${n.max}" />`;else{const a=n.options.map(r=>`<option value="${r.value}">${r.label}</option>`).join("");e=`<select data-setting="${t}">${a}</select>`}return`
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
`;var C,q,K,O,P,y,me,Ne,te,he,oe,fe,be,De,Be,qe,Fe,je,V;class Pe extends HTMLElement{constructor(){super();G(this,y);G(this,C,{...Et});G(this,q,null);G(this,K,!1);G(this,O,null);G(this,P,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),Ie&&re)this.shadowRoot.adoptedStyleSheets=[re];else{const e=document.createElement("style");e.textContent=He,this.shadowRoot.appendChild(e)}}connectedCallback(){F(this,O,new AbortController),A(this,y,je).call(this),A(this,y,me).call(this),A(this,y,Ne).call(this),A(this,y,oe).call(this),A(this,y,Be).call(this),this.inert=!this.hasAttribute("open"),A(this,y,qe).call(this),A(this,y,Fe).call(this)}disconnectedCallback(){h(this,O)&&(h(this,O).abort(),F(this,O,null)),h(this,q)&&(clearTimeout(h(this,q)),F(this,q,null))}attributeChangedCallback(e,a,r){a!==r&&(e==="open"?(h(this,C).open=r!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(h(this,C).activeTab=r||"guides",h(this,K)&&A(this,y,oe).call(this)):e==="overlay-target"&&A(this,y,me).call(this))}}C=new WeakMap,q=new WeakMap,K=new WeakMap,O=new WeakMap,P=new WeakMap,y=new WeakSet,me=function(){const e=this.getAttribute("overlay-target")||"body";try{F(this,P,document.querySelector(e)||document.body)}catch{F(this,P,document.body)}},Ne=function(){const e=document.createRange().createContextualFragment(Tt);this.shadowRoot.appendChild(e),F(this,K,!0);const a=h(this,O)?h(this,O).signal:void 0,r=a?{signal:a}:void 0,l=this.shadowRoot.querySelector(".close");l&&l.addEventListener("click",()=>A(this,y,te).call(this,!1),r);const u=this.shadowRoot.querySelector(".trigger");u&&u.addEventListener("click",()=>A(this,y,te).call(this,!0),r),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(p=>{p.addEventListener("click",()=>A(this,y,he).call(this,p.dataset.tab),r)}),this.shadowRoot.querySelectorAll(".tool").forEach(p=>{p.addEventListener("click",()=>A(this,y,fe).call(this,p.dataset.tool),r)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(p=>{const f=p.dataset.setting,g=ee[f];if(!g)return;const $=g.type==="number"?"input":"change";p.addEventListener($,_=>{const R=g.type==="number"?Number(_.target.value):_.target.value;A(this,y,be).call(this,f,R)},r)})},te=function(e){h(this,C).open=!!e,h(this,C).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",h(this,C).open),A(this,y,V).call(this)},he=function(e){e&&(h(this,C).activeTab=e,this.setAttribute("active-tab",e),A(this,y,oe).call(this),A(this,y,V).call(this))},oe=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const a=e.dataset.tab===h(this,C).activeTab;e.setAttribute("aria-selected",a?"true":"false"),e.toggleAttribute("data-active",a)})},fe=function(e){const a=Q.find(l=>l.name===e);if(!a)return;h(this,C)[e]=!h(this,C)[e],h(this,P)&&h(this,P).classList.toggle(a.className,h(this,C)[e]);const r=this.shadowRoot.querySelector(`[data-tool="${e}"]`);r&&(r.setAttribute("aria-pressed",h(this,C)[e]?"true":"false"),r.toggleAttribute("data-active",h(this,C)[e])),A(this,y,V).call(this)},be=function(e,a){h(this,C)[e]=a;const r=ee[e];if(r){if(r.target==="cssvar")document.documentElement.style.setProperty(r.cssvar,String(a));else if(r.target==="overlayattr")h(this,P)&&h(this,P).setAttribute(r.attr,String(a));else if(r.target==="overlay-data-margin-mode"){const l=document.getElementById("dev-column-overlay"),u=document.getElementById("dev-margin-overlay");l&&l.setAttribute("data-margin-mode",String(a)),u&&u.setAttribute("data-margin-mode",String(a))}A(this,y,V).call(this)}},De=function(e){const a=this.shadowRoot.querySelector(`[data-setting="${e}"]`);a&&a.value!==String(h(this,C)[e])&&(a.value=String(h(this,C)[e]))},Be=function(){for(const e of Q){const a=!!h(this,C)[e.name];h(this,P)&&h(this,P).classList.toggle(e.className,a);const r=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);r&&(r.setAttribute("aria-pressed",a?"true":"false"),r.toggleAttribute("data-active",a))}for(const e of Object.keys(ee))h(this,C)[e]!==void 0&&(A(this,y,be).call(this,e,h(this,C)[e]),A(this,y,De).call(this,e));document.body.toggleAttribute("data-panel-open",!!h(this,C).open)},qe=function(){const e=h(this,O)?h(this,O).signal:void 0,a=e?{signal:e}:void 0,r=l=>{const u=l.composedPath(),p=u&&u[0];if(p&&p.matches&&p.matches("input,textarea,[contenteditable]")||l.metaKey||l.ctrlKey||l.altKey)return;const f=(l.key||"").toLowerCase();if(!f)return;if(f==="t"){A(this,y,te).call(this,!h(this,C).open),l.preventDefault();return}const g=Q.find($=>$.key===f);g&&(A(this,y,fe).call(this,g.name),l.preventDefault())};window.addEventListener("keydown",r,a)},Fe=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const a=h(this,O)?h(this,O).signal:void 0,r=a?{signal:a}:void 0,l=()=>{const u=e.assignedElements(),p=new Set(u.map(f=>f.getAttribute("data-tab")).filter(f=>!!f));for(const f of this.shadowRoot.querySelectorAll('[role="tab"]')){const g=f.dataset.tab;g!=="guides"&&f.classList.toggle("hidden",!p.has(g))}h(this,C).activeTab!=="guides"&&!p.has(h(this,C).activeTab)&&A(this,y,he).call(this,"guides")};e.addEventListener("slotchange",l,r),l()},je=function(){try{const e=localStorage.getItem(_e);if(e){const a=JSON.parse(e);a&&typeof a=="object"&&Object.assign(h(this,C),a)}}catch{}h(this,C).open?this.setAttribute("open",""):this.removeAttribute("open"),h(this,C).activeTab&&this.setAttribute("active-tab",h(this,C).activeTab)},V=function(){h(this,q)&&clearTimeout(h(this,q)),F(this,q,setTimeout(()=>{try{localStorage.setItem(_e,JSON.stringify(h(this,C)))}catch{}F(this,q,null)},200))},Oe(Pe,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",Pe);(function(){const t="design-panel-runtime-schemes";function n(){let r=document.getElementById(t);r||(r=document.createElement("style"),r.id=t,document.head.appendChild(r),r.sheet.insertRule("@layer tokens {}",0),r.sheet.insertRule("@layer utilities {}",1));const l={};for(let u=0;u<r.sheet.cssRules.length;u++){const p=r.sheet.cssRules[u];p.name&&(l[p.name]=p)}return l}let e=null;function a(){return e||(e=n()),e}window.__dpSchemeUpdate=function(r,l,u,p){const f=a()[p||"tokens"];if(f){for(let g=0;g<f.cssRules.length;g++)if(f.cssRules[g].selectorText===r){f.cssRules[g].style.setProperty(l,u);return}f.insertRule(r+"{"+l+":"+u+"}",f.cssRules.length)}},window.__dpSchemeReset=function(){const r=a();for(const l in r){const u=r[l];for(;u.cssRules.length>0;)u.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(l=>l.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(l=>{for(let u=0;u<l.options.length;u++)if(l.options[u].defaultSelected){l.selectedIndex=u;break}})},window.__dpSchemeSerialize=function(){const r=[];return document.querySelectorAll(".dp-scheme-card").forEach(l=>{const u=l.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!u)return;const p=u.className.replace(/^scheme-/,""),f=l.querySelectorAll(".dp-scheme-mode-column"),g=["light","dark"];f.forEach(($,_)=>{const R=g[_];R&&$.querySelectorAll(".dp-scheme-mapping-row").forEach(H=>{const M=H.querySelector("label"),m=H.querySelector("select");if(!M||!m)return;const N=M.textContent.trim(),D=m.value,B=m.getAttribute("data-library-default")||"";D&&D!==B&&r.push({scheme:p,token:N,mode:R,value:D})})})}),r}})();function Ge(t){const n=String(t).replace(/^#/,"");if(n.length!==6||/[^0-9a-fA-F]/.test(n))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(n,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function ce(t){if(!Number.isFinite(t))return 0;const n=Math.round(t*255);return n<0?0:n>255?255:n}function ze({R:t,G:n,B:e}){const a=ce(t),r=ce(n),l=ce(e);return"#"+a.toString(16).padStart(2,"0")+r.toString(16).padStart(2,"0")+l.toString(16).padStart(2,"0")}function de(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function ue(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function Ue({R:t,G:n,B:e}){return{R:de(t),G:de(n),B:de(e)}}function Ve({R:t,G:n,B:e}){return{R:ue(t),G:ue(n),B:ue(e)}}function pe(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function Ke({R:t,G:n,B:e}){let a=.4122214708*t+.5363325363*n+.0514459929*e,r=.2119034982*t+.6806995451*n+.1073969566*e,l=.0883024619*t+.2817188376*n+.6299787005*e;a=pe(a),r=pe(r),l=pe(l);const u=.2104542553*a+.793617785*r-.0040720468*l,p=1.9779984951*a-2.428592205*r+.4505937099*l,f=.0259040371*a+.7827717662*r-.808675766*l;return{L:u,a:p,b:f}}function ge({L:t,a:n,b:e}){let a=t+.3963377774*n+.2158037573*e,r=t-.1055613458*n-.0638541728*e,l=t-.0894841775*n-1.291485548*e;a=a*a*a,r=r*r*r,l=l*l*l;const u=4.0767416621*a-3.3077115913*r+.2309699292*l,p=-1.2684380046*a+2.6097574011*r-.3413193965*l,f=-.0041960863*a-.7034186147*r+1.707614701*l;return{R:u,G:p,B:f}}function Ye({L:t,a:n,b:e}){const a=Math.sqrt(n*n+e*e),l=(Math.atan2(e,n)*180/Math.PI%360+360)%360;return{L:t,C:a,H:l}}function ye({L:t,C:n,H:e}){const a=e*Math.PI/180;return{L:t,a:n*Math.cos(a),b:n*Math.sin(a)}}function Je(t){return Ye(Ke(Ue(Ge(t))))}function ne({L:t,C:n,H:e}){return ze(Ve(ge(ye({L:t,C:n,H:e}))))}function ve({L:t,C:n,H:e}){const a=ye({L:t,C:n,H:e}),r=ge(a),l=.002;return r.R>=-l&&r.R<=1+l&&r.G>=-l&&r.G<=1+l&&r.B>=-l&&r.B<=1+l}function Se(t,n){let e=0,a=.4;for(let r=0;r<40;r++){const l=(e+a)/2;ve({L:t,C:l,H:n})?e=l:a=l}return e}function se({L:t,C:n,H:e}){return ve({L:t,C:n,H:e})?{L:t,C:n,H:e}:{L:t,C:Se(t,e),H:e}}function Xe(t,n,e){return t<n?n:t>e?e:t}function Lt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:Ge,sRGBToHex:ze,sRGBToLinearRGB:Ue,linearRGBToSRGB:Ve,linearRGBToOKLab:Ke,oklabToLinearRGB:ge,oklabToOKLCH:Ye,oklchToOKLab:ye,hexToOKLCH:Je,oklchToHex:ne,isInSRGBGamut:ve,maxChromaSRGB:Se,clampChroma:se,clampFloat:Xe}))}const xe=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),kt=Object.freeze(["blue","red","orange","yellow","green","grey"]),We=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),Ee=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function $t(t,n){const e=t||Ee,a=Math.max(0,Math.min(100,n))/100,r={};for(const l of xe){const u=Number(l),p=e[u]??e[String(u)]??.5;r[u]=p*a}return r}function Rt(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const n=Je(t.anchorHex),e=t.lTargets||We,a=t.chromaProfile||Ee,r=t.overrides||{},l=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const u=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,p=n.L-u,f=[];for(const g of xe){if(Object.prototype.hasOwnProperty.call(r,g)){const[m,N,D]=r[g],B=se({L:m,C:N,H:D});f.push({step:g,hex:ne(B),L:B.L,C:B.C,H:B.H});continue}if(g===t.anchorStep){const m=se(n);f.push({step:g,hex:ne(m),L:m.L,C:m.C,H:m.H});continue}const $=Object.prototype.hasOwnProperty.call(e,g)?e[g]:.58,_=Xe($+p,.06,.985);let R=l?l(g):n.H,H;if(t.isNeutral)H=t.neutralChroma,R=t.neutralHue;else{const m=Se(_,R),N=Object.prototype.hasOwnProperty.call(a,g)?a[g]:.5;H=m*N}const M=se({L:_,C:H,H:R});f.push({step:g,hex:ne(M),L:M.L,C:M.C,H:M.H})}return f}function Mt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:xe,FAMILY_NAMES:kt,DEFAULT_L_TARGETS:We,DEFAULT_CHROMA_PROFILE:Ee,generateRamp:Rt,scaleChromaProfile:$t}))}function Ot(t=globalThis){Lt(t),Mt(t)}(function(){const t=typeof window<"u"&&window.DesignPanelColor||{},n=t.FAMILY_NAMES?Array.from(t.FAMILY_NAMES):["blue","red","orange","yellow","green","grey"],e=t.STEPS?t.STEPS.map(String):["50","100","200","300","400","500","600","700","800","900","950"],a=["default","subtle","accent"],r=["light","dark"],l=["bg","fg","accent","muted","subtle"],u="design-panel:schemes",p="design-panel:ramps",f=300,g={blue:"#1f75ff",red:"#e10600",orange:"#ff4f00",yellow:"#ffa300",green:"#00b312",grey:"#808080"},$={};for(const o of n)$[o]=o.charAt(0).toUpperCase()+o.slice(1);const _=new RegExp(`^(?:${n.join("|")})-(?:${e.join("|")})$`);let R=!1,H=!1,M=!1;function m(o,s,i){const c=document.createElement(o);if(s)for(const d in s)d==="text"?c.textContent=s[d]:d in c&&typeof s[d]!="string"?c[d]=s[d]:c.setAttribute(d,s[d]);if(i)for(const d of i)d!=null&&c.appendChild(d);return c}function N(o){const s=$[o],i=`dp-ramp-settings-${o}`,c=m("span",{class:"dp-ramp-label",text:s}),d=m("span",{class:"dp-ramp-grid","aria-hidden":"true"});for(const U of e)d.appendChild(m("span",{class:"dp-ramp-swatch","data-step":U}));const v=m("button",{class:"dp-ramp-row",type:"button","aria-expanded":"false","aria-controls":i,"aria-label":`${s} ramp settings`},[c,d]),S=m("legend",{class:"dp-ramp-settings-legend",text:`${s} ramp settings`}),T=m("label",{for:`dp-anchor-${o}`,text:"Anchor color"}),j=m("input",{type:"color",id:`dp-anchor-${o}`}),Z=m("label",{for:`dp-step-${o}`,text:"Anchor step"}),z=m("select",{id:`dp-step-${o}`});for(const U of e){const Re=m("option",{value:U,text:U});U==="500"&&(Re.selected=!0),z.appendChild(Re)}const ft=m("label",{for:`dp-chroma-${o}`,text:"Chroma intensity"}),bt=m("input",{type:"range",id:`dp-chroma-${o}`,min:"0",max:"100",value:"80"}),gt=m("fieldset",{class:"dp-ramp-settings",id:i,hidden:""},[S,T,j,Z,z,ft,bt]);return m("div",{class:"dp-ramp-row-wrapper","data-family":o},[v,gt])}function D(o,s){const i=o.charAt(0).toUpperCase()+o.slice(1);return m("div",{class:`dp-scheme-preview ${s==="dark"?"dp-scheme-preview-dark dark-mode":"dp-scheme-preview-light"}`,"aria-hidden":"true"},[m("div",{class:`scheme-${o}`},[m("div",{class:"dp-scheme-heading",text:i}),m("div",{class:"dp-scheme-divider"}),m("div",{class:"dp-scheme-body",text:"Sample body text"}),m("div",{class:"dp-scheme-meta"},[m("span",{class:"dp-scheme-accent-text",text:"Accent"}),m("span",{class:"dp-scheme-subtle-swatch"}),m("span",{class:"dp-scheme-muted-text",text:"Muted"})])])])}function B(o,s,i){const c=`dp-scheme-${o}-${s}-${i}`;return m("div",{class:"dp-scheme-mapping-row"},[m("label",{for:c,text:i}),m("select",{id:c,"data-scheme":o,"data-mode":s,"data-token":i,"aria-busy":"true"},[m("option",{value:"",disabled:!0,selected:!0,text:"Loading…"})])])}function Y(o,s){const i=b(o),c=s.charAt(0).toUpperCase()+s.slice(1),d=m("summary",{"aria-label":`${i} scheme, ${c} mode`},[D(o,s)]),v=m("legend",{class:"dp-scheme-mode-label",text:c}),S=m("fieldset",{class:"dp-scheme-mode-column"},[v]);for(const T of l)S.appendChild(B(o,s,T));return m("details",{class:"dp-scheme-card-mode","data-mode":s},[d,S])}function J(o){const s=b(o);return m("div",{class:"dp-scheme-card","data-scheme":o,role:"listitem","aria-label":`${s} scheme`},[Y(o,"light"),Y(o,"dark")])}function b(o){return o.charAt(0).toUpperCase()+o.slice(1)}function x(){const o=document.querySelector("[data-dp-ramp-matrix]");if(o&&!o.firstChild)for(const i of n)o.appendChild(N(i));const s=document.querySelector("[data-dp-scheme-list]");if(s&&!s.firstChild)for(const i of a)s.appendChild(J(i))}function E(){const o=document.documentElement,s=getComputedStyle(o),i={};for(const c of n){i[c]={};for(const d of e){const v=s.getPropertyValue(`--color-${c}-${d}`).trim();i[c][d]=v||null}}return i}function w(o){for(const s of n){const i=document.querySelector(`.dp-ramp-row-wrapper[data-family="${s}"]`);if(i)for(const c of e){const d=i.querySelector(`.dp-ramp-swatch[data-step="${c}"]`);if(!d)continue;const v=o[s][c];v?d.style.backgroundColor=v:R||(console.warn(`[design-panel-colors] Missing --color-${s}-${c} token; leaving swatch unpainted.`),R=!0)}}}function I(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o){for(;s.firstChild;)s.removeChild(s.firstChild);const i=document.createElement("option");i.value="",i.textContent="—",s.appendChild(i);for(const c of n){const d=$[c],v=document.createElement("optgroup");v.label=d;for(const S of e){const T=document.createElement("option");T.value=`${c}-${S}`,T.textContent=`${d} ${S}`,v.appendChild(T)}s.appendChild(v)}s.removeAttribute("aria-busy")}}function L(o){let s;try{s=localStorage.getItem(o)}catch{return{}}if(!s)return{};try{const i=JSON.parse(s);return i&&typeof i=="object"?i:{}}catch{return{}}}function k(o){return typeof o=="string"&&_.test(o)}function X(){const o=L(u);for(const s of a){const i=o[s];if(!(!i||typeof i!="object"))for(const c of r){const d=i[c];if(!(!d||typeof d!="object"))for(const v of l){const S=d[v];if(!k(S))continue;const T=document.getElementById(`dp-scheme-${s}-${c}-${v}`);T&&(T.value=S,ae(s,c,v,S))}}}}function Ze(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o)s.addEventListener("change",Qe)}function Qe(o){const s=o.currentTarget,{scheme:i,mode:c,token:d}=s.dataset;if(!(!i||!c||!d)){if(s.value!==""&&!k(s.value)){console.warn(`[design-panel-colors] ignoring invalid scheme value "${s.value}"`);return}ae(i,c,d,s.value),Ce()}}function ae(o,s,i,c){if(typeof window.__dpSchemeUpdate!="function"){H||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),H=!0);return}const d=`--color-${i}`,v=c?`var(--color-${c})`:"initial";if(o==="default"){const S=s==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(S,d,v,"utilities")}else{const S=s==="dark"?`.scheme-${o}.dark-mode`:`.scheme-${o}`;window.__dpSchemeUpdate(S,d,v,"tokens")}}function we(o,s){let i=null,c=null;const d=()=>{i&&(clearTimeout(i),i=null),c=null;try{localStorage.setItem(o,JSON.stringify(s()))}catch{}},v=function(){i&&clearTimeout(i),c=d,i=setTimeout(()=>{i=null,c=null;try{localStorage.setItem(o,JSON.stringify(s()))}catch{}},f)};return v.flush=function(){c&&d()},v}function et(){const o={};for(const s of a){o[s]={light:{},dark:{}};for(const i of r)for(const c of l){const d=document.getElementById(`dp-scheme-${s}-${i}-${c}`);d&&d.value&&(o[s][i][c]=d.value)}}return o}const Ce=we(u,et);function tt(){const o=document.querySelectorAll(".dp-ramp-row");for(const s of o)s.addEventListener("click",()=>{const i=s.getAttribute("aria-controls");if(!i)return;const c=document.getElementById(i);if(!c)return;c.hasAttribute("hidden")?(c.removeAttribute("hidden"),s.setAttribute("aria-expanded","true")):(c.setAttribute("hidden",""),s.setAttribute("aria-expanded","false"))})}function ot(){const o=window.DesignPanelColor;return!o||typeof o.generateRamp!="function"?(M||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),M=!0),null):o}function nt(){const o=getComputedStyle(document.documentElement),s={};for(const i of n){const c=o.getPropertyValue(`--color-${i}-500`).trim(),d=g[i]||"#808080";s[i]={anchorHex:(c||d).toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return s}function Ae(){return L(p)}const st=/^#[0-9a-f]{6}$/,rt=new Set(e.map(o=>Number(o)));function at(o){if(!o||typeof o!="object")return{};const s={};if(typeof o.anchorHex=="string"){const i=o.anchorHex.toLowerCase();st.test(i)&&(s.anchorHex=i)}return Number.isFinite(o.anchorStep)&&rt.has(o.anchorStep)&&(s.anchorStep=o.anchorStep),Number.isFinite(o.chroma)&&o.chroma>=0&&o.chroma<=100&&(s.chroma=o.chroma),typeof o.isNeutral=="boolean"&&(s.isNeutral=o.isNeutral),Number.isFinite(o.neutralChroma)&&o.neutralChroma>=0&&o.neutralChroma<=.5&&(s.neutralChroma=o.neutralChroma),Number.isFinite(o.neutralHue)&&o.neutralHue>=0&&o.neutralHue<360&&(s.neutralHue=o.neutralHue),s}function it(){const o=nt(),s=Ae(),i={};for(const c of n)i[c]={...o[c],...at(s[c])};return i}function lt(){const o=Ae();return Object.keys(o).length>0}function ct(o,s){if(typeof o.scaleChromaProfile=="function")return o.scaleChromaProfile(o.DEFAULT_CHROMA_PROFILE,s);const i=Math.max(0,Math.min(100,s))/100,c=o.DEFAULT_CHROMA_PROFILE||{},d={};for(const v of e){const S=Number(v),T=c[S]??c[v]??.5;d[S]=T*i}return d}function W(o,s){const i=ot();if(!i)return;const c=s[o];if(!c)return;const d=ct(i,c.chroma);let v;try{v=i.generateRamp({anchorHex:c.anchorHex,anchorStep:c.anchorStep,chromaProfile:d,isNeutral:!!c.isNeutral,neutralChroma:c.neutralChroma,neutralHue:c.neutralHue})}catch(j){console.warn(`[design-panel-colors] generateRamp failed for ${o}: ${j.message}`);return}const S=document.querySelector(`.dp-ramp-row-wrapper[data-family="${o}"]`),T=document.documentElement;for(const j of v){const Z=String(j.step);if(T.style.setProperty(`--color-${o}-${Z}`,j.hex),S){const z=S.querySelector(`.dp-ramp-swatch[data-step="${Z}"]`);z&&(z.style.backgroundColor=j.hex)}}}function dt(o){for(const s of n)W(s,o)}function Te(o,s){o.setAttribute("aria-valuetext",`Chroma ${s} percent`)}function ut(o){const s=we(p,()=>o);for(const i of n){const c=document.getElementById(`dp-anchor-${i}`),d=document.getElementById(`dp-step-${i}`),v=document.getElementById(`dp-chroma-${i}`);c&&o[i].anchorHex&&(c.value=o[i].anchorHex),d&&(d.value=String(o[i].anchorStep)),v&&(v.value=String(o[i].chroma),Te(v,o[i].chroma)),c&&c.addEventListener("input",()=>{o[i].anchorHex=(c.value||"").toLowerCase(),W(i,o),s()}),d&&d.addEventListener("change",()=>{const S=parseInt(d.value,10);Number.isFinite(S)&&(o[i].anchorStep=S,W(i,o),s())}),v&&v.addEventListener("input",()=>{const S=parseInt(v.value,10);Number.isFinite(S)&&(o[i].chroma=S,Te(v,S),W(i,o),s())})}}const pt=5e3;function Le(){return document.querySelector("[data-dp-ramp-matrix]")||document.querySelector("[data-dp-scheme-list]")}function mt(){return Le()?Promise.resolve(!0):new Promise(o=>{const s=new MutationObserver(()=>{Le()&&(c(),o(!0))}),i=setTimeout(()=>{c(),o(!1)},pt);function c(){s.disconnect(),clearTimeout(i)}s.observe(document.body,{childList:!0,subtree:!0})})}function ke(){mt().then(o=>{o&&ie()})}function $e(){if(!document.querySelector("[data-dp-scheme-list]"))return;X();const s=L(u);for(const i of a){const c=s&&s[i]||{};for(const d of r){const v=c[d]||{};for(const S of l){const T=document.getElementById(`dp-scheme-${i}-${d}-${S}`);if(!T)continue;k(v[S])||(T.value="",ae(i,d,S,""))}}}ht()}function ht(){const o=localStorage.getItem("design-panel:active-theme-id"),s=o==="thm_default"||o===null;document.querySelectorAll('[slot="editor"][data-tab="colors"] :is(input, button, select)').forEach(i=>{i.disabled=s})}function ie(){if(ie.done)return;ie.done=!0,x();const o=E();w(o),I(),Ze(),tt();const s=it();lt()&&dt(s),ut(s),window.__dpColorsSave||(document.addEventListener("design-panel:reactivate",$e),window.__dpColorsSave={flush:Ce.flush}),$e()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ke,{once:!0}):ke()})();(function(){const t="design-panel:typography",a=Object.freeze({"dp-type-ratio":"--type-scale-ratio","dp-text-base-min":"--text-base-min","dp-text-base-max":"--text-base-max","dp-lh-body":"--line-height-ratio-body","dp-lh-heading":"--line-height-ratio-heading","dp-font-body":"--font-body","dp-font-heading":"--font-heading","dp-line-height-min":"--line-height-min","dp-line-height-max":"--line-height-max"}),r=Object.freeze({"1.125":"Minor second","1.2":"Minor third","1.25":"Major third","1.333":"Perfect fourth","1.414":"Augmented fourth","1.5":"Perfect fifth","1.618":"Golden ratio"});function l(b){return b==="dp-font-body"||b==="dp-font-heading"}function u(b){const x=a[b.id],E=b.value;if(l(b.id)){const w=E.trim();w?document.documentElement.style.setProperty(x,w):document.documentElement.style.removeProperty(x)}else document.documentElement.style.setProperty(x,String(E))}function p(b){if(b.type==="range")if(b.id==="dp-type-ratio"){const x=r[b.value]||"";b.setAttribute("aria-valuetext",x?`Scale ratio ${b.value}, ${x}`:`Scale ratio ${b.value}`)}else{const x=b.id==="dp-lh-body"?"Body":"Heading";b.setAttribute("aria-valuetext",`${x} line height ${b.value}`)}}function f(){const b=document.getElementById("dp-type-ratio");if(!b)return;const x=Number(b.value),E=document.querySelectorAll("[data-preset-ratio]");for(const w of E){const I=Number(w.dataset.presetRatio),L=Math.abs(x-I)<.001;w.setAttribute("aria-pressed",L?"true":"false")}}function g(b,x){let E=null,w=null;const I=()=>{E&&(clearTimeout(E),E=null),w=null;try{localStorage.setItem(b,JSON.stringify(x()))}catch{}},L=function(){E&&clearTimeout(E),w=I,E=setTimeout(()=>{E=null,w=null;try{localStorage.setItem(b,JSON.stringify(x()))}catch{}},200)};return L.flush=function(){w&&I()},L}function $(){const b={};for(const x of Object.keys(a)){const E=document.getElementById(x);E&&(b[x]=E.value)}return b}const _=g(t,$);function R(){try{const b=localStorage.getItem(t);if(!b)return null;const x=JSON.parse(b);if(!x||typeof x!="object"||Array.isArray(x))return null;const E={};for(const w of Object.keys(a)){const I=x[w];typeof I=="string"&&(E[w]=I)}return E}catch{return null}}const H=5e3;function M(){return!!document.querySelector('[slot="editor"][data-tab="typography"] #dp-type-ratio')}function m(){return M()?Promise.resolve(!0):new Promise(b=>{const x=new MutationObserver(()=>{M()&&(w(),b(!0))}),E=setTimeout(()=>{w(),b(!1)},H);function w(){x.disconnect(),clearTimeout(E)}x.observe(document.body,{childList:!0,subtree:!0})})}let N=!1;function D(){if(!document.querySelector('[slot="editor"][data-tab="typography"]'))return;const x=R()||{},E=getComputedStyle(document.documentElement),w=localStorage.getItem("design-panel:active-theme-id"),I=w==="thm_default"||w===null;for(const L of Object.keys(a)){const k=document.getElementById(L);if(!k)continue;const X=x[L];X!=null?(k.value=X,u(k)):I?(k.value="",document.documentElement.style.removeProperty(a[L])):l(L)?(k.value="",u(k)):(k.value=E.getPropertyValue(a[L]).trim(),u(k)),p(k)}B(),f()}function B(){const b=localStorage.getItem("design-panel:active-theme-id"),x=b==="thm_default"||b===null;document.querySelectorAll('[slot="editor"][data-tab="typography"] :is(input, button, select)').forEach(E=>{E.disabled=x})}function Y(){if(N||!document.querySelector('[slot="editor"][data-tab="typography"]'))return;N=!0;for(const E of Object.keys(a)){const w=document.getElementById(E);w&&w.addEventListener("input",()=>{u(w),p(w),w.id==="dp-type-ratio"&&f(),_()})}const x=document.querySelectorAll("[data-preset-ratio]");for(const E of x)E.addEventListener("click",()=>{const w=document.getElementById("dp-type-ratio");w&&(w.value=E.dataset.presetRatio,w.dispatchEvent(new Event("input",{bubbles:!0})))});window.__dpTypographySave||(document.addEventListener("design-panel:reactivate",D),window.__dpTypographySave={flush:_.flush}),D()}function J(){m().then(b=>{b&&Y()})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",J,{once:!0}):J()})();Ot();function _t(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function Ht(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function It(){document.querySelectorAll(".grid").forEach(t=>{const n=getComputedStyle(t),e=n.gridTemplateColumns.split(" ").filter(r=>r!=="none"&&r.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const a=n.columnGap||n.rowGap||n.gap;a&&a!=="normal"&&t.style.setProperty("--grid-gap",a)})}function Pt(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&It()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let n;window.addEventListener("resize",()=>{clearTimeout(n),n=setTimeout(t,100)}),t()}_t(()=>{Ht(),Pt()});
