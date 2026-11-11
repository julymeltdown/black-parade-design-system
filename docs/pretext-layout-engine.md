# Pretext layout engine

The Atlas uses **`@chenglou/pretext@1.0.0`** to prepare real font measurements once and reuse them for headings, excerpts, figure flow, long-list height indexes and Mermaid labels. The implementation is [`src/lib/pretext-layout.ts`](../src/lib/pretext-layout.ts). Its tests use actual Canvas glyph metrics and the bundled Inter font, not character-count estimates.

## What the shared engine does

| API | Actual work | Result |
| --- | --- | --- |
| `getPreparedText(text, style)` | `prepareWithSegments` on a cache miss | The public Pretext handle, including segments, kinds and widths |
| `measureParagraph(text, width, style)` | `measureLineStats` and cached `measureNaturalWidth` | Height, line count, maximum line width and natural width |
| `balanceParagraph(text, width, style)` | Binary search with `layout`, followed by `layoutWithLines` | A tighter width preserving the original line count and font size |
| `clampParagraph(text, width, maxLines, style, ellipsis?)` | Cursor streaming into a measured ellipsis budget | Fitted visual lines and a separate native-text source prefix |
| `flowParagraph(text, width, style, exclusion?)` | `layoutNextLine` with a different width for each line band | One continuous source stream with `x`, `y` and `availableWidth` per line |
| `prepareParagraphIndex(items, width, style, options?)` | Wrapped paragraph heights and prefix offsets | Row metrics, typed arrays and total scroll height |
| `findVisibleRange(index, scrollTop, viewportHeight, overscan?)` | Two binary searches over the height index | A start index and an exclusive end index |

These APIs do not inspect element rectangles or insert hidden measurement paragraphs. Pretext preparation uses Canvas and may perform its own one-time browser font/emoji probes; the geometry passes operate on prepared measurements. “No DOM measurement in this module” does not mean the underlying preparation library never consults browser state.

## Shaping and preparation cache

```ts
type TextStyle = {
  font: string;
  lineHeight: number;
  letterSpacing?: number;
  whiteSpace?: 'normal' | 'pre-wrap';
  wordBreak?: 'normal' | 'keep-all';
};

const style: TextStyle = {
  font: '400 17px Inter',
  lineHeight: 28,
  letterSpacing: 0,
  whiteSpace: 'normal',
  wordBreak: 'normal',
};
```

The cache key contains **text, font, letter spacing, whitespace mode and word-break mode**. It deliberately excludes width and line height: neither changes preparation. Font strings are trimmed without altering spaces inside a quoted family name. Optional modes receive explicit defaults, and `-0` letter spacing normalizes to `0`.

The prepared-handle cache is a **512-entry LRU**. Reading an entry refreshes its recency. `setTextCacheCapacity(n)` accepts an integer from 1 to 4096 and evicts older handles immediately if the capacity shrinks. This is a bound on retained prepared entries, not a byte-level memory limit. Pretext has its own internal measurement caches; those are cleared on environment invalidation, not on every LRU eviction.

`invalidateTextCache(reason?)` clears both this cache and Pretext's internal cache, clears cached natural widths, and increments a generation. Already-issued handles remain snapshots of their previous environment. React consumers must recompute after the application's text-environment revision changes. Do not save prepared handles in JSON or depend on their private fields.

The browser-facing font helper loads actual fonts and text coverage before measuring. Its eight-second wait is bounded: a stalled request produces an informative native-layout fallback, clears its timer and in-flight entry, and can recover when the real font request later completes. A timeout never fabricates loaded glyphs. Its invalidation path handles font, locale and device-pixel-ratio changes. A locale change must be coordinated globally with Pretext's public `setLocale`, not performed independently by each component.

### Counters are cumulative

```ts
getTextCacheStats();
// {
//   revision, hits, misses, preparations, entries, capacity,
//   layoutPasses, invalidations, lastInvalidationReason
// }
```

`hits` and `misses` count calls to this module's preparation cache. `preparations` counts successful `prepareWithSegments` calls. `layoutPasses` counts calls made here to Pretext's geometry APIs: full layout, line statistics, natural-width measurements and streamed line steps. It counts calls, not paragraphs or elapsed time; a balanced heading performs several passes, and a streamed flow performs several line steps. The public source materializer is not counted as a geometry pass. Direct Pretext calls made by another module are not automatically included.

Invalidation does not zero these counters. Compare snapshots to show the work done by a specific interaction. Reading the snapshot causes no subscription or render loop.

