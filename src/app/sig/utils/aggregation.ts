import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { GeometryType } from './geometry';


export function featureToPoint(feature: Feature): Point {
  const geom = feature.getGeometry();
  const geomType = geom.getType();
  if (geomType === GeometryType.POINT) {
    return (feature.getGeometry() as Point);
  }
  if (geomType === GeometryType.POLYGON) {
    return (geom as Polygon).getInteriorPoint();
  }
  if (geomType === GeometryType.LINE_STRING) {
    return new Point((geom as LineString).getCoordinateAt(0.5));
  }
  if (geomType === GeometryType.CIRCLE) {
    return new Point((geom as Circle).getCenter());
  }
  throw new Error(`Geometry type ${geomType} is not convertible to simple point.`);
}
