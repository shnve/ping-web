import { Injectable } from '@angular/core';
import { GlobalConstants } from '@app/global-constants';
import { BathyGeometryNature } from '@app/infosource/models/infosource.model';
import { DateRange } from '@app/shared/models/date-range.model';
import { FEATURE_LABEL_PROPERTY, FEATURE_PROPERTY_DEPTH, FEATURE_PROPERTY_DIFFERENCE, FEATURE_PROPERTY_NATURE, VERTEX_LABELS_PROPERTY } from '@app/sig/utils/feature';
import { checkIfLayoutIsNotValid, convertLayoutCoordinatesToXY, GeometryType } from '@app/sig/utils/geometry';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { metersToNMiles } from '@shom2/carto/utils/conversions';
import { convertMercatToLonLat } from '@shom2/carto/utils/coordinate';
import { getSphereRadius } from '@shom2/carto/utils/spheremeasure';
import { MousePositionFormatterService } from '@sig/services/mouse-position-formatter.service';
import { format, formatInTimeZone } from 'date-fns-tz';
import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Circle } from 'ol/geom';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import { formatModelItemDatetime, UTC_TIMEZONE_ZERO } from '../date-utils';
import { CapitalizeFirstPipe } from '../pipes/capitalize-first.pipe';

export const RADIUS_INPUT_VALUE_LABEL = 'radiusInputValue';

export const DEFAULT_PRECISION = 4;

export interface DistanceUnit {
  name: string,
  unit: string
}

export interface DistanceUnitByLangs {
  lang: string,
  selectedDistanceUnit: DistanceUnit
}

export interface TypeExpression {
  type: string
  pathTypeExpression: string,
}

export interface PrecisiontByLang {
  lang: string,
  selectedPrecision: string
}

@Injectable({
  providedIn: 'root'
})
export class InformationService {

  protected readonly informationTemplate = environment.templates.information;

  protected informationTemplateRootTranslationsKey: string;

  protected informationTemplateChildrenTranslationsKeys: string[];

  constructor(protected readonly mousePositionFormatter: MousePositionFormatterService,
    public readonly translate: TranslateService,
    protected capitalizeFirstPipe: CapitalizeFirstPipe) { }

  buildTranslationsKey(): Array<{ key: string, value: string }> {
    const result = [];
    this.informationTemplateChildrenTranslationsKeys.forEach(key => result.push({ key, value: this.informationTemplateRootTranslationsKey + key }));
    return result;
  }

  formatGeometries(geometries: Feature[], translatedTemplates: Map<string, object>, lang: string,
    isAffectedArea = false, distanceUnit?: string, precision = DEFAULT_PRECISION, isBathy = false): string {
    // Point, LineString, Polygon, Circle
    return geometries.map(g => this.formatGeometry(g, translatedTemplates, lang, isAffectedArea, distanceUnit, precision, isBathy))
      .reduce((acc, curr) => acc + (acc !== '' ? '\n' : '') + curr, '');
  }

  formatGeometry(geometry: Feature, translatedTemplates: Map<string, object>, lang: string,
    isAffectedArea = false, distanceUnit?: string, precision = DEFAULT_PRECISION, isBathy = false): string {
    switch (geometry.getGeometry().getType()) {
      case GeometryType.POINT:
        return this.formatGeometryAsPoint(geometry, precision, isBathy, isBathy ? translatedTemplates : null, isBathy ? lang : null);
      case GeometryType.LINE_STRING:
        return this.formatGeometryAsPolyline(geometry, translatedTemplates, lang, precision);
      case GeometryType.POLYGON:
        return this.formatGeometryAsPolygon(geometry, translatedTemplates, lang, isAffectedArea, precision, isBathy);
      case GeometryType.CIRCLE:
        return this.formatGeometryAsCircle(geometry, translatedTemplates, lang, isAffectedArea, distanceUnit, precision, isBathy);
      default:
        console.warn('unknown geometry', geometry);
        return '';
    }
  }

