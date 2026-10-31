/* HallowPeen LIVE: Spooky Neighborhood. Original art + procedural audio, vanilla JS, one canvas.
   Params: ?demo=1 fake trades | ?obs=1 stream mode | ?host=1 host panel | ?sound=1 | ?hud=0
           ?finale=1 preview Halloween finale | ?ws=ws://localhost:PORT chat-command listener | ?ca=<mint> override | ?speed=N (0.25-8) */
(function(){'use strict';
const W=1280,H=720,FPS=30,MAXCREW=25,POLL_MS=45000;
// ===== Curated crewmate names (spawned first, before random ones). Add approved names here. =====
const NAMES=[];
// ================================================================================================
const qs=new URLSearchParams(location.search);
const DEMO=qs.has('demo'),OBS=qs.get('obs')==='1',HOST=qs.get('host')==='1'||OBS,SHOWHUD=qs.get('hud')!=='0';
const SPEED=Math.min(8,Math.max(0.25,parseFloat(qs.get('speed'))||1));
const FINALE_PREVIEW=qs.get('finale')==='1';
const cv=document.getElementById('sim');if(!cv)return;let g=cv.getContext('2d');const G0=g;
const warn=(e)=>{try{console.warn('[HPEEN live]',e&&e.message||e)}catch(_){}};
const safe=(fn)=>function(){try{return fn.apply(this,arguments)}catch(e){warn(e)}};
const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>1-Math.pow(1-t,3),easeBack=t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
let seed=1337;const srand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
const store={get(k,d){try{const v=(DEMO?sessionStorage:localStorage).getItem('hplive_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
 set(k,v){try{(DEMO?sessionStorage:localStorage).setItem('hplive_'+k,JSON.stringify(v))}catch(e){}}};
const OUT='#170b10',FONT="'Rubik',system-ui,sans-serif",SPOOK="'Creepster','Rubik',cursive";
/* name filter (client-side; blocks profanity/slurs, leetspeak, wallet-looking strings) */
const BAD=['fuck','shit','bitch','cunt','dick','cock','pussy','penis','vagina','whore','slut','nigg','faggot','fag','retard','rape','rapist','porn','sex','cum','tits','boob','anal','nazi','hitler','kike','spic','chink','gook','wetback','tranny','dyke','coon','beaner','paki','kys','killyourself','molest','pedo','incel','jizz','twat','wank','fuk','fck','btch','nlg','n1g'];
function normName(s){return String(s||'').toLowerCase().replace(/[@4]/g,'a').replace(/3/g,'e').replace(/[1!|]/g,'i').replace(/0/g,'o').replace(/[5$]/g,'s').replace(/7/g,'t').replace(/[^a-z]/g,'');}
function cleanName(raw){const s=String(raw||'').replace(/\s+/g,' ').trim();
 if(!/^[A-Za-z0-9 ._'-]{2,16}$/.test(s))return {ok:false,why:'2-16 letters/numbers only'};
 const n=normName(s),n2=n.replace(/(.)\1+/g,'$1');if(BAD.some(b=>n.includes(b)||n2.includes(b.replace(/(.)\1+/g,'$1'))))return {ok:false,why:'that name got ejected 🚫 keep it clean-ish'};
 if(/^[1-9A-HJ-NP-Za-km-z]{12,}$/.test(s.replace(/ /g,''))&&/\d/.test(s))return {ok:false,why:'no wallet-looking names'};
 return {ok:true,name:s};}
const FIRST=['Sussy','Thicc','Venty','Spooky','Cakey','Pumpkin','Sir','Lil','Big','Sneaky','Crusty','Moist','Haunted','Cheeky','Gourd','Candy','Ghostly','Bonky','Wobbly','Saucy','Dummy','Juicy','Clammy','Shady','Grandma','Unc','Lord','Boo','Squishy','Greasy'];
const LAST=['Steve','Brenda','Kevin','Gary','Karen','Chad','Doug','Linda','Trevor','Becky','Todd','Denise','Bartholomew','Gourdon','Pam','Dwayne','Nugget','Biscuit','Tater','Squash','Cheeks','Muffin','Gourdzilla','Beans','Dorito','Waffles','Pickles','Meatball','Noodle','Crumbs'];
const usedNames=new Set();const namePool=NAMES.slice();
function newName(){while(namePool.length){const n=namePool.shift();if(!usedNames.has(n)){usedNames.add(n);return n;}}
 for(let i=0;i<60;i++){const n=pick(FIRST)+' '+pick(LAST);if(!usedNames.has(n)){usedNames.add(n);return n;}}return 'Crewmate #'+RI(100,999);}
const COLORS=[['Red','#e0302f'],['Blue','#2f5be0'],['Green','#2fa84a'],['Pink','#ee6fc0'],['Orange','#ff8a1f'],['Yellow','#f4d23a'],['Black','#454552'],['White','#e8e8ee'],['Purple','#8a3fd1'],['Brown','#7a4a2a'],['Cyan','#3ad6e0'],['Lime','#8ee83a'],['Maroon','#8a2333'],['Rose','#f0a6b8'],['Banana','#f7e69a'],['Gray','#8b93a0'],['Tan','#c9a77a'],['Coral','#ff7a6a'],['Teal','#1f9c94'],['Mint','#9ff0c8'],['Navy','#253a8a'],['Peach','#ffc49a'],['Olive','#7d8a2a'],['Lilac','#c6a6f2'],['Gold','#e8b53a']];
const HATS=['none','witch','pumpkin','horns','sprout','party','top','bow','none','witch','pumpkin','halo'];
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,gg=n>>8&255,b=n&255;
 if(f<0){r*=1+f;gg*=1+f;b*=1+f}else{r+=(255-r)*f;gg+=(255-gg)*f;b+=(255-b)*f}return 'rgb('+(r|0)+','+(gg|0)+','+(b|0)+')';}
/* sound: procedural Web Audio, off by default */
const SND=(function(){let on=qs.get('sound')==='1'||(!OBS&&store.get('sound',false)===true),ac=null,mg=null;const last={};
 function ensure(){if(ac)return ac;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ac=new A();mg=ac.createGain();mg.gain.value=.22;const c=ac.createDynamicsCompressor();mg.connect(c);c.connect(ac.destination);}catch(e){ac=null}return ac;}
 function o(type,f0,f1,d,v,t0){const t=ac.currentTime+(t0||0),x=ac.createOscillator(),gn=ac.createGain();x.type=type;x.frequency.setValueAtTime(f0,t);if(f1)x.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(v||.4,t+.01);gn.gain.exponentialRampToValueAtTime(.0001,t+d);x.connect(gn);gn.connect(mg);x.start(t);x.stop(t+d+.05);return x;}
 function nz(d,v,f0,f1,t0,type){const t=ac.currentTime+(t0||0),n=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
  const s=ac.createBufferSource();s.buffer=b;const f=ac.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+d);const gn=ac.createGain();
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(v,t+.02);gn.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(gn);gn.connect(mg);s.start(t);s.stop(t+d+.05);}
 function vib(x,r,dp,d){const l=ac.createOscillator(),gn=ac.createGain();l.frequency.value=r;gn.gain.value=dp;l.connect(gn);gn.connect(x.frequency);l.start();l.stop(ac.currentTime+d+.05);}
 const FX={spawn(){[784,988,1175,1568].forEach((f,i)=>o('triangle',f,f*1.01,.14,.25,i*.06));},
  task(){o('sine',880,0,.08,.3);o('sine',1320,0,.12,.3,.08);},
  bonk(){o('square',240,70,.16,.35);nz(.08,.4,1800,300,0,'lowpass');o('sine',90,45,.25,.5);},
  ghost(){const x=o('sine',280,0,1.4,.25);const t=ac.currentTime;x.frequency.setValueAtTime(260,t);x.frequency.linearRampToValueAtTime(520,t+.6);x.frequency.linearRampToValueAtTime(300,t+1.4);vib(x,5,14,1.4);},
  siren(){const x=o('sawtooth',500,0,1.2,.2);const t=ac.currentTime;[.3,.6,.9,1.2].forEach((d,i)=>x.frequency.linearRampToValueAtTime(i%2?500:900,t+d));},
  vote(){o('square',660,0,.05,.15);},
  whoosh(){nz(.7,.35,200,2600);},
  down(){o('sawtooth',300,40,.9,.25);nz(.5,.2,800,100,0,'lowpass');},
  up(){o('sawtooth',60,400,.5,.2);o('sine',1200,0,.1,.2,.5);},
  win(){[523,659,784,1047,784,1047].forEach((f,i)=>o('triangle',f,f,.22,.3,i*.13));},
  lose(){[392,370,349,262].forEach((f,i)=>{const x=o('sawtooth',f,f*.97,.35,.18,i*.32);vib(x,6,6,.4);});},
  candy(){for(let i=0;i<6;i++)o('sine',1500+Math.random()*1500,0,.1,.12,i*.07);},
  boom(){nz(1.1,.5,900,60,0,'lowpass');o('sine',120,40,.6,.4);},
  vent(){o('square',120,60,.12,.3);nz(.25,.25,400,1500);o('square',90,140,.1,.25,.25);},
  boing(){const x=o('sine',180,520,.45,.5);vib(x,18,60,.45);}};
 const gap={siren:1500,ghost:2500,spawn:300,task:150,candy:400,boom:250,whoosh:1500};
 function play(n){if(!on||!FX[n])return;const now=performance.now();if(now-(last[n]||0)<(gap[n]||120))return;last[n]=now;if(!ensure())return;if(ac.state==='suspended'){try{ac.resume().catch(()=>{})}catch(e){}}try{FX[n]()}catch(e){}}
 function set(v){on=v;if(!OBS)store.set('sound',v);if(on){ensure();if(ac&&ac.state==='suspended')ac.resume().catch(()=>{});}}
 return {play,set,isOn:()=>on};})();
/* world layout */
const HOUSES=[0,1,2,3].map(i=>({x:70+i*300,wall:['#5a3d5c','#3d4f5c','#4f5c3d','#5c4a3d'][i],roof:['#2a1730','#1d2a33','#2f2215','#331a1a'][i],trim:['#c9a0d6','#9cc4d6','#c4d69c','#d6b89c'][i]}));
const VENTS=[{x:190,y:388},{x:640,y:402},{x:1090,y:388},{x:96,y:690},{x:820,y:600}].map(v=>Object.assign(v,{anim:0}));
const LAMPS=[60,340,640,940,1220].map(x=>({x,y:326}));
const FUSE={x:432,y:470},SPAWN={x:640,y:388};
const STATIONS=[];
function st(type,x,y,label,dur,extra){STATIONS.push(Object.assign({type,x,y,label,dur,done:false,busy:null},extra||{}));}
HOUSES.forEach((h,i)=>{st('trick',h.x+120,278,'Trick-or-treat',4,{h:i});st('carve',h.x+52,286,'Carve pumpkin',6,{h:i,px:h.x+40,py:262});st('light',h.x+186,282,'Fix porch light',5,{h:i,lx:h.x+160,ly:196});
 if(i%2===0)st('candy',h.x+258,310,'Hand out candy',5,{h:i});});
st('rake',490,560,'Rake leaves',5,{pile:{x:500,y:572}});st('rake',575,665,'Rake leaves',5,{pile:{x:590,y:676}});st('rake',735,640,'Rake leaves',5,{pile:{x:748,y:652}});
st('tp',622,560,'Un-TP the tree',6);st('apple',790,530,'Bob for apples',5);
[[100,548],[205,612],[305,540],[160,680],[300,672]].forEach(([x,y])=>st('candle',x+18,y+14,'Light grave candle',4,{cx:x,cy:y}));
st('haunt',1050,680,'Ghost-proof haunted house',7);st('cauldron',1240,690,"Stir witch's cauldron",6);
const HAUNT={x:900,y:470,w:330,h:180,base:652};
function viaOf(p){return (p.y>655&&p.x>880)?{x:872,y:684}:null;}
function laneY(c){return c.lane||(c.lane=R(360,415));}
function route(c,to){const pts=[];const fv=viaOf(c),tv=viaOf(to);const zone=y=>y<345?0:y<445?1:2;
 const far=Math.abs(c.x-to.x)>250||zone(c.y)!==zone(to.y)||(!!fv!==!!tv);
 if(fv)pts.push(fv);
 if(far&&!(fv&&tv)){const ly=laneY(c);pts.push({x:(fv||c).x,y:ly});pts.push({x:(tv||to).x,y:ly});}
 if(tv&&!fv)pts.push(tv);pts.push({x:to.x,y:to.y});return pts;}
/* state */
const S={phase:'intro',pt:0,round:store.get('round',0),crewWins:store.get('cw',0),impWins:store.get('iw',0),movedIn:store.get('moved',0),
 crew:[],bodies:[],parts:[],floats:[],feed:[],tasks:0,goal:100,kills:0,killGoal:4,lights:true,lightFix:null,meet:null,win:null,
 events:[],pending:[],time:0,bats:[],fog:[],lastMeet:0,meetGap:R(80,140),finale:false,finaleDone:store.get('finaleDone',false),finaleNext:false,
 status:DEMO?'DEMO MODE: fake trades every few seconds':'Connecting to the blockchain spirits…',mcap:0,shake:0,flash:0,impBoost:0,dance:0,demoN:0};
let idc=1;
function mkCrew(name,fromEdge){const used=new Set(S.crew.map(c=>c.color));const col=COLORS.find(c=>!used.has(c[1]))||pick(COLORS);
 const c={id:idc++,name:name||newName(),cname:col[0],color:col[1],hat:pick(HATS),x:SPAWN.x+R(-120,120),y:SPAWN.y+R(-25,25),face:Math.random()<.5?1:-1,
  state:'idle',path:[],task:null,tt:0,walk:R(0,6),sq:0,sqv:0,dead:false,ghost:false,imp:false,say:null,sayT:0,sus:0,speed:R(62,78),lane:0,wait:R(0,1.5),
  emote:null,emT:0,seenKill:null,react:0,spawnT:0,cd:0,sab:0,patience:0,target:null,venting:0,hidden:false};
 if(fromEdge){const L=Math.random()<.5;c.x=L?-30:W+30;c.y=R(362,412);c.spawnT=1;c.path=[{x:L?R(80,300):R(980,1200),y:c.y}];c.state='walk';c.face=L?1:-1;}
 return c;}
const alive=()=>S.crew.filter(c=>!c.dead),aliveCrew=()=>S.crew.filter(c=>!c.dead&&!c.imp),imps=()=>S.crew.filter(c=>c.imp);
function feed(t){S.feed.push({t,at:S.time});if(S.feed.length>7)S.feed.shift();}
function say(c,t,d){c.say=t;c.sayT=d||2.6;}
function floatText(x,y,t,col,size){S.floats.push({x,y,t,col:col||'#fff',size:size||22,life:1.3,max:1.3});if(S.floats.length>30)S.floats.shift();}
function burst(x,y,n,cols,sp,kind){for(let i=0;i<n;i++){if(S.parts.length>420)break;const a=R(0,6.283),v=R(sp*.3,sp);S.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-R(0,sp*.5),g:260,life:R(.5,1.1),max:1.1,c:pick(cols),r:R(2,4.5),k:kind||'dot',rot:R(0,6)});}}
/* round flow */
function isHalloween(){const d=new Date();return d.getMonth()===9&&d.getDate()===31;}
function newRound(finale){S.round++;store.set('round',S.round);S.finale=!!finale;
 if(finale){while(S.crew.length<MAXCREW)S.crew.push(mkCrew());}
 while(S.crew.length<(DEMO?6:5))S.crew.push(mkCrew());
 S.crew.forEach((c,i)=>{const a=i/S.crew.length*6.283;Object.assign(c,{dead:false,ghost:false,imp:false,state:'idle',path:[],task:null,say:null,sus:0,seenKill:null,react:0,emote:null,venting:0,hidden:false,target:null,spawnT:0,
  x:SPAWN.x+Math.cos(a)*Math.min(260,60+S.crew.length*8),y:SPAWN.y+Math.sin(a)*26,wait:R(.5,2)});});
 const nImp=(finale||S.crew.length>=14)?2:1;const pool=S.crew.slice();
 for(let i=0;i<nImp;i++){const c=pool.splice(RI(0,pool.length-1),1)[0];c.imp=true;c.cd=R(14,20);c.patience=0;c.sab=R(40,70);c.speed=74;}
 S.bodies=[];S.tasks=0;S.goal=Math.max(60,S.crew.length*15);S.kills=0;S.killGoal=clamp(Math.ceil((S.crew.length-nImp)*.3),3,finale?9:7);
 S.lights=true;S.lightFix=null;S.meet=null;S.win=null;STATIONS.forEach(s=>{s.done=false;s.busy=null;});S.phase='intro';S.pt=0;S.lastMeet=S.time;S.impBoost=0;
 feed(finale?'🎆 HALLOWEEN NIGHT FINALE: the whole neighborhood is out!':'🚀 Round '+S.round+' started. Shhh, '+nImp+' impostor'+(nImp>1?'s are':' is')+' among us');}
function endRound(winner,reason){if(S.phase==='victory'||S.phase==='season')return;S.phase='victory';S.pt=0;S.parts.length=0;S.win={who:winner,reason,imps:imps().map(c=>c.name)};
 if(winner==='crew')S.crewWins++;else S.impWins++;store.set('cw',S.crewWins);store.set('iw',S.impWins);
 SND.play(winner==='crew'?'win':'lose');feed(winner==='crew'?'🏆 CREW WIN! '+reason:'😈 IMPOSTOR WIN! '+reason);}
function checkWin(){if(S.phase!=='play')return;const ac=aliveCrew().length,ai=imps().filter(c=>!c.dead).length;
 if(ai===0)return endRound('crew','The impostor got yeeted.');
 if(S.tasks>=S.goal)return endRound('crew','Every porch is decorated. Neighborhood saved 🎃');
 if(S.kills>=S.killGoal||ac<=ai)return endRound('imp','Too many ghosts on the block 👻');}
/* crew AI */
function chooseTask(c){const free=STATIONS.filter(s=>!s.done&&!s.busy);
 if(free.length<4){const d=STATIONS.filter(s=>s.done&&!s.busy);for(let i=0;i<4&&d.length;i++){d.splice(RI(0,d.length-1),1)[0].done=false;}if(Math.random()<.3)feed('🍂 The wind un-did some chores. Rude.');}
 const list=STATIONS.filter(s=>!s.done&&!s.busy);if(!list.length)return null;let best=null,bs=1e9;list.forEach(s=>{const sc=dist(s,c)+R(0,500);if(sc<bs){bs=sc;best=s;}});return best;}
const IDLE_LINES=['ayo 👀','nice cake 🎂',"I'm not sus, I'm built different",'who keeps eating the candy','pause 🤨','red sus fr','I saw that 👀',"don't look at my backpack",'this candy hits different','*throws it back*','my visor is fogging up','thicc happens','trust me bro','who vented in my pumpkin','cheeks out for Halloween','I only came for the candy','bro is NOT doing tasks',"spooky? I'm SPICY"];
const TASK_LINES={trick:['TRICK OR TREAT','smell my feet 🦶','gimme the full size bars'],carve:['carving my best side','🎃 sus face loading','he looking kinda thicc'],light:['let there be light 💡','who unscrewed this??'],candy:['one per crewmate. ONE.','king size for the thicc'],
 rake:['raking it in 🍂','leaf pile = nap pile'],tp:["who TP'd the tree 🧻",'unrolling…'],apple:['blub blub 🍎',"don't push me in"],candle:['rest in spooky','🕯️ lit'],haunt:['nope nope nope','ghost-proofing (scared)'],cauldron:['double double, cake and trouble','smells like electrical'],fuse:['FIXING LIGHTS','who did this 😤']};
function setPath(c,to){c.path=route(c,to);c.state='walk';}
function stepMove(c,dt,spd){const p=c.path[0];if(!p)return true;const dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);const v=spd*dt;
 if(Math.abs(dx)>2)c.face=dx>0?1:-1;c.walk+=dt*spd*.16;if(d<=v){c.x=p.x;c.y=p.y;c.path.shift();return !c.path.length;}c.x+=dx/d*v;c.y+=dy/d*v;return false;}
function addTask(n){if(S.phase==='play'||S.phase==='intro')S.tasks=Math.min(S.goal,S.tasks+n);}
function leaveTask(c){if(c.task&&c.task.busy===c.id)c.task.busy=null;if(S.lightFix===c.id)S.lightFix=null;c.task=null;}
function updCrew(c,dt){if(c.sayT>0){c.sayT-=dt;if(c.sayT<=0)c.say=null;}if(c.emT>0){c.emT-=dt;if(c.emT<=0)c.emote=null;}if(c.spawnT>0)c.spawnT=Math.max(0,c.spawnT-dt*1.6);
 c.sqv+=(-c.sq*120-c.sqv*9)*dt;c.sq+=c.sqv*dt;
 if(c.dead&&!c.ghost)return;
 if(c.imp&&!c.dead){updImp(c,dt);return;}
 if(S.phase!=='play')return;
 const spd=(c.ghost?.75:1)*c.speed*(S.dance>0?1.25:1);
 if(c.react>0){c.react-=dt;if(c.react<=0&&c.seenKill&&!c.ghost)startMeeting(c,c.seenKill.body);return;}
 if(!c.ghost&&S.bodies.length){const sr=S.lights?120:62;for(const b of S.bodies){if(dist(c,b)<sr){c.seenKill=c.seenKill||{body:b};c.react=.5;say(c,pick(['BODY!!','AYO?! 😱','nah he flat 💀','REPORT!!']),1.2);c.sq=.25;return;}}}
 if(S.dance>0&&c.state!=='task'&&c.state!=='walk'){c.emote='dance';c.emT=.3;}
 if(c.state==='idle'){c.wait-=dt;if(c.wait>0)return;
  if(!c.ghost&&!S.lights&&!S.lightFix){S.lightFix=c.id;leaveTask(c);S.lightFix=c.id;c.task={type:'fuse',x:FUSE.x,y:FUSE.y+12,label:'Fix lights',dur:5};setPath(c,c.task);return;}
  if(Math.random()<.14&&!c.ghost){c.task=null;setPath(c,{x:R(60,1220),y:R(280,440)});c.loiter=true;return;}
  const s=chooseTask(c);if(!s){c.wait=1;return;}s.busy=c.id;c.task=s;c.loiter=false;setPath(c,s);if(c.ghost)c.path=[{x:s.x,y:s.y}];return;}
 if(c.state==='walk'){if(stepMove(c,dt,spd)){c.sq=-.18;if(c.loiter){c.loiter=false;c.state='idle';c.wait=R(1.5,3.5);if(Math.random()<.6){say(c,pick(IDLE_LINES));if(Math.random()<.4){c.emote='twerk';c.emT=2.4;}}return;}
   if(c.task){c.state='task';c.tt=0;if(Math.random()<.35)say(c,pick(TASK_LINES[c.task.type]||['doing tasks fr']),2.2);}else c.state='idle';}return;}
 if(c.state==='task'){const t=c.task;if(!t){c.state='idle';return;}if(t.type==='fuse'&&S.lights){c.task=null;S.lightFix=null;c.state='idle';return;}
  c.tt+=dt*(c.ghost?.6:1)*(S.dance>0?1.3:1);if(Math.random()<dt*3)c.sq=.1;
  if(c.tt>=t.dur){if(t.type==='fuse'){S.lights=true;S.lightFix=null;SND.play('up');feed('💡 '+c.name+' fixed the lights. Hero behavior.');floatText(c.x,c.y-60,'LIGHTS FIXED','#ffe066');}
   else{t.done=true;t.busy=null;addTask(1);SND.play('task');floatText(c.x,c.y-60,'+1 task ✅','#7dff9a',18);burst(c.x,c.y-30,10,['#7dff9a','#ffe066','#fff'],120,'star');
    if(Math.random()<.12)feed('✅ '+c.name+' finished "'+t.label+'"');}
   c.task=null;c.state='idle';c.wait=R(.3,1.5);c.sq=.3;}}}
/* impostor AI */
function witnesses(v){const sr=S.lights?140:70;return aliveCrew().filter(o=>o!==v&&dist(o,v)<sr);}
function nearestVent(p){let b=VENTS[0],bd=1e9;VENTS.forEach(v=>{const d=dist(v,p);if(d<bd){bd=d;b=v;}});return b;}
function updImp(c,dt){
 if(S.phase!=='play')return;
 const boost=S.impBoost>0?1.3:1;const spd=c.speed*boost;c.cd-=dt*boost;c.sab-=dt;
 if(c.venting>0){c.venting-=dt;if(c.venting<=0){const to=c.ventTo;c.x=to.x;c.y=to.y;c.hidden=false;to.anim=1;SND.play('vent');c.path=[];c.state='idle';c.wait=R(.5,1.5);c.sq=.4;
   const w=aliveCrew().filter(o=>dist(o,to)<(S.lights?150:70));if(w.length){c.sus+=4;say(w[0],'HE CAME OUT THE VENT 😳',2.2);}}return;}
 if(c.sab<=0){if(S.lights&&Math.random()<.5)sabotage(c);c.sab=R(45,80);}
 if(c.cd<=0){c.patience+=dt;
  if(!c.target||c.target.dead||Math.random()<dt*.5){let best=null,bd=1e9;aliveCrew().forEach(v=>{const w=witnesses(v).length;if(w===0||(c.patience>22&&w<=1&&Math.random()<.3)){const d=dist(v,c);if(d<bd){bd=d;best=v;}}});c.target=best;}
  const t=c.target;if(t){const d=dist(c,t);
   if(d>420){const v1=nearestVent(c);if(dist(v1,c)<110){const v2=nearestVent(t);if(v2!==v1&&dist(v2,t)<d-200){doVent(c,v1,v2);return;}}}
   if(d<24){kill(c,t);return;}
   c.state='hunt';c.path=[{x:t.x,y:t.y}];stepMove(c,dt,spd*1.15);return;}}
 if(c.state==='hunt')c.state='idle';
 if(c.state==='idle'){c.wait=(c.wait||0)-dt;if(c.wait>0)return;
  if(Math.random()<.25){const v=pick(VENTS);setPath(c,v);c.goVent=v;return;}
  const s=pick(STATIONS);c.goVent=null;setPath(c,{x:s.x+R(-14,14),y:s.y+R(-6,6)});return;}
 if(c.state==='walk'){if(stepMove(c,dt,spd)){if(c.goVent){const v1=c.goVent;c.goVent=null;if(Math.random()<.6){doVent(c,v1,pick(VENTS.filter(v=>v!==v1)));return;}}
   c.state='fake';c.tt=R(3,7);if(Math.random()<.35)say(c,pick(['doing tasks 😇','totally carving rn',"I'm so innocent",'*pretends to rake*','hehe','I love tasks (lie)']),2.2);}return;}
 if(c.state==='fake'){c.tt-=dt;if(Math.random()<dt*2)c.sq=.08;if(c.tt<=0){c.state='idle';c.wait=R(0,1.5);}}}
function doVent(c,a,b){c.venting=1.1;c.hidden=true;c.ventTo=b;c.x=a.x;c.y=a.y;a.anim=1;SND.play('vent');c.path=[];
 const w=aliveCrew().filter(o=>dist(o,a)<(S.lights?150:70));if(w.length){c.sus+=5;say(w[0],'BRO JUST VENTED 😳',2.4);}
 burst(a.x,a.y,8,['#888','#555','#aaa'],80);}
function kill(c,v){const w=witnesses(v).filter(o=>Math.random()<(o.state==='task'?.45:.8));leaveTask(v);v.dead=true;v.ghost=true;v.state='idle';v.wait=3.5;v.say=null;v.emote=null;v.path=[];S.kills++;
 c.cd=(S.finale?15:22)*(S.impBoost>0?.75:1);c.patience=0;c.target=null;c.sq=-.3;
 S.bodies.push({x:v.x,y:v.y,color:v.color,name:v.name,face:v.face,t:0,id:v.id});
 floatText(v.x,v.y-55,'BONK!','#ffdf3a',34);burst(v.x,v.y-20,18,['#ffdf3a','#fff',v.color],200,'star');S.shake=.35;SND.play('bonk');setTimeout(()=>SND.play('ghost'),350);
 feed(pick(['👻 someone just got spooked into a ghost… who did it?? 👀','👻 a crewmate got BONKED. Thoughts and candy.','👻 '+v.name+' is a ghost now. Still doing tasks tho.']));
 w.forEach(o=>{o.seenKill={body:S.bodies[S.bodies.length-1],by:c};o.react=R(.6,1.2);say(o,pick(['I SAW THAT 😱','AYO WHAT','NAHHH 💀']),1.4);o.sq=.3;c.sus+=6;});
 const to={x:clamp(c.x+R(-300,300),40,1240),y:clamp(c.y+R(-120,120),285,700)};setPath(c,to);
 checkWin();}
function sabotage(c){if(!S.lights||S.phase!=='play')return;S.lights=false;S.lightFix=null;SND.play('down');feed('⚠️ LIGHTS SABOTAGED. Who touched the breaker?? 🔦');S.flash=.6;}
/* meetings */
const LOCS=[[0,0,1280,345,'the porches'],[0,345,1280,445,'the street'],[0,445,420,720,'the graveyard'],[420,445,860,720,'the pumpkin patch'],[860,445,1280,720,'the haunted house']];
const locOf=p=>{for(const l of LOCS)if(p.x>=l[0]&&p.y>=l[1]&&p.x<l[2]&&p.y<l[3])return l[4];return 'the cul-de-sac';};
function startMeeting(by,body,custom){if(S.phase!=='play'||!by)return;
 S.crew.forEach(o=>{leaveTask(o);o.state='idle';o.path=[];o.react=0;o.venting=0;o.hidden=false;o.emote=null;o.say=null;});
 S.phase='meeting';S.pt=0;S.lastMeet=S.time;S.meetGap=R(80,140);SND.play('siren');
 const voters=alive();const witness=by.seenKill&&by.seenKill.by;
 const susOf=o=>o.sus+(body&&o!==by&&dist(o,body)<220?1.5:0)+(o.imp?.6:0)+R(0,1);
 const lines=[];const other=x=>pick(voters.filter(o=>o!==x))||x;
 if(body)lines.push([by,pick(['DEAD BODY near '+locOf(body)+'!!','I found '+body.name+' FLAT near '+locOf(body)+' 💀','someone bonked '+body.name+' 😭'])]);
 else lines.push([by,custom||pick(['EMERGENCY! I saw '+other(by).name+' twerking near a vent','who keeps stealing the full size bars','EMERGENCY MEETING: '+other(by).name+' is acting too thicc',"I just wanted to see everyone's cakes"])]);
 if(witness&&!witness.dead)lines.push([by,'IT WAS '+witness.name.toUpperCase()+'. I SAW IT.']);
 lines.push([other(by),pick(['where??','wait what','I was in the bathroom','not again 😭'])]);
 const T=['I was doing {task} the whole time 😇','{X} was following me ngl','why is {X} so thicc tho','{X} been sus since spawn','skip, no evidence','vote {X}','trust me bro','my visor fogged up, saw nothing','{X} was by the vent 👀','I was literally handing out candy','self report??','not me, I was on the porch','{X} smells like electrical','ok but who farted in the graveyard',"pls I'm too thicc to be the impostor",'{X} keeps bending over at the pumpkin patch 🤨'];
 const IT=['I was with {X} the whole time 🙂',"it's {X}, 100%",'me? I was carving 🎃',"why would I vent, I'm claustrophobic",'{X} is lying, vote {X}'];
 const n=Math.min(7,3+Math.floor(voters.length/4));
 for(let i=0;i<n;i++){const sp=pick(voters);let tx=pick(sp.imp?IT:T);const others=voters.filter(o=>o!==sp).sort((a,b)=>susOf(b)-susOf(a));const tgt=others[RI(0,Math.min(2,others.length-1))]||sp;
  tx=tx.replace(/\{X\}/g,tgt.name).replace('{task}',pick(['carve pumpkin','rake leaves','trick-or-treat','light grave candle']));if(!sp.imp&&tx.indexOf(tgt.name)>=0)tgt.sus+=.6;lines.push([sp,tx]);}
 const votes={},tally={};
 voters.forEach(v=>{let t=null;
  if(v.seenKill&&v.seenKill.by&&!v.seenKill.by.dead)t=Math.random()<.75?v.seenKill.by:null;
  else if(v.imp){t=voters.filter(o=>!o.imp).sort((a,b)=>susOf(b)-susOf(a))[0]||null;if(Math.random()<.15)t=null;}
  else if(Math.random()<.18)t=null;
  else{const opts=voters.filter(o=>o!==v);let tot=0;const ws=opts.map(o=>{const w=Math.max(.15,susOf(o));tot+=w;return w;});let r=Math.random()*tot;for(let i=0;i<opts.length;i++){r-=ws[i];if(r<=0){t=opts[i];break;}}}
  const key=t?String(t.id):'skip';votes[v.id]=key;tally[key]=(tally[key]||0)+1;});
 let best=null,bn=0,tie=false;Object.keys(tally).forEach(k=>{if(tally[k]>bn){bn=tally[k];best=k;tie=false;}else if(tally[k]===bn)tie=true;});
 const ej=(!tie&&best&&best!=='skip')?S.crew.find(o=>String(o.id)===best):null;
 S.meet={by,body:body?body.name:null,lines,votes,tally,ej,tie,shown:0,ls:-1};
 feed(body?'🚨 DEAD BODY REPORTED by '+by.name:'🚨 EMERGENCY MEETING called by '+by.name);}
function finishMeeting(){const m=S.meet;S.bodies=[];
 if(m.ej){m.ej.dead=true;m.ej.ghost=true;leaveTask(m.ej);}
 S.crew.forEach((c,i)=>{c.seenKill=null;c.sus*=.4;const a=i/S.crew.length*6.283;c.x=SPAWN.x+Math.cos(a)*Math.min(250,70+S.crew.length*7);c.y=SPAWN.y+Math.sin(a)*24;c.state='idle';c.wait=R(.2,1.6);c.path=[];if(c.imp)c.cd=Math.max(c.cd,12);});
 S.lights=true;S.lightFix=null;S.phase='play';S.pt=0;checkWin();}
/* events: trades + commands */
function onBuy(){if(S.phase==='season'||S.crew.length+S.pending.length>=MAXCREW||S.pending.length>6){addTask(Math.max(1,Math.round(S.goal*.015)));feed('🎃 a buy came in: +task boost for the crew!');SND.play('task');return;}
 S.pending.push(1);}
function spawnPending(){if(!S.pending.length||S.crew.length>=MAXCREW||(S.phase!=='play'&&S.phase!=='intro'))return;S.pending.shift();
 const c=mkCrew(takeQueuedName(),true);S.crew.push(c);S.movedIn++;store.set('moved',S.movedIn);
 say(c,pick(['hi neighbors 👋',"I heard there's candy",'am I late? 🎃','new in town, very innocent',"who's thicc around here"]),3);
 floatText(c.x<0?80:W-80,c.y-60,'NEW CREWMATE!','#ffb15c',20);SND.play('spawn');feed('🎃 '+c.name+' just moved into the neighborhood (new buy!)');}
function onSell(){S.impBoost=20;feed(pick(['😈 someone paper-handed… the impostor feels POWERFUL','😈 a sell! The impostor did a little evil stretch','😈 sell detected. Impostor speed +30%']));
 if(Math.random()<.35){const i=imps().find(c=>!c.dead);if(i)sabotage(i);}}
function bigEvent(kind){kind=kind||pick(['candy','parade']);if(S.phase!=='play'){if(S.events.length<6)S.events.push({type:kind,wait:2});return;}
 if(kind==='candy'){S.events.push({type:'candy',t:0,life:8});feed('🍬 BIG BUY! CANDY RAIN! The crew is on a sugar rush');SND.play('candy');addTask(Math.round(S.goal*.05));aliveCrew().slice(0,6).forEach(c=>say(c,pick(['CANDY!!','sugar rush 🍬','mouth open','yummers']),2));}
 else{if(S.events.some(e=>e.type==='parade'&&e.life))return;S.events.push({type:'parade',t:0,x:-260,life:15});feed('👑 BIG BUY! ALL HAIL THE PUMPKIN KING PARADE');SND.play('win');addTask(Math.round(S.goal*.07));}}
const CMD_CD={vent:20,meeting:60,sabotage:45,candy:30,dance:15,parade:60,spawn:8};const cmdLast={};
function command(raw,who){try{const m=String(raw||'').trim().match(/^!?([A-Za-z]+)(?:\s+(.{1,24}))?$/);if(!m)return 'unknown command';const k=m[1].toLowerCase(),arg=m[2];
 if(!CMD_CD[k])return 'commands: !vent !meeting !sabotage !candy !dance !parade !spawn [name]';
 const left=CMD_CD[k]-(S.time-(cmdLast[k]===undefined?-1e9:cmdLast[k]));if(left>0)return '!'+k+' cooling down ('+Math.ceil(left)+'s)';
 if(S.phase!=='play'&&k!=='spawn')return 'wait until the round is playing';
 const by=who?String(who).slice(0,16):'chat';
 if(k==='vent'){const i=imps().find(c=>!c.dead&&!(c.venting>0));if(!i)return 'no impostor available';const v1=nearestVent(i);doVent(i,v1,pick(VENTS.filter(v=>v!==v1)));feed('💬 '+by+' made the impostor vent 🕳️');}
 else if(k==='meeting'){const c=pick(aliveCrew());if(!c)return 'nobody to call it';startMeeting(c,null,'CHAT CALLED A MEETING ('+by+')');}
 else if(k==='sabotage'){if(!S.lights)return 'lights already out';const i=imps().find(c=>!c.dead);if(!i)return 'no impostor';sabotage(i);feed('💬 '+by+' sabotaged the lights 🔦');}
 else if(k==='candy')bigEvent('candy');
 else if(k==='parade')bigEvent('parade');
 else if(k==='dance'){S.dance=6;feed('💬 '+by+' started a DANCE BREAK 💃');SND.play('boing');}
 else if(k==='spawn'){if(arg){const r=cleanName(arg);if(!r.ok)return r.why;queueName(r.name);}onBuy();feed('💬 '+by+' summoned a crewmate');}
 cmdLast[k]=S.time;return 'ok: !'+k;}catch(e){warn(e);return 'error';}}
let nameQ=store.get('nameq',[]);if(!Array.isArray(nameQ))nameQ=[];
let renderQueue=()=>{};
function queueName(n){if(nameQ.length>=50)nameQ.shift();nameQ.push(n);store.set('nameq',nameQ);renderQueue();}
function takeQueuedName(){while(nameQ.length){const n=nameQ.shift();store.set('nameq',nameQ);renderQueue();if(!usedNames.has(n)){usedNames.add(n);return n;}}return null;}
/* update */
function update(dt){S.time+=dt;S.pt+=dt;if(S.shake>0)S.shake-=dt;if(S.flash>0)S.flash-=dt;if(S.impBoost>0)S.impBoost-=dt;if(S.dance>0)S.dance-=dt;
 if(S.phase==='intro'&&S.pt>3.4){S.phase='play';S.pt=0;}
 if(S.phase==='meeting'){const m=S.meet,tl=1.8+m.lines.length*.75;const li=Math.floor((S.pt-1.8)/.75);m.shown=clamp(li+1,0,m.lines.length);
  if(S.pt>1.8&&li!==m.ls&&li<m.lines.length){m.ls=li;SND.play('vote');}
  if(S.pt>tl+4.8){S.phase='eject';S.pt=0;SND.play('whoosh');}}
 if(S.phase==='eject'&&S.pt>5.2){const m=S.meet;feed(m.ej?(m.ej.imp?'🎉 '+m.ej.name+' WAS the impostor!':'😬 '+m.ej.name+' was not the impostor.'):'🤷 No one was ejected.');finishMeeting();}
 if(S.phase==='victory'&&S.pt>8){if(S.finale){S.finale=false;S.finaleDone=true;store.set('finaleDone',true);S.phase='season';S.pt=0;SND.play('win');}else{const f=S.finaleNext;S.finaleNext=false;newRound(f);}}
 if(S.phase==='season'&&S.pt>14)newRound(false);
 if(S.phase==='play'){
  if(S.time-S.lastMeet>S.meetGap&&Math.random()<dt*.05&&aliveCrew().length>3)startMeeting(pick(aliveCrew()),null);
  if(S.phase==='play'&&S.bodies.length&&S.bodies[0].t>14&&Math.random()<dt*.04){const i=imps().find(c=>!c.dead&&!(c.venting>0));if(i){S.crew.forEach(o=>o.seenKill=null);startMeeting(i,S.bodies[0]);}}
  S.bodies.forEach(b=>b.t+=dt);
  if(Math.random()<dt*.9)spawnPending();
  checkWin();
  if(S.phase==='play'&&!S.finale&&!S.finaleDone&&!S.finaleNext&&isHalloween()&&!DEMO){S.finaleNext=true;endRound('crew','Halloween night is HERE 🎆');}}
 else if(S.phase==='intro'&&Math.random()<dt*.9)spawnPending();
 S.crew.forEach(c=>updCrew(c,dt));
 for(let i=S.parts.length-1;i>=0;i--){const p=S.parts[i];p.life-=dt;if(p.life<=0){S.parts.splice(i,1);continue;}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*5;}
 for(let i=S.floats.length-1;i>=0;i--){const f=S.floats[i];f.life-=dt;f.y-=dt*30;if(f.life<=0)S.floats.splice(i,1);}
 VENTS.forEach(v=>{if(v.anim>0)v.anim=Math.max(0,v.anim-dt*1.5);});
 for(let i=S.events.length-1;i>=0;i--){const e=S.events[i];
  if(e.wait!==undefined){if(S.phase==='play'){e.wait-=dt;if(e.wait<=0){S.events.splice(i,1);bigEvent(e.type);}}continue;}
  e.t+=dt;if(e.type==='candy'&&S.parts.length<380)for(let k=0;k<3;k++)S.parts.push({x:R(0,W),y:-10,vx:R(-20,20),vy:R(80,160),g:40,life:5,max:5,c:pick(['#ff4fa3','#ffdf3a','#7dff9a','#5ec8ff','#ff8a1f','#c38bff']),r:R(4,7),k:'candy',rot:R(0,6)});
  if(e.type==='parade')e.x+=dt*110;if(e.t>e.life||S.phase==='victory')S.events.splice(i,1);}
 if((S.finale&&S.phase!=='intro')||S.phase==='season'){if(Math.random()<dt*(S.phase==='play'?.5:1.6))firework();}
 S.bats.forEach(b=>{b.x+=b.vx*dt;b.ph+=dt*b.f;if(b.x>W+60)b.x=-60;if(b.x<-60)b.x=W+60;b.y=b.by+Math.sin(S.time*b.w+b.o)*12;});
 S.fog.forEach(f=>{f.x+=f.vx*dt;if(f.x>W+300)f.x=-300;if(f.x<-300)f.x=W+300;});}
function firework(){const x=R(100,W-100),y=R(60,260),cols=pick([['#ff8a1f','#ffdf3a'],['#7dff9a','#5ec8ff'],['#ff4fa3','#c38bff'],['#fff','#ffb15c']]);SND.play('boom');
 for(let i=0;i<46&&S.parts.length<420;i++){const a=i/46*6.283,v=R(110,190);S.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:70,life:R(1,1.6),max:1.6,c:pick(cols),r:R(2,3.4),k:'spark',rot:0});}}
