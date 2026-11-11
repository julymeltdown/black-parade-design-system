# Component API — v1.3

11 November 2026 · 28 foundation components · 7 Pretext text components

This document describes the actual React + TypeScript exports in the repository. Examples assume the importing file is inside `src/`; adjust relative paths when moving them. The UI is intended for a browser React application. Rendering a declaration does not make its interaction or validation state automatic: callers own the state described below.

## 1. Imports, CSS and tokens

```tsx
import {
  Button, IconButton, Tag, SectionHeading, SearchField, TabBar,
  Dialog, TextField, TextArea, EmptyState, MediaCard, Toast, tokens,
  Checkbox, Switch, RadioGroup, SelectField, RangeField, Accordion,
  Breadcrumbs, Pagination, Progress, Avatar, AvatarGroup, Notice,
  CodeBlock, CopyButton, Skeleton, Kbd,
} from './design-system';
import type {
  ButtonProps, IconButtonProps, SearchFieldProps, TabBarProps,
  DialogProps, TextFieldProps, TextAreaProps, MediaCardProps, DesignTokens,
  CheckboxProps, SwitchProps, RadioGroupProps, SelectFieldProps,
  RangeFieldProps, AccordionProps, BreadcrumbsProps, PaginationProps,
  ProgressProps, AvatarProps, AvatarGroupProps, NoticeProps,
  CodeBlockProps, CopyButtonProps, SkeletonProps, KbdProps,
} from './design-system';

import {
  BalancedHeading, TextExcerpt, FlowText, MeasuredTextArea,
  RichInlineText, MeasuredTextList, PassageOutline,
  DISPLAY_TEXT, INTERFACE_TEXT, READING_TEXT,
} from './pretext';
import type {
  TextStyle, BalancedHeadingProps, TextExcerptProps, FlowTextProps,
  MeasuredTextAreaProps, RichInlineTextProps, MeasuredTextListProps,
  PassageOutlineProps,
} from './pretext';

import { PretextMermaid, VideoPlayer } from './components';
import type { PretextMermaidProps, VideoPlayerProps } from './components';
import { ReadingPage } from './pages/Reading';
import type { ReadingPageProps } from './pages/Reading';
```

`src/design-system/index.ts` loads `tokens.css`, `components.css` and `extended.css`. The separate `src/pretext/index.ts` loads `pretext.css`; importing it alone does not load foundation tokens or fonts. Product components load their scoped CSS. `ReadingPage` additionally requires the host to import `src/reading.css`, as `src/main.tsx` does. Load the local Fontsource imports from that entry point: Bodoni Moda 700/900, Inter 400/500/600, Source Serif 4 400, Barlow Condensed 500/600 and Noto Sans KR Variable. The diagram measures **Inter 400 at 16px with the Noto Sans KR fallback**. Text components request the actual text's glyph subsets before measurement. Their reading preset uses bundled Source Serif 4; the separate longform reader retains Georgia.

`tokens` is a deeply literal `as const` object. Its `color`, `font`, `space`, `radius`, `target`, `motion`, `breakpoint` and `layer` fields describe the foundation. `DesignTokens` is `typeof tokens`. CSS variables are the runtime styling interface; changing the TypeScript object alone does not change `tokens.css`.

## 2. All 28 foundation components

The original twelve exports retain their public contracts. The sixteen additions are implemented in `extended.tsx`; they use the same tokens and native controls. Open `/#system?section=components` for the live gallery.

### Original twelve

