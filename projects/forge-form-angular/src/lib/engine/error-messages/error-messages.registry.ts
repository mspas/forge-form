import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
  VALIDATOR_TYPES,
  ValidatorType,
} from '../validators/validator-schema.model';
import { ErrorMessage, ErrorMessageContent } from './error-messages.model';

export const ERROR_MESSAGES = new InjectionToken<ErrorMessage[]>(
  'ERROR_MESSAGES',
);

export const DEFAULT_ERROR_FALLBACK = new InjectionToken<string>(
  'DEFAULT_ERROR_FALLBACK',
);

export const DEFAULT_ERROR_MESSAGES: ErrorMessage[] = [
  {
    type: VALIDATOR_TYPES.required,
    message: () => 'This field is required',
  },
  {
    type: VALIDATOR_TYPES.minlength,
    message: (err) => `Minimum length is ${err['requiredLength']}`,
  },
  {
    type: VALIDATOR_TYPES.maxlength,
    message: (err) => `Maximum length is ${err['requiredLength']}`,
  },
  {
    type: VALIDATOR_TYPES.min,
    message: (err) => `Minimum value is ${err['min']}`,
  },
  {
    type: VALIDATOR_TYPES.max,
    message: (err) => `Maximum value is ${err['max']}`,
  },
];

@Injectable()
export class ErrorMessageRegistry {
  private map = new Map<ValidatorType, ErrorMessageContent>();

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(@Inject(ERROR_MESSAGES) defs: ErrorMessage[][] = []) {
    defs.flat().forEach((def) => {
      this.map.set(def.type, def.message);
    });
  }

  get(type: ValidatorType): ErrorMessageContent | null {
    return this.map.get(type) ?? null;
  }
}
