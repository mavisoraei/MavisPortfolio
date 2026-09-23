(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,592265,e=>{"use strict";var t=e.i(843476),o=e.i(271645);let n=e.i(247167).default.env.NEXT_PUBLIC_BASE_PATH||"/Adam",i=`${n}/landing-pages/meng-to-sketchbook.html`,a={"instrument-serif":'"Instrument Serif", Georgia, "Times New Roman", serif',newsreader:'"Newsreader", Georgia, "Times New Roman", serif',geist:"Geist, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"};e.s(["MengToSketchbookLandingPage",0,function(e){let{className:n="",style:r}=e,[s,l]=(0,o.useState)(!1),d=(0,o.useRef)(null),{headingFont:c,bodyFont:p,headingWeight:f,bodyWeight:g,primaryColor:m,headingSize:$,bodySize:u,headingLetterSpacing:h}=e,y=(0,o.useCallback)(e=>{var t;let o,n,i,r,s,l,d,y,b,w,v;return function(e,t){let o=e?.contentDocument;if(!o?.head)return;let n=o.head,{css:i,fontHref:a}=t,r=o.getElementById("threeui-page-typography")??o.createElement("style");r.id="threeui-page-typography",r.textContent!==i&&(r.textContent=i),n.appendChild(r);let s=o.getElementById("threeui-page-typography-fonts");if(a){let e=s??o.createElement("link");e.id="threeui-page-typography-fonts",e.rel="stylesheet",e.getAttribute("href")!==a&&(e.href=a),s||n.append(e)}else s?.remove()}(e,{css:(o=(t={headingFont:c,bodyFont:p,headingWeight:f,bodyWeight:g,primaryColor:m,headingSize:$,bodySize:u,headingLetterSpacing:h}).headingFont&&a[t.headingFont]?t.headingFont:"instrument-serif",n=t.bodyFont&&a[t.bodyFont]?t.bodyFont:"newsreader",i=t.headingWeight??"400",r=t.bodyWeight??"400",s=t.primaryColor&&/^#([\da-f]{3}|[\da-f]{6})$/i.test(t.primaryColor)?t.primaryColor:"#2b2721",l=t.headingSize??30,d=t.bodySize??20,y=t.headingLetterSpacing??.01,b=(e,t)=>{let o=4===e.length?e.slice(1).replace(/./g,e=>e+e):e.slice(1),[n,i,a]=[0,2,4].map(e=>Number.parseInt(o.slice(e,e+2),16));return`rgba(${n}, ${i}, ${a}, ${t})`},w=e=>Number(e.toFixed(3)),v=e=>`${w(e)}px`,`
:root {
  --ink: ${s};
  --ink-soft: ${b(s,.58)};
  --ink-faint: ${b(s,.36)};
  --hairline: ${b(s,.14)};
  --display: ${a[o]};
  --font: ${a[n]};
}
body { font-family: ${a[n]}; font-weight: ${r}; }
.top .name, .plate .t { font-family: ${a[o]}; font-weight: ${i}; }
.top .name {
  font-size: clamp(${v(24*l/30)}, calc(${w(l/30)} * 2.4vw), ${v(l)});
  letter-spacing: ${y}em;
}
.plate .t {
  font-size: clamp(${v(19*l/30)}, calc(${w(l/30)} * 2.1vw), ${v(26*l/30)});
  letter-spacing: ${w(y-.01)}em;
}
.top .menu { font-size: ${v(15*d/20)}; font-weight: ${"400"===r?"300":r}; }
.sb-cats { font-size: ${v(11*d/20)}; }
.sb-caption { font-size: ${v(13*d/20)}; }
.section-label, .zoom-read { font-size: ${v(11*d/20)}; }
.bio {
  font-size: clamp(${v(17*d/20)}, calc(${w(d/20)} * 1.7vw), ${v(d)});
  font-weight: ${"400"===r?"300":r};
}
.plate .n { font-size: ${v(12*d/20)}; }
.plate .p { font-size: ${v(12.5*d/20)}; }
.foot { font-size: ${v(11.5*d/20)}; }
::selection { background: ${b(s,.85)}; }
.bio-link { text-decoration-color: ${b(s,.28)}; }
@media (max-width: 640px) {
  .top .name { font-size: ${v(20*l/30)}; }
  .top .menu { font-size: ${v(12*d/20)}; }
  .sb-cats { font-size: ${v(9.5*d/20)}; }
}
`),fontHref:void 0})},[c,p,f,g,m,$,u,h]);return(0,o.useEffect)(()=>{y(d.current);let e=d.current,t=e?.contentDocument;if(!t)return;let o=()=>l(!0);if("complete"!==t.readyState&&"interactive"!==t.readyState)return t.addEventListener("DOMContentLoaded",o),()=>t.removeEventListener("DOMContentLoaded",o);o()},[y]),(0,t.jsx)("div",{className:`sketchbook-landing-page${n?` ${n}`:""}`,"data-state":s?"ready":"loading",style:{position:"relative",overflow:"hidden",background:"#ece7dc",...r},children:(0,t.jsx)("iframe",{ref:d,title:"Adam Fay — Portfolio",src:i,sandbox:"allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts",loading:"eager",onLoad:e=>{y(e.currentTarget),l(!0)},style:{position:"absolute",inset:0,display:"block",width:"100%",height:"100%",border:0,background:"#ece7dc",opacity:+!!s,transition:"opacity 180ms ease-out"}})})}],592265)}]);