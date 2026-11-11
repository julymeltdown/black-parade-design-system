# Verification — v1.3

11 November 2026. This record separates executed checks from implementation intent. [Machine-readable observations](verification-v1.3.json) accompany it. Existing screenshots in `docs/screenshots/` and numbers in `verification.md` are **v1.2 evidence**, not captures of the new components.

## Automated checks

The final source passed the following commands. The suites cover real Canvas geometry, source preservation, cache reuse, the Mermaid adapter and the browser font coordinator's asynchronous lifecycle. Font-lifecycle tests use a controlled FontFaceSet, while the text-layout tests use the bundled Inter face with `@napi-rs/canvas`.

- `npm run test:pretext`: **24 passed, 0 failed** — 11 layout-engine tests, 7 Mermaid adapter tests and 6 font-lifecycle tests.
- `npm run typecheck`: **passed**, exit 0.
- `npm run build`: **passed**, exit 0; Vite reported a size advisory for optional Mermaid chunks. The main entry was 483.96 kB / 165.41 kB gzip. These sizes are not load-time measurements.
- `git diff --check`: **passed**. Repository-local Markdown links also resolved.

## Browser observations completed

The example was opened in shared Chromium through its supported managed preview. The responsive harness gives the iframe a real CSS viewport; it does not emulate a physical mobile keyboard, safe-area geometry or touch device.

### Width-only reflow

The following readings were taken in sequence after font loading, with the Source Serif 4 reading preset and the same English text. The cumulative preparation count includes earlier page activity and development reloads, so the useful comparison is its **zero increase** during these three width changes.

| Iframe viewport | Body client / scroll width | Measured text width | Excerpt lines / height | Prepared entries | Cumulative preparations | Mounted sample notes |
| --- | --- | --- | --- | --- | --- | --- |
| 390px | 375 / 375px | 335px | 3 / 90px | 212 | 1056 | 4 / 200 |
| 320px | 305 / 305px | 273px | 3 / 90px | 212 | 1056 | 3 / 200 |
| 768px | 753 / 753px | 689px | 3 / 90px | 212 | 1056 | 6 / 200 |

The iframe's classic vertical scrollbar accounts for the 15px difference between its viewport and body client width. No document-level horizontal overflow was observed in these readings. At the 273px text width, image flow correctly switched to complete native text below the image. Rich-inline specimens occupied 6, 5 and 2 lines at the 273, 335 and 689px text widths, without observed horizontal scroll overflow.

At 335px, the three Source Serif 4 excerpt lines occupied **321.50, 279.78 and 322.58px** in native DOM Range measurements. The paragraph occupied **90px**, matching three 30px lines. At 760px text width, the Inter textarea predicted four lines and occupied 126px including its padding/border; its scroll height matched its client height. At the narrowest width, a long textarea deliberately reached its nine-row maximum and scrolled internally.

The shared 512-entry cache retained the 200-row sample. These are operation counts and geometry readings, not a speed or frame-rate benchmark. List resize anchoring and the complete-content toggle are implemented but were not exercised before the browser session became blocked.

### Foundation interactions

At mobile iframe widths, these actions were exercised through native controls:

- Selecting the master checkbox selected all three collection kinds.
- ArrowRight changed the native radio selection from Comfortable to Compact.
- ArrowRight changed the reading-size range from 18px to 19px.
- Turning off the contributor switch removed the names.
- Opening the second accordion item closed the first; only the selected disclosure remained open.
- Selecting page 3 displayed the final note pair and disabled Next.
- Selecting the error notice produced `role="alert"`.
- Copying the test command displayed “Copied to clipboard.”

The gallery's body client width equaled its scroll width at both 390px and 320px iframe sizes. The inspected select controls had 16px text and 48px height. Clipboard-denial behavior, assistive-technology speech and physical touch operation were not exercised.

## Issues found and changes made

**System serif mismatch.** At a 335px text width, the former Georgia/system-fallback excerpt was predicted as three lines but painted as four native lines. The controlled reading preset now loads bundled static Source Serif 4; collapsed excerpts use the measured line plan, and expanded excerpts retain full native paragraphs. The named-serif 335px result above was observed after this change.

**Hanging spaces.** Pretext's line width excludes hanging separator spaces. A `white-space: pre` span could report overflow consisting only of its final space. Excerpt and flow line boxes now use `pre-wrap` with normal word breaking and overflow wrapping. Source spaces remain selectable. This final CSS adjustment was not rechecked in the browser after the policy block.

**React shorthand warnings.** Changing the reading preset exposed React warnings about a `font` shorthand resetting sibling longhands. Rendering now expands the font into family, size, weight, style, stretch and variant properties, then applies the explicit line height and shaping contract. TypeScript/build checks cover this update; a clean browser reload was blocked.

**Font-readiness delay.** During a Korean sample switch, the text remained in complete native layout while font readiness did not settle within the observation interval. The lab now exposes an explicit font error, and the loader has a bounded wait with cleanup and late-load recovery. Mocked lifecycle tests exercise that behavior. A final real-browser Korean check remains outstanding; the transcript does not establish that the earlier delay was resolved in Chromium.

**Stale diagnostics and section routing.** Cache counters now subscribe to actual batched engine changes in an isolated diagnostics child. A hash-query listener updates System's selected section when the responsive harness switches between gallery and lab. Both corrections were present during subsequent browser observations.

## Browser verification limit

The cloud-browser tool rejected a reload, then a read-only observation, under its URL security policy. The rejection stated that it could not acquire authority to observe the page and did not grant access. No alternate browser, indirect reload or security-policy bypass was attempted. Work continued through source review, Node tests, TypeScript and production build.

Consequently, this release does **not** claim a complete final browser pass for Korean/mixed/RTL samples, final hanging-space CSS, updated font-longhand painting, font-timeout recovery, native selection across manual lines, or the changed Mermaid SVG labels. The previous v1.2 SVG observations are preserved as historical evidence only. No physical iOS/Android certification or timing benchmark is claimed.

## Reproduce the remaining browser checks

Run `npm ci`, `npm run test:pretext`, `npm run typecheck`, `npm run build`, and `npm run dev`. Use the URL Vite prints.

1. Open `/#system?section=pretext`; inspect English, Korean, mixed emoji and bidirectional samples at 320/390/768px in `/responsive.html`.
2. Confirm the error/readiness state is visible and truthful, named font subsets load, and changing only width does not increase preparations after warm-up.
3. Compare actual excerpt line height and glyph widths with `data-pretext-line-texts`, including a line ending in a space; expand and copy the full passage.
4. Scroll the 200-note list, resize while a middle note is visible, and switch to complete mode for browser find and selection.
5. Open Record, change and edit the synchronized passage, and inspect actual Mermaid node containment in “How the text shapes this map.”
6. Check Community composition/reply textareas and post expansion, then repeat input and safe-area checks on physical mobile devices if production use is planned.
