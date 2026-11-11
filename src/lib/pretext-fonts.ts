import { setLocale } from '@chenglou/pretext';
import { invalidateTextCache } from './pretext-layout.ts';

/** Browser font/locale lifecycle shared by the diagram and every text component. */
let revision = 0;
const listeners = new Set<() => void>();
const pending = new Map<string, Promise<void>>();
const faceIds = new WeakMap<FontFace, number>();
let nextFaceId = 0;
let fingerprint: string | undefined;
let stopWatching: (() => void) | undefined;
let language: string | undefined;
let pixelRatio: number | undefined;

/** A font request may keep loading, but must not leave measurement pending forever. */
export const TEXT_FONT_LOAD_TIMEOUT_MS = 8_000;

export function getTextEnvironmentRevision() { return revision; }

function changed(reason: string) {
  invalidateTextCache(reason);
  revision += 1;
  for (const notify of listeners) notify();
}

function fontFingerprint() {
  return Array.from(document.fonts).map(face => {
    if (!faceIds.has(face)) faceIds.set(face, ++nextFaceId);
    return `${faceIds.get(face)}:${face.family}:${face.weight}:${face.style}:${face.stretch}:${face.unicodeRange}:${face.status}`;
  }).sort().join('\n');
}

function synchronizeFonts() {
  if (typeof document === 'undefined' || !document.fonts) return;
  const next = fontFingerprint();
  if (fingerprint === next) return;
  const previous = fingerprint;
  fingerprint = next;
  if (previous !== undefined) changed('font faces or loaded subsets changed');
}

function synchronizeLocale() {
  const next = document.documentElement.lang || undefined;
  if (language === next) return;
  language = next;
  // Pretext's locale is global. Components never set competing local locales.
  setLocale(next);
  changed('document language changed');
}

function watchEnvironment() {
  if (stopWatching || typeof window === 'undefined') return;
  synchronizeFonts();
  synchronizeLocale();
  let resolution: MediaQueryList | undefined;
  const onResolution = () => {
    const currentRatio = window.devicePixelRatio;
    if (pixelRatio !== undefined && pixelRatio !== currentRatio) {
      changed('device pixel ratio changed');
    }
    pixelRatio = currentRatio;
    resolution?.removeEventListener('change', onResolution);
    resolution = window.matchMedia(`(resolution: ${pixelRatio}dppx)`);
    resolution.addEventListener('change', onResolution);
  };
  onResolution();
  const languageObserver = new MutationObserver(synchronizeLocale);
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.fonts?.addEventListener('loadingdone', synchronizeFonts);
  document.fonts?.addEventListener('loadingerror', synchronizeFonts);
  window.addEventListener('resize', onResolution);
  stopWatching = () => {
    languageObserver.disconnect();
    resolution?.removeEventListener('change', onResolution);
    document.fonts?.removeEventListener('loadingdone', synchronizeFonts);
    document.fonts?.removeEventListener('loadingerror', synchronizeFonts);
    window.removeEventListener('resize', onResolution);
    stopWatching = undefined;
  };
}

export function subscribeTextEnvironment(notify: () => void) {
  listeners.add(notify);
  watchEnvironment();
  return () => {
    listeners.delete(notify);
    if (!listeners.size) stopWatching?.();
  };
}

/** Load the actual glyph subsets before any cached Canvas preparation. */
export function ensureTextFonts(fonts: readonly string[], text: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  const names = [...new Set(fonts)].sort();
  if (!names.length) return Promise.resolve();
  const key = JSON.stringify([names, text]);
  const existing = pending.get(key);
  if (existing) return existing;
  const fontSet = document.fonts;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Text fonts did not finish loading within ${TEXT_FONT_LOAD_TIMEOUT_MS / 1000} seconds. The complete text remains available in the native layout while font loading continues.`));
    }, TEXT_FONT_LOAD_TIMEOUT_MS);
  });
  // Defer the request by one microtask so pending is populated before any
  // synchronous font event can ask for the same work. This also converts a
  // synchronous FontFaceSet.load error into a handled promise rejection.
  const loaded = Promise.resolve()
    .then(() => {
      synchronizeFonts();
      return Promise.all(names.map(font => fontSet.load(font, text || ' ')));
    })
    .then(() => { synchronizeFonts(); });
  // FontFaceSet.load has no cancellation API. Keep the real subset requests
  // alive after a timeout: loadingdone (or this late success) can invalidate
  // the environment so native fallbacks retry measurement with loaded fonts.
  // Promise.race observes late rejection too; no detached rejection leaks.
  const work = Promise.race([loaded, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
    if (pending.get(key) === work) pending.delete(key);
  });
  pending.set(key, work);
  return work;
}
