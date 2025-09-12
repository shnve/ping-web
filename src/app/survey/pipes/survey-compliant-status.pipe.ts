import { Pipe, PipeTransform } from '@angular/core';

export const MAPPING_COMPLIANT_ICON = {
  'NOT_AVAILABLE': 'fa fa-pause-circle',
  'PENDING': 'fa fa-play-circle',
  'NOT_COMPLIANT': 'fa fa-exclamation-triangle',
  'COMPLIANT': 'fa fa-check-circle'
};

@Pipe({
  name: 'surveyCompliantStatus'
})
export class SurveyCompliantStatusPipe implements PipeTransform {

  transform(surveyCompliantStatus: string): string {
    return MAPPING_COMPLIANT_ICON[surveyCompliantStatus];
  }

}
