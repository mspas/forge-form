import { AbstractControl, FormGroup } from '@angular/forms';

export interface VisibilitySchema {
  fn: VisibilityFunction;
  behavior: VisibilityBehavior;
  clearOnHide?: boolean;
}

export type VisibilityFunction = (control: VisibilityContext) => boolean;

export const VISIBILITY_BEHAVIORS = {
  hide: 'hide',
  disable: 'disable',
} as const;
export type VisibilityBehavior =
  (typeof VISIBILITY_BEHAVIORS)[keyof typeof VISIBILITY_BEHAVIORS];

export interface VisibilityContext {
  value: unknown;
  form: FormGroup;
  control: AbstractControl;
}
