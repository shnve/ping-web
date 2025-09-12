import { Pipe, PipeTransform } from '@angular/core';

export const MAPPING_STATUS_SEVERITY = {
  'FINISHED': 'success',
  'NOT_AVAILABLE': 'info',
  'PENDING': 'warning',
  'SUCCESS_WITH_ERRORS': 'warning',
  'FAILURE': 'danger'
};

@Pipe({
  name: 'surveyProcessingStatus'
})
export class SurveyProcessingStatusPipe implements PipeTransform {

  transform(surveyProcessingStatus: string): string | null {
    return MAPPING_STATUS_SEVERITY[surveyProcessingStatus];
  }

}
