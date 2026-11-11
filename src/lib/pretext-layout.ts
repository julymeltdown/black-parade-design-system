/**
 * Shared text geometry for the Atlas components and Mermaid labels.
 *
 * Uses only public @chenglou/pretext 1.0.0 APIs. Preparation is cached by
 * content and shaping style; changing a container's width never prepares a
 * width-specific substring. See docs/pretext-layout-engine.md for rendering
 * requirements, source semantics and the upstream patterns adapted here.
 */
import {
  clearCache,
  layout,
  layoutNextLine,
  layoutWithLines,
  materializeLineRange,
  measureLineStats,
  measureNaturalWidth,
  prepareWithSegments,
  type LayoutCursor,
  type LayoutLine,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';

export type { LayoutCursor, LayoutLine, PreparedTextWithSegments } from '@chenglou/pretext';

export type TextStyle = {
  font: string;
  lineHeight: number;
  letterSpacing?: number;
  whiteSpace?: 'normal' | 'pre-wrap';
  wordBreak?: 'normal' | 'keep-all';
};

export type ParagraphMetrics = {
  width: number;
  height: number;
  lineCount: number;
  maxLineWidth: number;
  naturalWidth: number;
};

export type BalancedParagraph = ParagraphMetrics & {
  balancedWidth: number;
  originalLineCount: number;
  lines: LayoutLine[];
};

export type ClampedParagraph = ParagraphMetrics & {
  text: string;
  lines: LayoutLine[];
  truncated: boolean;
  totalLineCount: number;
};

export type FlowExclusion = {
  side: 'left' | 'right';
  width: number;
  height: number;
  gap?: number;
  top?: number;
};

export type FlowLine = LayoutLine & { x: number; y: number; availableWidth: number };
export type FlowParagraph = ParagraphMetrics & { lines: FlowLine[] };

export type ParagraphIndexItem = {
  id: string;
  text: string;
  top: number;
  height: number;
  lineCount: number;
};

export type ParagraphIndex = {
  width: number;
  items: readonly ParagraphIndexItem[];
  tops: Float64Array;
  heights: Float64Array;
  totalHeight: number;
};

export type TextCacheStats = {
  revision: number;
  hits: number;
  misses: number;
  preparations: number;
  entries: number;
  capacity: number;
  layoutPasses: number;
  invalidations: number;
  lastInvalidationReason: string;
};

const preparedCache = new Map<string, PreparedTextWithSegments>();
const cacheListeners = new Set<() => void>();
let cacheNotificationQueued = false;
let naturalWidths = new WeakMap<PreparedTextWithSegments, number>();
let capacity = 512;
const counters = {
  revision: 0,
  hits: 0,
  misses: 0,
  preparations: 0,
  layoutPasses: 0,
  invalidations: 0,
  lastInvalidationReason: 'initial',
};
const START: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
const FIT_TOLERANCE = 1 / 64;

function scheduleCacheNotification(): void {
  if (!cacheListeners.size || cacheNotificationQueued) return;
  cacheNotificationQueued = true;
  queueMicrotask(() => {
    cacheNotificationQueued = false;
    for (const listener of cacheListeners) listener();
  });
}

/** Subscribe from an effect; callbacks run after the current measurement batch. */
export function subscribeTextCache(listener: () => void): () => void {
  cacheListeners.add(listener);
  scheduleCacheNotification();
  return () => { cacheListeners.delete(listener); };
}

function recordLayoutPass(): void {
  counters.layoutPasses += 1;
  scheduleCacheNotification();
}

export function normalizeTextStyle(style: TextStyle): Required<TextStyle> {
  if (typeof style.font !== 'string' || !style.font.trim()) {
    throw new RangeError('TextStyle.font must be a nonempty Canvas font shorthand.');
  }
  if (!Number.isFinite(style.lineHeight) || style.lineHeight <= 0) {
    throw new RangeError('TextStyle.lineHeight must be a positive, finite pixel value.');
  }
  const letterSpacing = style.letterSpacing ?? 0;
  if (!Number.isFinite(letterSpacing)) {
    throw new RangeError('TextStyle.letterSpacing must be a finite pixel value.');
  }
  const whiteSpace = style.whiteSpace ?? 'normal';
  const wordBreak = style.wordBreak ?? 'normal';
  if (whiteSpace !== 'normal' && whiteSpace !== 'pre-wrap') {
    throw new RangeError('TextStyle.whiteSpace must be normal or pre-wrap.');
  }
  if (wordBreak !== 'normal' && wordBreak !== 'keep-all') {
    throw new RangeError('TextStyle.wordBreak must be normal or keep-all.');
  }
  return {
    font: style.font.trim(),
    lineHeight: style.lineHeight,
    letterSpacing: Object.is(letterSpacing, -0) ? 0 : letterSpacing,
    whiteSpace,
    wordBreak,
  };
}

function trimCache(): void {
  while (preparedCache.size > capacity) {
    const oldest = preparedCache.keys().next().value;
    if (oldest === undefined) break;
    preparedCache.delete(oldest);
  }
}

export function setTextCacheCapacity(nextCapacity: number): void {
  if (!Number.isInteger(nextCapacity) || nextCapacity < 1 || nextCapacity > 4096) {
    throw new RangeError('Text cache capacity must be an integer between 1 and 4096.');
  }
  capacity = nextCapacity;
  trimCache();
  scheduleCacheNotification();
}

export function getTextCacheStats(): TextCacheStats {
  return { ...counters, entries: preparedCache.size, capacity };
}

/** Existing handles remain immutable snapshots; consumers must recompute. */
export function invalidateTextCache(reason = 'text environment changed'): void {
  preparedCache.clear();
  naturalWidths = new WeakMap();
  clearCache();
  counters.revision += 1;
  counters.invalidations += 1;
  counters.lastInvalidationReason = reason;
  scheduleCacheNotification();
}

export function getPreparedText(text: string, style: TextStyle): PreparedTextWithSegments {
  const normalized = normalizeTextStyle(style);
  if (typeof text !== 'string') throw new TypeError('Text must be a string.');
  // lineHeight belongs to layout, not shaping. Neither it nor width is a key.
  const key = JSON.stringify([
    normalized.font,
    normalized.letterSpacing,
    normalized.whiteSpace,
    normalized.wordBreak,
    text,
  ]);
  const cached = preparedCache.get(key);
  if (cached) {
    counters.hits += 1;
    preparedCache.delete(key);
    preparedCache.set(key, cached);
    scheduleCacheNotification();
    return cached;
  }
  counters.misses += 1;
  scheduleCacheNotification();
  const prepared = prepareWithSegments(text, normalized.font, {
    letterSpacing: normalized.letterSpacing,
    whiteSpace: normalized.whiteSpace,
    wordBreak: normalized.wordBreak,
  });
  counters.preparations += 1;
  preparedCache.set(key, prepared);
  trimCache();
  return prepared;
}

function usableWidth(width: number): number {
  return Number.isFinite(width) && width > 0 ? width : 0;
}

function nonnegative(value: number | undefined, fallback = 0): number {
  return value !== undefined && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function emptyMetrics(width = 0): ParagraphMetrics {
  return { width, height: 0, lineCount: 0, maxLineWidth: 0, naturalWidth: 0 };
}

function naturalWidth(prepared: PreparedTextWithSegments): number {
  const cached = naturalWidths.get(prepared);
  if (cached !== undefined) return cached;
  recordLayoutPass();
  const width = measureNaturalWidth(prepared);
  naturalWidths.set(prepared, width);
  return width;
}

function lineStats(prepared: PreparedTextWithSegments, width: number) {
  recordLayoutPass();
  return measureLineStats(prepared, width);
}

function countLines(prepared: PreparedTextWithSegments, width: number, lineHeight: number) {
  recordLayoutPass();
  return layout(prepared, width, lineHeight);
}

function nextLine(prepared: PreparedTextWithSegments, width: number, cursor: LayoutCursor) {
  recordLayoutPass();
  return layoutNextLine(prepared, width, cursor);
}

function allLines(prepared: PreparedTextWithSegments, width: number, lineHeight: number) {
  recordLayoutPass();
  return layoutWithLines(prepared, width, lineHeight);
}

function maxLineWidth(lines: readonly LayoutLine[]): number {
  let maximum = 0;
  for (const line of lines) maximum = Math.max(maximum, line.width);
  return maximum;
}

function compareCursor(a: LayoutCursor, b: LayoutCursor): number {
  return a.segmentIndex - b.segmentIndex || a.graphemeIndex - b.graphemeIndex;
}

function assertProgress(start: LayoutCursor, end: LayoutCursor): void {
  if (compareCursor(start, end) >= 0) {
    throw new Error('Pretext returned a non-advancing source cursor.');
  }
}

function endsAtHardBreak(prepared: PreparedTextWithSegments, end: LayoutCursor): boolean {
  return end.graphemeIndex === 0 && prepared.kinds[end.segmentIndex - 1] === 'hard-break';
}

/** Normalized source, not a join of visual lines (which can contain hyphens). */
function sourcePrefix(prepared: PreparedTextWithSegments, end: LayoutCursor): string {
  const prefix = prepared.segments.slice(0, end.segmentIndex).join('');
  if (end.graphemeIndex === 0) return prefix;
  // The public materializer knows Pretext's exact grapheme boundaries. Using
  // JS slice(), code points, or a second segmenter could split a ZWJ cluster.
  return prefix + materializeLineRange(prepared, {
    start: { segmentIndex: end.segmentIndex, graphemeIndex: 0 },
    end,
    width: 0,
  }).text;
}

export function measureParagraph(text: string, width: number, style: TextStyle): ParagraphMetrics {
  const normalized = normalizeTextStyle(style);
  const available = usableWidth(width);
  if (!available) return emptyMetrics();
  const prepared = getPreparedText(text, normalized);
  const stats = lineStats(prepared, available);
  return {
    width: available,
    height: stats.lineCount * normalized.lineHeight,
    lineCount: stats.lineCount,
    maxLineWidth: stats.maxLineWidth,
    naturalWidth: naturalWidth(prepared),
  };
}

/** Find the smallest quarter-pixel width that keeps the original line count. */
export function balanceParagraph(text: string, width: number, style: TextStyle): BalancedParagraph {
  const normalized = normalizeTextStyle(style);
  const available = usableWidth(width);
  if (!available) return { ...emptyMetrics(), balancedWidth: 0, originalLineCount: 0, lines: [] };
  const prepared = getPreparedText(text, normalized);
  const initial = countLines(prepared, available, normalized.lineHeight);
  if (!initial.lineCount) {
    return { ...emptyMetrics(available), balancedWidth: available, originalLineCount: 0, lines: [] };
  }
  let low = 0;
  let high = available;
  for (let iteration = 0; high - low > 0.25 && iteration < 64; iteration += 1) {
    const middle = (low + high) / 2;
    const candidate = countLines(prepared, middle, normalized.lineHeight);
    if (candidate.lineCount <= initial.lineCount) high = middle;
    else low = middle;
  }
  let balancedWidth = Math.min(available, Math.ceil(high * 4) / 4);
  let result = allLines(prepared, balancedWidth, normalized.lineHeight);
  // An indivisible glyph may exceed a very narrow container. Do not turn
  // that honest overflow into an artificially narrower heading box.
  if (result.lineCount !== initial.lineCount || maxLineWidth(result.lines) > balancedWidth + FIT_TOLERANCE) {
    balancedWidth = available;
    result = allLines(prepared, available, normalized.lineHeight);
  }
  return {
    width: available,
    height: result.height,
    lineCount: result.lineCount,
    maxLineWidth: maxLineWidth(result.lines),
    naturalWidth: naturalWidth(prepared),
    balancedWidth,
    originalLineCount: initial.lineCount,
    lines: result.lines,
  };
}

/**
 * Fill a final line with existing segment/grapheme cursors. Like the upstream
 * ellipsis model, account for a hanging space before filling the next word.
 * Hard breaks and tabs end this fill rather than inventing a new tab origin.
 */
function fitFinalLine(
  prepared: PreparedTextWithSegments,
  start: LayoutCursor,
  room: number,
  spaceWidth: number,
): LayoutLine {
  let cursor = start;
  let advance = 0;
  let inkWidth = 0;
  let text = '';
  while (room - advance > 0) {
    const piece = nextLine(prepared, room - advance, cursor);
    if (!piece || piece.width > room - advance + FIT_TOLERANCE) break;
    assertProgress(cursor, piece.end);
    const visible = piece.text.replace(/[\t \r\n\u2028\u2029]+$/u, '');
    if (visible.length) inkWidth = advance + piece.width;
    text += piece.text;
    cursor = piece.end;
    advance += piece.width;
    if (endsAtHardBreak(prepared, cursor) || /\t[ ]*$/u.test(piece.text)) break;
    // A materialized discretionary hyphen is already an end-of-line glyph.
    // Do not glue the following word onto it as if it were a source hyphen.
    if (cursor.graphemeIndex === 0 && prepared.kinds[cursor.segmentIndex - 1] === 'soft-hyphen') break;
    const spaces = piece.text.match(/ +$/u)?.[0].length ?? 0;
    if (spaces) {
      const hangingWidth = spaces * spaceWidth;
      if (advance + hangingWidth > room + FIT_TOLERANCE) break;
      advance += hangingWidth;
    }
  }
  return {
    text: text.replace(/[\t \r\n\u2028\u2029]+$/u, ''),
    width: inkWidth,
    start: { ...start },
    end: { ...cursor },
  };
}

export function clampParagraph(
  text: string,
  width: number,
  maxLines: number,
  style: TextStyle,
  ellipsis = '…',
): ClampedParagraph {
  const normalized = normalizeTextStyle(style);
  const available = usableWidth(width);
  const limit = Number.isFinite(maxLines) ? Math.max(0, Math.floor(maxLines)) : 0;
  if (!available) {
    return { ...emptyMetrics(), text: '', lines: [], truncated: text.length > 0, totalLineCount: 0 };
  }
  const prepared = getPreparedText(text, normalized);
  const complete = countLines(prepared, available, normalized.lineHeight);
  const originalWidth = naturalWidth(prepared);
  const truncated = complete.lineCount > limit;
  if (!limit || !complete.lineCount) {
    return { ...emptyMetrics(available), naturalWidth: originalWidth, text: '', lines: [], truncated, totalLineCount: complete.lineCount };
  }
  // Warm the two constant handles even when this width fits in full. A later
  // narrow resize can then truncate without a first-time tail preparation.
  const auxiliaryStyle: TextStyle = { ...normalized, whiteSpace: 'normal', wordBreak: 'normal' };
  const tail = getPreparedText(ellipsis.replace(/[\r\n\u2028\u2029]+/gu, ' '), auxiliaryStyle);
  const tailText = tail.segments.join('');
  const tailWidth = naturalWidth(tail);
  const space = getPreparedText('\u00a0', auxiliaryStyle);
  const spaceWidth = naturalWidth(space);
  if (!truncated) {
    const result = allLines(prepared, available, normalized.lineHeight);
    return {
      width: available,
      height: result.height,
      lineCount: result.lineCount,
      maxLineWidth: maxLineWidth(result.lines),
      naturalWidth: originalWidth,
      text: prepared.segments.join(''),
      lines: result.lines,
      truncated: false,
      totalLineCount: complete.lineCount,
    };
  }
  if (tailWidth > available + FIT_TOLERANCE) {
    return {
      ...emptyMetrics(available),
      naturalWidth: originalWidth,
      text: '',
      lines: [],
      truncated: true,
      totalLineCount: complete.lineCount,
    };
  }
  const lines: LayoutLine[] = [];
  let cursor = START;
  for (let index = 0; index < limit - 1; index += 1) {
    const line = nextLine(prepared, available, cursor);
    if (!line) break;
    // A single indivisible grapheme can be wider than the whole box. Return
    // the fitted prefix plus a tail instead of pretending that glyph fits.
    if (line.width > available + FIT_TOLERANCE) break;
    assertProgress(cursor, line.end);
    lines.push(line);
    cursor = line.end;
  }
  const last = fitFinalLine(prepared, cursor, Math.max(0, available - tailWidth), spaceWidth);
  const finalLine: LayoutLine = {
    ...last,
    text: last.text + tailText,
    width: last.width + tailWidth,
  };
  lines.push(finalLine);
  // Trim only the last visible line. Trimming the whole prefix would erase
  // previous hard breaks, e.g. turn a two-line "first\n…" into "first…".
  const precedingText = sourcePrefix(prepared, cursor);
  const lastSource = sourcePrefix(prepared, last.end).slice(precedingText.length).trimEnd();
  return {
    width: available,
    height: lines.length * normalized.lineHeight,
    lineCount: lines.length,
    maxLineWidth: maxLineWidth(lines),
    naturalWidth: originalWidth,
    text: precedingText + lastSource + tailText,
    lines,
    truncated: true,
    totalLineCount: complete.lineCount,
  };
}

export function flowParagraph(
  text: string,
  width: number,
  style: TextStyle,
  exclusion?: FlowExclusion,
): FlowParagraph {
  const normalized = normalizeTextStyle(style);
  const available = usableWidth(width);
  if (!available) return { ...emptyMetrics(), lines: [] };
  const prepared = getPreparedText(text, normalized);
  const lines: FlowLine[] = [];
  const top = nonnegative(exclusion?.top);
  const obstacleHeight = nonnegative(exclusion?.height);
  const bottom = top + obstacleHeight;
  const obstacleWidth = nonnegative(exclusion?.width) + nonnegative(exclusion?.gap);
  if (!Number.isFinite(bottom) || !Number.isFinite(obstacleWidth)) {
    throw new RangeError('Flow exclusion geometry must have finite pixel extents.');
  }
  let cursor = START;
  let y = 0;
  while (true) {
    const blocked = obstacleHeight > 0 && y < bottom && y + normalized.lineHeight > top;
    const reduction = blocked ? obstacleWidth : 0;
    const lineWidth = Math.max(0, available - reduction);
    if (!lineWidth) {
      // Jump past a full-width obstacle without consuming any source text.
      y = Math.ceil(bottom / normalized.lineHeight) * normalized.lineHeight;
      continue;
    }
    const line = nextLine(prepared, lineWidth, cursor);
    if (!line) break;
    assertProgress(cursor, line.end);
    lines.push({
      ...line,
      x: blocked && exclusion?.side === 'left' ? reduction : 0,
      y,
      availableWidth: lineWidth,
    });
    cursor = line.end;
    y += normalized.lineHeight;
  }
  return {
    width: available,
    height: lines.length ? lines[lines.length - 1]!.y + normalized.lineHeight : 0,
    lineCount: lines.length,
    maxLineWidth: maxLineWidth(lines),
    naturalWidth: naturalWidth(prepared),
    lines,
  };
}

export function prepareParagraphIndex(
  items: readonly { id: string; text: string }[],
  width: number,
  style: TextStyle,
  options: { rowPadding?: number; gap?: number; rowExtraHeight?: number } = {},
): ParagraphIndex {
  const normalized = normalizeTextStyle(style);
  const available = usableWidth(width);
  const rowPadding = nonnegative(options.rowPadding);
  const gap = nonnegative(options.gap);
  const rowExtraHeight = nonnegative(options.rowExtraHeight);
  const tops = new Float64Array(items.length);
  const heights = new Float64Array(items.length);
  const measured: ParagraphIndexItem[] = [];
  let top = 0;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]!;
    const metrics = measureParagraph(item.text, available, normalized);
    const height = metrics.height + rowPadding * 2 + rowExtraHeight;
    tops[index] = top;
    heights[index] = height;
    measured.push({ ...item, top, height, lineCount: metrics.lineCount });
    top += height + (index < items.length - 1 ? gap : 0);
  }
  return { width: available, items: measured, tops, heights, totalHeight: top };
}

/** Pixel overscan; end is exclusive. Both searches are O(log n). */
export function findVisibleRange(
  index: ParagraphIndex,
  scrollTop: number,
  viewportHeight: number,
  overscan = 0,
): { start: number; end: number } {
  const count = index.items.length;
  const viewport = nonnegative(viewportHeight);
  if (!count || !viewport) return { start: 0, end: 0 };
  const scroll = nonnegative(scrollTop);
  const extra = nonnegative(overscan);
  const startY = Math.max(0, scroll - extra);
  const endY = scroll + viewport + extra;
  let low = 0;
  let high = count;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (index.tops[middle]! + index.heights[middle]! <= startY) low = middle + 1;
    else high = middle;
  }
  const start = low;
  high = count;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (index.tops[middle]! < endY) low = middle + 1;
    else high = middle;
  }
  return { start, end: Math.max(start, low) };
}
