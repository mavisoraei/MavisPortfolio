(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,92265,e=>{"use strict";var t=e.i(47167),o=e.i(43476),i=e.i(71645);let n=`${t.default.env.NEXT_PUBLIC_BASE_PATH??""}/landing-pages/meng-to-sketchbook.html`,a={"instrument-serif":'"Instrument Serif", Georgia, "Times New Roman", serif',newsreader:'"Newsreader", Georgia, "Times New Roman", serif',geist:"Geist, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"},s={"instrument-serif":"https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap",newsreader:"https://fonts.googleapis.com/css2?family=Newsreader:wght@200..700&display=swap",geist:"https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"};e.s(["MengToSketchbookLandingPage",0,function(e){let{className:t="",style:l}=e,[r,p]=(0,i.useState)(!1),c=(0,i.useRef)(null),{headingFont:d,bodyFont:f,headingWeight:g,bodyWeight:m,primaryColor:h,headingSize:u,bodySize:$,headingLetterSpacing:y}=e,b=(0,i.useCallback)(e=>{var t;let o,i,n,l,r,p,c,b,w,k,z;return function(e,t){let o=e?.contentDocument;if(!o?.head)return;let i=o.head,{css:n,fontHref:a}=t,s=o.getElementById("threeui-page-typography")??o.createElement("style");s.id="threeui-page-typography",s.textContent!==n&&(s.textContent=n),i.appendChild(s);let l=o.getElementById("threeui-page-typography-fonts");if(a){let e=l??o.createElement("link");e.id="threeui-page-typography-fonts",e.rel="stylesheet",e.getAttribute("href")!==a&&(e.href=a),l||i.append(e)}else l?.remove()}(e,{css:(o=(t={headingFont:d,bodyFont:f,headingWeight:g,bodyWeight:m,primaryColor:h,headingSize:u,bodySize:$,headingLetterSpacing:y}).headingFont&&a[t.headingFont]?t.headingFont:"instrument-serif",i=t.bodyFont&&a[t.bodyFont]?t.bodyFont:"newsreader",n=t.headingWeight??"400",l=t.bodyWeight??"400",r=t.primaryColor&&/^#([\da-f]{3}|[\da-f]{6})$/i.test(t.primaryColor)?t.primaryColor:"#2b2721",p=t.headingSize??30,c=t.bodySize??20,b=t.headingLetterSpacing??.01,w=(e,t)=>{let o=4===e.length?e.slice(1).replace(/./g,e=>e+e):e.slice(1),[i,n,a]=[0,2,4].map(e=>Number.parseInt(o.slice(e,e+2),16));return`rgba(${i}, ${n}, ${a}, ${t})`},k=e=>Number(e.toFixed(3)),z=e=>`${k(e)}px`,`
:root {
  --ink: ${r};
  --ink-soft: ${w(r,.58)};
  --ink-faint: ${w(r,.36)};
  --hairline: ${w(r,.14)};
  --display: ${a[o]};
  --font: ${a[i]};
}
body { font-family: ${a[i]}; font-weight: ${l}; }
.top .name, .plate .t { font-family: ${a[o]}; font-weight: ${n}; }
.top .name {
  font-size: clamp(${z(24*p/30)}, calc(${k(p/30)} * 2.4vw), ${z(p)});
  letter-spacing: ${b}em;
}
.plate .t {
  font-size: clamp(${z(19*p/30)}, calc(${k(p/30)} * 2.1vw), ${z(26*p/30)});
  letter-spacing: ${k(b-.01)}em;
}
.top .menu { font-size: ${z(15*c/20)}; font-weight: ${"400"===l?"300":l}; }
.sb-cats { font-size: ${z(11*c/20)}; }
.sb-caption { font-size: ${z(13*c/20)}; }
.section-label, .zoom-read { font-size: ${z(11*c/20)}; }
.bio {
  font-size: clamp(${z(17*c/20)}, calc(${k(c/20)} * 1.7vw), ${z(c)});
  font-weight: ${"400"===l?"300":l};
}
.plate .n { font-size: ${z(12*c/20)}; }
.plate .p { font-size: ${z(12.5*c/20)}; }
.foot { font-size: ${z(11.5*c/20)}; }
::selection { background: ${w(r,.85)}; }
.bio-link { text-decoration-color: ${w(r,.28)}; }
@media (max-width: 640px) {
  .top .name { font-size: ${z(20*p/30)}; }
  .top .menu { font-size: ${z(12*c/20)}; }
  .sb-cats { font-size: ${z(9.5*c/20)}; }
}
`),fontHref:function(e){let t=[e.headingFont,e.bodyFont].map(e=>e?s[e]:void 0).filter(Boolean);if(t.length)return 1===t.length?t[0]:`https://fonts.googleapis.com/css2?${t.map(e=>e.split("family=")[1].split("&")[0]).join("&")}&display=swap`}({headingFont:d,bodyFont:f})})},[d,f,g,m,h,u,$,y]);return(0,i.useEffect)(()=>{b(c.current);let e=c.current,t=e?.contentDocument;t&&"complete"===t.readyState&&p(!0)},[b]),(0,o.jsx)("div",{className:`sketchbook-landing-page${t?` ${t}`:""}`,"data-state":r?"ready":"loading",style:{position:"relative",overflow:"hidden",background:"#ece7dc",...l},children:(0,o.jsx)("iframe",{ref:c,title:"Adam Fay — Portfolio",src:n,sandbox:"allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts",loading:"eager",onLoad:e=>{b(e.currentTarget),p(!0)},style:{position:"absolute",inset:0,display:"block",width:"100%",height:"100%",border:0,background:"#ece7dc",opacity:+!!r,transition:"opacity 180ms ease-out"}})})}])}]);