import { HttpResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { InfosourceReportActivityForecast, InfosourceReportPublicUser } from '../models/infosource.model';
import { InfosourceApi } from './infosource.api';

describe('InfosourceApi', () => {
  let api: InfosourceApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [InfosourceApi, PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(InfosourceApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(api).toBeTruthy();
    done();
  });

  describe('#InfosourceApi.createInfosourceActivityForecastReportPublicUser()', () => {

    it('should create report', done => {
      const newReport: InfosourceReportActivityForecast = {
        timezone: '',
        parts: []
      };
      api.createInfosourceActivityForecastReportPublicUser(newReport).subscribe(id => {
        expect(id).toBe(null);
      }, fail);

      // call should have made one request to POST report
      const req = httpTestingController.expectOne(`${api.apiCreate}/activity-forecast`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newReport);

      // Expect server to return status 201 created
      const expectedResponse = new HttpResponse({ status: 201, statusText: 'Created' });
      req.event(expectedResponse);

      done();
    });

    it('should update report', done => {
      const idToUpdate = '1';
      const newReport: InfosourceReportActivityForecast = {
        timezone: '',
        parts: []
      };
      api.updateInfosourceActivityForecastReportPublicUser(idToUpdate, newReport).subscribe(idUpdated => {
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
      const newReport: InfosourceReportPublicUser = {
        id: '1',
        confidentialityInformation: 'confidentialityInformation',
        surveyPeriod: {
          dateStart: '2023-09-12',
          dateEnd: '2023-09-12'
        }
      };
      api.updateInfosourceBathyReportPublicUser(newReport).subscribe(idUpdated => {
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
});
