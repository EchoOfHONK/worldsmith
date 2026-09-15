(function(){
 const tip=document.createElement('div');tip.className='tooltip';tip.hidden=true;tip.setAttribute('role','tooltip');document.body.append(tip);let target=null;
 document.addEventListener('pointerover',e=>{const el=e.target.closest('button[title]');if(!el||!el.title)return;target=el;el.dataset.tip=el.title;el.removeAttribute('title');tip.textContent=el.dataset.tip;tip.hidden=false;const r=el.getBoundingClientRect(),right=r.left<75;tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,right?r.right+10:r.left))+'px';tip.style.top=Math.min(innerHeight-tip.offsetHeight-8,right?r.top+5:r.bottom+9)+'px';});
 document.addEventListener('pointerout',e=>{if(!target||target.contains(e.relatedTarget))return;target.title=target.dataset.tip;target=null;tip.hidden=true;});document.addEventListener('pointerdown',()=>tip.hidden=true);document.addEventListener('scroll',()=>tip.hidden=true,true);
})();
