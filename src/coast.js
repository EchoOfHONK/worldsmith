(function(W){
 const cache=new WeakMap(),shapes=new WeakMap(),clamp=W.model.clamp;
 function distance(p){if(cache.has(p))return cache.get(p);const d=new Float32Array(p.terrain.length).fill(180),C=p.cols,R=p.rows,water=i=>p.terrain[i]<p.seaLevel;
  for(let y=0;y<R;y++)for(let x=0;x<C;x++){const i=y*C+x,v=water(i);if(x&&water(i-1)!==v||y&&water(i-C)!==v||x<C-1&&water(i+1)!==v||y<R-1&&water(i+C)!==v)d[i]=2.5;}
  for(let y=0;y<R;y++)for(let x=0;x<C;x++){const i=y*C+x;d[i]=Math.min(d[i],x?d[i-1]+5:180,y?d[i-C]+5:180,x&&y?d[i-C-1]+7.071:180,x<C-1&&y?d[i-C+1]+7.071:180);}
  for(let y=R-1;y>=0;y--)for(let x=C-1;x>=0;x--){const i=y*C+x;d[i]=Math.min(d[i],x<C-1?d[i+1]+5:180,y<R-1?d[i+C]+5:180,x<C-1&&y<R-1?d[i+C+1]+7.071:180,x&&y<R-1?d[i+C-1]+7.071:180);}cache.set(p,d);return d;
 }
 function flow(c,p,r){const n=W.random.noise(p.seed+'currents');c.save();c.strokeStyle='#bdd5c516';c.lineWidth=.5;for(let y=Math.floor((r.y-12)/65)*65;y<r.y+r.height+65;y+=65)for(let x=Math.floor((r.x-45)/90)*90;x<r.x+r.width+90;x+=90){const xx=x+n(x,y)*65,yy=y+n(x+3,y)*45;if(xx<0||yy<0||xx>=p.width||yy>=p.height||p.terrain[W.model.index(p,xx,yy)]>p.seaLevel-.035||n(x+11,y)>.3)continue;c.beginPath();c.moveTo(xx-12,yy);c.bezierCurveTo(xx-4,yy-3,xx+7,yy+3,xx+18,yy);c.stroke();}c.restore();}
 function rivers(c,p,rect,line){for(const r of p.rivers){if(r.points.length<2)continue;const pts=W.atlas?.curve(r)||r.points;let shape=shapes.get(r);if(!shape||shape.points!==pts||shape.width!==r.width){let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const v of pts){minX=Math.min(minX,v.x);minY=Math.min(minY,v.y);maxX=Math.max(maxX,v.x);maxY=Math.max(maxY,v.y);}
   // One continuous tapered polygon, not disconnected variable-width segments.
   const left=[],right=[];for(let i=0;i<pts.length;i++){const prev=pts[Math.max(0,i-1)],next=pts[Math.min(pts.length-1,i+1)],dx=next.x-prev.x,dy=next.y-prev.y,len=Math.hypot(dx,dy)||1,t=i/(pts.length-1),w=r.width*(.35+.65*Math.sqrt(t))*.5;left.push({x:pts[i].x-dy/len*w,y:pts[i].y+dx/len*w});right.push({x:pts[i].x+dy/len*w,y:pts[i].y-dx/len*w});}
   const path=new Path2D();path.moveTo(left[0].x,left[0].y);for(const pt of left)path.lineTo(pt.x,pt.y);for(let i=right.length-1;i>=0;i--)path.lineTo(right[i].x,right[i].y);path.closePath();shape={points:pts,width:r.width,path,bounds:{x:minX-15,y:minY-15,width:maxX-minX+30,height:maxY-minY+30}};shapes.set(r,shape);}if(!W.scene.intersects(shape.bounds,rect))continue;
   line(c,r,'#2e4a3430',r.width+3.5);c.fillStyle='#568b90';c.fill(shape.path);line(c,r,'#c3d7bc70',Math.max(.3,r.width*.16));
   if(r.end==='ocean'||r.end==='lake'){const end=pts.at(-1),gr=c.createRadialGradient(end.x,end.y,0,end.x,end.y,r.width*2.5);gr.addColorStop(0,'#86b1a65c');gr.addColorStop(1,'#86b1a600');c.fillStyle=gr;c.beginPath();c.arc(end.x,end.y,r.width*2.5,0,7);c.fill();}
  }}
 W.coast={distance,flow,rivers,invalidate(p){cache.delete(p);}};
})(WS);
