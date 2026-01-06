import{s as H}from"./index-DVMXbR9_.js";import{s as C}from"./index-DPTBo1IP.js";import{B as g,I as A,C as c,k as s,K as h,o as i,w as u,ag as I,l as v,L as p,a as $,aw as B,ad as F,n as f,S as N,J as E,a6 as _,at as T,W as U,ac as L,D as P,c as y,F as O,r as j,e as k,t as z}from"./index-DnubfVKX.js";import{s as W}from"./index-CLKIq93M.js";var V={root:"p-accordioncontent",contentWrapper:"p-accordioncontent-wrapper",content:"p-accordioncontent-content"},R=g.extend({name:"accordioncontent",classes:V}),J={name:"BaseAccordionContent",extends:A,props:{as:{type:[String,Object],default:"DIV"},asChild:{type:Boolean,default:!1}},style:R,provide:function(){return{$pcAccordionContent:this,$parentInstance:this}}},w={name:"AccordionContent",extends:J,inheritAttrs:!1,inject:["$pcAccordion","$pcAccordionPanel"],computed:{id:function(){return"".concat(this.$pcAccordion.$id,"_accordioncontent_").concat(this.$pcAccordionPanel.value)},ariaLabelledby:function(){return"".concat(this.$pcAccordion.$id,"_accordionheader_").concat(this.$pcAccordionPanel.value)},attrs:function(){return c(this.a11yAttrs,this.ptmi("root",this.ptParams))},a11yAttrs:function(){return{id:this.id,role:"region","aria-labelledby":this.ariaLabelledby,"data-pc-name":"accordioncontent","data-p-active":this.$pcAccordionPanel.active}},ptParams:function(){return{context:{active:this.$pcAccordionPanel.active}}}}};function M(e,n,a,o,d,t){return e.asChild?h(e.$slots,"default",{key:1,class:f(e.cx("root")),active:t.$pcAccordionPanel.active,a11yAttrs:t.a11yAttrs}):(i(),s(F,c({key:0,name:"p-collapsible"},e.ptm("transition",t.ptParams)),{default:u(function(){return[!t.$pcAccordion.lazy||t.$pcAccordionPanel.active?I((i(),s(p(e.as),c({key:0,class:e.cx("root")},t.attrs),{default:u(function(){return[$("div",c({class:e.cx("contentWrapper")},e.ptm("contentWrapper",t.ptParams)),[$("div",c({class:e.cx("content")},e.ptm("content",t.ptParams)),[h(e.$slots,"default")],16)],16)]}),_:3},16,["class"])),[[B,t.$pcAccordion.lazy?!0:t.$pcAccordionPanel.active]]):v("",!0)]}),_:3},16))}w.render=M;var Q={root:"p-accordionheader",toggleicon:"p-accordionheader-toggle-icon"},q=g.extend({name:"accordionheader",classes:Q}),G={name:"BaseAccordionHeader",extends:A,props:{as:{type:[String,Object],default:"BUTTON"},asChild:{type:Boolean,default:!1}},style:q,provide:function(){return{$pcAccordionHeader:this,$parentInstance:this}}},K={name:"AccordionHeader",extends:G,inheritAttrs:!1,inject:["$pcAccordion","$pcAccordionPanel"],methods:{onFocus:function(){this.$pcAccordion.selectOnFocus&&this.changeActiveValue()},onClick:function(){!this.$pcAccordion.selectOnFocus&&this.changeActiveValue()},onKeydown:function(n){switch(n.code){case"ArrowDown":this.onArrowDownKey(n);break;case"ArrowUp":this.onArrowUpKey(n);break;case"Home":this.onHomeKey(n);break;case"End":this.onEndKey(n);break;case"Enter":case"NumpadEnter":case"Space":this.onEnterKey(n);break}},onArrowDownKey:function(n){var a=this.findNextPanel(this.findPanel(n.currentTarget));a?this.changeFocusedPanel(n,a):this.onHomeKey(n),n.preventDefault()},onArrowUpKey:function(n){var a=this.findPrevPanel(this.findPanel(n.currentTarget));a?this.changeFocusedPanel(n,a):this.onEndKey(n),n.preventDefault()},onHomeKey:function(n){var a=this.findFirstPanel();this.changeFocusedPanel(n,a),n.preventDefault()},onEndKey:function(n){var a=this.findLastPanel();this.changeFocusedPanel(n,a),n.preventDefault()},onEnterKey:function(n){this.changeActiveValue(),n.preventDefault()},findPanel:function(n){return n?.closest('[data-pc-name="accordionpanel"]')},findHeader:function(n){return U(n,'[data-pc-name="accordionheader"]')},findNextPanel:function(n){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,o=a?n:n.nextElementSibling;return o?T(o,"data-p-disabled")?this.findNextPanel(o):this.findHeader(o):null},findPrevPanel:function(n){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,o=a?n:n.previousElementSibling;return o?T(o,"data-p-disabled")?this.findPrevPanel(o):this.findHeader(o):null},findFirstPanel:function(){return this.findNextPanel(this.$pcAccordion.$el.firstElementChild,!0)},findLastPanel:function(){return this.findPrevPanel(this.$pcAccordion.$el.lastElementChild,!0)},changeActiveValue:function(){this.$pcAccordion.updateValue(this.$pcAccordionPanel.value)},changeFocusedPanel:function(n,a){_(this.findHeader(a))}},computed:{id:function(){return"".concat(this.$pcAccordion.$id,"_accordionheader_").concat(this.$pcAccordionPanel.value)},ariaControls:function(){return"".concat(this.$pcAccordion.$id,"_accordioncontent_").concat(this.$pcAccordionPanel.value)},attrs:function(){return c(this.asAttrs,this.a11yAttrs,this.ptmi("root",this.ptParams))},asAttrs:function(){return this.as==="BUTTON"?{type:"button",disabled:this.$pcAccordionPanel.disabled}:void 0},a11yAttrs:function(){return{id:this.id,tabindex:this.$pcAccordion.tabindex,"aria-expanded":this.$pcAccordionPanel.active,"aria-controls":this.ariaControls,"data-pc-name":"accordionheader","data-p-disabled":this.$pcAccordionPanel.disabled,"data-p-active":this.$pcAccordionPanel.active,onFocus:this.onFocus,onKeydown:this.onKeydown}},ptParams:function(){return{context:{active:this.$pcAccordionPanel.active}}},dataP:function(){return E({active:this.$pcAccordionPanel.active})}},components:{ChevronUpIcon:C,ChevronDownIcon:W},directives:{ripple:N}};function X(e,n,a,o,d,t){var b=L("ripple");return e.asChild?h(e.$slots,"default",{key:1,class:f(e.cx("root")),active:t.$pcAccordionPanel.active,a11yAttrs:t.a11yAttrs,onClick:t.onClick}):I((i(),s(p(e.as),c({key:0,"data-p":t.dataP,class:e.cx("root"),onClick:t.onClick},t.attrs),{default:u(function(){return[h(e.$slots,"default",{active:t.$pcAccordionPanel.active}),h(e.$slots,"toggleicon",{active:t.$pcAccordionPanel.active,class:f(e.cx("toggleicon"))},function(){return[t.$pcAccordionPanel.active?(i(),s(p(t.$pcAccordion.$slots.collapseicon?t.$pcAccordion.$slots.collapseicon:t.$pcAccordion.collapseIcon?"span":"ChevronUpIcon"),c({key:0,class:[t.$pcAccordion.collapseIcon,e.cx("toggleicon")],"aria-hidden":"true"},e.ptm("toggleicon",t.ptParams)),null,16,["class"])):(i(),s(p(t.$pcAccordion.$slots.expandicon?t.$pcAccordion.$slots.expandicon:t.$pcAccordion.expandIcon?"span":"ChevronDownIcon"),c({key:1,class:[t.$pcAccordion.expandIcon,e.cx("toggleicon")],"aria-hidden":"true"},e.ptm("toggleicon",t.ptParams)),null,16,["class"]))]})]}),_:3},16,["data-p","class","onClick"])),[[b]])}K.render=X;var Y={root:function(n){var a=n.instance,o=n.props;return["p-accordionpanel",{"p-accordionpanel-active":a.active,"p-disabled":o.disabled}]}},Z=g.extend({name:"accordionpanel",classes:Y}),ee={name:"BaseAccordionPanel",extends:A,props:{value:{type:[String,Number],default:void 0},disabled:{type:Boolean,default:!1},as:{type:[String,Object],default:"DIV"},asChild:{type:Boolean,default:!1}},style:Z,provide:function(){return{$pcAccordionPanel:this,$parentInstance:this}}},x={name:"AccordionPanel",extends:ee,inheritAttrs:!1,inject:["$pcAccordion"],computed:{active:function(){return this.$pcAccordion.isItemActive(this.value)},attrs:function(){return c(this.a11yAttrs,this.ptmi("root",this.ptParams))},a11yAttrs:function(){return{"data-pc-name":"accordionpanel","data-p-disabled":this.disabled,"data-p-active":this.active}},ptParams:function(){return{context:{active:this.active}}}}};function ne(e,n,a,o,d,t){return e.asChild?h(e.$slots,"default",{key:1,class:f(e.cx("root")),active:t.active,a11yAttrs:t.a11yAttrs}):(i(),s(p(e.as),c({key:0,class:e.cx("root")},t.attrs),{default:u(function(){return[h(e.$slots,"default")]}),_:3},16,["class"]))}x.render=ne;var te=`
    .p-accordionpanel {
        display: flex;
        flex-direction: column;
        border-style: solid;
        border-width: dt('accordion.panel.border.width');
        border-color: dt('accordion.panel.border.color');
    }

    .p-accordionheader {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: dt('accordion.header.padding');
        color: dt('accordion.header.color');
        background: dt('accordion.header.background');
        border-style: solid;
        border-width: dt('accordion.header.border.width');
        border-color: dt('accordion.header.border.color');
        font-weight: dt('accordion.header.font.weight');
        border-radius: dt('accordion.header.border.radius');
        transition:
            background dt('accordion.transition.duration'),
            color dt('accordion.transition.duration'),
            outline-color dt('accordion.transition.duration'),
            box-shadow dt('accordion.transition.duration');
        outline-color: transparent;
    }

    .p-accordionpanel:first-child > .p-accordionheader {
        border-width: dt('accordion.header.first.border.width');
        border-start-start-radius: dt('accordion.header.first.top.border.radius');
        border-start-end-radius: dt('accordion.header.first.top.border.radius');
    }

    .p-accordionpanel:last-child > .p-accordionheader {
        border-end-start-radius: dt('accordion.header.last.bottom.border.radius');
        border-end-end-radius: dt('accordion.header.last.bottom.border.radius');
    }

    .p-accordionpanel:last-child.p-accordionpanel-active > .p-accordionheader {
        border-end-start-radius: dt('accordion.header.last.active.bottom.border.radius');
        border-end-end-radius: dt('accordion.header.last.active.bottom.border.radius');
    }

    .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.color');
    }

    .p-accordionpanel:not(.p-disabled) .p-accordionheader:focus-visible {
        box-shadow: dt('accordion.header.focus.ring.shadow');
        outline: dt('accordion.header.focus.ring.width') dt('accordion.header.focus.ring.style') dt('accordion.header.focus.ring.color');
        outline-offset: dt('accordion.header.focus.ring.offset');
    }

    .p-accordionpanel:not(.p-accordionpanel-active):not(.p-disabled) > .p-accordionheader:hover {
        background: dt('accordion.header.hover.background');
        color: dt('accordion.header.hover.color');
    }

    .p-accordionpanel:not(.p-accordionpanel-active):not(.p-disabled) .p-accordionheader:hover .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.hover.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader {
        background: dt('accordion.header.active.background');
        color: dt('accordion.header.active.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.active.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader:hover {
        background: dt('accordion.header.active.hover.background');
        color: dt('accordion.header.active.hover.color');
    }

    .p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader:hover .p-accordionheader-toggle-icon {
        color: dt('accordion.header.toggle.icon.active.hover.color');
    }

    .p-accordioncontent {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-accordioncontent-wrapper {
        min-height: 0;
    }

    .p-accordioncontent-content {
        border-style: solid;
        border-width: dt('accordion.content.border.width');
        border-color: dt('accordion.content.border.color');
        background-color: dt('accordion.content.background');
        color: dt('accordion.content.color');
        padding: dt('accordion.content.padding');
    }
`,ae={root:"p-accordion p-component"},oe=g.extend({name:"accordion",style:te,classes:ae}),re={name:"BaseAccordion",extends:A,props:{value:{type:[String,Number,Array],default:void 0},multiple:{type:Boolean,default:!1},lazy:{type:Boolean,default:!1},tabindex:{type:Number,default:0},selectOnFocus:{type:Boolean,default:!1},expandIcon:{type:String,default:void 0},collapseIcon:{type:String,default:void 0},activeIndex:{type:[Number,Array],default:null}},style:oe,provide:function(){return{$pcAccordion:this,$parentInstance:this}}},ce={name:"Accordion",extends:re,inheritAttrs:!1,emits:["update:value","update:activeIndex","tab-open","tab-close","tab-click"],data:function(){return{d_value:this.value}},watch:{value:function(n){this.d_value=n},activeIndex:{immediate:!0,handler:function(n){this.hasAccordionTab&&(this.d_value=this.multiple?n?.map(String):n?.toString())}}},methods:{isItemActive:function(n){var a;return this.multiple?(a=this.d_value)===null||a===void 0?void 0:a.includes(n):this.d_value===n},updateValue:function(n){var a,o=this.isItemActive(n);this.multiple?o?this.d_value=this.d_value.filter(function(d){return d!==n}):this.d_value?this.d_value.push(n):this.d_value=[n]:this.d_value=o?null:n,this.$emit("update:value",this.d_value),this.$emit("update:activeIndex",this.multiple?(a=this.d_value)===null||a===void 0?void 0:a.map(Number):Number(this.d_value)),this.$emit(o?"tab-close":"tab-open",{originalEvent:void 0,index:Number(n)})},isAccordionTab:function(n){return n.type.name==="AccordionTab"},getTabProp:function(n,a){return n.props?n.props[a]:void 0},getKey:function(n,a){return this.getTabProp(n,"header")||a},getHeaderPT:function(n,a){var o=this;return{root:c({onClick:function(t){return o.onTabClick(t,a)}},this.getTabProp(n,"headerProps"),this.getTabPT(n,"header",a)),toggleicon:c(this.getTabProp(n,"headeractionprops"),this.getTabPT(n,"headeraction",a))}},getContentPT:function(n,a){return{root:c(this.getTabProp(n,"contentProps"),this.getTabPT(n,"toggleablecontent",a)),transition:this.getTabPT(n,"transition",a),content:this.getTabPT(n,"content",a)}},getTabPT:function(n,a,o){var d=this.tabs.length,t={props:n.props||{},parent:{instance:this,props:this.$props,state:this.$data},context:{index:o,count:d,first:o===0,last:o===d-1,active:this.isItemActive("".concat(o))}};return c(this.ptm("accordiontab.".concat(a),t),this.ptmo(this.getTabProp(n,"pt"),a,t))},onTabClick:function(n,a){this.$emit("tab-click",{originalEvent:n,index:a})}},computed:{tabs:function(){var n=this;return this.$slots.default().reduce(function(a,o){return n.isAccordionTab(o)?a.push(o):o.children&&o.children instanceof Array&&o.children.forEach(function(d){n.isAccordionTab(d)&&a.push(d)}),a},[])},hasAccordionTab:function(){return this.tabs.length}},components:{AccordionPanel:x,AccordionHeader:K,AccordionContent:w,ChevronUpIcon:C,ChevronRightIcon:H}};function ie(e,n,a,o,d,t){var b=P("AccordionHeader"),S=P("AccordionContent"),D=P("AccordionPanel");return i(),y("div",c({class:e.cx("root")},e.ptmi("root")),[t.hasAccordionTab?(i(!0),y(O,{key:0},j(t.tabs,function(r,l){return i(),s(D,{key:t.getKey(r,l),value:"".concat(l),pt:{root:t.getTabPT(r,"root",l)},disabled:t.getTabProp(r,"disabled")},{default:u(function(){return[k(b,{class:f(t.getTabProp(r,"headerClass")),pt:t.getHeaderPT(r,l)},{toggleicon:u(function(m){return[m.active?(i(),s(p(e.$slots.collapseicon?e.$slots.collapseicon:e.collapseIcon?"span":"ChevronDownIcon"),c({key:0,class:[e.collapseIcon,m.class],"aria-hidden":"true"},{ref_for:!0},t.getTabPT(r,"headericon",l)),null,16,["class"])):(i(),s(p(e.$slots.expandicon?e.$slots.expandicon:e.expandIcon?"span":"ChevronUpIcon"),c({key:1,class:[e.expandIcon,m.class],"aria-hidden":"true"},{ref_for:!0},t.getTabPT(r,"headericon",l)),null,16,["class"]))]}),default:u(function(){return[r.children&&r.children.headericon?(i(),s(p(r.children.headericon),{key:0,isTabActive:t.isItemActive("".concat(l)),active:t.isItemActive("".concat(l)),index:l},null,8,["isTabActive","active","index"])):v("",!0),r.props&&r.props.header?(i(),y("span",c({key:1,ref_for:!0},t.getTabPT(r,"headertitle",l)),z(r.props.header),17)):v("",!0),r.children&&r.children.header?(i(),s(p(r.children.header),{key:2})):v("",!0)]}),_:2},1032,["class","pt"]),k(S,{pt:t.getContentPT(r,l)},{default:u(function(){return[(i(),s(p(r)))]}),_:2},1032,["pt"])]}),_:2},1032,["value","pt","disabled"])}),128)):h(e.$slots,"default",{key:1})],16)}ce.render=ie;export{w as a,x as b,ce as c,K as s};
