/* Local (device-only) leaderboards: Vent Dash top 5 + pumpkin bonks. No network, no names. */
(function(){"use strict";const safe=f=>{try{f()}catch(e){}};const T=s=>window.HPI?HPI.t(s):s;
const get=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const set=(k,v)=>safe(()=>localStorage.setItem(k,JSON.stringify(v)));
const medal=['🥇','🥈','🥉','🎃','🎃'];
function fmt(t){try{return new Date(t).toLocaleDateString(document.documentElement.lang||'en',{month:'short',day:'numeric'})}catch(e){return ''}}
function render(){safe(()=>{const d=document.getElementById('boardDash'),b=document.getElementById('boardBonk');if(!d||!b)return;
  let top=get('hp_dash_top',[]);const best=+get('hp_dash_best',0)||0;if(!top.length&&best)top=[{s:best,d:0}];
  d.innerHTML='';if(!top.length){const li=document.createElement('li');li.className='empty';li.textContent=T('No runs yet. Go dash, crewmate.');d.appendChild(li);}
  top.slice(0,5).forEach((r,i)=>{const li=document.createElement('li');li.innerHTML='<span>'+medal[i]+'</span><b></b><small></small>';li.querySelector('b').textContent=r.s;li.querySelector('small').textContent=r.d?fmt(r.d):'';d.appendChild(li);});
  const tot=+get('hp_bonks',0)||0,combo=+get('hp_bonk_combo',0)||0;b.innerHTML='';
  [[T('Total bonks'),tot],[T('Best 5-second bonk combo'),combo],[T('Bonk rank'),tot>=100?T('Pumpkin Menace'):tot>=30?T('Serial Bonker'):tot>=10?T('Sus Tapper'):T('Innocent (for now)')]].forEach(([k,v])=>{const li=document.createElement('li');li.innerHTML='<span></span><b></b>';li.firstChild.textContent=k;li.lastChild.textContent=v;b.appendChild(li);});});}
// bonk combo tracking (clicks on hero pumpkin within a 5s window)
safe(()=>{const w=document.querySelector('.logo-wrap');if(!w)return;let hits=[];w.addEventListener('click',()=>{const n=Date.now();hits=hits.filter(t=>n-t<5000);hits.push(n);if(hits.length>(+get('hp_bonk_combo',0)||0))set('hp_bonk_combo',hits.length);setTimeout(render,0);});});
addEventListener('hp:board',render);addEventListener('storage',render);render();
window.HPB={render};
})();
