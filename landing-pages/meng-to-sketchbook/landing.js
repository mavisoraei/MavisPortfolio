/* =====================================================================
   Meng To — sketchbook hero.
   Spreads are transparent PNGs of an open sketchbook generated with
   Higgsfield.  The leaf that turns is a real curved surface: a chain of
   nested strips whose tangent sweeps through an arc, so the page bends
   the way paper bends instead of pivoting like a flat door.
   ===================================================================== */
const Q=new URLSearchParams(location.search);
const DIR='meng-to-sketchbook/';
const PAGES=[1,2,3,4,5,6,7,8,9,10].map(n=>({
  file:'assets/'+n+'.webp',
  title:['Personal Work','Velma','Velma - Halloween Special','Fortnite x Marvel','Production Work - Misc','The Cuphead Show','Harley Quinn','Animaniacs','Final Space','Close Enough'][n-1],
  place:''
}));
PAGES.forEach(p=>p.url=DIR+p.file);
const M=PAGES.length, LAND=6;
/* ---- Sanity-backed "My Work" rows ---------------------------------------
   The static rows 01-10 above stay as the curated baseline.  Extra `work`
   documents published to the Sanity dataset (project 3at3ce71 / dataset
   production — mirrored in .env.local and sanity/env.ts) are fetched at
   runtime with *[_type == "work"] | order(indexNumber asc) and appended as
   new accordion rows, each with its preview thumbnails and full-gallery
   lightbox. ---- */
const SANITY_WORK={
  projectId:'3at3ce71',
  dataset:'production',
  apiVersion:'2026-09-22',
};
function sanityImageUrl(source){
  if(!source)return null;
  if(typeof source==='string')return source;
  const ref=(source.asset&&source.asset._ref)||source._ref;
  if(!ref)return null;
  /* asset ref "image-<id>-<w>x<h>-<ext>" -> CDN url .../<id>-<w>x<h>.<ext> */
  const m=String(ref).match(/^image-([a-z0-9_-]+)-(\d+x\d+)-([a-z0-9]+)$/i);
  if(!m)return null;
  return 'https://cdn.sanity.io/images/'+SANITY_WORK.projectId+'/'+
    SANITY_WORK.dataset+'/'+m[1]+'-'+m[2]+'.'+m[3];
}
/* log instead of silently freezing — any runtime error anywhere is surfaced */
window.addEventListener('error',e=>console.error('[sketchbook] runtime error:',e.error||e.message));
window.addEventListener('unhandledrejection',e=>console.error('[sketchbook] unhandled rejection:',e.reason));

const wrap=document.getElementById('sbWrap');
const stage=document.getElementById('sbStage');
const sb3d=document.getElementById('sb3d');
const book=document.getElementById('sbBook');
const capBox=document.getElementById('sbCaptions');
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------ the turning leaf */
const N=18;            /* strips — enough for a smooth curve          */
const SPAN=0.449;      /* gutter → outer page edge, as a fraction     */
const BETA=0.60;       /* peak curl of the arc, radians              */
let idx=0, turn=null;  /* turn = {dir, from, to, t}                   */
let strips=[];         /* the chain, kept for per-frame lighting       */

function el(t,c){const e=document.createElement(t);if(c)e.className=c;return e}
function imgEl(i,side){
  const im=new Image();im.className='sb-half-img '+side;
  im.decoding='async';
  im.draggable=false;im.alt='';im.src=PAGES[i].url;return im;
}
function prime(n){
  const p=PAGES[n],u=p.url;
  if(p._img&&p._img.src===u)return p._img;
  p._img=new Image();p._img.src=u;return p._img;
}

function halfEl(pos,i){
  const d=el('div','sb-half '+pos);
  d.appendChild(imgEl(i,pos));
  d.appendChild(el('div','gutter-shade '+pos));
  return d;
}
/* build the strip chain once per turn; background offsets are pure
   geometry, so they never need touching again while it animates */
function buildCurl(dir,from,to){
  strips=[];
  const c=el('div','curl '+dir);
  c.style.setProperty('--n',N);
  c.style.setProperty('--span',SPAN);
  let host=c;
  for(let i=0;i<N;i++){
    const s=el('div','strip');
    s.style.setProperty('--i',i);
    const gut='calc(var(--bw) * 0.5)';
    const sw='calc(var(--bw) * '+SPAN+' / '+N+')';
    const A='calc(-1 * ('+gut+' + '+i+' * '+sw+'))';         /* faces the from-page  */
    const B='calc('+(i+1)+' * '+sw+' - '+gut+')';            /* faces the to-page    */
    const f=el('div','face front'), b=el('div','face back');
    const dress=(e,url,px)=>{
      e.style.backgroundImage='url('+url+')';
      e.style.backgroundPositionX=px;
    };
    dress(f,PAGES[from].url, dir==='next'?A:B);
    dress(b,PAGES[to].url,   dir==='next'?B:A);
    f.appendChild(el('div','sh'));f.appendChild(el('div','gl'));
    b.appendChild(el('div','sh'));b.appendChild(el('div','gl'));
    s.appendChild(f);s.appendChild(b);
    if(i===N-1)s.classList.add('edge');
    host.appendChild(s);host=s;
    strips.push(s);
  }
  return c;
}
function applyTurn(t){
  const th=Math.PI*t;                       /* how far the leaf has swung */
  const beta=BETA*Math.sin(Math.PI*t);      /* it is flat at both ends    */
  const D=180/Math.PI;
  const tt=th+beta, td=2*beta/N;
  sb3d.style.setProperty('--tt',(tt*D).toFixed(2)+'deg');
  sb3d.style.setProperty('--td',(td*D).toFixed(3)+'deg');
  sb3d.style.setProperty('--shade',Math.sin(Math.PI*t).toFixed(3));
  fadeCaption(t);
  for(let i=0;i<strips.length;i++){
    const l1=Math.abs(Math.cos(tt-i*td));        /* facing at this strip's near edge */
    const l2=Math.abs(Math.cos(tt-(i+1)*td));    /* ...and at its far edge           */
    const st=strips[i].style;
    st.setProperty('--lit',l1.toFixed(3));
    st.setProperty('--a1',((1-l1)*.62).toFixed(3));
    st.setProperty('--a2',((1-l2)*.62).toFixed(3));
  }
}
function paint(){
  book.textContent='';
  if(!turn){
    const f=el('div','sb-full');
    const im=new Image();im.decoding='async';im.src=PAGES[idx].url;im.alt=PAGES[idx].title;
    im.draggable=false;
    f.appendChild(im);book.appendChild(f);
    sb3d.style.setProperty('--shade','0');
  }else{
    const next=turn.dir==='next';
    book.appendChild(halfEl('left', next?turn.from:turn.to));
    book.appendChild(halfEl('right',next?turn.to:turn.from));
    book.appendChild(buildCurl(turn.dir,turn.from,turn.to));
    applyTurn(turn.t);
  }
  const a=el('button','sb-zone sb-prev'),b=el('button','sb-zone sb-next');
  a.setAttribute('aria-label','previous page');b.setAttribute('aria-label','next page');
  book.appendChild(a);book.appendChild(b);
  layout();
  caption();
  marks();
  if(typeof syncZoomLayer==='function')syncZoomLayer();
  if(typeof placeLoupe==='function')placeLoupe();
}
function caption(){
  capBox.textContent='';
  capOut=capIn=null;
  if(turn){
    capOut=el('p','sb-caption live');capOut.textContent=PAGES[turn.from].title;capBox.appendChild(capOut);
    capIn=el('p','sb-caption live');capIn.textContent=PAGES[turn.to].title;capBox.appendChild(capIn);
    fadeCaption(turn.t);
  }else{
    const p=el('p','sb-caption');p.textContent=PAGES[idx].title;capBox.appendChild(p);
  }
}
let capOut=null,capIn=null;
function fadeCaption(t){
  if(!capOut||!capIn)return;
  /* the old title is gone before the new one arrives, so they never
     sit on top of each other mid-drag */
  const out=1-Math.max(0,Math.min(1,(t-0.10)/0.28));
  const inn=Math.max(0,Math.min(1,(t-0.56)/0.30));
  capOut.style.opacity=out.toFixed(3);
  capIn.style.opacity=inn.toFixed(3);
}
function layout(){
  const w=book.clientWidth;
  sb3d.style.setProperty('--bw',w+'px');
  sb3d.style.setProperty('--artH',Math.max(book.clientHeight||0,w*1240/1760).toFixed(1)+'px');
}
addEventListener('resize',layout);

/* ------------------------------------------------------ spring loop */
let spring=null;
function animateTo(target,onDone,stiff,damp){
  spring={kind:'spring',v:0,target:target,done:onDone,k:stiff||150,c:damp||22};
  kick();
}
/* the riffle wants a fixed tempo, not a spring settling time */
function tweenTo(target,dur,onDone){
  spring={kind:'tween',from:turn?turn.t:0,target:target,dur:dur,e:0,done:onDone};
  kick();
}
let raf=null,last=0;
function tick(now){
  raf=null;
  const dt=Math.min(0.032,(now-last)/1000||0.016);last=now;
  if(spring&&turn){
    const s=spring;
    if(s.kind==='tween'){
      s.e+=dt;
      const k=Math.min(1,s.e/s.dur);
      turn.t=s.from+(s.target-s.from)*k;
      applyTurn(turn.t);
      if(k>=1){spring=null;const d=s.done;d&&d();}
    }else{
      const x=turn.t-s.target;
      s.v+= (-s.k*x - s.c*s.v)*dt;
      turn.t+=s.v*dt;
      if(Math.abs(turn.t-s.target)<0.002&&Math.abs(s.v)<0.02){
        turn.t=s.target;spring=null;
        applyTurn(turn.t);
        const d=s.done;d&&d();
      }else applyTurn(turn.t);
    }
  }
  viewSpring();
  const lmoved=loupeEase();
  /* kick() may already have queued the next frame from a done-callback */
  if((spring||viewActive||lmoved)&&raf===null) raf=requestAnimationFrame(tick);
}
function kick(){ if(raf===null){last=performance.now();raf=requestAnimationFrame(tick);} }

/* ------------------------------------------- tilt + zoom of the book */
const TILT_X=4.5, TILT_Y=7;      /* degrees — deliberately restrained   */
const ZOOM_MIN=0.9, ZOOM_MAX=1.5;
const view={rx:0,ry:0,z:1, trx:0,try_:0,tz:1};
let viewActive=false;
let lastZ=1;
function applyView(){
  sb3d.style.setProperty('--rx',view.rx.toFixed(2)+'deg');
  sb3d.style.setProperty('--ry',view.ry.toFixed(2)+'deg');
  sb3d.style.setProperty('--zoom',view.z.toFixed(3));
  /* the glass stays put, but the page under it has moved */
  if(view.z!==lastZ){lastZ=view.z;if(typeof placeLoupe==='function')placeLoupe();}
}
function viewSpring(){
  const e=0.14;
  let moved=false;
  for(const [k,t] of [['rx','trx'],['ry','try_'],['z','tz']]){
    const d=view[t]-view[k];
    if(Math.abs(d)>0.0006){view[k]+=d*e;moved=true;}
    else view[k]=view[t];
  }
  if(moved)applyView();
  viewActive=moved;
  return moved;
}
function setView(rx,ry,z){
  view.trx=Math.max(-TILT_X,Math.min(TILT_X,rx));
  view.try_=Math.max(-TILT_Y,Math.min(TILT_Y,ry));
  view.tz=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,z));
  viewActive=true;kick();
  if(typeof syncZoom==='function')syncZoom();
}
/* the book leans toward the cursor — no dragging, and never far */
function tiltTo(cx,cy){
  if(drag)return;                       /* hold still while a page is being turned */
  const r=book.getBoundingClientRect();
  if(!r.width)return;
  const nx=Math.max(-1,Math.min(1,(cx-(r.left+r.width/2))/(r.width*0.62)));
  const ny=Math.max(-1,Math.min(1,(cy-(r.top+r.height/2))/(r.height*0.9)));
  setView(-ny*TILT_X, nx*TILT_Y, view.tz);
}
addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  tiltTo(e.clientX,e.clientY);
},{passive:true});
addEventListener('pointerout',e=>{if(!e.relatedTarget)setView(0,0,view.tz)});
addEventListener('blur',()=>setView(0,0,view.tz));
/* the wheel belongs to the page — zoom is on the toolbar, or a double click
   to come back to 100% */
