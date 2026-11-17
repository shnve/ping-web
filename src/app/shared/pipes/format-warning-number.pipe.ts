import { Optional, Pipe, PipeTransform } from '@angular/core';
import { WarningCreationPrerequisites } from '@app/admin/admin-warning/models/creation-warning.model';
import { MainWarningPart } from '@app/models/warning.model';
import { SerieNamesService } from '@app/services/serie-names.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Número de un aviso: «SERIE 12/26».
 * PISAC: con la interfaz en inglés muestra el nombre internacional de la serie (SerieNamesService). Es impuro para
 * reaccionar al cambio de idioma y a la carga de los nombres; el cálculo es trivial.
 */
@Pipe({
  name: 'formatWarningNumber',
  pure: false
})
export class FormatWarningNumberPipe implements PipeTransform {

  constructor(@Optional() private readonly translate?: TranslateService,
              @Optional() private readonly serieNames?: SerieNamesService) { }

  transform(warningData: Partial<MainWarningPart> | WarningCreationPrerequisites, useForWarningCreationPrerequisites = false): string {
    if (warningData) {
      let nameOfSeries: string;
      let modelName: string;
      if (useForWarningCreationPrerequisites) {
        const warningCreation = (warningData as WarningCreationPrerequisites);
        nameOfSeries = warningCreation.serieName;
        modelName = warningCreation.modelName ?? null;
      } else {
        const warningPart = (warningData as Partial<MainWarningPart>)
        nameOfSeries = warningPart.nameOfSeries;
      }

      nameOfSeries = this.localizeSerieName(nameOfSeries ?? '');
      modelName = modelName ?? null;

      if (!warningData.warningNumber) {
        if (modelName) {
          return `${modelName} - ${nameOfSeries}`;
        }
        return nameOfSeries;
      }

      const year = (warningData.year ?? '').toString();
      return `${nameOfSeries} ${warningData.warningNumber}/${year.substring(2)}`;
    }

    return '';
  }

  private localizeSerieName(nameOfSeries: string): string {
    const lang = this.translate?.currentLang;
    if (!nameOfSeries || !lang || !this.serieNames) {
      return nameOfSeries;
    }
    return this.serieNames.getName(nameOfSeries, lang);
  }
}
