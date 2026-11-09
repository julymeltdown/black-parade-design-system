export type Page = 'archive' | 'films' | 'community' | 'system';

export interface Track {
  id: number;
  title: string;
  duration: string;
  mood: string;
  note: string;
  video?: string;
  hidden?: boolean;
}

export const tracks: Track[] = [
  { id: 1, title: 'The End.', duration: '1:52', mood: 'The curtain rises', note: 'A miniature overture: acoustic intimacy gives way to theatrical scale. Listen to the sudden change in space as the full band arrives.' },
  { id: 2, title: 'Dead!', duration: '3:15', mood: 'A beautiful contradiction', note: 'Bright guitars and a racing pulse set an unsettling scene. The contrast between the music’s exuberance and its subject is the point.' },
  { id: 3, title: 'This Is How I Disappear', duration: '3:59', mood: 'Fear of being forgotten', note: 'Dense guitars create a sense of urgency. Listen for the space that opens around the voice before the arrangement closes in again.' },
  { id: 4, title: 'The Sharpest Lives', duration: '3:20', mood: 'A life at the edge', note: 'The tightly controlled opening builds pressure before a much broader chorus. The change in scale makes the release feel physical.' },
  { id: 5, title: 'Welcome to the Black Parade', duration: '5:11', mood: 'Memory becomes a procession', note: 'An intimate piano motif grows into a marching, full-band anthem. A useful way to hear it is as a movement from private memory toward collective resolve.', video: 'RRKJiM9Njr8' },
  { id: 6, title: "I Don’t Love You", duration: '3:58', mood: 'The space left behind', note: 'The arrangement steps back from the pageantry. Guitar, voice and restraint give this song a different kind of weight.', video: 'pyi0ZfuIIvo' },
  { id: 7, title: 'House of Wolves', duration: '3:04', mood: 'A crooked little dance', note: 'The rhythm swings with a restless energy. The theatrical delivery brings a cabaret-like character into the album’s guitar-driven world.' },
  { id: 8, title: 'Cancer', duration: '2:22', mood: 'Everything falls quiet', note: 'A spare piano arrangement puts the voice close to the listener. The lack of spectacle becomes its own dramatic gesture.' },
  { id: 9, title: 'Mama', duration: '4:39', mood: 'Letters from the other side', note: 'Marching rhythms, abrupt shifts and theatrical voices turn the song into a compact stage production. Follow the changes in perspective and instrumentation.' },
  { id: 10, title: 'Sleep', duration: '4:43', mood: 'Between waking and dreaming', note: 'Spoken fragments sit against a gradually expanding wall of sound. The final stretch feels deliberately overwhelming rather than neatly resolved.' },
  { id: 11, title: 'Teenagers', duration: '2:41', mood: 'An unruly interruption', note: 'A direct, bluesy guitar riff and compact structure interrupt the album’s grander arrangements. Its simplicity is a deliberate change of pace.', video: 'k6EQAOmJrbw' },
  { id: 12, title: 'Disenchanted', duration: '4:55', mood: 'Looking back', note: 'Acoustic guitar introduces a reflective pause before the closing statement. Listen to the way the arrangement broadens without losing that intimate starting point.' },
  { id: 13, title: 'Famous Last Words', duration: '4:59', mood: 'A decision to stay', note: 'The final main-album track turns toward defiance. Layered voices make its closing passage feel communal, bringing the record’s scale back into focus.', video: '8bbTtPL1jRs' },
  { id: 14, title: 'Blood', duration: '2:54', mood: 'One last, dark joke', hidden: true, note: 'The hidden track follows a stretch of silence. Its jaunty theatrical character works like an unnerving bow after the curtain has fallen; timing varies between editions.' },
];

export interface Film { id: string; title: string; eyebrow: string; image: string; duration: string; description: string; }
export const films: Film[] = [
  { id: 'RRKJiM9Njr8', title: 'Welcome to the Black Parade', eyebrow: 'THE PROCESSION', image: '/assets/parade-film.png', duration: '5:15', description: 'A hospital room opens onto a ruined world. Monochrome uniforms, a patient’s memory, and an impossible procession give the record a visual language of its own.' },
  { id: '8bbTtPL1jRs', title: 'Famous Last Words', eyebrow: 'THE AFTERMATH', image: '/assets/the-parade-band.png', duration: '4:28', description: 'The parade’s world gives way to a raw performance. Watch how the band’s physical presence carries the final statement.' },
  { id: 'pyi0ZfuIIvo', title: "I Don’t Love You", eyebrow: 'BLACK & WHITE', image: '/assets/single-cover.png', duration: '3:59', description: 'An intimate contrast to the procession: a more restrained visual setting for a song about separation.' },
  { id: 'k6EQAOmJrbw', title: 'Teenagers', eyebrow: 'THE INTERRUPTION', image: '/assets/album-cover.png', duration: '2:51', description: 'A school performance becomes unruly. A shorter, direct visual chapter alongside the record’s elaborate pageantry.' },
];

