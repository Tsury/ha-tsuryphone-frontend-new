/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t$1.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$2="?"+h,n$1=`<${o$2}>`,r$2=document,l=()=>r$2.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$2.createTreeWalker(r$2,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$1:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$2)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r$2.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$2).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r$2,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$2.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t$1.litHtmlPolyfillSupport;j?.(N,R),(t$1.litHtmlVersions??=[]).push("3.3.1");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

/**
 * Common HA theme CSS variables for consistent styling
 */
const haThemeVariables = i$3 `
  /* Primary colors */
  --tsury-primary-color: var(--primary-color);
  --tsury-primary-text-color: var(--primary-text-color);
  --tsury-secondary-text-color: var(--secondary-text-color);
  --tsury-disabled-text-color: var(--disabled-text-color);
  --tsury-text-primary-color: var(--text-primary-color);

  /* Background colors */
  --tsury-card-background-color: var(--card-background-color);
  --tsury-primary-background-color: var(--primary-background-color);
  --tsury-secondary-background-color: var(--secondary-background-color);

  /* State colors */
  --tsury-success-color: var(--success-color, #4caf50);
  --tsury-error-color: var(--error-color, #f44336);
  --tsury-warning-color: var(--warning-color, #ff9800);
  --tsury-info-color: var(--info-color, #2196f3);

  /* Dividers and borders */
  --tsury-divider-color: var(--divider-color);
  --tsury-outline-color: var(--outline-color, var(--divider-color));

  /* Shadows */
  --tsury-card-box-shadow: var(--ha-card-box-shadow);

  /* Interactive states */
  --tsury-state-active-color: var(--state-active-color, var(--primary-color));
  --tsury-state-hover-opacity: 0.08;
  --tsury-state-focus-opacity: 0.12;
  --tsury-state-selected-opacity: 0.12;
  --tsury-state-pressed-opacity: 0.12;

  /* Spacing */
  --tsury-spacing-xs: 4px;
  --tsury-spacing-sm: 8px;
  --tsury-spacing-md: 16px;
  --tsury-spacing-lg: 24px;
  --tsury-spacing-xl: 32px;

  /* Border radius */
  --tsury-border-radius-sm: 4px;
  --tsury-border-radius-md: 8px;
  --tsury-border-radius-lg: 12px;
  --tsury-border-radius-xl: 16px;

  /* Typography */
  --tsury-font-family: var(--paper-font-common-base_-_font-family, 'Roboto', sans-serif);
  --tsury-font-size-sm: 12px;
  --tsury-font-size-md: 14px;
  --tsury-font-size-lg: 16px;
  --tsury-font-size-xl: 20px;
  --tsury-font-size-xxl: 24px;
  --tsury-font-weight-regular: 400;
  --tsury-font-weight-medium: 500;
  --tsury-font-weight-bold: 700;

  /* Transitions */
  --tsury-transition-duration: 200ms;
  --tsury-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
`;
/**
 * Helper function to determine if dark mode is active
 */
function isDarkMode(hass) {
    return hass?.themes?.darkMode ?? false;
}
/**
 * Common button styles respecting HA theme
 */
const haButtonStyles = i$3 `
  button {
    font-family: var(--tsury-font-family);
    font-size: var(--tsury-font-size-md);
    font-weight: var(--tsury-font-weight-medium);
    border: none;
    border-radius: var(--tsury-border-radius-md);
    padding: var(--tsury-spacing-sm) var(--tsury-spacing-md);
    cursor: pointer;
    transition: all var(--tsury-transition-duration) var(--tsury-transition-timing);
    outline: none;
    position: relative;
    overflow: hidden;
  }

  button:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  button:not(:disabled):hover {
    filter: brightness(1.1);
  }

  button:not(:disabled):active {
    filter: brightness(0.9);
  }

  button.primary {
    background-color: var(--tsury-primary-color);
    color: var(--text-primary-color);
  }

  button.success {
    background-color: var(--tsury-success-color);
    color: white;
  }

  button.error {
    background-color: var(--tsury-error-color);
    color: white;
  }

  button.text {
    background-color: transparent;
    color: var(--tsury-primary-color);
  }

  button.outlined {
    background-color: transparent;
    color: var(--tsury-primary-color);
    border: 1px solid var(--tsury-outline-color);
  }

  /* Ripple effect */
  button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  button:active::before {
    width: 300px;
    height: 300px;
  }
`;
/**
 * Common card styles respecting HA theme
 */
const haCardStyles = i$3 `
  .card {
    background-color: var(--tsury-card-background-color);
    border-radius: var(--ha-card-border-radius, var(--tsury-border-radius-lg));
    box-shadow: var(--tsury-card-box-shadow);
    padding: var(--tsury-spacing-md);
  }

  .card-header {
    font-size: var(--tsury-font-size-xl);
    font-weight: var(--tsury-font-weight-medium);
    color: var(--tsury-primary-text-color);
    margin-bottom: var(--tsury-spacing-md);
  }

  .card-content {
    color: var(--tsury-primary-text-color);
  }
`;
/**
 * Common list item styles
 */
i$3 `
  .list-item {
    display: flex;
    align-items: center;
    padding: var(--tsury-spacing-md);
    min-height: 48px;
    cursor: pointer;
    transition: background-color var(--tsury-transition-duration) var(--tsury-transition-timing);
    border-radius: var(--tsury-border-radius-md);
  }

  .list-item:hover {
    background-color: rgba(var(--rgb-primary-color), var(--tsury-state-hover-opacity));
  }

  .list-item:active {
    background-color: rgba(var(--rgb-primary-color), var(--tsury-state-pressed-opacity));
  }

  .list-item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--tsury-spacing-md);
    font-size: var(--tsury-font-size-lg);
    font-weight: var(--tsury-font-weight-medium);
  }

  .list-item-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .list-item-primary {
    font-size: var(--tsury-font-size-md);
    color: var(--tsury-primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-item-secondary {
    font-size: var(--tsury-font-size-sm);
    color: var(--tsury-secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .divider {
    height: 1px;
    background-color: var(--tsury-divider-color);
    margin: var(--tsury-spacing-sm) 0;
  }
`;

/**
 * Common utility styles used across components
 */
const commonStyles = i$3 `
  * {
    box-sizing: border-box;
  }

  .flex {
    display: flex;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }

  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flex-1 {
    flex: 1;
  }

  .text-center {
    text-align: center;
  }

  .text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clickable {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .disabled {
    opacity: 0.38;
    pointer-events: none;
  }

  .hidden {
    display: none !important;
  }

  .scrollable {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .scrollable::-webkit-scrollbar {
    width: 8px;
  }

  .scrollable::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollable::-webkit-scrollbar-thumb {
    background-color: rgba(128, 128, 128, 0.3);
    border-radius: 4px;
  }

  .scrollable::-webkit-scrollbar-thumb:hover {
    background-color: rgba(128, 128, 128, 0.5);
  }

  /* Fade animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  .fade-in {
    animation: fadeIn var(--tsury-transition-duration) var(--tsury-transition-timing);
  }

  .fade-out {
    animation: fadeOut var(--tsury-transition-duration) var(--tsury-transition-timing);
  }

  .slide-in-up {
    animation: slideInUp var(--tsury-transition-duration) var(--tsury-transition-timing);
  }

  .slide-out-down {
    animation: slideOutDown var(--tsury-transition-duration) var(--tsury-transition-timing);
  }
`;

