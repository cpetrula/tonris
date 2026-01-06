import{B as Z,aX as q,J,c as P,o as M,a as t,C as T,K,aY as X,i as w,z as $,d as Y,aZ as Q,j as _,k as ee,l as I,e as n,w as b,u as s,m as te,x as le,s as U,f as se,t as F,q as x,g as A,F as ae,r as oe}from"./index-B_cHhH5U.js";import{s as z}from"./index-CH-WltEo.js";import{s as B}from"./index-DptDEEYD.js";import{s as ie,a as E}from"./index-C4VQgNC4.js";import{u as ne}from"./tenant-CwMwUnU8.js";import"./index-DEZdFCl7.js";import"./index-CFKnKVPX.js";import"./index-BCMyaoEm.js";var de=`
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`,re={root:{position:"relative"}},ue={root:function(i){var c=i.instance,g=i.props;return["p-toggleswitch p-component",{"p-toggleswitch-checked":c.checked,"p-disabled":g.disabled,"p-invalid":c.$invalid}]},input:"p-toggleswitch-input",slider:"p-toggleswitch-slider",handle:"p-toggleswitch-handle"},ce=Z.extend({name:"toggleswitch",style:de,classes:ue,inlineStyles:re}),ge={name:"BaseToggleSwitch",extends:q,props:{trueValue:{type:null,default:!0},falseValue:{type:null,default:!1},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},inputId:{type:String,default:null},inputClass:{type:[String,Object],default:null},inputStyle:{type:Object,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:ce,provide:function(){return{$pcToggleSwitch:this,$parentInstance:this}}},H={name:"ToggleSwitch",extends:ge,inheritAttrs:!1,emits:["change","focus","blur"],methods:{getPTOptions:function(i){var c=i==="root"?this.ptmi:this.ptm;return c(i,{context:{checked:this.checked,disabled:this.disabled}})},onChange:function(i){if(!this.disabled&&!this.readonly){var c=this.checked?this.falseValue:this.trueValue;this.writeValue(c,i),this.$emit("change",i)}},onFocus:function(i){this.$emit("focus",i)},onBlur:function(i){var c,g;this.$emit("blur",i),(c=(g=this.formField).onBlur)===null||c===void 0||c.call(g,i)}},computed:{checked:function(){return this.d_value===this.trueValue},dataP:function(){return J({checked:this.checked,disabled:this.disabled,invalid:this.$invalid})}}},pe=["data-p-checked","data-p-disabled","data-p"],me=["id","checked","tabindex","disabled","readonly","aria-checked","aria-labelledby","aria-label","aria-invalid"],ve=["data-p"],he=["data-p"];function fe(d,i,c,g,y,r){return M(),P("div",T({class:d.cx("root"),style:d.sx("root")},r.getPTOptions("root"),{"data-p-checked":r.checked,"data-p-disabled":d.disabled,"data-p":r.dataP}),[t("input",T({id:d.inputId,type:"checkbox",role:"switch",class:[d.cx("input"),d.inputClass],style:d.inputStyle,checked:r.checked,tabindex:d.tabindex,disabled:d.disabled,readonly:d.readonly,"aria-checked":r.checked,"aria-labelledby":d.ariaLabelledby,"aria-label":d.ariaLabel,"aria-invalid":d.invalid||void 0,onFocus:i[0]||(i[0]=function(){return r.onFocus&&r.onFocus.apply(r,arguments)}),onBlur:i[1]||(i[1]=function(){return r.onBlur&&r.onBlur.apply(r,arguments)}),onChange:i[2]||(i[2]=function(){return r.onChange&&r.onChange.apply(r,arguments)})},r.getPTOptions("input")),null,16,me),t("div",T({class:d.cx("slider")},r.getPTOptions("slider"),{"data-p":r.dataP}),[t("div",T({class:d.cx("handle")},r.getPTOptions("handle"),{"data-p":r.dataP}),[K(d.$slots,"handle",{checked:r.checked})],16,he)],16,ve)],16,pe)}H.render=fe;var C={name:"InputSwitch",extends:H,mounted:function(){console.warn("Deprecated since v4. Use ToggleSwitch component instead.")}};const be=X("voice",()=>{const d=w([]),i=w(!1),c=w(null);function g(h,f){return h&&typeof h=="object"&&"response"in h&&h.response?.data?.message||f}async function y(){i.value=!0,c.value=null;try{const f=(await $.get("/api/voices")).data?.data?.voices;if(!f)throw new Error("Invalid response structure");d.value=f}catch(h){c.value=g(h,"Failed to fetch voices")}finally{i.value=!1}}async function r(h,f){try{return(await $.post(`/api/voices/${h}/test`,{text:f},{responseType:"blob",headers:{"Content-Type":"application/json"}})).data}catch(a){const S=g(a,"Failed to test voice");throw new Error(S)}}function m(){c.value=null}return{voices:d,loading:i,error:c,fetchVoices:y,testVoice:r,clearError:m}}),we={class:"space-y-6"},ye={class:"grid grid-cols-1 md:grid-cols-2 gap-4"},ke={class:"grid grid-cols-1 md:grid-cols-2 gap-4"},Ve={class:"grid grid-cols-2 md:grid-cols-4 gap-4"},xe={class:"col-span-2"},Me={class:"flex justify-end"},Pe={class:"space-y-4"},Se={class:"w-24 font-medium text-gray-900 capitalize"},Ce={class:"flex items-center gap-2"},Ue={class:"text-sm text-gray-600"},Ae={key:0,class:"flex items-center gap-2 flex-1"},Te={class:"flex justify-end pt-4"},Ie={class:"space-y-6"},Be={key:0,class:"text-sm text-red-500 mt-1"},Ee={class:"mt-2"},Fe={class:"flex justify-end pt-4"},Ne={class:"space-y-6"},Re={class:"space-y-4"},je={class:"flex items-center justify-between"},$e={class:"flex items-center justify-between"},ze={class:"flex items-center justify-between"},He={class:"border-t border-gray-200 pt-6"},Oe={class:"space-y-4"},De={class:"flex items-center justify-between"},Le={key:0,class:"ml-4 pl-4 border-l-2 border-gray-200"},We={class:"flex items-center justify-between opacity-50"},Ge={class:"flex justify-end pt-4"},tt=Y({__name:"SettingsPage",setup(d){const i=Q(),c=le(),g=ne(),y=be(),r=w(!1),m=w(!1),h=w(""),f=w(!1),a=w({name:"",email:"",phone:"",address:"",city:"",state:"",zipCode:"",website:"",description:""}),S=w({monday:{open:"9:00 AM",close:"6:00 PM",closed:!1},tuesday:{open:"9:00 AM",close:"6:00 PM",closed:!1},wednesday:{open:"9:00 AM",close:"6:00 PM",closed:!1},thursday:{open:"9:00 AM",close:"6:00 PM",closed:!1},friday:{open:"9:00 AM",close:"6:00 PM",closed:!1},saturday:{open:"10:00 AM",close:"4:00 PM",closed:!1},sunday:{open:"",close:"",closed:!0}});function N(o){if(!o)return"";const e=o.split(":");if(e.length<2||!e[0]||!e[1])return console.warn("Invalid time format:",o),"";const l=e[0],V=e[1],u=parseInt(l,10);if(isNaN(u)||u<0||u>23)return console.warn("Invalid hour value:",l),"";const k=u>=12?"PM":"AM";return`${u%12||12}:${V} ${k}`}function R(o){if(!o)return"";const e=o.match(/^(\d+):(\d+)\s*(AM|PM)$/i);if(!e)return console.warn("Invalid 12h time format:",o),"";const l=e[1],V=e[2],u=e[3]?.toUpperCase();if(!l||!u)return"";let k=parseInt(l,10);return isNaN(k)||k<1||k>12?(console.warn("Invalid hour value:",l),""):(u==="PM"&&k!==12&&(k+=12),u==="AM"&&k===12&&(k=0),`${k.toString().padStart(2,"0")}:${V}`)}const p=w({voiceId:"",greeting:"Thank you for calling Sample Salon. How can I help you today?",appointmentReminders:!0,reminderHours:24,followUpCalls:!0,followUpText:!0}),v=w({emailNewAppointment:!0,emailCancellation:!0,emailDailyDigest:!0,smsReminderEnabled:!0,smsReminderHours:24}),j=["6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM","10:00 PM"];async function O(){m.value=!0;try{const o={name:a.value.name,contactEmail:a.value.email,contactPhone:a.value.phone,address:{street:a.value.address,city:a.value.city,state:a.value.state,zip:a.value.zipCode,zipCode:a.value.zipCode},metadata:{website:a.value.website,description:a.value.description}};await g.updateTenant(o),i.add({severity:"success",summary:"Success",detail:"Business profile saved",life:3e3})}catch(o){console.error("Failed to save business profile:",o),i.add({severity:"error",summary:"Error",detail:"Failed to save profile",life:3e3})}finally{m.value=!1}}async function D(){m.value=!0;try{const o={};for(const[e,l]of Object.entries(S.value))o[e]={open:R(l.open),close:R(l.close),enabled:!l.closed};await g.updateBusinessHours(o),i.add({severity:"success",summary:"Success",detail:"Business hours saved",life:3e3})}catch(o){console.error("Failed to save business hours:",o),i.add({severity:"error",summary:"Error",detail:"Failed to save hours",life:3e3})}finally{m.value=!1}}async function L(){m.value=!0;try{await g.updateTenant({firstMessage:p.value.greeting}),await g.updateTenant({voiceId:p.value.voiceId}),i.add({severity:"success",summary:"Success",detail:"AI settings saved",life:3e3})}catch{i.add({severity:"error",summary:"Error",detail:"Failed to save settings",life:3e3})}finally{m.value=!1}}async function W(){m.value=!0;try{await g.updateNotificationSettings(v.value),i.add({severity:"success",summary:"Success",detail:"Notification preferences saved",life:3e3})}catch{i.add({severity:"error",summary:"Error",detail:"Failed to save preferences",life:3e3})}finally{m.value=!1}}async function G(){if(!p.value.voiceId){i.add({severity:"warn",summary:"Warning",detail:"Please select a voice first",life:3e3});return}if(!p.value.greeting||p.value.greeting.trim()===""){i.add({severity:"warn",summary:"Warning",detail:"Please enter a greeting message",life:3e3});return}f.value=!0;try{const o=await y.testVoice(p.value.voiceId,p.value.greeting),e=URL.createObjectURL(o),l=new Audio(e);l.onended=()=>{URL.revokeObjectURL(e)},l.onerror=()=>{URL.revokeObjectURL(e),i.add({severity:"error",summary:"Error",detail:"Failed to play audio",life:3e3})},await l.play()}catch(o){console.error("Failed to test voice:",o),i.add({severity:"error",summary:"Error",detail:"Failed to generate voice preview",life:3e3})}finally{f.value=!1}}return _(async()=>{r.value=!0;try{await g.fetchTenants();const o=g.currentTenant;o&&(a.value.name=o.name||"",a.value.email=o.contactEmail||"",a.value.phone=o.contactPhone||"",a.value.address=o.address?.street||"",a.value.city=o.address?.city||"",a.value.state=o.address?.state||"",a.value.zipCode=o.address?.zipCode||o.address?.zip||"",a.value.website=o.metadata?.website||"",a.value.description=o.metadata?.description||"",o.firstMessage?p.value.greeting=o.firstMessage:o.name&&(p.value.greeting=`Hi, thanks for calling ${o.name}! How can I help you today?`),p.value.voiceId=o.voiceId||"");const e=await g.fetchBusinessHours();if(e)for(const[V,u]of Object.entries(e))S.value[V]&&(S.value[V]={open:N(u.open),close:N(u.close),closed:!u.enabled});await y.fetchVoices();const l=await g.fetchNotificationSettings();l&&(v.value={emailNewAppointment:l.emailNewAppointment??!0,emailCancellation:l.emailCancellation??!0,emailDailyDigest:l.emailDailyDigest??!0,smsReminderEnabled:l.smsReminderEnabled??!0,smsReminderHours:l.smsReminderHours??24})}catch(o){console.error("Failed to load settings:",o),i.add({severity:"error",summary:"Error",detail:"Failed to load settings",life:3e3})}finally{r.value=!1}}),(o,e)=>(M(),P("div",null,[e[40]||(e[40]=t("div",{class:"mb-6"},[t("h1",{class:"text-2xl font-bold text-gray-900"},"Settings"),t("p",{class:"text-gray-600 mt-1"},"Manage your business profile and preferences")],-1)),h.value?(M(),ee(s(te),{key:0,severity:"success",class:"mb-6"},{default:b(()=>[se(F(h.value),1)]),_:1})):I("",!0),n(s(U),{class:"mb-6 cursor-pointer hover:shadow-md transition-shadow",onClick:e[0]||(e[0]=l=>s(c).push("/app/phone-forwarding"))},{content:b(()=>[...e[18]||(e[18]=[t("div",{class:"flex items-center justify-between"},[t("div",{class:"flex items-center gap-4"},[t("div",{class:"bg-violet-100 p-3 rounded-lg"},[t("i",{class:"pi pi-phone text-xl text-violet-600"})]),t("div",null,[t("h3",{class:"font-medium"},"Phone Forwarding Setup"),t("p",{class:"text-sm"},"View instructions to forward calls to your Criton.AI number")])]),t("i",{class:"pi pi-chevron-right text-gray-400"})],-1)])]),_:1}),n(s(ie),null,{default:b(()=>[n(s(E),{value:"0",header:"Business Profile"},{default:b(()=>[n(s(U),{class:"shadow-sm"},{content:b(()=>[t("div",we,[t("div",ye,[t("div",null,[e[19]||(e[19]=t("label",{class:"block text-sm font-medium mb-1"},"Business Name",-1)),n(s(x),{modelValue:a.value.name,"onUpdate:modelValue":e[1]||(e[1]=l=>a.value.name=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[20]||(e[20]=t("label",{class:"block text-sm font-medium mb-1"},"Email",-1)),n(s(x),{modelValue:a.value.email,"onUpdate:modelValue":e[2]||(e[2]=l=>a.value.email=l),type:"email",class:"w-full"},null,8,["modelValue"])])]),t("div",ke,[t("div",null,[e[21]||(e[21]=t("label",{class:"block text-sm font-medium mb-1"},"Phone Number",-1)),n(s(x),{modelValue:a.value.phone,"onUpdate:modelValue":e[3]||(e[3]=l=>a.value.phone=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[22]||(e[22]=t("label",{class:"block text-sm font-medium mb-1"},"Website",-1)),n(s(x),{modelValue:a.value.website,"onUpdate:modelValue":e[4]||(e[4]=l=>a.value.website=l),class:"w-full",placeholder:"https://"},null,8,["modelValue"])])]),t("div",null,[e[23]||(e[23]=t("label",{class:"block text-sm font-medium mb-1"},"Street Address",-1)),n(s(x),{modelValue:a.value.address,"onUpdate:modelValue":e[5]||(e[5]=l=>a.value.address=l),class:"w-full"},null,8,["modelValue"])]),t("div",Ve,[t("div",xe,[e[24]||(e[24]=t("label",{class:"block text-sm font-medium mb-1"},"City",-1)),n(s(x),{modelValue:a.value.city,"onUpdate:modelValue":e[6]||(e[6]=l=>a.value.city=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[25]||(e[25]=t("label",{class:"block text-sm font-medium mb-1"},"State",-1)),n(s(x),{modelValue:a.value.state,"onUpdate:modelValue":e[7]||(e[7]=l=>a.value.state=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[26]||(e[26]=t("label",{class:"block text-sm font-medium mb-1"},"ZIP Code",-1)),n(s(x),{modelValue:a.value.zipCode,"onUpdate:modelValue":e[8]||(e[8]=l=>a.value.zipCode=l),class:"w-full"},null,8,["modelValue"])])]),t("div",null,[e[27]||(e[27]=t("label",{class:"block text-sm font-medium mb-1"},"Business Description",-1)),n(s(z),{modelValue:a.value.description,"onUpdate:modelValue":e[9]||(e[9]=l=>a.value.description=l),rows:"3",class:"w-full"},null,8,["modelValue"])]),t("div",Me,[n(s(A),{label:"Save Changes",icon:"pi pi-check",loading:m.value,onClick:O},null,8,["loading"])])])]),_:1})]),_:1}),n(s(E),{value:"1",header:"Business Hours"},{default:b(()=>[n(s(U),{class:"shadow-sm"},{content:b(()=>[t("div",Pe,[(M(!0),P(ae,null,oe(S.value,(l,V)=>(M(),P("div",{key:V,class:"flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg"},[t("div",Se,F(V),1),t("div",Ce,[n(s(C),{modelValue:l.closed,"onUpdate:modelValue":u=>l.closed=u},null,8,["modelValue","onUpdate:modelValue"]),t("span",Ue,F(l.closed?"Closed":"Open"),1)]),l.closed?I("",!0):(M(),P("div",Ae,[n(s(B),{modelValue:l.open,"onUpdate:modelValue":u=>l.open=u,options:j,placeholder:"Open",class:"w-32"},null,8,["modelValue","onUpdate:modelValue"]),e[28]||(e[28]=t("span",{class:"text-gray-500"},"to",-1)),n(s(B),{modelValue:l.close,"onUpdate:modelValue":u=>l.close=u,options:j,placeholder:"Close",class:"w-32"},null,8,["modelValue","onUpdate:modelValue"])]))]))),128)),t("div",Te,[n(s(A),{label:"Save Hours",icon:"pi pi-check",loading:m.value,onClick:D},null,8,["loading"])])])]),_:1})]),_:1}),n(s(E),{value:"2",header:"AI Voice Settings"},{default:b(()=>[n(s(U),{class:"shadow-sm"},{content:b(()=>[t("div",Ie,[t("div",null,[e[29]||(e[29]=t("label",{class:"block text-sm font-medium mb-1"},"Voice Type",-1)),n(s(B),{modelValue:p.value.voiceId,"onUpdate:modelValue":e[10]||(e[10]=l=>p.value.voiceId=l),options:s(y).voices,optionLabel:"label",optionValue:"id",placeholder:"Select a voice",loading:s(y).loading,disabled:s(y).voices.length===0,class:"w-full"},null,8,["modelValue","options","loading","disabled"]),s(y).voices.length===0&&!s(y).loading?(M(),P("p",Be," No voices available. Please contact support. ")):I("",!0)]),t("div",null,[e[30]||(e[30]=t("label",{class:"block text-sm font-medium mb-1"},"Greeting Message",-1)),n(s(z),{modelValue:p.value.greeting,"onUpdate:modelValue":e[11]||(e[11]=l=>p.value.greeting=l),rows:"2",class:"w-full"},null,8,["modelValue"]),e[31]||(e[31]=t("p",{class:"text-sm mt-1"},"This message will be used to greet callers",-1)),t("div",Ee,[n(s(A),{label:"Test Voice",icon:"pi pi-play",severity:"secondary",outlined:"",loading:f.value,disabled:!p.value.voiceId||!p.value.greeting,onClick:G},null,8,["loading","disabled"])])]),t("div",Fe,[n(s(A),{label:"Save AI Settings",icon:"pi pi-check",loading:m.value,onClick:L},null,8,["loading"])])])]),_:1})]),_:1}),n(s(E),{value:"3",header:"Notifications"},{default:b(()=>[n(s(U),{class:"shadow-sm"},{content:b(()=>[t("div",Ne,[t("div",null,[e[35]||(e[35]=t("h3",{class:"font-medium text-gray-900 mb-4"},"Email Notifications (Business Owner)",-1)),t("div",Re,[t("div",je,[e[32]||(e[32]=t("div",null,[t("p",{class:"text-sm"},"Receive email when a new appointment is booked")],-1)),n(s(C),{modelValue:v.value.emailNewAppointment,"onUpdate:modelValue":e[12]||(e[12]=l=>v.value.emailNewAppointment=l)},null,8,["modelValue"])]),t("div",$e,[e[33]||(e[33]=t("div",null,[t("p",{class:"text-sm"},"Receive email when an appointment is cancelled")],-1)),n(s(C),{modelValue:v.value.emailCancellation,"onUpdate:modelValue":e[13]||(e[13]=l=>v.value.emailCancellation=l)},null,8,["modelValue"])]),t("div",ze,[e[34]||(e[34]=t("div",null,[t("p",{class:"text-sm"},"Receive a daily summary email of activity")],-1)),n(s(C),{modelValue:v.value.emailDailyDigest,"onUpdate:modelValue":e[14]||(e[14]=l=>v.value.emailDailyDigest=l)},null,8,["modelValue"])])])]),t("div",He,[e[39]||(e[39]=t("h3",{class:"font-medium text-gray-900 mb-4"},"Customer Notifications",-1)),t("div",Oe,[t("div",De,[e[36]||(e[36]=t("div",null,[t("p",{class:"text-sm"},"Send SMS reminders to customers before appointments")],-1)),n(s(C),{modelValue:v.value.smsReminderEnabled,"onUpdate:modelValue":e[15]||(e[15]=l=>v.value.smsReminderEnabled=l)},null,8,["modelValue"])]),v.value.smsReminderEnabled?(M(),P("div",Le,[e[37]||(e[37]=t("label",{class:"block text-sm font-medium mb-1"},"Remind customers (hours before)",-1)),n(s(B),{modelValue:v.value.smsReminderHours,"onUpdate:modelValue":e[16]||(e[16]=l=>v.value.smsReminderHours=l),options:[12,24,48],class:"w-32"},null,8,["modelValue"])])):I("",!0),t("div",We,[e[38]||(e[38]=t("div",null,[t("p",{class:"text-sm"},"Text customers after appointments for feedback"),t("p",{class:"text-xs text-gray-500"},"Coming soon")],-1)),n(s(C),{modelValue:p.value.followUpText,"onUpdate:modelValue":e[17]||(e[17]=l=>p.value.followUpText=l),disabled:""},null,8,["modelValue"])])])]),t("div",Ge,[n(s(A),{label:"Save Preferences",icon:"pi pi-check",loading:m.value,onClick:W},null,8,["loading"])])])]),_:1})]),_:1})]),_:1})]))}});export{tt as default};
