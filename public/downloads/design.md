# The Parade Archive — Design System

Version 1.3 · 11 November 2026 · 28 foundation components · 7 Pretext text components · React + TypeScript · Responsive web

This document defines the visual and interaction contract for **The Parade Archive**, an independent example application inspired by My Chemical Romance's third album, *The Black Parade*. “Welcome to the Black Parade” identifies the song and related film; it is not used as the album's title.

The system must support two equally important experiences: an expressive album archive and an everyday interface that remains easy to read, navigate and operate on a phone. The reference study and asset provenance are in [docs/references.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/references.md); actual licensed reader CSS adaptations are documented in [docs/reading-provenance.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/reading-provenance.md). Rules below describe the intended contract. Current checks belong to [docs/verification-v1.3.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/verification-v1.3.md); the earlier [verification record](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/verification.md) and original screenshots are explicitly historical v1.2 evidence. A requirement here is not a claim that a browser test passed.

## 1. Art direction

### Printed matter, familiar interaction

The visual model is a worn record sleeve, an oversized concert heading and a carefully typeset archive. A continuous pale, cool paper field carries black type and unframed imagery. Large Bodoni Moda headings supply theatrical scale. Georgia supports long passages and track commentary; Inter keeps controls and labels direct. Barlow Condensed gives selected editorial metadata the rhythm of printed programme notes. Space supports grouping without creating empty panels around short content.

The paper must remain visibly textured at normal viewing size. A flat beige background with a generic noise overlay is insufficient. Conversely, black stains must not cross text or make the interface look like a distressed poster photograph.

Use familiar product behavior from the inspected references: Spotify's track hierarchy, YouTube's media/detail relationship and Reddit's continuous discussion structure. The surrounding composition follows the inspected Cynthia Ugwu, REJOUICE and Obys clone CSS: quiet text navigation, a dominant typographic gesture, intentional alignment and a continuous canvas. Product behavior does not dictate dashboard chrome.

### Non-negotiable constraints

- Controls, panels, thumbnails and content sections have **0px corner radius**. Circular icons may depict circles; this does not license pill buttons.
- Separate content through whitespace, typography and alignment. Remove all page partition lines, section rules and boxed content regions.
- No fixed sidebar, bottom navigation, viewport-dividing bars, filled active-navigation backgrounds or persistent dashboard shell.
- The masthead is transparent and borderless, with small plain-text desktop links. Mobile uses an Index action that opens a type-only table of contents.
- Do not introduce colored vertical accent rails, glowing controls, gradients as decoration, glass panels or large floating shadows.
- Oxblood is the only expressive UI accent. Reserve it for a meaningful inline action, error or small editorial detail. Navigation and filter selection remain monochrome and unfilled.
- Keep photographs and cover art recognizable. Do not place arbitrary grunge filters over faces.
- Preserve a clear reading order when art, title and controls overlap visually. Decorative composition never changes the accessible order.

## 2. Foundations and tokens

Product styles consume semantic CSS custom properties. TypeScript token exports support documentation and component composition. Change shared values in the foundation instead of scattering new literals through page CSS.

### Color

| CSS token | Value | Role |
| --- | --- | --- |
| `--paper` | `#e9e6dd` | Main canvas and textured ground |
| `--paper-light` | `#f1eee6` | Quiet reading surfaces, inputs and sheets |
| `--ink` | `#1c1b18` | Body text, headings, strong outlines and primary controls |
| `--muted` | `#67635b` | Secondary text and supporting metadata |
| `--line` | `#b6b0a3` | Retained neutral token for specimen data; never a page divider |
| `--blood` | `#782f2d` | Restrained inline emphasis and error text; never navigation fill |

Calculated solid-color contrast against `--paper` is approximately 13.80:1 for ink, 4.79:1 for muted and 7.50:1 for blood. Against paper-light those ratios are 14.85:1, 5.16:1 and 8.07:1. These calculations use relative luminance; they do not certify the textured rendered background. Check the darkest texture area actually behind text.