stage.addEventListener('dblclick',()=>setView(view.trx,view.try_,1));

/* ------------------------------------------------------- pointer work */
let drag=null;
function bookRect(){return book.getBoundingClientRect()}

stage.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  if(e.target.closest('.sb-arrow'))return;   /* let the arrow buttons receive their click */
  e.preventDefault();                     /* no text selection, no image drag */
  const onBook=e.target.closest('.sb-zone');
  stage.setPointerCapture(e.pointerId);
  if(!onBook||introOn)return;
  const r=bookRect();
  const dir=(e.clientX-r.left)/r.width>0.5?'next':'prev';
  startTurn(dir,0);
  drag={dir:dir,x0:e.clientX,w:r.width,moved:0,vel:0,tPrev:performance.now()};
});
stage.addEventListener('pointermove',e=>{
  if(!drag)return;
  const dx=e.clientX-drag.x0;
  drag.moved=Math.max(drag.moved,Math.abs(dx));
  const raw=(drag.dir==='next'? -dx : dx)/(drag.w*0.62);
  const t=Math.max(0,Math.min(1,raw));
  const now=performance.now();
  drag.vel=(t-(turn?turn.t:0))/Math.max(0.001,(now-drag.tPrev)/1000);
  drag.tPrev=now;
  if(turn){turn.t=t;applyTurn(t);}
});
function endDrag(e){
  if(!drag)return;
  const d=drag;drag=null;
  if(!turn)return;
  if(d.moved<6){                              /* a tap, not a drag */
    commit();return;
  }
  const go = turn.t>0.42 || d.vel>1.1;
  if(go)commit(); else cancel();
}
stage.addEventListener('dragstart',e=>e.preventDefault());
stage.addEventListener('selectstart',e=>e.preventDefault());
stage.addEventListener('pointerup',endDrag);
stage.addEventListener('pointercancel',endDrag);

/* ------------------------------------------------------ turn control */
function startTurn(dir,t){
  spring=null;
  if(turn){idx=turn.to;turn=null;}      /* settle anything still in flight */
  if(typeof shoveLoupe==='function')shoveLoupe(dir);
  const from=idx;
  turn={dir:dir,from:from,to:dir==='next'?(from+1)%M:(from-1+M)%M,t:t||0};
  prime(turn.to);
  paint();
}
function commit(){
  if(!turn)return;
  if(REDUCED){idx=turn.to;turn=null;paint();return;}
  animateTo(1,()=>{idx=turn.to;turn=null;paint();},170,26);
  kick();
}
function cancel(){
  if(!turn)return;
  animateTo(0,()=>{turn=null;paint();},150,24);
  kick();
}
function step(dir){
  if(introOn)endIntro();
  if(turn){ /* finish whatever is in flight first */ idx=turn.to;turn=null; }
  startTurn(dir,0);commit();
}
function goTo(i){
  if(introOn)endIntro();
  if(i===idx)return;
  if(turn){idx=turn.to;turn=null;}
  const fwd=(i-idx+M)%M, back=(idx-i+M)%M;
  if(Math.min(fwd,back)===1){step(fwd===1?'next':'prev');return;}
  idx=i;prime(i);paint();
}
document.getElementById('sbLeft').onclick=()=>step('prev');
document.getElementById('sbRight').onclick=()=>step('next');
addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  e.preventDefault();
  step(e.key==='ArrowRight'?'next':'prev');
});
document.getElementById('heroDown').onclick=()=>{
  document.getElementById('about').scrollIntoView({behavior:'smooth',block:'start'});
};

/* ---------------------------------------- site menu + contact modal */
document.querySelectorAll('.top .menu a[data-nav]').forEach(link=>{
  link.addEventListener('click',e=>{
    e.preventDefault();
    const nav=link.dataset.nav;
    if(nav==='resume'){openResumeModal();return;}
    if(nav==='contact'){openContactModal();return;}
    const target=document.getElementById(nav==='home'?'sketchbook':'resume');
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
  });
});
const navMenu=document.querySelector('.top .menu');
const navScroll=()=>navMenu.classList.toggle('scrolled',window.scrollY>10);
addEventListener('scroll',navScroll,{passive:true});
navScroll();
const contactModal=document.getElementById('contactModal');
const contactBox=document.getElementById('contactModalBox');
const contactForm=document.getElementById('contactForm');
function openContactModal(){
  contactBox.classList.remove('sent');
  contactForm.reset();
  contactForm.querySelectorAll('.field').forEach(f=>f.classList.remove('invalid'));
  contactModal.classList.add('open');
  requestAnimationFrame(()=>document.getElementById('cfName').focus());
}
function closeContactModal(){
  contactModal.classList.remove('open');
  document.body.focus();
}
document.getElementById('modalClose').addEventListener('click',closeContactModal);
document.getElementById('sentClose').addEventListener('click',()=>{
  contactBox.classList.remove('sent');
  closeContactModal();
});
contactModal.addEventListener('click',e=>{if(e.target===contactModal)closeContactModal();});
addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  if(contactModal.classList.contains('open'))closeContactModal();
  else if(resumeModal.classList.contains('open'))closeResumeModal();
});
contactForm.addEventListener('submit',e=>{
  e.preventDefault();
  let ok=true;
  contactForm.querySelectorAll('input,textarea').forEach(f=>{
    const field=f.closest('.field');
    const valid=f.checkValidity();
    field.classList.toggle('invalid',!valid);
    if(!valid)ok=false;
  });
  if(!ok)return;
  contactBox.classList.add('sent');
  document.getElementById('modalSent').querySelector('h3').focus();
});

/* -------------------------------------------------- resume modal */
const resumeModal=document.getElementById('resumeModal');
const resumeCloseBtn=document.getElementById('resumeClose');
function openResumeModal(){
  resumeModal.classList.add('open');
  requestAnimationFrame(()=>resumeCloseBtn.focus());
}
function closeResumeModal(){
  resumeModal.classList.remove('open');
  document.body.focus();
}
resumeCloseBtn.addEventListener('click',closeResumeModal);
resumeModal.addEventListener('click',e=>{if(e.target===resumeModal)closeResumeModal();});

/* --------------------------------------------------- loupe + controls */
const loupe=document.getElementById('loupe');
const lens=document.getElementById('loupeLens');
const mag=document.getElementById('loupeMag');
const zRead=document.getElementById('zRead');
const loupeBtn=document.getElementById('loupeBtn');
const zInBtn=document.getElementById('zIn'), zOutBtn=document.getElementById('zOut');
const MAG=2.3;
const DESK=getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()||'#ece7dc';
let loupeOn=true, lx=null, ly=null, lgrab=null, lTarget=null;
let MAGX=null,SOFTX=null;
function magX(){
  if(MAGX===null)MAGX=parseFloat(getComputedStyle(loupe).getPropertyValue('--mag').trim())||MAG;
  return MAGX;
}
function softX(){
  if(SOFTX===null)SOFTX=getComputedStyle(loupe).getPropertyValue('--soft').trim()==='1';
  return SOFTX;
}
function refreshMag(){MAGX=null;SOFTX=null}
/* keep the lens small on mobile, but sized through the SAME variable the
   mask uses, so the magnified circle stays locked inside the glass frame */
function loupeSize(){
  if(window.matchMedia('(max-width:768px)').matches)
    return Math.round(Math.max(82,Math.min(120,book.clientWidth*0.235)));
  return Math.round(Math.max(165,Math.min(262,book.clientWidth*0.235)));
}
/* the loupe's own coordinate space: stage pixels in live mode (it sits
   outside the book's transform), book pixels otherwise */
function bookBox(){
  return {x:0,y:0,w:book.clientWidth,h:book.clientHeight};
}
/* park it on the desk at the lower right, half off the book */
function restLoupe(){
  const b=bookBox();
  lx=b.x+b.w*0.88; ly=b.y+b.h*0.855;
  refreshMag();
  placeLoupe();
}
/* The glass sits above the tilt, in the book's untransformed pixels, so the
   lean of the page never nudges it.  What the tilt does change is which part
   of the paper is under the glass, and only the scale matters enough to
   correct for: the book is drawn about its own centre. */
const zoomWrap=document.getElementById('zoomWrap');
const zoomInner=document.getElementById('zoomInner');
/* mirror whatever the book is currently showing into the magnified copy */
function syncZoomLayer(){
  zoomInner.textContent='';
  for(const c of book.children){
    if(c.classList.contains('sb-zone'))continue;      /* hit targets need no copy */
    zoomInner.appendChild(c.cloneNode(true));
  }
}
function placeLoupe(){
  if(lx===null)return;
  const B=bookBox(), bw=B.w, bh=B.h;
  if(!bw)return;
  const R=loupeSize()/2, bez=R*2*0.058;
  loupe.style.setProperty('--lr',R*2+'px');
  loupe.style.transform='translate3d('+(lx-R).toFixed(1)+'px,'+(ly-R).toFixed(1)+'px,0)';
  if(loupeOn)loupe.classList.add('on');

  /* where the paper's edges actually land once the book is scaled */
  const z=view.z, cx=bw/2, cy=bh/2;
  const x0=cx+(bw*.051-cx)*z, x1=cx+(bw*.949-cx)*z;
  const y0=cy+(bh*.218-cy)*z, y1=cy+(bh*.782-cy)*z;
  /* How far the glass's own centre is inside the paper.  The copy fades out
     as it wanders off the sheet, so you are left looking through plain
     glass rather than at a sliver of page on flat desk. */
  const nx=Math.max(x0,Math.min(lx,x1));
  const ny=Math.max(y0,Math.min(ly,y1));
  const inside=(lx>x0&&lx<x1&&ly>y0&&ly<y1)
    ? Math.min(lx-x0, x1-lx, ly-y0, y1-ly)
    : -Math.hypot(lx-nx,ly-ny);
  const k=Math.max(0,Math.min(1,(inside+R*0.30)/(R*0.55)));

  zoomWrap.style.opacity=(loupeOn?k:0).toFixed(3);
  if(k<=0.002)return;
  const r=(R-bez).toFixed(1);
  const fade=softX()?'#000 65%,transparent 100%':'#000 calc(100% - 1px),transparent 100%';
  const mask='radial-gradient(circle '+r+'px at '+lx.toFixed(1)+'px '+ly.toFixed(1)+'px,'+fade+')';
  zoomWrap.style.webkitMaskImage=mask;
  zoomWrap.style.maskImage=mask;
  /* the page point beneath the glass, magnified about that same spot so the
     lens keeps showing MAG times whatever is on screen */
  const px=cx+(lx-cx)/z, py=cy+(ly-cy)/z, s=magX()*z;
  zoomInner.style.transform='translate('+(lx-px*s).toFixed(1)+'px,'+(ly-py*s).toFixed(1)+'px) '
    +'scale('+s.toFixed(4)+')';
}
/* the leaf shoves the glass aside as it sweeps past */
function shoveLoupe(dir){
  if(!loupeOn||lx===null||lgrab)return;
  const b=bookBox();
  /* which page point the glass covers, once the book's scale is undone */
  const nx=(b.w/2+(lx-b.x-b.w/2)/view.z)/b.w, ny=(b.h/2+(ly-b.y-b.h/2)/view.z)/b.h;
  if(nx<0.02||nx>0.98||ny<0.17||ny>0.83)return;      /* already clear of the page */
  lTarget={x:b.x+b.w*(dir==='next'?0.12:0.88), y:b.y+b.h*0.855};
  kick();
}
function loupeEase(){
  if(!lTarget)return false;
  if(lgrab){lTarget=null;return false;}
  const dx=lTarget.x-lx, dy=lTarget.y-ly;
  if(Math.abs(dx)<0.5&&Math.abs(dy)<0.5){lx=lTarget.x;ly=lTarget.y;lTarget=null;placeLoupe();return false;}
  lx+=dx*0.17;ly+=dy*0.17;placeLoupe();
  return true;
}
loupe.addEventListener('pointerdown',e=>{
  if(!loupeOn||e.button!==0)return;
  e.preventDefault();e.stopPropagation();     /* never starts a page turn */
  lTarget=null;
  lgrab={cx:e.clientX,cy:e.clientY,lx0:lx,ly0:ly};
  loupe.classList.add('held');
  loupe.setPointerCapture(e.pointerId);
});
loupe.addEventListener('pointermove',e=>{
  if(!lgrab)return;
  const b=bookBox(), R=loupeSize()/2;
  /* the glass carries none of the book's transform, so the cursor maps 1:1 */
  lx=Math.max(b.x-R*0.7,Math.min(b.x+b.w+R*0.7, lgrab.lx0+(e.clientX-lgrab.cx)));
  ly=Math.max(b.y-R*0.7,Math.min(b.y+b.h+R*1.0, lgrab.ly0+(e.clientY-lgrab.cy)));
  placeLoupe();
});
function dropLoupe(){lgrab=null;loupe.classList.remove('held');}
loupe.addEventListener('pointerup',dropLoupe);
loupe.addEventListener('pointercancel',dropLoupe);
loupeBtn.onclick=()=>{
  loupeOn=!loupeOn;
  loupeBtn.setAttribute('aria-pressed',String(loupeOn));
  loupe.classList.toggle('on',loupeOn);
  if(loupeOn&&lx===null)restLoupe();
};
addEventListener('resize',()=>{lx=null;restLoupe();});

