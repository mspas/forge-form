import { inject, Injectable, Type } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  CustomValidatorSchema,
  VALIDATOR_TYPES,
  ValidatorSchema,
} from '../validators/validator-schema.model';
import {
  DEFAULT_ERROR_FALLBACK,
  ErrorMessageRegistry,
} from './error-messages.registry';
import { ErrorMessageContent } from './error-messages.model';
import { ValidationError } from '@angular/forms/signals';

export type ResolvedError =
  | { type: 'text'; message: string }
  | {
      type: 'component';
      component: Type<unknown>;
      inputs?: Record<string, unknown>;
    };

@Injectable()
export class ErrorMessageService {
  private readonly registry = inject(ErrorMessageRegistry);
  private readonly defaultFallback = inject(DEFAULT_ERROR_FALLBACK);

  getErrors(
    control: AbstractControl,
    validators: ValidatorSchema[],
  ): ResolvedError[] {
    if (!control.errors) return [];

    return Object.entries(control.errors).map(([errorKey, errorValue]) => {
      const validatorSchema = this.getValidatorSchema(errorKey, validators);

      const content =
        validatorSchema?.errorMessage ??
        this.registry.get(errorKey as ValidatorSchema['type']);

      if (!content) {
        return { type: 'text', message: this.defaultFallback };
      }

      return this.resolveContent(content, errorValue);
    });
  }

  private getValidatorSchema(
    errorKey: ValidatorSchema['type'] | CustomValidatorSchema['key'],
    validators: ValidatorSchema[],
  ): ValidatorSchema | undefined {
    return validators.find((validator) =>
      validator.type !== VALIDATOR_TYPES.custom
        ? validator.type === errorKey
        : validator.key === errorKey,
    );
  }

  private resolveContent(
    content: ErrorMessageContent,
    errorValue: ValidationError,
  ): ResolvedError {
    if (typeof content === 'string') {
      return { type: 'text', message: content };
    }

    if (typeof content === 'function') {
      return { type: 'text', message: content(errorValue) };
    }

    return {
      type: 'component',
      component: content.component,
      inputs: content.inputs?.(errorValue),
    };
  }
}
