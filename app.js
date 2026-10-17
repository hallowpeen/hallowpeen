/* HallowPeen carver: canvas meme generator. Exposes window.HP for features.js */
(function(){
const COLORS={orange:['#ff7b00','#ffb347'],green:['#39ff14','#b6ff9e'],purple:['#b026ff','#e0a3ff']};
let T=0; // animation clock (seconds); 0 = static pose
// per-frame acting state (follow-through lag, blink, visor offset, bump, impact flash)
const AN={lagx:0,lagy:0,blink:false,mood:null,vx:0,bump:null,flash:0,freeze:false};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const ease=u=>{u=clamp(u,0,1);return u<0.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};const back=u=>{u=clamp(u,0,1);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
const spring=(t,k,w)=>t<0?0:Math.exp(-k*t)*Math.cos(w*t);const hash=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x);};
const SPECIAL={golden:['#ffcc00','#fff1a8'],diamond:['#5ee7ff','#e6fbff']};
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(amt>0?v+(255-v)*amt:v*(1+amt))));return 'rgb('+f(r)+','+f(g)+','+f(b)+')';}
// cartoon skin: radial shading (key light top-left), thick dark outline, candle rim glow
function skin(c,col){const g=c.createRadialGradient(-22,-55,6,0,-5,115);g.addColorStop(0,shade(col[1],0.55));g.addColorStop(0.35,col[1]);g.addColorStop(0.8,col[0]);g.addColorStop(1,shade(col[0],-0.45));
  c.fillStyle=g;c.strokeStyle=shade(col[0],-0.78);c.lineWidth=7;c.lineJoin='round';c.shadowColor=col[0];c.shadowBlur=22;}
