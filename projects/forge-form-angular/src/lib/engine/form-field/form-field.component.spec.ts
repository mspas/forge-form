import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormFieldComponent } from './form-field.component';
import {
  ControlSchema,
  TextControlSchema,
} from '../../schema/form-control.model';
import {
  RendererRegistry,
  RENDERERS,
  RendererDef,
} from '../renderer-template-registry/renderer-template.registry';
import { FORM_OPTIONS } from '../../schema/form-options-token';
import { FormOptions } from '../../schema/form-options.model';
import { FieldRenderer } from '../../schema/form-control.model';
import { FormService } from '../form-renderer/form.service';
import { FormBuilderService } from '../../services/form-builder.service';

// ─────────────────────────────────────────────────────────────
// STUB COMPONENTS
// ─────────────────────────────────────────────────────────────

@Component({ selector: 'forge-form-mock-text-renderer', template: '<input />' })
class MockTextRendererComponent implements FieldRenderer {
  @Input() control!: FormControl;
  @Input() controlSchema!: ControlSchema;
  @Input() isValid!: boolean;
}

@Component({
  selector: 'forge-form-mock-checkbox-renderer',
  template: '<input type="checkbox" />',
})
class MockCheckboxRendererComponent implements FieldRenderer {
  @Input() control!: FormControl;
  @Input() controlSchema!: ControlSchema;
  @Input() isValid!: boolean;
}

@Component({ selector: 'forge-form-error-renderer', template: '' })
class StubErrorRendererComponent {
  control = input.required<AbstractControl>();
  controlSchema = input.required<ControlSchema>();
}

const SELECTORS = {
  container: '[data-test="forge-form-field-container"]',
  label: '[data-test="forge-form-field-label"]',
} as const;

