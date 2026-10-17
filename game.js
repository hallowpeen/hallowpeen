/* Vent Dash: tiny runner. Loop runs only while playing + visible. */
(function(){"use strict";
const cv=document.getElementById('dash');if(!cv||!window.HP)return;
const c=cv.getContext('2d'),W=cv.width,H=cv.height,GY=H-58;
const $=id=>document.getElementById(id);const snd=n=>{try{window.HPS&&HPS.play(n)}catch(e){}};
let best=0;try{best=+localStorage.getItem('hp_dash_best')||0}catch(e){}
const P={x:110,y:GY,vy:0,ground:true,sq:0};let obs=[],candy=[],parts=[],speed=6,dist=0,cand=0,state='idle',raf=0,last=0,visible=false,spawnT=0,cT=0,t=0,shake=0,newBest=false;
function reset(){P.y=GY;P.vy=0;P.ground=true;P.sq=0;obs=[];candy=[];parts=[];speed=6;dist=0;cand=0;spawnT=60;cT=90;t=0;shake=0;newBest=false;}
function score(){return Math.floor(dist/10)+cand*5;}
function jump(){if(state!=='play'){start();return;}if(P.ground){P.vy=-15.5;P.ground=false;P.sq=-0.25;snd('pop');}}
function start(){reset();state='play';snd('whoosh');$('dashMsg').hidden=true;loop();}
function over(){state='over';shake=12;snd('bonk');const s=score();if(s>best){best=s;newBest=true;try{localStorage.setItem('hp_dash_best',best)}catch(e){}setTimeout(()=>snd('siren'),300);}
  $('dashMsg').hidden=false;$('dashTitle').textContent=newBest?'NEW HIGH SCORE, SUSSY BAKA 🏆':'YOU GOT VENTED 💀';$('dashSub').textContent='Score '+s+' · best '+best+' · tap / space to retry';
  $('dashShare').href='https://twitter.com/intent/tweet?text='+encodeURIComponent('I scored '+s+' in Vent Dash and stayed dummy thicc the whole time 🍑🎃 $HPEEN')+'&url='+encodeURIComponent('https://hallowpeen.com/');$('dashShare').hidden=false;draw();}
function spawn(){const r=Math.random();if(r<0.4)obs.push({k:'vent',x:W+20,y:GY+2,w:70,h:18});else if(r<0.7)obs.push({k:'pumpkin',x:W+20,y:GY-34,w:40,h:36,rot:0});else obs.push({k:'knife',x:W+20,y:GY-(Math.random()<0.5?40:120),w:56,h:14});
  spawnT=Math.max(38,90-speed*4)+Math.random()*50;}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function step(){t++;speed=Math.min(15,6+dist/2500);dist+=speed;
  P.vy+=0.8;P.y+=P.vy;if(P.y>=GY){if(!P.ground){P.sq=0.3;for(let i=0;i<6;i++)parts.push({x:P.x,y:GY+40,vx:(Math.random()-.5)*4,vy:-Math.random()*2,l:1,c:'#b9a99a'});}P.y=GY;P.vy=0;P.ground=true;}
  P.sq*=0.82;
  if(--spawnT<=0)spawn();if(--cT<=0){candy.push({x:W+20,y:GY-30-Math.random()*130,w:22,h:22});cT=50+Math.random()*80;}
  obs.forEach(o=>{o.x-=speed*(o.k==='knife'?1.35:1);if(o.k==='pumpkin')o.rot-=speed/20;});candy.forEach(o=>o.x-=speed);obs=obs.filter(o=>o.x>-100);candy=candy.filter(o=>o.x>-40&&!o.got);
  const box={x:P.x-26,y:P.y-62,w:56,h:96};
  for(const o of obs){if(hit(box,{x:o.x+6,y:o.y+4,w:o.w-12,h:o.h-6})){over();return;}}
  candy.forEach(o=>{if(!o.got&&hit(box,o)){o.got=true;cand++;snd('sparkle');for(let i=0;i<8;i++)parts.push({x:o.x,y:o.y,vx:(Math.random()-.5)*6,vy:(Math.random()-.7)*6,l:1,c:'#ffcc00'});}});
  parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.l-=0.04;});parts=parts.filter(p=>p.l>0).slice(-40);}
function hallway(){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#14161f');g.addColorStop(0.7,'#232838');g.addColorStop(1,'#0b0c12');c.fillStyle=g;c.fillRect(0,0,W,H);
  const off=(dist*0.4)%160;for(let x=-off;x<W;x+=160){c.fillStyle='#1b1f2c';c.fillRect(x,30,150,GY-60);c.strokeStyle='#2f3548';c.lineWidth=3;c.strokeRect(x+4,34,142,GY-68);
    const on=Math.sin(t*0.15+x)>-0.9;c.fillStyle=on?'rgba(255,140,40,.85)':'rgba(255,140,40,.2)';c.fillRect(x+60,40,30,6);if(on){c.fillStyle='rgba(255,140,40,.08)';c.beginPath();c.moveTo(x+60,46);c.lineTo(x+90,46);c.lineTo(x+120,GY);c.lineTo(x+30,GY);c.fill();}}
  c.fillStyle='#3a3f52';c.fillRect(0,GY+34,W,H-GY-34);const fo=dist%60;c.strokeStyle='#4c5370';c.lineWidth=2;for(let x=-fo;x<W;x+=60){c.beginPath();c.moveTo(x,GY+34);c.lineTo(x-20,H);c.stroke();}
  c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,GY+34,W,6);}
