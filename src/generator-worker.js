self.window=self;
importScripts('config.js','catalog.js','random.js','objects.js','model.js','labels.js','placement.js','generator.js');
self.onmessage=e=>{try{const {seed,width,height,preset,params}=e.data;const project=WS.generator.generate(seed,width,height,preset,params,(message,percent)=>self.postMessage({message,percent}));self.postMessage({project});}catch(error){self.postMessage({error:error.message});}};
