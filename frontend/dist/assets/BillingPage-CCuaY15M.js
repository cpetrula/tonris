import{G as ne,M as se,V as re,c as p,j as c,m as y,I as M,Q as ae,i as v,t as l,d as ie,r as m,B as C,o as le,a as e,l as V,g as b,u as h,p as D,f as w,C as R,A as U,F as oe,e as ue,n as L,s as G,_ as de}from"./index-fIXeSJKk.js";var q="clover",ce=function(a){return a===3?"v3":a},J="https://js.stripe.com",pe="".concat(J,"/").concat(q,"/stripe.js"),ve=/^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/,ge=/^https:\/\/js\.stripe\.com\/(v3|[a-z]+)\/stripe\.js(\?.*)?$/;var me=function(a){return ve.test(a)||ge.test(a)},fe=function(){for(var a=document.querySelectorAll('script[src^="'.concat(J,'"]')),r=0;r<a.length;r++){var n=a[r];if(me(n.src))return n}return null},W=function(a){var r="",n=document.createElement("script");n.src="".concat(pe).concat(r);var o=document.head||document.body;if(!o)throw new Error("Expected document.body not to be null. Stripe.js requires a <body> element.");return o.appendChild(n),n},be=function(a,r){!a||!a._registerWrapper||a._registerWrapper({name:"stripe-js",version:"8.6.0",startTime:r})},S=null,j=null,F=null,he=function(a){return function(r){a(new Error("Failed to load Stripe.js",{cause:r}))}},ye=function(a,r){return function(){window.Stripe?a(window.Stripe):r(new Error("Stripe.js not available"))}},xe=function(a){return S!==null?S:(S=new Promise(function(r,n){if(typeof window>"u"||typeof document>"u"){r(null);return}if(window.Stripe){r(window.Stripe);return}try{var o=fe();if(!(o&&a)){if(!o)o=W(a);else if(o&&F!==null&&j!==null){var d;o.removeEventListener("load",F),o.removeEventListener("error",j),(d=o.parentNode)===null||d===void 0||d.removeChild(o),o=W(a)}}F=ye(r,n),j=he(n),o.addEventListener("load",F),o.addEventListener("error",j)}catch(f){n(f);return}}),S.catch(function(r){return S=null,Promise.reject(r)}))},we=function(a,r,n){if(a===null)return null;var o=r[0],d=o.match(/^pk_test/),f=ce(a.version),g=q;d&&f!==g&&console.warn("Stripe.js@".concat(f," was loaded on the page, but @stripe/stripe-js@").concat("8.6.0"," expected Stripe.js@").concat(g,". This may result in unexpected behavior. For more information, see https://docs.stripe.com/sdks/stripejs-versioning"));var k=a.apply(void 0,r);return be(k,n),k},_,X=!1,Y=function(){return _||(_=xe(null).catch(function(a){return _=null,Promise.reject(a)}),_)};Promise.resolve().then(function(){return Y()}).catch(function(i){X||console.warn(i)});var Se=function(){for(var a=arguments.length,r=new Array(a),n=0;n<a;n++)r[n]=arguments[n];X=!0;var o=Date.now();return Y().then(function(d){return we(d,r,o)})},_e=`
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
`,ke={root:function(a){var r=a.instance;return["p-progressbar p-component",{"p-progressbar-determinate":r.determinate,"p-progressbar-indeterminate":r.indeterminate}]},value:"p-progressbar-value",label:"p-progressbar-label"},Pe=ne.extend({name:"progressbar",style:_e,classes:ke}),Ee={name:"BaseProgressBar",extends:se,props:{value:{type:Number,default:null},mode:{type:String,default:"determinate"},showValue:{type:Boolean,default:!0}},style:Pe,provide:function(){return{$pcProgressBar:this,$parentInstance:this}}},z={name:"ProgressBar",extends:Ee,inheritAttrs:!1,computed:{progressStyle:function(){return{width:this.value+"%",display:"flex"}},indeterminate:function(){return this.mode==="indeterminate"},determinate:function(){return this.mode==="determinate"},dataP:function(){return re({determinate:this.determinate,indeterminate:this.indeterminate})}}},Me=["aria-valuenow","data-p"],Ce=["data-p"],Ue=["data-p"],Le=["data-p"];function je(i,a,r,n,o,d){return c(),p("div",M({role:"progressbar",class:i.cx("root"),"aria-valuemin":"0","aria-valuenow":i.value,"aria-valuemax":"100","data-p":d.dataP},i.ptmi("root")),[d.determinate?(c(),p("div",M({key:0,class:i.cx("value"),style:d.progressStyle,"data-p":d.dataP},i.ptm("value")),[i.value!=null&&i.value!==0&&i.showValue?(c(),p("div",M({key:0,class:i.cx("label"),"data-p":d.dataP},i.ptm("label")),[ae(i.$slots,"default",{},function(){return[v(l(i.value+"%"),1)]})],16,Ue)):y("",!0)],16,Ce)):d.indeterminate?(c(),p("div",M({key:1,class:i.cx("value"),"data-p":d.dataP},i.ptm("value")),null,16,Le)):y("",!0)],16,Me)}z.render=je;const Fe={key:1,class:"text-center py-12"},Ie={key:2},Ae={class:"text-center mb-8"},Re={class:"text-xl font-bold text-gray-900 mb-2"},Te={class:"text-gray-600"},Be={class:"grid md:grid-cols-3 gap-6"},Ne={key:0,class:"absolute -top-3 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white text-xs px-3 py-1 rounded-full"},$e={class:"text-xl font-bold text-gray-900 mb-1"},Ve={class:"mb-4"},De={class:"text-3xl font-bold text-gray-900"},Ge={class:"space-y-2 mb-6 text-sm"},We={class:"flex items-center text-gray-600"},qe={class:"flex items-center text-gray-600"},Je={class:"flex items-center text-gray-600"},Xe={class:"text-center text-sm text-gray-500 mt-6"},Ye={key:3,class:"space-y-6"},ze={class:"flex items-center justify-between"},Oe={key:0,class:"mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"},He={class:"flex items-start"},Qe={class:"text-sm text-blue-700"},Ke={key:1,class:"mb-6"},Ze={class:"flex justify-between mb-2"},et={class:"font-medium"},tt={class:"text-gray-500"},nt={class:"flex justify-between mt-2 text-sm"},st={class:"text-gray-500"},rt={key:0,class:"text-orange-600"},at={key:2,class:"mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"},it={class:"flex items-center"},lt={class:"text-sm text-green-700"},ot={class:"grid grid-cols-2 gap-4 text-sm"},ut={class:"font-medium"},dt={class:"text-right"},ct={class:"font-medium"},pt={class:"grid md:grid-cols-2 gap-6"},vt={class:"font-medium text-gray-900 mb-3"},gt={class:"space-y-2 text-sm text-gray-600"},mt={class:"flex items-center"},ft={class:"text-right"},bt={key:0,class:"mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left"},ht={class:"text-sm text-yellow-700"},yt=ie({__name:"BillingPage",setup(i){const a=m(!1),r=m(""),n=m(null),o=m([]),d=m(15),f=m(100),g=m(!1),k=m(null),T=m(!1),O=C(()=>n.value?.status==="trialing"),I=C(()=>n.value?.isInactive||!1),H=C(()=>{if(!n.value)return"No subscription";const s=n.value.status;return{trialing:"Free Trial",active:"Active",past_due:"Past Due",canceled:"Cancelled",unpaid:"Unpaid",incomplete:"Incomplete",incomplete_expired:"Expired",inactive:"Inactive"}[s]||s}),Q=C(()=>{if(!n.value||n.value.hasUnlimitedMinutes)return"bg-green-500";const s=n.value.usagePercentage;return s>=100?"bg-red-500":s>=80?"bg-yellow-500":"bg-green-500"});function P(s){return s?new Date(s).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"N/A"}function K(s){return{trialing:"bg-blue-100 text-blue-700",active:"bg-green-100 text-green-700",past_due:"bg-yellow-100 text-yellow-700",canceled:"bg-red-100 text-red-700",unpaid:"bg-red-100 text-red-700",incomplete:"bg-yellow-100 text-yellow-700",incomplete_expired:"bg-red-100 text-red-700",inactive:"bg-gray-100 text-gray-700"}[s]||"bg-gray-100 text-gray-700"}async function B(){try{a.value=!0,r.value="";const s=await U.get("/api/billing/subscription");s.data.success&&(n.value=s.data.data.subscription,o.value=s.data.data.plans||[],d.value=s.data.data.trialDays||15,f.value=s.data.data.trialMinutes||100)}catch(s){if(console.error("Failed to fetch subscription:",s),s&&typeof s=="object"&&"response"in s){const t=s;r.value=t.response?.data?.error||"Failed to load subscription information"}else r.value="Failed to load subscription information"}finally{a.value=!1}}async function N(){try{T.value=!0;const s=await U.get("/api/billing/usage");s.data.success&&(k.value=s.data.data)}catch(s){console.error("Failed to fetch usage:",s)}finally{T.value=!1}}async function Z(){try{g.value=!0,r.value="";const s=window.location.href,t=await U.post("/api/billing/portal-session",{returnUrl:s});t.data.success&&t.data.data.url&&(window.location.href=t.data.data.url)}catch(s){if(console.error("Failed to open portal:",s),s&&typeof s=="object"&&"response"in s){const t=s;r.value=t.response?.data?.error||"Failed to open billing portal"}else r.value="Failed to open billing portal";g.value=!1}}async function ee(s="professional",t="month"){try{g.value=!0,r.value="";const u="pk_live_51SlETHAhAXdJy2WMmvdaD3n92qfJEsRNyH03LcLOofXsf4IcHSBWUhoaGXUL6UgM7LJ6rxykQj7uAMWMBqkSQDqw00rWur2gNX",E=`${window.location.origin}/app/billing?success=true`,te=`${window.location.origin}/app/billing?cancelled=true`,x=await U.post("/api/billing/create-checkout-session",{planTier:s,billingInterval:t,successUrl:E,cancelUrl:te});if(x.data.success&&x.data.data.url)window.location.href=x.data.data.url;else if(x.data.success&&x.data.data.sessionId){const $=await Se(u);if(!$){r.value="Failed to load Stripe. Please refresh and try again.",g.value=!1;return}const A=await $.redirectToCheckout({sessionId:x.data.data.sessionId});A&&A.error&&(r.value=A.error.message||"Failed to redirect to checkout",g.value=!1)}}catch(u){if(console.error("Failed to start checkout:",u),u&&typeof u=="object"&&"response"in u){const E=u;r.value=E.response?.data?.error||"Failed to start checkout"}else r.value="Failed to start checkout";g.value=!1}}return le(async()=>{await B(),n.value?.isActive&&await N();const s=new URLSearchParams(window.location.search);s.get("success")==="true"?(await B(),await N()):s.get("cancelled")==="true"&&(r.value="Checkout was cancelled"),(s.has("success")||s.has("cancelled"))&&window.history.replaceState({},"",window.location.pathname)}),(s,t)=>(c(),p("div",null,[t[22]||(t[22]=e("div",{class:"mb-6"},[e("h1",{class:"text-2xl font-bold text-gray-900"},"Billing & Subscription"),e("p",{class:"text-gray-600 mt-1"},"Manage your subscription plan and track usage")],-1)),r.value?(c(),V(h(D),{key:0,severity:"error",class:"mb-6"},{default:b(()=>[v(l(r.value),1)]),_:1})):y("",!0),a.value?(c(),p("div",Fe,[...t[0]||(t[0]=[e("i",{class:"pi pi-spin pi-spinner text-4xl text-violet-600"},null,-1),e("p",{class:"text-gray-600 mt-4"},"Loading subscription information...",-1)])])):!n.value||I.value?(c(),p("div",Ie,[w(h(R),{class:"shadow-sm mb-6"},{title:b(()=>[...t[1]||(t[1]=[v("Choose Your Plan",-1)])]),content:b(()=>[e("div",Ae,[e("h3",Re,l(I.value?"Your trial has ended":"Start your subscription"),1),e("p",Te,l(I.value?"Subscribe now to continue using CRITON.AI.":"Choose the plan that fits your business needs."),1)]),e("div",Be,[(c(!0),p(oe,null,ue(o.value,u=>(c(),p("div",{key:u.id,class:L(["border-2 rounded-xl p-6 relative transition-all hover:shadow-lg",u.popular?"border-violet-500":"border-gray-200"])},[u.popular?(c(),p("div",Ne," Most Popular ")):y("",!0),e("h3",$e,l(u.name),1),e("div",Ve,[e("span",De,l(u.monthlyPriceFormatted),1),t[2]||(t[2]=e("span",{class:"text-gray-500"},"/month",-1))]),e("ul",Ge,[e("li",We,[t[3]||(t[3]=e("i",{class:"pi pi-check text-green-500 mr-2"},null,-1)),v(" "+l(u.includedMinutesFormatted)+" minutes included ",1)]),e("li",qe,[t[4]||(t[4]=e("i",{class:"pi pi-check text-green-500 mr-2"},null,-1)),v(" "+l(u.overageRateFormatted)+"/min overage ",1)]),e("li",Je,[t[5]||(t[5]=e("i",{class:"pi pi-check text-green-500 mr-2"},null,-1)),v(" "+l(u.parallelCalls===-1?"Unlimited":u.parallelCalls)+" parallel calls ",1)])]),w(h(G),{label:u.popular?"Get Started":"Select",class:L(u.popular?"w-full":"w-full p-button-outlined"),loading:g.value,onClick:E=>ee(u.id,"month")},null,8,["label","class","loading","onClick"])],2))),128))]),e("p",Xe," All plans include a "+l(d.value)+"-day free trial with "+l(f.value)+" minutes. No credit card required to start. ",1)]),_:1})])):(c(),p("div",Ye,[w(h(R),{class:"shadow-sm"},{title:b(()=>[e("div",ze,[t[6]||(t[6]=e("span",null,"Usage This Period",-1)),e("span",{class:L(["px-3 py-1 rounded-full text-sm font-medium",K(n.value.status)])},l(H.value),3)])]),content:b(()=>[O.value?(c(),p("div",Oe,[e("div",He,[t[8]||(t[8]=e("i",{class:"pi pi-info-circle text-blue-600 text-xl mr-3 mt-0.5"},null,-1)),e("div",null,[t[7]||(t[7]=e("h4",{class:"font-medium text-blue-900 mb-1"},"Free Trial Active",-1)),e("p",Qe," Your "+l(d.value)+"-day free trial ends on "+l(P(n.value.trialEnd))+". You have "+l(f.value)+" minutes included during the trial. ",1)])])])):y("",!0),n.value.hasUnlimitedMinutes?(c(),p("div",at,[e("div",it,[t[11]||(t[11]=e("i",{class:"pi pi-check-circle text-green-600 text-xl mr-3"},null,-1)),e("div",null,[t[10]||(t[10]=e("h4",{class:"font-medium text-green-900"},"Unlimited Minutes",-1)),e("p",lt," You have unlimited call minutes on your current plan. Used this period: "+l(n.value.currentPeriodMinutesUsed)+" minutes ",1)])])])):(c(),p("div",Ke,[e("div",Ze,[t[9]||(t[9]=e("span",{class:"text-gray-600"},"Minutes Used",-1)),e("span",et,[v(l(n.value.currentPeriodMinutesUsed)+" / "+l(n.value.includedMinutes)+" ",1),e("span",tt,"("+l(n.value.usagePercentage)+"%)",1)])]),w(h(z),{value:Math.min(n.value.usagePercentage,100),showValue:!1,class:L(Q.value),style:{height:"10px"}},null,8,["value","class"]),e("div",nt,[e("span",st,l(n.value.remainingMinutes)+" minutes remaining ",1),n.value.overageMinutes>0?(c(),p("span",rt,l(n.value.overageMinutes)+" overage minutes @ $"+l((n.value.overageRate/100).toFixed(2))+"/min ",1)):y("",!0)])])),e("div",ot,[e("div",null,[t[12]||(t[12]=e("span",{class:"text-gray-500"},"Current Period",-1)),e("p",ut,l(P(n.value.currentPeriodStart))+" - "+l(P(n.value.currentPeriodEnd)),1)]),e("div",dt,[t[13]||(t[13]=e("span",{class:"text-gray-500"},"Plan",-1)),e("p",ct,l(n.value.planName)+" ("+l(n.value.billingInterval==="year"?"Annual":"Monthly")+")",1)])])]),_:1}),w(h(R),{class:"shadow-sm"},{title:b(()=>[...t[14]||(t[14]=[v("Subscription Details",-1)])]),content:b(()=>[e("div",pt,[e("div",null,[e("h4",vt,"Current Plan: "+l(n.value.planName),1),e("ul",gt,[e("li",mt,[t[15]||(t[15]=e("i",{class:"pi pi-check text-green-500 mr-2"},null,-1)),v(" "+l(n.value.hasUnlimitedMinutes?"Unlimited":n.value.includedMinutes)+" minutes/month ",1)]),t[16]||(t[16]=e("li",{class:"flex items-center"},[e("i",{class:"pi pi-check text-green-500 mr-2"}),v(" 24/7 AI phone answering ")],-1)),t[17]||(t[17]=e("li",{class:"flex items-center"},[e("i",{class:"pi pi-check text-green-500 mr-2"}),v(" Appointment scheduling ")],-1)),t[18]||(t[18]=e("li",{class:"flex items-center"},[e("i",{class:"pi pi-check text-green-500 mr-2"}),v(" Call recordings & transcripts ")],-1))])]),e("div",ft,[n.value.cancelAtPeriodEnd?(c(),p("div",bt,[e("p",ht,[t[19]||(t[19]=e("i",{class:"pi pi-exclamation-triangle mr-1"},null,-1)),v(" Your subscription will end on "+l(P(n.value.currentPeriodEnd)),1)])])):y("",!0),w(h(G),{label:"Manage Subscription",icon:"pi pi-external-link",loading:g.value,onClick:Z},null,8,["loading"]),t[20]||(t[20]=e("p",{class:"text-xs text-gray-500 mt-2"}," Change plan, update payment, or cancel ",-1))])])]),_:1}),n.value.overageMinutes>0?(c(),V(h(D),{key:0,severity:"warn"},{default:b(()=>[t[21]||(t[21]=e("strong",null,"Overage Alert:",-1)),v(" You've used "+l(n.value.overageMinutes)+" minutes beyond your included amount. Estimated overage charge: $"+l((n.value.overageMinutes*n.value.overageRate/100).toFixed(2))+". Consider upgrading to a higher plan for more included minutes at a lower overage rate. ",1)]),_:1})):y("",!0)]))]))}}),wt=de(yt,[["__scopeId","data-v-c4df3139"]]);export{wt as default};
