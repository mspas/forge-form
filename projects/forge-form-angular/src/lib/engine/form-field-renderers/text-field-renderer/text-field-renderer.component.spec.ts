import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TextRendererComponent } from './text-field-renderer.component';
import { TextControlSchema } from '../../../schema/form-control.model';

describe('TextRendererComponent', () => {
  let fixture: ComponentFixture<TextRendererComponent>;
  let component: TextRendererComponent;

  const SELECTORS = {
    input: '[data-test="text-input"]',
  } as const;

  const createSchema = (
    overrides: Partial<TextControlSchema> = {},
  ): TextControlSchema => ({
    type: 'text',
    controlName: 'name',
    label: 'Name',
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextRendererComponent],
    }).compileComponents();
  });

  const createComponent = (
    schema: TextControlSchema,
    control?: FormControl,
  ) => {
    fixture = TestBed.createComponent(TextRendererComponent);
    component = fixture.componentInstance;
    component.control = control ?? new FormControl('');
    component.controlSchema = schema;
    fixture.detectChanges();
  };

  it('should render a text input', () => {
    createComponent(createSchema());

    const input = fixture.nativeElement.querySelector(SELECTORS.input);
    expect(input).toBeTruthy();
    expect(input.type).toBe('text');
  });

  it('should bind the FormControl value to the input', () => {
    const control = new FormControl('hello');
    createComponent(createSchema(), control);

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.value).toBe('hello');
  });

  it('should use placeholder from schema', () => {
    createComponent(createSchema({ placeholder: 'Enter name' }));

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.placeholder).toBe('Enter name');
  });

  it('should fall back to label as placeholder when no placeholder is set', () => {
    createComponent(
      createSchema({ label: 'Full Name', placeholder: undefined }),
    );

    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      SELECTORS.input,
    );
    expect(input.placeholder).toBe('Full Name');
  });
});
