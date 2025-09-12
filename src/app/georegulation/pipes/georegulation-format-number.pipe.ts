import { Pipe, PipeTransform } from '@angular/core';
import { GeoregulationNumber } from '../models/georegulation.model';

@Pipe({
  name: 'georegulationFormatNumber',
  pure: false
})
export class GeoregulationFormatNumberPipe implements PipeTransform {

  constructor() { }

  transform(grNumber: GeoregulationNumber): string {
    if (!grNumber || !grNumber.year && !grNumber.text && !grNumber.authorityCodes?.length && !grNumber.date) {
      return '';
    }
    return `${grNumber.year ?? ''}-${grNumber.text ?? ''}-${(grNumber.authorityCodes ?? []).join('-')}-` + (grNumber.date ? grNumber.date : '');
  }
}
