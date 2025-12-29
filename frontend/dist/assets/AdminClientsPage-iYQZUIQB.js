import{B as I,G as M,M as N,c as _,o as v,k as T,l as w,H as j,C as f,J as L,a as t,t as l,d as R,i as b,E as V,j as H,x as K,U as O,e as i,u as r,g as x,w as c,m as Y,s as C,f as F,_ as G}from"./index-Gs8EthlX.js";import{s as J,a as g}from"./index-D3hXdzxh.js";import"./index-Ck1sxs7k.js";import"./index-C-5KtboR.js";import"./index-QPNBdbY6.js";var W=`
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`,X={root:function(s){var o=s.props;return["p-tag p-component",{"p-tag-info":o.severity==="info","p-tag-success":o.severity==="success","p-tag-warn":o.severity==="warn","p-tag-danger":o.severity==="danger","p-tag-secondary":o.severity==="secondary","p-tag-contrast":o.severity==="contrast","p-tag-rounded":o.rounded}]},icon:"p-tag-icon",label:"p-tag-label"},q=I.extend({name:"tag",style:W,classes:X}),Q={name:"BaseTag",extends:M,props:{value:null,severity:null,rounded:Boolean,icon:String},style:q,provide:function(){return{$pcTag:this,$parentInstance:this}}};function y(e){"@babel/helpers - typeof";return y=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(s){return typeof s}:function(s){return s&&typeof Symbol=="function"&&s.constructor===Symbol&&s!==Symbol.prototype?"symbol":typeof s},y(e)}function Z(e,s,o){return(s=tt(s))in e?Object.defineProperty(e,s,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[s]=o,e}function tt(e){var s=et(e,"string");return y(s)=="symbol"?s:s+""}function et(e,s){if(y(e)!="object"||!e)return e;var o=e[Symbol.toPrimitive];if(o!==void 0){var u=o.call(e,s);if(y(u)!="object")return u;throw new TypeError("@@toPrimitive must return a primitive value.")}return(s==="string"?String:Number)(e)}var S={name:"Tag",extends:Q,inheritAttrs:!1,computed:{dataP:function(){return N(Z({rounded:this.rounded},this.severity,this.severity))}}},st=["data-p"];function nt(e,s,o,u,p,m){return v(),_("span",f({class:e.cx("root"),"data-p":m.dataP},e.ptmi("root")),[e.$slots.icon?(v(),T(L(e.$slots.icon),f({key:0,class:e.cx("icon")},e.ptm("icon")),null,16,["class"])):e.icon?(v(),_("span",f({key:1,class:[e.cx("icon"),e.icon]},e.ptm("icon")),null,16)):w("",!0),e.value!=null||e.$slots.default?j(e.$slots,"default",{key:2},function(){return[t("span",f({class:e.cx("label")},e.ptm("label")),l(e.value),17)]}):w("",!0)],16,st)}S.render=nt;const at={class:"min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"},ot={class:"bg-white shadow-sm border-b"},rt={class:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"},it={class:"flex items-center justify-between"},lt={class:"flex items-center gap-2"},dt={class:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"},ct={class:"space-y-6"},ut={class:"grid grid-cols-1 md:grid-cols-4 gap-6"},pt={class:"text-center p-4 bg-blue-50 rounded-lg"},gt={class:"text-3xl font-bold text-blue-600"},mt={class:"text-center p-4 bg-green-50 rounded-lg"},vt={class:"text-3xl font-bold text-green-600"},yt={class:"text-center p-4 bg-orange-50 rounded-lg"},ft={class:"text-3xl font-bold text-orange-600"},bt={class:"text-center p-4 bg-purple-50 rounded-lg"},xt={class:"text-3xl font-bold text-purple-600"},ht={class:"flex items-center justify-between"},_t={class:"text-sm font-normal text-gray-600"},wt={class:"font-semibold text-gray-900"},St={class:"text-xs text-gray-500"},kt=["href"],Pt={class:"font-medium text-gray-900"},$t={class:"text-xs text-gray-500"},Ct={class:"text-sm text-gray-600"},h="admin_password",D="admin_authenticated",Dt=R({__name:"AdminClientsPage",setup(e){const s=K(),o=b(!1),u=b(""),p=b([]),m=V(()=>p.value.length);H(async()=>{const d=sessionStorage.getItem(D),n=sessionStorage.getItem(h);if(d!=="true"||!n){s.push("/criton-admin");return}await k()});async function k(){o.value=!0,u.value="";const d=sessionStorage.getItem(h);try{const n=await O.get("/api/admin/clients",{headers:{"X-Admin-Password":d||""}});p.value=n.data.data.clients}catch(n){u.value=n.response?.data?.error||"Failed to load clients",n.response?.status===401&&P()}finally{o.value=!1}}function P(){sessionStorage.removeItem(h),sessionStorage.removeItem(D),s.push("/criton-admin")}async function A(){await k()}function $(d){return new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}function B(d){return new Date(d).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",hour12:!0})}function U(d){return{active:"success",pending:"info",suspended:"warn",cancelled:"danger"}[d]||"secondary"}function z(d){return{enterprise:"success",professional:"info",basic:"warn",free:"secondary"}[d]||"secondary"}function E(){s.push("/")}return(d,n)=>(v(),_("div",at,[t("div",ot,[t("div",rt,[t("div",it,[n[0]||(n[0]=t("div",{class:"flex items-center gap-3"},[t("i",{class:"pi pi-shield text-blue-600 text-2xl"}),t("div",null,[t("h1",{class:"text-2xl font-bold text-gray-900"},"Admin Dashboard"),t("p",{class:"text-sm text-gray-600"},"Manage and view all registered clients")])],-1)),t("div",lt,[i(r(x),{label:"Refresh",icon:"pi pi-refresh",onClick:A,loading:o.value,outlined:"",size:"small"},null,8,["loading"]),i(r(x),{label:"Logout",icon:"pi pi-sign-out",onClick:P,severity:"secondary",size:"small"}),i(r(x),{label:"Back to Home",icon:"pi pi-home",onClick:E,text:"",size:"small"})])])])]),t("div",dt,[u.value?(v(),T(r(Y),{key:0,severity:"error",class:"mb-6"},{default:c(()=>[F(l(u.value),1)]),_:1})):w("",!0),t("div",ct,[i(r(C),null,{content:c(()=>[t("div",ut,[t("div",pt,[t("div",gt,l(m.value),1),n[1]||(n[1]=t("div",{class:"text-sm text-gray-600 mt-1"},"Total Clients",-1))]),t("div",mt,[t("div",vt,l(p.value.filter(a=>a.status==="active").length),1),n[2]||(n[2]=t("div",{class:"text-sm text-gray-600 mt-1"},"Active Clients",-1))]),t("div",yt,[t("div",ft,l(p.value.filter(a=>a.status==="pending").length),1),n[3]||(n[3]=t("div",{class:"text-sm text-gray-600 mt-1"},"Pending Clients",-1))]),t("div",bt,[t("div",xt,l(p.value.filter(a=>a.planType!=="free").length),1),n[4]||(n[4]=t("div",{class:"text-sm text-gray-600 mt-1"},"Paid Plans",-1))])])]),_:1}),i(r(C),null,{title:c(()=>[t("div",ht,[n[5]||(n[5]=t("div",{class:"flex items-center gap-2"},[t("i",{class:"pi pi-users text-gray-600"}),t("span",null,"All Clients")],-1)),t("span",_t,l(m.value)+" "+l(m.value===1?"client":"clients"),1)])]),content:c(()=>[i(r(J),{value:p.value,rows:10,paginator:p.value.length>10,responsiveLayout:"scroll",loading:o.value,stripedRows:"",class:"text-sm"},{empty:c(()=>[...n[6]||(n[6]=[t("div",{class:"text-center py-8 text-gray-500"},[t("i",{class:"pi pi-users text-4xl mb-3"}),t("p",null,"No clients found")],-1)])]),default:c(()=>[i(r(g),{field:"name",header:"Business Name",sortable:""},{body:c(({data:a})=>[t("div",null,[t("div",wt,l(a.name),1),t("div",St,l(a.slug),1)])]),_:1}),i(r(g),{field:"contactEmail",header:"Contact Email",sortable:""},{body:c(({data:a})=>[t("a",{href:`mailto:${a.contactEmail}`,class:"text-blue-600 hover:underline"},l(a.contactEmail),9,kt)]),_:1}),i(r(g),{field:"status",header:"Status",sortable:""},{body:c(({data:a})=>[i(r(S),{value:a.status,severity:U(a.status),class:"uppercase text-xs"},null,8,["value","severity"])]),_:1}),i(r(g),{field:"planType",header:"Plan",sortable:""},{body:c(({data:a})=>[i(r(S),{value:a.planType,severity:z(a.planType),class:"uppercase text-xs"},null,8,["value","severity"])]),_:1}),i(r(g),{field:"signUpDate",header:"Sign Up Date",sortable:""},{body:c(({data:a})=>[t("div",null,[t("div",Pt,l($(a.signUpDate)),1),t("div",$t,l(B(a.signUpDate)),1)])]),_:1}),i(r(g),{field:"lastUpdated",header:"Last Updated",sortable:""},{body:c(({data:a})=>[t("div",Ct,l($(a.lastUpdated)),1)]),_:1})]),_:1},8,["value","paginator","loading"])]),_:1})])])]))}}),Et=G(Dt,[["__scopeId","data-v-ecf8c2df"]]);export{Et as default};
