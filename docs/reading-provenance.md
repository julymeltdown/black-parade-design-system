# Reader CSS provenance and integration

Inspected on **9 November 2026** through the GitHub connector. The reading view uses actual scoped CSS adaptations from the three permissively licensed projects below. They are not presented as first-party Medium, Notion or Obsidian application styles.

`src/reading.css` identifies the sources in its opening comment. Complete copyright and permission notices are retained under `docs/vendor/`; include those notices when redistributing the adapted stylesheet. The rest of the archive's earlier clone study remains reference work, not a claim that code was copied from every listed project.

## 1. Notion-style document structure

**Project:** [NotionX/react-notion-x](https://github.com/NotionX/react-notion-x), a community React renderer for Notion content.

**Pinned commit:** `dd4c891997f6c42413623f6ea836c3ba34e042fb`.

**Inspected and adapted source:** [packages/react-notion-x/src/styles.css](https://github.com/NotionX/react-notion-x/blob/dd4c891997f6c42413623f6ea836c3ba34e042fb/packages/react-notion-x/src/styles.css).

**License:** MIT, Copyright (c) 2026 Travis Fischer. [Upstream notice](https://github.com/NotionX/react-notion-x/blob/dd4c891997f6c42413623f6ea836c3ba34e042fb/license); [complete retained notice](vendor/react-notion-x/LICENSE).

| Source selectors | Adaptation in `src/reading.css` |
| --- | --- |
| `.notion-page-content`, `.notion-page-content-inner` | `.reading-article` retains the full-width flex-column document flow, relative positioning and start alignment. Paragraph blocks control their own readable measure. |
| `.notion *`, `.notion b` | Scoped `box-sizing: border-box`; a 600 weight for strong text. No global reset is imported. |
| `.notion-list-numbered`, `.notion-list li` | `.reading-prose ol` retains decimal markers, `1.6em` inline indentation and `.6em` block margins; list items retain `6px 0` padding. |
| `.notion-asset-wrapper`, `.notion-asset-wrapper img` | `.reading-figure` is a centered flex-column figure with an image sized to its available width. Intrinsic image proportions replace the source's full-height behavior. |
| `.notion-h`, `.notion-text` | Heading width/wrapping and edited passage `white-space: pre-wrap` are scoped to reading content. The paragraph body wraps long edited strings. |

Not copied: `.notion *:focus { outline: 0 }`, sticky aside contents, small sidebar labels, theme colors, rounded code controls or embedded application chrome. Native focus indicators and 44px controls remain available.

## 2. Obsidian readable measure

**Project:** [kepano/obsidian-minimal](https://github.com/kepano/obsidian-minimal), an independently maintained theme for Obsidian.

**Pinned commit:** `93321bdc23fc879966e1e3aa0cfeda77012f540f`.

**Inspected source files:**

- [src/scss/features/block-width.scss](https://github.com/kepano/obsidian-minimal/blob/93321bdc23fc879966e1e3aa0cfeda77012f540f/src/scss/features/block-width.scss)
- [src/scss/content/text.scss](https://github.com/kepano/obsidian-minimal/blob/93321bdc23fc879966e1e3aa0cfeda77012f540f/src/scss/content/text.scss)
- [src/scss/variables/root.scss](https://github.com/kepano/obsidian-minimal/blob/93321bdc23fc879966e1e3aa0cfeda77012f540f/src/scss/variables/root.scss)

**License:** MIT, Copyright (c) 2020–2024 Steph Ango (@kepano). [Upstream notice](https://github.com/kepano/obsidian-minimal/blob/93321bdc23fc879966e1e3aa0cfeda77012f540f/LICENSE); [complete retained notice](vendor/obsidian-minimal/LICENSE).

The source's readable-line-width rules set an inner block's `width`, `max-width` and automatic inline margins while allowing a larger outer canvas. `.reading-measure` directly adapts this mechanism with locally scoped variables: `--reading-line-width: 65ch` and `--reading-max-width: 100%`. Wide diagrams can therefore use the available page width without stretching prose across it. SCSS selectors tied to the Obsidian application are flattened into ordinary CSS.

Heading `letter-spacing: -.02em` is retained from `text.scss`. The source's heading and paragraph spacing variables inform the local rhythm, but the final page is intentionally denser: sections use 32px desktop/28px mobile starts, and paragraphs use 1.25em/1.15em separation. No Obsidian sidebar, pane divider, editor toolbar, application color palette or status-bar layout is imported.

## 3. Medium-style reading typography

**Project:** [yabwe/medium-editor](https://github.com/yabwe/medium-editor), a community Medium-style editor. This is an editor's demonstration stylesheet, not a complete clone of Medium's current website.

**Pinned commit:** `d113a74437fda6f1cbd5f146b0f2c46288b118ea`.

**Inspected and adapted source:** [demo/css/demo.css](https://github.com/yabwe/medium-editor/blob/d113a74437fda6f1cbd5f146b0f2c46288b118ea/demo/css/demo.css).

**License:** permissive MIT terms, Copyright Davi Ferreira and voluntary contributors. The source includes a separate note about externally maintained `node_modules`; those dependencies are not imported by this adaptation. [Upstream notice](https://github.com/yabwe/medium-editor/blob/d113a74437fda6f1cbd5f146b0f2c46288b118ea/LICENSE); [complete retained notice](vendor/medium-editor/LICENSE).

The demo's `h2` declarations—32px size and 42px line height—are retained for desktop reading sections. Its 26px/32px subordinate heading scale is retained in the generic reading heading rules. Chapter selection headings receive a compact 20px override. All selectors are scoped; an embedded reader adjusts heading levels without changing the visual hierarchy.

The source's 22px/30px body and 40px paragraph gap are adapted to 18px/1.8 with a 1.25em paragraph gap. Mobile uses 17px/1.8 with a 1.15em gap. Georgia and local serif fallbacks support extended reading while interface controls continue to use Inter. These are deliberate changes for the requested dense, responsive paper canvas.

Not copied: focus suppression, fixed top bar, heading/divider rules, colored quote rails, green hover colors, 960px fixed container, rounded code box and multicolumn demo layout. The reading view has no section borders or filled selections.

## 4. React contract and linked diagram

`src/pages/Reading.tsx` exports `ReadingPage` and `ReadingPageProps`:

```tsx
type ReadingPageProps = {
  watch: (id: string) => void;
  selectedId?: ChapterId;
  onSelect?: (id: ChapterId) => void;
  embedded?: boolean;
};
```

Use `embedded` when mounting inside Archive; the section receives a focusable h2 title and no additional `.page` inset. It immediately presents a passage selector, the live map and the currently selected readable passage. At 1000px and above the map and passage share two unframed columns; smaller screens place the selected passage before the map. A native “Read the full essay” disclosure holds the longer article below this working view. A standalone use receives an h1 and the complete article directly. The host imports `src/reading.css`. No third-party editor runtime is needed for these CSS adaptations.

The reader imports `CHAPTERS` and `ChapterId` from `src/lib/pretext-mermaid.ts`. The five IDs are `curtain`, `memory`, `loss`, `theatre` and `resolve`. The diagram projects a short literal excerpt from the same chapter body by default. Its evidence disclosure can switch to full-passage labels; the nearby reader always retains the complete paragraph. The always-available passage selector and essay heading buttons call the shared selection callback; graph node selection uses the same callback. A polite status announces selection changes without reading every keystroke in the passage editor. Archive now supplies the controlled selection through `CHAPTERS.trackIds`: opening a track selects its chapter, while selecting a chapter retains a matching open track or selects that chapter's first track. Expanded notes include a direct map action that selects the matching chapter and scrolls/focuses the reader heading.

The reader owns a `Partial<Record<ChapterId, string>>` of session edits and passes it to `PretextMermaid` as `textOverrides`, together with `onTextChange`. A text edit updates both the readable paragraph and its diagram label. It is not persisted or submitted. The map's layout and measurements belong to the Pretext component; this document does not claim that browser measurement tests have passed.

The contents disclosure is native `<details>`. Its buttons focus and scroll to section headings without replacing the application's hash route. Paragraph citations use ordinary external links. The official video button calls `watch('RRKJiM9Njr8')`, using the existing player instead of creating a second media session.

## 5. Editorial and image sources

The essay is original editorial commentary. The short factual introduction uses [Apple Music's album page](https://music.apple.com/us/album/the-black-parade/1156310650) for album identity and release context, and [Warner's album listing](https://mychemicalromance.warnerrecords.com/products/the-black-parade-20th-anniversary-edition-deluxe-digital-album) for the stated Patient premise. Warner's cited listing concerns the anniversary edition; it is not presented as the original release page.

The interpretation's five movements and graph edges are explicitly editorial. They are neither an official chronology nor quotations from the band. Image observations concern the user-supplied reference images. The image files remain unchanged; display blending is CSS-only. The CSS software licenses do not apply to album artwork, photography, band identity or embedded media.

## 6. Verification scope

Required checks: 320px reading width, 200% zoom, keyboard contents navigation, visible focus, source links, paragraph-to-node selection, node-to-paragraph selection, text edit synchronization and video continuity. The parent project's validation record must identify which checks actually ran. These requirements and the existence of a typed implementation are not a claim of completed visual or physical-device testing.