The line token is only 1.73:1 against paper. It must not be the sole visible boundary of an essential control, and this revision does not use it to divide the canvas. Use ink or muted for functional input boundaries and focus indicators. Status must include text or an icon with an accessible label, never color alone. See the [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### Spacing and geometry

The spacing scale is **4, 8, 12, 16, 24, 32, 48 and 64px**. Use 4–12px within compact controls and 16–24px between related elements. Routine editorial groups use 28–32px separation; reserve 48–64px for a major composition change. Track notes and the longform reader must not contain large empty panels or oversized section gaps. A large hero may use responsive spacing derived from this scale.

Functional form boundaries may use a 1px stroke; visible focus uses a strong local outline. These are the exceptions, not a visual framing system. All panel and control radii are zero. A visible 20px icon belongs inside a hit area of at least 44 × 44px. Do not inflate the icon itself to fill that target.

Keep layers ordered: ordinary content and in-flow masthead, video dock, dialog backdrop, dialog, transient status. Native modal dialogs use the browser top layer. A compatibility token named `sticky` does not require a sticky interface. Do not attempt to defeat the top layer with arbitrary z-index values.

### Typography

| Role | Family | Target behavior |
| --- | --- | --- |
| Archive display | Bodoni Moda, Georgia, serif | Large, high-contrast serif; fluid size; tight but readable leading |
| Section heading | Bodoni Moda, Georgia, serif | Approximately 32–56px by space available |
| Body and controls | Inter, system-ui, sans-serif | 16px base; 1.5–1.65 reading line height |
| Longform reading | Georgia, Times New Roman, serif | 18px desktop, 17px mobile; 1.8 line height; maximum 65ch measure |
| Expanded track notes | Georgia, Times New Roman, serif | 18px desktop, 17px mobile; 1.7 line height; maximum 65ch measure |
| Metadata | Barlow Condensed, Arial Narrow, sans-serif | Compact uppercase labels; normally 13–16px |
| Numbers | Inherit with tabular numerals | Stable alignment for track indices and durations |

A suggested display range is `clamp(3.4rem, 8.5vw, 9.5rem)`; composition may require separate lines. Avoid scaling a long heading until it becomes small body text. Prefer an intentional wrap and `text-wrap: balance`.

Body paragraphs should usually remain within 65–72 characters per line. Form controls use at least 16px text on mobile. Long titles wrap in reading views; compact docks may truncate while retaining the full accessible name. Do not use condensed uppercase styling for paragraphs or error explanations. Font loading must have local fallbacks and must not leave text invisible.

Pretext specimens use explicit `TextStyle` contracts for both Canvas measurement and painted DOM text. Their default styles are 40/46px Bodoni Moda for balanced headings, 18/30px bundled Source Serif 4 for measured reading compositions and 16/26px Inter for interfaces. The named, loaded serif keeps Canvas and DOM on the same font. These specimen defaults do not replace the Georgia longform reader's 17/18px, 1.8-leading contract. The bundled Noto Sans KR Variable family supplies the declared Korean fallback. Request fonts with the actual text so Unicode-range subsets load before preparation; do not measure with one font and render with another.

The dedicated reader uses a stricter 65ch measure. Its paragraph gaps are 1.25em desktop and 1.15em mobile, with sober Inter subheadings. Body text may retain native serif rendering while the surrounding archive uses Inter. Do not increase heading scale or margins simply because content is long.

## 3. Paper and imagery

### Material construction

The production texture is `/assets/paper-grain.webp`, derived from a generated blank paper asset referenced to the supplied album cover. Retain the source asset and generation provenance in the project. Use a repeatable texture layer above the paper color and below all interactive content.

Tune the rendered strength so fibers, tiny charcoal flecks and hairline scuffs remain visible without dominating the text. Keep the texture static. Avoid animated SVG turbulence, canvas noise loops or fixed full-screen filters that repaint during scrolling. The paper layer must have `pointer-events: none` and must not appear in the accessibility tree.

CSS blending and masks may integrate the provided art with the canvas. `mix-blend-mode: multiply` is appropriate for pale artwork backgrounds; use a localized mask at an image edge only when it supports the composition. Neither technique changes the underlying original files. Critical text must never depend on a blend mode for readability.

### Asset roles

- **album-cover.png:** small square album identity and track-context artwork. Its source resolution is 250 × 250; avoid presenting it as a large sharp original.
- **parade-artwork.png:** the tall, illustrated procession; the primary editorial art element.
- **the-parade-band.png:** wide band portrait; suitable for feature and film context.
- **parade-film.png:** film imagery, presented in a reserved media frame.
- **single-cover.png:** the song's own cover, when that distinction matters.
- **live-performance.png:** portrait performance reference; preserve its proportions and do not imply an unverified venue or date.

Images need explicit dimensions or aspect ratios to reserve layout space. Load the first meaningful image promptly; lazy-load offscreen content. Use informative alt text for meaningful imagery and empty alt text for true decoration. The accessible heading remains real text even when a cover contains lettering.

## 4. Application structure

The example has four hash-addressable destinations: **Archive, Films, Community and System**. Navigation must update the URL so refresh and browser Back/Forward can recover the selected destination. One primary heading identifies the active page.

The desktop masthead sits naturally in document flow on the same paper canvas as the content. Place the compact archive name at one edge and plain-text destination links at the other, with a shared responsive side inset. Give the active link a typographic weight change and `aria-current`; do not add a colored background, capsule, surrounding outline or partition rule.

Mobile shows the archive name and a plainly worded **Index** button. Index opens a modal table of contents containing large, unboxed text links for the four destinations and a visible close action. Close it after selection and return focus appropriately. There is no bottom navigation strip. The content receives the full width of the canvas.

The composition uses a small number of strong alignments. A large headline can begin on a deliberate offset and connect visually to the artwork; metadata anchors to an existing text edge. Reuse the masthead's inset for later reading groups. Reset dramatic desktop offsets on phones. Create separation with a larger vertical gap, not a new bordered section.

Search communicates what it searches. Archive search filters tracks; community search filters sample posts. Do not present a global search field that silently affects only an unrelated hidden panel. Show the query and a clear reset action when no result remains.

### Archive

The opening composition pairs an oversized album heading and concise metadata with the procession artwork. Controls lead directly to track exploration and the official film. The hero must leave enough of the next section visible on a typical phone to establish that there is more content.

The track listing is a continuous, unruled sequence. Each row presents an index, title, supporting label where useful, duration and a clear expand action. `.track-select` has a 64px minimum height on desktop and 62px at 639px and below. Its separate save action keeps a 44px target. Consistent baselines and modest padding define the rows.

Expanded commentary begins immediately beneath the row, with no additional microheading or enclosing panel. Its Georgia body is 18px desktop/17px mobile at 1.7 leading, with a 65ch maximum and a 4px gap before actions. The direct “Show in the reading map” action focuses the matching chapter and brings the reader heading into view. Spotify and relevant video actions follow on the same wrapping action row. Do not reintroduce the previous tall gaps or small 12–13px note body.

Listening opens an external Spotify search destination for the selected track. This is a handoff, not an implemented audio stream. Never simulate a progressing playback clock when no media is playing.

### Linked reading and interpretation map

Archive includes a real longform reading section, implemented by `ReadingPage` from `src/pages/Reading.tsx`. Use its `embedded` prop to retain the page's heading hierarchy and inset. `src/reading.css` contains scoped adaptations of react-notion-x document flow, Obsidian Minimal readable-width rules and Medium Editor demo typography. Their pinned source files and complete retained licenses are in [reading-provenance.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/reading-provenance.md). This is actual permitted CSS adaptation, not a claim that proprietary product styles were copied.

The embedded reader starts with a compact heading, a passage selector, the live map and its selected readable passage. At 1000px and above, the diagram and selected passage share two unframed columns; on smaller screens the selected passage precedes the map. The full essay is available in a native disclosure below. Do not place a long introduction or all five paragraphs ahead of this linked view. The selected passage must visibly change as soon as a graph node is chosen.

The essay distinguishes cited album facts from editorial interpretation. Native `<details>` provides in-flow contents and full-essay disclosures; neither becomes a sidebar. Prose, sources and a reference photograph stay within a readable measure. The graph can occupy a wider area without stretching the paragraphs. The official video action uses the shared player so reading and playback can continue together.

Reader passages and the diagram share the same `CHAPTERS` data from `src/lib/pretext-mermaid.ts`. The IDs are `curtain`, `memory`, `loss`, `theatre` and `resolve`; `trackIds` connects each passage with archive tracks. Archive supplies the controlled chapter selection: opening a track selects its chapter, and choosing a chapter keeps the currently open track when it belongs to that chapter or selects the chapter's first track. Passage controls and graph nodes use this same selection. A default node shows its complete title plus up to **three measured body lines**, reserving the measured ellipsis width at the final line. Its body is a source prefix from that same paragraph, not an independently written summary. The evidence disclosure offers full-passage labels. The reader always shows the complete paragraph.

`PretextMermaid` receives `selectedId`, `onSelect`, `textOverrides`, `onTextChange` and `compact`. Editing a passage updates both its readable text and node label for the current session. Its editor uses `MeasuredTextArea`. The shared engine prepares the original title and complete body independently; both handles survive width changes. Clamp layout derives the current source prefix from the body handle without preparing a width-specific substring. Pretext's actual line text and widest line feed the generated Mermaid labels and minimum node width. The component exposes inspectable layout evidence and the generated source. Diagram edges express an explicitly labeled editorial reading, not official chronology.

Diagram text must remain readable on a phone. Change layout direction and line wrapping according to available width; do not shrink the entire diagram until labels become tiny. Keep keyboard-operable node selection, a textual counterpart and a useful error state. Mermaid's actual generated node IDs include the render-ID prefix; the adapter uses that prefix to find and bind chapter nodes rather than assuming an unprefixed ID. See [docs/pretext-mermaid-proof.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/pretext-mermaid-proof.md) for the adapter and recorded Canvas checks. The final browser SVG fit and linkage verification remain separate checks; a source fix or passing Canvas test does not certify the rendered browser result.

### Films

The Films index pairs the main poster and its title, description and actions side by side. Its grid uses a 1.5:1 proportion with a 24px gap, then becomes one column with a 12px gap at 639px and below. A poster click creates the official YouTube embed; browsing the index does not create an additional hidden playback session.

The persistent **in-page miniplayer** is the iframe plus a narrow icon strip immediately **above and outside** it. There is no “NOW WATCHING” bar, separate title row, provider footer or permanent explanatory paragraph around the video. Each icon occupies a 44 × 44px target. The strip contains Open on YouTube, desktop side switch, expand/minimize and close; accessible names identify every action and the selected film. The iframe retains its own meaningful title.

The desktop player is 360px wide and stays at the upper right while scrolling; its side control moves it to the upper left. Expanded desktop width is capped at 800px and constrained by dynamic viewport height. At 600px and below, it uses the available width above the bottom safe area; the side switch is hidden. The media surface keeps a 200px minimum height, allowing letterboxing when a narrow screen cannot provide both 16:9 proportions and that minimum. Mobile expansion is capped at 60dvh/440px. Player height is observed to reserve document-end space only on mobile while the player exists; the top-docked desktop player does not add footer whitespace.

The toolbar does not overlap the YouTube iframe or its native controls. This follows the provider's [required minimum functionality](https://developers.google.com/youtube/terms/required-minimum-functionality), which disallows obscuring the embedded player, and its [player sizing guidance](https://developers.google.com/youtube/player_parameters), which sets a 200 × 200px minimum viewport. These are functional constraints, not a reason to restore decorative player chrome.

The iframe remains mounted with an unchanged source while the reader navigates, resizes or switches docking sides. YouTube owns playback, seeking, captions and fullscreen. Native browser Picture-in-Picture is not claimed. If playback is blocked or unavailable, the external YouTube action remains available. Escape minimizes an expanded player, then closes the compact player, while an open modal retains Escape ownership; key events inside the cross-origin iframe remain YouTube's responsibility. Close returns focus to the original watch trigger when it still exists. Actual media availability and autoplay depend on YouTube and the browser.

The iframe/container structure adapts a licensed community implementation. The precise source and retained MIT notice are documented in [docs/video-provenance.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/video-provenance.md); docking, persistence and controls are archive-specific code.

### Community

The community is a local demonstration of feed behavior. Use representative posts with visibly identified sample content. Sorting and search must change the visible results consistently. Vote and save controls update immediately and expose pressed state.

Replies appear in a readable hierarchy using indentation, author labels and spacing, without connector rails or bounding boxes. Reduce indentation on narrow screens; deep conversation must not collapse into a few characters per line. A compose dialog writes locally and says so before submission. Do not suggest that a post was sent to other people.

LocalStorage may persist votes, saves and locally created posts. Recover gracefully if storage is unavailable or corrupt. Sample counts are demonstration data, not live membership or verified engagement.

Version 1.3 uses `MeasuredTextArea` for composing and replying, and `TextExcerpt` for post previews. A preview keeps an explicit expansion action whenever it truncates content. Measured height must preserve native editing, selection and paste. The [current verification record](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/verification-v1.3.md) records which integration flows were exercised.

### System

The System destination is a usable specimen sheet. Show color values, type roles, spacing and live component states. A reader should be able to focus, press, toggle, expand and open the same components used elsewhere. Label demonstrations clearly; do not let a preview action unexpectedly alter community data.

`/#system?section=components` contains the original specimens and the expanded gallery of 28 foundation components. The sixteen new exports demonstrate native selection, form controls, disclosures, pagination, progress, contributor identity, notices, copying and loading. `/#system?section=pretext` contains seven reusable text compositions with editable content, width presets, type presets, English/Korean/mixed/bidirectional samples and inspectable cache counters. Keep both on the same continuous canvas: no surrounding dashboard panels, new navigation bars or section rules.

## 5. Responsive contract

| Width | Layout and behavior |
| --- | --- |
| Up to 639px | Single reading column; name plus Index action; type-only table of contents; stacked hero; compact video dock |
| 640–899px | Wider reading measure; selectively paired content; Index keeps the masthead quiet |
| 900–1179px | Plain-text desktop masthead; continuous canvas; media and text pair only when both remain readable |
| 1180px and above | Generous editorial art; deliberate title offsets; wide negative space; no persistent page partitions |

A breakpoint changes composition, not merely font size. CSS Grid and Flexbox handle the available space; avoid device-name or user-agent branching. Apply `min-width: 0` to shrinking children and allow long words or URLs to wrap where needed.

At 320px, core reading and actions must work without horizontal document scrolling. A tab strip or specimen code block may scroll within its own clearly bounded region. Do not hide primary actions to achieve the fit.

The open video dock uses safe-area positioning and a component-specific 600px mobile breakpoint. On mobile, reserve bottom space for the measured media height, the external 44px tool strip and safe-area allowance only while it is present; content must remain reachable at the end of the page. Landscape uses left/right safe areas as well. The Index and compose dialogs use dynamic viewport units and scroll internally when the software keyboard reduces the visible area.

Use `viewport-fit=cover`, responsive viewport width and an initial scale of one. Never disable zoom. Prefer native scrolling for tabs and lists. Hover styling belongs inside `(hover: hover) and (pointer: fine)`; every action remains discoverable without hover.

## 6. Reusable component contract

The `src/design-system/` module owns 28 foundation components, tokens and shared CSS. `tokens.ts` and `tokens.css` define foundations; `components.tsx`/`components.css` retain the original twelve; `extended.tsx`/`extended.css` add sixteen. `index.ts` is their public entry point and imports all three stylesheets. The separate `src/pretext/` entry point exports seven text compositions and their styles. Page code owns content and feature state. Native HTML attributes and event handlers should pass through reusable components; an accessible name must not be lost when a wrapper is introduced.

| Component family | Required structure and behavior |
| --- | --- |
| Button | Native button; explicit type; primary, quiet and outlined treatments; visible disabled and pressed states |
| Icon action | Native button with descriptive accessible name; minimum 44px target; decorative SVG hidden from assistive technology |
| Link | Anchor for navigation; clear destination wording; preserve browser open-in-new-tab behavior |
| Field | Label associated with input; optional hint and inline error; 16px mobile text; paste remains available |
| Selection control | Checked/pressed state exposed programmatically; label and indicator share a generous target |
| Filter/navigation group | Plain text with a monochrome weight change; matching semantics; no filled selection or surrounding bar |
| Track row | Stable number/title/duration alignment; accessible expand control; row content reflows on mobile |
| Feed entry | Article heading, author/context metadata, body and action group in a predictable order |
| Dialog | Native modal dialog; visible heading and close action; constrained height; initial focus and focus return |
| Status/empty state | Plain language, meaningful next action and a polite announcement when a user action changes the result |

Do not make an entire row a button containing more buttons or links. Keep the expansion trigger separate from listening and saving actions. Similarly, a post's title link must not swallow the post's voting controls.

### Public React API

| Export | Main props |
| --- | --- |
| `Button` | Native button props; `variant: primary \| secondary \| ghost \| danger`; `size: sm \| md` |
| `IconButton` | Native button props and required `label` |
| `Tag` | `children`; `tone: default \| accent` |
| `SectionHeading` | `title`, optional `eyebrow`, `id`, `action` |
| `SearchField` | Controlled `value`, `onChange(string)`, optional `label`, `placeholder` |
| `TabBar` | `items: {id, label, count?}[]`, `value`, `onChange(string)`, `label` |
| `Dialog` | Controlled `open`, `onClose`, `title`, `children`, optional `wide` |
| `TextField`, `TextArea` | Native field props, required `label`, optional `error` |
| `EmptyState` | `title`, `description`, optional `action` |
| `MediaCard` | `title`, `subtitle`, `image`, optional `duration`, `onClick` |
| `Toast` | `message`, `onDismiss` |
| `Checkbox`, `Switch` | Controlled `checked`, `onCheckedChange(boolean)`, required `label`; native input semantics |
| `RadioGroup` | `label`, `options`, controlled `value`, `onValueChange(string)`; native fieldset and radios |
| `SelectField` | `label`, `options`, controlled `value`, `onValueChange(string)`; native single select |
| `RangeField` | `label`, controlled `value`, `onValueChange(number)`; `min`, `max`, `step`, optional `formatValue` |
| `Accordion` | `items`; controlled `openIds`/`onOpenChange` or `defaultOpenIds`; native details/summary |
| `Breadcrumbs` | `items`, optional nav `label`; last item exposes the current page |
| `Pagination` | One-based `page`, `pageCount`, `onPageChange(number)`; bounded pages and disabled ends |
| `Progress` | `label`, optional `value`, `max`; native determinate or indeterminate progress |
| `Avatar`, `AvatarGroup` | A named identity with optional image and initials fallback; grouped `people`/`max` |
| `Notice` | `title`, `children`, `tone`, optional `onDismiss`; status/alert semantics |
| `CodeBlock`, `CopyButton` | Escaped `code` or copy `text`; visible copy feedback and failure recovery |
| `Skeleton`, `Kbd` | Static labeled loading placeholders or semantic keyboard labels |
| `tokens` | Readonly `color`, `font`, `space`, `radius`, `target`, `motion`, `breakpoint`, `layer` |

The [component API](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/component-api.md) describes all import surfaces. The [extended-component reference](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/extended-components.md) gives exact props, types, state rules and examples for the sixteen additions. These are functional contracts: pagination clamps invalid bounds, indeterminate progress omits value, an image failure reveals initials, and denied clipboard access produces visible feedback. Do not implement their states as inert decorative specimens.

Feature-level exports remain outside the primitive module. `ReadingPage` accepts `watch(id)`, optional `selectedId: ChapterId`, `onSelect(id)` and `embedded`. `PretextMermaid` owns text-layout and diagram evidence; its shared chapter data connects the reading feature to the archive. Reading uses `PassageOutline` for its in-flow contents. These compositions must not introduce a dependency from base controls into page data.

`TabBar` is a selection/filter group using `aria-pressed`, with ArrowLeft/ArrowRight/Home/End support; its name does not make it an ARIA tablist. Application destinations remain links. Track rows, feed entries and the video dock are product compositions built on these primitives, not additional exported library components.

```tsx
import { useState } from 'react';
import { Button, Dialog, TextArea } from './design-system';
import './design-system/tokens.css';
import './design-system/components.css';

export function NoteExample() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  return <>
    <Button variant="secondary" onClick={() => setOpen(true)}>Write a note</Button>
    <Dialog open={open} onClose={() => setOpen(false)} title="Your note">
      <TextArea label="Note" value={note}
        onChange={event => setNote(event.target.value)} rows={5} />
      <Button variant="ghost" onClick={() => setOpen(false)}>Done</Button>
    </Dialog>
  </>;
}
```

This example keeps text in component state only. Persistence and submission belong to the calling feature and must be labeled according to their actual behavior.

### Pretext text compositions

| Export | Design and semantic contract |
| --- | --- |
| `BalancedHeading` | Tightens measured width without shrinking type or changing the initial line count; renders one native heading |
| `TextExcerpt` | Paints selectable planned lines and a measured ellipsis inside one paragraph; a real expansion button restores complete native text |
| `FlowText` | Continues source cursors through changing line widths around an inset; narrow or bidirectional text uses ordinary document flow |
| `MeasuredTextArea` | Uses pre-wrap metrics for native textarea height, retains caret/selection, includes final newline space and row limits |
| `RichInlineText` | Uses rich-inline preparation and range materialization for mixed fonts, source offsets, measured spaces and atomic tags |
| `MeasuredTextList` | Indexes actual paragraph heights; ordinary full DOM is the default, windowing is opt-in with a complete-content mode |
| `PassageOutline` | Sizes wrapped native links from their measured text; keeps order, current-location semantics and 44px targets |

Use a shared `TextStyle` for measurement and rendering. In addition to `font` and `lineHeight`, it controls `letterSpacing`, `whiteSpace` and `wordBreak`. Ordinary prose remains native DOM text wherever possible; explicit line spans serve measured excerpts, changing line widths and rich fragments. Collapsed `TextExcerpt` paints its fitted lines within one paragraph so the shortened tail does not rewrap into an extra line. Expanded content returns to the complete native paragraph. Do not convert a reading page into a canvas image.

The plain-text preparation cache is a shared **512-entry LRU**. Keys contain original text and shaping inputs: font, letter spacing, whitespace and word-break policy. **Width and line height are excluded**. They change line layout and box height, so they must not trigger fresh Canvas preparation. The original complete body handle also drives Mermaid excerpts across widths. Rich-inline content holds its own memoized prepared handle and is not counted by the plain-text cache counters.

The shared browser lifecycle loads each font with the actual text, then tracks changes in loaded font faces/subsets, document language and device pixel ratio. An actual change invalidates both prepared entries and Pretext's internal caches, increments an environment revision and requests fresh layouts. Width-only resize uses the existing handles. Global locale follows the document's `lang`; independent component-local locale mutations are not supported.

Components expose an explicit `data-pretext-state` of `measured` or `native`. Native content remains available while fonts or content width are unavailable, on a measurement failure, and when the composition deliberately preserves browser paragraph ordering. Arabic, Hebrew and bidi-control text must use the native path in manual-flow/truncation specimens. A measured state records an available plan, not a browser-fit or accessibility certification. Rendered SVG and positioned-line containment are separate checks.

```tsx
import { useState } from 'react';
import { MeasuredTextArea, TextExcerpt, INTERFACE_TEXT } from './pretext';

export function ListeningDraft() {
  const [text, setText] = useState('A memory becomes a shared procession.');
  return <>
    <MeasuredTextArea label="Listening note" value={text} onChange={setText}
      minRows={3} maxRows={8} maxLength={2000} />
    <TextExcerpt text={text} textStyle={INTERFACE_TEXT} maxLines={3} />
  </>;
}
```

The [Pretext component reference](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/pretext-components.md) covers props and presentation modes; the [layout-engine guide](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/pretext-layout-engine.md) covers preparation, grapheme-aware clamping, flow exclusions and measured indexes. [Pretext provenance](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/pretext-provenance.md) records the upstream patterns and permissions.

Font readiness has an eight-second bounded wait. A delayed or failed request leaves the complete native text readable and exposes an error in the Pretext lab. Actual subset loading may still finish later and invalidate the environment for another measurement attempt. The timeout must never be treated as successful font measurement.

### Shared state matrix

| State | Visual treatment | Interaction and announcement |
| --- | --- | --- |
| Rest | Ink on paper; clear hit area | Normal tab order |
| Hover | Local contrast or underline change | Fine-pointer enhancement only |
| Focus-visible | Strong ink outline with offset | Never clipped by an overflow parent or fixed dock |
| Active | Immediate local feedback | No delayed click dependency |
| Selected | Monochrome text weight or explicit label; navigation remains unfilled | `aria-pressed`, `aria-current` or proper selection semantics |
| Disabled | Muted treatment retaining legibility | Native disabled behavior where appropriate; explain unavailable actions |
| Loading | Stable dimensions and retained action label | Announce busy state; prevent duplicate submission |
| Error | Inline blood text with specific recovery | Associate error with control and focus the first invalid field on submit |
| Empty | Clear statement and one useful reset/create action | Do not substitute an ornamental illustration for the recovery action |

## 7. Accessibility and motion

Use landmarks, a working skip link and a logical heading hierarchy. Screen readers must encounter the archive in a useful order without reading decorative texture. All operations must work with keyboard alone.

Native `<dialog>` supplies modal behavior when opened with `showModal()`; still verify the complete flow. Move focus to the relevant control or heading, keep Tab navigation inside, close with Escape or a visible button, and return focus to the invoking element. Long structured content should not be forced into a single enormous `aria-describedby` announcement. Follow the [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

Use short CSS transitions only where a state change benefits from continuity. Typical press feedback is 100–160ms; a small overlay may use 160–200ms. Prefer transform and opacity. Do not animate layout dimensions, use `transition: all`, stagger every feed item, or continuously move paper and art.

Under `prefers-reduced-motion: reduce`, remove spatial transitions and smooth scrolling. Content must appear immediately and controls remain fully functional. Restrict announcements to meaningful changes; a player clock or each typed search character should not continuously interrupt a screen reader.

## 8. Engineering and content boundaries

The application uses React 19, TypeScript 5.9 and Vite 8. Keep the design system independently importable through its index module; avoid dependencies from primitives back into page content. CSS defines shared appearance; TypeScript supplies typed contracts and data. The package manifest and lockfile remain the authority for exact installed versions.

All interface copy and engineering artifacts are in English. Use concrete labels: “Read track notes,” “Open on Spotify,” “Close player” and “Save locally.” Interpretive commentary is identified as commentary. Do not invent interview quotations, tour facts or official endorsement.

This is a frontend example. It does not provide account authentication, remote posting, moderation, cross-device synchronization, licensed music streaming or a media hosting service. Local changes belong to the current browser. External links and embeds depend on the destination's availability and user environment.

## 9. Acceptance and maintenance

The following checks are **required verification targets**, not recorded passes:

1. Inspect 320, 360, 390, 430, 768, 1024 and 1440px layouts, including a short landscape viewport.
2. Confirm no document overflow, covered final row, clipped title or unreachable action; inspect the full page for forbidden framing lines, sidebars and filled navigation states.
3. Follow Archive → expanded track → external listen link, and Films → dock → expand → close. Verify the same iframe survives navigation and resizing; confirm all custom controls stay above its viewport and that the media area meets the provider minimum.
4. Exercise community search, each sort, vote reversal, save reversal, reply expansion and local compose persistence.
5. Test Tab/Shift+Tab, Enter, Space and Escape through the masthead, mobile Index, controls and dialog; inspect focus return and confirm all destinations remain reachable without a bottom bar.
6. Confirm reduced-motion behavior, 200% zoom and long-title/empty-result states.
7. Check production build and TypeScript diagnostics; inspect console/network failures relevant to local functionality.
8. Verify all displayed factual metadata against its cited source before treating it as editorial content.
9. Record physical iOS/Android keyboard, safe-area and touch checks separately from browser emulation.
10. Verify reader contents navigation, 65ch measure, compact spacing, chapter/track selection in both directions, edited-text synchronization and uninterrupted player state while reading. Inspect the 62/64px track targets and 17/18px note body rather than accepting earlier stylesheet declarations as the final cascade.
11. Change graph width and text; compare Pretext line counts with the generated Mermaid source and final SVG bounds. Record actual results, including any fallback or fit failure.
12. Exercise all sixteen new foundation components with keyboard and pointer: mixed checkbox, switch, native radio/select/range, exclusive/multiple disclosure, empty/end pagination, indeterminate progress, avatar fallback, notice dismissal, clipboard failure and static loading. Observe the final mobile targets and input font sizes.
13. Warm the shared text cache and resize the lab without changing text or type: distinguish layout passes from new preparation. Change line height without adding a prepared entry; change source, font, locale and device pixel ratio and inspect the correct invalidation behavior. Test long words, hard breaks, Korean, combining marks, emoji clusters and native bidi fallbacks. Exercise list resize anchoring and complete-content mode.

When extending the system, first reuse a token or composition. Add a new component only when its semantics or repeated behavior justify one. Record new states in the live System page and update this contract when a user-facing behavior changes.

