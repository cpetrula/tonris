import{B as L,aX as Z,J as q,c as P,o as M,a as t,C as A,K as G,aY as J,i as b,z as K,d as W,aZ as X,j as Y,k as Q,l as U,e as n,w as h,u as s,m as _,x as ee,s as S,f as te,t as N,q as V,g as T,F as le,r as se}from"./index-BSNpkGwY.js";import{s as z}from"./index-BGubNFbx.js";import{s as I}from"./index-DnbHldtn.js";import{s as oe,a as B}from"./index-DaXrecef.js";import{u as ae}from"./tenant-CaJpbgO4.js";import"./index-BARBQ_H0.js";import"./index-C_jbelfy.js";import"./index-DIEkiNr5.js";import"./index-DP6PWze9.js";var ne=`
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
`,ie={root:{position:"relative"}},de={root:function(i){var c=i.instance,p=i.props;return["p-toggleswitch p-component",{"p-toggleswitch-checked":c.checked,"p-disabled":p.disabled,"p-invalid":c.$invalid}]},input:"p-toggleswitch-input",slider:"p-toggleswitch-slider",handle:"p-toggleswitch-handle"},re=L.extend({name:"toggleswitch",style:ne,classes:de,inlineStyles:ie}),ue={name:"BaseToggleSwitch",extends:Z,props:{trueValue:{type:null,default:!0},falseValue:{type:null,default:!1},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},inputId:{type:String,default:null},inputClass:{type:[String,Object],default:null},inputStyle:{type:Object,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:re,provide:function(){return{$pcToggleSwitch:this,$parentInstance:this}}},E={name:"ToggleSwitch",extends:ue,inheritAttrs:!1,emits:["change","focus","blur"],methods:{getPTOptions:function(i){var c=i==="root"?this.ptmi:this.ptm;return c(i,{context:{checked:this.checked,disabled:this.disabled}})},onChange:function(i){if(!this.disabled&&!this.readonly){var c=this.checked?this.falseValue:this.trueValue;this.writeValue(c,i),this.$emit("change",i)}},onFocus:function(i){this.$emit("focus",i)},onBlur:function(i){var c,p;this.$emit("blur",i),(c=(p=this.formField).onBlur)===null||c===void 0||c.call(p,i)}},computed:{checked:function(){return this.d_value===this.trueValue},dataP:function(){return q({checked:this.checked,disabled:this.disabled,invalid:this.$invalid})}}},ce=["data-p-checked","data-p-disabled","data-p"],pe=["id","checked","tabindex","disabled","readonly","aria-checked","aria-labelledby","aria-label","aria-invalid"],ge=["data-p"],me=["data-p"];function ve(d,i,c,p,y,r){return M(),P("div",A({class:d.cx("root"),style:d.sx("root")},r.getPTOptions("root"),{"data-p-checked":r.checked,"data-p-disabled":d.disabled,"data-p":r.dataP}),[t("input",A({id:d.inputId,type:"checkbox",role:"switch",class:[d.cx("input"),d.inputClass],style:d.inputStyle,checked:r.checked,tabindex:d.tabindex,disabled:d.disabled,readonly:d.readonly,"aria-checked":r.checked,"aria-labelledby":d.ariaLabelledby,"aria-label":d.ariaLabel,"aria-invalid":d.invalid||void 0,onFocus:i[0]||(i[0]=function(){return r.onFocus&&r.onFocus.apply(r,arguments)}),onBlur:i[1]||(i[1]=function(){return r.onBlur&&r.onBlur.apply(r,arguments)}),onChange:i[2]||(i[2]=function(){return r.onChange&&r.onChange.apply(r,arguments)})},r.getPTOptions("input")),null,16,pe),t("div",A({class:d.cx("slider")},r.getPTOptions("slider"),{"data-p":r.dataP}),[t("div",A({class:d.cx("handle")},r.getPTOptions("handle"),{"data-p":r.dataP}),[G(d.$slots,"handle",{checked:r.checked})],16,me)],16,ge)],16,ce)}E.render=ve;var x={name:"InputSwitch",extends:E,mounted:function(){console.warn("Deprecated since v4. Use ToggleSwitch component instead.")}};const he=J("voice",()=>{const d=b([]),i=b(!1),c=b(null);function p(u,k){return u&&typeof u=="object"&&"response"in u&&u.response?.data?.message||k}async function y(){i.value=!0,c.value=null;try{const k=(await K.get("/api/voices")).data?.data?.voices;if(!k)throw new Error("Invalid response structure");d.value=k}catch(u){c.value=p(u,"Failed to fetch voices")}finally{i.value=!1}}function r(){c.value=null}return{voices:d,loading:i,error:c,fetchVoices:y,clearError:r}}),fe={class:"space-y-6"},we={class:"grid grid-cols-1 md:grid-cols-2 gap-4"},be={class:"grid grid-cols-1 md:grid-cols-2 gap-4"},ye={class:"grid grid-cols-2 md:grid-cols-4 gap-4"},ke={class:"col-span-2"},Ve={class:"flex justify-end"},xe={class:"space-y-4"},Me={class:"w-24 font-medium text-gray-900 capitalize"},Pe={class:"flex items-center gap-2"},Se={class:"text-sm text-gray-600"},Ce={key:0,class:"flex items-center gap-2 flex-1"},Ae={class:"flex justify-end pt-4"},Ue={class:"space-y-6"},Te={key:0,class:"text-sm text-red-500 mt-1"},Ie={class:"flex justify-end pt-4"},Be={class:"space-y-6"},Ne={class:"space-y-4"},Fe={class:"flex items-center justify-between"},je={class:"flex items-center justify-between"},$e={class:"flex items-center justify-between"},ze={class:"flex items-center justify-between"},Ee={class:"flex items-center justify-between"},He={class:"border-t border-gray-200 pt-6"},Oe={class:"space-y-4"},Re={class:"flex items-center justify-between"},De={key:0,class:"ml-4 pl-4 border-l-2 border-gray-200"},Le={class:"flex items-center justify-between"},Ze={class:"flex justify-end pt-4"},tt=W({__name:"SettingsPage",setup(d){const i=X(),c=ee(),p=ae(),y=he(),r=b(!1),u=b(!1),k=b(""),o=b({name:"",email:"",phone:"",address:"",city:"",state:"",zipCode:"",website:"",description:""}),C=b({monday:{open:"9:00 AM",close:"6:00 PM",closed:!1},tuesday:{open:"9:00 AM",close:"6:00 PM",closed:!1},wednesday:{open:"9:00 AM",close:"6:00 PM",closed:!1},thursday:{open:"9:00 AM",close:"6:00 PM",closed:!1},friday:{open:"9:00 AM",close:"6:00 PM",closed:!1},saturday:{open:"10:00 AM",close:"4:00 PM",closed:!1},sunday:{open:"",close:"",closed:!0}});function F(a){if(!a)return"";const e=a.split(":");if(e.length<2||!e[0]||!e[1])return console.warn("Invalid time format:",a),"";const l=e[0],f=e[1],g=parseInt(l,10);if(isNaN(g)||g<0||g>23)return console.warn("Invalid hour value:",l),"";const w=g>=12?"PM":"AM";return`${g%12||12}:${f} ${w}`}function j(a){if(!a)return"";const e=a.match(/^(\d+):(\d+)\s*(AM|PM)$/i);if(!e)return console.warn("Invalid 12h time format:",a),"";const l=e[1],f=e[2],g=e[3]?.toUpperCase();if(!l||!g)return"";let w=parseInt(l,10);return isNaN(w)||w<1||w>12?(console.warn("Invalid hour value:",l),""):(g==="PM"&&w!==12&&(w+=12),g==="AM"&&w===12&&(w=0),`${w.toString().padStart(2,"0")}:${f}`)}const m=b({voiceId:"",greeting:"Thank you for calling Sample Salon. How can I help you today?",appointmentReminders:!0,reminderHours:24,followUpCalls:!0,followUpText:!0}),v=b({emailNewAppointment:!0,emailCancellation:!0,emailDailyDigest:!0,smsNewAppointment:!1,smsCancellation:!0,smsReminder:!0}),$=["6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM","10:00 PM"];async function H(){u.value=!0;try{const a={name:o.value.name,contactEmail:o.value.email,contactPhone:o.value.phone,address:{street:o.value.address,city:o.value.city,state:o.value.state,zip:o.value.zipCode,zipCode:o.value.zipCode},metadata:{website:o.value.website,description:o.value.description}};await p.updateTenant(a),i.add({severity:"success",summary:"Success",detail:"Business profile saved",life:3e3})}catch(a){console.error("Failed to save business profile:",a),i.add({severity:"error",summary:"Error",detail:"Failed to save profile",life:3e3})}finally{u.value=!1}}async function O(){u.value=!0;try{const a={};for(const[e,l]of Object.entries(C.value))a[e]={open:j(l.open),close:j(l.close),enabled:!l.closed};await p.updateBusinessHours(a),i.add({severity:"success",summary:"Success",detail:"Business hours saved",life:3e3})}catch(a){console.error("Failed to save business hours:",a),i.add({severity:"error",summary:"Error",detail:"Failed to save hours",life:3e3})}finally{u.value=!1}}async function R(){u.value=!0;try{await p.updateTenant({firstMessage:m.value.greeting}),await p.updateTenant({voiceId:m.value.voiceId}),i.add({severity:"success",summary:"Success",detail:"AI settings saved",life:3e3})}catch{i.add({severity:"error",summary:"Error",detail:"Failed to save settings",life:3e3})}finally{u.value=!1}}async function D(){u.value=!0;try{await new Promise(a=>setTimeout(a,500)),i.add({severity:"success",summary:"Success",detail:"Notification preferences saved",life:3e3})}catch{i.add({severity:"error",summary:"Error",detail:"Failed to save preferences",life:3e3})}finally{u.value=!1}}return Y(async()=>{r.value=!0;try{await p.fetchTenants();const a=p.currentTenant;a&&(o.value.name=a.name||"",o.value.email=a.contactEmail||"",o.value.phone=a.contactPhone||"",o.value.address=a.address?.street||"",o.value.city=a.address?.city||"",o.value.state=a.address?.state||"",o.value.zipCode=a.address?.zipCode||a.address?.zip||"",o.value.website=a.metadata?.website||"",o.value.description=a.metadata?.description||"",a.firstMessage?m.value.greeting=a.firstMessage:a.name&&(m.value.greeting=`Hi, thanks for calling ${a.name}! How can I help you today?`),m.value.voiceId=a.voiceId||"");const e=await p.fetchBusinessHours();if(e)for(const[l,f]of Object.entries(e))C.value[l]&&(C.value[l]={open:F(f.open),close:F(f.close),closed:!f.enabled});await y.fetchVoices()}catch(a){console.error("Failed to load settings:",a),i.add({severity:"error",summary:"Error",detail:"Failed to load settings",life:3e3})}finally{r.value=!1}}),(a,e)=>(M(),P("div",null,[e[43]||(e[43]=t("div",{class:"mb-6"},[t("h1",{class:"text-2xl font-bold text-gray-900"},"Settings"),t("p",{class:"text-gray-600 mt-1"},"Manage your business profile and preferences")],-1)),k.value?(M(),Q(s(_),{key:0,severity:"success",class:"mb-6"},{default:h(()=>[te(N(k.value),1)]),_:1})):U("",!0),n(s(S),{class:"mb-6 cursor-pointer hover:shadow-md transition-shadow",onClick:e[0]||(e[0]=l=>s(c).push("/app/phone-forwarding"))},{content:h(()=>[...e[20]||(e[20]=[t("div",{class:"flex items-center justify-between"},[t("div",{class:"flex items-center gap-4"},[t("div",{class:"bg-violet-100 p-3 rounded-lg"},[t("i",{class:"pi pi-phone text-xl text-violet-600"})]),t("div",null,[t("h3",{class:"font-medium"},"Phone Forwarding Setup"),t("p",{class:"text-sm"},"View instructions to forward calls to your Criton.AI number")])]),t("i",{class:"pi pi-chevron-right text-gray-400"})],-1)])]),_:1}),n(s(oe),null,{default:h(()=>[n(s(B),{value:"0",header:"Business Profile"},{default:h(()=>[n(s(S),{class:"shadow-sm"},{content:h(()=>[t("div",fe,[t("div",we,[t("div",null,[e[21]||(e[21]=t("label",{class:"block text-sm font-medium mb-1"},"Business Name",-1)),n(s(V),{modelValue:o.value.name,"onUpdate:modelValue":e[1]||(e[1]=l=>o.value.name=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[22]||(e[22]=t("label",{class:"block text-sm font-medium mb-1"},"Email",-1)),n(s(V),{modelValue:o.value.email,"onUpdate:modelValue":e[2]||(e[2]=l=>o.value.email=l),type:"email",class:"w-full"},null,8,["modelValue"])])]),t("div",be,[t("div",null,[e[23]||(e[23]=t("label",{class:"block text-sm font-medium mb-1"},"Phone Number",-1)),n(s(V),{modelValue:o.value.phone,"onUpdate:modelValue":e[3]||(e[3]=l=>o.value.phone=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[24]||(e[24]=t("label",{class:"block text-sm font-medium mb-1"},"Website",-1)),n(s(V),{modelValue:o.value.website,"onUpdate:modelValue":e[4]||(e[4]=l=>o.value.website=l),class:"w-full",placeholder:"https://"},null,8,["modelValue"])])]),t("div",null,[e[25]||(e[25]=t("label",{class:"block text-sm font-medium mb-1"},"Street Address",-1)),n(s(V),{modelValue:o.value.address,"onUpdate:modelValue":e[5]||(e[5]=l=>o.value.address=l),class:"w-full"},null,8,["modelValue"])]),t("div",ye,[t("div",ke,[e[26]||(e[26]=t("label",{class:"block text-sm font-medium mb-1"},"City",-1)),n(s(V),{modelValue:o.value.city,"onUpdate:modelValue":e[6]||(e[6]=l=>o.value.city=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[27]||(e[27]=t("label",{class:"block text-sm font-medium mb-1"},"State",-1)),n(s(V),{modelValue:o.value.state,"onUpdate:modelValue":e[7]||(e[7]=l=>o.value.state=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[28]||(e[28]=t("label",{class:"block text-sm font-medium mb-1"},"ZIP Code",-1)),n(s(V),{modelValue:o.value.zipCode,"onUpdate:modelValue":e[8]||(e[8]=l=>o.value.zipCode=l),class:"w-full"},null,8,["modelValue"])])]),t("div",null,[e[29]||(e[29]=t("label",{class:"block text-sm font-medium mb-1"},"Business Description",-1)),n(s(z),{modelValue:o.value.description,"onUpdate:modelValue":e[9]||(e[9]=l=>o.value.description=l),rows:"3",class:"w-full"},null,8,["modelValue"])]),t("div",Ve,[n(s(T),{label:"Save Changes",icon:"pi pi-check",loading:u.value,onClick:H},null,8,["loading"])])])]),_:1})]),_:1}),n(s(B),{value:"1",header:"Business Hours"},{default:h(()=>[n(s(S),{class:"shadow-sm"},{content:h(()=>[t("div",xe,[(M(!0),P(le,null,se(C.value,(l,f)=>(M(),P("div",{key:f,class:"flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg"},[t("div",Me,N(f),1),t("div",Pe,[n(s(x),{modelValue:l.closed,"onUpdate:modelValue":g=>l.closed=g},null,8,["modelValue","onUpdate:modelValue"]),t("span",Se,N(l.closed?"Closed":"Open"),1)]),l.closed?U("",!0):(M(),P("div",Ce,[n(s(I),{modelValue:l.open,"onUpdate:modelValue":g=>l.open=g,options:$,placeholder:"Open",class:"w-32"},null,8,["modelValue","onUpdate:modelValue"]),e[30]||(e[30]=t("span",{class:"text-gray-500"},"to",-1)),n(s(I),{modelValue:l.close,"onUpdate:modelValue":g=>l.close=g,options:$,placeholder:"Close",class:"w-32"},null,8,["modelValue","onUpdate:modelValue"])]))]))),128)),t("div",Ae,[n(s(T),{label:"Save Hours",icon:"pi pi-check",loading:u.value,onClick:O},null,8,["loading"])])])]),_:1})]),_:1}),n(s(B),{value:"2",header:"AI Voice Settings"},{default:h(()=>[n(s(S),{class:"shadow-sm"},{content:h(()=>[t("div",Ue,[t("div",null,[e[31]||(e[31]=t("label",{class:"block text-sm font-medium mb-1"},"Voice Type",-1)),n(s(I),{modelValue:m.value.voiceId,"onUpdate:modelValue":e[10]||(e[10]=l=>m.value.voiceId=l),options:s(y).voices,optionLabel:"label",optionValue:"id",placeholder:"Select a voice",loading:s(y).loading,disabled:s(y).voices.length===0,class:"w-full"},null,8,["modelValue","options","loading","disabled"]),s(y).voices.length===0&&!s(y).loading?(M(),P("p",Te," No voices available. Please contact support. ")):U("",!0)]),t("div",null,[e[32]||(e[32]=t("label",{class:"block text-sm font-medium mb-1"},"Greeting Message",-1)),n(s(z),{modelValue:m.value.greeting,"onUpdate:modelValue":e[11]||(e[11]=l=>m.value.greeting=l),rows:"2",class:"w-full"},null,8,["modelValue"]),e[33]||(e[33]=t("p",{class:"text-sm mt-1"},"This message will be used to greet callers",-1))]),t("div",Ie,[n(s(T),{label:"Save AI Settings",icon:"pi pi-check",loading:u.value,onClick:R},null,8,["loading"])])])]),_:1})]),_:1}),n(s(B),{value:"3",header:"Notifications"},{default:h(()=>[n(s(S),{class:"shadow-sm"},{content:h(()=>[t("div",Be,[t("div",null,[t("div",Ne,[t("div",Fe,[e[34]||(e[34]=t("div",null,[t("p",{class:"text-sm"},"Receive email when a new appointment is booked")],-1)),n(s(x),{modelValue:v.value.emailNewAppointment,"onUpdate:modelValue":e[12]||(e[12]=l=>v.value.emailNewAppointment=l)},null,8,["modelValue"])]),t("div",je,[e[35]||(e[35]=t("div",null,[t("p",{class:"text-sm"},"Receive SMS when a new appointment is booked")],-1)),n(s(x),{modelValue:v.value.smsNewAppointment,"onUpdate:modelValue":e[13]||(e[13]=l=>v.value.smsNewAppointment=l)},null,8,["modelValue"])]),t("div",$e,[e[36]||(e[36]=t("div",null,[t("p",{class:"text-sm"},"Receive email when an appointment is cancelled")],-1)),n(s(x),{modelValue:v.value.emailCancellation,"onUpdate:modelValue":e[14]||(e[14]=l=>v.value.emailCancellation=l)},null,8,["modelValue"])]),t("div",ze,[e[37]||(e[37]=t("div",null,[t("p",{class:"text-sm"},"Receive SMS when an appointment is cancelled")],-1)),n(s(x),{modelValue:v.value.smsCancellation,"onUpdate:modelValue":e[15]||(e[15]=l=>v.value.smsCancellation=l)},null,8,["modelValue"])]),t("div",Ee,[e[38]||(e[38]=t("div",null,[t("p",{class:"text-sm"},"Receive a daily summary email of activity")],-1)),n(s(x),{modelValue:v.value.emailDailyDigest,"onUpdate:modelValue":e[16]||(e[16]=l=>v.value.emailDailyDigest=l)},null,8,["modelValue"])])])]),t("div",He,[e[42]||(e[42]=t("h3",{class:"font-medium text-gray-900 mb-4"},"Automated Actions",-1)),t("div",Oe,[t("div",Re,[e[39]||(e[39]=t("div",null,[t("p",{class:"text-sm"},"Send SMS reminders to customers")],-1)),n(s(x),{modelValue:v.value.smsReminder,"onUpdate:modelValue":e[17]||(e[17]=l=>v.value.smsReminder=l)},null,8,["modelValue"])]),m.value.appointmentReminders?(M(),P("div",De,[e[40]||(e[40]=t("label",{class:"block text-sm font-medium mb-1"},"Remind customers (hours before)",-1)),n(s(I),{modelValue:m.value.reminderHours,"onUpdate:modelValue":e[18]||(e[18]=l=>m.value.reminderHours=l),options:[12,24,48],class:"w-32"},null,8,["modelValue"])])):U("",!0),t("div",Le,[e[41]||(e[41]=t("div",null,[t("p",{class:"text-sm"},"Text customers after appointments for feedback")],-1)),n(s(x),{modelValue:m.value.followUpText,"onUpdate:modelValue":e[19]||(e[19]=l=>m.value.followUpText=l)},null,8,["modelValue"])])])]),t("div",Ze,[n(s(T),{label:"Save Preferences",icon:"pi pi-check",loading:u.value,onClick:D},null,8,["loading"])])])]),_:1})]),_:1})]),_:1})]))}});export{tt as default};
