import { TestBed } from '@angular/core/testing';
import { FEATURE_PROPERTY_DEPTH, FEATURE_PROPERTY_DIFFERENCE, FEATURE_PROPERTY_NATURE, FeatureType } from '@app/sig/utils/feature';
import { GeometryType } from '@app/sig/utils/geometry';
import { SurveyDanger, SurveyDangerNature, SurveyDangerTypeOfValue } from '@app/survey/models/survey.model';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FormatSurveyFeatureDataPipe } from './format-survey-feature-data.pipe';

describe('FormatSurveyFeatureDataPipe', () => {
  let translateServiceSpy: TranslateService;
  let pipe: FormatSurveyFeatureDataPipe;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService)
      ]
    });

    translateServiceSpy = TestBed.inject(TranslateService);
    pipe = new FormatSurveyFeatureDataPipe(translateServiceSpy);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should return info for displaying danger for geometry type polygon info on hover', done => {
    spyOn(translateServiceSpy, 'instant').and.returnValue('écart jusqu\'à {{value}}m');
    const danger: SurveyDanger = {
      geometry: {
        type: GeometryType.POLYGON,
        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]]
      },
      nature: SurveyDangerNature.DEPTH,
      typeOfValue: SurveyDangerTypeOfValue.DIFFERENCE,
      value: 1.1
    };

    const result = pipe.transform(danger, FeatureType.DANGER);
    expect(result).toBe('écart jusqu\'à 1.1m');
    done();
  });

  it('should return info for displaying danger for geometry type point info on hover', done => {
    spyOn(translateServiceSpy, 'instant').and.returnValue('profondeur de {{value}}m');
    const danger = {
      geometry: {
        type: GeometryType.POINT,
        coordinates: [10, 10]
      },
      nature: SurveyDangerNature.DEPTH,
      typeOfValue: SurveyDangerTypeOfValue.DEPTH,
      value: 1.1
    };

    const result = pipe.transform(danger, FeatureType.DANGER);
    expect(result).toBe('profondeur de 1.1m');
    done();
  });

  it('should return info for displaying simple geometry type point info on hover', done => {
    spyOn(translateServiceSpy, 'instant').and.returnValue('profondeur de {{value}}m');
    const geometry = {
      geometry: {
        type: GeometryType.POINT,
        coordinates: [10, 10]
      },
      nature: SurveyDangerNature.DEPTH,
      typeOfValue: SurveyDangerTypeOfValue.DEPTH,
      value: 1.1,
      getType(): GeometryType {
        return geometry.geometry.type;
      },
      get(label: string): any {
        switch (label) {
          case FEATURE_PROPERTY_NATURE:
            return geometry.nature;
          case FEATURE_PROPERTY_DEPTH:
            return geometry.value;
          default:
            return '';
        }
      }
    };

    const result = pipe.transform(geometry, FeatureType.SIMPLE_GEOMETRY);
    expect(result).toBe('profondeur de 1.1m');
    done();
  });

  it('should return info for displaying simple geometry type polygon info on hover', done => {
    spyOn(translateServiceSpy, 'instant').and.returnValue('profondeur : écart jusqu\'à {{value}}m');
    const geometry = {
      geometry: {
        type: GeometryType.POLYGON,
        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]]
      },
      nature: SurveyDangerNature.DEPTH,
      typeOfValue: SurveyDangerTypeOfValue.DIFFERENCE,
      value: 1.1,
      getType(): GeometryType {
        return geometry.geometry.type;
      },
      get(label: string): any {
        switch (label) {
          case FEATURE_PROPERTY_NATURE:
            return geometry.nature;
          case FEATURE_PROPERTY_DIFFERENCE:
            return geometry.value;
          default:
            return '';
        }
      }
    };

    const result = pipe.transform(geometry, FeatureType.SIMPLE_GEOMETRY);
    expect(result).toBe('profondeur : écart jusqu\'à 1.1m');
    done();
  });
});