| Component | Required props | Optional props and defaults | Contract |
| --- | --- | --- | --- |
| `Button` | Native button props as needed | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'danger' = 'primary'`; `size: 'sm' \| 'md' = 'md'`; native `type = 'button'` | Extends `ButtonHTMLAttributes<HTMLButtonElement>`. Use `type="submit"` explicitly in forms. Disabled, pressed state, click behavior and contents come from the caller. |
| `IconButton` | `label: string` | Native button attributes; `type = 'button'` | `label` supplies `aria-label` and the title. Pass an icon as `children`; the icon can remain visually small while the target is 44px. |
| `Tag` | `children: ReactNode` | `tone: 'default' \| 'accent' = 'default'` | Static inline label; not a button or filter. Does not expose arbitrary span attributes. |
| `SectionHeading` | `title: string` | `eyebrow?: string`; `id?: string`; `action?: ReactNode` | Renders an h2; `id` applies to that h2. `action` is a separate aligned region. |
| `SearchField` | `value: string`; `onChange: (value: string) => void` | `label = 'Search the archive'`; `placeholder = 'Search the archive'` | Controlled search input with a real, visually hidden label. Clear sets the value to `''` and returns focus to the input. The callback receives a string, not an input event. |
| `TabBar` | `items: { id: string; label: string; count?: number }[]`; `value: string`; `onChange: (value: string) => void`; `label: string` | None | A named group of pressed filter buttons, not an ARIA tab/panel implementation. Left/right arrows and Home/End move focus and select an item. Provide unique item IDs and a current value. |
| `Dialog` | `open: boolean`; `onClose: () => void`; `title: string`; `children: ReactNode` | `wide = false` | Controlled native modal dialog. The caller must set `open` to false in `onClose`. Native focus containment, Escape handling, close button, backdrop dismissal and scroll locking are integrated. |
| `TextField` | `label: string` | `error?: string`; native input attributes | Extends `InputHTMLAttributes<HTMLInputElement>`. Generates an ID when omitted and connects errors with `aria-describedby`/`aria-invalid`. `className` styles the field wrapper, not the inner input. |
| `TextArea` | `label: string` | `error?: string`; native textarea attributes | Extends `TextareaHTMLAttributes<HTMLTextAreaElement>`. Same label/error/wrapper contract as `TextField`; the caller chooses rows and length limits. |
| `EmptyState` | `title: string`; `description: string` | `action?: ReactNode` | Renders an h3, a description and optional next action. Does not fetch or modify data. |
| `MediaCard` | `title: string`; `subtitle: string`; `image: string`; `onClick: () => void` | `duration?: string` | A button with a 16:9 image and caption. Its accessible name identifies the watch action. `onClick` opens the player or other host behavior; it does not play media itself. |
| `Toast` | `message: string`; `onDismiss: () => void` | None | Polite status plus a dismiss button. The host controls visibility and any timeout; this component does not auto-dismiss. |

The original twelve components export eight named props interfaces. Each of the sixteen additions has a named props interface as well. For the four original components with inline prop types, infer their exact contract instead of maintaining a duplicate:

```tsx
import type { ComponentProps } from 'react';
import { Tag, SectionHeading, EmptyState, Toast } from './design-system';

type TagProps = ComponentProps<typeof Tag>;
type SectionHeadingProps = ComponentProps<typeof SectionHeading>;
type EmptyStateProps = ComponentProps<typeof EmptyState>;
type ToastProps = ComponentProps<typeof Toast>;
```

### Sixteen additions in v1.3

| Component | Required props | Additional contract |
| --- | --- | --- |
| `Checkbox` | `label`, `checked`, `onCheckedChange(boolean)` | Native checkbox; optional `indeterminate`, `description`, `error` and native attributes. Mixed state uses the real DOM property. |
| `Switch` | `label`, `checked`, `onCheckedChange(boolean)` | Native checkbox with switch semantics, a stable visible label and native disabled behavior. |
| `RadioGroup` | `label`, `options`, `value`, `onValueChange(string)` | Native fieldset, legend and radio group. Options have `value`, `label`, optional `description`/`disabled`. Supports `name`, `required`, `disabled`, description/error and `inline`. |
| `SelectField` | `label`, `options`, `value`, `onValueChange(string)` | Native single select; options have `value`, `label`, optional `disabled`. Optional placeholder, description/error and native select attributes. |
| `RangeField` | `label`, `value`, `onValueChange(number)` | Native range, defaults `min=0`, `max=100`, `step=1`. Clamps finite values; optional `formatValue` supplies both visible and accessible value text. |
| `Accordion` | `items` | Real details/summary. Items have `id`, `title`, `content`, optional `disabled`. Use controlled `openIds`/`onOpenChange` or `defaultOpenIds`; `multiple=false` by default. |
| `Breadcrumbs` | `items` | Named nav and ordered list; earlier `href` items are links, the final item exposes `aria-current="page"`. Each item has a label and optional href. |
| `Pagination` | `page`, `pageCount`, `onPageChange(number)` | One-based controlled page; bounded numbers and disabled ends. An empty set disables movement and announces no pages. Optional `label` and `disabled`. |
| `Progress` | `label` | Native progress. Optional finite `value` is clamped against `max=100`; absent or nonfinite value is indeterminate with no `value`/`aria-valuenow`. Optional `valueText`, `showValue`. |
| `Avatar` | `name` | Initials by default; optional `src` falls back to initials on an image error. `size='sm' \| 'md' \| 'lg'`, default `md`. |
| `AvatarGroup` | `people` | Each person is an `AvatarProps` record. Defaults `max=4`, `label='Contributors'`; remaining names stay in the overflow count's accessible label. |
| `Notice` | `title` | Optional `children`; `tone='info' \| 'success' \| 'warning' \| 'error'`, default info. Status/alert semantics and optional `onDismiss`; the caller owns visibility. |
| `CodeBlock` | `code` | Escaped text in a focusable, scrollable pre/code region; optional `label`, `language`, `copyable=true`, `wrap=false`. No syntax parser or HTML injection. |
| `CopyButton` | `text` | User-triggered Clipboard API with pending, copied and visible failure feedback. Optional `label`, `copiedLabel`, `onCopy`; the completion callback is not a native clipboard event. |
| `Skeleton` | None | Static placeholder with a status label. Defaults `lines=3`, `lastLineWidth='62%'`; line count bounded to 1–12. Does not animate or fetch. |
| `Kbd` | Native kbd contents/attributes | Semantic keyboard label. Does not register a shortcut or become a button. |

All component props and option types are exported from the foundation barrel, including `RadioOption`, `SelectOption`, `AccordionItem`, `BreadcrumbItem` and `NoticeTone`. The [extended-component reference](extended-components.md) contains exact types, complete examples and each component's controlled/uncontrolled rules. Form errors are associated with their controls; callers still own validation and submission. Active controls retain 44px targets and mobile form text remains at least 16px.

### Actions, labels and content

```tsx
import { Bookmark } from 'lucide-react';
import { Button, IconButton, Tag, SectionHeading, MediaCard, EmptyState } from './design-system';
import type { Film } from './data';

