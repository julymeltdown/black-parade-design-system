# Video player — source provenance and behavior

The Parade Archive's `VideoPlayer` is a compact, persistent **in-page miniplayer**. It embeds YouTube's actual player and leaves playback, seeking, captions, volume, fullscreen and provider errors to that player. It does not simulate a playback timeline or claim to enter native browser picture-in-picture.

## Reviewed and reused source

Source was retrieved through the connected GitHub API on 2026-11-09. This is a community implementation, not YouTube's proprietary frontend or an official YouTube design system.

| Item | Pinned source |
| --- | --- |
| Repository | [saddamarbaa/Youtube-clone-app-react-vite-typescript](https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript) |
| Commit | `10962e1bbdedb7e910c8944292c136490b5a917c` |
| Reused component | [src/components/VideoPreview.tsx](https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript/blob/10962e1bbdedb7e910c8944292c136490b5a917c/src/components/VideoPreview.tsx) |
| Component blob | `3d16bbd21902a87c21d50bbe6ba9bca1c6a91ff4` |
| Reviewed watch layout | [src/screens/VideoWatchScreen.tsx](https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript/blob/10962e1bbdedb7e910c8944292c136490b5a917c/src/screens/VideoWatchScreen.tsx) |
| License | [MIT, Copyright (c) 2021 saddamarbaa](https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript/blob/10962e1bbdedb7e910c8944292c136490b5a917c/LICENSE) |
| Local full notice | `docs/vendor/youtube-clone-LICENSE.txt` |
| Local original source | `docs/vendor/youtube-clone-VideoPreview.tsx.txt` |

### Exact scope of adaptation

`src/components/VideoPlayer.tsx` adapts the source component's `<VideoContainer><iframe … /></VideoContainer>` structure, full-width/full-height iframe attributes, dynamic video-ID embed URL, fullscreen permission and native player permissions. The source component and its notice are retained so that the provenance is inspectable.

`src/components/video-player.css` carries forward the source's flex media-container structure and translates its styled-components declarations to ordinary CSS. The source's `80vh` / `60vh` video heights and 400px mobile minimum have been replaced with a 16:9 surface and the provider's 200px minimum. Watch-page metadata, subscriber counts, comments and the source's rounded description box are not included in this compact player.

The fixed upper-corner desktop and bottom-mobile docking positions, side-switch control, expanded state, Escape behavior, focus restoration, safe-area support, measured mobile document-end spacing and compact tool strip are new archive-specific implementation. They are not presented as copied YouTube source. No runtime dependency on the donor's router, API, styled-components, Moment or query library is introduced.

## Integration

```tsx
import { VideoPlayer } from './components/VideoPlayer';

<VideoPlayer
  video={films.find(film => film.id === activeVideoId) ?? null}
  onClose={() => setActiveVideoId(null)}
/>
```

Keep this component mounted outside page-switching branches. Passing the same `video.id` preserves the same iframe element and `src`; resizing, docking and navigating between archive pages do not remount it. Changing the video ID loads another video. Closing removes the iframe and ends that playback session.

The `Film` type is imported from `src/data.ts`; no duplicated data contract is required.

## Compact layout

- Desktop: 360px-wide, 16:9 floating player fixed at the upper right while scrolling, with a switch to the upper left. The video begins 60px plus the top safe-area inset below the viewport top; the tool strip sits immediately above it.
- Expanded desktop: retains top docking, up to 800px, also constrained by viewport height and safe-area insets.
- Mobile at 600px or below: full available width above the bottom safe area. On 320px screens the iframe remains at least 200px high, so YouTube may letterbox the 16:9 video.
- Mobile expanded mode: a taller viewing surface, capped at 60 dynamic viewport units and 440px.
- No NOW WATCHING heading, separate title row, YouTube footer or permanent explanatory paragraph.
- The 44px-touch controls occupy a narrow floating strip immediately outside the iframe. They do not mask YouTube's own video, controls, captions or links. The link's accessible name identifies the selected film.
- Only mobile bottom docking adds document-end spacing equal to measured player height plus controls and safe-area allowance. Users can scroll final content clear of that player. Desktop top docking does not add empty space at the document end.

## Accessibility and actual playback

Controls have named native button/link semantics, 44 × 44px targets, visible keyboard focus, hover/press feedback and reduced-motion support. Escape reduces an expanded player; a second Escape closes the compact player. An open native or headless modal dialog owns Escape. Focus returns to the original watch trigger when it still exists. Keyboard events occurring inside the cross-origin YouTube iframe remain owned by YouTube.

The embed uses `youtube-nocookie.com`, `playsinline=1`, native controls, `allowFullScreen`, a picture-in-picture permission and `strict-origin-when-cross-origin` referrer policy. The user opens it deliberately; autoplay is requested, but the browser and YouTube decide whether playback can begin automatically. The external YouTube link remains available when embedding is blocked, unavailable or restricted. It is not a guarantee of media availability.

## Primary technical references

- [YouTube player parameters](https://developers.google.com/youtube/player_parameters): iframe embedding, minimum 200 × 200px viewport, `playsinline`, controls and autoplay semantics.
- [YouTube embedding help](https://support.google.com/youtube/answer/171780?hl=en): privacy-enhanced host and HTTP Referer requirement.
- [YouTube required minimum functionality](https://developers.google.com/youtube/terms/required-minimum-functionality): preserving the embedded player and its controls.

## Verification scope

The root task performs the integrated TypeScript build, responsive browser checks and deployment. This component does not use a custom playback state or fabricated progress, and its controls can be inspected without a functioning external video connection. Successful shell interaction does not by itself establish that third-party video playback succeeded.
