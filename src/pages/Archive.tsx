import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Bookmark, ChevronDown, Clock3, Eye, Play, Waypoints } from 'lucide-react';
import { Button, Dialog, EmptyState, IconButton, SectionHeading, TabBar } from '../design-system';
import { tracks } from '../data';
import type { Page } from '../data';
import { ReadingPage } from './Reading';
import { CHAPTERS, type ChapterId } from '../lib/pretext-mermaid';

interface Props { saved: number[]; toggleSaved: (id: number) => void; selected: number | null; select: (id: number | null) => void; watch: (id: string) => void; navigate: (page: Page) => void; }
export function ArchivePage({ saved, toggleSaved, selected, select, watch, navigate }: Props) {
  const [filter, setFilter] = useState('all');
  const [artOpen, setArtOpen] = useState(false);
  const [focusedChapter, setFocusedChapter] = useState<ChapterId>('curtain');
  const chapterForTrack = (id: number) => CHAPTERS.find(chapter => chapter.trackIds.includes(id))?.id ?? 'curtain';
  const activeChapter = selected === null ? focusedChapter : chapterForTrack(selected);
  const chooseTrack = (id: number | null) => {
    select(id);
    if (id !== null) setFocusedChapter(chapterForTrack(id));
  };
  const chooseChapter = (id: ChapterId) => {
    setFocusedChapter(id);
    const chapter = CHAPTERS.find(item => item.id === id)!;
    if (selected === null || !chapter.trackIds.includes(selected)) select(chapter.trackIds[0]);
  };
  const showInMap = (id: number) => {
    chooseTrack(id);
    const heading = document.getElementById('reading-title');
    heading?.scrollIntoView({ block: 'start', behavior: 'auto' });
    heading?.focus({ preventScroll: true });
  };
  const shown = tracks.filter(track => filter === 'all' || saved.includes(track.id));

  return <div className="page archive-page">
    <section className="album-hero" aria-labelledby="album-title">
      <div className="hero-copy"><p className="micro-label hero-eyebrow"><span>THE THIRD STUDIO ALBUM</span><span>2006</span></p>
        <h1 id="album-title"><span className="title-first">THE BLACK</span><span className="title-second">PARADE<span className="title-period">.</span></span></h1>
        <p className="hero-subtitle">A record about death.<br/>A reason to feel alive.</p>
        <p className="hero-description">The songs, the stories, and the people<br className="desktop-break"/> who carried them with them.</p>
        <div className="hero-actions"><Button onClick={() => watch('RRKJiM9Njr8')}><Play size={16} fill="currentColor"/>Watch the film</Button><button className="text-action" onClick={() => document.getElementById('the-record')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Explore the record <ArrowDown size={17}/></button></div>
        <div className="hero-metadata"><span>MY CHEMICAL ROMANCE</span><i/><span>REPRISE RECORDS</span></div>
      </div>
      <div className="hero-art"><img src="/assets/parade-artwork.png" alt="A fantastical procession of skeletal marching figures from The Black Parade artwork" fetchPriority="high" width="800" height="1200"/><button onClick={() => setArtOpen(true)} className="art-expand" aria-label="View the full parade artwork"><Eye size={16}/><span>A closer look</span><ArrowUpRight size={16}/></button></div>
      <span className="hero-edition" aria-hidden="true">NO. 003 — THE BLACK PARADE</span>
    </section>

    <ReadingPage watch={watch} selectedId={activeChapter} onSelect={chooseChapter} embedded/>

    <div className="record-layout" id="the-record">
      <section className="track-section" aria-labelledby="record-heading">
        <SectionHeading eyebrow="SIDE A / SIDE B" title="The record." id="record-heading" action={<span className="section-count">13 TRACKS + A SECRET</span>}/>
        <div className="track-toolbar"><TabBar label="Filter tracks" items={[{ id: 'all', label: 'All tracks', count: 14 }, { id: 'saved', label: 'Saved', count: saved.length }]} value={filter} onChange={setFilter}/><span className="track-runtime"><Clock3 size={14}/>51 MIN</span></div>
        <div className="track-list">{shown.map(track => <article className={`track-item ${selected === track.id ? 'is-open' : ''}`} id={`track-${track.id}`} key={track.id}>
          <div className="track-row"><button className="track-select" aria-expanded={selected === track.id} aria-controls={`track-note-${track.id}`} onClick={() => chooseTrack(selected === track.id ? null : track.id)}><span className="track-number">{String(track.id).padStart(2, '0')}</span><span className="track-name"><strong>{track.title}{track.hidden && <span className="hidden-track-label">HIDDEN TRACK</span>}</strong><span>{track.mood}</span></span><span className="track-duration">{track.duration}</span><ChevronDown size={16} className="track-chevron"/></button><IconButton label={`${saved.includes(track.id) ? 'Unsave' : 'Save'} ${track.title}`} aria-pressed={saved.includes(track.id)} onClick={() => toggleSaved(track.id)}>{saved.includes(track.id) ? <Bookmark size={17} fill="currentColor"/> : <Bookmark size={17}/>}</IconButton></div>
          <div className="track-note" id={`track-note-${track.id}`} hidden={selected !== track.id}><p>{track.note}</p><div className="track-note-actions"><button className="text-action" aria-controls="reading-map-content" onClick={() => showInMap(track.id)}><Waypoints size={16}/>Show in the reading map</button><a className="text-action" href={`https://open.spotify.com/search/${encodeURIComponent(`My Chemical Romance ${track.title}`)}`} target="_blank" rel="noreferrer">Spotify <ArrowUpRight size={16}/></a>{track.video && <button className="text-action" onClick={() => watch(track.video!)}><Play size={14}/>Video</button>}</div></div>
        </article>)}</div>
        {!shown.length && <EmptyState title="Your side of the record." description="Save a track with its bookmark and it will appear here." action={<Button variant="secondary" onClick={() => setFilter('all')}>Show all tracks</Button>}/>}
        <p className="track-footnote">Listening notes are editorial interpretations. Track timings refer to the original album edition.</p>
      </section>
      <aside className="record-context">
        <div className="context-heading"><span className="micro-label">A NOTE FROM THE ARCHIVE</span><span aria-hidden="true">✳</span></div>
        <h2>Some records<br/>become a place.</h2>
        <p>A patient, a memory, a procession. The third My Chemical Romance album builds a world around mortality, remembrance, and the will to keep going.</p>
        <p>Start with a song. Stay for everything it left behind.</p>
        <a className="text-action" href="https://music.apple.com/us/album/the-black-parade/1156310650" target="_blank" rel="noreferrer">Listen to the album <ArrowUpRight size={16}/></a>
        <figure className="context-image"><img src="/assets/the-parade-band.png" alt="My Chemical Romance in black marching uniforms amid a ruined landscape" loading="lazy" width="1280" height="720"/><figcaption>THE BAND. THE UNIFORMS. THE WORLD.</figcaption></figure>
        <div className="context-credits"><span className="micro-label">THE RECORD IN CONTEXT</span><a href="https://mychemicalromance.warnerrecords.com/products/the-black-parade-20th-anniversary-edition-deluxe-digital-album" target="_blank" rel="noreferrer">Album concept & official edition <ArrowUpRight size={15}/></a><button className="text-action" onClick={() => navigate('system')}>Inside the design system <ArrowRight size={15}/></button></div>
      </aside>
    </div>

    <section className="archive-crosslinks" aria-label="Continue exploring">
      <button className="film-crosslink" onClick={() => navigate('films')}><img src="/assets/parade-film.png" alt="The Black Parade procession from the music video" loading="lazy" width="799" height="472"/><span className="crosslink-caption"><span className="micro-label">02 / THE FILMS</span><strong>Enter the procession.</strong><span className="crosslink-arrow"><ArrowUpRight size={24}/></span></span></button>
      <button className="people-crosslink" onClick={() => navigate('community')}><span className="micro-label">03 / THE PEOPLE</span><span className="people-crosslink-mark" aria-hidden="true">✳</span><strong>You were never<br/>the only one.</strong><span>Find your people. Leave a little of yourself. <ArrowRight size={20}/></span></button>
    </section>

    <Dialog open={artOpen} onClose={() => setArtOpen(false)} title="The world of the parade." wide><figure className="artwork-detail"><img src="/assets/parade-artwork.png" width="800" height="1200" alt="Full supplied artwork of fantastical and skeletal characters in a parade"/><figcaption>The supplied artwork, in its original color. Its worn paper, ink and elongated figures inform this archive’s visual language.</figcaption></figure></Dialog>
  </div>;
}
