import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface WarningData {
  generalAreas: { [lang: string]: Array<string> };
  localities: { [lang: string]: Array<string> };
}

const GENERAL_AREA_SEPARATOR = ' - ';
const LOCALITY_SEPARATOR = ' - ';
const GENERAL_AREA_AND_LOCALITY_SEPARATOR = ' - ';

@Pipe({
  name: 'formatWarningTitle',
  pure: false
})
export class FormatWarningTitlePipe implements PipeTransform {

  constructor(private readonly translateService: TranslateService) {
  }

  transform(warningData: WarningData): string {
    let generalAreas = warningData?.generalAreas[this.translateService.currentLang] || warningData?.generalAreas['en'];
    let localities = warningData?.localities[this.translateService.currentLang] || warningData?.localities['en'];
    let title = '';

    if (generalAreas) {
      title = generalAreas.join(GENERAL_AREA_SEPARATOR);
    } else if (Object.keys(warningData?.generalAreas ?? {}).length) {
      // with warningData?.generalAreas, if :
      // - no translation exists for the current user language
      // - and no english translation exists
      // => we get the first warningData?.generalAreas translation
      generalAreas = warningData?.generalAreas[Object.keys(warningData?.generalAreas)[0]];
      title = generalAreas.join(GENERAL_AREA_SEPARATOR);
    }

    if (localities) {
      title += GENERAL_AREA_AND_LOCALITY_SEPARATOR + localities.join(LOCALITY_SEPARATOR);
    } else if (Object.keys(warningData?.localities ?? {}).length) {
      // with warningData?.localities, if :
      // - no translation exists for the current user language
      // - and no english translation exists
      // - and there is at least one locality
      // => we get the first warningData?.localities translation
      localities = warningData?.localities[Object.keys(warningData?.localities)[0]];
      title += GENERAL_AREA_AND_LOCALITY_SEPARATOR + localities.join(LOCALITY_SEPARATOR);
    }

    return title;
  }
}
