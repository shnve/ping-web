import { Pipe, PipeTransform } from '@angular/core';
import { GlobalConstants } from '@app/global-constants';
import { TranslateService } from '@ngx-translate/core';
import { formatDateToPattern, formatTimezone, isIsoDate } from '@shared/date-utils';
import { parseISO } from 'date-fns';

@Pipe({
  name: 'formatDatetime',
  pure: false
})
export class FormatDatetimePipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  /**
   * Format an ISO datetime (YYYY-MM-DDTHH:mm:ssZ) into string for display (YYYY/MM/DD HH:mm:ss UTC+xx:xx)
   * @param dateTime
   * @param timezone
   */
  transform(dateTime: any, timezone = GlobalConstants.USER_TIMEZONE): any {
    if (!dateTime?.length) { return dateTime; }

    const patternDate = this.translate.currentLang === 'en' ? 'yyyy/MM/dd' : 'dd/MM/yyyy';

    const date = isIsoDate(dateTime) ? dateTime : parseISO(dateTime).toISOString();
    const splitDate = date.split('Z')[0].split('T');

    const formattedDate = formatDateToPattern(splitDate[0], patternDate);

    // if there is no time in dateTime
    if (splitDate.length === 1) {
      return formattedDate;
    } else {
      // split on ':' to remove seconds part (12:00:00.000 -> 12:00)
      const [hour, minute] = splitDate[1].split(':');
      return `${formattedDate} ${hour + ':' + minute} ${formatTimezone(timezone)}`;
    }
  }
}
