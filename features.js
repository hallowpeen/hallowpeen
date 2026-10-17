/* HallowPeen live features. Vanilla JS, every block is try/catch-guarded. */
(function(){
"use strict";
const C=window.HPCFG||{};const $=id=>document.getElementById(id);
const safe=(fn)=>{try{return fn()}catch(e){if(window.console)console.warn('[HPEEN]',e&&e.message)}};
const RM=safe(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)||false;
const qs=safe(()=>new URLSearchParams(location.search))||new URLSearchParams();
const demoRaw=qs.get('demo');const DEMO=demoRaw!==null;
const DEMO_GRAD=demoRaw==='grad';
const DEMO_MCAP=DEMO_GRAD?69000:Math.max(0,parseFloat(demoRaw)||0);
const store={get(k){try{return JSON.parse((DEMO?sessionStorage:localStorage).getItem(k)||'null')}catch(e){return null}},
  set(k,v){try{(DEMO?sessionStorage:localStorage).setItem(k,JSON.stringify(v))}catch(e){}}};
const fmt=n=>n>=1e9?'$'+(n/1e9).toFixed(1)+'B':n>=1e6?'$'+(n/1e6).toFixed(n>=1e7?0:1)+'M':n>=1e3?'$'+Math.round(n/1e3)+'K':'$'+Math.round(n);
const nf=n=>Number(n).toLocaleString('en-US');

const TIERS=[
 {m:1e4,name:'Sus Vampire',unlock:'acc:cape',msg:'🧛 Vampire Cape unlocked. Covers the cake. Barely.'},
 {m:5e4,name:'Already Dead',unlock:'acc:ghost',msg:'👻 Ghost Sheet unlocked. Died in electrical, still out here throwing it back.'},
 {m:1e5,name:'Emergency Meeting',unlock:'acc:hat',msg:'EMERGENCY MEETING: the crew hit $100K and someone saw what Orange was doing in the vents. 🧙 Witch Hat + Lore Ch. 3 unlocked!'},
 {m:5e5,name:'Golden Sus',unlock:'acc:golden',msg:'✨ Golden Crewmate unlocked. Buns of gold, passed medbay inspection with flying colors.'},
 {m:1e6,name:'Pumpkin King',unlock:'king',msg:'👑 ALL HAIL THE PUMPKIN KING. The site got haunted. Who did this?? (it was red)'},
 {m:5e6,name:'Diamond Visor',unlock:'acc:diamond',msg:'💎 Diamond Crewmate + Lore Ch. 5 unlocked. Rock hard visor. We said VISOR.'},
 {m:1e7,name:'Victory Screen',unlock:'legend',msg:'🏆 VICTORY. Every carver item unlocked. The crew is officially dummy thicc.'}];
const HOLDER_TIERS=[100,1000,10000];

/* ---------- toast + confetti (capped, auto-cleanup, lazy) ---------- */
const toastQ=[];let toastBusy=false;
function toast(msg,cls){safe(()=>{toastQ.push([msg,cls]);if(toastQ.length>5)toastQ.shift();pump();});}
function pump(){if(toastBusy||!toastQ.length)return;toastBusy=true;const [msg,cls]=toastQ.shift();
  const box=$('toasts');if(!box){toastBusy=false;return;}const el=document.createElement('div');el.className='toast '+(cls||'');el.setAttribute('role','status');el.textContent=msg;box.appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.remove();toastBusy=false;pump();},400);},cls==='mini'?3000:4200);}
let confettiLive=0;
function confetti(n){safe(()=>{if(RM||document.hidden)return;n=Math.min(n||40,60-confettiLive);if(n<=0)return;
  const frag=document.createDocumentFragment();
  for(let i=0;i<n;i++){const s=document.createElement('span');s.className='confetti';s.textContent=Math.random()<0.75?'🎃':'🍬';
    s.style.left=(Math.random()*100)+'vw';s.style.animationDuration=(2+Math.random()*2)+'s';s.style.animationDelay=(Math.random()*0.6)+'s';s.style.fontSize=(16+Math.random()*18)+'px';
    confettiLive++;const kill=()=>{if(s.parentNode){s.remove();confettiLive--;}};s.addEventListener('animationend',kill);setTimeout(kill,5500);frag.appendChild(s);}
  document.body.appendChild(frag);});}

