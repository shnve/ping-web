import {SeriesFacade} from './series.facade';
import {TestBed} from '@angular/core/testing';
import {Serie, SerieType} from '../models/serie.model';
import {SeriesApi} from '../api/series.api';
import {of} from 'rxjs';
import {MockProvider} from 'ng-mocks';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {PermissionsProvider} from '@app/privileges/permissions-provider';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SeriesFacade', () => {
  let service: SeriesFacade;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        SeriesFacade,
        MockProvider(SeriesApi),
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(SeriesFacade);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get series by area id', (done) => {
    // Given
    const series: Serie[] = [{
      id: '1',
      name: 'série 1',
      internationalName: 'serie 1',
      type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
      subAreas: [],
      maritimeService: '1',
      ranges: [[1, 999]]
    }, {
      id: '2',
      name: 'série 1',
      type: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      subAreas: [],
      maritimeService: '1',
      ranges: [[1, 999]]
    }];
    const spyApiGetSeriesByAreaId = spyOn(TestBed.inject(SeriesApi), 'getSeriesByAreaId$').and.returnValues(of(series));

    // When
    const res$ = service.getSeriesByAreaId$('1a');

    // Expect
    res$.subscribe(res => {
      expect(spyApiGetSeriesByAreaId).toHaveBeenCalledWith('1a');
      expect(res[0]).toEqual(series[0]);
      expect(res[1]).toEqual({
        ...series[1],
        internationalName: series[1].name
      });
      done();
    });
  });
});
