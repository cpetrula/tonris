import{B as L,aX as Z,J as q,c as M,o as x,a as t,C as A,K as G,aY as J,i as b,z as K,d as W,aZ as X,j as Y,k as Q,l as U,e as i,w as v,u as s,m as _,x as ee,s as S,f as te,t as N,q as V,g as T,F as le,r as se}from"./index-OAgnJz2Z.js";import{s as j}from"./index-BbqjO53g.js";import{s as B}from"./index-BBXLiBAN.js";import{s as oe,a as I}from"./index-B8m6ZEnv.js";import{u as ae}from"./tenant-p5Mzmxzd.js";import"./index-BY0Ksr2I.js";import"./index-BOH1zEfq.js";import"./index-D4JPLNB2.js";import"./index-COm1vJwf.js";var ne=`
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
`,ie={root:{position:"relative"}},de={root:function(n){var g=n.instance,p=n.props;return["p-toggleswitch p-component",{"p-toggleswitch-checked":g.checked,"p-disabled":p.disabled,"p-invalid":g.$invalid}]},input:"p-toggleswitch-input",slider:"p-toggleswitch-slider",handle:"p-toggleswitch-handle"},re=L.extend({name:"toggleswitch",style:ne,classes:de,inlineStyles:ie}),ue={name:"BaseToggleSwitch",extends:Z,props:{trueValue:{type:null,default:!0},falseValue:{type:null,default:!1},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},inputId:{type:String,default:null},inputClass:{type:[String,Object],default:null},inputStyle:{type:Object,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:re,provide:function(){return{$pcToggleSwitch:this,$parentInstance:this}}},z={name:"ToggleSwitch",extends:ue,inheritAttrs:!1,emits:["change","focus","blur"],methods:{getPTOptions:function(n){var g=n==="root"?this.ptmi:this.ptm;return g(n,{context:{checked:this.checked,disabled:this.disabled}})},onChange:function(n){if(!this.disabled&&!this.readonly){var g=this.checked?this.falseValue:this.trueValue;this.writeValue(g,n),this.$emit("change",n)}},onFocus:function(n){this.$emit("focus",n)},onBlur:function(n){var g,p;this.$emit("blur",n),(g=(p=this.formField).onBlur)===null||g===void 0||g.call(p,n)}},computed:{checked:function(){return this.d_value===this.trueValue},dataP:function(){return q({checked:this.checked,disabled:this.disabled,invalid:this.$invalid})}}},ce=["data-p-checked","data-p-disabled","data-p"],ge=["id","checked","tabindex","disabled","readonly","aria-checked","aria-labelledby","aria-label","aria-invalid"],pe=["data-p"],me=["data-p"];function he(d,n,g,p,w,r){return x(),M("div",A({class:d.cx("root"),style:d.sx("root")},r.getPTOptions("root"),{"data-p-checked":r.checked,"data-p-disabled":d.disabled,"data-p":r.dataP}),[t("input",A({id:d.inputId,type:"checkbox",role:"switch",class:[d.cx("input"),d.inputClass],style:d.inputStyle,checked:r.checked,tabindex:d.tabindex,disabled:d.disabled,readonly:d.readonly,"aria-checked":r.checked,"aria-labelledby":d.ariaLabelledby,"aria-label":d.ariaLabel,"aria-invalid":d.invalid||void 0,onFocus:n[0]||(n[0]=function(){return r.onFocus&&r.onFocus.apply(r,arguments)}),onBlur:n[1]||(n[1]=function(){return r.onBlur&&r.onBlur.apply(r,arguments)}),onChange:n[2]||(n[2]=function(){return r.onChange&&r.onChange.apply(r,arguments)})},r.getPTOptions("input")),null,16,ge),t("div",A({class:d.cx("slider")},r.getPTOptions("slider"),{"data-p":r.dataP}),[t("div",A({class:d.cx("handle")},r.getPTOptions("handle"),{"data-p":r.dataP}),[G(d.$slots,"handle",{checked:r.checked})],16,me)],16,pe)],16,ce)}z.render=he;var P={name:"InputSwitch",extends:z,mounted:function(){console.warn("Deprecated since v4. Use ToggleSwitch component instead.")}};const ve=J("voice",()=>{const d=b([]),n=b(!1),g=b(null);function p(u,k){return u&&typeof u=="object"&&"response"in u&&u.response?.data?.message||k}async function w(){n.value=!0,g.value=null;try{const k=(await K.get("/api/voices")).data?.data?.voices;if(!k)throw new Error("Invalid response structure");d.value=k}catch(u){g.value=p(u,"Failed to fetch voices")}finally{n.value=!1}}function r(){g.value=null}return{voices:d,loading:n,error:g,fetchVoices:w,clearError:r}}),fe={class:"space-y-6"},be={class:"grid grid-cols-1 md:grid-cols-2 gap-4"},we={class:"grid grid-cols-1 md:grid-cols-2 gap-4"},ye={class:"grid grid-cols-2 md:grid-cols-4 gap-4"},ke={class:"col-span-2"},Ve={class:"flex justify-end"},xe={class:"space-y-4"},Me={class:"w-24 font-medium text-gray-900 capitalize"},Pe={class:"flex items-center gap-2"},Se={class:"text-sm text-gray-600"},Ce={key:0,class:"flex items-center gap-2 flex-1"},Ae={class:"flex justify-end pt-4"},Ue={class:"space-y-6"},Te={key:0,class:"text-sm text-red-500 mt-1"},Be={class:"flex justify-end pt-4"},Ie={class:"space-y-6"},Ne={class:"space-y-4"},Ee={class:"flex items-center justify-between"},Fe={class:"flex items-center justify-between"},$e={class:"flex items-center justify-between"},je={class:"border-t border-gray-200 pt-6"},ze={class:"space-y-4"},He={class:"flex items-center justify-between"},Re={key:0,class:"ml-4 pl-4 border-l-2 border-gray-200"},De={class:"flex items-center justify-between opacity-50"},Oe={class:"flex justify-end pt-4"},_e=W({__name:"SettingsPage",setup(d){const n=X(),g=ee(),p=ae(),w=ve(),r=b(!1),u=b(!1),k=b(""),o=b({name:"",email:"",phone:"",address:"",city:"",state:"",zipCode:"",website:"",description:""}),C=b({monday:{open:"9:00 AM",close:"6:00 PM",closed:!1},tuesday:{open:"9:00 AM",close:"6:00 PM",closed:!1},wednesday:{open:"9:00 AM",close:"6:00 PM",closed:!1},thursday:{open:"9:00 AM",close:"6:00 PM",closed:!1},friday:{open:"9:00 AM",close:"6:00 PM",closed:!1},saturday:{open:"10:00 AM",close:"4:00 PM",closed:!1},sunday:{open:"",close:"",closed:!0}});function E(a){if(!a)return"";const e=a.split(":");if(e.length<2||!e[0]||!e[1])return console.warn("Invalid time format:",a),"";const l=e[0],y=e[1],c=parseInt(l,10);if(isNaN(c)||c<0||c>23)return console.warn("Invalid hour value:",l),"";const f=c>=12?"PM":"AM";return`${c%12||12}:${y} ${f}`}function F(a){if(!a)return"";const e=a.match(/^(\d+):(\d+)\s*(AM|PM)$/i);if(!e)return console.warn("Invalid 12h time format:",a),"";const l=e[1],y=e[2],c=e[3]?.toUpperCase();if(!l||!c)return"";let f=parseInt(l,10);return isNaN(f)||f<1||f>12?(console.warn("Invalid hour value:",l),""):(c==="PM"&&f!==12&&(f+=12),c==="AM"&&f===12&&(f=0),`${f.toString().padStart(2,"0")}:${y}`)}const h=b({voiceId:"",greeting:"Thank you for calling Sample Salon. How can I help you today?",appointmentReminders:!0,reminderHours:24,followUpCalls:!0,followUpText:!0}),m=b({emailNewAppointment:!0,emailCancellation:!0,emailDailyDigest:!0,smsReminderEnabled:!0,smsReminderHours:24}),$=["6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM","10:00 PM"];async function H(){u.value=!0;try{const a={name:o.value.name,contactEmail:o.value.email,contactPhone:o.value.phone,address:{street:o.value.address,city:o.value.city,state:o.value.state,zip:o.value.zipCode,zipCode:o.value.zipCode},metadata:{website:o.value.website,description:o.value.description}};await p.updateTenant(a),n.add({severity:"success",summary:"Success",detail:"Business profile saved",life:3e3})}catch(a){console.error("Failed to save business profile:",a),n.add({severity:"error",summary:"Error",detail:"Failed to save profile",life:3e3})}finally{u.value=!1}}async function R(){u.value=!0;try{const a={};for(const[e,l]of Object.entries(C.value))a[e]={open:F(l.open),close:F(l.close),enabled:!l.closed};await p.updateBusinessHours(a),n.add({severity:"success",summary:"Success",detail:"Business hours saved",life:3e3})}catch(a){console.error("Failed to save business hours:",a),n.add({severity:"error",summary:"Error",detail:"Failed to save hours",life:3e3})}finally{u.value=!1}}async function D(){u.value=!0;try{await p.updateTenant({firstMessage:h.value.greeting}),await p.updateTenant({voiceId:h.value.voiceId}),n.add({severity:"success",summary:"Success",detail:"AI settings saved",life:3e3})}catch{n.add({severity:"error",summary:"Error",detail:"Failed to save settings",life:3e3})}finally{u.value=!1}}async function O(){u.value=!0;try{await p.updateNotificationSettings(m.value),n.add({severity:"success",summary:"Success",detail:"Notification preferences saved",life:3e3})}catch{n.add({severity:"error",summary:"Error",detail:"Failed to save preferences",life:3e3})}finally{u.value=!1}}return Y(async()=>{r.value=!0;try{await p.fetchTenants();const a=p.currentTenant;a&&(o.value.name=a.name||"",o.value.email=a.contactEmail||"",o.value.phone=a.contactPhone||"",o.value.address=a.address?.street||"",o.value.city=a.address?.city||"",o.value.state=a.address?.state||"",o.value.zipCode=a.address?.zipCode||a.address?.zip||"",o.value.website=a.metadata?.website||"",o.value.description=a.metadata?.description||"",a.firstMessage?h.value.greeting=a.firstMessage:a.name&&(h.value.greeting=`Hi, thanks for calling ${a.name}! How can I help you today?`),h.value.voiceId=a.voiceId||"");const e=await p.fetchBusinessHours();if(e)for(const[y,c]of Object.entries(e))C.value[y]&&(C.value[y]={open:E(c.open),close:E(c.close),closed:!c.enabled});await w.fetchVoices();const l=await p.fetchNotificationSettings();l&&(m.value={emailNewAppointment:l.emailNewAppointment??!0,emailCancellation:l.emailCancellation??!0,emailDailyDigest:l.emailDailyDigest??!0,smsReminderEnabled:l.smsReminderEnabled??!0,smsReminderHours:l.smsReminderHours??24})}catch(a){console.error("Failed to load settings:",a),n.add({severity:"error",summary:"Error",detail:"Failed to load settings",life:3e3})}finally{r.value=!1}}),(a,e)=>(x(),M("div",null,[e[40]||(e[40]=t("div",{class:"mb-6"},[t("h1",{class:"text-2xl font-bold text-gray-900"},"Settings"),t("p",{class:"text-gray-600 mt-1"},"Manage your business profile and preferences")],-1)),k.value?(x(),Q(s(_),{key:0,severity:"success",class:"mb-6"},{default:v(()=>[te(N(k.value),1)]),_:1})):U("",!0),i(s(S),{class:"mb-6 cursor-pointer hover:shadow-md transition-shadow",onClick:e[0]||(e[0]=l=>s(g).push("/app/phone-forwarding"))},{content:v(()=>[...e[18]||(e[18]=[t("div",{class:"flex items-center justify-between"},[t("div",{class:"flex items-center gap-4"},[t("div",{class:"bg-violet-100 p-3 rounded-lg"},[t("i",{class:"pi pi-phone text-xl text-violet-600"})]),t("div",null,[t("h3",{class:"font-medium"},"Phone Forwarding Setup"),t("p",{class:"text-sm"},"View instructions to forward calls to your Criton.AI number")])]),t("i",{class:"pi pi-chevron-right text-gray-400"})],-1)])]),_:1}),i(s(oe),null,{default:v(()=>[i(s(I),{value:"0",header:"Business Profile"},{default:v(()=>[i(s(S),{class:"shadow-sm"},{content:v(()=>[t("div",fe,[t("div",be,[t("div",null,[e[19]||(e[19]=t("label",{class:"block text-sm font-medium mb-1"},"Business Name",-1)),i(s(V),{modelValue:o.value.name,"onUpdate:modelValue":e[1]||(e[1]=l=>o.value.name=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[20]||(e[20]=t("label",{class:"block text-sm font-medium mb-1"},"Email",-1)),i(s(V),{modelValue:o.value.email,"onUpdate:modelValue":e[2]||(e[2]=l=>o.value.email=l),type:"email",class:"w-full"},null,8,["modelValue"])])]),t("div",we,[t("div",null,[e[21]||(e[21]=t("label",{class:"block text-sm font-medium mb-1"},"Phone Number",-1)),i(s(V),{modelValue:o.value.phone,"onUpdate:modelValue":e[3]||(e[3]=l=>o.value.phone=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[22]||(e[22]=t("label",{class:"block text-sm font-medium mb-1"},"Website",-1)),i(s(V),{modelValue:o.value.website,"onUpdate:modelValue":e[4]||(e[4]=l=>o.value.website=l),class:"w-full",placeholder:"https://"},null,8,["modelValue"])])]),t("div",null,[e[23]||(e[23]=t("label",{class:"block text-sm font-medium mb-1"},"Street Address",-1)),i(s(V),{modelValue:o.value.address,"onUpdate:modelValue":e[5]||(e[5]=l=>o.value.address=l),class:"w-full"},null,8,["modelValue"])]),t("div",ye,[t("div",ke,[e[24]||(e[24]=t("label",{class:"block text-sm font-medium mb-1"},"City",-1)),i(s(V),{modelValue:o.value.city,"onUpdate:modelValue":e[6]||(e[6]=l=>o.value.city=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[25]||(e[25]=t("label",{class:"block text-sm font-medium mb-1"},"State",-1)),i(s(V),{modelValue:o.value.state,"onUpdate:modelValue":e[7]||(e[7]=l=>o.value.state=l),class:"w-full"},null,8,["modelValue"])]),t("div",null,[e[26]||(e[26]=t("label",{class:"block text-sm font-medium mb-1"},"ZIP Code",-1)),i(s(V),{modelValue:o.value.zipCode,"onUpdate:modelValue":e[8]||(e[8]=l=>o.value.zipCode=l),class:"w-full"},null,8,["modelValue"])])]),t("div",null,[e[27]||(e[27]=t("label",{class:"block text-sm font-medium mb-1"},"Business Description",-1)),i(s(j),{modelValue:o.value.description,"onUpdate:modelValue":e[9]||(e[9]=l=>o.value.description=l),rows:"3",class:"w-full"},null,8,["modelValue"])]),t("div",Ve,[i(s(T),{label:"Save Changes",icon:"pi pi-check",loading:u.value,onClick:H},null,8,["loading"])])])]),_:1})]),_:1}),i(s(I),{value:"1",header:"Business Hours"},{default:v(()=>[i(s(S),{class:"shadow-sm"},{content:v(()=>[t("div",xe,[(x(!0),M(le,null,se(C.value,(l,y)=>(x(),M("div",{key:y,class:"flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg"},[t("div",Me,N(y),1),t("div",Pe,[i(s(P),{modelValue:l.closed,"onUpdate:modelValue":c=>l.closed=c},null,8,["modelValue","onUpdate:modelValue"]),t("span",Se,N(l.closed?"Closed":"Open"),1)]),l.closed?U("",!0):(x(),M("div",Ce,[i(s(B),{modelValue:l.open,"onUpdate:modelValue":c=>l.open=c,options:$,placeholder:"Open",class:"w-32"},null,8,["modelValue","onUpdate:modelValue"]),e[28]||(e[28]=t("span",{class:"text-gray-500"},"to",-1)),i(s(B),{modelValue:l.close,"onUpdate:modelValue":c=>l.close=c,options:$,placeholder:"Close",class:"w-32"},null,8,["modelValue","onUpdate:modelValue"])]))]))),128)),t("div",Ae,[i(s(T),{label:"Save Hours",icon:"pi pi-check",loading:u.value,onClick:R},null,8,["loading"])])])]),_:1})]),_:1}),i(s(I),{value:"2",header:"AI Voice Settings"},{default:v(()=>[i(s(S),{class:"shadow-sm"},{content:v(()=>[t("div",Ue,[t("div",null,[e[29]||(e[29]=t("label",{class:"block text-sm font-medium mb-1"},"Voice Type",-1)),i(s(B),{modelValue:h.value.voiceId,"onUpdate:modelValue":e[10]||(e[10]=l=>h.value.voiceId=l),options:s(w).voices,optionLabel:"label",optionValue:"id",placeholder:"Select a voice",loading:s(w).loading,disabled:s(w).voices.length===0,class:"w-full"},null,8,["modelValue","options","loading","disabled"]),s(w).voices.length===0&&!s(w).loading?(x(),M("p",Te," No voices available. Please contact support. ")):U("",!0)]),t("div",null,[e[30]||(e[30]=t("label",{class:"block text-sm font-medium mb-1"},"Greeting Message",-1)),i(s(j),{modelValue:h.value.greeting,"onUpdate:modelValue":e[11]||(e[11]=l=>h.value.greeting=l),rows:"2",class:"w-full"},null,8,["modelValue"]),e[31]||(e[31]=t("p",{class:"text-sm mt-1"},"This message will be used to greet callers",-1))]),t("div",Be,[i(s(T),{label:"Save AI Settings",icon:"pi pi-check",loading:u.value,onClick:D},null,8,["loading"])])])]),_:1})]),_:1}),i(s(I),{value:"3",header:"Notifications"},{default:v(()=>[i(s(S),{class:"shadow-sm"},{content:v(()=>[t("div",Ie,[t("div",null,[e[35]||(e[35]=t("h3",{class:"font-medium text-gray-900 mb-4"},"Email Notifications (Business Owner)",-1)),t("div",Ne,[t("div",Ee,[e[32]||(e[32]=t("div",null,[t("p",{class:"text-sm"},"Receive email when a new appointment is booked")],-1)),i(s(P),{modelValue:m.value.emailNewAppointment,"onUpdate:modelValue":e[12]||(e[12]=l=>m.value.emailNewAppointment=l)},null,8,["modelValue"])]),t("div",Fe,[e[33]||(e[33]=t("div",null,[t("p",{class:"text-sm"},"Receive email when an appointment is cancelled")],-1)),i(s(P),{modelValue:m.value.emailCancellation,"onUpdate:modelValue":e[13]||(e[13]=l=>m.value.emailCancellation=l)},null,8,["modelValue"])]),t("div",$e,[e[34]||(e[34]=t("div",null,[t("p",{class:"text-sm"},"Receive a daily summary email of activity")],-1)),i(s(P),{modelValue:m.value.emailDailyDigest,"onUpdate:modelValue":e[14]||(e[14]=l=>m.value.emailDailyDigest=l)},null,8,["modelValue"])])])]),t("div",je,[e[39]||(e[39]=t("h3",{class:"font-medium text-gray-900 mb-4"},"Customer Notifications",-1)),t("div",ze,[t("div",He,[e[36]||(e[36]=t("div",null,[t("p",{class:"text-sm"},"Send SMS reminders to customers before appointments")],-1)),i(s(P),{modelValue:m.value.smsReminderEnabled,"onUpdate:modelValue":e[15]||(e[15]=l=>m.value.smsReminderEnabled=l)},null,8,["modelValue"])]),m.value.smsReminderEnabled?(x(),M("div",Re,[e[37]||(e[37]=t("label",{class:"block text-sm font-medium mb-1"},"Remind customers (hours before)",-1)),i(s(B),{modelValue:m.value.smsReminderHours,"onUpdate:modelValue":e[16]||(e[16]=l=>m.value.smsReminderHours=l),options:[12,24,48],class:"w-32"},null,8,["modelValue"])])):U("",!0),t("div",De,[e[38]||(e[38]=t("div",null,[t("p",{class:"text-sm"},"Text customers after appointments for feedback"),t("p",{class:"text-xs text-gray-500"},"Coming soon")],-1)),i(s(P),{modelValue:h.value.followUpText,"onUpdate:modelValue":e[17]||(e[17]=l=>h.value.followUpText=l),disabled:""},null,8,["modelValue"])])])]),t("div",Oe,[i(s(T),{label:"Save Preferences",icon:"pi pi-check",loading:u.value,onClick:O},null,8,["loading"])])])]),_:1})]),_:1})]),_:1})]))}});export{_e as default};
