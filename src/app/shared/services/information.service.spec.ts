import { TestBed } from '@angular/core/testing';
import { FEATURE_LABEL_PROPERTY, FEATURE_PROPERTY_NATURE } from './../../sig/utils/feature';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BathyGeometryNature } from '@app/infosource/models/infosource.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { environment } from '@env/environment.default';
import { TranslateModule } from '@ngx-translate/core';
import { Feature } from 'ol';
import WKT from 'ol/format/WKT';
import { Circle } from 'ol/geom';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { CapitalizeFirstPipe } from '../pipes/capitalize-first.pipe';
import { InformationService, RADIUS_INPUT_VALUE_LABEL } from './information.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InformationService', () => {
  let httpTestingController: HttpTestingController;
  let service: InformationService;
  const translatedTemplates: Map<string, object> = new Map([
    [
      "category",
      {
        "fr": "{{category}}"
      }
    ],
    [
      "published",
      {
        "fr": "{{serieName}} en vigueur le {{currentDateTime}} :\n{{warningsListAsString}} et ce MSG"
      }
    ],
    [
      "fullPeriods",
      {
        "fr": "du {{startPeriod}} au {{endPeriod}}"
      }
    ],
    [
      "startPeriod",
      {
        "fr": "à partir du {{startPeriod}}"
      }
    ],
    [
      "endPeriod",
      {
        "fr": "jusqu'au {{endPeriod}}"
      }
    ],
    [
      "autoCancellation",
      {
        "fr": "auto-annuler ce MSG {{autoCancellationDateTime}}"
      }
    ],
    [
      "polylineWithoutLabel",
      {
        "fr": "ligne joignant {{content}}"
      }
    ],
    [
      "polylineWithLabel",
      {
        "fr": "ligne {{featureLabel}}joignant {{content}}"
      }
    ],
    [
      "polygonWithoutLabel",
      {
        "fr": "zone délimitée par : \n{{content}}"
      }
    ],
    [
      "polygonWithLabel",
      {
        "fr": "zone {{featureLabel}}délimitée par : \n{{content}}"
      }
    ],
    [
      "polygonWithoutLabelAffected",
      {
        "fr": "Zone concernée délimitée par : \n{{content}}"
      }
    ],
    [
      "polygonWithLabelAffected",
      {
        "fr": "Zone concernée {{featureLabel}}délimitée par:\n{{content}}"
      }
    ],
    [
      "circleWithoutLabelInNq",
      {
        "fr": "zone d'un rayon de {{radius}} {{distanceUnit}} autour de {{center}}."
      }
    ],
    [
      "circleWithLabelInNq",
      {
        "fr": "zone {{featureLabel}}d'un rayon de {{radius}} {{distanceUnit}} autour de {{center}}."
      }
    ],
    [
      "circleWithoutLabelInNqAffected",
      {
        "fr": "Zone concernée d'un rayon de {{radius}} {{distanceUnit}} autour de {{center}}."
      }
    ],
    [
      "circleWithLabelInNqAffected",
      {
        "fr": "Zone concernée {{featureLabel}}d'un rayon de {{radius}} {{distanceUnit}} autour de {{center}}."
      }
    ],
    [
      "bathy.polygon.withDepthAndZ",
      {
        "fr": "Profondeur plus faible que celle indiquée sur la carte dans la zone délimitée par : {{content}}\n\nLa différence peut aller jusqu'à {{z,z}} mètre{{s}}."
      }
    ],
    [
      "bathy.polygon.withObstructionAndZ",
      {
        "fr": "Obstructions dans la zone délimitée par : \n{{content}}\n\nLeur hauteur peut aller jusqu'à {{z,z}} mètre{{s}}."
      }
    ],
    [
      "bathy.polygon.withDepthWithoutZ",
      {
        "fr": "Fonds moindres dans la zone délimitée par : \n{{content}}"
      }
    ],
    [
      "bathy.polygon.withObstructionWithoutZ",
      {
        "fr": "Obstructions dans la zone délimitée par : \n{{content}}"
      }
    ],
    [
      "bathy.point.withDepthAndZ",
      {
        "fr": "Profondeur plus faible que celle indiquée sur la carte : {{z,z}} mètre{{s}} "
      }
    ],
    [
      "bathy.point.withShoalAndZ",
      {
        "fr": "Haut-fond {{z,z}} mètre{{s}} "
      }
    ],
    [
      "bathy.point.withWreckAndZ",
      {
        "fr": "Epave {{content}}. Brassiage {{z,z}} mètre{{s}}."
      }
    ],
    [
      "bathy.point.withObstructionAndZ",
      {
        "fr": "Obstruction {{z,z}} mètre{{s}} ."
      }
    ],
    [
      "bathy.point.withDepthWithoutZ",
      {
        "fr": "Fond moindre "
      }
    ],
    [
      "bathy.point.withShoalWithoutZ",
      {
        "fr": "Haut-fond "
      }
    ],
    [
      "bathy.point.withWreckWithoutZ",
      {
        "fr": "Epave ."
      }
    ],
    [
      "bathy.point.withObstructionWithoutZ",
      {
        "fr": "Obstruction ."
      }
    ],
    [
      "bathy.circle.withDepthAndZ",
      {
        "fr": "Profondeur plus faible que celle indiquée sur la carte dans une zone d’un rayon de {{radius}} {{distanceUnit}} autour de {{center}}\n\nLa différence peut aller jusqu'à {{z,z}} mètre{{s}}."
      }
    ],
    [
      "bathy.circle.withObstructionAndZ",
      {
        "fr": "Obstructions dans une zone d’un rayon de {{radius}} {{distanceUnit}} autour de {{center}}\n\nLeur hauteur peut aller jusqu'à {{z,z}} mètre{{s}}."
      }
    ],
    [
      "bathy.circle.withDepthWithoutZ",
      {
        "fr": "Fonds moindres dans une zone d’un rayon de {{radius}} {{distanceUnit}} autour de {{center}}"
      }
    ],
    [
      "bathy.circle.withObstructionWithoutZ",
      {
        "fr": "Obstructions dans une zone d’un rayon de {{radius}} {{distanceUnit}} autour de {{center}}"
      }
    ]
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [
        CapitalizeFirstPipe
    ],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        InformationService,
        CapitalizeFirstPipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(InformationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterAll(() => {
    httpTestingController.verify();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should formatGeometryAsCircle (meter unit)', done => {
    // Given
    const wkt = 'POINT(28.625360369528934 77.2227479486792)';

    const format = new WKT();

    const geometry = format.readFeature(wkt, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    geometry.setGeometry(new Circle((geometry.getGeometry() as Point).getCoordinates(), 50));
    geometry.set(FEATURE_LABEL_PROPERTY, 'label');
    geometry.set(RADIUS_INPUT_VALUE_LABEL, '385.62');

    const translatedTemplates = new Map();
    translatedTemplates.set('circleWithLabelInNq', {fr: 'préambule {{featureLabel}}{{radius}}{{distanceUnit}} {{center}}'});

    // When
    const result = service.formatGeometryAsCircle(geometry, translatedTemplates, 'fr', false, environment.carto.circleDistanceUnit.meters);

    // Then
    expect(result).toEqual('préambule label 386m 77-13.3649N 028-37.5216E');
    done();
  });

  it('should formatGeometryAsCircle (not meter unit)', done => {
    // Given
    const wkt = 'POINT(28.625360369528934 77.2227479486792)';

    const format = new WKT();

    const geometry = format.readFeature(wkt, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    geometry.setGeometry(new Circle((geometry.getGeometry() as Point).getCoordinates(), 50));
    geometry.set(FEATURE_LABEL_PROPERTY, 'label');
    geometry.set(RADIUS_INPUT_VALUE_LABEL, '385.62');

    const translatedTemplates = new Map();
    translatedTemplates.set('circleWithLabelInNq', {fr: 'préambule {{featureLabel}}{{radius}}{{distanceUnit}} {{center}}'});

    // When
    const result = service.formatGeometryAsCircle(geometry, translatedTemplates, 'fr', false, environment.carto.circleDistanceUnit.nauticMiles);

    // Then
    expect(result).toEqual('préambule label 0.2NM 77-13.3649N 028-37.5216E');
    done();
  });

  it('should formatGeometryAsCircle (not meter unit, radius ends width .0)', done => {
    // Given
    const wkt = 'POINT(28.625360369528934 77.2227479486792)';

    const format = new WKT();

    const geometry = format.readFeature(wkt, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    geometry.setGeometry(new Circle((geometry.getGeometry() as Point).getCoordinates(), 50));
    geometry.set(FEATURE_LABEL_PROPERTY, 'label');
    geometry.set(RADIUS_INPUT_VALUE_LABEL, '1800');

    const translatedTemplates = new Map();
    translatedTemplates.set('circleWithLabelInNq', {fr: 'préambule {{featureLabel}}{{radius}}{{distanceUnit}} {{center}}'});

    // When
    const result = service.formatGeometryAsCircle(geometry, translatedTemplates, 'fr', false, environment.carto.circleDistanceUnit.nauticMiles);

    // Then
    expect(result).toEqual('préambule label 1NM 77-13.3649N 028-37.5216E');
    done();
  });

  it('should format geometry as Point', done => {
    // Given
    const geometry = new Feature(new Point([-327051.55438601, 6002105.92020062]));
    geometry.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.DEPTH);

    const spyServiceFormatGeometryAsPoint = spyOn(service, 'formatGeometryAsPoint').and.callThrough();
    const spyServiceGetPreambleIfIsBathy = spyOn<any>(service, 'getPreambleIfIsBathy').and.callThrough();

    // Then
    const textToInsertOnInputInformation = service.formatGeometry(geometry, translatedTemplates, 'fr', false, null, 4, true);

    // When
    expect(spyServiceFormatGeometryAsPoint).toHaveBeenCalled();
    expect(spyServiceGetPreambleIfIsBathy).toHaveBeenCalled();
    expect(textToInsertOnInputInformation).toEqual('Fond moindre 47-21.9912N 002-56.2772W');
    done();
  });

  it('should format geometry as Polygon', done => {
    // Given
    const geometry = new Feature(
      new Polygon
        (
          [
            [
              [
                -330479.33754236,
                6004612.78160141
              ],
              [
                -330273.73044287,
                6004856.95758656
              ],
              [
                -329689.9821651,
                6004520.32138914
              ],
              [
                -329897.9492378,
                6004257.18344469
              ],
              [
                -330479.33754236,
                6004612.78160141
              ]
            ]
          ]
        )
    );
    geometry.set(FEATURE_PROPERTY_NATURE, BathyGeometryNature.DEPTH);

    const spyServiceFormatGeometryAsPolygon = spyOn(service, 'formatGeometryAsPolygon').and.callThrough();
    const spyServiceGetPreambleIfIsBathy = spyOn<any>(service, 'getPreambleIfIsBathy').and.callThrough();

    // Then
    const textToInsertOnInputInformation = service.formatGeometry(geometry, translatedTemplates, 'fr', false, null, 4, true);

    // When
    expect(spyServiceFormatGeometryAsPolygon).toHaveBeenCalled();
    expect(spyServiceGetPreambleIfIsBathy).toHaveBeenCalled();
    expect(textToInsertOnInputInformation).toEqual(
      'Fonds moindres dans la zone délimitée par : \n47-22.9062N 002-58.1248W\n47-22.9953N 002-58.0140W\n47-22.8724N 002-57.6993W\n47-22.7764N 002-57.8114W'
    );
    done();
  });
});





