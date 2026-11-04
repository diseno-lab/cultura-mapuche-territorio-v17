/* v15: no se reposiciona el video mientras una búsqueda previa sigue en curso (evitaba que el avatar quedara congelado al volver de Configuración/Tutor). */
/* Voice comes from the original avatar video. The silent alpha video follows it. */
(()=>{'use strict';
const avatars=window.MAPUCHE_AVATARS||{}, audio=document.querySelector('#narrator'),stage=document.querySelector('#stage');
let video=null,circle=null,frame=0,seekStarted=0;
function still(){circle?.classList.remove('avatar-playing')}
function align(force=false){if(!video)return;if(audio.paused||audio.ended||document.hidden){video.pause();still();return}if(video.readyState<2){still();return}if(video.seeking){if(performance.now()-seekStarted<1500)return;try{video.currentTime=Math.min(audio.currentTime||0,Math.max(0,(video.duration||Infinity)-.08))}catch{}seekStarted=performance.now();return}const t=Math.min(audio.currentTime||0,Math.max(0,(video.duration||Infinity)-.08)),drift=Math.abs(video.currentTime-t);if(drift>(force?.06:.25)){seekStarted=performance.now();try{video.currentTime=t}catch{}}video.playbackRate=audio.playbackRate;if(video.paused)video.play().catch(still);}
function tick(){align();if(!audio.paused&&!audio.ended)frame=requestAnimationFrame(tick);}
function mount(){
 const scene=stage.querySelector('.scene-parallax');if(!scene||scene.dataset.avatarMounted)return;
 scene.dataset.avatarMounted='true';cancelAnimationFrame(frame);video?.pause();video=null;circle=null;
 const id=window.MotorMapuche?.getData().slides[window.MotorMapuche.getState().page]?.id,a=avatars[id];if(!a)return;
 const body=document.createElement('div');body.className='avatar-slide-content';while(scene.firstChild)body.append(scene.firstChild);
 scene.append(body);scene.classList.add('has-avatar');
 const aside=document.createElement('aside');aside.className='avatar-presenter';aside.setAttribute('aria-label','Presentador del curso');
 circle=document.createElement('div');circle.className='avatar-circle';
 const portrait=document.createElement('img');portrait.className='avatar-idle';portrait.src=a.poster;portrait.alt='';portrait.setAttribute('aria-hidden','true');portrait.decoding='sync';
 video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';video.src=a.src;video.poster=a.poster;video.setAttribute('aria-hidden','true');video.disablePictureInPicture=true;
 circle.append(portrait,video);aside.append(circle);scene.append(aside);const activeVideo=video,activeCircle=circle;
 const showFrame=()=>{if(video===activeVideo&&!audio.paused&&!audio.ended&&!activeVideo.seeking&&activeVideo.readyState>=2)activeCircle.classList.add('avatar-playing')};
 activeVideo.addEventListener('playing',showFrame);activeVideo.addEventListener('timeupdate',showFrame);
 for(const event of ['pause','ended','error','emptied','waiting','stalled','seeking'])activeVideo.addEventListener(event,()=>activeCircle.classList.remove('avatar-playing'));
 activeVideo.addEventListener('seeked',()=>{showFrame();if(video===activeVideo)align()});
 activeVideo.addEventListener('canplay',()=>{if(video===activeVideo)align()});
 activeVideo.addEventListener('loadedmetadata',()=>{if(video===activeVideo)align(true)});
}
new MutationObserver(mount).observe(stage,{childList:true});
audio.addEventListener('play',()=>{align(true);cancelAnimationFrame(frame);frame=requestAnimationFrame(tick)});
for(const event of ['pause','ended','seeking','seeked','ratechange','loadedmetadata'])audio.addEventListener(event,()=>align(true));
window.addEventListener('pagehide',()=>video?.pause());
document.addEventListener('visibilitychange',()=>{if(document.hidden){video?.pause();still()}else align(true)});
})();
