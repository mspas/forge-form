import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ErrorMessageService } from './error-messages.service';
import {
  ErrorMessageRegistry,
  ERROR_MESSAGES,
  DEFAULT_ERROR_FALLBACK,
} from './error-messages.registry';
import {
  VALIDATOR_TYPES,
  ValidatorSchema,
} from '../validators/validator-schema.model';
import { ErrorMessage } from './error-messages.model';

@Component({ selector: 'forge-form-mock-error', template: '' })
class MockErrorComponent {}

const DEFAULT_FALLBACK = 'Invalid field';

const DEFAULT_MESSAGES: ErrorMessage[] = [
  { type: VALIDATOR_TYPES.required, message: () => 'This field is required' },
  {
    type: VALIDATOR_TYPES.minlength,
    message: (err) => `Minimum length is ${err['requiredLength']}`,
  },
];

describe('ErrorMessageService', () => {
  let service: ErrorMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorMessageService,
        ErrorMessageRegistry,
        { provide: ERROR_MESSAGES, useValue: DEFAULT_MESSAGES, multi: true },
        { provide: DEFAULT_ERROR_FALLBACK, useValue: DEFAULT_FALLBACK },
      ],
    });
    service = TestBed.inject(ErrorMessageService);
  });

  describe('getErrors', () => {
    it('should return empty array when control has no errors', () => {
      const control = new FormControl('valid');

      const result = service.getErrors(control, [
        { type: VALIDATOR_TYPES.required },
      ]);

      expect(result).toEqual([]);
    });

    it('should resolve a text error from registry for required validator', () => {
      const control = new FormControl(null, [Validators.required]);
      // Trigger validation
      control.markAsTouched();

      const result = service.getErrors(control, [
        { type: VALIDATOR_TYPES.required },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'text',
        message: 'This field is required',
      });
    });

    it('should resolve a text error with dynamic values from error metadata', () => {
      const control = new FormControl('ab', [Validators.minLength(5)]);

      const result = service.getErrors(control, [
        { type: VALIDATOR_TYPES.minlength, value: 5 },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'text',
        message: 'Minimum length is 5',
      });
    });

    it('should use validator-level errorMessage over registry message', () => {
      const control = new FormControl(null, [Validators.required]);

      const validators: ValidatorSchema[] = [
        { type: VALIDATOR_TYPES.required, errorMessage: 'Custom required msg' },
      ];

      const result = service.getErrors(control, validators);

      expect(result[0]).toEqual({
        type: 'text',
        message: 'Custom required msg',
      });
    });

    it('should use validator-level errorMessage function', () => {
      const control = new FormControl(null, [Validators.required]);

      const validators: ValidatorSchema[] = [
        { type: VALIDATOR_TYPES.required, errorMessage: () => 'Fn message' },
      ];

      const result = service.getErrors(control, validators);

      expect(result[0]).toEqual({ type: 'text', message: 'Fn message' });
    });

    it('should resolve a component error when errorMessage is a component def', () => {
      const control = new FormControl(null, [Validators.required]);

      const validators: ValidatorSchema[] = [
        {
          type: VALIDATOR_TYPES.required,
          errorMessage: {
            component: MockErrorComponent,
            inputs: () => ({ reason: 'missing' }),
          },
        },
      ];

      const result = service.getErrors(control, validators);

      expect(result[0]).toEqual({
        type: 'component',
        component: MockErrorComponent,
        inputs: { reason: 'missing' },
      });
    });

    it('should fall back to default fallback message when no message is registered', () => {
      // Use a custom validator that produces an error key not in registry
      const control = new FormControl('x');
      control.setErrors({ unknownError: true });

      const validators: ValidatorSchema[] = [
        { type: VALIDATOR_TYPES.custom, key: 'unknownError', fn: () => null },
      ];

      const result = service.getErrors(control, validators);

      expect(result[0]).toEqual({ type: 'text', message: DEFAULT_FALLBACK });
    });
  });
});
