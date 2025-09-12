import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { PermissionsProvider } from '../../privileges/permissions-provider';
import { InfosourceApi } from '../api/infosource.api';
import { InfosourceReportActivityForecast, InfosourceReportPublicUser } from '../models/infosource.model';
import { InfosourceService } from './infosource.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InfosourceService', () => {
  let httpTestingController: HttpTestingController;
  let service: InfosourceService;
  let mockInfosourceApi: InfosourceApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        PermissionsProvider,
        InfosourceService,
        MockProvider(InfosourceApi),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(InfosourceService);
    mockInfosourceApi = TestBed.inject(InfosourceApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should createInfosourceActivityForecast', done => {
    // Given
    const newReport: InfosourceReportActivityForecast = {
      timezone: '',
      parts: []
    };
    const spyApiCreate = spyOn(mockInfosourceApi, 'createInfosourceActivityForecastReportPublicUser').and.returnValues(of('1'));

    // When
    const res$ = service.createInfosourceActivityForecast(newReport);

    // Then
    res$.subscribe(id => {
      expect(spyApiCreate).toHaveBeenCalledWith(newReport)
      expect(id).toEqual('1');
      done();
    });
  });

  it('should updateInfosourceActivityForecast', done => {
    // Given
    const newReport: InfosourceReportActivityForecast = {
      timezone: '',
      parts: []
    };
    const spyApiUpdate = spyOn(mockInfosourceApi, 'updateInfosourceActivityForecastReportPublicUser').and.returnValues(of('1'));

    // When
    const res$ = service.updateInfosourceActivityForecast('1', newReport);

    // Then
    res$.subscribe(id => {
      expect(spyApiUpdate).toHaveBeenCalledWith('1', newReport)
      expect(id).toEqual('1');
      done();
    });
  });

  it('should getActivityForecastInfosourceById', done => {
    // Given
    const id = '1';
    const found: InfosourceReportActivityForecast = {
      timezone: '',
      parts: []
    };
    const spyApi = spyOn(mockInfosourceApi, 'getActivityForecastInfosourceById$').and.returnValues(of(found));

    // When
    const res$ = service.getActivityForecastInfosourceById$('1');

    // Then
    res$.subscribe(res => {
      expect(spyApi).toHaveBeenCalledWith('1')
      expect(res).toEqual(found);
      done();
    });
  });

  it('should update bathy report', done => {
    // Given
    const newReport: InfosourceReportPublicUser = {
      id: '1',
      confidentialityInformation: 'confidentialityInformation',
      surveyPeriod: {
        dateStart: '2023-09-12',
        dateEnd: '2023-09-12'
      }
    };
    const spyApiUpdate = spyOn(mockInfosourceApi, 'updateInfosourceBathyReportPublicUser').and.returnValues(of('1'));

    // When
    const res$ = service.updateInfosourceBathyReport(newReport);

    // Then
    res$.subscribe(id => {
      expect(spyApiUpdate).toHaveBeenCalledWith(newReport)
      expect(id).toEqual('1');
      done();
    });
  });
});
