import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button, TextField } from '../design-system';
import { BalancedHeading, DISPLAY_TEXT, FlowText, INTERFACE_TEXT, MeasuredTextArea, MeasuredTextList, PassageOutline, READING_TEXT, RichInlineText, TextExcerpt, useContentWidth, useTextEnvironment } from '../pretext';
import type { RichInlineRun, TextStyle } from '../pretext';
import { getTextCacheStats, subscribeTextCache } from '../lib/pretext-layout';
import './pretext-lab.css';

const samples = {
  english: 'A familiar record can become a place to return to. The room may have changed, the people may have gone, but a small piano phrase can still open the same door. These notes leave space for that private memory, and for the voices that turn one person’s recollection into a shared procession.',
  korean: '익숙한 음반은 다시 돌아갈 수 있는 장소가 되기도 합니다. 방의 모습과 함께 듣던 사람은 달라졌지만, 짧은 피아노 선율은 여전히 같은 문을 열어 줍니다. 한 사람의 기억이 다른 사람의 목소리와 만나 행렬이 되는 순간을 생각하며 읽어 보세요. 가독성은 장식보다 먼저입니다.',
  mixed: 'A record, a memory, a procession. 기억은 작은 소리에서 시작됩니다. Singer 👩🏽‍🎤, headphones 🎧, and a long annotation_that_must_wrap_without_losing_its_place. Combining marks stay together: cafe\u0301. A family listens together: 👩‍👩‍👧‍👦. Resize the canvas and keep following the words.',
  bidi: 'A shared memory — ذكرى تبقى معنا — can carry a number like 2006 and return to the same story. هذه فقرة تجريبية لاختبار اتجاه النص. Manual line painting steps aside here so the browser keeps paragraph-level bidirectional ordering.',
} as const;

const noteSeeds = [
  'Listen for the moment the arrangement changes scale. A small detail can give the next entrance a different weight.',
  'The space between phrases matters as much as the busiest passage. Leave a little room for the sound to settle.',
  'An image can suggest a story without fixing one official reading. The archive keeps interpretation visibly separate from source material.',
  'A note worth keeping is usually specific: the first piano gesture, an unexpected silence, a voice moving closer to the listener.',
  'Paper, ink, and a narrow reading measure give the words a steady rhythm. The responsive layout follows the available width.',
];
const longNotes = Array.from({ length: 200 }, (_, index) => ({ id: `sample-note-${index + 1}`, text: `Note ${index + 1}. ${noteSeeds[index % noteSeeds.length]}${index % 3 === 0 ? ' Read the surrounding notes before deciding what this connection means.' : ''}` }));
const richRuns: readonly RichInlineRun[] = [
  { text: 'One note, ', font: INTERFACE_TEXT.font },
  { text: 'several voices', font: '600 16px Inter, "Noto Sans KR Variable", sans-serif', kind: 'emphasis' },
  { text: '. The ', font: INTERFACE_TEXT.font },
  { text: 'layoutNextLineRange()', font: '400 14px "Courier New"', kind: 'code', paddingInline: 4 },
  { text: ' cursor keeps the text moving, while ', font: INTERFACE_TEXT.font },
  { text: 'EDITORIAL NOTE', font: '600 12px Inter', kind: 'tag', atomic: true, paddingInline: 6 },
  { text: ' travels as one unit. The gaps retain the font that measured them.', font: INTERFACE_TEXT.font },
];
const outlineItems = [
  { id: 'pt-heading', label: 'A headline that finds its width', href: '#pt-heading', detail: 'BalancedHeading' },
  { id: 'pt-excerpt', label: 'A real line budget, with the complete passage one action away', href: '#pt-excerpt', detail: 'TextExcerpt' },
  { id: 'pt-flow', label: 'Let an image change the reading space', href: '#pt-flow', detail: 'FlowText' },
  { id: 'pt-input', label: 'An input that knows its next line', href: '#pt-input', detail: 'MeasuredTextArea' },
  { id: 'pt-inline', label: 'One paragraph, several text styles', href: '#pt-inline', detail: 'RichInlineText' },
  { id: 'pt-list', label: 'Two hundred notes, one measured index', href: '#pt-list', detail: 'MeasuredTextList' },
];

