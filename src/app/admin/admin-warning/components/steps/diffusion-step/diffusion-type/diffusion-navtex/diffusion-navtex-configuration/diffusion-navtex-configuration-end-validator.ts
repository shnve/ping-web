import { UntypedFormGroup, ValidatorFn } from '@angular/forms';

export function shouldHaveFilledEndDayAndEndHourTogetherValidator(): ValidatorFn {
  return (formGroup: UntypedFormGroup) => {
    const endDayControl = formGroup.get('endDay');
    const endHourControl = formGroup.get('endHour');

    if (!endDayControl || !endHourControl) {
      return null;
    }

    const endDayValue = endDayControl.value;
    const endHourValue = endHourControl.value;

    if (!endDayValue && !endHourValue && +endDayValue !== 0 && +endHourValue !== 0) {
      return null;
    }

    if (!endDayValue && (endHourValue || (endHourValue !== null && +endHourValue === 0))) {
      return { endDayShouldBeFilled: true };
    }

    if (!endHourValue && (endDayValue || (endDayValue !== null && +endDayValue === 0))) {
      return { endHourShouldBeFilled: true };
    }

    return null;
  };
}