`subscribeTextCache(listener)` is an optional diagnostics subscription. It returns an unsubscribe function and publishes one queued microtask after the current measurement batch, including font-driven measurements that finish after an initial animation frame. Subscribers read `getTextCacheStats()` in their callback. Keep that state in a diagnostics child so updating the counters does not trigger another measurement of every example. Notifications are never delivered synchronously from a measuring component's render stack, and this subscription is separate from the font-environment revision that invalidates geometry.

## Balanced headings keep native text semantics

```ts
const heading = balanceParagraph(title, availableWidth, {
  font: '700 40px "Bodoni Moda"',
  lineHeight: 44,
});
```

The algorithm records the original line count, then finds the narrowest quarter-pixel width that keeps it. It never changes the type size or truncates text. The result includes explicit lines for inspection, but the heading component paints **one semantic heading containing the complete original string**, at `balancedWidth`.

This is a tight-wrap strategy derived from the upstream bubbles demo, not a complete implementation of CSS `text-wrap: balance` or a global typographic scoring algorithm. Do not add browser `text-wrap: balance` on top of the measured width and then claim the resulting break decisions are those returned by Pretext. If an indivisible grapheme is wider than the container, the engine keeps the original width and reports its actual width rather than shrinking the text.

## Measured clamping and source preservation

```ts
const excerpt = clampParagraph(body, availableWidth, 3, style);
// excerpt.lines: visual line text, measured widths, source cursors
// excerpt.text: native text prefix followed by an ellipsis when truncated
// excerpt.totalLineCount: full source line count at this width
```

The final line reserves the ellipsis's **measured font width**. It then advances the original prepared cursor through the remaining budget, including a hanging space's width when continuing into another word. It never prepares the cropped strings produced for a particular width. The constant ellipsis and nonbreaking-space handles are warmed on the first nonempty clamp call, even when the original text initially fits, so narrowing that paragraph later does not introduce a tail preparation.

The final line's `end` cursor belongs to the original source and does not include the synthetic ellipsis. The public `materializeLineRange` API resolves partial segments using Pretext's grapheme boundaries. No UTF-16 character slicing is used to decide where to cut a word or an emoji.

The two output forms have deliberately different purposes:

- **`lines` are visual lines.** As in Pretext, they omit hard-break characters and may contain a visible discretionary hyphen. The last visual line already includes the ellipsis.
- **`text` is normalized source for a native paragraph.** It is reconstructed from prepared segments and the final cursor, preserving original hard breaks and soft hyphens. Only trailing whitespace from the final visible line is removed before appending the tail. Earlier line breaks remain intact: clamping `first\n\nthird` to two lines produces `first\n…`.

Never join line strings with an invented space: a line may end inside a long word or between Korean characters. Native rendering of the source prefix can redistribute discretionary hyphens or reflow a shortened word; returned line widths describe the explicit visual plan, not a second measurement of the native shortened paragraph. Native paragraphs retain browser shaping and selection behavior.

If the ellipsis itself cannot fit, a truncated clamp returns no fitted lines and no visible text. If an earlier indivisible grapheme is too wide, the fitted prefix is stopped and a fitting ellipsis is used. The UI must retain a way to read the complete content, such as expansion or an unmeasured native fallback. `maxLines <= 0` or a nonfinite value yields no visible lines. An empty ellipsis is supported. Newlines in a custom ellipsis are normalized to spaces.

## Variable-width text flow

```ts
const flow = flowParagraph(body, 360, style, {
  side: 'left',
  width: 112,
  height: 140,
  gap: 16,
  top: 0,
});
```

Each line occupies a vertical band of `lineHeight` pixels. If that entire band intersects the rectangular exclusion, the available width is reduced by `width + gap`. A left exclusion also changes `x`; a right exclusion leaves `x = 0`. Below the exclusion the text returns to the full width. `top` allows an exclusion to begin partway down a paragraph.

If an exclusion blocks the complete width, the engine jumps to the first line band below it without consuming source text. There is no arbitrary iteration cutoff that could silently discard the end of a paragraph. Every nonempty step must advance its cursor. `height` includes skipped vertical bands; `lineCount` counts text lines. Zero-width or invalid container measurements return an empty plan.

The output is one paragraph stream, not copies of a paragraph placed beside an image. Explicit line boxes preserve source spaces with `white-space: pre-wrap`, `overflow-wrap: normal` and `word-break: normal`; this lets trailing separator spaces hang rather than extending the measured ink width. Match the font and letter spacing, and keep the supplied line geometry. Native prose remains preferable for mixed-direction content. The component must keep the complete text selectable and readable without requiring its decorative exclusion.

## Real height indexes, with optional virtualization

```ts
const index = prepareParagraphIndex(entries, 320, style, {
  rowPadding: 8,
  rowExtraHeight: 20,
  gap: 6,
});
const visible = findVisibleRange(index, scrollTop, viewportHeight, 160);
const rows = index.items.slice(visible.start, visible.end);
```

