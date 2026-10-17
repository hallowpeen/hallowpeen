/* HallowPeen carver: canvas meme generator. Exposes window.HP for features.js */
(function(){
const COLORS={orange:['#ff7b00','#ffb347'],green:['#39ff14','#b6ff9e'],purple:['#b026ff','#e0a3ff']};
let T=0; // animation clock (seconds); 0 = static pose
const SPECIAL={golden:['#ffcc00','#fff1a8'],diamond:['#5ee7ff','#e6fbff']};
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}

// Side-profile crewmate with a big cartoon rear (like the logo). Facing right. Silhouette only.
function thiccBody(c,col,o){o=o||{};
  c.shadowColor=col[0];c.shadowBlur=28;c.fillStyle=col[1];c.strokeStyle=col[0];c.lineWidth=6;
  // legs
  rr(c,-30,40,26,32,10);c.fill();c.stroke();rr(c,8,40,26,32,10);c.fill();c.stroke();
  // torso
  c.beginPath();c.moveTo(-42,40);c.lineTo(-42,-20);c.bezierCurveTo(-42,-85,45,-85,45,-20);c.lineTo(45,45);c.quadraticCurveTo(10,55,-20,45);c.closePath();c.fill();c.stroke();
  // backpack
  rr(c,-60,-40,20,40,10);c.fill();c.stroke();
  // rear: two round cartoon cheeks sticking out the back
  c.beginPath();c.arc(-52,28,30,0,7);c.fill();c.stroke();
  c.beginPath();c.arc(-30,40,30,0,7);c.fill();c.stroke();

  // cheek crease
  c.shadowBlur=0;c.lineWidth=4;c.beginPath();c.arc(-42,36,14,Math.PI*1.1,Math.PI*1.9);c.stroke();
  // visor
  c.shadowBlur=10;c.fillStyle='#111';c.lineWidth=4;c.beginPath();
  if(o.lookBack){c.ellipse(-20,-36,22,12,0.2,0,7);}else c.ellipse(20,-30,26,14,0,0,7);
  c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.ellipse(o.lookBack?-30:30,-34,6,3,0,0,7);c.fill();
}
function motion(c,col,x,y){c.save();c.strokeStyle=col[0];c.lineWidth=4;c.shadowColor=col[0];c.shadowBlur=10;c.lineCap='round';
  for(let i=0;i<3;i++){c.beginPath();c.arc(x,y,30+i*14,Math.PI*0.75,Math.PI*1.25);c.stroke();}c.restore();}
function special(c,pose,col){
  if(pose==='thicc'){c.scale(-1,1);thiccBody(c,col);return true;}
  if(pose==='shoulder'){thiccBody(c,col,{lookBack:T===0||Math.sin(T*1.3)>-0.4});
    c.save();c.font='bold 26px Rubik, sans-serif';c.fillStyle='#fff';c.shadowColor=col[0];c.shadowBlur=8;c.fillText('👀',-75,-70);c.restore();return true;}
  if(pose==='twerk'){c.rotate(0.45);thiccBody(c,col);c.rotate(-0.45);motion(c,col,-60,40);return true;}
  if(pose==='ventpeek'){c.save();c.beginPath();c.rect(-200,-200,215,400);c.clip();c.translate(20+(T?Math.sin(T*3)*6:0),0);c.rotate(T?Math.sin(T*9)*0.06:0);thiccBody(c,col);c.restore();
    c.save();c.fillStyle='#2b2b2b';c.strokeStyle='#888';c.lineWidth=4;rr(c,15,-95,34,180,6);c.fill();c.stroke();c.strokeStyle='#555';
    for(let y=-80;y<=70;y+=18){c.beginPath();c.moveTo(20,y);c.lineTo(44,y);c.stroke();}c.restore();
    motion(c,col,-40,35);c.save();c.font='bold 22px Rubik, sans-serif';c.fillStyle='#fff';c.fillText('*stuck*',-60,-80);c.restore();return true;}
  if(pose==='booty'){c.scale(-1,1);thiccBody(c,col);c.save();if(T&&(T%1.4)<0.5)c.translate(Math.sin(T*90)*2.5,0);c.fillStyle='#222';c.strokeStyle='#fff';c.lineWidth=3;c.shadowColor='#7df';c.shadowBlur=14;rr(c,38,-40,22,38,5);c.fill();c.stroke();c.fillStyle='#7df';c.fillRect(42,-35,14,26);c.restore();
    c.scale(-1,1);c.save();c.font='bold 20px Rubik, sans-serif';c.fillStyle='#fff';c.fillText('📱 u up?',-90,-80);c.restore();return true;}
  if(pose==='backitup'){const bump=T?Math.max(0,Math.sin(T*4))*14:0;c.save();c.scale(0.8,0.8);c.translate(-62-bump,0);thiccBody(c,col);c.restore();c.save();c.scale(0.8,0.8);c.translate(62+bump,0);c.scale(-1,1);thiccBody(c,['#ff2a2a','#ff8a8a']);c.restore();
    c.save();c.globalAlpha=bump<4?1:0.15;c.strokeStyle='#fff';c.lineWidth=4;c.lineCap='round';c.shadowColor='#fff';c.shadowBlur=8;[[-1,-1],[0,-1.3],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=>{c.beginPath();c.moveTo(dx*14,25+dy*14);c.lineTo(dx*32,25+dy*32);c.stroke();});
    c.font='bold 24px Creepster, cursive';c.fillStyle='#ffcc00';c.textAlign='center';c.fillText('BONK!',0,-60);c.restore();return true;}
  if(pose==='cake'){c.save();const L=[['#f7c5d8',90,30],['#fff3e0',110,30],['#f7c5d8',130,30]];let y=50;
      L.forEach(([fc,w,h],i)=>{c.fillStyle=fc;c.strokeStyle='#c46a8c';c.lineWidth=3;rr(c,-w/2,y+i*h,w,h,6);c.fill();c.stroke();});
      c.fillStyle='#ff4d6d';for(let i=-45;i<=45;i+=30){c.beginPath();c.arc(i,50,7,0,7);c.fill();}c.restore();
    c.save();c.translate(0,-15);c.scale(0.8,0.8);thiccBody(c,col);c.restore();
    c.save();c.font='bold 20px Rubik, sans-serif';c.fillStyle='#fff';c.textAlign='center';c.fillText('🎂 sitting on cake (literally)',0,165);c.restore();return true;}
  if(pose==='inspect'){c.save();c.fillStyle='rgba(57,255,20,.25)';c.strokeStyle='#39ff14';c.lineWidth=4;c.shadowColor='#39ff14';c.shadowBlur=20;c.beginPath();c.ellipse(0,85,95,20,0,0,7);c.fill();c.stroke();
      c.globalAlpha=.25;c.fillStyle='#39ff14';c.fillRect(-80,-100,160,185);c.globalAlpha=.9;c.fillStyle='#b6ff9e';c.fillRect(-80,-100+((T*90)%185),160,5);c.restore();
    c.save();c.rotate(0.4);thiccBody(c,col);c.restore();
    c.save();c.fillStyle='#fff';c.beginPath();c.ellipse(55,-110,80,24,0,0,7);c.fill();c.font='bold 17px Rubik, sans-serif';c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText('👀 scanning...',55,-110);c.restore();return true;}
  if(pose==='caught'){c.save();c.scale(0.75,0.75);c.translate(-55,0);drawCrew(c,0,0,1,'standing',col,{});c.translate(95,0);drawCrew(c,0,0,1,'sus',['#ff2a2a','#ff8a8a'],{});c.restore();
    c.save();c.fillStyle='#fff';c.shadowColor='#fff';c.shadowBlur=8;c.beginPath();c.ellipse(55,-95,38,26,0,0,7);c.fill();c.beginPath();c.moveTo(35,-75);c.lineTo(25,-55);c.lineTo(50,-72);c.fill();
    c.font='30px sans-serif';c.textAlign='center';c.textBaseline='middle';c.shadowBlur=0;c.fillText('👀',55,-95);c.restore();return true;}
  return false;}
// Draw a crewmate centered at (x,y). acc: {cape,ghost,hat,crown}
function drawCrew(c,x,y,s,pose,col,acc){
  acc=acc||{};c.save();c.translate(x,y);c.scale(s,s);
  if(special(c,pose,col)){c.restore();return;}
  if(pose==='sus')c.scale(-1,1);
  if(acc.cape){c.save();c.fillStyle='#5a0010';c.shadowColor='#ff0030';c.shadowBlur=14;c.beginPath();c.moveTo(-40,-45);c.lineTo(40,-45);c.lineTo(70,70);c.quadraticCurveTo(0,55,-80,70);c.closePath();c.fill();c.restore();}
  c.shadowColor=col[0];c.shadowBlur=30;c.fillStyle=col[1];c.strokeStyle=col[0];c.lineWidth=6;
  if(pose==='peeking'){c.beginPath();c.rect(-90,-15,180,200);c.clip();}
  if(acc.ghost){c.fillStyle='rgba(240,240,255,.92)';c.strokeStyle='#cfd8ff';c.beginPath();c.moveTo(-55,65);c.lineTo(-55,-20);c.bezierCurveTo(-55,-100,55,-100,55,-20);c.lineTo(55,65);
    for(let i=0;i<5;i++){c.lineTo(55-22*i-11,52);c.lineTo(55-22*(i+1),65);}c.closePath();c.fill();c.stroke();
    c.fillStyle='#111';c.beginPath();c.ellipse(-16,-25,8,12,0,0,7);c.ellipse(16,-25,8,12,0,0,7);c.fill();c.restore();return;}
  rr(c,-68,-20,26,60,10);c.fill();c.stroke();
  c.beginPath();c.moveTo(-45,60);c.lineTo(-45,-20);c.bezierCurveTo(-45,-85,45,-85,45,-20);c.lineTo(45,60);c.lineTo(18,60);c.lineTo(18,35);c.lineTo(-12,35);c.lineTo(-12,60);c.closePath();c.fill();c.stroke();
  if(pose==='waving'){c.save();c.translate(48,-8);c.rotate(T?Math.sin(T*6)*0.35:0);rr(c,-10,-52,20,55,10);c.fill();c.stroke();c.restore();}
  c.shadowBlur=10;c.fillStyle='#111';c.beginPath();
  if(pose==='sus')c.ellipse(18,-28,28,13,-0.15,0,7);else c.ellipse(14,-28,30,17,0,0,7);
  c.fill();c.lineWidth=4;c.stroke();
  c.fillStyle='#fff';c.beginPath();c.ellipse(pose==='sus'?32:24,-32,8,4,0,0,7);c.fill();
  if(acc.hat){c.fillStyle='#1a0a2a';c.strokeStyle='#b026ff';c.lineWidth=3;c.shadowColor='#b026ff';c.shadowBlur=12;
    c.beginPath();c.ellipse(0,-62,62,12,0,0,7);c.fill();c.stroke();c.beginPath();c.moveTo(-32,-64);c.quadraticCurveTo(-5,-120,30,-150);c.quadraticCurveTo(15,-110,32,-64);c.closePath();c.fill();c.stroke();
    c.fillStyle='#ff7b00';c.fillRect(-30,-76,62,8);}
  if(acc.crown){c.fillStyle='#ffcc00';c.strokeStyle='#ff9900';c.lineWidth=3;c.shadowColor='#ffcc00';c.shadowBlur=18;
    c.beginPath();c.moveTo(-35,-62);c.lineTo(-35,-95);c.lineTo(-18,-75);c.lineTo(0,-102);c.lineTo(18,-75);c.lineTo(35,-95);c.lineTo(35,-62);c.closePath();c.fill();c.stroke();}
  c.restore();
}
window.HP={COLORS,SPECIAL,drawCrew};
const cv=document.getElementById('carve');if(!cv)return;
const ctx=cv.getContext('2d');const W=cv.width,H=cv.height;
const st={pose:'standing',glow:'orange',top:'AYO SUSSSSS!',bottom:'',x:W*0.5,y:H*0.6,s:1.4,acc:'none'};
const $=id=>document.getElementById(id);
function pumpkin(c){
  const cx=W/2,cy=H*0.56,rx=W*0.38,ry=H*0.34;
  ctx.fillStyle='#050505';ctx.fillRect(0,0,W,H);
  const halo=ctx.createRadialGradient(cx,cy,ry*0.4,cx,cy,rx*1.4);halo.addColorStop(0,c[0]+'55');halo.addColorStop(1,'transparent');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#3b5a1a';ctx.beginPath();ctx.moveTo(cx-18,cy-ry+12);ctx.quadraticCurveTo(cx-10,cy-ry-50,cx+22,cy-ry-58);ctx.lineTo(cx+28,cy-ry-44);ctx.quadraticCurveTo(cx+8,cy-ry-30,cx+18,cy-ry+12);ctx.fill();
  [[-0.62,0.55],[0.62,0.55],[-0.3,0.78],[0.3,0.78],[0,0.62]].forEach(([ox,w])=>{const g=ctx.createRadialGradient(cx+ox*rx-20,cy-40,10,cx+ox*rx,cy,rx*w*1.1);
    g.addColorStop(0,'#ff9a2e');g.addColorStop(0.7,'#d65a00');g.addColorStop(1,'#6b2400');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx+ox*rx,cy,rx*w,ry,0,0,7);ctx.fill();});
  const ig=ctx.createRadialGradient(cx,cy+10,10,cx,cy,rx*0.75);const fl=T?Math.round(150+60*Math.sin(T*13)*Math.sin(T*7.3)+30*Math.sin(T*29)):170;ig.addColorStop(0,c[1]+Math.max(80,Math.min(255,fl)).toString(16).padStart(2,'0'));ig.addColorStop(1,'transparent');ctx.fillStyle=ig;ctx.beginPath();ctx.ellipse(cx,cy+10,rx*0.7,ry*0.72,0,0,7);ctx.fill();
}
function text(t,y,c,size){if(!t)return;ctx.save();ctx.font=size+'px Creepster, cursive';ctx.textAlign='center';ctx.textBaseline='middle';
  let s=size;while(ctx.measureText(t).width>W*0.9&&s>18){s-=2;ctx.font=s+'px Creepster, cursive';}
  ctx.lineWidth=8;ctx.strokeStyle='#1a0800';ctx.strokeText(t,W/2,y);const pb=T?Math.sin(T*2.5)*12:0;ctx.shadowColor=c[0];ctx.shadowBlur=25+pb;ctx.fillStyle=c[1];ctx.fillText(t,W/2,y);ctx.shadowBlur=50+pb;ctx.fillText(t,W/2,y);ctx.restore();}
