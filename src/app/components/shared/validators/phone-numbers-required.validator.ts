import {UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {PhoneNumberUtil} from 'google-libphonenumber';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export function checkFilledInputFields(minRequired = 1): ValidatorFn {
  return function validate(formGroup: UntypedFormGroup): ValidationErrors | null {
    let filled = 0;
    let matched = 0;

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];

      // count filled phone numbers
      if (control.value && control.value !== '') {
        filled++;

        // count valid phone numbers
        try {
          const number = phoneNumberUtil.parse(control.value.number, control.value.countryCode);
          if (number && phoneNumberUtil.isValidNumber(number)) {
            matched++;
          }
        } catch (e) {
        }
      }
    });

    // if minimum required phone numbers is not filled or if at least one filled number doesn't match regex,
    // then it's invalid
    if (filled < minRequired || filled !== matched) {
      return {
        requireValidPhoneNumbers: true
      };
    }

    return null;
  };
}

export function checkPhoneNumber(): ValidatorFn {
  return function validate(control: UntypedFormControl): ValidationErrors | null {


    if (control.value && control.value !== '') {
      try {
        const number = phoneNumberUtil.parse(control.value.number, control.value.countryCode);
        if (number && phoneNumberUtil.isValidNumber(number)) {
          return null;
        }
      } catch (e) {
      }
    }
    return {
      requireValidPhoneNumber: true
    };
  };
}
