# Pretext components

Seven React + TypeScript components turn measured text into usable reading interfaces. The live **System → Pretext** laboratory lets you change the available width, switch English / Korean / mixed emoji samples, edit the shared passage, and inspect actual preparation and layout counters.

These components use `@chenglou/pretext@1.0.0`. They are implemented in this repository; they are not components supplied by the upstream package.

## Files and imports

```tsx
import {
  BalancedHeading,
  TextExcerpt,
  FlowText,
  MeasuredTextArea,
  RichInlineText,
  MeasuredTextList,
  PassageOutline,
  READING_TEXT,
  INTERFACE_TEXT,
} from './pretext';
import type { TextStyle, RichInlineRun } from './pretext';
```

The barrel imports the scoped `pretext.css` stylesheet. Keep the design system's paper, ink and blood color tokens available. No additional runtime package is required beyond the dependencies in `package.json`.

| File | Responsibility |
| --- | --- |
| `src/pretext/components.tsx` | The seven public components and their prop types |
| `src/pretext/useTextLayout.ts` | Content-box observation, actual-text font readiness, typography mapping and safe fallbacks |
| `src/pretext/pretext.css` | Scoped presentation, native controls and responsive behavior |
| `src/lib/pretext-layout.ts` | Shared preparation cache, paragraph operations and measured list index |
| `src/lib/pretext-fonts.ts` | Font/subset, document language and pixel-density invalidation |
| `src/pages/PretextLab.tsx` | Editable demonstrations and live operation counts |

## One typography contract

```ts
type TextStyle = {
  font: string;             // Complete CSS font shorthand, with a px size.
  lineHeight: number;       // CSS pixels, positive and finite.
  letterSpacing?: number;   // CSS pixels; default 0.
  whiteSpace?: 'normal' | 'pre-wrap';
  wordBreak?: 'normal' | 'keep-all';
};

const noteStyle: TextStyle = {
  font: '400 18px "Source Serif 4", "Noto Sans KR Variable", serif',
  lineHeight: 30,
  letterSpacing: 0,
  whiteSpace: 'normal',
  wordBreak: 'normal',
};
```

The same values reach Pretext's Canvas preparation and the painted DOM. Do not override font, letter spacing, word spacing, line height or text transformation through a descendant CSS selector after supplying `textStyle`. Change the prop instead. Use an explicit loaded font stack. The reading face is bundled Source Serif 4 and the Korean fallback is bundled Noto Sans KR Variable, rather than unidentified platform fallback fonts.

For painting, the browser's CSS parser expands the complete font shorthand into font-family, size, weight, style, stretch and variant longhands. React therefore updates those properties without a shorthand resetting the separately supplied line height or kerning/features. Parsed values are cached; no element is mounted or measured. A pure parser for the explicit px-sized contract provides the server-rendered fallback and preserves the family list as one CSS value.

The shared hook calls `document.fonts.load(font, actualText)`. Passing the actual text requests the relevant Unicode-range subsets, including Korean. Components stay readable as native text while fonts load or a measurement cannot be produced. A `ResizeObserver` reads the element's **content width**; no rendered text-node height is read to compute a new text layout. Width changes reuse preparation handles. Font, language and pixel-density changes invalidate those handles through the shared coordinator.

The prepared-text cache is bounded at 512 entries. Its preparation key includes normalized source text, font and preparation options; line height and available width are layout inputs. The rich-inline component retains its own opaque prepared handle because its input consists of differently styled items.

## 1. BalancedHeading

Finds a smaller heading width that preserves the line count measured at the full available width. It renders a real heading, keeps the supplied font size and leaves the browser responsible for painting text.

```tsx
<BalancedHeading
  as="h2"
  text="A record about death. A reason to feel alive."
  textStyle={{
    font: '700 40px "Bodoni Moda", "Noto Sans KR Variable", serif',
    lineHeight: 46,
  }}
/>
```

| Prop | Type / default |
| --- | --- |
| `text` | Required `string` |
| `as` | `h1` … `h6`; `h2` |
| `textStyle` | `TextStyle`; `DISPLAY_TEXT` (40px / 46px) |
| `align` | `start` or `center`; `start` |
| `id`, `className` | Optional strings |

**Pretext path:** cached `prepareWithSegments` → `layout` during a width search → `layoutWithLines`. An indivisible glyph can still exceed a very narrow measure; the core keeps the full available width instead of pretending that glyph fits a smaller box. This is width balancing, not font shrinking.

