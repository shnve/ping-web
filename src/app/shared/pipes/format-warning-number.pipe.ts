import { Pipe, PipeTransform } from '@angular/core';
import { WarningCreationPrerequisites } from '@app/admin/admin-warning/models/creation-warning.model';
import { MainWarningPart } from '@app/models/warning.model';

@Pipe({
  name: 'formatWarningNumber'
})
export class FormatWarningNumberPipe implements PipeTransform {

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

      nameOfSeries = nameOfSeries ?? '';
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
}
