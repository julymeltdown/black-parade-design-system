# Extended foundation components

Version 1.3 adds sixteen reusable components to the twelve existing foundation exports. Their implementation is in [`src/design-system/extended.tsx`](../src/design-system/extended.tsx); styles are in [`extended.css`](../src/design-system/extended.css). The public [`design-system/index.ts`](../src/design-system/index.ts) barrel imports their CSS and exports every component and its named prop types.

The live [`ComponentGallery`](../src/pages/ComponentGallery.tsx) demonstrates each export with actual React state. It belongs in the System page's Components section. Its examples do not submit network requests or imply a remote account.

## Import

```tsx
import {
  Checkbox, Switch, RadioGroup, SelectField, RangeField, Accordion,
  Breadcrumbs, Pagination, Progress, Avatar, AvatarGroup, Notice,
  CodeBlock, CopyButton, Skeleton, Kbd,
} from './design-system';
import type { CheckboxProps, AccordionItem, NoticeTone } from './design-system';
```

These paths assume the consuming file is directly inside `src/`. Load the Fontsource families as shown in [`src/main.tsx`](../src/main.tsx). All controls use the shared color, spacing, touch-target and motion tokens. Native form controls retain their platform keyboard behavior.

## Component contracts

| Component | Required props | Optional behavior |
| --- | --- | --- |
| `Checkbox` | `label`, `checked`, `onCheckedChange` | `indeterminate`, `description`, `error`; native input attributes |
| `Switch` | `label`, `checked`, `onCheckedChange` | `description`, `error`; native input attributes |
| `RadioGroup` | `label`, `options`, `value`, `onValueChange` | `name`, `description`, `error`, `disabled`, `required`, `inline` |
| `SelectField` | `label`, `options`, `value`, `onValueChange` | `placeholder`, `description`, `error`; native single-select attributes |
| `RangeField` | `label`, `value`, `onValueChange` | `min=0`, `max=100`, `step=1`, `formatValue`, `description`; native input attributes |
| `Accordion` | `items` | Controlled `openIds`/`onOpenChange` or `defaultOpenIds`; `multiple=false` |
| `Breadcrumbs` | `items` | `label='Breadcrumb'` |
| `Pagination` | `page`, `pageCount`, `onPageChange` | `label='Pagination'`, `disabled=false` |
| `Progress` | `label` | `value`, `max=100`, `valueText`, `showValue=true` |
| `Avatar` | `name` | `src`, `size='md'` (`sm`, `md`, `lg`) |
| `AvatarGroup` | `people` | `max=4`, `label='Contributors'` |
| `Notice` | `title` | `children`, `tone='info'`, `onDismiss` |
| `CopyButton` | `text` | `label='Copy'`, `copiedLabel='Copied'`, `onCopy`; native button attributes |
| `CodeBlock` | `code` | `language='text'`, `label='Code example'`, `copyable=true`, `wrap=false` |
| `Skeleton` | — | `lines=3`, `label='Loading content'`, `lastLineWidth='62%'` |
| `Kbd` | `children` | Native HTML attributes |

Every component accepts `className`. Choice controls, groups and disclosure items use stable IDs or option values supplied by the caller; keep them unique within each component.

## Choices and field feedback

`Checkbox` and `Switch` are controlled native checkbox inputs. Their callbacks receive the next boolean, not a DOM event. Pass `name`, `value`, `required`, `disabled`, `form` and other native attributes as needed. The switch adds `role="switch"`; its visible label stays the same whether on or off.

The checkbox's mixed state uses `HTMLInputElement.indeterminate`, so assistive technology and forced-colors rendering receive the real native state. The consumer decides what a mixed-state click means. This collection example selects all entries when the mixed master checkbox is activated:

```tsx
const kinds = ['notes', 'films', 'conversations'];
const [selected, setSelected] = useState<string[]>(['notes']);

<Checkbox
  label="Include every kind"
  checked={selected.length === kinds.length}
  indeterminate={selected.length > 0 && selected.length < kinds.length}
  onCheckedChange={checked => setSelected(checked ? kinds : [])}
/>
```