/* drawing helpers */
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function beanPath(){g.beginPath();g.moveTo(-12,-22);g.arc(0,-22,12,Math.PI,0,false);g.lineTo(12,-8);g.quadraticCurveTo(12,-3,7,-3);g.lineTo(-6,-3);g.bezierCurveTo(-16,-2,-18,-11,-12,-15);g.closePath();}
const depth=y=>1.02+.4*(y-260)/460;
function drawCrewmate(c,x,y,o){o=o||{};const s=o.s||depth(y),col=c.color;
 g.save();g.translate(x,y);
 if(!o.noShadow){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,0,14*s,4.5*s,0,0,6.283);g.fill();}
 let sq=clamp(c.sq||0,-.35,.35),rot=0,bob=0,hip=0;const walking=o.walk!==undefined?o.walk:(c.state==='walk'||c.state==='hunt');
 const wt=c.walk||0;if(walking){bob=Math.abs(Math.sin(wt))*2.2;rot=Math.sin(wt)*.06;}
 const em=o.emote!==undefined?o.emote:c.emote;const T=S.time;
 if(em==='twerk'){hip=Math.sin(T*22)*3;sq+=Math.sin(T*22)*.08;}
 if(em==='dance'){rot=Math.sin(T*8+c.id)*.25;bob=Math.abs(Math.sin(T*8+c.id))*6;}
 if(c.state==='task'||c.state==='fake')sq+=Math.sin(T*10+c.id)*.04;
 const face=em==='twerk'?-(c.face||1):(o.face||c.face||1);
 g.scale(s*face,s);g.translate(0,-bob);g.rotate(rot);g.scale(1+sq,1-sq);
 g.lineJoin='round';g.lineCap='round';g.lineWidth=2.6;g.strokeStyle=OUT;
 const lp=walking?Math.sin(wt):0;
 g.fillStyle=shade(col,-.3);rr(-9+lp*2,-8-Math.max(0,-lp)*3,8,8,3);g.fill();g.stroke();
 g.fillStyle=col;rr(1-lp*2,-8-Math.max(0,lp)*3,9,8,3);g.fill();g.stroke();
 g.save();g.translate(-hip*.4,0);g.rotate(-rot*.6);g.fillStyle=shade(col,-.22);rr(-19,-26,8,15,3);g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.15)';g.fillRect(-17,-24,2,10);g.restore();
 g.save();g.translate(hip,0);beanPath();g.fillStyle=col;g.fill();
 g.save();beanPath();g.clip();const gr=g.createLinearGradient(-14,0,12,0);gr.addColorStop(0,'rgba(0,0,0,.42)');gr.addColorStop(.55,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(-20,-40,40,40);
 g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(3,-31,7,3.5,-.2,0,6.283);g.fill();
 g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(-11,-7,6,5,0,0,6.283);g.fill();
 g.fillStyle='rgba(255,170,90,.12)';g.fillRect(6,-30,8,28);g.restore();
 beanPath();g.stroke();
 g.strokeStyle='rgba(23,11,16,.55)';g.lineWidth=1.6;g.beginPath();g.moveTo(-9,-12);g.quadraticCurveTo(-12,-8,-8,-5);g.stroke();g.lineWidth=2.6;g.strokeStyle=OUT;
 g.beginPath();g.ellipse(5,-22,8.5,5.6,0,0,6.283);const vg=g.createLinearGradient(0,-28,0,-16);vg.addColorStop(0,'#c8f2ff');vg.addColorStop(.5,'#6cc4ea');vg.addColorStop(1,'#2d6e94');g.fillStyle=vg;g.fill();g.stroke();
 if(o.dead){g.lineWidth=1.8;[[2,-22],[8,-22]].forEach(([ex,ey])=>{g.beginPath();g.moveTo(ex-2,ey-2);g.lineTo(ex+2,ey+2);g.moveTo(ex+2,ey-2);g.lineTo(ex-2,ey+2);g.stroke();});g.lineWidth=2.6;}
 else{const blink=(Math.floor(T*1.3+c.id*.37)%5===0)&&((T*1.3+c.id*.37)%1<.12);
  g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.ellipse(7.5,-24.3,3.4,blink?.5:1.5,-.15,0,6.283);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(11,-21,1,0,6.283);g.fill();
  if(o.smirk||c.state==='hunt'){g.lineWidth=1.6;g.beginPath();g.moveTo(1,-19.5);g.quadraticCurveTo(5,-17.5,9,-20.5);g.stroke();g.lineWidth=2.6;}}
 drawHat(o.hat||c.hat);g.restore();
 g.restore();}
