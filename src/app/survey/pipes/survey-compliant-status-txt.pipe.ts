import { Pipe, PipeTransform } from '@angular/core';
import { getI18nValue } from '@app/shared/ui-utils';
import { TRANSLATIONS_LIST_SURVEY_COMPLIANT_STATUS } from '../models/survey.model';

@Pipe({
  name: 'surveyCompliantStatusTxt'
})
export class SurveyCompliantStatusTxtPipe implements PipeTransform {

  transform(surveyCompliantStatusTranslationKey: string): string | null {
    return getI18nValue(TRANSLATIONS_LIST_SURVEY_COMPLIANT_STATUS, surveyCompliantStatusTranslationKey);
  }

}
