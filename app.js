(function(){
const cv=document.getElementById('carve');if(!cv)return;
const ctx=cv.getContext('2d');const W=cv.width,H=cv.height;
const COLORS={orange:['#ff7b00','#ffb347'],green:['#39ff14','#b6ff9e'],purple:['#b026ff','#e0a3ff']};
const st={pose:'standing',glow:'orange',top:'AYO SUSSSSS!',bottom:'',x:W*0.5,y:H*0.6,s:1.4};
const $=id=>document.getElementById(id);

function pumpkin(c){
  const cx=W/2,cy=H*0.56,rx=W*0.38,ry=H*0.34;
  ctx.fillStyle='#050505';ctx.fillRect(0,0,W,H);
  const halo=ctx.createRadialGradient(cx,cy,ry*0.4,cx,cy,rx*1.4);
  halo.addColorStop(0,c[0]+'55');halo.addColorStop(1,'transparent');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
  // stem
  ctx.fillStyle='#3b5a1a';ctx.beginPath();ctx.moveTo(cx-18,cy-ry+12);ctx.quadraticCurveTo(cx-10,cy-ry-50,cx+22,cy-ry-58);ctx.lineTo(cx+28,cy-ry-44);ctx.quadraticCurveTo(cx+8,cy-ry-30,cx+18,cy-ry+12);ctx.fill();
  // lobes
  const lobes=[[-0.62,0.55],[0.62,0.55],[-0.3,0.78],[0.3,0.78],[0,0.62]];
  lobes.forEach(([ox,w])=>{const g=ctx.createRadialGradient(cx+ox*rx-20,cy-40,10,cx+ox*rx,cy,rx*w*1.1);
    g.addColorStop(0,'#ff9a2e');g.addColorStop(0.7,'#d65a00');g.addColorStop(1,'#6b2400');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx+ox*rx,cy,rx*w,ry,0,0,Math.PI*2);ctx.fill();});
  // carved inner glow panel
  const ig=ctx.createRadialGradient(cx,cy+10,10,cx,cy,rx*0.75);
  ig.addColorStop(0,c[1]+'aa');ig.addColorStop(1,'transparent');ctx.fillStyle=ig;
  ctx.beginPath();ctx.ellipse(cx,cy+10,rx*0.7,ry*0.72,0,0,Math.PI*2);ctx.fill();
}
function crew(c,pose){
  ctx.save();ctx.translate(st.x,st.y);ctx.scale(st.s,st.s);
  const flip=pose==='sus'?-1:1;ctx.scale(flip,1);
  ctx.shadowColor=c[0];ctx.shadowBlur=30;ctx.fillStyle=c[1];ctx.strokeStyle=c[0];ctx.lineWidth=6;
  const body=()=>{ctx.beginPath();ctx.moveTo(-45,60);ctx.lineTo(-45,-20);ctx.bezierCurveTo(-45,-85,45,-85,45,-20);ctx.lineTo(45,60);
    ctx.lineTo(18,60);ctx.lineTo(18,35);ctx.lineTo(-12,35);ctx.lineTo(-12,60);ctx.closePath();};
  if(pose==='peeking'){ctx.beginPath();ctx.rect(-80,-15,160,200);ctx.clip();}
  // backpack
  ctx.beginPath();ctx.roundRect(-68,-20,26,60,10);ctx.fill();ctx.stroke();
  body();ctx.fill();ctx.stroke();
  if(pose==='waving'){ctx.beginPath();ctx.roundRect(38,-60,20,55,10);ctx.fill();ctx.stroke();}
  // visor
  ctx.shadowBlur=10;ctx.fillStyle='#111';ctx.beginPath();
  if(pose==='sus'){ctx.ellipse(18,-28,28,13,-0.15,0,Math.PI*2);}else ctx.ellipse(14,-28,30,17,0,0,Math.PI*2);
  ctx.fill();ctx.strokeStyle=c[0];ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(pose==='sus'?32:24,-32,8,4,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
  if(pose==='peeking'){ctx.save();ctx.fillStyle='#4a1a00';ctx.shadowColor=c[0];ctx.shadowBlur=20;ctx.fillRect(st.x-110*st.s,st.y-15*st.s,220*st.s,14*st.s);ctx.restore();}
}
function text(t,y,c,size){if(!t)return;ctx.save();ctx.font=size+'px Creepster, cursive';ctx.textAlign='center';ctx.textBaseline='middle';
  let s=size;while(ctx.measureText(t).width>W*0.9&&s>18){s-=2;ctx.font=s+'px Creepster, cursive';}
  ctx.lineWidth=8;ctx.strokeStyle='#1a0800';ctx.strokeText(t,W/2,y);
  ctx.shadowColor=c[0];ctx.shadowBlur=25;ctx.fillStyle=c[1];ctx.fillText(t,W/2,y);ctx.shadowBlur=50;ctx.fillText(t,W/2,y);ctx.restore();}
function draw(){const c=COLORS[st.glow];pumpkin(c);crew(c,st.pose);
  text(st.top.toUpperCase(),H*0.1,c,64);text(st.bottom.toUpperCase(),H*0.93,c,52);
  ctx.save();ctx.font='bold 22px Rubik, sans-serif';ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.75)';ctx.shadowColor=c[0];ctx.shadowBlur=8;ctx.fillText('$HPEEN',W-16,H-16);ctx.restore();}
window.hpDraw=draw;
document.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{st.pose=b.dataset.pose;document.querySelectorAll('[data-pose]').forEach(x=>x.classList.toggle('on',x===b));draw();});
document.querySelectorAll('[data-glow]').forEach(b=>b.onclick=()=>{st.glow=b.dataset.glow;document.querySelectorAll('[data-glow]').forEach(x=>x.classList.toggle('on',x===b));draw();});
$('topText').oninput=e=>{st.top=e.target.value;draw();};$('botText').oninput=e=>{st.bottom=e.target.value;draw();};
$('sizeR').oninput=e=>{st.s=+e.target.value;draw();};
let drag=null;
const pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
cv.addEventListener('pointerdown',e=>{const p=pt(e);if(Math.abs(p.x-st.x)<90*st.s&&Math.abs(p.y-st.y)<100*st.s){drag={dx:p.x-st.x,dy:p.y-st.y};cv.setPointerCapture(e.pointerId);}});
cv.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e);st.x=Math.max(0,Math.min(W,p.x-drag.dx));st.y=Math.max(0,Math.min(H,p.y-drag.dy));draw();});
['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>drag=null));
$('dlBtn').onclick=()=>{const a=document.createElement('a');a.download='hallowpeen-sus-pumpkin.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();};
$('xBtn').href='https://twitter.com/intent/tweet?text='+encodeURIComponent('Carved my own sus pumpkin 🎃 $HPEEN')+'&url='+encodeURIComponent('https://hallowpeen.github.io/hallowpeen/');
draw();if(document.fonts)document.fonts.ready.then(draw);
})();
