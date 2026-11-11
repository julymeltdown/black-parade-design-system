import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Bookmark, CornerDownRight, MessageSquare, Plus, X } from 'lucide-react';
import { Button, Dialog, EmptyState, IconButton, SearchField, TabBar, Tag, TextField } from '../design-system';
import type { Category, Comment, Post } from '../data';
import { MeasuredTextArea, TextExcerpt, type TextStyle } from '../pretext';

const POST_TEXT: TextStyle = { font: '400 16px Inter, "Noto Sans KR Variable", sans-serif', lineHeight: 28, whiteSpace: 'pre-wrap' };

interface Props {
  posts: Post[]; setPosts: Dispatch<SetStateAction<Post[]>>;
  saved: string[]; toggleSaved: (id: string) => void;
  votes: Record<string, number>; setVotes: Dispatch<SetStateAction<Record<string, number>>>;
  notify: (message: string) => void;
}

export function CommunityPage({ posts, setPosts, saved, toggleSaved, votes, setVotes, notify }: Props) {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('top');
  const [search, setSearch] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftCategory, setDraftCategory] = useState<Category>('Discussion');
  const [attempted, setAttempted] = useState(false);
  const [activePost, setActivePost] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [replyError, setReplyError] = useState('');
  const currentPost = posts.find(post => post.id === activePost);
  const filtered = posts.filter(post => (category === 'all' || (category === 'saved' ? saved.includes(post.id) : post.category === category)) && `${post.title} ${post.body}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'new' ? b.createdAt - a.createdAt : (b.votes + (votes[b.id] || 0)) - (a.votes + (votes[a.id] || 0)));

  const vote = (id: string, direction: number) => setVotes(current => ({ ...current, [id]: current[id] === direction ? 0 : direction }));
  const openPost = (id: string) => { setActivePost(id); setReply(''); setReplyTo(null); setReplyError(''); };
  const createPost = (event: React.FormEvent) => {
    event.preventDefault(); setAttempted(true);
    if (draftTitle.trim().length < 3 || draftBody.trim().length < 10) return;
    const post: Post = { id: crypto.randomUUID(), author: 'you', title: draftTitle.trim(), body: draftBody.trim(), category: draftCategory, votes: 0, createdAt: Date.now(), comments: [] };
    setPosts(current => [post, ...current]); setComposerOpen(false); setDraftTitle(''); setDraftBody(''); setAttempted(false); setCategory('all'); setSort('new'); setSearch(''); notify('Your conversation was added to this browser.');
  };
  const addReply = (event: React.FormEvent) => {
    event.preventDefault();
    if (reply.trim().length < 2) { setReplyError('Write at least two characters before posting.'); return; }
    const comment: Comment = { id: crypto.randomUUID(), author: 'you', body: reply.trim(), parentId: replyTo?.id, createdAt: Date.now() };
    setPosts(current => current.map(post => post.id === activePost ? { ...post, comments: [...post.comments, comment] } : post));
    setReply(''); setReplyTo(null); setReplyError(''); notify('Your reply was added to this browser.');
  };
  const renderComment = (comment: Comment, depth = 0): React.ReactNode => <div className="comment-thread" key={comment.id} style={{ '--comment-depth': Math.min(depth, 3) } as React.CSSProperties}>
    <article className="comment"><div className="comment-avatar" aria-hidden="true">{comment.author[0].toUpperCase()}</div><div className="comment-body"><span className="comment-author">u/{comment.author} <small>{comment.author === 'you' ? 'ON THIS DEVICE' : 'SAMPLE REPLY'}</small></span><p>{comment.body}</p><button className="comment-reply-button" onClick={() => { setReplyTo(comment); setTimeout(() => document.getElementById('reply-body')?.focus(), 50); }}><CornerDownRight size={15}/>Reply</button></div></article>
    {currentPost?.comments.filter(child => child.parentId === comment.id).map(child => renderComment(child, depth + 1))}
  </div>;

  return <div className="page community-page"><header className="page-heading community-heading"><div><p className="micro-label">03 / THE PEOPLE</p><h1>You belong here.</h1><p>A record brought us here. The conversation keeps us.</p></div><Button onClick={() => setComposerOpen(true)}><Plus size={18}/>Start a conversation</Button></header>
    <div className="community-layout"><section className="community-feed" aria-label="Community conversations"><div className="community-toolbar"><TabBar label="Filter conversations" items={[{ id: 'all', label: 'All' }, { id: 'Discussion', label: 'Discussion' }, { id: 'Artwork', label: 'Artwork' }, { id: 'Live', label: 'Live' }, { id: 'saved', label: 'Saved' }]} value={category} onChange={setCategory}/><label className="sort-control"><span className="ds-sr-only">Sort conversations</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="top">Top</option><option value="new">New</option></select></label></div>
      <div className="community-search"><SearchField value={search} onChange={setSearch} label="Search conversations" placeholder="Find a conversation…"/></div>
      <p className="local-demo-note">Starter conversations are sample content. Your posts and replies stay in this browser.</p>
      <div className="post-list">{filtered.map(post => <article className="post" id={`post-${post.id}`} key={post.id}>
        <div className="vote-control"><IconButton label={`Upvote ${post.title}`} aria-pressed={votes[post.id] === 1} onClick={() => vote(post.id, 1)}><ArrowUp size={19}/></IconButton><span className="vote-total" aria-label={`${post.votes + (votes[post.id] || 0)} votes`}>{post.votes + (votes[post.id] || 0)}</span><IconButton label={`Downvote ${post.title}`} aria-pressed={votes[post.id] === -1} onClick={() => vote(post.id, -1)}><ArrowDown size={19}/></IconButton></div>
        <div className="post-content"><div className="post-meta"><Tag>{post.category}</Tag><span>u/{post.author}</span><span className="post-sample">{post.author === 'you' ? 'ON THIS DEVICE' : 'SAMPLE THREAD'}</span></div><button className="post-open" onClick={() => openPost(post.id)}><h2>{post.title}</h2></button><TextExcerpt className="post-excerpt" text={post.body} maxLines={3} textStyle={POST_TEXT} moreLabel="Read more"/><div className="post-actions"><button onClick={() => openPost(post.id)}><MessageSquare size={16}/>{post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}</button><button onClick={() => toggleSaved(post.id)} aria-pressed={saved.includes(post.id)}><Bookmark size={16} fill={saved.includes(post.id) ? 'currentColor' : 'none'}/>{saved.includes(post.id) ? 'Saved' : 'Save'}</button></div></div>
        {post.image && <button className="post-image" onClick={() => openPost(post.id)} aria-label={`Open ${post.title}`}><img src={post.image} alt="Detail from The Black Parade artwork" width="112" height="140" loading="lazy"/></button>}
      </article>)}</div>
      {!filtered.length && <EmptyState title="Make the first mark." description={category === 'saved' ? 'Save a conversation to keep it here.' : 'There are no conversations matching these filters.'} action={<Button variant="secondary" onClick={() => { setCategory('all'); setSearch(''); }}>Show all conversations</Button>}/>}
    </section>
    <aside className="community-about"><div className="micro-label">A FEW HOUSE NOTES</div><span className="community-about-mark" aria-hidden="true">✳</span><h2>Come as<br/>you are.</h2><p>For memories, drawings, songs that stayed, and the people who understand.</p><ol><li>Be kind to the person behind the username.</li><li>Give artists credit for their work.</li><li>Keep a little room for a different interpretation.</li></ol><p className="community-about-foot">This is a working local demo. No account needed; nothing is posted to a public community.</p><a className="text-action" href="https://www.mychemicalromance.com/" target="_blank" rel="noreferrer">The band’s official home <ArrowUpRight size={16}/></a></aside></div>

    <Dialog open={composerOpen} onClose={() => setComposerOpen(false)} title="Leave your mark."><form onSubmit={createPost} className="composer-form" noValidate><p className="dialog-intro">Start a conversation. Your post will be saved on this device.</p><TextField label="A title for your conversation" value={draftTitle} onChange={event => setDraftTitle(event.target.value)} placeholder="What’s on your mind?" maxLength={160} error={attempted && draftTitle.trim().length < 3 ? 'Give your conversation a title with at least three characters.' : undefined}/><label className="category-field">Category<select value={draftCategory} onChange={event => setDraftCategory(event.target.value as Category)}><option>Discussion</option><option>Artwork</option><option>Live</option></select></label><MeasuredTextArea label="Your words" value={draftBody} onChange={setDraftBody} placeholder="A thought, a memory, a question…" minRows={4} maxRows={10} maxLength={4000} error={attempted && draftBody.trim().length < 10 ? 'Add a little more detail — at least ten characters.' : undefined}/><div className="composer-actions"><Button variant="ghost" onClick={() => setComposerOpen(false)}>Cancel</Button><Button type="submit">Post on this device <ArrowUpRight size={17}/></Button></div></form></Dialog>

    <Dialog open={Boolean(currentPost)} onClose={() => setActivePost(null)} title="The conversation." wide>{currentPost && <div className="thread-detail"><div className="post-meta"><Tag>{currentPost.category}</Tag><span>u/{currentPost.author}</span></div><h3>{currentPost.title}</h3><p className="thread-post-body">{currentPost.body}</p>{currentPost.image && <img className="thread-post-image" src={currentPost.image} alt="The supplied Black Parade illustration"/>}<div className="thread-comment-heading"><h4>{currentPost.comments.length} {currentPost.comments.length === 1 ? 'reply' : 'replies'}</h4><span>EVERY VOICE HAS A PLACE</span></div><div className="comments">{currentPost.comments.filter(comment => !comment.parentId).map(comment => renderComment(comment))}{!currentPost.comments.length && <p className="no-replies">No replies yet. You can be the first.</p>}</div><form onSubmit={addReply} className="reply-form" noValidate>{replyTo && <div className="reply-to"><span>Replying to u/{replyTo.author}</span><IconButton label="Cancel reply to comment" onClick={() => setReplyTo(null)}><X size={16}/></IconButton></div>}<MeasuredTextArea id="reply-body" label={replyTo ? `Your reply to ${replyTo.author}` : 'Join the conversation'} placeholder="Leave something thoughtful…" value={reply} onChange={value => { setReply(value); setReplyError(''); }} minRows={3} maxRows={7} maxLength={2000} error={replyError}/><div className="reply-submit"><span>Saved on this device</span><Button type="submit">Post reply <ArrowUpRight size={16}/></Button></div></form></div>}</Dialog>
  </div>;
}
