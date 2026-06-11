import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NumberRendererComponent } from './number-field-renderer.component';
import { NumberControlSchema } from '../../../schema/form-control.model';

describe('NumberRendererComponent', () => {
  let fixture: ComponentFixture<NumberRendererComponent>;
  let component: NumberRendererComponent;

  const SELECTORS = {
    input: '[data-test="number-input"]',
  } as const;

  const createSchema = (
    overrides: Partial<NumberControlSchema> = {},
  ): NumberControlSchema => ({
    type: 'number',
    controlName: 'age',
    label: 'Age',
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberRendererComponent],
    }).compileComponents();
  });

  const createComponent = (
    schema: NumberControlSchema,
    control?: FormControl,
  ) => {
    fixture = TestBed.createComponent(NumberRendererComponent);
    component = fixture.componentInstance;
    component.control = control ?? new FormControl(null);
    component.controlSchema = schema;
    fixture.detectChanges();
  };

  it('should render a number input', () => {
    createComponent(createSchema());

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input).toBeTruthy();
    expect(input.type).toBe('number');
  });

  it('should bind the FormControl value to the input', () => {
    const control = new FormControl(42);
    createComponent(createSchema(), control);

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.value).toBe('42');
  });

  it('should set min and max attributes from schema', () => {
    createComponent(createSchema({ min: 0, max: 100 }));

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.getAttribute('min')).toBe('0');
    expect(input.getAttribute('max')).toBe('100');
  });

  it('should use placeholder from schema', () => {
    createComponent(createSchema({ placeholder: 'Enter age' }));

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.placeholder).toBe('Enter age');
  });

  it('should fall back to label as placeholder when no placeholder is set', () => {
    createComponent(
      createSchema({ label: 'Your Age', placeholder: undefined }),
    );

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.placeholder).toBe('Your Age');
  });
});
