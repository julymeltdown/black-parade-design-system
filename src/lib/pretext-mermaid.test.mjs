import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';

// Real font metrics, not a character-count approximation. Browser SVG checks
// remain separate: Skia's Node metrics do not certify every browser engine.
const inter = fileURLToPath(new URL('../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', import.meta.url));
assert.ok(GlobalFonts.registerFromPath(inter, 'Inter'), 'Bundled Inter font must load');
globalThis.OffscreenCanvas = class {
  constructor(width, height) { this.canvas = createCanvas(width, height); }
  getContext(type) { return this.canvas.getContext(type); }
};
const { CHAPTERS, NARRATIVE_EDGES, buildMermaidPlan, escapeMermaidLabel, projectPassage } = await import('./pretext-mermaid.ts');
const plain = value => value.replace(/\s/g, '');

test('full-passage layouts preserve every word and fit their Pretext budgets at phone and desktop widths', () => {
  for (const width of [280, 320, 390, 760]) {
    const plan = buildMermaidPlan(CHAPTERS, width);
    assert.equal(plan.nodes.length, 5);
    assert.equal(plan.direction, width >= 720 ? 'LR' : 'TB');
    for (const node of plan.nodes) {
      assert.equal(plain(node.lines.map(line => line.text).join('')), plain(`${node.title}${node.body}`), `${node.id}: no words lost`);
      assert.ok(node.lines.every(line => line.width <= plan.labelWidth + .5), `${node.id}: no line exceeds ${plan.labelWidth}px`);
      assert.equal(node.predictedHeight, node.lineCount * 17.6);
      assert.ok(plan.minNodeWidth >= node.maxLineWidth);
    }
  }
});

test('phone width changes alter real line breaks rather than scaling an unchanged SVG', () => {
  const narrow = buildMermaidPlan(CHAPTERS, 320);
  const wide = buildMermaidPlan(CHAPTERS, 390);
  assert.notEqual(narrow.source, wide.source);
  assert.ok(narrow.nodes.reduce((sum, node) => sum + node.lineCount, 0) > wide.nodes.reduce((sum, node) => sum + node.lineCount, 0));
  assert.equal(narrow.labelWidth, 116);
  assert.equal(wide.labelWidth, 151);
});

test('compact labels use three measured body lines and an explicit ellipsis from the same passage', () => {
  const excerpts = buildMermaidPlan(CHAPTERS, 320, true, 'excerpt');
  const wider = buildMermaidPlan(CHAPTERS, 390, true, 'excerpt');
  const full = buildMermaidPlan(CHAPTERS, 320, true, 'full');
  for (const [index, node] of excerpts.nodes.entries()) {
    assert.ok(node.bodyLineCount <= 3, `${node.id}: at most three measured body lines`);
    assert.ok(node.displayedBody.endsWith('…'));
    assert.equal(node.truncated, true);
    assert.ok(node.body.startsWith(node.displayedBody.slice(0, -1).trimEnd()), `${node.id}: literal source prefix`);
    assert.equal(plain(node.lines.map(line => line.text).join('')), plain(`${node.title}${node.displayedBody}`));
    assert.ok(node.lines.every(line => line.width <= excerpts.labelWidth + .5), `${node.id}: ellipsis fits too`);
    assert.ok(node.lineCount < full.nodes[index].lineCount);
  }
  assert.ok(wider.nodes.some((node, index) => node.displayedBody.length > excerpts.nodes[index].displayedBody.length), 'a wider budget retains more actual text');
  assert.equal(projectPassage('A short passage.', 'excerpt'), 'A short passage.');
  assert.equal(excerpts.config.layout, 'dagre');
  assert.equal(excerpts.config.look, 'classic');
});

test('resizing reuses preparations; editing one passage prepares only that passage', () => {
  const unique = CHAPTERS.map(chapter => ({ ...chapter, body: `${chapter.body} Cache-proof specimen.` }));
  const first = buildMermaidPlan(unique, 320);
  const resized = buildMermaidPlan(unique, 390);
  assert.ok(first.preparedThisPass >= 5, 'five previously unseen bodies are prepared');
  assert.equal(resized.preparedThisPass, 0);
  const edited = unique.map(chapter => chapter.id === 'loss' ? { ...chapter, body: `${chapter.body} One added sentence.` } : chapter);
  assert.equal(buildMermaidPlan(edited, 390).preparedThisPass, 1);
});

test('excerpt resizing and full/excerpt switching reuse the same source preparations', () => {
  const unique = CHAPTERS.map(chapter => ({ ...chapter, body: `${chapter.body} Measured excerpt cache specimen.` }));
  buildMermaidPlan(unique, 760, true, 'excerpt');
  for (const width of [320, 390, 280, 760]) {
    assert.equal(buildMermaidPlan(unique, width, true, 'excerpt').preparedThisPass, 0);
    assert.equal(buildMermaidPlan(unique, width, true, 'full').preparedThisPass, 0);
  }
  const edited = unique.map(chapter => chapter.id === 'memory' ? { ...chapter, body: `${chapter.body} One changed source.` } : chapter);
  assert.equal(buildMermaidPlan(edited, 390, true, 'excerpt').preparedThisPass, 1);
});

test('editor content cannot escape its quoted Mermaid label', () => {
  const hostile = '"] --> injected["<script>alert(1)</script> & #quot; `\\\n';
  const encoded = escapeMermaidLabel(hostile);
  assert.ok(!encoded.includes('"'));
  assert.ok(!encoded.includes('<script>'));
  assert.ok(!encoded.includes('\n'));
  assert.ok(encoded.includes('#38;'));
  assert.ok(encoded.includes('#35;quot;'));
  const edited = CHAPTERS.map(chapter => chapter.id === 'memory' ? { ...chapter, body: hostile } : chapter);
  const plan = buildMermaidPlan(edited, 390);
  assert.equal((plan.source.match(/^  (curtain|memory|loss|theatre|resolve)\["/gm) || []).length, 5);
  assert.ok(!plan.source.includes('\n  injected'));
});

test('topology is the same in both layouts and the unwrapped comparison', () => {
  for (const enabled of [true, false]) {
    for (const width of [320, 760]) {
      const plan = buildMermaidPlan(CHAPTERS, width, enabled);
      for (const [from, to] of NARRATIVE_EDGES) assert.ok(plan.source.includes(`${from} --> ${to}`));
      assert.equal((plan.source.match(/ --> /g) || []).length, 5);
      assert.equal(plan.config.securityLevel, 'strict');
      assert.equal(plan.config.htmlLabels, false);
      assert.equal(plan.config.flowchart.wrappingWidth, 10000);
      if (!enabled) assert.equal(plan.minNodeWidth, 0);
    }
  }
});
