import { Signal, Type } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

export const HINT_TYPES = {
  text: 'text',
  custom: 'custom',
} as const;
export type HintType = (typeof HINT_TYPES)[keyof typeof HINT_TYPES];

export type HintMessage = string | HintComponentDef;

export interface HintComponentDef {
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
}

export interface HintContext {
  control: AbstractControl;
  value: Signal<unknown>;
  errors: Signal<ValidationErrors | null>;
}
