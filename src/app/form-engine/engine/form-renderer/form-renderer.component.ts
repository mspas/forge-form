import {
  Component,
  ChangeDetectionStrategy,
  input,
  effect,
  inject,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormSchema } from '../../schema/form-schema.model';
import { FormFieldComponent } from '../form-field/form-field.component';
import {
  RendererRegistry,
  RENDERERS,
} from '../renderer-template-registry/renderer-template.registry';
import { TextRendererComponent } from '../form-field-renderers/text-field-renderer/text-field-renderer.component';
import { NumberRendererComponent } from '../form-field-renderers/number-field-renderer/number-field-renderer.component';
import { CheckboxRendererComponent } from '../form-field-renderers/checkbox-field-renderer/checkbox-field-renderer.component';
import { SelectRendererComponent } from '../form-field-renderers/select-field-renderer/select-field-renderer.component';
import { GroupRendererComponent } from '../group-renderer/group-renderer.component';
import { FORM_OPTIONS } from '../../schema/form-options-token';
import {
  DEFAULT_ERROR_FALLBACK,
  DEFAULT_ERROR_MESSAGES,
  ERROR_MESSAGES,
} from '../error-messages/error-messages.registry';
import { FormService } from './form.service';
import { FormBuilderService } from '../../services/form-builder.service';
import { THEMES } from '../../schema/form-options.model';

@Component({
  selector: 'app-form-angular',
  templateUrl: './form-renderer.component.html',
  imports: [ReactiveFormsModule, FormFieldComponent, GroupRendererComponent],
  providers: [
    FormBuilderService,
    RendererRegistry,
    FormService,
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
    {
      provide: FORM_OPTIONS,
      useFactory: (component: FormRendererComponent<unknown>) =>
        component.schema().options,
      deps: [FormRendererComponent],
    },
    {
      provide: ERROR_MESSAGES,
      useValue: DEFAULT_ERROR_MESSAGES,
      multi: true,
    },
    { provide: DEFAULT_ERROR_FALLBACK, useValue: 'Invalid field', multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRendererComponent<TModel> {
  private readonly formService = inject(FormService<TModel>);

  readonly schema = input.required<FormSchema>();
  readonly formSubmit = output<TModel>();

  readonly THEMES = THEMES;

  readonly formSignal = this.formService.form;

  constructor() {
    effect(() => {
      this.formService.init(this.schema());
    });
  }

  getControl(name: string): FormControl {
    return this.formSignal()!.get(name) as FormControl;
  }

  onSubmit() {
    if (this.formSignal()!.valid) {
      this.formSubmit.emit(this.formSignal()!.value);
    }
  }
}