function syncZoom(){
  zRead.textContent=Math.round(view.tz*100)+'%';
  zOutBtn.disabled=view.tz<=ZOOM_MIN+0.001;
  zInBtn.disabled=view.tz>=ZOOM_MAX-0.001;
}
zInBtn.onclick=()=>{setView(view.trx,view.try_,view.tz*1.16);};
zOutBtn.onclick=()=>{setView(view.trx,view.try_,view.tz/1.16);};

/* --------------------------------------------------------- the index */
const plateList=document.getElementById('plateList');
const expandedPlate={el:null};

/* ---- Personal Work (01): image manifest ---- */
const PW_FILES=["01989a3b-f6cc-409f-89eb-5599629ec0f5_rw_1920.webp","0c21de9d-eda1-4f53-adb2-c6e219bb479c_rw_3840.webp","125d1a55-d359-4aee-9503-b49ea6624664_rw_600.webp","1278a49a-72ba-41a8-8dbe-8661c6a048f7_rw_1920.webp","166e7fb9-bef2-4c26-adb3-9dbd2998baf5_rw_600.webp","193d9b48-96f6-4ba6-b1ae-9040a9962932_rw_1920.webp","203180b8-ff6b-4499-a852-f8a96a7d0112_rw_3840.webp","27fa1276-8198-4ea0-8a34-df1565c594f7_rw_1200.webp","2a5ed53f-b295-4b1f-8272-7fcaa9649792_rw_600.webp","2da29ee3-afcf-4796-a94b-e6cd0f6191f8_rw_600.webp","2e8601c8-a046-4fa5-aca9-13c98eb6b844_rw_1200.webp","2f2e32c6-8c11-47e8-ab5b-57647b8725b2_rwc_927x180x1888x1416x1366.webp","2f435edb-90c2-4a7c-b9e9-670dd0f99a2e_rwc_162x0x745x559x745.webp","35277403-9090-401d-8f85-9af41141e03c_rw_1920.webp","357efef3-6ebc-4fbe-9c77-72e95e159324_rw_1920.webp","35856fd6-e0b7-4fe1-9a9f-8ce2cc0b1be2_rwc_63x0x450x338x450.webp","36471eba-75fe-42f0-ac42-44e1575ef366_rw_1920.webp","37ffb8d9-1a21-4ced-80ec-08e7f3131751_rw_600.webp","39075e3c-62ea-451a-90bb-3c1ac9d2ed8f_rw_600.webp","40336ea8-9d3d-4aa3-9efb-26115b8eb98e_rw_600.webp","407587b0-cd49-46de-907e-a88feffb4303_rw_600.webp","41a8d076-9fc9-4716-9fa3-e0c955c3801d_rw_3840.webp","436d8010-7a3f-44f9-b644-b88e113ae7bb_rw_1200.webp","447f3907-811f-4cc1-b548-dd61946652c6_rw_1920.webp","50272f1e-2e8e-4d8e-8e25-9eefda2b6c75_rw_600.webp","541069b0-127e-46de-8cd1-80980853b18f_rw_1920.webp","54e9f88d-7580-4847-b624-b2475b239f35_rw_600.webp","61548336-1acd-4190-8698-19e558d22bcf_rwc_583x403x1200x900x640.webp","616152c0-69e7-47e8-9774-9c26380a86e4_rw_3840.webp","65914b42-68a0-4815-94db-ee4a430eab13_rw_1920.webp","6e423771-6561-4d67-870c-1e54e5adf006_rw_1920.webp","6ea3af64-ae77-4b46-a28a-bdcb1a60fc9f_rw_600.webp","74ca9286-e546-4861-94f8-0f8e3bca9485_rw_1920.webp","7971e237-f0bd-4dfd-bbde-fdb5502b76f0_rw_1920.webp","7e68211e-74de-47f1-8a34-7cc2092f3e9d_rw_1920.webp","9379ff67-6612-4dd0-b797-51496041423a_rw_600.webp","93aa4eba-26bd-4332-b585-5a54af43f7bd_rw_1920.webp","97338129-7d1b-4a1e-92d8-505b66df741c_rw_1200.webp","99c616c8-99c3-4c21-a306-19d2de3d08d9_rw_600.webp","a0d958c6-644a-4252-81b1-d08b3a800baa_rw_600.webp","a2f62ff1-27ca-4055-b192-c452c028febc_rw_1920.webp","a3d4b1f5-b432-4f1e-a03e-e84503832062_rw_600.webp","a620078d-b763-41b6-8b56-68f3df0f7c12_rw_1920.webp","a6d61fc8-2223-4d87-8a60-fbbae8773522_rw_3840.webp","a9a8fd8a-004a-49aa-b622-98acdfad90a1_rwc_0x256x817x612x817.webp","b7b37573-9d68-4241-90cc-953558a5720e_rw_1920.webp","b9182842-394d-4730-9490-4f9104c2a7d1_rw_1200.webp","be27e7e8-ea13-4bde-a1dc-8361bf3d945c_rw_600.webp","bf62e7be-e256-4b60-8501-9e0364c3ecba_rw_3840.webp","c0c04751-19a2-4e93-90fa-fce7fe4ca84f_rw_1200.webp","c3d21fde-3d74-4e41-8285-e2a4014e316b_rw_3840.webp","c580f936-7146-4315-a528-d3d94561d46c_rw_1200.webp","c683dc95-c3ce-49de-a4a7-d231265e8f9b_rw_3840.webp","c842574f-c93f-4250-8621-bdc41e47cfee_rw_600.webp","c8e34c79-d427-4c55-8dfa-9f1f41c93a28_rw_1920.webp","c91f0a23-5477-4318-ad6c-2336a7507c4c_rw_600.webp","d0cc2490-ea8f-497c-ad5f-f69470aeb6ba_rwc_283x112x798x599x798.webp","d7249fc5-1d8e-4140-b77c-8104227d8e58_rw_1920.webp","d947d6dd-50f6-4cc5-adcf-d69e0b0cbd97_rw_1920.webp","da15bbf7-88c3-43cc-96d4-dcfef72b9d48_rw_1200.webp","de6dc3be-545c-4704-a310-f01f4a3a2828_rw_600.webp","e46934bc-6c68-4163-9906-caec3161d6bb_rw_600.webp","e6e3ba94-20f9-427f-9620-dc76dfb1603e_rw_1920.webp","e700f05c-3c85-4575-9506-d6b2c60cd096_rw_3840.webp","e788e70f-2250-4a19-89eb-76222d8797f3_rw_600.webp","eb573fdf-ea93-4535-86dc-6153a98e6698_rw_1920.webp","f5d2c327-09f5-4400-aa4e-f8b3d5e591b1_rw_600.webp","f88ff776-e898-4320-bcb7-b6fa20562f17_rw_600.webp"];
/* ---- section image manifests: folder NN -> file list ----
   Personal Work (01) keeps its manifest above; sections 03-10 each resolve
   to their own folder under "pic work/" and feed the exact same balanced
   masonry + glassmorphic gallery as Personal Work.  Section 02 (Velma) has
   no folder yet, so it stays an expandable placeholder in the list order. */
