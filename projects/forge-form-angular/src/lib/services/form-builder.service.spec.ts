import { FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { FormBuilderService } from './form-builder.service';
import { FormSchema, GroupFieldSchema } from '../schema/form-schema.model';
import {
  TextControlSchema,
  NumberControlSchema,
} from '../schema/form-control.model';
import {
  VALIDATOR_TYPES,
  ValidatorSchema,
} from '../engine/validators/validator-schema.model';

describe('FormBuilderService', () => {
  let service: FormBuilderService;

  beforeEach(() => {
    service = new FormBuilderService();
  });

  const createTextControl = (
    overrides: Partial<TextControlSchema> = {},
  ): TextControlSchema => ({
    type: 'text',
    controlName: 'name',
    label: 'Name',
    ...overrides,
  });

  const createNumberControl = (
    overrides: Partial<NumberControlSchema> = {},
  ): NumberControlSchema => ({
    type: 'number',
    controlName: 'age',
    label: 'Age',
    ...overrides,
  });

  const createSchema = (overrides: Partial<FormSchema> = {}): FormSchema => ({
    controls: [],
    ...overrides,
  });

  // ─────────────────────────────────────────────────────────────
  // BASIC FORM BUILDING
  // ─────────────────────────────────────────────────────────────

  describe('buildForm', () => {
    it('should return an empty FormGroup when schema has no controls', () => {
      // Arrange
      const schema = createSchema({ controls: [] });

      // Act
      const form = service.buildForm(schema);

      // Assert — verify the return type and that it has no controls
      expect(form).toBeInstanceOf(FormGroup);
      expect(Object.keys(form.controls)).toHaveLength(0);
    });

    it('should set the initial value from the schema', () => {
      const schema = createSchema({
        controls: [
          createTextControl({ controlName: 'city', initialValue: 'Prague' }),
        ],
      });

      const form = service.buildForm(schema);

      expect(form.get('city')?.value).toBe('Prague');
    });

    it('should default initial value to null when not specified', () => {
      const schema = createSchema({
        controls: [createTextControl({ controlName: 'email' })],
      });

      const form = service.buildForm(schema);

      expect(form.get('email')?.value).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // UPDATE ON STRATEGY
  // ─────────────────────────────────────────────────────────────

  describe('updateOn strategy', () => {
    it('should apply form-level updateOn to the FormGroup', () => {
      const schema = createSchema({
        updateOn: 'blur',
        controls: [createTextControl()],
      });

      const form = service.buildForm(schema);

      // The FormGroup itself inherits the updateOn strategy
      expect(form.updateOn).toBe('blur');
    });

    it('should apply form-level updateOn to controls without their own updateOn', () => {
      const schema = createSchema({
        updateOn: 'submit',
        controls: [createTextControl({ controlName: 'field' })],
      });

      const form = service.buildForm(schema);

      // Control inherits from schema-level updateOn
      expect((form.get('field') as FormControl).updateOn).toBe('submit');
    });

    it('should let control-level updateOn override the form-level setting', () => {
      const schema = createSchema({
        updateOn: 'submit',
        controls: [
          createTextControl({ controlName: 'field', updateOn: 'change' }),
        ],
      });

      const form = service.buildForm(schema);

      // Control's own updateOn takes precedence
      expect((form.get('field') as FormControl).updateOn).toBe('change');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // NESTED GROUPS (recursive flattening)
  // ─────────────────────────────────────────────────────────────

  describe('nested group handling', () => {
    it('should flatten controls from nested groups into a single FormGroup', () => {
      // The service recursively collects controls from GroupFieldSchema
      // and registers them all at the top level of the FormGroup.
      const nestedGroup: GroupFieldSchema = {
        type: 'group',
        controls: [
          createTextControl({ controlName: 'street' }),
          createTextControl({ controlName: 'zip' }),
        ],
      };

      const schema = createSchema({
        controls: [createTextControl({ controlName: 'name' }), nestedGroup],
      });

      const form = service.buildForm(schema);

      // All controls are flat — no nested FormGroup for the group schema
      expect(form.get('name')).toBeInstanceOf(FormControl);
      expect(form.get('street')).toBeInstanceOf(FormControl);
      expect(form.get('zip')).toBeInstanceOf(FormControl);
    });

    it('should handle deeply nested groups', () => {
      const deepGroup: GroupFieldSchema = {
        type: 'group',
        controls: [createTextControl({ controlName: 'deepField' })],
      };

      const midGroup: GroupFieldSchema = {
        type: 'group',
        controls: [deepGroup],
      };

      const schema = createSchema({ controls: [midGroup] });

      const form = service.buildForm(schema);

      expect(form.get('deepField')).toBeInstanceOf(FormControl);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // VALIDATORS
  // ─────────────────────────────────────────────────────────────

  describe('validator mapping', () => {
    // Helper to quickly build a schema with one control that has validators
    const buildFormWithValidators = (
      validators: ValidatorSchema[],
    ): FormGroup =>
      service.buildForm(
        createSchema({
          controls: [createTextControl({ controlName: 'field', validators })],
        }),
      );

    it('should apply required validator', () => {
      const form = buildFormWithValidators([
        { type: VALIDATOR_TYPES.required },
      ]);

      const control = form.get('field')!;
      // A required field with null value should be invalid
      expect(control.hasError('required')).toBe(true);
    });

    it('should apply minLength validator', () => {
      const form = buildFormWithValidators([
        { type: VALIDATOR_TYPES.minlength, value: 3 },
      ]);

      const control = form.get('field')!;
      control.setValue('ab'); // too short
      expect(control.hasError('minlength')).toBe(true);

      control.setValue('abc'); // exactly at minimum
      expect(control.hasError('minlength')).toBe(false);
    });

    it('should apply maxLength validator', () => {
      const form = buildFormWithValidators([
        { type: VALIDATOR_TYPES.maxlength, value: 5 },
      ]);

      const control = form.get('field')!;
      control.setValue('toolong');
      expect(control.hasError('maxlength')).toBe(true);

      control.setValue('ok');
      expect(control.hasError('maxlength')).toBe(false);
    });

    it('should apply min validator for numbers', () => {
      const form = service.buildForm(
        createSchema({
          controls: [
            createNumberControl({
              controlName: 'age',
              validators: [{ type: VALIDATOR_TYPES.min, value: 18 }],
            }),
          ],
        }),
      );

      const control = form.get('age')!;
      control.setValue(10);
      expect(control.hasError('min')).toBe(true);

      control.setValue(18);
      expect(control.hasError('min')).toBe(false);
    });

    it('should apply max validator for numbers', () => {
      const form = service.buildForm(
        createSchema({
          controls: [
            createNumberControl({
              controlName: 'age',
              validators: [{ type: VALIDATOR_TYPES.max, value: 120 }],
            }),
          ],
        }),
      );

      const control = form.get('age')!;
      control.setValue(200);
      expect(control.hasError('max')).toBe(true);

      control.setValue(99);
      expect(control.hasError('max')).toBe(false);
    });

    it('should apply a custom validator function', () => {
      // Custom validators let consumers pass their own validation logic.
      // The service just forwards the function reference to Angular's FormControl.
      const noSpaces = (control: AbstractControl) =>
        control.value?.includes(' ') ? { noSpaces: true } : null;

      const form = buildFormWithValidators([
        { type: VALIDATOR_TYPES.custom, key: 'noSpaces', fn: noSpaces },
      ]);

      const control = form.get('field')!;
      control.setValue('has space');
      expect(control.hasError('noSpaces')).toBe(true);

      control.setValue('nospace');
      expect(control.hasError('noSpaces')).toBe(false);
    });

    it('should compose multiple validators on a single control', () => {
      const form = buildFormWithValidators([
        { type: VALIDATOR_TYPES.required },
        { type: VALIDATOR_TYPES.minlength, value: 3 },
      ]);

      const control = form.get('field')!;

      // null → fails required
      expect(control.hasError('required')).toBe(true);

      // short string → passes required but fails minlength
      control.setValue('ab');
      expect(control.hasError('required')).toBe(false);
      expect(control.hasError('minlength')).toBe(true);

      // valid string → passes both
      control.setValue('abc');
      expect(control.errors).toBeNull();
    });

    it('should handle controls with no validators', () => {
      const form = service.buildForm(
        createSchema({
          controls: [createTextControl({ controlName: 'notes' })],
        }),
      );

      const control = form.get('notes')!;
      // No validators → always valid regardless of value
      expect(control.valid).toBe(true);
      expect(control.errors).toBeNull();
    });

    it('should produce a no-op validator for unknown validator types', () => {
      // Safety net: if an unrecognized type sneaks through, it shouldn't crash.
      // The fallback returns a function that always returns null (no error).
      const form = buildFormWithValidators([
        { type: 'unknown' as never } as unknown as ValidatorSchema,
      ]);

      const control = form.get('field')!;
      control.setValue('anything');
      expect(control.valid).toBe(true);
    });
  });
});