/**
 * TsuryPhone Navigation Component
 * Bottom navigation bar with three tabs: Home, Keypad, Contacts
 */
let TsuryPhoneNavigation = class TsuryPhoneNavigation extends i {
    constructor() {
        super(...arguments);
        this.activeTab = 'home';
        this.disabled = false;
    }
    _handleTabClick(tab) {
        if (this.disabled || tab === this.activeTab) {
            return;
        }
        // Dispatch custom event for parent to handle
        this.dispatchEvent(new CustomEvent('tab-change', {
            detail: { tab },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        return x `
      <nav class="navigation ${this.disabled ? 'disabled' : ''}" role="tablist">
        ${this._renderTab('home', 'mdi:history', 'Home')}
        ${this._renderTab('keypad', 'mdi:dialpad', 'Keypad')}
        ${this._renderTab('contacts', 'mdi:contacts', 'Contacts')}
      </nav>
    `;
    }
    _renderTab(tab, icon, label) {
        const isActive = this.activeTab === tab;
        return x `
      <button
        class="nav-tab ${isActive ? 'active' : ''}"
        role="tab"
        aria-selected="${isActive}"
        aria-label="${label}"
        @click=${() => this._handleTabClick(tab)}
        ?disabled=${this.disabled}
      >
        <ha-icon icon="${icon}"></ha-icon>
        <span class="nav-label">${label}</span>
      </button>
    `;
    }
    static get styles() {
        return [
            haThemeVariables,
            i$3 `
        :host {
          display: block;
        }

        .navigation {
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: var(--tsury-card-background-color);
          border-top: 1px solid var(--tsury-divider-color);
          padding: var(--tsury-spacing-xs) 0;
          min-height: 56px;
          position: relative;
        }

        .navigation.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        .nav-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 4px;
          padding: var(--tsury-spacing-sm);
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--tsury-secondary-text-color);
          transition: all var(--tsury-transition-duration) var(--tsury-transition-timing);
          position: relative;
          min-width: 64px;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-tab:disabled {
          cursor: not-allowed;
        }

        .nav-tab:not(:disabled):hover {
          background: rgba(var(--rgb-primary-color, 128, 128, 128), var(--tsury-state-hover-opacity));
        }

        .nav-tab:not(:disabled):active {
          background: rgba(var(--rgb-primary-color, 128, 128, 128), var(--tsury-state-pressed-opacity));
        }

        .nav-tab:not(:disabled):focus-visible {
          outline: 2px solid var(--tsury-primary-color);
          outline-offset: -2px;
        }

        .nav-tab.active {
          color: var(--tsury-primary-color);
        }

        .nav-tab.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 64px;
          height: 3px;
          background: var(--tsury-primary-color);
          border-radius: 0 0 3px 3px;
          animation: slideIn 200ms var(--tsury-transition-timing);
        }

        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 64px;
            opacity: 1;
          }
        }

        .nav-tab ha-icon {
          --mdc-icon-size: 24px;
          display: block;
        }

        .nav-label {
          font-size: 12px;
          font-weight: var(--tsury-font-weight-medium);
          white-space: nowrap;
        }

        /* Ripple effect on tap */
        .nav-tab::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(var(--rgb-primary-color, 128, 128, 128), 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.4s, height 0.4s;
          pointer-events: none;
        }

        .nav-tab:active::after {
          width: 100px;
          height: 100px;
        }

        /* Mobile optimization */
        @media (max-width: 600px) {
          .nav-label {
            font-size: 11px;
          }

          .nav-tab {
            min-width: 56px;
          }
        }

        /* Desktop optimization */
        @media (min-width: 1024px) {
          .navigation {
            min-height: 64px;
          }

          .nav-tab {
            min-width: 80px;
          }

          .nav-label {
            font-size: 13px;
          }
        }
      `,
        ];
    }
};
__decorate([
    n({ type: String })
], TsuryPhoneNavigation.prototype, "activeTab", void 0);
__decorate([
    n({ type: Boolean })
], TsuryPhoneNavigation.prototype, "disabled", void 0);
TsuryPhoneNavigation = __decorate([
    t('tsuryphone-navigation')
], TsuryPhoneNavigation);

/**
 * Format dates for call history display
 */
/**
 * Format a timestamp for display in call log
 */
function formatCallTime(timestamp) {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diff / 60000);
    const diffHours = Math.floor(diff / 3600000);
    const diffDays = Math.floor(diff / 86400000);
    // Just now (< 1 minute)
    if (diffMinutes < 1) {
        return 'Just now';
    }
    // Minutes ago (< 1 hour)
    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }
    // Hours ago (< 24 hours)
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }
    // Days ago (< 7 days)
    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }
    // Date format for older calls
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}
/**
 * Get group label for call history grouping
 */
function getCallHistoryGroup(timestamp) {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    // Reset time to midnight for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const callDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = today.getTime() - callDate.getTime();
    const diffDays = Math.floor(diffTime / 86400000);
    if (diffDays === 0) {
        return 'Today';
    }
    if (diffDays === 1) {
        return 'Yesterday';
    }
    if (diffDays < 7) {
        return 'This Week';
    }
    if (diffDays < 30) {
        return 'This Month';
    }
    // Format as "Month Year" for older calls
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}
/**
 * Format call duration in seconds to readable format
 */
function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Group and filter call history entries
 */
/**
 * Filter call history by type
 */
function filterCallHistory(calls, filter) {
    if (filter === 'all') {
        return calls;
    }
    return calls.filter(call => call.type === filter);
}
/**
 * Group call history by date ranges
 */
function groupCallHistory(calls) {
    // Create a map of groups
    const groups = new Map();
    // Sort calls by timestamp (newest first)
    const sortedCalls = [...calls].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    // Group calls
    sortedCalls.forEach(call => {
        const groupLabel = getCallHistoryGroup(call.timestamp);
        if (!groups.has(groupLabel)) {
            groups.set(groupLabel, []);
        }
        groups.get(groupLabel).push(call);
    });
    // Convert to array and maintain order
    const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month'];
    const result = [];
    // Add known groups in order
    groupOrder.forEach(label => {
        if (groups.has(label)) {
            result.push({
                groupLabel: label,
                calls: groups.get(label),
            });
            groups.delete(label);
        }
    });
    // Add remaining groups (month/year groups) in chronological order
    const remainingGroups = Array.from(groups.entries())
        .map(([groupLabel, calls]) => ({
        groupLabel,
        calls,
        // Use first call's timestamp for sorting
        timestamp: new Date(calls[0].timestamp).getTime(),
    }))
        .sort((a, b) => b.timestamp - a.timestamp);
    remainingGroups.forEach(group => {
        result.push({
            groupLabel: group.groupLabel,
            calls: group.calls,
        });
    });
    return result;
}
/**
 * Get frequent contacts from call history (top N most called)
 */
