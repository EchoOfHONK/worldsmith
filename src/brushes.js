(function(W){
 function layer(ed){return{terrain:'Terrain',height:'Height',mountain:'Mountains',forest:'Vegetation',water:'Water',river:'Rivers',road:'Roads',biome:W.config.biomes[ed.biome].layer,eraser:ed.eraseLayer,object:W.config.objects[ed.objectType].layer,label:'Labels'}[ed.tool];}
 function paint(ed,pos){const p=ed.project,l=layer(ed);if(!ed.editable(l))return;
  if(ed.brushNoiseSeed!==p.seed){ed.brushNoise=W.random.noise(p.seed+'brush');ed.brushNoiseSeed=p.seed;}const radius=ed.radius,noise=ed.brushNoise;
  if(ed.tool==='eraser'&&['POI','Structures','Decorations'].includes(l)){const removed=p.objects.filter(o=>o.layer===l&&Math.hypot(o.position.x-pos.x,o.position.y-pos.y)<radius);p.objects=p.objects.filter(o=>!removed.includes(o));p.labels=p.labels.filter(v=>!removed.some(o=>o.id===v.objectId));return;}
  if(ed.tool==='eraser'&&l==='Labels'){p.labels=p.labels.filter(o=>Math.hypot(o.position.x-pos.x,o.position.y-pos.y)>radius);return;}
  if(ed.tool==='eraser'&&['Roads','Rivers'].includes(l)){const key=l==='Roads'?'roads':'rivers',result=[];for(const path of p[key]){let segment=[];for(const v of path.points){if(Math.hypot(v.x-pos.x,v.y-pos.y)<radius){if(segment.length>1)result.push({...path,id:path.id+'-'+result.length,points:segment});segment=[];}else segment.push(v);}if(segment.length>1)result.push({...path,id:path.id+'-'+result.length,points:segment});}p[key]=result;return;}

  for(let y=Math.max(0,Math.floor((pos.y-radius)/5));y<Math.min(p.rows,Math.ceil((pos.y+radius)/5));y++)for(let x=Math.max(0,Math.floor((pos.x-radius)/5));x<Math.min(p.cols,Math.ceil((pos.x+radius)/5));x++){
   const distance=Math.hypot((x+.5)*5-pos.x,(y+.5)*5-pos.y)/radius;if(distance>1)continue;const i=y*p.cols+x,old=p.biomes[i],e=p.terrain[i],oldLayer=old==='water'?'Water':W.config.biomes[old]?.layer||'Terrain';
   if(p.layers[oldLayer].locked)continue;const falloff=distance<ed.hardness?1:Math.pow(1-(distance-ed.hardness)/Math.max(.01,1-ed.hardness),1.5),jitter=1-ed.randomization+noise(x*.6,y*.6)*ed.randomization,alpha=falloff*ed.intensity*jitter;
   if(alpha<.01)continue;ed.recordCell?.(i);
   if(['height','terrain','water'].includes(ed.tool)&&(!ed.editable('Height')||p.layers.Water.locked||p.layers.Terrain.locked))continue;
   if(ed.tool==='height'){p.terrain[i]=W.model.clamp(e+alpha*.09*ed.heightDirection);if(p.terrain[i]<p.seaLevel){p.biomes[i]='water';p.forestDensity[i]=0;}else if(old==='water')p.biomes[i]='coast';}
   if(ed.tool==='terrain'){p.terrain[i]=Math.max(e,p.seaLevel+.025+alpha*.04);if(noise(x*.39,y*.39)<alpha*1.8)p.biomes[i]='plain';p.humidity[i]+=(.48-p.humidity[i])*alpha*.25;p.forestDensity[i]*=1-alpha;}
   if(ed.tool==='water'){p.humidity[i]=W.model.clamp(p.humidity[i]+alpha*.15);p.terrain[i]=Math.max(0,e-alpha*.19);if(p.terrain[i]<p.seaLevel){p.biomes[i]='water';p.forestDensity[i]=0;}}
   if(ed.tool==='forest'&&e>=p.seaLevel){p.biomes[i]=['forest','conifer','deadforest','swamp','cursed'].includes(ed.biome)?ed.biome:'forest';p.forestDensity[i]=W.model.clamp(p.forestDensity[i]+alpha*ed.density*.6);}
   if(ed.tool==='mountain'&&e>=p.seaLevel&&alpha>.08){p.biomes[i]=['snow','rocky'].includes(ed.biome)?ed.biome:'mountain';p.forestDensity[i]=0;}
   if(ed.tool==='biome'&&e>=p.seaLevel&&alpha>.09){p.biomes[i]=ed.biome;p.forestDensity[i]=W.config.biomes[ed.biome].layer==='Vegetation'?ed.density:0;}
   if(ed.tool==='eraser'){
    if(['Height','Terrain','Water'].includes(l)&&(p.layers.Height.locked||p.layers.Terrain.locked||p.layers.Water.locked))continue;
    if(l==='Water'&&e<p.seaLevel){p.terrain[i]=p.seaLevel+.025;p.biomes[i]='plain';}
    if(l==='Vegetation'&&oldLayer===l){p.forestDensity[i]=Math.max(0,p.forestDensity[i]-alpha);if(p.forestDensity[i]<.05)p.biomes[i]='plain';}
    if(l==='Mountains'&&oldLayer===l)p.biomes[i]='plain';
    if(['Terrain','Height'].includes(l)){p.terrain[i]=Math.max(p.seaLevel+.03,e-alpha*.08);p.biomes[i]='plain';}
   }
   if(p.terrain[i]!==e&&(Math.abs(e-p.seaLevel)<.08||Math.abs(p.terrain[i]-p.seaLevel)<.08))ed.coastChanged=true;
   if(p.terrain[i]<p.seaLevel)p.regionMap[i]=-1;
   else if(p.regionMap[i]<0&&p.regions.length){let best=0,distance=Infinity;for(let k=0;k<p.regions.length;k++){const r=p.regions[k],d=Math.hypot(r.position.x-x*5,r.position.y-y*5);if(d<distance){distance=d;best=k;}}p.regionMap[i]=best;}
  }
  if(!ed.batchBrush)W.surface?.invalidate(p,{x:pos.x-radius,y:pos.y-radius,width:radius*2,height:radius*2});
 }
 W.brushes={layer,paint};
})(WS);