  private getPreambleIfIsBathy(nature: BathyGeometryNature, geometryType: GeometryType, zValue: string, translatedTemplates: Map<string, object>, lang: string): string {
    const zValueParsed = parseFloat(zValue);
    const hasZValue = Number.isNaN(zValueParsed) ? false : zValueParsed !== 0.0;
    const preamble =
      translatedTemplates.get(
        `bathy.${geometryType.toLowerCase()}.with${this.capitalizeFirstPipe.transform((nature ?? BathyGeometryNature.DEPTH).toLowerCase())}${hasZValue ? 'And' : 'Without'}Z`
      )[lang];

    return preamble
      .replace('{{z,z}}', hasZValue ? zValueParsed.toFixed(1).replace('.0', '') : '')
      .replace('{{s}}', hasZValue && zValueParsed >= 2 ? 's' : '');
  }

  formatGeometryAsPoint(geometry: Feature, precision = DEFAULT_PRECISION, isBathy = false, translatedTemplates?: Map<string, object>, lang?: string): string {
    const point = geometry.getGeometry() as Point;
    const featureLabel = geometry.get(FEATURE_LABEL_PROPERTY) ? `${geometry.get(FEATURE_LABEL_PROPERTY)} ` : '';
    const nature = geometry.get(FEATURE_PROPERTY_NATURE);
    const zValue = geometry.get(FEATURE_PROPERTY_DEPTH);

    const simpleGeom = point as SimpleGeometry;

    if (checkIfLayoutIsNotValid(simpleGeom, point)) { convertLayoutCoordinatesToXY(simpleGeom); }

    const convertedCoordinates = this.convertCoordinates(simpleGeom.getFlatCoordinates(), precision);

    return (isBathy ?
      this.getPreambleIfIsBathy(nature, GeometryType.POINT, zValue, translatedTemplates, lang).replace('{{content}}', convertedCoordinates) : featureLabel) + convertedCoordinates;
  }

