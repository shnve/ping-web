import { Injectable } from '@angular/core';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { TableAdminWarning } from '@app/models/admin/warning-admin-table.model';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { InformationService } from '@app/shared/services/information.service';
import { MousePositionFormatterService } from '@app/sig/services/mouse-position-formatter.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { WarningCreationData } from '../models/creation-warning.model';


@Injectable({
  providedIn: 'root'
})
export class WarningInformationService extends InformationService {

  constructor(private readonly warningAdminApi: WarningAdminApi,
    protected readonly mousePositionFormatter: MousePositionFormatterService,
    public readonly translate: TranslateService,
    protected capitalizeFirstPipe: CapitalizeFirstPipe) {
    super(mousePositionFormatter, translate, capitalizeFirstPipe);
    this.informationTemplateRootTranslationsKey = this.informationTemplate.warning.informationRootTranslationKey;
    this.informationTemplateChildrenTranslationsKeys = this.informationTemplate.warning.informationChildrenTranslationsKeys;
  }

  formatPublishedWarnings(items: Array<TableAdminWarning>, translatedTemplates: Map<string, object>, lang: string): string {
    const [firstItem] = items;
    const translatedMessage = translatedTemplates.get('published')[lang];
    const preamble = translatedMessage.replace('{{serieName}}', firstItem.nameOfSeries)
      .replace('{{currentDateTime}}', this.formatDateTime(new Date(), lang));
    return preamble.replace('{{warningsListAsString}}', items.sort(this.compareWarningsByYearAscAndNumberAsc)
      .map(taw => `${taw.warningNumber}/${taw.year.toString().slice(2)}`)
      .reduce((acc, currValue, currIndex) =>
        acc + currValue + (currIndex < items.length - 1 ? ', ' : ''), '')
    );
  }

  formatCurrentWarning(warning: WarningCreationData, translatedTemplates: Map<string, object>, lang: string): string {
    const translatedMessage = translatedTemplates.get('currentWarning')[lang];
    return translatedMessage.replace('{{serieName}}', warning.prerequisites.serieName)
      .replace('{{currentDateTime}}', this.formatDateTime(new Date(), lang));
  }

  noOtherWarning(translatedTemplates: Map<string, object>, lang: string): string {
    return translatedTemplates.get('noOtherWarning')[lang];
  }

  compareWarningsByYearAscAndNumberAsc(taw1: TableAdminWarning, taw2: TableAdminWarning): number {
    return (taw1.year === taw2.year) ? taw1.warningNumber - taw2.warningNumber : taw1.year - taw2.year;
  }

  getPublishedWarnings$(serieId: string): Observable<PaginatedModelItemTableViewDtos<TableAdminWarning>> {
    return this.warningAdminApi.getBySerieIdAndStatus$(serieId, 'PUBLISHED');
  }
}
