/**
 * Create Openlayers Feature from JsonGeometry
 * @param {JsonGeometry} geometry
 */
import { environment } from '@env/environment';
import { JsonGeometry } from '@sig/models/geometry';
import { Coordinate } from 'ol/coordinate';
import Feature from 'ol/Feature';
import GeoJson from 'ol/format/GeoJSON';
import { Circle, Geometry, LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import { Type } from 'ol/geom/Geometry';
import GeometryLayout from 'ol/geom/GeometryLayout';
import { fromCircle } from 'ol/geom/Polygon';
import SimpleGeometry from 'ol/geom/SimpleGeometry';

export enum GeometryType {
  POINT = 'Point',
  LINE_STRING = 'LineString',
  POLYGON = 'Polygon',
  MULTI_POLYGON = 'MultiPolygon',
  CIRCLE = 'Circle',
  MULTI_LINE_STRING = 'MultiLineString'
}

export enum OverlayPositioning {
  BOTTOM_CENTER = 'bottom-center'
}

export function getGeometryType(type: Type): GeometryType {
  switch (type) {
    case 'Point':
      return GeometryType.POINT;
    case 'Circle':
      return GeometryType.CIRCLE;
    case 'LineString':
      return GeometryType.LINE_STRING;
    case 'MultiLineString':
      return GeometryType.MULTI_LINE_STRING;
    case 'Polygon':
      return GeometryType.POLYGON;
    case 'MultiPolygon':
      return GeometryType.MULTI_POLYGON;
    default:
      throw new Error(`Geometry type ${type} is unknwown in GeometryType enum.`);
  }
}

export function createOlGeometryFrom(geometry: JsonGeometry): Geometry {
  const geomType = geometry.type;
  let olGeom: Geometry;
  if (geomType === GeometryType.POINT) {
    olGeom = new Point(geometry.coordinates as Coordinate);
  } else if (geomType === GeometryType.LINE_STRING) {
    olGeom = new LineString(geometry.coordinates as Coordinate[]);
  } else if (geomType === GeometryType.POLYGON) {
    olGeom = new Polygon(geometry.coordinates as Coordinate[][]);
  } else if (geomType === GeometryType.MULTI_POLYGON) {
    olGeom = new MultiPolygon(geometry.coordinates as Coordinate[][][]);
  } else if (geomType === GeometryType.CIRCLE) {
    olGeom = new Circle(geometry.coordinates as Coordinate);
  } else {
    throw new Error(`Cannot create geometry for type ${geomType}`);
  }

  if (environment.carto.projection === 'EPSG:3857') {
    const ext = olGeom.getExtent();
    if (ext && Math.abs(ext[0]) <= 180 && Math.abs(ext[1]) <= 90 && Math.abs(ext[2]) <= 180 && Math.abs(ext[3]) <= 90 && (ext[0] !== 0 || ext[1] !== 0)) {
      olGeom.transform('EPSG:4326', 'EPSG:3857');
    }
  }
  return olGeom;
}

/**
 * Convert geometry coordinates and layout to XY
 * @param geometry the geometry not meeting requirements (i.e. layout !== XY or flatCoordinates is a multiple of 3, meaning XYZ dimensions)
 * @private
 */
export function convertLayoutCoordinatesToXY(geometry: SimpleGeometry): void {
  // handle special case when POINT: layout is still XY but coordinates has Z dimension
  if (geometry.getType() === GeometryType.POINT) {
    geometry.setCoordinates(geometry.getCoordinates().slice(0, 2), GeometryLayout.XY);
    return;
  }
  geometry.setCoordinates(geometry.getCoordinates(), GeometryLayout.XY);
}

export function checkIfLayoutIsNotValid(simpleGeom: SimpleGeometry, featureGeometry: Geometry): boolean {
  const isLayoutNotValid = simpleGeom.getLayout() !== GeometryLayout.XY
    || simpleGeom.getFlatCoordinates().length % 3 === 0
    && featureGeometry.getType() === GeometryType.POINT;

  return isLayoutNotValid;
}

export function convertFeaturesToJsonGeometries(features: Feature[]): JsonGeometry[] {
  const geoJson = new GeoJson({
    dataProjection: environment.carto.projection,
    featureProjection: environment.carto.projection
  });

  const featureToGeojson = (feature: Feature) => {
    const featureGeometry = feature.getGeometry();
    const simpleGeom = featureGeometry as SimpleGeometry;
    const isLayoutNotValid = checkIfLayoutIsNotValid(simpleGeom, featureGeometry);

    if (isLayoutNotValid) { convertLayoutCoordinatesToXY(simpleGeom); }

    let convertedFeature;
    if (featureGeometry.getType() === GeometryType.CIRCLE) {
      const circle = simpleGeom as Circle;
      convertedFeature = geoJson.writeFeatureObject(new Feature({ geometry: fromCircle(circle, environment.carto.polygonFromCircleSides) }));
    } else if (isLayoutNotValid) {
      convertedFeature = geoJson.writeFeatureObject(new Feature({ geometry: simpleGeom }));
    } else {
      convertedFeature = geoJson.writeFeatureObject(feature);
    }
    return {
      ...convertedFeature.geometry
    } as unknown as JsonGeometry;
  };

  return features.map(featureToGeojson);
}
