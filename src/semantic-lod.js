(function(W){
 const cfg=W.config.render.semantic;
 const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 function weights(zoom=1){const regional=smooth(...cfg.regional,zoom);return{overview:1-regional,regional,local:0,inspection:cfg.fineOpacity,hierarchy:0,material:cfg.materialOpacity,band:zoom<.75?'overview':'atlas'};}
 function hash(...parts){let h=2166136261;for(const ch of parts.join('|')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}h^=h>>>16;h=Math.imul(h,2246822507);h^=h>>>13;return(h>>>0)/4294967296;}
 function id(p,layer,x,y,child=''){return [p.detailModel?.version||1,p.detailModel?.salt||'worldsmith',p.seed,layer,x,y,child].join(':');}
 const random=(p,layer,x,y,child='')=>hash(id(p,layer,x,y,child));
 function visible(item,zoom=1){return zoom>=(item.minZoom??0)&&zoom<=(item.maxZoom??Infinity);}
 function opacity(item,zoom=1){if(!visible(item,zoom))return 0;const start=item.detailClass;return start?weights(zoom)[start]??1:1;}
 function union(a,b){if(!a)return{...b};if(!b)return{...a};const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);return{x,y,width:Math.max(a.x+a.width,b.x+b.width)-x,height:Math.max(a.y+a.height,b.y+b.height)-y};}
 const expand=(r,pad)=>({x:r.x-pad,y:r.y-pad,width:r.width+2*pad,height:r.height+2*pad});
 W.semantic={cfg,smooth,weights,hash,id,random,visible,opacity,union,expand,version:1};
})(WS);
