# Original atlas assets

All three atlases were generated for this project using the built-in **image_gen** tool. The user's reference was used only for the artistic direction; no reference pixels or assets were copied. The generated PNGs preserve transparency. They are consumed as cell-based illustration sources, with deterministic variation in position, size and mirroring.

- `assets/atlas.png`: 16 landscape clusters and landmarks.
- `assets/details.png`: 8 individual mountain variants and 8 tree-group variants.
- `assets/landmarks.png`: 8 additional painted camp, fortification, cemetery, shrine and waterfall variants. Four columns and two rows; renderer indices 32–39.
- `assets/atlas-data.js`, `assets/details-data.js`: identical image bytes embedded as data URLs to keep Canvas export working when index.html is opened directly from disk.

## Prompt: atlas.png

Use case: stylized-concept. Asset type: production sprite atlas for an illustrated premium dark fantasy WORLD MAP editor, NOT UI. Generate a 2048x2048 image, a precisely aligned 4 columns by 4 rows grid of 16 independent sprites on GENUINELY TRANSPARENT background, no grid lines, no text, no labels. Every sprite entirely contained in its own equal square cell with at least 12% transparent margin all sides, bottom center anchored. Common viewpoint elevated 60-degree birdseye isometric fantasy atlas illustration, orthographic, soft overcast light from upper left, exquisite hand-painted semi-realistic tiny details, restrained sage/olive woodland, cool slate stone, parchment snow, ancient mysterious world, illustrated AAA strategy game art, painterly realistic not cartoon not vector. Row 1 cells left to right: long craggy gray mountain ridge with multiple irregular peaks; long alpine snow-capped mountain ridge; low jagged weathered rocky foothills; dark volcanic crag formation. Row 2: dense irregular cluster of 10 mixed ancient broadleaf trees in deep olive sage hues; dense irregular cluster of 12 tall northern conifers; sparse twisted dead woodland trees with moss; wetland willow cluster with reeds. Row 3: large ancient dark gothic fortress with spires and subtle ember windows; ruined stone fortress with broken towers and moss; small medieval village with warm pitched roofs; tall isolated watchtower with winding stone stairs. Row 4: ancient cathedral shrine with pale stone and flying buttresses; standing stone druid circle surrounding faint cyan rune; enormous ancient world tree with twisting trunk and sprawling emerald canopy; broken stone arch portal with subtle luminous turquoise center. Paint ONLY the isolated features, no square ground tiles, NO rectangular background, no sky, no horizon, no grass platform, no drop shadow except small natural contact shadows. Natural edge silhouettes fade into transparency. Very high texture detail, excellent readable silhouettes from a distance. Each sprite is a cohesive varied cluster, never repeated identical objects. Fully transparent empty gutters essential.

## Prompt: details.png

Use case stylized-concept. Production additional sprite atlas for premium illustrated fantasy world map. Exact square 4x4 grid of 16 independent isolated features, each centered in own cell with 15% transparent margins on all sides. GENUINELY TRANSPARENT BACKGROUND. No text, labels, grid, or ground tiles. View birdseye elevated 60 degrees, orthographic hand painted semi-realistic natural detail, desaturated sage gray rock, moss, ivory snow. Strong painterly realistic AAA atlas art, NOT cartoon. Row 1: four DISTINCT INDIVIDUAL gray mountain peaks, each small isolated craggy mountain, one slender steep peak, one wide eroded dome, one twin summit, one irregular jagged spire. Not long mountain chains. Row 2: four distinctly different individual alpine snow-capped mountains, irregular snow distribution, exposed gray rock, one tall narrow, one broad massif, one twin peak, one three small peaks. Row 3: four different small clusters of 3-5 ancient broadleaf trees, irregular crowns of sage olive green, include one amber autumn copse. Row 4: four different small clusters of 3-5 conifers, mixed height, deep desaturated forest green. Upper left diffuse sunlight consistent. Shadows subtle natural contact only. Fine internal detail. All assets fully isolated on transparent background and do not touch other cells. NO square grass patches, NO base platforms, NO large forests, NO scenery, NO horizon. Rich hand-painted miniature illustration art.