type FilmSectionProps = { film: Film; saved: boolean; onSave: () => void; onWatch: () => void };

export function FilmSection({ film, saved, onSave, onWatch }: FilmSectionProps) {
  return <section>
    <SectionHeading
      id="film-heading"
      eyebrow="THE FILMS"
      title="Follow the procession."
      action={<IconButton label={saved ? 'Unsave film' : 'Save film'} aria-pressed={saved} onClick={onSave}>
        <Bookmark size={18} aria-hidden="true" />
      </IconButton>}
    />
    <Tag tone="accent">Official film</Tag>
    <MediaCard title={film.title} subtitle={film.eyebrow} image={film.image}
      duration={film.duration} onClick={onWatch} />
    <EmptyState title="No more films saved." description="Keep a film here to return to it."
      action={<Button variant="secondary" onClick={onSave}>Save this film</Button>} />
  </section>;
}
```

### Controlled search and filters

```tsx
import { useState } from 'react';
import { SearchField, TabBar } from './design-system';

export function FilmFilters() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  return <>
    <SearchField value={query} onChange={setQuery} label="Search films" placeholder="A film title…" />
    <TabBar label="Film filter" value={filter} onChange={setFilter}
      items={[{ id: 'all', label: 'All films', count: 4 }, { id: 'saved', label: 'Saved' }]} />
  </>;
}
```

Use `query` and `filter` to derive visible results in the host. Neither control runs a search request or owns a data source.

### Dialog, form errors and notification

```tsx
import { useState } from 'react';
import { Button, Dialog, TextField, TextArea, Toast } from './design-system';

export function NoteComposer() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [message, setMessage] = useState('');
  const error = attempted && title.trim().length < 3 ? 'Enter at least three characters.' : undefined;

  return <>
    <Button onClick={() => setOpen(true)}>Write a note</Button>
    <Dialog open={open} onClose={() => setOpen(false)} title="Your note.">
      <form noValidate onSubmit={event => {
        event.preventDefault();
        setAttempted(true);
        if (title.trim().length < 3) return;
        setOpen(false);
        setMessage('The example note is ready. Nothing was sent.');
      }}>
        <TextField label="Title" value={title} error={error} maxLength={120}
          onChange={event => setTitle(event.target.value)} />
        <TextArea label="Note" value={body} rows={4} maxLength={2000}
          onChange={event => setBody(event.target.value)} />
        <Button type="submit">Finish note</Button>
      </form>
    </Dialog>
    {message && <Toast message={message} onDismiss={() => setMessage('')} />}
  </>;
}
```

Validation, persistence and submission belong to the caller. The above example deliberately performs no network request.

## Pretext text components

The seven exports in `src/pretext` are a separate composition layer. They use the shared engine in [`src/lib/pretext-layout.ts`](../src/lib/pretext-layout.ts) and the font/environment lifecycle in [`src/lib/pretext-fonts.ts`](../src/lib/pretext-fonts.ts). They do not import page data. Open `/#system?section=pretext` for editable specimens.

