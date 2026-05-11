import { Component, computed, input } from '@angular/core';
import { FormFieldContextComponent } from '../form-engine/engine/form-field/form-field-context.component';

@Component({
  selector: 'app-demo-hint',
  template: `
    {{ currentLength() }} / {{ maxLength() }}
  `,
})
export class DemoHintComponent extends FormFieldContextComponent {
  maxLength = input<unknown>();

  currentLength = computed(() => {
    return (this.controlValue() as string | undefined)?.length ?? 0;
  });
}
