import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { Check, Copy } from 'lucide-react';
import '@fontsource/inter/400.css';
import { Button } from '../design-system';
import { MeasuredTextArea } from '../pretext';
import {
  CHAPTERS, PRETEXT_FONT, PRETEXT_LINE_HEIGHT, buildMermaidPlan,
  ensurePretextFont, renderMermaidPlan, verifyMermaidSvg,
} from '../lib/pretext-mermaid';
import type { ChapterId, MermaidPlan, SvgVerification } from '../lib/pretext-mermaid';
import { getTextEnvironmentRevision, subscribeTextEnvironment } from '../lib/pretext-fonts';
import './pretext-mermaid.css';

export interface PretextMermaidProps {
  selectedId?: ChapterId;
  onSelect?: (id: ChapterId) => void;
  textOverrides?: Partial<Record<ChapterId, string>>;
  onTextChange?: (id: ChapterId, body: string) => void;
  compact?: boolean;
}

function markSelection(host: HTMLDivElement | null, selectedId: ChapterId) {
  host?.querySelectorAll<SVGGElement>('[data-chapter-id]').forEach(node => {
    const selected = node.dataset.chapterId === selectedId;
    node.classList.toggle('is-selected', selected);
    node.setAttribute('aria-pressed', String(selected));
  });
}