function getFrequentContacts(calls, limit = 6) {
    // Count calls per contact
    const contactCounts = new Map();
    calls.forEach(call => {
        const key = call.phoneNumber;
        if (contactCounts.has(key)) {
            contactCounts.get(key).count++;
        }
        else {
            contactCounts.set(key, {
                name: call.contactName,
                phone: call.phoneNumber,
                count: 1,
            });
        }
    });
    // Sort by count and take top N
    return Array.from(contactCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(contact => ({
        contactName: contact.name,
        phoneNumber: contact.phone,
        callCount: contact.count,
    }));
}

let TsuryPhoneCallLogFilters = class TsuryPhoneCallLogFilters extends i {
    constructor() {
        super(...arguments);
        this.activeFilter = 'all';
    }
    _handleFilterClick(filter) {
        this.activeFilter = filter;
        this.dispatchEvent(new CustomEvent('filter-changed', {
            detail: { filter },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        return x `
      <div class="filters">
        <div
          class="filter-chip ${this.activeFilter === 'all' ? 'active' : ''}"
          @click=${() => this._handleFilterClick('all')}
          role="button"
          tabindex="0"
          aria-label="Show all calls"
        >
          All
        </div>
        <div
          class="filter-chip ${this.activeFilter === 'missed' ? 'active' : ''}"
          @click=${() => this._handleFilterClick('missed')}
          role="button"
          tabindex="0"
          aria-label="Show missed calls"
        >
          Missed
        </div>
        <div
          class="filter-chip ${this.activeFilter === 'outgoing' ? 'active' : ''}"
          @click=${() => this._handleFilterClick('outgoing')}
          role="button"
          tabindex="0"
          aria-label="Show outgoing calls"
        >
          Outgoing
        </div>
        <div
          class="filter-chip ${this.activeFilter === 'incoming' ? 'active' : ''}"
          @click=${() => this._handleFilterClick('incoming')}
          role="button"
          tabindex="0"
          aria-label="Show incoming calls"
        >
          Incoming
        </div>
      </div>
    `;
    }
};
TsuryPhoneCallLogFilters.styles = i$3 `
    :host {
      display: block;
    }

    .filters {
      display: flex;
      gap: 8px;
      padding: 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .filters::-webkit-scrollbar {
      display: none;
    }

    .filter-chip {
      flex-shrink: 0;
      padding: 8px 16px;
      border-radius: 16px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      user-select: none;
    }

    .filter-chip:hover {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .filter-chip.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .filter-chip:active {
      transform: scale(0.95);
    }
  `;
__decorate([
    n({ type: String })
], TsuryPhoneCallLogFilters.prototype, "activeFilter", void 0);
TsuryPhoneCallLogFilters = __decorate([
    t('tsuryphone-call-log-filters')
], TsuryPhoneCallLogFilters);

/**
 * Generate consistent avatar colors based on contact name
 */
const AVATAR_COLORS = [
    '#1976d2', // Blue
    '#388e3c', // Green
    '#d32f2f', // Red
    '#7b1fa2', // Purple
    '#f57c00', // Orange
    '#0097a7', // Cyan
    '#c2185b', // Pink
    '#5d4037', // Brown
    '#455a64', // Blue Grey
    '#689f38', // Light Green
    '#0288d1', // Light Blue
    '#e64a19', // Deep Orange
];
/**
 * Simple hash function for strings
 */
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
/**
 * Get a consistent color for a given name
 */
function getAvatarColor(name) {
    if (!name) {
        return AVATAR_COLORS[0];
    }
    const index = hashCode(name) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}
/**
 * Get initials from a name (up to 2 characters)
 */
function getInitials(name) {
    if (!name) {
        return '?';
    }
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        // Single word: take first 2 chars
        return words[0].substring(0, 2).toUpperCase();
    }
    // Multiple words: take first char of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
}

let TsuryPhoneFrequentContacts = class TsuryPhoneFrequentContacts extends i {
    constructor() {
        super(...arguments);
        this.contacts = [];
    }
    _handleContactClick(contact) {
        this.dispatchEvent(new CustomEvent('contact-clicked', {
            detail: { contact },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        if (this.contacts.length === 0) {
            return x `
        <div class="frequent-contacts">
          <div class="section-header">Frequent Contacts</div>
          <div class="empty-state">
            <div class="empty-icon">📞</div>
            <div class="empty-text">No frequent contacts yet</div>
          </div>
        </div>
      `;
        }
        return x `
      <div class="frequent-contacts">
        <div class="section-header">Frequent Contacts</div>
        <div class="contacts-grid">
          ${this.contacts.map(contact => x `
              <div
                class="contact-item"
                @click=${() => this._handleContactClick(contact)}
                role="button"
                tabindex="0"
                aria-label="Call ${contact.contactName}"
              >
                <div class="avatar" style="background-color: ${getAvatarColor(contact.contactName)}">
                  ${getInitials(contact.contactName)}
                  ${contact.callCount > 1
            ? x `<div class="call-count-badge">${contact.callCount}</div>`
            : ''}
                </div>
                <div class="contact-name" title="${contact.contactName}">
                  ${contact.contactName}
                </div>
              </div>
            `)}
        </div>
      </div>
    `;
    }
};
TsuryPhoneFrequentContacts.styles = i$3 `
    :host {
      display: block;
    }

    .frequent-contacts {
      padding: 16px;
    }

    .section-header {
      font-size: 14px;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .contacts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 16px;
    }

    .contact-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .contact-item:hover {
      background: var(--sidebar-background-color, rgba(0, 0, 0, 0.05));
    }

    .contact-item:active {
      transform: scale(0.95);
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 20px;
      position: relative;
    }

    .call-count-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .contact-name {
      font-size: 13px;
      color: var(--primary-text-color);
      text-align: center;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: var(--secondary-text-color);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 14px;
    }
  `;
__decorate([
    n({ type: Array })
], TsuryPhoneFrequentContacts.prototype, "contacts", void 0);
TsuryPhoneFrequentContacts = __decorate([
    t('tsuryphone-frequent-contacts')
], TsuryPhoneFrequentContacts);

let TsuryPhoneCallLogItem = class TsuryPhoneCallLogItem extends i {
    _getCallTypeIcon() {
        switch (this.call.type) {
            case 'incoming':
                return x `
          <div class="call-type-icon incoming" title="Incoming call">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/>
            </svg>
          </div>
        `;
            case 'outgoing':
                return x `
          <div class="call-type-icon outgoing" title="Outgoing call">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM9 1v2c3.87 0 7 3.13 7 7h2c0-4.97-4.03-9-9-9zm4 4v2c1.66 0 3 1.34 3 3h2c0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
        `;
            case 'missed':
                return x `
          <div class="call-type-icon missed" title="Missed call">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.23 15.26l-2.54-.29c-.61-.07-1.21.14-1.64.57l-1.84 1.84c-2.83-1.44-5.15-3.75-6.59-6.59l1.85-1.85c.43-.43.64-1.03.57-1.64l-.29-2.52c-.12-1.01-.97-1.77-1.99-1.77H5.03c-1.13 0-2.07.94-2 2.07.53 8.54 7.36 15.36 15.89 15.89 1.13.07 2.07-.87 2.07-2v-1.73c.01-1.01-.75-1.86-1.76-1.98z"/>
              <path d="M21.7 2.3L2.3 21.7 3.7 23.1 23.1 3.7z"/>
            </svg>
          </div>
        `;
        }
    }
    _handleClick() {
        this.dispatchEvent(new CustomEvent('call-item-clicked', {
            detail: { call: this.call },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        const avatarColor = getAvatarColor(this.call.contactName);
        const initials = getInitials(this.call.contactName);
        const timeFormatted = formatCallTime(this.call.timestamp);
        const duration = this.call.duration > 0 ? formatDuration(this.call.duration) : null;
        return x `
      <div class="call-item" @click=${this._handleClick}>
        <div class="avatar" style="background-color: ${avatarColor}">
          ${initials}
        </div>
        <div class="call-info">
          <div class="call-header">
            <span class="contact-name">${this.call.contactName}</span>
            ${this._getCallTypeIcon()}
            ${this.call.isBlocked ? x `<span class="blocked-badge">Blocked</span>` : ''}
          </div>
          <div class="call-details">
            <span class="phone-number">${this.call.phoneNumber}</span>
            ${duration ? x `<span>• ${duration}</span>` : ''}
          </div>
        </div>
        <div class="call-time">${timeFormatted}</div>
      </div>
    `;
    }
};
TsuryPhoneCallLogItem.styles = i$3 `
    :host {
      display: block;
    }

    .call-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 12px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .call-item:hover {
      background: var(--sidebar-background-color, rgba(0, 0, 0, 0.05));
    }

    .call-item:active {
      background: var(--divider-color);
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
      flex-shrink: 0;
    }

    .call-info {
      flex: 1;
      min-width: 0;
    }

    .call-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .contact-name {
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .call-type-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .call-type-icon svg {
      width: 100%;
      height: 100%;
    }

    .call-type-icon.incoming {
      color: var(--success-color, #4caf50);
    }

    .call-type-icon.outgoing {
      color: var(--info-color, #2196f3);
    }

    .call-type-icon.missed {
      color: var(--error-color, #f44336);
    }

    .call-details {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .phone-number {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .call-time {
      flex-shrink: 0;
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-left: auto;
    }

    .blocked-badge {
      background: var(--error-color, #f44336);
      color: white;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      flex-shrink: 0;
    }
  `;
__decorate([
    n({ type: Object })
], TsuryPhoneCallLogItem.prototype, "call", void 0);
TsuryPhoneCallLogItem = __decorate([
    t('tsuryphone-call-log-item')
], TsuryPhoneCallLogItem);

let TsuryPhoneCallLogList = class TsuryPhoneCallLogList extends i {
    constructor() {
        super(...arguments);
        this.groupedCalls = [];
        this.loading = false;
    }
    render() {
        if (this.loading) {
            return x `
        <div class="loading">
          <div class="spinner"></div>
        </div>
      `;
        }
        if (this.groupedCalls.length === 0) {
            return x `
        <div class="empty-state">
          <div class="empty-icon">📞</div>
          <div class="empty-title">No calls yet</div>
          <div class="empty-text">
            Your call history will appear here once you start making or receiving calls.
          </div>
        </div>
      `;
        }
        return x `
      <div class="call-log-list">
        ${this.groupedCalls.map(group => x `
            <div class="group">
              <div class="group-header">${group.groupLabel}</div>
              ${group.calls.map((call, index) => x `
                  <tsuryphone-call-log-item .call=${call}></tsuryphone-call-log-item>
                  ${index < group.calls.length - 1 ? x `<div class="divider"></div>` : ''}
                `)}
            </div>
          `)}
      </div>
    `;
    }
};
TsuryPhoneCallLogList.styles = i$3 `
    :host {
      display: block;
    }

    .call-log-list {
      flex: 1;
      overflow-y: auto;
    }

    .group {
      margin-bottom: 16px;
    }

    .group-header {
      position: sticky;
      top: 0;
      background: var(--card-background-color);
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--divider-color);
      z-index: 1;
    }

    .divider {
      height: 1px;
      background: var(--divider-color);
      margin: 0 16px;
    }

    .divider:last-child {
      display: none;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }

    .empty-text {
      font-size: 14px;
      max-width: 300px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      color: var(--secondary-text-color);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
__decorate([
    n({ type: Array })
], TsuryPhoneCallLogList.prototype, "groupedCalls", void 0);
__decorate([
    n({ type: Boolean })
], TsuryPhoneCallLogList.prototype, "loading", void 0);
TsuryPhoneCallLogList = __decorate([
    t('tsuryphone-call-log-list')
], TsuryPhoneCallLogList);

let TsuryPhoneHomeView = class TsuryPhoneHomeView extends i {
    constructor() {
        super(...arguments);
        this.callHistory = [];
        this.loading = false;
        this._activeFilter = 'all';
    }
    _handleFilterChanged(e) {
        this._activeFilter = e.detail.filter;
    }
    _handleContactClicked(e) {
        // Bubble up the event for parent to handle (e.g., open call modal)
        this.dispatchEvent(new CustomEvent('dial-contact', {
            detail: e.detail,
            bubbles: true,
            composed: true,
        }));
    }
    _handleCallItemClicked(e) {
        // Bubble up the event for parent to handle (e.g., open call details)
        this.dispatchEvent(new CustomEvent('call-details', {
            detail: e.detail,
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        // Filter and group call history
        const filteredCalls = filterCallHistory(this.callHistory, this._activeFilter);
        const groupedCalls = groupCallHistory(filteredCalls);
        // Get frequent contacts (only from all calls, not filtered)
        const frequentContacts = getFrequentContacts(this.callHistory, 6);
        // Show frequent contacts only if we have calls and filter is 'all'
        const showFrequentContacts = this._activeFilter === 'all' && frequentContacts.length > 0;
        return x `
      <div class="home-view">
        <tsuryphone-call-log-filters
          .activeFilter=${this._activeFilter}
          @filter-changed=${this._handleFilterChanged}
        ></tsuryphone-call-log-filters>

        <div class="scrollable-content">
          ${showFrequentContacts
            ? x `
                <tsuryphone-frequent-contacts
                  .contacts=${frequentContacts}
                  @contact-clicked=${this._handleContactClicked}
                ></tsuryphone-frequent-contacts>
                <div class="divider"></div>
              `
            : ''}

          <tsuryphone-call-log-list
            .groupedCalls=${groupedCalls}
            .loading=${this.loading}
            @call-item-clicked=${this._handleCallItemClicked}
          ></tsuryphone-call-log-list>
        </div>
      </div>
    `;
    }
};
TsuryPhoneHomeView.styles = i$3 `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--card-background-color);
    }

    .home-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .scrollable-content {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .divider {
      height: 1px;
      background: var(--divider-color);
      margin: 0 16px;
    }

    /* Mobile optimizations */
    @media (max-width: 599px) {
      .home-view {
        font-size: 14px;
      }
    }

    /* Tablet */
    @media (min-width: 600px) and (max-width: 1023px) {
      .home-view {
        max-width: 600px;
        margin: 0 auto;
      }
    }

    /* Desktop */
    @media (min-width: 1024px) {
      .home-view {
        max-width: 800px;
        margin: 0 auto;
      }
    }
  `;
__decorate([
    n({ type: Array })
], TsuryPhoneHomeView.prototype, "callHistory", void 0);
__decorate([
    n({ type: Boolean })
], TsuryPhoneHomeView.prototype, "loading", void 0);
__decorate([
    r()
], TsuryPhoneHomeView.prototype, "_activeFilter", void 0);
TsuryPhoneHomeView = __decorate([
    t('tsuryphone-home-view')
], TsuryPhoneHomeView);

/**
 * Dialed Number Display Component
 * Shows the currently dialed number with backspace functionality
 */
let TsuryPhoneDialedNumberDisplay = class TsuryPhoneDialedNumberDisplay extends i {
    constructor() {
        super(...arguments);
        this.dialedNumber = '';
    }
    static get styles() {
        return i$3 `
      :host {
        display: block;
      }

      .display-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 64px;
        padding: 12px 16px;
        background: var(--card-background-color);
        border-bottom: 2px solid var(--divider-color);
      }

      .number-display {
        flex: 1;
        font-size: 32px;
        font-weight: 300;
        color: var(--primary-text-color);
        letter-spacing: 2px;
        text-align: center;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
      }

      .number-display.empty {
        color: var(--secondary-text-color);
        font-size: 18px;
        font-weight: 400;
        letter-spacing: normal;
      }

      .backspace-button {
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        flex-shrink: 0;
      }

      .backspace-button:hover {
        background: var(--secondary-background-color);
      }

      .backspace-button:active {
        background: var(--divider-color);
      }

      .backspace-button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .backspace-button:disabled:hover {
        background: transparent;
      }

      .backspace-icon {
        width: 24px;
        height: 24px;
        fill: var(--primary-text-color);
      }

      .placeholder {
        opacity: 0.5;
      }
    `;
    }
    _handleBackspace() {
        this.dispatchEvent(new CustomEvent('backspace', { bubbles: true, composed: true }));
    }
    _handleLongPress() {
        // Long press on backspace clears all
        this.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }));
    }
    _formatDialedNumber(number) {
        if (!number)
            return '';
        // Format the number with spaces for readability
        // Simple formatting: add space every 3 digits (can be enhanced)
        let formatted = '';
        for (let i = 0; i < number.length; i++) {
            if (i > 0 && i % 3 === 0) {
                formatted += ' ';
            }
            formatted += number[i];
        }
        return formatted;
    }
    render() {
        const hasNumber = this.dialedNumber.length > 0;
        const formattedNumber = this._formatDialedNumber(this.dialedNumber);
        return x `
      <div class="display-container">
        <div class="number-display ${!hasNumber ? 'empty' : ''}">
          ${hasNumber
            ? formattedNumber
            : x `<span class="placeholder">Enter number</span>`}
        </div>
        <button
          class="backspace-button"
          @click=${this._handleBackspace}
          @contextmenu=${(e) => {
            e.preventDefault();
            this._handleLongPress();
        }}
          ?disabled=${!hasNumber}
          aria-label="Backspace"
          title="Click to delete, right-click to clear all"
        >
          <svg class="backspace-icon" viewBox="0 0 24 24">
            <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/>
          </svg>
        </button>
      </div>
    `;
    }
};
__decorate([
    n({ type: String })
], TsuryPhoneDialedNumberDisplay.prototype, "dialedNumber", void 0);
TsuryPhoneDialedNumberDisplay = __decorate([
    t('tsuryphone-dialed-number-display')
], TsuryPhoneDialedNumberDisplay);

/**
 * Keypad Grid Component
 * 3x4 grid of number buttons with *, 0, # on bottom row
 */
let TsuryPhoneKeypadGrid = class TsuryPhoneKeypadGrid extends i {
    constructor() {
        super(...arguments);
        this._longPressTimer = null;
        this._longPressTriggered = false;
        this._buttons = [
            { digit: '1', letters: '' },
            { digit: '2', letters: 'ABC' },
            { digit: '3', letters: 'DEF' },
            { digit: '4', letters: 'GHI' },
            { digit: '5', letters: 'JKL' },
            { digit: '6', letters: 'MNO' },
            { digit: '7', letters: 'PQRS' },
            { digit: '8', letters: 'TUV' },
            { digit: '9', letters: 'WXYZ' },
            { digit: '*', letters: '' },
            { digit: '0', letters: '+', longPressDigit: '+' },
            { digit: '#', letters: '' },
        ];
    }
    static get styles() {
        return i$3 `
      :host {
        display: block;
      }

      .keypad-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        max-width: 320px;
        margin: 0 auto;
        padding: 16px;
      }

      .keypad-button {
        aspect-ratio: 1;
        border: none;
        background: var(--card-background-color);
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 300;
        color: var(--primary-text-color);
        transition: background 0.15s, transform 0.1s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        position: relative;
        min-height: 72px;
      }

      .keypad-button:hover {
        background: var(--secondary-background-color);
      }

      .keypad-button:active {
        transform: scale(0.95);
        background: var(--divider-color);
      }

      .keypad-button.long-press-active {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .digit {
        font-size: 32px;
        font-weight: 400;
        line-height: 1;
      }

      .letters {
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 1px;
        margin-top: 4px;
        opacity: 0.6;
        text-transform: uppercase;
      }

      .long-press-hint {
        position: absolute;
        top: 4px;
        right: 4px;
        font-size: 12px;
        opacity: 0.5;
      }

      @media (max-width: 400px) {
        .keypad-grid {
          gap: 8px;
          padding: 12px;
        }

        .keypad-button {
          min-height: 64px;
        }

        .digit {
          font-size: 28px;
        }
      }
    `;
    }
    _handlePointerDown(button) {
        this._longPressTriggered = false;
        // Start long press timer if button supports it
        if (button.longPressDigit) {
            this._longPressTimer = window.setTimeout(() => {
                this._longPressTriggered = true;
                this._emitDigit(button.longPressDigit);
                this._triggerHaptic('medium');
            }, 500);
        }
    }
    _handlePointerUp(button) {
        // Clear long press timer
        if (this._longPressTimer) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
        // If long press was triggered, don't emit the regular digit
        if (this._longPressTriggered) {
            this._longPressTriggered = false;
            return;
        }
        // Emit the regular digit
        this._emitDigit(button.digit);
        this._triggerHaptic('light');
    }
    _handlePointerCancel() {
        // Clear long press timer if pointer is cancelled (e.g., scrolling)
        if (this._longPressTimer) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
        this._longPressTriggered = false;
    }
    _emitDigit(digit) {
        this.dispatchEvent(new CustomEvent('digit-press', {
            detail: { digit },
            bubbles: true,
            composed: true,
        }));
    }
    _triggerHaptic(type) {
        if (!navigator.vibrate)
            return;
        const durations = {
            light: 10,
            medium: 20,
        };
        navigator.vibrate(durations[type]);
    }
    render() {
        return x `
      <div class="keypad-grid">
        ${this._buttons.map((button) => x `
            <button
              class="keypad-button"
              @pointerdown=${() => this._handlePointerDown(button)}
              @pointerup=${() => this._handlePointerUp(button)}
              @pointercancel=${() => this._handlePointerCancel()}
              aria-label="${button.digit}${button.letters ? ` ${button.letters}` : ''}"
              title="${button.longPressDigit ? `Long press for ${button.longPressDigit}` : ''}"
            >
              <span class="digit">${button.digit}</span>
              ${button.letters
            ? x `<span class="letters">${button.letters}</span>`
            : ''}
              ${button.longPressDigit && button.longPressDigit !== button.letters
            ? x `<span class="long-press-hint">${button.longPressDigit}</span>`
            : ''}
            </button>
          `)}
      </div>
    `;
    }
};
TsuryPhoneKeypadGrid = __decorate([
    t('tsuryphone-keypad-grid')
], TsuryPhoneKeypadGrid);

/**
 * Keypad View Component
 * Main container for the dialing keypad
 */
let TsuryPhoneKeypadView = class TsuryPhoneKeypadView extends i {
    // No local state - everything driven by entities
    shouldUpdate(changedProps) {
        if (changedProps.has('hass')) {
            const oldHass = changedProps.get('hass');
            if (oldHass) {
                const deviceId = this.config?.device_id || 'tsuryphone';
                const entityId = `sensor.${deviceId}_current_dialing_number`;
                const oldState = oldHass.states[entityId]?.state;
                const newState = this.hass.states[entityId]?.state;
                console.log('[KeypadView] shouldUpdate check:', {
                    entityId,
                    oldState,
                    newState,
                    changed: oldState !== newState
                });
                // Force update if the dialing number changed
                if (oldState !== newState) {
                    console.log('[KeypadView] Forcing update due to state change');
                    return true;
                }
            }
        }
        return super.shouldUpdate(changedProps);
    }
    static get styles() {
        return i$3 `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--card-background-color);
        padding: 16px;
        box-sizing: border-box;
      }

      .keypad-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        max-width: 400px;
        margin: 0 auto;
        width: 100%;
      }

      .display-section {
        flex: 0 0 auto;
        margin-bottom: 24px;
      }

      .keypad-section {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .call-button-section {
        flex: 0 0 auto;
        margin-top: 24px;
        padding: 0 16px;
      }

      .call-button {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--success-color, #4caf50);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        transition:
          transform 0.1s,
          box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
      }

      .call-button:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      }

      .call-button:active {
        transform: scale(0.95);
      }

      .call-button:disabled {
        background: var(--disabled-color, #9e9e9e);
        cursor: not-allowed;
        box-shadow: none;
      }

      .call-button:disabled:hover {
        transform: none;
      }

      .call-icon {
        width: 32px;
        height: 32px;
        fill: white;
      }
    `;
    }
    async _handleDigitPress(digit) {
        this._triggerHaptic("light");
        console.log('[KeypadView] Dialing digit:', digit, 'to entity:', this._getPhoneStateEntityId());
        try {
            // Send digit to backend - no optimistic update
            await this.hass.callService("tsuryphone", "dial_digit", {
                digit: parseInt(digit, 10),
            }, {
                entity_id: this._getPhoneStateEntityId(),
            });
            console.log('[KeypadView] Digit dialed successfully');
        }
        catch (error) {
            console.error("Failed to dial digit:", error);
            this._triggerHaptic("heavy");
        }
    }
    async _handleBackspace() {
        const currentNumber = this._getCurrentDialingNumber();
        if (!currentNumber)
            return;
        try {
            // Request delete from backend - no optimistic update
            await this.hass.callService("tsuryphone", "delete_last_digit", {}, {
                entity_id: this._getPhoneStateEntityId(),
            });
            this._triggerHaptic("light");
        }
        catch (err) {
            console.error("Failed to delete last digit:", err);
            this._triggerHaptic("heavy");
        }
    }
    _handleClear() {
        // Clear is just deleting all digits - let user delete one by one
        this._triggerHaptic("light");
    }
    async _handleCall() {
        if (!this._canCall())
            return;
        const numberToDial = this._getCurrentDialingNumber() || this._getLastCalledNumber();
        if (!numberToDial)
            return;
        this._triggerHaptic("medium");
        try {
            // Call the dial service
            await this.hass.callService("tsuryphone", "dial", {
                number: numberToDial,
            }, {
                entity_id: this._getPhoneStateEntityId(),
            });
            // The backend will clear the dialing number after successful dial
        }
        catch (error) {
            console.error("Failed to dial number:", error);
            this._triggerHaptic("heavy");
        }
    }
    _canCall() {
        // Can call if we have a dialed number OR we have call history to redial
        return !!this._getCurrentDialingNumber() || !!this._getLastCalledNumber();
    }
    _getCurrentDialingNumber() {
        const deviceId = this.config?.device_id || "tsuryphone";
        const entityId = `sensor.${deviceId}_current_dialing_number`;
        const entity = this.hass?.states[entityId];
        const result = entity?.state && entity.state !== "unknown" ? entity.state : "";
        console.log('[KeypadView] _getCurrentDialingNumber:', {
            entityId,
            entityState: entity?.state,
            result
        });
        return result;
    }
    _getPhoneStateEntityId() {
        const deviceId = this.config?.device_id || "tsuryphone";
        if (this.config?.entity) {
            return this.config.entity.startsWith("sensor.")
                ? this.config.entity
                : `sensor.${this.config.entity}`;
        }
        return `sensor.${deviceId}_phone_state`;
    }
    _getLastCalledNumber() {
        const phoneStateEntityId = this._getPhoneStateEntityId();
        const phoneState = this.hass?.states[phoneStateEntityId];
        const callHistory = phoneState?.attributes?.call_log || [];
        if (callHistory.length === 0)
            return null;
        // Get the most recent call
        const lastCall = callHistory[0];
        return lastCall.number || null;
    }
    _triggerHaptic(type) {
        if (!navigator.vibrate)
            return;
        const durations = {
            light: 10,
            medium: 20,
            heavy: 30,
        };
        navigator.vibrate(durations[type]);
    }
    render() {
        const dialedNumber = this._getCurrentDialingNumber();
        return x `
      <div class="keypad-container">
        <div class="display-section">
          <tsuryphone-dialed-number-display
            .dialedNumber=${dialedNumber}
            @backspace=${this._handleBackspace}
            @clear=${this._handleClear}
          ></tsuryphone-dialed-number-display>
        </div>

        <div class="keypad-section">
          <tsuryphone-keypad-grid
            @digit-press=${(e) => this._handleDigitPress(e.detail.digit)}
          ></tsuryphone-keypad-grid>
        </div>

        <div class="call-button-section">
          <button
            class="call-button"
            @click=${this._handleCall}
            ?disabled=${!this._canCall()}
            aria-label="Call"
          >
            <svg class="call-icon" viewBox="0 0 24 24">
              <path
                d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
              />
            </svg>
          </button>
        </div>
      </div>
    `;
    }
};
__decorate([
    n({ attribute: false })
], TsuryPhoneKeypadView.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], TsuryPhoneKeypadView.prototype, "config", void 0);
TsuryPhoneKeypadView = __decorate([
    t("tsuryphone-keypad-view")
], TsuryPhoneKeypadView);

/**
 * TsuryPhone Card - Main Component
 * A modern phone and contacts interface for Home Assistant
 */
// Register with custom elements registry
window.customCards = window.customCards || [];
window.customCards.push({
    type: "tsuryphone-card",
    name: "TsuryPhone Card",
    description: "A modern phone and contacts interface",
});
let TsuryPhoneCard = class TsuryPhoneCard extends i {
    constructor() {
        super(...arguments);
        this._activeView = "home";
        this._showCallModal = false;
        this._showContactModal = false;
        this._showBlockedView = false;
        this._isDarkMode = false;
        // Cached data from coordinator
        this._contactsCache = [];
        this._blockedCache = [];
        this._callHistoryCache = [];
        this._priorityNumbers = new Set();
        // Connection state
        this._isConnected = true;
        this._errorMessage = "";
        // Subscriptions
        this._unsubscribers = [];
    }
    /**
     * Set the configuration for this card
     */
    setConfig(config) {
        if (!config) {
            throw new Error("Invalid configuration");
        }
        this.config = config;
    }
    /**
     * Get the card size (used by HA for layout)
     */
    getCardSize() {
        return 6; // Roughly 6 grid rows
    }
    /**
     * Lifecycle: Connected to DOM
     */
    connectedCallback() {
        super.connectedCallback();
        this._subscribe();
    }
    /**
     * Lifecycle: Disconnected from DOM
     */
    disconnectedCallback() {
        super.disconnectedCallback();
        this._unsubscribe();
    }
    /**
     * Lifecycle: Property updated
     */
    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('hass')) {
            this._handleHassUpdate();
        }
    }
    /**
     * Subscribe to Home Assistant state changes
     */
    _subscribe() {
        if (!this.hass || !this.hass.connection) {
            console.warn("TsuryPhone: Cannot subscribe - no HA connection");
            return;
        }
        try {
            // Subscribe to entity state changes using subscribeEvents
            // We listen for state_changed events for our entities
            const deviceId = this.config?.device_id || 'tsuryphone';
            const unsubPromise = this.hass.connection.subscribeEvents((event) => {
                // Check if the event is for one of our entities
                const entityId = event.data?.entity_id;
                if (entityId && entityId.startsWith(`sensor.${deviceId}_`) ||
                    entityId?.startsWith(`binary_sensor.${deviceId}_`)) {
                    this._handleStateUpdate();
                }
            }, 'state_changed');
            if (unsubPromise && typeof unsubPromise.then === 'function') {
                unsubPromise.then((unsub) => {
                    this._unsubscribers.push(unsub);
                }).catch((err) => {
                    console.error('TsuryPhone: Failed to subscribe to state changes:', err);
                });
            }
        }
        catch (err) {
            console.error('TsuryPhone: Error in subscribe:', err);
        }
    }
    /**
     * Unsubscribe from all subscriptions
     */
    _unsubscribe() {
        this._unsubscribers.forEach((unsub) => {
            try {
                unsub();
            }
            catch (err) {
                console.error('TsuryPhone: Error unsubscribing:', err);
            }
        });
        this._unsubscribers = [];
    }
    /**
     * Handle Home Assistant updates
     */
    _handleHassUpdate() {
        if (!this.hass) {
            this._isConnected = false;
            this._errorMessage = "Connection to Home Assistant lost";
            return;
        }
        this._isConnected = true;
        this._errorMessage = "";
        this._isDarkMode = isDarkMode(this.hass);
        // Update cached data from coordinator state
        // Support both direct entity config and device_id pattern
        const deviceId = this.config?.device_id || 'tsuryphone';
        let phoneStateEntityId;
        if (this.config?.entity) {
            // Use entity directly if provided
            phoneStateEntityId = this.config.entity.startsWith('sensor.')
                ? this.config.entity
                : `sensor.${this.config.entity}`;
        }
        else {
            // Fall back to device_id pattern
            phoneStateEntityId = `sensor.${deviceId}_phone_state`;
        }
        const phoneStateEntity = this.hass.states[phoneStateEntityId];
        if (!phoneStateEntity) {
            this._errorMessage = `Entity ${phoneStateEntityId} not found`;
            return;
        }
        if (phoneStateEntity.attributes) {
            const attrs = phoneStateEntity.attributes;
            // Update contacts
            if (attrs.quick_dials && Array.isArray(attrs.quick_dials)) {
                this._contactsCache = attrs.quick_dials;
            }
            // Update blocked numbers
            if (attrs.blocked_numbers && Array.isArray(attrs.blocked_numbers)) {
                this._blockedCache = attrs.blocked_numbers;
            }
            // Update priority numbers
            if (attrs.priority_numbers && Array.isArray(attrs.priority_numbers)) {
                this._priorityNumbers = new Set(attrs.priority_numbers);
            }
            // Update call history
            if (attrs.call_history && Array.isArray(attrs.call_history)) {
                this._callHistoryCache = attrs.call_history;
            }
        }
        // Update call modal state
        this._updateCallModalState();
    }
    /**
     * Handle state updates from subscriptions
     */
    _handleStateUpdate() {
        // Trigger re-render by updating hass-dependent state
        this._updateCallModalState();
        this.requestUpdate();
    }
    /**
     * Update call modal visibility based on phone state
     */
    _updateCallModalState() {
        if (!this.hass)
            return;
        const deviceId = this.config?.device_id || 'tsuryphone';
        const phoneState = this.hass.states[`sensor.${deviceId}_phone_state`]?.state;
        const inCall = this.hass.states[`binary_sensor.${deviceId}_in_call`]?.state === 'on';
        // Show call modal if ringing or in call
        this._showCallModal = phoneState === 'RINGING_IN' || inCall;
    }
    /**
     * Refresh data from services
     */
    async _refreshData() {
        if (!this.hass)
            return;
        try {
            // Call service to get latest call history
            const response = await this.hass.callService('tsuryphone', 'get_call_history', { limit: 1000 }, true);
            if (response && response.call_history) {
                this._callHistoryCache = response.call_history;
            }
        }
        catch (err) {
            console.error('TsuryPhone: Failed to refresh call history:', err);
        }
    }
    /**
     * Get entity ID for a device sensor
     */
    _getDeviceEntityId(suffix) {
        const deviceId = this.config?.device_id || "tsuryphone";
        return `sensor.${deviceId}_${suffix}`;
    }
    /**
     * Handle navigation tab change
     */
    _handleTabChange(e) {
        this._activeView = e.detail.tab;
    }
    /**
     * Render the card
     */
    render() {
        if (!this.hass || !this.config) {
            return x `<div class="tsuryphone-error">Loading...</div>`;
        }
        // Show error overlay if not connected
        if (!this._isConnected || this._errorMessage) {
            return x `
        <ha-card>
          <div class="tsuryphone-container">
            <div class="error-overlay">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              <div class="error-title">Connection Error</div>
              <div class="error-message">
                ${this._errorMessage || "Unable to connect to Home Assistant"}
              </div>
            </div>
          </div>
        </ha-card>
      `;
        }
        return x `
      <ha-card>
        <div class="tsuryphone-container ${this._isDarkMode ? 'dark-mode' : 'light-mode'}">
          ${this._showCallModal ? this._renderCallModal() : ""}
          ${this._showContactModal ? this._renderContactModal() : ""}
          ${this._showBlockedView
            ? this._renderBlockedView()
            : this._renderMainViews()}
        </div>
      </ha-card>
    `;
    }
    /**
     * Render main views (home, keypad, contacts)
     */
    _renderMainViews() {
        return x `
      <div class="views-container">
        <div class="view-content">
          ${this._activeView === "home" ? this._renderHomeView() : ""}
          ${this._activeView === "keypad" ? this._renderKeypadView() : ""}
          ${this._activeView === "contacts" ? this._renderContactsView() : ""}
        </div>

        <tsuryphone-navigation
          .activeTab=${this._activeView}
          .disabled=${this._showCallModal}
          @tab-change=${this._handleTabChange}
        ></tsuryphone-navigation>
      </div>
    `;
    }
    /**
     * Render home view
     */
    _renderHomeView() {
        // Convert call history to the format expected by home-view
        const callHistory = this._callHistoryCache.map((call) => ({
            id: call.id || `${call.timestamp}-${call.phone_number}`,
            contactName: call.contact_name || call.phone_number,
            phoneNumber: call.phone_number,
            timestamp: call.timestamp,
            duration: call.duration || 0,
            type: call.type || 'incoming',
            isBlocked: call.is_blocked || false,
        }));
        return x `
      <div class="view home-view fade-in">
        <tsuryphone-home-view
          .callHistory=${callHistory}
          .loading=${false}
          @dial-contact=${this._handleDialContact}
          @call-details=${this._handleCallDetails}
        ></tsuryphone-home-view>
      </div>
    `;
    }
    /**
     * Handle dial contact event from home view
     */
    _handleDialContact(e) {
        const { contact } = e.detail;
        console.log('Dial contact:', contact);
        // TODO: Open call modal or initiate call in Phase 6
    }
    /**
     * Handle call details event from home view
     */
    _handleCallDetails(e) {
        const { call } = e.detail;
        console.log('Show call details:', call);
        // TODO: Open call details modal in Phase 8
    }
    /**
     * Render keypad view
     */
    _renderKeypadView() {
        return x `
      <div class="view keypad-view fade-in">
        <tsuryphone-keypad-view
          .hass=${this.hass}
          .config=${this.config}
        ></tsuryphone-keypad-view>
      </div>
    `;
    }
    /**
     * Render contacts view (placeholder for now)
     */
    _renderContactsView() {
        return x `
      <div class="view contacts-view fade-in">
        <div class="view-header">
          <h2>Contacts</h2>
        </div>
        <div class="view-body">
          <p class="placeholder-text">Contacts view will be implemented in Phase 5</p>
          <p class="placeholder-text">Contacts count: ${this._contactsCache.length}</p>
        </div>
      </div>
    `;
    }
    /**
     * Render call modal (placeholder)
     */
    _renderCallModal() {
        return x `<div class="modal-placeholder">Call Modal</div>`;
    }
    /**
     * Render contact modal (placeholder)
     */
    _renderContactModal() {
        return x `<div class="modal-placeholder">Contact Modal</div>`;
    }
    /**
     * Render blocked view (placeholder)
     */
    _renderBlockedView() {
        return x `<div class="modal-placeholder">Blocked Numbers View</div>`;
    }
    /**
     * Styles for the card
     */
    static get styles() {
        return [
            haThemeVariables,
            haButtonStyles,
            haCardStyles,
            commonStyles,
            i$3 `
        :host {
          display: block;
        }

        ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .tsuryphone-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          max-height: 80vh;
          background: var(--tsury-card-background-color);
          color: var(--tsury-primary-text-color);
          font-family: var(--tsury-font-family);
          position: relative;
          overflow: hidden;
        }

        .tsuryphone-error {
          padding: var(--tsury-spacing-md);
          text-align: center;
          color: var(--tsury-error-color);
        }

        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--tsury-card-background-color);
          z-index: 100;
          padding: var(--tsury-spacing-xl);
        }

        .error-overlay ha-icon {
          --mdc-icon-size: 64px;
          color: var(--tsury-error-color);
          margin-bottom: var(--tsury-spacing-md);
        }

        .error-title {
          font-size: var(--tsury-font-size-xl);
          font-weight: var(--tsury-font-weight-medium);
          color: var(--tsury-primary-text-color);
          margin-bottom: var(--tsury-spacing-sm);
        }

        .error-message {
          font-size: var(--tsury-font-size-md);
          color: var(--tsury-secondary-text-color);
          text-align: center;
        }

        .views-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .view-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .view {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          background: var(--tsury-primary-background-color);
        }

        .view-header {
          padding: var(--tsury-spacing-md) var(--tsury-spacing-md) var(--tsury-spacing-sm);
          background: var(--tsury-card-background-color);
          border-bottom: 1px solid var(--tsury-divider-color);
        }

        .view-header h2 {
          margin: 0;
          font-size: var(--tsury-font-size-xl);
          font-weight: var(--tsury-font-weight-medium);
          color: var(--tsury-primary-text-color);
        }

        .view-body {
          flex: 1;
          padding: var(--tsury-spacing-md);
        }

        .placeholder-text {
          color: var(--tsury-secondary-text-color);
          text-align: center;
          margin: var(--tsury-spacing-md) 0;
        }

        .view-placeholder,
        .modal-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--tsury-spacing-lg);
          background: var(--tsury-primary-background-color);
          color: var(--tsury-secondary-text-color);
          font-size: var(--tsury-font-size-lg);
        }

        .navigation-placeholder {
          display: flex;
          justify-content: space-around;
          padding: var(--tsury-spacing-md);
          background: var(--tsury-card-background-color);
          border-top: 1px solid var(--tsury-divider-color);
          gap: var(--tsury-spacing-sm);
        }

        .navigation-placeholder button {
          flex: 1;
          padding: var(--tsury-spacing-sm) var(--tsury-spacing-md);
          background: var(--tsury-primary-color);
          color: var(--text-primary-color);
          border: none;
          border-radius: var(--tsury-border-radius-md);
          cursor: pointer;
          font-size: var(--tsury-font-size-md);
          font-weight: var(--tsury-font-weight-medium);
          transition: all var(--tsury-transition-duration) var(--tsury-transition-timing);
        }

        .navigation-placeholder button:hover {
          filter: brightness(1.1);
        }

        .navigation-placeholder button:active {
          filter: brightness(0.9);
        }

        /* Dark mode adjustments */
        .tsuryphone-container.dark-mode {
          /* Dark mode specific overrides if needed */
        }

        .tsuryphone-container.light-mode {
          /* Light mode specific overrides if needed */
        }
      `,
        ];
    }
};
__decorate([
    n({ attribute: false })
], TsuryPhoneCard.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], TsuryPhoneCard.prototype, "config", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_activeView", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_showCallModal", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_showContactModal", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_showBlockedView", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_isDarkMode", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_contactsCache", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_blockedCache", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_callHistoryCache", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_priorityNumbers", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_isConnected", void 0);
__decorate([
    r()
], TsuryPhoneCard.prototype, "_errorMessage", void 0);
TsuryPhoneCard = __decorate([
    t("tsuryphone-card")
], TsuryPhoneCard);

export { TsuryPhoneCard };
//# sourceMappingURL=tsuryphone-card.js.map
