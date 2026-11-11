import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';

// Real Skia Canvas measurements with the same bundled Inter used in the UI.
// This verifies the arithmetic and source semantics, not cross-browser parity.
const inter = fileURLToPath(new URL('../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', import.meta.url));
assert.ok(GlobalFonts.registerFromPath(inter, 'Inter'), 'Bundled Inter font must load');
globalThis.OffscreenCanvas = class {
  constructor(width, height) { this.canvas = createCanvas(width, height); }
  getContext(type) { return this.canvas.getContext(type); }
};

const {
  normalizeTextStyle,
  getPreparedText,
  getTextCacheStats,
  subscribeTextCache,
  invalidateTextCache,
  setTextCacheCapacity,
  measureParagraph,
  balanceParagraph,
  clampParagraph,
  flowParagraph,
  prepareParagraphIndex,
  findVisibleRange,
} = await import('./pretext-layout.ts');

const STYLE = { font: '16px Inter', lineHeight: 24 };
const PASSAGE = 'A miniature overture: acoustic intimacy gives way to theatrical scale. Listen to the sudden change in space as the full band arrives. Every note has room to breathe, and every word stays readable.';
const context = createCanvas(1, 1).getContext('2d');
const compact = text => text.replace(/\s/gu, '');
const compareCursor = (a, b) => a.segmentIndex - b.segmentIndex || a.graphemeIndex - b.graphemeIndex;

test('styles normalize without folding font-family names; invalid geometry has a controlled result', () => {
  assert.deepEqual(normalizeTextStyle({ font: '  16px "A  B"  ', lineHeight: 24 }), {
    font: '16px "A  B"', lineHeight: 24, letterSpacing: 0, whiteSpace: 'normal', wordBreak: 'normal',
  });
  for (const lineHeight of [0, -1, NaN, Infinity]) {
    assert.throws(() => normalizeTextStyle({ ...STYLE, lineHeight }), RangeError);
  }
  assert.throws(() => normalizeTextStyle({ ...STYLE, font: ' ' }), RangeError);
  assert.throws(() => normalizeTextStyle({ ...STYLE, letterSpacing: Infinity }), RangeError);
  for (const width of [0, -1, NaN, Infinity]) {
    assert.equal(measureParagraph(PASSAGE, width, STYLE).height, 0);
    assert.equal(balanceParagraph(PASSAGE, width, STYLE).balancedWidth, 0);
    assert.deepEqual(clampParagraph(PASSAGE, width, 2, STYLE).lines, []);
    assert.deepEqual(flowParagraph(PASSAGE, width, STYLE).lines, []);
  }
  assert.equal(measureParagraph('', 200, STYLE).lineCount, 0);
  assert.equal(measureParagraph(' \t\n ', 200, STYLE).lineCount, 0);
  assert.ok(measureParagraph(' \t\n ', 200, { ...STYLE, whiteSpace: 'pre-wrap' }).lineCount > 0);
});

test('LRU is bounded, refreshes recency and invalidates both generations without resetting counters', () => {
  setTextCacheCapacity(2);
  invalidateTextCache('LRU fixture');
  const start = getTextCacheStats();
  const first = getPreparedText('A', STYLE);
  const second = getPreparedText('B', STYLE);
  assert.equal(getPreparedText('A', { ...STYLE, lineHeight: 40 }), first);
  getPreparedText('C', STYLE);
  assert.equal(getTextCacheStats().entries, 2);
  assert.equal(getPreparedText('A', STYLE), first);
  assert.notEqual(getPreparedText('B', STYLE), second, 'B, not recently touched A, was evicted');
  assert.equal(getTextCacheStats().preparations - start.preparations, 4);
  const beforeInvalidate = getTextCacheStats();
  invalidateTextCache('font loaded');
  const afterInvalidate = getTextCacheStats();
  assert.equal(afterInvalidate.entries, 0);
  assert.equal(afterInvalidate.revision, beforeInvalidate.revision + 1);
  assert.equal(afterInvalidate.invalidations, beforeInvalidate.invalidations + 1);
  assert.equal(afterInvalidate.preparations, beforeInvalidate.preparations);
  assert.equal(afterInvalidate.lastInvalidationReason, 'font loaded');
  assert.throws(() => setTextCacheCapacity(0), RangeError);
  assert.throws(() => setTextCacheCapacity(2.5), RangeError);
  setTextCacheCapacity(512);
  invalidateTextCache('restore default capacity');
});

