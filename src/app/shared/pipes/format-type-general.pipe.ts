import { Pipe, PipeTransform } from '@angular/core';
import { listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'formatTypeGeneral',
  pure: false
})
export class FormatTypeGeneralPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) { }

  transform(warningHazardTypeGeneral: string): string {
    const typeGeneralKey = listWarningHazardTypeGeneral.find(type => type.key === warningHazardTypeGeneral)?.value;
    return typeGeneralKey ? this.translate.instant(typeGeneralKey) : '';
  }
}
