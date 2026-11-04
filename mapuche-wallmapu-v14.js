/* Cultura Mapuche y Territorio — capa de experiencia "Wall Mapu" v14.
   Solo composición, movimiento e interacción. No crea ni modifica texto pedagógico:
   todo lo visible sigue proviniendo de mapuche-data.js (guion aprobado). */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
const root=document.documentElement,stage=$('#stage'),layer=$('#layer'),narrator=$('#narrator');
const M=window.MotorMapuche;if(!stage||!M)return;
const D=M.getData();
const mq=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(pointer:fine)');
const reduced=()=>mq.matches||root.dataset.reducedMotion==='true';
root.classList.add('wallmapu-v14');

/* Ambiente por lámina: elegido por la imagen y el tema de cada pantalla, sin texto nuevo. */
const MOOD={'cm-s01':'dawn','cm-s02':'motes','cm-s03':'motes','cm-s04':'motes','cm-s05':'stars','cm-s06':'stars','cm-s07':'motes','cm-s10':'dawn','cm-s11':'motes','cm-s12':'motes','cm-s13':'embers','cm-s14':'embers','cm-s15':'motes','cm-s16':'mist','cm-s17':'mist','cm-s20':'dawn'};

/* ---------- Lienzo atmosférico ---------- */
const cv=document.createElement('canvas');cv.id='wallmapu-atmos';cv.setAttribute('aria-hidden','true');
const shade=$('.shade');(shade||document.body.firstChild).after(cv);
const fx=document.createElement('canvas');fx.id='wallmapu-fx';fx.setAttribute('aria-hidden','true');document.body.append(fx);
const ctx=cv.getContext('2d'),fctx=fx.getContext('2d');
let W=0,H=0,DPR=1,parts=[],mood='',raf=0,last=0,shoot=null,bursts=[];
function size(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;for(const c of [cv,fx]){c.width=W*DPR;c.height=H*DPR;c.style.width=W+'px';c.style.height=H+'px'}ctx.setTransform(DPR,0,0,DPR,0,0);fctx.setTransform(DPR,0,0,DPR,0,0);seed(mood,true)}
const rnd=(a,b)=>a+Math.random()*(b-a);
function seed(m,keep){mood=m;const area=W*H/(1280*720),mobile=W<760;let n=0;
 if(m==='stars')n=150;else if(m==='embers')n=46;else if(m==='mist')n=34;else if(m==='dawn')n=38;else if(m==='motes')n=30;
 n=Math.round(n*Math.min(1.4,Math.max(.5,area))*(mobile?.6:1));
 if(keep&&parts.length===n)return;
 parts=Array.from({length:n},()=>make(m,true))}
function make(m,init){const p={x:rnd(0,W),y:init?rnd(0,H):H+10,r:1,a:0,vx:0,vy:0,t:rnd(0,6.28),s:rnd(.3,1)};
 if(m==='stars'){p.y=rnd(0,H*.72);p.r=rnd(.35,1.45);p.a=rnd(.25,.95);p.s=rnd(.6,2.2)}
 else if(m==='embers'){p.r=rnd(.8,2.3);p.vy=-rnd(.18,.55);p.vx=rnd(-.12,.12);p.a=rnd(.35,.85);p.life=rnd(.55,1)}
 else if(m==='mist'){p.r=rnd(30,90);p.vx=rnd(.04,.16);p.vy=rnd(-.02,.02);p.a=rnd(.025,.06);p.y=rnd(H*.35,H)}
 else {p.r=rnd(.7,1.9);p.vy=-rnd(.03,.16);p.vx=rnd(-.08,.08);p.a=rnd(.18,.55)}
 return p}
