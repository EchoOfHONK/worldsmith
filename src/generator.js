(function(W){
 const {clamp,index}=W.model, {random,noise,fbm}=W.random;
 class Heap {
  constructor(){this.data=[];}
  push(id,h){const a=this.data;let k=a.length;a.push({id,h});while(k){const j=(k-1)>>1;if(a[j].h<=h)break;a[k]=a[j];k=j;}a[k]={id,h};}
  pop(){const a=this.data,top=a[0],last=a.pop();if(a.length){let k=0;while(k*2+1<a.length){let j=k*2+1;if(j+1<a.length&&a[j+1].h<a[j].h)j++;if(a[j].h>=last.h)break;a[k]=a[j];k=j;}a[k]=last;}return top;}
  get length(){return this.data.length;}
 }
 const neighbors=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
 function generate(seed,width,height,preset,parameters,progress=()=>{}){
  const cfg=W.config,p=W.model.create(seed,width,height,preset,parameters||cfg.presets[preset].params),a=p.params;
  const rand=random(seed),n=noise(seed),wet=noise(seed+'rain'),ridge=noise(seed+'ridge'),cols=p.cols,rows=p.rows,N=cols*rows,sea=p.seaLevel;
  const point=i=>({x:Math.min(width-1,(i%cols+.5)*5),y:Math.min(height-1,(Math.floor(i/cols)+.5)*5)});
  progress('Поднимаем материки',12);
  const raw=new Float64Array(N),scale=2.5+a.islands*.06;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const i=y*cols+x,u=x/cols,v=y/rows,wx=u*scale+(wet(u*3,v*3)-.5)*1.15,wy=v*scale+(wet(u*3+19,v*3+19)-.5)*1.15;
   const continent=fbm(n,wx,wy,cfg.generation.noiseOctaves),r=1-Math.abs(fbm(ridge,wx*1.7,wy*1.7,3)*2-1);
   const edge=Math.pow(Math.max(Math.abs(u-.5)*2,Math.abs(v-.5)*2),cfg.generation.edgeFalloff);
   raw[i]=continent+Math.pow(r,7)*a.mountains/280-edge*.52;
  }
  const sorted=Array.from(raw).sort((a,b)=>a-b),cut=sorted[Math.floor(N*(1-clamp(a.landMass/100,.04,.94)))],top=sorted[Math.floor(N*.995)];
  for(let i=0;i<N;i++){
   const e=raw[i]>=cut?sea+(raw[i]-cut)/Math.max(.12,top-cut)*.46:sea+(raw[i]-cut)*1.1;
   p.terrain[i]=Math.round(clamp(e,.015,.97)*10000)/10000;
   const u=i%cols/cols,v=Math.floor(i/cols)/rows;
   p.temperature[i]=clamp(a.temperature/100+.22-Math.abs(v-.6)*.65-Math.max(0,e-.55)*.8+(n(u*4+40,v*4)-.5)*.12);
   p.humidity[i]=clamp(a.humidity/100*.7+fbm(wet,u*5,v*5,3)*.55-.17-Math.max(0,e-.6)*.16);
  }
  progress('Прокладываем реки и озёра',30);
  // Priority flood: every parent is lower on the filled drainage surface.
  const drain=new Float64Array(N),parent=new Int32Array(N).fill(-1),seen=new Uint8Array(N),heap=new Heap(),order=[];
  for(let i=0;i<N;i++)if(p.terrain[i]<sea||i<cols||i>=N-cols||i%cols===0||i%cols===cols-1){seen[i]=1;drain[i]=p.terrain[i];heap.push(i,drain[i]);}
  while(heap.length){const {id,h}=heap.pop();order.push(id);const x=id%cols,y=Math.floor(id/cols);for(const [dx,dy]of neighbors){const xx=x+dx,yy=y+dy,j=yy*cols+xx;if(xx<0||yy<0||xx>=cols||yy>=rows||seen[j])continue;seen[j]=1;drain[j]=Math.max(h+.000001,p.terrain[j]);parent[j]=id;heap.push(j,drain[j]);}}
  const accumulation=new Float64Array(N).fill(1);for(let k=order.length-1;k>=0;k--){const i=order[k];if(parent[i]>=0)accumulation[parent[i]]+=accumulation[i];}
  // Fill coherent basins at a shared water surface rather than punching random holes.
  const lakeMask=new Uint8Array(N);
  if(a.humidity>20)for(let i=0;i<N;i++)if(drain[i]-p.terrain[i]>cfg.generation.lakeDepth&&p.terrain[i]>sea&&wet(i%cols/30,Math.floor(i/cols)/30)<a.humidity/115){lakeMask[i]=1;p.terrain[i]=sea-.008;}
  const riverMask=new Uint8Array(N),sources=[],riverCount=Math.round(a.rivers/3.5*width/1800);
  const candidates=Array.from({length:N},(_,i)=>i).filter(i=>p.terrain[i]>.65&&accumulation[i]>3).sort((i,j)=>(p.terrain[j]+wet(j%cols/11,j/cols/11)*.12)-(p.terrain[i]+wet(i%cols/11,i/cols/11)*.12));
  for(const source of candidates){if(sources.length>=riverCount)break;if(riverMask[source])continue;const s=point(source);if(sources.some(t=>Math.hypot(t.x-s.x,t.y-s.y)<width/15))continue;const points=[];let i=source,end='ocean';for(let k=0;k<N&&i>=0;k++){
    points.push(point(i));if(p.terrain[i]<sea){end=lakeMask[i]?'lake':'ocean';break;}if(riverMask[i]){end='confluence';break;}i=parent[i];
   }
   if(points.length<cfg.generation.riverMinLength)continue;
   // Gentle lowland meanders preserve the exact source, mouth and confluences.
   const original=points.map(pt=>({...pt}));
   for(let k=1;k<points.length-1;k++){const pt=original[k],before=original[k-1],after=original[k+1],dx=after.x-before.x,dy=after.y-before.y,length=Math.hypot(dx,dy)||1,e=p.terrain[index(p,pt.x,pt.y)],bend=(2+(1-e)*15)*Math.sin(k*.11+source*.003)*Math.sin(Math.PI*k/(points.length-1)),candidate={x:clamp(pt.x-dy/length*bend,1,width-1),y:clamp(pt.y+dx/length*bend,1,height-1)};if(p.terrain[index(p,candidate.x,candidate.y)]>=sea)points[k]=candidate;}
   // Incise the rendered channel into the global terrain, not only a filled drainage proxy.
   let bed=p.terrain[index(p,points[0].x,points[0].y)];
   for(let k=1;k<points.length;k++){const j=index(p,points[k].x,points[k].y);bed=Math.min(p.terrain[j],Math.max(sea+.00005,bed-.00002));if(k===points.length-1&&p.terrain[j]<sea)bed=p.terrain[j];p.terrain[j]=Math.min(p.terrain[j],bed);}
   sources.push(s);
   for(const pt of points){const j=index(p,pt.x,pt.y);riverMask[j]=1;p.humidity[j]=clamp(p.humidity[j]+.25);}
   p.rivers.push({id:'river-'+p.rivers.length,name:cfg.names.rivers[p.rivers.length%cfg.names.rivers.length],width:2.5+clamp(accumulation[index(p,points.at(-1).x,points.at(-1).y)]/800,0,4),points,source:s,mouth:points.at(-1),end,sourceElevation:p.terrain[source]});
  }
  // Reconcile downstream beds after tributaries intersect existing channels.
  for(let pass=0;pass<p.rivers.length;pass++){let changed=false;for(const r of p.rivers)for(let k=1;k<r.points.length;k++){const prev=index(p,r.points[k-1].x,r.points[k-1].y),i=index(p,r.points[k].x,r.points[k].y);if(p.terrain[i]>p.terrain[prev]){p.terrain[i]=p.terrain[prev];changed=true;}}if(!changed)break;}
  // Distance field for valleys, floodplains and settlement water access.
  const riverDistance=new Float32Array(N).fill(1000),queue=[];for(let i=0;i<N;i++)if(riverMask[i]||lakeMask[i]){riverDistance[i]=0;queue.push(i);}
  for(let q=0;q<queue.length;q++){const i=queue[q];if(riverDistance[i]>9)continue;const x=i%cols,y=Math.floor(i/cols);for(const [dx,dy]of neighbors.slice(0,4)){const xx=x+dx,yy=y+dy,j=yy*cols+xx;if(xx<0||yy<0||xx>=cols||yy>=rows||riverDistance[j]<=riverDistance[i]+1)continue;riverDistance[j]=riverDistance[i]+1;queue.push(j);}}
  progress('Выращиваем леса и биомы',48);
  for(let i=0;i<N;i++){
   const e=p.terrain[i];if(e<sea)continue;const u=i%cols/cols,v=Math.floor(i/cols)/rows,t=p.temperature[i],h=p.humidity[i],patch=fbm(wet,u*13+21,v*13+21,3),corrupt=fbm(n,u*7+80,v*7+80,3),alt=(e-sea)/.5;
   let b='plain';
   if(e<sea+.018)b='coast';
   else if(a.mountains>0&&alt>.73-a.mountains/1000)b=t<.24||alt>.89?'snow':'mountain';
   else if(a.mountains>0&&alt>.59-a.mountains/1000)b='rocky';
   else if(t<.22)b='tundra';
   else if(a.corruption>40&&corrupt<.22+a.corruption/250)b=patch>.53?'cursed':'deadforest';
   else if(a.swamp>0&&h>.65-a.swamp/800&&alt<.34&&patch<.3+a.swamp/250)b='swamp';
   else if(riverDistance[i]<3&&alt<.5)b='valley';
   else if(h<.3)b='waste';
   else if(a.ruins>70&&patch<.3)b='ruined';
   const glade=wet(u*31+93,v*31+41),density=clamp(((patch-.25)*2.15*a.forests/70+(h-.4)*.45)*(glade>.68?.35:1));
   if(['plain','valley','tundra'].includes(b)&&density>.31&&a.forests>0)b=t<.39?'conifer':'forest';
   p.biomes[i]=b;p.forestDensity[i]=a.forests===0?0:['forest','conifer','swamp','deadforest','cursed'].includes(b)?Math.max(.2,density):density*.12;
   // Config-defined extra biomes can opt in without changing generation code.
   for(const [id,def]of Object.entries(cfg.biomes))if(def.rule&&e>=sea){const r=def.rule;if(t>=(r.temperature?.[0]??0)&&t<=(r.temperature?.[1]??1)&&h>=(r.humidity?.[0]??0)&&h<=(r.humidity?.[1]??1)&&alt>=(r.altitude?.[0]??0)&&alt<=(r.altitude?.[1]??1))p.biomes[i]=id;}
  }
  progress('Основываем королевства',65);
  const choose=(predicate,spacing=100)=>{for(let k=0;k<1500;k++){const i=Math.floor(rand()*N),pt=point(i);if(p.terrain[i]<sea+.025||pt.x<40||pt.x>width-40||pt.y<65||pt.y>height-40||!predicate(i)||p.objects.some(o=>Math.hypot(o.position.x-pt.x,o.position.y-pt.y)<spacing))continue;return {i,pt};}return null;};
  function add(type,at,name){if(name&&p.objects.some(o=>o.name===name))name=cfg.names.landmarks.find(n=>!p.objects.some(o=>o.name===n))||name+' · '+(p.objects.length+1);const o=W.objects.create(type,at.pt,name,'obj-'+p.objects.length);o.variant=rand();o.description=['Здесь до сих пор помнят имена древних королей.','Странники находят здесь приют и истории о дальних землях.','Старая тропа ведёт к этому месту сквозь туман.'][Math.floor(rand()*3)];p.objects.push(o);return o;}
  const settlementCount=Math.round(a.settlements/5*width/1800);
  for(let k=0;k<settlementCount;k++){const at=choose(i=>p.terrain[i]<.72&&(riverDistance[i]<8||p.terrain[i]<.57||rand()<.12),cfg.generation.settlementSpacing);if(at){const choices=k===0?['castle']:W.placement.coastal(p,at.i)?['portcity','fishingvillage']:['village','town','farm','hamlet','city','forestsettlement','mountainsettlement'];const type=W.placement.pick(p,choices,at.i,rand,riverDistance)||'village';add(type,at,cfg.names.settlements[k%cfg.names.settlements.length]);}}
  for(let k=0;k<Math.round(a.ruins/8*width/1800);k++){const at=choose(i=>p.terrain[i]<.8,90);if(at)add(k%3===0?'fortress':k%3===1?'ruins':'dungeon',at,cfg.names.landmarks[k%cfg.names.landmarks.length]);}
  for(let k=0;k<Math.round(a.fantasy/16*width/1800);k++){const at=choose(i=>p.terrain[i]<.73,125);if(at)add(['worldtree','portal','monument','temple','shrine'][k%5],at,cfg.names.landmarks[(k+3)%cfg.names.landmarks.length]);}
  // Region seeds are separated by farthest-point sampling on dry land.
  const palette=['#d5b878','#8aa6a0','#a998b1','#a8b37d','#c89576','#82a4b4'];
  const regionCount=Math.max(3,Math.round(width/350));
  for(let k=0;k<regionCount;k++){let best=null,distance=-1;for(let j=0;j<300;j++){const i=Math.floor(rand()*N);if(p.terrain[i]<sea+.035)continue;const pos=point(i),d=p.regions.length?Math.min(...p.regions.map(r=>Math.hypot(r.position.x-pos.x,r.position.y-pos.y))):1;if(d>distance){distance=d;best=pos;}}if(best)p.regions.push({id:'region-'+k,name:cfg.names.regions[k%cfg.names.regions.length],faction:['Дом Ворона','Хранители долины','Северный союз','Свободные земли'][k%4],color:palette[k%palette.length],position:best});}
  for(let i=0;i<N;i++){if(p.terrain[i]<sea||!p.regions.length)continue;const pt=point(i);let best=0,d=Infinity;for(let k=0;k<p.regions.length;k++){const r=p.regions[k],distance=Math.hypot(r.position.x-pt.x,r.position.y-pt.y)+(n(pt.x/160,pt.y/160)-.5)*25;if(distance<d){d=distance;best=k;}}p.regionMap[i]=best;}
  for(const o of p.objects){const r=p.regions[p.regionMap[index(p,o.position.x,o.position.y)]];if(r){o.region=r.id;o.faction=r.faction;o.color=r.color;}}
  progress('Соединяем дороги и перевалы',80);
  const towns=p.objects.filter(o=>cfg.objects[o.type].category==='settlements'||['castle','watchtower','fortress','ruins'].includes(o.type));
  if(a.roads>0)for(let k=1;k<towns.length;k++){if(rand()>a.roads/100)continue;const end=towns[k],start=towns.slice(0,k).sort((x,y)=>Math.hypot(x.position.x-end.position.x,x.position.y-end.position.y)-Math.hypot(y.position.x-end.position.x,y.position.y-end.position.y))[0];const pts=route(p,start.position,end.position,riverMask);if(pts.length){p.roads.push({id:'road-'+k,kind:k%3===0?'trail':'road',width:k%3===0?1.6:2.6,points:pts});for(const pt of pts)if(riverDistance[index(p,pt.x,pt.y)]<1.5&&!p.objects.some(o=>['bridge','ford'].includes(o.type)&&Math.hypot(o.position.x-pt.x,o.position.y-pt.y)<70))add(k%2?'bridge':'ford',{pt},k%2?'Старый мост':'Каменный брод');}}
  progress('Оставляем следы древнего мира',92);
  for(const r of p.rivers.slice(0,5)){const pt=r.points.find((pt,k)=>k>3&&p.terrain[index(p,r.points[k-3].x,r.points[k-3].y)]-p.terrain[index(p,pt.x,pt.y)]>.055);if(pt)add('waterfall',{pt},'Серебряный каскад');}
  for(let k=0;k<width*height/18000;k++){const at=choose(i=>p.terrain[i]>sea+.03,30);if(at){const o=add(p.biomes[at.i]==='ruined'?'cemetery':rand()<.86?'rock':'camp',at,'');o.layer='Decorations';o.scale=.55+rand()*.55;}}
  W.placement.enrich(p,choose,add,rand,riverDistance);
  // Short access paths connect interesting sites to the existing network, on dry land.
  if(a.roads>0&&p.roads.length){const access=p.objects.filter(o=>o.layer==='POI'||cfg.objects[o.type].category==='ruins').slice(0,Math.round(8*width/1800));for(const o of access){let anchor=null,best=260;for(const road of p.roads)for(let k=0;k<road.points.length;k+=4){const pt=road.points[k],d=Math.hypot(pt.x-o.position.x,pt.y-o.position.y);if(d<best){best=d;anchor=pt;}}if(!anchor||best<15)continue;const pts=route(p,anchor,o.position,riverMask);if(pts.length){p.roads.push({id:'access-'+o.id,kind:'trail',width:1.15,points:pts});for(const pt of pts)if(riverDistance[index(p,pt.x,pt.y)]<1.5&&!p.objects.some(o=>['bridge','ford'].includes(o.type)&&Math.hypot(o.position.x-pt.x,o.position.y-pt.y)<70))add('ford',{pt:{...pt}},'Тропа через брод');}}}
  W.labels.generate(p);progress('Атлас готов',100);return p;
 }
 function route(p,start,end,riverMask){
  const step=2,cols=Math.ceil(p.cols/step),rows=Math.ceil(p.rows/step),N=cols*rows;
  const cell=pt=>Math.min(rows-1,Math.floor(pt.y/(5*step)))*cols+Math.min(cols-1,Math.floor(pt.x/(5*step)));
  const s=cell(start),goal=cell(end),cost=new Float64Array(N).fill(Infinity),prev=new Int32Array(N).fill(-1),closed=new Uint8Array(N),heap=new Heap();
  const heuristic=i=>Math.hypot(i%cols-goal%cols,Math.floor(i/cols)-Math.floor(goal/cols));
  cost[s]=0;heap.push(s,heuristic(s));
  while(heap.length){const {id:i}=heap.pop();if(closed[i])continue;if(i===goal){const pts=[];for(let k=i;k>=0;k=prev[k])pts.push({x:Math.min(p.width-1,(k%cols*step+1)*5),y:Math.min(p.height-1,(Math.floor(k/cols)*step+1)*5)});pts.reverse();pts[0]={...start};pts[pts.length-1]={...end};return pts;}closed[i]=1;const x=i%cols,y=Math.floor(i/cols);for(const [dx,dy]of neighbors){const xx=x+dx,yy=y+dy,j=yy*cols+xx;if(xx<0||yy<0||xx>=cols||yy>=rows||closed[j])continue;const px=(xx*step+1)*5,py=(yy*step+1)*5,ti=index(p,px,py);if(p.terrain[ti]<p.seaLevel)continue;
   const current=index(p,(x*step+1)*5,(y*step+1)*5);let blocked=false;for(let t=1;t<=3;t++){const ii=index(p,(x*step+1+dx*step*t/3)*5,(y*step+1+dy*step*t/3)*5);if(p.terrain[ii]<p.seaLevel){blocked=true;break;}}if(blocked)continue;
   const next=cost[i]+Math.hypot(dx,dy)*(1+Math.max(0,p.terrain[ti]-.58)*12+Math.abs(p.terrain[ti]-p.terrain[current])*30+(riverMask?.[ti]?2:0));if(next<cost[j]){cost[j]=next;prev[j]=i;heap.push(j,next+heuristic(j));}
  }}return [];
 }
 W.generator={generate,route,random,noise};
})(WS);
