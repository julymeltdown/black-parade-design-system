# Screenshot gallery

These are browser captures of the working v1.2 application shipped in this repository. They are stored with the source so the project README does not depend on temporary image-hosting links.

| File | View | Image size |
| --- | --- | --- |
| [desktop-archive.jpg](desktop-archive.jpg) | Record page, album composition and opening of the reader | 1348 × 926 |
| [desktop-reading.jpg](desktop-reading.jpg) | “The world turns” selected in both prose and the real Mermaid map | 1348 × 926 |
| [desktop-player.jpg](desktop-player.jpg) | Compact YouTube iframe in the upper-right corner, alongside the reader | 1348 × 926 |
| [desktop-system.jpg](desktop-system.jpg) | The System page and its six color tokens | 1348 × 926 |
| [mobile-archive.jpg](mobile-archive.jpg) | Record page at a 390px CSS viewport width | 390 × 844 |
| [mobile-reading.jpg](mobile-reading.jpg) | “The private losses” and the vertically reflowed map at 390px | 390 × 844 |

## Capture notes

- Captured in managed Chromium from the actual React application. The JPEGs were saved directly from the browser; the interface was not reconstructed in an image editor.
- Desktop captures use the browser viewport. Mobile captures use a real 390 × 844 CSS-pixel iframe, cropped to its content area. This checks responsive CSS layout; it does not emulate a physical phone, touch hardware or a software keyboard.
- Mobile images are viewport captures, not full-page scroll composites. Content continues below the captured frame.
- The player image records YouTube's native loading/control surface. It demonstrates the compact window and external tool strip, not verified uninterrupted video playback. The third-party service controls playback availability.
- The underlying application source is the delivered v1.2 source. The publication changes add this gallery, improve the README, correct downloadable-document links and omit the owner-specific hosting manifest.

See [the verification record](../verification.md) for the measured responsive and Pretext–Mermaid results, and [the design specification](../../design.md) for the complete visual contract.
