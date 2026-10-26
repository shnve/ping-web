import { Injectable } from '@angular/core';
import { MapMaritimeEntity } from '@app/models/maritime-entity.model';
import { TranslateService } from '@ngx-translate/core';
import { createOlGeometryFrom } from '@sig/utils/geometry';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { getMaxAxisSize } from '../utils/extent';
import { MaritimeEntityStyleFactory } from './maritime-entity-style.factory';

@Injectable({
  providedIn: 'root'
})
export class MaritimeEntityFactory {

  constructor(
    private readonly styleFactory: MaritimeEntityStyleFactory,
    private readonly translate: TranslateService
  ) { }

  /**
   * Create openlayers Features from object
   */
  createGeometries(entities: MapMaritimeEntity[]): Feature[] {
    return entities.map(entity => {
      const feature = new Feature<Geometry>({
        geometry: createOlGeometryFrom(entity.geom)
      });

      this.styleFactory.setFeatureStyle(feature, this.translate.currentLang === 'es' ? entity.name : (entity.internationalName ?? entity.name))

      MaritimeEntityFactory.attachPropertiesToFeature(feature, entity);
      return feature;
    });
  }

  private static attachPropertiesToFeature(feature: Feature, entity: MapMaritimeEntity): void {
    // Attach entity and maxExtentAxis to feature
    const properties = {
      maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent()),
      entity
    };

    feature.setProperties(properties);
  }
}
