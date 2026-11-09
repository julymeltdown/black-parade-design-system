import { clearCache, layoutWithLines, prepareWithSegments } from '@chenglou/pretext';
import type { PreparedTextWithSegments } from '@chenglou/pretext';
import DOMPurify from 'dompurify';
import type { MermaidConfig } from 'mermaid';

export type ChapterId = 'curtain' | 'memory' | 'loss' | 'theatre' | 'resolve';
export interface Chapter { id: ChapterId; title: string; body: string; trackIds: readonly number[]; }

/** One source for both the visible reader and the diagram. These are editorial readings. */
export const CHAPTERS: readonly Chapter[] = [
  { id: 'curtain', title: 'The curtain rises', body: 'The End. and Dead! introduce mortality through a sudden shift from private reflection to exaggerated, darkly comic theatre.', trackIds: [1, 2] },
  { id: 'memory', title: 'Memory becomes a parade', body: 'Fear of being forgotten grows into a shared procession. The title track turns an intimate piano opening into collective resolve.', trackIds: [3, 4, 5] },
  { id: 'loss', title: 'The private losses', body: 'The quieter songs bring the spectacle back to separation, illness and regret. Space around the voice makes these losses feel close.', trackIds: [6, 8, 12] },
  { id: 'theatre', title: 'The world turns', body: 'Swing, marching rhythms, abrupt scene changes and unruly guitars create a world that feels unstable, theatrical and deliberately excessive.', trackIds: [7, 9, 10, 11] },
  { id: 'resolve', title: 'A decision to stay', body: 'Famous Last Words turns toward survival and shared defiance. Blood then offers an unsettling, darkly comic bow after the main curtain.', trackIds: [13, 14] },
];

export const NARRATIVE_EDGES = [
  ['curtain', 'memory'], ['memory', 'loss'], ['memory', 'theatre'],
  ['loss', 'resolve'], ['theatre', 'resolve'],
] as const satisfies readonly (readonly [ChapterId, ChapterId])[];

export const PRETEXT_FONT = '400 16px Inter';
export const PRETEXT_LINE_HEIGHT = 17.6; // Mermaid 12.3.0 SVG text uses 1.1em.
const NODE_PADDING = 6;
const GRAPH_PADDING = 6;
const NODE_SPACING = 16;
const RANK_SPACING = 22;
const preparedCache = new Map<string, PreparedTextWithSegments>();
let preparationCount = 0;
let fontReady: Promise<void> | undefined;

export async function ensurePretextFont(text: string) {
  if (!fontReady) {
    fontReady = (async () => {
      await document.fonts.load(PRETEXT_FONT, text);
      await document.fonts.ready;
      clearCache();
      preparedCache.clear();
    })().catch(error => { fontReady = undefined; throw error; });
  }
  await fontReady;
  // An edited passage can request an additional unicode-range subset.
  await document.fonts.load(PRETEXT_FONT, text);
}

function cachedPrepare(text: string) {
  const key = `${PRETEXT_FONT}\u0000${text}`;
  const previous = preparedCache.get(key);
  if (previous) return previous;
  const prepared = prepareWithSegments(text, PRETEXT_FONT, { whiteSpace: 'pre-wrap' });
  if (preparedCache.size >= 100) preparedCache.delete(preparedCache.keys().next().value!);
  preparedCache.set(key, prepared);
  preparationCount += 1;
  return prepared;
}

