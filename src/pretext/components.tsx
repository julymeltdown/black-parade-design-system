import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, TextareaHTMLAttributes } from 'react';
import { materializeRichInlineLineRange, prepareRichInline, walkRichInlineLineRanges } from '@chenglou/pretext/rich-inline';
import type { RichInlineLine } from '@chenglou/pretext/rich-inline';
import {
  balanceParagraph, clampParagraph, findVisibleRange, flowParagraph, getPreparedText,
  measureParagraph, prepareParagraphIndex,
} from '../lib/pretext-layout';
import type { TextStyle } from '../lib/pretext-layout';
import {
  attemptLayout, DISPLAY_TEXT, fontShorthandToCss, INTERFACE_TEXT, needsNativeBidi, READING_TEXT,
  textStyleToCss, useContentWidth, useStableTextStyle, useTextEnvironment,
} from './useTextLayout';

function classes(...values: Array<string | undefined | false>) { return values.filter(Boolean).join(' '); }
function normalizedText(text: string) { return text.replace(/\r\n?/g, '\n'); }
function finiteSize(value: number, fallback: number, minimum = 1) { return Number.isFinite(value) ? Math.max(minimum, value) : fallback; }
// Materialized discretionary hyphens are visual glyphs, not source characters.
// Keep these unusual control sequences in a native paragraph for selection/copy.
function needsNativeControls(text: string) { return /[\u00ad\u200b\u2060]/u.test(text); }

export interface BalancedHeadingProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  textStyle?: TextStyle;
  align?: 'start' | 'center';
  id?: string;
  className?: string;
}

/** Keep a native heading; only its width is found through Pretext's cached measurements. */
export function BalancedHeading({ text, as: Heading = 'h2', textStyle = DISPLAY_TEXT, align = 'start', id, className }: BalancedHeadingProps) {
  const style = useStableTextStyle(textStyle);
  const { ref, width } = useContentWidth();
  const environment = useTextEnvironment(text, [style.font]);
  const { plan } = useMemo(() => attemptLayout(environment.ready && width > 0, () => balanceParagraph(text, width, style)), [environment.ready, environment.revision, width, text, style]);
  return <div ref={ref} className={classes('pt-balanced', className)} data-pretext-state={plan ? 'measured' : 'native'} data-pretext-lines={plan?.lineCount} data-pretext-width={plan?.balancedWidth}>
    <Heading id={id} style={{ ...textStyleToCss(style), width: plan?.balancedWidth || undefined, maxWidth: '100%', marginInline: align === 'center' ? 'auto' : undefined, textAlign: align }}>{text}</Heading>
  </div>;
}

