import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { ErrorRendererComponent } from './error-renderer.component';
import {
  ERROR_MESSAGES,
  DEFAULT_ERROR_FALLBACK,
} from '../error-messages/error-messages.registry';
import { VALIDATOR_TYPES } from '../validators/validator-schema.model';
import { ErrorMessage } from '../error-messages/error-messages.model';
import { TextControlSchema } from '../../schema/form-control.model';

const SELECTORS = {
  errorText: '[data-test="error-text"]',
} as const;

const ERROR_DEFS: ErrorMessage[] = [
  { type: VALIDATOR_TYPES.required, message: () => 'This field is required' },
  {
    type: VALIDATOR_TYPES.minlength,
    message: (err) => `Min length: ${err['requiredLength']}`,
  },
];

describe('ErrorRendererComponent', () => {
  let fixture: ComponentFixture<ErrorRendererComponent>;

  const createControlSchema = (
    overrides: Partial<TextControlSchema> = {},
  ): TextControlSchema => ({
    type: 'text',
    controlName: 'name',
    label: 'Name',
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorRendererComponent],
      providers: [
        { provide: ERROR_MESSAGES, useValue: ERROR_DEFS, multi: true },
        { provide: DEFAULT_ERROR_FALLBACK, useValue: 'Invalid field' },
      ],
    }).compileComponents();
  });

  const createComponent = (control: FormControl, schema: TextControlSchema) => {
    fixture = TestBed.createComponent(ErrorRendererComponent);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('controlSchema', schema);
    fixture.detectChanges();
  };

  it('should not render errors when control is valid', () => {
    const control = new FormControl('valid', [Validators.required]);

    createComponent(
      control,
      createControlSchema({ validators: [{ type: VALIDATOR_TYPES.required }] }),
    );

    const errors = fixture.nativeElement.querySelectorAll(SELECTORS.errorText);
    expect(errors.length).toBe(0);
  });

  it('should render error text after control status changes to invalid', () => {
    const control = new FormControl('', [Validators.required]);

    createComponent(
      control,
      createControlSchema({ validators: [{ type: VALIDATOR_TYPES.required }] }),
    );

    // Trigger statusChanges by updating the value
    control.setValue(null);
    control.markAsTouched();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll(SELECTORS.errorText);
    expect(errors.length).toBe(1);
    expect(errors[0].textContent.trim()).toBe('This field is required');
  });

  it('should render multiple errors when control has multiple validators failing', () => {
    const control = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]);

    createComponent(
      control,
      createControlSchema({
        validators: [
          { type: VALIDATOR_TYPES.required },
          { type: VALIDATOR_TYPES.minlength, value: 3 },
        ],
      }),
    );

    // Set a short string so required passes but minlength fails
    control.setValue('ab');
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll(SELECTORS.errorText);
    expect(errors.length).toBe(1);
    expect(errors[0].textContent.trim()).toBe('Min length: 3');
  });

  it('should clear errors when control becomes valid', () => {
    const control = new FormControl<string | null>(null, [Validators.required]);

    createComponent(
      control,
      createControlSchema({ validators: [{ type: VALIDATOR_TYPES.required }] }),
    );

    // First make it invalid
    control.setValue(null);
    fixture.detectChanges();

    // Then make it valid
    control.setValue('filled');
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll(SELECTORS.errorText);
    expect(errors.length).toBe(0);
  });

  it('should not render errors when controlSchema has no validators', () => {
    const control = new FormControl(null);
    control.setErrors({ required: true });

    createComponent(control, createControlSchema({ validators: undefined }));

    // Trigger statusChanges
    control.setValue(null);
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll(SELECTORS.errorText);
    expect(errors.length).toBe(0);
  });
});