function drawHat(h){if(!h||h==='none')return;g.save();g.translate(0,-33);g.strokeStyle=OUT;g.lineWidth=2.2;
 if(h==='witch'){g.fillStyle='#2b1a3a';g.beginPath();g.ellipse(0,1,14,3.5,0,0,6.283);g.fill();g.stroke();g.beginPath();g.moveTo(-8,0);g.quadraticCurveTo(-2,-10,4,-20);g.quadraticCurveTo(8,-14,8,0);g.closePath();g.fill();g.stroke();g.fillStyle='#ff8a1f';g.fillRect(-7,-4,15,3);}
 else if(h==='pumpkin'){g.fillStyle='#ff8a1f';g.beginPath();g.ellipse(0,-4,9,6,0,0,6.283);g.fill();g.stroke();g.strokeStyle='rgba(23,11,16,.5)';g.beginPath();g.moveTo(0,-10);g.lineTo(0,2);g.stroke();g.fillStyle='#3a7a2a';g.fillRect(-1,-14,3,5);}
 else if(h==='horns'){g.fillStyle='#d42a2a';[-1,1].forEach(d=>{g.beginPath();g.moveTo(d*4,2);g.quadraticCurveTo(d*9,-4,d*7,-11);g.quadraticCurveTo(d*6,-4,d*10,2);g.closePath();g.fill();g.stroke();});}
 else if(h==='sprout'){g.strokeStyle='#3a7a2a';g.lineWidth=2;g.beginPath();g.moveTo(0,2);g.lineTo(0,-8);g.stroke();g.fillStyle='#6fd14a';g.strokeStyle=OUT;g.lineWidth=1.6;[-1,1].forEach(d=>{g.beginPath();g.ellipse(d*4,-9,4,2.2,d*.5,0,6.283);g.fill();g.stroke();});}
 else if(h==='party'){g.fillStyle='#5ec8ff';g.beginPath();g.moveTo(-6,2);g.lineTo(0,-16);g.lineTo(6,2);g.closePath();g.fill();g.stroke();g.fillStyle='#ffdf3a';g.beginPath();g.arc(0,-16,2.5,0,6.283);g.fill();}
 else if(h==='top'){g.fillStyle='#1b1b22';g.fillRect(-10,0,20,3);g.strokeRect(-10,0,20,3);g.fillRect(-6,-14,12,14);g.strokeRect(-6,-14,12,14);g.fillStyle='#ff8a1f';g.fillRect(-6,-4,12,3);}
 else if(h==='bow'){g.fillStyle='#ff4fa3';g.beginPath();g.moveTo(0,-2);g.lineTo(-8,-7);g.lineTo(-8,3);g.closePath();g.moveTo(0,-2);g.lineTo(8,-7);g.lineTo(8,3);g.closePath();g.fill();g.stroke();}
 else if(h==='halo'){g.strokeStyle='#ffe066';g.lineWidth=2.5;g.beginPath();g.ellipse(0,-6,8,2.5,0,0,6.283);g.stroke();}
 else if(h==='crown'){g.fillStyle='#ffd23a';g.beginPath();g.moveTo(-9,2);g.lineTo(-9,-7);g.lineTo(-4,-2);g.lineTo(0,-10);g.lineTo(4,-2);g.lineTo(9,-7);g.lineTo(9,2);g.closePath();g.fill();g.stroke();}
 g.restore();}
