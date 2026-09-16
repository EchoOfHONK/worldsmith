(function(W){
 const {clamp,index}=W.model;
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
 function line(c,item,color,width){if(item.points.length<2)return;c.beginPath();c.moveTo(item.points[0].x,item.points[0].y);for(let i=1;i<item.points.length-1;i++){const a=item.points[i],b=item.points[i+1];c.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);}const last=item.points.at(-1);c.lineTo(last.x,last.y);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
 function contours(c,p,level,color,width){
  c.beginPath();const cs=p.cellSize,heights=W.surface?.heightField(p)||p.terrain;
  for(let y=0;y<p.rows-1;y++)for(let x=0;x<p.cols-1;x++){const i=y*p.cols+x,v=[heights[i],heights[i+1],heights[i+p.cols+1],heights[i+p.cols]],corners=[[x+.5,y+.5],[x+1.5,y+.5],[x+1.5,y+1.5],[x+.5,y+1.5]],pts=[];for(let k=0;k<4;k++){const j=(k+1)%4;if((v[k]<level)===(v[j]<level))continue;const t=(level-v[k])/(v[j]-v[k]);pts.push([(corners[k][0]+(corners[j][0]-corners[k][0])*t)*cs,(corners[k][1]+(corners[j][1]-corners[k][1])*t)*cs]);}for(let k=0;k+1<pts.length;k+=2){c.moveTo(...pts[k]);c.lineTo(...pts[k+1]);}}c.strokeStyle=color;c.lineWidth=width;c.stroke();
 }
 function terrain(p,c,mode,on){
  const small=document.createElement('canvas');small.width=p.cols;small.height=p.rows;const sc=small.getContext('2d'),im=sc.createImageData(p.cols,p.rows),style=W.config.styles[p.styling.theme]||W.config.styles.classic,biomes=Object.fromEntries(Object.entries(W.config.biomes).map(([id,b])=>[id,rgb(b.color)])),n=W.random.noise(p.seed+'surface'),relief=p.styling.relief/100,texture=p.styling.texture/100;
  for(let i=0;i<p.terrain.length;i++){
   const e=p.terrain[i],x=i%p.cols,y=Math.floor(i/p.cols),water=e<p.seaLevel,b=p.biomes[i];let color,shade=0;
   if(water){color=mix([92,129,130],style.ocean,Math.pow(clamp((p.seaLevel-e)*4),.45));shade=(n(x*.4,y*.4)-.5)*8;}
   else{color=biomes[b]||biomes.plain;if(!on('Terrain'))color=[76,84,71];let blend=[...color];for(const off of [-1,1,-p.cols,p.cols]){const j=clamp(i+off,0,p.terrain.length-1);if(p.terrain[j]>=p.seaLevel)blend=mix(blend,biomes[p.biomes[j]]||color,.13);}color=blend;const dx=p.terrain[Math.min(i+1,p.terrain.length-1)]-p.terrain[Math.max(i-1,0)],dy=p.terrain[Math.min(i+p.cols,p.terrain.length-1)]-p.terrain[Math.max(i-p.cols,0)];if(on('Height'))shade=clamp((-dx*.8-dy)*680,-36,36)*relief;shade+=(n(x*.55,y*.55)-.5)*17*texture+(n(x*2.1,y*2.1)-.5)*10*texture;}
   if(mode==='Height'){const t=clamp((e-p.seaLevel)/(1-p.seaLevel));color=water?mix([23,48,64],[81,124,135],e/p.seaLevel):mix([68,91,65],[231,230,196],t);shade=0;}
   else if(mode==='Biome'){color=water?[47,88,106]:(biomes[b]||biomes.plain);shade=0;}
   else if(mode==='Region'&&!water){const r=p.regions[p.regionMap[i]];color=mix(color,r?rgb(r.color):[150,150,130],.68);}
   if(water&&!on('Water'))color=[27,36,34];if(mode==='Atlas'||mode==='Editor'){const gray=color[0]*.3+color[1]*.59+color[2]*.11;color=color.map(v=>(gray+(v-gray)*style.saturation)*style.exposure);}for(let k=0;k<3;k++)im.data[i*4+k]=clamp(color[k]+shade,0,255);im.data[i*4+3]=255;
  }sc.putImageData(im,0,0);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(small,0,0,p.width,p.height);
 }
 function object(c,o,selected=false,editor=false){
  const def=W.config.objects[o.type],{x,y}=o.position,size=(def.size||35)*(o.scale||1);
  if(def.custom)W.custom.draw(c,def,x,y,size,o.rotation||0);else if(def.sprite!==undefined){c.save();c.translate(x,y);c.rotate((o.rotation||0)*Math.PI/180);W.assets.draw(c,o.type==='waterfall'&&o.variant>.5?37:o.type==='rock'&&o.variant>.45?2:def.sprite,0,0,size,o.variant);c.restore();}
  else{c.save();c.translate(x,y);c.lineWidth=1;c.strokeStyle='#353d30';
   if(o.type==='roadpiece'||o.type==='crossroads'){c.strokeStyle='#a59169';c.lineWidth=4;c.beginPath();c.moveTo(-size/2,4);c.bezierCurveTo(-12,-8,12,8,size/2,-4);if(o.type==='crossroads'){c.moveTo(0,-size/2);c.lineTo(0,size/2);}c.stroke();}
   else if(o.type==='bridge'||o.type==='ford'){c.rotate(o.variant*.8-.4);c.strokeStyle=o.type==='ford'?'#b7b398':'#514d3d';c.lineWidth=o.type==='ford'?2:9;c.beginPath();c.moveTo(-14,0);c.quadraticCurveTo(0,-9,14,0);c.stroke();if(o.type==='bridge'){c.strokeStyle='#c1b394';c.lineWidth=5;c.stroke();c.strokeStyle='#5b5844';c.lineWidth=1;for(let x=-12;x<14;x+=4){c.beginPath();c.moveTo(x,-6);c.lineTo(x,2);c.stroke();}}}
   else if(o.type==='camp'){c.fillStyle='#ad966b';c.beginPath();c.moveTo(-18,2);c.lineTo(-7,-20);c.lineTo(7,2);c.closePath();c.fill();c.stroke();c.fillStyle='#64593e';c.beginPath();c.moveTo(-7,-20);c.lineTo(-2,2);c.lineTo(7,2);c.fill();c.fillStyle='#d98942';c.shadowColor='#f0a74c';c.shadowBlur=12;c.beginPath();c.arc(13,0,3,0,7);c.fill();}
   else if(o.type==='waterfall'){c.lineWidth=4;c.strokeStyle='#cee8dc';c.shadowColor='#bde4d7';c.shadowBlur=6;for(let k=0;k<4;k++){c.beginPath();c.moveTo(k*2-4,-9);c.bezierCurveTo(k*2,-2,k*2-1,6,k*2-3,11);c.stroke();}c.fillStyle='#d5e8db88';c.beginPath();c.ellipse(1,12,10,4,0,0,7);c.fill();}
   else if(o.type==='cemetery'){c.strokeStyle='#c5bea0';c.lineWidth=2;for(let k=0;k<5;k++){const x=(k%3)*7-7,y=Math.floor(k/3)*6;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-8);c.moveTo(x-3,y-5);c.lineTo(x+3,y-5);c.stroke();}}
   else if(o.type==='fire'){c.fillStyle='#e7a255';c.shadowBlur=15;c.shadowColor='#e29a41';c.beginPath();c.arc(0,-2,3,0,7);c.fill();}
   else if(o.type==='cave'){c.fillStyle='#4a5041';c.beginPath();c.ellipse(0,0,12,8,0,Math.PI,0);c.fill();c.strokeStyle='#aaa387';c.stroke();c.fillStyle='#171f1c';c.beginPath();c.ellipse(0,1,6,5,0,Math.PI,0);c.fill();}
   else{c.font='24px Georgia';c.fillStyle=o.color;c.textAlign='center';c.fillText(o.icon,0,0);}c.restore();
  }
  if(editor||selected){c.save();c.strokeStyle=o.color;c.fillStyle=o.color;c.lineWidth=1.3;c.beginPath();c.arc(x,y+5,selected?10:3,0,Math.PI*2);c.stroke();if(!selected)c.fill();if(selected){c.setLineDash([3,4]);c.strokeRect(x-size*.48,y-size*.75,size*.96,size);c.setLineDash([]);}c.restore();}
  if(o.icon!==def.icon){c.font='16px Georgia';c.fillStyle=o.color;c.fillText(o.icon,x+size*.3,y-size*.5);}
 }
 function labels(c,p,selectedId,on=l=>p.layers[l].visible,zoom=1){for(const original of p.labels){if(!W.labels.visible(original,zoom))continue;const l={...original,size:W.labels.displaySize(original,zoom)};const obj=l.objectId&&p.objects.find(o=>o.id===l.objectId);if(obj&&(!on(obj.layer)||!W.semantic.visible(obj,zoom)))continue;c.save();c.translate(l.position.x,l.position.y);c.rotate(l.rotation*Math.PI/180);const region=l.kind==='region',italic=['river','forest'].includes(l.kind);c.font=`${italic?'italic ':''}${region?500:600} ${l.size}px "Cormorant Garamond", Georgia, serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=region?1.1:.8;c.strokeStyle='#283d32a6';c.shadowColor='#192b26';c.shadowBlur=0;if('letterSpacing'in c)c.letterSpacing=region?'3px':l.kind==='mountain'?'2px':'.3px';c.strokeText(l.text,0,0);c.fillStyle=l.color;c.globalAlpha=region?.9:.98;c.fillText(l.text,0,0);if(l.id===selectedId){c.strokeStyle='#edd6a1';c.lineWidth=1;c.setLineDash([3,3]);c.strokeRect(-c.measureText(l.text).width/2-5,-l.size*.65,c.measureText(l.text).width+10,l.size*1.3);}c.restore();}}
 function frame(c,p){
  const color=(W.config.styles[p.styling.theme]||W.config.styles.classic).paper;c.strokeStyle=color+'70';c.lineWidth=1;c.strokeRect(17,17,p.width-34,p.height-34);c.strokeStyle=color+'30';c.strokeRect(23,23,p.width-46,p.height-46);
  for(const [x,y,sx,sy]of [[17,17,1,1],[p.width-17,17,-1,1],[17,p.height-17,1,-1],[p.width-17,p.height-17,-1,-1]]){c.save();c.translate(x,y);c.scale(sx,sy);c.strokeStyle=color+'b0';c.beginPath();c.moveTo(0,45);c.lineTo(0,0);c.lineTo(45,0);c.moveTo(5,32);c.quadraticCurveTo(6,7,32,5);c.stroke();c.fillStyle=color;c.translate(7,7);c.rotate(Math.PI/4);c.fillRect(-2,-2,4,4);c.restore();}
  c.save();c.translate(p.width-83,p.height-97);c.strokeStyle=color+'aa';c.fillStyle=color;c.lineWidth=.8;c.beginPath();c.arc(0,0,28,0,7);c.stroke();for(let k=0;k<8;k++){c.save();c.rotate(k*Math.PI/4);c.beginPath();c.moveTo(0,-43);c.lineTo(-5,0);c.lineTo(0,6);c.lineTo(5,0);c.closePath();c.fillStyle=k%2?color+'55':color+'cc';c.fill();c.restore();}c.textAlign='center';c.font='13px Georgia';c.fillText('N',0,-53);c.restore();
  c.save();const cartouche=c.createLinearGradient(34,0,p.width*.38,0);cartouche.addColorStop(0,'#152c25c9');cartouche.addColorStop(1,'#152c2500');c.fillStyle=cartouche;c.fillRect(33,p.height-121,p.width*.36,85);c.fillStyle=color;c.font='500 34px "Cormorant Garamond",Georgia,serif';if('letterSpacing'in c)c.letterSpacing='4px';c.fillText(p.title.toUpperCase(),49,p.height-76,p.width*.32);c.font='italic 16px "Cormorant Garamond",Georgia,serif';if('letterSpacing'in c)c.letterSpacing='1px';c.fillStyle=color+'b0';c.fillText(p.subtitle,50,p.height-49,p.width*.32);c.restore();
 }
 function render(p,canvas,selectedId=null,options={}){
  if(typeof options==='boolean')options={labels:options};const semanticZoom=options.semanticZoom??1,metrics={macro:0,derived:0,materials:0,paths:0,band:W.semantic?.weights(semanticZoom).band||'overview',semanticZoom};options={...options,semanticZoom,metrics};W.renderer.last=metrics;const c=canvas.getContext('2d'),rect=options.rect||{x:0,y:0,width:p.width,height:p.height},resolution=options.resolution||1,only=options.onlyLayer;const cw=options.pixelWidth??Math.ceil(rect.width*resolution),ch=options.pixelHeight??Math.ceil(rect.height*resolution);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}else{c.resetTransform();c.clearRect(0,0,cw,ch);}c.save();c.setTransform(resolution,0,0,resolution,-rect.x*resolution,-rect.y*resolution);c.beginPath();c.rect(0,0,p.width,p.height);c.clip();const visible=l=>options.export?p.layers[l]?.export:p.layers[l]?.visible,mode=options.mode||'Atlas',on=l=>visible(l)&&(!only||only===l),rand=W.random.random(p.seed+'render'),n=W.random.noise(p.seed+'detail');if(!only||only==='Base')W.surface?W.surface.render(p,c,mode,visible,terrain,options):terrain(p,c,mode,visible);
  if(['Height','Biome','Region'].includes(mode)){
   if(on('Rivers'))for(const r of p.rivers)line(c,r,'#87c7d2',r.width);if(mode==='Height'&&(!only||only==='Base'))for(const h of [.5,.6,.7,.8,.9])contours(c,p,h,'#233c374a',.7);
   if(mode==='Region'&&(!only||only==='Base')){c.strokeStyle='#e7dfbfaa';c.lineWidth=.7;c.beginPath();for(let y=1;y<p.rows;y++)for(let x=1;x<p.cols;x++){const i=y*p.cols+x;if(p.regionMap[i]<0)continue;if(p.regionMap[i]!==p.regionMap[i-1]){c.moveTo(x*5,y*5);c.lineTo(x*5,y*5+5);}if(p.regionMap[i]!==p.regionMap[i-p.cols]){c.moveTo(x*5,y*5);c.lineTo(x*5+5,y*5);}}c.stroke();}
   if(on('Labels')&&options.labels!==false)labels(c,p,selectedId,on,semanticZoom);if((!only||only==='Frame')&&(options.frame??p.styling.frame))frame(c,p);c.restore();return;
  }
  const inView=(x,y,pad=180)=>x+pad>=rect.x&&y+pad>=rect.y&&x-pad<=rect.x+rect.width&&y-pad<=rect.y+rect.height;
  const drawHierarchy=layer=>{for(const s of W.scene.sprites(p,rect,layer)){const weight=W.semantic?.weights(semanticZoom).hierarchy||0;if(weight<1){W.assets.draw(c,s.id,s.x,s.y,s.size,s.variant,.96*(1-weight));metrics.macro++;}for(const child of W.detail?.hierarchy(p,s,semanticZoom)||[]){if(!W.scene.intersects(child.bounds,rect))continue;if(child.id!=null)W.assets.draw(c,child.id,child.x,child.y,child.size,child.variant,child.alpha);else W.detail.tree(c,child);metrics.derived++;}}};
  const drawPOI=o=>W.settlement?W.settlement.draw(c,p,o,semanticZoom,(ctx,item)=>object(ctx,item,item.id===selectedId,mode==='Editor'),metrics):object(c,o,o.id===selectedId,mode==='Editor');
  const passes={Terrain(){W.surface?.details(c,p,on,rect,options);},Height(){W.surface.render(p,c,mode,visible,terrain,{...options,surfaceLayer:'Height'});},
   Water(){W.surface.render(p,c,mode,visible,terrain,{...options,surfaceLayer:'Water'});W.coast?.flow(c,p,rect);metrics.materials+=W.detail?.drawMaterials(c,p,on,rect,{...options,materialLayer:'water'})||0;},
   Rivers(){W.coast.rivers(c,p,rect,line);metrics.paths+=W.detail?.drawPaths(c,p,rect,semanticZoom,'river')||0;},
   Mountains(){drawHierarchy('Mountains');},
   Vegetation(){drawHierarchy('Vegetation');},
   Roads(){for(const r of p.roads){c.setLineDash(r.kind==='trail'?[3,5]:[]);line(c,r,'#434a354a',r.width+4);line(c,r,'#c0ae80aa',r.width+1);line(c,r,'#ded0a16b',r.width*.35);c.setLineDash([]);}metrics.paths+=W.detail?.drawPaths(c,p,rect,semanticZoom,'road')||0;},
   Structures(){for(const o of W.scene.objects(p,rect,'Structures'))drawPOI(o);},
   POI(){for(const o of W.scene.objects(p,rect,'POI'))drawPOI(o);},
   Decorations(){for(const o of W.scene.objects(p,rect,'Decorations'))drawPOI(o);},
   Labels(){if((options.labels??p.styling.labels)!==false)labels(c,p,selectedId,on,semanticZoom);}
  };
  for(const l of p.layerOrder)if(on(l))passes[l]?.();
  if((!only||only==='Atmosphere')&&p.styling.atmosphere>0&&visible('Terrain')){const rand=W.random.random(p.seed+'atmosphere');c.save();c.globalAlpha=p.styling.atmosphere/100*.17*(options.atmosphereScale??1)*(1-.8*(W.semantic?.weights(semanticZoom).hierarchy||0));for(let k=0;k<22;k++){const x=rand()*p.width,y=rand()*p.height,e=p.terrain[index(p,x,y)];if(e>.72||e<p.seaLevel)continue;c.save();c.translate(x,y);c.scale(1,.22);const gr=c.createRadialGradient(0,0,0,0,0,100);gr.addColorStop(0,'#e2e3cc');gr.addColorStop(1,'#e2e3cc00');c.fillStyle=gr;c.fillRect(-110,-110,220,220);c.restore();}c.restore();}
  if(!only||only==='Atmosphere'){const vignette=c.createRadialGradient(p.width/2,p.height/2,p.width*.2,p.width/2,p.height/2,p.width*.65);vignette.addColorStop(0,'#0e231600');vignette.addColorStop(1,'#0d24142b');c.fillStyle=vignette;c.fillRect(0,0,p.width,p.height);}if((!only||only==='Frame')&&(options.frame??p.styling.frame))frame(c,p);c.restore();
 }
 W.renderer={render,object,line,contours,labels,frame};
})(WS);
