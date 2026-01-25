class y extends HTMLElement{async connectedCallback(){const e=this.getAttribute("src");if(!e){console.error("HtmlInclude: missing src attribute");return}try{const t=await fetch(e);if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);const o=await t.text(),s=document.createElement("template");s.innerHTML=o;const i=s.content.cloneNode(!0);this.innerHTML="",this.appendChild(i),this.querySelectorAll("script").forEach(l=>{const d=document.createElement("script");Array.from(l.attributes).forEach(c=>{d.setAttribute(c.name,c.value)}),d.textContent=l.textContent,l.parentNode.replaceChild(d,l)})}catch(t){console.error(`HtmlInclude: failed to load ${e}`,t)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",y);class x extends HTMLElement{connectedCallback(){const e=[];for(const t of this.childNodes)if(t.nodeType===Node.TEXT_NODE){const o=t.textContent.trim();o&&e.push(o)}else t.nodeType===Node.ELEMENT_NODE&&!t.hasAttribute("slot")&&e.push(t.outerHTML);this._triggerContent=e.join(""),this.render(),this.setupEvents()}disconnectedCallback(){var e;(e=this._abortController)==null||e.abort()}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}sanitizeHref(e){return e?/^(javascript|data|vbscript):/i.test(e)?(console.warn("PopupDialog: Blocked potentially dangerous href:",e),""):e:""}get title(){return this.getAttribute("title")||"Confirm"}get body(){return this.getAttribute("body")||""}get confirmLabel(){return this.getAttribute("confirm-label")||"Confirm"}get cancelLabel(){return this.getAttribute("cancel-label")||"Cancel"}get confirmHref(){return this.sanitizeHref(this.getAttribute("confirm-href")||"")}get confirmVariant(){return this.getAttribute("confirm-variant")||"accent"}get noCancel(){return this.hasAttribute("no-cancel")}open(){var e;(e=this.querySelector("dialog"))==null||e.showModal()}close(){var e;(e=this.querySelector("dialog"))==null||e.close()}confirm(){this.confirmHref?window.location.href=this.confirmHref:this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),this.close()}render(){const e=this.querySelector('[slot="body"]'),t=this.querySelector('[slot="actions"]'),o=e?e.innerHTML:this.escapeHtml(this.body),i=`button button--${this.escapeHtml(this.confirmVariant)}`,a=this.escapeHtml(this.confirmLabel),l=this.escapeHtml(this.cancelLabel),d=`
      ${this.noCancel?"":`<button type="button" class="button" data-action="cancel">${l}</button>`}
      ${this.confirmHref?`<a href="${this.confirmHref}" class="${i}" data-action="confirm">${a}</a>`:`<button type="button" class="${i}" data-action="confirm">${a}</button>`}
    `,c=t?t.innerHTML:d,u=this.escapeHtml(this.title);this.innerHTML=`
      <span class="dialog-trigger" data-trigger>${this._triggerContent}</span>
      <dialog class="dialog imposter imposter-fixed">
        <div class="box stack">
          <header class="cluster cluster-between cluster-nowrap">
            <h2>${u}</h2>
            <button class="dialog-close" data-close type="button" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </header>
          <div>${o}</div>
          <footer class="cluster cluster-end pt-1 mt-05 border-t">
            ${c}
          </footer>
        </div>
      </dialog>
    `}setupEvents(){const e=this.querySelector("[data-trigger]"),t=this.querySelector("dialog"),o=this.querySelector("[data-close]");this._abortController=new AbortController;const{signal:s}=this._abortController;e.addEventListener("click",i=>{i.preventDefault(),t.showModal()},{signal:s}),o.addEventListener("click",()=>{t.close()},{signal:s}),t.addEventListener("click",i=>{const a=i.target.closest("[data-action]");if(a){const l=a.dataset.action;l==="cancel"||l==="close"?(i.preventDefault(),t.close()):l==="confirm"&&a.tagName!=="A"&&(i.preventDefault(),this.dispatchEvent(new CustomEvent("confirm",{bubbles:!0})),t.close())}i.target===t&&t.close()},{signal:s})}}customElements.get("popup-dialog")||customElements.define("popup-dialog",x);class f{constructor(){this.tools={darkMode:{key:"d",label:"Theme",target:"body",active:!1,customToggle:"theme"},baseline:{key:"b",label:"Baseline",class:"show-baseline",target:"body",active:!1},columns:{key:"c",label:"Columns",class:"show-columns",target:"body",active:!1},margins:{key:"m",label:"Margins",class:"show-margins",target:"body",active:!1},grids:{key:"g",label:"CSS Grids",class:"dev-outline-grids",target:"body",active:!1},outlines:{key:"o",label:"Outlines",class:"dev-outline",target:"body",active:!1},colors:{key:"x",label:"BG Colors",selector:'[class*="bg-"], [class*="scheme-"]',toggle:"background",active:!0},redact:{key:"r",label:"Redact",class:"redact",target:"body",active:!1}},this.settingsConfig={subdivisions:{label:"Baseline subdivisions",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}]},gutter:{label:"Gap",options:[{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"1/4"},{value:"var(--line-05)",label:"1/2"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}]},margin:{label:"Margin",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}]}},this.columnCount=3,this.subdivisionsValue="2",this.gutterValue="var(--line-1)",this.marginMode="section",this.menubarVisible=!0,this.init()}init(){console.log("🛠️ Live Wires Dev Tools initializing..."),this.loadState(),this.createOverlays(),this.createMenubar(),console.log("✅ Dev Tools menubar created"),this.setupKeyboardShortcuts(),this.applyStates(),this.addOutlineStyles(),this.setupResizeListener(),console.log("✅ Dev Tools ready! Press T to toggle menubar")}setupResizeListener(){let e;window.addEventListener("resize",()=>{clearTimeout(e),e=setTimeout(()=>this.onResize(),100)})}onResize(){this.marginMode==="section"&&this.updateMarginMode(this.marginMode),this.tools.grids.active&&this.updateGridColumnCounts()}updateGridColumnCounts(){document.querySelectorAll(".grid").forEach(t=>{const o=getComputedStyle(t),s=o.gridTemplateColumns.split(" ").filter(a=>a!=="none"&&a.trim()).length;s>0&&(t.dataset.devCols=s,t.style.setProperty("--grid-columns",s));const i=o.columnGap||o.rowGap||o.gap;i&&i!=="normal"&&t.style.setProperty("--grid-gap",i)})}createOverlays(){this.columnOverlay=document.createElement("div"),this.columnOverlay.id="dev-column-overlay",document.body.appendChild(this.columnOverlay),this.marginOverlay=document.createElement("div"),this.marginOverlay.id="dev-margin-overlay",document.body.appendChild(this.marginOverlay),this.updateColumnCount(this.columnCount),this.updateSubdivisions(this.subdivisionsValue),this.updateGutter(this.gutterValue),this.updateMarginMode(this.marginMode)}updateColumnCount(e){var o;this.columnCount=Math.max(1,Math.min(24,parseInt(e)||3)),document.body.style.setProperty("--dev-columns",this.columnCount);const t=(o=this.menubar)==null?void 0:o.querySelector("#dev-columns-input");t&&t.value!==String(this.columnCount)&&(t.value=this.columnCount),this.saveState()}updateSubdivisions(e){var o;this.subdivisionsValue=e,document.body.dataset.subdivisions=e;const t=(o=this.menubar)==null?void 0:o.querySelector("#dev-subdivisions-select");t&&t.value!==e&&(t.value=e),this.saveState()}updateGutter(e){var o;this.gutterValue=e,document.body.style.setProperty("--dev-gap",e);const t=(o=this.menubar)==null?void 0:o.querySelector("#dev-gutter-select");t&&t.value!==e&&(t.value=e),this.saveState()}updateMarginMode(e){var o;this.marginMode=e,this.columnOverlay.dataset.marginMode=e,this.marginOverlay.dataset.marginMode=e;const t=(o=this.menubar)==null?void 0:o.querySelector("#dev-margins-select");t&&t.value!==e&&(t.value=e),this.saveState()}loadState(){const e=localStorage.getItem("livewires-dev-tools");if(e)try{const t=JSON.parse(e);t.marginValue&&!t.marginMode&&(t.marginMode="section",delete t.marginValue),Object.keys(t).forEach(o=>{o==="columnCount"?this.columnCount=t[o]:o==="subdivisionsValue"?this.subdivisionsValue=t[o]:o==="gutterValue"?this.gutterValue=t[o]:o==="marginMode"?this.marginMode=t[o]:o==="menubarVisible"?this.menubarVisible=t[o]:this.tools[o]&&(this.tools[o].active=t[o])})}catch{console.warn("Could not load dev tools state")}}saveState(){const e={columnCount:this.columnCount,subdivisionsValue:this.subdivisionsValue,gutterValue:this.gutterValue,marginMode:this.marginMode,menubarVisible:this.menubarVisible};Object.keys(this.tools).forEach(t=>{e[t]=this.tools[t].active});try{localStorage.setItem("livewires-dev-tools",JSON.stringify(e))}catch(t){console.warn("Could not save dev tools state:",t.message)}}applyStates(){Object.keys(this.tools).forEach(e=>{this.tools[e].active&&this.applyToolState(e)})}applyToolState(e){var s;const t=this.tools[e];if(!t||!t.active)return;if(t.customToggle==="theme"){const i=window.matchMedia("(prefers-color-scheme: dark)").matches;document.body.classList.remove("dark-mode","light-mode"),i?document.body.classList.add("light-mode"):document.body.classList.add("dark-mode")}else if(t.class&&t.target){const i=t.target==="body"?document.body:document.querySelector(t.target);i&&i.classList.add(t.class),e==="grids"&&this.updateGridColumnCounts()}else t.selector&&t.toggle;const o=(s=this.menubar)==null?void 0:s.querySelector(`[data-tool="${e}"]`);o&&o.classList.add("active")}createMenubar(){const e=document.createElement("div");e.id="dev-tools-menubar",e.className="dev-tools-menubar",e.style.display=this.menubarVisible?"flex":"none",Object.keys(this.tools).forEach(n=>{const r=this.tools[n],b=document.createElement("button");b.className="dev-tool-button",b.dataset.tool=n,b.innerHTML=`<span class="dev-tool-label">${r.label}</span> <kbd>${r.key.toUpperCase()}</kbd>`,b.onclick=()=>this.toggle(n),r.active&&b.classList.add("active"),e.appendChild(b)});const t=document.createElement("div");t.className="dev-settings-wrapper";const o=document.createElement("button");o.className="dev-tool-button dev-settings-btn",o.innerHTML="Settings",o.onclick=()=>this.toggleSettings(),t.appendChild(o);const s=document.createElement("div");s.className="dev-settings-popover",s.id="dev-settings-popover";const i=document.createElement("div");i.className="dev-setting-row",i.innerHTML="<label>Columns</label>";const a=document.createElement("input");a.type="number",a.id="dev-columns-input",a.className="dev-tool-input",a.value=this.columnCount,a.min=1,a.max=24,a.addEventListener("change",n=>this.updateColumnCount(n.target.value)),a.addEventListener("keydown",n=>{n.stopPropagation(),n.key==="Enter"&&(this.updateColumnCount(n.target.value),n.target.blur())}),i.appendChild(a),s.appendChild(i);const l=document.createElement("div");l.className="dev-setting-row",l.innerHTML="<label>Baseline subdivisions</label>";const d=document.createElement("select");d.id="dev-subdivisions-select",d.className="dev-tool-select",this.settingsConfig.subdivisions.options.forEach(n=>{const r=document.createElement("option");r.value=n.value,r.textContent=n.label,d.appendChild(r)}),d.value=this.subdivisionsValue,d.addEventListener("change",n=>this.updateSubdivisions(n.target.value)),l.appendChild(d),s.appendChild(l);const c=document.createElement("div");c.className="dev-setting-row",c.innerHTML="<label>Gap</label>";const u=document.createElement("select");u.id="dev-gutter-select",u.className="dev-tool-select",this.settingsConfig.gutter.options.forEach(n=>{const r=document.createElement("option");r.value=n.value,r.textContent=n.label,u.appendChild(r)}),u.value=this.gutterValue,u.addEventListener("change",n=>this.updateGutter(n.target.value)),c.appendChild(u),s.appendChild(c);const m=document.createElement("div");m.className="dev-setting-row",m.innerHTML="<label>Margin</label>";const p=document.createElement("select");p.id="dev-margins-select",p.className="dev-tool-select",this.settingsConfig.margin.options.forEach(n=>{const r=document.createElement("option");r.value=n.value,r.textContent=n.label,p.appendChild(r)}),p.value=this.marginMode,p.addEventListener("change",n=>this.updateMarginMode(n.target.value)),m.appendChild(p),s.appendChild(m),t.appendChild(s),e.appendChild(t);const h=document.createElement("button");h.className="dev-tools-help",h.innerHTML="<kbd>T</kbd> hide",h.onclick=()=>this.toggleMenubar(),e.appendChild(h);const g=document.createElement("button");g.id="dev-tools-show",g.className="dev-tools-show",g.innerHTML='<svg width="16" height="16" viewBox="0 0 38 38" fill="currentColor"><path d="M0 0L0 38L38 38L38 30L8 30L8 0L0 0Z"/><rect x="10" width="8" height="28"/><rect x="30" width="8" height="28"/><rect x="20" width="8" height="28"/></svg>',g.title="Show dev tools (T)",g.onclick=()=>this.toggleMenubar(),g.style.display=this.menubarVisible?"none":"block",document.body.appendChild(g),this.showButton=g,document.body.appendChild(e),this.menubar=e,this.settingsPopover=s}toggleSettings(){this.settingsPopover.classList.toggle("open")}setupKeyboardShortcuts(){document.addEventListener("keydown",e=>{if(!e.target.matches("input, textarea, [contenteditable]")){if(e.key==="t"||e.key==="T"){e.preventDefault(),this.toggleMenubar();return}Object.keys(this.tools).forEach(t=>{e.key===this.tools[t].key&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&(e.preventDefault(),this.toggle(t))})}})}toggleMenubar(){this.menubarVisible=!this.menubarVisible,this.menubar.style.display=this.menubarVisible?"flex":"none",this.showButton.style.display=this.menubarVisible?"none":"block",this.saveState()}toggle(e,t=!1){var i;const o=this.tools[e];if(!o)return;o.active=!o.active,o.customToggle==="theme"?this.toggleTheme(e):o.class&&o.target?this.toggleClass(e):o.selector&&o.toggle&&this.toggleBackground(e);const s=(i=this.menubar)==null?void 0:i.querySelector(`[data-tool="${e}"]`);s&&s.classList.toggle("active",o.active),t||this.saveState()}toggleClass(e){const t=this.tools[e],o=t.target==="body"?document.body:document.querySelector(t.target);o&&(o.classList.toggle(t.class,t.active),e==="grids"&&t.active&&this.updateGridColumnCounts())}toggleBackground(e){const t=this.tools[e];document.querySelectorAll(t.selector).forEach(s=>{t.active?s.style.removeProperty("background-color"):s.style.backgroundColor="transparent"})}toggleTheme(e){var i;const t=this.tools[e],o=window.matchMedia("(prefers-color-scheme: dark)").matches;document.body.classList.remove("dark-mode","light-mode"),t.active&&(o?document.body.classList.add("light-mode"):document.body.classList.add("dark-mode"));const s=(i=this.menubar)==null?void 0:i.querySelector(`[data-tool="${e}"]`);if(s){const a=s.querySelector(".dev-tool-label");t.active?a.textContent=o?"Light":"Dark":a.textContent="Theme"}}addOutlineStyles(){const e=document.createElement("style");e.id="dev-tools-styles",e.textContent=`
      /* Dev Tools Menubar */
      .dev-tools-menubar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.95);
        color: #fff;
        padding: 6px 12px;
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        --touch-target-min: 33px;
      }

      .dev-tool-button {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.8);
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        border-radius: 4px;
        transition: background 0.15s, color 0.15s;
      }

      .dev-tool-button:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }

      .dev-tool-button.active {
        background: rgba(100, 200, 255, 0.2);
        color: #6be0ff;
      }

      .dev-tool-button kbd {
        font-size: 10px;
        font-family: ui-monospace, monospace;
        padding: 2px 4px;
        background: rgba(255,255,255,0.15);
        border-radius: 3px;
        margin-left: 2px;
      }

      .dev-tool-button.active kbd {
        background: rgba(100, 200, 255, 0.3);
      }

      /* Settings wrapper and popover */
      .dev-settings-wrapper {
        position: relative;
      }

      .dev-settings-btn {
        border-left: 1px solid rgba(255,255,255,0.2);
        margin-left: 4px;
        padding-left: 12px;
      }

      .dev-settings-popover {
        position: absolute;
        bottom: 100%;
        right: 0;
        background: rgba(30, 30, 30, 0.98);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px;
        padding: 6px 10px;
        margin-bottom: 8px;
        min-width: 240px;
        display: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        line-height: 1.2;
      }

      .dev-settings-popover.open {
        display: block;
      }

      .dev-setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 0;
      }

      .dev-setting-row label {
        font-size: 12px;
        color: rgba(255,255,255,0.7);
        white-space: nowrap;
      }

      .dev-tool-input,
      .dev-tool-select {
        width: 70px;
        padding: 3px 6px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        color: #fff;
        font-family: ui-monospace, monospace;
        font-size: 11px;
        text-align: center;
        box-sizing: border-box;
      }

      .dev-tool-input::-webkit-outer-spin-button,
      .dev-tool-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .dev-tool-input[type=number] {
        -moz-appearance: textfield;
      }

      .dev-tool-select {
        cursor: pointer;
        text-align: left;
        padding-right: 20px;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='%23999'%3E%3Cpath d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 6px center;
      }

      .dev-tool-input:focus,
      .dev-tool-select:focus {
        outline: none;
        border-color: #6be0ff;
      }

      .dev-tools-help {
        margin-left: auto;
        padding: 4px 8px;
        padding-left: 12px;
        color: rgba(255,255,255,0.5);
        font-size: 12px;
        font-family: inherit;
        border: none;
        border-left: 1px solid rgba(255,255,255,0.2);
        background: transparent;
        cursor: pointer;
        border-radius: 0 4px 4px 0;
        transition: color 0.15s, background 0.15s;
      }

      .dev-tools-help:hover {
        color: rgba(255,255,255,0.8);
        background: rgba(255,255,255,0.1);
      }

      .dev-tools-help kbd {
        font-size: 10px;
        font-family: ui-monospace, monospace;
        padding: 2px 4px;
        background: rgba(255,255,255,0.15);
        border-radius: 3px;
      }

      /* Show button (visible when menubar is hidden) */
      .dev-tools-show {
        position: fixed;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.8);
        color: rgba(255, 255, 255, 0.7);
        border: none;
        padding: 10px;
        line-height: 0;
        border-radius: 4px;
        cursor: pointer;
        z-index: 10000;
        opacity: 0.4;
        transition: opacity 0.15s;
        --touch-target-min: 0px;
      }

      .dev-tools-show:hover {
        opacity: 1;
        color: #fff;
      }

      .dev-tools-show svg {
        display: block;
      }

      /* Layout Outlines - All layout primitives */
      body.dev-outline .stack,
      body.dev-outline .cluster,
      body.dev-outline .grid,
      body.dev-outline .sidebar,
      body.dev-outline .center,
      body.dev-outline .box,
      body.dev-outline .cover,
      body.dev-outline .section {
        outline: 2px solid color-mix(in srgb, var(--color-accent, #0066ff) 50%, transparent);
        outline-offset: -2px;
      }

      body.dev-outline .stack > *,
      body.dev-outline .cluster > *,
      body.dev-outline .grid > *,
      body.dev-outline .sidebar > *,
      body.dev-outline .center > *,
      body.dev-outline .box > *,
      body.dev-outline .cover > *,
      body.dev-outline .section > * {
        outline: 1px dashed color-mix(in srgb, var(--color-accent, #0066ff) 30%, transparent);
        outline-offset: -1px;
      }
    `,document.head.appendChild(e)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{window.devTools=new f}):window.devTools=new f;
