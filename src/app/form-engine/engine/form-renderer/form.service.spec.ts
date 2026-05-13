import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { FormService } from './form.service';
import { FormBuilderService } from '../../services/form-builder.service';
import { FormSchema } from '../../schema/form-schema.model';
import { TextControlSchema } from '../../schema/form-control.model';
import { VISIBILITY_BEHAVIORS } from '../../schema/visibility.model';

describe('FormService', () => {
  let service: FormService<Record<string, unknown>>;

  const createSchema = (overrides: Partial<FormSchema> = {}): FormSchema => ({
    controls: [],
    ...overrides,
  });

  const createTextControl = (
    overrides: Partial<TextControlSchema> = {},
  ): TextControlSchema => ({
    type: 'text',
    controlName: 'name',
    label: 'Name',
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormService, FormBuilderService],
    });
    service = TestBed.inject(FormService);
  });

  // ─────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────

  describe('init', () => {
    it('should have null form and value before init', () => {
      expect(service.form()).toBeNull();
      expect(service.value()).toBeNull();
    });

    it('should build a FormGroup from the schema', () => {
      const schema = createSchema({
        controls: [createTextControl({ controlName: 'city' })],
      });

      service.init(schema);

      expect(service.form()).toBeInstanceOf(FormGroup);
      expect(service.form()!.get('city')).toBeInstanceOf(FormControl);
    });

    it('should not initialize when schema is falsy', () => {
      service.init(undefined as unknown as FormSchema);

      expect(service.form()).toBeNull();
    });

    it('should rebuild the form when called again with a new schema', () => {
      service.init(
        createSchema({
          controls: [createTextControl({ controlName: 'first' })],
        }),
      );
      const firstForm = service.form();

      service.init(
        createSchema({
          controls: [createTextControl({ controlName: 'second' })],
        }),
      );
      const secondForm = service.form();

      expect(secondForm).not.toBe(firstForm);
      expect(secondForm!.get('second')).toBeInstanceOf(FormControl);
      expect(secondForm!.get('first')).toBeNull();
    });

    it('should update value signal when form value changes', () => {
      service.init(
        createSchema({
          controls: [createTextControl({ controlName: 'email' })],
        }),
      );

      service.form()!.get('email')!.setValue('test@example.com');

      expect(service.value()).toEqual({ email: 'test@example.com' });
    });

    it('should unsubscribe from previous valueChanges when re-initialized', () => {
      service.init(
        createSchema({
          controls: [createTextControl({ controlName: 'a' })],
        }),
      );
      const firstForm = service.form()!;

      service.init(
        createSchema({
          controls: [createTextControl({ controlName: 'b' })],
        }),
      );

      // Changing the old form should not update the value signal
      firstForm.get('a')!.setValue('stale');

      expect(service.value()).not.toEqual({ a: 'stale' });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // APPLY VISIBILITY
  // ─────────────────────────────────────────────────────────────

  describe('applyVisibility', () => {
    const createControlWithDisableVisibility = (
      overrides: Partial<TextControlSchema> = {},
    ): TextControlSchema =>
      createTextControl({
        controlName: 'field',
        visibility: {
          fn: () => true,
          behavior: VISIBILITY_BEHAVIORS.disable,
        },
        ...overrides,
      });

    beforeEach(() => {
      service.init(
        createSchema({
          controls: [createTextControl({ controlName: 'field' })],
        }),
      );
    });

    it('should do nothing when controlSchema has no visibility', () => {
      const controlSchema = createTextControl({ controlName: 'field' });
      const control = service.form()!.get('field')!;

      service.applyVisibility(controlSchema, true, false);

      expect(control.enabled).toBe(true);
    });

    it('should disable the control when visible is true and behavior is disable', () => {
      const controlSchema = createControlWithDisableVisibility();

      service.applyVisibility(controlSchema, true, false);

      expect(service.form()!.get('field')!.disabled).toBe(true);
    });

    it('should enable the control when visible is false and behavior is disable', () => {
      const controlSchema = createControlWithDisableVisibility();

      // First disable
      service.applyVisibility(controlSchema, true, false);
      expect(service.form()!.get('field')!.disabled).toBe(true);

      // Then enable
      service.applyVisibility(controlSchema, false, false);
      expect(service.form()!.get('field')!.enabled).toBe(true);
    });

    it('should reset the control value when clearOnHide is true on first disable', () => {
      const controlSchema = createControlWithDisableVisibility({
        visibility: {
          fn: () => true,
          behavior: VISIBILITY_BEHAVIORS.disable,
          clearOnHide: true,
        },
      });

      service.form()!.get('field')!.setValue('some value');

      service.applyVisibility(controlSchema, true, true);

      expect(service.form()!.get('field')!.value).toBeNull();
    });

    it('should not reset the control value when clearOnHide is false', () => {
      const controlSchema = createControlWithDisableVisibility();

      service.form()!.get('field')!.setValue('keep me');

      service.applyVisibility(controlSchema, true, false);

      expect(service.form()!.get('field')!.value).toBe('keep me');
    });

    it('should not reset the control on subsequent disables when already tracked', () => {
      const controlSchema = createControlWithDisableVisibility({
        visibility: {
          fn: () => true,
          behavior: VISIBILITY_BEHAVIORS.disable,
          clearOnHide: true,
        },
      });

      service.form()!.get('field')!.setValue('first');
      service.applyVisibility(controlSchema, true, true);
      expect(service.form()!.get('field')!.value).toBeNull();

      // Re-enable, set value again, then disable again
      service.applyVisibility(controlSchema, false, true);
      service.form()!.get('field')!.setValue('second');
      service.applyVisibility(controlSchema, true, true);

      // Should reset again because it was re-enabled (removed from tracking set)
      expect(service.form()!.get('field')!.value).toBeNull();
    });

    it('should not disable an already disabled control again', () => {
      const controlSchema = createControlWithDisableVisibility();

      service.applyVisibility(controlSchema, true, false);
      service.applyVisibility(controlSchema, true, false);

      expect(service.form()!.get('field')!.disabled).toBe(true);
    });

    it('should not enable a control that was not disabled by visibility', () => {
      const controlSchema = createControlWithDisableVisibility();

      // Control is enabled, try to "enable" via visibility
      service.applyVisibility(controlSchema, false, false);

      expect(service.form()!.get('field')!.enabled).toBe(true);
    });

    it('should do nothing for non-disable behaviors', () => {
      const controlSchema = createTextControl({
        controlName: 'field',
        visibility: {
          fn: () => true,
          behavior: VISIBILITY_BEHAVIORS.hide,
        },
      });

      service.applyVisibility(controlSchema, true, false);

      expect(service.form()!.get('field')!.enabled).toBe(true);
    });
  });
});
