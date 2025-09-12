import { Injectable } from '@angular/core';
import { GeoregulationNumber } from '@app/georegulation/models/georegulation.model';
import { createOlGeometryFrom, getGeometryType } from '@sig/utils/geometry';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { JsonFeature } from '../models/geometry';
import { getMaxAxisSize } from '../utils/extent';
import { setFeatureLabel, setVertexLabels } from '../utils/feature';
import { GeoregulationStyleFactory } from './georegulation-style.factory';

@Injectable({
  providedIn: 'root'
})
export class GeoregulationFeatureFactory {

  constructor(private readonly styleFactory: GeoregulationStyleFactory) { }

  /**
   * Create openlayers Features from object
   */
  createGeometries(isTemporary: boolean, isNew: boolean, mainNumber: GeoregulationNumber, jsonFeatures: JsonFeature[]): Feature[] {
    return jsonFeatures.map(jsonFeature => {
      const feature = new Feature<Geometry>({
        geometry: createOlGeometryFrom(jsonFeature.geometry)
      });
      feature.setStyle(this.styleFactory.getStyleForGeometry(isTemporary, isNew, getGeometryType(feature.getGeometry().getType())));
      const labels = jsonFeature.properties?.labels;
      if (labels) {
        setVertexLabels(feature, labels);
      }
      const featureLabel = jsonFeature.properties?.featureLabel;
      if (featureLabel) {
        setFeatureLabel(feature, featureLabel);
      }
      GeoregulationFeatureFactory.attachPropertiesToFeature(feature, mainNumber);
      return feature;
    });
  }

  private static attachPropertiesToFeature(feature: Feature, mainNumber: GeoregulationNumber) {
    // Attach georegulation and maxExtentAxis to feature
    feature.setProperties({
      georegulation: {
        mainNumber
      },
      maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent())
    });
  }
}
