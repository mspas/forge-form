import { Injectable } from '@angular/core';
import { FormSchema, GroupFieldSchema } from '../schema/form-schema.model';
import {
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { ControlSchema } from '../schema/form-control.model';
import {
  VALIDATOR_TYPES,
  ValidatorSchema,
} from '../engine/validators/validator-schema.model';

@Injectable()
export class FormBuilderService {
  buildForm(schema: FormSchema): FormGroup {
    const controls: Record<string, FormControl> = {};

    const collectControls = (node: FormSchema | GroupFieldSchema) => {
      for (const item of node.controls) {
        if (this.isGroupFieldSchema(item)) {
          collectControls(item);
        } else {
          controls[item.controlName] = new FormControl(
            item.initialValue ?? null,
            {
              updateOn: item.updateOn ?? schema.updateOn,
              validators: this.mapSchemaValidators(item.validators),
            },
          );
        }
      }
    };

    collectControls(schema);
    return new FormGroup(controls, { updateOn: schema.updateOn });
  }

  private mapSchemaValidators(
    validators?: ValidatorSchema[],
  ): ValidatorFn[] | null {
    if (!validators?.length) {
      return null;
    }

    return validators.map((validator) => {
      switch (validator.type) {
        case VALIDATOR_TYPES.required:
          return Validators.required;
        case VALIDATOR_TYPES.minlength:
          return Validators.minLength(validator.value);
        case VALIDATOR_TYPES.maxlength:
          return Validators.maxLength(validator.value);
        case VALIDATOR_TYPES.min:
          return Validators.min(validator.value);
        case VALIDATOR_TYPES.max:
          return Validators.max(validator.value);
        case VALIDATOR_TYPES.custom:
          return validator.fn;
        default:
          return () => null;
      }
    });
  }

  private isGroupFieldSchema(
    obj: GroupFieldSchema | ControlSchema,
  ): obj is GroupFieldSchema {
    return 'controls' in obj;
  }
}
