(function(W){
 class Editor {
  constructor(canvas,overlay,viewport,onChange){Object.assign(this,{canvas,overlay,viewport,onChange,tool:'select',radius:50,intensity:.55,hardness:.35,density:.8,randomization:.35,heightDirection:1,biome:'forest',objectType:'castle',roadKind:'road',eraseLayer:'Vegetation',history:[],future:[],zoom:1,offset:{x:0,y:0},space:false,selectedId:null,mode:'Atlas',dirty:false});this.previewQuality={quality:'Balanced',labels:'High',texture:'Medium'};this.bind();this.view=W.ViewportRenderer?new W.ViewportRenderer(this):null;}
  setProject(p,fit=true){W.custom?.attach(p);W.custom?.activate(p);this.project=p;this.selectedId=null;this.draw();if(fit)this.fit();this.changed();}
  trimHistory(){const size=v=>typeof v==='string'?v.length*2:v.cells.length*160;while(this.history.length>25||this.history.reduce((n,s)=>n+size(s),0)>64e6&&this.history.length>1)this.history.shift();}
  snapshot(){this.history.push(JSON.stringify(this.project));this.trimHistory();this.future=[];this.dirty=true;}
  beginStroke(){this.strokeUndo=new Map();}
  cellValues(i){const p=this.project;return[p.terrain[i],p.biomes[i],p.humidity[i],p.temperature[i],p.forestDensity[i],p.regionMap[i]];}
  recordCell(i){if(this.strokeUndo&&!this.strokeUndo.has(i))this.strokeUndo.set(i,this.cellValues(i));}
  endStroke(){if(!this.strokeUndo)return;const cells=[];for(const [i,before]of this.strokeUndo){const after=this.cellValues(i);if(before.some((v,k)=>v!==after[k]))cells.push({i,before,after});}this.strokeUndo=null;if(cells.length){this.history.push({kind:'stroke',cells});this.future=[];this.dirty=true;}this.trimHistory();}
  applyStroke(record,side){const keys=['terrain','biomes','humidity','temperature','forestDensity','regionMap'];for(const cell of record.cells)for(let k=0;k<keys.length;k++)this.project[keys[k]][cell.i]=cell[side][k];}
  undo(){if(!this.history.length)return;const record=this.history.pop();if(typeof record==='string'){this.future.push(JSON.stringify(this.project));this.project=JSON.parse(record);}else{this.future.push(record);this.applyStroke(record,'before');}this.selectedId=null;this.dirty=true;this.draw();this.changed('project');}
  redo(){if(!this.future.length)return;const record=this.future.pop();if(typeof record==='string'){this.history.push(JSON.stringify(this.project));this.project=JSON.parse(record);}else{this.history.push(record);this.applyStroke(record,'after');}this.trimHistory();this.selectedId=null;this.dirty=true;this.draw();this.changed('project');}
  changed(kind='data'){this.onChange?.(this,kind);}
  draw(rect){W.custom?.activate(this.project);if(this.view)this.view.invalidate(rect);else{W.surface?.invalidate(this.project,rect);W.scene?.invalidate(this.project,rect);}}
  schedule(){if(this.pending)return;this.pending=requestAnimationFrame(()=>{this.pending=null;this.draw();});}
  transform(){this.zoom=Math.min(this.zoom,W.config.render.maxZoom);this.view?.camera();}
  mergeDirty(pos){const r={x:pos.x-this.radius,y:pos.y-this.radius,width:this.radius*2,height:this.radius*2};if(!this.brushRect)this.brushRect=r;else{const b=this.brushRect,x=Math.min(b.x,r.x),y=Math.min(b.y,r.y);this.brushRect={x,y,width:Math.max(b.x+b.width,r.x+r.width)-x,height:Math.max(b.y+b.height,r.y+r.height)-y};}}
  queuePaint(points){this.samples??=[];for(const pt of points){const last=this.samples.at(-1)||this.drag?.last;if(!last||Math.hypot(pt.x-last.x,pt.y-last.y)>=Math.max(1,this.radius*.08))this.samples.push(pt);}if(this.paintFrame)return;this.paintFrame=requestAnimationFrame(()=>{this.paintFrame=null;this.flushPaint();});}
  flushPaint(){if(!this.samples?.length||this.drag?.kind!=='paint')return;const start=performance.now(),samples=this.samples;this.samples=[];this.batchBrush=true;this.coastChanged=false;for(const pt of samples){const last=this.drag.last,distance=Math.hypot(pt.x-last.x,pt.y-last.y),steps=Math.max(1,Math.ceil(distance/Math.max(3,this.radius*.28)));for(let k=1;k<=steps;k++){const pos={x:last.x+(pt.x-last.x)*k/steps,y:last.y+(pt.y-last.y)*k/steps};if(this.inside(pos)){this.paint(pos);this.mergeDirty(pos);}}this.drag.last=pt;}this.batchBrush=false;if(this.brushRect){const r=this.brushRect;r.padding=this.coastChanged?190:this.tool==='height'?30:125;this.brushRect=null;this.draw(this.tool==='eraser'&&['POI','Structures','Decorations','Labels','Roads','Rivers'].includes(this.eraseLayer)?undefined:r);}if(this.view)this.view.brushMs=performance.now()-start;}
  fit(){const w=this.viewport.clientWidth,h=this.viewport.clientHeight;this.zoom=Math.min(W.config.render.maxZoom,Math.min(w/this.project.width,h/this.project.height)*.97);this.offset={x:(w-this.project.width*this.zoom)/2,y:(h-this.project.height*this.zoom)/2};this.transform();this.changed('view');}
  zoomAt(f,x=this.viewport.clientWidth/2,y=this.viewport.clientHeight/2){const z=Math.round(Math.max(.12,Math.min(W.config.render?.maxZoom||2,this.zoom*f))*1e6)/1e6,r=z/this.zoom;this.offset={x:x-(x-this.offset.x)*r,y:y-(y-this.offset.y)*r};this.zoom=z;this.transform();this.changed('view');}
  point(e){const r=this.viewport.getBoundingClientRect();return{x:(e.clientX-r.left-this.offset.x)/this.zoom,y:(e.clientY-r.top-this.offset.y)/this.zoom};}
  inside(pt){return pt.x>=0&&pt.y>=0&&pt.x<this.project.width&&pt.y<this.project.height;}
  layer(){return W.brushes.layer(this);}
  editable(l){return l&&this.project.layers[l].visible&&!this.project.layers[l].locked;}
  paint(pt){W.brushes.paint(this,pt);}
  selected(){if(!this.selectedId)return null;return this.project.objects.find(o=>o.id===this.selectedId)||this.project.labels.find(l=>l.id===this.selectedId);}
  addObject(pos){const o=W.objects.create(this.objectType,pos);o.variant=W.random.random(o.id)();const region=this.project.regions[this.project.regionMap[W.model.index(this.project,pos.x,pos.y)]];if(region){o.region=region.id;o.faction=region.faction;o.color=region.color;}this.project.objects.push(o);if(this.editable('Labels')){const l=W.labels.create(o.name,{x:pos.x,y:pos.y+21},'poi');l.objectId=o.id;this.project.labels.push(l);}this.selectedId=o.id;}
  bind(){
   const v=this.viewport;v.addEventListener('contextmenu',e=>e.preventDefault());
   v.addEventListener('wheel',e=>{if(!this.project)return;e.preventDefault();const r=v.getBoundingClientRect();this.zoomAt(Math.exp(-e.deltaY*.0012),e.clientX-r.left,e.clientY-r.top);},{passive:false});
   v.addEventListener('pointerdown',e=>{
    if(!this.project||this.busy||e.target.closest('.map-control'))return;const pos=this.point(e);v.setPointerCapture(e.pointerId);
    if(e.button===1||this.space||this.tool==='pan'){this.drag={kind:'pan',x:e.clientX,y:e.clientY,offset:{...this.offset}};return;}
    if(e.button!==0||!this.inside(pos))return;
    if(this.tool==='select'||this.tool==='label'){
     let obj=this.tool==='label'?W.labels.hit(this.project,pos,this.zoom):W.objects.hit(this.project,pos,this.zoom);this.selectedId=obj?.id||null;
     if(!obj&&this.tool==='label'&&this.editable('Labels')){this.snapshot();obj=W.labels.create('Новая область',pos,'region');obj.manual=true;this.project.labels.push(obj);this.selectedId=obj.id;}
     if(obj&&this.editable(obj.kind?'Labels':obj.layer))this.drag={kind:obj.kind?'label':'object',object:obj,start:pos,origin:{...obj.position},saved:false};this.view.labelRevision=-1;this.view.request();this.changed('selection');return;
    }
    if(!this.editable(this.layer())){W.ui?.toast('Слой скрыт или заблокирован');return;}if(!['object','river','road'].includes(this.tool)&&!(this.tool==='eraser'&&['POI','Structures','Decorations','Roads','Rivers','Labels'].includes(this.eraseLayer)))this.beginStroke();else this.snapshot();
    if(this.tool==='object'){this.addObject(pos);this.draw();this.changed('selection');return;}
    if(['river','road'].includes(this.tool)){const path={id:crypto.randomUUID(),name:this.tool==='river'?'Новая река':'Новая дорога',width:Math.max(1,this.radius/12*this.intensity),kind:this.roadKind,points:[pos]};this.project[this.tool==='river'?'rivers':'roads'].push(path);this.drag={kind:'line',line:path};}
    else{this.drag={kind:'paint',last:pos};this.samples=[pos];this.flushPaint();}this.changed();
   });
   v.addEventListener('pointermove',e=>{
    if(!this.project)return;const pos=this.point(e);this.cursorPosition=pos;if(!this.cursorFrame)this.cursorFrame=requestAnimationFrame(()=>{this.cursorFrame=null;this.cursor(this.cursorPosition);});const d=this.drag;if(!d)return;
    if(d.kind==='pan'){this.offset={x:d.offset.x+e.clientX-d.x,y:d.offset.y+e.clientY-d.y};this.transform();return;}
    if(d.kind==='object'||d.kind==='label'){
     if(Math.hypot(pos.x-d.start.x,pos.y-d.start.y)<1&&!d.saved)return;if(!d.saved){this.snapshot();d.saved=true;}
     const old={...d.object.position};d.object.position={x:W.model.clamp(d.origin.x+pos.x-d.start.x,0,this.project.width),y:W.model.clamp(d.origin.y+pos.y-d.start.y,0,this.project.height)};
     if(d.kind==='label')d.object.manual=true;else if(this.editable('Labels'))for(const l of this.project.labels)if(l.objectId===d.object.id){l.position.x+=d.object.position.x-old.x;l.position.y+=d.object.position.y-old.y;}
    }else if(d.kind==='line'){if(this.inside(pos)&&Math.hypot(pos.x-d.line.points.at(-1).x,pos.y-d.line.points.at(-1).y)>3)d.line.points.push(pos);}
    else if(d.kind==='paint'){const events=e.getCoalescedEvents?.()||[];this.queuePaint((events.length?events:[e]).map(event=>this.point(event)));return;}
    if(d.kind==='label'){this.view.labelRevision=-1;this.view.request();}else this.schedule();
   });
   const end=()=>{if(this.drag){if(this.drag.kind==='paint'){cancelAnimationFrame(this.paintFrame);this.paintFrame=null;this.flushPaint();this.endStroke();this.samples=[];}const painted=this.drag.kind==='paint'||this.drag.kind==='pan';if(this.drag.kind==='line'&&this.drag.line.points.length<2)for(const key of ['roads','rivers'])this.project[key]=this.project[key].filter(l=>l!==this.drag.line);this.drag=null;if(!painted)this.schedule();else if(painted&&this.tool!=='pan')this.view?.overview();this.changed();}};
   v.addEventListener('pointerup',end);v.addEventListener('pointercancel',end);v.addEventListener('lostpointercapture',end);v.addEventListener('pointerleave',()=>this.overlay.getContext('2d').clearRect(0,0,this.overlay.width,this.overlay.height));
   window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable||this.busy)return;if(e.code==='Space'){e.preventDefault();this.space=true;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?this.redo():this.undo();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();this.redo();}if(e.key==='Delete')this.deleteSelected();});
   window.addEventListener('keyup',e=>{if(e.code==='Space')this.space=false;});window.addEventListener('blur',()=>{this.space=false;end();});
   window.addEventListener('resize',()=>this.view?.request());
   new ResizeObserver(()=>{const dpr=window.devicePixelRatio||1;this.overlay.width=Math.ceil(v.clientWidth*dpr);this.overlay.height=Math.ceil(v.clientHeight*dpr);this.overlay.style.width=v.clientWidth+'px';this.overlay.style.height=v.clientHeight+'px';this.overlay.getContext('2d').setTransform(dpr,0,0,dpr,0,0);this.view?.request();this.onView?.();}).observe(v);
  }
  cursor(pos){const c=this.overlay.getContext('2d');c.clearRect(0,0,this.overlay.width,this.overlay.height);const x=pos.x*this.zoom+this.offset.x,y=pos.y*this.zoom+this.offset.y;if(this.tool==='object'){const def=W.config.objects[this.objectType];if(def.custom){c.save();c.globalAlpha=.65;W.custom.draw(c,def,x,y,def.size*this.zoom);c.restore();}else if(def.sprite!==undefined)W.assets.draw(c,def.sprite,x,y,def.size*this.zoom,0,.6);else{c.fillStyle='#ddc698';c.font='22px Georgia';c.fillText(def.icon,x,y);}return;}if(['select','pan','label'].includes(this.tool))return;const r=this.radius*this.zoom,gr=c.createRadialGradient(x,y,r*this.hardness,x,y,r);gr.addColorStop(0,'#edd4a825');gr.addColorStop(1,'#edd4a803');c.fillStyle=gr;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle='#e5d1a7c0';c.lineWidth=1;c.stroke();c.setLineDash([2,4]);c.beginPath();c.arc(x,y,r*this.hardness,0,7);c.strokeStyle='#e5d1a750';c.stroke();c.setLineDash([]);}
  deleteSelected(){const o=this.selected();if(!o)return;if(!this.editable(o.kind?'Labels':o.layer)){W.ui?.toast('Слой скрыт или заблокирован');return;}this.snapshot();this.project.objects=this.project.objects.filter(o=>o.id!==this.selectedId);this.project.labels=this.project.labels.filter(l=>l.id!==this.selectedId&&l.objectId!==this.selectedId);this.selectedId=null;this.draw();this.changed();}
 }
 W.Editor=Editor;
})(WS);
