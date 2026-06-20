import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { CheckboxRendererComponent } from './checkbox-field-renderer.component';
import { CheckboxControlSchema } from '../../../schema/form-control.model';

describe('CheckboxRendererComponent', () => {
  let fixture: ComponentFixture<CheckboxRendererComponent>;
  let component: CheckboxRendererComponent;

  const SELECTORS = {
    input: '[data-test="checkbox-input"]',
  } as const;

  const createSchema = (
    overrides: Partial<CheckboxControlSchema> = {},
  ): CheckboxControlSchema => ({
    type: 'checkbox',
    controlName: 'accept',
    label: 'Accept',
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxRendererComponent],
    }).compileComponents();
  });

  const createComponent = (
    schema: CheckboxControlSchema,
    control?: FormControl,
    isValid = true,
  ) => {
    fixture = TestBed.createComponent(CheckboxRendererComponent);
    component = fixture.componentInstance;
    component.control = control ?? new FormControl(false);
    component.controlSchema = schema;
    component.isValid = isValid;
    fixture.detectChanges();
  };

  it('should render a checkbox input', () => {
    createComponent(createSchema());

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input).toBeTruthy();
    expect(input.type).toBe('checkbox');
  });

  it('should reflect the FormControl value as checked state', () => {
    const control = new FormControl(true);
    createComponent(createSchema(), control);

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.checked).toBe(true);
  });

  it('should update the FormControl when checkbox is toggled', () => {
    const control = new FormControl(false);
    createComponent(createSchema(), control);

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    input.click();
    fixture.detectChanges();

    expect(control.value).toBe(true);
  });

  it('should apply the error class when isValid is false and the control is dirty', () => {
    const control = new FormControl(false);
    control.markAsDirty();
    createComponent(createSchema(), control, false);

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.classList).toContain('forge-form-checkbox-error');
  });

  it('should NOT apply the error class when isValid is true', () => {
    const control = new FormControl(false);
    control.markAsDirty();
    createComponent(createSchema(), control, true);

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.classList).not.toContain('forge-form-checkbox-error');
  });
});
