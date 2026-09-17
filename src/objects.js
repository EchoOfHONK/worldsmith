(function(W){
 function bounds(o){const d=W.config.objects[o.type]||{},w=(d.size||35)*(o.scale||1),h=d.custom?w*d.pixelHeight/d.pixelWidth:w,a=d.custom?d.anchor:{x:.5,y:.8},r=(o.rotation||0)*Math.PI/180,cs=Math.cos(r),sn=Math.sin(r);let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const x of [-w*a.x,w*(1-a.x)])for(const y of [-h*a.y,h*(1-a.y)]){const xx=o.position.x+x*cs-y*sn,yy=o.position.y+x*sn+y*cs;x0=Math.min(x0,xx);y0=Math.min(y0,yy);x1=Math.max(x1,xx);y1=Math.max(y1,yy);}return{x:x0-5,y:y0-5,width:x1-x0+10,height:y1-y0+10};}
 W.objects={
  bounds,
  create(type,position,name,id){const d=W.config.objects[type];return{id:id||'obj-'+crypto.randomUUID(),name:name||d.name,type,icon:d.icon,description:d.description||'',scale:1,rotation:0,position:{...position},tags:[],properties:{},color:'#d5bd83',faction:'',region:'',layer:d.layer,variant:0};},
  hit(p,point,zoom=1){return [...p.objects].reverse().find(o=>{const d=W.config.objects[o.type],w=(d.size||35)*(o.scale||1),h=d.custom?w*d.pixelHeight/d.pixelWidth:w,a=d.anchor||{x:.5,y:.8},angle=-(o.rotation||0)*Math.PI/180,dx=point.x-o.position.x,dy=point.y-o.position.y,x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle);return (!W.semantic||W.semantic.visible(o,zoom))&&p.layers[o.layer].visible&&x>=-w*a.x&&x<=w*(1-a.x)&&y>=-h*a.y&&y<=h*(1-a.y);});}
 };
})(WS);
