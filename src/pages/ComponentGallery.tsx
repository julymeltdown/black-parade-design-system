import { useState } from 'react';
import {
  Accordion, Avatar, AvatarGroup, Breadcrumbs, Button, Checkbox, CodeBlock,
  CopyButton, Kbd, Notice, Pagination, Progress, RadioGroup, RangeField,
  SectionHeading, SelectField, Skeleton, Switch,
} from '../design-system';
import type { NoticeTone } from '../design-system';
import './component-gallery.css';

const noteTypes = ['Listening notes', 'Official videos', 'Conversations'];
const chapterSamples = [
  { value: 'curtain', label: 'The curtain rises', body: 'A quiet opening makes room for a larger world. Listen for the point where the private voice becomes a procession.' },
  { value: 'memory', label: 'Memory becomes a parade', body: 'A memory begins at the piano and grows into something shared. The arrangement makes the distance between one person and a crowd feel very small.' },
  { value: 'loss', label: 'The private losses', body: 'The quieter songs bring the spectacle back to separation, illness and regret. Space around the voice makes these losses feel close.' },
];
const notes = [
  ['01', 'The curtain rises', 'Listen for the change from a private voice to the full band.'],
  ['02', 'A beautiful contradiction', 'Bright phrasing and dark subject matter move against each other.'],
  ['03', 'Fear of being forgotten', 'A gathering sound, restless and difficult to leave behind.'],
  ['04', 'A life at the edge', 'The rhythm keeps moving even when the story is unsteady.'],
  ['05', 'Memory becomes a procession', 'A piano motif opens into a shared refrain.'],
  ['06', 'The space left behind', 'A smaller arrangement gives the voice more room.'],
];
const contributors = [{ name: 'Rae Morgan' }, { name: 'Mika Park' }, { name: 'Robin Vale' }, { name: 'Jo Ellis' }, { name: 'Lou Chen' }];
const noticeCopy: Record<NoticeTone, { title: string; body: string }> = {
  info: { title: 'A place for your listening notes.', body: 'Save a thought before moving to the next passage.' },
  success: { title: 'Your selection is ready.', body: 'This specimen shows the completed state of a local interaction.' },
  warning: { title: 'There is a little more to fill in.', body: 'Keep the useful instruction close to the control that needs attention.' },
  error: { title: 'The example could not continue.', body: 'This is a selectable error specimen. Change the state above to recover.' },
};
const example = `import { Checkbox, RangeField, Notice } from './design-system';

<Checkbox
  label="Save this passage"
  checked={saved}
  onCheckedChange={setSaved}
/>
<RangeField
  label="Reading size"
  min={16}
  max={24}
  value={size}
  onValueChange={setSize}
  formatValue={value => value + 'px'}
/>
<Notice tone="success" title="Your place is kept.">
  Return to this passage whenever you need it.
</Notice>`;