/* ---------- pre-launch ---------- */
const LAUNCH=safe(()=>new Date(C.LAUNCH).getTime())||0;
function isPrelaunch(){return !DEMO&&!C.CA&&Date.now()<LAUNCH;}
function setupPrelaunch(){safe(()=>{const pre=$('prelaunch'),live=$('buyLive');if(!pre||!live)return;
  const on=isPrelaunch();pre.hidden=!on;live.hidden=on;if(!on)return;
  const nb=$('notifyBtn');if(nb)nb.href=C.X_URL||'#';
  const p=n=>String(n).padStart(2,'0');
  const tick=()=>{if(document.hidden)return;const d=Math.max(0,LAUNCH-Date.now());
    $('lcd').textContent=p(Math.floor(d/864e5))+'d '+p(Math.floor(d/36e5)%24)+'h '+p(Math.floor(d/6e4)%60)+'m '+p(Math.floor(d/1e3)%60)+'s';
    if(d===0){clearInterval(iv);setupPrelaunch();}};
  tick();const iv=setInterval(tick,1000);});}

/* ---------- state + rendering ---------- */
let state={mcap:0,grad:false,buys:null,sells:0,txns:0,holders:Number(C.HOLDERS)||0,ok:false};
function renderLadder(){safe(()=>{const ul=$('ladder');if(!ul)return;const m=state.mcap;
  ul.innerHTML='';TIERS.forEach(t=>{const li=document.createElement('li');const on=m>=t.m;li.className=on?'done':'';
    li.innerHTML='<b>'+fmt(t.m)+'</b><span>'+t.name+'</span><em>'+(on?'Task complete ✅':'Task pending 🔒')+'</em>';ul.appendChild(li);});
  const next=TIERS.find(t=>m<t.m);const prev=[...TIERS].reverse().find(t=>m>=t.m);
  let pct=100;if(next){const lo=prev?prev.m:0;pct=Math.max(0,Math.min(100,(m-lo)/(next.m-lo)*100));}
  $('mbar').style.width=pct.toFixed(1)+'%';
  $('mlabel').textContent=next?('Next crew task: "'+next.name+'" unlocks at '+fmt(next.m)+' market cap'):'All tasks complete. Crewmates win! 🎃 (still sus though)';
  $('stat-mcap').textContent=state.ok||DEMO?fmt(m):'—';
  $('stat-holders').textContent=state.holders?nf(state.holders):'—';
  $('stat-grad').textContent=state.grad?'Graduated to PumpSwap 🎓 You were not the impostor.':(state.ok||DEMO?'Still in the vents (bonding curve)':'—');
  const src=$('stat-src');if(src)src.textContent=DEMO?'DEMO MODE: these numbers are faker than an impostor doing "tasks"':(C.CA?(state.ok?'Live data from DexScreener, refreshes every 60s':'Comms sabotaged 📡 Live data is down, retrying in 60s. Site still works, chill.'):'Live stats appear once the pumpkin gets carved (launch). Patience, crewmate.');
});}
function applyUnlocks(silent){safe(()=>{const m=state.mcap;const seen=store.get('hp_tiers')||[];
  TIERS.forEach((t,i)=>{const on=m>=t.m;
    if(t.unlock.startsWith('acc:')){const b=document.querySelector('[data-acc="'+t.unlock.slice(4)+'"]');if(b){b.disabled=!on;b.title=on?'':'Unlocks at '+fmt(t.m);}}
    if(t.unlock==='king'){document.body.classList.toggle('haunted',on);document.body.classList.toggle('king',on);}
    if(on&&!seen.includes(t.m)){seen.push(t.m);if(!silent){setTimeout(()=>{toast('🚨 '+fmt(t.m)+' UNLOCKED! '+t.msg);confetti(40);},i*600);}}});
  store.set('hp_tiers',seen);
  document.querySelectorAll('[data-lore-at]').forEach(ch=>{const at=+ch.getAttribute('data-lore-at');const on=m>=at;ch.classList.toggle('locked',!on);
    const lk=ch.querySelector('.lock');if(lk)lk.textContent=on?'':'🔒 Redacted by impostor. Unlocks at '+fmt(at)+' market cap';});
  const sh=store.get('hp_holders')||[];HOLDER_TIERS.forEach(h=>{if(state.holders>=h&&!sh.includes(h)){sh.push(h);if(!silent){toast('🎃 '+nf(h)+' crewmates on the ship! It is getting tight in these vents. Ayo.');confetti(30);}}});store.set('hp_holders',sh);
  if(state.grad&&!store.get('hp_danced')){store.set('hp_danced',1);susDance();}
});}
function susMeter(){safe(()=>{const total=state.buys!=null?state.buys+state.sells:0;const el=$('susNeedle'),lb=$('susLabel');if(!el)return;
  let v=0.5;if(total>0)v=state.buys/total;
  el.style.transform='rotate('+(-90+v*180)+'deg)';
  lb.textContent=total?(v>0.66?'DANGEROUSLY SUS 🔴 someone is twerking in electrical':v>0.5?'Pretty sus 🟠 ayo, why is it so thicc in here':v>0.34?'Kinda sus 🟡 lowkey looking at the cake':'Chill crew 🟢 everyone keeping their cake to themselves, sussy bakas')+' · '+nf(total)+' txns (1h)':'Scanning for sus activity… 👀 Stand on the scanner pad.';});}