const GAL_FILES={
  0:PW_FILES,
  2:["102d2130-4344-40f6-9b52-5cd33193d866_rw_600.webp","49e49ab8-18f4-46b3-88ee-4341b46132de_rw_600.webp","53cd371c-72e3-4323-ae22-d0fee60de380_rw_1920.webp","568a295d-42ba-4f61-a636-0e4996e5805b_rw_1920.webp","611971cf-ab4b-44c1-9905-e937705c3dde_rw_600.webp","6acf723c-5086-4cc9-86ba-516321075cd4_rw_600.webp","81b35af0-439b-4877-98de-e7a7851deae8_rw_600.webp","81ba7fce-9c2e-4ef5-8491-ce4b26e0e8e9_rw_1200.webp","852478f8-e07f-4070-af03-d4038edb4700_rw_1200.webp","97083176-b8f1-4384-9f36-7a25f6aa38e7_rw_600.webp","99468eea-c987-49ff-b191-90269ea88c33_rw_600.webp","9a0de197-364f-49fd-8dfe-426fd32c25ac_rw_600.webp","9b6d9b54-afb7-4f97-b4a0-52cae5e04521_rw_1920.webp","9eecab39-4927-4fcd-bb84-36a78c113364_rw_1920.webp","a0573fe0-d286-47bf-9e56-2e77ee01e8fb_rw_600.webp","ac13ea67-6053-4a3a-bc9f-6713aa2baa58_rw_1200.webp","af1859ea-e9e9-4a46-9c1e-03eb612bc974_rw_1920.webp","b5782471-f6d6-4c0a-8c94-9f12c62eadd0_rw_1920.webp","eb5a6f49-1882-4a09-8b20-06c955225364_rw_1200.webp","f13c67cd-b090-4e0e-9113-f6d61f3b1282_rw_1920.webp","f5899fc6-aac3-4a7a-b8d5-9c98cfad08c2_rw_600.webp","f58f5369-8699-4bd7-b639-ec47d5ca80cd_rw_600.webp"],
  3:["3fc79a44-d959-42b9-8760-2eaa09a9330a_rw_600.webp","54c0325d-074a-4426-96d0-492b7dff8592_rw_600.webp","57f07ccb-ff0c-4e28-b01d-377e0a75c9d0_rw_600.webp","75875a5d-c09e-46f4-b362-5109d887ced6_rw_600.webp","797332f2-49fe-4a7a-811b-ca4b0b10c579_rw_600.webp","7ba15179-8d6b-4a8d-ba41-08e5ed79a2e5_rw_600.webp","84d7ba0c-0f1e-40a3-94ff-aaaca6252483_rw_600.webp","ae5c4579-8560-40f7-b92d-33ad9de02394_rw_600.webp","ca69ec6f-b030-47e1-8100-da9b6753e07a_rw_600.webp","ea692b22-5b7d-4ef5-885d-58820e192c81_rw_600.webp"],
  4:["01119b7a-1e0c-4163-bdff-f46e5e794bac_rw_600 (1).webp","01119b7a-1e0c-4163-bdff-f46e5e794bac_rw_600.webp","11a3efd5-ad85-4850-aa6d-6e5795e38129_rw_600.webp","151a8a5f-9bd0-4390-9dd2-61b79328ad5f_rw_1200.webp","1861ce3e-6fca-45c2-8686-524375c7dcab_rw_1200.webp","191414d0-c494-4bd8-8038-f8e5929447f7_rw_600.webp","249fd383-66fd-4283-9e8b-5bc8728009d2_rw_1920.webp","2875b13d-f070-4bc5-97a8-c57ca71c55cb_rw_600.webp","3324d0ab-41a9-457e-97f4-ea594c2bfa70_rw_1920.webp","3b86e30c-a732-4a06-af93-deb48414c7ff_rw_1920.webp","438925ef-9280-4911-99f1-885cf309d059_rw_1920.webp","43c919d7-4fde-4b4e-9bda-1782c51f01e8_rw_1920.webp","4f0af227-067c-4d0c-8fc1-3624738c38ea_rw_600.webp","5602075c-8c49-4ebf-9f23-1bf4aa13ca3e_rw_600.webp","56a698ae-122a-4169-9796-738b55240d6f_rw_1920.webp","590cce25-969c-4c9e-b631-d0383a8eeeaf_rw_600.webp","65477bc9-16f1-4c44-9a27-0f1d97861bc2_rw_600.webp","66c2b9b3-f411-4a4a-ad1c-a12cd5c4015b_rw_1920.webp","6817d00b-dcf3-4ded-a597-5ab14583a30b_rw_1920.webp","7c6a72d1-5b9a-4344-8188-20afd6abaa8a_rw_600.webp","84564920-78c8-4ff2-8ac2-acb3922725fa_rw_600.webp","85892e2d-fb73-4b97-95da-28905cfdfc87_rw_600.webp","8dbc7e68-370d-4331-a3c5-05c151047458_rw_600.webp","8f16e4ea-0228-4a7b-bce9-f1ad59c31d98_rw_600.webp","900cff22-39bc-4c1a-8e7f-dc09113fdaa9_rw_600.webp","9958f561-eb53-4cff-85d9-b7dcc49d01a6_rw_1920.webp","9a8d6258-58ce-4ff4-a4d8-27cd8ac6df78_rw_600.webp","a0c96dba-f028-4fd3-9ccf-6885bcf3b4db_rw_600.webp","a5f746d5-fa19-4bc1-a927-56e47e04f9f3_rw_600.webp","a8053973-501a-4834-866f-a01e7615df86_rw_600.webp","b180d134-d4bf-4671-a866-051761d3a702_rw_1920.webp","b78cfb89-ddd9-4902-8ff5-fb7cb535b91b_rw_1200.webp","b8e805db-1e44-4930-9341-26f5c5196f7b_rw_600.webp","c552dfad-edb8-4aed-a5ae-c571fae3d647_rw_600.webp","ccba9829-65d2-4350-80ec-04c5e14dd393_rw_600.webp","ce822a00-989d-49d4-8d9a-51697d55a028_rw_1920.webp","d0ad3b79-ee56-4cf1-aa17-4d3abebc84a7_rw_600.webp","d4d6487c-3066-4af3-8d4d-e495d8e7a98f_rw_600.webp","d9f4e801-a0be-45ba-9e2f-4ddf774f45c3_rw_600.webp","deb2fa9d-ddd3-4340-9e29-593af692cd88_rw_600.webp","e51f0aa2-181b-4c89-8eb0-2cb1def6175e_rw_1200.webp","e93d05ee-fe8c-403c-a132-cdbd3cd6c926_rw_600.webp","f9a34814-dc29-42ed-8812-9313dbe2a545_rw_600.webp","fd5cd445-b0e6-479a-9d5f-4caad32488d7_rw_600.webp","fe313baf-f42b-423f-aa4b-2746788f697e_rw_600.webp"],
  5:["09561ae0-30ca-49d5-904c-06acfe35d264_rw_600.webp","0dde77d3-38b3-4772-abe1-1490338d5af2_rw_600.webp","1ba80cd9-ff13-4229-93cc-c2714554be8e_rw_600.webp","30cd4ca8-0528-4a8e-869d-82f47302575d_rw_600.webp","5d3eca1d-fe12-4657-ab77-adaabd4376b7_rw_600.webp","69ca6be3-66a8-4fbd-8ba2-dbd88151d179_rw_600.webp","84488dcd-3fcb-429b-ac7b-d3fc21fd9c66_rw_600.webp","8558236a-2611-495c-aad8-260e897e1c84_rw_600.webp","9317e763-84c8-490f-bdef-78e731eb025a_rw_1200.webp","94ce4d13-3c90-4ea0-a748-86314db1322e_rw_600.webp","9970ef93-1aeb-44bb-9869-7bb875c516af_rw_600.webp","b3854c4a-ffe8-4b9f-a1ed-f6e7e38e958c_rw_600.webp","b6bc29af-5f84-4394-8ed6-f6e70db4365b_rw_600.webp","bc0e9e3c-077c-415d-aaff-16c043bf6256_rw_1200.webp","be02a0d2-f9f0-4ae9-8a3a-f70acf9fb451_rw_600.webp","c27f0f2d-4f36-41e4-8d39-4fde5a15b7b7_rw_600.webp","c3450b3a-0922-457d-b524-44c7bc154e05_rw_600.webp","c4743bee-fe68-4690-8e1d-287ed49263aa_rw_600.webp","da33f2bb-b0f3-42d7-a1c2-a8d1adda5217_rw_600.webp","deb19586-4693-49ac-a726-08ba93cf93be_rw_600.webp","e1c765d7-37e4-4fcd-a056-2003ffd37eee_rw_600.webp","e51f2c68-c5cd-40ef-9dce-f642562ee899_rw_600.webp","f12ccddb-a0e0-45ac-8a3b-bc12bcbd9e36_rw_600.webp","fb291703-53d9-42bd-8064-302a5387f55f_rw_600.webp"],
  6:["08bdd40c-17a3-4d40-9186-4b61ce9d5756_rw_600.webp","102b25f7-0e96-4fbe-8253-80103565b415_rw_600.webp","36b746ed-cdcf-4277-ab6a-4b036b5fd146_rw_600.webp","3b345ab0-c576-41b7-9314-d0aa8d5e7540_rw_600.webp","3c0ab550-a352-4a17-9980-35fa8fe897df_rw_600.webp","46441a2e-05c0-4ea7-8a02-29ec4afdf49f_rw_600.webp","5446e558-ca33-43d3-9534-d8e8297e42fa_rw_600.webp","6a60eae6-2b84-4f36-852e-643318eb3b0f_rw_600.webp","6b4f915a-1d3d-4a5c-9fa5-db933eb24741_rw_600.webp","7505f4c6-4623-4c57-a6dc-5edcc748dd04_rw_600.webp","8cab2bc5-d25f-4328-99cc-0dd41e4ae7c8_rw_600.webp","a6b1b5b3-903e-4300-b9eb-b1a1561c8c3d_rw_600.webp","ac1c4a84-4ba6-4ce9-bf73-8deddd91c0d4_rw_600.webp","b8b01b35-5554-4348-b351-34d6e66059f9_rw_600.webp","b8f243eb-6371-4114-b7de-82ab51ff7bd4_rw_600.webp","b91ee0f2-ce22-4764-94d9-5e440b3a1777_rw_600.webp","fa511a15-cde2-4ff4-9a95-df5a167c56a8_rw_600.webp"],
  7:["07fc763c-30e6-4727-82be-4755039af539_rw_600.webp","0aa7355f-306f-4fba-918a-2597fddb590d_rw_600.webp","1d12f822-a347-4163-956e-8624f2ec2fcc_rw_600.webp","25916cd5-fded-445a-9733-4b5a8a4560aa_rw_600.webp","25c4f5d7-e71c-4653-a42d-db9867f479d9_rw_600.webp","29eb8ee9-db41-42b5-bc39-a88c697873b2_rw_600.webp","32ee5d3a-1655-4ab8-846e-e1d5d47f1a1e_rw_600.webp","37ac3788-c8d5-4c6d-9a50-a7fdf67c0279_rw_600.webp","5b452247-c0ca-4f98-b9a9-d7839afadc6b_rw_600.webp","63fba8c2-6270-4a4b-9ec4-e3cb7df9ab51_rw_600.webp","6d4e4869-ad46-43a3-bca8-c7afa89fc39d_rw_600.webp","89e13e27-8069-4a8f-9651-cc161643a958_rw_600.webp","9d22b24c-909d-4a3e-8715-168b83bd1a39_rw_600.webp","9eb5e0db-0413-41cb-901d-afa2eb37bd3e_rw_600.webp","addec789-4ec1-406c-ab34-c287e5b91b44_rw_600.webp","afa648f0-497b-4233-a68b-e03ee102e50e_rw_600.webp","c52c3be4-9d11-4ff6-ade0-cba98c66e9f5_rw_600.webp","c8e135c5-16a2-481d-95a1-e27900224d6b_rw_600.webp","d21e1315-a4d2-4d7b-bf17-10513554ba94_rw_600.webp","e44c6f8f-701a-47b9-b3ba-550c2f12b505_rw_600.webp","f2cbc7b0-c2a6-4abb-b638-68ccd8cb80cd_rw_600.webp"],
  8:["03b506ab-351f-4bba-9783-aeed66ba20a7_rw_600.webp","07163e53-1e79-419f-9ef7-64420e112c1a_rw_600.webp","095d26db-c5e8-4397-8691-8ec33e7e4f76_rw_600.webp","1f6eebef-4aac-44fb-9d60-7df956a163e3_rw_600.webp","2052766d-bb11-4c25-ad37-949fd7fa1efe_rw_600.webp","218a687f-e57f-4ea5-9393-89be451c95f9_rw_600.webp","28545d94-488d-4a7a-a492-9dd3c05575f8_rw_600.webp","294569de-8ee9-4718-bc3b-5b17cc1c934c_rw_600.webp","2f161fda-48e2-4a30-b1cf-b7d686fa4814_rw_600.webp","2f596bf3-70f9-4be2-9d71-ecf935834780_rw_600.webp","317f6aa5-0315-4692-a3c5-2b92701c2758_rw_600.webp","3321c14d-8b47-481c-8a56-8255606c482a_rw_600.webp","34161c77-6e42-418b-8992-cc723cef8e3a_rw_600.webp","380df1d7-7ed7-43d6-8d5e-bb56a676bb0e_rw_600.webp","512ba8bc-27b3-4a01-8d3d-42987624d0ee_rw_600.webp","51df38ea-6324-4c39-a0d5-c3dc49241463_rw_600.webp","5cc2d168-a53e-4152-9961-206b2b38c230_rw_600.webp","65ef6788-380f-4d8d-b92d-a52d350bf749_rw_600.webp","7181517b-5661-4141-98d5-380b03aef721_rw_600.webp","768c86fb-b055-4bc4-964e-b4d4a2d36eaa_rw_600.webp","7d294c64-a2a7-4448-a6c1-2b1c8e59358f_rw_600.webp","84aae19a-864c-4783-bf8b-ed45e684514a_rw_600.webp","8d7b2adb-0b5e-4e71-a75a-39e0d65042bd_rw_600.webp","a4e1b2c5-72f5-496c-9d86-6ffe791b70d5_rw_600.webp","ae612bd7-af97-41b2-8f7a-bc5cfdf8d843_rw_600.webp","b0bdab7a-6f1a-4c05-9287-0caf2402d82d_rw_600.webp","b1767ccf-86ce-4c2d-9912-11d57ae9482b_rw_600.webp","b83f3bc9-8403-4752-8f56-9c9cdaef8cc5_rw_600.webp","c44c5fea-fc90-4ce6-8906-e58f5d79c9d8_rw_600.webp","cc06189e-de36-4e8d-9dd6-3594b61e9b1d_rw_600.webp","d4109bb3-6c46-4b30-b4ee-3e4c03c35c28_rw_1200.webp","e8268e74-1474-4e43-8f6f-404f54dc9dac_rw_600.webp"],
  9:["331bbfd2-9e20-456c-b1eb-0b0cd2dc3b35_rw_600.webp","37805c91-d6ae-4d1f-a7d6-38acbd36b271_rw_600.webp","3c08c72d-9f65-457e-a7cf-f4fd8ee03644_rw_600.webp","4bbd2a31-5773-433a-aca1-81931a5333f3_rw_600.webp","8bd29816-7a8c-44c2-90f2-1e02d2a81abd_rw_600.webp","8cc3b93b-e686-4900-bbc3-d8ce2fdd788e_rw_600.webp","9563bf34-9c9f-45bb-b143-92d435aeea70_rw_600.webp","c5985723-030d-46f4-8b8d-c7428da6a388_rw_600.webp","cb8e7a6d-57d1-4715-8f52-321837403b95_rw_600.webp","d44b8917-be8c-4e2e-8705-2498408e5703_rw_600.webp","eb0413c6-baf1-4d50-9992-f0088950813a_rw_600.webp","f2b3e038-e337-4600-ba56-d83685e463c4_rw_600.webp"],
};

