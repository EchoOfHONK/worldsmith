(function(W){
 function coastal(p,i){const x=i%p.cols,y=Math.floor(i/p.cols);for(const [dx,dy]of [[-5,0],[5,0],[0,-5],[0,5],[-3,-3],[3,3]]){const j=W.model.index(p,(x+dx)*5,(y+dy)*5);if(p.terrain[j]<p.seaLevel)return true;}return false;}
 function eligible(p,id,i,riverDistance){const d=W.config.objects[id],r=d.placementRules||{},e=p.terrain[i],b=p.biomes[i];return e>=Math.max(p.seaLevel+.02,r.minElevation||0)&&e<=(r.maxElevation??1)&&(!r.coastal||coastal(p,i))&&(!r.nearRiver||riverDistance[i]<3)&&(!d.biomeAffinity?.length||d.biomeAffinity.includes(b));}
 function pick(p,ids,i,rand,riverDistance){const pool=ids.filter(id=>eligible(p,id,i,riverDistance));if(!pool.length)return null;const weights=pool.map(id=>W.config.objects[id].rarity||.1),sum=weights.reduce((a,b)=>a+b,0);let roll=rand()*sum;return pool.find((id,k)=>(roll-=weights[k])<=0)||pool.at(-1);}
 function enrich(p,choose,add,rand,riverDistance){
  const a=p.params;
  if(a.settlements>0)for(let k=0;k<Math.round(a.settlements/35*p.width/1800);k++){const at=choose(i=>p.terrain[i]>.65&&p.terrain[i]<.83,135);if(at)add(k%2?'outpost':'watchtower',at,k%2?'Высокий дозор':'Страж перевала');}
  if(a.settlements>0){for(let k=0;k<Math.round(a.settlements/20*p.width/1800);k++){const at=choose(i=>coastal(p,i)&&p.terrain[i]<.63,115);if(at)add(k%2?'lighthouse':'harbor',at,k%2?'Огонь над проливом':'Тихая гавань');}}
  const groups=[{density:a.ruins/20,ids:['house_ruin','tower_ruin','abandonedtemple','crypt','columns','lostruins'],spacing:125},{density:a.fantasy/25,ids:['magetower','dragonbones','moonmonolith','forgottenlibrary','holyspring','abyssportal','cursedaltar'],spacing:150}];
  for(const g of groups)for(let k=0;k<Math.round(g.density*p.width/1800);k++){const at=choose(i=>g.ids.some(id=>eligible(p,id,i,riverDistance))&&!p.objects.some(o=>W.config.objects[o.type].category==='settlements'&&Math.hypot(o.position.x-(i%p.cols)*5,o.position.y-Math.floor(i/p.cols)*5)<160),g.spacing);if(at){const id=pick(p,g.ids,at.i,rand,riverDistance);if(id)add(id,at,W.config.objects[id].name);}}
  for(const o of p.objects){const r=p.regions[p.regionMap[W.model.index(p,o.position.x,o.position.y)]];if(r&&!o.region){o.region=r.id;o.faction=r.faction;o.color=r.color;}}
 }
 W.placement={coastal,eligible,pick,enrich};
})(WS);
