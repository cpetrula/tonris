import{B as K,I as O,c as k,o as h,K as _,C as w,S as ut,J as dt,ah as q,ai as $t,W as Y,aj as Tt,ak as M,a2 as Pt,al as lt,ac as tt,ag as z,l as V,a as n,k as S,L as G,Y as Vt,a6 as Bt,am as U,w as b,n as X,d as Ct,i as x,E as J,j as Nt,z as L,e as d,u,g as P,s as $,t as f,f as Q,F as St,r as At,q as E,m as Lt}from"./index-CS4DEGdN.js";import{a as Et,s as Dt}from"./index-D9a1vF7E.js";import{s as D}from"./index-zNc_tmOC.js";import{s as it}from"./index-Up5SHQfI.js";import{s as _t,a as N}from"./index-DSJAbW2Z.js";import{s as It}from"./index-X-yDu5iJ.js";import{s as Mt,a as rt}from"./index-Cd_kVWHh.js";import{s as Ut}from"./index-R1ULQoKC.js";import"./index-Bd9eGAJX.js";import"./index-BRCk-1--.js";var zt=`
    .p-tabs {
        display: flex;
        flex-direction: column;
    }

    .p-tablist {
        display: flex;
        position: relative;
        overflow: hidden;
        background: dt('tabs.tablist.background');
    }

    .p-tablist-viewport {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        scrollbar-width: none;
        overscroll-behavior: contain auto;
    }

    .p-tablist-viewport::-webkit-scrollbar {
        display: none;
    }

    .p-tablist-tab-list {
        position: relative;
        display: flex;
        border-style: solid;
        border-color: dt('tabs.tablist.border.color');
        border-width: dt('tabs.tablist.border.width');
    }

    .p-tablist-content {
        flex-grow: 1;
    }

    .p-tablist-nav-button {
        all: unset;
        position: absolute !important;
        flex-shrink: 0;
        inset-block-start: 0;
        z-index: 2;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: dt('tabs.nav.button.background');
        color: dt('tabs.nav.button.color');
        width: dt('tabs.nav.button.width');
        transition:
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        box-shadow: dt('tabs.nav.button.shadow');
        outline-color: transparent;
        cursor: pointer;
    }

    .p-tablist-nav-button:focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.nav.button.focus.ring.shadow');
        outline: dt('tabs.nav.button.focus.ring.width') dt('tabs.nav.button.focus.ring.style') dt('tabs.nav.button.focus.ring.color');
        outline-offset: dt('tabs.nav.button.focus.ring.offset');
    }

    .p-tablist-nav-button:hover {
        color: dt('tabs.nav.button.hover.color');
    }

    .p-tablist-prev-button {
        inset-inline-start: 0;
    }

    .p-tablist-next-button {
        inset-inline-end: 0;
    }

    .p-tablist-prev-button:dir(rtl),
    .p-tablist-next-button:dir(rtl) {
        transform: rotate(180deg);
    }

    .p-tab {
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        position: relative;
        border-style: solid;
        white-space: nowrap;
        gap: dt('tabs.tab.gap');
        background: dt('tabs.tab.background');
        border-width: dt('tabs.tab.border.width');
        border-color: dt('tabs.tab.border.color');
        color: dt('tabs.tab.color');
        padding: dt('tabs.tab.padding');
        font-weight: dt('tabs.tab.font.weight');
        transition:
            background dt('tabs.transition.duration'),
            border-color dt('tabs.transition.duration'),
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        margin: dt('tabs.tab.margin');
        outline-color: transparent;
    }

    .p-tab:not(.p-disabled):focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.tab.focus.ring.shadow');
        outline: dt('tabs.tab.focus.ring.width') dt('tabs.tab.focus.ring.style') dt('tabs.tab.focus.ring.color');
        outline-offset: dt('tabs.tab.focus.ring.offset');
    }

    .p-tab:not(.p-tab-active):not(.p-disabled):hover {
        background: dt('tabs.tab.hover.background');
        border-color: dt('tabs.tab.hover.border.color');
        color: dt('tabs.tab.hover.color');
    }

    .p-tab-active {
        background: dt('tabs.tab.active.background');
        border-color: dt('tabs.tab.active.border.color');
        color: dt('tabs.tab.active.color');
    }

    .p-tabpanels {
        background: dt('tabs.tabpanel.background');
        color: dt('tabs.tabpanel.color');
        padding: dt('tabs.tabpanel.padding');
        outline: 0 none;
    }

    .p-tabpanel:focus-visible {
        box-shadow: dt('tabs.tabpanel.focus.ring.shadow');
        outline: dt('tabs.tabpanel.focus.ring.width') dt('tabs.tabpanel.focus.ring.style') dt('tabs.tabpanel.focus.ring.color');
        outline-offset: dt('tabs.tabpanel.focus.ring.offset');
    }

    .p-tablist-active-bar {
        z-index: 1;
        display: block;
        position: absolute;
        inset-block-end: dt('tabs.active.bar.bottom');
        height: dt('tabs.active.bar.height');
        background: dt('tabs.active.bar.background');
        transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
    }
`,Kt={root:function(e){var l=e.props;return["p-tabs p-component",{"p-tabs-scrollable":l.scrollable}]}},Ot=K.extend({name:"tabs",style:zt,classes:Kt}),Ft={name:"BaseTabs",extends:O,props:{value:{type:[String,Number],default:void 0},lazy:{type:Boolean,default:!1},scrollable:{type:Boolean,default:!1},showNavigators:{type:Boolean,default:!0},tabindex:{type:Number,default:0},selectOnFocus:{type:Boolean,default:!1}},style:Ot,provide:function(){return{$pcTabs:this,$parentInstance:this}}},ct={name:"Tabs",extends:Ft,inheritAttrs:!1,emits:["update:value"],data:function(){return{d_value:this.value}},watch:{value:function(e){this.d_value=e}},methods:{updateValue:function(e){this.d_value!==e&&(this.d_value=e,this.$emit("update:value",e))},isVertical:function(){return this.orientation==="vertical"}}};function Rt(a,e,l,i,p,r){return h(),k("div",w({class:a.cx("root")},a.ptmi("root")),[_(a.$slots,"default")],16)}ct.render=Rt;var Ht={root:"p-tablist",content:"p-tablist-content p-tablist-viewport",tabList:"p-tablist-tab-list",activeBar:"p-tablist-active-bar",prevButton:"p-tablist-prev-button p-tablist-nav-button",nextButton:"p-tablist-next-button p-tablist-nav-button"},Wt=K.extend({name:"tablist",classes:Ht}),jt={name:"BaseTabList",extends:O,props:{},style:Wt,provide:function(){return{$pcTabList:this,$parentInstance:this}}},pt={name:"TabList",extends:jt,inheritAttrs:!1,inject:["$pcTabs"],data:function(){return{isPrevButtonEnabled:!1,isNextButtonEnabled:!0}},resizeObserver:void 0,watch:{showNavigators:function(e){e?this.bindResizeObserver():this.unbindResizeObserver()},activeValue:{flush:"post",handler:function(){this.updateInkBar()}}},mounted:function(){var e=this;setTimeout(function(){e.updateInkBar()},150),this.showNavigators&&(this.updateButtonState(),this.bindResizeObserver())},updated:function(){this.showNavigators&&this.updateButtonState()},beforeUnmount:function(){this.unbindResizeObserver()},methods:{onScroll:function(e){this.showNavigators&&this.updateButtonState(),e.preventDefault()},onPrevButtonClick:function(){var e=this.$refs.content,l=this.getVisibleButtonWidths(),i=q(e)-l,p=Math.abs(e.scrollLeft),r=i*.8,m=p-r,y=Math.max(m,0);e.scrollLeft=lt(e)?-1*y:y},onNextButtonClick:function(){var e=this.$refs.content,l=this.getVisibleButtonWidths(),i=q(e)-l,p=Math.abs(e.scrollLeft),r=i*.8,m=p+r,y=e.scrollWidth-i,g=Math.min(m,y);e.scrollLeft=lt(e)?-1*g:g},bindResizeObserver:function(){var e=this;this.resizeObserver=new ResizeObserver(function(){return e.updateButtonState()}),this.resizeObserver.observe(this.$refs.list)},unbindResizeObserver:function(){var e;(e=this.resizeObserver)===null||e===void 0||e.unobserve(this.$refs.list),this.resizeObserver=void 0},updateInkBar:function(){var e=this.$refs,l=e.content,i=e.inkbar,p=e.tabs;if(i){var r=Y(l,'[data-pc-name="tab"][data-p-active="true"]');this.$pcTabs.isVertical()?(i.style.height=Tt(r)+"px",i.style.top=M(r).top-M(p).top+"px"):(i.style.width=Pt(r)+"px",i.style.left=M(r).left-M(p).left+"px")}},updateButtonState:function(){var e=this.$refs,l=e.list,i=e.content,p=i.scrollTop,r=i.scrollWidth,m=i.scrollHeight,y=i.offsetWidth,g=i.offsetHeight,B=Math.abs(i.scrollLeft),C=[q(i),$t(i)],I=C[0],F=C[1];this.$pcTabs.isVertical()?(this.isPrevButtonEnabled=p!==0,this.isNextButtonEnabled=l.offsetHeight>=g&&parseInt(p)!==m-F):(this.isPrevButtonEnabled=B!==0,this.isNextButtonEnabled=l.offsetWidth>=y&&parseInt(B)!==r-I)},getVisibleButtonWidths:function(){var e=this.$refs,l=e.prevButton,i=e.nextButton,p=0;return this.showNavigators&&(p=(l?.offsetWidth||0)+(i?.offsetWidth||0)),p}},computed:{templates:function(){return this.$pcTabs.$slots},activeValue:function(){return this.$pcTabs.d_value},showNavigators:function(){return this.$pcTabs.showNavigators},prevButtonAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.previous:void 0},nextButtonAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.next:void 0},dataP:function(){return dt({scrollable:this.$pcTabs.scrollable})}},components:{ChevronLeftIcon:Mt,ChevronRightIcon:Ut},directives:{ripple:ut}},qt=["data-p"],Jt=["aria-label","tabindex"],Qt=["data-p"],Yt=["aria-orientation"],Gt=["aria-label","tabindex"];function Xt(a,e,l,i,p,r){var m=tt("ripple");return h(),k("div",w({ref:"list",class:a.cx("root"),"data-p":r.dataP},a.ptmi("root")),[r.showNavigators&&p.isPrevButtonEnabled?z((h(),k("button",w({key:0,ref:"prevButton",type:"button",class:a.cx("prevButton"),"aria-label":r.prevButtonAriaLabel,tabindex:r.$pcTabs.tabindex,onClick:e[0]||(e[0]=function(){return r.onPrevButtonClick&&r.onPrevButtonClick.apply(r,arguments)})},a.ptm("prevButton"),{"data-pc-group-section":"navigator"}),[(h(),S(G(r.templates.previcon||"ChevronLeftIcon"),w({"aria-hidden":"true"},a.ptm("prevIcon")),null,16))],16,Jt)),[[m]]):V("",!0),n("div",w({ref:"content",class:a.cx("content"),onScroll:e[1]||(e[1]=function(){return r.onScroll&&r.onScroll.apply(r,arguments)}),"data-p":r.dataP},a.ptm("content")),[n("div",w({ref:"tabs",class:a.cx("tabList"),role:"tablist","aria-orientation":r.$pcTabs.orientation||"horizontal"},a.ptm("tabList")),[_(a.$slots,"default"),n("span",w({ref:"inkbar",class:a.cx("activeBar"),role:"presentation","aria-hidden":"true"},a.ptm("activeBar")),null,16)],16,Yt)],16,Qt),r.showNavigators&&p.isNextButtonEnabled?z((h(),k("button",w({key:1,ref:"nextButton",type:"button",class:a.cx("nextButton"),"aria-label":r.nextButtonAriaLabel,tabindex:r.$pcTabs.tabindex,onClick:e[2]||(e[2]=function(){return r.onNextButtonClick&&r.onNextButtonClick.apply(r,arguments)})},a.ptm("nextButton"),{"data-pc-group-section":"navigator"}),[(h(),S(G(r.templates.nexticon||"ChevronRightIcon"),w({"aria-hidden":"true"},a.ptm("nextIcon")),null,16))],16,Gt)),[[m]]):V("",!0)],16,qt)}pt.render=Xt;var Zt={root:function(e){var l=e.instance,i=e.props;return["p-tab",{"p-tab-active":l.active,"p-disabled":i.disabled}]}},te=K.extend({name:"tab",classes:Zt}),ee={name:"BaseTab",extends:O,props:{value:{type:[String,Number],default:void 0},disabled:{type:Boolean,default:!1},as:{type:[String,Object],default:"BUTTON"},asChild:{type:Boolean,default:!1}},style:te,provide:function(){return{$pcTab:this,$parentInstance:this}}},Z={name:"Tab",extends:ee,inheritAttrs:!1,inject:["$pcTabs","$pcTabList"],methods:{onFocus:function(){this.$pcTabs.selectOnFocus&&this.changeActiveValue()},onClick:function(){this.changeActiveValue()},onKeydown:function(e){switch(e.code){case"ArrowRight":this.onArrowRightKey(e);break;case"ArrowLeft":this.onArrowLeftKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"PageDown":this.onPageDownKey(e);break;case"PageUp":this.onPageUpKey(e);break;case"Enter":case"NumpadEnter":case"Space":this.onEnterKey(e);break}},onArrowRightKey:function(e){var l=this.findNextTab(e.currentTarget);l?this.changeFocusedTab(e,l):this.onHomeKey(e),e.preventDefault()},onArrowLeftKey:function(e){var l=this.findPrevTab(e.currentTarget);l?this.changeFocusedTab(e,l):this.onEndKey(e),e.preventDefault()},onHomeKey:function(e){var l=this.findFirstTab();this.changeFocusedTab(e,l),e.preventDefault()},onEndKey:function(e){var l=this.findLastTab();this.changeFocusedTab(e,l),e.preventDefault()},onPageDownKey:function(e){this.scrollInView(this.findLastTab()),e.preventDefault()},onPageUpKey:function(e){this.scrollInView(this.findFirstTab()),e.preventDefault()},onEnterKey:function(e){this.changeActiveValue()},findNextTab:function(e){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,i=l?e:e.nextElementSibling;return i?U(i,"data-p-disabled")||U(i,"data-pc-section")==="activebar"?this.findNextTab(i):Y(i,'[data-pc-name="tab"]'):null},findPrevTab:function(e){var l=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,i=l?e:e.previousElementSibling;return i?U(i,"data-p-disabled")||U(i,"data-pc-section")==="activebar"?this.findPrevTab(i):Y(i,'[data-pc-name="tab"]'):null},findFirstTab:function(){return this.findNextTab(this.$pcTabList.$refs.tabs.firstElementChild,!0)},findLastTab:function(){return this.findPrevTab(this.$pcTabList.$refs.tabs.lastElementChild,!0)},changeActiveValue:function(){this.$pcTabs.updateValue(this.value)},changeFocusedTab:function(e,l){Bt(l),this.scrollInView(l)},scrollInView:function(e){var l;e==null||(l=e.scrollIntoView)===null||l===void 0||l.call(e,{block:"nearest"})}},computed:{active:function(){var e;return Vt((e=this.$pcTabs)===null||e===void 0?void 0:e.d_value,this.value)},id:function(){var e;return"".concat((e=this.$pcTabs)===null||e===void 0?void 0:e.$id,"_tab_").concat(this.value)},ariaControls:function(){var e;return"".concat((e=this.$pcTabs)===null||e===void 0?void 0:e.$id,"_tabpanel_").concat(this.value)},attrs:function(){return w(this.asAttrs,this.a11yAttrs,this.ptmi("root",this.ptParams))},asAttrs:function(){return this.as==="BUTTON"?{type:"button",disabled:this.disabled}:void 0},a11yAttrs:function(){return{id:this.id,tabindex:this.active?this.$pcTabs.tabindex:-1,role:"tab","aria-selected":this.active,"aria-controls":this.ariaControls,"data-pc-name":"tab","data-p-disabled":this.disabled,"data-p-active":this.active,onFocus:this.onFocus,onKeydown:this.onKeydown}},ptParams:function(){return{context:{active:this.active}}},dataP:function(){return dt({active:this.active})}},directives:{ripple:ut}};function ae(a,e,l,i,p,r){var m=tt("ripple");return a.asChild?_(a.$slots,"default",{key:1,dataP:r.dataP,class:X(a.cx("root")),active:r.active,a11yAttrs:r.a11yAttrs,onClick:r.onClick}):z((h(),S(G(a.as),w({key:0,class:a.cx("root"),"data-p":r.dataP,onClick:r.onClick},r.attrs),{default:b(function(){return[_(a.$slots,"default")]}),_:3},16,["class","data-p","onClick"])),[[m]])}Z.render=ae;var se={root:"p-tabpanels"},ne=K.extend({name:"tabpanels",classes:se}),oe={name:"BaseTabPanels",extends:O,props:{},style:ne,provide:function(){return{$pcTabPanels:this,$parentInstance:this}}},bt={name:"TabPanels",extends:oe,inheritAttrs:!1};function le(a,e,l,i,p,r){return h(),k("div",w({class:a.cx("root"),role:"presentation"},a.ptmi("root")),[_(a.$slots,"default")],16)}bt.render=le;const ie={class:"flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6"},re={class:"grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6"},ue={class:"text-center"},de={class:"text-3xl font-bold text-violet-600"},ce={class:"text-center"},pe={class:"text-3xl font-bold text-blue-600"},be={class:"text-center"},ve={class:"text-3xl font-bold text-green-600"},me={class:"text-center"},fe={class:"text-3xl font-bold text-red-600"},he={class:"grid grid-cols-1 lg:grid-cols-3 gap-6"},ge={class:"text-gray-900"},ye={class:"space-y-3"},we={class:"flex items-center space-x-4"},xe={class:"text-center min-w-[60px]"},ke={class:"text-lg font-bold text-violet-600"},$e={class:"font-medium text-gray-900"},Te={class:"text-sm text-gray-600"},Pe={class:"flex items-center space-x-2"},Ve={key:0,class:"text-center py-8 text-white-500"},Be={class:"flex flex-col sm:flex-row gap-4"},Ce={class:"flex-1"},Ne={class:"font-medium text-white-900"},Se={class:"text-sm text-white-600"},Ae={class:"font-medium text-white-900"},Le={class:"text-sm text-white-600"},Ee={class:"flex gap-1"},De={class:"space-y-4"},_e={class:"grid grid-cols-2 gap-4"},Ie={class:"col-span-2"},Me={class:"grid grid-cols-2 gap-4"},Ue={class:"grid grid-cols-2 gap-4"},ze={key:0},Ye=Ct({__name:"AppointmentsPage",setup(a){const e=x(!1),l=x([]),i=x(""),p=x(null),r=x(null),m=x(!1),y=x(!1),g=x(""),B=x([]),C=x([]),I=[{label:"All Statuses",value:null},{label:"Scheduled",value:"scheduled"},{label:"Confirmed",value:"confirmed"},{label:"Completed",value:"completed"},{label:"Cancelled",value:"cancelled"},{label:"No Show",value:"no_show"}],F=["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM"],et={id:"",customerName:"",customerEmail:"",customerPhone:"",service:"",employee:"",date:new Date,time:"9:00 AM",duration:45,status:"scheduled",notes:""},c=x({...et}),R=J(()=>{let o=l.value;if(i.value){const t=i.value.toLowerCase();o=o.filter(v=>v.customerName.toLowerCase().includes(t)||v.customerEmail.toLowerCase().includes(t)||v.service.toLowerCase().includes(t)||v.employee.toLowerCase().includes(t))}if(p.value){const t=p.value.toDateString();o=o.filter(v=>new Date(v.date).toDateString()===t)}return r.value&&(o=o.filter(t=>t.status===r.value)),o}),H=J(()=>{const o=new Date().toDateString();return l.value.filter(t=>new Date(t.date).toDateString()===o)}),vt=J(()=>{const o=new Date;return o.setHours(0,0,0,0),l.value.filter(t=>new Date(t.date)>=o&&t.status!=="completed"&&t.status!=="cancelled").sort((t,v)=>new Date(t.date).getTime()-new Date(v.date).getTime())});function at(o){return new Date(o).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}function st(o){return{scheduled:"bg-blue-100 text-blue-700",confirmed:"bg-green-100 text-green-700",completed:"bg-gray-100 text-gray-700",cancelled:"bg-red-100 text-red-700","no-show":"bg-orange-100 text-orange-700"}[o]||"bg-gray-100 text-gray-700"}function mt(){c.value={...et,id:crypto.randomUUID(),date:new Date},y.value=!1,m.value=!0,g.value=""}function nt(o){c.value={...o,date:new Date(o.date)},y.value=!0,m.value=!0,g.value=""}async function ft(){if(!c.value.customerName||!c.value.service||!c.value.employee){g.value="Please fill in all required fields";return}try{e.value=!0,g.value="";const o=C.value.find(s=>s.value===c.value.service),t=B.value.find(s=>s.value===c.value.employee);if(!o||!t){g.value="Invalid service or employee selection";return}const v=ht(c.value.date,c.value.time);if(y.value){const s={customerName:c.value.customerName,customerEmail:c.value.customerEmail||void 0,customerPhone:c.value.customerPhone||void 0,employeeId:t.id,startTime:v.toISOString(),notes:c.value.notes||void 0,status:c.value.status,tenantId:gt()};(await L.patch(`/api/appointments/${c.value.id}`,s)).data.success&&(await W(),m.value=!1)}else{const s={customerName:c.value.customerName,customerEmail:c.value.customerEmail||void 0,customerPhone:c.value.customerPhone||void 0,serviceId:o.id,employeeId:t.id,startTime:v.toISOString(),notes:c.value.notes||void 0,addOns:[]};(await L.post("/api/appointments",s)).data.success&&(await W(),m.value=!1)}}catch(o){console.error("Error saving appointment:",o),g.value=o.response?.data?.error||"Failed to save appointment"}finally{e.value=!1}}function ht(o,t){const v=t.split(" "),s=v[0],T=v[1];if(!s)throw new Error("Time must be in format HH:MM AM/PM (e.g., 9:00 AM)");const j=s.split(":");if(j.length!==2)throw new Error("Time must be in format HH:MM AM/PM (e.g., 9:00 AM)");let A=parseInt(j[0]||"0",10);const kt=parseInt(j[1]||"0",10);T==="PM"&&A!==12?A+=12:T==="AM"&&A===12&&(A=0);const ot=new Date(o);return ot.setHours(A,kt,0,0),ot}function gt(){const o=localStorage.getItem("token");if(!o)return null;try{const t=o.split(".");if(t.length!==3||!t[1])return null;let v=t[1].replace(/-/g,"+").replace(/_/g,"/");const s=(4-v.length%4)%4;return v=v.padEnd(v.length+s,"="),JSON.parse(atob(v)).tenantId||null}catch(t){return console.error("Error parsing JWT token:",t),null}}function yt(){i.value="",p.value=null,r.value=null}Nt(async()=>{e.value=!0;try{await Promise.all([W(),wt(),xt()])}catch(o){console.error("Error loading data:",o),g.value="Failed to load appointments data"}finally{e.value=!1}});async function W(){try{const o=await L.get("/api/appointments");o.data.success&&o.data.data&&(l.value=o.data.data.appointments.map(t=>({id:t.id,customerName:t.customerName||"Unknown",customerEmail:t.customerEmail||"",customerPhone:t.customerPhone||"",service:t.service?.name||"Unknown Service",serviceId:t.serviceId,employee:t.employee?`${t.employee.firstName} ${t.employee.lastName}`:"Unknown",employeeId:t.employeeId,date:new Date(t.startTime),time:new Date(t.startTime).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0}),duration:typeof t.duration=="string"?parseInt(t.duration,10):t.duration||(typeof t.totalDuration=="string"?parseInt(t.totalDuration,10):t.totalDuration)||30,status:t.status||"scheduled",notes:t.notes||""})))}catch(o){console.error("Error fetching appointments:",o)}}async function wt(){try{const o=await L.get("/api/employees");o.data.success&&o.data.data&&(B.value=o.data.data.employees.map(t=>({label:`${t.firstName} ${t.lastName}`,value:`${t.firstName} ${t.lastName}`,id:t.id})))}catch(o){console.error("Error fetching employees:",o)}}async function xt(){try{const o=await L.get("/api/services");o.data.success&&o.data.data&&(C.value=o.data.data.services.map(t=>({label:t.name,value:t.name,id:t.id,duration:typeof t.duration=="string"?parseInt(t.duration,10):t.duration||30})))}catch(o){console.error("Error fetching services:",o)}}return(o,t)=>{const v=tt("tooltip");return h(),k("div",null,[n("div",ie,[t[15]||(t[15]=n("div",null,[n("h1",{class:"text-2xl font-bold text-gray-900"},"Appointments"),n("p",{class:"text-gray-600 mt-1"},"Manage your appointments calendar and bookings")],-1)),d(u(P),{label:"New Appointment",icon:"pi pi-plus",class:"mt-4 sm:mt-0",onClick:mt})]),n("div",re,[d(u($),{class:"shadow-sm bg-white"},{content:b(()=>[n("div",ue,[n("p",de,f(H.value.length),1),t[16]||(t[16]=n("p",{class:"text-sm text-white-600"},"Today",-1))])]),_:1}),d(u($),{class:"shadow-sm bg-white"},{content:b(()=>[n("div",ce,[n("p",pe,f(vt.value.length),1),t[17]||(t[17]=n("p",{class:"text-sm text-white-600"},"Upcoming",-1))])]),_:1}),d(u($),{class:"shadow-sm bg-white"},{content:b(()=>[n("div",be,[n("p",ve,f(l.value.filter(s=>s.status==="completed").length),1),t[18]||(t[18]=n("p",{class:"text-sm text-white-600"},"Completed",-1))])]),_:1}),d(u($),{class:"shadow-sm bg-white"},{content:b(()=>[n("div",me,[n("p",fe,f(l.value.filter(s=>s.status==="cancelled").length),1),t[19]||(t[19]=n("p",{class:"text-sm text-white-600"},"Cancelled",-1))])]),_:1})]),d(u(ct),{value:"0"},{default:b(()=>[d(u(pt),null,{default:b(()=>[d(u(Z),{value:"0"},{default:b(()=>[...t[20]||(t[20]=[Q("Calendar View",-1)])]),_:1}),d(u(Z),{value:"1"},{default:b(()=>[...t[21]||(t[21]=[Q("List View",-1)])]),_:1})]),_:1}),d(u(bt),null,{default:b(()=>[d(u(rt),{value:"0"},{default:b(()=>[n("div",he,[d(u($),{class:"shadow-sm bg-white"},{content:b(()=>[d(u(it),{modelValue:p.value,"onUpdate:modelValue":t[0]||(t[0]=s=>p.value=s),inline:"",class:"w-full",manualInput:!1},null,8,["modelValue"]),p.value?(h(),S(u(P),{key:0,label:"Clear Date",text:"",size:"small",class:"mt-2 w-full text-emerald-600",onClick:t[1]||(t[1]=s=>p.value=null)})):V("",!0)]),_:1}),d(u($),{class:"shadow-sm lg:col-span-2 bg-white"},{title:b(()=>[n("span",ge,f(p.value?at(p.value):"Today's")+" Appointments",1)]),content:b(()=>[n("div",ye,[(h(!0),k(St,null,At(p.value?R.value:H.value,s=>(h(),k("div",{key:s.id,class:"flex items-center justify-between p-4 bg-gray-50 rounded-lg"},[n("div",we,[n("div",xe,[n("p",ke,f(s.time),1)]),n("div",null,[n("p",$e,f(s.customerName),1),n("p",Te,f(s.service)+" with "+f(s.employee),1)])]),n("div",Pe,[n("span",{class:X(["px-2 py-1 rounded-full text-xs font-medium",st(s.status)])},f(s.status),3),d(u(P),{icon:"pi pi-pencil",text:"",size:"small",severity:"secondary",onClick:T=>nt(s)},null,8,["onClick"])])]))),128)),(p.value?R.value:H.value).length===0?(h(),k("div",Ve," No appointments for this day ")):V("",!0)])]),_:1})])]),_:1}),d(u(rt),{value:"1"},{default:b(()=>[d(u($),{class:"mb-6 shadow-sm bg-white"},{content:b(()=>[n("div",Be,[n("div",Ce,[d(u(Et),null,{default:b(()=>[d(u(Dt),{class:"pi pi-search"}),d(u(E),{modelValue:i.value,"onUpdate:modelValue":t[2]||(t[2]=s=>i.value=s),placeholder:"Search appointments...",class:"w-full"},null,8,["modelValue"])]),_:1})]),d(u(D),{modelValue:r.value,"onUpdate:modelValue":t[3]||(t[3]=s=>r.value=s),options:I,optionLabel:"label",optionValue:"value",placeholder:"Filter by status",class:"w-full sm:w-48"},null,8,["modelValue"]),i.value||r.value?(h(),S(u(P),{key:0,label:"Clear",text:"",severity:"secondary",onClick:yt})):V("",!0)])]),_:1}),d(u($),{class:"shadow-sm bg-white"},{content:b(()=>[d(u(_t),{value:R.value,loading:e.value,paginator:"",rows:10,rowsPerPageOptions:[5,10,20],responsiveLayout:"scroll",class:"p-datatable-sm",sortField:"date",sortOrder:-1},{empty:b(()=>[...t[22]||(t[22]=[n("div",{class:"text-center py-8 text-white-500"}," No appointments found ",-1)])]),default:b(()=>[d(u(N),{field:"date",header:"Date",sortable:""},{body:b(({data:s})=>[n("div",null,[n("p",Ne,f(at(s.date)),1),n("p",Se,f(s.time),1)])]),_:1}),d(u(N),{field:"customerName",header:"Customer",sortable:""},{body:b(({data:s})=>[n("div",null,[n("p",Ae,f(s.customerName),1),n("p",Le,f(s.customerPhone),1)])]),_:1}),d(u(N),{field:"service",header:"Service",sortable:""}),d(u(N),{field:"employee",header:"Employee",sortable:""}),d(u(N),{field:"status",header:"Status",sortable:""},{body:b(({data:s})=>[n("span",{class:X(["px-2 py-1 rounded-full text-xs font-medium capitalize",st(s.status)])},f(s.status),3)]),_:1}),d(u(N),{header:"Edit",exportable:!1,style:{"min-width":"12rem"}},{body:b(({data:s})=>[n("div",Ee,[z(d(u(P),{icon:"pi pi-pencil",text:"",size:"small",severity:"secondary",onClick:T=>nt(s)},null,8,["onClick"]),[[v,"Edit",void 0,{top:!0}]])])]),_:1})]),_:1},8,["value","loading"])]),_:1})]),_:1})]),_:1})]),_:1}),d(u(It),{visible:m.value,"onUpdate:visible":t[14]||(t[14]=s=>m.value=s),header:y.value?"Edit Appointment":"New Appointment",modal:!0,style:{width:"600px"}},{footer:b(()=>[d(u(P),{label:"Cancel",text:"",severity:"secondary",onClick:t[13]||(t[13]=s=>m.value=!1)}),d(u(P),{label:y.value?"Update":"Book",onClick:ft},null,8,["label"])]),default:b(()=>[g.value?(h(),S(u(Lt),{key:0,severity:"error",class:"mb-4"},{default:b(()=>[Q(f(g.value),1)]),_:1})):V("",!0),n("div",De,[n("div",_e,[n("div",Ie,[t[23]||(t[23]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Customer Name *",-1)),d(u(E),{modelValue:c.value.customerName,"onUpdate:modelValue":t[4]||(t[4]=s=>c.value.customerName=s),class:"w-full"},null,8,["modelValue"])]),n("div",null,[t[24]||(t[24]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Email",-1)),d(u(E),{modelValue:c.value.customerEmail,"onUpdate:modelValue":t[5]||(t[5]=s=>c.value.customerEmail=s),type:"email",class:"w-full"},null,8,["modelValue"])]),n("div",null,[t[25]||(t[25]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Phone",-1)),d(u(E),{modelValue:c.value.customerPhone,"onUpdate:modelValue":t[6]||(t[6]=s=>c.value.customerPhone=s),class:"w-full"},null,8,["modelValue"])])]),n("div",Me,[n("div",null,[t[26]||(t[26]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Service *",-1)),d(u(D),{modelValue:c.value.service,"onUpdate:modelValue":t[7]||(t[7]=s=>c.value.service=s),options:C.value,optionLabel:"label",optionValue:"value",placeholder:"Select service",class:"w-full"},null,8,["modelValue","options"])]),n("div",null,[t[27]||(t[27]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Employee *",-1)),d(u(D),{modelValue:c.value.employee,"onUpdate:modelValue":t[8]||(t[8]=s=>c.value.employee=s),options:B.value,optionLabel:"label",optionValue:"value",placeholder:"Select employee",class:"w-full"},null,8,["modelValue","options"])])]),n("div",Ue,[n("div",null,[t[28]||(t[28]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Date *",-1)),d(u(it),{modelValue:c.value.date,"onUpdate:modelValue":t[9]||(t[9]=s=>c.value.date=s),class:"w-full",dateFormat:"mm/dd/yy"},null,8,["modelValue"])]),n("div",null,[t[29]||(t[29]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Time *",-1)),d(u(D),{modelValue:c.value.time,"onUpdate:modelValue":t[10]||(t[10]=s=>c.value.time=s),options:F,placeholder:"Select time",class:"w-full"},null,8,["modelValue"])])]),y.value?(h(),k("div",ze,[t[30]||(t[30]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Status",-1)),d(u(D),{modelValue:c.value.status,"onUpdate:modelValue":t[11]||(t[11]=s=>c.value.status=s),options:I.filter(s=>s.value),optionLabel:"label",optionValue:"value",class:"w-full"},null,8,["modelValue","options"])])):V("",!0),n("div",null,[t[31]||(t[31]=n("label",{class:"block text-sm font-medium text-white-700 mb-1"},"Notes",-1)),d(u(E),{modelValue:c.value.notes,"onUpdate:modelValue":t[12]||(t[12]=s=>c.value.notes=s),class:"w-full",placeholder:"Any special requests or notes..."},null,8,["modelValue"])])])]),_:1},8,["visible","header"])])}}});export{Ye as default};
