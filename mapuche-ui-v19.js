/* v19 — interfaz de navegación: barra de progreso del curso y destello de "momento de avanzar".
   Solo presentación; no cambia reglas de avance ni textos. */
(()=>{'use strict';
const M=window.MotorMapuche,$=s=>document.querySelector(s);
const audio=$('#narrator'),next=$('#next'),count=$('#count'),box=document.querySelector('.course-counters');
if(!M||!next||!box)return;
const total=()=>(M.getData().slides||[]).length||1;

/* Progreso del curso dentro del bloque Lámina / Estrellas */
const bar=document.createElement('span');bar.className='v19-progress';bar.setAttribute('aria-hidden','true');bar.innerHTML='<i></i>';box.append(bar);
function progress(){const p=(M.getState().page||0)+1,n=total();bar.style.setProperty('--v19-prog',Math.round(p/n*100)+'%');box.title=`Avance del curso: lámina ${p} de ${n}`}

/* Momento de avanzar: Continuar habilitado y la locución ya terminó (o no hay locución en curso). */
function ready(){if(next.disabled||next.hidden||next.closest('[hidden]'))return false;
 if(!audio||!audio.currentSrc)return true;
 if(audio.ended)return true;
 const d=audio.duration;if(d&&isFinite(d)&&audio.currentTime>=d-0.25)return true;
 return audio.paused&&(M.getState().heard||[]).includes((M.getData().slides[M.getState().page]||{}).id)&&audio.currentTime===0}
let raf=0;
function update(){raf=0;next.classList.toggle('v19-ready',ready());progress()}
const later=()=>{if(!raf)raf=requestAnimationFrame(update)};
new MutationObserver(later).observe(next,{attributes:true,attributeFilter:['disabled','hidden','class']});
if(count)new MutationObserver(later).observe(count,{childList:true,characterData:true,subtree:true});
const stage=$('#stage');if(stage)new MutationObserver(later).observe(stage,{childList:true});
if(audio)for(const ev of ['play','playing','pause','ended','emptied','loadstart','seeked','loadedmetadata'])audio.addEventListener(ev,later);
document.addEventListener('motor-course-state',later);
update();
})();