```ts
type TextStyle = {
  font: string;        // Canvas/CSS font shorthand; include intended fallbacks
  lineHeight: number;  // positive pixel value, used during layout
  letterSpacing?: number; // finite pixels, default 0
  whiteSpace?: 'normal' | 'pre-wrap'; // default normal
  wordBreak?: 'normal' | 'keep-all';  // default normal
};
```

| Export | Required props | Defaults and behavior |
| --- | --- | --- |
| `BalancedHeading` | `text` | `as='h2'`, `textStyle=DISPLAY_TEXT`, `align='start'`. A width search preserves the original line count. The DOM remains one native heading. |
| `TextExcerpt` | `text` | `maxLines=3`, `textStyle=READING_TEXT`, `defaultExpanded=false`. Reserves ellipsis width and paints the fitted lines as selectable spans inside one paragraph. Expansion restores the full native paragraph; `moreLabel`/`lessLabel` customize its button. |
| `FlowText` | `text`, `inset` | Inset has `src`, `alt`, `width`, `height`, optional `side='right'`, `gap=20`. `textStyle=READING_TEXT`. Uses one cursor through varying line widths; narrow or bidi text returns to ordinary image-plus-paragraph flow. |
| `MeasuredTextArea` | `label`, `value`, `onChange(string)` | `textStyle=INTERFACE_TEXT`, `minRows=3`, `maxRows=8`. Native textarea attributes pass through except value/defaultValue/onChange/rows/style. Optional `hint`/`error`; normalized newlines and a final caret line contribute to its height. |
| `RichInlineText` | `items` | `lineHeight=28`. Each run has `text`, `font`, optional `kind`, `atomic`, `paddingInline`, `letterSpacing`. Uses `@chenglou/pretext/rich-inline` preparation, range walking and fragment materialization. |
| `MeasuredTextList` | `items` | Items have `id` and `text`. `height=360`, `virtualized=false`, `overscan=120`, `textStyle=INTERFACE_TEXT`. Optional windowing includes a complete-content mode for find and selection. Stable IDs retain the visible row across resize. |
| `PassageOutline` | `items` | Items have `id`, `label`, `href`, optional `detail`. Optional `currentId`, `onNavigate(id)`; default `label='On this page'`, `textStyle=INTERFACE_TEXT`. Normal anchors with measured minimum heights and `aria-current="location"`. |

All seven accept `className`. Named props types are exported along with `FlowTextInset`, `RichInlineRun`, `MeasuredListItem` and `OutlineItem`. Do not replace one component's string callback with a DOM-event handler: `MeasuredTextArea.onChange(value)` differs from the original `TextArea.onChange(event)`.

The style presets are `DISPLAY_TEXT` (700 40px Bodoni Moda, 46px line height), `READING_TEXT` (400 18px Source Serif 4, 30px line height) and `INTERFACE_TEXT` (400 16px Inter, 26px line height). All include Noto Sans KR Variable in the fallback stack. `textStyleToCss(style)` applies the same measurement contract to native text. `useContentWidth` observes the element's content box; `useTextEnvironment` exposes font readiness, environment revision and loading errors. Neither is a general rendered-text measurement hook.

```tsx
import { useState } from 'react';
import { BalancedHeading, MeasuredTextArea, TextExcerpt, INTERFACE_TEXT } from './pretext';

export function MeasuredNote() {
  const [body, setBody] = useState('A small piano phrase opens into a shared procession.');

  return <section>
    <BalancedHeading text="A listening note, in your words." as="h2" />
    <MeasuredTextArea label="Your note" value={body} onChange={setBody}
      minRows={3} maxRows={8} maxLength={2000}
      hint="This example keeps the draft in component state." />
    <TextExcerpt text={body} textStyle={INTERFACE_TEXT} maxLines={3} />
  </section>;
}
```

### Preparation, invalidation and measurement states

The shared engine holds **512 prepared plain-text entries** by default, with LRU eviction. Its key is `[font, letterSpacing, whiteSpace, wordBreak, originalText]`. Width and **line height are not preparation inputs**. Changing them reuses a prepared handle and recomputes layout; changing source or a shaping option may prepare another entry. Rich-inline runs keep a separate memoized prepared handle, so the plain-text cache counters do not count rich-inline preparation.