function draw(){try{const c=COLORS[st.glow];pumpkin(c);
  const crewCol=SPECIAL[st.acc]||c;const a={};if(['cape','ghost','hat','crown'].includes(st.acc))a[st.acc]=true;
  ctx.save();if(T){const p=st.pose,ax=st.x,ay=st.y+70*st.s;let sx=1,sy=1,dy=0,rot=0;
    if(['thicc','shoulder','booty','ventpeek'].includes(p)){const j=Math.sin(T*9);sx=1+j*0.035;sy=1-j*0.035;}
    else if(p==='twerk'){const j=Math.abs(Math.sin(T*10));sy=1-j*0.09;sx=1+j*0.05;rot=Math.sin(T*10)*0.05;}
    else if(p==='cake'){const j=Math.abs(Math.sin(T*3));sy=1-j*0.07;sx=1+j*0.05;}
    else if(p==='inspect'){dy=Math.sin(T*2)*3;}
    else dy=Math.sin(T*2.2)*4;
    ctx.translate(ax,ay+dy);ctx.rotate(rot);ctx.scale(sx,sy);ctx.translate(-ax,-ay);}
  drawCrew(ctx,st.x,st.y,st.s,st.pose,crewCol,a);ctx.restore();
  drawFx(c);
  if(st.pose==='peeking'){ctx.save();ctx.fillStyle='#4a1a00';ctx.shadowColor=c[0];ctx.shadowBlur=20;ctx.fillRect(st.x-110*st.s,st.y-15*st.s,220*st.s,14*st.s);ctx.restore();}
  text(st.top.toUpperCase(),H*0.1,c,64);text(st.bottom.toUpperCase(),H*0.93,c,52);
  ctx.save();ctx.font='bold 22px Rubik, sans-serif';ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.75)';ctx.shadowColor=c[0];ctx.shadowBlur=8;ctx.fillText('$HPEEN',W-16,H-16);ctx.restore();}catch(e){}}
const embers=[],bursts=[];const RM=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}})();
function drawFx(c){if(!T)return;
  if(embers.length<25&&Math.random()<0.3)embers.push({x:W*0.2+Math.random()*W*0.6,y:H*0.85,vx:(Math.random()-.5)*0.6,vy:-(0.6+Math.random()*1.2),l:1});
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=embers.length-1;i>=0;i--){const e=embers[i];e.x+=e.vx+Math.sin(T*3+i)*0.3;e.y+=e.vy;e.l-=0.008;if(e.l<=0||e.y<0){embers.splice(i,1);continue;}
    ctx.globalAlpha=e.l;ctx.fillStyle=i%3?c[1]:'#ffdd88';ctx.beginPath();ctx.arc(e.x,e.y,1.5+e.l*2,0,7);ctx.fill();}
  for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.x+=b.vx;b.y+=b.vy;b.vy+=0.15;b.l-=0.03;if(b.l<=0){bursts.splice(i,1);continue;}
    ctx.globalAlpha=b.l;ctx.fillStyle=b.c;ctx.font='18px sans-serif';ctx.fillText(b.ch,b.x,b.y);}
  ctx.restore();}
