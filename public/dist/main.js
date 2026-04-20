var vt=Object.defineProperty;var we=t=>{throw TypeError(t)};var St=(t,n,e)=>n in t?vt(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var Ae=(t,n,e)=>St(t,typeof n!="symbol"?n+"":n,e),W=(t,n,e)=>n.has(t)||we("Cannot "+e);var p=(t,n,e)=>(W(t,n,"read from private field"),e?e.call(t):n.get(t)),P=(t,n,e)=>n.has(t)?we("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,e),H=(t,n,e,i)=>(W(t,n,"write to private field"),i?i.call(t,e):n.set(t,e),e),x=(t,n,e)=>(W(t,n,"access private method"),e);class xt extends HTMLElement{async connectedCallback(){const n=this.getAttribute("src");if(!n){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(n);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const i=await e.text(),r=document.createElement("template");r.innerHTML=i;const l=r.content.cloneNode(!0);this.innerHTML="",this.appendChild(l),this.querySelectorAll("script").forEach(m=>{const f=document.createElement("script");Array.from(m.attributes).forEach(y=>{f.setAttribute(y.name,y.value)}),f.textContent=m.textContent,m.parentNode.replaceChild(f,m)})}catch(e){console.error(`HtmlInclude: failed to load ${n}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",xt);class Ct extends HTMLElement{connectedCallback(){const n=[];for(const e of this.childNodes)if(e.nodeType===Node.TEXT_NODE){const i=e.textContent.trim();i&&n.push(i)}else e.nodeType===Node.ELEMENT_NODE&&!e.hasAttribute("slot")&&n.push(e.outerHTML);this._triggerContent=n.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var n;(n=this._abortController)==null||n.abort()}escapeHtml(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}sanitizeHref(n){return n?/^(javascript|data|vbscript):/i.test(n)?(console.warn("PopupDialog: Blocked potentially dangerous href:",n),""):n:""}get title(){return this.getAttribute("title")||""}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||""}get cancelLabel(){return this.getAttribute("cancel-label")||""}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get hasActions(){return this.confirmLabel||this.cancelLabel||this.querySelector('[slot="actions"]')}open(){var n;(n=this.querySelector("dialog"))==null||n.showModal()}close(){var n;(n=this.querySelector("dialog"))==null||n.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const n=this.querySelector('[slot="body"]'),e=this.querySelector('[slot="actions"]'),i=n?n.innerHTML:this.escapeHtml(this.body),r=this.escapeHtml(this.title);let l="";if(e)l=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${e.innerHTML}</footer>`;else if(this.confirmLabel||this.cancelLabel){const f=`button button--${this.escapeHtml(this.confirmVariant)}`,y=[];this.cancelLabel&&y.push(`<button type="button" class="button" data-action="cancel">${this.escapeHtml(this.cancelLabel)}</button>`),this.confirmLabel&&y.push(this.confirmHref?`<a href="${this.confirmHref}" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</a>`:`<button type="button" class="${f}" data-action="confirm">${this.escapeHtml(this.confirmLabel)}</button>`),l=`<footer class="cluster cluster-end pt-1 mt-05 border-t">${y.join("")}</footer>`}const u=r?`<header class="cluster cluster-between cluster-nowrap">
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
          <div>${i}</div>
          ${l}
        </div>
      </dialog>
    `}setupEvents(){const n=this.querySelector("[data-trigger]"),e=this.querySelector("dialog"),i=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:r}=this._abortController;n.addEventListener("click",l=>{l.preventDefault(),e.showModal()},{signal:r}),i.addEventListener("click",()=>{e.close()},{signal:r}),e.addEventListener("click",l=>{const u=l.target.closest("[data-action]");if(u){const m=u.dataset.action;m==="cancel"||m==="close"?(l.preventDefault(),e.close()):m==="confirm"&&u.tagName!=="A"&&(l.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),e.close())}l.target===e&&e.close()},{signal:r})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",Ct);const Te=`
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
`;let J=null;const ke=typeof CSSStyleSheet=="function"&&typeof CSSStyleSheet.prototype.replaceSync=="function";ke&&(J=new CSSStyleSheet,J.replaceSync(Te));const z=[{name:"baseline",key:"b",label:"Baseline",className:"show-baseline"},{name:"columns",key:"c",label:"Columns",className:"show-columns"},{name:"darkMode",key:"d",label:"Dark",className:"dark-mode"},{name:"grids",key:"g",label:"Grids",className:"dev-outline-grids"},{name:"margins",key:"m",label:"Margins",className:"show-margins"},{name:"outlines",key:"o",label:"Outlines",className:"dev-outline"},{name:"hideBg",key:"x",label:"BG Off",className:"hide-backgrounds"},{name:"redact",key:"r",label:"Redact",className:"redact"}],j={devColumns:{type:"number",min:1,max:24,label:"Columns",target:"cssvar",cssvar:"--dev-columns"},subdivisions:{type:"select",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}],label:"Subdivisions",target:"overlayattr",attr:"data-subdivisions"},devGap:{type:"select",options:[{value:"var(--gutter)",label:"Default"},{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"0.25"},{value:"var(--line-05)",label:"0.5"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}],label:"Gap",target:"cssvar",cssvar:"--dev-gap"},marginMode:{type:"select",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}],label:"Margin",target:"overlay-data-margin-mode"}},Et={open:!1,activeTab:"guides",baseline:!1,columns:!1,darkMode:!1,grids:!1,margins:!1,outlines:!1,hideBg:!1,redact:!1,devColumns:3,subdivisions:"2",devGap:"var(--gutter)",marginMode:"section"},Le="design-panel:state",wt=`
  <svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor" aria-hidden="true">
    <path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/>
    <rect x="10" width="8" height="28"/>
    <rect x="30" width="8" height="28"/>
    <rect x="20" width="8" height="28"/>
  </svg>
`;function At(){return z.map(t=>`
    <button type="button" class="tool" data-tool="${t.name}" aria-pressed="false" title="Toggle ${t.label} (${t.key.toUpperCase()})">
      <span class="tool-key">${t.key.toUpperCase()}</span>
      <span class="tool-label">${t.label}</span>
    </button>
  `).join("")}function Lt(){return Object.entries(j).map(([t,n])=>{let e;if(n.type==="number")e=`<input type="number" data-setting="${t}" min="${n.min}" max="${n.max}" />`;else{const i=n.options.map(r=>`<option value="${r.value}">${r.label}</option>`).join("");e=`<select data-setting="${t}">${i}</select>`}return`
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
          <div class="tools">${At()}</div>
        </div>
        <div class="section">
          <h3 class="section-title">Grid</h3>
          <div class="settings">${Lt()}</div>
        </div>
      </div>
      <slot name="editor"></slot>
    </div>
  </aside>
  <button type="button" class="trigger" aria-label="Open design tools">${wt}</button>
`;var S,k,B,E,L,g,oe,Re,U,ne,K,se,re,He,Me,Oe,_e,Ne,q;class $e extends HTMLElement{constructor(){super();P(this,g);P(this,S,{...Et});P(this,k,null);P(this,B,!1);P(this,E,null);P(this,L,null);if(this.attachShadow({mode:"open",delegatesFocus:!0}),ke&&J)this.shadowRoot.adoptedStyleSheets=[J];else{const e=document.createElement("style");e.textContent=Te,this.shadowRoot.appendChild(e)}}connectedCallback(){H(this,E,new AbortController),x(this,g,Ne).call(this),x(this,g,oe).call(this),x(this,g,Re).call(this),x(this,g,K).call(this),x(this,g,Me).call(this),this.inert=!this.hasAttribute("open"),x(this,g,Oe).call(this),x(this,g,_e).call(this)}disconnectedCallback(){p(this,E)&&(p(this,E).abort(),H(this,E,null)),p(this,k)&&(clearTimeout(p(this,k)),H(this,k,null))}attributeChangedCallback(e,i,r){i!==r&&(e==="open"?(p(this,S).open=r!==null,this.inert=!this.hasAttribute("open")):e==="active-tab"?(p(this,S).activeTab=r||"guides",p(this,B)&&x(this,g,K).call(this)):e==="overlay-target"&&x(this,g,oe).call(this))}}S=new WeakMap,k=new WeakMap,B=new WeakMap,E=new WeakMap,L=new WeakMap,g=new WeakSet,oe=function(){const e=this.getAttribute("overlay-target")||"body";try{H(this,L,document.querySelector(e)||document.body)}catch{H(this,L,document.body)}},Re=function(){const e=document.createRange().createContextualFragment(Tt);this.shadowRoot.appendChild(e),H(this,B,!0);const i=p(this,E)?p(this,E).signal:void 0,r=i?{signal:i}:void 0,l=this.shadowRoot.querySelector(".close");l&&l.addEventListener("click",()=>x(this,g,U).call(this,!1),r);const u=this.shadowRoot.querySelector(".trigger");u&&u.addEventListener("click",()=>x(this,g,U).call(this,!0),r),this.shadowRoot.querySelectorAll('[role="tab"]').forEach(m=>{m.addEventListener("click",()=>x(this,g,ne).call(this,m.dataset.tab),r)}),this.shadowRoot.querySelectorAll(".tool").forEach(m=>{m.addEventListener("click",()=>x(this,g,se).call(this,m.dataset.tool),r)}),this.shadowRoot.querySelectorAll("[data-setting]").forEach(m=>{const f=m.dataset.setting,y=j[f];if(!y)return;const w=y.type==="number"?"input":"change";m.addEventListener(w,$=>{const A=y.type==="number"?Number($.target.value):$.target.value;x(this,g,re).call(this,f,A)},r)})},U=function(e){p(this,S).open=!!e,p(this,S).open?this.setAttribute("open",""):this.removeAttribute("open"),document.body.toggleAttribute("data-panel-open",p(this,S).open),x(this,g,q).call(this)},ne=function(e){e&&(p(this,S).activeTab=e,this.setAttribute("active-tab",e),x(this,g,K).call(this),x(this,g,q).call(this))},K=function(){this.shadowRoot.querySelectorAll('[role="tab"]').forEach(e=>{const i=e.dataset.tab===p(this,S).activeTab;e.setAttribute("aria-selected",i?"true":"false"),e.toggleAttribute("data-active",i)})},se=function(e){const i=z.find(l=>l.name===e);if(!i)return;p(this,S)[e]=!p(this,S)[e],p(this,L)&&p(this,L).classList.toggle(i.className,p(this,S)[e]);const r=this.shadowRoot.querySelector(`[data-tool="${e}"]`);r&&(r.setAttribute("aria-pressed",p(this,S)[e]?"true":"false"),r.toggleAttribute("data-active",p(this,S)[e])),x(this,g,q).call(this)},re=function(e,i){p(this,S)[e]=i;const r=j[e];if(r){if(r.target==="cssvar")document.documentElement.style.setProperty(r.cssvar,String(i));else if(r.target==="overlayattr")p(this,L)&&p(this,L).setAttribute(r.attr,String(i));else if(r.target==="overlay-data-margin-mode"){const l=document.getElementById("dev-column-overlay"),u=document.getElementById("dev-margin-overlay");l&&l.setAttribute("data-margin-mode",String(i)),u&&u.setAttribute("data-margin-mode",String(i))}x(this,g,q).call(this)}},He=function(e){const i=this.shadowRoot.querySelector(`[data-setting="${e}"]`);i&&i.value!==String(p(this,S)[e])&&(i.value=String(p(this,S)[e]))},Me=function(){for(const e of z){const i=!!p(this,S)[e.name];p(this,L)&&p(this,L).classList.toggle(e.className,i);const r=this.shadowRoot.querySelector(`[data-tool="${e.name}"]`);r&&(r.setAttribute("aria-pressed",i?"true":"false"),r.toggleAttribute("data-active",i))}for(const e of Object.keys(j))p(this,S)[e]!==void 0&&(x(this,g,re).call(this,e,p(this,S)[e]),x(this,g,He).call(this,e));document.body.toggleAttribute("data-panel-open",!!p(this,S).open)},Oe=function(){const e=p(this,E)?p(this,E).signal:void 0,i=e?{signal:e}:void 0,r=l=>{const u=l.composedPath(),m=u&&u[0];if(m&&m.matches&&m.matches("input,textarea,[contenteditable]")||l.metaKey||l.ctrlKey||l.altKey)return;const f=(l.key||"").toLowerCase();if(!f)return;if(f==="t"){x(this,g,U).call(this,!p(this,S).open),l.preventDefault();return}const y=z.find(w=>w.key===f);y&&(x(this,g,se).call(this,y.name),l.preventDefault())};window.addEventListener("keydown",r,i)},_e=function(){const e=this.shadowRoot.querySelector('slot[name="editor"]');if(!e)return;const i=p(this,E)?p(this,E).signal:void 0,r=i?{signal:i}:void 0,l=()=>{const u=e.assignedElements(),m=new Set(u.map(f=>f.getAttribute("data-tab")).filter(f=>!!f));for(const f of this.shadowRoot.querySelectorAll('[role="tab"]')){const y=f.dataset.tab;y!=="guides"&&f.classList.toggle("hidden",!m.has(y))}p(this,S).activeTab!=="guides"&&!m.has(p(this,S).activeTab)&&x(this,g,ne).call(this,"guides")};e.addEventListener("slotchange",l,r),l()},Ne=function(){try{const e=localStorage.getItem(Le);if(e){const i=JSON.parse(e);i&&typeof i=="object"&&Object.assign(p(this,S),i)}}catch{}p(this,S).open?this.setAttribute("open",""):this.removeAttribute("open"),p(this,S).activeTab&&this.setAttribute("active-tab",p(this,S).activeTab)},q=function(){p(this,k)&&clearTimeout(p(this,k)),H(this,k,setTimeout(()=>{try{localStorage.setItem(Le,JSON.stringify(p(this,S)))}catch{}H(this,k,null)},200))},Ae($e,"observedAttributes",["open","active-tab","overlay-target"]);customElements.define("design-panel",$e);(function(){const t="design-panel-runtime-schemes";function n(){let r=document.getElementById(t);r||(r=document.createElement("style"),r.id=t,document.head.appendChild(r),r.sheet.insertRule("@layer tokens {}",0),r.sheet.insertRule("@layer utilities {}",1));const l={};for(let u=0;u<r.sheet.cssRules.length;u++){const m=r.sheet.cssRules[u];m.name&&(l[m.name]=m)}return l}let e=null;function i(){return e||(e=n()),e}window.__dpSchemeUpdate=function(r,l,u,m){const f=i()[m||"tokens"];if(f){for(let y=0;y<f.cssRules.length;y++)if(f.cssRules[y].selectorText===r){f.cssRules[y].style.setProperty(l,u);return}f.insertRule(r+"{"+l+":"+u+"}",f.cssRules.length)}},window.__dpSchemeReset=function(){const r=i();for(const l in r){const u=r[l];for(;u.cssRules.length>0;)u.deleteRule(0)}document.querySelectorAll(".dp-scheme-preview .scheme-default,.dp-scheme-preview .scheme-subtle,.dp-scheme-preview .scheme-accent").forEach(l=>l.removeAttribute("style")),document.querySelectorAll(".dp-scheme-mapping-row select").forEach(l=>{for(let u=0;u<l.options.length;u++)if(l.options[u].defaultSelected){l.selectedIndex=u;break}})},window.__dpSchemeSerialize=function(){const r=[];return document.querySelectorAll(".dp-scheme-card").forEach(l=>{const u=l.querySelector('.dp-scheme-preview-light > [class^="scheme-"]');if(!u)return;const m=u.className.replace(/^scheme-/,""),f=l.querySelectorAll(".dp-scheme-mode-column"),y=["light","dark"];f.forEach((w,$)=>{const A=y[$];A&&w.querySelectorAll(".dp-scheme-mapping-row").forEach(R=>{const T=R.querySelector("label"),h=R.querySelector("select");if(!T||!h)return;const O=T.textContent.trim(),_=h.value,M=h.getAttribute("data-library-default")||"";_&&_!==M&&r.push({scheme:m,token:O,mode:A,value:_})})})}),r}})();function Pe(t){const n=String(t).replace(/^#/,"");if(n.length!==6||/[^0-9a-fA-F]/.test(n))throw new Error(`invalid hex color: "${t}"`);const e=parseInt(n,16);return{R:(e>>16&255)/255,G:(e>>8&255)/255,B:(e&255)/255}}function Z(t){if(!Number.isFinite(t))return 0;const n=Math.round(t*255);return n<0?0:n>255?255:n}function Ie({R:t,G:n,B:e}){const i=Z(t),r=Z(n),l=Z(e);return"#"+i.toString(16).padStart(2,"0")+r.toString(16).padStart(2,"0")+l.toString(16).padStart(2,"0")}function Q(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function ee(t){return t<=.0031308?t*12.92:1.055*Math.pow(t,1/2.4)-.055}function De({R:t,G:n,B:e}){return{R:Q(t),G:Q(n),B:Q(e)}}function qe({R:t,G:n,B:e}){return{R:ee(t),G:ee(n),B:ee(e)}}function te(t){return t>=0?Math.cbrt(t):-Math.cbrt(-t)}function Be({R:t,G:n,B:e}){let i=.4122214708*t+.5363325363*n+.0514459929*e,r=.2119034982*t+.6806995451*n+.1073969566*e,l=.0883024619*t+.2817188376*n+.6299787005*e;i=te(i),r=te(r),l=te(l);const u=.2104542553*i+.793617785*r-.0040720468*l,m=1.9779984951*i-2.428592205*r+.4505937099*l,f=.0259040371*i+.7827717662*r-.808675766*l;return{L:u,a:m,b:f}}function ae({L:t,a:n,b:e}){let i=t+.3963377774*n+.2158037573*e,r=t-.1055613458*n-.0638541728*e,l=t-.0894841775*n-1.291485548*e;i=i*i*i,r=r*r*r,l=l*l*l;const u=4.0767416621*i-3.3077115913*r+.2309699292*l,m=-1.2684380046*i+2.6097574011*r-.3413193965*l,f=-.0041960863*i-.7034186147*r+1.707614701*l;return{R:u,G:m,B:f}}function Fe({L:t,a:n,b:e}){const i=Math.sqrt(n*n+e*e),l=(Math.atan2(e,n)*180/Math.PI%360+360)%360;return{L:t,C:i,H:l}}function ie({L:t,C:n,H:e}){const i=e*Math.PI/180;return{L:t,a:n*Math.cos(i),b:n*Math.sin(i)}}function Ge(t){return Fe(Be(De(Pe(t))))}function V({L:t,C:n,H:e}){return Ie(qe(ae(ie({L:t,C:n,H:e}))))}function le({L:t,C:n,H:e}){const i=ie({L:t,C:n,H:e}),r=ae(i),l=.002;return r.R>=-l&&r.R<=1+l&&r.G>=-l&&r.G<=1+l&&r.B>=-l&&r.B<=1+l}function ce(t,n){let e=0,i=.4;for(let r=0;r<40;r++){const l=(e+i)/2;le({L:t,C:l,H:n})?e=l:i=l}return e}function Y({L:t,C:n,H:e}){return le({L:t,C:n,H:e})?{L:t,C:n,H:e}:{L:t,C:ce(t,e),H:e}}function ze(t,n,e){return t<n?n:t>e?e:t}function kt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{hexToSRGB:Pe,sRGBToHex:Ie,sRGBToLinearRGB:De,linearRGBToSRGB:qe,linearRGBToOKLab:Be,oklabToLinearRGB:ae,oklabToOKLCH:Fe,oklchToOKLab:ie,hexToOKLCH:Ge,oklchToHex:V,isInSRGBGamut:le,maxChromaSRGB:ce,clampChroma:Y,clampFloat:ze}))}const de=Object.freeze([50,100,200,300,400,500,600,700,800,900,950]),$t=Object.freeze(["blue","red","orange","yellow","green","grey"]),je=Object.freeze({50:.975,100:.935,200:.875,300:.785,400:.685,500:.58,600:.475,700:.37,800:.275,900:.195,950:.14}),ue=Object.freeze({50:.2,100:.28,200:.38,300:.5,400:.7,500:.8,600:.75,700:.65,800:.55,900:.45,950:.38});function Rt(t,n){const e=t||ue,i=Math.max(0,Math.min(100,n))/100,r={};for(const l of de){const u=Number(l),m=e[u]??e[String(u)]??.5;r[u]=m*i}return r}function Ht(t){if(!t||typeof t.anchorHex!="string")throw new Error("generateRamp: config.anchorHex is required");const n=Ge(t.anchorHex),e=t.lTargets||je,i=t.chromaProfile||ue,r=t.overrides||{},l=typeof t.hueFn=="function"?t.hueFn:null;if(t.isNeutral&&(!Number.isFinite(t.neutralChroma)||!Number.isFinite(t.neutralHue)))throw new Error("generateRamp: isNeutral requires neutralChroma and neutralHue");const u=Object.prototype.hasOwnProperty.call(e,t.anchorStep)?e[t.anchorStep]:.58,m=n.L-u,f=[];for(const y of de){if(Object.prototype.hasOwnProperty.call(r,y)){const[h,O,_]=r[y],M=Y({L:h,C:O,H:_});f.push({step:y,hex:V(M),L:M.L,C:M.C,H:M.H});continue}if(y===t.anchorStep){const h=Y(n);f.push({step:y,hex:V(h),L:h.L,C:h.C,H:h.H});continue}const w=Object.prototype.hasOwnProperty.call(e,y)?e[y]:.58,$=ze(w+m,.06,.985);let A=l?l(y):n.H,R;if(t.isNeutral)R=t.neutralChroma,A=t.neutralHue;else{const h=ce($,A),O=Object.prototype.hasOwnProperty.call(i,y)?i[y]:.5;R=h*O}const T=Y({L:$,C:R,H:A});f.push({step:y,hex:V(T),L:T.L,C:T.C,H:T.H})}return f}function Mt(t=globalThis){t&&(t.DesignPanelColor=t.DesignPanelColor||{},Object.assign(t.DesignPanelColor,{STEPS:de,FAMILY_NAMES:$t,DEFAULT_L_TARGETS:je,DEFAULT_CHROMA_PROFILE:ue,generateRamp:Ht,scaleChromaProfile:Rt}))}function Ot(t=globalThis){kt(t),Mt(t)}(function(){const t=typeof window<"u"&&window.DesignPanelColor||{},n=t.FAMILY_NAMES?Array.from(t.FAMILY_NAMES):["blue","red","orange","yellow","green","grey"],e=t.STEPS?t.STEPS.map(String):["50","100","200","300","400","500","600","700","800","900","950"],i=["default","subtle","accent"],r=["light","dark"],l=["bg","fg","accent","muted","subtle"],u="design-panel:schemes",m="design-panel:ramps",f=300,y={blue:"#1f75ff",red:"#e10600",orange:"#ff4f00",yellow:"#ffa300",green:"#00b312",grey:"#808080"},w={};for(const o of n)w[o]=o.charAt(0).toUpperCase()+o.slice(1);const $=new RegExp(`^(?:${n.join("|")})-(?:${e.join("|")})$`);let A=!1,R=!1,T=!1;function h(o,s,a){const c=document.createElement(o);if(s)for(const d in s)d==="text"?c.textContent=s[d]:d in c&&typeof s[d]!="string"?c[d]=s[d]:c.setAttribute(d,s[d]);if(a)for(const d of a)d!=null&&c.appendChild(d);return c}function O(o){const s=w[o],a=`dp-ramp-settings-${o}`,c=h("span",{class:"dp-ramp-label",text:s}),d=h("span",{class:"dp-ramp-grid","aria-hidden":"true"});for(const D of e)d.appendChild(h("span",{class:"dp-ramp-swatch","data-step":D}));const b=h("button",{class:"dp-ramp-row",type:"button","aria-expanded":"false","aria-controls":a,"aria-label":`${s} ramp settings`},[c,d]),v=h("legend",{class:"dp-ramp-settings-legend",text:`${s} ramp settings`}),C=h("label",{for:`dp-anchor-${o}`,text:"Anchor color"}),N=h("input",{type:"color",id:`dp-anchor-${o}`}),G=h("label",{for:`dp-step-${o}`,text:"Anchor step"}),I=h("select",{id:`dp-step-${o}`});for(const D of e){const Ee=h("option",{value:D,text:D});D==="500"&&(Ee.selected=!0),I.appendChild(Ee)}const bt=h("label",{for:`dp-chroma-${o}`,text:"Chroma intensity"}),gt=h("input",{type:"range",id:`dp-chroma-${o}`,min:"0",max:"100",value:"80"}),yt=h("fieldset",{class:"dp-ramp-settings",id:a,hidden:""},[v,C,N,G,I,bt,gt]);return h("div",{class:"dp-ramp-row-wrapper","data-family":o},[b,yt])}function _(o,s){const a=o.charAt(0).toUpperCase()+o.slice(1);return h("div",{class:`dp-scheme-preview ${s==="dark"?"dp-scheme-preview-dark dark-mode":"dp-scheme-preview-light"}`,"aria-hidden":"true"},[h("div",{class:`scheme-${o}`},[h("div",{class:"dp-scheme-heading",text:a}),h("div",{class:"dp-scheme-divider"}),h("div",{class:"dp-scheme-body",text:"Sample body text"}),h("div",{class:"dp-scheme-meta"},[h("span",{class:"dp-scheme-accent-text",text:"Accent"}),h("span",{class:"dp-scheme-subtle-swatch"}),h("span",{class:"dp-scheme-muted-text",text:"Muted"})])])])}function M(o,s,a){const c=`dp-scheme-${o}-${s}-${a}`;return h("div",{class:"dp-scheme-mapping-row"},[h("label",{for:c,text:a}),h("select",{id:c,"data-scheme":o,"data-mode":s,"data-token":a,"aria-busy":"true"},[h("option",{value:"",disabled:!0,selected:!0,text:"Loading…"})])])}function pe(o,s){const a=he(o),c=s.charAt(0).toUpperCase()+s.slice(1),d=h("summary",{"aria-label":`${a} scheme, ${c} mode`},[_(o,s)]),b=h("legend",{class:"dp-scheme-mode-label",text:c}),v=h("fieldset",{class:"dp-scheme-mode-column"},[b]);for(const C of l)v.appendChild(M(o,s,C));return h("details",{class:"dp-scheme-card-mode","data-mode":s},[d,v])}function Ue(o){const s=he(o);return h("div",{class:"dp-scheme-card","data-scheme":o,role:"listitem","aria-label":`${s} scheme`},[pe(o,"light"),pe(o,"dark")])}function he(o){return o.charAt(0).toUpperCase()+o.slice(1)}function Ke(){const o=document.querySelector("[data-dp-ramp-matrix]");if(o&&!o.firstChild)for(const a of n)o.appendChild(O(a));const s=document.querySelector("[data-dp-scheme-list]");if(s&&!s.firstChild)for(const a of i)s.appendChild(Ue(a))}function Ve(){const o=document.documentElement,s=getComputedStyle(o),a={};for(const c of n){a[c]={};for(const d of e){const b=s.getPropertyValue(`--color-${c}-${d}`).trim();a[c][d]=b||null}}return a}function Ye(o){for(const s of n){const a=document.querySelector(`.dp-ramp-row-wrapper[data-family="${s}"]`);if(a)for(const c of e){const d=a.querySelector(`.dp-ramp-swatch[data-step="${c}"]`);if(!d)continue;const b=o[s][c];b?d.style.backgroundColor=b:A||(console.warn(`[design-panel-colors] Missing --color-${s}-${c} token; leaving swatch unpainted.`),A=!0)}}}function Je(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o){for(;s.firstChild;)s.removeChild(s.firstChild);const a=document.createElement("option");a.value="",a.textContent="—",s.appendChild(a);for(const c of n){const d=w[c],b=document.createElement("optgroup");b.label=d;for(const v of e){const C=document.createElement("option");C.value=`${c}-${v}`,C.textContent=`${d} ${v}`,b.appendChild(C)}s.appendChild(b)}s.removeAttribute("aria-busy")}}function me(o){let s;try{s=localStorage.getItem(o)}catch{return{}}if(!s)return{};try{const a=JSON.parse(s);return a&&typeof a=="object"?a:{}}catch{return{}}}function fe(o){return typeof o=="string"&&$.test(o)}function Xe(){const o=me(u);for(const s of i){const a=o[s];if(!(!a||typeof a!="object"))for(const c of r){const d=a[c];if(!(!d||typeof d!="object"))for(const b of l){const v=d[b];if(!fe(v))continue;const C=document.getElementById(`dp-scheme-${s}-${c}-${b}`);C&&(C.value=v,be(s,c,b,v))}}}}function We(){const o=document.querySelectorAll(".dp-scheme-card select[data-scheme]");for(const s of o)s.addEventListener("change",Ze)}function Ze(o){const s=o.currentTarget,{scheme:a,mode:c,token:d}=s.dataset;if(!(!a||!c||!d)){if(s.value!==""&&!fe(s.value)){console.warn(`[design-panel-colors] ignoring invalid scheme value "${s.value}"`);return}be(a,c,d,s.value),et()}}function be(o,s,a,c){if(typeof window.__dpSchemeUpdate!="function"){R||(console.warn("[design-panel-colors] window.__dpSchemeUpdate is unavailable; runtime scheme overrides cannot be written."),R=!0);return}const d=`--color-${a}`,b=c?`var(--color-${c})`:"initial";if(o==="default"){const v=s==="dark"?".dark-mode":":root";window.__dpSchemeUpdate(v,d,b,"utilities")}else{const v=s==="dark"?`.scheme-${o}.dark-mode`:`.scheme-${o}`;window.__dpSchemeUpdate(v,d,b,"tokens")}}function ge(o,s){let a=null;return function(){a&&clearTimeout(a),a=setTimeout(()=>{a=null;try{localStorage.setItem(o,JSON.stringify(s()))}catch{}},f)}}function Qe(){const o={};for(const s of i){o[s]={light:{},dark:{}};for(const a of r)for(const c of l){const d=document.getElementById(`dp-scheme-${s}-${a}-${c}`);d&&d.value&&(o[s][a][c]=d.value)}}return o}const et=ge(u,Qe);function tt(){const o=document.querySelectorAll(".dp-ramp-row");for(const s of o)s.addEventListener("click",()=>{const a=s.getAttribute("aria-controls");if(!a)return;const c=document.getElementById(a);if(!c)return;c.hasAttribute("hidden")?(c.removeAttribute("hidden"),s.setAttribute("aria-expanded","true")):(c.setAttribute("hidden",""),s.setAttribute("aria-expanded","false"))})}function ot(){const o=window.DesignPanelColor;return!o||typeof o.generateRamp!="function"?(T||(console.warn("[design-panel-colors] window.DesignPanelColor.generateRamp not registered; ramp regeneration disabled. Ensure main.js imports './color/oklch.js' and './color/ramp.js' before this module."),T=!0),null):o}function nt(){const o=getComputedStyle(document.documentElement),s={};for(const a of n){const c=o.getPropertyValue(`--color-${a}-500`).trim(),d=y[a]||"#808080";s[a]={anchorHex:(c||d).toLowerCase(),anchorStep:500,chroma:80,isNeutral:!1}}return s}function ye(){return me(m)}const ve=/^#[0-9a-f]{6}$/,st=new Set(e.map(o=>Number(o)));function rt(o){if(!o||typeof o!="object")return{};const s={};if(typeof o.anchorHex=="string"){const a=o.anchorHex.toLowerCase();ve.test(a)&&(s.anchorHex=a)}return Number.isFinite(o.anchorStep)&&st.has(o.anchorStep)&&(s.anchorStep=o.anchorStep),Number.isFinite(o.chroma)&&o.chroma>=0&&o.chroma<=100&&(s.chroma=o.chroma),typeof o.isNeutral=="boolean"&&(s.isNeutral=o.isNeutral),Number.isFinite(o.neutralChroma)&&o.neutralChroma>=0&&o.neutralChroma<=.5&&(s.neutralChroma=o.neutralChroma),Number.isFinite(o.neutralHue)&&o.neutralHue>=0&&o.neutralHue<360&&(s.neutralHue=o.neutralHue),s}function at(){const o=nt(),s=ye(),a={};for(const c of n)a[c]={...o[c],...rt(s[c])};return a}function it(){const o=ye();return Object.keys(o).length>0}function lt(o,s){if(typeof o.scaleChromaProfile=="function")return o.scaleChromaProfile(o.DEFAULT_CHROMA_PROFILE,s);const a=Math.max(0,Math.min(100,s))/100,c=o.DEFAULT_CHROMA_PROFILE||{},d={};for(const b of e){const v=Number(b),C=c[v]??c[b]??.5;d[v]=C*a}return d}function F(o,s){const a=ot();if(!a)return;const c=s[o];if(!c)return;const d=lt(a,c.chroma);let b;try{b=a.generateRamp({anchorHex:c.anchorHex,anchorStep:c.anchorStep,chromaProfile:d,isNeutral:!!c.isNeutral,neutralChroma:c.neutralChroma,neutralHue:c.neutralHue})}catch(N){console.warn(`[design-panel-colors] generateRamp failed for ${o}: ${N.message}`);return}const v=document.querySelector(`.dp-ramp-row-wrapper[data-family="${o}"]`),C=document.documentElement;for(const N of b){const G=String(N.step);if(C.style.setProperty(`--color-${o}-${G}`,N.hex),v){const I=v.querySelector(`.dp-ramp-swatch[data-step="${G}"]`);I&&(I.style.backgroundColor=N.hex)}}}function ct(o){for(const s of n)F(s,o)}function Se(o,s){o.setAttribute("aria-valuetext",`Chroma ${s} percent`)}function dt(o){const s=ge(m,()=>o);for(const a of n){const c=document.getElementById(`dp-anchor-${a}`),d=document.getElementById(`dp-step-${a}`),b=document.getElementById(`dp-chroma-${a}`);c&&o[a].anchorHex&&(c.value=o[a].anchorHex),d&&(d.value=String(o[a].anchorStep)),b&&(b.value=String(o[a].chroma),Se(b,o[a].chroma)),c&&c.addEventListener("input",()=>{o[a].anchorHex=(c.value||"").toLowerCase(),F(a,o),s()}),d&&d.addEventListener("change",()=>{const v=parseInt(d.value,10);Number.isFinite(v)&&(o[a].anchorStep=v,F(a,o),s())}),b&&b.addEventListener("input",()=>{const v=parseInt(b.value,10);Number.isFinite(v)&&(o[a].chroma=v,Se(b,v),F(a,o),s())})}}function ut(){const o=getComputedStyle(document.documentElement),s=["@layer tokens {","  :root {"];for(const a of n){const c=w[a];s.push(`    /* ${c} */`);for(const d of e){const v=o.getPropertyValue(`--color-${a}-${d}`).trim().toLowerCase();v&&ve.test(v)&&s.push(`    --color-${a}-${d}: ${v};`)}s.push("")}return s.push("  }","}"),s.join(`
`)}function pt(o){let s=document.getElementById("dp-copy-css-status");return s||(s=h("span",{id:"dp-copy-css-status",class:"visually-hidden",role:"status","aria-live":"polite","aria-atomic":"true"}),o.insertAdjacentElement("afterend",s)),s}function ht(){const o=document.querySelector(".dp-copy-css");if(!o)return;const s=pt(o);o.addEventListener("click",()=>{const a=ut(),c=o.textContent,d=(b,v)=>{o.textContent=b,s.textContent=b,setTimeout(()=>{o.textContent=c,s.textContent=""},v)};if(!navigator.clipboard||typeof navigator.clipboard.writeText!="function"){console.warn("[design-panel-colors] navigator.clipboard unavailable"),d("Unavailable",2e3);return}navigator.clipboard.writeText(a).then(()=>{d("Copied",2e3)},b=>{console.error("[design-panel-colors] clipboard write failed:",b),d("Failed",2e3)})})}const mt=5e3;function xe(){return document.querySelector("[data-dp-ramp-matrix]")||document.querySelector("[data-dp-scheme-list]")}function ft(){return xe()?Promise.resolve(!0):new Promise(o=>{const s=new MutationObserver(()=>{xe()&&(c(),o(!0))}),a=setTimeout(()=>{c(),o(!1)},mt);function c(){s.disconnect(),clearTimeout(a)}s.observe(document.body,{childList:!0,subtree:!0})})}function Ce(){ft().then(o=>{o&&X()})}function X(){if(X.done)return;X.done=!0,Ke();const o=Ve();Ye(o),Je(),Xe(),We(),tt();const s=at();it()&&ct(s),dt(s),ht()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ce,{once:!0}):Ce()})();Ot();function _t(t){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()}function Nt(){if(!document.getElementById("dev-column-overlay")){const t=document.createElement("div");t.id="dev-column-overlay",document.body.appendChild(t)}if(!document.getElementById("dev-margin-overlay")){const t=document.createElement("div");t.id="dev-margin-overlay",document.body.appendChild(t)}}function Pt(){document.querySelectorAll(".grid").forEach(t=>{const n=getComputedStyle(t),e=n.gridTemplateColumns.split(" ").filter(r=>r!=="none"&&r.trim()).length;e>0&&(t.dataset.devCols=e,t.style.setProperty("--grid-columns",e));const i=n.columnGap||n.rowGap||n.gap;i&&i!=="normal"&&t.style.setProperty("--grid-gap",i)})}function It(){const t=()=>{document.body.classList.contains("dev-outline-grids")&&Pt()};new MutationObserver(t).observe(document.body,{attributes:!0,attributeFilter:["class"]});let n;window.addEventListener("resize",()=>{clearTimeout(n),n=setTimeout(t,100)}),t()}_t(()=>{Nt(),It()});
