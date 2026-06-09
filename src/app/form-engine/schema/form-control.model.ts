import { FormControl } from '@angular/forms';
import { ValidatorSchema } from '../engine/validators/validator-schema.model';
import { UpdateOn } from './update-on.model';
import { FormFieldOptions } from './form-options.model';
import { HintMessage } from '../engine/hint-messages/hint-messages.model';
import { VisibilitySchema } from './visibility.model';

export type ControlSchema =
  | TextControlSchema
  | NumberControlSchema
  | CheckboxControlSchema
  | SelectControlSchema;

export interface BaseElementSchema {
  type: string;
  label?: string;
}

export interface BaseControlSchema extends BaseElementSchema {
  controlName: string;
  options?: FormFieldOptions;
  initialValue?: unknown;
  validators?: ValidatorSchema[];
  visibility?: VisibilitySchema;
  updateOn?: UpdateOn;
  hint?: HintMessage;
}

export interface TextControlSchema extends BaseControlSchema {
  type: 'text';
  placeholder?: string;
}

export interface NumberControlSchema extends BaseControlSchema {
  type: 'number';
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface CheckboxControlSchema extends BaseControlSchema {
  type: 'checkbox';
}

export interface SelectControlSchema extends BaseControlSchema {
  type: 'select';
  items: SelectOption[];
  placeholder?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldRenderer<TSchema = unknown> {
  control: FormControl;
  controlSchema: TSchema;
}