function burst(){if(RM)return;bursts.length=0;for(let i=0;i<14;i++){const a=Math.random()*6.28,v=2+Math.random()*4;bursts.push({x:st.x,y:st.y-20,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,l:1,c:'#fff',ch:['✨','💥','🎃','🍑'][i%4]});}}
let FR=0,raf=0,onScreen=false,last=0,recording=false;const t0=performance.now();
function frame(now){raf=0;if(!(onScreen||recording)||document.hidden)return;
  if(now-last>=24){last=now;FR++;T=(now-t0)/1000;draw();}raf=requestAnimationFrame(frame);}
function startLoop(){if(RM||raf)return;raf=requestAnimationFrame(frame);}
function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;}
try{if('IntersectionObserver' in window){new IntersectionObserver(es=>{onScreen=es.some(e=>e.isIntersecting);onScreen?startLoop():(recording||stopLoop());}).observe(cv);}}catch(e){}
document.addEventListener('visibilitychange',()=>{document.hidden?stopLoop():(onScreen&&startLoop());});
window.HP.draw=draw;window.HP.loopRunning=()=>!!raf;window.HP.frames=()=>FR;
function bindChips(attr,key){document.querySelectorAll('['+attr+']').forEach(b=>b.onclick=()=>{if(b.disabled)return;st[key]=b.getAttribute(attr);document.querySelectorAll('['+attr+']').forEach(x=>x.classList.toggle('on',x===b));draw();});}
bindChips('data-pose','pose');document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',burst));
const JIGGLE=['thicc','shoulder','twerk','ventpeek','booty','backitup','cake','inspect'];
document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',()=>{cv.classList.remove('jiggle');void cv.offsetWidth;if(JIGGLE.includes(st.pose))cv.classList.add('jiggle');}));bindChips('data-glow','glow');bindChips('data-acc','acc');
$('topText').oninput=e=>{st.top=e.target.value;draw();};$('botText').oninput=e=>{st.bottom=e.target.value;draw();};
$('sizeR').oninput=e=>{st.s=+e.target.value;draw();};
let drag=null;const pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
cv.addEventListener('pointerdown',e=>{const p=pt(e);if(Math.abs(p.x-st.x)<90*st.s&&Math.abs(p.y-st.y)<100*st.s){drag={dx:p.x-st.x,dy:p.y-st.y};try{cv.setPointerCapture(e.pointerId)}catch(_){}}});
cv.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e);st.x=Math.max(0,Math.min(W,p.x-drag.dx));st.y=Math.max(0,Math.min(H,p.y-drag.dy));draw();});
['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>drag=null));
$('dlBtn').onclick=()=>{try{const a=document.createElement('a');a.download='hallowpeen-sus-pumpkin.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();}catch(e){alert('Download not supported in this browser, try a screenshot!');}};
(function(){const rb=$('recBtn');if(!rb)return;
  const ok=!!(cv.captureStream&&window.MediaRecorder);const mime=ok?['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>{try{return MediaRecorder.isTypeSupported(m)}catch(e){return false}}):null;
  if(!ok||!mime||RM){rb.hidden=true;return;}
  rb.onclick=()=>{if(recording)return;try{const stream=cv.captureStream(30);const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000});const chunks=[];
    rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
    rec.onstop=()=>{recording=false;rb.disabled=false;rb.textContent='🎥 Record 3s WebM';try{const url=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));const a=document.createElement('a');a.href=url;a.download='hallowpeen-sus-pumpkin.webm';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}catch(e){}};
    recording=true;startLoop();rb.disabled=true;rb.textContent='🔴 Recording the cake…';rec.start();setTimeout(()=>{try{rec.stop()}catch(e){recording=false}},3000);}
   catch(e){recording=false;rb.textContent='Recorder got ejected 😵 try PNG';}};})();
$('xBtn').href='https://twitter.com/intent/tweet?text='+encodeURIComponent('Carved my own sus pumpkin 🎃 $HPEEN')+'&url='+encodeURIComponent('https://hallowpeen.com/');
draw();if(document.fonts)document.fonts.ready.then(draw);
})();
