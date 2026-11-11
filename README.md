<div align="center">

<p><strong>THE BLACK PARADE · VOLUME 003</strong></p>

# Black Parade Design System

**Ink. Paper. A record that stays with you.**

A responsive React + TypeScript design system and working music archive,<br />
inspired by the worn album sleeve and theatrical world of My Chemical Romance’s <em>The Black Parade</em>.

<p>
  <a href="#run-locally">Run locally</a> ·
  <a href="design.md">Design specification</a> ·
  <a href="docs/component-api.md">Component API</a> ·
  <a href="docs/pretext-mermaid-proof.md">Pretext + Mermaid proof</a>
</p>

<p><strong>v1.3 · 11 November 2026</strong> &nbsp; / &nbsp; React 19 &nbsp; / &nbsp; TypeScript &nbsp; / &nbsp; Vite &nbsp; / &nbsp; CSS</p>

</div>

![The Parade Archive desktop view: oversized editorial typography, album artwork and a continuous worn-paper canvas.](docs/screenshots/desktop-archive.jpg)

<p align="center"><sub>Historical v1.2 browser capture. All six screenshots in this README document that revision; they do not show the new v1.3 component gallery or Pretext lab. <a href="docs/screenshots/README.md">Capture details</a></sub></p>

## A visual language with a working system behind it

Worn pale paper, black ink and restrained oxblood set the material. Bodoni Moda gives the headlines their scale; Inter keeps controls clear; Georgia carries the longer reading passages. Navigation sits directly on the canvas, and typography, spacing and alignment establish the page structure. The texture is a static image underneath the content.

The repository includes **28 reusable foundation components** and **7 Pretext text components**, typed design tokens, a synchronized reader and diagram, a compact persistent video player, and a complete example application. Version 1.3 adds 16 foundation components and a shared text-layout engine. [design.md](design.md) is the implementation contract for the visual language, component behavior and responsive rules.

| Foundation | Decision |
| --- | --- |
| Material | Generated paper grain with a global intensity control and an optimized WebP asset |
| Color | Paper `#E9E6DD` · Ink `#1C1B18` · Oxblood `#782F2D` |
| Typography | Bodoni Moda display · Inter interface · Barlow Condensed labels · Georgia longform · Source Serif 4 measured text · Noto Sans KR fallback |
| Structure | Open composition, plain-text navigation, square controls and compact content spacing |
| Reading | 17px prose on phones, 18px on wider screens, 1.8 line height and a 65ch maximum measure |
| Interaction | 44px minimum targets, visible focus, native dialogs and reduced-motion support |

## Small screens get the complete experience

The following mobile captures are from **v1.2**. Current verification is tracked separately in the [v1.3 record](docs/verification-v1.3.md).

<table>
  <thead>
    <tr>
      <th>Record / mobile</th>
      <th>Linked reading / mobile</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><img src="docs/screenshots/mobile-archive.jpg" width="320" alt="Mobile Record page with the album composition reflowed into a single column." /></td>
      <td align="center"><img src="docs/screenshots/mobile-reading.jpg" width="320" alt="Mobile reading view with the selected passage and a legible top-to-bottom Mermaid diagram." /></td>
    </tr>
    <tr>
      <td>The Index opens a plain-text contents dialog. Track rows, notes and saved actions remain available.</td>
      <td>The selected paragraph comes before the map. Diagram text stays at 16px while the graph changes direction.</td>
    </tr>
  </tbody>
</table>

The reader becomes two columns at 1000px. Below that width, prose and diagram stack in reading order. Forms use at least 16px input text, dialogs use dynamic viewport limits, and fixed player controls include safe-area padding. The bundled [responsive lab](public/responsive.html) renders the complete site at real iframe viewport widths from 320 to 1440px.

## Text and diagrams that stay connected

![The linked reading workspace with a Pretext-laid-out Mermaid graph and the matching readable passage.](docs/screenshots/desktop-reading.jpg)

*The image above is a historical v1.2 capture.*

**Pretext controls the labels Mermaid renders.** In v1.3 the adapter prepares each original title and complete body through the same engine as the text components. The default node contains the title and **up to three measured body lines**. The final body line reserves the measured width of the ellipsis before finding its source boundary. Those lines and their measured widths become Mermaid label breaks and `minNodeWidth`; Mermaid supplies graph geometry.

Width changes reuse the original full-body prepared handle. The adapter does not prepare a new, width-specific excerpt on every resize. Changing one body requests a new handle for that body while unaffected entries remain available, subject to cache eviction and text-environment invalidation.

The paragraph, SVG node and selected track share stable chapter IDs. Select a node to read its passage, select a passage to highlight its node, or open a track’s reading link to reach the corresponding chapter. Editing the passage updates the prose and its graph label together.

