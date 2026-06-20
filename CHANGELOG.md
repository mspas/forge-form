# Changelog

All notable changes to `@forge-form/angular` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-20

### Added

- `FormOptions.hideSubmitButton` to suppress the built-in submit button.
- `value` and `valid` signals exposed on `FormRendererComponent`, readable via
  a template reference variable for live form state without waiting for submit.
- Error CSS classes on field renderers for styling invalid controls without
  the default theme: `forge-form-input-error` (text/number/select) and
  `forge-form-checkbox-error` (checkbox).

## [1.0.0] - 2026-06-15

### Added

#### Core rendering
- `FormRendererComponent` — the main entry component; accepts a `FormSchema` input
  and emits a strongly-typed `formSubmit` output.
- Signal-based reactivity throughout with `OnPush` change detection.
- Standalone components — no `NgModule` required.

#### Control types
- `text` — single-line text input with optional `placeholder`.
- `number` — numeric input with optional `placeholder`, `min`, and `max` attributes.
- `checkbox` — boolean checkbox with configurable label orientation.
- `select` — dropdown with `items: { label, value }[]` and optional `placeholder`.

#### Groups
- `GroupFieldSchema` (`type: 'group'`) for nesting controls in a horizontal or
  vertical layout via `options.orientation`.

#### Validators
- Built-in helper functions: `required`, `minLength`, `maxLength`, `min`, `max`.
- `customValidator` for arbitrary `ValidatorFn` logic.
- Each validator accepts an optional `errorMessage` (string, function, or component definition).

#### Error messages
- `ERROR_MESSAGES` DI token for registering global error message overrides.
- `DEFAULT_ERROR_FALLBACK` token for a catch-all error message.
- `DEFAULT_ERROR_MESSAGES` map with sensible defaults for all built-in validators.
- Support for rendering arbitrary Angular components as error messages via
  `ErrorComponentDef`.

#### Hint messages
- Per-control `hint` property: accepts a plain string or an `HintComponentDef`.
- `FormFieldContextComponent` — base class for custom hint (and error) components;
  exposes `control`, `controlValue`, `controlErrors`, and `controlSchema` signal inputs.

#### Conditional visibility
- `VisibilitySchema` on any control: evaluates a `fn(ctx)` predicate on every
  form value change (debounced).
- `behavior: 'hide'` removes the field from the DOM; `behavior: 'disable'` keeps
  it rendered but disables the underlying control.
- `clearOnHide: true` resets the control value when hidden.

#### Layout & theming
- `FormOptions.orientation` (`'column'` | `'row'`) for top-level and group layout.
- `FormOptions.labelOrientation` (`'column'` | `'row'`) for label placement.
- Per-control `options.width` for explicit field widths.
- SCSS stylesheet shipped in the package under `styles/` (layout + default theme).
- `theme: 'default'` activates the bundled default theme via `FormOptions`.

#### Extension points
- `RENDERERS` DI token + `RendererRegistry` for registering custom field renderer
  components mapped to arbitrary `type` strings.
- `FORM_OPTIONS` DI token for providing global form-level defaults.

#### Schema `updateOn`
- `updateOn` can be set globally on `FormSchema` (`'change'` | `'blur'` | `'submit'`)
  and overridden per control.

#### Testing
- Full unit-test coverage for: `FormBuilderService`, `FormRendererComponent`,
  `FormFieldComponent`, group renderer, all four field renderers, error message
  service & renderer, hint service & renderer.