/* ---- shared balanced-masonry pipeline (identical to Personal Work 01) ---- */
function makeGallery(folder,label,files){
  const grid=el('div','pw-masonry');
  const items=[];
  const imgs=[];
  const seenSrcs=new Set();
  let mounted=false;
  const api={grid:grid,progress:null,layout:function(){}};
  function resolve(f){return /^https?:/.test(f)?f:DIR+'pic%20work/'+folder+'/'+encodeURIComponent(f)}
  files.forEach((f,fi)=>{
    const src=resolve(f);
    if(seenSrcs.has(src))return;
    seenSrcs.add(src);
    const it=el('figure','pw-item');
    const im=new Image();im.loading='lazy';im.decoding='async';
    im.dataset.src=src;
    im.alt=label+' '+(fi+1);
    im.addEventListener('load',balance);
    im.addEventListener('error',balance);
    it.appendChild(im);
    items.push(it);
    imgs.push(im);
  });
  function cols(){
    return matchMedia('(max-width:560px)').matches?1:matchMedia('(max-width:900px)').matches?2:3;
  }
  function ensure(){
    const n=cols();
    while(grid.children.length<n)grid.appendChild(el('div','pw-col'));
    while(grid.children.length>n)grid.lastChild.remove();
  }
  function measure(c){
    let h=0;
    for(const it of c.children){
      const r=it.getBoundingClientRect().height;
      if(r<=0)return -1;
      h+=r+14;
    }
    return c.children.length?h-14:0;
  }
  function balance(){
    const host=grid.closest('.plate-expand');
    if(host&&getComputedStyle(host).display==='none')return;
    ensure();
    const cols=[...grid.children];
    if(!cols.length)return;
    let placed=cols.reduce((n,c)=>n+c.children.length,0);
    while(placed<items.length){
      const col=cols.reduce((a,b)=>a.children.length<=b.children.length?a:b);
      col.appendChild(items[placed++]);
    }
    if(cols.some(c=>measure(c)<0))return;
    for(let g=0;g<600;g++){
      let hMax=-1,hMin=1e9,tall=null,short=null;
      for(const c of cols){
        const h=measure(c);
        if(h>hMax){hMax=h;tall=c;}
        if(h<hMin){hMin=h;short=c;}
      }
      if(!tall||!short||tall===short||hMax-hMin<=16)break;
      const it=tall.lastChild;
      if(!it)break;
      short.appendChild(it);
    }
  }
  function layout(){
    ensure();
    balance();
    if(api.progress)api.progress.sync();
  }
  api.layout=layout;
  api.mount=function(){
    mounted=true;
    imgs.forEach(im=>{if(!im.getAttribute('src'))im.src=im.dataset.src;});
  };
  api.unmount=function(){
    mounted=false;
    imgs.forEach(im=>{if(im.getAttribute('src'))im.removeAttribute('src');});
  };
  api.append=function(urls){
    let added=0;
    urls.forEach(u=>{
      const src=resolve(u);
      if(seenSrcs.has(src))return;
      seenSrcs.add(src);
      const it=el('figure','pw-item');
      const im=new Image();im.loading='lazy';im.decoding='async';
      im.dataset.src=src;
      im.alt=label+' '+(items.length+1);
      im.addEventListener('load',balance);
      im.addEventListener('error',balance);
      it.appendChild(im);
      if(mounted)im.src=src;
      items.push(it);
      imgs.push(im);
      added++;
    });
    if(added)layout();
    return added;
  };
  return api;
}

/* ---- per-section scroll progress (exact Personal Work 01 logic; GPU
        translate3d).  Every gallery section owns an independent instance.
        The host li is hard-clipped (overflow:hidden) and sync clamps the
        stroke column to hairline+PAD .. media bottom-PAD, so a bar always
        stays strictly inside its own section's limits. ---- */
function attachScrollProgress(li){
  const btn=li.querySelector('.plate');
  const nEl=btn.querySelector('.n');
  const bar=el('div','work-scroll-progress');bar.setAttribute('aria-hidden','true');
  const LINES=28;
  bar.style.setProperty('--lines',LINES);
  for(let i=0;i<LINES;i++){
    const s=el('span');
    s.style.setProperty('--i',i);
    bar.appendChild(s);
  }
  li.appendChild(bar);                     /* absolute child => clipped by overflow:hidden */
  const lines=[...bar.children];
  const gallery=()=>li.querySelector('.pw-gallery');
  const PAD=36;                            /* safe margin below hairline & above grid bottom */
  let pitch=3,lastY=-1;

  function stretch(){                       /* fluid stroke spacing (resize only) */
    const gap=Math.max(2,Math.min(4,innerHeight*.006));
    pitch=2+gap;
    lines.forEach((s,i)=>{
      s.style.setProperty('--o',((i-(LINES-1)/2)*pitch).toFixed(1)+'px');
    });
  }
  function place(){                         /* left column directly under the section index */
    const nr=nEl.getBoundingClientRect();
    const lr=li.getBoundingClientRect();
    const mobile=matchMedia('(max-width:768px)').matches;
    const w=mobile?17:34;
    bar.style.width=w+'px';
    bar.style.marginLeft=(mobile
      ? nr.left-lr.left-4
      : nr.left+nr.width/2-lr.left-17).toFixed(1)+'px';
  }
  function sync(){
    const lr=li.getBoundingClientRect();
    const g=gallery();
    const open=!!g&&g.getBoundingClientRect().width>0&&li.classList.contains('expanded');
    if(!open){bar.classList.remove('on');return;}
    const half=pitch*(LINES-1)/2+1;                        /* half the stroke column */
    const safeTop=btn.getBoundingClientRect().bottom-lr.top+PAD+half;   /* below hairline */
    const safeBot=g.getBoundingClientRect().bottom-lr.top-PAD-half;     /* above grid bottom */
    const y=Math.max(safeTop,Math.min(safeBot,(innerHeight/2)-lr.top)); /* clamped center */
    const show=safeBot>=safeTop&&y+lr.top>=-half&&y+lr.top<=innerHeight+half;
    bar.classList.toggle('on',show);
    if(!show)return;
    if(y!==lastY){                          /* one transform write; GPU-composited */
      lastY=y;
      bar.style.transform='translate3d(0,'+y.toFixed(1)+'px,0)';
    }
    const span=lr.height+innerHeight;
    const p=span>0?Math.max(0,Math.min(1,(innerHeight-lr.top)/span)):0;
    bar.style.setProperty('--p',p.toFixed(4));             /* feeds the CSS wave */
  }
  stretch();place();sync();
  let pend=0;
  addEventListener('scroll',()=>{
    if(!li.classList.contains('expanded'))return;   /* zero work when collapsed */
    if(pend)return;
    pend=requestAnimationFrame(()=>{pend=0;sync();});
  },{passive:true});
  addEventListener('resize',()=>{stretch();place();sync();});
  li.addEventListener('load',sync,{capture:true,passive:true});  /* keep the bottom
     bound on the real grid bottom as lazy images finish loading */
  new MutationObserver(()=>sync()).observe(li,{attributes:true,attributeFilter:['class']});
  return {stretch:stretch,place:place,sync:sync};
}