test('diagnostic subscriptions publish one asynchronous snapshot per batch and stop after unsubscribe', async () => {
  let notifications = 0;
  let latest;
  const unsubscribe = subscribeTextCache(() => {
    notifications += 1;
    latest = getTextCacheStats();
  });
  measureParagraph('A subscribed paragraph.', 200, STYLE);
  balanceParagraph('A subscribed heading.', 200, STYLE);
  assert.equal(notifications, 0, 'no notification inside a measuring/rendering stack');
  await Promise.resolve();
  assert.equal(notifications, 1, 'the whole batch coalesces into one microtask');
  assert.equal(latest.layoutPasses, getTextCacheStats().layoutPasses);
  invalidateTextCache('subscription generation');
  await Promise.resolve();
  assert.equal(notifications, 2);
  assert.equal(latest.entries, 0);
  assert.equal(latest.lastInvalidationReason, 'subscription generation');
  unsubscribe();
  measureParagraph('No subscriber remains.', 200, STYLE);
  await Promise.resolve();
  assert.equal(notifications, 2);
});

test('width-only reflow across five algorithms and 200 rows prepares nothing after warmup', () => {
  invalidateTextCache('reflow fixture');
  const items = Array.from({ length: 200 }, (_, i) => ({ id: `row-${i}`, text: `${i}. ${PASSAGE}` }));
  const exercise = width => {
    measureParagraph(PASSAGE, width, STYLE);
    balanceParagraph(PASSAGE, width, STYLE);
    clampParagraph(PASSAGE, width, 3, STYLE);
    flowParagraph(PASSAGE, width, STYLE, { side: 'left', width: 70, height: 80, gap: 12 });
    return prepareParagraphIndex(items, width, STYLE, { rowPadding: 8, gap: 4 });
  };
  exercise(1800); // The initial clamp fits in full; auxiliary tails are still warmed.
  const warm = getTextCacheStats();
  assert.ok(warm.entries >= 203);
  const phone = exercise(280);
  exercise(390);
  assert.equal(getTextCacheStats().preparations, warm.preparations);
  assert.ok(getTextCacheStats().layoutPasses > warm.layoutPasses);
  assert.ok(phone.totalHeight > 200 * STYLE.lineHeight);
  const changed = items.map((item, index) => index === 81 ? { ...item, text: `${item.text} An edit.` } : item);
  prepareParagraphIndex(changed, 390, STYLE);
  assert.equal(getTextCacheStats().preparations, warm.preparations + 1, 'only the edited row prepares');
});

test('all shaping inputs distinguish cache entries, while width and line height do not', () => {
  invalidateTextCache('style fixture');
  const initial = getPreparedText(PASSAGE, STYLE);
  assert.equal(getPreparedText(PASSAGE, { ...STYLE, font: ' 16px Inter ', lineHeight: 30, letterSpacing: -0, whiteSpace: 'normal', wordBreak: 'normal' }), initial);
  const baseline = getTextCacheStats().preparations;
  for (const changed of [
    { ...STYLE, font: '17px Inter' },
    { ...STYLE, letterSpacing: 0.5 },
    { ...STYLE, whiteSpace: 'pre-wrap' },
    { ...STYLE, wordBreak: 'keep-all' },
  ]) assert.notEqual(getPreparedText(PASSAGE, changed), initial);
  assert.equal(getTextCacheStats().preparations - baseline, 4);
});

test('real glyph widths fit the paragraph budgets; metrics respond to phone width', () => {
  context.font = STYLE.font;
  const narrow = measureParagraph(PASSAGE, 280, STYLE);
  const wide = measureParagraph(PASSAGE, 390, STYLE);
  assert.ok(narrow.lineCount > wide.lineCount);
  assert.equal(narrow.height, narrow.lineCount * STYLE.lineHeight);
  assert.equal(narrow.naturalWidth, wide.naturalWidth);
  for (const width of [180, 280, 390, 760]) {
    const plan = flowParagraph(PASSAGE, width, STYLE);
    assert.equal(compact(plan.lines.map(line => line.text).join('')), compact(PASSAGE));
    for (const line of plan.lines) {
      assert.ok(line.width <= width + 0.5);
      assert.ok(context.measureText(line.text.trimEnd()).width <= width + 0.5, 'actual Canvas glyphs fit');
    }
  }
});

