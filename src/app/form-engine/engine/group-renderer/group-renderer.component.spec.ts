import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { GroupRendererComponent } from './group-renderer.component';
import { GroupFieldSchema } from '../../schema/form-schema.model';
import { ControlSchema } from '../../schema/form-control.model';

// ─────────────────────────────────────────────────────────────
// STUB CHILD COMPONENT
// ─────────────────────────────────────────────────────────────

@Component({ selector: 'app-form-field', template: '' })
class StubFormFieldComponent {
  control = input.required<AbstractControl>();
  controlSchema = input.required<ControlSchema>();
}

const SELECTORS = {
  container: '[data-test="group-container"]',
  field: '[data-test="group-field"]',
  nestedGroup: '[data-test="nested-group"]',
} as const;

describe('GroupRendererComponent', () => {
  let fixture: ComponentFixture<GroupRendererComponent>;
  let component: GroupRendererComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupRendererComponent],
    })
      .overrideComponent(GroupRendererComponent, {
        set: {
          imports: [ReactiveFormsModule, StubFormFieldComponent],
        },
      })
      .compileComponents();
  });

  const createComponent = (schema: GroupFieldSchema, form?: FormGroup) => {
    fixture = TestBed.createComponent(GroupRendererComponent);
    component = fixture.componentInstance;

    // Build a FormGroup that matches the schema controls
    const controls: Record<string, FormControl> = {};
    for (const ctrl of schema.controls) {
      if (ctrl.type !== 'group') {
        controls[ctrl.controlName] = new FormControl(null);
      }
    }
    const formGroup = form ?? new FormGroup(controls);

    fixture.componentRef.setInput('schema', schema);
    fixture.componentRef.setInput('form', formGroup);
    fixture.detectChanges();
  };

  const createGroupSchema = (
    overrides: Partial<GroupFieldSchema> = {},
  ): GroupFieldSchema => ({
    type: 'group',
    controls: [],
    ...overrides,
  });

  // ─────────────────────────────────────────────────────────────
  // RENDERING
  // ─────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('should render a group container', () => {
      createComponent(createGroupSchema());

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container).toBeTruthy();
    });

    it('should render a form-field for each non-group control', () => {
      createComponent(
        createGroupSchema({
          controls: [
            { type: 'text', controlName: 'street', label: 'Street' },
            { type: 'text', controlName: 'city', label: 'City' },
          ],
        }),
      );

      const fields = fixture.nativeElement.querySelectorAll(SELECTORS.field);
      expect(fields.length).toBe(2);
    });

    it('should render a nested group-renderer for group-type controls', () => {
      const nestedGroup: GroupFieldSchema = {
        type: 'group',
        controls: [],
      };

      createComponent(createGroupSchema({ controls: [nestedGroup] }));

      const nested = fixture.nativeElement.querySelectorAll(
        SELECTORS.nestedGroup,
      );
      expect(nested.length).toBe(1);
    });

    it('should apply orientation class from schema options', () => {
      createComponent(createGroupSchema({ options: { orientation: 'row' } }));

      const container = fixture.nativeElement.querySelector(
        SELECTORS.container,
      );
      expect(container.classList).toContain('form-group--row');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────

  describe('getControl', () => {
    it('should return the FormControl from the parent form by name', () => {
      const form = new FormGroup({
        email: new FormControl('test@example.com'),
      });

      createComponent(
        createGroupSchema({
          controls: [{ type: 'text', controlName: 'email', label: 'Email' }],
        }),
        form,
      );

      const control = component.getControl('email');
      expect(control).toBeInstanceOf(FormControl);
      expect(control.value).toBe('test@example.com');
    });
  });
});
