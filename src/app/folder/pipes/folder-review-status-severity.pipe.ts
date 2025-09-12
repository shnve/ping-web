import { Pipe, PipeTransform } from '@angular/core';

const MAPPING_STATE_SEVERITY = {
  ACTIVE: 'success',
  OUTDATED: 'warning',
  TO_REVIEW: 'danger'
};

@Pipe({
  name: 'folderReviewStatusSeverity'
})
export class FolderReviewStatusSeverityPipe implements PipeTransform {

  transform(folderReviewStatus: string): string | null {
    return MAPPING_STATE_SEVERITY[folderReviewStatus];
  }
}
