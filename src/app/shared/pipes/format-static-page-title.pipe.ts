import { Pipe, PipeTransform } from '@angular/core';
import { StaticPage } from '@app/models/static-page.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'formatStaticPageTitle',
  pure: false
})
export class FormatStaticPageTitlePipe implements PipeTransform {
  constructor(private readonly translate: TranslateService) { }

  transform(staticPage: StaticPage): string {
    return this.translate.currentLang === 'es' ? staticPage.title : staticPage.internationalTitle;
  }
}