import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormRendererComponent } from './form-renderer.component';
import { FormSchema, GroupFieldSchema } from '../../schema/form-schema.model';
import { ControlSchema } from '../../schema/form-control.model';
import { FormService } from './form.service';

// ─────────────────────────────────────────────────────────────
// STUB CHILD COMPONENTS
// ─────────────────────────────────────────────────────────────

@Component({ selector: 'forge-form-field', template: '' })
class StubFormFieldComponent {
  control = input.required<FormControl>();
  controlSchema = input.required<ControlSchema>();
}

@Component({ selector: 'forge-form-group-renderer', template: '' })
class StubGroupRendererComponent {
  form = input.required<FormGroup>();
  schema = input.required<GroupFieldSchema>();
}

const SELECTORS = {
  form: '[data-test="form"]',
  formField: '[data-test="form-field"]',
  groupRenderer: '[data-test="group-renderer"]',
  submitButton: '[data-test="submit-button"]',
} as const;

describe('FormRendererComponent', () => {
  let fixture: ComponentFixture<FormRendererComponent<unknown>>;
  let component: FormRendererComponent<unknown>;

  // Minimal valid schema factory
  const createSchema = (overrides: Partial<FormSchema> = {}): FormSchema => ({
    controls: [],
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRendererComponent],
    })
      .overrideComponent(FormRendererComponent, {
        set: {
          imports: [
            ReactiveFormsModule,
            StubFormFieldComponent,
            StubGroupRendererComponent,
          ],
        },
      })
      .compileComponents();
  });

  const createComponent = (schema: FormSchema) => {
    fixture = TestBed.createComponent(FormRendererComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('schema', schema);
    fixture.detectChanges();
  };

  // ─────────────────────────────────────────────────────────────
  // COMPONENT CREATION
  // ─────────────────────────────────────────────────────────────

  describe('creation', () => {
    it('should create the component with an empty schema', () => {
      createComponent(createSchema());

      expect(component).toBeTruthy();
    });

    it('should build a reactive FormGroup from the schema', () => {
      createComponent(
        createSchema({
          controls: [{ type: 'text', controlName: 'name', label: 'Name' }],
        }),
      );

      // The computed `form` should produce a FormGroup with the declared control
      expect(component.formSignal()).toBeInstanceOf(FormGroup);
      expect(component.formSignal()!.get('name')).toBeInstanceOf(FormControl);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE RENDERING
  // ─────────────────────────────────────────────────────────────

  describe('template', () => {
    it('should render a <form> element', () => {
      createComponent(createSchema());

      const formEl = fixture.nativeElement.querySelector(SELECTORS.form);
      expect(formEl).toBeTruthy();
    });

    it('should render an forge-form-field for each non-group control', () => {
      createComponent(
        createSchema({
          controls: [
            { type: 'text', controlName: 'first', label: 'First' },
            { type: 'number', controlName: 'age', label: 'Age' },
          ],
        }),
      );

      const fields = fixture.nativeElement.querySelectorAll(
        SELECTORS.formField,
      );
      expect(fields.length).toBe(2);
    });

    it('should render forge-form-group-renderer for group controls', () => {
      const group: GroupFieldSchema = {
        type: 'group',
        controls: [{ type: 'text', controlName: 'street', label: 'Street' }],
      };

      createComponent(createSchema({ controls: [group] }));

      const groups = fixture.nativeElement.querySelectorAll(
        SELECTORS.groupRenderer,
      );
      expect(groups.length).toBe(1);
    });

    it('should render a submit button', () => {
      createComponent(createSchema());

      const btn = fixture.nativeElement.querySelector(SELECTORS.submitButton);
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Submit');
    });

    it('should apply orientation class from schema options', () => {
      createComponent(
        createSchema({
          controls: [],
          options: { orientation: 'row' },
        }),
      );

      const formEl = fixture.nativeElement.querySelector(SELECTORS.form);
      expect(formEl.classList).toContain('forge-form--row');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // FORM SUBMISSION
  // ─────────────────────────────────────────────────────────────

  describe('onSubmit', () => {
    it('should emit formSubmit with form value when form is valid', () => {
      createComponent(
        createSchema({
          controls: [{ type: 'text', controlName: 'city', label: 'City' }],
        }),
      );

      // Set a value so the form is valid (no validators = always valid)
      component.formSignal()!.get('city')!.setValue('Prague');

      let emitted: unknown;
      // Subscribe to the output signal's observable to capture emitted value
      component.formSubmit.subscribe((val) => (emitted = val));

      component.onSubmit();

      expect(emitted).toEqual({ city: 'Prague' });
    });

    it('should NOT emit formSubmit when form is invalid', () => {
      createComponent(
        createSchema({
          controls: [
            {
              type: 'text',
              controlName: 'name',
              label: 'Name',
              validators: [{ type: 'required' }],
            },
          ],
        }),
      );

      let emitted = false;
      component.formSubmit.subscribe(() => (emitted = true));

      // Form is invalid — control is required but has null value
      component.onSubmit();

      expect(emitted).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────

  describe('getControl', () => {
    it('should return the FormControl for a given control name', () => {
      createComponent(
        createSchema({
          controls: [{ type: 'text', controlName: 'email', label: 'Email' }],
        }),
      );

      const control = component.getControl('email');

      expect(control).toBeInstanceOf(FormControl);
      expect(control).toBe(component.formSignal()!.get('email') as FormControl);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // EXTERNALLY OBSERVABLE VALUE / VALIDITY SIGNALS
  // ─────────────────────────────────────────────────────────────

  describe('value and valid signals', () => {
    it('should expose the initial form value and validity without any interaction', () => {
      createComponent(
        createSchema({
          controls: [
            {
              type: 'text',
              controlName: 'name',
              label: 'Name',
              validators: [{ type: 'required' }],
            },
          ],
        }),
      );

      expect(component.value()).toEqual({ name: null });
      expect(component.valid()).toBe(false);
    });

    it('should update value() and valid() when a control changes', () => {
      createComponent(
        createSchema({
          controls: [
            {
              type: 'text',
              controlName: 'name',
              label: 'Name',
              validators: [{ type: 'required' }],
            },
          ],
        }),
      );

      expect(component.valid()).toBe(false);

      component.formSignal()!.get('name')!.setValue('Ada');
      fixture.detectChanges();

      expect(component.value()).toEqual({ name: 'Ada' });
      expect(component.valid()).toBe(true);
    });

    it('should reset value() and valid() when the schema changes and the form rebuilds', () => {
      createComponent(
        createSchema({
          controls: [{ type: 'text', controlName: 'v1', label: 'V1' }],
        }),
      );

      component.formSignal()!.get('v1')!.setValue('hello');
      fixture.detectChanges();
      expect(component.value()).toEqual({ v1: 'hello' });

      fixture.componentRef.setInput(
        'schema',
        createSchema({
          controls: [
            {
              type: 'text',
              controlName: 'v2',
              label: 'V2',
              validators: [{ type: 'required' }],
            },
          ],
        }),
      );
      fixture.detectChanges();

      expect(component.value()).toEqual({ v2: null });
      expect(component.valid()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // HIDDEN FIELDS (visibility behavior 'hide')
  // ─────────────────────────────────────────────────────────────

  describe('hidden fields', () => {
    it('should not let a hidden required field block submit (engine bug #1)', () => {
      const ghost: ControlSchema = {
        type: 'text',
        controlName: 'ghost',
        label: 'Ghost',
        validators: [{ type: 'required' }],
        visibility: { fn: () => true, behavior: 'hide' },
      };
      const visible: ControlSchema = {
        type: 'text',
        controlName: 'name',
        label: 'Name',
      };
      createComponent(createSchema({ controls: [visible, ghost] }));

      const btn = fixture.nativeElement.querySelector(SELECTORS.submitButton);
      expect(btn.disabled).toBe(true);

      // FormFieldComponent is stubbed here, so drive the service directly
      // the way its visibility effect does.
      const formService = fixture.debugElement.injector.get(FormService);
      formService.applyVisibility(ghost, true, false);
      fixture.detectChanges();

      // The hidden control is disabled: excluded from validity and value
      expect(btn.disabled).toBe(false);
      expect(component.valid()).toBe(true);
      expect(component.value()).toEqual({ name: null });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // REACTIVITY (schema changes → form rebuilds)
  // ─────────────────────────────────────────────────────────────

  describe('reactivity', () => {
    it('should rebuild the form when schema input changes', () => {
      createComponent(
        createSchema({
          controls: [{ type: 'text', controlName: 'v1', label: 'V1' }],
        }),
      );

      const firstForm = component.formSignal()!;
      expect(firstForm.get('v1')).toBeTruthy();

      // Update the input with a different schema
      fixture.componentRef.setInput(
        'schema',
        createSchema({
          controls: [{ type: 'number', controlName: 'v2', label: 'V2' }],
        }),
      );
      fixture.detectChanges();

      const secondForm = component.formSignal()!;
      // computed() re-evaluates → new FormGroup with different controls
      expect(secondForm.get('v2')).toBeTruthy();
      expect(secondForm.get('v1')).toBeNull();
    });
  });
});
