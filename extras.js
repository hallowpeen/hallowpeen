/* HallowPeen easter eggs: impostor hunt, konami, hero bonks, intro. */
(function(){"use strict";
const safe=f=>{try{return f()}catch(e){}};
const RM=safe(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)||false;
const toast=(m,c)=>safe(()=>window.HPF&&HPF.toast(m,c));
const snd=n=>safe(()=>window.HPS&&HPS.play(n));
const ls={get:(k,d)=>safe(()=>JSON.parse(localStorage.getItem(k)))??d,set:(k,v)=>safe(()=>localStorage.setItem(k,JSON.stringify(v)))};
function sprite(pose,col,w,h,s){return safe(()=>{const c=document.createElement('canvas');c.width=w;c.height=h;HP.drawCrew(c.getContext('2d'),w/2,h*0.6,s,pose,col,{});return c.toDataURL('image/png');})||'';}

/* 1. intro (once per session, skippable, no reduced motion) */
safe(()=>{if(RM||sessionStorage.getItem('hp_intro'))return;sessionStorage.setItem('hp_intro','1');
  const o=document.createElement('div');o.className='intro';o.setAttribute('role','presentation');
  o.innerHTML='<p class="intro-q">Who is the impostor?</p><img class="intro-crew" alt="" width="90" height="112"><small>tap to skip</small>';
  o.querySelector('img').src=sprite('thicc',HP.COLORS.orange,160,200,0.9);document.body.appendChild(o);
  const end=()=>{if(!o.parentNode)return;o.classList.add('out');setTimeout(()=>o.remove(),350);};
  o.addEventListener('click',end);addEventListener('keydown',end,{once:true});setTimeout(end,1300);});

/* 2. impostor hunt */
safe(()=>{const spots=[['about','8%','12%'],['carve-sec','92%','6%'],['unlocks','4%','88%'],['tokenomics','95%','85%'],['socials','15%','30%']];
  let found=ls.get('hp_found',[]);if(!Array.isArray(found))found=[];
  const cols=[HP.COLORS.orange,HP.COLORS.green,HP.COLORS.purple,['#ff2a2a','#ff8a8a'],['#5ee7ff','#e6fbff']];
  const badge=document.createElement('div');badge.className='hunt-badge';badge.setAttribute('aria-live','polite');document.body.appendChild(badge);
  const upd=()=>{badge.textContent='';const ic=document.createElement('span');ic.textContent='🔍 ';const lb=document.createElement('span');lb.className='lbl';lb.textContent='impostors found: ';badge.append(ic,lb,document.createTextNode(found.length+'/5'));badge.title='impostors found: '+found.length+'/5';badge.classList.toggle('done',found.length>=5);};upd();
  spots.forEach(([id,x,y],i)=>{const sec=document.getElementById(id);if(!sec||found.includes(i))return;
    if(getComputedStyle(sec).position==='static')sec.style.position='relative';
    const b=document.createElement('button');b.type='button';b.className='hidden-crew';b.style.left=x;b.style.top=y;b.setAttribute('aria-label','A suspicious tiny crewmate');
    const im=new Image(30,38);im.alt='';im.src=sprite(i%2?'sus':'standing',cols[i],80,100,0.6);b.appendChild(im);sec.appendChild(b);
    b.addEventListener('click',e=>{e.stopPropagation();if(found.includes(i))return;found.push(i);ls.set('hp_found',found);upd();snd('pop');setTimeout(()=>snd('sparkle'),120);
      b.classList.add('popped');setTimeout(()=>b.remove(),500);
      if(found.length>=5){toast('🕵️ ALL 5 IMPOSTORS EJECTED! Certified Sus sticker unlocked. Check the sticker pack.');snd('siren');certified();}
      else toast(['Found one! Ejected. 🚀','That one was def sus. '+found.length+'/5','Gotcha, sussy baka. '+found.length+'/5'][found.length%3],'mini');});});
  function certified(){safe(()=>{const wrap=document.getElementById('stickers');if(!wrap||document.getElementById('certSus'))return;const S=512,c=document.createElement('canvas');c.width=S;c.height=S;const x=c.getContext('2d');
    x.fillStyle='#120700';x.beginPath();x.arc(S/2,S/2,S/2-14,0,7);x.fill();x.lineWidth=16;x.strokeStyle='#ffcc00';x.shadowColor='#ffcc00';x.shadowBlur=30;x.stroke();x.shadowBlur=0;
    HP.drawCrew(x,S/2,S*0.5,1.9,'shoulder',HP.SPECIAL.golden,{});
    x.font='64px Creepster, cursive';x.textAlign='center';x.fillStyle='#ffcc00';x.lineWidth=8;x.strokeStyle='#1a0800';x.strokeText('CERTIFIED SUS',S/2,S*0.86);x.fillText(window.HPI?HPI.t('CERTIFIED SUS'):'CERTIFIED SUS',S/2,S*0.86);
    const card=document.createElement('div');card.className='sticker cert';card.id='certSus';const btn=document.createElement('button');btn.type='button';btn.className='btn small';btn.textContent='⬇ Yoink Certified Sus (secret)';
    btn.onclick=()=>safe(()=>{const a=document.createElement('a');a.download='hpeen-certified-sus.png';a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();});
    card.appendChild(c);card.appendChild(btn);wrap.prepend(card);});}
  if(found.length>=5){const go=()=>certified();const st=document.getElementById('stickers');if(st)new MutationObserver((m,o)=>{if(st.querySelector('.sticker:not(.cert)')){o.disconnect();go();}}).observe(st,{childList:true});}});

/* 3. konami */
safe(()=>{const seq=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let i=0,busy=false;
  addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;i=(k===seq[i])?i+1:(k===seq[0]?1:0);
    if(i===seq.length){i=0;if(busy)return;busy=true;document.documentElement.classList.add('vented');snd('whoosh');toast('🌀 YOU GOT VENTED. Hang tight, sussy baka…');setTimeout(()=>{document.documentElement.classList.remove('vented');busy=false;},5000);}});});

/* 4. hero pumpkin bonks */
safe(()=>{const w=document.querySelector('.logo-wrap');if(!w)return;let n=ls.get('hp_bonks',0)|0;
  const r=document.createElement('span');r.className='react';r.setAttribute('aria-hidden','true');w.appendChild(r);
  const ctr=document.createElement('p');ctr.className='bonks';const show=()=>{ctr.textContent=n?('🎃 you bonked the pumpkin '+n+'x. it remembers.'):'psst: poke the pumpkin 💨';};show();w.after(ctr);
  const faces=['😑','😏','😱','🥴','😳','🤨'];
  w.addEventListener('click',()=>{n++;ls.set('hp_bonks',n);show();const f=n%10===0?'🤯':faces[Math.floor(Math.random()*faces.length)];r.textContent=f;r.classList.remove('go');void r.offsetWidth;r.classList.add('go');
    w.classList.remove('bonked');void w.offsetWidth;w.classList.add('bonked');if(n%10===0)toast('🤯 '+n+' bonks?! The pumpkin is filing a report.','mini');});});
})();
