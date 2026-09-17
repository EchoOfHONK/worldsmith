(function(W){
 // Generation-only art direction. Saved cells and paths remain authoritative after editing.
 const characters={
  ancientForest:{name:'ШЕПЧУЩАЯ ЧАЩА',palette:'#748458',vegetation:'ancient broadleaf',water:'woodland streams',road:'forest trail',poi:['worldtree','shrine']},
  swamp:{name:'ТОПИ ЗАБВЕНИЯ',palette:'#82958a',vegetation:'reeds and dead trees',water:'lowland channels',road:'raised causeway',poi:['lostruins','abandonedtemple']},
  mountainFrontier:{name:'ВОРОНИЙ ПРЕДЕЛ',palette:'#a4aaa0',vegetation:'conifer foothills',water:'headwaters and falls',road:'mountain pass',poi:['castle','watchtower']},
  ruinedBorderland:{name:'СТАРЫЙ ТРАКТ',palette:'#b0a080',vegetation:'broken woodland',water:'valley tributaries',road:'old road',poi:['tower_ruin','cemetery']},
  sacredValley:{name:'ТИХАЯ ДОЛИНА',palette:'#a8b788',vegetation:'groves and glades',water:'springs',road:'pilgrim trail',poi:['monument','temple']},
  wildCoast:{name:'БЕРЕГ СТРАННИКОВ',palette:'#92adb0',vegetation:'windswept woodland',water:'tidal shore',road:'coastal path',poi:['lighthouse','harbor']}
 };
 const clamp=W.model.clamp;
 function create(p){
  const rand=W.random.random(p.seed+'world-layout-v1'),mirror=rand()>.72,variant=Math.floor(rand()*3),bend=(rand()-.5)*.08;
  const at=(x,y)=>({x:clamp((mirror?1-x:x)+(y-.5)*bend,.025,.975)*p.width,y:clamp(y,.025,.975)*p.height});
  const zones=[['ancientForest',.36,.40,.23,.25],['swamp',.20,.69,.20,.28],['mountainFrontier',.75,.25,.23,.25],['ruinedBorderland',.62,.58,.20,.20],['sacredValley',.47,.77,.20,.19],['wildCoast',.23,.17,.22,.20]].map(([character,x,y,rx,ry],i)=>({id:'region-'+i,character,position:at(x+(rand()-.5)*.035,y+(rand()-.5)*.035),radius:{x:rx*p.width,y:ry*p.height}}));
  const ridgePoints=variant===1?[[.45,.08],[.65,.15],[.79,.29],[.84,.49]]:variant===2?[[.60,.07],[.75,.17],[.84,.34],[.85,.55]]:[[.54,.08],[.71,.13],[.84,.25],[.88,.44]];
  const ridges=[{id:'crown',width:p.width*.065,strength:1,points:ridgePoints.map(v=>at(...v))},{id:'southern-spur',width:p.width*.043,strength:.65,points:[[.80,.65],[.71,.79],[.68,.92]].map(v=>at(...v))}];
  const valleys=[{id:'main-valley',width:p.width*.043,points:[[.69,.23],[.64,.36],[.74,.53],[.69,.73],[.55,.98]].map(v=>at(...v))}];
  return{version:1,template:['river-crown','broken-crescent','eastern-wall'][variant],zones,ridges,valleys};
 }
 function distance(x,y,points){let best=Infinity;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1));best=Math.min(best,Math.hypot(x-a.x-dx*t,y-a.y-dy*t));}return best;}
 function sample(layout,x,y){
  let region=0,strongest=-1;const weights=layout.zones.map((z,i)=>{const d=((x-z.position.x)/z.radius.x)**2+((y-z.position.y)/z.radius.y)**2,w=Math.exp(-d*1.5);if(w>strongest){strongest=w;region=i;}return w;});
  let ridge=0,valley=0;for(const r of layout.ridges)ridge=Math.max(ridge,Math.exp(-((distance(x,y,r.points)/r.width)**2))*r.strength);for(const r of layout.valleys)valley=Math.max(valley,Math.exp(-((distance(x,y,r.points)/r.width)**2)));
  return{region,weights,ridge,valley,forest:weights[0],swamp:weights[1],frontier:weights[2],ruined:weights[3],glade:weights[4]};
 }
 function fields(p){const layout=create(p),N=p.terrain.length,result={layout};for(const key of ['ridge','valley','forest','swamp','frontier','ruined','glade','region'])result[key]=new Float32Array(N);for(let y=0;y<p.rows;y++)for(let x=0;x<p.cols;x++){const s=sample(layout,(x+.5)*p.cellSize,(y+.5)*p.cellSize),i=y*p.cols+x;for(const key of ['ridge','valley','forest','swamp','frontier','ruined','glade','region'])result[key][i]=s[key];}return result;}
 function lakes(p,drain){
  const mask=new Uint8Array(p.terrain.length),seen=new Uint8Array(mask.length),wet=W.random.noise(p.seed+'basins-v1');
  if(p.params.humidity<=20)return mask;
  // Decide once for the entire connected depression, never independently per cell.
  for(let source=0;source<mask.length;source++){
   if(seen[source]||p.terrain[source]<=p.seaLevel||drain[source]-p.terrain[source]<.008)continue;
   const cells=[source];seen[source]=1;let depth=0;
   for(let k=0;k<cells.length;k++){const i=cells[k],x=i%p.cols,y=Math.floor(i/p.cols);depth=Math.max(depth,drain[i]-p.terrain[i]);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,j=yy*p.cols+xx;if(xx<0||yy<0||xx>=p.cols||yy>=p.rows||seen[j]||p.terrain[j]<=p.seaLevel||drain[j]-p.terrain[j]<.008)continue;seen[j]=1;cells.push(j);}}
   if(cells.length<6||depth<W.config.generation.lakeDepth||wet(source%p.cols/30,Math.floor(source/p.cols)/30)>p.params.humidity/110)continue;
   for(const i of cells){mask[i]=1;p.terrain[i]=p.seaLevel-.008;}
  }
  return mask;
 }
 function carveValleys(p){
  if(!p.params.rivers)return;
  for(const valley of p.worldLayout.valleys){
   const lengths=valley.points.slice(1).map((b,i)=>Math.hypot(b.x-valley.points[i].x,b.y-valley.points[i].y)),total=lengths.reduce((a,b)=>a+b,0);
   for(let i=0;i<p.terrain.length;i++){
    const x=(i%p.cols+.5)*p.cellSize,y=(Math.floor(i/p.cols)+.5)*p.cellSize;let distance=Infinity,along=0,passed=0;
    for(let k=1;k<valley.points.length;k++){const a=valley.points[k-1],b=valley.points[k],dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)),d=Math.hypot(x-a.x-dx*t,y-a.y-dy*t);if(d<distance){distance=d;along=(passed+t*lengths[k-1])/total;}passed+=lengths[k-1];}
    if(distance>valley.width*1.7)continue;
    const weight=Math.exp(-((distance/(valley.width*.62))**2)),bed=p.seaLevel+.24*(1-along)-.035*along,bank=bed+.11*(distance/valley.width)**1.3;
    p.terrain[i]=clamp(p.terrain[i]*(1-weight)+bank*weight,.015,.97);
   }
  }
 }
 function regions(p,fields){return fields.layout.zones.map(z=>{const rule=characters[z.character];let best=-Infinity,position=z.position;for(let i=0;i<p.terrain.length;i++){if(p.terrain[i]<p.seaLevel+.035)continue;const x=(i%p.cols+.5)*p.cellSize,y=(Math.floor(i/p.cols)+.5)*p.cellSize,score=-(((x-z.position.x)/z.radius.x)**2+((y-z.position.y)/z.radius.y)**2);if(score>best){best=score;position={x:Math.min(p.width-1,x),y:Math.min(p.height-1,y)};}}return{id:z.id,name:rule.name,faction:z.character==='mountainFrontier'?'Дом Ворона':z.character==='sacredValley'?'Хранители долины':'Свободные земли',color:rule.palette,character:z.character,position};});}
 // Score every eligible global cell; a chunk cannot influence landmark selection.
 function site(p,zone,kind,riverDistance,spacing=95){let best=-Infinity,at=null;const noise=W.random.noise(p.seed+'sites-v1');for(let i=0;i<p.terrain.length;i++){const e=p.terrain[i],x=(i%p.cols+.5)*p.cellSize,y=(Math.floor(i/p.cols)+.5)*p.cellSize;if(e<p.seaLevel+.03||e>.83||x<50||y<65||x>p.width-45||y>p.height-40)continue;const d=((x-zone.position.x)/zone.radius.x)**2+((y-zone.position.y)/zone.radius.y)**2;if(d>1.3||p.objects.some(o=>Math.hypot(o.position.x-x,o.position.y-y)<spacing))continue;const b=p.biomes[i];if(['mountain','snow'].includes(b))continue;if(kind==='water'&&['swamp','deadforest','cursed'].includes(b))continue;if(kind==='swamp'&&b!=='swamp')continue;if(kind==='forest'&&!['forest','conifer'].includes(b))continue;const target=kind==='pass'?.71:kind==='swamp'?p.seaLevel+.065:.58,score=-d*2-Math.abs(e-target)*5+(kind==='water'?Math.max(0,1-riverDistance[i]/12)*.7:0)+(noise(x/70,y/70)-.5)*.08;if(score>best){best=score;at={i,pt:{x,y}};}}return at;}
 function validate(layout,p){
  if(layout===undefined)return true;
  const point=v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=0&&v.y>=0&&v.x<=p.width&&v.y<=p.height;
  return !!layout&&layout.version===1&&['river-crown','broken-crescent','eastern-wall'].includes(layout.template)&&Array.isArray(layout.zones)&&layout.zones.length===6&&layout.zones.every(z=>z&&typeof z.id==='string'&&Object.hasOwn(characters,z.character)&&point(z.position)&&z.radius&&Number.isFinite(z.radius.x)&&z.radius.x>0&&z.radius.x<=p.width&&Number.isFinite(z.radius.y)&&z.radius.y>0&&z.radius.y<=p.height)&&['ridges','valleys'].every(key=>Array.isArray(layout[key])&&layout[key].length<=8&&layout[key].every(r=>r&&typeof r.id==='string'&&Number.isFinite(r.width)&&r.width>0&&r.width<=p.width&&Array.isArray(r.points)&&r.points.length>=2&&r.points.length<=20&&r.points.every(point)&&(key!=='ridges'||Number.isFinite(r.strength)&&r.strength>0&&r.strength<=1)));
 }
 function smoothRoute(p,points){
  const dry=(a,b)=>{const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/2);for(let k=0;k<=steps;k++){const t=steps?k/steps:0;if(p.terrain[W.model.index(p,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)]<p.seaLevel)return false;}return true;};
  let out=points.map(pt=>({...pt}));
  for(let pass=0;pass<8;pass++){const next=out.map(pt=>({...pt}));for(let i=1;i<out.length-1;i++){const a=out[i-1],b=out[i],c=out[i+1],pt={x:(a.x+2*b.x+c.x)/4,y:(a.y+2*b.y+c.y)/4};if(dry(next[i-1],pt)&&dry(pt,c))next[i]=pt;}out=next;}
  return out;
 }
 function crossings(p,points,add){
  for(let k=1;k<points.length;k++){const a=points[k-1],b=points[k],dx=b.x-a.x,dy=b.y-a.y;for(const river of p.rivers)for(let j=1;j<river.points.length;j++){
   const c=river.points[j-1],d=river.points[j],ex=d.x-c.x,ey=d.y-c.y,den=dx*ey-dy*ex;if(Math.abs(den)<.00001)continue;
   const t=((c.x-a.x)*ey-(c.y-a.y)*ex)/den,u=((c.x-a.x)*dy-(c.y-a.y)*dx)/den;if(t<0||t>1||u<0||u>1)continue;const pt={x:a.x+dx*t,y:a.y+dy*t};
   if(p.objects.some(o=>['bridge','ford'].includes(o.type)&&Math.hypot(o.position.x-pt.x,o.position.y-pt.y)<45))continue;
   const o=add(river.width>3?'bridge':'ford',{pt},river.width>3?'Мост старого тракта':'Каменный брод');o.rotation=Math.atan2(dy,dx)*180/Math.PI;o.properties.crossingRiver=river.id;
  }}
 }
 function roadside(p,add){
  const major=p.roads.filter(r=>r.kind==='road');if(!major.length)return;
  let placed=0;for(const road of major)for(let k=4;k<road.points.length-4;k+=6){if(placed>=Math.max(1,Math.round(p.width/650)))return;const pt=road.points[k];if(!p.roads.some(r=>r!==road&&distance(pt.x,pt.y,r.points)<22))continue;
   const a=road.points[k-1],b=road.points[k+1],len=Math.hypot(b.x-a.x,b.y-a.y)||1,x=pt.x-(b.y-a.y)/len*24,y=pt.y+(b.x-a.x)/len*24,i=W.model.index(p,x,y);
   if(x<35||y<45||x>p.width-35||y>p.height-35||p.terrain[i]<p.seaLevel+.03||p.terrain[i]>.75||p.objects.some(o=>Math.hypot(o.position.x-x,o.position.y-y)<55))continue;
   const o=add('camp',{pt:{x,y}},'Привал у развилки');o.tags.push('roadside');o.properties.route=road.id;placed++;
  }
 }
 function clearance(p,point,type,scale=1){const b=W.objects.bounds({type,position:point,scale});return !p.objects.some(o=>{if(o.layer==='Decorations'&&!['waterfall','bigwaterfall'].includes(o.type))return false;const a=W.objects.bounds(o);return a.x+a.width>b.x&&a.x<b.x+b.width&&a.y+a.height>b.y&&a.y<b.y+b.height;});}
 W.worldLayout={create,sample,fields,lakes,carveValleys,regions,site,distance,characters,validate,smoothRoute,crossings,roadside,clearance};
})(WS);
