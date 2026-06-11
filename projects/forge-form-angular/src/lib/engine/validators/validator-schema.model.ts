import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ErrorMessageContent } from '../error-messages/error-messages.model';

export type ValidatorSchema =
  | RequiredValidatorSchema
  | MinLengthValidatorSchema
  | MaxLengthValidatorSchema
  | MinValidatorSchema
  | MaxValidatorSchema
  | CustomValidatorSchema;

export const VALIDATOR_TYPES = {
  required: 'required',
  minlength: 'minlength',
  maxlength: 'maxlength',
  min: 'min',
  max: 'max',
  custom: 'custom',
} as const;
export type ValidatorType =
  (typeof VALIDATOR_TYPES)[keyof typeof VALIDATOR_TYPES];

export interface BaseValidatorSchema {
  type: ValidatorType;
  errorMessage?: ErrorMessageContent;
}

export interface RequiredValidatorSchema extends BaseValidatorSchema {
  type: typeof VALIDATOR_TYPES.required;
}

export interface MinLengthValidatorSchema extends BaseValidatorSchema {
  type: typeof VALIDATOR_TYPES.minlength;
  value: number;
}

export interface MaxLengthValidatorSchema extends BaseValidatorSchema {
  type: typeof VALIDATOR_TYPES.maxlength;
  value: number;
}

export interface MinValidatorSchema extends BaseValidatorSchema {
  type: typeof VALIDATOR_TYPES.min;
  value: number;
}

export interface MaxValidatorSchema extends BaseValidatorSchema {
  type: typeof VALIDATOR_TYPES.max;
  value: number;
}

export interface CustomValidatorSchema extends BaseValidatorSchema {
  type: typeof VALIDATOR_TYPES.custom;
  key: string;
  fn: ValidatorFunction;
}

export type ValidatorFunction = (
  control: AbstractControl,
) => ValidationErrors | null;
