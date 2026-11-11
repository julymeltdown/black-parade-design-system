import { useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleCheck, CircleAlert, Copy, Info, Minus, Plus, X } from 'lucide-react';
import { IconButton } from './components';

function cx(...values: (string | false | null | undefined)[]) { return values.filter(Boolean).join(' '); }
function finite(value: number, fallback: number) { return Number.isFinite(value) ? value : fallback; }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }

interface ChoiceInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange'> {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
  error?: string;
}
export interface CheckboxProps extends ChoiceInputProps { indeterminate?: boolean; }

/** Native checkbox; mixed state is applied to the DOM property, not simulated. */
export function Checkbox({ label, checked, onCheckedChange, indeterminate = false, description, error, id, className, 'aria-describedby': describedBy, ...props }: CheckboxProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (input.current) input.current.indeterminate = indeterminate; }, [indeterminate, checked]);
  return <div className={cx('ds-choice-field', className)}>
    <label className="ds-choice" htmlFor={inputId}>
      <input ref={input} id={inputId} type="checkbox" checked={checked} onChange={event => onCheckedChange(event.target.checked)} aria-invalid={error ? true : undefined} aria-describedby={cx(describedBy, description && `${inputId}-description`, error && `${inputId}-error`) || undefined} {...props}/>
      <span className="ds-choice__copy"><span className="ds-choice__label">{label}</span>{description && <span id={`${inputId}-description`} className="ds-choice__description">{description}</span>}</span>
    </label>
    {error && <p id={`${inputId}-error`} className="ds-field__error" role="alert">{error}</p>}
  </div>;
}

export interface SwitchProps extends ChoiceInputProps {}

/** A native checkbox with switch semantics. The label never changes with state. */
export function Switch({ label, checked, onCheckedChange, description, error, id, className, 'aria-describedby': describedBy, ...props }: SwitchProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return <div className={cx('ds-choice-field', className)}>
    <label className="ds-choice ds-switch" htmlFor={inputId}>
      <span className="ds-switch__control"><input id={inputId} type="checkbox" role="switch" checked={checked} onChange={event => onCheckedChange(event.target.checked)} aria-invalid={error ? true : undefined} aria-describedby={cx(describedBy, description && `${inputId}-description`, error && `${inputId}-error`) || undefined} {...props}/><span className="ds-switch__track" aria-hidden="true"><span/></span></span>
      <span className="ds-choice__copy"><span className="ds-choice__label">{label}</span>{description && <span id={`${inputId}-description`} className="ds-choice__description">{description}</span>}</span>
    </label>
    {error && <p id={`${inputId}-error`} className="ds-field__error" role="alert">{error}</p>}
  </div>;
}

export interface RadioOption { value: string; label: string; description?: string; disabled?: boolean; }
export interface RadioGroupProps {
  label: string;
  options: readonly RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  inline?: boolean;
  className?: string;
}

export function RadioGroup({ label, options, value, onValueChange, name, description, error, disabled, required, inline, className }: RadioGroupProps) {
  const id = useId();
  const describedBy = cx(description && `${id}-description`, error && `${id}-error`) || undefined;
  return <fieldset className={cx('ds-radio-group', className)} disabled={disabled} aria-describedby={describedBy}>
    <legend>{label}</legend>
    {description && <p id={`${id}-description`} className="ds-control-description">{description}</p>}
    <div className={cx('ds-radio-group__options', inline && 'ds-radio-group__options--inline')}>
      {options.map((option, index) => <label key={option.value} className="ds-choice" htmlFor={`${id}-${index}`}>
        <input id={`${id}-${index}`} type="radio" name={name ?? id} value={option.value} checked={value === option.value} onChange={() => onValueChange(option.value)} disabled={option.disabled} required={required} aria-invalid={error ? true : undefined} aria-describedby={cx(describedBy, option.description && `${id}-${index}-description`) || undefined}/>
        <span className="ds-choice__copy"><span className="ds-choice__label">{option.label}</span>{option.description && <span id={`${id}-${index}-description`} className="ds-choice__description">{option.description}</span>}</span>
      </label>)}
    </div>
    {error && <p id={`${id}-error`} className="ds-field__error" role="alert">{error}</p>}
  </fieldset>;
}

