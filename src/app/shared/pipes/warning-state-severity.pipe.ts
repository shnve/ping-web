import { Pipe, PipeTransform } from '@angular/core';

const MAPPING_STATE_SEVERITY = {
  'ACTIVE': 'success',
  'END_OF_BROADCAST': 'info',
  'DAY_OF_PUBLICATION': 'warning',
  'OUTDATED': 'warning', 
  'TO_REVIEW': 'danger'
}

@Pipe({
  name: 'warningStateSeverity'
})
export class WarningStateSeverityPipe implements PipeTransform {

  transform(warningState: string): string | null {
    return MAPPING_STATE_SEVERITY[warningState];
  }
}
