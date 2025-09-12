import { Pipe, PipeTransform } from '@angular/core';
import { getI18nValue } from '@app/shared/ui-utils';
import { TRANSLATIONS_LIST_INFOSOURCE_NATURE } from '../models/infosource.model';

@Pipe({
  name: 'infosourceNatureI18nValue'
})
export class InfosourceNatureTranslationPipe implements PipeTransform {

  transform(infosourceNatureTranslationKey: string): string | null {
    return getI18nValue(TRANSLATIONS_LIST_INFOSOURCE_NATURE, infosourceNatureTranslationKey);
  }
}
