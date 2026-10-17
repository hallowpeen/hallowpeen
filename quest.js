/* Daily Halloween Quest: Oct 24-31, one hidden pumpkin per day unlocks that day's sticker. Preview: ?quest=1..8 */
(function(){"use strict";
const safe=f=>{try{return f()}catch(e){}};const tr=s=>window.HPI?HPI.t(s):s;
const toast=(m,c)=>safe(()=>window.HPF&&HPF.toast(m,c));const snd=n=>safe(()=>window.HPS&&HPS.play(n));
const sec=document.getElementById('quest-sec');if(!sec||!window.HP)return;
const YEAR=2026;const qs=new URLSearchParams(location.search);const prev=parseInt(qs.get('quest'),10);
const now=new Date();let day=0; // 1..8 = Oct 24..31
if(prev>=1&&prev<=8)day=prev;else if(now.getFullYear()===YEAR&&now.getMonth()===9&&now.getDate()>=24)day=now.getDate()-23;
const store=(prev>=1&&prev<=8)?sessionStorage:localStorage; // previews don't touch real progress
let got={};try{got=JSON.parse(store.getItem('hp_quest'))||{}}catch(e){}
const save=()=>safe(()=>store.setItem('hp_quest',JSON.stringify(got)));
const DAYS=[
 ['Cape Crew','#ff7b00',{cape:true},'standing'],['Ghosted','#c8d0ff',{ghost:true},'standing'],['Witchy','#b026ff',{hat:true},'waving'],['Candy Corn','#ffcc00',{},'thicc'],
 ['Sus Mummy','#e6dcc8',{mummy:true},'sus'],['Night Bat','#5a5a6a',{bat:true},'shoulder'],['Golden Hour','#ffcc00',{},'twerk'],['Pumpkin King','#ff7b00',{crown:true},'standing']];
const SPOTS=[['about','88%','6%'],['carve-sec','3%','40%'],['dash-sec','94%','30%'],['stickers-sec','6%','8%'],['buy','90%','60%'],['unlocks','50%','2%'],['tokenomics','2%','60%'],['socials','80%','20%']];
function art(i){const S=512,c=document.createElement('canvas');c.width=S;c.height=S;const x=c.getContext('2d');const [name,hex,acc,pose]=DAYS[i];
  const bg=x.createRadialGradient(S/2,S*0.45,20,S/2,S/2,S/2);bg.addColorStop(0,'#2a1238');bg.addColorStop(1,'#0a0510');x.fillStyle=bg;x.beginPath();x.arc(S/2,S/2,S/2-10,0,7);x.fill();
  x.lineWidth=12;x.strokeStyle=hex;x.shadowColor=hex;x.shadowBlur=24;x.stroke();x.shadowBlur=0;
  const col=i===3?['#ff9a00','#ffe066']:i===6?HP.SPECIAL.golden:i===4?['#b8ac90','#f2ead8']:i===5?['#4a4a5a','#9a9ab0']:i===2?HP.COLORS.purple:HP.COLORS.orange;
  if(acc.bat){x.save();x.fillStyle='#1a1a24';x.strokeStyle='#000';x.lineWidth=4;[-1,1].forEach(sd=>{x.beginPath();x.moveTo(S/2+sd*30,S*0.45);x.quadraticCurveTo(S/2+sd*150,S*0.25,S/2+sd*190,S*0.42);x.lineTo(S/2+sd*150,S*0.48);x.lineTo(S/2+sd*120,S*0.44);x.lineTo(S/2+sd*90,S*0.52);x.closePath();x.fill();x.stroke();});x.restore();}
  HP.drawCrew(x,S/2,S*0.56,1.9,pose,col,{cape:acc.cape,ghost:acc.ghost,hat:acc.hat,crown:acc.crown});
  if(acc.mummy){x.save();x.strokeStyle='rgba(240,232,210,.9)';x.lineWidth=9;for(let k=0;k<5;k++){x.beginPath();x.moveTo(S/2-90,S*0.42+k*30);x.lineTo(S/2+90,S*0.38+k*30+14);x.stroke();}x.restore();}
  x.font='54px Creepster, cursive';x.textAlign='center';x.lineWidth=8;x.strokeStyle='#1a0800';x.fillStyle='#ffcc00';const t1=tr('DAY')+' '+(i+1);x.strokeText(t1,S/2,78);x.fillText(t1,S/2,78);
  x.font='46px Creepster, cursive';x.fillStyle='#ffb347';x.strokeText(tr(name),S/2,S-48);x.fillText(tr(name),S/2,S-48);return c;}
const grid=document.getElementById('questGrid'),status=document.getElementById('questStatus');
function render(){grid.innerHTML='';DAYS.forEach((d,i)=>{const card=document.createElement('div');card.className='qcard'+(got[i]?' got':'');const lab=document.createElement('p');
  lab.textContent=tr('Oct')+' '+(24+i)+' · '+tr(d[0]);
  if(got[i]){const c=art(i);card.appendChild(c);const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent=tr('⬇ Yoink');
    b.onclick=()=>safe(()=>{const a=document.createElement('a');a.download='hpeen-quest-day-'+(i+1)+'.png';a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();});card.appendChild(lab);card.appendChild(b);}
  else{const l=document.createElement('div');l.className='qlock';l.textContent=(day&&i+1===day)?'❓':(day&&i+1<day?'💀':'🔒');card.appendChild(l);
    const m=document.createElement('small');m.textContent=day&&i+1===day?tr("Today's pumpkin is hiding somewhere on this page 👀"):(day&&i+1<day?tr('Missed it. The vents took it.'):tr('Locked till that day'));card.appendChild(lab);card.appendChild(m);}
  grid.appendChild(card);});
  const n=Object.keys(got).length;status.textContent=day?(tr('Quest is LIVE. Found')+' '+n+'/8'):tr('The quest starts Oct 24. One hidden pumpkin per day, one secret sticker each.');}
render();
if(day&&!got[day-1])safe(()=>{const [id,x,y]=SPOTS[day-1];const host=document.getElementById(id);if(!host)return;if(getComputedStyle(host).position==='static')host.style.position='relative';
  const b=document.createElement('button');b.type='button';b.className='quest-pumpkin';b.style.left=x;b.style.top=y;b.textContent='🎃';b.setAttribute('aria-label',tr('A suspicious little pumpkin'));host.appendChild(b);
  b.addEventListener('click',e=>{e.stopPropagation();got[day-1]=1;save();snd('pop');setTimeout(()=>snd('sparkle'),120);b.classList.add('popped');setTimeout(()=>b.remove(),500);
    toast(tr('🎃 Daily pumpkin found! Day')+' '+day+' '+tr('sticker unlocked in the Quest section.'));render();});});
})();