## 2. TextExcerpt

Creates a real measured line budget with an ellipsis included in the final line's width. The native button expands the complete original passage and restores the preview when pressed again.

```tsx
<TextExcerpt
  text={post.body}
  maxLines={3}
  textStyle={INTERFACE_TEXT}
  moreLabel="Read the complete note"
  lessLabel="Collapse note"
/>
```

| Prop | Type / default |
| --- | --- |
| `text` | Required `string` |
| `maxLines` | Number; `3`, minimum `1` |
| `textStyle` | `TextStyle`; `READING_TEXT` (18px / 30px) |
| `moreLabel`, `lessLabel` | Optional button labels |
| `defaultExpanded` | Boolean; `false` |
| `className` | Optional string |

**Pretext path:** line count → `layoutNextLine` cursors → measured ellipsis and final-line fitting. The core reconstructs the normalized source prefix rather than joining visual lines with spaces. This preserves CJK, emoji clusters, long tokens and hard breaks. There is no CSS `line-clamp` dependency and no HTML injection.

The collapsed preview paints the exact fitted lines as selectable spans inside one native paragraph. This avoids a browser reflow of the shortened final word adding a fourth line to a three-line budget. Line boxes use `white-space: pre-wrap` with normal overflow wrapping: trailing spaces remain in the DOM and hang at the line edge, matching Pretext's fitted ink width. The expanded state restores the original native paragraph. There is no hidden text duplicate. `aria-expanded` and `aria-controls` describe the expansion button. If the whole passage fits, there is no redundant button. Arabic/Hebrew, explicit bidi controls and discretionary soft-hyphen / zero-width-control content retain a complete native paragraph instead of a potentially incorrect manual truncation. With no usable width or no font readiness, the full passage remains visible.

## 3. FlowText

Continues one source cursor through different line widths around an image with explicit geometry. Lines that intersect the image use the reduced width; lines below it use the full width.

```tsx
<FlowText
  text={passage}
  textStyle={READING_TEXT}
  inset={{
    src: '/assets/parade-artwork.png',
    alt: 'Detail of the procession artwork',
    width: 130,
    height: 182,
    side: 'right',
    gap: 20,
  }}
/>
```

| Prop | Type / default |
| --- | --- |
| `text` | Required `string` |
| `inset` | Required `{ src, alt, width, height, side?, gap? }` |
| `inset.side` | `left` or `right`; `right` |
| `inset.gap` | CSS pixels; `20` |
| `textStyle` | `TextStyle`; `READING_TEXT` |
| `className` | Optional string |

**Pretext path:** repeated `layoutNextLine` calls using each line's available width and the preceding cursor. The component paints selectable native spans inside one paragraph, preserving source order and hard breaks. As with excerpts, pre-wrap line boxes preserve trailing separator spaces while allowing those spaces to hang outside the fitted ink. It does not rasterize the words.

The component requires at least 170px of reading space beside the inset. Below that threshold it stacks the image before a normal paragraph. It also uses this complete native fallback for bidi-sensitive text, discretionary soft hyphens / zero-width controls, missing measurements, or an overwide indivisible line. These fallbacks preserve reading and selection rather than clipping a line. Geometry is an explicit rectangle; arbitrary DOM children and contour extraction are outside this component's contract.

## 4. MeasuredTextArea

Sizes a native textarea from pre-wrap line measurement. Editing, selection, undo, keyboard input and the caret remain native browser behavior.

```tsx
const [note, setNote] = useState('');

<MeasuredTextArea
  label="Your listening note"
  value={note}
  onChange={setNote}
  minRows={3}
  maxRows={8}
  maxLength={2400}
  hint="A specific moment is a useful place to begin."
/>
```

| Prop | Type / default |
| --- | --- |
| `label` | Required visible label |
| `value` | Required controlled `string` |
| `onChange` | Required `(value: string) => void`; receives the string, not the event |
| `textStyle` | `TextStyle`; `INTERFACE_TEXT` (16px / 26px) |
| `minRows`, `maxRows` | Numbers; `3`, `8` |
| `hint`, `error` | Optional strings linked with `aria-describedby` |
| Native textarea props | Supported except `value`, `defaultValue`, `onChange`, `rows`, `style` |

**Pretext path:** `prepareWithSegments` with `whiteSpace: 'pre-wrap'` → `measureLineStats`. An empty value and a trailing newline receive a final caret line. CRLF is normalized to LF consistently for measurement and the controlled input. The box includes its actual 20px vertical padding and 2px total border; changing those CSS values requires changing the sizing contract as well. The content-box observer accounts for horizontal padding and the scrollbar.

