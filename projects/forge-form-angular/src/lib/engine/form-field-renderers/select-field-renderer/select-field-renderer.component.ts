import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FieldRenderer,
  SelectControlSchema,
} from '../../../schema/form-control.model';

@Component({
  selector: 'forge-form-select-renderer',
  template: `
    <select
      class="forge-form-select"
      data-test="select-input"
      [attr.id]="controlSchema.controlName"
      [formControl]="control">
      @if (controlSchema.placeholder || controlSchema.label) {
        <option data-test="select-placeholder" [ngValue]="null" disabled>
          {{ controlSchema.placeholder || controlSchema.label }}
        </option>
      }

      @for (option of controlSchema.items; track option.value) {
        <option data-test="select-option" [value]="option.value">
          {{ option.label }}
        </option>
      }
    </select>
  `,
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class SelectRendererComponent implements FieldRenderer<SelectControlSchema> {
  @Input() control!: FormControl;
  @Input() controlSchema!: SelectControlSchema;
}