function SpecimenHeading({ number, title, component, id }: { number: string; title: string; component: string; id: string }) {
  return <header className="pt-specimen-heading"><span className="micro-label">{number} / {component}</span><h3 id={id} tabIndex={-1}>{title}</h3></header>;
}

/** Diagnostics subscribe independently, so publishing a cache hit never rerenders specimens. */
function CacheDiagnostics() {
  const [stats, setStats] = useState(getTextCacheStats);
  useEffect(() => subscribeTextCache(() => setStats(getTextCacheStats())), []);
  return <details className="pretext-lab__evidence" data-cache-entries={stats.entries} data-cache-preparations={stats.preparations} data-cache-hits={stats.hits} data-cache-layout-passes={stats.layoutPasses}><summary>Inspect the work <span>{stats.entries} cached preparations</span></summary><div>
    <dl className="pretext-lab__metrics"><div><dt>Prepared entries</dt><dd>{stats.entries} / {stats.capacity}</dd></div><div><dt>Cache hits</dt><dd>{stats.hits}</dd></div><div><dt>Preparations</dt><dd>{stats.preparations}</dd></div><div><dt>Layout passes</dt><dd>{stats.layoutPasses}</dd></div><div><dt>Font generation</dt><dd>{stats.revision}</dd></div><div><dt>Last invalidation</dt><dd>{stats.lastInvalidationReason || 'None'}</dd></div></dl>
    <Button variant="ghost" size="sm" onClick={() => setStats(getTextCacheStats())}><RefreshCw size={15} />Refresh measurements</Button>
    <p>These are live operation counts, not timing benchmarks. Resizing reuses prepared handles; changing text, fonts or preparation options may create new ones. The rich-inline specimen retains its own prepared handle.</p>
    <p>All controls use native DOM text while a font or measurement is unavailable. Arabic and Hebrew keep paragraph-level browser ordering in the manual-flow specimens.</p>
  </div></details>;
}