/* ==================== Section 02 (Velma): role + 5 sub-category accordion ==================== */
const VELMA_GROUPS=[
  {label:'2-1 Marketing',files:["001.webp","002.webp","003.webp","004.webp","005.webp","006.webp","007.webp"],note:'I served as assistant art director, with my main tasks being Character Design and Color Design supervisor, as well as assisting with props, FX and BG paint as needed.'},
  {label:'2-2 Expression and Model Sheets',files:["14fa709a-f713-411e-8bdb-9cd1b6f211c2_rw_1200.webp","1972890f-50d8-481a-9052-4e498f168944_rw_600.webp","54eb6f91-ebcd-4f80-82ae-73b377dc3aa5_rw_600.webp","6d7b5599-c34e-454e-9c11-bd0e017691b1_rw_1920.webp","7da3085c-7c28-439f-bb17-e883b1eca6db_rw_1920.webp","a.webp","b.webp","c.webp","d.webp","e.webp","f.webp","g.webp","h.webp","i.webp","l.webp","m.webp","o.webp","p.webp"]},
  {label:'2-3 SPECIAL POSES - Season 1',files:["04783ff2-4977-40dc-a35c-a4c9098e111c_rw_600.webp","0af090f3-cbab-404e-8b0e-b9d8a032cf6e_rw_600.webp","0c0e809e-8cd1-41b1-b905-ab424b03b161_rw_600.webp","15d94f74-79cd-4920-8796-57b868382c12_rw_1920.webp","18813ce6-b669-4971-857c-8bc9bd582b8e_rw_600.webp","1b4700dc-df97-4742-9ef5-80900b0a3e4e_rw_600.webp","2df89212-b384-4d5a-9482-8cff9a888dad_rw_600.webp","35c34ecf-c379-4b64-acab-1d17ff71708e_rw_600.webp","3bd330b4-f171-4e83-9098-e3b777650e64_rw_600.webp","3d97a118-1fa5-42f1-b51e-6e7c69beaa68_rw_3840.webp","445a2491-e5f7-4b91-b3b1-519cf4bd1db2_rw_600.webp","582eab80-d45d-49da-b49d-41e4c3bb92a4_rw_600.webp","6005d585-7909-48a5-9313-48afaf013991_rw_600.webp","60610be4-caa3-4d87-a95d-936bb5d49e2e_rw_600.webp","61117cc4-6a2d-4d84-bed7-b517255b022a_rw_600.webp","64d7c6c2-9936-4dfd-8c46-16f7a05b8383_rw_600.webp","67952a97-1cca-4274-8803-8578dd1881ce_rw_600.webp","67b9a4c4-9e6c-4573-aa5a-cf2203135974_rw_600.webp","765be0f2-5ed9-46bc-bbd7-18e9c4659c50_rw_1920.webp","7ba2b551-2efc-4805-a4bc-4c3405594ede_rw_1920.webp","97686c59-ce89-4db9-831e-b521c5cc830c_rw_600.webp","99cab4bb-ab61-414b-9420-142d3c39e3f7_rw_1200.webp","a16caeef-290b-40c0-b2dd-bcb82b7cfc9a_rw_600.webp","b1d19b11-b2b1-492b-91d2-d685f4a08b38_rw_600.webp","b40d6d4f-837c-4a71-ae2b-7220bf5fa470_rw_600.webp","c3dac756-8af1-434a-ae39-f9c1af1a2e00_rw_600.webp","c3fc166d-c78a-40a8-a791-1bdbd2557584_rw_1920.webp","c9abcd53-573e-4f99-b635-8be875310d83_rw_1920.webp","d4bb3dd2-1138-40c2-8080-54dc96eabff6_rw_1920.webp","da2fc0a3-da0e-4cad-b947-2f32156c380c_rw_600.webp","f207d642-8a97-4ce5-8a50-91ac85d9ad57_rw_600.webp","f2e5134a-99b6-409c-8246-3b63f270e6c4_rw_600.webp","fcb11611-0648-469b-8c3e-766b9e3b1ceb_rw_600.webp"],note:'I am responsible for the character design, color design, and some BG paint. Not responsible for BG design, FX design or Prop design.'},
  {label:'2-4 Season 2',files:["2354c46a-b713-4fae-b2fe-aec952df06ee_rw_600.webp","2c99c818-1165-46da-8e16-dabfa86013c5_rw_1920.webp","2fc76b9f-a54d-44c8-8d90-78db31bf56a2_rw_600.webp","312fe516-5bc4-4d3c-a9c0-d609fadae64e_rw_600.webp","37bef132-3b5e-4d9b-911b-b4cbac7397e4_rw_1920.webp","3c3e6452-5de6-47af-99cd-f363f9ba6ca8_rw_600.webp","3f18b1a5-2846-429d-b93e-6271ddd84a0a_rw_600.webp","54ca3076-6b42-421b-a3b3-4af6b6ab39b7_rw_600.webp","61705d54-ec5d-4b1c-a91b-2fafac34ecb3_rw_600.webp","7a4e17e0-73ca-4ee3-bc08-bd4f3dd5dc21_rw_600.webp","8087f138-a3cb-4c33-918a-faadae32cd7d_rw_600.webp","814f933d-dfb7-4a68-88e0-0a49dea0f94c_rw_600.webp","815e404e-6741-414d-bebc-fbdd75a48e08_rw_600.webp","839709c3-50b1-4467-838d-cba83288ec63_rw_1920.webp","8c41fd65-3c8a-42dd-a291-29324384da14_rw_600.webp","94b4e585-7f1b-4a25-9100-9d1a30bdf6b4_rw_600.webp","9724b7b2-e775-4aac-aa14-369e547a9188_rw_600.webp","9d488473-4610-4fd1-a19f-eb99c18c911d_rw_600.webp","a9641bf9-d126-4f92-8be3-83b82d0b50e1_rw_600.webp","abe26815-23be-443a-b2ab-e703870b326d_rw_1920.webp","b726b904-0aa2-4ebc-b076-d6291f4b983d_rw_600.webp","bd3d86d5-edf2-4bd7-858b-4410ab2a99b9_rw_600.webp","cf80f9aa-2491-488b-b996-84e9f406fc86_rw_1920.webp","dff221ea-cdb0-4d12-8c0c-a9b26cf7f4b2_rw_600.webp","e3ae5db2-e0eb-452e-81c5-68a56b71ba4f_rw_600.webp","e8a92e6c-39ef-467c-9c28-5c12b79e4c26_rw_600.webp","e98789fc-6704-4c7b-ac67-fa7782ed8bcc_rw_600.webp","ed2ec84c-99be-4ae5-ae75-0ac62a714009_rw_600.webp","f09aeba0-6614-47ac-ac0c-20d899eab915_rw_600.webp","f3d441da-4417-4d02-8e21-c38766ff99c7_rw_600.webp","fab0e294-330a-44b3-b6b7-465b2c0db221_rw_600.webp","fd1d18c4-c597-4b11-89f5-eec552f5cc87_rw_600.webp","fe601e95-2759-428b-9929-789a87213a12_rw_1920.webp"]},
  {label:'2-5 LIGHTING DESIGN MODELS',files:["1e7f7c65-47cb-409d-a730-bec06e4fc6e8_rw_600.webp","41b8ca39-6da7-45ee-80a9-8885cda0d4fb_rw_600.webp","4ac5d735-216a-4dd2-8207-82c83fd8e1d1_rw_1200.webp","73388f69-ec5e-4b38-8316-5e93f293c826_rw_1920.webp","75cec900-0aae-4679-9feb-294ecfe93b03_rw_600.webp","8d537717-e263-4ee3-bd32-6cc9c9815fe3_rw_600.webp","e973047c-92ef-46ae-8587-87dc157b0917_rw_600.webp","ee0531e8-0e80-447e-bf40-2256a2af6ab2_rw_600.webp","f05dbec4-f0b2-4709-93ca-33659d9dfbfd_rw_600.webp","f09832e5-5726-4163-8a5c-9f5eaa021fb1_rw_600.webp","fcca7fde-d1ca-4633-a338-c69a8d2d42b9_rw_600.webp"]},
];
let velmaPlate=null,velmaGroups=null;

function syncVelmaPlate(){
  if(!velmaPlate||!velmaGroups)return;
  const open=velmaPlate.classList.contains('expanded');
  velmaGroups.forEach(g=>{
    if(open&&g.group.classList.contains('open'))g.state.mount();
    else g.state.unmount();
  });
}

function buildVelmaBox(){
  const box=el('div','velma-box');
  const acc=el('div','velma-accordion');
  const groups=VELMA_GROUPS.map((g,gi)=>{
    /* every group starts collapsed; only Marketing carries the first-click cue */
    const group=el('div','velma-group'+(gi===0?' cue':''));
    const head=el('button','velma-head');
    head.setAttribute('type','button');
    head.setAttribute('aria-expanded','false');
    const title=g.label.replace(/^2-\d\s+/,'');          /* strip the "2-1" prefix */
    head.innerHTML='<span class="velma-head-label">'+title+'</span><span class="velma-caret" aria-hidden="true"></span>';
    const stage=el('div','velma-stage');
    if(g.note){                                          /* intro/info paragraph in-group */
      const note=el('p','velma-note');
      note.textContent=g.note;
      stage.appendChild(note);
    }
    const gallery=el('div','pw-gallery velma-gallery');
    const state=makeGallery('02/'+encodeURIComponent(g.label),title,g.files);
    gallery.appendChild(state.grid);
    stage.appendChild(gallery);
    group.appendChild(head);
    group.appendChild(stage);
    head.onclick=()=>{
      const open=group.classList.toggle('open');
      head.setAttribute('aria-expanded',open?'true':'false');
      if(open){
        group.classList.remove('cue');                   /* first click answered: no more pulse */
        state.mount();
        state.layout();                                 /* feed + balance the fresh grid */
      }else{
        state.unmount();
      }
      if(window.velmaBarUpdate)window.velmaBarUpdate();
    };
    acc.appendChild(group);
    return {group:group,stage:stage,state:state,label:g.label};
  });
  box.appendChild(acc);
  return {box:box,groups:groups};
}

/* ---- Section 02's own scroll progress: same GPU translate3d wave as the other
        plates, but the bottom bound is re-derived from the live accordion so it
        follows any sub-category opening/closing ---- */
function attachVelmaProgress(li){
  const btn=li.querySelector('.plate');
  const nEl=btn.querySelector('.n');
  const bar=el('div','work-scroll-progress');bar.setAttribute('aria-hidden','true');
  const LINES=28;
  bar.style.setProperty('--lines',LINES);
  for(let i=0;i<LINES;i++){
    const s=el('span');
    s.style.setProperty('--i',i);
    bar.appendChild(s);
  }
  li.appendChild(bar);                       /* absolute child; li clips via overflow:hidden */
  const lines=[...bar.children];
  const PAD=36;                              /* safe margin below hairline & above grid bottom */
  let pitch=3,lastY=-1;

  function stretch(){                        /* fluid stroke spacing (resize only) */
    const gap=Math.max(2,Math.min(4,innerHeight*.006));
    pitch=2+gap;
    lines.forEach((s,i)=>{
      s.style.setProperty('--o',((i-(LINES-1)/2)*pitch).toFixed(1)+'px');
    });
  }
  function place(){                          /* left column directly under the "02" index */
    const nr=nEl.getBoundingClientRect();
    const lr=li.getBoundingClientRect();
    const mobile=matchMedia('(max-width:768px)').matches;
    const w=mobile?17:34;
    bar.style.width=w+'px';
    bar.style.marginLeft=(mobile
      ? nr.left-lr.left-4
      : nr.left+nr.width/2-lr.left-17).toFixed(1)+'px';
  }
  function visibleBottom(){                  /* bottom of the lowest open sub-category */
    let bot=-1e9;
    li.querySelectorAll('.velma-stage').forEach(st=>{
      if(st.offsetWidth===0&&st.offsetHeight===0)return;
      const g=st.querySelector('.pw-gallery');
      if(g){const r=g.getBoundingClientRect();if(r.bottom>bot)bot=r.bottom;}
    });
    return bot;
  }
  function sync(){
    const lr=li.getBoundingClientRect();
    const open=li.classList.contains('expanded');
    if(!open){bar.classList.remove('on');return;}
    const half=pitch*(LINES-1)/2+1;                       /* half the stroke column */
    const safeTop=btn.getBoundingClientRect().bottom-lr.top+PAD+half;  /* below hairline */
    const safeBot=visibleBottom()-lr.top-PAD-half;                    /* above last grid */
    const y=Math.max(safeTop,Math.min(safeBot,(innerHeight/2)-lr.top)); /* clamped center */
    const show=safeBot>=safeTop&&y+lr.top>=-half&&y+lr.top<=innerHeight+half;
    bar.classList.toggle('on',show);
    if(!show)return;
    if(y!==lastY){                           /* one transform write; GPU-composited */
      lastY=y;
      bar.style.transform='translate3d(0,'+y.toFixed(1)+'px,0)';
    }
    const span=lr.height+innerHeight;
    const p=span>0?Math.max(0,Math.min(1,(innerHeight-lr.top)/span)):0;
    bar.style.setProperty('--p',p.toFixed(4));             /* feeds the CSS wave */
  }
  stretch();place();sync();
  let pend=0;
  addEventListener('scroll',()=>{
    if(!li.classList.contains('expanded'))return;   /* zero work when collapsed */
    if(pend)return;
    pend=requestAnimationFrame(()=>{pend=0;sync();});
  },{passive:true});
  addEventListener('resize',()=>{stretch();place();sync();});
  li.addEventListener('load',sync,{capture:true,passive:true});  /* cling to the live
     bottom as lazy images finish loading inside any open sub-category */
  new MutationObserver(()=>{
    sync();                                    /* follow expanded/collapsed changes */
    if(li.classList.contains('expanded')&&velmaGroups){
      velmaGroups.forEach(g=>{if(g.group.classList.contains('open'))g.state.layout();});
    }
  }).observe(li,{attributes:true,attributeFilter:['class']});
  window.velmaBarUpdate=sync;
  return {stretch:stretch,place:place,sync:sync};
}
addEventListener('resize',()=>{
  if(velmaPlate&&velmaPlate.classList.contains('expanded')&&velmaGroups){
    velmaGroups.forEach(g=>{if(g.group.classList.contains('open'))g.state.layout();});
  }
});

/* ---- 3-image preview grid shown in the hover-peek state ---- */
function buildThumbs(i){
  const wrap=el('div','plate-thumbs');
  wrap.setAttribute('aria-hidden','true');
  let files=GAL_FILES[i]?GAL_FILES[i].slice(0,3):null;
  let base=null;
  if(!files&&i===1){files=VELMA_GROUPS[0].files.slice(0,3);base=DIR+'pic%20work/02/'+encodeURIComponent(VELMA_GROUPS[0].label)+'/';}
  else if(files){base=DIR+'pic%20work/'+String(i+1).padStart(2,'0')+'/';}
  if(!files||!base)return wrap;
  files.forEach(f=>{
    const im=new Image();im.loading='lazy';im.decoding='async';
    im.src=/^https?:/.test(f)?f:base+encodeURIComponent(f);im.alt='';
    wrap.appendChild(im);
  });
  return wrap;
}

/* ---- plate list: numbered 01-10, glassmorphic galleries on 01 and 03-10,
         role + accordion on 02 (Velma) ---- */