function drawGhost(c,x,y,sc){const s=sc||depth(y);g.save();g.globalAlpha*=.42+.1*Math.sin(S.time*3+c.id);g.translate(x,y-18-Math.sin(S.time*2.4+c.id)*5);g.scale(s*(c.face||1),s);g.lineWidth=2;g.strokeStyle='rgba(23,11,16,.6)';
 g.beginPath();g.moveTo(-12,-14);g.arc(0,-14,12,Math.PI,0);g.lineTo(12,4);for(let i=0;i<4;i++){const xx=12-(i+1)*6;g.quadraticCurveTo(xx+3,(i%2?0:9)+Math.sin(S.time*6+i)*2,xx,4);}g.closePath();
 const gr=g.createLinearGradient(0,-26,0,6);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,c.color);g.fillStyle=gr;g.fill();g.stroke();
 g.fillStyle='#2d6e94';g.beginPath();g.ellipse(5,-15,6.5,4.2,0,0,6.283);g.fill();g.fillStyle='#fff';g.beginPath();g.ellipse(7,-16.5,2.4,1.1,0,0,6.283);g.fill();
 g.strokeStyle='#ffe066';g.lineWidth=2;g.beginPath();g.ellipse(0,-30,7,2.2,0,0,6.283);g.stroke();g.restore();}
function drawBody(b){const s=depth(b.y);g.save();g.translate(b.x,b.y);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,0,22*s,5*s,0,0,6.283);g.fill();
 g.save();g.scale(s,s);g.rotate(-1.5708*(b.face||1));g.translate(8*(b.face||1),10);drawCrewmate({color:b.color,face:1,sq:0,hat:'none',state:'dead',walk:0,id:b.id},0,0,{s:1,noShadow:true,dead:true,walk:false,emote:null,hat:'none'});g.restore();
 for(let i=0;i<3;i++){const a=S.time*3+i*2.09;g.fillStyle='#ffe066';star(Math.cos(a)*14*s,-26*s+Math.sin(a)*4,4);}
 [['#ff4fa3',16,2],['#ffdf3a',22,-3],['#7dff9a',28,3]].forEach(([c2,dx,dy])=>{g.fillStyle=c2;g.beginPath();g.ellipse(dx*s*(b.face||1),dy,3.5,2,.4,0,6.283);g.fill();});
 g.restore();}
function star(x,y,r){g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r2=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*r2,y+Math.sin(a)*r2);}g.closePath();g.fill();}
function pumpkin(x,y,r,carved,glow){g.save();g.translate(x,y);g.strokeStyle=OUT;g.lineWidth=2;g.fillStyle='#ff8a1f';g.beginPath();g.ellipse(0,0,r*1.15,r*.9,0,0,6.283);g.fill();g.stroke();
 g.strokeStyle='rgba(120,40,0,.6)';g.lineWidth=1.4;g.beginPath();g.ellipse(0,0,r*.45,r*.88,0,0,6.283);g.stroke();
 g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(-r*.4,-r*.35,r*.25,r*.15,-.5,0,6.283);g.fill();
 g.fillStyle='#3a7a2a';g.strokeStyle=OUT;g.lineWidth=1.6;g.fillRect(-2,-r-5,4,6);g.strokeRect(-2,-r-5,4,6);
 if(carved){g.fillStyle=glow?'#ffe066':'#2a1000';const k=r/10;g.beginPath();g.moveTo(-6*k,-2*k);g.lineTo(-2*k,-2*k);g.lineTo(-4*k,-6*k);g.closePath();g.moveTo(6*k,-2*k);g.lineTo(2*k,-2*k);g.lineTo(4*k,-6*k);g.closePath();g.fill();
  g.beginPath();g.moveTo(-7*k,1*k);g.quadraticCurveTo(0,8*k,7*k,1*k);g.lineTo(4*k,2*k);g.lineTo(3*k,4*k);g.lineTo(1*k,2.5*k);g.lineTo(-1*k,4*k);g.lineTo(-3*k,2.5*k);g.closePath();g.fill();}
 g.restore();}
