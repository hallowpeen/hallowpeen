/* Hero pumpkin toot: tap/click the logo -> anticipation squash, procedural fart (sound.js HPS.fart), hand-built CSS cartoon cloud, stink lines, sus caption. */
(function(){"use strict";
const w=document.querySelector('.logo-wrap');if(!w)return;
const T=s=>window.HPI?HPI.t(s):s;
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
const CAPS=["who did that 👀","ayo that was SUS 💨","emergency meeting: someone vented 🚨","it wasn't me 😳","smells like impostor 🤢","the pumpkin is NOT okay 💀","dead body reported (cause: that) ☠️"];
const SIZE={pfft:.72,sputter:.6,squeaker:.82,brrap:1.05,tuba:1.25};
const KINDS=Object.keys(SIZE);
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
function caption(kind){let s;if(kind==='tuba'&&Math.random()<.6)s="that one had a bassline 🎺";else if(kind==='pfft'&&Math.random()<.4)s="tiny but deadly 🤏";else s=CAPS[Math.floor(Math.random()*CAPS.length)];
  cap.textContent=T(s);cap.style.setProperty('--rot',(Math.random()*8-4).toFixed(1)+'deg');cap.classList.remove('go');void cap.offsetWidth;cap.classList.add('go');clearTimeout(capT);capT=setTimeout(()=>cap.classList.remove('go'),1900);}
function toot(){const now=performance.now();if(now-last<260)return;last=now;
  let kind;do{kind=KINDS[Math.floor(Math.random()*KINDS.length)];}while(kind===lastKind&&Math.random()<.75);lastKind=kind;
  spam=spam.filter(t=>now-t<6000);spam.push(now);if(spam.length>=8&&now-lastToast>20000){lastToast=now;window.HPF&&HPF.toast&&HPF.toast(T('🚨 EMERGENCY MEETING: the pumpkin needs a doctor 💨'),'mini');}
  const reduce=RM&&RM.matches;const lead=reduce?0:110; // anticipation beat before the release
  try{window.HPS&&HPS.fart&&HPS.fart(kind,lead/1000);}catch(e){}
  if(!reduce){w.classList.remove('farting');void w.offsetWidth;w.classList.add('farting');}
  const sc=SIZE[kind]*(0.9+Math.random()*0.2),dx=(0.8+Math.random()*0.5).toFixed(2);
  if(kind==='sputter'&&!reduce){[0,140,280].forEach((t,i)=>cloud(sc*(1+i*.18),dx,lead+t));}else cloud(sc,dx,lead);
  caption(kind);}
w.style.touchAction='manipulation';
w.addEventListener('click',toot);
w.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toot();}});
w.addEventListener('animationend',e=>{if(e.animationName==='fartsquash')w.classList.remove('farting');});
window.HPFart={toot};
})();