const galleryState=[];
PAGES.forEach((p,i)=>{
  const li=el('li','plate-item');
  const btn=el('button','plate');
  btn.setAttribute('type','button');
  btn.setAttribute('aria-expanded','false');
  btn.innerHTML='<span class="plate-inner"><span class="n">'+String(i+1).padStart(2,'0')+'</span>'+
              '<span class="t">'+p.title+'</span>'+
              '<span class="plate-arrow" aria-hidden="true">'+
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+
                  '<polyline points="6 9 12 15 18 9"/>'+
                '</svg>'+
              '</span></span>';
  const expand=el('div','plate-expand');
  const content=el('div','plate-content');
  const thumbs=buildThumbs(i);          /* 3-image preview grid */
  content.appendChild(thumbs);
  const body=el('div','plate-body');
  if(GAL_FILES[i]){
    const folder=String(i+1).padStart(2,'0');
    const gallery=el('div','pw-gallery');
    const state=makeGallery(folder,p.title,GAL_FILES[i]);
    gallery.appendChild(state.grid);
    body.appendChild(gallery);
    galleryState[i]=state;
    li.classList.add('pw-plate');
  }else if(i===1){
    /* Section 02 — Velma: role blurb + sub-category accordion (kept as-is) */
    const vb=buildVelmaBox();
    li.classList.add('velma-plate');
    body.appendChild(vb.box);
    velmaGroups=vb.groups;
  }else{
    const img=new Image();img.loading='lazy';img.decoding='async';img.src=p.url;img.alt=p.title;img.className='plate-preview';
    body.appendChild(img);
  }
  content.appendChild(body);
  expand.appendChild(content);
  li.appendChild(btn);
  li.appendChild(expand);

  const closeItem=()=>{
    li.classList.remove('expanded');
    btn.setAttribute('aria-expanded','false');
    if(galleryState[i])galleryState[i].unmount();
    syncVelmaPlate();
    if(expandedPlate.el===li)expandedPlate.el=null;
  };
  const openItem=()=>{
    if(expandedPlate.el&&expandedPlate.el!==li){
      const prev=[...plateList.children].indexOf(expandedPlate.el);
      if(galleryState[prev])galleryState[prev].unmount();
      expandedPlate.el.classList.remove('expanded');
      expandedPlate.el.querySelector('.plate').setAttribute('aria-expanded','false');
      const pl=expandedPlate.el;
      syncVelmaPlate();
      if(pl.classList.contains('preview'))pl.classList.remove('preview');
    }
    li.classList.add('expanded');
    btn.setAttribute('aria-expanded','true');
    expandedPlate.el=li;
    if(galleryState[i]){galleryState[i].mount();galleryState[i].layout();}
    syncVelmaPlate();
  };
  /* CLICK — toggle the full expanded view; clicking again rotates the
     arrow upward and collapses the section */
  btn.onclick=(e)=>{
    e.stopPropagation();
    if(li.classList.contains('expanded')){
      closeItem();
      if(li.classList.contains('preview'))li.classList.remove('preview');
    }else{
      openItem();
    }
  };
  /* HOVER — peek the row's description + 3 thumbnails, closing previously
     active items smoothly */
  li.addEventListener('mouseenter',()=>{
    plateList.querySelectorAll('.plate-item').forEach(other=>{
      if(other===li)return;
      if(other.classList.contains('preview'))other.classList.remove('preview');
      if(other.classList.contains('expanded')){
        const oi=[...plateList.children].indexOf(other);
        other.classList.remove('expanded');
        other.querySelector('.plate').setAttribute('aria-expanded','false');
        if(galleryState[oi])galleryState[oi].unmount();
        syncVelmaPlate();
        if(expandedPlate.el===other)expandedPlate.el=null;
      }
    });
    li.classList.add('preview');
  });
  li.addEventListener('mouseleave',()=>{
    li.classList.remove('preview');
  });

  plateList.appendChild(li);
  if(GAL_FILES[i])galleryState[i].progress=attachScrollProgress(li);
  if(i===1){velmaPlate=li;attachVelmaProgress(li);}
});
/* Personal Work is active on page load: only the top 3 preview thumbnails
   render (lazy). The full gallery grid is NOT built or preloaded until the
   row is clicked. */
(function(){
  const first=plateList.firstElementChild;
  if(!first)return;
  first.classList.add('preview');
  const b=first.querySelector('.plate');
  if(b)b.setAttribute('aria-expanded','false');
})();
addEventListener('resize',()=>{
  plateList.querySelectorAll('.plate-item.pw-plate.expanded').forEach(li=>{
    const i=[...plateList.children].indexOf(li);
    if(galleryState[i])galleryState[i].layout();
  });
});

/* ==================== dynamic rows from Sanity ==================== */
/* A Sanity `work` doc becomes a full accordion row: same header (indexN
   + title + toggle), 3 preview thumbnails, and a masonry full-gallery
   with the shared lightbox.  Plumbing mirrors the static rows above. */
function buildDynamicPlate(doc){
  const galleryUrls=[...new Set((doc.fullGallery||[]).map(sanityImageUrl).filter(Boolean))];
  if(!galleryUrls.length)return null;
  const previewUrls=[...new Set((doc.previewImages||[]).map(sanityImageUrl).filter(Boolean))].slice(0,3);
  const li=el('li','plate-item');
  const btn=el('button','plate');
  btn.setAttribute('type','button');
  btn.setAttribute('aria-expanded','false');
  const inner=el('span','plate-inner');
  const n=el('span','n');n.textContent=String(doc.indexNumber||'').trim();
  const t=el('span','t');t.textContent=doc.title||'';
  const arrow=el('span','plate-arrow');arrow.setAttribute('aria-hidden','true');
  arrow.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  inner.appendChild(n);inner.appendChild(t);inner.appendChild(arrow);
  btn.appendChild(inner);

  const expand=el('div','plate-expand');
  const content=el('div','plate-content');
  const thumbs=el('div','plate-thumbs');thumbs.setAttribute('aria-hidden','true');
  previewUrls.forEach(u=>{
    const im=new Image();im.loading='lazy';im.decoding='async';im.src=u;im.alt='';
    thumbs.appendChild(im);
  });
  content.appendChild(thumbs);
  const body=el('div','plate-body');
  const gallery=el('div','pw-gallery');
  const state=makeGallery('',t.textContent,galleryUrls);
  gallery.appendChild(state.grid);
  body.appendChild(gallery);
  content.appendChild(body);
  expand.appendChild(content);
  li.appendChild(btn);li.appendChild(expand);
  li.classList.add('pw-plate');

  const closeDyn=()=>{
    li.classList.remove('expanded');
    btn.setAttribute('aria-expanded','false');
    state.unmount();
    if(expandedPlate.el===li)expandedPlate.el=null;
  };
  const openDyn=()=>{
    if(expandedPlate.el&&expandedPlate.el!==li){
      const prev=[...plateList.children].indexOf(expandedPlate.el);
      if(galleryState[prev])galleryState[prev].unmount();
      expandedPlate.el.classList.remove('expanded');
      const pb=expandedPlate.el.querySelector('.plate');if(pb)pb.setAttribute('aria-expanded','false');
      const pl=expandedPlate.el;
      syncVelmaPlate();
      if(pl.classList.contains('preview'))pl.classList.remove('preview');
    }
    li.classList.add('expanded');
    btn.setAttribute('aria-expanded','true');
    expandedPlate.el=li;
    state.mount();state.layout();
    syncVelmaPlate();
  };
  btn.onclick=e=>{
    e.stopPropagation();
    if(li.classList.contains('expanded')){closeDyn();if(li.classList.contains('preview'))li.classList.remove('preview');}
    else openDyn();
  };
  li.addEventListener('mouseenter',()=>{
    plateList.querySelectorAll('.plate-item').forEach(other=>{
      if(other===li)return;
      if(other.classList.contains('preview'))other.classList.remove('preview');
      if(other.classList.contains('expanded')){
        const oi=[...plateList.children].indexOf(other);
        other.classList.remove('expanded');
        const ob=other.querySelector('.plate');if(ob)ob.setAttribute('aria-expanded','false');
        if(galleryState[oi])galleryState[oi].unmount();
        syncVelmaPlate();
        if(expandedPlate.el===other)expandedPlate.el=null;
      }
    });
    li.classList.add('preview');
  });
  li.addEventListener('mouseleave',()=>{li.classList.remove('preview');});

  plateList.appendChild(li);
  state.progress=attachScrollProgress(li);
  galleryState[plateList.children.length-1]=state;
  return li;
}

function mkIndex(v){
  const s=String(v||'').trim();
  if(/^\d+$/.test(s))return String(parseInt(s,10)).padStart(2,'0');
  return s.toLowerCase();
}
function appendThumbs(li,urls){
  const wrap=li.querySelector('.plate-thumbs');
  if(!wrap)return;
  const seen=new Set();
  wrap.querySelectorAll('img').forEach(im=>{
    const s=im.getAttribute('src')||im.getAttribute('data-src');
    if(s)seen.add(s);
  });
  urls.forEach(u=>{
    if(seen.has(u))return;
    seen.add(u);
    const im=new Image();im.loading='lazy';im.decoding='async';im.src=u;im.alt='';
    wrap.appendChild(im);
  });
}
function appendVelmaGroup(plate,urls,title){
  const acc=plate.querySelector('.velma-accordion');
  if(!acc||!urls.length)return 0;
  const label=title||'Studio Gallery';
  const group=el('div','velma-group');
  const head=el('button','velma-head');
  head.setAttribute('type','button');
  head.setAttribute('aria-expanded','false');
  head.innerHTML='<span class="velma-head-label">'+label+'</span><span class="velma-caret" aria-hidden="true"></span>';
  const stage=el('div','velma-stage');
  const gallery=el('div','pw-gallery velma-gallery');
  const state=makeGallery('02/'+encodeURIComponent(label),label,urls);
  gallery.appendChild(state.grid);
  stage.appendChild(gallery);
  group.appendChild(head);
  group.appendChild(stage);
  head.onclick=()=>{
    const open=group.classList.toggle('open');
    head.setAttribute('aria-expanded',open?'true':'false');
    if(open){group.classList.remove('cue');state.mount();state.layout();}
    else{state.unmount();}
    if(window.velmaBarUpdate)window.velmaBarUpdate();
  };
  acc.appendChild(group);
  if(velmaGroups)velmaGroups.push({group:group,stage:stage,state:state,label:label});
  return urls.length;
}

function loadSanityWork(){
  if(loadSanityWork.done)return;
  loadSanityWork.done=true;
  const query='*[_type == "work"] | order(indexNumber asc)';
  const url='https://'+SANITY_WORK.projectId+'.apicdn.sanity.io/v'+
    SANITY_WORK.apiVersion+'/data/query/'+SANITY_WORK.dataset+
    '?query='+encodeURIComponent(query);
  fetch(url,{headers:{Accept:'application/json'}})
    .then(r=>{if(!r.ok)throw new Error('Sanity query failed ('+r.status+')');return r.json();})
    .then(json=>{
      const docs=((json&&json.result)||[]).filter(d=>d&&d._type==='work');
      const rows={};
      const seen=new Set();
      plateList.querySelectorAll('.plate-item').forEach(li=>{
        const nEl=li.querySelector('.n');
        const n=mkIndex(nEl&&nEl.textContent);
        if(!n)return;
        const index=[...plateList.children].indexOf(li);
        rows[n]={li:li,index:index,state:galleryState[index],isVelma:li.classList.contains('velma-plate')};
        seen.add(n);
      });
      let added=0,merged=0;
      docs.forEach(doc=>{
        const idx=mkIndex(doc.indexNumber);
        if(!idx)return;
        const previewUrls=[...new Set((doc.previewImages||[]).map(sanityImageUrl).filter(Boolean))];
        const galleryUrls=[...new Set((doc.fullGallery||[]).map(sanityImageUrl).filter(Boolean))];
        const row=rows[idx];
        if(row){
          /* matching local row: append, never overwrite */
          let changed=false;
          if(previewUrls.length){
            const before=row.li.querySelectorAll('.plate-thumbs img').length;
            appendThumbs(row.li,previewUrls);
            if(row.li.querySelectorAll('.plate-thumbs img').length>before)changed=true;
          }
          if(galleryUrls.length){
            if(row.state&&typeof row.state.append==='function'){
              if(row.state.append(galleryUrls)>0)changed=true;
            }else if(row.isVelma){
              if(appendVelmaGroup(row.li,galleryUrls,doc.title)>0)changed=true;
            }
          }
          if(changed)merged++;
          return;
        }
        /* completely new indexNumber — render a fresh accordion row */
        if(seen.has(idx))return;
        const li=buildDynamicPlate(doc);
        if(!li)return;
        seen.add(idx);added++;
        const index=[...plateList.children].indexOf(li);
        rows[idx]={li:li,index:index,state:galleryState[index],isVelma:false};
      });
      if(added>0||merged>0)console.info('[sketchbook] merged',merged,'row(s) & appended',added,'new row(s) from Sanity');
    })
    .catch(err=>{
      const msg=err&&err.message||err;
      const corsHint=/Failed to fetch|NetworkError|CORS/i.test(String(msg))
        ? ' — add this site root origin to Sanity › API › CORS origins (project 3at3ce71) to load work rows here'
        : '';
      console.warn('[sketchbook] Sanity work fetch skipped, static rows remain active:',msg+corsHint);
    });
}
setTimeout(loadSanityWork,0);

