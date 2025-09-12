import { Pipe, PipeTransform } from '@angular/core';
import { getI18nValue } from '@app/shared/ui-utils';
import { TRANSLATIONS_LIST_INFOSOURCE_STATUS } from '../models/infosource.model';

@Pipe({
  name: 'infosourceStatusI18nValue'
})
export class InfosourceStatusTranslationPipe implements PipeTransform {

  transform(infosourceStatusTranslationKey: string): string | null {
    return getI18nValue(TRANSLATIONS_LIST_INFOSOURCE_STATUS, infosourceStatusTranslationKey);
  }
}

  