Descriptions and validation messages are connected with `aria-describedby`; errors also set `aria-invalid` and render a live alert. An explicitly supplied `aria-describedby` is preserved alongside the component's own IDs. The choice label provides a minimum 44px-tall click target around the smaller visual checkbox or switch.

`RadioGroup` uses a `fieldset`, `legend` and native radio inputs sharing one name. Arrow-key selection, tab behavior and required-field validation come from the browser. Options have this shape:

```ts
interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
```

Use a valid option value for the controlled `value`. `disabled` on the group disables its fieldset; `disabled` on an option disables only that radio. Labels and descriptions remain readable.

`SelectField` keeps the native picker, including the phone operating system's selection UI. `options` is a readonly list of `{ value, label, disabled? }`. When `placeholder` is present it creates a disabled empty-value option; initialize `value` to `''` to display it. `required` works with browser form validation. This component intentionally models a single select, not a custom combobox or multi-select.

```tsx
<SelectField
  label="Passage"
  value={chapter}
  onValueChange={setChapter}
  required
  placeholder="Choose a passage"
  options={[
    { value: 'memory', label: 'Memory becomes a parade' },
    { value: 'loss', label: 'The private losses' },
  ]}
  error={submitted && !chapter ? 'Choose a passage to continue.' : undefined}
/>
```

`RangeField` renders a linked label, native slider and output value. Arrow keys, Home/End and pointer/touch interaction remain native. A `formatValue` callback supplies both the visible output and `aria-valuetext`, so units remain available to screen readers.

```tsx
<RangeField
  label="Reading size"
  min={16}
  max={24}
  step={1}
  value={size}
  onValueChange={setSize}
  formatValue={value => `${value}px`}
/>
```

Invalid numeric bounds and values are normalized; the displayed value is clamped to the finite interval. A non-positive or non-finite numeric step becomes `1`; `step="any"` is supported. The caller still owns its state. Normalization protects the rendered control and does not silently rewrite caller state until an input event occurs.

## Disclosures and navigation

### Accordion

Each item is `{ id, title, content, disabled? }`. Use plain, non-interactive content for `title`: links and buttons belong inside `content`. Native `details` and `summary` provide disclosure semantics and hidden-content behavior. Enter or Space on a summary triggers the same state change as clicking it.

```tsx
const [openIds, setOpenIds] = useState<string[]>(['notes']);

<Accordion
  openIds={openIds}
  onOpenChange={setOpenIds}
  items={[
    { id: 'notes', title: 'Listening notes', content: <p>A reading of the arrangement.</p> },
    { id: 'sources', title: 'Sources', content: <p>Links to the original references.</p> },
  ]}
/>
```

When `openIds` is supplied, the parent must apply `onOpenChange` to change the controlled state. Otherwise, the component stores its own state beginning at `defaultOpenIds`. With the default `multiple={false}`, at most the first valid open ID is used. Set `multiple` to keep several items open. IDs absent from the current `items` list are ignored. Disabled summaries cannot be activated by pointer or keyboard; already-open content remains readable.

### Breadcrumbs

`items` is a readonly list of `{ label, href? }`. The final item is always plain text with `aria-current="page"`. Earlier items become links only when they have an `href`. Separators are decorative and hidden from assistive technology; the ordered-list structure remains available. Long paths wrap rather than widening the document.

```tsx
<Breadcrumbs items={[
  { label: 'Record', href: '#archive' },
  { label: 'System', href: '#system' },
  { label: 'Components' },
]}/>
```

### Pagination

Pages are **one-based**. The callback only emits a valid, different page and never fires for a disabled control. First/last controls disable at the boundaries. Larger collections show the first page, a three-page window around the current page, the last page and decorative omission markers.

```tsx
const pageCount = Math.ceil(items.length / pageSize);
const visibleItems = items.slice((page - 1) * pageSize, page * pageSize);

<Pagination page={page} pageCount={pageCount} onPageChange={setPage}/>
```

The component normalizes non-finite counts to zero, floors fractional counts and clamps the rendered active page. A zero-page collection renders “No pages” with both directions disabled. The parent should reset its own page when filtering changes the collection; pagination does not mutate parent data. Current-page indication uses `aria-current="page"` and text emphasis. At narrow widths, the direction labels become accessible icon controls while retaining 44px targets.

