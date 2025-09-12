import { Pipe, PipeTransform } from '@angular/core';
import { listWarningHazardTypeDetails, listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'formatTypeDetails',
  pure: false
})
export class FormatTypeDetailsPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) {

  }

  transform(typeDetails: string): string {
    const typeDetail = [...listWarningHazardTypeGeneral, ...listWarningHazardTypeDetails];
    return this.translate.instant(typeDetail.find(type => type.key === typeDetails)?.value ?? 'UNDEFINED');
  }
}