export interface SelectOption { value: string; label: string; disabled?: boolean; }
export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'multiple'> {
  label: string;
  options: readonly SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  description?: string;
  error?: string;
  placeholder?: string;
}

export function SelectField({ label, options, value, onValueChange, description, error, placeholder, id, className, 'aria-describedby': describedBy, ...props }: SelectFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return <div className={cx('ds-select-field', className)}>
    <label htmlFor={fieldId}>{label}</label>
    <select id={fieldId} value={value} onChange={event => onValueChange(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={cx(describedBy, description && `${fieldId}-description`, error && `${fieldId}-error`) || undefined} {...props}>
      {placeholder !== undefined && <option value="" disabled>{placeholder}</option>}
      {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    {description && <p id={`${fieldId}-description`} className="ds-control-description">{description}</p>}
    {error && <p id={`${fieldId}-error`} className="ds-field__error" role="alert">{error}</p>}
  </div>;
}

export interface RangeFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | 'any';
  description?: string;
  formatValue?: (value: number) => string;
}

export function RangeField({ label, value, onValueChange, min = 0, max = 100, step = 1, description, formatValue, id, className, 'aria-describedby': describedBy, ...props }: RangeFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const lower = finite(min, 0);
  const upper = Math.max(lower, finite(max, 100));
  const current = clamp(finite(value, lower), lower, upper);
  const validStep = step === 'any' ? step : Number.isFinite(step) && step > 0 ? step : 1;
  const formatted = formatValue ? formatValue(current) : String(current);
  return <div className={cx('ds-range-field', className)}>
    <div className="ds-range-field__label"><label htmlFor={fieldId}>{label}</label><output htmlFor={fieldId}>{formatted}</output></div>
    <input id={fieldId} type="range" min={lower} max={upper} step={validStep} value={current} onChange={event => onValueChange(clamp(finite(event.target.valueAsNumber, lower), lower, upper))} aria-valuetext={formatValue ? formatted : undefined} aria-describedby={cx(describedBy, description && `${fieldId}-description`) || undefined} {...props}/>
    {description && <p id={`${fieldId}-description`} className="ds-control-description">{description}</p>}
  </div>;
}

export interface AccordionItem { id: string; title: ReactNode; content: ReactNode; disabled?: boolean; }
export interface AccordionProps {
  items: readonly AccordionItem[];
  openIds?: readonly string[];
  defaultOpenIds?: readonly string[];
  onOpenChange?: (ids: string[]) => void;
  multiple?: boolean;
  className?: string;
}

/** Native details/summary preserves disclosure semantics and hidden content behavior. */
export function Accordion({ items, openIds, defaultOpenIds = [], onOpenChange, multiple = false, className }: AccordionProps) {
  const [localOpen, setLocalOpen] = useState<string[]>(() => [...defaultOpenIds]);
  const ids = (openIds ?? localOpen).filter(id => items.some(item => item.id === id));
  const active = new Set(multiple ? ids : ids.slice(0, 1));
  const setItemOpen = (id: string, open: boolean) => {
    if (open === active.has(id)) return;
    const next = open ? multiple ? [...active, id] : [id] : [...active].filter(current => current !== id);
    if (openIds === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  };
  return <div className={cx('ds-accordion', className)}>{items.map(item => <details key={item.id} open={active.has(item.id)} onToggle={event => setItemOpen(item.id, event.currentTarget.open)}>
    <summary aria-disabled={item.disabled || undefined} tabIndex={item.disabled ? -1 : undefined} onClick={event => { event.preventDefault(); if (!item.disabled) setItemOpen(item.id, !active.has(item.id)); }}>
      <span>{item.title}</span>{active.has(item.id) ? <Minus size={17} aria-hidden="true"/> : <Plus size={17} aria-hidden="true"/>}
    </summary>
    <div className="ds-accordion__content">{item.content}</div>
  </details>)}</div>;
}

export interface BreadcrumbItem { label: string; href?: string; }
export interface BreadcrumbsProps { items: readonly BreadcrumbItem[]; label?: string; className?: string; }

export function Breadcrumbs({ items, label = 'Breadcrumb', className }: BreadcrumbsProps) {
  if (!items.length) return null;
  return <nav className={cx('ds-breadcrumbs', className)} aria-label={label}><ol>{items.map((item, index) => <li key={`${index}-${item.label}`}>
    {index > 0 && <span className="ds-breadcrumbs__separator" aria-hidden="true">/</span>}
    {index === items.length - 1 ? <span aria-current="page">{item.label}</span> : item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
  </li>)}</ol></nav>;
}

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Pagination({ page, pageCount, onPageChange, label = 'Pagination', disabled = false, className }: PaginationProps) {
  const count = Math.max(0, Math.floor(finite(pageCount, 0)));
  const current = count ? clamp(Math.floor(finite(page, 1)), 1, count) : 0;
  const start = clamp(current - 1, 2, Math.max(2, count - 3));
  const pages = count <= 5 ? Array.from({ length: count }, (_, i) => i + 1) : [1, start, start + 1, start + 2, count];
  const choose = (next: number) => { if (!disabled && next >= 1 && next <= count && next !== current) onPageChange(next); };
  return <nav className={cx('ds-pagination', className)} aria-label={label}>
    <button type="button" className="ds-pagination__direction" aria-label="Previous page" disabled={disabled || current <= 1} onClick={() => choose(current - 1)}><ArrowLeft size={17} aria-hidden="true"/><span>Previous</span></button>
    <ol>{pages.map((number, index) => <li key={number}>{index > 0 && number - pages[index - 1] > 1 && <span className="ds-pagination__gap" aria-hidden="true">…</span>}<button type="button" aria-label={`Page ${number}`} aria-current={number === current ? 'page' : undefined} disabled={disabled} onClick={() => choose(number)}>{number}</button></li>)}</ol>
    {count === 0 && <span className="ds-pagination__empty">No pages</span>}
    <button type="button" className="ds-pagination__direction" aria-label="Next page" disabled={disabled || current >= count} onClick={() => choose(current + 1)}><span>Next</span><ArrowRight size={17} aria-hidden="true"/></button>
  </nav>;
}

export interface ProgressProps {
  label: string;
  value?: number;
  max?: number;
  valueText?: string;
  showValue?: boolean;
  className?: string;
}

export function Progress({ label, value, max = 100, valueText, showValue = true, className }: ProgressProps) {
  const id = useId();
  const limit = Math.max(1, finite(max, 100));
  const current = typeof value === 'number' && Number.isFinite(value) ? clamp(value, 0, limit) : undefined;
  const text = valueText ?? (current === undefined ? 'In progress' : `${Math.round(current / limit * 100)}%`);
  return <div className={cx('ds-progress', className)}><div className="ds-progress__label"><label htmlFor={id}>{label}</label>{showValue && <span aria-hidden="true">{text}</span>}</div><progress id={id} max={limit} value={current} aria-valuetext={valueText}>{text}</progress></div>;
}

export interface AvatarProps { name: string; src?: string; size?: 'sm' | 'md' | 'lg'; className?: string; }

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.length ? words.slice(0, 2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase() : '?';
  return <span className={cx('ds-avatar', `ds-avatar--${size}`, className)} role="img" aria-label={name || 'Unnamed contributor'}>
    {src && failedSrc !== src ? <img src={src} alt="" aria-hidden="true" loading="lazy" onError={() => setFailedSrc(src)}/> : <span aria-hidden="true">{initials}</span>}
  </span>;
}

export interface AvatarGroupProps { people: readonly AvatarProps[]; max?: number; label?: string; className?: string; }

export function AvatarGroup({ people, max = 4, label = 'Contributors', className }: AvatarGroupProps) {
  const limit = Math.max(1, Math.floor(finite(max, 4)));
  const visible = people.slice(0, limit);
  const hidden = people.slice(limit);
  return <div className={cx('ds-avatar-group', className)} role="group" aria-label={label}>{visible.map((person, index) => <Avatar key={`${index}-${person.name}`} {...person}/>)}{hidden.length > 0 && <span className="ds-avatar-group__overflow" role="img" aria-label={`${hidden.length} more contributors: ${hidden.map(person => person.name).join(', ')}`}>+{hidden.length}</span>}</div>;
}

export type NoticeTone = 'info' | 'success' | 'warning' | 'error';
export interface NoticeProps { title: string; children?: ReactNode; tone?: NoticeTone; onDismiss?: () => void; className?: string; }

export function Notice({ title, children, tone = 'info', onDismiss, className }: NoticeProps) {
  const Icon = tone === 'success' ? CircleCheck : tone === 'info' ? Info : CircleAlert;
  return <div className={cx('ds-notice', `ds-notice--${tone}`, className)} role={tone === 'error' ? 'alert' : 'status'}>
    <Icon size={19} aria-hidden="true"/><div className="ds-notice__content"><strong>{title}</strong>{children && <div>{children}</div>}</div>{onDismiss && <IconButton label={`Dismiss ${title}`} onClick={onDismiss}><X size={17} aria-hidden="true"/></IconButton>}
  </div>;
}

export interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> {
  text: string;
  label?: string;
  copiedLabel?: string;
  onCopy?: () => void;
}

export function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied', onCopy, className, disabled, type = 'button', ...props }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');
  const generation = useRef(0);
  useEffect(() => () => { generation.current += 1; }, []);
  useEffect(() => {
    if (state !== 'copied') return;
    const timer = window.setTimeout(() => setState('idle'), 2200);
    return () => window.clearTimeout(timer);
  }, [state]);
  const copy = async () => {
    const attempt = ++generation.current;
    setState('copying');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
    } catch {
      if (attempt === generation.current) setState('failed');
      return;
    }
    if (attempt !== generation.current) return;
    setState('copied');
    onCopy?.();
  };
  return <span className="ds-copy"><button type={type} className={cx('ds-copy-button', className)} disabled={disabled || state === 'copying'} onClick={copy} {...props}>{state === 'copied' ? <Check size={16} aria-hidden="true"/> : <Copy size={16} aria-hidden="true"/>}{state === 'copied' ? copiedLabel : state === 'copying' ? 'Copying…' : label}</button><span className={state === 'failed' ? 'ds-copy__error' : 'ds-sr-only'} role="status">{state === 'failed' ? 'Copy unavailable. Select the text to copy.' : state === 'copied' ? 'Copied to clipboard.' : ''}</span></span>;
}

export interface CodeBlockProps { code: string; language?: string; label?: string; copyable?: boolean; wrap?: boolean; className?: string; }

export function CodeBlock({ code, language = 'text', label = 'Code example', copyable = true, wrap = false, className }: CodeBlockProps) {
  const id = useId();
  return <figure className={cx('ds-code-block', className)}><figcaption id={id}><span>{label}<small>{language}</small></span>{copyable && <CopyButton text={code} aria-label={`Copy ${label.toLowerCase()}`}/>}</figcaption><pre className={wrap ? 'ds-code-block__wrap' : undefined} tabIndex={0} aria-labelledby={id}><code>{code}</code></pre></figure>;
}

export interface SkeletonProps { lines?: number; label?: string; lastLineWidth?: string; className?: string; }

export function Skeleton({ lines = 3, label = 'Loading content', lastLineWidth = '62%', className }: SkeletonProps) {
  const count = clamp(Math.floor(finite(lines, 3)), 1, 12);
  return <div className={cx('ds-skeleton', className)} role="status"><span className="ds-sr-only">{label}</span><span className="ds-skeleton__lines" aria-hidden="true">{Array.from({ length: count }, (_, index) => <span key={index} style={{ width: index === count - 1 ? lastLineWidth : '100%' }}/>)}</span></div>;
}

export interface KbdProps extends HTMLAttributes<HTMLElement> { children: ReactNode; }
export function Kbd({ children, className, ...props }: KbdProps) { return <kbd className={cx('ds-kbd', className)} {...props}>{children}</kbd>; }
