import { Pipe, PipeTransform } from '@angular/core';
import { Infosource } from '@app/infosource/models/infosource.model';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'infosourceFormatListItemTitle'
})
export class InfosourceFormatListItemTitlePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService,
    private readonly localizedDatePipe: LocalizedDatePipe) { }

  transform(infosource: Infosource): string {
    const from = `${infosource.issuingUserFirstname} ${infosource.issuingUserLastname} ${infosource.issuingServiceName ?? ''}`;
    const at = `${this.localizedDatePipe.transform(infosource.validationTime)}`;
    return `${this.translate.instant('admin-warning.creation.parts.infosources.sent-by')} ${from} ${this.translate.instant('admin-warning.creation.parts.infosources.sent-at')} ${at}`;
  }
}