function draw(ts){raf=requestAnimationFrame(draw);if(ts-last<32)return;const dt=Math.min(3,(ts-last)/16.7);last=ts;
 ctx.clearRect(0,0,W,H);const light=root.dataset.appearance==='light';const gold=light?'150,112,20':'246,214,128';
 for(const p of parts){p.t+=.02*dt*p.s;
  if(mood==='stars'){const tw=.55+.45*Math.sin(p.t*1.7);ctx.globalAlpha=p.a*tw*(light?.5:1);ctx.fillStyle=light?'rgb(120,100,60)':'#fff8e6';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();if(p.r>1.25){ctx.globalAlpha*=.35;ctx.fillRect(p.x-p.r*3,p.y-.25,p.r*6,.5);ctx.fillRect(p.x-.25,p.y-p.r*3,.5,p.r*6)}}
  else if(mood==='mist'){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x-p.r>W)p.x=-p.r;const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,`rgba(${light?'255,255,255':'235,228,205'},${p.a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2)}
  else{p.x+=(p.vx+Math.sin(p.t)*.12)*dt;p.y+=p.vy*dt;let a=p.a;
   if(mood==='embers'){p.life-=.0016*dt;a*=Math.max(0,p.life);if(p.life<=0||p.y<-10)Object.assign(p,make('embers',false));ctx.fillStyle=`rgba(255,${150+Math.round(60*Math.sin(p.t))},70,1)`}
   else{if(p.y<-10)Object.assign(p,make(mood,false));ctx.fillStyle=`rgba(${gold},1)`}
   ctx.globalAlpha=a*(.6+.4*Math.sin(p.t*2))*(light?.55:1);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();
   ctx.globalAlpha*=.18;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,6.283);ctx.fill()}}
 if(mood==='stars'&&!light){if(!shoot&&Math.random()<.0035*dt)shoot={x:rnd(W*.15,W*.85),y:rnd(10,H*.3),l:0};if(shoot){shoot.l+=7*dt;const len=Math.min(110,shoot.l),x=shoot.x+shoot.l,y=shoot.y+shoot.l*.36;const g=ctx.createLinearGradient(x,y,x-len,y-len*.36);g.addColorStop(0,'rgba(255,248,225,.85)');g.addColorStop(1,'rgba(255,248,225,0)');ctx.globalAlpha=Math.max(0,1-shoot.l/340);ctx.strokeStyle=g;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-len,y-len*.36);ctx.stroke();if(shoot.l>340)shoot=null}}
 ctx.globalAlpha=1;drawBursts(dt)}
function run(){cancelAnimationFrame(raf);raf=0;if(reduced()||document.hidden){ctx.clearRect(0,0,W,H);cv.dataset.off='true';if(bursts.length&&!reduced())raf=requestAnimationFrame(draw);return}cv.dataset.off='false';last=0;raf=requestAnimationFrame(draw)}

/* ---------- Celebración: destellos y estrella que viaja al contador ---------- */
function burst(x,y){if(reduced())return;for(let i=0;i<70;i++){const a=rnd(0,6.283),v=rnd(1.2,5.2);bursts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.2,r:rnd(1,2.8),life:1,star:Math.random()<.25})}if(!raf)run();else if(cv.dataset.off==='true'){raf=requestAnimationFrame(draw)}}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const rr=i%2?r*.45:r,a=-Math.PI/2+i*Math.PI/5;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}
function drawBursts(dt){fctx.clearRect(0,0,W,H);if(!bursts.length)return;for(const b of bursts){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=.07*dt;b.vx*=.985;b.life-=.012*dt;fctx.globalAlpha=Math.max(0,b.life);fctx.fillStyle=b.star?'#fff3b8':'#e7c02e';if(b.star)star(fctx,b.x,b.y,b.r*2.6);else{fctx.beginPath();fctx.arc(b.x,b.y,b.r,0,6.283);fctx.fill()}}bursts=bursts.filter(b=>b.life>0);fctx.globalAlpha=1}
function flyStar(fromEl){const to=$('#course-rewards');if(!to||reduced())return;const a=fromEl.getBoundingClientRect(),b=to.getBoundingClientRect();const s=document.createElement('span');s.className='wallmapu-flying-star';s.textContent='★';s.setAttribute('aria-hidden','true');document.body.append(s);const x0=a.left+a.width/2,y0=a.top+a.height*.35,x1=b.left+12,y1=b.top+b.height/2;s.animate([{transform:`translate(${x0}px,${y0}px) scale(2.4) rotate(0deg)`,opacity:0},{transform:`translate(${x0}px,${y0-40}px) scale(2.8) rotate(90deg)`,opacity:1,offset:.25},{transform:`translate(${(x0+x1)/2}px,${Math.min(y0,y1)-120}px) scale(1.6) rotate(220deg)`,opacity:1,offset:.6},{transform:`translate(${x1}px,${y1}px) scale(.8) rotate(360deg)`,opacity:.9}],{duration:1500,easing:'cubic-bezier(.45,.05,.3,1)'}).finished.then(()=>{s.remove();to.classList.remove('wallmapu-reward-pulse');void to.offsetWidth;to.classList.add('wallmapu-reward-pulse')})}
/* La ventana de feedback vive en la capa superior del navegador: los destellos se dibujan dentro de ella
   y, al cerrarla con la equis, la estrella viaja hasta el contador del pie. */
let pendingStar=false,lastSeq='';
function inLayerBurst(){if(reduced())return;const c=document.createElement('canvas');c.className='v14-layer-burst';c.setAttribute('aria-hidden','true');layer.append(c);const r=layer.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);c.width=r.width*dpr;c.height=r.height*dpr;const g=c.getContext('2d');g.scale(dpr,dpr);const ps=Array.from({length:80},()=>{const a=rnd(0,6.283),v=rnd(1.4,5.5);return{x:r.width/2,y:56,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.4,r:rnd(1,2.6),life:1,star:Math.random()<.3}});let t0=0;const step=ts=>{const dt=t0?Math.min(3,(ts-t0)/16.7):1;t0=ts;g.clearRect(0,0,r.width,r.height);let alive=0;for(const b of ps){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=.06*dt;b.vx*=.985;b.life-=.011*dt;if(b.life<=0)continue;alive++;g.globalAlpha=b.life;g.fillStyle=b.star?'#fff3b8':'#e7c02e';if(b.star)star(g,b.x,b.y,b.r*2.6);else{g.beginPath();g.arc(b.x,b.y,b.r,0,6.283);g.fill()}}if(alive&&layer.open)requestAnimationFrame(step);else c.remove()};requestAnimationFrame(step)}
new MutationObserver(()=>{const open=layer.open,t=$('#layer-title')?.textContent?.trim(),page=M.getState().page,sl=D.slides[page];
 if(open&&t==='Correcto'&&sl?.quiz){const key=sl.id+':'+seq;if(key!==lastSeq){lastSeq=key;layer.classList.add('wallmapu-correct');pendingStar=true;requestAnimationFrame(inLayerBurst)}}
 else if(open)layer.classList.remove('wallmapu-correct');
 if(!open&&pendingStar){pendingStar=false;layer.classList.remove('wallmapu-correct');const box=document.createElement('div');Object.assign(box.style,{position:'fixed',left:'50%',top:'40%',width:'1px',height:'1px'});document.body.append(box);burst(innerWidth/2,innerHeight*.4);flyStar(box);setTimeout(()=>box.remove(),50)}
}).observe(layer,{attributes:true,attributeFilter:['open'],childList:true,subtree:true});
let seq=0;new MutationObserver(()=>{if(layer.open)seq++}).observe(layer,{attributes:true,attributeFilter:['open']});

/* ---------- Escena: título por palabras, imágenes que se revelan, inclinación 3D ---------- */
function splitTitle(h){if(!h||h.dataset.v14split)return;const text=h.textContent;h.dataset.v14split='1';h.setAttribute('aria-label',text);const frag=document.createDocumentFragment();text.split(/(\s+)/).forEach((w,i)=>{if(/^\s+$/.test(w)){frag.append(w);return}const o=document.createElement('span');o.className='v14-word';o.setAttribute('aria-hidden','true');const inner=document.createElement('span');inner.textContent=w;inner.style.setProperty('--i',String(frag.childNodes.length/2|0));o.append(inner);frag.append(o)});h.replaceChildren(frag)}
const TILT='.flip-tile,.ceremony-button,.site-tile,.authority-node,.historical-map,.culture-mosaic img,.closing-principle,.source-demography section,.source-timeline section';
function decorate(){const scene=stage.querySelector('.scene');if(!scene||scene.dataset.v14)return;scene.dataset.v14='1';const s=D.slides[M.getState().page];if(!s)return;
 document.body.dataset.v14Slide=s.id;document.body.dataset.v14Mood=s.quiz?'quiz':(MOOD[s.id]||'motes');
 seed(s.quiz?'':(MOOD[s.id]||'motes'));run();
 const h=scene.querySelector('h1');if(!reduced())splitTitle(h);
 if(h&&!scene.querySelector('.v14-rule')){const rule=document.createElement('span');rule.className='v14-rule';rule.setAttribute('aria-hidden','true');(h.parentElement||scene).insertBefore(rule,h.nextSibling)}
 scene.querySelectorAll('img').forEach(img=>{img.classList.add('v14-develop');const done=()=>img.classList.add('v14-developed');if(img.complete)requestAnimationFrame(done);else img.addEventListener('load',done,{once:true})});
 if(s.id==='cm-s20')constellation(scene);
 if(!reduced()&&fine.matches)scene.querySelectorAll(TILT).forEach(bindTilt)}
function bindTilt(el){if(el._v14tilt)return;el._v14tilt=1;el.classList.add('v14-tilt');el.addEventListener('pointermove',e=>{if(reduced()||layer.open)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--v14-rx',(-y*6).toFixed(2)+'deg');el.style.setProperty('--v14-ry',(x*8).toFixed(2)+'deg');el.style.setProperty('--v14-gx',((x+.5)*100).toFixed(1)+'%');el.style.setProperty('--v14-gy',((y+.5)*100).toFixed(1)+'%')});el.addEventListener('pointerleave',()=>{el.style.setProperty('--v14-rx','0deg');el.style.setProperty('--v14-ry','0deg')})}

/* Cierre: constelación que une los principios ya presentes en pantalla. */
function constellation(scene){const grid=scene.querySelector('.closing-summary-grid');if(!grid||grid.querySelector('.v14-constellation'))return;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('v14-constellation');svg.setAttribute('aria-hidden','true');grid.prepend(svg);
 const place=()=>{const g=grid.getBoundingClientRect(),pts=[...grid.querySelectorAll('.closing-principle .v11-symbol')].map(e=>{const r=e.getBoundingClientRect();return [r.left-g.left+r.width/2,r.top-g.top+r.height/2]});if(pts.length<2)return;svg.setAttribute('viewBox',`0 0 ${g.width} ${g.height}`);const order=pts.length===4?[0,1,3,2,0]:pts.map((_,i)=>i);const d=order.map((k,i)=>(i?'L':'M')+pts[k][0].toFixed(1)+' '+pts[k][1].toFixed(1)).join(' ');svg.innerHTML=`<path d="${d}" pathLength="1"/>`+pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="22"/>`).join('')};
 requestAnimationFrame(()=>requestAnimationFrame(place));addEventListener('resize',place)}

