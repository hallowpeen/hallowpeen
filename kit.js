/* Meme kit: client-side generated individual PNG downloads (no zip, no network). */
(function(){"use strict";const safe=f=>{try{f()}catch(e){}};const T=s=>window.HPI?HPI.t(s):s;
const root=document.getElementById('kit');if(!root||!window.HP)return;const HP=window.HP;
function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function crew(pose,col,acc){const c=cnv(512,512),x=c.getContext('2d');x.shadowColor=col[0];x.shadowBlur=24;HP.drawCrew(x,256,300,2.1,pose,col,acc||{});return c.toDataURL('image/png');}
function logo(){const im=document.querySelector('.logo-wrap img');const n=im.naturalWidth||512,c=cnv(n,n),x=c.getContext('2d');x.drawImage(im,0,0,n,n);return c.toDataURL('image/png');}
function badge(){const c=cnv(600,600),x=c.getContext('2d');x.translate(300,300);
  const g=x.createRadialGradient(0,-40,20,0,0,290);g.addColorStop(0,'#3a1060');g.addColorStop(1,'#0b0212');x.fillStyle=g;x.beginPath();x.arc(0,0,285,0,7);x.fill();
  x.lineWidth=16;x.strokeStyle='#ff7b00';x.shadowColor='#ff7b00';x.shadowBlur=30;x.stroke();x.shadowBlur=0;
  HP.drawCrew(x,0,40,1.6,'shoulder',HP.COLORS.orange,{});
  x.textAlign='center';x.fillStyle='#ffb347';x.font='bold 46px Rubik, sans-serif';x.fillText(T('CERTIFIED SUS'),0,-180);
  x.fillStyle='#fff';x.font='bold 40px Rubik, sans-serif';x.fillText('$HPEEN',0,215);return c.toDataURL('image/png');}
const C=HP.COLORS;
const ITEMS=[
 ['Blank carver: orange glow','hallowpeen-blank-orange.png',()=>HP.blank&&HP.blank('orange')],
 ['Blank carver: toxic green','hallowpeen-blank-green.png',()=>HP.blank&&HP.blank('green')],
 ['Blank carver: haunted purple','hallowpeen-blank-purple.png',()=>HP.blank&&HP.blank('purple')],
 ['Logo (PNG)','hallowpeen-logo.png',logo],
 ['Crewmate sprite: dummy thicc','hallowpeen-crew-thicc.png',()=>crew('thicc',C.orange)],
 ['Crewmate sprite: over the shoulder','hallowpeen-crew-shoulder.png',()=>crew('shoulder',C.purple)],
 ['Crewmate sprite: ghost','hallowpeen-crew-ghost.png',()=>crew('standing',['#c8d0ff','#ffffff'],{ghost:true})],
 ['Crewmate sprite: Pumpkin King','hallowpeen-crew-king.png',()=>crew('standing',['#ffd23f','#fff3a0'],{crown:true})],
 ['Sticker: Certified Sus badge','hallowpeen-certified-sus.png',badge]];
const cache={};
function card([label,file,fn],i){const d=document.createElement('div');d.className='kit-item';
  const im=new Image();im.alt='';im.width=160;im.height=i<3?100:160;im.decoding='async';
  const b=document.createElement('a');b.className='btn small';b.textContent=T('⬇ Download');b.download=file;b.href='#';
  b.setAttribute('aria-label',T('Download')+': '+T(label));
  const p=document.createElement('p');p.textContent=T(label);
  b.addEventListener('click',e=>{if(!cache[i]){e.preventDefault();safe(()=>{cache[i]=fn();b.href=cache[i];b.click();});}safe(()=>HPS.play('pop'));});
  d.append(im,p,b);root.appendChild(d);return{im,b,fn,i};}
const cards=ITEMS.map(card);
function previews(){cards.forEach(({im,b,fn,i},n)=>setTimeout(()=>safe(()=>{if(!cache[i])cache[i]=fn();if(cache[i]){im.src=cache[i];b.href=cache[i];}}),n*60));}
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();previews();}},{rootMargin:'200px'});io.observe(root);}else previews();
})();