export interface TextExcerptProps {
  text: string;
  maxLines?: number;
  textStyle?: TextStyle;
  moreLabel?: string;
  lessLabel?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export function TextExcerpt({ text, maxLines = 3, textStyle = READING_TEXT, moreLabel = 'Read the complete passage', lessLabel = 'Show less', defaultExpanded = false, className }: TextExcerptProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const id = useId();
  const source = normalizedText(text);
  const style = useStableTextStyle(textStyle);
  const { ref, width } = useContentWidth();
  const environment = useTextEnvironment(source, [style.font]);
  const nativeBidi = needsNativeBidi(source);
  const { plan } = useMemo(() => attemptLayout(environment.ready && width > 0 && !nativeBidi && !needsNativeControls(source), () => {
    const result = clampParagraph(source, width, Math.floor(finiteSize(maxLines, 3)), style);
    const prepared = getPreparedText(source, style);
    return { ...result, lines: result.lines.map((line, index) => ({ ...line, text: line.text + (index < result.lines.length - 1 && line.end.graphemeIndex === 0 && prepared.kinds[line.end.segmentIndex - 1] === 'hard-break' ? '\n' : '') })) };
  }), [environment.ready, environment.revision, width, source, maxLines, style, nativeBidi]);
  const fits = Boolean(plan && plan.lines.length > 0 && plan.lines.every(line => line.width <= width + 0.5));
  const truncated = Boolean(fits && plan?.truncated);
  return <div ref={ref} className={classes('pt-excerpt', className)} data-pretext-state={fits ? 'measured' : 'native'} data-pretext-lines={expanded ? plan?.totalLineCount : plan?.lineCount} data-pretext-truncated={truncated && !expanded} data-pretext-measure-width={plan?.width} data-pretext-line-texts={plan ? JSON.stringify(plan.lines.map(line => line.text)) : undefined}>
    <p id={id} dir="auto" style={textStyleToCss(style)}>{!expanded && truncated && plan ? plan.lines.map((line, index) => <span key={index} className="pt-excerpt__line" style={{ height: style.lineHeight }}>{line.text}</span>) : source}</p>
    {truncated && <button type="button" className="pt-text-action" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>{expanded ? lessLabel : moreLabel}<span aria-hidden="true">{expanded ? '−' : '↗'}</span></button>}
  </div>;
}

export interface FlowTextInset { src: string; alt: string; width: number; height: number; side?: 'left' | 'right'; gap?: number; }
export interface FlowTextProps { text: string; inset: FlowTextInset; textStyle?: TextStyle; className?: string; }

export function FlowText({ text, inset, textStyle = READING_TEXT, className }: FlowTextProps) {
  const source = normalizedText(text);
  const style = useStableTextStyle(textStyle);
  const { ref, width } = useContentWidth();
  const environment = useTextEnvironment(source, [style.font]);
  const imageWidth = finiteSize(inset.width, 120);
  const imageHeight = finiteSize(inset.height, 160);
  const gap = finiteSize(inset.gap ?? 20, 20, 0);
  const side = inset.side ?? 'right';
  const canFlow = width >= imageWidth + gap + 170 && !needsNativeBidi(source) && !needsNativeControls(source);
  const { plan } = useMemo(() => attemptLayout(environment.ready && canFlow, () => {
    const result = flowParagraph(source, width, style, { side, width: imageWidth, height: imageHeight, gap });
    const prepared = getPreparedText(source, style);
    return { ...result, lines: result.lines.map(line => ({ ...line, text: line.text + (line.end.graphemeIndex === 0 && prepared.kinds[line.end.segmentIndex - 1] === 'hard-break' ? '\n' : '') })) };
  }), [environment.ready, environment.revision, canFlow, source, width, style, side, imageWidth, imageHeight, gap]);
  const fits = Boolean(plan && plan.lines.every(line => line.width <= line.availableWidth + 0.5));
  return <div ref={ref} className={classes('pt-flow', fits && 'pt-flow--laid-out', className)} data-pretext-state={fits ? 'measured' : 'native'} data-pretext-lines={plan?.lineCount} data-pretext-height={plan?.height} style={fits ? { minHeight: Math.max(imageHeight, plan!.height) } : undefined}>
    <img src={inset.src} alt={inset.alt} width={imageWidth} height={imageHeight} loading="lazy" className="pt-flow__inset" style={{ width: imageWidth, height: imageHeight, ...(fits ? { position: 'absolute', top: 0, [side]: 0 } : {}) }} />
    {fits && plan ? <p className="pt-flow__text" style={{ ...textStyleToCss(style), position: 'relative', height: plan.height }}>{plan.lines.map((line, index) => <span key={index} className="pt-flow__line" style={{ left: line.x, top: line.y, width: line.availableWidth, height: style.lineHeight }}>{line.text}</span>)}</p> : <p dir="auto" style={textStyleToCss(style)}>{source}</p>}
  </div>;
}

export interface MeasuredTextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange' | 'rows' | 'style'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textStyle?: TextStyle;
  minRows?: number;
  maxRows?: number;
  error?: string;
  hint?: string;
}