Height is bounded by `minRows` / `maxRows`, with native scrolling after the maximum. The default input font is 16px to avoid the small-input zoom behavior on mobile browsers. Use a custom style of at least 16px for touch layouts. The textarea remains manually resizable within the same bounds.

## 5. RichInlineText

Measures styled text as one paragraph with `@chenglou/pretext/rich-inline`. This supports explicit font changes, code fragments, per-fragment inline padding and an atomic tag without estimating every run as if it used one font.

```tsx
const items: readonly RichInlineRun[] = [
  { text: 'Read the ', font: INTERFACE_TEXT.font },
  { text: 'annotation', font: '600 16px Inter', kind: 'emphasis' },
  { text: ' with ', font: INTERFACE_TEXT.font },
  {
    text: 'layoutNextLineRange()',
    font: '400 14px "Courier New"',
    kind: 'code',
    paddingInline: 4,
  },
  { text: ' and an ', font: INTERFACE_TEXT.font },
  {
    text: 'EDITORIAL NOTE', font: '600 12px Inter',
    kind: 'tag', atomic: true, paddingInline: 6,
  },
];

<RichInlineText items={items} lineHeight={30} />
```

```ts
type RichInlineRun = {
  text: string;
  font: string;
  kind?: 'text' | 'emphasis' | 'code' | 'tag';
  atomic?: boolean;
  paddingInline?: number;
  letterSpacing?: number;
};

type RichInlineTextProps = {
  items: readonly RichInlineRun[];
  lineHeight?: number; // Default 28 CSS pixels.
  className?: string;
};
```

**Pretext path:** `prepareRichInline` → `walkRichInlineLineRanges` → `materializeRichInlineLineRange`. Preparation is memoized independently of container width. Each fragment keeps its source item, source offsets and measured `occupiedWidth`. A gap uses `gapBefore` and the font identified by **`gapItemIndex`**, not an assumed default-space width. `paddingInline × 2` becomes `extraWidth`; tags and explicitly atomic runs use `break: 'never'`.

The supplied content is data, not arbitrary React children or HTML. Use complete CSS font shorthands and enough line height for the largest run. An atomic item wider than the container, bidi-sensitive content or discretionary control characters produce complete native inline text that can wrap instead of a clipped object. The component does not implement a rich-text editor, DOM-based inline widgets or interactive controls inside measured fragments. The example contains original editorial text.

## 6. MeasuredTextList

Builds a paragraph-height index and uses its prefix sums to locate visible rows. Native complete rendering is the default; virtualization is explicitly enabled for large, read-only lists.

```tsx
// Accessible complete mode; every item remains mounted.
<MeasuredTextList items={notes} label="Listening notes" />

// Explicit large-list mode; includes a visible “Show all” action.
<MeasuredTextList
  items={twoHundredSampleNotes}
  virtualized
  height={360}
  overscan={120}
  label="Sample editorial notes"
/>
```

| Prop | Type / default |
| --- | --- |
| `items` | Required readonly array of `{ id: string; text: string }` |
| `textStyle` | `TextStyle`; `INTERFACE_TEXT` |
| `height` | Viewport height in CSS pixels; `360` |
| `virtualized` | Boolean; `false` |
| `overscan` | Additional pixels before/after the viewport; `120` |
| `label` | Accessible scroll-region label |
| `className` | Optional string |

**Pretext path:** `measureLineStats` for each prepared paragraph → cumulative `tops` / `heights` arrays → binary-search `findVisibleRange`. The component accounts for a 30px number column, 12px column gap and 12px vertical padding on each edge. Blank rows still reserve one line for their number. Item IDs must be unique and stable.

When width changes, it remembers the first visible item ID and pixel offset, then anchors the new index to that item. Preparation handles survive a pure width change. The list is read-only, so a virtualized child does not contain an editable or focusable control that could disappear while focused. The scroll region itself stays focusable.

Virtualized content has an honest accessibility tradeoff: unmounted items are unavailable to browser find, continuous selection and assistive technology. The visible **Show all for find & selection** action restores every native `<li>`. Complete mode is also used until measurement is ready and for bidi-sensitive content. The site's original 14-track record list is not virtualized. The lab's 200 notes are generated from original demonstration prose, not album metadata.

## 7. PassageOutline

