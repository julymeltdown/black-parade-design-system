import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bookmark, Check, Component, Disc3, Film, MessageSquare, Search } from 'lucide-react';
import { Button, Dialog, EmptyState, IconButton, SearchField, Toast } from './design-system';
import { films, initialPosts, tracks } from './data';
import type { Page, Post } from './data';
import { usePage, usePersistentState } from './hooks';
import { ArchivePage } from './pages/Archive';
import { FilmsPage } from './pages/Films';
import { CommunityPage } from './pages/Community';
import { SystemPage } from './pages/System';
import { VideoPlayer } from './components/VideoPlayer';

const navigation = [
  { id: 'archive' as Page, label: 'The record', short: 'Record', icon: Disc3, number: '01' },
  { id: 'films' as Page, label: 'The films', short: 'Films', icon: Film, number: '02' },
  { id: 'community' as Page, label: 'The people', short: 'People', icon: MessageSquare, number: '03' },
  { id: 'system' as Page, label: 'Design system', short: 'System', icon: Component, number: '04' },
];

export function ParadeMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2v36M4.4 11l31.2 18M4.4 29l31.2-18" stroke="currentColor" strokeWidth="3"/><circle cx="20" cy="20" r="5" fill="currentColor"/></svg>;
}

export default function App() {
  const [page, navigate] = usePage();
  const [savedTracks, setSavedTracks, trackStorageFailed] = usePersistentState<number[]>('parade.saved-tracks.v1', []);
  const [savedPosts, setSavedPosts, savedPostStorageFailed] = usePersistentState<string[]>('parade.saved-posts.v1', []);
  const [posts, setPosts, postStorageFailed] = usePersistentState<Post[]>('parade.posts.v1', initialPosts);
  const [votes, setVotes, voteStorageFailed] = usePersistentState<Record<string, number>>('parade.votes.v1', {});
  const [grain, setGrain] = usePersistentState<number>('parade.grain.v1', 38);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { document.documentElement.style.setProperty('--grain-opacity', String(grain / 100)); }, [grain]);
  useEffect(() => {
    document.title = `${navigation.find(item => item.id === page)?.label} — The Parade Archive`;
  }, [page]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches('input,textarea,select') || target.isContentEditable) return;
      if (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); }, [toast]);

  const toggleTrack = (id: number) => {
    const exists = savedTracks.includes(id);
    setSavedTracks(current => exists ? current.filter(value => value !== id) : [...current, id]);
    setToast(exists ? 'Track removed from your collection.' : 'Track saved to your collection.');
  };
  const togglePost = (id: string) => {
    const exists = savedPosts.includes(id);
    setSavedPosts(current => exists ? current.filter(value => value !== id) : [...current, id]);
    setToast(exists ? 'Conversation removed from your collection.' : 'Conversation saved to your collection.');
  };
  const watch = (id: string) => setVideo(id);
  const openTrack = (id: number) => {
    setSearchOpen(false); setCollectionOpen(false); navigate('archive'); setSelectedTrack(id);
    setTimeout(() => document.getElementById(`track-${id}`)?.scrollIntoView({ behavior: 'instant', block: 'center' }), 80);
  };
  const currentFilm = films.find(item => item.id === video);
  const normalized = search.trim().toLowerCase();
  const matchingTracks = tracks.filter(track => `${track.title} ${track.mood}`.toLowerCase().includes(normalized));
  const matchingFilms = films.filter(film => film.title.toLowerCase().includes(normalized));
  const matchingPosts = posts.filter(post => `${post.title} ${post.body}`.toLowerCase().includes(normalized));
  const hasSearchResults = matchingTracks.length + matchingFilms.length + matchingPosts.length > 0;
  const storageFailed = trackStorageFailed || savedPostStorageFailed || postStorageFailed || voteStorageFailed;

  return <div className={`app-shell ${video ? 'has-player' : ''}`}>
    <a href="#main-content" className="skip-link" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
    <div className="app-main">
      <header className="masthead">
        <a className="masthead-brand" href="#archive" aria-label="The Parade Archive home"><ParadeMark/><span>THE PARADE<br/>ARCHIVE</span></a>
        <nav className="masthead-links" aria-label="Archive pages">{navigation.map(item => <a key={item.id} href={`#${item.id}`} aria-current={page === item.id ? 'page' : undefined}>{item.short}</a>)}</nav>
        <div className="masthead-tools"><button className="mobile-index-button" onClick={() => setIndexOpen(true)} aria-haspopup="dialog">Index <span>+</span></button><IconButton label="Search the archive" onClick={() => setSearchOpen(true)}><Search size={18}/></IconButton><IconButton label="Open your collection" onClick={() => setCollectionOpen(true)} className="header-bookmark"><Bookmark size={18}/>{savedTracks.length + savedPosts.length > 0 && <span className="saved-indicator"/>}</IconButton></div>
      </header>

      <main id="main-content" tabIndex={-1}>
        {page === 'archive' && <ArchivePage saved={savedTracks} toggleSaved={toggleTrack} selected={selectedTrack} select={setSelectedTrack} watch={watch} navigate={navigate}/>}
        {page === 'films' && <FilmsPage watch={watch}/>}
        {page === 'community' && <CommunityPage posts={posts} setPosts={setPosts} saved={savedPosts} toggleSaved={togglePost} votes={votes} setVotes={setVotes} notify={setToast}/>}
        {page === 'system' && <SystemPage grain={grain} setGrain={setGrain} notify={setToast}/>}
      </main>
      <footer className="site-footer"><div><ParadeMark/><span>THE PARADE ARCHIVE</span></div><p>An independent fan-made archive.</p><button className="text-action" onClick={() => setIndexOpen(true)}>Index <span>+</span></button><a href="#system">Made of ink & paper <ArrowUpRight size={14}/></a></footer>
    </div>

    <Dialog open={indexOpen} onClose={() => setIndexOpen(false)} title="The index."><nav className="index-links" aria-label="Table of contents">{navigation.map(item => <a key={item.id} href={`#${item.id}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => setIndexOpen(false)}><span>{item.number}</span><strong>{item.label}</strong><ArrowUpRight size={20}/></a>)}</nav><p className="index-signoff">For the living. For the ones who remember.</p></Dialog>

    <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} title="Find your way.">
      <SearchField value={search} onChange={setSearch} label="Search tracks, films and conversations" placeholder="Tracks, films, conversations…"/>
      <div className="search-results" aria-live="polite">
        {!hasSearchResults && <EmptyState title="Nothing here, yet." description={`No results for “${search}”. Try a song title or a different word.`}/>}
        {matchingTracks.length > 0 && <section><h3 className="micro-label">THE RECORD · {matchingTracks.length}</h3>{matchingTracks.map(track => <button className="search-result" key={track.id} onClick={() => openTrack(track.id)}><Disc3 size={17}/><span>{track.title}<small>{track.mood}</small></span><ArrowRight size={16}/></button>)}</section>}
        {matchingFilms.length > 0 && <section><h3 className="micro-label">THE FILMS · {matchingFilms.length}</h3>{matchingFilms.map(film => <button className="search-result" key={film.id} onClick={() => { setSearchOpen(false); navigate('films'); watch(film.id); }}><Film size={17}/><span>{film.title}<small>Official music video</small></span><ArrowRight size={16}/></button>)}</section>}
        {matchingPosts.length > 0 && <section><h3 className="micro-label">THE PEOPLE · {matchingPosts.length}</h3>{matchingPosts.map(post => <button className="search-result" key={post.id} onClick={() => { setSearchOpen(false); navigate('community'); setTimeout(() => document.getElementById(`post-${post.id}`)?.scrollIntoView({ block: 'center' }), 80); }}><MessageSquare size={17}/><span>{post.title}<small>{post.category}</small></span><ArrowRight size={16}/></button>)}</section>}
      </div>
    </Dialog>

    <Dialog open={collectionOpen} onClose={() => setCollectionOpen(false)} title="Your collection.">
      <p className="dialog-intro">A small place for the things you want to come back to. Saved in this browser.</p>
      {!savedTracks.length && !savedPosts.length && <EmptyState title="Keep something close." description="Use the bookmark beside a track or conversation to save it here." action={<Button variant="secondary" onClick={() => { setCollectionOpen(false); navigate('archive'); }}>Explore the record <ArrowRight size={17}/></Button>}/>}
      {savedTracks.length > 0 && <section><h3 className="micro-label">TRACKS</h3>{tracks.filter(track => savedTracks.includes(track.id)).map(track => <div className="collection-row" key={track.id}><button className="search-result" onClick={() => openTrack(track.id)}><Disc3 size={17}/><span>{track.title}</span><ArrowRight size={17}/></button><IconButton label={`Unsave ${track.title}`} onClick={() => toggleTrack(track.id)}><Check size={18}/></IconButton></div>)}</section>}
      {savedPosts.length > 0 && <section><h3 className="micro-label">CONVERSATIONS</h3>{posts.filter(post => savedPosts.includes(post.id)).map(post => <div className="collection-row" key={post.id}><button className="search-result" onClick={() => { setCollectionOpen(false); navigate('community'); }}><MessageSquare size={17}/><span>{post.title}</span><ArrowRight size={17}/></button><IconButton label={`Unsave ${post.title}`} onClick={() => togglePost(post.id)}><Check size={18}/></IconButton></div>)}</section>}
    </Dialog>

    <VideoPlayer video={currentFilm ?? null} onClose={() => setVideo(null)}/>
    {storageFailed && <p className="storage-notice" role="status">Browser storage is unavailable. Your changes will last for this visit only.</p>}
    {toast && <Toast message={toast} onDismiss={() => setToast('')}/>}
  </div>;
}
