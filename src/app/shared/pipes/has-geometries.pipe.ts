import { Pipe, PipeTransform } from '@angular/core';
import { GeoregulationPartModalDetails } from '@app/georegulation/models/georegulation.model';
import { InfosourcePart } from '@app/infosource/models/infosource.model';
import { NotionType } from '@app/models/notion.model';
import { WarningFeaturePart } from '@app/models/warning.model';

export type featurePartType = WarningFeaturePart | GeoregulationPartModalDetails | InfosourcePart;

@Pipe({
  name: 'hasGeometries'
})
export class HasGeometriesPipe implements PipeTransform {

  transform(featurePart: featurePartType, notionType: NotionType): boolean {
    switch (notionType) {
      case NotionType.WARNING:
        return !!((featurePart as WarningFeaturePart).geometries?.length || (featurePart as WarningFeaturePart).affectedAreas?.length);
      case NotionType.GEOREGULATION:
        return !!(featurePart as GeoregulationPartModalDetails).features?.length;
      case NotionType.INFOSOURCE:
        return !!(featurePart as InfosourcePart).localisation?.length;
      default:
        return false;
    }
  }
}
