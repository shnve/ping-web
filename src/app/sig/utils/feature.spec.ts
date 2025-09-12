import { BathyGeometryNature } from '@app/infosource/models/infosource.model';
import { getSphereRadius } from '@shom2/carto/utils/spheremeasure';
import { Feature } from 'ol';
import GeoJson from 'ol/format/GeoJSON';
import { Circle, Point, SimpleGeometry } from 'ol/geom';
import GeometryLayout from 'ol/geom/GeometryLayout';
import Polygon, { fromCircle } from 'ol/geom/Polygon';
import { addLabelToFeature, convertFeatureToJsonFeature, DEFAULT_TOOL_STYLE, FEATURE_LABEL_PROPERTY, FEATURE_PROPERTY_DEPTH, FEATURE_PROPERTY_DIFFERENCE, FEATURE_PROPERTY_IS_BATHY, FEATURE_PROPERTY_NATURE, setBathyProperties, STYLE_TEXT_LABEL } from './feature';

describe('FeatureUtils', () => {
  const geoJson = new GeoJson({
    dataProjection: 'EPSG:3857',
    featureProjection: 'EPSG:3857'
  });

  it('convertFeatureToJsonFeature - should convert feature Point to json feature', () => {
    // Given
    const feature = new Feature(
      new Point([10, 10])
    );
    feature.set(FEATURE_LABEL_PROPERTY, 'label');
    feature.set(FEATURE_PROPERTY_DEPTH, '2.5');
    feature.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.SHOAL);

    const features = [feature];

    // When
    const res = convertFeatureToJsonFeature(features, true);

    // Expect
    const convertedFeature = geoJson.writeFeatureObject(feature);
    const resultExpected = [{
      geometry: convertedFeature.geometry,
      properties: {
        labels: convertedFeature.properties?.vertexLabels,
        featureLabel: convertedFeature.properties?.featureLabel,
        isBathy: true,
        nature: BathyGeometryNature.SHOAL,
        depth: '2.5',
        difference: null
      }
    }];

    expect(res).toEqual(resultExpected);
  });

  it('convertFeatureToJsonFeature - should convert feature Polygon to json feature', () => {
    // Given=
    const feature = new Feature(
      new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
    );
    feature.set(FEATURE_LABEL_PROPERTY, 'label');
    feature.set(FEATURE_PROPERTY_DIFFERENCE, '2.5');
    feature.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.OBSTRUCTION);

    const features = [feature];

    // When
    const res = convertFeatureToJsonFeature(features, true);

    // Expect
    const convertedFeature = geoJson.writeFeatureObject(feature);
    const resultExpected = [{
      geometry: convertedFeature.geometry,
      properties: {
        labels: convertedFeature.properties?.vertexLabels,
        featureLabel: convertedFeature.properties?.featureLabel,
        isBathy: true,
        nature: BathyGeometryNature.OBSTRUCTION,
        depth: null,
        difference: '2.5'
      }
    }];

    expect(res).toEqual(resultExpected);
  });

  it('convertFeatureToJsonFeature - should convert feature Circle to json feature', () => {
    // Given
    const feature = new Feature(
      new Circle([10, 10], 525)
    );
    feature.set(FEATURE_LABEL_PROPERTY, 'label');
    feature.set(FEATURE_PROPERTY_DIFFERENCE, '2.5');
    feature.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.OBSTRUCTION);

    const features = [feature];

    // When
    const res = convertFeatureToJsonFeature(features, true);

    // Expect
    const circle = features[0].getGeometry() as SimpleGeometry as Circle;
    const convertedFeatureExpected = geoJson.writeFeatureObject(new Feature({ geometry: fromCircle(circle, 64) }));
    const center = circle.getCenter();
    const radius = Number(getSphereRadius(circle).toFixed(1));
    const resultExpected = [{
      geometry: convertedFeatureExpected.geometry,
      properties: {
        featureLabel: features[0].getProperties()?.featureLabel,
        isCircle: true,
        center,
        radius,
        isBathy: true,
        nature: BathyGeometryNature.OBSTRUCTION,
        difference: '2.5'
      }
    }];

    expect(res).toEqual(resultExpected);
  });

  it('setBathyProperties - should set bathy properties for feature Polygon', () => {
    // Given
    const feature = new Feature(
      new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
    );
    feature.set(FEATURE_PROPERTY_DIFFERENCE, '2.5');
    feature.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.OBSTRUCTION);

    const properties = {
      isBathy: true,
      nature: BathyGeometryNature.OBSTRUCTION,
      difference: '2.5'
    };

    // When
    setBathyProperties(feature, properties);

    // Expect
    expect(feature.get(FEATURE_PROPERTY_DIFFERENCE)).toEqual('2.5');
    expect(feature.get(FEATURE_PROPERTY_NATURE)).toEqual(BathyGeometryNature.OBSTRUCTION);
    expect(feature.get(FEATURE_PROPERTY_IS_BATHY)).toBeTrue();
  });

  it('setBathyProperties - should set bathy properties for feature Point', () => {
    // Given
    const feature = new Feature(
      new Point([10, 10])
    );
    feature.set(FEATURE_PROPERTY_DEPTH, '2.5');
    feature.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.OBSTRUCTION);

    const properties = {
      isBathy: true,
      nature: BathyGeometryNature.SHOAL,
      depth: '2.5'
    };

    // When
    setBathyProperties(feature, properties);

    // Expect
    expect(feature.get(FEATURE_PROPERTY_DEPTH)).toEqual('2.5');
    expect(feature.get(FEATURE_PROPERTY_NATURE)).toEqual(BathyGeometryNature.SHOAL);
    expect(feature.get(FEATURE_PROPERTY_IS_BATHY)).toBeTrue();
  });

  it('convertFeatureToJsonFeature - should convert feature Point to json feature is layout not valid', () => {
    // Given
    const feature = new Feature(
      new Point([10, 10])
    );
    feature.set(FEATURE_LABEL_PROPERTY, 'label');
    feature.set(FEATURE_PROPERTY_DEPTH, '2.5');
    feature.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.SHOAL);

    feature.getGeometry().getLayout = () => {
      return GeometryLayout.XYZ;
    }

    const features = [feature];

    // When
    const res = convertFeatureToJsonFeature(features, true);

    // Expect
    const convertedFeature = geoJson.writeFeatureObject(feature);
    const resultExpected = [{
      geometry: convertedFeature.geometry,
      properties: {
        featureLabel: convertedFeature.properties?.featureLabel,
        isBathy: true,
        nature: BathyGeometryNature.SHOAL,
        depth: '2.5',
        difference: null
      }
    }];

    expect(res).toEqual(resultExpected);
  });

  it('addLabelToFeature - should add label to feature', () => {
    // Given
    const feature = new Feature(
      new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
    );
    const label = "Test Label";
    const scale = 1.5;

    // When
    addLabelToFeature(feature, label, scale, DEFAULT_TOOL_STYLE, STYLE_TEXT_LABEL);

    //Then
    expect(feature.getStyle()[1]['text_'].text_).toEqual(label);
    expect(feature.getStyle()[1]['text_'].scale_).toEqual(scale);
  });
});
