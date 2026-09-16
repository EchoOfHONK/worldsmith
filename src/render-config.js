// Render policy is independent of generation and saved world coordinates.
WS.config.render={
 semantic:{version:1,regional:[1.25,3],local:[2.5,5.5],inspection:[5.5,8],maxAtlasRatio:1.35,detailPatch:64,maxDetailPatches:256,childSize:12,editPadding:40,terrainPadding:190},
 worldChunks:{pixels:512,gutter:2,overscan:96,cacheBytes:192*1024*1024,workerTerrainTiles:32},
 qualityScale:{Performance:1,Balanced:1,Standard:1,High:1.25,Ultra:1.5},maxZoom:8,
 terrain:{tilePixels:256,maxTiles:192,lodLevels:[.125,.25,.5,.75,1,1.5,2,3,4,6,8,12,16,24,32,48]},
 assets:{lodSizes:[64,128,256,512,1024,2048],cacheBytes:64*1024*1024},
 export:{longEdges:[2048,4096,8192],maxEdge:8192,bandPixels:512}
};
