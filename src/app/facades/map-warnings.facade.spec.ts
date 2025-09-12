import { TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SerieType } from '@app/models/serie.model';
import { Observable, Subject, of } from 'rxjs';
import { WarningApi, WarningsMapApiParams } from '../api/warning.api';
import { WarningFactory } from '../core/warning/warning.factory';
import { MapFilterValues } from '../models/warning-filters.model';
import { GlobalWarningType, JsonMapWarning, MapWarning } from '../models/warning.model';
import { WarningsState } from '../states/warnings.state';
import { MapWarningsFacade } from './map-warnings.facade';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import Spy = jasmine.Spy;

class MockWarningApi {
  getMapWarnings$(): Subject<any> {
    return new Subject();
  }
}

class MockWarningsState {
  setFilteredMapWarnings(warnings: MapWarning[]) { }
}
class MockWarningFactory {
  create(w: JsonMapWarning) { }
}

describe('MapWarningsFacade', () => {
  let service: MapWarningsFacade;
  let spyApiMapWarnings: Spy<(params?: WarningsMapApiParams) => Observable<JsonMapWarning[]>>;
  let spyWarningFactory: Spy<(w: JsonMapWarning) => MapWarning>;
  let mockWarningApi: WarningApi;
  let mockWarningFactory: WarningFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        MapWarningsFacade,
        { provide: WarningApi, useClass: MockWarningApi },
        { provide: WarningsState, useClass: MockWarningsState },
        { provide: WarningFactory, useClass: MockWarningFactory },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(MapWarningsFacade);
    mockWarningApi = TestBed.inject<WarningApi>(WarningApi);
    mockWarningFactory = TestBed.inject(WarningFactory);
    spyApiMapWarnings = spyOn(mockWarningApi, 'getMapWarnings$');
    spyWarningFactory = spyOn(mockWarningFactory, 'create');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should convert "MapFilterValues" to "WarningsMapApiParams"', done => {
    const filter: MapFilterValues = {
      publishDate: new Date(2021, 11, 2),
      period: {
        startDate: new Date(2011, 0, 1),
        endDate: new Date(2021, 0, 25)
      },
      displayTypes: [GlobalWarningType.NOTICE, SerieType.COASTAL_NAVIGATIONAL_WARNING]
    };
    const resultParams = MapWarningsFacade.convertFilterToRequestParams(filter);
    expect(resultParams.publishedFromIncludingDate).toEqual('2021-12-02');
    expect(resultParams.dateStart).toEqual('2011-01-01');
    expect(resultParams.dateEnd).toEqual('2021-01-25');
    expect(resultParams.globalWarningType).toEqual(GlobalWarningType.NOTICE);
    expect(resultParams.serieType).toEqual(SerieType.COASTAL_NAVIGATIONAL_WARNING);
    done();
  });

  it('should load MapWarnings from api', (done) => {
    spyApiMapWarnings.and.returnValues(
      of<JsonMapWarning[]>([
        {
          id: '1',
          affectedAreas: [],
          geometries: [],
          globalWarningType: '',
          nameOfSeries: 'serie1',
          warningNumber: 1,
          warningTypeDetails: '',
          year: 21
        },
        {
          id: '2',
          affectedAreas: [],
          geometries: [],
          globalWarningType: '',
          nameOfSeries: 'serie2',
          warningNumber: 1,
          warningTypeDetails: '',
          year: 21
        }
      ]
      )
    );
    spyWarningFactory.and.callFake((warning) => {
      return warning as any as MapWarning;
    });

    const expectedResult: MapWarning[] = [
      {
        id: '1',
        affectedAreas: [],
        geometries: [],
        globalWarningType: '',
        nameOfSeries: 'serie1',
        warningNumber: 1,
        warningTypeDetails: '',
        year: 21
      }, {
        id: '2',
        affectedAreas: [],
        geometries: [],
        globalWarningType: '',
        nameOfSeries: 'serie2',
        warningNumber: 1,
        warningTypeDetails: '',
        year: 21
      }
    ];

    const res$ = service.getFiltredMapWarnings$({ publishDate: new Date(2021) });
    expect(spyApiMapWarnings).toHaveBeenCalled();
    res$.subscribe(res => {
      expect(spyWarningFactory).toHaveBeenCalled();
      expect(res).toEqual(expectedResult);
      done();
    });
  });
});
