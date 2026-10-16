/* HallowPeen carver: canvas meme generator. Exposes window.HP for features.js */
(function(){
const COLORS={orange:['#ff7b00','#ffb347'],green:['#39ff14','#b6ff9e'],purple:['#b026ff','#e0a3ff']};
const SPECIAL={golden:['#ffcc00','#fff1a8'],diamond:['#5ee7ff','#e6fbff']};
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
// Draw a crewmate centered at (x,y). acc: {cape,ghost,hat,crown}
function drawCrew(c,x,y,s,pose,col,acc){
  acc=acc||{};c.save();c.translate(x,y);c.scale(s,s);
  if(pose==='sus')c.scale(-1,1);
  if(acc.cape){c.save();c.fillStyle='#5a0010';c.shadowColor='#ff0030';c.shadowBlur=14;c.beginPath();c.moveTo(-40,-45);c.lineTo(40,-45);c.lineTo(70,70);c.quadraticCurveTo(0,55,-80,70);c.closePath();c.fill();c.restore();}
  c.shadowColor=col[0];c.shadowBlur=30;c.fillStyle=col[1];c.strokeStyle=col[0];c.lineWidth=6;
  if(pose==='peeking'){c.beginPath();c.rect(-90,-15,180,200);c.clip();}
  if(acc.ghost){c.fillStyle='rgba(240,240,255,.92)';c.strokeStyle='#cfd8ff';c.beginPath();c.moveTo(-55,65);c.lineTo(-55,-20);c.bezierCurveTo(-55,-100,55,-100,55,-20);c.lineTo(55,65);
    for(let i=0;i<5;i++){c.lineTo(55-22*i-11,52);c.lineTo(55-22*(i+1),65);}c.closePath();c.fill();c.stroke();
    c.fillStyle='#111';c.beginPath();c.ellipse(-16,-25,8,12,0,0,7);c.ellipse(16,-25,8,12,0,0,7);c.fill();c.restore();return;}
  rr(c,-68,-20,26,60,10);c.fill();c.stroke();
  c.beginPath();c.moveTo(-45,60);c.lineTo(-45,-20);c.bezierCurveTo(-45,-85,45,-85,45,-20);c.lineTo(45,60);c.lineTo(18,60);c.lineTo(18,35);c.lineTo(-12,35);c.lineTo(-12,60);c.closePath();c.fill();c.stroke();
  if(pose==='waving'){rr(c,38,-60,20,55,10);c.fill();c.stroke();}
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
  const ig=ctx.createRadialGradient(cx,cy+10,10,cx,cy,rx*0.75);ig.addColorStop(0,c[1]+'aa');ig.addColorStop(1,'transparent');ctx.fillStyle=ig;ctx.beginPath();ctx.ellipse(cx,cy+10,rx*0.7,ry*0.72,0,0,7);ctx.fill();
}
function text(t,y,c,size){if(!t)return;ctx.save();ctx.font=size+'px Creepster, cursive';ctx.textAlign='center';ctx.textBaseline='middle';
  let s=size;while(ctx.measureText(t).width>W*0.9&&s>18){s-=2;ctx.font=s+'px Creepster, cursive';}
  ctx.lineWidth=8;ctx.strokeStyle='#1a0800';ctx.strokeText(t,W/2,y);ctx.shadowColor=c[0];ctx.shadowBlur=25;ctx.fillStyle=c[1];ctx.fillText(t,W/2,y);ctx.shadowBlur=50;ctx.fillText(t,W/2,y);ctx.restore();}
function draw(){try{const c=COLORS[st.glow];pumpkin(c);
  const crewCol=SPECIAL[st.acc]||c;const a={};if(['cape','ghost','hat','crown'].includes(st.acc))a[st.acc]=true;
  drawCrew(ctx,st.x,st.y,st.s,st.pose,crewCol,a);
  if(st.pose==='peeking'){ctx.save();ctx.fillStyle='#4a1a00';ctx.shadowColor=c[0];ctx.shadowBlur=20;ctx.fillRect(st.x-110*st.s,st.y-15*st.s,220*st.s,14*st.s);ctx.restore();}
  text(st.top.toUpperCase(),H*0.1,c,64);text(st.bottom.toUpperCase(),H*0.93,c,52);
  ctx.save();ctx.font='bold 22px Rubik, sans-serif';ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.75)';ctx.shadowColor=c[0];ctx.shadowBlur=8;ctx.fillText('$HPEEN',W-16,H-16);ctx.restore();}catch(e){}}
window.HP.draw=draw;
function bindChips(attr,key){document.querySelectorAll('['+attr+']').forEach(b=>b.onclick=()=>{if(b.disabled)return;st[key]=b.getAttribute(attr);document.querySelectorAll('['+attr+']').forEach(x=>x.classList.toggle('on',x===b));draw();});}
bindChips('data-pose','pose');bindChips('data-glow','glow');bindChips('data-acc','acc');
$('topText').oninput=e=>{st.top=e.target.value;draw();};$('botText').oninput=e=>{st.bottom=e.target.value;draw();};
$('sizeR').oninput=e=>{st.s=+e.target.value;draw();};
let drag=null;const pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
cv.addEventListener('pointerdown',e=>{const p=pt(e);if(Math.abs(p.x-st.x)<90*st.s&&Math.abs(p.y-st.y)<100*st.s){drag={dx:p.x-st.x,dy:p.y-st.y};try{cv.setPointerCapture(e.pointerId)}catch(_){}}});
cv.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e);st.x=Math.max(0,Math.min(W,p.x-drag.dx));st.y=Math.max(0,Math.min(H,p.y-drag.dy));draw();});
['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>drag=null));
$('dlBtn').onclick=()=>{try{const a=document.createElement('a');a.download='hallowpeen-sus-pumpkin.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();}catch(e){alert('Download not supported in this browser, try a screenshot!');}};
$('xBtn').href='https://twitter.com/intent/tweet?text='+encodeURIComponent('Carved my own sus pumpkin 🎃 $HPEEN')+'&url='+encodeURIComponent('https://hallowpeen.github.io/hallowpeen/');
draw();if(document.fonts)document.fonts.ready.then(draw);
})();
