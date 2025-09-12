import Feature from 'ol/Feature';
import { LineString, Point, Polygon } from 'ol/geom';
import MultiLineString from 'ol/geom/MultiLineString';
import { featureToPoint } from './aggregation';
import { GeometryType } from './geometry';

describe('AggregationUtils', () => {

  it('featureToPoint - should convert Point to Point', () => {
    // Given
    const feature = new Feature(new Point([0,0]));

    // When
    const res = featureToPoint(feature);

    // Expect
    expect(res).toBeInstanceOf(Point);
    expect((res as Point).getCoordinates()).toEqual([0, 0]);
  });

  it('featureToPoint - should convert Polygon to Point', () => {
    // Given
    const polygon = new Polygon([[[0,0], [10,0], [0, 10], [10, 10]]]);
    const spyInteriorPoint = spyOn(polygon, 'getInteriorPoint').and.returnValue(new Point([5, 5]));
    const feature = new Feature(polygon);

    // When
    const res = featureToPoint(feature);

    // Expect
    expect(spyInteriorPoint).toHaveBeenCalled();
    expect(res).toBeInstanceOf(Point);
    expect((res as Point).getCoordinates()).toEqual([5, 5]);
  });

  it('featureToPoint - should convert LineString to Point', () => {
    // Given
    const lineString = new LineString([[0,0], [10, 10]]);
    const spyCoordinateAt = spyOn(lineString, 'getCoordinateAt').and.returnValue([5, 5]);
    const feature = new Feature(lineString);

    // When
    const res = featureToPoint(feature);

    // Expect
    expect(spyCoordinateAt).toHaveBeenCalledWith(0.5);
    expect(res).toBeInstanceOf(Point);
    expect((res as Point).getCoordinates()).toEqual([5, 5]);
  });

  it('featureToPoint - should throw error because MultiLineString cannot be converted to Point', () => {
    // Given
    const multiPolygon = new MultiLineString([[[0,0], [10, 10]]]);
    const feature = new Feature(multiPolygon);

    // When - Expect
    expect(() => featureToPoint(feature)).toThrowError(`Geometry type ${GeometryType.MULTI_LINE_STRING} is not convertible to simple point.`)
  });
});