/** Entities keep editor text inside a traditional quoted Mermaid label. */
export function escapeMermaidLabel(text: string) {
  return text.replace(/#/g, '#35;').replace(/&/g, '#38;')
    .replace(/"/g, '#quot;').replace(/</g, '#60;').replace(/>/g, '#62;')
    .replace(/`/g, '#96;').replace(/\\/g, '#92;').replace(/[\r\n]+/g, ' ');
}

export interface NodeMeasurement {
  id: ChapterId;
  title: string;
  body: string;
  displayedBody: string;
  lines: readonly { text: string; width: number }[];
  lineCount: number;
  predictedHeight: number;
  maxLineWidth: number;
}

export interface MermaidPlan {
  source: string;
  canvasWidth: number;
  direction: 'TB' | 'LR';
  labelWidth: number;
  minNodeWidth: number;
  nodePadding: number;
  nodes: readonly NodeMeasurement[];
  preparationCount: number;
  preparedThisPass: number;
  pretextEnabled: boolean;
  labelMode: LabelMode;
  config: MermaidConfig;
}

export type LabelMode = 'excerpt' | 'full';

/** A literal prefix, not a separately authored or generated summary. */
export function projectPassage(body: string, labelMode: LabelMode): string {
  if (labelMode === 'full') return body;
  const words = body.trim().split(/\s+/);
  return words.length <= 6 ? body : `${words.slice(0, 6).join(' ')}…`;
}

export function buildMermaidPlan(chapters: readonly Chapter[], availableWidth: number, pretextEnabled = true, labelMode: LabelMode = 'full'): MermaidPlan {
  const canvasWidth = Math.max(240, Math.floor(availableWidth));
  const direction = canvasWidth >= 720 ? 'LR' : 'TB';
  // TB has two nodes at the fork; LR has four ranks. Reserve actual padding,
  // Mermaid spacing and a 12px rounding budget instead of scaling the SVG font.
  const columns = direction === 'LR' ? 4 : 2;
  const spacing = direction === 'LR' ? RANK_SPACING : NODE_SPACING;
  // Mermaid 12 classic labelHelper and rectangle geometry each add horizontal
  // padding: measured node width is ceil(text width) + 4 * NODE_PADDING.
  const labelWidth = Math.max(64, Math.min(210, Math.floor((canvasWidth - GRAPH_PADDING * 2 - (columns - 1) * spacing - columns * NODE_PADDING * 4 - 12) / columns)));
  const before = preparationCount;
  const nodes: NodeMeasurement[] = chapters.map(chapter => {
    const displayedBody = projectPassage(chapter.body, labelMode);
    const laidOut = layoutWithLines(cachedPrepare(`${chapter.title}\n${displayedBody}`), labelWidth, PRETEXT_LINE_HEIGHT);
    return { ...chapter, displayedBody, lines: laidOut.lines.map(line => ({ text: line.text, width: line.width })), lineCount: laidOut.lineCount, predictedHeight: laidOut.height, maxLineWidth: Math.max(0, ...laidOut.lines.map(line => line.width)) };
  });
  const minNodeWidth = pretextEnabled ? Math.ceil(Math.max(...nodes.map(node => node.maxLineWidth))) : 0;
  const source = [
    `flowchart ${direction}`,
    '  accTitle: A reading of The Black Parade',
    '  accDescr: Editorial interpretation. Memory branches into private losses and theatrical spectacle, then converges on resolve.',
    ...nodes.map(node => `  ${node.id}["${pretextEnabled ? node.lines.map(line => escapeMermaidLabel(line.text)).join('<br/>') : escapeMermaidLabel(`${node.title}. ${node.displayedBody}`)}"]`),
    ...NARRATIVE_EDGES.map(([from, to]) => `  ${from} --> ${to}`),
    '  classDef passage fill:transparent,stroke:transparent,color:#1c1b18',
    `  class ${chapters.map(chapter => chapter.id).join(',')} passage`,
  ].join('\n');
  const config: MermaidConfig = {
    startOnLoad: false,
    securityLevel: 'strict',
    htmlLabels: false,
    deterministicIds: true,
    deterministicIDSeed: 'parade-pretext-v1',
    theme: 'base',
    look: 'classic',
    layout: 'dagre',
    themeVariables: { fontFamily: 'Inter', fontSize: '16px', lineColor: '#8b8579', primaryColor: 'transparent', primaryTextColor: '#1c1b18', primaryBorderColor: 'transparent', background: 'transparent' },
    flowchart: { htmlLabels: false, look: 'classic', layout: 'dagre', useMaxWidth: false, wrappingWidth: 10000, minNodeWidth, padding: NODE_PADDING, diagramPadding: GRAPH_PADDING, nodeSpacing: NODE_SPACING, rankSpacing: RANK_SPACING, curve: 'basis' },
  };
  return { source, canvasWidth, direction, labelWidth, minNodeWidth, nodePadding: NODE_PADDING, nodes, preparationCount, preparedThisPass: preparationCount - before, pretextEnabled, labelMode, config };
}

let renderSerial = 0;
let renderQueue: Promise<unknown> = Promise.resolve();

/** Queue configuration and rendering together: Mermaid's config is global. */
export function renderMermaidPlan(plan: MermaidPlan): Promise<SVGSVGElement> {
  const task = renderQueue.then(async () => {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize(plan.config);
    const renderId = `pretext-parade-${++renderSerial}`;
    const { svg } = await mermaid.render(renderId, plan.source);
    const cleaned = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ['foreignObject', 'script'], FORBID_ATTR: ['onload', 'onclick'] });
    const parsed = new DOMParser().parseFromString(cleaned, 'image/svg+xml');
    if (parsed.querySelector('parsererror') || parsed.documentElement.localName !== 'svg') throw new Error('The diagram did not produce a valid SVG.');
    const element = document.importNode(parsed.documentElement, true) as unknown as SVGSVGElement;
    element.setAttribute('role', 'group');
    element.setAttribute('aria-label', 'Album interpretation. Choose a passage to read its matching text.');
    element.removeAttribute('aria-roledescription');
    element.style.maxWidth = 'none';
    element.style.height = 'auto';
    for (const chapter of CHAPTERS) {
      // Mermaid 12 prefixes flowchart IDs with the render's unique diagram ID.
      // Match the renderer-owned suffix, never user-authored text.
      const nodeId = new RegExp(`^${renderId}-flowchart-${chapter.id}-[0-9]+$`);
      const node = [...element.querySelectorAll<SVGGElement>('g.node')].find(item => nodeId.test(item.id));
      if (!node) throw new Error(`Missing diagram passage: ${chapter.id}`);
      node.setAttribute('data-chapter-id', chapter.id);
      node.setAttribute('tabindex', '0');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `Read ${chapter.title}`);
      node.setAttribute('aria-pressed', 'false');
    }
    return element;
  });
  renderQueue = task.catch(() => undefined);
  return task;
}

export interface SvgVerification { nodeCount: number; clippedLabels: ChapterId[]; intrinsicWidth: number; intrinsicHeight: number; availableWidth: number; fitsWidth: boolean; }
/** This is a post-render verification, not part of Pretext's layout hot path. */
export function verifyMermaidSvg(svg: SVGSVGElement, plan: MermaidPlan): SvgVerification {
  const clippedLabels: ChapterId[] = [];
  const nodes = [...svg.querySelectorAll<SVGGElement>('g[data-chapter-id]')];
  for (const node of nodes) {
    const shape = node.querySelector('rect');
    const label = node.querySelector<SVGGElement>('.label');
    if (!shape || !label) { clippedLabels.push(node.dataset.chapterId as ChapterId); continue; }
    const bounds = shape.getBoundingClientRect();
    const text = label.getBoundingClientRect();
    if (text.left < bounds.left - 1 || text.right > bounds.right + 1 || text.top < bounds.top - 1 || text.bottom > bounds.bottom + 1) clippedLabels.push(node.dataset.chapterId as ChapterId);
  }
  const intrinsicWidth = svg.viewBox.baseVal.width;
  return { nodeCount: nodes.length, clippedLabels, intrinsicWidth, intrinsicHeight: svg.viewBox.baseVal.height, availableWidth: plan.canvasWidth, fitsWidth: intrinsicWidth <= plan.canvasWidth + 1 };
}