Gives wrapped navigation labels a measured minimum height while retaining normal links and their original reading order.

```tsx
<PassageOutline
  label="In this reading"
  currentId={activePassage}
  items={[
    { id: 'arrival', label: 'The opening changes the scale of the room', href: '#arrival' },
    { id: 'procession', label: 'A private memory becomes a procession', href: '#procession' },
  ]}
  onNavigate={id => {
    setActivePassage(id);
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }}
/>
```

| Prop | Type / default |
| --- | --- |
| `items` | Required readonly array of `{ id, label, href, detail? }` |
| `currentId` | Optional selected item ID |
| `label` | Navigation accessible name; `On this page` |
| `textStyle` | `TextStyle`; `INTERFACE_TEXT` |
| `onNavigate` | Optional `(id: string) => void` |
| `className` | Optional string |

**Pretext path:** `measureParagraph` for each label at content width minus the number column and gap. Targets have at least 44px height; optional detail text is allowed to extend the natural row rather than being clipped to a guessed height. Selection uses `aria-current="location"` and an ink-color change, with no filled navigation panel.

Without `onNavigate`, anchors behave normally. With a callback, unmodified activation is handled by the callback; modified clicks retain normal browser behavior. The application uses a hash router, so its demos supply a callback to avoid treating a section anchor as a page-route change. The lab callback also focuses the destination heading.

## Diagnostics and reproducible inspection

The lab exposes real counters from the shared engine: cache entries/capacity, hits, preparation count, layout passes, generation and last invalidation reason. They are **operation counts, not speed benchmarks**. Rich-inline preparation is a separate memoized upstream handle and is not included in the shared plain-text cache count.

Inspectable attributes are included for integration checks:

- `.pretext-lab`: `data-font-ready`, `data-font-error`, `data-font-revision`, `data-canvas-width`. A nonempty font error also produces a visible native-fallback status message.
- `.pretext-lab__evidence`: `data-cache-entries`, `data-cache-preparations`, `data-cache-hits`, `data-cache-layout-passes`. This child subscribes to batched engine notifications; reading the counters does not rerender the measured specimens.
- Component roots: `data-pretext-state="native|measured"`; supported specimens also expose their line count, selected width or measured height.
- List: `data-pretext-total`, `data-pretext-mounted`, `data-pretext-height`.
- Rich fragments: `data-source-item`, `data-source-start`, `data-source-end`.

Wait for font readiness and the relevant component's measured state, then resize the canvas. For unchanged source and typography, the preparation count should remain stable after auxiliary handles have warmed; layout passes may increase. A new text sample or newly loaded font subset may legitimately create preparations or invalidate cached text.

Use the Korean and emoji samples to check real font-subset loading and grapheme boundaries. Use the bidirectional sample to verify native fallbacks. Expand an excerpt to verify no source text was lost. Add an empty line at the end of the textarea to inspect its caret line. Switch the list to complete mode to confirm all 200 entries are mounted.

## Rendering and support limits

All text is native selectable DOM text. There is no `dangerouslySetInnerHTML`, bitmap text layer or clipboard interception. Collapsed excerpts, manual flow and rich-inline rendering introduce visual line spans; copied text can contain browser-generated line breaks at those spans. They preserve the words and source order rather than claiming byte-for-byte clipboard formatting.

The modules have no import-time `window` or `document` access. Server rendering and the first client render show complete native text. Resize observation and font loading happen after mount. If the required browser API is absent, the complete native fallback remains readable.

The engine does not replace the browser's complete bidirectional paragraph algorithm. Arabic, Hebrew and explicit bidi controls use native paragraphs in manual flow, truncation, rich-inline and virtualized-list views. Complex-script fit and assistive-technology behavior need verification in the browsers and devices supported by a consuming app. Desktop responsive emulation is not evidence of physical iOS/Android testing.

The typography defaults, pixel arithmetic and CSS work together. Custom borders, padding, transforms or fonts must update the matching measurement contract. Invalid or unavailable measurement returns readable native content; it is not treated as evidence of a precise fit.

## Upstream references

- [Pretext repository and documentation](https://github.com/chenglou/pretext)
- [Pretext npm package](https://www.npmjs.com/package/@chenglou/pretext)
- The installed `@chenglou/pretext/dist/layout.d.ts` and `rich-inline.d.ts` define the actual APIs used here.

For the shared engine's cache behavior and focused regression checks, see [pretext-layout-engine.md](./pretext-layout-engine.md).
