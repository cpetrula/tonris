import{B as ne,K as se,T as re,c as p,j as c,m as y,D as E,O as ae,i as v,t as l,d as ie,r as m,G as C,o as le,a as e,l as V,g as b,u as h,p as D,f as x,H as A,A as U,F as oe,e as ue,n as M,s as G,_ as de}from"./index-CM7jnkne.js";var z="clover",ce=function(a){return a===3?"v3":a},O="https://js.stripe.com",pe="".concat(O,"/").concat(z,"/stripe.js"),ve=/^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/,ge=/^https:\/\/js\.stripe\.com\/(v3|[a-z]+)\/stripe\.js(\?.*)?$/;var me=function(a){return ve.test(a)||ge.test(a)},fe=function(){for(var a=document.querySelectorAll('script[src^="'.concat(O,'"]')),s=0;s<a.length;s++){var n=a[s];if(me(n.src))return n}return null},Y=function(a){var s="",n=document.createElement("script");n.src="".concat(pe).concat(s);var o=document.head||document.body;if(!o)throw new Error("Expected document.body not to be null. Stripe.js requires a <body> element.");return o.appendChild(n),n},be=function(a,s){!a||!a._registerWrapper||a._registerWrapper({name:"stripe-js",version:"8.6.0",startTime:s})},w=null,j=null,F=null,he=function(a){return function(s){a(new Error("Failed to load Stripe.js",{cause:s}))}},ye=function(a,s){return function(){window.Stripe?a(window.Stripe):s(new Error("Stripe.js not available"))}},xe=function(a){return w!==null?w:(w=new Promise(function(s,n){if(typeof window>"u"||typeof document>"u"){s(null);return}if(window.Stripe){s(window.Stripe);return}try{var o=fe();if(!(o&&a)){if(!o)o=Y(a);else if(o&&F!==null&&j!==null){var d;o.removeEventListener("load",F),o.removeEventListener("error",j),(d=o.parentNode)===null||d===void 0||d.removeChild(o),o=Y(a)}}F=ye(s,n),j=he(n),o.addEventListener("load",F),o.addEventListener("error",j)}catch(f){n(f);return}}),w.catch(function(s){return w=null,Promise.reject(s)}))},we=function(a,s,n){if(a===null)return null;var o=s[0],d=o.match(/^pk_test/),f=ce(a.version),g=z;d&&f!==g&&console.warn("Stripe.js@".concat(f," was loaded on the page, but @stripe/stripe-js@").concat("8.6.0"," expected Stripe.js@").concat(g,". This may result in unexpected behavior. For more information, see https://docs.stripe.com/sdks/stripejs-versioning"));var _=a.apply(void 0,s);return be(_,n),_},S,q=!1,J=function(){return S||(S=xe(null).catch(function(a){return S=null,Promise.reject(a)}),S)};Promise.resolve().then(function(){return J()}).catch(function(i){q||console.warn(i)});var Se=function(){for(var a=arguments.length,s=new Array(a),n=0;n<a;n++)s[n]=arguments[n];q=!0;var o=Date.now();return J().then(function(d){return we(d,s,o)})},_e=`
    .p-progressbar {
        display: block;
        position: relative;
        overflow: hidden;
        height: dt('progressbar.height');
        background: dt('progressbar.background');
        border-radius: dt('progressbar.border.radius');
    }

    .p-progressbar-value {
        margin: 0;
        background: dt('progressbar.value.background');
    }

    .p-progressbar-label {
        color: dt('progressbar.label.color');
        font-size: dt('progressbar.label.font.size');
        font-weight: dt('progressbar.label.font.weight');
    }

    .p-progressbar-determinate .p-progressbar-value {
        height: 100%;
        width: 0%;
        position: absolute;
        display: none;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: width 1s ease-in-out;
    }

    .p-progressbar-determinate .p-progressbar-label {
        display: inline-flex;
    }

    .p-progressbar-indeterminate .p-progressbar-value::before {
        content: '';
        position: absolute;
        background: inherit;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-block-end: 0;
        will-change: inset-inline-start, inset-inline-end;
        animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    }

    .p-progressbar-indeterminate .p-progressbar-value::after {
        content: '';
        position: absolute;
        background: inherit;
        inset-block-start: 0;
        inset-inline-start: 0;
        inset-block-end: 0;
        will-change: inset-inline-start, inset-inline-end;
        animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
        animation-delay: 1.15s;
    }

    @keyframes p-progressbar-indeterminate-anim {
        0% {
            inset-inline-start: -35%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
        100% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
    }
    @-webkit-keyframes p-progressbar-indeterminate-anim {
        0% {
            inset-inline-start: -35%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
        100% {
            inset-inline-start: 100%;
            inset-inline-end: -90%;
        }
    }

    @keyframes p-progressbar-indeterminate-anim-short {
        0% {
            inset-inline-start: -200%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
        100% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
    }
    @-webkit-keyframes p-progressbar-indeterminate-anim-short {
        0% {
            inset-inline-start: -200%;
            inset-inline-end: 100%;
        }
        60% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
        100% {
            inset-inline-start: 107%;
            inset-inline-end: -8%;
        }
    }
`,ke={root:function(a){var s=a.instance;return["p-progressbar p-component",{"p-progressbar-determinate":s.determinate,"p-progressbar-indeterminate":s.indeterminate}]},value:"p-progressbar-value",label:"p-progressbar-label"},Pe=ne.extend({name:"progressbar",style:_e,classes:ke}),Ee={name:"BaseProgressBar",extends:se,props:{value:{type:Number,default:null},mode:{type:String,default:"determinate"},showValue:{type:Boolean,default:!0}},style:Pe,provide:function(){return{$pcProgressBar:this,$parentInstance:this}}},W={name:"ProgressBar",extends:Ee,inheritAttrs:!1,computed:{progressStyle:function(){return{width:this.value+"%",display:"flex"}},indeterminate:function(){return this.mode==="indeterminate"},determinate:function(){return this.mode==="determinate"},dataP:function(){return re({determinate:this.determinate,indeterminate:this.indeterminate})}}},Ce=["aria-valuenow","data-p"],Ue=["data-p"],Me=["data-p"],je=["data-p"];function Fe(i,a,s,n,o,d){return c(),p("div",E({role:"progressbar",class:i.cx("root"),"aria-valuemin":"0","aria-valuenow":i.value,"aria-valuemax":"100","data-p":d.dataP},i.ptmi("root")),[d.determinate?(c(),p("div",E({key:0,class:i.cx("value"),style:d.progressStyle,"data-p":d.dataP},i.ptm("value")),[i.value!=null&&i.value!==0&&i.showValue?(c(),p("div",E({key:0,class:i.cx("label"),"data-p":d.dataP},i.ptm("label")),[ae(i.$slots,"default",{},function(){return[v(l(i.value+"%"),1)]})],16,Me)):y("",!0)],16,Ue)):d.indeterminate?(c(),p("div",E({key:1,class:i.cx("value"),"data-p":d.dataP},i.ptm("value")),null,16,je)):y("",!0)],16,Ce)}W.render=Fe;const Le={key:1,class:"text-center py-12"},Ie={key:2},Te={class:"text-center mb-8"},Ae={class:"text-xl font-bold text-gray-900 mb-2"},Re={class:"text-gray-600"},Be={class:"grid md:grid-cols-3 gap-6"},$e={key:0,class:"absolute -top-3 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white text-xs px-3 py-1 rounded-full"},Ne={class:"text-xl font-bold text-gray-900 mb-1"},Ve={class:"mb-4"},De={class:"text-3xl font-bold text-gray-900"},Ge={class:"space-y-2 mb-6 text-sm"},Ye={class:"flex items-center text-gray-600"},ze={class:"flex items-center text-gray-600"},Oe={class:"flex items-center text-gray-600"},qe={class:"text-center text-sm text-gray-500 mt-6"},Je={key:3,class:"space-y-6"},We={class:"flex items-center justify-between"},Ke={key:0,class:"mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"},Xe={class:"flex items-start"},He={class:"text-sm text-blue-700"},Qe={key:1,class:"mb-6"},Ze={class:"flex justify-between mb-2"},et={class:"font-medium"},tt={class:"text-gray-500"},nt={class:"flex justify-between mt-2 text-sm"},st={class:"text-gray-500"},rt={key:0,class:"text-orange-600"},at={key:2,class:"mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"},it={class:"flex items-center"},lt={class:"text-sm text-green-700"},ot={class:"grid grid-cols-2 gap-4 text-sm"},ut={class:"font-medium"},dt={class:"text-right"},ct={class:"font-medium"},pt={class:"grid md:grid-cols-2 gap-6"},vt={class:"font-medium text-gray-900 mb-3"},gt={class:"space-y-2 text-sm text-gray-600"},mt={class:"flex items-center"},ft={class:"text-right"},bt={key:0,class:"mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left"},ht={class:"text-sm text-yellow-700"},yt=ie({__name:"BillingPage",setup(i){const a=m(!1),s=m(""),n=m(null),o=m([]),d=m(15),f=m(100),g=m(!1),_=m(null),R=m(!1),K=C(()=>n.value?.status==="trialing"),L=C(()=>n.value?.isInactive||!1),X=C(()=>{if(!n.value)return"No subscription";const r=n.value.status;return{trialing:"Free Trial",active:"Active",past_due:"Past Due",canceled:"Cancelled",unpaid:"Unpaid",incomplete:"Incomplete",incomplete_expired:"Expired",inactive:"Inactive"}[r]||r}),H=C(()=>{if(!n.value||n.value.hasUnlimitedMinutes)return"bg-green-500";const r=n.value.usagePercentage;return r>=100?"bg-red-500":r>=80?"bg-yellow-500":"bg-green-500"});function k(r){return r?new Date(r).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"N/A"}function Q(r){return{trialing:"bg-blue-100 text-blue-700",active:"bg-green-100 text-green-700",past_due:"bg-yellow-100 text-yellow-700",canceled:"bg-red-100 text-red-700",unpaid:"bg-red-100 text-red-700",incomplete:"bg-yellow-100 text-yellow-700",incomplete_expired:"bg-red-100 text-red-700",inactive:"bg-gray-100 text-gray-700"}[r]||"bg-gray-100 text-gray-700"}async function B(){try{a.value=!0,s.value="";const r=await U.get("/api/billing/subscription");r.data.success&&(n.value=r.data.data.subscription,o.value=r.data.data.plans||[],d.value=r.data.data.trialDays||15,f.value=r.data.data.trialMinutes||100)}catch(r){if(console.error("Failed to fetch subscription:",r),r&&typeof r=="object"&&"response"in r){const t=r;s.value=t.response?.data?.error||"Failed to load subscription information"}else s.value="Failed to load subscription information"}finally{a.value=!1}}async function $(){try{R.value=!0;const r=await U.get("/api/billing/usage");r.data.success&&(_.value=r.data.data)}catch(r){console.error("Failed to fetch usage:",r)}finally{R.value=!1}}async function Z(){try{g.value=!0,s.value="";const r=window.location.href,t=await U.post("/api/billing/portal-session",{returnUrl:r});t.data.success&&t.data.data.url&&(window.location.href=t.data.data.url)}catch(r){if(console.error("Failed to open portal:",r),r&&typeof r=="object"&&"response"in r){const t=r;s.value=t.response?.data?.error||"Failed to open billing portal"}else s.value="Failed to open billing portal";g.value=!1}}async function ee(r="professional",t="month"){try{g.value=!0,s.value="";const u=void 0;if(!u){s.value="Stripe is not configured. Please contact support.",g.value=!1;return}const P=`${window.location.origin}/app/billing?success=true`,te=`${window.location.origin}/app/billing?cancelled=true`,I=await U.post("/api/billing/create-checkout-session",{planTier:r,billingInterval:t,successUrl:P,cancelUrl:te});if(I.data.success&&I.data.data.sessionId){const N=await Se(u);if(!N){s.value="Failed to load Stripe. Please refresh and try again.",g.value=!1;return}const T=await N.redirectToCheckout({sessionId:I.data.data.sessionId});T&&T.error&&(s.value=T.error.message||"Failed to redirect to checkout",g.value=!1)}}catch(u){if(console.error("Failed to start checkout:",u),u&&typeof u=="object"&&"response"in u){const P=u;s.value=P.response?.data?.error||"Failed to start checkout"}else s.value="Failed to start checkout";g.value=!1}}return le(async()=>{await B(),n.value?.isActive&&await $();const r=new URLSearchParams(window.location.search);r.get("success")==="true"?(await B(),await $()):r.get("cancelled")==="true"&&(s.value="Checkout was cancelled"),(r.has("success")||r.has("cancelled"))&&window.history.replaceState({},"",window.location.pathname)}),(r,t)=>(c(),p("div",null,[t[22]||(t[22]=e("div",{class:"mb-6"},[e("h1",{class:"text-2xl font-bold text-gray-900"},"Billing & Subscription"),e("p",{class:"text-gray-600 mt-1"},"Manage your subscription plan and track usage")],-1)),s.value?(c(),V(h(D),{key:0,severity:"error",class:"mb-6"},{default:b(()=>[v(l(s.value),1)]),_:1})):y("",!0),a.value?(c(),p("div",Le,[...t[0]||(t[0]=[e("i",{class:"pi pi-spin pi-spinner text-4xl text-violet-600"},null,-1),e("p",{class:"text-gray-600 mt-4"},"Loading subscription information...",-1)])])):!n.value||L.value?(c(),p("div",Ie,[x(h(A),{class:"shadow-sm mb-6"},{title:b(()=>[...t[1]||(t[1]=[v("Choose Your Plan",-1)])]),content:b(()=>[e("div",Te,[e("h3",Ae,l(L.value?"Your trial has ended":"Start your subscription"),1),e("p",Re,l(L.value?"Subscribe now to continue using CRITON.AI.":"Choose the plan that fits your business needs."),1)]),e("div",Be,[(c(!0),p(oe,null,ue(o.value,u=>(c(),p("div",{key:u.id,class:M(["border-2 rounded-xl p-6 relative transition-all hover:shadow-lg",u.popular?"border-violet-500":"border-gray-200"])},[u.popular?(c(),p("div",$e," Most Popular ")):y("",!0),e("h3",Ne,l(u.name),1),e("div",Ve,[e("span",De,l(u.monthlyPriceFormatted),1),t[2]||(t[2]=e("span",{class:"text-gray-500"},"/month",-1))]),e("ul",Ge,[e("li",Ye,[t[3]||(t[3]=e("i",{class:"pi pi-check text-green-500 mr-2"},null,-1)),v(" "+l(u.includedMinutesFormatted)+" minutes included ",1)]),e("li",ze,[t[4]||(t[4]=e("i",{class:"pi pi-check text-green-500 mr-2"},null,-1)),v(" "+l(u.overageRateFormatted)+"/min overage ",1)]),e("li",Oe,[t[5]||(t[5]=e("i",{class:"pi pi-check text-green-500 mr-2"},null,-1)),v(" "+l(u.parallelCalls===-1?"Unlimited":u.parallelCalls)+" parallel calls ",1)])]),x(h(G),{label:u.popular?"Get Started":"Select",class:M(u.popular?"w-full":"w-full p-button-outlined"),loading:g.value,onClick:P=>ee(u.id,"month")},null,8,["label","class","loading","onClick"])],2))),128))]),e("p",qe," All plans include a "+l(d.value)+"-day free trial with "+l(f.value)+" minutes. No credit card required to start. ",1)]),_:1})])):(c(),p("div",Je,[x(h(A),{class:"shadow-sm"},{title:b(()=>[e("div",We,[t[6]||(t[6]=e("span",null,"Usage This Period",-1)),e("span",{class:M(["px-3 py-1 rounded-full text-sm font-medium",Q(n.value.status)])},l(X.value),3)])]),content:b(()=>[K.value?(c(),p("div",Ke,[e("div",Xe,[t[8]||(t[8]=e("i",{class:"pi pi-info-circle text-blue-600 text-xl mr-3 mt-0.5"},null,-1)),e("div",null,[t[7]||(t[7]=e("h4",{class:"font-medium text-blue-900 mb-1"},"Free Trial Active",-1)),e("p",He," Your "+l(d.value)+"-day free trial ends on "+l(k(n.value.trialEnd))+". You have "+l(f.value)+" minutes included during the trial. ",1)])])])):y("",!0),n.value.hasUnlimitedMinutes?(c(),p("div",at,[e("div",it,[t[11]||(t[11]=e("i",{class:"pi pi-check-circle text-green-600 text-xl mr-3"},null,-1)),e("div",null,[t[10]||(t[10]=e("h4",{class:"font-medium text-green-900"},"Unlimited Minutes",-1)),e("p",lt," You have unlimited call minutes on your current plan. Used this period: "+l(n.value.currentPeriodMinutesUsed)+" minutes ",1)])])])):(c(),p("div",Qe,[e("div",Ze,[t[9]||(t[9]=e("span",{class:"text-gray-600"},"Minutes Used",-1)),e("span",et,[v(l(n.value.currentPeriodMinutesUsed)+" / "+l(n.value.includedMinutes)+" ",1),e("span",tt,"("+l(n.value.usagePercentage)+"%)",1)])]),x(h(W),{value:Math.min(n.value.usagePercentage,100),showValue:!1,class:M(H.value),style:{height:"10px"}},null,8,["value","class"]),e("div",nt,[e("span",st,l(n.value.remainingMinutes)+" minutes remaining ",1),n.value.overageMinutes>0?(c(),p("span",rt,l(n.value.overageMinutes)+" overage minutes @ $"+l((n.value.overageRate/100).toFixed(2))+"/min ",1)):y("",!0)])])),e("div",ot,[e("div",null,[t[12]||(t[12]=e("span",{class:"text-gray-500"},"Current Period",-1)),e("p",ut,l(k(n.value.currentPeriodStart))+" - "+l(k(n.value.currentPeriodEnd)),1)]),e("div",dt,[t[13]||(t[13]=e("span",{class:"text-gray-500"},"Plan",-1)),e("p",ct,l(n.value.planName)+" ("+l(n.value.billingInterval==="year"?"Annual":"Monthly")+")",1)])])]),_:1}),x(h(A),{class:"shadow-sm"},{title:b(()=>[...t[14]||(t[14]=[v("Subscription Details",-1)])]),content:b(()=>[e("div",pt,[e("div",null,[e("h4",vt,"Current Plan: "+l(n.value.planName),1),e("ul",gt,[e("li",mt,[t[15]||(t[15]=e("i",{class:"pi pi-check text-green-500 mr-2"},null,-1)),v(" "+l(n.value.hasUnlimitedMinutes?"Unlimited":n.value.includedMinutes)+" minutes/month ",1)]),t[16]||(t[16]=e("li",{class:"flex items-center"},[e("i",{class:"pi pi-check text-green-500 mr-2"}),v(" 24/7 AI phone answering ")],-1)),t[17]||(t[17]=e("li",{class:"flex items-center"},[e("i",{class:"pi pi-check text-green-500 mr-2"}),v(" Appointment scheduling ")],-1)),t[18]||(t[18]=e("li",{class:"flex items-center"},[e("i",{class:"pi pi-check text-green-500 mr-2"}),v(" Call recordings & transcripts ")],-1))])]),e("div",ft,[n.value.cancelAtPeriodEnd?(c(),p("div",bt,[e("p",ht,[t[19]||(t[19]=e("i",{class:"pi pi-exclamation-triangle mr-1"},null,-1)),v(" Your subscription will end on "+l(k(n.value.currentPeriodEnd)),1)])])):y("",!0),x(h(G),{label:"Manage Subscription",icon:"pi pi-external-link",loading:g.value,onClick:Z},null,8,["loading"]),t[20]||(t[20]=e("p",{class:"text-xs text-gray-500 mt-2"}," Change plan, update payment, or cancel ",-1))])])]),_:1}),n.value.overageMinutes>0?(c(),V(h(D),{key:0,severity:"warn"},{default:b(()=>[t[21]||(t[21]=e("strong",null,"Overage Alert:",-1)),v(" You've used "+l(n.value.overageMinutes)+" minutes beyond your included amount. Estimated overage charge: $"+l((n.value.overageMinutes*n.value.overageRate/100).toFixed(2))+". Consider upgrading to a higher plan for more included minutes at a lower overage rate. ",1)]),_:1})):y("",!0)]))]))}}),wt=de(yt,[["__scopeId","data-v-0d1b8468"]]);export{wt as default};
