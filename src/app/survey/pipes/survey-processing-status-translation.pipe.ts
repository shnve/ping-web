import { Pipe, PipeTransform } from '@angular/core';
import { getI18nValue } from '@app/shared/ui-utils';
import { TRANSLATIONS_LIST_SURVEY_PROCESSING_STATUS } from '../models/survey.model';

@Pipe({
  name: 'surveyProcessingStatusI18nValue'
})
export class SurveyProcessingStatusTranslationPipe implements PipeTransform {

  transform(surveyProcessingStatusTranslationKey: string): string | null {
    return getI18nValue(TRANSLATIONS_LIST_SURVEY_PROCESSING_STATUS, surveyProcessingStatusTranslationKey);
  }

}