`width` is the **already available text width**. `rowPadding` is vertical padding **per edge**; it is not subtracted from that width. `rowExtraHeight` accounts for a fixed heading or metadata area outside the measured paragraph. A row height is `lineCount × lineHeight + 2 × rowPadding + rowExtraHeight`. `gap` appears only between rows, not after the final row. Both prefix offsets and heights are stored as `Float64Array` values.

`findVisibleRange` uses pixel overscan. It includes rows whose vertical intervals intersect the overscanned viewport, returns an exclusive end, and performs two binary searches. Empty indexes and nonpositive or nonfinite viewport heights yield an empty range. This engine calculates geometry; it does not create a scroll container or change focus.

Virtualization is useful for the opt-in long-list example. The album's short track list does not need it. A complete native rendering must remain available for printing, browser find, assistive technology and layouts whose actual CSS cannot be predicted from the supplied style. A consumer that preserves a visible row on resize should anchor by row ID and offset, not reuse a raw old `scrollTop` against a new height map.

## Rendering agreement and limits

1. Load the exact named fonts with the actual text coverage before measuring. A loaded Latin subset does not prove a Korean fallback face has loaded. Changing font readiness requires cache invalidation.
2. Match `font`, numeric `line-height`, `letter-spacing`, `white-space` and `word-break` between Canvas preparation and rendered content. Font-feature settings, word spacing, generated content, automatic hyphenation and different letter-spacing rules are outside this style contract.
3. Pretext's break-word behavior expects corresponding `overflow-wrap: break-word`. Native browser typography and platform rasterization still require browser verification. Skia tests are not proof of identical Chrome, Safari and Firefox text metrics.
4. Pretext does **not** return bidi visual order. Mixed Arabic/Hebrew and Latin paragraphs should remain one native DOM paragraph with the appropriate direction. For `pre-wrap` content, `unicode-bidi: plaintext` lets each paragraph choose its direction. Per-line SVG or absolutely positioned text is not a bidi renderer.
5. Prepared segments follow Pretext's whitespace normalization. Untruncated `clamp.text` is `prepared.segments.join('')`, not necessarily the byte-identical input string. Preserve the original source separately in editors. A final newline does not create the same extra empty line in a paragraph as in a textarea.
6. Nonfinite or nonpositive container widths produce zero-width empty geometry. Font strings must be valid Canvas font shorthands; the module rejects an empty font, invalid line height and nonfinite letter spacing, but is not a complete CSS parser. An indivisible glyph may exceed a positive container width in ordinary measurement/flow; its reported width remains honest.

## Verified behavior

Run:

```sh
node --experimental-strip-types --test src/lib/pretext-layout.test.mjs
```

The eleven focused tests verify actual glyph-width budgets with `@napi-rs/canvas`, all shaping-cache keys, LRU eviction and generation invalidation, asynchronous batched diagnostics, preserved heading line counts, measured ellipsis, Korean text, combining marks, ZWJ emoji, hard breaks and blank lines, rectangular flow, prefix heights and visible ranges. The resize test warms **200 rows plus five algorithms**, then proves the narrower and wider passes add **zero** preparations. Editing one row adds exactly one preparation.

These are correctness and reuse assertions, not a claimed frames-per-second benchmark. Browser layout, font-loading behavior, selection and responsive visuals are checked separately in the example site.

## Upstream sources and version boundary

The implementation uses the installed **1.0.0** public API; cursor streaming takes `(prepared, width, cursor)`. Version 0.0.9 examples used a different argument order and should not be copied into this code.

Patterns were checked against the official repository at commit **`0d102a5cd933611e86a7e60bda7b4baa5995c6b0`**:

- [Public API and rendering caveats](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/README.md)
- [Public layout implementation](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/src/layout.ts)
- [Measured ellipsis and cursor-budget pattern](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/ellipsis.model.ts)
- [Tight-wrap binary search in the bubbles demo](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/bubbles.model.ts)
- [Variable line slots in the dynamic-layout demo](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/dynamic-layout.ts)
- [Measured long-list architecture](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/pages/demos/markdown-chat.md)
- [Changelog](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/CHANGELOG.md) and [license](https://github.com/chenglou/pretext/blob/0d102a5cd933611e86a7e60bda7b4baa5995c6b0/LICENSE)

The ellipsis and tight-wrap algorithms adapt those documented demo patterns to the shared cache, source-preserving native output and controlled edge cases here. Pretext is MIT licensed, copyright © 2026 Pretext contributors; retain its full license and bundled notices when redistributing. Upstream `main` also contains unreleased changes, so a commit link is provenance, not a claim that its bytes equal the published npm package.