/* background prerender */
let bg=null,hh=null,scaleK=1;
function mkCanvas(){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(W*scaleK));c.height=Math.max(1,Math.round(H*scaleK));const x=c.getContext('2d');x.scale(scaleK,scaleK);return [c,x];}
function renderBG(){const og=g;try{const [c,x]=mkCanvas();g=x;seed=1337;
 let gr=g.createLinearGradient(0,0,0,170);gr.addColorStop(0,'#07051a');gr.addColorStop(1,'#26123f');g.fillStyle=gr;g.fillRect(0,0,W,175);
 for(let i=0;i<140;i++){g.fillStyle='rgba(255,255,255,'+(.3+srand()*.7)+')';const sz=srand()<.1?2:1;g.fillRect(srand()*W,srand()*150,sz,sz);}
 const mx=1090,my=70;const mg=g.createRadialGradient(mx,my,10,mx,my,130);mg.addColorStop(0,'rgba(255,240,200,.35)');mg.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=mg;g.fillRect(mx-130,my-130,260,260);
 g.fillStyle='#fff2c8';g.beginPath();g.arc(mx,my,42,0,6.283);g.fill();g.fillStyle='rgba(200,180,130,.45)';[[-12,-8,8],[14,6,6],[-4,16,5],[10,-18,4]].forEach(([a,b,r])=>{g.beginPath();g.arc(mx+a,my+b,r,0,6.283);g.fill();});
 g.fillStyle='rgba(60,30,0,.14)';g.beginPath();g.arc(mx+14,my-4,40,0,6.283);g.fill();
 g.fillStyle='#160c26';g.beginPath();g.moveTo(0,175);for(let xx=0;xx<=W;xx+=40)g.lineTo(xx,120+Math.sin(xx*.013)*18+Math.sin(xx*.05)*6);g.lineTo(W,175);g.fill();
 g.fillStyle='#0f0819';for(let i=0;i<16;i++){const tx=srand()*W,th=40+srand()*40;g.beginPath();g.moveTo(tx-14,172);g.lineTo(tx,172-th);g.lineTo(tx+14,172);g.fill();}
 gr=g.createLinearGradient(0,165,0,330);gr.addColorStop(0,'#0e1a14');gr.addColorStop(1,'#16291c');g.fillStyle=gr;g.fillRect(0,165,W,165);
 gr=g.createLinearGradient(0,440,0,720);gr.addColorStop(0,'#15281b');gr.addColorStop(1,'#0c1710');g.fillStyle=gr;g.fillRect(0,440,W,280);
 for(let i=0;i<900;i++){const tx=srand()*W,ty=srand()<.3?175+srand()*150:445+srand()*275;g.strokeStyle='rgba('+(30+srand()*40|0)+','+(70+srand()*50|0)+',40,.6)';g.lineWidth=1;g.beginPath();g.moveTo(tx,ty);g.lineTo(tx+srand()*3-1.5,ty-3-srand()*3);g.stroke();}
 g.fillStyle='#4a4754';g.fillRect(0,322,W,24);g.fillRect(0,424,W,22);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.5;for(let xx=0;xx<W;xx+=48){g.beginPath();g.moveTo(xx,322);g.lineTo(xx,346);g.moveTo(xx+24,424);g.lineTo(xx+24,446);g.stroke();}
 gr=g.createLinearGradient(0,346,0,424);gr.addColorStop(0,'#1d1c26');gr.addColorStop(1,'#26252f');g.fillStyle=gr;g.fillRect(0,346,W,78);
 g.fillStyle='#6a6676';g.fillRect(0,344,W,3);g.fillRect(0,422,W,3);
 g.fillStyle='#d9b23a';for(let xx=10;xx<W;xx+=70)g.fillRect(xx,383,38,4);
 for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,255,.04)';g.beginPath();g.arc(srand()*W,350+srand()*70,srand()*6+1,0,6.283);g.fill();}
 HOUSES.forEach(h=>{g.fillStyle='#3b3946';g.beginPath();g.moveTo(h.x+106,258);g.lineTo(h.x+134,258);g.lineTo(h.x+142,322);g.lineTo(h.x+98,322);g.fill();});
 HOUSES.forEach(drawHouse);
 LAMPS.forEach(l=>{[[5,OUT],[3,'#2e2a38']].forEach(([lw,cl])=>{g.strokeStyle=cl;g.lineWidth=lw;g.beginPath();g.moveTo(l.x,l.y);g.lineTo(l.x,l.y-92);g.quadraticCurveTo(l.x,l.y-104,l.x+14,l.y-104);g.stroke();});
  g.fillStyle='#2e2a38';g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.moveTo(l.x+6,l.y-106);g.lineTo(l.x+24,l.y-106);g.lineTo(l.x+20,l.y-98);g.lineTo(l.x+10,l.y-98);g.closePath();g.fill();g.stroke();});
 g.fillStyle='rgba(30,20,20,.45)';g.beginPath();g.ellipse(210,600,200,110,0,0,6.283);g.fill();
 g.strokeStyle='#14101a';g.lineWidth=3;g.beginPath();g.moveTo(24,470);g.lineTo(335,470);g.moveTo(375,470);g.lineTo(400,470);g.stroke();g.fillStyle='#14101a';for(let xx=28;xx<400;xx+=14){if(xx>335&&xx<375)continue;g.beginPath();g.moveTo(xx,486);g.lineTo(xx,462);g.stroke();g.beginPath();g.moveTo(xx-3,463);g.lineTo(xx,456);g.lineTo(xx+3,463);g.fill();}
 [[100,548],[205,612],[305,540],[160,680],[300,672],[40,610],[370,610]].forEach(([x2,y2],i)=>{g.fillStyle='#2b2232';g.beginPath();g.ellipse(x2,y2+16,22,6,0,0,6.283);g.fill();
  g.fillStyle=i%3===2?'#7d7a88':'#8e8b99';g.strokeStyle=OUT;g.lineWidth=2.4;if(i%3===1){g.fillRect(x2-4,y2-34,8,48);g.strokeRect(x2-4,y2-34,8,48);g.fillRect(x2-14,y2-24,28,8);g.strokeRect(x2-14,y2-24,28,8);}
  else{g.beginPath();g.moveTo(x2-15,y2+12);g.lineTo(x2-15,y2-18);g.arc(x2,y2-18,15,Math.PI,0);g.lineTo(x2+15,y2+12);g.closePath();g.fill();g.stroke();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x2+6,y2-24,8,36);g.fillStyle='#3a3542';g.font='bold 9px '+FONT;g.textAlign='center';g.fillText(['RIP','SUS','BRB','AFK','LOL','GG','RIP'][i],x2-1,y2-8);}});
 g.strokeStyle='#2c5a22';g.lineWidth=2;for(let i=0;i<9;i++){g.beginPath();const sx=450+srand()*380,sy=480+srand()*220;g.moveTo(sx,sy);g.bezierCurveTo(sx+30,sy-20,sx+60,sy+20,sx+90,sy);g.stroke();}
 [[470,500,9],[530,610,11],[660,690,10],[700,560,8],[810,680,9],[610,705,7]].forEach(([px,py,r])=>pumpkin(px,py,r,false));
 g.fillStyle='#6b4423';g.strokeStyle=OUT;g.lineWidth=2.4;rr(772,500,40,30,8);g.fill();g.stroke();g.fillStyle='#2a5a9a';g.beginPath();g.ellipse(792,502,18,5,0,0,6.283);g.fill();g.stroke();g.fillStyle='#e0302f';[[784,501],[796,503],[800,500]].forEach(([a,b])=>{g.beginPath();g.arc(a,b,3,0,6.283);g.fill();});
 g.fillStyle='#55606e';g.strokeStyle=OUT;g.lineWidth=2.4;rr(FUSE.x-12,FUSE.y-30,24,30,3);g.fill();g.stroke();g.fillStyle='#ffdf3a';g.beginPath();g.moveTo(FUSE.x+2,FUSE.y-26);g.lineTo(FUSE.x-5,FUSE.y-13);g.lineTo(FUSE.x,FUSE.y-13);g.lineTo(FUSE.x-3,FUSE.y-4);g.lineTo(FUSE.x+5,FUSE.y-17);g.lineTo(FUSE.x,FUSE.y-17);g.closePath();g.fill();
 VENTS.forEach(v=>{g.fillStyle='#16151c';g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.ellipse(v.x,v.y,20,8,0,0,6.283);g.fill();g.stroke();});
 bg=c;const [c2,x2]=mkCanvas();g=x2;drawHaunted();hh=c2;}finally{g=og;}}
function drawHouse(h){const x=h.x;g.lineJoin='round';g.strokeStyle=OUT;g.lineWidth=3;
 g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+16,250,212,10);
 g.fillStyle=h.wall;g.fillRect(x+22,150,200,105);g.strokeRect(x+22,150,200,105);
 g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1;for(let yy=160;yy<255;yy+=9){g.beginPath();g.moveTo(x+23,yy);g.lineTo(x+221,yy);g.stroke();}
 g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+170,151,51,103);
 g.strokeStyle=OUT;g.lineWidth=3;g.fillStyle=h.roof;g.fillRect(x+176,92,20,40);g.strokeRect(x+176,92,20,40);
 g.beginPath();g.moveTo(x+4,156);g.lineTo(x+122,74);g.lineTo(x+240,156);g.closePath();g.fill();g.stroke();
 g.fillStyle='rgba(255,255,255,.07)';g.beginPath();g.moveTo(x+18,150);g.lineTo(x+122,80);g.lineTo(x+122,92);g.lineTo(x+34,150);g.fill();
 [[x+42,172],[x+178,172]].forEach(([wx,wy],i)=>{const wg=g.createLinearGradient(wx,wy,wx+30,wy+30);wg.addColorStop(0,'#ffe9a8');wg.addColorStop(1,'#ff9a2a');g.fillStyle=wg;g.fillRect(wx,wy,30,30);
  if(i===1&&(h.x===70||h.x===670)){g.fillStyle='#1a0d14';g.beginPath();g.arc(wx+15,wy+30,9,Math.PI,0);g.fill();g.fillRect(wx+11,wy+14,8,4);}
  g.strokeStyle=OUT;g.lineWidth=3;g.strokeRect(wx,wy,30,30);g.lineWidth=2;g.beginPath();g.moveTo(wx+15,wy);g.lineTo(wx+15,wy+30);g.moveTo(wx,wy+15);g.lineTo(wx+30,wy+15);g.stroke();});
 g.lineWidth=3;g.fillStyle='#ffd27a';g.beginPath();g.arc(x+122,124,11,0,6.283);g.fill();g.stroke();
 g.fillStyle=shade(h.wall,-.45);rr(x+104,202,36,53,4);g.fill();g.stroke();g.fillStyle='#ffdf3a';g.beginPath();g.arc(x+133,230,2.5,0,6.283);g.fill();
 g.fillStyle=h.trim;g.fillRect(x+92,252,60,6);g.strokeRect(x+92,252,60,6);
 [[x+28,254],[x+206,254]].forEach(([bx,by])=>{g.fillStyle='#1d3a22';g.beginPath();g.arc(bx,by,13,Math.PI,0);g.arc(bx+14,by,10,Math.PI,0);g.fill();g.stroke();});
 g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.beginPath();for(let i=0;i<5;i++){g.moveTo(x+24,152);g.lineTo(x+24+Math.cos(i*.39)*26,152+Math.sin(i*.39)*26);}g.stroke();
 for(let r2=8;r2<=24;r2+=8){g.beginPath();g.arc(x+24,152,r2,0,1.57);g.stroke();}}
function drawHaunted(){const x=HAUNT.x,y=HAUNT.y,b=HAUNT.base;g.lineJoin='round';g.strokeStyle=OUT;g.lineWidth=3;
 g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(x+165,b+4,190,14,0,0,6.283);g.fill();
 g.fillStyle='#2a2238';g.fillRect(x+20,y+40,290,b-y-40);g.strokeRect(x+20,y+40,290,b-y-40);
 g.fillStyle='#231c2f';g.fillRect(x+230,y-10,70,b-y+10);g.strokeRect(x+230,y-10,70,b-y+10);
 g.fillStyle='#120c1c';g.beginPath();g.moveTo(x,y+46);g.lineTo(x+120,y-14);g.lineTo(x+250,y+46);g.closePath();g.fill();g.stroke();
 g.beginPath();g.moveTo(x+220,y-6);g.lineTo(x+265,y-70);g.lineTo(x+310,y-6);g.closePath();g.fill();g.stroke();
 g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1;for(let yy=y+50;yy<b;yy+=10){g.beginPath();g.moveTo(x+21,yy);g.lineTo(x+229,yy);g.stroke();}
 g.strokeStyle=OUT;g.lineWidth=3;
 [[x+50,y+70],[x+150,y+70],[x+50,y+125],[x+245,y+40],[x+245,y+110]].forEach(([wx,wy],i)=>{g.fillStyle=i===2?'#1a1424':'#7dff9a';g.globalAlpha=i===2?1:.85;g.fillRect(wx,wy,34,40);g.globalAlpha=1;g.strokeRect(wx,wy,34,40);
  if(i===2||i===4){g.strokeStyle='#5a3a22';g.lineWidth=5;g.beginPath();g.moveTo(wx-4,wy+8);g.lineTo(wx+38,wy+30);g.stroke();g.strokeStyle=OUT;g.lineWidth=3;}});
 g.fillStyle='#160f20';rr(x+130,b-62,42,62,18);g.fill();g.stroke();g.fillStyle='#4a3a5a';g.fillRect(x+118,b-4,66,6);
 g.save();g.translate(x+76,b-12);g.rotate(-.06);g.fillStyle='#6b4423';g.fillRect(-36,-14,72,20);g.strokeRect(-36,-14,72,20);g.fillStyle='#ffdf3a';g.font='bold 13px '+FONT;g.textAlign='center';g.fillText('KEEP OUT',0,1);g.restore();
 g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=1;g.beginPath();for(let i=0;i<5;i++){g.moveTo(x+300,y-4);g.lineTo(x+300-Math.cos(i*.39)*30,y-4+Math.sin(i*.39)*30);}g.stroke();}
/* dynamic world layers */
function drawStations(){const T=S.time;STATIONS.forEach(s=>{
 if(s.type==='carve')pumpkin(s.px,s.py,10,s.done,s.done);
 else if(s.type==='light'){g.fillStyle=s.done?'#fff3b0':'#3a3542';g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.arc(s.lx,s.ly,5,0,6.283);g.fill();g.stroke();}
 else if(s.type==='candy'){g.fillStyle='#6b2aa0';g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.ellipse(s.x+16,s.y-8,12,5,0,0,6.283);g.fill();g.stroke();if(!s.done){['#ff4fa3','#ffdf3a','#7dff9a'].forEach((c2,i)=>{g.fillStyle=c2;g.beginPath();g.arc(s.x+10+i*6,s.y-11,3,0,6.283);g.fill();});}}
 else if(s.type==='rake'){const p=s.pile;const k=s.done?.35:1;['#8a3a1a','#b5481e','#d9822b','#e8b23a'].forEach((c2,i)=>{g.fillStyle=c2;g.beginPath();g.ellipse(p.x+(i-1.5)*6*k,p.y-i*2.5*k,(22-i*3)*k,(9-i)*k,0,0,6.283);g.fill();});g.strokeStyle='rgba(23,11,16,.6)';g.lineWidth=1.5;g.beginPath();g.ellipse(p.x,p.y-3*k,24*k,10*k,0,0,6.283);g.stroke();}
 else if(s.type==='candle'){g.fillStyle='#f3e6d8';g.strokeStyle=OUT;g.lineWidth=1.5;g.fillRect(s.cx+12,s.cy+4,5,10);g.strokeRect(s.cx+12,s.cy+4,5,10);if(s.done){const f=Math.sin(T*14+s.cx);g.fillStyle='#ffb33a';g.beginPath();g.ellipse(s.cx+14.5,s.cy+f,2.5,4.5,0,0,6.283);g.fill();g.fillStyle='#fff3b0';g.beginPath();g.ellipse(s.cx+14.5,s.cy+1+f,1.2,2.2,0,0,6.283);g.fill();}}
 else if(s.type==='cauldron'){for(let i=0;i<(s.done?4:1);i++){g.fillStyle='rgba(125,255,154,.55)';g.beginPath();g.arc(1240+Math.sin(T*3+i*2)*8,654-((T*20+i*9)%30),2.5+i%2,0,6.283);g.fill();}}
 else if(s.type==='haunt'&&!s.done){g.save();g.globalAlpha=.35+.25*Math.sin(T*2);g.fillStyle='#fff';g.beginPath();g.arc(1067,512+Math.sin(T*1.5)*4,9,Math.PI,0);g.lineTo(1076,524);g.lineTo(1058,524);g.fill();g.restore();}});
 VENTS.forEach(v=>{if(v.anim>0){g.save();g.translate(v.x,v.y);g.fillStyle='#000';g.beginPath();g.ellipse(0,0,19,7,0,0,6.283);g.fill();const k=Math.sin(v.anim*Math.PI);g.translate(0,-k*22);g.rotate(k*.6);g.fillStyle='#3a3846';g.strokeStyle=OUT;g.lineWidth=2;g.beginPath();g.ellipse(0,0,20,8,0,0,6.283);g.fill();g.stroke();g.restore();}
  else{g.strokeStyle='rgba(120,120,140,.5)';g.lineWidth=1.5;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(v.x+i*6,v.y-5);g.lineTo(v.x+i*6,v.y+5);g.stroke();}}});}
function drawTree(){const x=650,y=548;g.save();g.lineCap='round';
 const br=(x1,y1,a,l,w,d)=>{const x2=x1+Math.cos(a)*l,y2=y1+Math.sin(a)*l;g.lineWidth=w+3;g.strokeStyle=OUT;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.lineWidth=w;g.strokeStyle='#3b2a24';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  if(d>0){br(x2,y2,a-.5,l*.7,w*.65,d-1);br(x2,y2,a+.45,l*.65,w*.6,d-1);}};
 br(x,y,-1.57+Math.sin(S.time*.8)*.03,62,12,4);
 const tp=STATIONS.find(s=>s.type==='tp');if(tp&&!tp.done){g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=3;for(let i=0;i<5;i++){g.beginPath();const sx=600+i*24,sy=455+(i%2)*14;g.moveTo(sx,sy);g.quadraticCurveTo(sx+12,sy+26+Math.sin(S.time*2+i)*4,sx+6,sy+46);g.stroke();}}
 g.restore();}
