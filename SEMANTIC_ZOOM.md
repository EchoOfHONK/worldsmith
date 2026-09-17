# Focused atlas rendering — v0.6

## Product policy

The focused visual request supersedes the former 800% goal. Camera maximum is 2×; existing minimum/fit behavior is preserved except the maximum clamp. Buttons expose 50/100/150/200%. Project coordinates, v1/v2 loading, POI anchors, editing and PNG exports are preserved. The original first reference image is absent from this repository; visual review uses the user's written direction and before/after ElderMar images, not an asserted exact match.

## Stable composition and cache

Logical zoom remains separate from physical resolution. Materials have fixed world-space identity and opacity across the working range. Mountain/forest/settlement decomposition is disabled: authored macro illustrations stay in place. Legacy hierarchy helper code is dormant and consumes no scene cache. Zoom changes sampling and label display size, not the landscape composition.

Viewport cache keys use physical raster LOD, mode, texture, quality, atlas render version and explicit object visibility. Continuous zoom inside one raster LOD reuses images. Object min/max zoom ranges remain meaningful because their visibility signature is part of the key. SVG labels remain separate. The screen cache budget is 128 MiB, down from 192; worker terrain cache remains 32 tiles and material cache 256 patches. Camera movement does not increment worldRevision.

## Illustration changes

- Terrain tiles blend richer biome colors, canopy shade, several world-space texture scales and gentler relief. Low-opacity irregular ground patches, swamp pools, spatially clustered material marks and POI footing add layers without a global blur.
- World-scene placement uses stable uniform coordinate hashes for artwork variation, denser smaller forest clusters, rare large trees and coherent glades. Vegetation respects biome/density and POI/river exclusions. Mountain groups vary among existing peak/range art with smaller source demand.
- The worker prepares source-sized alpha feathers for mountain/tree bases once when assets arrive. It adds no source detail; sprites retain their original pixel budget. No new generated art or runtime service is required.
- Atlas path rendering uses two cached corner-cutting passes with pinned endpoints. Rivers cache a Path2D from that curve for a continuous tapered channel; roads use continuous casing rather than dashed capsule trails. Proximity/detail sampling follows the same curve. Authoritative path arrays remain intact; in-place edits invalidate the curve signature.
- New generation adds coherent forest clearings and short dry-land access trails from the existing network to landmarks, with fords where appropriate. Loading an old world does not regenerate it. The committed demo remains a legacy geography fixture for fair comparisons.

## Export and compatibility

PNG 2K/4K/8K remains supported. Optional 512px WebP tile export is retained with max logical zoom 2 and default DPR 2 (7200×4800 top extent for an 1800×1200 map). It is secondary to the editor. Manifest renderModel is atlas-v6 and cache algorithm 2, distinguishing the new rendering from old packages. Labels/vectors remain separate. Incremental package reuse is still not implemented.

Saved project schema remains v2 with existing detailModel defaults. Existing visibility ranges are preserved, including ranges outside the new camera range; users can edit them in the inspector. Finite custom/master/source warnings remain. No artwork can promise unlimited source resolution; Ultra or oversized custom objects may still exceed the budget.

## Verification

See VALIDATION.md for current measurements and artifact paths. npm test covers deterministic worlds/materials, cap/fit, source budget, path smoothing, access routes, local invalidation and compatibility. Browser suites cover 50/100/150/200%, DPR 1/2, whole/split pixels, stable cache reuse, editing and all PNG sizes. Performance comparisons use the same bounded camera workload and legacy demo, with rendering/export tests stopped during timing runs.
