# @forge-form/angular — Complete Library Reference

**Version:** 1.2.1 · **License:** MIT

> **Purpose of this document:** This is the authoritative technical reference for the `@forge-form/angular` library, prepared as a source document for building user-facing documentation. It covers every public API, all schema models, styling hooks, and extension points, with annotated code examples throughout. Everything described here works; what doesn't exist yet is summarized in [Planned Features](#planned-features).

---

## Table of Contents

1. [What Is This Library?](#what-is-this-library)
2. [Installation & Peer Dependencies](#installation--peer-dependencies)
3. [Quick Start](#quick-start)
4. [Core Concept: Schema-Driven Forms](#core-concept-schema-driven-forms)
5. [Schema Reference](#schema-reference)
   - [FormSchema](#formschema)
   - [GroupFieldSchema](#groupfieldschema)
   - [ControlSchema variants](#controlschema-variants)
   - [FormOptions / ElementFormOptions / FormFieldOptions](#formoptions--elementformoptions--formfieldoptions)
   - [UpdateOn](#updateon)
6. [Reading Live Form State](#reading-live-form-state)
7. [Validators](#validators)
   - [Built-in validator helpers](#built-in-validator-helpers)
   - [Custom validators](#custom-validators)
   - [Error messages on validators](#error-messages-on-validators)
8. [Error Messages System](#error-messages-system)
   - [Default error messages](#default-error-messages)
   - [Overriding error messages globally](#overriding-error-messages-globally)
   - [Custom error components](#custom-error-components)
9. [Hint Messages System](#hint-messages-system)
   - [String hints](#string-hints)
   - [Custom hint components](#custom-hint-components)
10. [Conditional Visibility](#conditional-visibility)
11. [Custom Field Renderers](#custom-field-renderers)
12. [Styling](#styling)
    - [Layout SCSS](#layout-scss)
    - [Default theme](#default-theme)
    - [CSS custom properties](#css-custom-properties)
    - [CSS class reference](#css-class-reference)
13. [Public API Surface (exports)](#public-api-surface-exports)
14. [Architecture Overview](#architecture-overview)
15. [Full Working Example](#full-working-example)
16. [Known Limitations](#known-limitations)
17. [Planned Features](#planned-features)

---

## Known Limitations

| Area                                                                      | Status                                                                                          |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [Custom field renderers](#custom-field-renderers)                         | **Not supported.** The usable field types are the four built-ins. Planned — see [Planned Features](#planned-features). |
| [Global error overrides](#overriding-error-messages-globally)             | **Not supported.** Set `errorMessage` per validator (a factory makes this reusable). Planned — see [Planned Features](#planned-features). |
| [Group `labelOrientation`](#groupfieldschema)                             | **Ignored.** Groups apply only `orientation`.                                                    |

> **Breaking changes since 1.1.1:**
>
> - [`visibility.fn` polarity](#conditional-visibility) has been inverted to match its name — `true` now **shows**/enables, `false` hides/disables. Predicates written for ≤1.1.1 must be negated. `clearOnHide` is also functional now.
> - The DI tokens `RENDERERS`, `ERROR_MESSAGES`, `DEFAULT_ERROR_FALLBACK`, and `FORM_OPTIONS` (plus `RendererRegistry`, `RendererDef`, `FieldRenderer`, `ErrorMessage`, `DEFAULT_ERROR_MESSAGES`) are **no longer exported**. They never worked as extension points — anything an app provided was silently shadowed by the library's own component-level providers. The capabilities are planned to return through a supported configuration API; see [Planned Features](#planned-features).

**Working as documented** (spot-checked against the build): `value()` / `valid()` signals, `options.hideSubmitButton`, all five built-in validators and their default message text, per-validator `errorMessage` (string / function / component), `customValidator` key matching, string and component hints with `FormFieldContextComponent` context, `initialValue`, `updateOn` (field overriding form), flat unique `controlName`s across groups, `formSubmit` firing only when valid, and `theme: 'default'`.

---

## Planned Features

Not implemented — do not document these as available:

- **Custom field renderers** *(top priority)* — registering application-defined renderers for new `type` strings through a supported configuration API.
- **App-wide error message overrides** — replacing the default validation texts (and the `'Invalid field'` fallback) once per application.
- **Group-level `labelOrientation`** — groups applying label placement to the fields they contain.
- **Accessibility follow-ups** — `aria-describedby` for hints/errors, `aria-invalid`, live-region announcements of validation changes.

---

## What Is This Library?

`@forge-form/angular` is a **schema-driven, signal-based reactive form engine** for Angular (v21+). You declare your entire form—fields, groups, validators, hints, error messages, layout, and conditional visibility—as a plain TypeScript object ([`FormSchema`](#formschema)). The engine builds the underlying Angular `FormGroup`, renders the controls, wires validation, and emits a strongly-typed value on submit.

Key design decisions:

- **Schema-first** — No template code needed for the form structure.
- **Signal-based** — Internal state uses Angular signals with `OnPush` change detection throughout.
- **Reactive Forms under the hood** — Angular's `FormGroup` / `FormControl` are used internally; they are not exposed to consumer templates.
- **Standalone components** — No `NgModule` required anywhere in the library.
- **Extensible** — Custom error components and custom hint components, passed through the schema. (Custom field renderers and global error overrides are not supported yet; both are planned — see [Planned Features](#planned-features).)

---

## Installation & Peer Dependencies

```bash
npm install @forge-form/angular
```

| Peer dependency   | Required version |
| ----------------- | ---------------- |
| `@angular/core`   | `^21.2.0`        |
| `@angular/common` | `^21.2.0`        |
| `@angular/forms`  | `^21.2.0`        |
| `rxjs`            | `^7.8.0`         |

---

## Quick Start

```ts
// user-form.component.ts
import { Component } from '@angular/core';
import { FormRendererComponent, FormSchema, required, minLength } from '@forge-form/angular';

interface UserModel {
  firstName: string;
  age: number;
}

@Component({
  selector: 'app-user-form',
  imports: [FormRendererComponent],
  template: `
    <forge-form-angular [schema]="schema" (formSubmit)="onSubmit($event)" />
  `,
})
export class UserFormComponent {
  schema: FormSchema = {
    updateOn: 'blur',
    options: { orientation: 'column', theme: 'default' },
    controls: [
      {
        type: 'text',
        controlName: 'firstName',
        label: 'First name',
        placeholder: 'Enter your first name',
        validators: [required(), minLength({ value: 3 })],
      },
      {
        type: 'number',
        controlName: 'age',
        label: 'Age',
        validators: [required()],
      },
    ],
  };

  onSubmit(value: UserModel) {
    console.log('Submitted', value);
  }
}
```

**Important:** You do **not** need to provide `FormRendererComponent` with any module. Import it directly as a standalone component. No additional `providers` are required at the application level for basic usage.

---

## Core Concept: Schema-Driven Forms

The entire form is described by a [`FormSchema`](#formschema) object. This object drives:

1. **Control creation** — the engine creates `FormControl` instances for each field.
2. **Validation** — validators are attached to controls at build time.
3. **Layout** — orientation (`row`/`column`) for forms, groups, and individual fields.
4. **Rendering** — each control's `type` maps to a renderer component via a registry.
5. **Visibility** — each control can declare a visibility function that shows/hides or enables/disables it reactively.
6. **Hints & Errors** — each control can declare a hint and/or per-validator error messages.

The [`FormSchema`](#formschema) is consumed by `<forge-form-angular>` which handles everything internally.

---

## Schema Reference

### `FormSchema`

The root object passed to `[schema]`.

```ts
interface FormSchema {
  controls: (GroupFieldSchema | ControlSchema)[];
  id?: string; // rendered as the <form> element's id attribute
  updateOn?: UpdateOn;
  options?: FormOptions;
}
```

| Property   | Type                                                                                      | Required | Description                                                              |
| ---------- | ----------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `controls` | ([`GroupFieldSchema`](#groupfieldschema) \| [`ControlSchema`](#controlschema-variants))[] | Yes      | Ordered list of top-level fields and/or groups.                          |
| `id`       | `string`                                                                                  | No       | Rendered as the `id` attribute of the `<form>` element; omitted when unset. |
| `updateOn` | `'change' \| 'blur' \| 'submit'`                                                          | No       | Default update strategy for all controls. Can be overridden per-control. |
| `options`  | [`FormOptions`](#formoptions--elementformoptions--formfieldoptions)                       | No       | Layout orientation and visual theme for the whole form.                  |

> Use `id` when you need a stable DOM hook on the `<form>` itself — e.g. an external submit button (`<button form="checkout-form">`), a test selector, or an anchor. When `id` is not set, no `id` attribute is rendered.

---

### `GroupFieldSchema`

Groups nest one or more controls (or sub-groups) in a row or column layout without adding a `FormControl` themselves.

```ts
interface GroupFieldSchema extends BaseElementSchema {
  type: 'group';
  controls: (GroupFieldSchema | ControlSchema)[];
  options?: ElementFormOptions; // only `orientation` is applied
}
```

> **Note:** Groups are purely visual containers. All controls inside a group share the same flat `FormGroup` at the root level—there are no nested `FormGroup` instances. The `controlName` of each control inside a group must still be unique across the entire form.

> **A group only applies `orientation`.** Although `ElementFormOptions` also carries `labelOrientation`, `GroupRendererComponent` reads nothing but `options.orientation` (to build its `forge-form-group--*` class), and `FormFieldComponent` resolves label placement as **field → form → default**, never consulting the enclosing group. `labelOrientation` set on a group is silently ignored — set it per field, or at the form level.

**Example — side-by-side first/last name:**

```ts
{
  type: 'group',
  options: { orientation: 'row' },
  controls: [
    { type: 'text', controlName: 'firstName', label: 'First Name', options: { width: '250px' } },
    { type: 'text', controlName: 'lastName',  label: 'Last Name',  options: { width: '250px' } },
  ],
}
```

---

### `ControlSchema` variants

`ControlSchema` is a discriminated union:

```ts
type ControlSchema = TextControlSchema | NumberControlSchema | CheckboxControlSchema | SelectControlSchema;
```

All variants extend `BaseControlSchema`:

```ts
interface BaseControlSchema extends BaseElementSchema {
  controlName: string; // Unique key; used as FormControl name
  options?: FormFieldOptions; // width, orientation, labelOrientation
  initialValue?: unknown; // Initial value for the FormControl
  validators?: ValidatorSchema[];
  visibility?: VisibilitySchema;
  updateOn?: UpdateOn; // Overrides schema-level updateOn
  hint?: HintMessage; // string | HintComponentDef
}
```

#### `TextControlSchema` — `type: 'text'`

```ts
interface TextControlSchema extends BaseControlSchema {
  type: 'text';
  placeholder?: string;
}
```

Renders as `<input type="text">`.

| Property      | Description                                          |
| ------------- | ---------------------------------------------------- |
| `placeholder` | Input placeholder. Falls back to `label` if omitted. |

---

#### `NumberControlSchema` — `type: 'number'`

```ts
interface NumberControlSchema extends BaseControlSchema {
  type: 'number';
  placeholder?: string;
  min?: number; // Sets the HTML min attribute (visual only)
  max?: number; // Sets the HTML max attribute (visual only)
}
```

Renders as `<input type="number">`.

> **Note:** `min` / `max` on the schema set the HTML `min`/`max` attributes for browser UX. To enforce them as validation rules use `min()` / `max()` validators in the `validators` array.

---

#### `CheckboxControlSchema` — `type: 'checkbox'`

```ts
interface CheckboxControlSchema extends BaseControlSchema {
  type: 'checkbox';
}
```

Renders as `<input type="checkbox">`. The control value is `true` / `false`.

> **Tip:** Use `updateOn: 'change'` on a checkbox to ensure instant reactivity since checkboxes do not blur naturally.

---

#### `SelectControlSchema` — `type: 'select'`

```ts
interface SelectControlSchema extends BaseControlSchema {
  type: 'select';
  items: SelectOption[];
  placeholder?: string;
}

interface SelectOption {
  label: string; // Display text
  value: string; // Submitted value
}
```

Renders as `<select>` with `<option>` elements. If `placeholder` or `label` is set, a disabled placeholder option is rendered first.

---

### `FormOptions` / `ElementFormOptions` / `FormFieldOptions`

```ts
// Used in FormSchema.options
interface FormOptions {
  orientation?: 'row' | 'column'; // Layout direction of top-level controls
  labelOrientation?: 'row' | 'column'; // Label position relative to input
  theme?: 'none' | 'default'; // Visual theme; 'default' applies CSS variables
  hideSubmitButton?: boolean; // Suppresses the built-in submit button
}

// Used in GroupFieldSchema.options
type ElementFormOptions = {
  orientation?: 'row' | 'column';
  labelOrientation?: 'row' | 'column'; // present on the type, but IGNORED on groups
};

// Used in BaseControlSchema.options
interface FormFieldOptions {
  orientation?: 'row' | 'column';
  labelOrientation?: 'row' | 'column';
  width?: number | string; // Sets inline width of the field container
}
```

**`hideSubmitButton`:** When set to `true` on [`FormSchema.options`](#formschema), the built-in `<button class="forge-form-button">` is omitted entirely (not just disabled). Use this when you want to drive submission yourself, e.g. from an external button paired with the `valid` signal described below.

```ts
options: {
  hideSubmitButton: true;
}
```

---

### `UpdateOn`

```ts
const UPDATE_ON = {
  change: 'change',
  blur: 'blur',
  submit: 'submit',
} as const;

type UpdateOn = 'change' | 'blur' | 'submit';
```

Can be set at the `FormSchema` level (applies to all controls) or overridden per individual control.

---

## Reading Live Form State

`FormRendererComponent` exposes two read-only signals — `value` and `valid` — that track the form's current state on every change, not just on submit. Access them via a template reference variable on the `<forge-form-angular>` element:

```html
<forge-form-angular #userForm [schema]="schema" (formSubmit)="onSubmit($event)" />

<pre>{{ userForm.value() | json }}</pre>
<span>Valid: {{ userForm.valid() }}</span>
```

| Signal  | Type                     | Description                                                                                                                       |
| ------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `value` | `Signal<TModel \| null>` | Current value of the underlying `FormGroup`, updated on every `valueChanges` emission. `null` before the form has been built.     |
| `valid` | `Signal<boolean>`        | Current validity of the underlying `FormGroup`, updated on every `valueChanges` emission. `false` before the form has been built. |

This is useful for driving UI outside the form (e.g. a live preview, an externally-placed submit button) without waiting for `(formSubmit)`. Combine with `options.hideSubmitButton` (see [FormOptions](#formoptions--elementformoptions--formfieldoptions)) to fully replace the built-in submit button with your own, gated on the `valid` signal.

---

## Validators

### Built-in validator helpers

All helpers are imported from `@forge-form/angular` and return a `ValidatorSchema`.

```ts
import { required, minLength, maxLength, min, max, customValidator } from '@forge-form/angular';
```

| Helper              | Parameters                                              | Description                   |
| ------------------- | ------------------------------------------------------- | ----------------------------- |
| `required()`        | `credentials?` (only `errorMessage`)                    | Field is required.            |
| `minLength()`       | `{ value: number, errorMessage? }`                      | Minimum string length.        |
| `maxLength()`       | `{ value: number, errorMessage? }`                      | Maximum string length.        |
| `min()`             | `{ value: number, errorMessage? }`                      | Minimum numeric value.        |
| `max()`             | `{ value: number, errorMessage? }`                      | Maximum numeric value.        |
| `customValidator()` | `{ key: string, fn: ValidatorFunction, errorMessage? }` | Custom Angular `ValidatorFn`. |

**Example:**

```ts
validators: [required(), minLength({ value: 3, errorMessage: 'Too short' }), maxLength({ value: 100 }), min({ value: 0, errorMessage: 'Must be positive' }), max({ value: 120 })];
```

---

### Custom validators

Use `customValidator` with a unique `key` string and a standard Angular `ValidatorFn`:

```ts
customValidator({
  key: 'mustBeEven',
  fn: (control) => {
    const v = Number(control.value);
    return v % 2 === 0 ? null : { mustBeEven: true };
  },
  errorMessage: 'Value must be an even number',
});
```

The `key` is used to match the error key returned by the validator function. The same `key` must appear in the `ValidationErrors` object returned by `fn` for the error message to be displayed.

---

### Error messages on validators

Each validator helper accepts an optional `errorMessage` parameter of type `ErrorMessageContent`:

```ts
type ErrorMessageContent =
  | string // Static string
  | ((error: ValidationErrors) => string) // Function receiving the error object
  | ErrorComponentDef; // Custom component

interface ErrorComponentDef {
  component: Type<unknown>;
  inputs?: (data: unknown) => Record<string, unknown>;
}
```

**String:**

```ts
required({ errorMessage: 'This field cannot be empty' });
```

**Function** (receives the Angular `ValidationErrors` value for that key):

```ts
minLength({ value: 3, errorMessage: (err) => `Minimum ${err['requiredLength']} characters` });
```

**Custom component:**

```ts
min({
  value: 18,
  errorMessage: {
    component: AgeErrorComponent,
    inputs: () => ({ message: 'You must be at least 18' }),
  },
});
```

> **Priority:** A `errorMessage` on the validator itself takes precedence over any globally registered error message for that type.

---

## Error Messages System

### Default error messages

The engine ships with built-in messages for all standard validator types:

| Validator type | Default message                        |
| -------------- | -------------------------------------- |
| `required`     | `'This field is required'`             |
| `minlength`    | `'Minimum length is {requiredLength}'` |
| `maxlength`    | `'Maximum length is {requiredLength}'` |
| `min`          | `'Minimum value is {min}'`             |
| `max`          | `'Maximum value is {max}'`             |

If no message is found anywhere, a fallback `'Invalid field'` string is used.

---

### Overriding error messages globally

> **Not supported.** There is no app-wide error message registry in the public API. (Versions ≤1.1.1 exported `ERROR_MESSAGES` / `DEFAULT_ERROR_FALLBACK` DI tokens for this, but they never worked — app-provided values were shadowed by the library's internal providers — and they have been removed from the public API. A working replacement is planned; see [Planned Features](#planned-features).)

**What works instead:** set `errorMessage` on the validator itself — it is read from the schema and takes precedence over the built-in defaults:

```ts
validators: [required({ errorMessage: 'Required!' })];
```

To apply one message consistently across the app, wrap the validator in a factory and reuse it:

```ts
export const requiredField = () => required({ errorMessage: 'Required!' });
```

---

### Custom error components

An error component is any Angular component. It receives whatever `inputs` the `ErrorComponentDef.inputs` function returns. No base class is required.

```ts
// my-error.component.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-my-error',
  template: `
    <strong>{{ message() }}</strong>
  `,
})
export class MyErrorComponent {
  message = input.required<string>();
}
```

Reference from a validator:

```ts
validators: [
  min({
    value: 18,
    errorMessage: {
      component: MyErrorComponent,
      inputs: (err) => ({ message: `Must be at least ${err['min']}` }),
    },
  }),
];
```

The `inputs` function receives the raw `ValidationErrors` value for that error key and must return a `Record<string, unknown>`.

---

## Hint Messages System

Hints are displayed beneath the input when there are **no validation errors** on the control.

### String hints

```ts
{
  type: 'text',
  controlName: 'email',
  label: 'Email',
  hint: 'We will never share your email address.',
}
```

Renders as `<span class="forge-form-hint">`.

---

### Custom hint components

Provide a `HintComponentDef`:

```ts
interface HintComponentDef {
  component: Type<unknown>;
  inputs?: Record<string, unknown>; // Static inputs merged with context inputs
}
```

```ts
hint: {
  component: CharCounterComponent,
  inputs: { maxLength: 100 },
}
```

The engine **automatically merges** the following context inputs into custom hint components (in addition to any `inputs` you provide):

| Input           | Type                                       | Description                          |
| --------------- | ------------------------------------------ | ------------------------------------ |
| `control`       | `AbstractControl`                          | The Angular form control instance.   |
| `controlValue`  | `unknown`                                  | The current value of the control.    |
| `controlErrors` | `ValidationErrors \| null`                 | Current validation errors (if any).  |
| `controlSchema` | [`ControlSchema`](#controlschema-variants) | The schema definition of this field. |

To get full TypeScript support for these context inputs, extend `FormFieldContextComponent`:

```ts
import { Component, computed, input } from '@angular/core';
import { FormFieldContextComponent } from '@forge-form/angular';

@Component({
  selector: 'app-char-counter',
  template: `
    {{ currentLength() }} / {{ maxLength() }}
  `,
})
export class CharCounterComponent extends FormFieldContextComponent {
  maxLength = input<number>();
  currentLength = computed(() => (this.controlValue() as string | undefined)?.length ?? 0);
}
```

`FormFieldContextComponent` exposes these typed `input()` signals:

| Signal          | Type                       |
| --------------- | -------------------------- |
| `control`       | `AbstractControl<T>`       |
| `controlValue`  | `T`                        |
| `controlErrors` | `ValidationErrors \| null` |
| `controlSchema` | `unknown`                  |

> **Note:** `FormFieldContextComponent` is an abstract `@Directive`. It does **not** add a selector or template—it is purely a base class for typed input signals.

---

## Conditional Visibility

Each control can declare a `visibility` property:

```ts
interface VisibilitySchema {
  fn: VisibilityFunction; // Returns true = visible/enabled, false = hidden/disabled
  behavior: VisibilityBehavior; // 'hide' | 'disable'
  clearOnHide?: boolean; // Reset the value on the transition to hidden
}

type VisibilityFunction = (context: VisibilityContext) => boolean;

interface VisibilityContext {
  value: unknown; // Current form value
  form: FormGroup; // The root FormGroup
  control: AbstractControl; // This control's AbstractControl
}
```

> **`fn` answers "is this field visible?"** Returning `true` renders or enables the control; returning `false` hides or disables it.
>
> ⚠️ **Breaking change since 1.1.1**, where the polarity was inverted (`true` removed the field). Predicates written for ≤1.1.1 must be negated.

### Behavior modes

| Behavior    | Effect when `fn` returns `false`                                                           | When `fn` returns `true` |
| ----------- | ------------------------------------------------------------------------------------------ | ------------------------- |
| `'hide'`    | The field container is removed from the DOM (`@if` block) **and** the `FormControl` is disabled — excluded from validation and from `form.value`. | The field is rendered and the control re-enabled. |
| `'disable'` | The `FormControl` is disabled (excluded from validation and from form value on submit).     | The control is enabled.   |

**Implementation:** `FormFieldComponent.showControl` mirrors `visibilityResolved()` for `behavior: 'hide'`, so a falsy `fn` removes the `@if` block. For **both** behaviors, `FormService.applyVisibility` disables the control on the `visible === false` branch (and refreshes the `value` / `valid` signals, since the toggle uses `emitEvent: false`), so a hidden `required` field cannot invisibly block submit.

### `clearOnHide`

Resets the control's value (via `control.reset(null)`) on the **transition** to hidden, for either behavior. Two boundary cases:

- A field that *starts* hidden is **not** cleared — there is no transition, so its initial value is retained (and excluded from the payload) until the field is shown.
- Without `clearOnHide`, a hidden field keeps its value internally and it **returns when the field reappears**.

**Example — show a field only when another is valid:**

```ts
{
  type: 'select',
  controlName: 'gender',
  label: 'Gender',
  items: [
    { value: 'female', label: 'Female' },
    { value: 'male',   label: 'Male'   },
  ],
  visibility: {
    // visible once firstName is valid
    fn: (ctx) => ctx.form.get('firstName')?.valid === true,
    behavior: 'hide',
  },
}
```

---

## Custom Field Renderers

> **Not supported.** The usable field types are the four built-ins: `text`, `number`, `checkbox`, `select`. A schema using any other `type` string throws at render time:
>
> ```
> Error: No renderer for type: color
> ```
>
> Custom renderer registration is the **top item in [Planned Features](#planned-features)**. (Versions ≤1.1.1 exported `RENDERERS` / `RendererRegistry` / `RendererDef` / `FieldRenderer` for this, but registration never worked — app-provided renderers were shadowed by the library's internal providers — and those symbols have been removed from the public API.)

The extension points that **do** work are per-schema rather than DI-based: [custom error components](#custom-error-components) via a validator's `errorMessage`, and [custom hint components](#hint-messages-system) via a field's `hint`.

---

## Styling

### Layout SCSS

Import to get the flexbox layout classes (no visual styling, just structure):

```scss
// styles.scss
@use '@forge-form/angular/styles' as forge;
```

Or in `angular.json`:

```json
"styles": ["node_modules/@forge-form/angular/styles/index.scss"]
```

### Default theme

Import the default visual theme additionally:

```scss
@use '@forge-form/angular/styles' as forge;
@use '@forge-form/angular/styles/default' as forge-theme;
```

Or in `angular.json`:

```json
"styles": [
  "node_modules/@forge-form/angular/styles/index.scss",
  "node_modules/@forge-form/angular/styles/default.scss"
]
```

Then set `theme: 'default'` in [`FormSchema.options`](#formschema):

```ts
options: {
  theme: 'default';
}
```

This adds the `.forge-theme-default` class to the `<form>` element.

---

### CSS custom properties

The default theme exposes these CSS custom properties (scoped to `.forge-theme-default`):

| Property                 | Default value        | Used for                     |
| ------------------------ | -------------------- | ---------------------------- |
| `--forge-gap-small-xx`   | `2px`                | Field container gap          |
| `--forge-gap-small-x`    | `0.25rem`            | —                            |
| `--forge-gap-small`      | `0.5rem`             | Form gap between controls    |
| `--forge-gap-medium`     | `0.75rem`            | Group gap between fields     |
| `--forge-border-radius`  | `0.25rem`            | Input / button border radius |
| `--forge-color-label`    | `#202020`            | Label and hint text color    |
| `--forge-color-border`   | `rgba(32,32,32,0.5)` | Input border color           |
| `--forge-color-disabled` | `#b6b6b6`            | Disabled button text/border  |
| `--forge-color-error`    | `#b60000`            | Error message text color     |

Override any variable to customize the theme without touching the library code:

```css
forge-form-angular {
  --forge-color-error: #cc0000;
  --forge-border-radius: 0.5rem;
}
```

---

### CSS class reference

| CSS class                             | Element                                  | Notes                                                                                      |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `.forge-form`                         | `<form>`                                 | Root form element                                                                          |
| `.forge-form--row`                    | `<form>`                                 | When `options.orientation = 'row'`                                                         |
| `.forge-form--column`                 | `<form>`                                 | When `options.orientation = 'column'`                                                      |
| `.forge-theme-default`                | `<form>`                                 | Added when `options.theme = 'default'`                                                     |
| `.forge-form-group`                   | Group container `<div>`                  |                                                                                            |
| `.forge-form-group--row`              | Group container `<div>`                  | When group `options.orientation = 'row'`                                                   |
| `.forge-form-group--column`           | Group container `<div>`                  |                                                                                            |
| `.forge-form-field-container`         | Per-field wrapper `<div>`                |                                                                                            |
| `.forge-form-field-container--row`    | Per-field wrapper `<div>`                | When `labelOrientation = 'row'`                                                            |
| `.forge-form-field-container--column` | Per-field wrapper `<div>`                | When `labelOrientation = 'column'`                                                         |
| `.forge-form-field-label`             | `<label>` for the label text             | Carries `for` pointing at the control's `controlName` (the input's `id`).                  |
| `.forge-form-input`                   | `<input type="text/number">`             |                                                                                            |
| `.forge-form-input-error`             | `<input type="text/number">`, `<select>` | Added when the control is invalid and `touched`. Style without the default theme.          |
| `.forge-form-checkbox`                | `<input type="checkbox">`                |                                                                                            |
| `.forge-form-checkbox-error`          | `<input type="checkbox">`                | Added when the control is invalid and `dirty`.                                             |
| `.forge-form-select`                  | `<select>`                               |                                                                                            |
| `.forge-form-hint`                    | `<span>` for string hints                |                                                                                            |
| `.forge-form-error`                   | `<span>` for string error msgs           |                                                                                            |
| `.forge-form-button`                  | Submit `<button>`                        | Disabled when form is invalid. Omitted entirely when `options.hideSubmitButton` is `true`. |

---

## Public API Surface (exports)

Everything exported from `@forge-form/angular`:

### Components & Directives

| Export                      | Description                                                    |
| --------------------------- | -------------------------------------------------------------- |
| `FormRendererComponent`     | Main entry component. `[schema]` input, `(formSubmit)` output. |
| `FormFieldContextComponent` | Abstract base class for custom hint/error components.          |

### Schema models (types)

| Export                                                           | Description                                 |
| ---------------------------------------------------------------- | ------------------------------------------- |
| [`FormSchema`](#formschema)                                      | Root schema object                          |
| [`GroupFieldSchema`](#groupfieldschema)                          | Group container schema                      |
| [`ControlSchema`](#controlschema-variants)                       | Union of all control schema types           |
| `BaseElementSchema`                                              | Base with `type` and `label`                |
| [`BaseControlSchema`](#controlschema-variants)                   | Base with `controlName`, `validators`, etc. |
| [`TextControlSchema`](#textcontrolschema--type-text)             | Schema for `type: 'text'`                   |
| [`NumberControlSchema`](#numbercontrolschema--type-number)       | Schema for `type: 'number'`                 |
| [`CheckboxControlSchema`](#checkboxcontrolschema--type-checkbox) | Schema for `type: 'checkbox'`               |
| [`SelectControlSchema`](#selectcontrolschema--type-select)       | Schema for `type: 'select'`                 |
| [`SelectOption`](#selectcontrolschema--type-select)              | `{ label: string, value: string }`          |

### Options models (types + constants)

| Export                                                                     | Description                                     |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| [`FormOptions`](#formoptions--elementformoptions--formfieldoptions)        | Form-level options type                         |
| [`ElementFormOptions`](#formoptions--elementformoptions--formfieldoptions) | Group-level options type                        |
| [`FormFieldOptions`](#formoptions--elementformoptions--formfieldoptions)   | Field-level options type                        |
| `OrientationOption`                                                        | `'row' \| 'column'`                             |
| `ThemeOption`                                                              | `'none' \| 'default'`                           |
| `ORIENTATION_OPTIONS`                                                      | `{ row: 'row', column: 'column' }` constant     |
| `THEMES`                                                                   | `{ none: 'none', default: 'default' }` constant |

### Update-on

| Export                   | Description                         |
| ------------------------ | ----------------------------------- |
| [`UPDATE_ON`](#updateon) | `{ change, blur, submit }` constant |
| [`UpdateOn`](#updateon)  | `'change' \| 'blur' \| 'submit'`    |

### Visibility

| Export                                          | Description                                     |
| ----------------------------------------------- | ----------------------------------------------- |
| [`VisibilitySchema`](#conditional-visibility)   | Visibility config type (`fn`, `behavior`, etc.) |
| [`VisibilityFunction`](#conditional-visibility) | `(ctx: VisibilityContext) => boolean`           |
| [`VisibilityBehavior`](#conditional-visibility) | `'hide' \| 'disable'`                           |
| [`VisibilityContext`](#conditional-visibility)  | `{ value, form, control }` passed to `fn`       |
| `VISIBILITY_BEHAVIORS`                          | `{ hide: 'hide', disable: 'disable' }` constant |

### Validators

| Export                     | Description                                                     |
| -------------------------- | --------------------------------------------------------------- |
| `required()`               | Required validator helper                                       |
| `minLength()`              | Min-length validator helper                                     |
| `maxLength()`              | Max-length validator helper                                     |
| `min()`                    | Min-value validator helper                                      |
| `max()`                    | Max-value validator helper                                      |
| `customValidator()`        | Custom `ValidatorFn` helper                                     |
| `ValidatorCredentials`     | Input type for all validator helpers                            |
| `ValidatorSchema`          | Union of all validator schema types                             |
| `ValidatorType`            | `'required' \| 'minlength' \| ...`                              |
| `ValidatorFunction`        | Angular `ValidatorFn` alias                                     |
| `BaseValidatorSchema`      | Base with `type` and `errorMessage`                             |
| `RequiredValidatorSchema`  | —                                                               |
| `MinLengthValidatorSchema` | Has `value: number`                                             |
| `MaxLengthValidatorSchema` | Has `value: number`                                             |
| `MinValidatorSchema`       | Has `value: number`                                             |
| `MaxValidatorSchema`       | Has `value: number`                                             |
| `CustomValidatorSchema`    | Has `key: string`, `fn: ValidatorFunction`                      |
| `VALIDATOR_TYPES`          | `{ required, minlength, maxlength, min, max, custom }` constant |

### Error messages

| Export                                                 | Description                                               |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [`ErrorMessageContent`](#error-messages-on-validators) | `string \| ((err) => string) \| ErrorComponentDef`        |
| [`ErrorComponentDef`](#error-messages-on-validators)   | `{ component: Type<unknown>, inputs?: (data) => Record }` |

### Hint messages

| Export                                        | Description                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| `HINT_TYPES`                                  | `{ text: 'text', custom: 'custom' }` constant                           |
| [`HintMessage`](#hint-messages-system)        | `string \| HintComponentDef`                                            |
| [`HintComponentDef`](#custom-hint-components) | `{ component: Type<unknown>, inputs?: Record<string, unknown> }`        |
| `HintContext`                                 | `{ control, value, errors }` (internal, not used by consumers directly) |
| `HintType`                                    | `'text' \| 'custom'`                                                    |

> **No DI tokens are exported.** The internal registries (`RENDERERS`, `ERROR_MESSAGES`, `DEFAULT_ERROR_FALLBACK`, `FORM_OPTIONS`, `RendererRegistry`) are implementation details. Versions ≤1.1.1 exported them as extension points, but they never worked and were removed; a supported replacement is planned — see [Planned Features](#planned-features).

---

## Architecture Overview

```
FormRendererComponent  ← consumer places this tag
  │  inputs: [schema]
  │  outputs: (formSubmit)
  │
  ├─ FormService         (per-component injectable)
  │    buildForm() via FormBuilderService
  │    applyVisibility()
  │    form signal (FormGroup | null)
  │    value signal (TModel | null)
  │
  ├─ FormBuilderService  (per-component injectable)
  │    Converts FormSchema → FormGroup
  │    Attaches Angular validators
  │
  ├─ RendererRegistry    (per-component injectable)
  │    Maps type string → component class
  │    Populated via RENDERERS multi-token
  │
  ├─ For each control in schema.controls:
  │    ├─ GroupRendererComponent  (if type === 'group')
  │    │    └─ Recurses with same FormGroup
  │    │
  │    └─ FormFieldComponent      (all other types)
  │         ├─ Resolves renderer component via RendererRegistry
  │         ├─ Computes labelOrientation (field > form > default)
  │         ├─ Computes visibilityResolved (calls visibility.fn reactively)
  │         ├─ Applies visibility behavior (hide DOM | disable control)
  │         ├─ NgComponentOutlet → renders the field renderer
  │         ├─ HintRendererComponent
  │         │    └─ HintMessageService
  │         └─ ErrorRendererComponent
  │              └─ ErrorMessageService
  │                   └─ ErrorMessageRegistry
```

---

## Full Working Example

This example demonstrates all major features: groups, validators with custom messages, hints with custom components, a custom component error, and conditional visibility.

```ts
// app.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormRendererComponent, FormSchema, FormFieldContextComponent, required, minLength, maxLength, min, customValidator } from '@forge-form/angular';
import { Component as NgComponent, input, computed } from '@angular/core';

// --- Custom hint component ---
@NgComponent({
  selector: 'app-char-counter',
  template: `{{ current() }} / {{ maxLength() }} characters`,
})
export class CharCounterComponent extends FormFieldContextComponent {
  maxLength = input<number>(0);
  current = computed(() => (this.controlValue() as string)?.length ?? 0);
}

// --- Custom error component ---
@NgComponent({
  selector: 'app-age-error',
  template: `<strong style="color:red">{{ message() }}</strong>`,
})
export class AgeErrorComponent {
  message = input.required<string>();
}

// --- Main form component ---
@Component({
  selector: 'app-root',
  imports: [FormRendererComponent],
  template: `
    <forge-form-angular [schema]="schema" (formSubmit)="onSubmit($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  schema: FormSchema = {
    updateOn: 'blur',
    options: {
      orientation: 'column',
      labelOrientation: 'column',
      theme: 'default',
    },
    controls: [
      // Group — first + last name side by side
      {
        type: 'group',
        options: { orientation: 'row' },
        controls: [
          {
            type: 'text',
            controlName: 'firstName',
            label: 'First Name',
            placeholder: 'Enter first name',
            updateOn: 'change',
            validators: [required(), minLength({ value: 3, errorMessage: 'Too short (min 3)' }), maxLength({ value: 50 })],
            hint: {
              component: CharCounterComponent,
              inputs: { maxLength: 50 },
            },
            options: { width: '200px' },
          },
          {
            type: 'text',
            controlName: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter last name',
            validators: [required(), minLength({ value: 2 })],
            hint: 'Your family name as it appears on official documents.',
            options: { width: '200px' },
          },
        ],
      },

      // Number field with custom error component
      {
        type: 'number',
        controlName: 'age',
        label: 'Age',
        min: 0,
        max: 120,
        validators: [
          required(),
          min({
            value: 18,
            errorMessage: {
              component: AgeErrorComponent,
              inputs: () => ({ message: 'You must be 18 or older.' }),
            },
          }),
        ],
        options: { width: '120px' },
      },

      // Checkbox with custom validator
      {
        type: 'checkbox',
        controlName: 'acceptTerms',
        label: 'I accept the Terms and Conditions',
        updateOn: 'change',
        validators: [
          customValidator({
            key: 'mustAccept',
            fn: (ctrl) => (ctrl.value === true ? null : { mustAccept: true }),
            errorMessage: 'You must accept the terms and conditions.',
          }),
        ],
        options: { labelOrientation: 'row' },
      },

      // Select — only visible when first AND last name are valid
      {
        type: 'select',
        controlName: 'gender',
        label: 'Gender',
        placeholder: 'Select one…',
        items: [
          { value: 'female', label: 'Female' },
          { value: 'male', label: 'Male' },
          { value: 'other', label: 'Other' },
        ],
        visibility: {
          // visible once both names are valid
          fn: (ctx) =>
            ctx.form.get('firstName')?.valid === true &&
            ctx.form.get('lastName')?.valid === true,
          behavior: 'hide',
          clearOnHide: true,
        },
        options: { width: '200px' },
      },
    ],
  };

  onSubmit(value: unknown) {
    console.log('Form value:', value);
  }
}
```

```scss
/* styles.scss */
@use '@forge-form/angular/styles' as forge;
@use '@forge-form/angular/styles/default' as forge-default;
```

---

_End of reference document. Version: 1.1.1 (2026-07-14). Author: Marcin Spasiński_
