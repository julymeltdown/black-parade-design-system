# Verification record — v1.2

Recorded on 9 November 2026 (Asia/Seoul). This record separates measured results from implementation intent.

## Executed checks

- `npm run test:pretext`: **6 passed, 0 failed** with the installed Inter font and a real Canvas engine. The tests cover full-text preservation, line width limits, genuine rewrapping, literal excerpt projection, preparation reuse, single-passage invalidation, label escaping and unchanged topology.
- The final `npm run build` completed successfully: TypeScript checking passed and Vite produced the production site. Vite reported an advisory about large optional Mermaid chunks; it was not a build failure.
- Source changes pass `git diff --check`.

## Actual browser geometry

The managed Chrome preview ran the real React application in a responsive iframe. Its width is a real CSS viewport, not a scaled screenshot. A classic scrollbar occupies 15px in this browser, and the application then applies its responsive page insets. This explains why the map's content width is smaller than the viewport.

Every row below had **five SVG nodes**, **zero clipped node labels**, **no document horizontal overflow**, and a graph width smaller than its available content width. Graph text remained 16px. The prose was 17px on phone widths and 18px at 640px and above.

| Viewport | Map content width | Actual SVG width | Actual SVG height | Fits |
| ---: | ---: | ---: | ---: | :---: |
| 320px | 273px | 256px | 646px | Yes |
| 360px | 305px | 278px | 575.6px | Yes |
| 390px | 335px | 318px | 540.4px | Yes |
| 430px | 375px | 354px | 434.8px | Yes |
| 640px | 561px | 494px | 346.8px | Yes |
| 768px | 689px | 494px | 346.8px | Yes |
| 900px | 813px | 798px | 197.6px | Yes |
| 1024px | 595px | 494px | 346.8px | Yes |
| 1180px | 682px | 494px | 346.8px | Yes |
| 1440px | 852px | 814px | 180px | Yes |

At 1000px and above, the reader splits into a map and a prose column. That deliberate composition change explains the narrower map at 1024px than at 900px. Phones show the selected paragraph before the map. The small-screen diagram remains taller because its 16px type is preserved instead of being scaled down.

### Full-passage integration proof

The evidence disclosure's full-passage mode was exercised at actual diagram widths of 320px and 390px. The same text produced different Pretext line breaks; Mermaid used those explicit breaks and measured node widths.

| Diagram space | Label budget | Per-node line counts | SVG width | New preparations on width change | Clipped labels |
| ---: | ---: | --- | ---: | ---: | ---: |
| 320px | 116px | 13 / 14 / 13 / 14 / 13 | 308px | 0 / 5 | 0 |
| 390px | 151px | 8 / 10 / 8 / 10 / 9 | 378px | 0 / 5 | 0 |

The unwrapped baseline was toggled and displayed its intentional local horizontal-scroll status. Pretext wrapping, excerpt mode and Fit were restored afterward.

## Executed interaction checks

| Action | Observed result |
| --- | --- |
| Select the SVG node “The private losses” | The nearby heading and complete paragraph changed to that passage. |
| Select “The world turns” in the reader's native passage control | The SVG's selected ID and pressed node both became `theatre`; the matching House of Wolves track opened. |
| Press Enter on a node, then ArrowRight | Selection moved through the chapter sequence; the reader reported `theatre`. |
| Edit the shared passage with English, Korean and a long unbroken token | Both prose and SVG displayed the edited content; five nodes remained, no clipping was reported, and the 378px SVG fit the 390px space. The original text was restored. |
| Open the official film | The actual YouTube embed loaded the official video title and native playback controls. |
| Inspect mobile player at 390px | The 375px-wide media viewport measured 210.9375px high; visible custom controls measured 44 × 44px. No extra status/title/footer text was present. |
| Inspect final desktop top dock | Media viewport measured 360 × 202.5px at y=60px. The 176 × 44px tool strip occupied y=16–60px, entirely outside the iframe. |

The video component remains outside page-switching branches and retains one iframe without a changing React key. Resizing and docking change CSS/state without changing its source URL. That is an implementation property checked in source; uninterrupted playback through a complete expand/navigation sequence was **not** verified after the browser interruption.

## Defects found and corrected

1. Mermaid 12 prefixes flowchart node IDs with its render ID. The adapter now matches that actual output.
2. Mermaid 12's default layout/look did not match the assumed flowchart geometry. The adapter explicitly selects `dagre` and `classic`.
3. Classic node geometry adds four times the configured horizontal padding across label/rectangle preparation. The width budget now reserves that measured overhead.
4. Putting every complete paragraph into every default node made the mobile map over 1000px tall. Default labels now use a literal six-word excerpt; the complete passage remains in the reader and is available in the proof mode.
5. The responsive iframe originally included its border inside the requested width. Its content box now matches the selected viewport width.

## Scope and remaining limits

- These measurements cover the final Archive reader and graph in managed Chromium. They are not physical iPhone/Android, Safari, Firefox, software-keyboard or safe-area hardware tests.
- The final revised Films, People and System pages received source/type checking; they were not all rerun through the complete viewport matrix after the final density edits.
- A native YouTube player and its controls loaded. Autoplay, continuous audio playback, captions, fullscreen and native browser PiP were not certified. The application implements a web miniplayer, not a custom native-PiP API.
- The private production deployment's sign-in path was blocked by automatic approval review. Production success is established by the Sites deployment result; an authenticated production browser session was not verified.
- The environment's shared development preview could be switched by another concurrent project. The checks above were taken only while the page identified itself as The Parade Archive. The source ZIP is created from an explicit allowlist under this project's checkout.
- Community posts, votes, replies and saves are a local browser demonstration. No shared backend or live engagement counts are claimed.

## Reproduce

```sh
npm ci
npm run test:pretext
npm run typecheck
npm run build
npm run dev
```

Open `/responsive.html`, select Record and a viewport width, then inspect the reading map's “How the text shapes this map” disclosure. It exposes the generated Mermaid source and live measurements. The diagram checks its own inserted SVG; it does not display a hard-coded pass indicator.
