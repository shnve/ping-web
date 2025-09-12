import { Injectable } from '@angular/core';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { InformationService, RADIUS_INPUT_VALUE_LABEL } from '@app/shared/services/information.service';
import { MousePositionFormatterService } from '@app/sig/services/mouse-position-formatter.service';
import { FEATURE_LABEL_PROPERTY, VERTEX_LABELS_PROPERTY } from '@app/sig/utils/feature';
import { checkIfLayoutIsNotValid, convertLayoutCoordinatesToXY, GeometryType } from '@app/sig/utils/geometry';
import { environment } from '@env/environment.default';
import { TranslateService } from '@ngx-translate/core';
import { metersToNMiles } from '@shom2/carto/utils/conversions';
import { convertMercatToLonLat } from '@shom2/carto/utils/coordinate';
import { getSphereRadius } from '@shom2/carto/utils/spheremeasure';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Circle, LineString, Point, Polygon } from 'ol/geom';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeoregulationInformationService extends InformationService {

  constructor(protected readonly mousePositionFormatter: MousePositionFormatterService,
    public readonly translate: TranslateService,
    protected capitalizeFirstPipe: CapitalizeFirstPipe) {
    super(mousePositionFormatter, translate, capitalizeFirstPipe);
    this.informationTemplateRootTranslationsKey = this.informationTemplate.georegulation.informationRootTranslationKey;
    this.informationTemplateChildrenTranslationsKeys = this.informationTemplate.georegulation.informationChildrenTranslationsKeys;
  }

  formatGeometries(geometries: Feature[], translatedTemplates: Map<string, object>, lang: string,
    isAffectedArea = false, distanceUnit?: string, precision = 4): string {
    return geometries.map(g => this.formatGeometry(g, translatedTemplates, lang, isAffectedArea, distanceUnit, precision))
      .reduce((acc, curr) => acc + (acc !== '' ? '\n' : '') + curr, '');
  }

  formatGeometry(geometry: Feature, translatedTemplates: Map<string, object>, lang: string,
    isAffectedArea = false, distanceUnit?: string, precision = 4): string {
    switch (geometry.getGeometry().getType()) {
      case GeometryType.POINT:
        return this.formatGeometryAsPoint(geometry, precision);
      case GeometryType.LINE_STRING:
        return this.formatGeometryAsPolyline(geometry, translatedTemplates, lang, precision);
      case GeometryType.POLYGON:
        return this.formatGeometryAsPolygon(geometry, translatedTemplates, lang, isAffectedArea, precision);
      case GeometryType.CIRCLE:
        return this.formatGeometryAsCircle(geometry, translatedTemplates, lang, isAffectedArea, distanceUnit, precision);
      default:
        throwError('unknown geometry ' + geometry);
    }
  }

  formatGeometryAsPoint(geometry: Feature, precision = 4): string {
    const point = geometry.getGeometry() as Point;
    const featureLabel = geometry.get(FEATURE_LABEL_PROPERTY) ? `${geometry.get(FEATURE_LABEL_PROPERTY)} ` : '';
    const simpleGeom = point as SimpleGeometry;

    if (checkIfLayoutIsNotValid(simpleGeom, point)) { convertLayoutCoordinatesToXY(simpleGeom); }

    return featureLabel + this.convertCoordinates(point.getFlatCoordinates(), precision);
  }

  formatGeometryAsPolyline(geometry: Feature, translatedTemplates: Map<string, object>, lang: string, precision = 4): string {
    const labels: Array<string> = geometry.get(VERTEX_LABELS_PROPERTY) ?? [];
    const featureLabel = geometry.get(FEATURE_LABEL_PROPERTY);
    const hasLabels = labels.some(val => val !== '');
    const hasFeatureLabelOrLabels = hasLabels || !!featureLabel;
    const polyline = geometry.getGeometry() as LineString;
    const simpleGeom = polyline as SimpleGeometry;

    if (checkIfLayoutIsNotValid(simpleGeom, polyline)) { convertLayoutCoordinatesToXY(simpleGeom); }

    const coordinates = simpleGeom.getCoordinates();
    const preamble = translatedTemplates.get(hasFeatureLabelOrLabels ? 'polylineWithLabel' : 'polylineWithoutLabel')[lang];
    return preamble
      .replace('{{featureLabel}}', featureLabel ? `${featureLabel} ` : '')
      .replace('{{content}}',
        coordinates.reduce((acc, currValue, currIndex) => {
          if (labels[currIndex]) {
            acc += `${labels[currIndex]} `;
          }
          acc += this.convertCoordinates(currValue, precision) + (currIndex < coordinates.length - 1 ? ', ' : '.');
          return acc;
        }, '')
      );
  }

  protected convertCoordinates(coordinates: Coordinate, precision = 4): string {
    return this.mousePositionFormatter.covertCoordinateToDms(convertMercatToLonLat(coordinates), 'DD°MM,mm\'C', precision);
  }

  formatGeometryAsPolygon(geometry: Feature, translatedTemplates: Map<string, object>, lang: string,
    isAffectedArea = false, precision = 4): string {
    const labels: Array<string> = geometry.get(VERTEX_LABELS_PROPERTY) ?? [];
    const featureLabel = geometry.get(FEATURE_LABEL_PROPERTY);
    const hasLabels = labels.length && labels.some(val => val && val !== '');
    const hasFeatureLabelOrLabels = hasLabels || !!featureLabel;
    const polygon = geometry.getGeometry() as Polygon;
    const simpleGeom = polygon as SimpleGeometry;

    if (checkIfLayoutIsNotValid(simpleGeom, polygon)) { convertLayoutCoordinatesToXY(simpleGeom); }

    const coordinates = simpleGeom.getFlatCoordinates();
    const coordinatesArray: Coordinate[] = [];
    for (let i = 0; i < coordinates.length - 2; i += 2) {
      coordinatesArray.push([coordinates[i], coordinates[i + 1]]);
    }
    let key = hasFeatureLabelOrLabels ? 'polygonWithLabel' : 'polygonWithoutLabel';
    if (isAffectedArea) {
      key += 'Affected';
    }
    const preamble = translatedTemplates.get(key)[lang];
    return preamble
      .replace('{{featureLabel}}', featureLabel ? `${featureLabel} ` : '')
      .replace('{{content}}',
        coordinatesArray.reduce((acc, currValue, currIndex) => {
          if (labels[currIndex]) {
            acc += `${labels[currIndex]} `;
          }
          acc += this.convertCoordinates(currValue, precision) + (currIndex < coordinatesArray.length - 1 ? '\n' : '');
          return acc;
        }, '')
      );
  }

  formatGeometryAsCircle(geometry: Feature, translatedTemplates: Map<string, object>, lang: string,
    isAffectedArea = false, distanceUnit?: string, precision = 4): string {
    const circle = geometry.getGeometry() as Circle;
    const featureLabel = geometry.get(FEATURE_LABEL_PROPERTY);
    const hasFeatureLabel = !!featureLabel;
    const radiusInputValue = geometry.get(RADIUS_INPUT_VALUE_LABEL) ?? getSphereRadius(circle);
    const radius = distanceUnit === environment.carto.circleDistanceUnit.meters ?
      radiusInputValue : metersToNMiles(radiusInputValue).toFixed(2);
    let key = hasFeatureLabel ? 'circleWithLabelInNq' : 'circleWithoutLabelInNq';
    if (isAffectedArea) {
      key += 'Affected';
    }
    const preamble = translatedTemplates.get(key)[lang];
    return preamble
      .replace('{{featureLabel}}', featureLabel ? `${featureLabel} ` : '')
      .replace('{{radius}}', radius)
      .replace('{{distanceUnit}}', distanceUnit)
      .replace('{{center}}', this.convertCoordinates(circle.getCenter(), precision));
  }
}
