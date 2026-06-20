# @forge-form/angular

Schema-driven, signal-based reactive forms for Angular. Describe your form as a
plain TypeScript object and let the engine build the `FormGroup`, render the
fields, wire up validation, hints, error messages, and conditional visibility.

- **Schema-first** — define controls, groups, validators, and layout declaratively.
- **Signal-based** — built on Angular signals with `OnPush` change detection.
- **Reactive Forms under the hood** — emits a strongly-typed value on submit.
- **Extensible** — custom error and hint components, theming via SCSS.
- **Standalone** — no NgModules required.

## Requirements

| Peer dependency   | Version   |
| ----------------- | --------- |
| `@angular/core`   | `^21.2.0` |
| `@angular/common` | `^21.2.0` |
| `@angular/forms`  | `^21.2.0` |
| `rxjs`            | `^7.8.0`  |

## Installation

```bash
npm install @forge-form/angular
```

## Quick start

Import `FormRendererComponent`, pass it a schema, and handle the typed
`formSubmit` output.

```ts
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

### Reading live value and validity

`FormRendererComponent` exposes `value` and `valid` signals, readable via a
template reference variable without waiting for submit:

```html
<forge-form-angular #userForm [schema]="schema" (formSubmit)="onSubmit($event)" />

<pre>{{ userForm.value() | json }}</pre>
<span>Valid: {{ userForm.valid() }}</span>
```

## Styling

The package ships SCSS files. Import them once in your global stylesheet to get
the default layout and theme:

```scss
// styles.scss
@use '@forge-form/angular/styles' as forge;
@use '@forge-form/angular/styles/default' as forge-theme;
```

To enable the default theme, set `theme: 'default'` in the schema's `options`.
You can also skip the theme and style the `forge-*` CSS classes yourself.

Invalid, touched/dirty controls get an error class so you can style them even
without the default theme: `forge-form-input-error` on text/number/select
inputs, `forge-form-checkbox-error` on checkboxes.

## Schema reference

### `FormSchema`

| Property   | Type                                    | Description                            |
| ---------- | --------------------------------------- | -------------------------------------- |
| `controls` | `(GroupFieldSchema \| ControlSchema)[]` | Top-level controls and groups.         |
| `id`       | `string`                                | Optional form id.                      |
| `updateOn` | `'change' \| 'blur' \| 'submit'`        | When control values/validation update. |
| `options`  | `FormOptions`                           | Layout, theme, and submit button.      |

### `FormOptions`

| Property           | Type                  | Description                                                                  |
| ------------------- | --------------------- | ------------------------------------------------------------------------------ |
| `orientation`       | `'column' \| 'row'`  | Layout of top-level controls.                                                |
| `labelOrientation`  | `'column' \| 'row'`  | Default label placement, overridable per control.                           |
| `theme`             | `'none' \| 'default'`| Activates the bundled default theme.                                        |
| `hideSubmitButton`  | `boolean`             | Hides the built-in submit button, e.g. to provide your own outside the form. |

### Control types

All controls share `controlName`, `label`, `options`, `initialValue`,
`validators`, `visibility`, `updateOn`, and `hint`.

| `type`     | Extra properties                           |
| ---------- | ------------------------------------------ |
| `text`     | `placeholder`                              |
| `number`   | `placeholder`, `min`, `max`                |
| `checkbox` | —                                          |
| `select`   | `items: { label, value }[]`, `placeholder` |

### Groups

Nest controls with a `group`:

```ts
{
  type: 'group',
  options: { orientation: 'row' },
  controls: [
    { type: 'text', controlName: 'firstName', label: 'First' },
    { type: 'text', controlName: 'lastName', label: 'Last' },
  ],
}
```

## Validators

Helper functions return a `ValidatorSchema`:

```ts
import { required, minLength, maxLength, min, max, customValidator } from '@forge-form/angular';

validators: [
  required(),
  minLength({ value: 3, errorMessage: 'Name is too short' }),
  customValidator({
    key: 'mustAccept',
    fn: (control) => (control.value === true ? null : { mustAccept: true }),
    errorMessage: 'You must accept the terms',
  }),
];
```

Each validator accepts an optional `errorMessage` that can be a string, a
function of the validation error, or a custom component definition.

## Conditional visibility

```ts
visibility: {
  fn: (ctx) => ctx.form.get('firstName')?.valid === true,
  behavior: 'hide', // or 'disable'
  clearOnHide: true,
}
```

## Custom hint and error components

Custom hint components extend `FormFieldContextComponent`, which exposes
`control`, `controlValue`, `controlErrors`, and `controlSchema` inputs:

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

Reference it from a control's `hint`:

```ts
hint: {
  component: CharCounterComponent,
  inputs: { maxLength: 100 },
}
```

## Public API

`FormRendererComponent`, `FormFieldContextComponent`, schema models
(`FormSchema`, `ControlSchema` variants, `FormOptions`, `VisibilitySchema`, …),
validator helpers, DI tokens (`RENDERERS`, `FORM_OPTIONS`, `ERROR_MESSAGES`,
`DEFAULT_ERROR_FALLBACK`), and the error/hint models are exported from the
package entry point.

## Building from source

```bash
ng build forge-form-angular   # outputs to dist/forge-form-angular
ng test forge-form-angular    # run unit tests
```

## License

[MIT](./LICENSE)

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
