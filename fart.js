/* Hero pumpkin toot: tap/click the logo -> anticipation squash, REAL recorded fart (CC0 samples in sfx/, see SOUNDS-LICENSES.md), hand-built CSS cartoon cloud, stink lines, sus caption.
   Audio: samples fetched + decoded lazily (Web Audio) on first hover/pointerdown/focus of the pumpkin; until decoded, the tap plays through an <audio> element so the first tap is never silent. Synth (HPS.fart) only as last resort. */
(function(){"use strict";
const w=document.querySelector('.logo-wrap');if(!w)return;
const T=s=>window.HPI?HPI.t(s):s;
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
const CAPS=["who did that 👀","ayo that was SUS 💨","emergency meeting: someone vented 🚨","it wasn't me 😳","smells like impostor 🤢","the pumpkin is NOT okay 💀","dead body reported (cause: that) ☠️"];
// d = trimmed length (s). multi = pulsy ones get a stuttering multi-puff cloud.
const SFX=[{n:'pfft',d:.26},{n:'toot',d:.29},{n:'squeak',d:.39,multi:1},{n:'brrap',d:.68},{n:'wet',d:1.02},{n:'chili',d:1.44},{n:'flabby',d:1.93,multi:1},{n:'tuba',d:1.88}];
const KINDS=SFX.map(x=>x.n);
const BASE=(document.currentScript&&document.currentScript.src?document.currentScript.src.replace(/[^/]*$/,''):'')+'sfx/';
const muted=()=>{try{return localStorage.getItem('hp_sound')==='off'}catch(e){return false}};
let bufs={},loading=false,fartEnd=0,outG=null;
let raw={},acx=null; // fetch on hover/press (no AudioContext yet = no autoplay warnings); decode once the tap has created/unlocked the context
function dec(n){const ab=raw[n];if(!ab||!acx)return;delete raw[n];try{const p=acx.decodeAudioData(ab,b=>{bufs[n]=b;},()=>{});if(p&&p.catch)p.catch(()=>{});}catch(e){}}
function load(){if(loading)return;loading=true;if(!window.fetch)return;
  SFX.forEach(x=>{fetch(BASE+x.n+'.mp3').then(r=>r.ok?r.arrayBuffer():Promise.reject(r.status)).then(ab=>{raw[x.n]=ab;dec(x.n);}).catch(()=>{});});}
function playSample(x,lead){const rate=0.9+Math.random()*0.2;const ac=window.HPS&&HPS.ac&&HPS.ac();
  if(ac&&ac.state==='suspended'){try{ac.resume()}catch(e){}}if(ac&&!acx){acx=ac;Object.keys(raw).forEach(dec);}
  if(ac&&bufs[x.n]){if(!outG){outG=ac.createGain();outG.gain.value=0.85;outG.connect(ac.destination);}
    const src=ac.createBufferSource();src.buffer=bufs[x.n];src.playbackRate.value=rate;src.connect(outG);src.start(ac.currentTime+lead);return src.buffer.duration/rate;}
  try{const a=new Audio(BASE+x.n+'.mp3');a.volume=0.85;a.preservesPitch=false;a.playbackRate=rate;const go=()=>{const p=a.play();if(p&&p.catch)p.catch(()=>{});};if(lead>0)setTimeout(go,lead*1000);else go();return x.d/rate;}catch(e){}
  try{return(window.HPS&&HPS.fart&&HPS.fart('pfft',lead))||0;}catch(e){return 0;}}
// puffs: x,y,r (fractions of logo width, relative to the butt), delay ms. Cloud billows left/up, away from the crewmate's rear.
const PUFFS=[[0,0,.075,0],[-.07,-.025,.1,40],[-.15,.01,.088,85],[-.1,-.1,.095,115],[-.02,-.09,.075,150],[-.2,-.07,.075,180],[-.12,.055,.07,125],[-.05,.05,.06,70]];
let last=0,lastKind='',clouds=[],spam=[],lastToast=0,capT=0;
const cap=document.createElement('span');cap.className='fart-cap';cap.setAttribute('aria-live','polite');w.appendChild(cap);
const NS='http://www.w3.org/2000/svg';
function stink(L,i){const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 20 60');s.setAttribute('class','fart-stink');s.setAttribute('aria-hidden','true');
  const p=document.createElementNS(NS,'path');p.setAttribute('d','M10 58 C2 48 18 40 10 30 C2 20 18 12 10 2');s.appendChild(p);
  s.style.cssText='left:'+Math.round((-.19+i*.08)*L)+'px;top:'+Math.round(-.2*L)+'px;width:'+Math.round(.045*L)+'px;height:'+Math.round(.13*L)+'px;animation-delay:'+(260+i*140)+'ms';return s;}
function cloud(scale,dx,delay){const L=w.getBoundingClientRect().width||300;const c=document.createElement('div');c.className='fart';c.setAttribute('aria-hidden','true');
  c.style.left='35%';c.style.top='72%';c.style.setProperty('--L',L+'px');c.style.setProperty('--s',scale);c.style.setProperty('--dx',dx);if(delay)c.style.animationDelay=delay+'ms';
  const d=document.createElement('div');d.className='fart-drift';if(delay)d.style.animationDelay=delay+'ms';const wb=document.createElement('div');wb.className='fart-wob';
  wb.style.animationDuration=(420+Math.random()*200)+'ms';
  PUFFS.forEach(([x,y,r,dl],i)=>{const p=document.createElement('i');const R=r*L*(1.0+Math.random()*0.3);p.className='puff'+(i%3===1?' hl':'');
    p.style.cssText='width:'+(2*R)+'px;height:'+(2*R)+'px;left:'+(x*L-R)+'px;top:'+(y*L-R)+'px;--tx:'+(-x*L*.8)+'px;--ty:'+(-y*L*.8)+'px;animation-delay:'+(dl+(delay||0))+'ms';wb.appendChild(p);});
  d.appendChild(wb);if(scale>=.8)for(let i=0;i<3;i++)d.appendChild(stink(L,i));c.appendChild(d);w.appendChild(c);
  clouds.push(c);while(clouds.length>5){const o=clouds.shift();o.remove();}
  setTimeout(()=>{c.remove();clouds=clouds.filter(x=>x!==c);},(RM&&RM.matches?1300:2500)+(delay||0));}
function caption(kind){let s,r=Math.random();if((kind==='tuba'||kind==='flabby')&&r<.5)s="that one had a bassline 🎺";else if((kind==='pfft'||kind==='toot')&&r<.4)s="tiny but deadly 🤏";else if((kind==='wet'||kind==='chili')&&r<.5)s="bro that one was WET 💀🧻";else if(kind==='squeak'&&r<.5)s="the squeak of a liar 🐭";else s=CAPS[Math.floor(Math.random()*CAPS.length)];
  cap.textContent=T(s);cap.style.setProperty('--rot',(Math.random()*8-4).toFixed(1)+'deg');cap.classList.remove('go');void cap.offsetWidth;cap.classList.add('go');clearTimeout(capT);capT=setTimeout(()=>cap.classList.remove('go'),1900);}
function toot(){const now=performance.now();if(now-last<260)return;last=now;
  load();const tnow=now/1000,busy=tnow<fartEnd-0.15; // a long one still ripping -> only short follow-ups
  const pool=SFX.filter(x=>x.n!==lastKind&&(!busy||x.d<.45));const x=pool[Math.floor(Math.random()*pool.length)]||SFX[0];const kind=x.n;lastKind=kind;
  spam=spam.filter(t=>now-t<6000);spam.push(now);if(spam.length>=8&&now-lastToast>20000){lastToast=now;window.HPF&&HPF.toast&&HPF.toast(T('🚨 EMERGENCY MEETING: the pumpkin needs a doctor 💨'),'mini');}
  const reduce=RM&&RM.matches;const lead=reduce?0:110; // anticipation beat before the release
  if(!muted()){const len=playSample(x,lead/1000);fartEnd=tnow+lead/1000+len;}
  if(!reduce){w.classList.remove('farting');void w.offsetWidth;w.classList.add('farting');}
  const sc=Math.min(1.3,Math.max(.6,.55+x.d*.38))*(0.9+Math.random()*0.2),dx=(0.8+Math.random()*0.5).toFixed(2);
  if(x.multi&&!reduce){const n=x.d>1?4:3,st=Math.round(x.d*1000/n);for(let i=0;i<n;i++)cloud(sc*(.8+i*.14),dx,lead+i*st);}else cloud(sc,dx,lead);
  caption(kind);}
w.style.touchAction='manipulation';
w.addEventListener('click',toot);
['pointerenter','pointerdown','focus','touchstart'].forEach(ev=>w.addEventListener(ev,load,{passive:true,once:true}));
w.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toot();}});
w.addEventListener('animationend',e=>{if(e.animationName==='fartsquash')w.classList.remove('farting');});
window.HPFart={toot};
})();
