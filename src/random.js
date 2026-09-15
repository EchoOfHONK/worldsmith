(function(W){
 function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
 function random(seed){let s=hash(seed);return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
 function noise(seed){const h=hash(seed),at=(x,y)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263)+h;n=Math.imul(n^n>>>13,1274126177);return((n^n>>>16)>>>0)/4294967295;};return(x,y)=>{let a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b;u=u*u*u*(u*(u*6-15)+10);v=v*v*v*(v*(v*6-15)+10);return(at(a,b)*(1-u)+at(a+1,b)*u)*(1-v)+(at(a,b+1)*(1-u)+at(a+1,b+1)*u)*v;};}
 function fbm(n,x,y,octaves=5){let v=0,w=0,a=.5;for(let k=0;k<octaves;k++){v+=n(x,y)*a;w+=a;x=x*2.03+17;y=y*2.03+31;a*=.48;}return v/w;}
 W.random={hash,random,noise,fbm};
})(WS);
