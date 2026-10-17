/* HallowPeen site-wide motion. CSS-first, no rAF loops, pauses when hidden, respects reduced motion. */
(function(){"use strict";
const safe=f=>{try{f()}catch(e){}};
const RM=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}})();
const toast=(m)=>safe(()=>window.HPF&&window.HPF.toast(m,'mini'));
// crewmate sprite (drawn once)
let sprite='';safe(()=>{const c=document.createElement('canvas');c.width=160;c.height=200;window.HP.drawCrew(c.getContext('2d'),85,120,0.9,'thicc',window.HP.COLORS.orange,{});sprite=c.toDataURL('image/png');});
// 1. scroll reveal
safe(()=>{const els=document.querySelectorAll('section, .card, .steps li, .chapters article, .ladder li, .sticker');
  if(RM||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:0.12});
  els.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--d',((i%5)*70)+'ms');io.observe(el);});
  // stickers are created lazily: watch for them
  const st=document.getElementById('stickers');if(st)new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('sticker')){n.classList.add('reveal');io.observe(n);}}))).observe(st,{childList:true});});
// 2. title letters
safe(()=>{const h=document.querySelector('.hero h1');if(!h)return;const t=h.textContent;h.textContent='';h.setAttribute('aria-label',t);
  [...t].forEach((ch,i)=>{const s=document.createElement('span');s.className='ltr';s.style.setProperty('--i',i);s.textContent=ch;s.setAttribute('aria-hidden','true');h.appendChild(s);});});
// 3. countdown flip
safe(()=>{['d','h','m','s'].forEach(id=>{const el=document.getElementById(id);if(!el)return;new MutationObserver(()=>{if(RM||document.hidden)return;el.classList.remove('flip');void el.offsetWidth;el.classList.add('flip');}).observe(el,{childList:true,characterData:true,subtree:true});});});
// 4. locked lore shake
safe(()=>{const lines=['Sus, not yet. 🔒','Nice try, sussy baka. Locked.','No peeking in the vents. 🔒','Medbay says: not cleared yet 👀'];
  document.querySelectorAll('[data-lore-at]').forEach(ch=>{ch.tabIndex=0;ch.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();ch.click();}});});
  document.querySelectorAll('[data-lore-at]').forEach(ch=>ch.addEventListener('click',()=>{if(!ch.classList.contains('locked'))return;ch.classList.remove('shake');void ch.offsetWidth;ch.classList.add('shake');toast(lines[Math.floor(Math.random()*lines.length)]);}));});
// 5. edge-peeking crewmate every ~30s
safe(()=>{if(RM||!sprite)return;const el=document.createElement('img');el.src=sprite;el.alt='';el.className='peeker';el.width=70;el.height=88;el.setAttribute('aria-hidden','true');document.body.appendChild(el);
  const sides=['left','right','bottom'];
  const go=()=>{if(!document.hidden){const s=sides[Math.floor(Math.random()*3)];el.className='peeker from-'+s;el.style.top=s==='bottom'?'':(20+Math.random()*55)+'vh';el.style.left=s==='bottom'?(10+Math.random()*70)+'vw':'';void el.offsetWidth;el.classList.add('go');}
    setTimeout(go,28000+Math.random()*6000);};setTimeout(go,9000);});
// 6. cursor pumpkin trail (desktop / fine pointer only, pooled)
safe(()=>{if(RM||!matchMedia('(pointer: fine)').matches)return;const pool=[];for(let i=0;i<8;i++){const s=document.createElement('span');s.className='trail';s.textContent=i%3?'🎃':'🍑';s.setAttribute('aria-hidden','true');document.body.appendChild(s);pool.push(s);}
  let k=0,last=0;addEventListener('mousemove',e=>{const n=e.timeStamp;if(n-last<60||document.hidden)return;last=n;const s=pool[k++%pool.length];s.classList.remove('go');s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';void s.offsetWidth;s.classList.add('go');},{passive:true});});
// 7. footer twerker (animates only when footer visible)
safe(()=>{const f=document.querySelector('footer');if(!f||!sprite)return;const w=document.createElement('div');w.className='foot-crew';w.innerHTML='<img alt="" aria-hidden="true" width="44" height="55"><span>certified thicc. 🍑 do not report.</span>';w.querySelector('img').src=sprite;f.prepend(w);
  if('IntersectionObserver' in window)new IntersectionObserver(es=>w.classList.toggle('live',es[0].isIntersecting&&!RM)).observe(w);});
})();