function susDance(){safe(()=>{confetti(50);if(RM)return;const d=document.createElement('div');d.className='dancer';d.setAttribute('aria-hidden','true');
  const cv=document.createElement('canvas');cv.width=160;cv.height=200;window.HP&&window.HP.drawCrew(cv.getContext('2d'),80,120,0.9,'thicc',window.HP.COLORS.orange,{});d.appendChild(cv);
  document.body.appendChild(d);toast('🍑 GRADUATED! Crewmate is twerking across the screen. Avert your visor, sussy baka.');setTimeout(()=>d.remove(),7000);d.addEventListener('animationend',()=>d.remove());});}

/* ---------- live data ---------- */
let lastBuys=null,lastPopup=0,popupQ=0,pollTimer=null,lastPoll=0;
const POLL_MS=60000;
async function fetchLive(){
  if(DEMO){const m=DEMO_MCAP;const h=Math.floor(m/100);
    return{mcap:m,grad:DEMO_GRAD||m>=69000,buys:(lastBuys||40)+1+Math.floor(Math.random()*3),sells:25,holders:h};}
  if(!C.CA)return null;
  const ctl=typeof AbortController!=='undefined'?new AbortController():null;const to=setTimeout(()=>ctl&&ctl.abort(),10000);
  try{const r=await fetch('https://api.dexscreener.com/tokens/v1/solana/'+encodeURIComponent(C.CA),{signal:ctl&&ctl.signal});
    if(!r.ok)throw new Error('HTTP '+r.status);const arr=await r.json();if(!Array.isArray(arr)||!arr.length)return{empty:true};
    arr.sort((a,b)=>((b.liquidity&&b.liquidity.usd)||0)-((a.liquidity&&a.liquidity.usd)||0));const p=arr[0];
    const h1=(p.txns&&p.txns.h1)||{};const h24=(p.txns&&p.txns.h24)||{};
    return{mcap:Number(p.marketCap||p.fdv)||0,grad:arr.some(x=>x.dexId==='pumpswap'),buys:Number(h1.buys)||0,sells:Number(h1.sells)||0,buys24:Number(h24.buys)||0};
  }finally{clearTimeout(to);}
}
async function poll(){
  if(document.hidden){return;}lastPoll=Date.now();
  try{const d=await fetchLive();
    if(d&&!d.empty){const counter=d.buys24!=null?d.buys24:d.buys;
      if(lastBuys!=null&&counter>lastBuys){popupQ=Math.min(3,popupQ+Math.min(3,counter-lastBuys));}
      lastBuys=counter;
      state.mcap=d.mcap;state.grad=!!d.grad;state.buys=d.buys;state.sells=d.sells;state.ok=true;
      if(d.holders!=null)state.holders=d.holders;}
    else if(d&&d.empty){state.ok=false;}
  }catch(e){state.ok=false;safe(()=>console.warn('[HPEEN] live data unavailable:',e.message));}
  renderLadder();susMeter();applyUnlocks(false);
}
function schedule(){clearTimeout(pollTimer);if(!DEMO&&!C.CA)return;pollTimer=setTimeout(async()=>{await poll();schedule();},POLL_MS);}
setInterval(()=>{if(document.hidden||popupQ<=0)return;if(Date.now()-lastPopup<5000)return;popupQ--;lastPopup=Date.now();toast(['someone just carved a pumpkin 🎃','a crewmate just slid into the vent 🍑','ayo, another one got carved. SUSSSSS 🎃','someone just threw it back on the curve 🎃','a crewmate got caught lackin in electrical 👀','someone booked a medbay inspection 👀','a sussy baka just grabbed a slice of cake 🎂','another crewmate backed it up into the vent 🍑'][Math.floor(Math.random()*4)],'mini');},1000);
if(DEMO)setTimeout(()=>{popupQ=Math.max(popupQ,1);},2500);
document.addEventListener('visibilitychange',()=>{safe(()=>{document.body.classList.toggle('paused',document.hidden);
  if(!document.hidden&&(DEMO||C.CA)&&Date.now()-lastPoll>=POLL_MS){poll().then(schedule);}});});