test('balanced headings keep the original line count and type size at a tighter width', () => {
  const title = 'Welcome to the Black Parade. A record that stays with you.';
  const style = { font: '32px Inter', lineHeight: 38 };
  let tightened = false;
  for (const width of [280, 390, 760]) {
    const result = balanceParagraph(title, width, style);
    assert.equal(result.originalLineCount, measureParagraph(title, width, style).lineCount);
    assert.equal(result.lineCount, result.originalLineCount);
    assert.ok(result.balancedWidth <= width);
    assert.ok(result.maxLineWidth <= result.balancedWidth + 0.5);
    assert.equal(compact(result.lines.map(line => line.text).join('')), compact(title));
    assert.equal(result.height, result.lineCount * 38);
    tightened ||= result.balancedWidth < width - 1;
  }
  assert.ok(tightened, 'at least one heading really tightens, rather than echoing its input width');
  assert.deepEqual(style, { font: '32px Inter', lineHeight: 38 });
});

test('ellipsis uses measured remaining width and source grapheme cursors without losing CJK or ZWJ clusters', () => {
  const fixtures = [
    PASSAGE,
    'supercalifragilisticexpialidociousunbrokenwordthatkeepsgoing and another longer word',
    '한글의 가독성과 글자 사이의 관계를 쉽게 읽을 수 있는 단락. 작은 화면에서도 모두 읽습니다.',
    '👩🏽‍💻👩‍👩‍👧‍👦 🖤 The parade carries on, and we remember every word. '.repeat(3),
    'Cafe\u0301 and naïve, then a longer encore for the whole room. '.repeat(3),
  ];
  for (const source of fixtures) {
    const normalizedSource = getPreparedText(source, STYLE).segments.join('');
    const boundaries = new Set([0]);
    let offset = 0;
    for (const segment of new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(normalizedSource)) {
      offset += segment.segment.length;
      boundaries.add(offset);
    }
    for (const width of [75, 130, 280]) {
      const result = clampParagraph(source, width, 2, STYLE);
      assert.ok(result.lineCount <= 2);
      assert.ok(result.lines.every(line => line.width <= width + 0.5));
      assert.ok(measureParagraph(result.text, width, STYLE).lineCount <= 2, 'native source prefix also stays within the clamp');
      if (result.truncated) {
        assert.ok(result.text.endsWith('…'));
        assert.ok(result.lines.at(-1).text.endsWith('…'));
        const prefix = result.text.slice(0, -1);
        assert.ok(normalizedSource.startsWith(prefix), 'no inserted spaces in split tokens or Korean text');
        assert.ok(boundaries.has(prefix.length), 'cut ends at a complete source grapheme');
      } else assert.equal(result.text, normalizedSource);
    }
  }
});

test('clamp preserves hard breaks, handles blank lines and does not overflow an impossibly narrow tail', () => {
  const style = { ...STYLE, whiteSpace: 'pre-wrap' };
  const source = 'first\n\nthird\nlast line.';
  const short = clampParagraph(source, 130, 2, style);
  assert.equal(short.text, 'first\n…');
  assert.equal(short.lines.length, 2);
  assert.equal(measureParagraph(short.text, 130, style).lineCount, 2);
  assert.equal(clampParagraph(source, 130, 9, style).text, source);
  assert.equal(clampParagraph('soft\u00adhyphen', 50, 20, STYLE).text, 'soft\u00adhyphen');
  const tiny = clampParagraph(PASSAGE, 1, 2, STYLE);
  assert.equal(tiny.truncated, true);
  assert.deepEqual(tiny.lines, []);
  assert.equal(tiny.maxLineWidth, 0);
  const wideGlyph = clampParagraph('👩🏽‍💻 a much longer passage to truncate.', 20, 2, STYLE);
  assert.equal(wideGlyph.text, '…');
  assert.ok(wideGlyph.maxLineWidth <= 20);
  const zero = clampParagraph(PASSAGE, 200, 0, STYLE);
  assert.equal(zero.text, '');
  assert.equal(zero.truncated, true);
  assert.equal(clampParagraph(PASSAGE, 200, NaN, STYLE).lineCount, 0);
  const withoutTail = clampParagraph(PASSAGE, 130, 2, STYLE, '');
  assert.ok(!withoutTail.text.endsWith('…'));
  assert.ok(withoutTail.maxLineWidth <= 130 + 0.5);
  assert.equal(clampParagraph('', 130, 2, STYLE).truncated, false);
});

