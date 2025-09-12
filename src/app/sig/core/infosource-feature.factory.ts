import { Injectable } from '@angular/core';
import { InfosourceWithJsonParts } from '@app/infosource/models/infosource.model';
import { createOlGeometryFrom, getGeometryType } from '@sig/utils/geometry';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { JsonFeature } from '../models/geometry';
import { getMaxAxisSize } from '../utils/extent';
import { setBathyProperties, setFeatureLabel, setVertexLabels } from '../utils/feature';
import { InfosourceStyleFactory } from './infosource-style.factory';

@Injectable({
  providedIn: 'root'
})
export class InfosourceFeatureFactory {

  constructor(private readonly styleFactory: InfosourceStyleFactory) { }

  /**
   * Create openlayers Features from object
   */
  createGeometries(infosource: InfosourceWithJsonParts, jsonFeatures: JsonFeature[]): Feature[] {
    return jsonFeatures.map(jsonFeature => {
      const feature = new Feature<Geometry>({
        geometry: createOlGeometryFrom(jsonFeature.geometry)
      });
      feature.setStyle(this.styleFactory.getStyleForLocalisation(getGeometryType(feature.getGeometry().getType())));
      const labels = jsonFeature.properties?.labels;
      if (labels) {
        setVertexLabels(feature, labels);
      }
      const featureLabel = jsonFeature.properties?.featureLabel;
      if (featureLabel) {
        setFeatureLabel(feature, featureLabel);
      }

      if (jsonFeature.properties?.isBathy) {
        setBathyProperties(feature, jsonFeature.properties);
      }

      InfosourceFeatureFactory.attachPropertiesToFeature(feature, infosource);
      return feature;
    });
  }

  private static attachPropertiesToFeature(feature: Feature, infosource: InfosourceWithJsonParts) {
    // Attach infosource and maxExtentAxis to feature
    feature.setProperties({
      infosource,
      maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent())
    });
  }
}