export type Category = 'Discussion' | 'Artwork' | 'Live';
export interface Comment { id: string; author: string; body: string; parentId?: string; createdAt: number; }
export interface Post { id: string; author: string; title: string; body: string; category: Category; votes: number; createdAt: number; image?: string; comments: Comment[]; }
export const initialPosts: Post[] = [
  { id: 'opening-note', author: 'ghostnotes', title: 'That first piano note still stops everything.', body: 'There is something about how small the opening feels before the entire procession arrives. What is the moment on this record that always brings you back?', category: 'Discussion', votes: 24, createdAt: 1730844000000,
    comments: [{ id: 'c1', author: 'paperlungs', body: 'The transition from The End. into Dead! Every single time.', createdAt: 1730847600000 }, { id: 'c2', parentId: 'c1', author: 'unquiet', body: 'It makes the opening feel like one continuous scene.', createdAt: 1730851200000 }] },
  { id: 'visual-world', author: 'paperlungs', title: 'The artwork feels like a whole world outside the frame.', body: 'The little figures, the worn paper, the absurdly tall marching character. I keep finding details I missed. What would you put in your own version of the procession?', category: 'Artwork', votes: 18, createdAt: 1730757600000, image: '/assets/parade-artwork.png',
    comments: [{ id: 'c3', author: 'ghostnotes', body: 'The hand-drawn lines make it feel like a battered book you found somewhere.', createdAt: 1730761200000 }] },
  { id: 'live-memory', author: 'unquiet', title: 'Which song changed the most for you after hearing it live?', body: 'A recording and a room full of people can make the same song feel completely different. Tell us about the performance you keep thinking about.', category: 'Live', votes: 12, createdAt: 1730671200000, comments: [] },
];

