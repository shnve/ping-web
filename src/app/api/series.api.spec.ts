import {TestBed} from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {SeriesApi} from './series.api';
import {Serie, SerieType} from '../models/serie.model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SeriesApi', () => {
  let service: SeriesApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [SeriesApi, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SeriesApi);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should match 2 series', (done) => {
    const areaId = '1';
    const series: Serie[] = [{
      id: '1',
      name: 'serie 1',
      internationalName: '',
      subAreas: [],
      type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
      maritimeService: '1',
      ranges: [[1, 999]]
    }, {
      id: '2',
      name: 'serie 2',
      internationalName: '',
      subAreas: [],
      type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
      maritimeService: '1',
      ranges: [[1, 999]]
    }];
    service.getSeriesByAreaId$(areaId).subscribe((series) => {
      expect(series.length).toEqual(2);
      const [firstSerie, secondSerie] = series;
      expect(firstSerie.id).toEqual('1');
      expect(firstSerie.name).toEqual('serie 1');
      expect(secondSerie.id).toEqual('2');
      expect(secondSerie.name).toEqual('serie 2');
      done();
    }, (e) => {
      done.fail(e);
    });


    const testRequest = httpTestingController.expectOne({method: 'GET'});
    expect(testRequest.request.params.get('areaId')).toEqual(areaId);

    testRequest.flush(series);
  });

});
