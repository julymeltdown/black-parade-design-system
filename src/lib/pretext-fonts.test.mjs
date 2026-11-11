import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

const originalDescriptors = new Map(['document', 'window', 'MutationObserver', 'setTimeout', 'clearTimeout']
  .map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

class FontSet extends EventTarget {
  faces = [];
  calls = [];
  behavior = () => Promise.resolve(this.faces);
  [Symbol.iterator]() { return this.faces[Symbol.iterator](); }
  load(font, text) {
    this.calls.push({ font, text });
    return this.behavior(font, text);
  }
}

function face(status = 'unloaded') {
  return { family: 'Noto Sans KR Variable', weight: '100 900', style: 'normal', stretch: 'normal', unicodeRange: 'U+AC00-D7A3', status };
}

function makeClock() {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  return {
    timers,
    setTimeout(callback, delay = 0, ...args) {
      const id = ++nextId;
      timers.set(id, { due: now + delay, callback, args });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    tick(milliseconds) {
      now += milliseconds;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.due <= now).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) break;
        timers.delete(next[0]);
        next[1].callback(...next[1].args);
      }
    },
  };
}

let fonts;
let clock;
const unsubscribers = [];

beforeEach(() => {
  fonts = new FontSet();
  clock = makeClock();
  const window = new EventTarget();
  window.devicePixelRatio = 1;
  window.matchMedia = media => Object.assign(new EventTarget(), { media, matches: true });
  Object.defineProperty(globalThis, 'document', { value: { fonts, documentElement: { lang: 'en' } }, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'window', { value: window, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'MutationObserver', { value: class { observe() {} disconnect() {} }, configurable: true, writable: true });
  globalThis.setTimeout = clock.setTimeout;
  globalThis.clearTimeout = clock.clearTimeout;
});

afterEach(() => {
  for (const unsubscribe of unsubscribers.splice(0)) unsubscribe();
  for (const [name, descriptor] of originalDescriptors) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
});

// Font lifecycle only calls public Pretext cache invalidation, so no fake
// Canvas or fabricated glyph widths are needed for these orchestration tests.
const {
  TEXT_FONT_LOAD_TIMEOUT_MS,
  ensureTextFonts,
  getTextEnvironmentRevision,
  subscribeTextEnvironment,
} = await import('./pretext-fonts.ts');
const { getTextCacheStats } = await import('./pretext-layout.ts');
const FONT = '400 18px "Noto Sans KR Variable"';

test('simultaneous requests deduplicate sorted font names and retain actual Korean coverage text', async () => {
  const loading = deferred();
  fonts.behavior = () => loading.promise;
  const source = '한국어 가독성 👩🏽‍🎤';
  const first = ensureTextFonts([FONT, '400 16px Inter', FONT], source);
  const same = ensureTextFonts(['400 16px Inter', FONT], source);
  assert.equal(first, same);
  assert.equal(clock.timers.size, 1);
  await Promise.resolve();
  assert.deepEqual(fonts.calls, [
    { font: '400 16px Inter', text: source },
    { font: FONT, text: source },
  ]);
  loading.resolve([]);
  await first;
  assert.equal(clock.timers.size, 0, 'successful requests clear the timeout');
});

test('loaded face events invalidate the generation once and a retry uses the real loader', async () => {
  const korean = face();
  fonts.faces = [korean];
  const loading = deferred();
  fonts.behavior = () => { korean.status = 'loading'; return loading.promise; };
  let notifications = 0;
  unsubscribers.push(subscribeTextEnvironment(() => { notifications += 1; }));
  const before = getTextEnvironmentRevision();
  const cacheBefore = getTextCacheStats().revision;
  const initialNotifications = notifications;
  const first = ensureTextFonts([FONT], '하나의 문단');
  await Promise.resolve();
  korean.status = 'loaded';
  fonts.dispatchEvent(new Event('loadingdone'));
  loading.resolve([korean]);
  await first;
  assert.equal(getTextEnvironmentRevision(), before + 1);
  assert.equal(getTextCacheStats().revision, cacheBefore + 1);
  assert.equal(notifications, initialNotifications + 1);
  fonts.behavior = () => Promise.resolve([korean]);
  await ensureTextFonts([FONT], '하나의 문단');
  assert.equal(fonts.calls.length, 2, 'resolved requests leave the in-flight map');
  assert.equal(getTextEnvironmentRevision(), before + 1, 'unchanged loaded faces do not invalidate again');
  assert.equal(clock.timers.size, 0);
});

test('rejections and synchronous loader failures clear timers and permit retry', async () => {
  const failure = new Error('A font subset request failed.');
  fonts.behavior = () => Promise.reject(failure);
  await assert.rejects(ensureTextFonts([FONT], '실패 후 다시 시도'), error => error === failure);
  assert.equal(clock.timers.size, 0);
  fonts.behavior = () => { throw new Error('Invalid font shorthand'); };
  await assert.rejects(ensureTextFonts([FONT], '실패 후 다시 시도'), /Invalid font shorthand/u);
  assert.equal(clock.timers.size, 0);
  fonts.behavior = () => Promise.resolve([]);
  await ensureTextFonts([FONT], '실패 후 다시 시도');
  assert.equal(fonts.calls.length, 3);
  assert.equal(clock.timers.size, 0);
});

test('a stalled request times out without marking fonts loaded; late completion can invalidate and retry', async () => {
  const korean = face();
  fonts.faces = [korean];
  const loading = deferred();
  fonts.behavior = () => { korean.status = 'loading'; return loading.promise; };
  unsubscribers.push(subscribeTextEnvironment(() => {}));
  const before = getTextEnvironmentRevision();
  const first = ensureTextFonts([FONT], '늦게 도착한 글꼴');
  const rejected = assert.rejects(first, /within 8 seconds.*native layout/u);
  await Promise.resolve();
  clock.tick(TEXT_FONT_LOAD_TIMEOUT_MS - 1);
  assert.equal(clock.timers.size, 1);
  assert.equal(korean.status, 'loading');
  clock.tick(1);
  await rejected;
  assert.equal(clock.timers.size, 0);
  assert.equal(korean.status, 'loading', 'timeout does not fabricate font readiness');
  assert.equal(getTextEnvironmentRevision(), before, 'timeout alone does not declare a new font generation');

  korean.status = 'loaded';
  fonts.dispatchEvent(new Event('loadingdone'));
  loading.resolve([korean]);
  await Promise.resolve();
  assert.equal(getTextEnvironmentRevision(), before + 1);
  fonts.behavior = () => Promise.resolve([korean]);
  const retry = ensureTextFonts([FONT], '늦게 도착한 글꼴');
  assert.notEqual(retry, first, 'timeout removed the stalled promise from the deduplication map');
  await retry;
  assert.equal(fonts.calls.length, 2);
  assert.equal(clock.timers.size, 0);
  assert.equal(getTextEnvironmentRevision(), before + 1);
});

test('late rejection after timeout is observed and cannot remove a newer in-flight request', async () => {
  const late = deferred();
  const replacement = deferred();
  fonts.behavior = () => late.promise;
  const first = ensureTextFonts([FONT], '계속 읽을 수 있는 문단');
  const timeout = assert.rejects(first, /native layout/u);
  await Promise.resolve();
  clock.tick(TEXT_FONT_LOAD_TIMEOUT_MS);
  await timeout;
  fonts.behavior = () => replacement.promise;
  const retry = ensureTextFonts([FONT], '계속 읽을 수 있는 문단');
  await Promise.resolve();
  late.reject(new Error('Late network rejection'));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(ensureTextFonts([FONT], '계속 읽을 수 있는 문단'), retry);
  assert.equal(clock.timers.size, 1);
  replacement.resolve([]);
  await retry;
  assert.equal(clock.timers.size, 0);
});

test('server and empty-font callers resolve without creating a timer or font request', async () => {
  await ensureTextFonts([], '원문');
  assert.equal(fonts.calls.length, 0);
  assert.equal(clock.timers.size, 0);
  delete globalThis.document;
  await ensureTextFonts([FONT], '원문');
  assert.equal(clock.timers.size, 0);
});
