/* "What kind of crewmate are you?" 5-question sus quiz -> shareable PNG card (client-side). */
(function(){"use strict";const safe=f=>{try{f()}catch(e){}};const T=s=>window.HPI?HPI.t(s):s;
const root=document.getElementById('quiz');if(!root||!window.HP)return;
const TYPES={
 T:{name:'Dummy Thicc Tasker',pose:'thicc',col:['#ff7b00','#ffb347'],desc:'Does every task. Takes up the whole hallway doing it.',emoji:'🍑'},
 V:{name:'Vent Gremlin',pose:'ventpeek',col:['#b026ff','#e0a3ff'],desc:'Nobody saw you come in. Nobody saw you leave. Very sus.',emoji:'🕳️'},
 D:{name:'Certified Sus Detective',pose:'shoulder',col:['#39ff14','#b6ff9e'],desc:'Called an emergency meeting over vibes. Was right.',emoji:'🔍'},
 C:{name:'Cake Day Menace',pose:'standing',acc:{crown:true},col:['#ffd23f','#fff3a0'],desc:'Shows up late, with snacks, and somehow wins anyway.',emoji:'🎂'}};
const Q=[
 ['Emergency meeting gets called. You:',[['Already there. Did 3 tasks on the way.','T'],['Pop out of the nearest vent.','V'],['"I have evidence."','D'],['Arrive late holding candy.','C']]],
 ['Your Halloween costume:',[['A crewmate, but thicker.','T'],['A ghost, so nobody can vote me out.','V'],['A detective trench coat.','D'],['The entire pumpkin.','C']]],
 ['Favorite task:',[['Medbay scan (I pose for it).','T'],['"Fixing" the vents.','V'],['Watching cams like a reality show.','D'],['Refueling. Mostly myself. With snacks.','C']]],
 ['Someone yells "orange sus!" You:',[['"Orange is busy. Look at those tasks."','T'],['Already left the room.','V'],['"Where. When. How long."','D'],['"Anyway, who wants candy corn?"','C']]],
 ['Your walk:',[['Every step is a jiggle.','T'],['Silent. Unseen.','V'],['Dramatic slow motion.','D'],['Skipping, slightly chaotic.','C']]]];
let i=0,pick={T:0,V:0,D:0,C:0};
function el(t,c,txt){const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e;}
function ask(){root.innerHTML='';const [q,opts]=Q[i];root.appendChild(el('p','qz-prog',T('Question')+' '+(i+1)+'/'+Q.length));const h=el('h3','qz-q',T(q));h.tabIndex=-1;root.appendChild(h);
  const g=el('div','qz-opts');opts.forEach(([a,k])=>{const b=el('button','btn qz-opt',T(a));b.type='button';b.addEventListener('click',()=>{pick[k]++;i++;safe(()=>HPS.play('pop'));i<Q.length?ask():result();});g.appendChild(b);});root.appendChild(g);safe(()=>h.focus({preventScroll:true}));}
function card(k){const t=TYPES[k],c=document.createElement('canvas');c.width=1080;c.height=1080;const x=c.getContext('2d');
  const bg=x.createRadialGradient(540,460,80,540,540,760);bg.addColorStop(0,'#3a1060');bg.addColorStop(0.6,'#140422');bg.addColorStop(1,'#050005');x.fillStyle=bg;x.fillRect(0,0,1080,1080);
  x.fillStyle='rgba(255,255,255,.7)';for(let s=0;s<70;s++){const sx=(s*137.5)%1080,sy=(s*91.7)%600;x.fillRect(sx,sy,s%3?2:3,s%3?2:3);}
  x.fillStyle='#fff5d6';x.shadowColor='#ffe9a8';x.shadowBlur=60;x.beginPath();x.arc(900,340,62,0,7);x.fill();x.shadowBlur=0;
  x.strokeStyle='#ff7b00';x.lineWidth=14;x.strokeRect(30,30,1020,1020);
  x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.ellipse(540,770,230,40,0,0,7);x.fill();
  x.save();x.beginPath();x.rect(40,250,1000,560);x.clip();x.shadowColor=t.col[0];x.shadowBlur=50;window.HP.drawCrew(x,540,620,2.5,t.pose,t.col,t.acc||{});x.restore();x.shadowBlur=0;
  x.textAlign='center';x.fillStyle='#ffb347';x.font='bold 46px Rubik, sans-serif';x.fillText(T('I am a…'),540,120);
  x.fillStyle='#ff7b00';x.shadowColor='#ff7b00';x.shadowBlur=24;x.font='88px Creepster, Rubik, sans-serif';
  const nm=T(t.name);let fs=88;while(x.measureText(nm).width>960&&fs>40){fs-=6;x.font=fs+'px Creepster, Rubik, sans-serif';}x.fillText(nm,540,220);x.shadowBlur=0;
  x.fillStyle='#fff';x.font='600 40px Rubik, sans-serif';wrap(x,T(t.desc),540,870,900,50);
  x.fillStyle='#ffb347';x.font='bold 36px Rubik, sans-serif';x.fillText('$HPEEN · hallowpeen.com',540,1010);return c;}
function wrap(x,s,cx,y,w,lh){const ws=s.split(' ');let line='';const lines=[];ws.forEach(word=>{const t=line?line+' '+word:word;if(x.measureText(t).width>w&&line){lines.push(line);line=word;}else line=t;});lines.push(line);lines.forEach((l,n)=>x.fillText(l,cx,y+n*lh));}
function result(){let k='T';for(const q in pick)if(pick[q]>pick[k])k=q;const t=TYPES[k];safe(()=>HPS.play('sparkle'));
  root.innerHTML='';const c=card(k);const img=new Image();img.className='qz-card';img.width=540;img.height=540;img.alt=T('Quiz result card')+': '+T(t.name);
  const url=c.toDataURL('image/png');img.src=url;root.appendChild(img);
  const h=el('h3','qz-q',t.emoji+' '+T(t.name));h.tabIndex=-1;root.appendChild(h);root.appendChild(el('p','',T(t.desc)));
  const row=el('div','qz-row');const dl=el('a','btn',T('⬇ Download card'));dl.href=url;dl.download='hallowpeen-'+k.toLowerCase()+'-crewmate.png';row.appendChild(dl);
  const x=el('a','btn',T('𝕏 Share result'));x.target='_blank';x.rel='noopener';x.href='https://twitter.com/intent/tweet?text='+encodeURIComponent(T('I took the HallowPeen crewmate quiz and I am a')+' '+T(t.name)+' '+t.emoji+'🎃 $HPEEN')+'&url='+encodeURIComponent('https://hallowpeen.com/');row.appendChild(x);
  if(navigator.canShare)safe(()=>c.toBlob(b=>{const f=new File([b],dl.download,{type:'image/png'});if(navigator.canShare({files:[f]})){const s=el('button','btn',T('📤 Share image'));s.type='button';s.addEventListener('click',()=>navigator.share({files:[f],text:'$HPEEN https://hallowpeen.com/'}).catch(()=>{}));row.appendChild(s);}},'image/png'));
  const again=el('button','btn ghost-btn',T('↻ Retake'));again.type='button';again.addEventListener('click',()=>{i=0;pick={T:0,V:0,D:0,C:0};ask();});row.appendChild(again);root.appendChild(row);
  safe(()=>localStorage.setItem('hp_quiz',k));safe(()=>h.focus({preventScroll:true}));}
ask();window.HPQ={card,TYPES};
})();
