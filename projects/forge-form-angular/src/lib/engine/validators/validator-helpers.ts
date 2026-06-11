import { ErrorMessageContent } from '../error-messages/error-messages.model';
import {
  ValidatorSchema,
  ValidatorFunction,
  VALIDATOR_TYPES,
} from './validator-schema.model';

export interface ValidatorCredentials {
  value?: number | string;
  key?: string;
  fn?: ValidatorFunction;
  errorMessage?: ErrorMessageContent;
}

export const required = (
  credentials?: ValidatorCredentials,
): ValidatorSchema => ({
  type: VALIDATOR_TYPES.required,
  errorMessage: credentials?.errorMessage,
});

export const minLength = ({
  value,
  errorMessage,
}: ValidatorCredentials): ValidatorSchema => ({
  type: VALIDATOR_TYPES.minlength,
  value: +value!,
  errorMessage,
});

export const maxLength = ({
  value,
  errorMessage,
}: ValidatorCredentials): ValidatorSchema => ({
  type: VALIDATOR_TYPES.maxlength,
  value: +value!,
  errorMessage,
});

export const min = ({
  value,
  errorMessage,
}: ValidatorCredentials): ValidatorSchema => ({
  type: VALIDATOR_TYPES.min,
  value: +value!,
  errorMessage,
});

export const max = ({
  value,
  errorMessage,
}: ValidatorCredentials): ValidatorSchema => ({
  type: VALIDATOR_TYPES.max,
  value: +value!,
  errorMessage,
});

export const customValidator = ({
  key,
  fn,
  errorMessage,
}: ValidatorCredentials): ValidatorSchema => ({
  type: VALIDATOR_TYPES.custom,
  key: key ?? '',
  fn: fn ?? (() => null),
  errorMessage,
});
