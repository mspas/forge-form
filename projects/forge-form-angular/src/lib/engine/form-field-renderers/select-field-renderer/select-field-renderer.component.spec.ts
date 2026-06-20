import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SelectRendererComponent } from './select-field-renderer.component';
import { SelectControlSchema } from '../../../schema/form-control.model';

describe('SelectRendererComponent', () => {
  let fixture: ComponentFixture<SelectRendererComponent>;
  let component: SelectRendererComponent;

  const SELECTORS = {
    select: '[data-test="select-input"]',
    placeholder: '[data-test="select-placeholder"]',
    option: '[data-test="select-option"]',
  } as const;

  const createSchema = (
    overrides: Partial<SelectControlSchema> = {},
  ): SelectControlSchema => ({
    type: 'select',
    controlName: 'color',
    label: 'Color',
    items: [
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
    ],
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectRendererComponent],
    }).compileComponents();
  });

  const createComponent = (
    schema: SelectControlSchema,
    control?: FormControl,
    isValid = true,
  ) => {
    fixture = TestBed.createComponent(SelectRendererComponent);
    component = fixture.componentInstance;
    component.control = control ?? new FormControl(null);
    component.controlSchema = schema;
    component.isValid = isValid;
    fixture.detectChanges();
  };

  it('should render a select element', () => {
    createComponent(createSchema());

    const select = fixture.nativeElement.querySelector(SELECTORS.select);
    expect(select).toBeTruthy();
  });

  it('should render an option for each item', () => {
    createComponent(createSchema());

    const options = fixture.nativeElement.querySelectorAll(SELECTORS.option);
    expect(options.length).toBe(2);
    expect(options[0].textContent.trim()).toBe('Red');
    expect(options[1].textContent.trim()).toBe('Blue');
  });

  it('should render a disabled placeholder option when placeholder is set', () => {
    createComponent(createSchema({ placeholder: 'Choose a color' }));

    const placeholder: HTMLOptionElement = fixture.nativeElement.querySelector(
      SELECTORS.placeholder,
    );
    expect(placeholder).toBeTruthy();
    expect(placeholder.disabled).toBe(true);
    expect(placeholder.textContent.trim()).toBe('Choose a color');
  });

  it('should fall back to label as placeholder text', () => {
    createComponent(
      createSchema({ label: 'Pick Color', placeholder: undefined }),
    );

    const placeholder: HTMLOptionElement = fixture.nativeElement.querySelector(
      SELECTORS.placeholder,
    );
    expect(placeholder.textContent.trim()).toBe('Pick Color');
  });

  it('should NOT render placeholder option when neither placeholder nor label is set', () => {
    createComponent(createSchema({ label: undefined, placeholder: undefined }));

    const placeholder = fixture.nativeElement.querySelector(
      SELECTORS.placeholder,
    );
    expect(placeholder).toBeNull();
  });

  it('should bind the selected value to the FormControl', () => {
    const control = new FormControl('blue');
    createComponent(createSchema(), control);

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      SELECTORS.select,
    );
    expect(select.value).toBe('blue');
  });

  it('should apply the error class when isValid is false and the control is touched', () => {
    const control = new FormControl(null);
    control.markAsTouched();
    createComponent(createSchema(), control, false);

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      SELECTORS.select,
    );
    expect(select.classList).toContain('forge-form-input-error');
  });

  it('should NOT apply the error class when isValid is true', () => {
    const control = new FormControl(null);
    control.markAsTouched();
    createComponent(createSchema(), control, true);

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      SELECTORS.select,
    );
    expect(select.classList).not.toContain('forge-form-input-error');
  });
});