Open **“How the text shapes this map”** in the example to inspect generated source, width presets, preparation counts and actual SVG containment results. The disclosure switches between measured three-line body excerpts, complete paragraphs and an intentionally unwrapped comparison. The passage editor itself uses `MeasuredTextArea`.

| Historical v1.2 full-passage proof | 320px diagram space | 390px diagram space |
| --- | ---: | ---: |
| Pretext label budget | 116px | 151px |
| Rendered SVG width | 308px | 378px |
| Per-node line counts | 13 / 14 / 13 / 14 / 13 | 8 / 10 / 8 / 10 / 9 |
| New preparations after resize | 0 / 5 | 0 / 5 |
| Clipped labels | 0 | 0 |

These are **v1.2 browser observations**, retained as historical evidence; they are not v1.3 test results or performance guarantees. The graph is an editorial interpretation of the album. Read the [current integration contract](docs/pretext-mermaid-proof.md), [adapter source](src/lib/pretext-mermaid.ts), [historical record](docs/verification.md) and [v1.3 verification record](docs/verification-v1.3.md) for their separate scopes.

## Seven ways to use Pretext

Open **`/#system?section=pretext`** on the running site. The lab exposes editable text, available width, type presets and line-budget controls, English/Korean/mixed/RTL samples, cache counters, and each of the seven reusable components. These are exported React components in [src/pretext](src/pretext/), with API documentation in [Pretext components](docs/pretext-components.md).

| Component | What the measurement changes |
| --- | --- |
| `BalancedHeading` | Finds a narrower heading width while preserving the initial line count; keeps a native heading and its font size |
| `TextExcerpt` | Paints fitted, selectable lines and a measured ellipsis inside one paragraph; expansion restores the complete native paragraph |
| `FlowText` | Continues one source cursor through different line widths around an image; narrow layouts return to normal document flow |
| `MeasuredTextArea` | Derives native textarea height from pre-wrap layout, including hard breaks and the final caret line |
| `RichInlineText` | Uses Pretext's rich-inline API for mixed fonts, inline code and atomic tags, retaining source offsets and measured gaps |
| `MeasuredTextList` | Builds a measured row index and prefix sums; optional windowing preserves the current note on resize and offers a complete-content mode |
| `PassageOutline` | Measures wrapped labels to size ordinary outline links while preserving their document order |

The shared plain-text engine keeps **up to 512 prepared entries** in an LRU cache. Its key contains the original text, font, letter spacing, whitespace and word-break policy. **Container width and line height are excluded from preparation keys**: they change layout, not shaping. Rich-inline preparation is retained separately by its component and is likewise independent of width. The lab's shared-cache counters therefore describe the plain-text engine, not every rich-inline operation.

The browser loader requests the actual text's font subsets before measurement. Changes to loaded font faces/subsets, the document language or device pixel ratio clear prepared measurements and notify consumers. A regular resize reuses them. Components expose `data-pretext-state="measured"` or `"native"`; native text remains available while fonts or width are unavailable and when a measured presentation cannot be used. Manual-flow specimens preserve native paragraph ordering for Arabic, Hebrew and bidi controls.

The measured reading preset uses bundled **Source Serif 4 at 18/30px** so Canvas and DOM share an explicit available font. The longform reader retains Georgia. Collapsed excerpts paint the planned lines as selectable spans inside one paragraph; expansion restores complete native text. A shortened prefix is not left to rewrap into an extra line.

The [layout-engine guide](docs/pretext-layout-engine.md) explains the algorithms, [Pretext provenance](docs/pretext-provenance.md) records the upstream patterns and license, and the [integration proof](docs/pretext-mermaid-proof.md) shows how the same engine feeds Mermaid. Community uses `MeasuredTextArea` for composing/replying and `TextExcerpt` for post previews; Reading uses `PassageOutline` for its contents. Consult the v1.3 verification record for the flows actually exercised.

### Reuse measured text

This example lives inside `src/` and uses native editable and readable DOM text:

```tsx
import { useState } from 'react';
import { BalancedHeading, MeasuredTextArea, TextExcerpt } from './pretext';

export function PassageDraft() {
  const [body, setBody] = useState('A private memory becomes a shared procession.');

  return <section>
    <BalancedHeading text="Give the words room to move." as="h2" />
    <MeasuredTextArea label="Listening note" value={body} onChange={setBody}
      minRows={3} maxRows={8} maxLength={2000} />
    <TextExcerpt text={body} maxLines={3} />
  </section>;
}
```

