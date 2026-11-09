import { ArrowUpRight, Play } from 'lucide-react';
import { MediaCard, SectionHeading } from '../design-system';
import { films } from '../data';

export function FilmsPage({ watch }: { watch: (id: string) => void }) {
  const featured = films[0];
  return <div className="page films-page"><header className="page-heading"><p className="micro-label">02 / THE FILMS</p><h1>A world in motion.</h1><p>The record has a face. Step inside the procession.</p></header>
    <section className="featured-film" aria-labelledby="featured-film-title"><button className="featured-film-play" onClick={() => watch(featured.id)} aria-label={`Play ${featured.title}`}><img src={featured.image} width="799" height="472" alt="Gerard Way leading the Black Parade procession"/><span className="featured-film-play-icon"><Play size={32} fill="currentColor"/></span><span className="featured-film-time">{featured.duration}</span></button><div className="featured-film-detail"><p className="micro-label">THE PROCESSION / 2006</p><div className="film-title-line"><h2 id="featured-film-title">{featured.title}</h2><a href={`https://www.youtube.com/watch?v=${featured.id}`} target="_blank" rel="noreferrer" aria-label={`Open ${featured.title} on YouTube`} title="Open on YouTube"><ArrowUpRight size={20}/></a></div><p>{featured.description}</p><button className="text-action" onClick={() => watch(featured.id)}><Play size={16}/>Watch the film</button></div></section>
    <section className="film-grid-section"><SectionHeading eyebrow="MORE FROM THE RECORD" title="Other chapters."/><div className="film-grid">{films.slice(1).map(film => <div key={film.id}><MediaCard title={film.title} subtitle="Official music video · archive cover" image={film.image} duration={film.duration} onClick={() => watch(film.id)}/><p className="film-grid-description">{film.description}</p></div>)}</div><p className="track-footnote">Videos open from the official My Chemical Romance channel. These tiles use supplied archive imagery; playback availability depends on YouTube.</p></section>
    <div className="film-coda"><span aria-hidden="true">✳</span><p>Some worlds stay with you<br/>long after the screen goes dark.</p></div>
  </div>;
}