export function PretextLab() {
  const [width, setWidth] = useState(760);
  const [sample, setSample] = useState<keyof typeof samples>('english');
  const [text, setText] = useState<string>(samples.english);
  const [headline, setHeadline] = useState('A record about death. A reason to feel alive.');
  const [maxLines, setMaxLines] = useState(3);
  const [serif, setSerif] = useState(true);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [currentSection, setCurrentSection] = useState('pt-heading');
  const canvas = useContentWidth();
  const style: TextStyle = serif ? READING_TEXT : INTERFACE_TEXT;
  const fonts = useMemo(() => [style.font, DISPLAY_TEXT.font, ...richRuns.map(item => item.font)], [style.font]);
  const environment = useTextEnvironment(`${text} ${headline}`, fonts);

  function chooseSample(value: keyof typeof samples) { setSample(value); setText(samples[value]); }
  function goToSection(id: string) {
    setCurrentSection(id);
    const heading = document.getElementById(id);
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  return <div className="pretext-lab" data-font-ready={environment.ready} data-font-error={environment.error} data-font-revision={environment.revision} data-canvas-width={canvas.width}>
    <header className="pretext-lab__heading"><p className="micro-label">PRETEXT / SEVEN WORKING COMPOSITIONS</p><h2>Words find their place.</h2><p>Resize the reading space. Change the passage. The same prepared text takes a different shape.</p></header>
    <div className="pretext-lab__controls">
      <label className="pretext-lab__width">Canvas width <output htmlFor="pretext-lab-width">{canvas.width > 0 ? `${canvas.width}px available` : `${width}px maximum`}</output><input id="pretext-lab-width" type="range" min={280} max={1000} step={10} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
      <div className="pretext-lab__presets" role="group" aria-label="Text canvas width">{[320, 390, 600, 760].map(size => <button type="button" key={size} aria-pressed={width === size} onClick={() => setWidth(size)}>{size}</button>)}</div>
      <label className="pretext-lab__select">Reading voice<select value={serif ? 'serif' : 'sans'} onChange={event => setSerif(event.target.value === 'serif')}><option value="serif">Source Serif 4 · 18 / 30</option><option value="sans">Inter · 16 / 26</option></select></label>
    </div>
    <div className="pretext-lab__samples" role="group" aria-label="Example text language">{([{ id: 'english', label: 'English' }, { id: 'korean', label: '한국어' }, { id: 'mixed', label: 'Mixed + emoji' }, { id: 'bidi', label: 'Bidirectional' }] as const).map(item => <button type="button" key={item.id} aria-pressed={sample === item.id} onClick={() => chooseSample(item.id)}>{item.label}</button>)}</div>
    {environment.error && <p className="pretext-lab__fallback" role="status">Font measurement is unavailable. The complete text remains readable in native layout. <span>{environment.error}</span></p>}

    <CacheDiagnostics />

    <div ref={canvas.ref} className="pretext-lab__canvas" style={{ width, maxWidth: '100%' }}>
      <section className="pt-specimen"><SpecimenHeading number="01" title="A headline that finds its width." component="BALANCED HEADING" id="pt-heading" /><BalancedHeading text={headline} as="h4" /><details className="pt-specimen__edit"><summary>Edit the headline</summary><TextField label="Headline text" value={headline} onChange={event => setHeadline(event.target.value)} maxLength={160} /></details><p className="pt-specimen__method">A width search preserves the original line count. The font size stays the same.</p></section>

      <section className="pt-specimen"><SpecimenHeading number="02" title="Enough to begin. Room to continue." component="TEXT EXCERPT" id="pt-excerpt" /><div className="pt-specimen__inline-control"><label htmlFor="pretext-excerpt-lines">Preview lines</label><select id="pretext-excerpt-lines" value={maxLines} onChange={event => setMaxLines(Number(event.target.value))}>{[2,3,4,5].map(count => <option key={count}>{count}</option>)}</select></div><TextExcerpt text={text} maxLines={maxLines} textStyle={style} /><p className="pt-specimen__method">The final line reserves the measured ellipsis width. Expansion restores the complete passage.</p></section>

      <section className="pt-specimen"><SpecimenHeading number="03" title="The words move around the image." component="FLOW TEXT" id="pt-flow" /><div className="pt-specimen__inline-control"><label htmlFor="pretext-inset-side">Image position</label><select id="pretext-inset-side" value={side} onChange={event => setSide(event.target.value as 'left' | 'right')}><option value="left">Left</option><option value="right">Right</option></select></div><FlowText text={`${text} ${text}`} textStyle={style} inset={{ src: '/assets/parade-artwork.png', alt: 'A detail of the supplied Black Parade procession artwork', width: 130, height: 182, side, gap: 20 }} /><p className="pt-specimen__method">One cursor continues through changing line widths. Narrow screens place the image before the paragraph.</p></section>

      <section className="pt-specimen"><SpecimenHeading number="04" title="A little room for the next thought." component="MEASURED TEXT AREA" id="pt-input" /><MeasuredTextArea label="The passage used by these specimens" value={text} onChange={setText} textStyle={INTERFACE_TEXT} minRows={3} maxRows={9} maxLength={2400} hint="Edit this once to update the excerpt and the image-flow passage. Newlines and an empty final caret line are included in the height." /><p className="pt-specimen__method">Height comes from pre-wrap text layout. The input keeps its native selection, caret and editing behavior.</p></section>

      <section className="pt-specimen"><SpecimenHeading number="05" title="Different voices, one paragraph." component="RICH INLINE TEXT" id="pt-inline" /><RichInlineText items={richRuns} lineHeight={30} /><p className="pt-specimen__method">Each fragment retains its source item, font, spacing and padding. The small tag is an atomic text item.</p></section>

      <section className="pt-specimen"><SpecimenHeading number="06" title="A measured index of two hundred notes." component="MEASURED TEXT LIST" id="pt-list" /><MeasuredTextList items={longNotes} textStyle={INTERFACE_TEXT} virtualized height={360} label="Two hundred sample editorial notes" /><p className="pt-specimen__method">Prefix sums locate the visible rows. Resize keeps the current note anchored. These notes are demonstration content.</p></section>

      <section className="pt-specimen"><SpecimenHeading number="07" title="Find the next passage." component="PASSAGE OUTLINE" id="pt-outline" /><PassageOutline items={outlineItems} currentId={currentSection} onNavigate={goToSection} label="Pretext specimen contents" /><p className="pt-specimen__method">Wrapped label heights come from the same text measurements; links remain in their original reading order.</p></section>
      <a className="pretext-lab__source" href="https://github.com/chenglou/pretext" target="_blank" rel="noreferrer">Explore the Pretext source <ArrowRight size={16} /></a>
    </div>
  </div>;
}