function drawObs(o){c.save();
  if(o.k==='vent'){c.fillStyle='#1a1a1a';c.strokeStyle='#888';c.lineWidth=3;c.fillRect(o.x,o.y+20,o.w,o.h);c.strokeRect(o.x,o.y+20,o.w,o.h);c.strokeStyle='#555';for(let i=8;i<o.w;i+=10){c.beginPath();c.moveTo(o.x+i,o.y+22);c.lineTo(o.x+i,o.y+36);c.stroke();}
    c.fillStyle='rgba(255,40,40,'+(0.4+0.4*Math.sin(t*0.3))+')';c.beginPath();c.arc(o.x+o.w/2,o.y+14,5,0,7);c.fill();}
  else if(o.k==='pumpkin'){c.translate(o.x+20,o.y+18);c.rotate(o.rot);const g=c.createRadialGradient(-6,-8,3,0,0,22);g.addColorStop(0,'#ffb24d');g.addColorStop(1,'#a84000');c.fillStyle=g;c.strokeStyle='#3a1200';c.lineWidth=3;c.beginPath();c.ellipse(0,0,21,18,0,0,7);c.fill();c.stroke();
    c.fillStyle='#ffe27a';c.beginPath();c.moveTo(-10,-4);c.lineTo(-4,-4);c.lineTo(-7,-10);c.fill();c.beginPath();c.moveTo(4,-4);c.lineTo(10,-4);c.lineTo(7,-10);c.fill();c.fillRect(-9,4,18,4);}
  else{c.translate(o.x,o.y+7);c.fillStyle='#d8dde6';c.strokeStyle='#4a4f5a';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.lineTo(36,-6);c.lineTo(36,6);c.closePath();c.fill();c.stroke();c.fillStyle='#5a2a10';c.fillRect(36,-4,20,8);
    c.strokeStyle='rgba(255,255,255,.35)';c.beginPath();c.moveTo(60,0);c.lineTo(90,0);c.stroke();}
  c.restore();}
function draw(){c.save();if(shake>0){c.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=0.8;}
  hallway();obs.forEach(drawObs);
  candy.forEach(o=>{c.save();c.translate(o.x+11,o.y+11+Math.sin(t*0.2+o.x)*3);c.font='22px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🍬',0,0);c.restore();});
  // player: thicc crewmate with run bob + squash/stretch
  const run=P.ground&&state==='play'?Math.sin(t*0.6):0;const sy=1-P.sq-(P.ground?0:Math.max(-0.12,P.vy*-0.008))+run*0.04,sx=1+P.sq*0.7-run*0.03;
  c.save();c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(P.x,GY+40,34*(1-(GY-P.y)/400),7,0,0,7);c.fill();c.restore();
  c.save();c.translate(P.x,P.y+38);c.scale(sx,sy);c.rotate(P.ground?run*0.05:-0.12);c.translate(-P.x,-(P.y+38));c.translate(P.x,0);c.scale(-1,1);c.translate(-P.x,0);HP.drawCrew(c,P.x,P.y-8,0.62,'thicc',HP.COLORS.orange,{});c.restore();
  parts.forEach(p=>{c.globalAlpha=p.l;c.fillStyle=p.c;c.fillRect(p.x,p.y,4,4);});c.globalAlpha=1;
  c.font='bold 20px Rubik, sans-serif';c.fillStyle='#fff';c.textAlign='left';c.fillText('Score '+score(),16,28);c.textAlign='right';c.fillText('Best '+best+'  🍬'+cand,W-16,28);
  const v=c.createRadialGradient(W/2,H/2,H*0.4,W/2,H/2,W*0.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=v;c.fillRect(0,0,W,H);c.restore();}
function onScreen(){if(visible)return true;const r=cv.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
function frame(now){raf=0;if(state!=='play')return;if(!onScreen()||document.hidden){state='paused';$('dashMsg').hidden=false;$('dashTitle').textContent='Paused (you looked away, sus)';$('dashSub').textContent='tap / space to resume';return;}
  if(now-last>=30){last=now;step();if(state!=='play')return;draw();}raf=requestAnimationFrame(frame);}
function loop(){if(!raf)raf=requestAnimationFrame(frame);}
function resume(){if(state==='paused'){state='play';$('dashMsg').hidden=true;loop();return true;}return false;}
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(!resume())jump();});
$('dashShare').addEventListener('pointerdown',e=>e.stopPropagation());
$('dashMsg').addEventListener('pointerdown',e=>{e.preventDefault();if(!resume())jump();});
addEventListener('keydown',e=>{if(!visible)return;if(e.code==='Space'||e.key==='ArrowUp'){if(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;e.preventDefault();if(!resume())jump();}});
try{new IntersectionObserver(es=>{visible=es[0].isIntersecting;}).observe(cv);}catch(e){visible=true;}
$('dashBest').textContent=best;reset();if(document.fonts)document.fonts.ready.then(draw);draw();
window.HPG={state:()=>state,score,running:()=>!!raf};
})();
