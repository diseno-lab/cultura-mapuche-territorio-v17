/* v16: cargador inicial. Se retira cuando la página y el primer fondo están cargados (mínimo 1,6 s, máximo 12 s). */
(()=>{const el=document.getElementById('cargador-v16');if(!el)return;const bar=el.querySelector('.cg-barra i'),t0=performance.now(),MIN=1600,MAX=12000;let done=false;
const imgs=[...document.images];const urls=new Set();document.querySelectorAll('.backdrop').forEach(b=>{const m=getComputedStyle(b).backgroundImage.match(/url\(["']?([^"')]+)/);if(m)urls.add(m[1])});
let total=imgs.length+urls.size+1,ok=0;const tick=()=>{ok++;bar.style.width=Math.min(100,Math.round(ok/total*100))+'%'};
imgs.forEach(i=>{if(i.complete)tick();else{i.addEventListener('load',tick,{once:true});i.addEventListener('error',tick,{once:true})}});
urls.forEach(u=>{const i=new Image();i.onload=i.onerror=tick;i.src=u});
function finish(){if(done)return;done=true;bar.style.width='100%';const wait=Math.max(0,MIN-(performance.now()-t0));setTimeout(()=>{el.classList.add('listo');el.setAttribute('aria-busy','false');setTimeout(()=>el.remove(),800)},wait)}
if(document.readyState==='complete'){tick();finish()}else window.addEventListener('load',()=>{tick();finish()},{once:true});setTimeout(finish,MAX)})();
