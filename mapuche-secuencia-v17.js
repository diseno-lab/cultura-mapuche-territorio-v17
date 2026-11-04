/* Cultura Mapuche y Territorio — v17 (pedido de Carlo, 4-nov-2026).
   1) Cada elemento aparece de a uno, cuando la locución lo nombra (o escalonado si no lo nombra).
   2) Imágenes más grandes, completas (sin recorte) y ampliables con clic.
   3) Botón del Tutor eliminado.
   Solo presentación: no agrega ni modifica texto del guion. */
(()=>{'use strict';
const $=s=>document.querySelector(s),M=window.MotorMapuche,stage=$('#stage'),audio=$('#narrator');
if(!M||!stage||!audio)return;
const D=M.getData(),A=window.MAPUCHE_AUDIO||{};
const root=document.documentElement;
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||root.dataset.reducedMotion==='true';

/* ---------- 3) Tutor eliminado ---------- */
function dropTutor(){document.getElementById('tutor-toggle')?.remove();const d=document.getElementById('course-tutor');if(d&&!d.open)d.remove()}
dropTutor();new MutationObserver(dropTutor).observe(document.body,{childList:true,subtree:true});

/* ---------- 2) Marcos de imagen: imagen completa sobre fondo desenfocado de sí misma ---------- */
const FRAME_SKIP='.flip-front,.ceremony-button,.site-tile,.authority-node,button,.avatar-circle,.source-flag,#layer';
function frameImages(scene){scene.querySelectorAll('img.source-picture').forEach(img=>{if(img.closest('.v17-frame')||img.closest(FRAME_SKIP)||img.classList.contains('source-flag'))return;const f=document.createElement('span');f.className='v17-frame';f.style.setProperty('--v17-src',`url("${img.getAttribute('src')}")`);for(const c of ['closing-photo'])if(img.classList.contains(c)){f.classList.add(c);img.classList.remove(c)}img.replaceWith(f);f.append(img);
 const z=document.createElement('button');z.type='button';z.className='v17-zoom';z.setAttribute('aria-label','Ampliar imagen');z.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6"/></svg>';z.addEventListener('click',e=>{e.stopPropagation();openZoom(img.getAttribute('src'),z)});f.append(z);f.addEventListener('click',e=>{if(e.target===img)openZoom(img.getAttribute('src'),z)})})}

/* Visor ampliado: ventana exclusiva que solo se cierra con la equis. */
const viewer=document.createElement('dialog');viewer.id='v17-viewer';viewer.setAttribute('aria-label','Imagen ampliada');viewer.innerHTML='<button class="close v17-viewer-close" aria-label="Cerrar imagen ampliada"><span>Cerrar</span><b aria-hidden="true">×</b></button><img alt="">';document.body.append(viewer);
let resumeAfter=false,returnFocus=null;
viewer.addEventListener('cancel',e=>e.preventDefault());
viewer.querySelector('.v17-viewer-close').onclick=()=>viewer.close();
viewer.addEventListener('close',()=>{if(resumeAfter)M.ui?.play?.();resumeAfter=false;returnFocus?.focus?.({preventScroll:true})});
function openZoom(src,from){if(document.querySelector('dialog[open]'))return;returnFocus=from;resumeAfter=!audio.paused&&!audio.ended;audio.pause();viewer.querySelector('img').src=src;viewer.showModal();viewer.querySelector('.v17-viewer-close').focus({preventScroll:true})}

/* ---------- 1) Aparición de a uno, sincronizada con la locución ---------- */
const UNIT_SEL=['.cover .program','.lead','.source-authority','.historical-map','.culture-mosaic .v17-frame','.source-keywords > span','.source-demography section','.source-process section','.night-strip .v17-frame','.source-balance > div:first-child > :not(.v11-symbol)','.art-pair .v17-frame','.source-timeline section','.ceremonial-sequence section','.respect-source section','.respect-source > .v17-frame','.site-strip .v17-frame','.flip-tile','.ceremony-button','.site-tile','.authority-node','.closing-principle','.closing-view .v17-frame'].join(',');
const TAIL_SEL='.v12-instruction,.review-count,.star-summary';
const SKIP=new Set(['cm-s01','cm-s02']); /* portada; lámina 2: el guion pide mostrar todo a la vez */
const norm=w=>w.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9%]/g,'');
let units=[],slideId='',raf=0,allMode=false;
function phraseTime(text,words,from){const q=text.split(/\s+/).map(norm).filter(Boolean);if(!q.length)return null;for(const k of [Math.min(3,q.length),Math.min(2,q.length),1]){const p=q.slice(0,k);if(k===1&&p[0].length<4)continue;for(let i=0;i<=words.length-p.length;i++){if(words[i].start<from-.01)continue;if(p.every((w,j)=>norm(words[i+j].word)===w))return words[i].start}}return null}
function baseOf(el){let t=0;for(let e=el;e&&e!==stage;e=e.parentElement){if(e.dataset?.reveal!==undefined)t=Math.max(t,Number(e.dataset.reveal)||0)}return t}
function plan(){units.forEach(u=>u.el.classList.remove('v17-pending','v17-shown'));units=[];const scene=stage.querySelector('.scene');if(!scene)return;const s=D.slides[M.getState().page];slideId=s?.id||'';
 frameImages(scene);
 if(!s||s.quiz||SKIP.has(s.id))return;
 const meta=A[s.id]||{},words=meta.words||[],dur=meta.duration||audio.duration||30;
 let list=[...scene.querySelectorAll(UNIT_SEL)].filter(e=>!e.closest('[data-sequence],[data-until]')&&!e.closest('.avatar-presenter'));
 list=list.filter(e=>!list.some(o=>o!==e&&o.contains(e)));
 const tails=[...scene.querySelectorAll(TAIL_SEL)].filter(e=>!e.closest('[data-until]'));
 /* Imágenes (o bloques con imagen): aparecen en su punto del guion (marca de la locución del bloque).
    Textos: cuando la locución los nombra; si no los nombra, entre el anterior y el siguiente. */
 const isImg=el=>!el.closest('.closing-view')&&(el.matches('.v17-frame,.historical-map')||!!el.querySelector('.v17-frame'));
 let cursor=0;const raw=list.map(el=>{const base=baseOf(el);if(isImg(el))return{el,base,t:base,img:true};const txt=(el.querySelector('h2')?.textContent||el.textContent||'').trim();const t=txt?phraseTime(txt,words,Math.max(base,cursor)):null;if(t!=null)cursor=t;return{el,base,t}});
 for(let i=0;i<raw.length;i++){if(raw[i].t!=null)continue;let j=i;while(j<raw.length&&raw[j].t==null)j++;const n=j-i,hasPrev=i>0,prevT=hasPrev?raw[i-1].t:0,lo=Math.max(prevT,raw[i].base),hi=j<raw.length?raw[j].t:null;
  for(let k=0;k<n;k++){const u=raw[i+k];if(u.base>prevT+0.01&&k===0){u.t=u.base;continue}const step=hasPrev?k+1:k;u.t=(hi!=null&&hi>lo)?lo+(hi-lo)*step/(n+(hasPrev?1:0)):lo+step*0.8}i=j-1}
 /* De a uno: ningún par de elementos aparece a la vez (separación mínima 0,35 s, en orden de aparición). */
 const order=raw.map((u,i)=>({u,i})).sort((x,y)=>x.u.t-y.u.t||x.i-y.i);let last=-1;
 for(const {u} of order){if(last>=0&&u.t<last+0.35)u.t=last+0.35;u.t=Math.min(u.t,Math.max(0,dur-0.4));last=u.t}
 allMode=heard();units=raw;tails.forEach(el=>units.push({el,t:last,base:0}));
 units.forEach(u=>u.el.classList.add('v17-unit'));tick(true)}
function heard(){return (M.getState().heard||[]).includes(slideId)}
function tick(force){const t=audio.currentTime||0,all=allMode||audio.ended;for(const u of units){const show=all||t>=u.t-0.02;const was=u.el.classList.contains('v17-shown');if(show!==was||force){u.el.classList.toggle('v17-shown',show);u.el.classList.toggle('v17-pending',!show);if(show)u.el.removeAttribute('inert');else u.el.setAttribute('inert','')}}}
function loop(){tick(false);raf=audio.paused?0:requestAnimationFrame(loop)}
audio.addEventListener('play',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)});
for(const ev of ['pause','seeked','timeupdate','ended','loadedmetadata'])audio.addEventListener(ev,()=>tick(false));
new MutationObserver(()=>requestAnimationFrame(plan)).observe(stage,{childList:true});
requestAnimationFrame(plan);
window.MotorMapuche.v17={units:()=>units.map(u=>({t:+u.t.toFixed(2),text:(u.el.textContent||u.el.querySelector('img')?.getAttribute('src')||'').trim().slice(0,40),shown:u.el.classList.contains('v17-shown')}))};
})();
