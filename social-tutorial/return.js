/* Only a whitelisted guide destination. No remote redirect, account grant or app write. */
(()=>{'use strict';const ids=['org-leader','squadron-leader','flight-lead','element-lead','wingman','recruit','battle-captain','report-manager','party-leader','party-member','app-admin'];
const ok=r=>r==='roles'||r==='discord'||r==='solo'||ids.some(x=>r==='role/'+x);
const q=new URLSearchParams(location.search);let r=q.get('guide');
if(r!==null&&!ok(r))return;
if(r===null){try{r=sessionStorage.getItem('cg-guide-return');}catch{}}
if(!r||!ok(r))return;try{sessionStorage.setItem('cg-guide-return',r);}catch{}
function mount(){if(document.getElementById('cg-guide-return'))return;const box=document.createElement('nav');box.id='cg-guide-return';box.setAttribute('aria-label','Tutorial return');const a=document.createElement('a');a.textContent='Return to guide';a.href='social-tutorial/index.html?resume=1#'+r;const b=document.createElement('button');b.type='button';b.textContent='×';b.setAttribute('aria-label','Dismiss guide return');b.onclick=()=>{box.remove();try{sessionStorage.removeItem('cg-guide-return');}catch{}};box.append(a,b);document.body.append(box);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
