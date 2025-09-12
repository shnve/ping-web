import { Injectable } from '@angular/core';
import { cloneDeep, uniq } from 'lodash-es';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import { GeometryType } from '../utils/geometry';
import { MaritimeReportTypeStyle } from '../utils/style';
import { MaritimeReportStyleFactory } from './maritime-report-style.factory';

const INFOSOURCE_COLOR = '#35B9E6';
const INFOSOURCE_COLOR_ALPHA = '#35B9E625';

@Injectable({
  providedIn: 'root'
})
export class InfosourceStyleFactory extends MaritimeReportStyleFactory {
  readonly infosourceStyle: MaritimeReportTypeStyle;
  readonly infosourceAggregationStyle: Style;

  constructor() {
    super();
    this.infosourceStyle = this.generateMaritimeReportTypeGeometryStyle({
      point: {
        icon: './assets/images/icons/Infos_sources_3.png',
        color: INFOSOURCE_COLOR
      },
      lineString: {
        icon: './assets/images/icons/Infos_sources_1.png',
        color: INFOSOURCE_COLOR
      },
      polygon: {
        icon: './assets/images/icons/Infos_sources_1.png',
        strokeColor: INFOSOURCE_COLOR,
        fillColor: INFOSOURCE_COLOR_ALPHA
      },
      circle: {
        icon: './assets/images/icons/Infos_sources_1.png',
        strokeColor: INFOSOURCE_COLOR,
        fillColor: INFOSOURCE_COLOR_ALPHA
      }
    });
    this.infosourceAggregationStyle = this.generateAggregationStyle({
      icon: './assets/images/icons/aggregation-marker-border.png'
    });
  }

  getStyleForLocalisation(geometryType: GeometryType): Style[] {
    return cloneDeep(this.infosourceStyle[geometryType]);
  }

  getRollOverStyleForLocalisation(geometryType: GeometryType): Style[] {
    const styles = this.getStyleForLocalisation(geometryType).map(style => style.clone());
    return this.getRollOverStyle(styles, geometryType);
  }

  getStyleForAggregation(clusteredFeature: Feature<Point>): Style {
    const style = this.infosourceAggregationStyle.clone();
    const infosources = clusteredFeature.get('features').map((feature: Feature) => feature.get('infosource'));
    const numberOfDifferentInfosources = uniq(infosources).length;
    style.getText().setText('' + numberOfDifferentInfosources);
    return style;
  }
}