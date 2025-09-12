import { Circle, LineString, Point, Polygon } from 'ol/geom';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import IconOrigin from 'ol/style/IconOrigin';
import Text from 'ol/style/Text';
import { GeometryType } from '../utils/geometry';
import { MaritimeReportTypeStyle, MaritimeReportTypeStyleOptions } from '../utils/style';

export const ROLLOVER_FILL_OPACITY = '99';
export const ROLLOVER_STROKE_WIDTH = 5;
export const ROLLOVER_AFFECTED_AREA_STROKE_WIDTH = 3;

export abstract class MaritimeReportStyleFactory {
  constructor() { }

  protected getRolloverIconFromIconSrc(iconSrc: string): string {
    if (iconSrc === '') {
      return '';
    }
    const pathParts = iconSrc.split('/');
    pathParts[pathParts.length - 1] = 'ro-' + pathParts[pathParts.length - 1];
    return pathParts.join('/');
  }

  protected getRollOverStyle(styles: Style[], geometryType: GeometryType): Style[] {
    if (geometryType === GeometryType.POINT) {
      styles[0].setImage(new Icon({
        anchor: [0, 0],
        anchorOrigin: IconOrigin.BOTTOM_LEFT,
        src: this.getRolloverIconFromIconSrc((styles[0].getImage() as Icon)?.getSrc()),
        scale: 0.5,
      }));
    } else if (geometryType === GeometryType.LINE_STRING) {
      styles[0].getStroke().setWidth(ROLLOVER_STROKE_WIDTH);
      styles[1].setImage(new Icon({
        src: this.getRolloverIconFromIconSrc((styles[1].getImage() as Icon)?.getSrc()),
        scale: 0.5
      }));
    } else if (geometryType === GeometryType.POLYGON || geometryType === GeometryType.CIRCLE) {
      styles[0].getStroke().setWidth(ROLLOVER_STROKE_WIDTH);
      styles[0].getFill().setColor(styles[0].getStroke().getColor() + ROLLOVER_FILL_OPACITY);
      styles[1].setImage(new Icon({
        src: this.getRolloverIconFromIconSrc((styles[1].getImage() as Icon)?.getSrc()),
        scale: 0.5
      }));
    }
    return styles;
  }

  /**
   * Create global Style for all maritime reports of same type
   * @param {MaritimeReportTypeStyleOptions} options
   * @returns {MaritimeReportTypeStyle}
   */
  protected generateMaritimeReportTypeGeometryStyle(options: MaritimeReportTypeStyleOptions): MaritimeReportTypeStyle {
    return {
      Point: [
        new Style({
          image: options.point.icon ? new Icon({
            anchor: [0, 0],
            anchorOrigin: IconOrigin.BOTTOM_LEFT,
            src: options.point.icon,
            scale: 0.4,
          }) : null,
        })
      ],
      LineString: [
        new Style({
          stroke: new Stroke({
            color: options.lineString.color,
            width: 3
          })
        }),
        new Style({
          image: options.lineString.icon ? new Icon({
            src: options.lineString.icon,
            scale: 0.4,
          }) : null,
          geometry: feature => new Point((feature.getGeometry() as LineString).getCoordinateAt(0.5))
        })
      ],
      Polygon: [
        new Style({
          stroke: new Stroke({
            color: options.polygon.strokeColor,
            width: 2
          }),
          fill: new Fill({
            color: options.polygon.fillColor
          })
        }),
        new Style({
          image: options.polygon.icon ? new Icon({
            src: options.polygon.icon,
            scale: 0.4,
          }) : null,
          geometry: feature => (feature.getGeometry() as Polygon).getInteriorPoint()
        })
      ],
      Circle: [
        new Style({
          stroke: new Stroke({
            color: options.circle.strokeColor,
            width: 2
          }),
          fill: new Fill({
            color: options.circle.fillColor
          })
        }),
        new Style({
          image: options.circle.icon ? new Icon({
            src: options.circle.icon,
            scale: 0.4,
          }) : null,
          geometry: feature => new Point((feature.getGeometry() as Circle).getCenter())
        })
      ]
    };
  }

  protected generateAggregationStyle(options: { icon: string }): Style {
    return new Style({
      image: new Icon({
        src: options.icon,
        scale: 0.7,
      }),
      text: new Text({
        text: '',
        scale: 1.4,
        fill: new Fill({
          color: '#FFFFFF'
        })
      })
    });
  }
}
