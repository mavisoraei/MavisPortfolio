(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,92265,e=>{"use strict";var t=e.i(47167),o=e.i(43476),n=e.i(71645);let i=`${t.default.env.NEXT_PUBLIC_BASE_PATH??""}/landing-pages/meng-to-sketchbook.html`,a={"instrument-serif":'"Instrument Serif", Georgia, "Times New Roman", serif',newsreader:'"Newsreader", Georgia, "Times New Roman", serif',geist:"Geist, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"};e.s(["MengToSketchbookLandingPage",0,function(e){let{className:t="",style:r}=e,[s,l]=(0,n.useState)(!1),d=(0,n.useRef)(null),{headingFont:c,bodyFont:p,headingWeight:f,bodyWeight:g,primaryColor:m,headingSize:$,bodySize:h,headingLetterSpacing:u}=e,y=(0,n.useCallback)(e=>{var t;let o,n,i,r,s,l,d,y,b,w,k;return function(e,t){let o=e?.contentDocument;if(!o?.head)return;let n=o.head,{css:i,fontHref:a}=t,r=o.getElementById("threeui-page-typography")??o.createElement("style");r.id="threeui-page-typography",r.textContent!==i&&(r.textContent=i),n.appendChild(r);let s=o.getElementById("threeui-page-typography-fonts");if(a){let e=s??o.createElement("link");e.id="threeui-page-typography-fonts",e.rel="stylesheet",e.getAttribute("href")!==a&&(e.href=a),s||n.append(e)}else s?.remove()}(e,{css:(o=(t={headingFont:c,bodyFont:p,headingWeight:f,bodyWeight:g,primaryColor:m,headingSize:$,bodySize:h,headingLetterSpacing:u}).headingFont&&a[t.headingFont]?t.headingFont:"instrument-serif",n=t.bodyFont&&a[t.bodyFont]?t.bodyFont:"newsreader",i=t.headingWeight??"400",r=t.bodyWeight??"400",s=t.primaryColor&&/^#([\da-f]{3}|[\da-f]{6})$/i.test(t.primaryColor)?t.primaryColor:"#2b2721",l=t.headingSize??30,d=t.bodySize??20,y=t.headingLetterSpacing??.01,b=(e,t)=>{let o=4===e.length?e.slice(1).replace(/./g,e=>e+e):e.slice(1),[n,i,a]=[0,2,4].map(e=>Number.parseInt(o.slice(e,e+2),16));return`rgba(${n}, ${i}, ${a}, ${t})`},w=e=>Number(e.toFixed(3)),k=e=>`${w(e)}px`,`
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
  font-size: clamp(${k(24*l/30)}, calc(${w(l/30)} * 2.4vw), ${k(l)});
  letter-spacing: ${y}em;
}
.plate .t {
  font-size: clamp(${k(19*l/30)}, calc(${w(l/30)} * 2.1vw), ${k(26*l/30)});
  letter-spacing: ${w(y-.01)}em;
}
.top .menu { font-size: ${k(15*d/20)}; font-weight: ${"400"===r?"300":r}; }
.sb-cats { font-size: ${k(11*d/20)}; }
.sb-caption { font-size: ${k(13*d/20)}; }
.section-label, .zoom-read { font-size: ${k(11*d/20)}; }
.bio {
  font-size: clamp(${k(17*d/20)}, calc(${w(d/20)} * 1.7vw), ${k(d)});
  font-weight: ${"400"===r?"300":r};
}
.plate .n { font-size: ${k(12*d/20)}; }
.plate .p { font-size: ${k(12.5*d/20)}; }
.foot { font-size: ${k(11.5*d/20)}; }
::selection { background: ${b(s,.85)}; }
.bio-link { text-decoration-color: ${b(s,.28)}; }
@media (max-width: 640px) {
  .top .name { font-size: ${k(20*l/30)}; }
  .top .menu { font-size: ${k(12*d/20)}; }
  .sb-cats { font-size: ${k(9.5*d/20)}; }
}
`),fontHref:void 0})},[c,p,f,g,m,$,h,u]);return(0,n.useEffect)(()=>{y(d.current);let e=d.current,t=e?.contentDocument;t&&"complete"===t.readyState&&l(!0)},[y]),(0,o.jsx)("div",{className:`sketchbook-landing-page${t?` ${t}`:""}`,"data-state":s?"ready":"loading",style:{position:"relative",overflow:"hidden",background:"#ece7dc",...r},children:(0,o.jsx)("iframe",{ref:d,title:"Adam Fay — Portfolio",src:i,sandbox:"allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts",loading:"eager",onLoad:e=>{y(e.currentTarget),l(!0)},style:{position:"absolute",inset:0,display:"block",width:"100%",height:"100%",border:0,background:"#ece7dc",opacity:+!!s,transition:"opacity 180ms ease-out"}})})}])}]);