function dropShadow(c,y,w){c.save();c.shadowBlur=0;const g=c.createRadialGradient(0,y,2,0,y,w);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.ellipse(0,y,w,w*0.22,0,0,7);c.fill();c.restore();}
function gloss(c,x,y,rx,ry){c.save();c.shadowBlur=0;c.globalAlpha=.38;c.fillStyle='#fff';c.beginPath();c.ellipse(x,y,rx,ry,-0.5,0,7);c.fill();c.restore();}
// glossy visor with reflections; mood: 'normal' | 'sus' | 'shy'
function visor(c,x,y,rx,ry,rot,mood){if(T){x+=AN.lagx*0.5+AN.vx;y+=AN.lagy*0.5;if(AN.mood)mood=AN.mood;}c.save();c.translate(x,y);c.rotate(rot||0);c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=6;
  const g=c.createLinearGradient(0,-ry,0,ry);g.addColorStop(0,'#c8f4ff');g.addColorStop(0.35,'#6fc6e0');g.addColorStop(0.7,'#2d6f8c');g.addColorStop(1,'#123447');
  c.fillStyle=g;c.strokeStyle='#0b1a22';c.lineWidth=6;c.beginPath();c.ellipse(0,0,rx,ry,0,0,7);c.fill();c.stroke();c.shadowBlur=0;
  c.save();c.beginPath();c.ellipse(0,0,rx-3,ry-3,0,0,7);c.clip();
  c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.ellipse(rx*0.25,-ry*0.35,rx*0.45,ry*0.28,-0.1,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(-rx*0.45,ry*0.35,rx*0.2,ry*0.15,0,0,7);c.fill();
  if(mood==='sus'){c.fillStyle='#3a1500';c.fillRect(-rx,-ry,rx*2,ry*0.95);c.strokeStyle='#0b1a22';c.lineWidth=5;c.beginPath();c.moveTo(-rx,-ry*0.05);c.lineTo(rx,ry*0.12);c.stroke();}
  if(mood==='wink'||(T&&AN.blink)){c.fillStyle='#2a1000';c.fillRect(-rx,-ry,rx*2,ry*(mood==='wink'?1.05:1.6));c.strokeStyle='#0b1a22';c.lineWidth=5;c.beginPath();c.arc(0,-ry*0.1,rx*0.7,0.2,Math.PI-0.2);c.stroke();}
  if(mood==='shy'||mood==='wink'){c.fillStyle='rgba(255,90,140,.55)';c.beginPath();c.ellipse(-rx*0.5,ry*0.55,rx*0.25,ry*0.18,0,0,7);c.fill();}
  c.restore();c.fillStyle='#fff';c.beginPath();c.arc(rx*0.55,-ry*0.4,Math.max(2,ry*0.16),0,7);c.fill();c.restore();}


// Side-profile crewmate with a big cartoon rear (like the logo). Facing right. Silhouette only.
function thiccBody(c,col,o){o=o||{};
  dropShadow(c,74,70);skin(c,col);
  // legs
  rr(c,-30,40,26,32,10);c.fill();c.stroke();rr(c,8,40,26,32,10);c.fill();c.stroke();
  // torso
  c.beginPath();c.moveTo(-42,40);c.lineTo(-42,-20);c.bezierCurveTo(-42,-85,45,-85,45,-20);c.lineTo(45,45);c.quadraticCurveTo(10,55,-20,45);c.closePath();c.fill();c.stroke();
  // backpack
  rr(c,-60+AN.lagx*(T?1:0),-40+AN.lagy*(T?1:0),20,40,10);c.fill();c.stroke();
  // rear: two round cartoon cheeks sticking out the back
  c.beginPath();c.arc(-52,28,30,0,7);c.fill();c.stroke();
  c.beginPath();c.arc(-30,40,30,0,7);c.fill();c.stroke();

  // cheek crease
  c.shadowBlur=0;c.lineWidth=4;c.beginPath();c.arc(-42,36,14,Math.PI*1.1,Math.PI*1.9);c.stroke();
  gloss(c,-58,16,9,5);gloss(c,-8,-50,14,7);
  // visor
  if(o.lookBack)visor(c,-22,-36,24,14,0.2,'sus');else visor(c,20,-30,28,16,0,'shy');
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
  if(pose==='backitup'){const bump=T&&AN.bump!=null?AN.bump:0;c.save();c.scale(0.8,0.8);c.translate(-62-bump,0);thiccBody(c,col);c.restore();c.save();c.scale(0.8,0.8);c.translate(62+bump,0);c.scale(-1,1);thiccBody(c,['#ff2a2a','#ff8a8a']);c.restore();
    c.save();c.globalAlpha=bump<4?1:0.15;if(T&&AN.flash){c.lineWidth=7;c.scale(1.5,1.5);}c.strokeStyle='#fff';c.lineWidth=4;c.lineCap='round';c.shadowColor='#fff';c.shadowBlur=8;[[-1,-1],[0,-1.3],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=>{c.beginPath();c.moveTo(dx*14,25+dy*14);c.lineTo(dx*32,25+dy*32);c.stroke();});
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
  if(!acc.ghost&&pose!=='peeking')dropShadow(c,64,62);skin(c,col);
  if(pose==='peeking'){c.beginPath();c.rect(-90,-15,180,200);c.clip();}
  if(acc.ghost){c.fillStyle='rgba(240,240,255,.92)';c.strokeStyle='#cfd8ff';c.beginPath();c.moveTo(-55,65);c.lineTo(-55,-20);c.bezierCurveTo(-55,-100,55,-100,55,-20);c.lineTo(55,65);
    for(let i=0;i<5;i++){c.lineTo(55-22*i-11,52);c.lineTo(55-22*(i+1),65);}c.closePath();c.fill();c.stroke();
    c.fillStyle='#111';c.beginPath();c.ellipse(-16,-25,8,12,0,0,7);c.ellipse(16,-25,8,12,0,0,7);c.fill();c.restore();return;}
  rr(c,-68+(T?AN.lagx:0),-20+(T?AN.lagy:0),26,60,10);c.fill();c.stroke();
  c.beginPath();c.moveTo(-45,60);c.lineTo(-45,-20);c.bezierCurveTo(-45,-85,45,-85,45,-20);c.lineTo(45,60);c.lineTo(18,60);c.lineTo(18,35);c.lineTo(-12,35);c.lineTo(-12,60);c.closePath();c.fill();c.stroke();
  if(pose==='waving'){c.save();c.translate(48,-8);c.rotate(T?-0.3+Math.sin(T*9)*0.7:0);rr(c,-10,-52,20,55,10);c.fill();c.stroke();c.restore();}
  gloss(c,-20,-52,13,7);
  if(pose==='sus')visor(c,16,-28,30,15,-0.12,'sus');else visor(c,14,-28,31,18,0,'normal');
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
const st={pose:'standing',glow:'orange',top:'AYO SUSSSSS!',bottom:'',x:W*0.5,y:H*0.72,s:1.2,acc:'none'};
const $=id=>document.getElementById(id);
function pumpkin(c){
  const cx=W/2,cy=H*0.46,rx=W*0.36,ry=H*0.28;
  // sky
  const sky=ctx.createLinearGradient(0,0,0,H*0.85);sky.addColorStop(0,'#1d1238');sky.addColorStop(0.55,'#120a22');sky.addColorStop(1,'#0a0508');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  backdrop(c);
  // ground plane
  const gy=H*0.84;const gr=ctx.createLinearGradient(0,gy-10,0,H);gr.addColorStop(0,'#2a1406');gr.addColorStop(0.15,'#1a0c04');gr.addColorStop(1,'#070302');ctx.fillStyle=gr;
  ctx.beginPath();ctx.moveTo(0,gy+8);ctx.quadraticCurveTo(W*0.5,gy-14,W,gy+8);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,150,60,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,gy+8);ctx.quadraticCurveTo(W*0.5,gy-14,W,gy+8);ctx.stroke();
  // pumpkin glow halo + cast shadow on ground
  const fl=T?0.8+0.2*Math.sin(T*13)*Math.sin(T*7.3)+0.08*Math.sin(T*29):0.9;
  const halo=ctx.createRadialGradient(cx,cy,ry*0.5,cx,cy,rx*1.5);halo.addColorStop(0,'rgba(255,120,0,'+(0.28*fl)+')');halo.addColorStop(1,'rgba(255,120,0,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
  {const sh=ctx.createRadialGradient(cx,cy+ry*0.98,4,cx,cy+ry*0.98,rx*1.05);sh.addColorStop(0,'rgba(0,0,0,.6)');sh.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sh;ctx.beginPath();ctx.ellipse(cx,cy+ry*0.98,rx*1.05,ry*0.16,0,0,7);ctx.fill();}
  // stem
  {const sg=ctx.createLinearGradient(cx-20,0,cx+28,0);sg.addColorStop(0,'#2a4210');sg.addColorStop(.5,'#5f8a2a');sg.addColorStop(1,'#1f3008');ctx.fillStyle=sg;ctx.strokeStyle='#142005';ctx.lineWidth=4;}
  ctx.beginPath();ctx.moveTo(cx-18,cy-ry+12);ctx.quadraticCurveTo(cx-10,cy-ry-50,cx+22,cy-ry-58);ctx.lineTo(cx+28,cy-ry-44);ctx.quadraticCurveTo(cx+8,cy-ry-30,cx+18,cy-ry+12);ctx.fill();ctx.stroke();
  // lobes
  [[-0.62,0.55],[0.62,0.55],[-0.3,0.78],[0.3,0.78],[0,0.62]].forEach(([ox,w])=>{const g=ctx.createRadialGradient(cx+ox*rx-20,cy-40,10,cx+ox*rx,cy,rx*w*1.1);
    g.addColorStop(0,'#e8842a');g.addColorStop(0.45,'#b85410');g.addColorStop(0.8,'#7a2c00');g.addColorStop(1,'#331000');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx+ox*rx,cy,rx*w,ry,0,0,7);ctx.fill();
    ctx.save();ctx.strokeStyle='rgba(30,8,0,.7)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(cx+ox*rx,cy,rx*w,ry,0,0,7);ctx.stroke();ctx.restore();});
  ctx.save();ctx.strokeStyle='rgba(255,210,140,.12)';ctx.lineWidth=2;for(let i=-4;i<=4;i++){ctx.beginPath();ctx.ellipse(cx+i*rx*0.17,cy,rx*0.06,ry*0.96,0,-1.3,1.3);ctx.stroke();}
  ctx.fillStyle='rgba(90,30,0,.25)';for(let i=0;i<60;i++){const an=i*2.399,r=Math.sqrt(i/60);ctx.beginPath();ctx.arc(cx+Math.cos(an)*r*rx*0.95,cy+Math.sin(an)*r*ry*0.92,1.4,0,7);ctx.fill();}
  const rl=ctx.createLinearGradient(0,cy-ry,0,cy-ry*0.4);rl.addColorStop(0,'rgba(200,180,255,.28)');rl.addColorStop(1,'rgba(200,180,255,0)');ctx.fillStyle=rl;ctx.beginPath();ctx.ellipse(cx,cy,rx*0.98,ry*0.99,0,Math.PI*1.1,Math.PI*1.9);ctx.fill();ctx.restore();
  face(c,cx,cy,rx,ry,fl);
}
function text(t,y,c,size){if(!t)return;ctx.save();ctx.font=size+'px Creepster, cursive';ctx.textAlign='center';ctx.textBaseline='middle';
  let s=size;while(ctx.measureText(t).width>W*0.9&&s>18){s-=2;ctx.font=s+'px Creepster, cursive';}
  ctx.lineWidth=8;ctx.strokeStyle='#1a0800';ctx.strokeText(t,W/2,y);const pb=T?Math.sin(T*2.5)*12:0;ctx.shadowColor=c[0];ctx.shadowBlur=25+pb;ctx.fillStyle=c[1];ctx.fillText(t,W/2,y);ctx.shadowBlur=50+pb;ctx.fillText(t,W/2,y);ctx.restore();}

const SUSSY=['sus','shoulder','caught','inspect','ventpeek'];let cheerAt=-1e9,prevX=0,prevY=0,prevDy=0;
function act(p,t){let sx=1,sy=1,dx=0,dy=0,rot=0;AN.blink=false;AN.mood=null;AN.vx=0;AN.bump=null;AN.flash=0;
  const breath=Math.sin(t*2.4);if((t%3.7)<0.12||((t%3.7)>0.22&&(t%3.7)<0.3))AN.blink=(t%3.7)<0.12||(Math.floor(t/3.7)%3===0);
  const hop=(u,h)=>{ // anticipation squash -> arc jump -> land squash -> spring settle
    if(u<0.15){const k=ease(u/0.15);sy=1-0.16*k;sx=1+0.12*k;}
    else if(u<0.5){const k=(u-0.15)/0.35;dy=-h*Math.sin(k*Math.PI);sy=1.14-0.14*k;sx=0.9+0.1*k;}
    else{const s=spring(u-0.5,6,18);sy=1-0.14*s;sx=1+0.1*s;}};
  if(p==='thicc'||p==='booty'||p==='ventpeek'){const u=t%2;
    if(u<0.22){const k=ease(u/0.22);sy=1-0.12*k;sx=1+0.08*k;dy=8*k;rot=-0.06*k;}
    else{const s=spring(u-0.22,2.6,17);sx=1+0.14*s;sy=1-0.14*s;dy=-14*Math.max(0,s);rot=0.08*s;}
    if(p==='ventpeek'){dx=Math.sin(t*5)*10;rot+=Math.sin(t*9)*0.08;}
    if(p==='booty'&&(t%3)>1.5)rot+=-0.12*ease(((t%3)-1.5)/0.3);}               // lean back to check phone
  else if(p==='shoulder'){const u=t%3;
    if(u<1.2){rot=0.1*back(u/1.2);dx=-12*back(u/1.2);}                         // slow-in turn
    else if(u<2.5){rot=0.1;dx=-12;sy=1+0.02*breath;}                            // hold the look
    else{const k=ease((u-2.5)/0.5);rot=0.1*(1-k);dx=-12*(1-k);AN.mood='wink';}} // wink + settle back
  else if(p==='twerk'){const u=t%0.8;
    if(u<0.28){const k=ease(u/0.28);sy=1-0.2*k;sx=1+0.12*k;rot=-0.16*k;dy=10*k;}
    else if(u<0.36){const k=(u-0.28)/0.08;sy=0.8+0.36*k;sx=1.12-0.22*k;rot=-0.16+0.4*k;dy=10-24*k;}
    else{const s=spring(u-0.36,5,16);sy=1+0.16*s;sx=1-0.1*s;rot=0.24*s;dy=-14*s;}}
  else if(p==='cake'){const u=t%2.6;
    if(u<0.9){const k=ease(u/0.9);sy=1-0.2*k;sx=1+0.16*k;dy=10*k;}
    else if(u<1.4){sy=0.8;sx=1.16;dy=10;}
    else{const s=spring(u-1.4,3.5,14);sy=1+0.2*s;sx=1-0.12*s;dy=-26*Math.max(0,s);}}
  else if(p==='inspect'){const u=t%2.4;dx=Math.sin(t*38)*2.5;
    if(u>1.6&&u<2.0){const k=Math.sin((u-1.6)/0.4*Math.PI);dy=-18*k;sy=1+0.1*k;}}     // nervous jump
  else if(p==='backitup'){const u=t%1.6;
    if(u<0.5)AN.bump=40*ease(u/0.5);
    else if(u<0.6){const k=(u-0.5)/0.1;AN.bump=40*(1-k*k);}
    else if(u<0.68){AN.bump=0;AN.flash=1;sy=0.88;sx=1.1;}
    else{AN.bump=14*Math.abs(spring(u-0.68,5,14));}}
  else if(p==='caught'){const u=t%6;AN.freeze=u<2;
    if(u>=2&&u<3.4)AN.vx=-14*back((u-2)/1.4);else if(u>=3.4&&u<5.2)AN.vx=-14;else if(u>=5.2)AN.vx=-14*(1-ease((u-5.2)/0.8));
    if(u>=3.4&&u<3.6){const k=Math.sin((u-3.4)/0.2*Math.PI);dy=-12*k;sy=1+0.1*k;}}
  else if(p==='sus'){const u=t%3.2;dx=-30*Math.sin(u/3.2*Math.PI*2);dy=-Math.abs(Math.sin(u/3.2*Math.PI*4))*6;rot=0.05*Math.cos(u/3.2*Math.PI*2);} // sneaky tiptoe arc
  else if(p==='peeking'){const u=t%2.5;if(u<0.6)dy=40*(1-back(u/0.6));else if(u<1.8)dy=0;else dy=40*ease((u-1.8)/0.7);}
  else if(p==='waving'){sy=1+0.03*breath;const u=t%1.4;if(u<0.2){const k=u/0.2;sy*=1-0.06*k;}}
  else{sy=1+0.03*breath;sx=1-0.02*breath;hop(t%2.6,30);}
  const vy=dy-prevDy;prevDy=dy;AN.lagy=clamp(AN.lagy*0.7-vy*1.2,-9,9);AN.lagx=clamp(AN.lagx*0.7+rot*-26,-8,8);
  return{sx,sy,dx,dy,rot};}
function pop(txt,x,y,t0,t,dur,size){const u=(t-t0)/dur;if(u<0||u>1)return;const k=u<0.2?ease(u/0.2)*1.25:1+0.25*spring(u-0.2,8,20)*0;ctx.save();ctx.globalAlpha=u>0.8?(1-u)/0.2:1;ctx.translate(x,y-12*ease(u));ctx.scale(k,k);
  ctx.font='bold '+(size||30)+'px Rubik, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=5;ctx.strokeStyle='#1a0800';ctx.strokeText(txt,0,0);ctx.fillStyle='#fff';ctx.fillText(txt,0,0);ctx.restore();}
function extras(p,t){const s=st.s,X=st.x,Y=st.y;
  if(p==='inspect'){const u=(t%1.4)/1.4;ctx.save();ctx.globalAlpha=1-u;ctx.fillStyle='#9fe8ff';ctx.strokeStyle='#123447';ctx.lineWidth=2;const sx=X+38*s,sy=Y-70*s+u*40*s;
      ctx.beginPath();ctx.moveTo(sx,sy-9);ctx.quadraticCurveTo(sx+7,sy+2,sx,sy+6);ctx.quadraticCurveTo(sx-7,sy+2,sx,sy-9);ctx.fill();ctx.stroke();ctx.restore();
    pop('?',X-50*s,Y-95*s,Math.floor(t/4)*4+1,t,1.2,34);}
  else if(p==='booty')pop('😏',X+70*s,Y-90*s,Math.floor(t/3)*3+1.3,t,1.4,34);
  else if(p==='cake')pop('😋',X+55*s,Y-70*s,Math.floor(t/2.6)*2.6+1.5,t,1.0,34);
  else if(p==='caught'){const b=Math.floor(t/6)*6;pop('!',X-40*s,Y-100*s,b+3.4,t,1.4,44);pop('!',X+40*s,Y-100*s,b+3.5,t,1.4,44);}
  else if(p==='shoulder'&&(t%3)>2.55){ctx.save();ctx.fillStyle='rgba(255,90,140,.55)';ctx.beginPath();ctx.ellipse(X-10*s,Y-22*s,10*s,5*s,0,0,7);ctx.fill();ctx.restore();}
  else if(!['thicc','twerk','ventpeek','backitup'].includes(p)){const beat=Math.floor(t/6.5);if(hash(beat+9)>0.5)pop(hash(beat+3)>0.5?'!':'?',X+30*s,Y-110*s,beat*6.5+2,t,1.1,36);}}
function stage(c,crewCol,a){const p=st.pose;
  if(T){const m=act(p,T),ax=st.x,ay=st.y+70*st.s;
    // motion smear when dragged fast
    const vx=st.x-prevX,vy=st.y-prevY;if(Math.hypot(vx,vy)>7){ctx.save();ctx.globalAlpha=0.18;drawCrew(ctx,st.x-vx*1.4,st.y-vy*1.4,st.s*1.02,p,crewCol,a);ctx.globalAlpha=0.32;drawCrew(ctx,st.x-vx*0.7,st.y-vy*0.7,st.s,p,crewCol,a);ctx.restore();}
    prevX=st.x;prevY=st.y;
    ctx.save();ctx.translate(ax+m.dx,ay+m.dy);ctx.rotate(m.rot);ctx.scale(m.sx,m.sy);ctx.translate(-ax,-ay);drawCrew(ctx,st.x,st.y,st.s,p,crewCol,a);ctx.restore();
    extras(p,T);
    if(AN.flash){ctx.save();ctx.globalAlpha=0.22;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.restore();}
  }else drawCrew(ctx,st.x,st.y,st.s,p,crewCol,a);
  drawFx(c);}
function backdrop(c){const px=(st.x-W/2)*-0.04;
  ctx.save();ctx.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<26;i++){const x=hash(i)*W,y=hash(i+50)*H*0.45,tw=T?0.5+0.5*Math.sin(T*3+i):0.7;ctx.globalAlpha=0.3+0.5*tw;ctx.fillRect(x+px*0.5,y,2,2);}ctx.restore();
  const mx=W*0.83+px,my=H*0.14,mr=44;ctx.save();ctx.shadowColor='#fff3c4';ctx.shadowBlur=40;const mg=ctx.createRadialGradient(mx-12,my-12,4,mx,my,mr);mg.addColorStop(0,'#fffbea');mg.addColorStop(1,'#e6d39a');ctx.fillStyle=mg;ctx.beginPath();ctx.arc(mx,my,mr,0,7);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(170,150,100,.45)';[[-14,-8,9],[12,10,7],[8,-16,5],[-6,16,4]].forEach(([dx,dy,r])=>{ctx.beginPath();ctx.arc(mx+dx,my+dy,r,0,7);ctx.fill();});ctx.restore();
  ctx.fillStyle='#050208';for(let i=0;i<4;i++){const ph=T?(T*0.07+i*0.27)%1:0.2+i*0.2,bx=W*(1.15-ph*1.4)+px*1.5,by=H*(0.08+0.07*i)+Math.sin(ph*Math.PI*3+i)*22,f=T?Math.sin(T*16+i*2):0.5,sc=i===1?1.5:1;
    ctx.save();ctx.translate(bx,by);ctx.scale(sc,sc);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-12,-12-f*10,-26,-4+f*6);ctx.lineTo(-20,0);ctx.lineTo(-14,-2);ctx.lineTo(-8,4);ctx.lineTo(0,6);ctx.lineTo(8,4);ctx.lineTo(14,-2);ctx.lineTo(20,0);ctx.lineTo(26,-4+f*6);ctx.quadraticCurveTo(12,-12-f*10,0,0);ctx.fill();
    ctx.beginPath();ctx.arc(0,1,4,0,7);ctx.fill();ctx.restore();}}
function fog(){ctx.save();for(let i=0;i<4;i++){const fx=((T*14*(1+i*0.4)+i*170)%(W*1.6))-W*0.3,fy=H*(0.86+0.03*(i%2));const g=ctx.createRadialGradient(fx,fy,6,fx,fy,W*0.32);g.addColorStop(0,'rgba(210,195,235,.22)');g.addColorStop(1,'rgba(210,195,235,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(fx,fy,W*0.32,H*0.06,0,0,7);ctx.fill();}ctx.restore();}
function leaves(){const px=(st.x-W/2)*0.08;[[40,H-30,0.6,'#7a2e00'],[W-50,H-60,-0.8,'#a33d00'],[W-110,H-20,0.2,'#5c2200']].forEach(([x,y,r,col],i)=>{
  ctx.save();ctx.translate(x+px,y);ctx.rotate(r+(T?Math.sin(T*1.3+i)*0.12:0));ctx.fillStyle=col;ctx.strokeStyle='#2a0c00';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(0,-28);ctx.quadraticCurveTo(26,-10,0,30);ctx.quadraticCurveTo(-26,-10,0,-28);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(0,26);ctx.stroke();ctx.restore();});}
// carved hole with depth: dark rim, inner flesh wall, glowing core
function carve(path,c,fl){ctx.save();ctx.translate(0,3);ctx.fillStyle='#240a00';path(1.08);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(0,-3);ctx.fillStyle='#e8913a';path(1.0);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(0,2);const g=ctx.createLinearGradient(0,0,0,H*0.6);g.addColorStop(0,'#fffbe0');g.addColorStop(0.5,'#ffd75a');g.addColorStop(1,c[0]);ctx.fillStyle=g;ctx.shadowColor=c[1];ctx.shadowBlur=40*fl;ctx.globalAlpha=0.75+0.25*fl;path(0.86);ctx.fill();ctx.restore();}
function face(c,cx,cy,rx,ry,fl){fl=fl||0.9;const sq=SUSSY.includes(st.pose);const cheer=(performance.now()-cheerAt)<3500;
  const ex=rx*0.42,ey=cy-ry*0.36,ew=rx*0.2,eh=sq?ry*0.12:ry*0.3;
  [-1,1].forEach(sd=>carve(k=>{ctx.beginPath();const x=cx+sd*ex;ctx.moveTo(x-ew*k,ey+eh*0.45*k);ctx.lineTo(x+ew*k,ey+eh*0.45*k);ctx.lineTo(x+sd*ew*0.25*k,ey-eh*0.75*k);ctx.closePath();},c,fl));
  // nose
  carve(k=>{ctx.beginPath();ctx.moveTo(cx-14*k,cy+4*k);ctx.lineTo(cx+14*k,cy+4*k);ctx.lineTo(cx,cy-16*k);ctx.closePath();},c,fl);
  // jagged grin (wider at milestones)
  const mw=rx*(cheer?0.7:0.55),my=cy+ry*0.3,mh=ry*(cheer?0.32:0.2);
  carve(k=>{ctx.beginPath();ctx.moveTo(cx-mw*k,my-mh*0.3*k);const n=6;for(let i=1;i<=n;i++){const x=cx-mw*k+i*(2*mw*k/n);ctx.lineTo(x-mw*k/n,my-mh*0.3*k+(i%2?-10:0)*k);ctx.lineTo(x,my-mh*0.3*k);}
    ctx.quadraticCurveTo(cx,my+mh*1.4*k,cx-mw*k,my-mh*0.3*k);ctx.closePath();},c,fl);
  // smoke wisps from the stem (candle inside)
  if(T){ctx.save();ctx.strokeStyle='rgba(220,210,230,.22)';ctx.lineWidth=3;ctx.lineCap='round';for(let i=0;i<3;i++){const u=((T*0.4+i/3)%1),y0=cy-ry-40;ctx.globalAlpha=1-u;ctx.beginPath();ctx.moveTo(cx+4,y0-u*70);ctx.quadraticCurveTo(cx+4+Math.sin(T*2+i)*16,y0-u*70-16,cx+4+Math.sin(T*1.5+i)*8,y0-u*70-32);ctx.stroke();}ctx.restore();}}
function vignette(){const v=ctx.createRadialGradient(W/2,H*0.48,W*0.32,W/2,H*0.5,W*0.78);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,140,40,.35)';ctx.lineWidth=6;ctx.strokeRect(3,3,W-6,H-6);}
window.HP.cheer=()=>{cheerAt=performance.now();};
function draw(){try{const c=COLORS[st.glow];pumpkin(c);
  const crewCol=SPECIAL[st.acc]||c;const a={};if(['cape','ghost','hat','crown'].includes(st.acc))a[st.acc]=true;
  stage(c,crewCol,a);
  if(st.pose==='peeking'){ctx.save();ctx.fillStyle='#4a1a00';ctx.shadowColor=c[0];ctx.shadowBlur=20;ctx.fillRect(st.x-110*st.s,st.y-15*st.s,220*st.s,14*st.s);ctx.restore();}
  fog();leaves();vignette();text(st.top.toUpperCase(),H*0.08,c,60);text(st.bottom.toUpperCase(),H*0.93,c,52);
  ctx.save();ctx.font='bold 22px Rubik, sans-serif';ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.75)';ctx.shadowColor=c[0];ctx.shadowBlur=8;ctx.fillText('$HPEEN',W-16,H-16);ctx.restore();}catch(e){}}
window.HP.blank=function(glow){const g=st.glow;let url='';try{if(COLORS[glow])st.glow=glow;const c=COLORS[st.glow];pumpkin(c);fog();leaves();vignette();url=cv.toDataURL('image/png');}catch(e){}st.glow=g;draw();return url;};
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
bindChips('data-pose','pose');document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',()=>{burst();const S=window.HPS;if(!S)return;const p=st.pose;
  setTimeout(()=>S.play(p==='backitup'?'bonk':p==='inspect'?'beep':['thicc','shoulder','twerk','ventpeek','booty','cake'].includes(p)?'jiggle':'sparkle'),160);}));
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