function marks(){
  const cur=turn?turn.to:idx;
  plateList.querySelectorAll('.plate').forEach((b,i)=>b.setAttribute('aria-current',i===cur?'true':'false'));
}

/* ---------------------------------------------------------- the riffle */
let riffle=null,riffleAt=0,introOn=false;
function endIntro(){
  introOn=false;wrap.classList.remove('intro','b2');
}
function riffleStep(){
  prime((idx+1)%M);prime((idx+2)%M);   /* stay one turn ahead of the riffle */
  const s=riffle[riffleAt];
  wrap.classList.toggle('b2',s.bell>0.55);
  startTurn('next',0);
  tweenTo(1,s.dur,()=>{
    try{
      idx=turn.to;turn=null;
      riffleAt++;
      if(introOn&&riffleAt<riffle.length){paint();riffleStep();}
      else{endIntro();paint();}
    }catch(err){
      console.error('[sketchbook] riffle step error:',err);
      try{endIntro();paint();}catch(_e){/* already surfaced */}
      if(typeof startAutoFlip==='function')startAutoFlip();
    }
  });
}
function startIntro(){
  const coarse=matchMedia('(max-width: 640px), (pointer: coarse)').matches;
  if(coarse||REDUCED||Q.has('nointro')){idx=LAND;paint();setTimeout(startAutoFlip,4000);return;}
  const steps=M+LAND;
  riffle=[];
  for(let r=0;r<steps;r++){
    const bell=Math.sin(Math.PI*(r/(steps-1)));
    riffle.push({bell:bell,dur:0.26-0.19*bell});
  }
  riffleAt=0;introOn=true;wrap.classList.add('intro');
  riffleStep();
}

/* ------------------------------------------------------------- boot */
(async function boot(){
  try{
    idx=Q.has('shot')?(parseInt(Q.get('shot'),10)||0)%M:0;
    paint();applyView();
    /* Restored intro handshake: warm the whole spread deck in the
       background so every riffle step finds a cached frame, but only WAIT
       on decoding the two opening pages (race-capped at 1.5s) so the
       riffle opens on real artwork instead of blank paper, and a hung
       request can never stall first paint. Nothing else — fonts, decodes,
       3.webp..10.webp — is ever awaited. */
    for(let n=0;n<M;n++)prime(n);
    const settle=im=>im.decode?im.decode().catch(()=>{}):new Promise(r=>{im.onload=im.onerror=r});
    await Promise.race([
      Promise.all([settle(prime(idx)),settle(prime((idx+1)%M))]),
      new Promise(r=>setTimeout(r,1500))
    ]);
    syncZoom();restLoupe();
    document.body.dataset.ready='1';
    if(Q.has('shot')){
      if(Q.has('t')){startTurn(Q.get('dir')||'next',parseFloat(Q.get('t')));}
      return;
    }
    startIntro();
  }catch(err){
    console.error('[sketchbook] boot error:',err);
    try{
      document.body.dataset.ready='1';
      if(!Q.has('shot')){idx=Math.max(0,idx||0);paint();startIntro();}
    }catch(e2){console.error('[sketchbook] riffle recovery failed:',e2);}
  }
})();

/* --------------------------------------------------- auto-flip timer */
let autoFlipTimer=null;
let autoFlipPaused=false;
const AUTO_FLIP_DELAY=5000;
function startAutoFlip(){
  stopAutoFlip();
  autoFlipTimer=setInterval(()=>{
    if(autoFlipPaused||turn||introOn||drag)return;
    step('next');
  },AUTO_FLIP_DELAY);
}
function stopAutoFlip(){
  if(autoFlipTimer){clearInterval(autoFlipTimer);autoFlipTimer=null;}
}
function pauseAutoFlip(){autoFlipPaused=true;}
function resumeAutoFlip(){autoFlipPaused=false;}
/* pause auto-flip on pointer interaction over the book area */
stage.addEventListener('pointerenter',pauseAutoFlip);
stage.addEventListener('pointerleave',resumeAutoFlip);
stage.addEventListener('pointerdown',pauseAutoFlip);
stage.addEventListener('pointerup',()=>{
  setTimeout(resumeAutoFlip,1000);
});
/* auto-flip begins once the intro finishes, or shortly after load when the
   intro is skipped for coarse/reduced-motion visitors */
const origEndIntro=endIntro;
endIntro=function(){origEndIntro();setTimeout(startAutoFlip,500);};
/* ---- mobile-only floating ↑: appears only while a plate is open and the
        user has scrolled down past its header; click smooth-scrolls back to
        the top of the currently active plate section (no-op on desktop) ---- */
(function(){
  const btn=document.getElementById('toTop');
  if(!btn)return;
  let pend=0;
  function syncToTop(){
    const li=expandedPlate?expandedPlate.el:null;
    const head=li?li.querySelector('.plate'):null;
    if(!head){btn.classList.remove('show');return;}
    const r=head.getBoundingClientRect();
    btn.classList.toggle('show',r.bottom<24);
  }
  btn.addEventListener('click',()=>{
    const li=expandedPlate?expandedPlate.el:null;
    const head=li?li.querySelector('.plate'):null;
    if(!head)return;
    const topY=head.getBoundingClientRect().top+scrollY-16;
    window.scrollTo({top:Math.max(0,topY),behavior:'smooth'});
  });
  addEventListener('scroll',()=>{
    if(pend)return;
    pend=requestAnimationFrame(()=>{pend=0;syncToTop();});
  },{passive:true});
  addEventListener('resize',syncToTop);
  syncToTop();
})();
/* ---- global lightbox (purely additive; Sections 01-10) ---- */
(function(){
  var lb=null,list=[],idx=-1,closeBtn,prevBtn,nextBtn;
  function build(){
    lb=document.createElement('div');lb.className='lb';
    lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
    lb.setAttribute('aria-label','Image viewer');
    lb.innerHTML='<button class="lb-close" type="button" aria-label="Close">&times;</button>'+
      '<button class="lb-prev" type="button" aria-label="Previous image">&lsaquo;</button>'+
      '<figure class="lb-frame"><img loading="lazy" decoding="async" class="lb-img" alt=""></figure>'+
      '<button class="lb-next" type="button" aria-label="Next image">&rsaquo;</button>';
    document.body.appendChild(lb);
    closeBtn=lb.querySelector('.lb-close');
    prevBtn=lb.querySelector('.lb-prev');
    nextBtn=lb.querySelector('.lb-next');
    lb.addEventListener('click',function(e){
      if(e.target===lb||e.target.classList&&e.target.classList.contains('lb-frame'))close();
    });
    closeBtn.addEventListener('click',close);
    prevBtn.addEventListener('click',function(){step(-1);});
    nextBtn.addEventListener('click',function(){step(1);});
  }
  function open(im){
    if(!lb)build();
    var plate=im.closest('.plate-item');
    list=plate?[].slice.call(plate.querySelectorAll('.pw-item img,.plate-preview')):[im];
    idx=list.indexOf(im);if(idx<0)idx=0;
    show(list[idx]);
    lb.classList.add('open');lb.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    closeBtn.focus();
  }
  function show(im){
    var img=lb.querySelector('.lb-img');
    img.src=im.currentSrc||im.src;img.alt=im.alt||'';
    var off=list.length<=1;
    prevBtn.classList.toggle('lb-off',off);
    nextBtn.classList.toggle('lb-off',off);
  }
  function step(d){
    if(list.length<=1)return;
    idx=(idx+d+list.length)%list.length;
    show(list[idx]);
  }
  function close(){
    if(!lb||!lb.classList.contains('open'))return;
    lb.classList.remove('open');lb.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  document.addEventListener('click',function(e){
    var im=e.target.closest('.pw-item img,.plate-preview');
    if(im)open(im);
  });
  document.addEventListener('keydown',function(e){
    if(!lb||!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
    else if(e.key==='ArrowRight'){e.preventDefault();step(1);}
  });
})();
/* ---- glowing bio: char-by-char reveal (mirrors GlowingText) ---- */
(function(){
  var START_DELAY=0.2, STAGGER=0.02, DURATION=0.5, LINE_GAP=0.15;
  var BIO_TEXT=[
    "Adam Fay is an Art Director and Lead Character Designer renowned for bringing creatures, bold personalities and vibrant worlds to life in animation. With over a decade of experience, Adam's journey has taken him through beloved animated series including Velma, Harley Quinn, The Cuphead Show!, Final Space, Close Enough, and more, making him a major creative force behind adult animation's growing artistic depth.",
    "As an Art Director at Titmouse, and Assistant Art Director and Lead Character Designer on Velma, Adam pushed forward a style infused with expressive realism, grounded anatomy, and heightened emotion marking a pivotal moment in his career. He is currently developing a new show at Amazon MGM Studios / Prime Video."
  ];
  function tokenize(value){
    var matches=value.match(/\s+|\S+/g)||[];
    var offset=0;
    return matches.map(function(text){
      var start=offset;
      offset+=Array.from(text).length;
      return{text:text,isSpace:/^\s/.test(text),start:start};
    });
  }
  var containers=[].slice.call(document.querySelectorAll('#about .bio'));
  if(!containers.length)return;
  var tokens=BIO_TEXT.map(function(block){return tokenize(block);});
  var charDelays=[];
  var elapsed=START_DELAY;
  tokens.forEach(function(line){
    var count=0;
    line.forEach(function(t){count+=Array.from(t.text).length;});
    var delays=[];
    for(var i=0;i<count;i++)delays.push(elapsed+i*STAGGER);
    var lineDuration=count>0?(count-1)*STAGGER+DURATION:0;
    elapsed+=lineDuration+Math.max(LINE_GAP,0);
    charDelays.push(delays);
  });
  tokens.forEach(function(line,li){
    var host=containers[li];
    host.classList.add('bio-glow');
    line.forEach(function(token,ti){
      if(token.isSpace){
        var sp=document.createElement('span');
        sp.textContent=token.text;
        host.appendChild(sp);
        return;
      }
      var word=document.createElement('span');
      word.className='glowing-text-word';
      Array.from(token.text).forEach(function(ch,ci){
        var c=document.createElement('span');
        c.className='glowing-text-char';
        c.setAttribute('aria-hidden','true');
        c.style.setProperty('--char-delay',charDelays[li][token.start+ci].toFixed(2)+'s');
        c.style.setProperty('--char-duration',DURATION.toFixed(2)+'s');
        c.textContent=ch;
        word.appendChild(c);
      });
      host.appendChild(word);
    });
  });
})();