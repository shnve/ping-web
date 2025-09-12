import { Injectable } from '@angular/core';
import { SurveyDanger, SurveyDetection } from '@app/survey/models/survey.model';
import { createOlGeometryFrom } from '@sig/utils/geometry';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { JsonGeometry } from '../models/geometry';
import { getMaxAxisSize } from '../utils/extent';
import { BLUE_TOOL_STYLE_ALPHA } from '../utils/feature';
import { SurveyStyleFactory } from './survey-style.factory';

@Injectable({
  providedIn: 'root'
})
export class SurveyDangerFactory {

  constructor(private readonly styleFactory: SurveyStyleFactory) { }

  /**
   * Create openlayers Features from object
   */
  createGeometries(surveyFeatures: SurveyDanger[] | SurveyDetection[], isDetection = false): Feature[] {
    return surveyFeatures.map(surveyFeature => {
      const feature = new Feature<Geometry>({
        geometry: createOlGeometryFrom(surveyFeature.geometry)
      });

      if (isDetection) {
        this.styleFactory.setStyleForDetection(feature, (surveyFeature as SurveyDetection).depth, (surveyFeature as SurveyDetection).color)
      } else {
        this.styleFactory.setStyleForBathyGeometries(feature, (surveyFeature as SurveyDanger).value, (surveyFeature as SurveyDanger).typeOfValue)
      }

      SurveyDangerFactory.attachPropertiesToFeature(feature, surveyFeature, isDetection);
      return feature;
    });
  }

  private static attachPropertiesToFeature(feature: Feature, surveyFeature: SurveyDanger | SurveyDetection, isDetection: boolean): void {
    // Attach surveyFeature and maxExtentAxis to feature
    const properties = {
      maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent()),
      detection: null,
      danger: null
    };

    if (isDetection) {
      properties.detection = surveyFeature
    } else {
      properties.danger = surveyFeature;
    }
    feature.setProperties(properties);
  }

  createBoundingBoxGeometry(boundingBox: JsonGeometry): Feature {
    const feature = new Feature<Geometry>({
      geometry: createOlGeometryFrom(boundingBox)
    });

    feature.setStyle(BLUE_TOOL_STYLE_ALPHA);
    feature.setProperties({
      boundingBox,
      maxExtentAxis: getMaxAxisSize(feature.getGeometry().getExtent())
    });

    return feature;
  }
}
