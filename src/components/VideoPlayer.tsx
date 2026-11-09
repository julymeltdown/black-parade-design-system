/**
 * Native iframe structure adapted from saddamarbaa's MIT-licensed YouTube clone.
 * See docs/video-provenance.md and docs/vendor/youtube-clone-LICENSE.txt.
 * The docking state and controls below are specific to The Parade Archive.
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Maximize2, Minimize2, MoveHorizontal, X } from 'lucide-react';
import type { Film } from '../data';
import './video-player.css';

export interface VideoPlayerProps {
  video: Film | null;
  onClose: () => void;
}

/** A persistent in-page miniplayer. This does not claim native browser PiP. */
export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const playerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const previousVideo = useRef<string | null>(null);

  useEffect(() => {
    if (video && previousVideo.current === null) {
      triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setExpanded(false);
    }
    previousVideo.current = video?.id ?? null;
  }, [video?.id]);

  const closePlayer = () => {
    onClose();
    if (triggerRef.current?.isConnected) triggerRef.current.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!video) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // A modal dialog (native or headless) keeps ownership of Escape.
      const modal = document.querySelector('dialog[open], [role="dialog"][data-state="open"], [role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]');
      if (event.defaultPrevented || event.key !== 'Escape' || modal) return;
      event.preventDefault();
      if (expanded) setExpanded(false);
      else closePlayer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [video?.id, expanded, onClose]);

  useEffect(() => {
    if (!video || !playerRef.current) return;
    const player = playerRef.current;
    const root = document.documentElement;
    const updateSpace = () => root.style.setProperty('--active-player-height', `${Math.ceil(player.getBoundingClientRect().height)}px`);
    updateSpace();
    const observer = new ResizeObserver(updateSpace);
    observer.observe(player);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--active-player-height');
    };
  }, [video?.id]);

  if (!video) return null;

  return (
    <section
      ref={playerRef}
      className={`archive-player ${expanded ? 'archive-player--expanded' : ''} archive-player--${side}`}
      aria-label={`Video player: ${video.title}`}
      data-video-id={video.id}
    >
      <div className="archive-player__media">
        {/* Keep this node and its src stable when resizing or changing pages. */}
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&playsinline=1&rel=0&controls=1`}
          title={`${video.title} — official music video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="archive-player__actions" role="group" aria-label="Video window controls">
        <a
          className="archive-player__control"
          href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${video.title} on YouTube`}
          title="Open on YouTube"
        ><ArrowUpRight size={18} aria-hidden="true" /></a>
        <button
          className="archive-player__control archive-player__move"
          type="button"
          onClick={() => setSide(side === 'right' ? 'left' : 'right')}
          aria-label={`Move video to the ${side === 'right' ? 'left' : 'right'}`}
          title={`Move ${side === 'right' ? 'left' : 'right'}`}
        ><MoveHorizontal size={17} aria-hidden="true" /></button>
        <button
          className="archive-player__control"
          type="button"
          onClick={() => setExpanded(value => !value)}
          aria-label={expanded ? 'Minimize video' : 'Expand video'}
          aria-pressed={expanded}
          title={expanded ? 'Minimize' : 'Expand'}
        >{expanded ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}</button>
        <button
          className="archive-player__control"
          type="button"
          onClick={closePlayer}
          aria-label="Close video"
          title="Close video"
        ><X size={20} aria-hidden="true" /></button>
      </div>
    </section>
  );
}
