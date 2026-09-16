(function(W){
 function create(text,position,kind='poi',id){return{id:id||'label-'+crypto.randomUUID(),text,position:{...position},anchor:{...position},kind,size:kind==='region'?32:kind==='river'?19:20,rotation:0,color:'#e9ddb4',manual:false,objectId:null};}
 function generate(p){
  p.labels=[];const add=(text,pos,kind,id)=>{const l=create(text,pos,kind,id);p.labels.push(l);return l;};
  for(const r of p.regions)add(r.name,r.position,'region','label-'+r.id);
  for(const o of p.objects)if(o.layer!=='Decorations'&&!['bridge','ford'].includes(o.type)){const l=add(o.name,{x:o.position.x,y:o.position.y+20},'poi','label-'+o.id);l.objectId=o.id;}
  for(const r of p.rivers.slice(0,7)){const pt=r.points[Math.floor(r.points.length*.6)];if(pt)add(r.name,{x:pt.x+16,y:pt.y},'river','label-'+r.id);}
  for(const [biome,text,kind]of [['mountain','СЕДЫЕ ХРЕБТЫ','mountain'],['snow','КОРОНА СЕВЕРА','mountain'],['forest','ШЕПЧУЩАЯ ЧАЩА','forest'],['swamp','ТОПИ ЗАБВЕНИЯ','forest']]){const ids=p.biomes.map((b,i)=>b===biome?i:-1).filter(i=>i>=0);if(ids.length>150){const i=ids[Math.floor(ids.length*.4)];add(text,{x:(i%p.cols)*5,y:Math.floor(i/p.cols)*5},kind,'label-'+biome);}}
  layout(p);
 }
 function layout(p){
  const occupied=p.styling.frame?[{x:33,y:p.height-126,w:p.width*.36,h:93},{x:p.width-155,y:p.height-165,w:135,h:145}]:[];
  // Manual labels remain fixed. Automatic labels try a bounded set of offsets.
  const rank={region:0,poi:1,mountain:2,forest:3,river:4};
  for(const l of [...p.labels].sort((a,b)=>Number(b.manual)-Number(a.manual)||(rank[a.kind]??5)-(rank[b.kind]??5))){
   const width=Math.min(p.width*.5,l.text.length*(l.size*.58+(l.kind==='region'?3:1))),height=l.size*1.7;
   let placed=false;const offsets=l.manual?[[0,0]]:[[0,0],[0,24],[0,-32],[35,15],[-35,15],[0,48],[65,-20],[-65,-20],[0,-90],[0,-145],[-105,0]];
   const anchor=l.manual?l.position:l.anchor||l.position;
   for(const [dx,dy]of offsets){const pos={x:W.model.clamp(anchor.x+dx,width/2+22,p.width-width/2-22),y:W.model.clamp(anchor.y+dy,30,p.height-35)},box={x:pos.x-width/2,y:pos.y-height/2,w:width,h:height};if(!l.manual&&occupied.some(b=>box.x<b.x+b.w+6&&box.x+box.w+6>b.x&&box.y<b.y+b.h+5&&box.y+box.h+5>b.y))continue;l.position=pos;l.hidden=false;occupied.push(box);placed=true;break;}if(!placed)l.hidden=true;
  }
 }
 function hit(p,point,zoom=1){if(!p.layers.Labels.visible)return null;return [...p.labels].reverse().find(l=>visible(l,zoom)&&Math.abs(l.position.x-point.x)<l.text.length*displaySize(l,zoom)*.3&&Math.abs(l.position.y-point.y)<displaySize(l,zoom));}
 function visible(l,zoom=1){if(W.semantic&&!W.semantic.visible(l,zoom))return false;if(l.manual)return true;return !l.hidden;}
 function displaySize(l,zoom=1){return l.manual?l.size:l.size/Math.max(1,Math.pow(zoom,.7));}
 W.labels={create,generate,layout,hit,visible,displaySize};
})(WS);