test('flow consumes one cursor stream around either side of an exclusion and expands below it', () => {
  const text = PASSAGE.repeat(2);
  for (const side of ['left', 'right']) {
    const result = flowParagraph(text, 280, STYLE, { side, width: 92, height: 72, gap: 16 });
    assert.equal(result.lines.map(line => line.text).join(''), text);
    assert.ok(result.lines.length > 3);
    for (const [index, line] of result.lines.entries()) {
      assert.ok(compareCursor(line.start, line.end) < 0);
      if (index) assert.equal(compareCursor(result.lines[index - 1].end, line.start), 0);
      assert.equal(line.availableWidth, line.y < 72 ? 172 : 280);
      assert.equal(line.x, line.y < 72 && side === 'left' ? 108 : 0);
      assert.ok(line.width <= line.availableWidth + 0.5);
    }
    assert.equal(result.height, result.lines.at(-1).y + 24);
  }
  const blocked = flowParagraph(PASSAGE, 200, STYLE, { side: 'left', width: 200, height: 49 });
  assert.equal(blocked.lines[0].y, 72);
  assert.equal(blocked.lines.map(line => line.text).join(''), PASSAGE);
  const lower = flowParagraph(PASSAGE, 200, STYLE, { side: 'right', top: 36, width: 80, height: 24 });
  assert.equal(lower.lines[0].availableWidth, 200);
  assert.equal(lower.lines[1].availableWidth, 120, 'the whole 24–48px band intersects the obstacle');
  assert.equal(lower.lines[2].availableWidth, 120);
  assert.equal(lower.lines[3].availableWidth, 200);
});

test('height indexes use actual wrapped rows, exact prefix offsets and binary visible ranges', () => {
  const items = Array.from({ length: 200 }, (_, index) => ({
    id: String(index), text: `${index}: ${'The record stays with you. '.repeat(1 + index % 5)}`,
  }));
  const result = prepareParagraphIndex(items, 280, STYLE, { rowPadding: 6, rowExtraHeight: 18, gap: 8 });
  assert.ok(result.tops instanceof Float64Array);
  assert.ok(result.heights instanceof Float64Array);
  let expectedTop = 0;
  for (const [index, item] of result.items.entries()) {
    assert.equal(item.top, expectedTop);
    assert.equal(result.tops[index], expectedTop);
    assert.equal(item.height, item.lineCount * 24 + 12 + 18);
    assert.equal(result.heights[index], item.height);
    expectedTop += item.height + (index < items.length - 1 ? 8 : 0);
  }
  assert.equal(result.totalHeight, expectedTop);
  for (const scroll of [0, 100, 500, 1033, result.totalHeight - 200, result.totalHeight + 10]) {
    for (const overscan of [0, 80]) {
      const range = findVisibleRange(result, scroll, 390, overscan);
      const lower = Math.max(0, scroll - overscan);
      const upper = scroll + 390 + overscan;
      const expected = result.items.filter(item => item.top + item.height > lower && item.top < upper);
      assert.deepEqual(result.items.slice(range.start, range.end).map(item => item.id), expected.map(item => item.id));
    }
  }
  assert.deepEqual(findVisibleRange(result, 0, 0), { start: 0, end: 0 });
  assert.deepEqual(findVisibleRange(result, NaN, NaN), { start: 0, end: 0 });
  const empty = prepareParagraphIndex([], 280, STYLE);
  assert.equal(empty.totalHeight, 0);
  assert.deepEqual(findVisibleRange(empty, 0, 390), { start: 0, end: 0 });
});
