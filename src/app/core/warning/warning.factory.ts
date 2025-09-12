import {Injectable} from '@angular/core';
import {JsonMapWarning, MapWarning} from '../../models/warning.model';
import {Weaken} from '../../types/utils';
import {WarningFeatureFactory} from '@sig/core/warning-feature.factory';

@Injectable({
  providedIn: 'root'
})
export class WarningFactory {
  constructor(private readonly warningFeatureFactory: WarningFeatureFactory) {}

  create(jsonMapWarning: JsonMapWarning): MapWarning {
    const mapWarning: Partial<Weaken<MapWarning, 'affectedAreas' | 'geometries'>> = {...jsonMapWarning};
    mapWarning.affectedAreas= this.warningFeatureFactory.createAffectedAreas(
      mapWarning as MapWarning,
      jsonMapWarning.affectedAreas
    );
    mapWarning.geometries = this.warningFeatureFactory.createGeometries(
      mapWarning as MapWarning,
      jsonMapWarning.geometries
    );
    return mapWarning as MapWarning;
  }
}
