import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { ensureTextFonts, getTextEnvironmentRevision, subscribeTextEnvironment } from '../lib/pretext-fonts';
import type { TextStyle } from '../lib/pretext-layout';

export const READING_TEXT: TextStyle = { font: '400 18px "Source Serif 4", "Noto Sans KR Variable", serif', lineHeight: 30 };
export const INTERFACE_TEXT: TextStyle = { font: '400 16px Inter, "Noto Sans KR Variable", sans-serif', lineHeight: 26 };
export const DISPLAY_TEXT: TextStyle = { font: '700 40px "Bodoni Moda", "Noto Sans KR Variable", serif', lineHeight: 46 };

/** Observe the content box once per resize, never measure a rendered text node. */
export function useContentWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => {
      const next = Math.floor((entries[0]?.contentRect.width ?? 0) * 4) / 4;
      setWidth(previous => next > 0 && Number.isFinite(next) ? (previous === next ? previous : next) : 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/** Actual text is passed to FontFaceSet.load so Unicode-range subsets are requested. */
export function useTextEnvironment(text: string, fonts: readonly string[]) {
  const revision = useSyncExternalStore(subscribeTextEnvironment, getTextEnvironmentRevision, () => 0);
  const fontKey = JSON.stringify(fonts);
  const key = `${fontKey}\u0000${text}`;
  const [state, setState] = useState({ key: '', revision: -1, ready: false, error: '' });
  useEffect(() => {
    let current = true;
    ensureTextFonts(JSON.parse(fontKey) as string[], text).then(() => {
      if (current) setState({ key, revision: getTextEnvironmentRevision(), ready: true, error: '' });
    }).catch(reason => {
      if (current) setState({ key, revision, ready: false, error: reason instanceof Error ? reason.message : 'Text measurement is unavailable.' });
    });
    return () => { current = false; };
  }, [fontKey, text, key, revision]);
  return { ready: state.ready && state.key === key && state.revision === revision, error: state.key === key ? state.error : '', revision };
}

export function useStableTextStyle(style: TextStyle): TextStyle {
  const key = JSON.stringify(style);
  return useMemo(() => JSON.parse(key) as TextStyle, [key]);
}

const fontLonghandCache = new Map<string, CSSProperties>();

/**
 * Use the CSS parser without mounting or measuring an element. Keeping the
 * shorthand out of React's style object avoids resetting sibling longhands
 * when the reading voice changes. Quoted family lists stay intact.
 */
export function fontShorthandToCss(font: string): CSSProperties {
  const cached = fontLonghandCache.get(font);
  if (cached) return cached;
  let result: CSSProperties | undefined;
  if (typeof document !== 'undefined') {
    const parsed = document.createElement('span').style;
    parsed.font = font;
    if (parsed.fontSize && parsed.fontFamily) {
      result = {
        fontFamily: parsed.fontFamily,
        fontSize: parsed.fontSize,
        fontStyle: parsed.fontStyle || 'normal',
        fontWeight: parsed.fontWeight || 'normal',
        fontStretch: parsed.fontStretch || 'normal',
        fontVariant: parsed.fontVariant || 'normal',
      };
    }
  }
  if (!result) {
    // SSR supports this library's explicit px-sized font contract. The family
    // suffix is captured as one CSS value, never split on spaces or commas.
    const match = font.trim().match(/^(?:(.*?)\s+)?((?:\d+(?:\.\d*)?|\.\d+)px)(?:\s*\/\s*(?:normal|(?:\d+(?:\.\d*)?|\.\d+)(?:px|em|rem|%)?))?\s+(.+)$/u);
    const prefix = match?.[1]?.trim() ?? '';
    const weight = prefix.match(/(?:^|\s)(bold(?:er)?|lighter|[1-9]\d{0,2}|1000)(?=\s|$)/u)?.[1] ?? 'normal';
    const fontStyle = prefix.match(/(?:^|\s)(italic|oblique(?:\s+-?(?:\d+(?:\.\d*)?|\.\d+)deg)?)(?=\s|$)/u)?.[1] ?? 'normal';
    const stretch = prefix.match(/(?:^|\s)((?:ultra-|extra-|semi-)?(?:condensed|expanded)|(?:\d+(?:\.\d*)?|\.\d+)%)(?=\s|$)/u)?.[1] ?? 'normal';
    result = {
      fontFamily: match?.[3] ?? 'inherit',
      fontSize: match?.[2] ?? 'inherit',
      fontStyle,
      fontWeight: weight,
      fontStretch: stretch,
      fontVariant: /(?:^|\s)small-caps(?=\s|$)/u.test(prefix) ? 'small-caps' : 'normal',
    };
  }
  result.fontKerning = 'auto';
  result.fontFeatureSettings = 'normal';
  result.fontVariationSettings = 'normal';
  // A small cache is enough for display/body/code variants, without retaining
  // an unbounded set of values supplied by consumers.
  if (fontLonghandCache.size >= 32) fontLonghandCache.delete(fontLonghandCache.keys().next().value!);
  fontLonghandCache.set(font, result);
  return result;
}

/** The same typography contract must reach Canvas and the painted DOM. */
export function textStyleToCss(style: TextStyle): CSSProperties {
  return {
    ...fontShorthandToCss(style.font),
    lineHeight: `${style.lineHeight}px`,
    letterSpacing: `${style.letterSpacing ?? 0}px`,
    whiteSpace: style.whiteSpace ?? 'normal',
    wordBreak: style.wordBreak ?? 'normal',
    overflowWrap: 'break-word',
    wordSpacing: '0px',
    fontKerning: 'auto',
    fontFeatureSettings: 'normal',
    fontVariationSettings: 'normal',
    textTransform: 'none',
    textWrap: 'wrap',
  };
}

/** Pretext supplies line breaks, not bidi visual ordering. Preserve native paragraphs. */
export function needsNativeBidi(text: string) {
  return /[\p{Script=Arabic}\p{Script=Hebrew}\u202a-\u202e\u2066-\u2069]/u.test(text);
}

export function attemptLayout<T>(ready: boolean, create: () => T): { plan: T | null; error: string } {
  if (!ready) return { plan: null, error: '' };
  try { return { plan: create(), error: '' }; }
  catch (reason) { return { plan: null, error: reason instanceof Error ? reason.message : 'Text measurement is unavailable.' }; }
}
