import { Pipe, PipeTransform } from '@angular/core';
import { GlobalConstants } from '@app/global-constants';
import { TranslateService } from '@ngx-translate/core';
import { convertToTimeZone, formatToTimeZone } from 'date-fns-timezone';
import { utcToZonedTime } from 'date-fns-tz';
import { ENGLISH_DATE_FORMAT, FRENCH_DATE_FORMAT, findTimeZone } from '../date-utils';

@Pipe({
  name: 'localizedDate',
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {

  constructor(private readonly translateService: TranslateService) { }

  transform(value: any, timezone = GlobalConstants.USER_TIMEZONE): any {
    const timeZone = findTimeZone(timezone ?? GlobalConstants.USER_TIMEZONE);
    if (!value || value.length === 0) { return value; }

    const date = convertToTimeZone(value, { timeZone });
    const zonedDate = utcToZonedTime(date, timeZone);
    const patternDate = this.translateService.currentLang === 'en' ? ENGLISH_DATE_FORMAT : FRENCH_DATE_FORMAT;

    return formatToTimeZone(zonedDate, patternDate, { timeZone });
  }

}