## Typography

Cormorant Garamond and Manrope are bundled locally in `assets/fonts`. Their SIL Open Font License texts are included in that directory. Font files came from Google Fonts. `scripts/bundle-fonts.cjs` is an optional maintenance script; the running editor never needs to fetch fonts or illustrations from a remote service.

## Atelier 03 — четыре новых набора

Созданы встроенным инструментом image_gen, без CLI/API-ключей, специально для Worldsmith. Прозрачный alpha-канал сохранён. Старые атласы не удалялись. Новые изображения не копируют ассеты пользовательского референса.

- assets/settlements-v3.png — 16 поселений; точный промпт: assets/settlements-prompt.txt.
- assets/citadels-v3.png — 16 укреплений и святынь; точный промпт: assets/citadels-prompt.txt.
- assets/relics-v3.png — 16 руин, инфраструктурных и магических объектов; точный промпт: assets/relics-prompt.txt.
- assets/wilds-v3.png — 16 природных и мистических объектов; точный промпт: assets/wilds-prompt.txt.

Все наборы: 4×4 ячейки. Модуль assets.js использует фактическое разрешение PNG. Файлы *-data.js — встроенные копии для автономного запуска. В каталоге 100 типов; некоторые родственные типы намеренно используют один исходный рисунок с другим размером. Всего с прежними наборами 104 исходных рисованных элемента. Микрофактура земли создаётся алгоритмом в surface.js, а не растровой подложкой.

## Atelier 04 — самостоятельные мастер-ассеты

Режим создания: встроенный image_gen, новые оригинальные bitmap-иллюстрации для этого проекта. Каждый файл имеет размер 1254×1254 px и прозрачный фон:

- assets/master-castle.png — замок; точный промпт assets/master-castle-prompt.txt.
- assets/master-city.png — портовый город; точный промпт assets/master-city-prompt.txt.
- assets/master-bridge.png — мост; точный промпт assets/master-bridge-prompt.txt.
- assets/master-temple.png — собор; точный промпт assets/master-temple-prompt.txt.

Файлы master-*-data.js — встроенные копии оригиналов. Всего 108 исходных рисованных элементов и 104 конфигурируемых типа объектов. Мастер-ассеты также заменяют соответствующие старые замок, портовый город, мост и храм на карте. Старые ячейки других атласов остаются примерно 254–312 px: их исходная детализация ограничена. Asset LOD выбирается по физическому размеру на экране, без предварительного сведения объектов в малую общую текстуру. Новая процедурная микрофактура земли находится в terrain-tiles.js и surface.js.
# Semantic detail reuse

The semantic renderer introduces no new downloaded/generated artwork. It reuses the bundled peak variants (16–23), conifer groups (28–31), small houses/farms/market, ruin fragments, rock (88), oak (92) and dead tree (93) crops at smaller world sizes. Ground chips, grass/reeds, roots/logs, snow breaks, water marks and path detail are local vector primitives. Original licenses/provenance below still apply.

Ordinary source crops remain about 311–313 px; landmark crops and 1254-pixel masters retain their existing finite sizes. The render worker measures source demand. Supported parent groups cross-fade into smaller children; unsupported landmarks, excessive instance scales and custom assets retain a visible source-limit warning. No upscaling claim is made. See [SEMANTIC_ZOOM.md](SEMANTIC_ZOOM.md).

## v0.6 atlas compositing

No new bitmap artwork was introduced. The worker prepares source-sized alpha feathers for the lower edges of mountain and forest cells to blend their flat bases into the terrain. Source resolution is unchanged. Ground pools, material strokes, shadows and POI footing are procedural Canvas layers. Existing masters and custom images keep their native-resolution warnings. Original reference pixels are unavailable in this repository, so exact reference matching is not claimed.
