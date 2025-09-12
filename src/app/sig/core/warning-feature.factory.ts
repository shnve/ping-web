import { Injectable } from '@angular/core';
import { JsonWarning, MapWarning } from '@app/models/warning.model';
import { JsonFeature } from '@app/sig/models/geometry';
import { createOlGeometryFrom } from '@sig/utils/geometry';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { getMaxAxisSize } from '../utils/extent';
import { setFeatureLabel, setVertexLabels } from '../utils/feature';
import { getGeometryType } from '../utils/geometry';
import { WarningStyleFactory } from './warning-style.factory';

@Injectable({
  providedIn: 'root'
})
export class WarningFeatureFactory {

  constructor(private readonly styleFactory: WarningStyleFactory) {}

  /**
   * Create openlayers Features from MapWarningJson
   */
  createGeometries(warning: JsonWarning | MapWarning, jsonFeatures: JsonFeature[]): Feature[] {
    return this.createGeometriesOrAffectedAreas(warning, jsonFeatures);
  }

  /**
   * Create olFeature with geometries from affectedAreas
   * @param {MapWarning} warning
   * @param {JsonGeometry[]} jsonFeatures
   * @returns {affectedAreas: Feature<Geometry>[]} List of created features
   */
  createAffectedAreas(warning: JsonWarning | MapWarning, jsonFeatures?: JsonFeature[]): Feature[] {
    return this.createGeometriesOrAffectedAreas(warning, jsonFeatures, false);
  }

  private createGeometriesOrAffectedAreas(warning: JsonWarning | MapWarning, jsonFeatures?: JsonFeature[], createGeometries = true): Feature[] {
    return jsonFeatures.map(jsonFeature => {
      const feature = new Feature<Geometry>({
        geometry: createOlGeometryFrom(jsonFeature.geometry)
      });
      feature.setStyle(createGeometries ? this.styleFactory.getStyleForGeometry(warning.globalWarningType, getGeometryType(feature.getGeometry().getType()))
                                        : this.styleFactory.getStyleForAffectedArea(warning.globalWarningType, getGeometryType(feature.getGeometry().getType())));
      const labels = jsonFeature.properties?.labels;
      if (labels) {
        setVertexLabels(feature, labels);
      }
      const featureLabel = jsonFeature.properties?.featureLabel;
      if (featureLabel) {
        setFeatureLabel(feature, featureLabel);
      }
      WarningFeatureFactory.attachPropertiesToFeature(feature, warning);
      return feature;
    });
  }

  private static attachPropertiesToFeature(feature: Feature, warning: JsonWarning | MapWarning) {
    // Attach warning and maxExtentAxis to feature
    feature.setProperties({
      warning,
      maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent())
    });
  }
}