`ensureTextFonts(fonts, actualText)` loads the specific glyph subsets required by the content. The shared lifecycle watches loaded font faces/subsets, `document.documentElement.lang` and device pixel ratio. Actual changes clear both the application cache and Pretext's internal cache, increment a revision and notify mounted consumers. A container resize alone does not clear prepared entries. `setLocale` is managed globally from the document language; components should not set competing local locales.

Each component exposes `data-pretext-state="measured"` or `"native"`. These distinguish a usable measured plan from a native presentation while measurement is unavailable or unsuitable; they are not test-pass badges. Before fonts or container width are ready, text remains in the DOM. Arabic, Hebrew and explicit bidi-control samples use native paragraph ordering where manual line painting or truncation would alter it. A measured plan is a prediction: browser font shaping and rendered fit still need separate checks.

See [Pretext component APIs](pretext-components.md) for complete props and fallback rules, [layout engine](pretext-layout-engine.md) for algorithms and measurement limits, and [provenance](pretext-provenance.md) for upstream sources. Community uses `MeasuredTextArea` for composing/replying and `TextExcerpt` for post previews; Reading uses `PassageOutline` for contents. The current verification record identifies the product flows actually exercised.

## 3. `PretextMermaid`

```ts
interface PretextMermaidProps {
  selectedId?: ChapterId;
  onSelect?: (id: ChapterId) => void;
  textOverrides?: Partial<Record<ChapterId, string>>;
  onTextChange?: (id: ChapterId, body: string) => void;
  compact?: boolean;
}
```

Import the component and props from `./components`. Import `ChapterId` and `CHAPTERS` from `./lib/pretext-mermaid`.

| Prop | Behavior |
| --- | --- |
| `selectedId` | Controls the highlighted passage. Omit for local selection, initially `memory`. |
| `onSelect` | Called for node pointer/keyboard selection. Pair it with `selectedId` to update controlled selection. |
| `textOverrides` | Overrides chapter body text by stable ID. An override takes precedence over a local edit and the original chapter text. |
| `onTextChange` | Reports edits to the selected passage. Update `textOverrides` here when controlling text externally. |
| `compact` | Defaults to false. True suppresses the introduction heading; it retains the map and its evidence disclosure. |

The adapter currently uses the five shared `CHAPTERS` records, not an arbitrary `nodes` prop. Valid IDs are `curtain`, `memory`, `loss`, `theatre` and `resolve`. Each chapter includes its title, body and `trackIds` for linking the archive's selected track. Validate externally supplied identifiers before treating them as `ChapterId`.

```tsx
import { useState } from 'react';
import { PretextMermaid } from './components';
import { CHAPTERS, type ChapterId } from './lib/pretext-mermaid';

export function SynchronizedPassage() {
  const [selectedId, setSelectedId] = useState<ChapterId>('memory');
  const [edits, setEdits] = useState<Partial<Record<ChapterId, string>>>({});
  const chapter = CHAPTERS.find(item => item.id === selectedId)!;

  return <>
    <PretextMermaid compact selectedId={selectedId} onSelect={setSelectedId}
      textOverrides={edits}
      onTextChange={(id, body) => setEdits(previous => ({ ...previous, [id]: body }))} />
    <article>
      <h2>{chapter.title}</h2>
      <p>{edits[chapter.id] ?? chapter.body}</p>
    </article>
  </>;
}
```

The built-in passage editor uses `MeasuredTextArea` with a 480-character limit. Edits are local unless the parent explicitly persists them. Width controls are bounded by the actual available space. A `ResizeObserver` triggers relayout. The default rendered node shows its complete title plus **up to three measured body lines**, reserving ellipsis width on the final line. Title and complete body have independent handles in the shared 512-entry preparation cache, reused across widths and label modes. Pretext supplies label lines and measured minimum node width; Mermaid supplies graph geometry. Mermaid loads on demand. The rendered SVG is sanitized before insertion.

The evidence disclosure exposes generated source, line counts, measured widths/heights, preparation counts and actual browser SVG containment checks. Its full-passage checkbox restores every body word in the labels. The low-level `buildMermaidPlan` function retains `labelMode='full'` as its default for complete-text callers; the React host explicitly requests `'excerpt'` initially. The unwrapped comparison intentionally permits horizontal scrolling. Rendering failures display an error; keep ordinary readable prose alongside the graph, as `ReadingPage` does. See the [integration proof](pretext-mermaid-proof.md).

## 4. `ReadingPage`

```ts
type ReadingPageProps = {
  watch: (id: string) => void;
  selectedId?: ChapterId;
  onSelect?: (id: ChapterId) => void;
  embedded?: boolean;
};
```