function drawProp(c){const t=c.task;if(!t||c.state!=='task')return;const k=Math.sin(S.time*10+c.id);const s=depth(c.y);g.save();g.translate(c.x+(c.face||1)*16*s,c.y-14*s);g.scale(s,s);g.strokeStyle=OUT;g.lineWidth=2;
 if(t.type==='rake'){g.rotate(k*.5);g.strokeStyle='#8a5a2a';g.lineWidth=3;g.beginPath();g.moveTo(0,-14);g.lineTo(0,12);g.stroke();g.strokeStyle='#bbb';g.lineWidth=2;g.beginPath();g.moveTo(-6,12);g.lineTo(6,12);for(let i=-6;i<=6;i+=3){g.moveTo(i,12);g.lineTo(i,16);}g.stroke();}
 else if(t.type==='candle'||t.type==='light'||t.type==='fuse'){g.translate(0,-6+k*2);g.fillStyle='#ffdf3a';star(0,0,5+k);}
 else if(t.type==='candy'||t.type==='trick'){g.translate(0,k*3);g.fillStyle='#ff8a1f';g.beginPath();g.arc(0,0,7,0,Math.PI);g.closePath();g.fill();g.stroke();g.fillStyle='#ff4fa3';g.fillRect(-3,-3,6,3);}
 else if(t.type==='carve'){g.rotate(k*.6);g.fillStyle='#ccc';g.fillRect(-1,-10,3,12);g.fillStyle='#6b4423';g.fillRect(-2,2,5,6);}
 else if(t.type==='tp'){g.translate(0,k*3);g.fillStyle='#fff';g.beginPath();g.arc(0,0,5,0,6.283);g.fill();g.stroke();}
 else{g.translate(0,k*3);g.fillStyle='#7dff9a';g.beginPath();g.arc(0,0,4,0,6.283);g.fill();}
 g.restore();if(t.type==='rake'&&Math.random()<.12)burst(c.x+c.face*20,c.y,1,['#d9822b','#e8b23a'],60);}
function drawBar(x,y,w,p){g.fillStyle='rgba(0,0,0,.65)';rr(x-w/2-2,y-2,w+4,8,4);g.fill();g.fillStyle='#7dff9a';rr(x-w/2,y,Math.max(2,w*p),4,2);g.fill();}
function bubble(x,y,t){g.font='bold 13px '+FONT;const w=Math.min(260,g.measureText(t).width+16);x=clamp(x,w/2+4,W-w/2-4);g.fillStyle='rgba(255,255,255,.96)';g.strokeStyle=OUT;g.lineWidth=2;rr(x-w/2,y-24,w,22,10);g.fill();g.stroke();
 g.beginPath();g.moveTo(x-5,y-3);g.lineTo(x,y+5);g.lineTo(x+5,y-3);g.fill();g.fillStyle=OUT;g.textAlign='center';g.textBaseline='middle';g.fillText(t,x,y-13,w-10);g.textBaseline='alphabetic';}
function nameTag(c,x,y){g.font='bold 11px '+FONT;g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(c.name,x,y);g.fillStyle=c.ghost?'rgba(255,255,255,.55)':'#fff';g.fillText(c.name,x,y);}
function drawParade(e){const x=e.x,y=395;g.save();g.translate(x,y);g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,18,110,10,0,0,6.283);g.fill();
 g.fillStyle='#6b2aa0';g.strokeStyle=OUT;g.lineWidth=3;rr(-100,-10,200,26,6);g.fill();g.stroke();[-70,70].forEach(wx=>{g.fillStyle='#222';g.strokeStyle=OUT;g.beginPath();g.arc(wx,18,11,0,6.283);g.fill();g.stroke();g.strokeStyle='#888';g.beginPath();g.moveTo(wx,18);g.lineTo(wx+Math.cos(e.t*6)*9,18+Math.sin(e.t*6)*9);g.stroke();});
 const bb=Math.abs(Math.sin(e.t*4))*6;pumpkin(0,-50-bb,42,true,true);g.save();g.translate(0,-96-bb);g.scale(2.6,2.6);g.translate(0,33);drawHat('crown');g.restore();
 g.fillStyle='#ffdf3a';g.font='bold 14px '+FONT;g.textAlign='center';g.fillText('ALL HAIL THE PUMPKIN KING',0,8);g.restore();
 for(let i=0;i<4;i++){const cx=x-150-i*50;if(cx>-40&&cx<W+40)drawCrewmate({color:COLORS[(i*3+4)%COLORS.length][1],face:1,sq:0,hat:'party',walk:e.t*10+i,state:'walk',id:90+i},cx,410,{walk:true,emote:null});}}
/* render */
let darkC=null,darkX=null;
function glow(x,y,r,col,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col.replace('A',a.toFixed(3)));gr.addColorStop(1,col.replace('A','0'));g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
function render(){g.setTransform(scaleK,0,0,scaleK,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.save();
 if(S.shake>0)g.translate(R(-4,4)*S.shake*3,R(-4,4)*S.shake*3);
 if(bg)g.drawImage(bg,0,0,W,H);
 S.bats.forEach(b=>{g.save();g.translate(b.x,b.y);g.scale(b.vx>0?1:-1,1);g.fillStyle='#0a0612';const f=Math.sin(b.ph)*8;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-8,-6-f,-16,-2-f);g.quadraticCurveTo(-10,0,-8,3);g.quadraticCurveTo(-4,1,0,4);g.quadraticCurveTo(4,1,8,3);g.quadraticCurveTo(10,0,16,-2-f);g.quadraticCurveTo(8,-6-f,0,0);g.fill();g.restore();});
 drawStations();
 const list=[];S.bodies.forEach(b=>list.push({y:b.y,d:()=>drawBody(b)}));
 S.crew.forEach(c=>{if(c.hidden||(c.dead&&!c.ghost))return;list.push({y:c.y,d:()=>{if(c.ghost)drawGhost(c,c.x,c.y);else{const sc=c.spawnT>0?Math.max(.05,easeBack(1-c.spawnT)):1;if(sc!==1){g.save();g.translate(c.x,c.y);g.scale(sc,sc);g.translate(-c.x,-c.y);}drawCrewmate(c,c.x,c.y);drawProp(c);if(sc!==1)g.restore();}}});});
 list.push({y:548,d:drawTree});list.push({y:HAUNT.base,d:()=>{if(hh)g.drawImage(hh,0,0,W,H);}});
 S.events.forEach(e=>{if(e.type==='parade'&&e.life)list.push({y:420,d:()=>drawParade(e)});});
 list.sort((a,b)=>a.y-b.y);list.forEach(o=>o.d());
 g.save();g.globalCompositeOperation='lighter';const fl=.85+Math.sin(S.time*9)*.08+Math.sin(S.time*23)*.05;
 if(S.lights)LAMPS.forEach(l=>{glow(l.x+15,l.y-98,40,'rgba(255,230,160,A)',.7*fl);g.fillStyle='rgba(255,220,140,.06)';g.beginPath();g.moveTo(l.x+8,l.y-98);g.lineTo(l.x+22,l.y-98);g.lineTo(l.x+70,l.y+50);g.lineTo(l.x-40,l.y+50);g.fill();glow(l.x+15,l.y+30,90,'rgba(255,210,120,A)',.12);});
 STATIONS.forEach(s=>{if(s.type==='carve'&&s.done)glow(s.px,s.py,38,'rgba(255,150,40,A)',.45*fl);if(s.type==='light'&&s.done)glow(s.lx,s.ly,45,'rgba(255,240,170,A)',.5);if(s.type==='candle'&&s.done)glow(s.cx+14,s.cy,30,'rgba(255,170,60,A)',.5*fl);});
 HOUSES.forEach(h=>{glow(h.x+57,187,36,'rgba(255,180,80,A)',.18*fl);glow(h.x+193,187,36,'rgba(255,180,80,A)',.18*fl);});
 glow(1050,560,120,'rgba(125,255,154,A)',.08+.05*Math.sin(S.time*1.3));
 S.events.forEach(e=>{if(e.type==='parade'&&e.life)glow(e.x,345,120,'rgba(255,150,40,A)',.35*fl);});
 g.restore();
 S.fog.forEach(f=>{g.save();g.translate(f.x,f.y);g.scale(1,.35);const gr=g.createRadialGradient(0,0,0,0,0,f.r);gr.addColorStop(0,'rgba(190,200,230,'+f.a+')');gr.addColorStop(1,'rgba(190,200,230,0)');g.fillStyle=gr;g.fillRect(-f.r,-f.r,f.r*2,f.r*2);g.restore();});
 if(!S.lights){if(!darkC){darkC=document.createElement('canvas');darkC.width=W;darkC.height=H;darkX=darkC.getContext('2d');}const d=darkX;d.globalCompositeOperation='source-over';d.clearRect(0,0,W,H);d.fillStyle='rgba(3,2,10,.9)';d.fillRect(0,0,W,H);d.globalCompositeOperation='destination-out';
  S.crew.forEach(c=>{if(c.dead||c.hidden)return;const fy=c.y-18,fx=c.x+(c.face||1)*10;let gr=d.createRadialGradient(c.x,fy,0,c.x,fy,46);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=gr;d.beginPath();d.arc(c.x,fy,46,0,6.283);d.fill();
   const a=(c.face||1)>0?0:Math.PI;gr=d.createRadialGradient(fx,fy,0,fx,fy,150);gr.addColorStop(0,'rgba(0,0,0,.75)');gr.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=gr;d.beginPath();d.moveTo(fx,fy);d.arc(fx,fy,150,a-.42,a+.42);d.closePath();d.fill();});
  d.globalCompositeOperation='source-over';g.drawImage(darkC,0,0,W,H);
  g.save();g.globalCompositeOperation='lighter';S.crew.forEach(c=>{if(c.dead||c.hidden)return;const fx=c.x+(c.face||1)*10,fy=c.y-18,a=(c.face||1)>0?0:Math.PI;const gr=g.createRadialGradient(fx,fy,0,fx,fy,150);gr.addColorStop(0,'rgba(255,240,180,.16)');gr.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=gr;g.beginPath();g.moveTo(fx,fy);g.arc(fx,fy,150,a-.42,a+.42);g.closePath();g.fill();});g.restore();}
 S.crew.forEach(c=>{if(c.hidden||(c.dead&&!c.ghost))return;const s=depth(c.y),top=c.y-(c.ghost?64:44)*s-(c.hat!=='none'&&!c.ghost?10*s:0);
  if(!c.ghost||S.lights)nameTag(c,c.x,c.y+15*s);if(c.state==='task'&&c.task)drawBar(c.x,top-4,40,clamp(c.tt/c.task.dur,0,1));if(c.say)bubble(c.x,top-(c.state==='task'?8:0),c.say);});
 drawParts();
 S.floats.forEach(f=>{const a=clamp(f.life/f.max*1.5,0,1),sc=1+(1-clamp((f.max-f.life)*6,0,1))*.6;g.save();g.globalAlpha=a;g.translate(f.x,f.y);g.scale(sc,sc);g.font=f.size+'px '+SPOOK;g.textAlign='center';g.lineWidth=5;g.strokeStyle=OUT;g.strokeText(f.t,0,0);g.fillStyle=f.col;g.fillText(f.t,0,0);g.restore();});
 if(S.flash>0){g.fillStyle='rgba(0,0,0,'+clamp(S.flash,0,1)+')';g.fillRect(0,0,W,H);}
 g.restore();
 if(SHOWHUD&&S.phase!=='season')drawHUD();
 if(S.phase==='intro')drawIntro();else if(S.phase==='meeting')drawMeeting();else if(S.phase==='eject')drawEject();else if(S.phase==='victory')drawVictory();else if(S.phase==='season')drawSeason();
 if(cmdBox.open)drawCmdBox();}
function drawParts(){S.parts.forEach(p=>{g.globalAlpha=clamp(p.life/p.max,0,1);g.fillStyle=p.c;if(p.k==='star')star(p.x,p.y,p.r+1);
 else if(p.k==='candy'){g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillRect(-p.r,-p.r*.55,p.r*2,p.r*1.1);g.beginPath();g.moveTo(-p.r,0);g.lineTo(-p.r*1.8,-p.r*.6);g.lineTo(-p.r*1.8,p.r*.6);g.closePath();g.moveTo(p.r,0);g.lineTo(p.r*1.8,-p.r*.6);g.lineTo(p.r*1.8,p.r*.6);g.closePath();g.fill();g.restore();}
 else{g.beginPath();g.arc(p.x,p.y,p.r,0,6.283);g.fill();}});g.globalAlpha=1;}
