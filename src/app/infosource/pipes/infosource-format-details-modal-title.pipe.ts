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

  /**
   * @param mode PISAC (F6):
   * - `full` (por defecto): número - usuario servicio - estado (comportamiento original).
   * - `title`: sin el estado; la ventana de detalle lo muestra aparte como etiqueta de color (p-tag).
   * - `status`: solo el estado legible (para la etiqueta).
   */
  transform(infosource: Partial<Infosource>, mode: 'full' | 'title' | 'status' = 'full'): string {
    if (!infosource) {
      return '';
    }
    if (mode === 'status') {
      return this.statusLabel(infosource);
    }
    const issuingUser = `${infosource.issuingUserFirstname ?? ''} ${infosource.issuingUserLastname ?? ''}`;
    const issuingService = `${infosource.issuingServiceName ?? ''}`;
    const title = mode === 'full'
      ? `${issuingUser} ${issuingService} - ${this.statusLabel(infosource)}`
      : `${issuingUser} ${issuingService}`.trim();
    return infosource.number ? `${infosource.number} - ${title}` : title;
  }

  /** Estado legible (para SENT incluye la fecha de envío). */
  statusLabel(infosource: Partial<Infosource>): string {
    let status = infosource.status ? this.translate.instant(`enum.infosource-status.${infosource.status.toLowerCase()}`) : '';
    if (infosource.status === InfosourceStatus.SENT) {
      status = `${this.translate.instant('infosource.details.status-sent')} ${this.localizedDatePipe.transform(infosource.validationTime)}`;
    }
    return status;
  }
}
