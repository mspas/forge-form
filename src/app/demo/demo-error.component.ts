import { Component, input } from '@angular/core';

@Component({
  selector: 'app-demo-error',
  template: `
    {{ text() }}
  `,
})
export class DemoErrorComponent {
  text = input.required<string>();
}
