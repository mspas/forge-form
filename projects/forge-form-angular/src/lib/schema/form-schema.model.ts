import { BaseElementSchema, ControlSchema } from './form-control.model';
import { ElementFormOptions, FormOptions } from './form-options.model';
import { UpdateOn } from './update-on.model';

export interface GroupFieldSchema extends BaseElementSchema {
  type: 'group';
  controls: (GroupFieldSchema | ControlSchema)[];
  options?: ElementFormOptions;
}

export interface FormSchema {
  controls: (GroupFieldSchema | ControlSchema)[];
  id?: string;
  updateOn?: UpdateOn;
  options?: FormOptions;
}