/* ---------- Halloween night ---------- */
safe(()=>{const n=new Date();if((n.getMonth()===9&&n.getDate()===31)||qs.get('night')==='1')document.body.classList.add('night');});

/* ---------- gallery ---------- */
safe(()=>{const g=$('gallery'),f=$('featured');if(!g)return;const list=(C.GALLERY||[]).filter(u=>typeof u==='string'&&u);
  if(C.FEATURED){f.innerHTML='';const im=new Image();im.loading='lazy';im.alt='Featured community carving';im.src=C.FEATURED;im.onerror=()=>{f.textContent='Featured carving got ejected. Coming back soon 🎃';};f.appendChild(im);}
  if(!list.length){g.innerHTML='<p class="empty">No carvings yet. Don\'t be shy, show us your pumpkin. Share yours on X with <b>$HPEEN</b> to get featured 🎃</p>';return;}
  g.innerHTML='';list.slice(0,24).forEach(u=>{const im=new Image();im.loading='lazy';im.alt='Community carving';im.src=u;im.onerror=()=>im.remove();g.appendChild(im);});});

/* ---------- sticker pack (generated lazily on first view) ---------- */
function makeStickers(){safe(()=>{const wrap=$('stickers');if(!wrap||wrap.dataset.done)return;wrap.dataset.done=1;const HP=window.HP;if(!HP)return;
  const S=512;const items=[
   ['Pumpkin PFP',c=>{const img=document.querySelector('.logo');c.fillStyle='#050505';c.fillRect(0,0,S,S);c.save();c.beginPath();c.arc(S/2,S/2,S/2-8,0,7);c.clip();if(img&&img.complete&&img.naturalWidth)c.drawImage(img,0,0,S,S);c.restore();c.strokeStyle='#ff7b00';c.lineWidth=10;c.shadowColor='#ff7b00';c.shadowBlur=25;c.beginPath();c.arc(S/2,S/2,S/2-10,0,7);c.stroke();}],
   ['Dummy Thicc',c=>HP.drawCrew(c,S/2,S*0.58,2.4,'thicc',HP.COLORS.orange,{})],
   ['Over the Shoulder',c=>HP.drawCrew(c,S/2,S*0.6,2.4,'shoulder',HP.COLORS.green,{})],
   ['Witchy Wave',c=>HP.drawCrew(c,S/2,S*0.66,2.0,'waving',HP.COLORS.purple,{hat:true})],
   ['Pumpkin King',c=>HP.drawCrew(c,S/2,S*0.66,2.1,'standing',HP.SPECIAL.golden,{crown:true})],
   ['$HPEEN Badge',c=>{c.fillStyle='#120700';c.beginPath();c.arc(S/2,S/2,S/2-12,0,7);c.fill();c.strokeStyle='#ff7b00';c.lineWidth=14;c.shadowColor='#ff7b00';c.shadowBlur=30;c.stroke();
     c.font='120px Creepster, cursive';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffb347';c.fillText('$HPEEN',S/2,S/2-20);c.font='bold 36px Rubik, sans-serif';c.shadowBlur=10;c.fillText('AYO SUSSSSS! 🎃',S/2,S/2+80);}]];
  items.forEach(([name,fn],i)=>{const card=document.createElement('div');card.className='sticker';const cv=document.createElement('canvas');cv.width=S;cv.height=S;
    try{fn(cv.getContext('2d'));}catch(e){}
    const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent='⬇ Yoink '+name;
    b.onclick=()=>{try{const a=document.createElement('a');a.download='hpeen-sticker-'+(i+1)+'.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();}catch(e){b.textContent='Download got sabotaged. Long-press the image to save';}};
    card.appendChild(cv);card.appendChild(b);wrap.appendChild(card);});});}
safe(()=>{const el=$('stickers');if(!el)return;const go=()=>{(document.fonts?document.fonts.ready:Promise.resolve()).then(makeStickers);};
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();go();}},{rootMargin:'400px'});io.observe(el);}else go();});

/* ---------- boot ---------- */
safe(()=>{const db=$('demoBanner');if(db&&DEMO){db.hidden=false;db.textContent='DEMO MODE ('+(DEMO_GRAD?'graduation':fmt(DEMO_MCAP))+'): simulated numbers, totally fake, very sus';}});
setupPrelaunch();renderLadder();susMeter();applyUnlocks(true);
if(DEMO||C.CA){poll().then(schedule);}
window.HPF={state:()=>state,toast,confetti};
})();
