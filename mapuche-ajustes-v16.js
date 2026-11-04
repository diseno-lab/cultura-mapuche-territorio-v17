/* v16: pantalla completa robusta (pedido de Carlo, 3-nov-2026).
   Antes: solo llamaba a requestFullscreen sin manejar errores; en navegadores o visores que no lo permiten
   (Safari iPhone, iframes de LMS sin allowfullscreen, visores embebidos) el botón no hacía nada.
   Ahora: API estándar → prefijo webkit → modo inmersivo de respaldo (ocupa toda la ventana) con aviso breve. */
(()=>{const b=document.getElementById('fullscreen');if(!b)return;const root=document.documentElement;
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
const isOn=()=>!!fsEl()||root.classList.contains('modo-inmersivo-v16');
function paint(){const on=isOn();b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'Salir de pantalla completa':'Pantalla completa');b.title=b.getAttribute('aria-label')}
function aviso(txt){let t=document.getElementById('aviso-v16');if(!t){t=document.createElement('div');t.id='aviso-v16';t.setAttribute('role','status');document.body.append(t)}t.textContent=txt;t.classList.add('visible');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('visible'),3800)}
function respaldo(){root.classList.add('modo-inmersivo-v16');paint();window.dispatchEvent(new Event('resize'));aviso('Este navegador no permite pantalla completa aquí. Se amplió el curso a toda la ventana (en computador también puedes usar F11).')}
async function entrar(){const req=root.requestFullscreen||root.webkitRequestFullscreen;if(!req||document.fullscreenEnabled===false&&!root.webkitRequestFullscreen){respaldo();return}
 let fallo=false;try{const r=req.call(root,{navigationUI:'hide'});const espera=new Promise(res=>setTimeout(res,900));await Promise.race([Promise.resolve(r),espera])}catch(e){fallo=true}
 if(fallo||!fsEl())respaldo();else paint()}
function salir(){if(fsEl()){(document.exitFullscreen||document.webkitExitFullscreen)?.call(document)}root.classList.remove('modo-inmersivo-v16');paint();window.dispatchEvent(new Event('resize'))}
b.onclick=()=>{isOn()?salir():entrar()};
document.addEventListener('fullscreenchange',paint);document.addEventListener('webkitfullscreenchange',paint);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('modo-inmersivo-v16')&&!document.querySelector('dialog[open]'))salir()});
paint()})();
