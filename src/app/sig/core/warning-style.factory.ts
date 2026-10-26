import { Injectable } from '@angular/core';
import { cloneDeep, uniq } from 'lodash-es';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { GeometryType } from '../utils/geometry';
import { MaritimeReportTypeStyle, MaritimeReportTypeStyleOptions } from '../utils/style';
import { MaritimeReportStyleFactory, ROLLOVER_AFFECTED_AREA_STROKE_WIDTH, ROLLOVER_FILL_OPACITY } from './maritime-report-style.factory';

@Injectable({
  providedIn: 'root'
})
export class WarningStyleFactory extends MaritimeReportStyleFactory {
  readonly warningStyle: MaritimeReportTypeStyle;
  readonly noticeStyle: MaritimeReportTypeStyle;
  readonly noticeTPStyle: MaritimeReportTypeStyle;
  readonly warningAffectedAreaStyle: MaritimeReportTypeStyle;
  readonly noticeAffectedAreaStyle: MaritimeReportTypeStyle;
  readonly warningAggregationStyle: Style;

  constructor() {
    super();
    this.warningStyle = this.generateMaritimeReportTypeGeometryStyle({
      point: {
        icon: './assets/images/icons/red-warning.png',
        color: '#FF0000'
      },
      lineString: {
        icon: './assets/images/icons/red-warning.png',
        color: '#FF0000'
      },
      polygon: {
        icon: './assets/images/icons/red-warning.png',
        strokeColor: '#FF0000',
        fillColor: '#FF000025'
      },
      circle: {
        icon: './assets/images/icons/red-warning.png',
        strokeColor: '#FF0000',
        fillColor: '#FF000025'
      }
    });
    this.noticeStyle = this.generateMaritimeReportTypeGeometryStyle({
      point: {
        icon: './assets/images/icons/magenta-notice.png',
        color: '#FF00FF'
      },
      lineString: {
        icon: './assets/images/icons/magenta-notice.png',
        color: '#FF00FF'
      },
      polygon: {
        icon: './assets/images/icons/magenta-notice.png',
        strokeColor: '#FF00FF',
        fillColor: '#FF00FF25'
      },
      circle: {
        icon: './assets/images/icons/magenta-notice.png',
        strokeColor: '#FF00FF',
        fillColor: '#FF00FF25'
      }
    });
    this.noticeTPStyle = this.generateMaritimeReportTypeGeometryStyle({
      point: {
        icon: './assets/images/icons/magenta-notice.png',
        color: '#FF00FF'
      },
      lineString: {
        icon: './assets/images/icons/magenta-notice.png',
        color: '#FF00FF'
      },
      polygon: {
        icon: './assets/images/icons/magenta-notice.png',
        strokeColor: '#FF00FF',
        fillColor: '#FF00FF25'
      },
      circle: {
        icon: './assets/images/icons/magenta-notice.png',
        strokeColor: '#FF00FF',
        fillColor: '#FF00FF25'
      }
    });
    this.warningAffectedAreaStyle = this.generateWarningTypeAffectedAreaStyle({
      polygon: {
        strokeColor: '#FF0000',
        fillColor: '#FF000015'
      },
      circle: {
        strokeColor: '#FF0000',
        fillColor: '#FF000015'
      }
    });
    this.noticeAffectedAreaStyle = this.generateWarningTypeAffectedAreaStyle({
      polygon: {
        strokeColor: '#FF00FF',
        fillColor: '#FF00FF15'
      },
      circle: {
        strokeColor: '#FF00FF',
        fillColor: '#FF00FF15'
      }
    });
    this.warningAggregationStyle = this.generateAggregationStyle({
      icon: './assets/images/icons/aggregation-marker-border.png'
    });
  }

  getStyleForGeometry(warningType: string, geometryType: GeometryType): Style[] {
    if (warningType === 'WARNING') {
      return cloneDeep(this.warningStyle[geometryType]);
    } else if (warningType === 'NOTICE') {
      return cloneDeep(this.noticeStyle[geometryType]);
    } else if (warningType === 'NOTICE_TP') {
      return cloneDeep(this.noticeTPStyle[geometryType]);
    }

    console.error(`The warning type ${warningType} does not exist.`);
    return [new Style()];
  }

  getStyleForAffectedArea(warningType: string, geometryType: GeometryType): Style {
    if (warningType === 'WARNING') {
      return cloneDeep(this.warningAffectedAreaStyle[geometryType]);
    } else if (warningType === 'NOTICE' || warningType === 'NOTICE_TP') {
      return cloneDeep(this.noticeAffectedAreaStyle[geometryType]);
    }
    console.error(`The warning type ${warningType} does not exist.`);
    return new Style();
  }

  getStyleForAggregation(clusteredFeature: Feature<Point>): Style {
    const style = this.warningAggregationStyle.clone();
    const warnings = clusteredFeature.get('features').map((feature: Feature) => feature.get('warning'));
    const numberOfDiffrentWarnings = uniq(warnings).length;
    style.getText().setText('' + numberOfDiffrentWarnings);
    return style;
  }

  getRollOverStyleForGeometry(warningType: string, geometryType: GeometryType): Style[] {
    const styles = this.getStyleForGeometry(warningType, geometryType).map(style => style.clone());
    return this.getRollOverStyle(styles, geometryType);
  }

  getRollOverStyleForAffectedArea(warningType: string, geometryType: GeometryType): Style {
    const affectedAreaStyle = this.getStyleForAffectedArea(warningType, geometryType);
    if (!affectedAreaStyle) { return new Style(); }
    const style = affectedAreaStyle.clone();
    style.getFill().setColor(style.getStroke().getColor() + ROLLOVER_FILL_OPACITY);
    style.getStroke().setWidth(ROLLOVER_AFFECTED_AREA_STROKE_WIDTH);
    style.getStroke().setLineDash([7, 5]);
    return style;
  }

  private generateWarningTypeAffectedAreaStyle(options: MaritimeReportTypeStyleOptions): MaritimeReportTypeStyle {
    return {
      Polygon: new Style({
        stroke: new Stroke({
          color: options.polygon.strokeColor,
          width: 1,
          lineDash: [5, 3]
        }),
        fill: new Fill({
          color: options.polygon.fillColor
        })
      }),
      Circle: new Style({
        stroke: new Stroke({
          color: options.circle.strokeColor,
          width: 1,
          lineDash: [5, 3]
        }),
        fill: new Fill({
          color: options.circle.fillColor
        })
      })
    };
  }
}