/** Interactive specimens of the public foundation exports. No network writes. */
export function ComponentGallery() {
  const [selected, setSelected] = useState<string[]>([noteTypes[0]]);
  const [arrangement, setArrangement] = useState('comfortable');
  const [chapter, setChapter] = useState('memory');
  const [readingSize, setReadingSize] = useState(18);
  const [showNames, setShowNames] = useState(true);
  const [openIds, setOpenIds] = useState<string[]>(['notes']);
  const [page, setPage] = useState(1);
  const [completion, setCompletion] = useState(40);
  const [noticeTone, setNoticeTone] = useState<NoticeTone>('info');
  const [showNotice, setShowNotice] = useState(true);
  const [loading, setLoading] = useState(false);
  const activeChapter = chapterSamples.find(item => item.value === chapter)!;
  const notice = noticeCopy[noticeTone];

  return <section className="component-gallery" aria-label="Extended component examples">
    <SectionHeading eyebrow="EXTENDED FOUNDATIONS / 16 COMPONENTS" title="More ways to leave a mark."/>
    <p className="component-gallery__intro">Choices, navigation, feedback and small utilities. Every specimen below uses the exported React component.</p>

    <div className="component-gallery__section">
      <header><h3>Choices, in plain sight.</h3><p>Checkbox · Switch · RadioGroup · SelectField · RangeField</p></header>
      <div className="component-gallery__columns">
        <div className="component-gallery__stack">
          <fieldset className="component-gallery__fieldset"><legend>Include in this collection</legend>
            <Checkbox label="Select every kind" checked={selected.length === noteTypes.length} indeterminate={selected.length > 0 && selected.length < noteTypes.length} onCheckedChange={checked => setSelected(checked ? [...noteTypes] : [])}/>
            <div className="component-gallery__nested-choices">{noteTypes.map(type => <Checkbox key={type} label={type} checked={selected.includes(type)} onCheckedChange={checked => setSelected(current => checked ? [...current, type] : current.filter(item => item !== type))}/>)}</div>
            <Checkbox label="Offline downloads" checked={false} onCheckedChange={() => undefined} disabled description="Unavailable in this example."/>
          </fieldset>
          <RadioGroup label="List arrangement" value={arrangement} onValueChange={setArrangement} inline options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}/>
          <p className="component-gallery__status" role="status">{selected.length} of {noteTypes.length} kinds selected. The sample notes below use {arrangement} spacing.</p>
        </div>
        <div className="component-gallery__stack">
          <SelectField label="Reading passage" value={chapter} onValueChange={setChapter} options={chapterSamples.map(({ value, label }) => ({ value, label }))}/>
          <RangeField label="Reading size" value={readingSize} min={16} max={24} onValueChange={setReadingSize} formatValue={value => `${value}px`}/>
          <article className="component-gallery__reading" style={{ fontSize: readingSize }}><h4>{activeChapter.label}</h4><p>{activeChapter.body}</p></article>
          <Switch label="Show contributor names" checked={showNames} onCheckedChange={setShowNames}/>
          <div className="component-gallery__contributors"><Avatar name="The Parade Archive" src="/assets/album-cover.png" size="lg"/><div><AvatarGroup people={contributors} max={3} label="Sample contributors"/>{showNames && <p>Rae, Mika, Robin, Jo & Lou</p>}</div></div>
          <p className="component-gallery__caption">Avatar · AvatarGroup — initials remain available when a portrait is missing.</p>
        </div>
      </div>
    </div>

    <div className="component-gallery__section">
      <header><h3>Open what you need.</h3><p>Accordion · Breadcrumbs · Pagination</p></header>
      <div className="component-gallery__columns">
        <div>
          <Accordion openIds={openIds} onOpenChange={setOpenIds} items={[
            { id: 'notes', title: 'Where do the listening notes come from?', content: <p>They are original editorial readings. The archive keeps those observations distinct from official album facts and the words of the artist.</p> },
            { id: 'links', title: 'Can a passage open its place in the map?', content: <p>Yes. The main Record view shares chapter IDs between each passage, its diagram node and its associated tracks.</p> },
            { id: 'saved', title: 'What happens to a saved track?', content: <p>The example saves it in this browser. It does not create an account or send a collection to a server.</p> },
          ]}/>
          <p className="component-gallery__status" role="status">{openIds.length ? 'One passage is open.' : 'All passages are closed.'}</p>
        </div>
        <div>
          <Breadcrumbs items={[{ label: 'Record', href: '#archive' }, { label: 'System', href: '#system' }, { label: 'Listening notes' }]}/>
          <ol className={`component-gallery__notes component-gallery__notes--${arrangement}`} aria-label="Sample listening notes" start={(page - 1) * 2 + 1}>{notes.slice((page - 1) * 2, page * 2).map(([number, title, body]) => <li key={number}><span aria-hidden="true">{number}</span><div><strong>{title}</strong><p>{body}</p></div></li>)}</ol>
          <Pagination page={page} pageCount={3} onPageChange={setPage} label="Sample listening note pages"/>
          <p className="component-gallery__status" role="status">Showing notes {(page - 1) * 2 + 1}–{Math.min(page * 2, notes.length)} of {notes.length}.</p>
        </div>
      </div>
    </div>

    <div className="component-gallery__section">
      <header><h3>State, without the noise.</h3><p>Progress · Notice · Skeleton</p></header>
      <div className="component-gallery__columns">
        <div className="component-gallery__stack">
          <Progress label="Collection progress specimen" value={completion}/>
          <div className="component-gallery__actions"><Button variant="ghost" size="sm" onClick={() => setCompletion(current => Math.max(0, current - 20))} disabled={completion === 0}>−20%</Button><Button variant="secondary" size="sm" onClick={() => setCompletion(current => Math.min(100, current + 20))} disabled={completion === 100}>+20%</Button><Button variant="ghost" size="sm" onClick={() => setCompletion(0)}>Reset</Button></div>
          <Progress label="Indeterminate progress specimen"/>
          <Switch label="Show the loading specimen" checked={loading} onCheckedChange={setLoading}/>
          <div className="component-gallery__loading">{loading ? <Skeleton label="Loading specimen, three placeholder lines" lines={3}/> : <p>A few words, with room to settle. Use the switch to replace this content with a static loading placeholder.</p>}</div>
        </div>
        <div className="component-gallery__stack">
          <SelectField label="Notice state" value={noticeTone} onValueChange={value => { setNoticeTone(value as NoticeTone); setShowNotice(true); }} options={[{ value: 'info', label: 'Information' }, { value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }]}/>
          {showNotice ? <Notice tone={noticeTone} title={notice.title} onDismiss={() => setShowNotice(false)}>{notice.body}</Notice> : <Button variant="ghost" size="sm" onClick={() => setShowNotice(true)}>Show notice again</Button>}
        </div>
      </div>
    </div>

    <div className="component-gallery__section">
      <header><h3>Take the useful pieces.</h3><p>CodeBlock · CopyButton · Kbd</p></header>
      <CodeBlock code={example} language="tsx" label="Controlled choices and readable feedback"/>
      <div className="component-gallery__copy-row"><code>npm run test:pretext</code><CopyButton text="npm run test:pretext" label="Copy test command"/></div>
      <p className="component-gallery__keyboard"><Kbd>Tab</Kbd> moves between controls. <Kbd>Space</Kbd> changes a focused checkbox or switch. Native radio groups and range fields respond to the arrow keys.</p>
    </div>
  </section>;
}