export function PretextMermaid({ selectedId, onSelect, textOverrides = {}, onTextChange, compact = false }: PretextMermaidProps) {
  const fontRevision = useSyncExternalStore(subscribeTextEnvironment, getTextEnvironmentRevision, () => 0);
  const [localSelection, setLocalSelection] = useState<ChapterId>('memory');
  const selected = selectedId ?? localSelection;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const [localEdits, setLocalEdits] = useState<Partial<Record<ChapterId, string>>>({});
  const textKey = JSON.stringify(CHAPTERS.map(chapter => textOverrides[chapter.id] ?? localEdits[chapter.id] ?? chapter.body));
  const chapters = useMemo(() => {
    const bodies = JSON.parse(textKey) as string[];
    return CHAPTERS.map((chapter, index) => ({ ...chapter, body: bodies[index] }));
  }, [textKey]);
  const activeChapter = chapters.find(chapter => chapter.id === selected)!;
  const space = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [requestedWidth, setRequestedWidth] = useState(0);
  const [pretextEnabled, setPretextEnabled] = useState(true);
  const [fullLabels, setFullLabels] = useState(false);
  const [plan, setPlan] = useState<MermaidPlan | null>(null);
  const [verification, setVerification] = useState<SvgVerification | null>(null);
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const frameWidth = Math.floor(Math.min(availableWidth, requestedWidth || availableWidth));

  useEffect(() => {
    const element = space.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const width = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (width > 0) setAvailableWidth(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!frameWidth) return;
    let current = true;
    let frame = 0;
    setRendering(true);
    setError('');
    setVerification(null);
    // A short debounce coalesces slider/ResizeObserver bursts. Font preparation
    // is cached; the same handles are laid out again at the new content width.
    const timeout = window.setTimeout(async () => {
      try {
        await ensurePretextFont(chapters.map(chapter => `${chapter.title} ${chapter.body}`).join(' '));
        if (!current) return;
        const next = buildMermaidPlan(chapters, frameWidth, pretextEnabled, fullLabels ? 'full' : 'excerpt');
        setPlan(next);
        const svg = await renderMermaidPlan(next);
        if (!current || !host.current) return;
        host.current.replaceChildren(svg);
        markSelection(host.current, selectedRef.current);
        frame = requestAnimationFrame(() => {
          if (!current) return;
          setVerification(verifyMermaidSvg(svg, next));
          setRendering(false);
        });
      } catch (reason) {
        if (current) { setError(reason instanceof Error ? reason.message : 'The diagram could not be rendered.'); setRendering(false); }
      }
    }, 90);
    return () => { current = false; clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [chapters, frameWidth, pretextEnabled, fullLabels, fontRevision]);

  useEffect(() => { markSelection(host.current, selected); }, [selected]);
  useEffect(() => { if (!copied) return; const timeout = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(timeout); }, [copied]);

  const choose = (id: ChapterId) => { setLocalSelection(id); onSelect?.(id); };
  const clickedNode = (event: MouseEvent<HTMLDivElement>) => {
    const node = (event.target as Element).closest<SVGGElement>('[data-chapter-id]');
    if (node?.dataset.chapterId) choose(node.dataset.chapterId as ChapterId);
  };
  const keyOnNode = (event: KeyboardEvent<HTMLDivElement>) => {
    const node = (event.target as Element).closest<SVGGElement>('[data-chapter-id]');
    if (!node?.dataset.chapterId) return;
    const id = node.dataset.chapterId as ChapterId;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(id); return; }
    const currentIndex = CHAPTERS.findIndex(chapter => chapter.id === id);
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = CHAPTERS[(currentIndex + delta + CHAPTERS.length) % CHAPTERS.length].id;
    choose(next);
    host.current?.querySelector<SVGGElement>(`[data-chapter-id="${next}"]`)?.focus();
  };
  const editText = (value: string) => {
    setLocalEdits(current => ({ ...current, [selected]: value }));
    onTextChange?.(selected, value);
  };
  const copySource = async () => {
    if (!plan) return;
    try { await navigator.clipboard.writeText(plan.source); setCopied(true); setCopyError(''); }
    catch { setCopyError('Copy is unavailable here. Select the source below to copy it.'); }
  };
  const passed = verification && verification.nodeCount === CHAPTERS.length && verification.clippedLabels.length === 0 && verification.fitsWidth;

  return <section className={`pretext-mermaid ${compact ? 'pretext-mermaid--compact' : ''}`} aria-label="Synchronized reading map">
    {!compact && <header className="pretext-heading"><p className="micro-label">PRETEXT × MERMAID</p><h2>A map that follows the words.</h2><p>One passage, two views. Choose a node to read its matching text. These connections are an editorial interpretation.</p></header>}
    <div className="pretext-context"><span>READING MAP <span aria-hidden="true">↗</span></span><span>{fullLabels ? 'Full passages' : 'Passage excerpts'} · Editorial interpretation</span></div>
    <div className="pretext-space" ref={space}>
      <div className="pretext-viewport" style={{ width: frameWidth || '100%' }} data-pretext-width={frameWidth}>
        <div className="pretext-diagram" ref={host} onClick={clickedNode} onKeyDown={keyOnNode} aria-busy={rendering} data-selected-chapter={selected} data-pretext-label-mode={plan?.labelMode} data-pretext-verification={verification ? JSON.stringify(verification) : undefined}/>
      </div>
    </div>
    {rendering && <p className="pretext-state" role="status">Laying out the passages…</p>}
    {error && <p className="pretext-error" role="alert">{error} The readable passages remain available alongside this map.</p>}
    <details className="pretext-evidence">
      <summary>How the text shapes this map <span>{plan ? `${plan.canvasWidth}px · ${plan.direction === 'TB' ? 'vertical' : 'horizontal'}` : 'Pretext + Mermaid'}</span></summary>
      <div className="pretext-evidence-content">
        <p>Each node shows its title and up to three measured lines from the same passage. Pretext reserves room for the ellipsis and continues at grapheme boundaries. The original title and body preparations are reused as the width changes. Full-passage mode shows every word.</p>
        <div className="pretext-width-choices" role="group" aria-label="Diagram width"><span>Reading space</span>{[{ value: 0, label: 'Fit' }, { value: 320, label: '320px' }, { value: 390, label: '390px' }, { value: 760, label: '760px' }].map(item => <button key={item.value} type="button" aria-pressed={requestedWidth === item.value} onClick={() => setRequestedWidth(item.value)}>{item.label}</button>)}</div>
        <label className="pretext-width-slider">Requested width <output>{requestedWidth || availableWidth}px</output><input type="range" min={280} max={900} step={10} value={requestedWidth || Math.min(900, Math.max(280, availableWidth))} onChange={event => setRequestedWidth(Number(event.target.value))}/></label>
        <label className="pretext-comparison"><input type="checkbox" checked={pretextEnabled} onChange={event => setPretextEnabled(event.target.checked)}/>Apply Pretext wrapping <span>Turn off to inspect the unwrapped Mermaid baseline.</span></label>
        <label className="pretext-comparison"><input type="checkbox" checked={fullLabels} onChange={event => setFullLabels(event.target.checked)}/>Full passage labels <span>Default excerpts are literal text from the same reader passage.</span></label>
        <MeasuredTextArea label={`Edit the same passage: ${activeChapter.title}`} value={activeChapter.body} maxLength={480} minRows={3} maxRows={7} onChange={editText}/>
        {plan && <div className="pretext-measurements">
          <p className="pretext-check" role="status">{rendering ? 'Verifying the new SVG…' : !pretextEnabled ? 'Unwrapped baseline: horizontal scrolling is intentional.' : passed ? 'Verified: all 5 labels fit their nodes and the available width.' : verification ? 'The SVG needs a closer look; inspect the measurements below.' : 'Waiting for the rendered SVG.'}</p>
          <dl><div><dt>Actual reading space</dt><dd>{plan.canvasWidth}px</dd></div><div><dt>Pretext label budget</dt><dd>{plan.labelWidth}px</dd></div><div><dt>Mermaid minNodeWidth</dt><dd>{plan.minNodeWidth}px</dd></div><div><dt>Rendered SVG width</dt><dd>{verification ? `${verification.intrinsicWidth.toFixed(1)}px` : 'Measuring…'}</dd></div><div><dt>Clipped node labels</dt><dd>{verification ? verification.clippedLabels.length : 'Measuring…'}</dd></div><div><dt>New preparations this pass</dt><dd>{plan.preparedThisPass}</dd></div></dl>
          <p className="pretext-font-note">{PRETEXT_FONT} · {PRETEXT_LINE_HEIGHT}px line height. Existing prepared text is reused when only width changes.</p>
          <div className="pretext-metrics-scroll"><table><caption>Actual Pretext output: {plan.labelMode === 'full' ? 'full passage labels' : 'three-line measured excerpts'}</caption><thead><tr><th scope="col">Passage</th><th scope="col">Lines</th><th scope="col">Widest</th><th scope="col">Text height</th></tr></thead><tbody>{plan.nodes.map(node => <tr key={node.id}><th scope="row">{node.title}</th><td>{node.lineCount}</td><td>{node.maxLineWidth.toFixed(1)}px</td><td>{node.predictedHeight.toFixed(1)}px</td></tr>)}</tbody></table></div>
          <div className="pretext-source-heading"><h3>Generated Mermaid source</h3><Button variant="ghost" size="sm" onClick={copySource}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied' : 'Copy source'}</Button></div>
          {copyError && <p className="pretext-error" role="status">{copyError}</p>}
          <pre className="pretext-source" tabIndex={0} aria-label="Generated Mermaid source"><code>{plan.source}</code></pre>
          <p className="pretext-version">@chenglou/pretext 1.0.0 · Mermaid 12.3.0 · <a href="https://github.com/chenglou/pretext" target="_blank" rel="noreferrer">Pretext source</a> · <a href="https://mermaid.js.org/config/usage" target="_blank" rel="noreferrer">Mermaid API</a></p>
        </div>}
      </div>
    </details>
  </section>;
}

export default PretextMermaid;