const RENDERERS_CONFIG: RendererDef[] = [
  { type: 'text', component: MockTextRendererComponent },
  { type: 'checkbox', component: MockCheckboxRendererComponent },
];
@Component({ selector: 'forge-form-hint-renderer', template: '' })
class StubHintRendererComponent {
  control = input.required<AbstractControl>();
  controlSchema = input.required<ControlSchema>();
}

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldComponent<unknown>>;
  let component: FormFieldComponent<unknown>;

  const setupTestBed = (formOptions?: FormOptions) => {
    const providers = [
      RendererRegistry,
      FormService,
      FormBuilderService,
      { provide: RENDERERS, useValue: RENDERERS_CONFIG, multi: true },
    ];

    if (formOptions) {
      providers.push({ provide: FORM_OPTIONS, useValue: formOptions } as never);
    }

    return TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    })
      .overrideComponent(FormFieldComponent, {
        set: {
          imports: [
            ReactiveFormsModule,
            NgComponentOutlet,
            StubErrorRendererComponent,
            StubHintRendererComponent,
          ],
          providers,
        },
      })
      .compileComponents();
  };

  const createControlSchema = (
    overrides: Partial<TextControlSchema> = {},
  ): TextControlSchema => ({
    type: 'text',
    controlName: 'name',
    label: 'Name',
    ...overrides,
  });

  const createComponent = (
    controlSchema: ControlSchema,
    control?: FormControl,
  ) => {
    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('control', control ?? new FormControl(null));
    fixture.componentRef.setInput('controlSchema', controlSchema);
    fixture.detectChanges();
  };

  // ─────────────────────────────────────────────────────────────
  // RENDERING
  // ─────────────────────────────────────────────────────────────

  describe('rendering', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should render the field container', () => {
      createComponent(createControlSchema());

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container).toBeTruthy();
    });

    it('should render a label when controlSchema has a label', () => {
      createComponent(createControlSchema({ label: 'Username' }));

      const label = fixture.nativeElement.querySelector(SELECTORS.label);
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Username');
    });

    it('should render the label as a <label> associated with the control by name', () => {
      createComponent(createControlSchema({ label: 'Username' }));

      const label = fixture.nativeElement.querySelector(SELECTORS.label);
      expect(label.tagName).toBe('LABEL');
      expect(label.getAttribute('for')).toBe('name');
    });

    it('should NOT render a label when controlSchema has no label', () => {
      createComponent(createControlSchema({ label: undefined }));

      const label = fixture.nativeElement.querySelector(SELECTORS.label);
      expect(label).toBeNull();
    });

    it('should apply column orientation class by default', () => {
      createComponent(createControlSchema());

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container.classList).toContain(
        'forge-form-field-container--column',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // ORIENTATION
  // ─────────────────────────────────────────────────────────────

  describe('label orientation', () => {
    it('should use control-level labelOrientation if provided', async () => {
      await setupTestBed();

      createComponent(
        createControlSchema({ options: { labelOrientation: 'row' } }),
      );

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container.classList).toContain('forge-form-field-container--row');
    });

    it('should fall back to form-level labelOrientation when control has none', async () => {
      await setupTestBed({ labelOrientation: 'row' });

      createComponent(createControlSchema());

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container.classList).toContain('forge-form-field-container--row');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // COMPONENT TYPE RESOLUTION
  // ─────────────────────────────────────────────────────────────

  describe('componentType', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should resolve the renderer component from the registry', () => {
      createComponent(createControlSchema({ type: 'text' }));

      expect(component.componentType()).toBe(MockTextRendererComponent);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // ISVALID FORWARDING
  // ─────────────────────────────────────────────────────────────

  describe('isValid forwarding', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should pass isValid=true to the renderer when the control is valid', () => {
      const control = new FormControl('value');

      createComponent(createControlSchema(), control);

      const renderer = fixture.debugElement.query(
        (el) => el.componentInstance instanceof MockTextRendererComponent,
      ).componentInstance as MockTextRendererComponent;

      expect(renderer.isValid).toBe(true);
    });

    it('should pass isValid=false to the renderer when the control is invalid', () => {
      const control = new FormControl<string | null>(null, Validators.required);

      createComponent(createControlSchema(), control);

      const renderer = fixture.debugElement.query(
        (el) => el.componentInstance instanceof MockTextRendererComponent,
      ).componentInstance as MockTextRendererComponent;

      expect(renderer.isValid).toBe(false);
    });

    it('should update isValid on the renderer when control validity changes', () => {
      const control = new FormControl<string | null>(null, Validators.required);

      createComponent(createControlSchema(), control);

      control.setValue('value');
      fixture.detectChanges();

      const renderer = fixture.debugElement.query(
        (el) => el.componentInstance instanceof MockTextRendererComponent,
      ).componentInstance as MockTextRendererComponent;

      expect(renderer.isValid).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // VALUE CHANGES (debounced signal)
  // ─────────────────────────────────────────────────────────────

  describe('valueChanges', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      await setupTestBed();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should update valueChanges signal when control value changes', () => {
      const control = new FormControl('initial', { updateOn: 'change' });

      createComponent(createControlSchema({ updateOn: 'change' }), control);

      control.setValue('updated');
      // Advance past the debounce time (300ms for change + updateOn)
      vi.advanceTimersByTime(350);

      expect(component.valueChanges()).toBe('updated');
    });

    it('should not debounce for checkbox controls', () => {
      const control = new FormControl(false, { updateOn: 'change' });

      createComponent(
        {
          type: 'checkbox',
          controlName: 'accept',
          label: 'Accept',
          updateOn: 'change',
        },
        control,
      );

      control.setValue(true);
      // No delay for checkbox — fires immediately after distinctUntilChanged
      vi.advanceTimersByTime(0);

      expect(component.valueChanges()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // VISIBILITY (fn returns true = visible)
  // ─────────────────────────────────────────────────────────────

  describe('visibility', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    // Uses the component's own FormService instance so the visibility
    // effect can reach the real form controls.
    const createFieldWithService = (controlSchema: TextControlSchema) => {
      fixture = TestBed.createComponent(FormFieldComponent);
      component = fixture.componentInstance;

      const formService =
        fixture.debugElement.injector.get<FormService<unknown>>(FormService);
      formService.init({
        controls: [
          createControlSchema({ controlName: 'trigger' }),
          controlSchema,
        ],
      });
      const control = formService
        .form()!
        .get(controlSchema.controlName)! as FormControl;

      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('controlSchema', controlSchema);

      return { formService, control };
    };

    it('should render the field when behavior is hide and fn returns true', () => {
      createFieldWithService(
        createControlSchema({
          controlName: 'dependent',
          visibility: { fn: () => true, behavior: 'hide' },
        }),
      );
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container).toBeTruthy();
    });

    it('should remove the field and disable its control when fn returns false', () => {
      const { control } = createFieldWithService(
        createControlSchema({
          controlName: 'dependent',
          visibility: { fn: () => false, behavior: 'hide' },
        }),
      );
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container).toBeNull();
      expect(control.disabled).toBe(true);
    });

    it('should clear the value when clearOnHide is set and the field becomes hidden', () => {
      const { formService, control } = createFieldWithService(
        createControlSchema({
          controlName: 'dependent',
          visibility: {
            fn: (ctx) =>
              (ctx.value as { trigger?: string | null }).trigger !== 'hide-me',
            behavior: 'hide',
            clearOnHide: true,
          },
        }),
      );
      control.setValue('STALE');
      fixture.detectChanges();
      expect(control.value).toBe('STALE');

      formService.form()!.get('trigger')!.setValue('hide-me');
      fixture.detectChanges();

      expect(control.disabled).toBe(true);
      expect(control.value).toBeNull();
    });

    it('should not clear a field that starts hidden (no hide transition)', () => {
      const { control } = createFieldWithService(
        createControlSchema({
          controlName: 'dependent',
          visibility: { fn: () => false, behavior: 'hide', clearOnHide: true },
        }),
      );
      control.setValue('KEEP');
      fixture.detectChanges();

      expect(control.disabled).toBe(true);
      expect(control.value).toBe('KEEP');
    });
  });
});
