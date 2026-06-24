# Pixso Design Testing Plugin

Export Pixso designs as test artifacts for Playwright visual and structural testing.

## Overview

The plugin exports selected Pixso frames or components into a ZIP archive containing:

| File | Description |
|---|---|
| `reference.png` | Golden reference screenshot (2x PNG by default) |
| `reference.svg` | Structural reference (optional) |
| `design.json` | Extracted design properties: layout, typography, colors, effects |
| `meta.json` | Metadata: design ID, version, dimensions, node path |
| `changelog.json` | Version history with comments |

## Architecture

```
src/
├── main.ts                          # Plugin entry, DI wiring, message routing
├── domain/
│   ├── models/                      # Core domain entities
│   │   ├── design-artifact.ts       # DesignArtifact aggregate root
│   │   ├── design-properties.ts     # Full design property tree (layout, typography, fills, etc.)
│   │   ├── design-version.ts        # Version tracking
│   │   ├── metadata.ts              # Contextual metadata
│   │   └── node.ts                  # Pixso node abstraction
│   ├── ports/                       # Abstract interfaces (dependency inversion)
│   │   ├── design-properties-extractor.port.ts
│   │   ├── image-exporter.port.ts
│   │   ├── metadata-extractor.port.ts
│   │   ├── node-reader.port.ts
│   │   └── artifact-storage.port.ts
│   └── services/                    # Domain services
├── application/                     # Use cases (orchestration)
│   └── export-design-artifact.usecase.ts
├── infrastructure/                  # Adapters (implement ports)
│   ├── pixso/
│   │   ├── pixso-design-properties-extractor.adapter.ts
│   │   ├── pixso-image-exporter.adapter.ts
│   │   ├── pixso-metadata-extractor.adapter.ts
│   │   └── pixso-node.adapter.ts
│   ├── storage/
│   └── mapping/
├── shared/
│   ├── archive.ts                   # ZIP creation via fflate
│   └── result.ts                    # Result<T,E> discriminated union
└── ui/
    ├── index.html                   # Plugin UI
    ├── index.ts                     # UI controller
    └── styles.css
```

## Development

```bash
npm install
npm run dev        # Dev server with HMR
npm run build      # Production build
npm run test       # Run tests
npm run typecheck  # TypeScript check
npm run pkg        # Package into .zip for distribution
```

## Export format

### `design.json` — Design properties

Recursively extracts the full design property tree from the selected node and all visible children:

- **Layout** — auto-layout settings (mode, wrap, padding, gap, alignment, sizing)
- **Typography** — font family, size, weight, letter spacing, line height, text alignment
- **Fills/strokes** — solid colors, gradients, image fills, stroke weight, dash pattern
- **Effects** — drop shadow, inner shadow, blur, blend mode
- **Corners** — corner radius (uniform and per-corner)
- **Constraints** — horizontal and vertical constraint types
- **Layout grids** — columns, rows, grid settings

See [design-properties.ts](src/domain/models/design-properties.ts) for the full type definitions.

### `reference.svg` — Structural reference

SVG export with:
- Text elements preserved as `<text>` (not outlined) via `svgOutlineText`
- Layer names as element IDs via `svgIdAttribute`
- Enables structural DOM comparison in Playwright tests

## Playwright integration

### Visual comparison (pixel-level)

```ts
import { expect } from '@playwright/test';

const page = await context.newPage();
await page.goto('/product-card');

await expect(page.locator('#product-card'))
  .toHaveScreenshot('reference.png');
```

### Layout verification (design.json)

```ts
import design from './artifacts/product-card/design.json';

await expect(page.locator('#product-card')).toHaveCSS('display', 'flex');
await expect(page.locator('#product-card')).toHaveCSS('flex-direction',
  design.layout?.mode === 'HORIZONTAL' ? 'row' : 'column');
await expect(page.locator('#product-card')).toHaveCSS('padding-top',
  `${design.layout?.paddingTop}px`);
```

### Typography verification

```ts
await expect(page.locator('.title')).toHaveCSS('font-size',
  `${design.children[0].typography.fontSize}px`);
await expect(page.locator('.title')).toHaveCSS('font-family',
  design.children[0].typography.fontName.family);
```

### SVG structural comparison

```ts
import { readFileSync } from 'fs';
import { parse } from 'svg-parser';

const referenceSvg = parse(readFileSync('artifacts/product-card/reference.svg', 'utf-8'));
const renderedSvg = parse(await page.locator('#product-card').innerHTML());

expect(renderedSvg).toMatchStructure(referenceSvg);
```

## License

MIT
