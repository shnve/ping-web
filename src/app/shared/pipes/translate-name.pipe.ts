import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateName',
  pure: false
})
export class TranslateNamePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) { }

  transform(names: { name: string, internationalName?: string }): string {
    const currentLang = this.translate.currentLang;
    const name = names.name || '';

    if (currentLang === 'fr') {
      return name;
    }

    return names.internationalName || name;
  }

}
