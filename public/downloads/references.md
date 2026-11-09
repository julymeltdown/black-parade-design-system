# References and asset provenance

Research date: **9 November 2026**. These references were retrieved and inspected for The Parade Archive. They informed layout, interaction and documentation; this project does not claim affiliation with the referenced services.

The implementation combines custom application code with explicitly attributed, permissively licensed CSS adaptations for its reader and a licensed iframe/container adaptation for its player. The earlier six product clones and three editorial clone stylesheets below were studied as examples, not copied wholesale. A repository appearing publicly on GitHub does not establish a reuse license. The reader's reused declarations are documented in [reading-provenance.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/reading-provenance.md); the actual player adaptation is documented in [video-provenance.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/video-provenance.md). Both record pinned commits and retained notices.

## Current visual direction: open canvas

The user's revision rejects the initial dashboard framing. The governing visual contract is now a transparent masthead, small plain-text desktop links, a mobile Index with a type-only table of contents, and one continuous paper canvas. There are no fixed sidebars, bottom navigation strips, filled navigation selections or page partition lines. Product references later in this document inform behavior only when compatible with this contract.

| Primary site and inspected clone CSS | Concrete evidence in the clone | Applied composition |
| --- | --- | --- |
| [Cynthia Ugwu](https://cynthiaugwu.com/); [Kumaramanweb clone — style.css](https://github.com/Kumaramanweb/cynthia-ugwu-clone/blob/main/style.css) | `.nav_bar` uses flex and `justify-content: space-between`; name and menu are plain text. `.main-heading h1` uses `10vw` type and unit line height; the second line is offset and small metadata aligns to its edge. | Quiet masthead; one dominant typographic composition; intentional text offsets and shared alignment rather than boxed regions. |
| [REJOUICE](https://www.rejouice.com/); [codeaashu clone — style.css](https://github.com/codeaashu/REJOUICE-CLONE/blob/main/style.css) | `.inner-content nav` spans the canvas with `3vw` padding and plain anchors. The main wordmark reaches `22vw`; subsequent content reuses the `3vw` inset. | Consistent page inset, generous canvas and a clear scale difference between navigation and headline. Do not copy the orange menu, cursor decoration or section-border effects. |
| [Obys Agency](https://obys.agency/); [antra20 clone — style.css](https://github.com/antra20/Obys-Agency-Clone/blob/main/style.css) | Navigation uses a `5.5vw` side inset. `.hero` has a 72% width, 27% left offset and `7.2vw` headline/leading. Its mobile query resets the left offset to 5% and changes type to `9.8vw` with `10.5vw` leading. | Deliberate desktop asymmetry with a real mobile recomposition. Use responsive minimums for readable labels; reset offsets instead of shrinking a desktop layout. |

These are specific CSS observations, not a claim that the clones perfectly match the live sites. Official REJOUICE and Obys page content was retrieved; Cynthia Ugwu's page exposed only its loader text to the extractor. No live visual-browser audit of these three source sites is claimed. The source websites can also evolve independently of the clones.

The clone files include techniques deliberately excluded from this implementation: partition borders, filled menus, custom cursor circles, fixed navigation, long loaders and large animation stacks. This project adopts typography, whitespace and alignment. No code, proprietary font file or creative asset was copied from these repositories; their licenses were not established in this focused CSS review.

## 1. Official and author-published guidance

### Actual reader CSS adaptations

| Source, pinned commit and inspected files | Code carried into this project |
| --- | --- |
| [NotionX/react-notion-x](https://github.com/NotionX/react-notion-x/blob/dd4c891997f6c42413623f6ea836c3ba34e042fb/packages/react-notion-x/src/styles.css), `dd4c891997f6c42413623f6ea836c3ba34e042fb` | Scoped document flex flow, responsive figure structure, list indentation/padding and text wrapping. MIT; full notice at [vendor/react-notion-x/LICENSE](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/vendor/react-notion-x/LICENSE). This is a community renderer. |
| [kepano/obsidian-minimal — block-width.scss](https://github.com/kepano/obsidian-minimal/blob/93321bdc23fc879966e1e3aa0cfeda77012f540f/src/scss/features/block-width.scss), plus `content/text.scss` and `variables/root.scss`, `93321bdc23fc879966e1e3aa0cfeda77012f540f` | Width/max-width/automatic-margin reading blocks and heading tracking; local 65ch/100% variables and compact rhythm. MIT; full notice at [vendor/obsidian-minimal/LICENSE](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/vendor/obsidian-minimal/LICENSE). This is an independent Obsidian theme. |
| [yabwe/medium-editor — demo.css](https://github.com/yabwe/medium-editor/blob/d113a74437fda6f1cbd5f146b0f2c46288b118ea/demo/css/demo.css), `d113a74437fda6f1cbd5f146b0f2c46288b118ea` | Actual 32px/42px and 26px/32px heading declarations, with adapted body scale and shorter paragraph rhythm. MIT terms; full notice at [vendor/medium-editor/LICENSE](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/vendor/medium-editor/LICENSE). This is a Medium-style editor demo, not Medium's proprietary site CSS. |

All three complete license files were fetched at the pinned commits. Focus suppression, fixed bars, page dividers and filled navigation from source examples were excluded. The source adapters are visible in `src/reading.css`; detailed mappings and modifications are in [reading-provenance.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/reading-provenance.md). This code reuse does not relicense any supplied artwork.

### Guidance consulted

| Source | Material inspected | Applied lesson |
| --- | --- | --- |
| [Spotify Design — Reimagining Design Systems at Spotify](https://medium.com/spotify-design/reimagining-design-systems-at-spotify-2fe20fbb3552) | Official Spotify Design publication: Foundation, Web and local-system structure | Shared tokens support reusable primitives and product compositions. The original spotify.design URL returned 404 during retrieval; this official republication was available. |
| [Spotify Engineering — Encore x Accessibility](https://engineering.atspotify.com/2023/03/encore-x-accessibility-a-balancing-act) | Component semantics, interaction patterns and contextual accessibility guidance | Bake native behavior into components and verify the composed experience. An automated check alone cannot establish usability. |
| [YouTube — Decoding its design language](https://blog.youtube/inside-youtube/youtube-ambient-color-mode-visual-language-redesign/) | Official design-team discussion of media dominance, alignment, shape and color | Keep the film and its imagery visually primary. Rounded shapes and ambient glows were not adopted because they conflict with this project's art direction. |
| [YouTube — 2024 feature updates](https://blog.youtube/news-and-events/youtube-features-and-updates-2024/) | Official sections about miniplayer browsing and landscape responsiveness | Allow reading and browsing while media remains available. The example's floating iframe is an in-app player, not a native PiP guarantee. |
| [YouTube — Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality) | Current embedded-player size, player attributes and overlays/frames sections | Keep the archive's 44px tool strip entirely above and outside the iframe. Preserve native controls and an unobscured media viewport. |
| [YouTube — Embedded Players and Player Parameters](https://developers.google.com/youtube/player_parameters) | Iframe embedding, minimum viewport and supported playback parameters | Keep at least a 200 × 200px viewport; use the documented native controls and inline-playback parameters. A requested autoplay is not a playback guarantee. |
| [Reddit — Evolving the Reddit Brand](https://redditinc.com/news/evolving-the-reddit-brand-a-more-accessible-bespoke-typography-new-conversation-bubbles-and-colors-and-a-new-snoo-logo-now-with-opposable-thumbs) | Official typography and conversation-led brand explanation | Protect legibility and conversation hierarchy; decorative typography belongs in editorial headings, not comments. |
| [Vercel — Web Interface Guidelines](https://vercel.com/design/guidelines) | Keyboard, focus, hit targets, forms, responsive layout and motion guidance | Generous mobile targets, safe areas, visible focus, semantic controls, URL state and purposeful transitions. Brand-specific rules are not imported. |
| [Emil Kowalski — Design Engineering](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md) | Author's actual Markdown skill: motion decisions, components, performance and accessibility | Short feedback, transform/opacity transitions, hover capability checks, reduced motion and interactive documentation. |
| [Emil Kowalski — Mobile Native](https://github.com/emilkowalski/skills/blob/main/skills/mobile-native/SKILL.md) | Author's actual Markdown skill: viewport, safe areas, touch, scroll and inputs | Dynamic viewport sizing, 16px mobile fields, normal zoom, native scrolling and an honest distinction between emulation and hardware tests. |
| [UI Skills — Baseline UI](https://www.ui-skills.com/skills/ibelick/baseline-ui) | Published baseline covering primitives, layout, typography and motion | Named icon actions, explicit states, one restrained accent, stable layers and avoidance of unnecessary decoration. |
| [W3C — Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | WCAG 2.2 explanatory text and contrast thresholds | Evaluate text/background contrast and account for the textured rendering. Token calculations are not a full accessibility certification. |
| [W3C — Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Keyboard sequence, initial focus, Escape, accessible naming and focus return | Verify the complete native dialog flow, including long content and return to the invoking control. |

These sources contain opinions that sometimes differ. For example, motion guidance varies on custom easing and timing. The user's explicit visual direction and the application's actual interaction requirements govern this implementation.

## 2. Existing design.md documents

The following existing documents were read through **UI Skills' curated rendering**. They are not official Spotify, YouTube or Reddit design.md files. The useful reference is their documentation structure and precision; their branding is not transferred.

| Document | Inspected content | Application |
| --- | --- | --- |
| [Oxide Computer Design.md](https://www.ui-skills.com/design-md/oxidecomputer) | System metadata, surface/content/stroke token families, geometry, themes and CSS/React division | Semantic token documentation and a clear primitives/product division. Its visible grids and border-led composition are excluded from the current visual contract. |
| [Clerk Design.md](https://www.ui-skills.com/design-md/clerk) | Source map, typography, color, spacing, component and voice tables | Explain which files own the system and define concrete values and usage rules. |
| [Vercel Design.md](https://www.ui-skills.com/design-md/vercel) | Priorities, content hierarchy, composition, responsiveness and implementation boundaries | Document requirements in priority order and keep the foundation distinct from page-specific composition. |

The direct clerk.com/design.md endpoint returned a Markdown content type unsupported by the retrieval tool. The direct Oxide design.md endpoint was unavailable. The curated rendered documents were accessible; no claim is made that their first-party raw files were fetched.

## 3. Six React/TypeScript clone implementations

| Repository and exact code inspected | Useful pattern | Limits and license observation |
| --- | --- | --- |
| **Spotify:** [francoborrelli/spotify-react-web-client](https://github.com/francoborrelli/spotify-react-web-client). [mobilePlayer.tsx](https://github.com/francoborrelli/spotify-react-web-client/blob/main/src/components/Layout/components/PlayingBar/mobilePlayer.tsx), [PlayingBar.scss](https://github.com/francoborrelli/spotify-react-web-client/blob/main/src/styles/PlayingBar.scss) | Mobile now-playing identity, play/pause, queue and progress | [MIT LICENSE](https://github.com/francoborrelli/spotify-react-web-client/blob/main/LICENSE) explicitly read; copyright 2018 Franco Martín Borrelli. Only media behavior informs this example; the source's navigation and container styling are excluded. |
| **Spotify:** [diogo405/spotify-clone](https://github.com/diogo405/spotify-clone). [Track component](https://github.com/diogo405/spotify-clone/blob/master/src/components/Track/index.tsx), [album styles](https://github.com/diogo405/spotify-clone/blob/master/src/pages/AlbumPage/styles.css) | Typed number/name/duration row and responsive album identity | No license file found in the inspected repository tree. Structural study only; avoid the example's hover-dependent action affordances. |
| **YouTube:** [Arifineko/YouTube-clone](https://github.com/Arifineko/YouTube-clone). [Watch.tsx](https://github.com/Arifineko/YouTube-clone/blob/main/src/pages/Watch.tsx), [VideoThumbnail.tsx](https://github.com/Arifineko/YouTube-clone/blob/main/src/components/VideoCard/VideoThumbnail.tsx) | Single-column to split watch layout, aspect-ratio media, expandable supporting text | No license file found in the inspected tree. Reimplement semantic expansion and square surfaces rather than copying its component styling. |
| **YouTube:** [codeofmohit/youtube_clone](https://github.com/codeofmohit/youtube_clone). [Watch.tsx](https://github.com/codeofmohit/youtube_clone/blob/main/youtube-spinoff/src/pages/Watch.tsx) | Media/detail relationship and responsive secondary content | No license file found in the inspected tree. Its surrounding application chrome is excluded. This project reflows useful mobile content instead of hiding the secondary experience. |
| **Reddit:** [gianlucajahn/typescript-reddit-clone](https://github.com/gianlucajahn/typescript-reddit-clone). [PostedComment.tsx](https://github.com/gianlucajahn/typescript-reddit-clone/blob/main/src/components/PostedComment/PostedComment.tsx), [GridPost.scss](https://github.com/gianlucajahn/typescript-reddit-clone/blob/main/src/components/GridPost/GridPost.scss), [Grid.scss](https://github.com/gianlucajahn/typescript-reddit-clone/blob/main/src/containers/Grid/Grid.scss) | Continuous feed, community/author/date hierarchy, vote/reply groups and nested discussion | No license file found in the inspected tree. Do not inherit tiny targets, nonsemantic click controls or narrow fixed layouts. |
| **Reddit:** [joschan21/breadit](https://github.com/joschan21/breadit). [PostFeed.tsx](https://github.com/joschan21/breadit/blob/master/src/components/PostFeed.tsx), [PostComment.tsx](https://github.com/joschan21/breadit/blob/master/src/components/comments/PostComment.tsx) | Typed feed entries and a contextual reply composer with labels, cancellation and error feedback | No license file found in the inspected tree. The archive demo is explicitly local; it does not copy this project's backend or imply remote persistence. |

The inspection covered the linked source files, not comprehensive audits or successful executions of these external projects. Default-branch links may change after the research date. No star count or popularity claim is used as evidence of implementation quality.

### Licensed player code adaptation

The final player additionally adapts [saddamarbaa/Youtube-clone-app-react-vite-typescript](https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript) at commit `10962e1bbdedb7e910c8944292c136490b5a917c`. The inspected [VideoPreview.tsx](https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript/blob/10962e1bbdedb7e910c8944292c136490b5a917c/src/components/VideoPreview.tsx) contributes the native iframe/container structure, dynamic video URL, fullscreen permission and flex media container. The [watch screen](https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript/blob/10962e1bbdedb7e910c8944292c136490b5a917c/src/screens/VideoWatchScreen.tsx) was also reviewed.

The repository's [MIT license](https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript/blob/10962e1bbdedb7e910c8944292c136490b5a917c/LICENSE), Copyright (c) 2021 saddamarbaa, is retained in [vendor/youtube-clone-LICENSE.txt](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/vendor/youtube-clone-LICENSE.txt), alongside the original inspected component. This is a community clone, not YouTube's proprietary frontend. The archive's docking state, persistent mounting, 44px external icon strip, focus behavior and measured document-end spacing are new implementation. The donor's fixed heights, metadata panels, comments and rounded description treatment were excluded. [video-provenance.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/video-provenance.md) records the exact adaptation and limits.

## 4. User-supplied reference assets

The user provided all six images below. Original bytes were copied into the project's assets directory; display cropping, masks and blending occur in CSS. The table records source correspondence, confirmed by byte hashes at preparation time.

| Project asset | Supplied file | Source dimensions | Use |
| --- | --- | --- | --- |
| `album-cover.png` | `image(3).png` | 250 × 250 | Album identity and paper reference |
| `the-parade-band.png` | `image(4).png` | 1280 × 720 | Band portrait |
| `live-performance.png` | `image(5).png` | 415 × 739 | Portrait performance image |
| `single-cover.png` | `image(6).png` | 316 × 316 | Song cover |
| `parade-film.png` | `image(7).png` | 799 × 472 | Film imagery |
| `parade-artwork.png` | `image(8).png` | 800 × 1200 | Illustrated procession |

The upload context supplies references, not an open-source license for the artwork, photographs, band identity or embedded music. This project makes no blanket licensing assertion about these materials and does not relicense them through the code. The example is presented as an independent archive concept.

Do not infer a performance's venue, date or authorship from an image alone. Preserve low-resolution source limitations instead of describing small covers as high-resolution masters.

## 5. Generated paper material

`paper-grain.png` is a separately generated **1254 × 1254px** blank paper texture. Its input reference was the supplied album cover. The production `paper-grain.webp` is the web-optimized texture derivative.

The generation brief requested cool off-white/light-gray fibers, small charcoal flecks and fine scuffs, with no lettering, logos, figures, frame, vignette or large stains. It explicitly rejected yellow parchment and dramatic torn edges. This supports the album's material character without using an enlarged cover as the whole page background.

The texture was visually inspected for material and excluded elements. Seamlessness was requested during generation but was not numerically established. The application must inspect repeat boundaries at its actual CSS background size and reduce visible seams if necessary. No claim is made that the texture is scanned from an original sleeve.

## 6. Media and validation provenance

The embedded reader cites [Apple Music](https://music.apple.com/us/album/the-black-parade/1156310650) for album identity and release context and [Warner Records](https://mychemicalromance.warnerrecords.com/products/the-black-parade-20th-anniversary-edition-deluxe-digital-album) for the Patient premise. Warner's linked listing concerns the anniversary edition. The reader's five passage labels, track groupings and diagram edges are editorial interpretations, not sourced official story chronology. The readable paragraphs, graph and archive track selection share `CHAPTERS` and its `trackIds`; prose and diagram also share session text edits.

YouTube playback uses an external embed and an ordinary external fallback link. Spotify listening actions lead to an external search. Neither feature establishes an audio-streaming license or guarantees availability, authentication, autoplay or native PiP.

The Pretext/Mermaid adapter is described in [pretext-mermaid-proof.md](https://github.com/julymeltdown/black-parade-design-system/blob/main/docs/pretext-mermaid-proof.md), including its actual Canvas checks and limitations. Node lookup now accounts for Mermaid's render-ID prefix. Final browser verification must still inspect the five rendered nodes, label containment, available-width fit and bidirectional selection. The prefix fix alone is not recorded as a completed SVG-fit pass here.

The demo's sample posts and engagement values are illustrative. Local storage actions are not network publication. Tests performed by this project should be recorded in its validation notes with actual viewport, action and result. The acceptance list in design.md is a test plan until those observations exist.

