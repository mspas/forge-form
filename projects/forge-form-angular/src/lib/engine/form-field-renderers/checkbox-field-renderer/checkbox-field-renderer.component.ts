import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FieldRenderer,
  CheckboxControlSchema,
} from '../../../schema/form-control.model';

@Component({
  selector: 'forge-form-checkbox-renderer',
  template: `
    <input
      class="forge-form-checkbox"
      [class.forge-form-checkbox-error]="!isValid && control.dirty"
      data-test="checkbox-input"
      type="checkbox"
      [attr.id]="controlSchema.controlName"
      [formControl]="control" />
  `,
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class CheckboxRendererComponent implements FieldRenderer<CheckboxControlSchema> {
  @Input() control!: FormControl;
  @Input() controlSchema!: CheckboxControlSchema;
  @Input() isValid!: boolean;
}