export const sources = [
  { name: 'Pretext', kind: 'Actual text-layout dependency · MIT', url: 'https://github.com/chenglou/pretext', use: 'Cached text preparation, actual line breaks and measured node widths passed to Mermaid.' },
  { name: 'Mermaid', kind: 'Primary API documentation', url: 'https://mermaid.js.org/config/usage', use: 'Actual SVG rendering, font loading and explicit graph layout configuration.' },
  { name: 'Notion-style document CSS', kind: 'react-notion-x · MIT · adapted CSS', url: 'https://github.com/NotionX/react-notion-x/blob/dd4c891997f6c42413623f6ea836c3ba34e042fb/packages/react-notion-x/src/styles.css', use: 'Document flow, readable blocks, lists and responsive figures. Full license retained.' },
  { name: 'Obsidian Minimal', kind: 'kepano · MIT · adapted SCSS rules', url: 'https://github.com/kepano/obsidian-minimal/blob/93321bdc23fc879966e1e3aa0cfeda77012f540f/src/scss/features/block-width.scss', use: 'A bounded reading measure inside a wider canvas, with compact heading rhythm.' },
  { name: 'Medium Editor', kind: 'yabwe · MIT terms · adapted CSS', url: 'https://github.com/yabwe/medium-editor/blob/d113a74437fda6f1cbd5f146b0f2c46288b118ea/demo/css/demo.css', use: 'Readable serif text and actual heading declarations, scoped to the archive reader.' },
  { name: 'YouTube player implementation', kind: 'saddamarbaa · MIT · adapted component', url: 'https://github.com/saddamarbaa/Youtube-clone-app-react-vite-typescript/blob/10962e1bbdedb7e910c8944292c136490b5a917c/src/components/VideoPreview.tsx', use: 'Native iframe and media container, made compact while preserving YouTube controls.' },
  { name: 'Cynthia Ugwu — CSS study', kind: 'Kumaramanweb · inspected stylesheet', url: 'https://github.com/Kumaramanweb/cynthia-ugwu-clone/blob/main/style.css', use: 'A plain-text masthead, dominant type and deliberate offsets.' },
  { name: 'REJOUICE — CSS study', kind: 'codeaashu · inspected stylesheet', url: 'https://github.com/codeaashu/REJOUICE-CLONE/blob/main/style.css', use: 'Open canvas, common side insets and a dramatic type scale.' },
  { name: 'Obys — CSS study', kind: 'antra20 · inspected stylesheet', url: 'https://github.com/antra20/Obys-Agency-Clone/blob/main/style.css', use: 'Desktop asymmetry that recomposes on small screens.' },
  { name: 'Spotify Encore', kind: 'Official design system', url: 'https://medium.com/spotify-design/reimagining-design-systems-at-spotify-2fe20fbb3552', use: 'Foundations → components → product patterns.' },
  { name: 'Encore × Accessibility', kind: 'Spotify Engineering', url: 'https://engineering.atspotify.com/2023/03/encore-x-accessibility-a-balancing-act', use: 'Accessible behavior built into reusable primitives.' },
  { name: 'YouTube visual language', kind: 'Official design article', url: 'https://blog.youtube/inside-youtube/youtube-ambient-color-mode-visual-language-redesign/', use: 'Media-led hierarchy and a stable watch layout.' },
  { name: 'YouTube miniplayer', kind: 'Official product article', url: 'https://blog.youtube/news-and-events/youtube-features-and-updates-2024/', use: 'Keep watching while moving through the archive.' },
  { name: 'Reddit brand evolution', kind: 'Official design article', url: 'https://redditinc.com/news/evolving-the-reddit-brand-a-more-accessible-bespoke-typography-new-conversation-bubbles-and-colors-and-a-new-snoo-logo-now-with-opposable-thumbs', use: 'Readable conversation typography and content hierarchy.' },
  { name: 'Web Interface Guidelines', kind: 'Vercel', url: 'https://vercel.com/design/guidelines', use: 'Keyboard, focus, safe areas and explicit UI states.' },
  { name: 'Design Engineering', kind: 'Emil Kowalski', url: 'https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md', use: 'Purposeful motion, immediate press feedback.' },
  { name: 'Mobile Native', kind: 'Emil Kowalski', url: 'https://github.com/emilkowalski/skills/blob/main/skills/mobile-native/SKILL.md', use: 'Touch, dynamic viewport and readable mobile forms.' },
  { name: 'Baseline UI', kind: 'UI Skills', url: 'https://www.ui-skills.com/skills/ibelick/baseline-ui', use: 'Semantic primitives and restrained visual treatment.' },
  { name: 'Oxide design.md', kind: 'Curated document', url: 'https://www.ui-skills.com/design-md/oxidecomputer', use: 'Semantic surface, content and stroke tokens.' },
  { name: 'Clerk design.md', kind: 'Curated document', url: 'https://www.ui-skills.com/design-md/clerk', use: 'Token tables and a clear source map.' },
  { name: 'Vercel design.md', kind: 'Curated document', url: 'https://www.ui-skills.com/design-md/vercel', use: 'Hierarchy and responsive verification structure.' },
  { name: 'Spotify Web Client', kind: 'Franco Borrelli · React', url: 'https://github.com/francoborrelli/spotify-react-web-client', use: 'Compact playback hierarchy and mobile player composition.' },
  { name: 'Spotify Clone', kind: 'diogo405 · React / TS', url: 'https://github.com/diogo405/spotify-clone', use: 'Typed track rows and responsive album proportions.' },
  { name: 'YouTube Clone', kind: 'Arifineko · React / TS', url: 'https://github.com/Arifineko/YouTube-clone', use: 'Aspect-ratio thumbnails and watch/detail reflow.' },
  { name: 'YouTube Spinoff', kind: 'codeofmohit · React / TS', url: 'https://github.com/codeofmohit/youtube_clone', use: 'Navigation and video-column structure.' },
  { name: 'TypeScript Reddit Clone', kind: 'gianlucajahn · React / TS', url: 'https://github.com/gianlucajahn/typescript-reddit-clone', use: 'Continuous feed and nested comment composition.' },
  { name: 'Breadit', kind: 'joschan21 · React / TS', url: 'https://github.com/joschan21/breadit', use: 'Typed feeds and contextual reply forms.' },
];
