# Pretext integration: sources and adaptation notes

The project runs the published **`@chenglou/pretext@1.0.0`** package. It does not vendor a second text engine, estimate width from character counts, or depend on undocumented package internals. Package versions are pinned in `package-lock.json`.

The implementation was checked against the upstream source at commit [`0d102a5cd933611e86a7e60bda7b4baa5995c6b0`](https://github.com/chenglou/pretext/tree/0d102a5cd933611e86a7e60bda7b4baa5995c6b0). That source has changes after the published release; this project uses only public APIs available in the installed 1.0.0 package.

## What was adapted

| Primary source | Pattern used here | Project implementation |
| --- | --- | --- |
| [README and public API](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/README.md) | Separate expensive font preparation from width-dependent layout; prepare after fonts load | `src/lib/pretext-layout.ts`, `src/lib/pretext-fonts.ts` |
| [Bubbles model](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/bubbles.model.ts) | Find a tighter width that preserves a heading's line count | `balanceParagraph()` and `BalancedHeading` |
| [Ellipsis model](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/ellipsis.model.ts) | Reserve measured ellipsis width; continue through public grapheme cursors; account for a trailing space | `clampParagraph()`, `TextExcerpt`, Mermaid excerpt labels |
| [Dynamic layout demo](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/dynamic-layout.ts) | Continue one prepared text stream through different line widths | `flowParagraph()` and `FlowText` |
| [Rich note model](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/rich-note.model.ts) | Prepare different fonts and atomic items; keep each fragment's source ownership, occupied width and gap ownership | `RichInlineText` |
| [Markdown chat design](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/markdown-chat.md) | Calculate row heights before painting; index their cumulative offsets; preserve the visible item when width changes | `prepareParagraphIndex()`, `findVisibleRange()`, `MeasuredTextList` |

These patterns are integrated into typed React components with the archive's typography, controlled state, native input semantics, native text fallbacks and responsive rules. The demos' unrelated UI, sample conversations and branding are not copied. The Mermaid adapter is project code: Pretext supplies label geometry, and Mermaid independently supplies graph geometry.

## Attribution and license

The upstream package is MIT licensed. Its complete distributed license, including its retained Chromium, WebKit and Unicode notices, is included at [`vendor/pretext/LICENSE`](vendor/pretext/LICENSE). Retain that file when redistributing the adapted implementation.

Our `clampParagraph()` follows the upstream ellipsis demo's cursor-and-space budgeting approach. Heading width search, rectangular exclusion flow and rich-inline painting follow the corresponding examples listed above. The shared bounded cache, environment coordinator, reusable React API, native editing controls, product-page integration and test harness are project integration work.

## Limits made explicit

- `prepareWithSegments()` performs Canvas measurement; width-only layout reuses the returned handle. The diagnostics count operations, not elapsed-time benchmarks.
- A width-only resize after warm-up creates no new preparations while its sources remain inside the 512-entry cache. An eviction, changed text or shaping style, font load, locale change or pixel-ratio change can require preparation again.
- The mixed-font component keeps its own prepared rich-inline handle. Its preparation count is not included in the plain-text cache counters.
- Manually painted lines are used only when the component can preserve the text and visual ordering. Native paragraph fallback handles unsupported or bidirectional cases. The complete source remains available.
- Node Canvas tests and browser geometry checks answer different questions. See [the engine contract](pretext-layout-engine.md), [the component API](pretext-components.md), and [v1.3 verification](verification-v1.3.md) for their actual scope.
