import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormRendererComponent } from '../form-engine/engine/form-renderer/form-renderer.component';
import { FormSchema } from '../form-engine/schema/form-schema.model';
import {
  customValidator,
  maxLength,
  min,
  minLength,
  required,
} from '../form-engine/engine/validators/validator-helpers';
import { DemoErrorComponent } from './demo-error.component';
import { DemoHintComponent } from './demo-hint.component';

interface UserFormModel {
  firstName: string;
  lastName: string;
  age: number;
  newsletter: boolean;
  gender: string;
}

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  imports: [FormRendererComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent {
  schema: FormSchema = {
    controls: [
      {
        type: 'group',
        controls: [
          {
            type: 'text',
            controlName: 'firstName',
            label: 'First Name',
            placeholder: 'Enter your first name',
            updateOn: 'change',
            validators: [
              required(),
              minLength({ value: 3, errorMessage: 'Name is too short' }),
              maxLength({ value: 100, errorMessage: 'Name is too long' }),
            ],
            hint: {
              component: DemoHintComponent,
              inputs: {
                maxLength: 100,
              },
            },
            options: {
              width: '250px',
            },
          },
          {
            type: 'text',
            controlName: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            validators: [
              required(),
              minLength({ value: 3 }),
              maxLength({ value: 100 }),
            ],
            hint: 'First name is required and it must be between 3 and 100 characters long',
            options: {
              width: '250px',
            },
          },
        ],
        options: {
          orientation: 'row',
        },
      },
      {
        type: 'number',
        controlName: 'age',
        label: 'Age',
        placeholder: 'Enter your age',
        validators: [
          min({
            value: 18,
            errorMessage: {
              component: DemoErrorComponent,
              inputs: () => ({
                text: 'You must be at least 18 years old',
              }),
            },
          }),
        ],
        options: {
          width: '250px',
        },
      },
      {
        type: 'checkbox',
        controlName: 'acceptTerms',
        label: 'Accept Terms and Conditions',
        updateOn: 'change',
        validators: [
          customValidator({
            key: 'mustAccept',
            fn: (control) =>
              control.value === true ? null : { mustAccept: true },
            errorMessage: 'You must accept the terms and conditions',
          }),
        ],
        options: {
          labelOrientation: 'row',
        },
      },
      {
        type: 'select',
        controlName: 'gender',
        label: 'Select gender',
        placeholder: 'Choose an option',
        items: [
          { value: 'female', label: 'Female' },
          { value: 'male', label: 'Male' },
        ],
        options: {
          labelOrientation: 'row',
        },
        visibility: {
          fn: (ctx) =>
            !ctx.form.get('firstName')?.valid ||
            !ctx.form.get('lastName')?.valid,
          behavior: 'hide',
          clearOnHide: true,
        },
      },
    ],
    updateOn: 'blur',
    options: {
      orientation: 'column',
      labelOrientation: 'column',
      theme: 'default',
    },
  };

  onSubmit(value: UserFormModel) {
    console.log('Form submitted with value:', value);
  }
}