export function MeasuredTextArea({ label, value, onChange, textStyle = INTERFACE_TEXT, minRows = 3, maxRows = 8, error, hint, id: providedId, className, 'aria-describedby': describedBy, ...props }: MeasuredTextAreaProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const source = normalizedText(value);
  const style = useStableTextStyle({ ...textStyle, whiteSpace: 'pre-wrap' });
  const { ref, width } = useContentWidth<HTMLTextAreaElement>();
  const environment = useTextEnvironment(source, [style.font]);
  const { plan } = useMemo(() => attemptLayout(environment.ready && width > 0, () => measureParagraph(source, width, style)), [environment.ready, environment.revision, source, width, style]);
  const minimum = Math.floor(finiteSize(minRows, 3));
  const maximum = Math.max(minimum, Math.floor(finiteSize(maxRows, 8)));
  const caretLines = source === '' || source.endsWith('\n') ? 1 : 0;
  const lines = Math.max(minimum, Math.min(maximum, (plan?.lineCount ?? minimum) + caretLines));
  const descriptionIds = [describedBy, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return <div className={classes('pt-textarea', className)} data-pretext-state={plan ? 'measured' : 'native'} data-pretext-lines={plan ? plan.lineCount + caretLines : undefined}>
    <label htmlFor={id}>{label}</label>
    {hint && <p id={`${id}-hint`} className="pt-field-hint">{hint}</p>}
    <textarea {...props} ref={ref} id={id} value={source} onChange={event => onChange(event.target.value)} rows={minimum} aria-invalid={error ? true : undefined} aria-describedby={descriptionIds} style={{ ...textStyleToCss(style), height: plan ? lines * style.lineHeight + 22 : undefined, minHeight: minimum * style.lineHeight + 22, maxHeight: maximum * style.lineHeight + 22 }} />
    {error && <p id={`${id}-error`} className="pt-field-error" role="alert">{error}</p>}
  </div>;
}

export interface RichInlineRun {
  text: string;
  font: string;
  kind?: 'text' | 'emphasis' | 'code' | 'tag';
  atomic?: boolean;
  paddingInline?: number;
  letterSpacing?: number;
}
export interface RichInlineTextProps { items: readonly RichInlineRun[]; lineHeight?: number; className?: string; }

function runStyle(item: RichInlineRun, fallback = false): CSSProperties {
  return { ...fontShorthandToCss(item.font), letterSpacing: item.letterSpacing ?? 0, lineHeight: 1, paddingInline: item.paddingInline ?? 0, display: fallback ? 'inline' : 'inline-block', whiteSpace: fallback ? 'normal' : 'pre', overflowWrap: 'anywhere', maxWidth: fallback ? '100%' : undefined, verticalAlign: 'baseline', boxSizing: 'border-box', boxDecorationBreak: 'clone' };
}

export function RichInlineText({ items, lineHeight = 28, className }: RichInlineTextProps) {
  const itemsKey = JSON.stringify(items);
  const stableItems = useMemo(() => JSON.parse(itemsKey) as RichInlineRun[], [itemsKey]);
  const source = stableItems.map(item => item.text).join('');
  const { ref, width } = useContentWidth();
  const fonts = stableItems.map(item => item.font);
  const environment = useTextEnvironment(source, fonts);
  const nativeFallback = needsNativeBidi(source) || needsNativeControls(source);
  const prepared = useMemo(() => attemptLayout(environment.ready && !nativeFallback, () => prepareRichInline(stableItems.map(item => ({ text: item.text, font: item.font, letterSpacing: item.letterSpacing, break: item.atomic || item.kind === 'tag' ? 'never' as const : 'normal' as const, extraWidth: (item.paddingInline ?? 0) * 2 })))), [stableItems, environment.ready, environment.revision, nativeFallback]);
  const lines = useMemo(() => attemptLayout(Boolean(prepared.plan) && width > 0, () => {
    const result: RichInlineLine[] = [];
    walkRichInlineLineRanges(prepared.plan!, width, range => result.push(materializeRichInlineLineRange(prepared.plan!, range)));
    return result;
  }), [prepared.plan, width]);
  const fits = Boolean(lines.plan && lines.plan.every(line => line.width <= width + 0.5));
  return <div ref={ref} className={classes('pt-rich', className)} data-pretext-state={fits ? 'measured' : 'native'} data-pretext-lines={lines.plan?.length}>
    <p dir="auto" style={{ margin: 0, lineHeight: `${lineHeight}px`, wordSpacing: 0, textWrap: 'wrap' }}>
      {fits && lines.plan ? lines.plan.map((line, index) => <span className="pt-rich__line" key={index} style={{ minHeight: lineHeight, lineHeight: `${lineHeight}px` }}>{line.fragments.map((fragment, fragmentIndex) => {
        const item = stableItems[fragment.itemIndex];
        const gapItem = stableItems[fragment.gapItemIndex] ?? item;
        return <Fragment key={`${fragment.itemIndex}-${fragmentIndex}`}>
          {fragment.gapBefore > 0 && <span className="pt-rich__gap" style={{ ...fontShorthandToCss(gapItem.font), letterSpacing: gapItem.letterSpacing ?? 0, width: fragment.gapBefore }}>{' '}</span>}
          <span className={`pt-rich__${item.kind ?? 'text'}`} style={{ ...runStyle(item), width: fragment.occupiedWidth }} data-source-item={fragment.itemIndex} data-source-start={fragment.sourceStart} data-source-end={fragment.sourceEnd}>{fragment.text}</span>
        </Fragment>;
      })}</span>) : stableItems.map((item, index) => <span key={index} className={`pt-rich__${item.kind ?? 'text'}`} style={runStyle(item, true)}>{item.text}</span>)}
    </p>
  </div>;
}

export interface MeasuredListItem { id: string; text: string; }
export interface MeasuredTextListProps { items: readonly MeasuredListItem[]; textStyle?: TextStyle; height?: number; virtualized?: boolean; overscan?: number; label?: string; className?: string; }

/** Virtualization is explicit. The default keeps every native list item mounted. */
export function MeasuredTextList({ items, textStyle = INTERFACE_TEXT, height = 360, virtualized = false, overscan = 120, label = 'Measured reading notes', className }: MeasuredTextListProps) {
  const style = useStableTextStyle(textStyle);
  const { ref, width } = useContentWidth<HTMLDivElement>();
  const itemsKey = JSON.stringify(items);
  const stableItems = useMemo(() => JSON.parse(itemsKey) as MeasuredListItem[], [itemsKey]);
  const source = stableItems.map(item => item.text).join(' ');
  const environment = useTextEnvironment(source, [style.font]);
  const [scrollTop, setScrollTop] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const rowPadding = 12;
  const contentWidth = Math.max(0, width - 42);
  const { plan } = useMemo(() => attemptLayout(environment.ready && contentWidth > 0, () => prepareParagraphIndex(stableItems.map(item => ({ ...item, text: item.text.trim() ? item.text : '\u00a0' })), contentWidth, style, { rowPadding, gap: 0 })), [environment.ready, environment.revision, stableItems, contentWidth, style]);
  const previousPlan = useRef(plan);
  useLayoutEffect(() => {
    const previous = previousPlan.current;
    const element = ref.current;
    previousPlan.current = plan;
    if (!previous || !plan || !element || previous === plan) return;
    const anchor = findVisibleRange(previous, element.scrollTop, 1, 0).start;
    const oldItem = previous.items[anchor];
    const nextItem = oldItem && plan.items.find(item => item.id === oldItem.id);
    if (!oldItem || !nextItem) return;
    const offset = Math.max(0, element.scrollTop - oldItem.top);
    const nextScroll = nextItem.top + Math.min(offset, Math.max(0, nextItem.height - 1));
    element.scrollTop = nextScroll;
    setScrollTop(nextScroll);
  }, [plan, ref]);
  const virtual = virtualized && !showAll && Boolean(plan) && !needsNativeBidi(source);
  const range = plan && virtual ? findVisibleRange(plan, scrollTop, height, overscan) : { start: 0, end: stableItems.length };
  const visible = stableItems.slice(range.start, range.end);
  return <section className={classes('pt-list', className)} data-pretext-state={plan ? 'measured' : 'native'} data-pretext-total={stableItems.length} data-pretext-mounted={visible.length} data-pretext-height={plan?.totalHeight}>
    {virtualized && <div className="pt-list__mode"><span>{virtual ? `${visible.length} of ${stableItems.length} notes mounted` : `All ${stableItems.length} notes mounted`}</span><button type="button" className="pt-text-action" onClick={() => setShowAll(value => !value)} aria-pressed={showAll}>{showAll ? 'Use measured window' : 'Show all for find & selection'}</button></div>}
    <div ref={ref} className="pt-list__viewport" style={{ height }} tabIndex={0} role="region" aria-label={label} onScroll={event => setScrollTop(event.currentTarget.scrollTop)}>
      <ol role="list" className="pt-list__items" style={virtual && plan ? { height: plan.totalHeight, position: 'relative' } : undefined}>
        {visible.map((item, index) => {
          const itemIndex = range.start + index;
          const metrics = plan?.items[itemIndex];
          return <li key={item.id} aria-posinset={virtual ? itemIndex + 1 : undefined} aria-setsize={virtual ? stableItems.length : undefined} style={{ paddingBlock: rowPadding, ...(virtual && metrics ? { position: 'absolute', top: metrics.top, minHeight: metrics.height, width: '100%' } : {}) }}>
            <span className="pt-list__number" aria-hidden="true" style={{ lineHeight: `${style.lineHeight}px` }}>{String(itemIndex + 1).padStart(2, '0')}</span><p dir="auto" style={textStyleToCss(style)}>{item.text}</p>
          </li>;
        })}
      </ol>
    </div>
    {virtualized && <p className="pt-field-hint">The complete mode keeps every note available to browser find, selection and assistive technology.</p>}
  </section>;
}

export interface OutlineItem { id: string; label: string; href: string; detail?: string; }
export interface PassageOutlineProps { items: readonly OutlineItem[]; currentId?: string; label?: string; textStyle?: TextStyle; onNavigate?: (id: string) => void; className?: string; }

export function PassageOutline({ items, currentId, label = 'On this page', textStyle = INTERFACE_TEXT, onNavigate, className }: PassageOutlineProps) {
  const style = useStableTextStyle(textStyle);
  const { ref, width } = useContentWidth<HTMLElement>();
  const text = items.map(item => item.label).join(' ');
  const environment = useTextEnvironment(text, [style.font]);
  const labelsKey = JSON.stringify(items.map(item => [item.id, item.label]));
  const metrics = useMemo(() => attemptLayout(environment.ready && width > 42, () => items.map(item => measureParagraph(item.label, width - 42, style))), [environment.ready, environment.revision, width, labelsKey, style]);
  return <nav ref={ref} aria-label={label} className={classes('pt-outline', className)} data-pretext-state={metrics.plan ? 'measured' : 'native'}>
    <ol role="list">{items.map((item, index) => <li key={item.id}><a href={item.href} aria-current={currentId === item.id ? 'location' : undefined} onClick={event => { if (onNavigate && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onNavigate(item.id); } }} style={{ minHeight: Math.max(44, (metrics.plan?.[index]?.height ?? 0) + 16) }}><span className="pt-outline__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span><span style={{ ...textStyleToCss(style), display: 'block' }}>{item.label}</span>{item.detail && <small>{item.detail}</small>}</span></a></li>)}</ol>
  </nav>;
}
