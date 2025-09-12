import { Injectable } from '@angular/core';
import { cloneDeep, uniq } from 'lodash-es';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import { blackColor, blackColorAlpha } from '../utils/feature';
import { GeometryType } from '../utils/geometry';
import { MaritimeReportTypeStyle } from '../utils/style';
import { MaritimeReportStyleFactory } from './maritime-report-style.factory';

const GEOREGLEMENT_COLOR = blackColor;
const GEOREGLEMENT_COLOR_ALPHA = blackColorAlpha;
const ICONS_ROOT_PATH = './assets/images/icons/';
const ICON_GEOREGULATION_BASE = ICONS_ROOT_PATH + 'georegulation-base.png';
const ICON_GEOREGULATION_NEW = ICONS_ROOT_PATH + 'georegulation-new.png';
const ICON_GEOREGULATION_TEMPORARY = ICONS_ROOT_PATH + 'georegulation-temporary.png';
const ICON_GEOREGULATION_TEMPORARY_NEW = ICONS_ROOT_PATH + 'georegulation-temporary-new.png';

@Injectable({
  providedIn: 'root'
})
export class GeoregulationStyleFactory extends MaritimeReportStyleFactory {
  private readonly georegulationStyleBase: MaritimeReportTypeStyle;
  private readonly georegulationStyleNew: MaritimeReportTypeStyle;
  private readonly georegulationStyleTemporary: MaritimeReportTypeStyle;
  private readonly georegulationStyleTemporaryNew: MaritimeReportTypeStyle;
  private readonly georegulationAggregationStyle: Style;

  constructor() {
    super();

    this.georegulationStyleBase = this.generateMaritimeReportTypeGeometryStyle({
      point: {
        icon: ICON_GEOREGULATION_BASE,
        color: GEOREGLEMENT_COLOR
      },
      lineString: {
        icon: ICON_GEOREGULATION_BASE,
        color: GEOREGLEMENT_COLOR
      },
      polygon: {
        icon: ICON_GEOREGULATION_BASE,
        strokeColor: GEOREGLEMENT_COLOR,
        fillColor: GEOREGLEMENT_COLOR_ALPHA
      },
      circle: {
        icon: ICON_GEOREGULATION_BASE,
        strokeColor: GEOREGLEMENT_COLOR,
        fillColor: GEOREGLEMENT_COLOR_ALPHA
      }
    });
    this.georegulationAggregationStyle = this.generateAggregationStyle({
      icon: './assets/images/icons/aggregation-marker-border.png'
    });

    this.georegulationStyleNew = this.generateMaritimeReportTypeGeometryStyle({
      point: {
        icon: ICON_GEOREGULATION_NEW,
        color: GEOREGLEMENT_COLOR
      },
      lineString: {
        icon: ICON_GEOREGULATION_NEW,
        color: GEOREGLEMENT_COLOR
      },
      polygon: {
        icon: ICON_GEOREGULATION_NEW,
        strokeColor: GEOREGLEMENT_COLOR,
        fillColor: GEOREGLEMENT_COLOR_ALPHA
      },
      circle: {
        icon: ICON_GEOREGULATION_NEW,
        strokeColor: GEOREGLEMENT_COLOR,
        fillColor: GEOREGLEMENT_COLOR_ALPHA
      }
    });

    this.georegulationStyleTemporary = this.generateMaritimeReportTypeGeometryStyle({
      point: {
        icon: ICON_GEOREGULATION_TEMPORARY,
        color: GEOREGLEMENT_COLOR
      },
      lineString: {
        icon: ICON_GEOREGULATION_TEMPORARY,
        color: GEOREGLEMENT_COLOR
      },
      polygon: {
        icon: ICON_GEOREGULATION_TEMPORARY,
        strokeColor: GEOREGLEMENT_COLOR,
        fillColor: GEOREGLEMENT_COLOR_ALPHA
      },
      circle: {
        icon: ICON_GEOREGULATION_TEMPORARY,
        strokeColor: GEOREGLEMENT_COLOR,
        fillColor: GEOREGLEMENT_COLOR_ALPHA
      }
    });

    this.georegulationStyleTemporaryNew = this.generateMaritimeReportTypeGeometryStyle({
      point: {
        icon: ICON_GEOREGULATION_TEMPORARY_NEW,
        color: GEOREGLEMENT_COLOR
      },
      lineString: {
        icon: ICON_GEOREGULATION_TEMPORARY_NEW,
        color: GEOREGLEMENT_COLOR
      },
      polygon: {
        icon: ICON_GEOREGULATION_TEMPORARY_NEW,
        strokeColor: GEOREGLEMENT_COLOR,
        fillColor: GEOREGLEMENT_COLOR_ALPHA
      },
      circle: {
        icon: ICON_GEOREGULATION_TEMPORARY_NEW,
        strokeColor: GEOREGLEMENT_COLOR,
        fillColor: GEOREGLEMENT_COLOR_ALPHA
      }
    });

    this.georegulationAggregationStyle = this.generateAggregationStyle({
      icon: './assets/images/icons/aggregation-marker-border.png'
    });
  }

  getStyleForGeometry(isTemporary: boolean, isNew: boolean, geometryType: GeometryType): Style[] {
    if (isTemporary && isNew) {
      return cloneDeep(this.georegulationStyleTemporaryNew[geometryType]);
    } else if (isNew) {
      return cloneDeep(this.georegulationStyleNew[geometryType]);
    } else if (isTemporary) {
      return cloneDeep(this.georegulationStyleTemporary[geometryType]);
    }
    return cloneDeep(this.georegulationStyleBase[geometryType]);
  }

  getRollOverStyleForGeometry(isTemporary: boolean, isNew: boolean, geometryType: GeometryType): Style[] {
    const styles = this.getStyleForGeometry(isTemporary, isNew, geometryType).map(style => style.clone());
    return this.getRollOverStyle(styles, geometryType);
  }

  getStyleForAggregation(clusteredFeature: Feature<Point>): Style {
    const style = this.georegulationAggregationStyle.clone();
    const georegulations = clusteredFeature.get('features').map((feature: Feature) => feature.get('georegulation'));
    const numberOfDifferentGeoregulations = uniq(georegulations).length;
    style.getText().setText('' + numberOfDifferentGeoregulations);
    return style;
  }
}