The Pretext entry point loads its scoped stylesheet. Load the design-system tokens and bundled font imports from [src/main.tsx](src/main.tsx) in the host as well. Supply one consistent `TextStyle` to measurement and rendered text; do not override its font or spacing only in CSS.

## Keep the film close, keep the page readable

![The compact YouTube miniplayer at the top of the desktop archive, with native controls and its loading surface visible.](docs/screenshots/desktop-player.jpg)

*Historical v1.2 player capture; third-party playback is not certified by a screenshot.*

The video surface is an actual YouTube embed with native playback controls. On desktop, the compact 360px player docks at either upper corner. On phones, it uses the available width at the bottom and reserves enough document clearance to reach the final content.

A small tool strip provides the official-video link, docking, expansion and close actions. The same iframe remains mounted outside page-switching branches as the user moves through the archive. This is an **in-page miniplayer**; browser-native PiP is not implemented or claimed. See [the player API](docs/component-api.md#5-videoplayer) and [video provenance](docs/video-provenance.md).

## The components are part of the product

![The interactive design-system page with the archive’s reusable color foundations.](docs/screenshots/desktop-system.jpg)

*Historical v1.2 foundations capture.* The current System page uses the same exported components as the rest of the archive. Open **`/#system?section=components`** for the original specimens plus the new gallery: controlled selection, radio/select/range inputs, native disclosures, bounded pagination, progress, contributor avatars, dismissible notices, clipboard success/failure and loading states. Every specimen uses actual state; the gallery does not submit data to an external service.

| Area | Exports |
| --- | --- |
| Actions | `Button`, `IconButton`, `CopyButton` |
| Content | `Tag`, `SectionHeading`, `MediaCard`, `EmptyState`, `Avatar`, `AvatarGroup`, `CodeBlock`, `Kbd` |
| Inputs | `SearchField`, `TextField`, `TextArea`, `Checkbox`, `Switch`, `RadioGroup`, `SelectField`, `RangeField` |
| Navigation and disclosure | `TabBar`, `Accordion`, `Breadcrumbs`, `Pagination` |
| Feedback | `Dialog`, `Toast`, `Progress`, `Notice`, `Skeleton` |
| Foundation | `tokens`, `DesignTokens` |
| Product components | `PretextMermaid`, `VideoPlayer`, `ReadingPage` |

### Reuse a component

This example assumes the file lives in `src/`:

```tsx
import { useState } from 'react';
import { Button, Dialog, TextField } from './design-system';

export function NoteExample() {
  const [open, setOpen] = useState(false);

  return <>
    <Button onClick={() => setOpen(true)}>Leave your mark</Button>
    <Dialog open={open} onClose={() => setOpen(false)} title="Your note.">
      <TextField label="Title" placeholder="Something worth remembering" />
      <Button variant="secondary" onClick={() => setOpen(false)}>Done</Button>
    </Dialog>
  </>;
}
```

The foundation barrel imports its CSS. Load the bundled Fontsource families as shown in [src/main.tsx](src/main.tsx), or supply deliberate fallbacks. The diagram’s measurement contract uses **Inter 400 at 16px**, with the bundled **Noto Sans KR Variable** fallback. `ReadingPage` also needs `src/reading.css` in its host. Exact props, defaults and controlled-state examples are in the [component API](docs/component-api.md) and [extended-component reference](docs/extended-components.md).

## Explore the example

| View | What works |
| --- | --- |
| **Record** · `#archive` | Fourteen tracks, expandable listening notes, saved-track filter, album-art viewer, Spotify links and the synchronized reading workspace |
| **Films** · `#films` | Four official-video entries and the shared compact player |
| **People** · `#community` | Search, filters, sorting, votes, saves, local post creation, nested replies and validation |
| **System** · `#system` | Live foundations, 28 foundation components, 7 Pretext components, mobile specimens, references and downloadable Markdown |
| **Components gallery** · `#system?section=components` | Stateful foundation specimens with native keyboard and form behavior |
| **Pretext lab** · `#system?section=pretext` | Editable text-layout specimens, width controls, font controls and inspectable cache measurements |

Global search opens with `/` or `Ctrl/Cmd + K`. A saved collection and the mobile Index connect the views. Community content is a **local browser demonstration**: starter discussions and counts are samples; new posts, replies, votes and saves use versioned, validated browser storage. There is no shared community backend.

## Run locally

Use **Node.js 22.18 or newer**. The lockfile resolves the dependencies, and embedded videos do not require a YouTube API key.

```sh
git clone https://github.com/julymeltdown/black-parade-design-system.git
cd black-parade-design-system
npm ci
npm run dev
```

Open the URL printed by Vite. Append `/responsive.html` to open the viewport lab.

```sh
npm run test:pretext  # Canvas layout/adapter and font-lifecycle tests
npm run typecheck    # TypeScript
npm run build        # TypeScript + production Vite build
npm run preview      # Serve the built application
```

This is a source repository and example application, not a published npm component package. Components can be imported within the project or copied with their required styles and notices.

## Documentation and source map

| Start here | Contents |
| --- | --- |
| [design.md](design.md) | v1.3 design contract, text measurement and responsive behavior |
| [Component API](docs/component-api.md) | Actual exports, props and integration examples |
| [Extended components](docs/extended-components.md) | The 16 new foundation components, state contracts and examples |
| [Pretext components](docs/pretext-components.md) | All 7 text components, measurement states and integration examples |
| [Pretext layout engine](docs/pretext-layout-engine.md) | Cache policy, source cursors, ellipsis, flow and measured list indexing |
| [Pretext provenance](docs/pretext-provenance.md) | Inspected upstream source, adapted patterns and retained license |
| [Pretext–Mermaid proof](docs/pretext-mermaid-proof.md) | Text measurement, generated source, geometry and reproducible checks |
| [v1.3 verification](docs/verification-v1.3.md) | Current checks and their scope |
| [Historical v1.2 verification](docs/verification.md) · [JSON](docs/verification.json) | Earlier recorded results; not evidence for v1.3 additions |
| [Reference study](docs/references.md) | Inspected design documents, clone sources and license findings |
| [Reading provenance](docs/reading-provenance.md) | Pinned CSS sources and adaptations |
| [Video provenance](docs/video-provenance.md) | Pinned iframe source and player implementation details |
| [Foundation source](src/design-system/) | Typed tokens, 28 components and foundation CSS |
| [Pretext source](src/pretext/) · [shared engine](src/lib/pretext-layout.ts) | 7 components, font lifecycle and reusable text geometry |
| [Product components](src/components/) | The diagram and player with scoped styles |
| [Example pages](src/pages/) | Record, reading, films, people and System |
| [Assets](public/assets/) | Supplied imagery and the optimized paper texture |

## What was verified

**v1.3: 24 tests passed, TypeScript passed, production build passed.** During browser work, the same English text retained three excerpt lines at 320/390/768px iframe widths with no new preparations after warm-up. Native foundation interactions were exercised at mobile widths. The final Korean font-readiness check and a clean browser pass after the last typography fixes remain incomplete because the browser tool rejected further access. Those limits are recorded without relabeling historical captures.

The [v1.3 verification record](docs/verification-v1.3.md) records current test results, observed browser behavior and the remaining verification limits. The implementation descriptions above specify behavior; they do not imply that every browser or physical device has passed a check.

**Historical v1.2 evidence:** the earlier [verification record](docs/verification.md) documents **6 adapter tests passed**, successful TypeScript checking and a production build. That revision's Archive reader was measured at **10 viewport widths from 320 to 1440px**: all five SVG nodes remained present, no labels were clipped, the graph fit its container, and the document had no horizontal overflow. Node selection, passage selection, keyboard navigation and synchronized editing were also exercised. These numbers apply to the earlier adapter and must not be relabeled as v1.3 results.

Those historical observations apply to managed Chromium. They do not certify physical iOS/Android behavior, every browser engine, or uninterrupted third-party playback. In that run the native YouTube embed and controls loaded; autoplay, captions, fullscreen and continuous audio were not certified. The recorded build reported a size advisory for some optional Mermaid chunks. Each verification record keeps its own limits explicit.

## Sources, media and notices

The reader includes scoped CSS adapted from **react-notion-x**, **Obsidian Minimal** and **Medium Editor**. The player’s iframe/container structure adapts **saddamarbaa’s YouTube clone**. Their pinned revisions, exact changes and complete MIT notices are retained in the [reading](docs/reading-provenance.md) and [video](docs/video-provenance.md) provenance documents and [docs/vendor](docs/vendor/).

Pretext measurement patterns are documented separately in [Pretext provenance](docs/pretext-provenance.md). The engine uses public `@chenglou/pretext` 1.0.0 APIs, including the rich-inline entry point; it does not present upstream demo code as an original algorithm.

Cynthia Ugwu, REJOUICE and Obys informed the open editorial composition. Spotify, YouTube and Reddit informed interaction research. The [reference audit](docs/references.md) distinguishes studies from source that was actually adapted.

The six supplied album and performance images are **not declared open-source assets**. The paper texture was generated from the visual character of the supplied cover and encoded to WebP; its lossless source is in [assets-source](assets-source/). Fonts and dependencies retain their own licenses. Software permissions do not grant rights to artwork, photography, artist identity or embedded video. No full lyrics or audio files are bundled. This is an independent fan-oriented design study, not an official My Chemical Romance product.
