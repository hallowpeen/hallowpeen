/* HallowPeen procedural sound FX. Web Audio only, no audio files. OFF by default. */
(function(){"use strict";
let on=false;try{on=localStorage.getItem('hp_sound')==='on'}catch(e){}
let ctx=null,master=null,last=0,armed=false;
['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>{armed=true;},{capture:true,passive:true}));const lastBy={};
function ensure(){if(ctx)return ctx;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();master=ctx.createGain();master.gain.value=0.25;
  const comp=ctx.createDynamicsCompressor();master.connect(comp);comp.connect(ctx.destination);}catch(e){ctx=null}return ctx;}
function osc(type,f0,f1,dur,vol,t0){const t=ctx.currentTime+(t0||0);const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);
  if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.5,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.05);return o;}
function noise(dur,vol,filt,f0,f1,t0){const t=ctx.currentTime+(t0||0);const n=Math.floor(ctx.sampleRate*dur);const b=ctx.createBuffer(1,n,ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const s=ctx.createBufferSource();s.buffer=b;const f=ctx.createBiquadFilter();f.type=filt||'bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(f0||1000,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.4,t+0.03);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dur+0.05);}
function vib(o,rate,depth,dur){const l=ctx.createOscillator(),g=ctx.createGain();l.frequency.value=rate;g.gain.value=depth;l.connect(g);g.connect(o.frequency);l.start();l.stop(ctx.currentTime+dur+0.05);}
const FX={
 boing(){const o=osc('sine',180,520,0.45,0.6);vib(o,18,60,0.45);},
 squish(){osc('sine',600,140,0.09,0.4);noise(0.06,0.15,'lowpass',2000,400);},
 pop(){osc('triangle',900,1500,0.06,0.35);},
 sparkle(){[1568,2093,2637,3136].forEach((f,i)=>osc('sine',f,f*1.02,0.18,0.18,i*0.045));},
 jiggle(){const o=osc('sawtooth',110,90,0.5,0.25);vib(o,9,25,0.5);const f=ctx.createBiquadFilter();},
 bonk(){osc('square',220,70,0.18,0.35);noise(0.08,0.4,'lowpass',1800,300);osc('sine',90,50,0.25,0.5);},
 beep(){osc('sine',1320,0,0.09,0.25);osc('sine',1760,0,0.09,0.25,0.13);},
 siren(){const o=osc('sawtooth',500,0,1.1,0.22);const t=ctx.currentTime;o.frequency.setValueAtTime(500,t);o.frequency.linearRampToValueAtTime(900,t+0.27);o.frequency.linearRampToValueAtTime(500,t+0.55);o.frequency.linearRampToValueAtTime(900,t+0.82);o.frequency.linearRampToValueAtTime(500,t+1.1);},
 brrt(){for(let i=0;i<5;i++){const o=osc('sawtooth',260+i*30,240+i*30,0.11,0.22,i*0.12);vib(o,30,20,0.6);}},
 ghost(){const o=osc('sine',300,0,1.6,0.3);const t=ctx.currentTime;o.frequency.setValueAtTime(260,t);o.frequency.linearRampToValueAtTime(520,t+0.7);o.frequency.linearRampToValueAtTime(300,t+1.6);vib(o,5,14,1.6);},
 whoosh(){noise(0.45,0.35,'bandpass',300,2400);},
 creak(){const o=osc('sawtooth',70,140,0.9,0.18);vib(o,23,30,0.9);noise(0.9,0.06,'bandpass',900,1300);}
};
const gap={whoosh:5000,siren:1500,ghost:4000,jiggle:600};
function play(name){if(!on||!armed||!FX[name])return;const now=performance.now();if(now-last<150)return;if(gap[name]&&now-(lastBy[name]||0)<gap[name])return;
  if(!ensure())return;if(ctx.state==='suspended'){try{ctx.resume()}catch(e){}}last=now;lastBy[name]=now;try{FX[name]()}catch(e){}}
// toggle UI
function ui(){const b=document.createElement('button');b.type='button';b.className='sound-toggle';const set=()=>{b.textContent=on?'🔊 sound: on':'🔇 sound: off, coward';b.setAttribute('aria-pressed',on?'true':'false');};
  b.setAttribute('aria-label','Toggle sound effects');set();
  b.addEventListener('click',()=>{on=!on;try{localStorage.setItem('hp_sound',on?'on':'off')}catch(e){}set();if(on){ensure();if(ctx&&ctx.state==='suspended')ctx.resume();last=0;play('boing');}});
  document.body.appendChild(b);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui);else ui();
// global hooks
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('button,.btn');if(!t||t.classList.contains('sound-toggle'))return;play(t.matches('.chips button')?'pop':'squish');},{passive:true});
document.addEventListener('pointerenter',e=>{if(e.target.classList&&e.target.classList.contains('logo-wrap'))play('boing');},true);
document.addEventListener('focusin',e=>{if(e.target.classList&&e.target.classList.contains('logo-wrap'))play('boing');});
let ghosted=false;document.addEventListener('pointerdown',()=>{if(!ghosted&&document.body.classList.contains('night')){ghosted=true;setTimeout(()=>play('ghost'),300);}},{passive:true});
window.HPS={play,isOn:()=>on};
})();
