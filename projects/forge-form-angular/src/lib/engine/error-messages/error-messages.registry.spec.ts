import { TestBed } from '@angular/core/testing';
import {
  ErrorMessageRegistry,
  ERROR_MESSAGES,
} from './error-messages.registry';
import { VALIDATOR_TYPES } from '../validators/validator-schema.model';
import { ErrorMessage } from './error-messages.model';

describe('ErrorMessageRegistry', () => {
  const createRegistry = (
    ...groups: ErrorMessage[][]
  ): ErrorMessageRegistry => {
    TestBed.configureTestingModule({
      providers: [
        ErrorMessageRegistry,
        { provide: ERROR_MESSAGES, useValue: [], multi: true },
        ...groups.map((group) => ({
          provide: ERROR_MESSAGES,
          useValue: group,
          multi: true,
        })),
      ],
    });
    return TestBed.inject(ErrorMessageRegistry);
  };

  it('should register error messages and retrieve by type', () => {
    const messageFn = () => 'This field is required';
    const registry = createRegistry([
      { type: VALIDATOR_TYPES.required, message: messageFn },
    ]);

    expect(registry.get(VALIDATOR_TYPES.required)).toBe(messageFn);
  });

  it('should flatten multiple message arrays into a single map', () => {
    const reqMsg = () => 'Required';
    const minMsg = () => 'Too short';

    const registry = createRegistry(
      [{ type: VALIDATOR_TYPES.required, message: reqMsg }],
      [{ type: VALIDATOR_TYPES.minlength, message: minMsg }],
    );

    expect(registry.get(VALIDATOR_TYPES.required)).toBe(reqMsg);
    expect(registry.get(VALIDATOR_TYPES.minlength)).toBe(minMsg);
  });

  it('should return null for an unregistered type', () => {
    const registry = createRegistry();

    expect(registry.get(VALIDATOR_TYPES.max)).toBeNull();
  });

  it('should let later registrations override earlier ones', () => {
    const first = () => 'First';
    const second = () => 'Second';

    const registry = createRegistry(
      [{ type: VALIDATOR_TYPES.required, message: first }],
      [{ type: VALIDATOR_TYPES.required, message: second }],
    );

    expect(registry.get(VALIDATOR_TYPES.required)).toBe(second);
  });
});
