# World continuity — v0.7

## Baseline finding

The pre-v0.7 generator already produced global cell arrays and structured paths. Scene blocks already partitioned global lattices. The missing layer was compositional direction: independent noise thresholds, randomly eligible sites and repeated illustrations did not establish a readable world. Replacing the renderer or inventing a second chunk-owned world would have broken useful invariants.

Visual review also found a separate defect: snow artwork from the preceding atlas row leaked into tree crops, producing repeated horizontal strips. Whole/split equality alone cannot catch a defect present in both images. `atlas-style.removeBleed` now removes detached shallow components at the upper crop border; it preserves the principal silhouette. Main-thread previews and worker world rendering use the same source preparation. No source pixels are enlarged or synthesized by this cleanup.

## Pipeline

`world-layout.js` owns compact seeded composition and spatial rules. `generator.js` orchestrates the following stages in the existing generation worker:

1. **A — Composition:** choose one of three related ridge templates, a seeded reflection/shear, two connected ridge polylines and a descending valley corridor. All coordinates are global world pixels.
2. **B — Character regions:** place broad elliptical ancient-forest, swamp, mountain-frontier, ruined-borderland, sacred-valley and wild-coast influences. Smooth overlapping weights guide terrain and climate; discrete ownership is metadata, not a terrain cut line.
3. **C — Terrain/drainage:** combine the macro plan with restrained continuous noise and the requested land-mass quantile. Lower the woodland core into coherent forest terrain. Grade the valley before global priority-flood drainage. Decide lakes per connected depression, reject tiny pits, generate rivers/tributaries and reconcile downhill channel beds. Forest density and glades follow broad regional masks.
4. **D — Landmarks:** score eligible global cells near planned anchors for a pass castle, old forest tree, swamp ruins, waterside circle and ruined-frontier tower. Parameters can disable these features, and unsuitable terrain can prevent placement. Add settlements and secondary sites before connectivity.
5. **E — Connectivity:** slope/forest/noise-aware A* builds a settlement/fortification network. Special destinations receive trails rather than serving as road hubs. Try up to four earlier network sites when the nearest is unreachable. Smooth only where sampled segments remain on land. Place bridges/fords at actual road/river intersections, orient them to the road, place camps beside junctions and finish short landmark access paths.
6. **F — Local detail:** add waterfalls and context-weighted rock groups only where their complete illustration bounds clear landmarks, then cartography. Runtime forest silhouettes, sparse edge trees, geological fragments and grass marks are reproducible derived detail.

The three templates are variations within one illustrated-atlas composition family, not a catalogue of unrelated continent styles. Preset parameters still control biome/climate/population differences. This is a procedural approximation of the supplied reference, not its reconstruction.

## Rendering and editing boundaries

- Saved terrain, climate, forest density, biomes, region ownership, paths and POIs are authoritative. The optional `worldLayout` is generation provenance, never reapplied to brush edits or old saves.
- Global lattice coordinates own sprite identities; 128-world-unit scene blocks are lookup partitions only. Painter order uses world Y, X and a stable identity, including ties. Generation and rendering share `objects.bounds` for illustration footprints.
- Raster chunks retain DPR-aware resolution, gutters, visible culling, worker generation and the 128 MiB screen cache. There is no monolithic world bitmap and no chunk seed.
- Existing bounded terrain/object invalidation is preserved. Camera movement changes neither the layout nor `worldRevision`.
- Zoom remains capped at 200%. SVG labels remain separate. Generated duplicate biome/region headings are omitted, while manual labels retain their existing behavior.
- Export render model is `atlas-v7`, cache algorithm 3. The optional WebP package uses the same source preparation and renderer as the viewport.

## Honest limits

Bundled drawings still repeat and have finite resolution. The generated focal world tree uses scale 0.8 to stay within the default 200%/DPR2 detail budget; custom scaling and Ultra can still require explicit warnings. The map is not identical to the supplied painting, especially in ground illustration and unique landmark art. Roads connect reachable land; no ocean-spanning road guarantee is made. Manual terrain edits continue to leave authored paths in place. Full-process/GPU memory and stable 60 FPS require separate evidence; see [VALIDATION.md](VALIDATION.md).

## Verification entry points

`tests-continuity.cjs` covers phase order, compact deterministic plans, connected masses, contrasting forest/glade density, focal habitats/routes, dry smoothed roads, exact crossings, downhill rivers, coherent basins, arbitrary scene partitions, distant edits, old-save compatibility, atlas contamination removal and decoration/landmark footprint clearance. `tests-continuity-render.cjs` compares whole renders with six unequal pieces in five habitats at 50/100/150/200%, captures actual worker images, and checks native-size atlas cleanup. Existing rendering/editing/export and isolated performance suites remain required.