/* ---------- Luz que sigue al puntero ---------- */
addEventListener('pointermove',e=>{if(!fine.matches||reduced())return;root.style.setProperty('--v14-mx',e.clientX+'px');root.style.setProperty('--v14-my',e.clientY+'px')},{passive:true});

/* ---------- Pulsación dorada al activar controles ---------- */
addEventListener('pointerdown',e=>{if(reduced())return;const t=e.target.closest?.('#stage button,#layer button,footer button,header button');if(!t||t.disabled)return;const r=document.createElement('span');r.className='v14-ripple';r.setAttribute('aria-hidden','true');r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.append(r);setTimeout(()=>r.remove(),800)},{passive:true});

/* ---------- Voz: halo que respira mientras habla el presentador ---------- */
const voiceState=()=>document.body.classList.toggle('v14-speaking',!!narrator&&!narrator.paused&&!narrator.ended);
narrator?.addEventListener('play',voiceState);narrator?.addEventListener('pause',voiceState);narrator?.addEventListener('ended',voiceState);

/* ---------- Índice como sendero ---------- */
new MutationObserver(()=>{const list=layer.querySelector('.index-list');if(!list||list.dataset.v14)return;list.dataset.v14='1';list.classList.add('v14-path');const btns=[...list.querySelectorAll('button')];const cur=btns.findIndex(b=>b.getAttribute('aria-current')==='step');btns.forEach((b,i)=>{b.classList.toggle('v14-past',i<cur);b.style.setProperty('--i',String(i))});const r=Math.max(0,cur)/Math.max(1,btns.length-1);list.style.setProperty('--v14-progress',r.toFixed(3))}).observe(layer,{childList:true,subtree:true});

/* ---------- Transición con velo de luz entre láminas ---------- */
const veil=document.createElement('div');veil.id='wallmapu-veil';veil.setAttribute('aria-hidden','true');document.body.append(veil);
let lastPage=-1;
new MutationObserver(()=>{decorate();const p=M.getState().page;if(p!==lastPage){if(lastPage>=0&&!reduced()){veil.classList.remove('run');void veil.offsetWidth;veil.classList.add('run')}lastPage=p}}).observe(stage,{childList:true});

addEventListener('resize',size);document.addEventListener('visibilitychange',run);mq.addEventListener('change',run);
new MutationObserver(run).observe(root,{attributes:true,attributeFilter:['data-reduced-motion']});
size();decorate();run();
})();
