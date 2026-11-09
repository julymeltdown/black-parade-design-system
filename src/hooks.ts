import { useCallback, useEffect, useState } from 'react';
import type { Page } from './data';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isNonemptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function hasValidComments(value: unknown) {
  if (!Array.isArray(value)) return false;
  const seen = new Set<string>();
  for (const comment of value) {
    if (!isRecord(comment) || !isNonemptyString(comment.id) || seen.has(comment.id)
      || !isNonemptyString(comment.author) || !isNonemptyString(comment.body)
      || !isFiniteNumber(comment.createdAt)) return false;
    // Replies are appended after their parent. Checking that invariant also
    // rules out cycles, which would otherwise recurse forever in the thread UI.
    if (comment.parentId !== undefined && (typeof comment.parentId !== 'string' || !seen.has(comment.parentId))) return false;
    seen.add(comment.id);
  }
  return true;
}

/** Stored JSON is untyped, even when a TypeScript caller specifies T. */
function validStoredValue(key: string, value: unknown, initial: unknown) {
  switch (key) {
    case 'parade.saved-tracks.v1':
      return Array.isArray(value) && value.every(id => Number.isInteger(id) && id >= 1 && id <= 14);
    case 'parade.saved-posts.v1':
      return Array.isArray(value) && value.every(isNonemptyString);
    case 'parade.grain.v1':
      return isFiniteNumber(value) && value >= 0 && value <= 100;
    case 'parade.votes.v1':
      return isRecord(value) && Object.values(value).every(vote => vote === -1 || vote === 0 || vote === 1);
    case 'parade.posts.v1': {
      if (!Array.isArray(value)) return false;
      const ids = new Set<string>();
      return value.every(post => {
        if (!isRecord(post) || !isNonemptyString(post.id) || ids.has(post.id)
          || !isNonemptyString(post.author) || !isNonemptyString(post.title) || typeof post.body !== 'string'
          || !['Discussion', 'Artwork', 'Live'].includes(String(post.category))
          || !isFiniteNumber(post.votes) || !isFiniteNumber(post.createdAt)
          || (post.image !== undefined && typeof post.image !== 'string')
          || !hasValidComments(post.comments)) return false;
        ids.add(post.id);
        return true;
      });
    }
    default:
      if (Array.isArray(initial)) return Array.isArray(value);
      if (isRecord(initial)) return isRecord(value);
      return value !== null && typeof value === typeof initial;
  }
}

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return initial;
      const parsed: unknown = JSON.parse(saved);
      return validStoredValue(key, parsed, initial) ? parsed as T : initial;
    }
    catch { return initial; }
  });
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); setStorageFailed(false); } catch { setStorageFailed(true); } }, [key, value]);
  return [value, setValue, storageFailed] as const;
}

const validPages: Page[] = ['archive', 'films', 'community', 'system'];
const pageFromHash = (): Page => {
  const value = window.location.hash.slice(1).split('?')[0] as Page;
  return validPages.includes(value) ? value : 'archive';
};
export function usePage() {
  const [page, setPage] = useState<Page>(pageFromHash);
  useEffect(() => {
    const update = () => { setPage(pageFromHash()); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const navigate = useCallback((next: Page) => {
    if (pageFromHash() === next) { setPage(next); window.scrollTo({ top: 0, behavior: 'instant' }); }
    else window.location.hash = next;
  }, []);
  return [page, navigate] as const;
}
