import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ENGLISH_DATE_REGEX_PATTERN } from '../date-utils';

@Pipe({
  name: 'formatDate',
  pure: false
})
export class FormatDatePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) {
  }

  transform(dateWithoutTime: string): string {
    if (!dateWithoutTime || !ENGLISH_DATE_REGEX_PATTERN.test(dateWithoutTime)) { return dateWithoutTime; }
    const [year, month, day] = dateWithoutTime.split('-');

    return this.translate.currentLang === 'en' ? `${year}/${month}/${day}` : `${day}/${month}/${year}`;
  }
}
