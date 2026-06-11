import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GroupFieldSchema } from '../../schema/form-schema.model';
import { FormBuilderService } from '../../services/form-builder.service';
import { FormFieldComponent } from '../form-field/form-field.component';
import {
  RendererRegistry,
  RENDERERS,
} from '../renderer-template-registry/renderer-template.registry';
import { TextRendererComponent } from '../form-field-renderers/text-field-renderer/text-field-renderer.component';
import { NumberRendererComponent } from '../form-field-renderers/number-field-renderer/number-field-renderer.component';
import { CheckboxRendererComponent } from '../form-field-renderers/checkbox-field-renderer/checkbox-field-renderer.component';
import { SelectRendererComponent } from '../form-field-renderers/select-field-renderer/select-field-renderer.component';

@Component({
  selector: 'forge-form-group-renderer',
  templateUrl: './group-renderer.component.html',
  imports: [ReactiveFormsModule, FormFieldComponent],
  providers: [
    FormBuilderService,
    RendererRegistry,
    {
      provide: RENDERERS,
      multi: true,
      useValue: {
        type: 'text',
        component: TextRendererComponent,
      },
    },
    {
      provide: RENDERERS,
      multi: true,
      useValue: {
        type: 'number',
        component: NumberRendererComponent,
      },
    },
    {
      provide: RENDERERS,
      multi: true,
      useValue: {
        type: 'checkbox',
        component: CheckboxRendererComponent,
      },
    },
    {
      provide: RENDERERS,
      multi: true,
      useValue: {
        type: 'select',
        component: SelectRendererComponent,
      },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupRendererComponent {
  form = input.required<FormGroup>();
  schema = input.required<GroupFieldSchema>();
}
