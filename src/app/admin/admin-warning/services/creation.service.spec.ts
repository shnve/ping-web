import { TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BathyGeometryNature } from '@app/infosource/models/infosource.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { UTC_TIMEZONE_ZERO } from '@app/shared/date-utils';
import { FEATURE_LABEL_PROPERTY, FEATURE_PROPERTY_DEPTH } from '@app/sig/utils/feature';
import { FEATURE_PROPERTY_DIFFERENCE, FEATURE_PROPERTY_NATURE } from '@shom2/carto/utils/feature';
import { Feature } from 'ol';
import GeoJson from 'ol/format/GeoJSON';
import { Point, Polygon } from 'ol/geom';
import { FeaturePart, JsonFeaturePart } from '../models/creation-warning.model';
import { CreationService } from './creation.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('CreationService', () => {
  let service: CreationService;
  const geoJson = new GeoJson({
    dataProjection: 'EPSG:3857',
    featureProjection: 'EPSG:3857'
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(CreationService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should convertJsonDateRangeToDateRange', done => {
    // Given
    const dateRange = {
      dateStart: '2021-01-01',
      dateEnd: '2021-12-31',
      timeOfDayStart: '00:00:00',
      timeOfDayEnd: '23:59:59',
      timezone: UTC_TIMEZONE_ZERO
    };

    // When
    const result = service.convertJsonDateRangeToDateRange(dateRange);

    // Then
    expect(result).toEqual({
      dateStart: '01/01/2021',
      dateEnd: '31/12/2021',
      timeOfDayStart: '00:00',
      timeOfDayEnd: '23:59',
      timezone: UTC_TIMEZONE_ZERO
    });
    done();
  });



  it('convertFeaturePartsToJsonFeatureParts - should convert feature to json feature parts', () => {
    // Given
    const featurePoint = new Feature(
      new Point([10, 10])
    );
    const featurePolygon = new Feature(
      new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
    );

    featurePolygon.set(FEATURE_LABEL_PROPERTY, 'label');
    featurePolygon.set(FEATURE_PROPERTY_DIFFERENCE, '2.5');
    featurePolygon.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.OBSTRUCTION);

    featurePoint.set(FEATURE_LABEL_PROPERTY, 'label');
    featurePoint.set(FEATURE_PROPERTY_DEPTH, '2.5');
    featurePoint.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.SHOAL);

    const featurePart: FeaturePart = {
      information: { 'fr': 'une info' },
      typeDetails: ['detail'],
      dateRanges: [],
      geometries: [
        featurePolygon
      ],
      affectedAreas: [
        featurePoint
      ],
    };

    const featureParts = [featurePart];

    // When
    const res: JsonFeaturePart[] = service.convertFeaturePartsToJsonFeatureParts(featureParts, true);

    // Expect
    const convertedFeaturePoint = geoJson.writeFeatureObject(featurePoint);
    const convertedFeaturePolygon = geoJson.writeFeatureObject(featurePolygon);
    const resultExpected: JsonFeaturePart[] = [
      {
        affectedAreas: [
          {
            geometry: convertedFeaturePoint.geometry,
            properties: {
              labels: convertedFeaturePoint.properties?.vertexLabels,
              featureLabel: convertedFeaturePoint.properties?.featureLabel,
              isBathy: true,
              nature: BathyGeometryNature.SHOAL,
              depth: '2.5',
              difference: null
            }
          }
        ],
        geometries: [
          {
            geometry: convertedFeaturePolygon.geometry,
            properties: {
              labels: convertedFeaturePolygon.properties?.vertexLabels,
              featureLabel: convertedFeaturePolygon.properties?.featureLabel,
              isBathy: true,
              nature: BathyGeometryNature.OBSTRUCTION,
              depth: null,
              difference: '2.5'
            }
          }
        ],
        information: { 'fr': 'une info' },
        typeDetails: ['detail'],
        dateRanges: [],
      }
    ];

    expect(res).toEqual(resultExpected);
  });
});
