import { Directive, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Directive()
export abstract class FormFieldContextComponent<T = unknown> {
  control = input.required<AbstractControl<T>>();
  controlValue = input.required<T>();
  controlErrors = input<ValidationErrors | null>(null);
  controlSchema = input.required<unknown>();
}
