import { Pipe, PipeTransform } from '@angular/core';
import { SURVEY_LIST_TRANSLATE } from '@app/survey/models/survey.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'surveyTranslateWithList'
})
export class SurveyTranslateWithListPipe implements PipeTransform {

  constructor(protected readonly translate: TranslateService) {
  }

  transform(search: string, listName: string): string {
    const translateValue = SURVEY_LIST_TRANSLATE[listName].find((translation: { key: string; }) => translation.key === search)?.value;
    if (listName === 'fileSeparator' && !translateValue) {
      // if only spaces as separator
      if (search.trim().length === 0) {
        const result = search.split(' ');
        return (result.length - 1)  + ' ' + (this.translate.instant('enum.survey-file-separator.space') as string).toUpperCase();
      }
      return search;
    }

    return translateValue ?? null;
  }
}
