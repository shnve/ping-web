import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { InfosourceReportActivityForecast, InfosourceReportServiceUser } from '../models/infosource.model';
import { InfosourceAdminApi } from './infosource-admin.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('InfosourceAdminApi', () => {
  let api: InfosourceAdminApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [InfosourceAdminApi, PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(InfosourceAdminApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(api).toBeTruthy();
    done();
  });

  it('should update report', done => {
    const idToUpdate = '1';
    const newReport: InfosourceReportActivityForecast = {
      timezone: '',
      parts: []
    };
    api.updateInfosourceActivityForecast(idToUpdate, newReport).subscribe(idUpdated => {
      expect(idUpdated).toEqual(idToUpdate)
    }, fail);

    // call should have made one request to POST report
    const req = httpTestingController.expectOne(`${api.apiCreate}/activity-forecast/${idToUpdate}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(newReport);

    req.flush(idToUpdate);

    done();
  });

  it('should get report', done => {
    const idToRetrieve = '1';
    const expectedReport: InfosourceReportActivityForecast = {
      timezone: 'Europe/Paris',
      parts: []
    };
    api.getActivityForecastInfosourceById$(idToRetrieve).subscribe(
      report => expect(report).toEqual(expectedReport)
    );

    // should have made one request to GET report
    const req = httpTestingController.expectOne(`${api.apiCreate}/activity-forecast/${idToRetrieve}`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedReport);

    done();
  })

  it('should update bathy report', done => {
    const newReport: InfosourceReportServiceUser = {
      id: '1',
      confidentialityInformation: 'confidentialityInformation',
      surveyPeriod: {
        dateStart: '2023-09-12',
        dateEnd: '2023-09-12'
      }
    };
    api.updateInfosourceBathyReportServiceUser(newReport).subscribe(idUpdated => {
      expect(idUpdated).toEqual('1')
    }, fail);

    // call should have made one request to POST report
    const req = httpTestingController.expectOne(`${api.apiCreate}/bathy-report/1`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(newReport);

    req.flush('1');

    done();
  });
});
