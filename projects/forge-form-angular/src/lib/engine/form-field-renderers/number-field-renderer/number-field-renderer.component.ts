import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FieldRenderer,
  NumberControlSchema,
} from '../../../schema/form-control.model';

@Component({
  selector: 'forge-form-number-renderer',
  template: `
    <input
      class="forge-form-input"
      [class.forge-form-input-error]="!isValid && control.touched"
      data-test="number-input"
      type="number"
      [attr.id]="controlSchema.controlName"
      [formControl]="control"
      [attr.min]="controlSchema.min"
      [attr.max]="controlSchema.max"
      [placeholder]="controlSchema.placeholder || controlSchema.label" />
  `,
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class NumberRendererComponent implements FieldRenderer<NumberControlSchema> {
  @Input() control!: FormControl;
  @Input() controlSchema!: NumberControlSchema;
  @Input() isValid!: boolean;
}
