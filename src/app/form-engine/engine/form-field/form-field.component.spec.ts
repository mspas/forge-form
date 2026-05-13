import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
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

@Component({ selector: 'app-mock-text-renderer', template: '<input />' })
class MockTextRendererComponent implements FieldRenderer {
  @Input() control!: FormControl;
  @Input() controlSchema!: ControlSchema;
}

@Component({
  selector: 'app-mock-checkbox-renderer',
  template: '<input type="checkbox" />',
})
class MockCheckboxRendererComponent implements FieldRenderer {
  @Input() control!: FormControl;
  @Input() controlSchema!: ControlSchema;
}

@Component({ selector: 'app-error-renderer', template: '' })
class StubErrorRendererComponent {
  control = input.required<AbstractControl>();
  controlSchema = input.required<ControlSchema>();
}

const SELECTORS = {
  container: '[data-test="field-container"]',
  label: '[data-test="field-label"]',
} as const;

const RENDERERS_CONFIG: RendererDef[] = [
  { type: 'text', component: MockTextRendererComponent },
  { type: 'checkbox', component: MockCheckboxRendererComponent },
];
@Component({ selector: 'app-hint-renderer', template: '' })
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
      expect(container.classList).toContain('form-field--column');
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
      expect(container.classList).toContain('form-field--row');
    });

    it('should fall back to form-level labelOrientation when control has none', async () => {
      await setupTestBed({ labelOrientation: 'row' });

      createComponent(createControlSchema());

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container.classList).toContain('form-field--row');
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
});
