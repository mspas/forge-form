import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FieldRenderer,
  TextControlSchema,
} from '../../../schema/form-control.model';

@Component({
  selector: 'app-text-renderer',
  template: `
    <input
      class="forge-form-input"
      data-test="text-input"
      [attr.id]="controlSchema.controlName"
      [formControl]="control"
      [placeholder]="controlSchema.placeholder || controlSchema.label" />
  `,
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class TextRendererComponent implements FieldRenderer<TextControlSchema> {
  @Input() control!: FormControl;
  @Input() controlSchema!: TextControlSchema;
}
