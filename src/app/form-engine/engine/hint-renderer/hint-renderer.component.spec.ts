import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HintRendererComponent } from './hint-renderer.component';
import {
  TextControlSchema,
  ControlSchema,
} from '../../schema/form-control.model';
import { HintComponentDef } from '../hint-messages/hint-messages.model';

@Component({
  selector: 'app-mock-hint',
  template: '<span data-test="hint-text">mock hint</span>',
})
class MockHintComponent {
  control = input<AbstractControl>();
  controlValue = input<unknown>();
  controlErrors = input<ValidationErrors | null>();
  controlSchema = input<ControlSchema>();
}

const SELECTORS = {
  hintText: '[data-test="hint-text"]',
} as const;

describe('HintRendererComponent', () => {
  let fixture: ComponentFixture<HintRendererComponent>;

  const createControlSchema = (
    overrides: Partial<TextControlSchema> = {},
  ): TextControlSchema => ({
    type: 'text',
    controlName: 'name',
    label: 'Name',
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HintRendererComponent, MockHintComponent],
    }).compileComponents();
  });

  const createComponent = (control: FormControl, schema: TextControlSchema) => {
    fixture = TestBed.createComponent(HintRendererComponent);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('controlSchema', schema);
    fixture.detectChanges();
  };

  it('should not render hint when controlSchema has no hint', () => {
    const control = new FormControl('valid');

    createComponent(control, createControlSchema());

    const hints = fixture.nativeElement.querySelectorAll(SELECTORS.hintText);
    expect(hints.length).toBe(0);
  });

  it('should render text hint when control is valid', () => {
    const control = new FormControl('valid');

    createComponent(
      control,
      createControlSchema({ hint: 'Enter your full name' }),
    );

    const hints = fixture.nativeElement.querySelectorAll(SELECTORS.hintText);
    expect(hints.length).toBe(1);
    expect(hints[0].textContent.trim()).toBe('Enter your full name');
  });

  it('should not render hint when control has errors', () => {
    const control = new FormControl(null, [Validators.required]);

    createComponent(
      control,
      createControlSchema({
        hint: 'Enter your full name',
        validators: [{ type: 'required' }],
      }),
    );

    // Trigger statusChanges so controlErrors signal is updated
    control.setValue(null);
    fixture.detectChanges();

    const hints = fixture.nativeElement.querySelectorAll(SELECTORS.hintText);
    expect(hints.length).toBe(0);
  });

  it('should show hint again when control becomes valid', () => {
    const control = new FormControl<string | null>(null, [Validators.required]);

    createComponent(
      control,
      createControlSchema({ hint: 'Enter your full name' }),
    );

    // Make invalid
    control.setValue(null);
    fixture.detectChanges();

    // Make valid
    control.setValue('filled');
    fixture.detectChanges();

    const hints = fixture.nativeElement.querySelectorAll(SELECTORS.hintText);
    expect(hints.length).toBe(1);
    expect(hints[0].textContent.trim()).toBe('Enter your full name');
  });

  it('should render component hint via NgComponentOutlet when control is valid', () => {
    const control = new FormControl('valid');
    const hint: HintComponentDef = {
      component: MockHintComponent,
    };

    createComponent(control, createControlSchema({ hint }));

    const rendered = fixture.nativeElement.querySelector(SELECTORS.hintText);
    expect(rendered).toBeTruthy();
    expect(rendered.textContent.trim()).toBe('mock hint');
  });

  it('should not render component hint when control has errors', () => {
    const control = new FormControl(null, [Validators.required]);
    const hint: HintComponentDef = {
      component: MockHintComponent,
    };

    createComponent(control, createControlSchema({ hint }));

    control.setValue(null);
    fixture.detectChanges();

    const rendered = fixture.nativeElement.textContent.trim();
    expect(rendered).toBe('');
  });
});
