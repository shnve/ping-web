import { Pipe, PipeTransform } from '@angular/core';
import { GlobalConstants } from '@app/global-constants';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { TranslateService } from '@ngx-translate/core';
import { InfosourceDateRange } from '../models/infosource.model';


@Pipe({
  name: 'infosourceFormatDateRange',
  pure: false
})
export class InfosourceFormatDateRangePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService,
    private readonly formatDatetimePipe: FormatDatetimePipe) {
  }

  transform({start, end}: InfosourceDateRange, timezone = GlobalConstants.USER_TIMEZONE): string {
    let range = '';

    if (start) {
      range += `${this.translate.instant('detail.range-from-date')} ${this.formatDatetimePipe.transform(start, timezone)} `;
    }

    if (end) {
      range += `${this.translate.instant('detail.range-to-date')} ${this.formatDatetimePipe.transform(end, timezone)}`;
    }

    return range;
  }
}
