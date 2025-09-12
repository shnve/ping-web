import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { TranslateService } from '@ngx-translate/core';
import { Infosource, InfosourceStatus } from '../models/infosource.model';

@Pipe({
  name: 'infosourceFormatDetailsModalTitle',
  pure: false
})
export class InfosourceFormatDetailsModalTitlePipe implements PipeTransform {

  constructor(private readonly translate: TranslateService,
    private readonly localizedDatePipe: LocalizedDatePipe) { }

  transform(infosource: Partial<Infosource>): string {
    let status = infosource.status ? this.translate.instant(`enum.infosource-status.${infosource.status.toLowerCase()}`) : '';
    if (infosource.status === InfosourceStatus.SENT) {
      status = `${this.translate.instant('infosource.details.status-sent')} ${this.localizedDatePipe.transform(infosource.validationTime)}`;
    }
    const issuingUser = `${infosource.issuingUserFirstname ?? ''} ${infosource.issuingUserLastname ?? ''}`;
    const issuingService = `${infosource.issuingServiceName ?? ''}`;
    const title = `${issuingUser} ${issuingService} - ${status}`;
    return infosource.number ? `${infosource.number} - ${title}` : title;
  }
}
