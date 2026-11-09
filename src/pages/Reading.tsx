import { useState } from 'react';
import { PretextMermaid } from '../components/PretextMermaid';
import { CHAPTERS, type ChapterId } from '../lib/pretext-mermaid';
import { tracks } from '../data';

const ALBUM_SOURCE = 'https://music.apple.com/us/album/the-black-parade/1156310650';
const CONCEPT_SOURCE = 'https://mychemicalromance.warnerrecords.com/products/the-black-parade-20th-anniversary-edition-deluxe-digital-album';

export type ReadingPageProps = {
  watch: (id: string) => void;
  selectedId?: ChapterId;
  onSelect?: (id: ChapterId) => void;
  embedded?: boolean;
};

/** The prose and diagram consume the same chapter objects and edited text. */
export function ReadingPage({ watch, selectedId, onSelect, embedded = false }: ReadingPageProps) {
  const [localSelection, setLocalSelection] = useState<ChapterId>('curtain');
  const [textOverrides, setTextOverrides] = useState<Partial<Record<ChapterId, string>>>({});
  const selection = selectedId ?? localSelection;
  const selectedChapter = CHAPTERS.find(chapter => chapter.id === selection) ?? CHAPTERS[0];
  const Title = embedded ? 'h2' : 'h1';
  const SectionTitle = embedded ? 'h3' : 'h2';
  const ChapterTitle = embedded ? 'h4' : 'h3';
  const EssayContainer = embedded ? 'details' : 'div';

  function selectChapter(id: ChapterId) {
    setLocalSelection(id);
    onSelect?.(id);
  }

  function goToSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  const diagram = (
    <PretextMermaid
      selectedId={selection}
      onSelect={selectChapter}
      textOverrides={textOverrides}
      onTextChange={(id, body) => setTextOverrides(current => ({ ...current, [id]: body }))}
      compact
    />
  );

  return (
    <section className={`${embedded ? '' : 'page '}reading-page${embedded ? ' reading-page--embedded' : ''}`} aria-labelledby="reading-title">
      <header className={`reading-header${embedded ? '' : ' reading-measure'}`}>
        <p className="reading-eyebrow">Listening notes / An editorial reading</p>
        <Title id="reading-title" tabIndex={-1}>Inside the parade.</Title>
        <p className="reading-deck">{embedded ? 'Choose a passage or a point in the map. The same reading stays in focus in both.' : 'A sleeve, a procession, a voice trying to be heard. A closer reading of the images and movements that hold this record together.'}</p>
        {!embedded && <p className="reading-byline">The Parade Archive · Independent commentary</p>}
      </header>

      {embedded && <>
        <div className="reading-picker">
          <label htmlFor="reading-passage-select">Reading passage</label>
          <select id="reading-passage-select" value={selection} onChange={event => selectChapter(event.target.value as ChapterId)}>
            {CHAPTERS.map((chapter, index) => <option key={chapter.id} value={chapter.id}>{String(index + 1).padStart(2, '0')} · {chapter.title}</option>)}
          </select>
        </div>
        <div className="reading-workbench">
          <section className="reading-focus reading-prose" aria-labelledby="reading-focus-title" data-selected-passage={selection}>
            <p className="reading-eyebrow">Selected passage</p>
            <h3 id="reading-focus-title">{selectedChapter.title}</h3>
            <p className="reading-chapter-body">{textOverrides[selection] ?? selectedChapter.body}</p>
            <p className="reading-track-context">{tracks.filter(track => selectedChapter.trackIds.includes(track.id)).map(track => track.title).join(' · ')}</p>
            <p className="reading-inline-note">An editorial connection between the songs, rather than an official story chronology.</p>
            <p className="ds-sr-only" role="status" aria-live="polite">{selectedChapter.title} selected.</p>
            <button type="button" className="reading-watch" onClick={() => watch('RRKJiM9Njr8')}><span aria-hidden="true">↗</span> Watch the official film</button>
          </section>
          <div className="reading-map-wrap" id="reading-map-content">{diagram}</div>
        </div>
      </>}

      <EssayContainer className={embedded ? 'reading-full-essay' : 'reading-essay'}>
      {embedded && <summary>Read the full essay</summary>}
      <details className="reading-contents reading-measure">
        <summary>On this page</summary>
        <nav aria-label="Reading contents">
          <ol>
            <li><button type="button" onClick={() => goToSection('reading-sleeve')}>The sleeve sets the stage</button></li>
            <li><button type="button" onClick={() => goToSection('reading-movements')}>Five ways into the record</button></li>
            {!embedded && <li><button type="button" onClick={() => goToSection('reading-map')}>Follow the connections</button></li>}
            <li><button type="button" onClick={() => goToSection('reading-film')}>Watch, then return to the page</button></li>
            <li><button type="button" onClick={() => goToSection('reading-sources')}>Sources and reading notes</button></li>
          </ol>
        </nav>
      </details>

      <article className="reading-article" aria-label="An editorial reading of The Black Parade">
        <div className="reading-prose reading-measure">
          <p><em>The Black Parade</em> is My Chemical Romance’s third album, released in 2006. Apple Music’s album page supplies that context; Warner’s description names its central figure, the Patient, and connects his passage toward death with a cherished memory. <a className="reading-citation" href={ALBUM_SOURCE} target="_blank" rel="noreferrer" aria-label="Source 1: Apple Music album context">[1]</a> <a className="reading-citation" href={CONCEPT_SOURCE} target="_blank" rel="noreferrer" aria-label="Source 2: Warner album description">[2]</a></p>
          <p>That premise is an invitation to listen, rather than a requirement to solve a plot. The notes here follow changes in scale, intimacy and performance. The five movements below are this archive’s interpretation: a way to connect tracks and images without claiming an official scene-by-scene chronology.</p>

          <SectionTitle id="reading-sleeve" tabIndex={-1}>The sleeve sets the stage</SectionTitle>
          <p>Begin with the distance between the lettering and the figure on the pale cover. The name crowds the upper edge; the small marching figure has room around it. This uneven distribution of weight gives the image a particular tension. A tiny person can remain the subject even while the typography seems louder.</p>
          <p>The supplied procession illustration works differently. Bodies, instruments, costume and impossible proportions gather into a crowded scene. Looking from the spare cover to that illustration feels like moving from an announcement into the performance itself. This is a visual reading of the supplied artwork, not a claim about its creator’s stated intention.</p>
        </div>

        <figure className="reading-figure reading-measure">
          <img src="/assets/the-parade-band.png" alt="Five band members in dark, braid-trimmed marching uniforms, seated among ruined scenery." width={1280} height={720} loading="lazy" />
          <figcaption>Uniforms repeat a visual rhythm; posture and expression interrupt it. Reference photograph supplied for this example.</figcaption>
        </figure>

        <div className="reading-prose reading-measure">
          <p>That same relationship guides the page you are reading. Paper carries the atmosphere, while the text stays quiet enough to follow. The image is allowed its own space. A costume, a fragment of scenery or a small figure can carry the theatrical mood without turning every paragraph into a poster.</p>

          <SectionTitle id="reading-movements" tabIndex={-1}>Five ways into the record</SectionTitle>
          <p>Choose a movement to bring it into focus in the map. Choosing a node in the map selects the same passage here. The connections describe an editorial reading; they do not rearrange the album’s track order or establish a canonical timeline.</p>
          <div className="reading-chapters" aria-label="Linked reading passages">
            {CHAPTERS.map((chapter, index) => (
              <section className="reading-chapter" key={chapter.id} data-selected={selection === chapter.id ? 'true' : 'false'} aria-labelledby={`reading-heading-${chapter.id}`}>
                <ChapterTitle id={`reading-heading-${chapter.id}`}>
                  <button type="button" className="reading-chapter-select" aria-pressed={selection === chapter.id} aria-controls="reading-map-content" onClick={() => selectChapter(chapter.id)}>
                    <span className="reading-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span>{chapter.title}</span>
                    {selection === chapter.id && <span className="reading-selected-label">In focus</span>}
                  </button>
                </ChapterTitle>
                <p id={`reading-passage-${chapter.id}`} className="reading-chapter-body">{textOverrides[chapter.id] ?? chapter.body}</p>
              </section>
            ))}
          </div>

          {!embedded && <>
            <SectionTitle id="reading-map" tabIndex={-1}>Follow the connections</SectionTitle>
            <p>The map takes its excerpts directly from the passages above. Follow a branch, or open the map’s controls to show full passages, change the reading width, and edit the text. The diagram and paragraph change together; edits stay in this session.</p>
          </>}
        </div>

        {!embedded && <div className="reading-map-wrap" id="reading-map-content">{diagram}</div>}

        <div className="reading-prose reading-measure">
          <SectionTitle id="reading-film" tabIndex={-1}>Watch, then return to the page</SectionTitle>
          <p>Moving images offer another way to read the contrast between an individual and a procession. In the supplied film imagery, a uniform can make a performer part of the crowd while a close view brings a single face forward. Watch for that change of distance: who occupies the frame, how much scenery remains visible, and when the group becomes the subject.</p>
          <p>This is a prompt for looking, not a hidden-story explanation. Keep the official video open while you move between the artwork, the track notes and these passages. The player remains available as you browse, and you can close it whenever you want the page back to itself.</p>
          <button type="button" className="reading-watch" onClick={() => watch('RRKJiM9Njr8')}><span aria-hidden="true">↗</span> Watch “Welcome to the Black Parade”</button>
          <p className="reading-inline-note">Opens the official YouTube video in the archive’s player. Playback is provided by YouTube.</p>

          <SectionTitle id="reading-sources" tabIndex={-1}>Sources and reading notes</SectionTitle>
          <p>Album facts and the stated premise are anchored to the sources below. The visual observations, five movement labels and connections between them are original editorial commentary. No lyrics, interview quotations or unverified performance dates are reproduced.</p>
          <ol className="reading-sources">
            <li><a href={ALBUM_SOURCE} target="_blank" rel="noreferrer">Apple Music — The Black Parade</a><span>Album identity, release context and editorial overview.</span></li>
            <li><a href={CONCEPT_SOURCE} target="_blank" rel="noreferrer">Warner Records — album description and track list</a><span>The label’s description of the Patient and the record’s premise. The linked listing is the anniversary edition.</span></li>
          </ol>
          <p className="reading-inline-note">Artwork and photographs were supplied as visual references. This independent example does not claim official affiliation or an open license for those images.</p>
        </div>
      </article>
      </EssayContainer>
    </section>
  );
}
