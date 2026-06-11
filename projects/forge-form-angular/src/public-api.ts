/*
 * Public API Surface of @forge-form/angular
 */

// Main entry component
export { FormRendererComponent } from './lib/engine/form-renderer/form-renderer.component';

// Base class for custom hint / error components
export { FormFieldContextComponent } from './lib/engine/form-field/form-field-context.component';

// Schema models
export type {
  FormSchema,
  GroupFieldSchema,
} from './lib/schema/form-schema.model';
export type {
  ControlSchema,
  BaseElementSchema,
  BaseControlSchema,
  TextControlSchema,
  NumberControlSchema,
  CheckboxControlSchema,
  SelectControlSchema,
  SelectOption,
  FieldRenderer,
} from './lib/schema/form-control.model';
export { ORIENTATION_OPTIONS, THEMES } from './lib/schema/form-options.model';
export type {
  OrientationOption,
  ThemeOption,
  FormOptions,
  ElementFormOptions,
  FormFieldOptions,
} from './lib/schema/form-options.model';
export { UPDATE_ON } from './lib/schema/update-on.model';
export type { UpdateOn } from './lib/schema/update-on.model';
export { VISIBILITY_BEHAVIORS } from './lib/schema/visibility.model';
export type {
  VisibilitySchema,
  VisibilityFunction,
  VisibilityBehavior,
  VisibilityContext,
} from './lib/schema/visibility.model';

// Dependency-injection tokens & extension points
export { FORM_OPTIONS } from './lib/schema/form-options-token';
export {
  RENDERERS,
  RendererRegistry,
} from './lib/engine/renderer-template-registry/renderer-template.registry';
export type { RendererDef } from './lib/engine/renderer-template-registry/renderer-template.registry';

// Validators
export {
  required,
  minLength,
  maxLength,
  min,
  max,
  customValidator,
} from './lib/engine/validators/validator-helpers';
export type { ValidatorCredentials } from './lib/engine/validators/validator-helpers';
export { VALIDATOR_TYPES } from './lib/engine/validators/validator-schema.model';
export type {
  ValidatorSchema,
  ValidatorType,
  ValidatorFunction,
  BaseValidatorSchema,
  RequiredValidatorSchema,
  MinLengthValidatorSchema,
  MaxLengthValidatorSchema,
  MinValidatorSchema,
  MaxValidatorSchema,
  CustomValidatorSchema,
} from './lib/engine/validators/validator-schema.model';

// Error messages
export {
  ERROR_MESSAGES,
  DEFAULT_ERROR_FALLBACK,
  DEFAULT_ERROR_MESSAGES,
} from './lib/engine/error-messages/error-messages.registry';
export type {
  ErrorMessage,
  ErrorMessageContent,
  ErrorComponentDef,
} from './lib/engine/error-messages/error-messages.model';

// Hint messages
export { HINT_TYPES } from './lib/engine/hint-messages/hint-messages.model';
export type {
  HintMessage,
  HintComponentDef,
  HintContext,
  HintType,
} from './lib/engine/hint-messages/hint-messages.model';