function panel(x,y,w,h){g.fillStyle='rgba(10,5,15,.78)';g.strokeStyle='rgba(255,140,30,.55)';g.lineWidth=2;rr(x,y,w,h,12);g.fill();g.stroke();}
function txt(t,x,y,size,col,align,font,stroke){g.font=(font===SPOOK?'':'bold ')+size+'px '+(font||FONT);g.textAlign=align||'left';if(stroke){g.lineWidth=stroke;g.strokeStyle=OUT;g.lineJoin='round';g.strokeText(t,x,y);}g.fillStyle=col||'#fff';g.fillText(t,x,y);}
function drawHUD(){
 panel(14,12,430,62);g.font='bold 13px '+FONT;g.textAlign='left';g.fillStyle='#ffb15c';g.fillText('TOTAL TASKS COMPLETED',26,32);
 const p=clamp(S.tasks/S.goal,0,1);g.fillStyle='#0a1f10';rr(26,40,404,16,8);g.fill();const gr=g.createLinearGradient(26,0,430,0);gr.addColorStop(0,'#2fa84a');gr.addColorStop(1,'#7dff9a');g.fillStyle=gr;rr(26,40,Math.max(12,404*p),16,8);g.fill();
 g.fillStyle='rgba(255,255,255,.3)';rr(30,42,Math.max(6,396*p),5,3);g.fill();g.strokeStyle='#000';g.lineWidth=2;rr(26,40,404,16,8);g.stroke();
 g.font='bold 12px '+FONT;g.textAlign='right';g.fillStyle='#fff';g.fillText(Math.round(p*100)+'%',430,32);
 panel(14,80,340,28);g.font='bold 13px '+FONT;g.textAlign='left';g.fillStyle='#f3e6d8';g.fillText('👥 crew '+S.crew.length+'/'+MAXCREW+'   👻 ghosts '+S.kills+'/'+S.killGoal+(S.impBoost>0?'   😈 IMPOSTOR HYPED':''),26,99);
 panel(W-300,12,286,62);g.fillStyle='#d0142a';rr(W-288,22,56,20,5);g.fill();g.fillStyle='#fff';g.font='900 12px '+FONT;g.textAlign='center';g.fillText((Math.floor(S.time*1.5)%2?'● ':'○ ')+'LIVE',W-260,36);
 g.textAlign='left';g.font='bold 18px '+FONT;g.fillStyle='#ffb15c';g.fillText((S.finale?'FINALE · ':'')+'ROUND '+S.round,W-222,38);
 g.font='bold 13px '+FONT;g.fillStyle='#7dff9a';g.fillText('CREW '+S.crewWins,W-288,64);g.fillStyle='#aaa';g.fillText('vs',W-215,64);g.fillStyle='#ff5a5a';g.fillText('IMPOSTOR '+S.impWins,W-192,64);
 if(!S.lights&&S.phase==='play'){g.globalAlpha=.6+.4*Math.sin(S.time*8);panel(W/2-170,14,340,36);txt('⚠ LIGHTS SABOTAGED ⚠',W/2,40,22,'#ff5a5a','center',SPOOK);g.globalAlpha=1;}
 if(S.dance>0&&S.phase==='play'){g.save();g.translate(W/2,92);g.rotate(Math.sin(S.time*8)*.05);txt('💃 DANCE BREAK 💃',0,0,34,'#ff4fa3','center',SPOOK,6);g.restore();}
 const items=S.feed.slice(-5);if(items.length){const h=items.length*22+14;panel(14,H-h-14,520,h);g.font='13px '+FONT;g.textAlign='left';items.forEach((f,i)=>{g.globalAlpha=clamp(1.4-(S.time-f.at)/40,.5,1);g.fillStyle=i===items.length-1?'#fff':'#e9d8c6';g.fillText(f.t,26,H-h-14+24+i*22,496);});g.globalAlpha=1;}
 txt('hallowpeen.com',W-18,H-38,28,'#ff8c1a','right',SPOOK,5);g.font='11px '+FONT;g.textAlign='right';g.fillStyle='rgba(255,255,255,.75)';g.fillText(S.status,W-18,H-18);}
function cardCrew(c,x,y,s,o){drawCrewmate(c,x,y,Object.assign({s,walk:false,noShadow:true,emote:null},o||{}));}
function drawIntro(){const t=S.pt;const a=clamp(t*3,0,1)*clamp((3.4-t)*3,0,1);g.save();g.globalAlpha=a;g.fillStyle='rgba(0,0,0,.85)';g.fillRect(0,0,W,H);
 txt(S.finale?'🎆 HALLOWEEN NIGHT FINALE 🎆':'ROUND '+S.round,W/2,190,S.finale?66:84,'#ff8c1a','center',SPOOK,8);
 const n=imps().length;txt('Shhh! There '+(n>1?'are ':'is ')+n+' Impostor'+(n>1?'s':'')+' among us',W/2,255,30,'#ff5a5a','center');
 const cs=S.crew.slice(0,14);cs.forEach((c,i)=>{const off=i-(cs.length-1)/2,x=W/2+off*76,y=480+Math.abs(off)*-4;const pop=clamp((t-.3-i*.06)*4,0,1);if(pop>0)cardCrew(c,x,y+(1-pop)*40,2*easeBack(pop));});
 txt(S.crew.length+' crewmates in the neighborhood'+(S.finale?' · fireworks at the end 🎆':''),W/2,560,20,'#f3e6d8','center');g.restore();}
function drawMeeting(){const m=S.meet,t=S.pt;
 if(t<1.8){const k=clamp(t*4,0,1);g.fillStyle='rgba(120,0,0,'+(.8*k)+')';g.fillRect(0,0,W,H);g.save();g.translate(W/2,H/2);g.rotate(t*.6);for(let i=0;i<16;i++){g.rotate(Math.PI/8);g.fillStyle=i%2?'rgba(255,60,40,.5)':'rgba(255,170,40,.35)';g.beginPath();g.moveTo(0,0);g.lineTo(900,-130);g.lineTo(900,130);g.fill();}g.restore();
  const sc=easeBack(clamp(t*2.5,0,1));g.save();g.translate(W/2,H/2-60);g.scale(sc,sc);g.rotate(Math.sin(t*20)*.03);txt(m.body?'DEAD BODY REPORTED':'EMERGENCY MEETING!',0,0,92,'#fff','center',SPOOK,10);g.restore();
  m.by.sq=Math.sin(t*14)*.12;cardCrew(m.by,W/2,H/2+190,3.6);return;}
 g.fillStyle='rgba(4,2,12,.9)';g.fillRect(0,0,W,H);panel(40,30,W-80,H-60);
 txt(m.body?'🚨 '+m.body+"'s body was found":'🚨 Who is the impostor?',70,80,38,'#ff8c1a','left',SPOOK);
 const cols=5,cw=136,rows=Math.ceil(S.crew.length/cols),ch=Math.min(104,540/rows);const vt=1.8+m.lines.length*.75,reveal=t>vt+.5;
 S.crew.forEach((c,i)=>{const x=64+(i%cols)*cw,y=100+Math.floor(i/cols)*ch;const ej=m.ej===c&&t>vt+2.5;g.fillStyle=c.dead?'rgba(60,60,70,.45)':ej?'rgba(255,60,60,.25)':'rgba(255,255,255,.08)';rr(x,y,cw-10,ch-8,10);g.fill();
  g.save();if(c.dead)g.globalAlpha=.4;const sc=Math.min(1.15,ch/88);cardCrew(c,x+24,y+ch-14,sc,{dead:c.dead});g.restore();
  g.font='bold 12px '+FONT;g.textAlign='left';g.fillStyle='#fff';g.fillText(c.name,x+46,y+20,cw-58);
  if(c.dead){g.fillStyle='#ff8a8a';g.fillText('👻 ghost',x+46,y+38);}
  else if(m.by===c){g.fillStyle='#ffdf3a';g.font='bold 10px '+FONT;g.fillText(m.body?'📣 reported':'📣 called it',x+46,y+36);}
  if(reveal&&!c.dead){const vs=Object.keys(m.votes).filter(k=>m.votes[k]===String(c.id));vs.forEach((vid,j)=>{const v=S.crew.find(o=>String(o.id)===vid);if(!v)return;const p=clamp((t-vt-.5)*3-j*.3,0,1);if(p<=0)return;g.fillStyle=v.color;g.strokeStyle=OUT;g.lineWidth=1.5;g.beginPath();g.arc(x+52+(j%7)*11,y+ch-24-Math.floor(j/7)*11,4.5*easeBack(p),0,6.283);g.fill();g.stroke();});}
  else if(!c.dead&&t>2.6+(i%7)*.9){g.fillStyle='#7dff9a';g.font='bold 10px '+FONT;g.fillText('VOTED ✔',x+46,y+ch-16);}});
 const cx=W-470,cy=100;g.fillStyle='rgba(255,255,255,.06)';rr(cx,cy,410,H-170,12);g.fill();
 const shown=m.lines.slice(0,m.shown).slice(-8);shown.forEach(([sp,tx],i)=>{const y=cy+14+i*58;const isNew=i===shown.length-1;const pop=isNew?clamp(((S.pt-1.8)%.75)*6,0,1):1;g.save();g.globalAlpha=pop;g.translate((1-pop)*20,0);
  cardCrew(sp,cx+24,y+42,.85,{dead:false});g.fillStyle='#f3e6d8';rr(cx+46,y,350,48,10);g.fill();g.fillStyle=shade(sp.color,-.2);g.font='bold 12px '+FONT;g.textAlign='left';g.fillText(sp.name+(sp.dead?' (ghost)':''),cx+56,y+16);g.fillStyle='#1a0d14';g.font='14px '+FONT;g.fillText(tx.length>44?tx.slice(0,43)+'…':tx,cx+56,y+35,334);g.restore();});
 g.font='bold 16px '+FONT;g.textAlign='left';g.fillStyle='#ffb15c';
 if(reveal){g.fillText('SKIPPED: '+(m.tally.skip||0),64,H-48);if(t>vt+2.5)txt(m.ej?(m.ej.name+' got the most votes ('+m.tally[String(m.ej.id)]+')'):(m.tie?'Tie vote. Nobody ejected.':'Skipped. Nobody ejected.'),430,H-48,22,'#fff','center','',4);}
 else g.fillText('Voting ends in: '+Math.max(0,Math.ceil(vt+.5-t))+'s',64,H-48);}
function drawEject(){const m=S.meet,t=S.pt;g.fillStyle='#05030e';g.fillRect(0,0,W,H);seed=99;
 for(let i=0;i<160;i++){const bx=srand()*W*1.5,sp=60+srand()*300,yy=srand()*H,al=.3+srand()*.7;const sx=((bx-t*sp)%(W*1.5)+W*1.5)%(W*1.5)-W*.25;g.fillStyle='rgba(255,255,255,'+al+')';g.fillRect(sx,yy,2+sp/150,2);}
 g.fillStyle='#fff2c8';g.beginPath();g.arc(W*.8,H*.28,60,0,6.283);g.fill();
 g.fillStyle='#0f0819';g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=80){g.lineTo(x,H-60-((x/80)%2)*40);g.lineTo(x+40,H-110-((x/80)%3)*20);}g.lineTo(W,H);g.fill();
 if(m.ej){const p=clamp(t/4.5,0,1);const x=lerp(-80,W+80,p),y=H*.42-Math.sin(p*Math.PI)*60;g.save();g.translate(x,y);g.rotate(t*3);cardCrew(m.ej,0,20,3);g.restore();
  txt('🎃 PUMPKIN CATAPULT ENGAGED 🎃',W/2,80,22,'#ffb15c','center');}
 const msg=m.ej?(m.ej.name+(m.ej.imp?' was The Impostor.':' was not The Impostor.')):(m.tie?'No one was ejected. (Tie)':'No one was ejected. (Skipped)');
 const n=Math.floor(clamp((t-.6)*18,0,msg.length));txt(msg.slice(0,n),W/2,H/2+120,42,'#fff','center');
 if(t>3.2){const ri=imps().filter(c=>!c.dead&&c!==m.ej).length;txt(m.ej&&m.ej.imp&&ri===0?'GG. The cake was a lie. 🎂':(ri+' Impostor'+(ri===1?' remains':'s remain')+' 👀'),W/2,H/2+170,24,'#ffb15c','center');}}
function drawVictory(){const w=S.win,t=S.pt,crew=w.who==='crew';g.fillStyle=crew?'rgba(2,10,24,.92)':'rgba(30,0,0,.92)';g.fillRect(0,0,W,H);
 const gr=g.createRadialGradient(W/2,H*.62,20,W/2,H*.62,520);gr.addColorStop(0,crew?'rgba(80,160,255,.35)':'rgba(255,40,40,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
 if(crew&&S.parts.length<300&&Math.random()<.7)S.parts.push({x:R(0,W),y:-10,vx:R(-40,40),vy:R(60,160),g:60,life:4,max:4,c:pick(['#7dff9a','#ffdf3a','#ff8a1f','#5ec8ff','#ff4fa3']),r:R(3,6),k:'candy',rot:R(0,6)});
 drawParts();
 const sc=easeBack(clamp(t*1.6,0,1));g.save();g.translate(W/2,160);g.scale(sc,sc);txt(crew?'VICTORY':'DEFEAT',0,0,124,crew?'#5ec8ff':'#ff3b3b','center',SPOOK,10);g.restore();
 txt(crew?'CREW WINS 🎃':'IMPOSTOR WINS 😈',W/2,222,34,'#fff','center');txt(w.reason,W/2,258,20,'#ffb15c','center');
 const winners=crew?S.crew.filter(c=>!c.imp):S.crew.filter(c=>c.imp);const ws=winners.slice(0,11);
 ws.forEach((c,i)=>{const off=i-(ws.length-1)/2;const x=W/2+off*(crew?100:220),y=crew?560:575;const hop=Math.abs(Math.sin(t*5+i))*14;
  if(c.dead&&!c.imp){drawGhost(c,x,y-30,2.2);}else{c.sq=Math.sin(t*10+i)*.08;cardCrew(c,x,y-hop,crew?2.4:3.6,{smirk:!crew,emote:crew?null:(Math.floor(t)%2?'twerk':null)});}
  txt(c.name,x,y+(crew&&i%2?48:30),crew?13:18,'#fff','center','',3);});
 txt((w.imps.length>1?w.imps.join(' & ')+' were':w.imps[0]+' was')+' The Impostor'+(crew?'':'. Absolutely sus.'),W/2,645,22,'#ff8a8a','center');
 txt(S.finale?'Season finale wrapping up…':'Next round in '+Math.max(0,Math.ceil(8-t))+'…',W/2,690,18,'#aaa','center');}
function drawSeason(){const t=S.pt;g.fillStyle='rgba(5,2,15,.9)';g.fillRect(0,0,W,H);drawParts();
 const sc=easeBack(clamp(t*1.2,0,1));g.save();g.translate(W/2,170);g.scale(sc,sc);txt('SEASON 1 COMPLETE',0,0,100,'#ff8c1a','center',SPOOK,10);g.restore();
 txt('Happy Halloween from the HallowPeen crew 🎃',W/2,240,28,'#fff','center');
 [['Rounds played',S.round],['Crew wins',S.crewWins],['Impostor wins',S.impWins],['Crewmates moved in',S.movedIn]].forEach(([k,v],i)=>{const x=W/2+(i-1.5)*250;panel(x-110,290,220,110);txt(String(v),x,362,58,'#7dff9a','center',SPOOK);txt(k,x,388,15,'#f3e6d8','center');});
 const cs=S.crew.slice(0,25);cs.forEach((c,i)=>{const x=60+i*(1160/Math.max(1,cs.length-1)),y=590;c.sq=Math.sin(t*8+i)*.1;cardCrew(c,x,y-Math.abs(Math.sin(t*4+i*.5))*16,1.7,{emote:'dance'});});
 txt('Stay sus. 👀  hallowpeen.com',W/2,675,24,'#ffb15c','center');}
/* command box (host mode / OBS "Interact") */
const cmdBox={open:false,val:'',msg:''};
function drawCmdBox(){panel(W/2-260,H/2-50,520,100);g.font='bold 13px '+FONT;g.textAlign='left';g.fillStyle='#ffb15c';g.fillText('chat command: !vent !meeting !sabotage !candy !dance !parade !spawn name',W/2-240,H/2-24,480);
 g.fillStyle='#000';rr(W/2-240,H/2-12,480,34,8);g.fill();g.font='18px '+FONT;g.fillStyle='#fff';g.fillText(cmdBox.val+(Math.floor(S.time*2)%2?'▍':''),W/2-228,H/2+11);
 g.font='12px '+FONT;g.fillStyle='#7dff9a';g.fillText(cmdBox.msg||'Enter = run · Esc = close',W/2-240,H/2+40);}
function showCmdResult(r){cmdBox.msg=r;const el=document.getElementById('cmdOut');if(el)el.textContent=r;}
if(HOST){addEventListener('keydown',e=>{const tag=(e.target&&e.target.tagName)||'';if(/INPUT|TEXTAREA|SELECT/.test(tag))return;
 if(cmdBox.open){if(e.key==='Escape')cmdBox.open=false;else if(e.key==='Enter'){showCmdResult(command(cmdBox.val,'host'));cmdBox.val='';}else if(e.key==='Backspace')cmdBox.val=cmdBox.val.slice(0,-1);else if(e.key.length===1&&cmdBox.val.length<40)cmdBox.val+=e.key;e.preventDefault();return;}
 if(e.key==='/'||e.key==='Enter'||e.key==='!'){cmdBox.open=true;cmdBox.val=e.key==='!'?'!':'';cmdBox.msg='';e.preventDefault();return;}
 if(e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const map={V:'vent',M:'meeting',S:'sabotage',C:'candy',D:'dance',P:'parade',N:'spawn'};const k=map[(e.key||'').toUpperCase()];if(k){showCmdResult(command('!'+k,'hotkey'));e.preventDefault();}}});}
/* optional local WebSocket chat bridge: ?ws=ws://localhost:PORT (localhost only). Accepts "!cmd" text, or JSON {"cmd":"!candy","user":"x"} / {"comment":"!vent","nickname":"x"} / {"name":"Steve"} */
(function(){const u=qs.get('ws');if(!u||!/^wss?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/[^\s]*)?$/i.test(u))return;let tries=0;
 function go(){let ws;try{ws=new WebSocket(u);}catch(e){return;}ws.onopen=()=>{tries=0;feed('🔌 chat bridge connected');};
  ws.onmessage=ev=>{try{const d=typeof ev.data==='string'?ev.data:'';let user='chat',cmd=null,name=null;
   if(d.trim().charAt(0)==='{'){const j=JSON.parse(d);const x=j.data&&typeof j.data==='object'?j.data:j;cmd=x.cmd||x.command||x.comment||x.text||x.message||null;user=x.user||x.nickname||x.uniqueId||x.username||'chat';name=x.name||null;}else cmd=d;
   if(name){const r=cleanName(name);if(r.ok){queueName(r.name);feed('📝 name queued: '+r.name);}}
   if(cmd&&/^\s*!/.test(String(cmd))){const r=command(String(cmd),user);if(!/^ok/.test(r))showCmdResult(r);}}catch(e){}};
  ws.onclose=()=>{if(tries++<30)setTimeout(go,Math.min(30000,2000*tries));};ws.onerror=()=>{};}
 go();})();
