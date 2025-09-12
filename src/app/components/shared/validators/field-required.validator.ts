import {ValidatorFn, Validators} from '@angular/forms';

export type FieldRequired = (required: boolean) => ValidatorFn;

export const fieldRequired: FieldRequired = (required = false) => control => {
  if (required) {
    return Validators.required(control);
  }
  return null;
};
