class f extends HTMLElement{async connectedCallback(){const t=this.getAttribute("src");if(!t){console.error("HtmlInclude: missing src attribute");return}try{const e=await fetch(t);if(!e.ok)throw new Error(`HTTP ${e.status}: ${e.statusText}`);const o=await e.text(),s=document.createElement("template");s.innerHTML=o;const a=s.content.cloneNode(!0);this.innerHTML="",this.appendChild(a),this.querySelectorAll("script").forEach(d=>{const r=document.createElement("script");Array.from(d.attributes).forEach(c=>{r.setAttribute(c.name,c.value)}),r.textContent=d.textContent,d.parentNode.replaceChild(r,d)})}catch(e){console.error(`HtmlInclude: failed to load ${t}`,e)}}disconnectedCallback(){this.innerHTML=""}}customElements.get("html-include")||customElements.define("html-include",f);class v{constructor(){this.tools={darkMode:{key:"d",label:"Theme",target:"body",active:!1,customToggle:"theme"},baseline:{key:"b",label:"Baseline",class:"show-baseline",target:"body",active:!1},columns:{key:"c",label:"Columns",class:"show-columns",target:"body",active:!1},margins:{key:"m",label:"Margins",class:"show-margins",target:"body",active:!1},grids:{key:"g",label:"CSS Grids",class:"dev-outline-grids",target:"body",active:!1},outlines:{key:"o",label:"Outlines",class:"dev-outline",target:"body",active:!1},colors:{key:"x",label:"BG Colors",selector:'[class*="bg-"], [class*="scheme-"]',toggle:"background",active:!0},redact:{key:"r",label:"Redact",class:"redact",target:"body",active:!1}},this.settingsConfig={subdivisions:{label:"Baseline subdivisions",options:[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"},{value:"4",label:"4"}]},gutter:{label:"Gap",options:[{value:"0",label:"0"},{value:"var(--line-1px)",label:"1px"},{value:"var(--line-025)",label:"1/4"},{value:"var(--line-05)",label:"1/2"},{value:"var(--line-1)",label:"1"},{value:"var(--line-2)",label:"2"}]},margin:{label:"Margin",options:[{value:"section",label:"Section"},{value:"full-bleed",label:"Full-bleed"},{value:"wide",label:"Wide"}]}},this.columnCount=3,this.subdivisionsValue="2",this.gutterValue="var(--line-1)",this.marginMode="section",this.menubarVisible=!0,this.init()}init(){console.log("🛠️ Live Wires Dev Tools initializing..."),this.loadState(),this.createOverlays(),this.createMenubar(),console.log("✅ Dev Tools menubar created"),this.setupKeyboardShortcuts(),this.applyStates(),this.addOutlineStyles(),this.setupResizeListener(),console.log("✅ Dev Tools ready! Press ? to toggle menubar")}setupResizeListener(){let t;window.addEventListener("resize",()=>{clearTimeout(t),t=setTimeout(()=>this.onResize(),100)})}onResize(){this.marginMode==="section"&&this.updateMarginMode(this.marginMode),this.tools.grids.active&&this.updateGridColumnCounts()}updateGridColumnCounts(){document.querySelectorAll(".grid").forEach(e=>{const o=getComputedStyle(e),s=o.gridTemplateColumns.split(" ").filter(i=>i!=="none"&&i.trim()).length;s>0&&(e.dataset.devCols=s,e.style.setProperty("--grid-columns",s));const a=o.columnGap||o.rowGap||o.gap;a&&a!=="normal"&&e.style.setProperty("--grid-gap",a)})}createOverlays(){this.columnOverlay=document.createElement("div"),this.columnOverlay.id="dev-column-overlay",document.body.appendChild(this.columnOverlay),this.marginOverlay=document.createElement("div"),this.marginOverlay.id="dev-margin-overlay",document.body.appendChild(this.marginOverlay),this.updateColumnCount(this.columnCount),this.updateSubdivisions(this.subdivisionsValue),this.updateGutter(this.gutterValue),this.updateMarginMode(this.marginMode)}updateColumnCount(t){var o;this.columnCount=Math.max(1,Math.min(24,parseInt(t)||3)),document.body.style.setProperty("--dev-columns",this.columnCount);const e=(o=this.menubar)==null?void 0:o.querySelector("#dev-columns-input");e&&e.value!==String(this.columnCount)&&(e.value=this.columnCount),this.saveState()}updateSubdivisions(t){var o;this.subdivisionsValue=t,document.body.dataset.subdivisions=t;const e=(o=this.menubar)==null?void 0:o.querySelector("#dev-subdivisions-select");e&&e.value!==t&&(e.value=t),this.saveState()}updateGutter(t){var o;this.gutterValue=t,document.body.style.setProperty("--dev-gap",t);const e=(o=this.menubar)==null?void 0:o.querySelector("#dev-gutter-select");e&&e.value!==t&&(e.value=t),this.saveState()}updateMarginMode(t){var o;this.marginMode=t,this.columnOverlay.dataset.marginMode=t,this.marginOverlay.dataset.marginMode=t;const e=(o=this.menubar)==null?void 0:o.querySelector("#dev-margins-select");e&&e.value!==t&&(e.value=t),this.saveState()}loadState(){const t=localStorage.getItem("livewires-dev-tools");if(t)try{const e=JSON.parse(t);e.marginValue&&!e.marginMode&&(e.marginMode="section",delete e.marginValue),Object.keys(e).forEach(o=>{o==="columnCount"?this.columnCount=e[o]:o==="subdivisionsValue"?this.subdivisionsValue=e[o]:o==="gutterValue"?this.gutterValue=e[o]:o==="marginMode"?this.marginMode=e[o]:this.tools[o]&&(this.tools[o].active=e[o])})}catch{console.warn("Could not load dev tools state")}}saveState(){const t={columnCount:this.columnCount,subdivisionsValue:this.subdivisionsValue,gutterValue:this.gutterValue,marginMode:this.marginMode};Object.keys(this.tools).forEach(e=>{t[e]=this.tools[e].active});try{localStorage.setItem("livewires-dev-tools",JSON.stringify(t))}catch(e){console.warn("Could not save dev tools state:",e.message)}}applyStates(){Object.keys(this.tools).forEach(t=>{this.tools[t].active&&this.applyToolState(t)})}applyToolState(t){var s;const e=this.tools[t];if(!e||!e.active)return;if(e.customToggle==="theme"){const a=window.matchMedia("(prefers-color-scheme: dark)").matches;document.body.classList.remove("dark-mode","light-mode"),a?document.body.classList.add("light-mode"):document.body.classList.add("dark-mode")}else if(e.class&&e.target){const a=e.target==="body"?document.body:document.querySelector(e.target);a&&a.classList.add(e.class),t==="grids"&&this.updateGridColumnCounts()}else e.selector&&e.toggle;const o=(s=this.menubar)==null?void 0:s.querySelector(`[data-tool="${t}"]`);o&&o.classList.add("active")}createMenubar(){const t=document.createElement("div");t.id="dev-tools-menubar",t.className="dev-tools-menubar",t.style.display=this.menubarVisible?"flex":"none",Object.keys(this.tools).forEach(n=>{const l=this.tools[n],g=document.createElement("button");g.className="dev-tool-button",g.dataset.tool=n,g.innerHTML=`<span class="dev-tool-label">${l.label}</span> <kbd>${l.key.toUpperCase()}</kbd>`,g.onclick=()=>this.toggle(n),l.active&&g.classList.add("active"),t.appendChild(g)});const e=document.createElement("div");e.className="dev-settings-wrapper";const o=document.createElement("button");o.className="dev-tool-button dev-settings-btn",o.innerHTML="Settings",o.onclick=()=>this.toggleSettings(),e.appendChild(o);const s=document.createElement("div");s.className="dev-settings-popover",s.id="dev-settings-popover";const a=document.createElement("div");a.className="dev-setting-row",a.innerHTML="<label>Columns</label>";const i=document.createElement("input");i.type="number",i.id="dev-columns-input",i.className="dev-tool-input",i.value=this.columnCount,i.min=1,i.max=24,i.addEventListener("change",n=>this.updateColumnCount(n.target.value)),i.addEventListener("keydown",n=>{n.stopPropagation(),n.key==="Enter"&&(this.updateColumnCount(n.target.value),n.target.blur())}),a.appendChild(i),s.appendChild(a);const d=document.createElement("div");d.className="dev-setting-row",d.innerHTML="<label>Baseline subdivisions</label>";const r=document.createElement("select");r.id="dev-subdivisions-select",r.className="dev-tool-select",this.settingsConfig.subdivisions.options.forEach(n=>{const l=document.createElement("option");l.value=n.value,l.textContent=n.label,r.appendChild(l)}),r.value=this.subdivisionsValue,r.addEventListener("change",n=>this.updateSubdivisions(n.target.value)),d.appendChild(r),s.appendChild(d);const c=document.createElement("div");c.className="dev-setting-row",c.innerHTML="<label>Gap</label>";const u=document.createElement("select");u.id="dev-gutter-select",u.className="dev-tool-select",this.settingsConfig.gutter.options.forEach(n=>{const l=document.createElement("option");l.value=n.value,l.textContent=n.label,u.appendChild(l)}),u.value=this.gutterValue,u.addEventListener("change",n=>this.updateGutter(n.target.value)),c.appendChild(u),s.appendChild(c);const m=document.createElement("div");m.className="dev-setting-row",m.innerHTML="<label>Margin</label>";const p=document.createElement("select");p.id="dev-margins-select",p.className="dev-tool-select",this.settingsConfig.margin.options.forEach(n=>{const l=document.createElement("option");l.value=n.value,l.textContent=n.label,p.appendChild(l)}),p.value=this.marginMode,p.addEventListener("change",n=>this.updateMarginMode(n.target.value)),m.appendChild(p),s.appendChild(m),e.appendChild(s),t.appendChild(e);const b=document.createElement("button");b.className="dev-tools-help",b.innerHTML="<kbd>?</kbd> hide",b.onclick=()=>this.toggleMenubar(),t.appendChild(b),document.body.appendChild(t),this.menubar=t,this.settingsPopover=s}toggleSettings(){this.settingsPopover.classList.toggle("open")}setupKeyboardShortcuts(){document.addEventListener("keydown",t=>{if(!t.target.matches("input, textarea, [contenteditable]")){if(t.key==="?"){t.preventDefault(),this.toggleMenubar();return}Object.keys(this.tools).forEach(e=>{t.key===this.tools[e].key&&!t.metaKey&&!t.ctrlKey&&!t.altKey&&(t.preventDefault(),this.toggle(e))})}})}toggleMenubar(){this.menubarVisible=!this.menubarVisible,this.menubar.style.display=this.menubarVisible?"flex":"none"}toggle(t,e=!1){var a;const o=this.tools[t];if(!o)return;o.active=!o.active,o.customToggle==="theme"?this.toggleTheme(t):o.class&&o.target?this.toggleClass(t):o.selector&&o.toggle&&this.toggleBackground(t);const s=(a=this.menubar)==null?void 0:a.querySelector(`[data-tool="${t}"]`);s&&s.classList.toggle("active",o.active),e||this.saveState()}toggleClass(t){const e=this.tools[t],o=e.target==="body"?document.body:document.querySelector(e.target);o&&(o.classList.toggle(e.class,e.active),t==="grids"&&e.active&&this.updateGridColumnCounts())}toggleBackground(t){const e=this.tools[t];document.querySelectorAll(e.selector).forEach(s=>{e.active?s.style.removeProperty("background-color"):s.style.backgroundColor="transparent"})}toggleTheme(t){var a;const e=this.tools[t],o=window.matchMedia("(prefers-color-scheme: dark)").matches;document.body.classList.remove("dark-mode","light-mode"),e.active&&(o?document.body.classList.add("light-mode"):document.body.classList.add("dark-mode"));const s=(a=this.menubar)==null?void 0:a.querySelector(`[data-tool="${t}"]`);if(s){const i=s.querySelector(".dev-tool-label");e.active?i.textContent=o?"Light":"Dark":i.textContent="Theme"}}addOutlineStyles(){const t=document.createElement("style");t.id="dev-tools-styles",t.textContent=`
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
    `,document.head.appendChild(t)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{window.devTools=new v}):window.devTools=new v;
