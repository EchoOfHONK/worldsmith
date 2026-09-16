(function(W){
 W.objects={
  create(type,position,name,id){const d=W.config.objects[type];return{id:id||'obj-'+crypto.randomUUID(),name:name||d.name,type,icon:d.icon,description:d.description||'',scale:1,rotation:0,position:{...position},tags:[],properties:{},color:'#d5bd83',faction:'',region:'',layer:d.layer,variant:0};},
  hit(p,point,zoom=1){return [...p.objects].reverse().find(o=>{const d=W.config.objects[o.type],w=(d.size||35)*(o.scale||1),h=d.custom?w*d.pixelHeight/d.pixelWidth:w,a=d.anchor||{x:.5,y:.8},angle=-(o.rotation||0)*Math.PI/180,dx=point.x-o.position.x,dy=point.y-o.position.y,x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle);return (!W.semantic||W.semantic.visible(o,zoom))&&p.layers[o.layer].visible&&x>=-w*a.x&&x<=w*(1-a.x)&&y>=-h*a.y&&y<=h*(1-a.y);});}
 };
})(WS);
