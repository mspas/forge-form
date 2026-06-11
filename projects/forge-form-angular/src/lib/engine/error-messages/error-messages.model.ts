import { Type } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ValidatorType } from '../validators/validator-schema.model';

export type ErrorMessageContent =
  | string
  | ((error: ValidationErrors) => string)
  | ErrorComponentDef;

export interface ErrorComponentDef {
  component: Type<unknown>;
  inputs?: (data: unknown) => Record<string, unknown>;
}

export interface ErrorMessage {
  type: ValidatorType;
  message: ErrorMessageContent;
}
