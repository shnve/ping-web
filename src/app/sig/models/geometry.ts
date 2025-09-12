import { Coordinate } from 'ol/coordinate';
import { Type } from 'ol/geom/Geometry';
export interface JsonFeature {
  properties?: any;
  geometry: JsonGeometry;
}

export interface JsonGeometry {
  type: Type,
  coordinates: Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][]
}
