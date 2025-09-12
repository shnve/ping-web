import { Pipe, PipeTransform } from '@angular/core';
import { listWarningHazardTypeDetails } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'formatFeaturePartDetails',
  pure: false
})
export class FormatFeaturePartDetailsPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) {

  }

  transform(typeDetails: Array<string>): string {
    return typeDetails
      .map(detail => this.translate.instant(listWarningHazardTypeDetails.find(type => type.key === detail)?.value ?? ''))
      .join(', ');
  }
}
