import { LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import { JsonGeometry } from '../models/geometry';
import { GeometryType, createOlGeometryFrom } from './geometry';

describe('GeometryUtils', () => {

  it('createOlGeometryFrom - should create Point', () => {
    // Given
    const jsPoint: JsonGeometry = {
      type: GeometryType.POINT,
      coordinates: [0, 0]
    };

    // When
    const res = createOlGeometryFrom(jsPoint);

    // Expect
    expect(res).toBeInstanceOf(Point);
    expect((res as Point).getCoordinates()).toEqual([0, 0]);
  });

  it('createOlGeometryFrom - should create LineString', () => {
    // Given
    const coordinates =  [[0, 0], [0, 10], [10, 10], [10, 0]];
    const jsLineString: JsonGeometry = {
      type: GeometryType.LINE_STRING,
      coordinates
    };

    // When
    const res = createOlGeometryFrom(jsLineString);

    // Expect
    expect(res).toBeInstanceOf(LineString);
    expect((res as LineString).getCoordinates()).toEqual(coordinates);
  });

  it('createOlGeometryFrom - should create Polygon', () => {
    // Given
    const coordinates =  [[[0, 0], [0, 10], [10, 10], [10, 0]]];
    const jsPolygon: JsonGeometry = {
      type: GeometryType.POLYGON,
      coordinates
    };

    // When
    const res = createOlGeometryFrom(jsPolygon);

    // Expect
    expect(res).toBeInstanceOf(Polygon);
    expect((res as Polygon).getCoordinates()).toEqual(coordinates);
  });

  it('createOlGeometryFrom - should create Multipolygon', () => {
    // Given
    const coordinates =  [
      [[[0, 0], [0, 10], [10, 10], [10, 0]]]
    ];
    const jsMultiPolygon: JsonGeometry = {
      type: GeometryType.MULTI_POLYGON,
      coordinates
    };

    // When
    const res = createOlGeometryFrom(jsMultiPolygon);

    // Expect
    expect(res).toBeInstanceOf(MultiPolygon);
    expect((res as MultiPolygon).getCoordinates()).toEqual(coordinates);
  });

  it('createOlGeometryFrom - should throw error, because line strings are not convertible', () => {
    // Given
    const coordinates =  [[[0, 0], [0, 10], [10, 10], [10, 0]]];
    const multiLineString: JsonGeometry = {
      type: GeometryType.MULTI_LINE_STRING,
      coordinates
    };

    // When - Expect
    expect(() => createOlGeometryFrom(multiLineString)).toThrow(new Error(`Cannot create geometry for type MultiLineString`));
  });
});