Import `ReadingPage` and `ReadingPageProps` from `./pages/Reading`, and load `./reading.css` once in the application entry point.

- `watch` receives an official video's ID; it should select the existing shared player rather than start another iframe.
- `selectedId` / `onSelect` provide controlled selection. Without `selectedId`, local selection starts at `curtain`.
- `embedded` defaults to false. Standalone mode renders an h1 and the complete essay; embedded mode renders an h2, a passage selector, the graph and a selected readable passage, with the complete essay in a disclosure.
- Reader-owned text overrides are shared with `PretextMermaid`, so edits update prose and node labels together. They last for the mounted reader session.
- The component is intended to appear **once per rendered page**; its section, heading and contents-target IDs are fixed.

### A complete reader and persistent player

```tsx
import { useState } from 'react';
import { ReadingPage } from './pages/Reading';
import { VideoPlayer } from './components';
import { films, type Film } from './data';
import './reading.css';

export function ReaderWithVideo() {
  const [video, setVideo] = useState<Film | null>(null);

  return <div className={`app-shell${video ? ' has-player' : ''}`}>
    <main className="app-main">
      <ReadingPage watch={id => setVideo(films.find(item => item.id === id) ?? null)} />
    </main>
    <VideoPlayer video={video} onClose={() => setVideo(null)} />
  </div>;
}
```

When placing the reader inside an existing album page, pass `embedded`. To map a selected track to a passage, find a chapter whose `trackIds.includes(trackId)` and update the controlled `selectedId` with its `id`.

## 5. `VideoPlayer`

```ts
interface VideoPlayerProps {
  video: Film | null;
  onClose: () => void;
}
```

Import both exports from `./components`. `Film` is defined in `./data`:

```ts
interface Film {
  id: string; // YouTube video ID
  title: string;
  eyebrow: string;
  image: string;
  duration: string;
  description: string;
}
```

`video={null}` renders no player. A film mounts an actual `youtube-nocookie.com` iframe. The caller must set the prop to null when `onClose` runs. Keep the component outside page-route branches and do not supply a key based on its display size: the same video iframe and URL survive expansion, left/right docking and page navigation. Changing `video.id` loads the new video; closing removes the iframe.

The 360px desktop surface stays fixed at the upper right while scrolling; the side switch moves it to the upper left. The video's top is 60px plus the top safe-area inset, leaving space for its 44px tool strip above it. Expansion retains this top docking and caps its dimensions to the viewport. At 600px or below, mobile uses the available width across the bottom, above the bottom safe area, with a 200px minimum height. Controls use 44px targets in a small strip outside the video viewport. The narrow strip replaces the old separate header, title and footer. Escape minimizes then closes, unless a modal dialog owns the key. The player does not capture keyboard events inside YouTube's cross-origin iframe.

The component measures its own height and sets `--active-player-height`. At mobile widths only, the supplied CSS uses `.app-shell.has-player .app-main` and `.app-shell.has-player .ds-toast` to reserve end-of-document space and keep notifications clear. Desktop top docking adds no bottom clearance or empty footer region. If integrating with a different shell, carry over the mobile-only selectors or provide equivalent padding. There is no extra reserved space when the host removes `has-player`.

This is **web-page miniplayer behavior**, not a native browser PiP API. Playback controls, captions, seeking, errors and fullscreen belong to YouTube. Autoplay is requested only after the host opens a video, and remains subject to the browser and provider. The external YouTube link is available independently of embed playback. See [video provenance](video-provenance.md) for the pinned source and provider requirements.

## 6. Verification and redistribution

Use the root commands documented in [README.md](../README.md): `npm run typecheck`, `npm run test:pretext` and `npm run build`. The test command runs both the layout-engine and Mermaid-adapter suites with real Canvas font metrics. Browser SVG geometry, native/manual text presentation, pointer/keyboard interaction, iframe continuity and physical-device behavior need their own observation. Consult [verification-v1.3.md](verification-v1.3.md) for the current results. [verification.md](verification.md), its JSON companion and the original six screenshots are **historical v1.2 evidence**, not checks of these additions.

When redistributing the adapted reader styles, player structure or Pretext-based patterns, include the relevant complete notices from `docs/vendor/` and the [reading](reading-provenance.md), [video](video-provenance.md) and [Pretext](pretext-provenance.md) provenance documents. Those software permissions do not license the user-supplied album artwork, photographs, artist identity or external videos.