/* trades via DexScreener public API (approximate: diffs txn counters between polls) */
let CA=(qs.get('ca')||'GcbPZkV2HqcztPjFVTwFquKncdUwwoZGJSJXrHXSpump').trim();if(CA&&!/^[1-9A-HJ-NP-Za-km-z]{32,48}$/.test(CA))CA='';
let prev=null,pollTimer=null,failN=0;
async function findCA(){if(CA)return;try{const r=await fetch('../',{cache:'no-cache'});if(!r.ok)return;const t=await r.text();const m=t.match(/const\s+CA\s*=\s*["']([1-9A-HJ-NP-Za-km-z]{32,48})["']/);if(m)CA=m[1];}catch(e){}}
async function poll(){if(DEMO||document.hidden)return;if(!CA){S.status='Pre-launch: chill neighborhood vibes. Buys go live when $HPEEN launches';return;}
 let ctl=null,to=null;try{ctl=typeof AbortController!=='undefined'?new AbortController():null;to=setTimeout(()=>{if(ctl)ctl.abort();},12000);
  const r=await fetch('https://api.dexscreener.com/tokens/v1/solana/'+encodeURIComponent(CA),{signal:ctl?ctl.signal:undefined,cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);
  const j=await r.json();const pairs=Array.isArray(j)?j:(j&&Array.isArray(j.pairs)?j.pairs:[]);
  if(!pairs.length){S.status='Live: waiting for the first trade on DexScreener 👀';failN=0;return;}
  let b24=0,s24=0,b5=0,s5=0,b1=0,s1=0,vol=0,mc=0;pairs.forEach(p=>{const t=(p&&p.txns)||{};b1+=(t.h1&&+t.h1.buys)||0;s1+=(t.h1&&+t.h1.sells)||0;b24+=(t.h24&&+t.h24.buys)||0;s24+=(t.h24&&+t.h24.sells)||0;b5+=(t.m5&&+t.m5.buys)||0;s5+=(t.m5&&+t.m5.sells)||0;vol+=(p&&p.volume&&+p.volume.h24)||0;mc=Math.max(mc,(+p.marketCap)||(+p.fdv)||0);});
  const now=Date.now();
  if(prev){const secs=Math.min(600,(now-prev.t)/1000);const sr=x=>{const f=Math.floor(x);return f+(Math.random()<x-f?1:0);};
   let nb=Math.max(b24-prev.b,sr((b5?b5/300:b1/3600)*secs)),ns=Math.max(s24-prev.s,sr((s5?s5/300:s1/3600)*secs));nb=clamp(nb|0,0,30);ns=clamp(ns|0,0,15);
   const dv=Math.max(0,vol-prev.v),avg=(nb+ns)?dv/(nb+ns):0;
   for(let i=0;i<nb;i++)setTimeout(onBuy,Math.random()*POLL_MS*.9);for(let i=0;i<ns;i++)setTimeout(onSell,Math.random()*POLL_MS*.9);
   if(nb>0&&(avg>=750||nb>=12))setTimeout(()=>bigEvent(),2500);}
  prev={b:b24,s:s24,v:vol,t:now};S.mcap=mc;failN=0;S.status='Live from DexScreener · refreshes every ~45s';}
 catch(e){failN++;S.status='📡 Comms sabotaged (data feed down). Retrying… the show goes on';if(failN===1)feed('📡 Comms sabotaged: live trade data is down, retrying');}
 finally{clearTimeout(to);}}
function schedPoll(){clearTimeout(pollTimer);pollTimer=setTimeout(async()=>{try{await poll();}catch(e){}schedPoll();},POLL_MS);}
let demoT=3;function demoTick(dt){if(!DEMO)return;demoT-=dt;if(demoT>0)return;demoT=R(2.5,5);if(Math.random()<.17)onSell();else onBuy();
 S.demoN++;if(S.demoN%11===0)bigEvent(S.demoN%22===0?'parade':'candy');}
/* loop: 30fps cap, pauses when tab hidden */
function resize(){const r=cv.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);const pw=clamp(Math.round((r.width||W)*dpr),640,2560),ph=Math.round(pw*9/16);
 if(cv.width!==pw||cv.height!==ph||!bg){cv.width=pw;cv.height=ph;scaleK=pw/W;renderBG();}}
let lastT=0,running=!document.hidden;
function frame(ts){requestAnimationFrame(frame);if(!running)return;if(!lastT){lastT=ts;return;}const el=ts-lastT;if(el<1000/FPS-3)return;lastT=ts;const dt=Math.min(.1,el/1000)*SPEED;
 const steps=Math.ceil(dt/.1);for(let i=0;i<steps;i++){try{demoTick(dt/steps);update(dt/steps);}catch(e){warn(e);}}try{render();}catch(e){warn(e);}}
document.addEventListener('visibilitychange',()=>{running=!document.hidden;lastT=0;if(running&&!DEMO)poll();});
let rzT=0;addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(safe(resize),150);});
function init(){for(let i=0;i<6;i++)S.bats.push({x:R(0,W),by:R(30,150),y:0,vx:R(25,60)*(Math.random()<.5?-1:1),ph:R(0,6),f:R(14,20),w:R(1,2),o:R(0,6)});
 for(let i=0;i<7;i++)S.fog.push({x:R(-200,W+200),y:R(440,720),r:R(160,280),vx:R(6,18)*(Math.random()<.5?-1:1),a:R(.05,.1)});
 resize();
 if(document.fonts&&document.fonts.load){Promise.race([Promise.all([document.fonts.load('40px Creepster'),document.fonts.load('bold 13px Rubik')]),new Promise(r=>setTimeout(r,2500))]).then(safe(renderBG)).catch(()=>{});}
 newRound(FINALE_PREVIEW);if(DEMO)feed('🧪 DEMO MODE: fake buys & sells every few seconds');requestAnimationFrame(frame);
 if(!DEMO)findCA().then(()=>poll()).then(schedPoll).catch(schedPoll);}
/* page chrome */
function chrome(){const sb=document.getElementById('sndBtn');if(sb){const set=()=>{sb.textContent=SND.isOn()?'🔊 sound: on':'🔇 sound: off, coward';sb.setAttribute('aria-pressed',SND.isOn()?'true':'false');};set();sb.addEventListener('click',()=>{SND.set(!SND.isOn());set();SND.play('boing');});}
 // fullscreen: native (std + webkit) where it works, CSS pseudo-fullscreen fallback for iPhone Safari
 (function(){const fb=document.getElementById('fsBtn'),stg=document.getElementById('stage');if(!fb||!stg)return;
  const D=document,fsEl=()=>D.fullscreenElement||D.webkitFullscreenElement||null;
  const ex=D.createElement('button');ex.type='button';ex.id='fsExit';ex.className='fs-exit';ex.setAttribute('aria-label','Exit fullscreen');ex.textContent='✕ Exit';stg.appendChild(ex);
  const hint=D.createElement('div');hint.className='fs-hint';hint.textContent='↻ turn your phone sideways for the full sus';hint.setAttribute('aria-hidden','true');stg.appendChild(hint);
  const isOn=()=>!!fsEl()||stg.classList.contains('pseudo-fs');
  const sync=()=>{const on=isOn();D.documentElement.classList.toggle('fs-on',on);fb.textContent=on?'✕ Exit fullscreen':'⛶ Fullscreen';fb.setAttribute('aria-pressed',on?'true':'false');setTimeout(safe(resize),60);setTimeout(safe(resize),400);};
  const pseudo=on=>{stg.classList.toggle('pseudo-fs',on);D.documentElement.classList.toggle('fs-lock',on);if(on)scrollTo(0,0);sync();};
  const enter=()=>{const rq=stg.requestFullscreen||stg.webkitRequestFullscreen;if(rq&&(D.fullscreenEnabled||D.webkitFullscreenEnabled)){try{const r=rq.call(stg);if(r&&r.then)r.then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>pseudo(true));return;}catch(e){}}pseudo(true);};
  const exit=()=>{if(stg.classList.contains('pseudo-fs'))pseudo(false);if(fsEl()){try{const x=D.exitFullscreen||D.webkitExitFullscreen;const r=x&&x.call(D);if(r&&r.catch)r.catch(()=>{});}catch(e){}}sync();};
  fb.addEventListener('click',()=>{isOn()?exit():enter();});ex.addEventListener('click',e=>{e.stopPropagation();exit();});
  D.addEventListener('fullscreenchange',sync);D.addEventListener('webkitfullscreenchange',sync);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&stg.classList.contains('pseudo-fs'))pseudo(false);});
  addEventListener('orientationchange',()=>setTimeout(safe(resize),300));
  window.HPFS={on:isOn,enter,exit};})();
 const dl=document.getElementById('demoLink');if(dl&&DEMO){dl.textContent='📡 Real mode';dl.href='./';}
 const nf=document.getElementById('nameForm');if(nf)nf.addEventListener('submit',e=>{e.preventDefault();const inp=document.getElementById('nameIn'),out=document.getElementById('nameOut'),x=document.getElementById('nameShare');const r=cleanName(inp.value);
  if(!r.ok){out.textContent='❌ '+r.why;if(x)x.hidden=true;return;}
  queueName(r.name);
  if(HOST){out.textContent='✅ queued: '+r.name+' (the next new crewmate gets this name)';}
  else{onBuy();out.textContent='✅ '+r.name+' just moved in on YOUR screen. Want it on the stream? Post it with #HPEEN so the host can add it.';
   if(x){x.hidden=false;x.href='https://x.com/intent/tweet?text='+encodeURIComponent('Name my $HPEEN crewmate "'+r.name+'" 🎃👀 #HPEEN https://hallowpeen.com/live/');}}
  inp.value='';});
 const hp=document.getElementById('hostPanel');if(hp&&HOST&&!OBS){hp.hidden=false;const ci=document.getElementById('cmdIn');const cf=document.getElementById('cmdForm');if(cf)cf.addEventListener('submit',e=>{e.preventDefault();showCmdResult(command(ci.value,'host'));ci.value='';});
  hp.querySelectorAll('[data-cmd]').forEach(b=>b.addEventListener('click',()=>showCmdResult(command(b.getAttribute('data-cmd'),'host'))));
  renderQueue=()=>{const q=document.getElementById('nameQ');if(q)q.textContent=nameQ.length?nameQ.join(', '):'(empty)';};renderQueue();
  const cl=document.getElementById('qClear');if(cl)cl.addEventListener('click',()=>{nameQ=[];store.set('nameq',nameQ);renderQueue();});}}
window.HPLIVE={command,state:()=>({phase:S.phase,round:S.round,crew:S.crew.length,tasks:S.tasks,goal:S.goal,kills:S.kills,killGoal:S.killGoal,lights:S.lights,crewWins:S.crewWins,impWins:S.impWins,pending:S.pending.length,parts:S.parts.length,feed:S.feed.map(f=>f.t),status:S.status}),
 test:{buy:()=>onBuy(),sell:onSell,big:bigEvent,
  kill:()=>{const i=imps().find(c=>!c.dead),v=aliveCrew().sort((a,b)=>Math.abs(a.y-500)-Math.abs(b.y-500))[0];if(i&&v&&S.phase==='play'){i.hidden=false;i.venting=0;i.x=v.x-20;i.y=v.y;i.face=1;kill(i,v);}},
  meeting:()=>{const c=aliveCrew().find(o=>!o.ghost);if(c&&S.phase==='play')startMeeting(c,S.bodies[0]||null);},
  win:w=>{if(S.phase==='play')endRound(w||'crew',w==='imp'?'Too many ghosts on the block 👻':'Every porch is decorated. Neighborhood saved 🎃');},
  tasks:n=>addTask(n),finale:()=>{S.finaleNext=true;endRound('crew','Halloween night is HERE 🎆');},sabotage:()=>{const i=imps().find(c=>!c.dead);if(i)sabotage(i);},skip:t=>{S.pt=Math.max(S.pt,t);},calm:()=>{imps().forEach(c=>{c.cd=1e9;c.sab=1e9;});S.meetGap=1e9;S.bodies.forEach(b=>b.t=-1e9);}}};
try{chrome();init();}catch(e){warn(e);}
})();