## Progress, contributors and feedback

`Progress` uses a native `<progress>` element with an associated label. A finite `value` is clamped to `[0, max]`. Omitting `value`, or passing a non-finite value, produces an indeterminate indicator without a `value` attribute or a fabricated `aria-valuenow`. `max` must be positive; invalid bounds normalize to a valid limit.

```tsx
<Progress label="Sources checked" value={7} max={12} valueText="7 of 12 sources"/>
<Progress label="Waiting for the next source"/>
```

`valueText` provides an accessible human-readable value and, unless `showValue={false}`, visible text. Progress is a status indicator; it does not start work or imply an active fetch by itself.

`Avatar` displays a local or supplied image when it loads and initials when no image exists or loading fails. `name` supplies the accessible name in both states. A changed `src` retries the new image. Sizes are `sm` (28px), `md` (36px) and `lg` (52px). It is a non-interactive identity mark, so the image dimensions are not a touch target. Wrap it in a separately labeled link or button when navigation is needed.

`AvatarGroup` receives `people: readonly AvatarProps[]`. It shows up to `max` entries and an overflow count. The overflow mark's accessible name contains the hidden contributors' names, so “+2” does not lose that information. The group wraps when necessary.

```tsx
<AvatarGroup
  label="Sample contributors"
  max={3}
  people={[
    { name: 'Rae Morgan' },
    { name: 'Mika Park' },
    { name: 'Robin Vale' },
    { name: 'Jo Ellis' },
  ]}
/>
```

`Notice` accepts `info`, `success`, `warning` or `error`. Information, success and warning notices use a polite status region; an error uses an alert. Icons supplement the title and message rather than carrying the only distinction. When `onDismiss` is supplied, the component provides an accessible 44px dismiss control; the caller removes or hides the notice.

```tsx
{showNotice && <Notice
  title="Your place is kept."
  tone="success"
  onDismiss={() => setShowNotice(false)}
>
  Return to this passage whenever you need it.
</Notice>}
```

## Copyable code, loading and key labels

`CopyButton` calls `navigator.clipboard.writeText(text)` from the user's click. It prevents repeat attempts while that call is pending, announces success, and resets the successful label after 2.2 seconds. Clipboard absence, denied permission and write failure produce a visible message asking the reader to select the text manually. It does not claim success when copying failed and does not use a hidden `execCommand` fallback. `onCopy` is a completion callback after a successful write, not the native clipboard-event handler.

`CodeBlock` renders escaped React text inside native `pre` and `code`, with a caption and optional `CopyButton`. It does not interpret HTML or execute the code. The code region is keyboard-focusable and scrollable. `wrap` changes it to `pre-wrap` with breakable long lines; its default preserves code formatting and allows horizontal scrolling within the code region. No syntax-highlighting dependency is added.

```tsx
<CodeBlock
  label="Install the project"
  language="sh"
  code={'npm ci\nnpm run dev'}
/>
<CopyButton text="npm run test:pretext" label="Copy test command"/>
```

`Skeleton` is a static loading placeholder, with one screen-reader status message and decorative lines. Its line count is bounded to 1–12 and the final line width defaults to `62%`. It adds no pulse or shimmer, including for reduced-motion users. The parent decides when to replace it with real content.

`Kbd` is semantic `<kbd>` markup for keyboard instructions. It is not a button and does not register shortcuts:

```tsx
<p>Press <Kbd>Tab</Kbd> to move between controls.</p>
```

## Responsive and integration notes

- Form fields use 16px input text. Visible controls and links have a minimum 44px touch target; non-interactive avatars, key labels and progress bars remain appropriately smaller.
- Component layouts can wrap. The example gallery becomes one column below 700px, independently of the product's navigation layout.
- Focus rings use the existing shared tokens. Native inputs and explicit switch styling include forced-colors support.
- The switch is the only added control with a spatial transition, and it respects `prefers-reduced-motion`. Skeletons stay still.
- Component styles are scoped to `ds-*` classes. These additions introduce no sidebar, navigation fill, page partition rules or outer card containers.
- Browser observations and the scope of completed verification belong in the project's [verification record](verification.md). This API specification alone is not a claim that every browser or physical device has been tested.
