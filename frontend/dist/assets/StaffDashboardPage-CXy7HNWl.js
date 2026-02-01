import{B as Y,s as P,I as Se,J as N,C as q,j as $,o as m,K as U,w as D,L as j,e as y,A as x,a as i,c as b,k as C,F as R,M as _,n as T,t as h,O as ne,P as oe,Q as ie,S as ee,T as De,U as Ce,V as H,W as z,r as le,d as je,g as Ie,X as Le,Y as Oe,h as k,D as V,i as Te,u as v,y as S,f as B,p as M,_ as Ae}from"./index-vod7EwsC.js";import{s as Ve}from"./index-DJNjXcIc.js";import{s as ae}from"./index-C0OAjIOj.js";import{s as Be}from"./index-Dr5pwwPh.js";import{s as te}from"./index-DgPslmGA.js";import{s as Pe}from"./index-CRdIknm0.js";import"./index-ClPqKyO6.js";import"./index-DEpQnTpb.js";import"./index-8MOg8aeQ.js";import"./index-Bgo7R0EU.js";import"./index-CIDHxe13.js";import"./index-jFlGT290.js";var $e={name:"Dropdown",extends:Be,mounted:function(){console.warn("Deprecated since v4. Use Select component instead.")}},Ee=`
    .p-confirmdialog .p-dialog-content {
        display: flex;
        align-items: center;
        gap: dt('confirmdialog.content.gap');
    }

    .p-confirmdialog-icon {
        color: dt('confirmdialog.icon.color');
        font-size: dt('confirmdialog.icon.size');
        width: dt('confirmdialog.icon.size');
        height: dt('confirmdialog.icon.size');
    }
`,Fe={root:"p-confirmdialog",icon:"p-confirmdialog-icon",message:"p-confirmdialog-message",pcRejectButton:"p-confirmdialog-reject-button",pcAcceptButton:"p-confirmdialog-accept-button"},Ne=Y.extend({name:"confirmdialog",style:Ee,classes:Fe}),ze={name:"BaseConfirmDialog",extends:Se,props:{group:String,breakpoints:{type:Object,default:null},draggable:{type:Boolean,default:!0}},style:Ne,provide:function(){return{$pcConfirmDialog:this,$parentInstance:this}}},re={name:"ConfirmDialog",extends:ze,confirmListener:null,closeListener:null,data:function(){return{visible:!1,confirmation:null}},mounted:function(){var t=this;this.confirmListener=function(o){o&&o.group===t.group&&(t.confirmation=o,t.confirmation.onShow&&t.confirmation.onShow(),t.visible=!0)},this.closeListener=function(){t.visible=!1,t.confirmation=null},N.on("confirm",this.confirmListener),N.on("close",this.closeListener)},beforeUnmount:function(){N.off("confirm",this.confirmListener),N.off("close",this.closeListener)},methods:{accept:function(){this.confirmation.accept&&this.confirmation.accept(),this.visible=!1},reject:function(){this.confirmation.reject&&this.confirmation.reject(),this.visible=!1},onHide:function(){this.confirmation.onHide&&this.confirmation.onHide(),this.visible=!1}},computed:{appendTo:function(){return this.confirmation?this.confirmation.appendTo:"body"},target:function(){return this.confirmation?this.confirmation.target:null},modal:function(){return this.confirmation?this.confirmation.modal==null?!0:this.confirmation.modal:!0},header:function(){return this.confirmation?this.confirmation.header:null},message:function(){return this.confirmation?this.confirmation.message:null},blockScroll:function(){return this.confirmation?this.confirmation.blockScroll:!0},position:function(){return this.confirmation?this.confirmation.position:null},acceptLabel:function(){if(this.confirmation){var t,o=this.confirmation;return o.acceptLabel||((t=o.acceptProps)===null||t===void 0?void 0:t.label)||this.$primevue.config.locale.accept}return this.$primevue.config.locale.accept},rejectLabel:function(){if(this.confirmation){var t,o=this.confirmation;return o.rejectLabel||((t=o.rejectProps)===null||t===void 0?void 0:t.label)||this.$primevue.config.locale.reject}return this.$primevue.config.locale.reject},acceptIcon:function(){var t;return this.confirmation?this.confirmation.acceptIcon:(t=this.confirmation)!==null&&t!==void 0&&t.acceptProps?this.confirmation.acceptProps.icon:null},rejectIcon:function(){var t;return this.confirmation?this.confirmation.rejectIcon:(t=this.confirmation)!==null&&t!==void 0&&t.rejectProps?this.confirmation.rejectProps.icon:null},autoFocusAccept:function(){return this.confirmation.defaultFocus===void 0||this.confirmation.defaultFocus==="accept"},autoFocusReject:function(){return this.confirmation.defaultFocus==="reject"},closeOnEscape:function(){return this.confirmation?this.confirmation.closeOnEscape:!0}},components:{Dialog:ae,Button:P}};function Ue(e,t,o,s,u,l){var f=q("Button"),c=q("Dialog");return m(),$(c,{visible:u.visible,"onUpdate:visible":[t[2]||(t[2]=function(p){return u.visible=p}),l.onHide],role:"alertdialog",class:T(e.cx("root")),modal:l.modal,header:l.header,blockScroll:l.blockScroll,appendTo:l.appendTo,position:l.position,breakpoints:e.breakpoints,closeOnEscape:l.closeOnEscape,draggable:e.draggable,pt:e.pt,unstyled:e.unstyled},U({default:D(function(){return[e.$slots.container?C("",!0):(m(),b(R,{key:0},[e.$slots.message?(m(),$(_(e.$slots.message),{key:1,message:u.confirmation},null,8,["message"])):(m(),b(R,{key:0},[j(e.$slots,"icon",{},function(){return[e.$slots.icon?(m(),$(_(e.$slots.icon),{key:0,class:T(e.cx("icon"))},null,8,["class"])):u.confirmation.icon?(m(),b("span",x({key:1,class:[u.confirmation.icon,e.cx("icon")]},e.ptm("icon")),null,16)):C("",!0)]}),i("span",x({class:e.cx("message")},e.ptm("message")),h(l.message),17)],64))],64))]}),_:2},[e.$slots.container?{name:"container",fn:D(function(p){return[j(e.$slots,"container",{message:u.confirmation,closeCallback:p.closeCallback,acceptCallback:l.accept,rejectCallback:l.reject,initDragCallback:p.initDragCallback})]}),key:"0"}:void 0,e.$slots.container?void 0:{name:"footer",fn:D(function(){var p;return[y(f,x({class:[e.cx("pcRejectButton"),u.confirmation.rejectClass],autofocus:l.autoFocusReject,unstyled:e.unstyled,text:((p=u.confirmation.rejectProps)===null||p===void 0?void 0:p.text)||!1,onClick:t[0]||(t[0]=function(d){return l.reject()})},u.confirmation.rejectProps,{label:l.rejectLabel,pt:e.ptm("pcRejectButton")}),U({_:2},[l.rejectIcon||e.$slots.rejecticon?{name:"icon",fn:D(function(d){return[j(e.$slots,"rejecticon",{},function(){return[i("span",x({class:[l.rejectIcon,d.class]},e.ptm("pcRejectButton").icon,{"data-pc-section":"rejectbuttonicon"}),null,16)]})]}),key:"0"}:void 0]),1040,["class","autofocus","unstyled","text","label","pt"]),y(f,x({label:l.acceptLabel,class:[e.cx("pcAcceptButton"),u.confirmation.acceptClass],autofocus:l.autoFocusAccept,unstyled:e.unstyled,onClick:t[1]||(t[1]=function(d){return l.accept()})},u.confirmation.acceptProps,{pt:e.ptm("pcAcceptButton")}),U({_:2},[l.acceptIcon||e.$slots.accepticon?{name:"icon",fn:D(function(d){return[j(e.$slots,"accepticon",{},function(){return[i("span",x({class:[l.acceptIcon,d.class]},e.ptm("pcAcceptButton").icon,{"data-pc-section":"acceptbuttonicon"}),null,16)]})]}),key:"0"}:void 0]),1040,["label","class","autofocus","unstyled","pt"])]}),key:"1"}]),1032,["visible","class","modal","header","blockScroll","appendTo","position","breakpoints","closeOnEscape","draggable","onUpdate:visible","pt","unstyled"])}re.render=Ue;var Re=`
    .p-togglebutton {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        overflow: hidden;
        position: relative;
        color: dt('togglebutton.color');
        background: dt('togglebutton.background');
        border: 1px solid dt('togglebutton.border.color');
        padding: dt('togglebutton.padding');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
        border-radius: dt('togglebutton.border.radius');
        outline-color: transparent;
        font-weight: dt('togglebutton.font.weight');
    }

    .p-togglebutton-content {
        display: inline-flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        gap: dt('togglebutton.gap');
        padding: dt('togglebutton.content.padding');
        background: transparent;
        border-radius: dt('togglebutton.content.border.radius');
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover {
        background: dt('togglebutton.hover.background');
        color: dt('togglebutton.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked {
        background: dt('togglebutton.checked.background');
        border-color: dt('togglebutton.checked.border.color');
        color: dt('togglebutton.checked.color');
    }

    .p-togglebutton-checked .p-togglebutton-content {
        background: dt('togglebutton.content.checked.background');
        box-shadow: dt('togglebutton.content.checked.shadow');
    }

    .p-togglebutton:focus-visible {
        box-shadow: dt('togglebutton.focus.ring.shadow');
        outline: dt('togglebutton.focus.ring.width') dt('togglebutton.focus.ring.style') dt('togglebutton.focus.ring.color');
        outline-offset: dt('togglebutton.focus.ring.offset');
    }

    .p-togglebutton.p-invalid {
        border-color: dt('togglebutton.invalid.border.color');
    }

    .p-togglebutton:disabled {
        opacity: 1;
        cursor: default;
        background: dt('togglebutton.disabled.background');
        border-color: dt('togglebutton.disabled.border.color');
        color: dt('togglebutton.disabled.color');
    }

    .p-togglebutton-label,
    .p-togglebutton-icon {
        position: relative;
        transition: none;
    }

    .p-togglebutton-icon {
        color: dt('togglebutton.icon.color');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover .p-togglebutton-icon {
        color: dt('togglebutton.icon.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked .p-togglebutton-icon {
        color: dt('togglebutton.icon.checked.color');
    }

    .p-togglebutton:disabled .p-togglebutton-icon {
        color: dt('togglebutton.icon.disabled.color');
    }

    .p-togglebutton-sm {
        padding: dt('togglebutton.sm.padding');
        font-size: dt('togglebutton.sm.font.size');
    }

    .p-togglebutton-sm .p-togglebutton-content {
        padding: dt('togglebutton.content.sm.padding');
    }

    .p-togglebutton-lg {
        padding: dt('togglebutton.lg.padding');
        font-size: dt('togglebutton.lg.font.size');
    }

    .p-togglebutton-lg .p-togglebutton-content {
        padding: dt('togglebutton.content.lg.padding');
    }

    .p-togglebutton-fluid {
        width: 100%;
    }
`,Ke={root:function(t){var o=t.instance,s=t.props;return["p-togglebutton p-component",{"p-togglebutton-checked":o.active,"p-invalid":o.$invalid,"p-togglebutton-fluid":s.fluid,"p-togglebutton-sm p-inputfield-sm":s.size==="small","p-togglebutton-lg p-inputfield-lg":s.size==="large"}]},content:"p-togglebutton-content",icon:"p-togglebutton-icon",label:"p-togglebutton-label"},He=Y.extend({name:"togglebutton",style:Re,classes:Ke}),Me={name:"BaseToggleButton",extends:oe,props:{onIcon:String,offIcon:String,onLabel:{type:String,default:"Yes"},offLabel:{type:String,default:"No"},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null},size:{type:String,default:null},fluid:{type:Boolean,default:null}},style:He,provide:function(){return{$pcToggleButton:this,$parentInstance:this}}};function E(e){"@babel/helpers - typeof";return E=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},E(e)}function qe(e,t,o){return(t=We(t))in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e}function We(e){var t=Ye(e,"string");return E(t)=="symbol"?t:t+""}function Ye(e,t){if(E(e)!="object"||!e)return e;var o=e[Symbol.toPrimitive];if(o!==void 0){var s=o.call(e,t);if(E(s)!="object")return s;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var se={name:"ToggleButton",extends:Me,inheritAttrs:!1,emits:["change"],methods:{getPTOptions:function(t){var o=t==="root"?this.ptmi:this.ptm;return o(t,{context:{active:this.active,disabled:this.disabled}})},onChange:function(t){!this.disabled&&!this.readonly&&(this.writeValue(!this.d_value,t),this.$emit("change",t))},onBlur:function(t){var o,s;(o=(s=this.formField).onBlur)===null||o===void 0||o.call(s,t)}},computed:{active:function(){return this.d_value===!0},hasLabel:function(){return ee(this.onLabel)&&ee(this.offLabel)},label:function(){return this.hasLabel?this.d_value?this.onLabel:this.offLabel:" "},dataP:function(){return ie(qe({checked:this.active,invalid:this.$invalid},this.size,this.size))}},directives:{ripple:ne}},Je=["tabindex","disabled","aria-pressed","aria-label","aria-labelledby","data-p-checked","data-p-disabled","data-p"],Qe=["data-p"];function Xe(e,t,o,s,u,l){var f=De("ripple");return Ce((m(),b("button",x({type:"button",class:e.cx("root"),tabindex:e.tabindex,disabled:e.disabled,"aria-pressed":e.d_value,onClick:t[0]||(t[0]=function(){return l.onChange&&l.onChange.apply(l,arguments)}),onBlur:t[1]||(t[1]=function(){return l.onBlur&&l.onBlur.apply(l,arguments)})},l.getPTOptions("root"),{"aria-label":e.ariaLabel,"aria-labelledby":e.ariaLabelledby,"data-p-checked":l.active,"data-p-disabled":e.disabled,"data-p":l.dataP}),[i("span",x({class:e.cx("content")},l.getPTOptions("content"),{"data-p":l.dataP}),[j(e.$slots,"default",{},function(){return[j(e.$slots,"icon",{value:e.d_value,class:T(e.cx("icon"))},function(){return[e.onIcon||e.offIcon?(m(),b("span",x({key:0,class:[e.cx("icon"),e.d_value?e.onIcon:e.offIcon]},l.getPTOptions("icon")),null,16)):C("",!0)]}),i("span",x({class:e.cx("label")},l.getPTOptions("label")),h(l.label),17)]})],16,Qe)],16,Je)),[[f]])}se.render=Xe;var Ge=`
    .p-selectbutton {
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        outline-color: transparent;
        border-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton {
        border-radius: 0;
        border-width: 1px 1px 1px 0;
    }

    .p-selectbutton .p-togglebutton:focus-visible {
        position: relative;
        z-index: 1;
    }

    .p-selectbutton .p-togglebutton:first-child {
        border-inline-start-width: 1px;
        border-start-start-radius: dt('selectbutton.border.radius');
        border-end-start-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton:last-child {
        border-start-end-radius: dt('selectbutton.border.radius');
        border-end-end-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton.p-invalid {
        outline: 1px solid dt('selectbutton.invalid.border.color');
        outline-offset: 0;
    }

    .p-selectbutton-fluid {
        width: 100%;
    }
    
    .p-selectbutton-fluid .p-togglebutton {
        flex: 1 1 0;
    }
`,Ze={root:function(t){var o=t.props,s=t.instance;return["p-selectbutton p-component",{"p-invalid":s.$invalid,"p-selectbutton-fluid":o.fluid}]}},_e=Y.extend({name:"selectbutton",style:Ge,classes:Ze}),et={name:"BaseSelectButton",extends:oe,props:{options:Array,optionLabel:null,optionValue:null,optionDisabled:null,multiple:Boolean,allowEmpty:{type:Boolean,default:!0},dataKey:null,ariaLabelledby:{type:String,default:null},size:{type:String,default:null},fluid:{type:Boolean,default:null}},style:_e,provide:function(){return{$pcSelectButton:this,$parentInstance:this}}};function tt(e,t){var o=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!o){if(Array.isArray(e)||(o=ue(e))||t){o&&(e=o);var s=0,u=function(){};return{s:u,n:function(){return s>=e.length?{done:!0}:{done:!1,value:e[s++]}},e:function(d){throw d},f:u}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var l,f=!0,c=!1;return{s:function(){o=o.call(e)},n:function(){var d=o.next();return f=d.done,d},e:function(d){c=!0,l=d},f:function(){try{f||o.return==null||o.return()}finally{if(c)throw l}}}}function nt(e){return lt(e)||it(e)||ue(e)||ot()}function ot(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function ue(e,t){if(e){if(typeof e=="string")return W(e,t);var o={}.toString.call(e).slice(8,-1);return o==="Object"&&e.constructor&&(o=e.constructor.name),o==="Map"||o==="Set"?Array.from(e):o==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?W(e,t):void 0}}function it(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function lt(e){if(Array.isArray(e))return W(e)}function W(e,t){(t==null||t>e.length)&&(t=e.length);for(var o=0,s=Array(t);o<t;o++)s[o]=e[o];return s}var ce={name:"SelectButton",extends:et,inheritAttrs:!1,emits:["change"],methods:{getOptionLabel:function(t){return this.optionLabel?z(t,this.optionLabel):t},getOptionValue:function(t){return this.optionValue?z(t,this.optionValue):t},getOptionRenderKey:function(t){return this.dataKey?z(t,this.dataKey):this.getOptionLabel(t)},isOptionDisabled:function(t){return this.optionDisabled?z(t,this.optionDisabled):!1},isOptionReadonly:function(t){if(this.allowEmpty)return!1;var o=this.isSelected(t);return this.multiple?o&&this.d_value.length===1:o},onOptionSelect:function(t,o,s){var u=this;if(!(this.disabled||this.isOptionDisabled(o)||this.isOptionReadonly(o))){var l=this.isSelected(o),f=this.getOptionValue(o),c;if(this.multiple)if(l){if(c=this.d_value.filter(function(p){return!H(p,f,u.equalityKey)}),!this.allowEmpty&&c.length===0)return}else c=this.d_value?[].concat(nt(this.d_value),[f]):[f];else{if(l&&!this.allowEmpty)return;c=l?null:f}this.writeValue(c,t),this.$emit("change",{event:t,value:c})}},isSelected:function(t){var o=!1,s=this.getOptionValue(t);if(this.multiple){if(this.d_value){var u=tt(this.d_value),l;try{for(u.s();!(l=u.n()).done;){var f=l.value;if(H(f,s,this.equalityKey)){o=!0;break}}}catch(c){u.e(c)}finally{u.f()}}}else o=H(this.d_value,s,this.equalityKey);return o}},computed:{equalityKey:function(){return this.optionValue?null:this.dataKey},dataP:function(){return ie({invalid:this.$invalid})}},directives:{ripple:ne},components:{ToggleButton:se}},at=["aria-labelledby","data-p"];function rt(e,t,o,s,u,l){var f=q("ToggleButton");return m(),b("div",x({class:e.cx("root"),role:"group","aria-labelledby":e.ariaLabelledby},e.ptmi("root"),{"data-p":l.dataP}),[(m(!0),b(R,null,le(e.options,function(c,p){return m(),$(f,{key:l.getOptionRenderKey(c),modelValue:l.isSelected(c),onLabel:l.getOptionLabel(c),offLabel:l.getOptionLabel(c),disabled:e.disabled||l.isOptionDisabled(c),unstyled:e.unstyled,size:e.size,readonly:l.isOptionReadonly(c),onChange:function(K){return l.onOptionSelect(K,c,p)},pt:e.ptm("pcToggleButton")},U({_:2},[e.$slots.option?{name:"default",fn:D(function(){return[j(e.$slots,"option",{option:c,index:p},function(){return[i("span",x({ref_for:!0},e.ptm("pcToggleButton").label),h(l.getOptionLabel(c)),17)]})]}),key:"0"}:void 0]),1032,["modelValue","onLabel","offLabel","disabled","unstyled","size","readonly","onChange","pt"])}),128))],16,at)}ce.render=rt;const st={class:"staff-dashboard pb-20 md:pb-4"},ut={class:"flex items-center justify-between mb-4"},ct={class:"text-sm text-gray-500"},dt={class:"flex gap-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0"},pt={class:"text-xl font-bold text-blue-900"},mt={class:"text-xl font-bold text-violet-900"},ft={class:"text-xl font-bold text-green-900"},gt={class:"hidden md:flex mb-4"},bt={key:0,class:"mb-4 flex flex-wrap items-center gap-2"},vt={key:1,class:"flex justify-center py-8"},yt={key:2,class:"text-center py-12"},ht={class:"text-gray-500"},xt={key:3,class:"space-y-3"},wt={class:"flex items-stretch"},kt={class:"bg-violet-600 text-white px-4 py-3 flex flex-col justify-center min-w-[90px]"},St={class:"text-lg font-bold leading-tight"},Dt={key:0,class:"text-xs text-violet-200"},Ct={class:"flex-1 px-4 py-3"},jt={class:"flex items-start justify-between"},It={class:"min-w-0 flex-1"},Lt={class:"font-semibold text-gray-900 truncate"},Ot={class:"text-sm text-gray-600 truncate"},Tt={class:"text-xs text-gray-400 mt-1"},At={key:0,class:"ml-2"},Vt={key:0,class:"flex border-t border-gray-100 divide-x divide-gray-100"},Bt=["onClick"],Pt=["onClick"],$t=["onClick"],Et={class:"space-y-4"},Ft={class:"flex gap-2 justify-end"},Nt=je({__name:"StaffDashboardPage",setup(e){const t=Ie(),o=Le(),s=Oe(),u=k(!1),l=k([]),f=k([]),c=k([]),p=k([]),d=k("today"),K=[{label:"Today",value:"today"},{label:"Upcoming",value:"upcoming"},{label:"History",value:"completed"}],I=k(!1),A=k(null),g=k({customerName:"",customerEmail:"",customerPhone:"",serviceId:"",startTime:null,notes:""}),L=k(null),O=V(()=>t.user?.employeeId),J=V(()=>{switch(d.value){case"today":return l.value;case"upcoming":return f.value;case"completed":return c.value;default:return[]}}),Q=V(()=>{const a=new Date;return a.setHours(0,0,0,0),a}),de=V(()=>{const a=new Date;return a.setHours(23,59,59,999),a}),pe=V(()=>{const a=new Date;return a.setDate(a.getDate()+7),a.setHours(23,59,59,999),a});function me(a){return{scheduled:"info",confirmed:"success",in_progress:"warn",completed:"success",cancelled:"danger",no_show:"danger"}[a]||"info"}function fe(a){return a.replace(/_/g," ").replace(/\b\w/g,n=>n.toUpperCase())}function ge(a){return new Date(a).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function be(a){const n=new Date(a),r=new Date,w=new Date(r);return w.setDate(w.getDate()+1),n.toDateString()===r.toDateString()?"Today":n.toDateString()===w.toDateString()?"Tomorrow":n.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}function ve(a){return a.status!=="completed"&&a.status!=="cancelled"}async function F(){if(!O.value){console.error("No employee ID found for user");return}u.value=!0;try{const a=await S.get("/api/appointments",{params:{employeeId:O.value,startDate:Q.value.toISOString(),endDate:de.value.toISOString()}});l.value=a.data.data.appointments||[];const n=new Date(Q.value);n.setDate(n.getDate()+1);const r=await S.get("/api/appointments",{params:{employeeId:O.value,startDate:n.toISOString(),endDate:pe.value.toISOString()}});f.value=r.data.data.appointments||[],await X()}catch(a){console.error("Failed to fetch appointments:",a),s.add({severity:"error",summary:"Error",detail:"Failed to load appointments",life:3e3})}finally{u.value=!1}}async function X(){if(!O.value)return;const a=new Date,n=L.value?.[0]||new Date(Date.now()-720*60*60*1e3),r=L.value?.[1]||a;try{const w=await S.get("/api/appointments",{params:{employeeId:O.value,status:"completed",startDate:n.toISOString(),endDate:r.toISOString()}});c.value=w.data.data.appointments||[]}catch(w){console.error("Failed to fetch completed appointments:",w)}}async function ye(){try{const a=await S.get("/api/services");p.value=a.data.data.services||[]}catch(a){console.error("Failed to fetch services:",a)}}function G(){A.value=null,g.value={customerName:"",customerEmail:"",customerPhone:"",serviceId:"",startTime:null,notes:""},I.value=!0}function he(a){A.value=a,g.value={customerName:a.customerName,customerEmail:a.customerEmail||"",customerPhone:a.customerPhone||"",serviceId:a.serviceId,startTime:new Date(a.startTime),notes:a.notes||""},I.value=!0}async function xe(){if(!g.value.customerName||!g.value.serviceId||!g.value.startTime){s.add({severity:"warn",summary:"Validation",detail:"Please fill in all required fields",life:3e3});return}try{const a={...g.value,employeeId:O.value,startTime:g.value.startTime?.toISOString()};A.value?(await S.patch(`/api/appointments/${A.value.id}`,a),s.add({severity:"success",summary:"Success",detail:"Appointment updated",life:3e3})):(await S.post("/api/appointments",a),s.add({severity:"success",summary:"Success",detail:"Appointment created",life:3e3})),I.value=!1,await F()}catch(a){s.add({severity:"error",summary:"Error",detail:a.response?.data?.error||"Failed to save appointment",life:3e3})}}function we(a){o.require({message:`Cancel appointment for ${a.customerName}?`,header:"Cancel Appointment",icon:"pi pi-exclamation-triangle",acceptClass:"p-button-danger",accept:async()=>{try{await S.patch(`/api/appointments/${a.id}`,{status:"cancelled",cancellationReason:"employee_unavailable"}),s.add({severity:"success",summary:"Cancelled",detail:"Appointment has been cancelled",life:3e3}),await F()}catch(n){s.add({severity:"error",summary:"Error",detail:n.response?.data?.error||"Failed to cancel",life:3e3})}}})}function ke(a){o.require({message:`Mark appointment for ${a.customerName} as completed?`,header:"Complete Appointment",icon:"pi pi-check-circle",accept:async()=>{try{await S.patch(`/api/appointments/${a.id}`,{status:"completed"}),s.add({severity:"success",summary:"Completed",detail:"Appointment marked as completed",life:3e3}),await F()}catch(n){s.add({severity:"error",summary:"Error",detail:n.response?.data?.error||"Failed to update",life:3e3})}}})}function Z(){X()}return Te(()=>{F(),ye()}),(a,n)=>(m(),b("div",st,[y(v(re)),i("div",ut,[i("div",null,[n[14]||(n[14]=i("h1",{class:"text-xl md:text-2xl font-bold text-gray-900"},"My Schedule",-1)),i("p",ct,h(v(t).user?.firstName),1)]),y(v(P),{label:"New",icon:"pi pi-plus",size:"small",class:"hidden md:flex",onClick:G})]),i("div",dt,[i("div",{class:T(["flex-shrink-0 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 min-w-[140px] cursor-pointer",{"ring-2 ring-blue-500":d.value==="today"}]),onClick:n[0]||(n[0]=r=>d.value="today")},[n[16]||(n[16]=i("div",{class:"w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"},[i("i",{class:"pi pi-calendar text-white"})],-1)),i("div",null,[n[15]||(n[15]=i("p",{class:"text-xs text-blue-600 font-medium"},"Today",-1)),i("p",pt,h(l.value.length),1)])],2),i("div",{class:T(["flex-shrink-0 flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-lg px-4 py-3 min-w-[140px] cursor-pointer",{"ring-2 ring-violet-500":d.value==="upcoming"}]),onClick:n[1]||(n[1]=r=>d.value="upcoming")},[n[18]||(n[18]=i("div",{class:"w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center"},[i("i",{class:"pi pi-clock text-white"})],-1)),i("div",null,[n[17]||(n[17]=i("p",{class:"text-xs text-violet-600 font-medium"},"Upcoming",-1)),i("p",mt,h(f.value.length),1)])],2),i("div",{class:T(["flex-shrink-0 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 min-w-[140px] cursor-pointer",{"ring-2 ring-green-500":d.value==="completed"}]),onClick:n[2]||(n[2]=r=>d.value="completed")},[n[20]||(n[20]=i("div",{class:"w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center"},[i("i",{class:"pi pi-check-circle text-white"})],-1)),i("div",null,[n[19]||(n[19]=i("p",{class:"text-xs text-green-600 font-medium"},"History",-1)),i("p",ft,h(c.value.length),1)])],2)]),i("div",gt,[y(v(ce),{modelValue:d.value,"onUpdate:modelValue":n[3]||(n[3]=r=>d.value=r),options:K,optionLabel:"label",optionValue:"value",allowEmpty:!1},null,8,["modelValue"])]),d.value==="completed"?(m(),b("div",bt,[n[21]||(n[21]=i("span",{class:"text-sm text-gray-600"},"Filter:",-1)),y(v(te),{modelValue:L.value,"onUpdate:modelValue":[n[4]||(n[4]=r=>L.value=r),Z],selectionMode:"range",dateFormat:"M d",placeholder:"Date range",showIcon:"",class:"w-full md:w-auto"},null,8,["modelValue"]),L.value?(m(),$(v(P),{key:0,icon:"pi pi-times",text:"",rounded:"",size:"small",onClick:n[5]||(n[5]=r=>{L.value=null,Z()})})):C("",!0)])):C("",!0),u.value?(m(),b("div",vt,[...n[22]||(n[22]=[i("i",{class:"pi pi-spin pi-spinner text-2xl text-violet-600"},null,-1)])])):J.value.length===0?(m(),b("div",yt,[n[23]||(n[23]=i("i",{class:"pi pi-calendar text-4xl text-gray-300 mb-3"},null,-1)),i("p",ht,h(d.value==="today"?"No appointments today":d.value==="upcoming"?"No upcoming appointments":"No completed appointments"),1)])):(m(),b("div",xt,[(m(!0),b(R,null,le(J.value,r=>(m(),b("div",{key:r.id,class:"bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"},[i("div",wt,[i("div",kt,[i("span",St,h(ge(r.startTime)),1),d.value!=="today"?(m(),b("span",Dt,h(be(r.startTime)),1)):C("",!0)]),i("div",Ct,[i("div",jt,[i("div",It,[i("h3",Lt,h(r.customerName),1),i("p",Ot,h(r.service?.name||"Service"),1)]),y(v(Ve),{value:fe(r.status),severity:me(r.status),class:"ml-2 flex-shrink-0"},null,8,["value","severity"])]),i("p",Tt,[B(h(r.service?.duration||0)+" min ",1),r.customerPhone?(m(),b("span",At,[n[24]||(n[24]=i("i",{class:"pi pi-phone text-xs"},null,-1)),B(" "+h(r.customerPhone),1)])):C("",!0)])])]),ve(r)?(m(),b("div",Vt,[i("button",{class:"flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1",onClick:w=>he(r)},[...n[25]||(n[25]=[i("i",{class:"pi pi-pencil text-xs"},null,-1),B(" Edit ",-1)])],8,Bt),i("button",{class:"flex-1 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center justify-center gap-1",onClick:w=>ke(r)},[...n[26]||(n[26]=[i("i",{class:"pi pi-check text-xs"},null,-1),B(" Done ",-1)])],8,Pt),i("button",{class:"flex-1 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center gap-1",onClick:w=>we(r)},[...n[27]||(n[27]=[i("i",{class:"pi pi-times text-xs"},null,-1),B(" Cancel ",-1)])],8,$t)])):C("",!0)]))),128))])),i("button",{class:"md:hidden fixed bottom-6 right-6 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-violet-700 active:scale-95 transition-transform z-50",onClick:G},[...n[28]||(n[28]=[i("i",{class:"pi pi-plus text-xl"},null,-1)])]),y(v(ae),{visible:I.value,"onUpdate:visible":n[13]||(n[13]=r=>I.value=r),header:A.value?"Edit Appointment":"New Appointment",style:{width:"95vw",maxWidth:"500px"},breakpoints:{"640px":"95vw"},modal:"",dismissableMask:!0},{footer:D(()=>[i("div",Ft,[y(v(P),{label:"Cancel",text:"",onClick:n[12]||(n[12]=r=>I.value=!1)}),y(v(P),{label:"Save",icon:"pi pi-check",onClick:xe})])]),default:D(()=>[i("div",Et,[i("div",null,[n[29]||(n[29]=i("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Customer Name *",-1)),y(v(M),{modelValue:g.value.customerName,"onUpdate:modelValue":n[6]||(n[6]=r=>g.value.customerName=r),class:"w-full",placeholder:"Customer name"},null,8,["modelValue"])]),i("div",null,[n[30]||(n[30]=i("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Phone",-1)),y(v(M),{modelValue:g.value.customerPhone,"onUpdate:modelValue":n[7]||(n[7]=r=>g.value.customerPhone=r),class:"w-full",placeholder:"(555) 555-5555"},null,8,["modelValue"])]),i("div",null,[n[31]||(n[31]=i("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Email",-1)),y(v(M),{modelValue:g.value.customerEmail,"onUpdate:modelValue":n[8]||(n[8]=r=>g.value.customerEmail=r),class:"w-full",type:"email",placeholder:"customer@email.com"},null,8,["modelValue"])]),i("div",null,[n[32]||(n[32]=i("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Service *",-1)),y(v($e),{modelValue:g.value.serviceId,"onUpdate:modelValue":n[9]||(n[9]=r=>g.value.serviceId=r),options:p.value,optionLabel:"name",optionValue:"id",placeholder:"Select a service",class:"w-full"},null,8,["modelValue","options"])]),i("div",null,[n[33]||(n[33]=i("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Date & Time *",-1)),y(v(te),{modelValue:g.value.startTime,"onUpdate:modelValue":n[10]||(n[10]=r=>g.value.startTime=r),showTime:"",hourFormat:"12",dateFormat:"M d, yy",placeholder:"Select date and time",class:"w-full",touchUI:""},null,8,["modelValue"])]),i("div",null,[n[34]||(n[34]=i("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Notes",-1)),y(v(Pe),{modelValue:g.value.notes,"onUpdate:modelValue":n[11]||(n[11]=r=>g.value.notes=r),class:"w-full",rows:"2",placeholder:"Any special notes..."},null,8,["modelValue"])])])]),_:1},8,["visible","header"])]))}}),Gt=Ae(Nt,[["__scopeId","data-v-8388230c"]]);export{Gt as default};
