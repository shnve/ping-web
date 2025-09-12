import { Pipe, PipeTransform } from '@angular/core';

const MAPPING_STATUS_SEVERITY = {
  'TAKEN': 'success',
  'SENT': 'info',
  'OPENED': 'warning', 
  'REJECTED': 'danger'
};

@Pipe({
  name: 'infosourceStatusSeverity'
})
export class InfosourceStatusSeverityPipe implements PipeTransform {

  transform(infosourceStatus: string): string | null {
    return MAPPING_STATUS_SEVERITY[infosourceStatus];
  }
}
