import { Pipe, PipeTransform } from '@angular/core';
import { GlobalConstants } from '@app/global-constants';
import { TranslateService } from '@ngx-translate/core';
import { formatDateToPattern, formatTimezone } from '@shared/date-utils';
import { DateRange } from '../models/date-range.model';

@Pipe({
  name: 'formatDateRange',
  pure: false
})
export class FormatDateRangePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) {
  }

  /**
   * Format a daterange into a string to display (À partir du YYYY/MM/DD HH:mm:ss UTC+xx:xx jusqu'au YYYY/MM/DD HH:mm:ss UTC+xx:xx)
   * @param dateStart
   * @param timeOfDayStart
   * @param dateEnd
   * @param timeOfDayEnd
   * @param timezone
   */
  transform({ dateStart, timeOfDayStart, dateEnd, timeOfDayEnd, timezone = GlobalConstants.USER_TIMEZONE }: DateRange): string {
    let range = '';
    const patternDate = this.translate.currentLang === 'en' ? 'yyyy/MM/dd' : 'dd/MM/yyyy';


    if (dateStart) {
      let formatDateStart = formatDateToPattern(dateStart, patternDate);
      formatDateStart += timeOfDayStart ? ` ${timeOfDayStart} ${formatTimezone(timezone)}` : '';
      range += `${this.translate.instant('detail.range-from-date')} ${formatDateStart}`;
    }

    if (dateEnd) {
      let formatDateEnd = formatDateToPattern(dateEnd, patternDate);
      formatDateEnd += timeOfDayEnd ? ` ${timeOfDayEnd} ${formatTimezone(timezone)}` : '';
      range += ` ${this.translate.instant('detail.range-to-date')} ${formatDateEnd}`;
    }

    return range;
  }
}