  formatGeometryAsPolyline(geometry: Feature, translatedTemplates: Map<string, object>, lang: string, precision = DEFAULT_PRECISION): string {
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

  protected convertCoordinates(coordinates: Coordinate, precision = DEFAULT_PRECISION): string {
    return this.mousePositionFormatter.covertCoordinateToDms(convertMercatToLonLat(coordinates), 'DD-MM.mmC', precision);
  }

  formatGeometryAsPolygon(geometry: Feature, translatedTemplates: Map<string, object>, lang: string,
    isAffectedArea = false, precision = DEFAULT_PRECISION, isBathy = false): string {
    const labels: Array<string> = geometry.get(VERTEX_LABELS_PROPERTY) ?? [];
    const featureLabel = geometry.get(FEATURE_LABEL_PROPERTY);
    const hasLabels = labels.length && labels.some(val => val && val !== '');
    const hasFeatureLabelOrLabels = hasLabels || !!featureLabel;
    const polygon = geometry.getGeometry() as Polygon;
    const simpleGeom = polygon as SimpleGeometry;
    const nature = geometry.get(FEATURE_PROPERTY_NATURE);
    const zValue = geometry.get(FEATURE_PROPERTY_DIFFERENCE);

    if (checkIfLayoutIsNotValid(simpleGeom, polygon)) { convertLayoutCoordinatesToXY(simpleGeom); }

    const coordinates = simpleGeom.getFlatCoordinates();
    const coordinatesArray: Coordinate[] = [];
    for (let i = 0; i < coordinates.length - 2; i += 2) {
      coordinatesArray.push([coordinates[i], coordinates[i + 1]]);
    }

    let key;
    if (!isBathy) {
      key = hasFeatureLabelOrLabels ? 'polygonWithLabel' : 'polygonWithoutLabel';
      if (isAffectedArea) {
        key += 'Affected';
      }
    }

    const preamble = isBathy ? this.getPreambleIfIsBathy(nature, GeometryType.POLYGON, zValue, translatedTemplates, lang) : translatedTemplates.get(key)[lang];
    return preamble
      .replace('{{featureLabel}}', !isBathy && featureLabel ? `${featureLabel} ` : '')
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
    isAffectedArea = false, distanceUnit?: string, precision = DEFAULT_PRECISION, isBathy = false): string {
    const circle = geometry.getGeometry() as Circle;
    const featureLabel = geometry.get(FEATURE_LABEL_PROPERTY);
    const hasFeatureLabel = !!featureLabel;
    const radiusInputValue = geometry.get(RADIUS_INPUT_VALUE_LABEL) ?? getSphereRadius(circle);
    const metersUnit = distanceUnit === environment.carto.circleDistanceUnit.meters;
    let radius = Number(radiusInputValue).toFixed(0);
    if (!metersUnit) {
      radius = metersToNMiles(radiusInputValue).toFixed(1);
      if (radius.endsWith('.0')) {
        radius = radius.substring(0, radius.length - 2);
      }
    }

    const nature = geometry.get(FEATURE_PROPERTY_NATURE);
    const zValue = geometry.get(FEATURE_PROPERTY_DIFFERENCE);

    let key;
    if (!isBathy) {
      key = hasFeatureLabel ? 'circleWithLabelInNq' : 'circleWithoutLabelInNq';
      if (isAffectedArea) {
        key += 'Affected';
      }
    }

    const preamble = isBathy ? this.getPreambleIfIsBathy(nature, GeometryType.CIRCLE, zValue, translatedTemplates, lang) : translatedTemplates.get(key)[lang];
    return preamble
      .replace('{{featureLabel}}', !isBathy && featureLabel ? `${featureLabel} ` : '')
      .replace('{{radius}}', radius)
      .replace('{{distanceUnit}}', distanceUnit)
      .replace('{{center}}', this.convertCoordinates(circle.getCenter(), precision));
  }

  isFrLanguage(lang: string): boolean {
    return lang === environment.availableLanguages[0];
  }

  formatDate(date: Date): string {
    return date ? format(date, 'dd/MM/yyyy') : '';
  }

  formatTime(dateTime: Date): string {
    return dateTime ? format(dateTime, 'HH:mm') : '';
  }

  formatDateTime(dateTime: Date, lang: string): string {
    return dateTime ? this.formatDateTimeWithLangAndTimezone(`${this.formatDate(dateTime)} ${formatInTimeZone(dateTime, 'UTC', 'kk:mm')}`, lang, true, UTC_TIMEZONE_ZERO) : '';
  }

  formatDateRanges(dateRanges: Array<DateRange>, translatedTemplates: Map<string, object>, lang: string, timeZone = GlobalConstants.USER_TIMEZONE): string {
    return dateRanges.reduce((acc, curr) => {
      const hasStartDate = curr.dateStart !== null;
      const isFullFormatDayStart = curr.timeOfDayStart !== null;
      const isFullFormatDayEnd = curr.timeOfDayEnd !== null;
      const timeOfDayStart = curr.timeOfDayStart ?? '00:00';
      const timeOfDayEnd = curr.timeOfDayEnd ?? '23:59';
      if (hasStartDate && curr.dateEnd !== null) {
        acc += translatedTemplates.get('fullPeriods')[lang]
          .replace('{{startPeriod}}', this.formatDateAndTimeWithLangAndTimezone(curr.dateStart, timeOfDayStart, lang, timeZone, isFullFormatDayStart))
          .replace('{{endPeriod}}', this.formatDateAndTimeWithLangAndTimezone(curr.dateEnd, timeOfDayEnd, lang, timeZone, isFullFormatDayEnd)) + '\n';
      } else if (hasStartDate) {
        acc += translatedTemplates.get('startPeriod')[lang]
          .replace('{{startPeriod}}', this.formatDateAndTimeWithLangAndTimezone(curr.dateStart, timeOfDayStart, lang, timeZone, isFullFormatDayStart)) + '\n';
      } else {
        acc += translatedTemplates.get('endPeriod')[lang]
          .replace('{{endPeriod}}', this.formatDateAndTimeWithLangAndTimezone(curr.dateEnd, timeOfDayEnd, lang, timeZone, isFullFormatDayEnd)) + '\n';
      }
      return acc;
    }, '').slice(0, -1);
  }

  formatDateAndTimeWithLangAndTimezone(date: string, timeOfDay: string, lang: string, timeZone: string, isFullFormat: boolean): string {
    return this.formatDateTimeWithLangAndTimezone(`${date} ${timeOfDay}`, lang, isFullFormat, timeZone);
  }

  formatDateTimeWithLangAndTimezone(date: string, lang: string, isFullFormat: boolean, timeZone = GlobalConstants.USER_TIMEZONE): string {
    if (!date) { return date; }
    return formatModelItemDatetime(date, this.isFrLanguage(lang), isFullFormat, timeZone);
  }
}
