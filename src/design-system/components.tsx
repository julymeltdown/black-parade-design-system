import { useEffect, useId, useRef } from 'react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { ArrowRight, Play, Search, X } from 'lucide-react';

function classes(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(' ');
}

// A second modal may open from a global shortcut. Closing either one must not
// unlock the document while the other one remains open.
const scrollLocks = new Set<symbol>();
let previousDocumentOverflow = '';
let previousBodyOverflow = '';
function lockDocumentScroll() {
  const lock = Symbol('dialog-scroll-lock');
  if (!scrollLocks.size) {
    previousDocumentOverflow = document.documentElement.style.overflow;
    previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  scrollLocks.add(lock);
  return () => {
    scrollLocks.delete(lock);
    if (!scrollLocks.size) {
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
    }
  };
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className, type = 'button', children, ...props }: ButtonProps) {
  return <button type={type} className={classes('ds-button', `ds-button--${variant}`, `ds-button--${size}`, className)} {...props}>{children}</button>;
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, children, className, type = 'button', ...props }: IconButtonProps) {
  return <button type={type} className={classes('ds-icon-button', className)} aria-label={label} title={label} {...props}>{children}</button>;
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' }) {
  return <span className={classes('ds-tag', tone === 'accent' && 'ds-tag--accent')}>{children}</span>;
}

export function SectionHeading({ eyebrow, title, id, action }: { eyebrow?: string; title: string; id?: string; action?: ReactNode }) {
  return <div className="ds-section-heading"><div>{eyebrow && <p className="ds-eyebrow">{eyebrow}</p>}<h2 id={id}>{title}</h2></div>{action && <div className="ds-section-heading__action">{action}</div>}</div>;
}

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function SearchField({ value, onChange, label = 'Search the archive', placeholder = 'Search the archive' }: SearchFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  return <div className="ds-search"><label htmlFor={id} className="ds-sr-only">{label}</label><Search className="ds-search__icon" size={18} aria-hidden="true" /><input ref={input} id={id} type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" spellCheck={false} />{value && <IconButton label={`Clear ${label.toLowerCase()}`} onClick={() => { onChange(''); input.current?.focus(); }} className="ds-search__clear"><X size={17} aria-hidden="true" /></IconButton>}</div>;
}

export interface TabBarProps {
  items: Array<{ id: string; label: string; count?: number }>;
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function TabBar({ items, value, onChange, label }: TabBarProps) {
  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')];
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next]?.focus();
    onChange(items[next].id);
  };
  return <div className="ds-tab-bar" role="group" aria-label={label} onKeyDown={handleKeys}>{items.map(item => <button key={item.id} type="button" aria-pressed={item.id === value} onClick={() => onChange(item.id)}>{item.label}{typeof item.count === 'number' && <span className="ds-tab-count">{item.count}</span>}</button>)}</div>;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

/** Native dialog provides focus containment, Escape handling and focus restoration. */
export function Dialog({ open, onClose, title, children, wide = false }: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
    if (!open) return;
    return lockDocumentScroll();
  }, [open]);
  return <dialog
    ref={dialog}
    className={classes('ds-dialog', wide && 'ds-dialog--wide')}
    aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClose={() => { if (open) onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}
  ><div className="ds-dialog__inner"><header className="ds-dialog__header"><h2 id={titleId}>{title}</h2><IconButton label={`Close ${title}`} onClick={onClose}><X size={21} aria-hidden="true" /></IconButton></header><div className="ds-dialog__body">{children}</div></div></dialog>;
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className, 'aria-describedby': describedBy, ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  return <div className={classes('ds-field', className)}><label htmlFor={fieldId}>{label}</label><input id={fieldId} aria-invalid={error ? true : undefined} aria-describedby={classes(describedBy, error && errorId) || undefined} {...props} />{error && <p id={errorId} className="ds-field__error" role="alert">{error}</p>}</div>;
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, id, className, 'aria-describedby': describedBy, ...props }: TextAreaProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  return <div className={classes('ds-field', className)}><label htmlFor={fieldId}>{label}</label><textarea id={fieldId} aria-invalid={error ? true : undefined} aria-describedby={classes(describedBy, error && errorId) || undefined} {...props} />{error && <p id={errorId} className="ds-field__error" role="alert">{error}</p>}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="ds-empty"><span className="ds-empty__mark" aria-hidden="true">✳</span><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export interface MediaCardProps {
  title: string;
  subtitle: string;
  image: string;
  duration?: string;
  onClick: () => void;
}

export function MediaCard({ title, subtitle, image, duration, onClick }: MediaCardProps) {
  return <button type="button" className="ds-media-card" onClick={onClick} aria-label={`Watch ${title}${duration ? `, ${duration}` : ''}`}><span className="ds-media-card__image"><img src={image} alt="" loading="lazy" width={640} height={360} /><span className="ds-media-card__play" aria-hidden="true"><Play size={22} fill="currentColor" strokeWidth={1.5} /></span>{duration && <span className="ds-media-card__duration">{duration}</span>}</span><span className="ds-media-card__caption"><span><strong>{title}</strong><span className="ds-media-card__subtitle">{subtitle}</span></span><ArrowRight size={20} className="ds-media-card__arrow" aria-hidden="true" /></span></button>;
}

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div className="ds-toast"><span role="status">{message}</span><IconButton label="Dismiss notification" onClick={onDismiss}><X size={18} aria-hidden="true" /></IconButton></div>;
}
