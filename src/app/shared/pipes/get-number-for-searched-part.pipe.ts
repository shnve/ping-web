import { Pipe, PipeTransform } from '@angular/core';
import { GeoregulationPartModalDetails } from '@app/georegulation/models/georegulation.model';
import { InfosourcePart } from '@app/infosource/models/infosource.model';
import { NotionType } from '@app/models/notion.model';
import { WarningFeaturePart } from '@app/models/warning.model';
import { featurePartType } from './has-geometries.pipe';

@Pipe({
  name: 'getNumberForSearchedPart'
})
export class GetNumberForSearchedPartPipe implements PipeTransform {

  transform(searchedPart: featurePartType, featureParts: Array<featurePartType>, notionType: NotionType): number {
    if (!featureParts?.length || !searchedPart) {
      return -1;
    }

    switch (notionType) {
      case NotionType.WARNING:
        return featureParts.findIndex(part => part === (searchedPart as WarningFeaturePart)) + 1;
      case NotionType.GEOREGULATION:
        return featureParts.findIndex(part => part === (searchedPart as GeoregulationPartModalDetails)) + 1;
      case NotionType.INFOSOURCE:
        return featureParts.findIndex(part => part === (searchedPart as InfosourcePart)) + 1;
      default:
        return -1;
    }
  }
}
