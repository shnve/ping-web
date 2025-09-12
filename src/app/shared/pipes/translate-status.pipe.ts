import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateStatus',
  pure: false
})
export class TranslateStatusPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) {}

  transform(firstPartFromI18n: string, secondPartRetrieveFromObject: string): string {
    return this.translate.instant(`${firstPartFromI18n}.${secondPartRetrieveFromObject}`).toLowerCase();
  }
}
