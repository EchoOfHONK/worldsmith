// All world rasterization runs off the UI thread. Main thread owns the camera.
self.window=self;self.document={createElement:()=>new OffscreenCanvas(1,1)};
importScripts('config.js','catalog.js','render-config.js','random.js','objects.js','model.js','labels.js','placement.js','generator.js','surface.js','world-scene.js','coast.js','terrain-tiles.js','renderer.js');
WS.config.render.terrain.maxTiles=WS.config.render.worldChunks.workerTerrainTiles;
const sources=[],custom=new Map();let project=null,revision=0,draws=0;
WS.assets={draw(c,id,x,y,w,variant=0,opacity=1){const s=sources[id];if(!s)return false;draws++;c.save();c.globalAlpha*=opacity;c.translate(x,y);if(variant>.65)c.scale(-1,1);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(s.image,s.sx,s.sy,s.sw,s.sh,-w/2,-w*.8,w,w);c.restore();return true;}};
WS.custom={draw(c,d,x,y,w,rotation=0){const im=custom.get(d.id);if(!im)return false;draws++;c.save();c.translate(x,y);c.rotate(rotation*Math.PI/180);const h=w*d.pixelHeight/d.pixelWidth;c.drawImage(im,-w*d.anchor.x,-h*d.anchor.y,w,h);c.restore();return true;}};
const canvas=new OffscreenCanvas(1,1);let fontsReady;
function fonts(){return fontsReady??=(async()=>{const css=await (await fetch('../assets/fonts/fonts.css')).text();for(const match of css.matchAll(/@font-face\s*\{([^}]+)\}/g)){const block=match[1],value=name=>block.match(new RegExp(name+':\\s*([^;]+)'))?.[1]?.trim(),family=value('font-family')?.replace(/['"]/g,''),url=block.match(/url\(['"]?([^)'"\s]+)/)?.[1];if(!family||!url)continue;const face=new FontFace(family,'url('+new URL('../assets/fonts/'+url,self.location.href)+')',{style:value('font-style')||'normal',weight:value('font-weight')||'normal',unicodeRange:value('unicode-range')||'U+0-10FFFF'});self.fonts.add(await face.load());}})();}

self.onmessage=async({data:m})=>{try{
 if(m.type==='assets'){for(let i=0;i<m.sources.length;i++){const s=m.sources[i];sources[i]=s?{...s,image:m.images[s.image]}:null;}return;}
 if(m.type==='custom'){custom.get(m.id)?.close();custom.set(m.id,m.image);WS.config.objects[m.id]=m.definition;return;}
 if(m.type==='project'){project=m.project;revision=m.revision;Object.assign(WS.config.objects,m.definitions);return;}
 if(m.type==='patch'){revision=m.revision;const {x,y,width,height}=m.cells;let k=0;for(let yy=y;yy<y+height;yy++)for(let xx=x;xx<x+width;xx++,k++){const i=yy*project.cols+xx;for(const key of Object.keys(m.values))project[key][i]=m.values[key][k];}WS.surface.invalidate(project,m.rect);return;}
 if(m.type==='draw'||m.type==='probe'){
  if(m.revision!==revision){self.postMessage({id:m.id,stale:true});return;}draws=0;const t=performance.now();WS.renderer.render(project,canvas,null,{rect:m.rect,resolution:m.resolution,labels:false,frame:false,mode:m.mode,textureDetail:m.texture,detailDensity:m.profile==='Performance'?.65:1,atmosphereScale:m.profile==='Performance'?.65:1});const image=canvas.transferToImageBitmap();self.postMessage({id:m.id,image,revision,ms:performance.now()-t,draws,entities:WS.scene.stats(project),terrain:WS.terrainTiles.last},[image]);return;
 }
 if(m.type==='exportBand'){await fonts();WS.renderer.render(project,canvas,null,{rect:m.rect,resolution:m.resolution,mode:'Atlas',export:true,labels:m.labels,frame:m.frame,textureDetail:m.texture});const image=canvas.transferToImageBitmap();self.postMessage({id:m.id,image,revision},[image]);return;}
 if(m.type==='overview'||m.type==='thumbnail'){const p=m.type==='thumbnail'?WS.generator.generate('THUMB-'+m.preset,540,340,m.preset,WS.config.presets[m.preset].params):project;if(!p){self.postMessage({id:m.id,stale:true});return;}WS.renderer.render(p,canvas,null,{resolution:Math.min(1,600/p.width),labels:false,frame:false,textureDetail:'Low'});const image=canvas.transferToImageBitmap();self.postMessage({id:m.id,image,revision},[image]);}
 }catch(error){self.postMessage({id:m.id,error:error.stack||error.message});}};

