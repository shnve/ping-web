import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'formatLocalizedText',
  pure: false
})
export class FormatLocalizedTextPipe implements PipeTransform {

  constructor(private readonly translateService: TranslateService) {
  }

  transform(localizedText: { [lang: string]: string }): string {
    let text = localizedText[this.translateService.currentLang];

    // TODO : handle no results with user preferred language (fr ?)
    // TODO : For now, get the first localizedText item
    if (!text) {
      text = localizedText[Object.keys(localizedText)[0]];
    }

    return text;
  }
}
