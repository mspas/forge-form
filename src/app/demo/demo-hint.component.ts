import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-demo-hint',
  template: `
    {{ currentLength() }} / {{ maxLength() }}
  `,
})
export class DemoHintComponent {
  value = input<unknown>();
  maxLength = input<unknown>();

  currentLength = computed(() => {
    return (this.value() as string | undefined)?.length ?? 0;
  });
}
