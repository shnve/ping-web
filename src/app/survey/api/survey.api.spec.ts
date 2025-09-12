import { HttpErrorResponse, HttpEventType, HttpHeaders, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { cloneDeep } from 'lodash-es';
import { SurveyActivity, SurveyBroadcastRestriction, SurveyCoordinatesOrder, SurveyDepositEdition, SurveyDetails, SurveyIssuerType, SurveyStateEnum, SurveyTestEdition, SurveyVerticalRef, SurveyZDirection, defaultValuesSurveyDepositEdition, defaultValuesSurveyTestEdition } from '../models/survey.model';
import { SurveyApi } from './survey.api';

describe('SurveyApi', () => {
  let api: SurveyApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [SurveyApi, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(SurveyApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(api).toBeTruthy();
    done();
  });

  describe('#SurveyApi.handleError cases', () => {
    it('should handle client-side/network error', done => {
      const httpResponse: HttpErrorResponse = {
        name: 'HttpErrorResponse',
        message: '',
        error: undefined,
        ok: false,
        headers: new HttpHeaders(),
        status: 0,
        statusText: '',
        url: '',
        type: HttpEventType.ResponseHeader
      }
      api.handleError(httpResponse).subscribe(
        fail,
        error => expect(error).toEqual({ unknown: 'message.network-error' })
      );

      done();
    });

    it('should handle <name and location already used> error', done => {
      const httpResponse: HttpErrorResponse = {
        name: 'HttpErrorResponse',
        message: '',
        error: {
          message: 'check.survey.name-and-location.already-used'
        },
        ok: false,
        headers: new HttpHeaders(),
        status: 500,
        statusText: '',
        url: '',
        type: HttpEventType.ResponseHeader
      }
      api.handleError(httpResponse).subscribe(
        fail,
        error => expect(error).toEqual({ nameAndLocation: 'name-and-location.already-used' })
      );

      done();
    });

    it('should handle unknown server-side error', done => {
      const httpResponse: HttpErrorResponse = {
        name: 'HttpErrorResponse',
        message: '',
        error: undefined,
        ok: false,
        headers: new HttpHeaders(),
        status: -1,
        statusText: '',
        url: '',
        type: HttpEventType.ResponseHeader
      }
      api.handleError(httpResponse).subscribe(
        fail,
        error => expect(error).toEqual({ unhandled: 'message.unhandled-error' })
      );

      done();
    });
  });

  it('should create deposit survey', done => {
    const survey: SurveyDepositEdition = cloneDeep(defaultValuesSurveyDepositEdition);
    api.createDeposit$(survey).subscribe(res => {
      expect(res).toEqual('new_id');
    }, fail);

    const testRequest = httpTestingController.expectOne({ method: 'POST' });
    expect(testRequest.request.body).toEqual(survey);
    testRequest.flush('new_id');
    done();
  });

  it('should update deposit survey', done => {
    const survey: SurveyDepositEdition = cloneDeep(defaultValuesSurveyDepositEdition);
    api.updateDeposit$(survey).subscribe(res => {
      expect(res).toEqual('updated_id');
    }, fail);

    const testRequest = httpTestingController.expectOne({ method: 'PUT' });
    expect(testRequest.request.body).toEqual(survey);
    testRequest.flush('updated_id');
    done();
  });

  it('should get deposit survey by id', done => {
    const expectedSurvey: SurveyDepositEdition = cloneDeep(defaultValuesSurveyDepositEdition);
    expectedSurvey.id = 'searched_id';
    api.getDepositById$('searched_id').subscribe(res => {
      expect(res).toEqual(expectedSurvey);
    }, fail);

    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: api.apiCreateOrUpdateDeposit + '/' + expectedSurvey.id
    });
    testRequest.flush(expectedSurvey);
    done();
  });

  it('should create test survey', done => {
    const survey: SurveyTestEdition = cloneDeep(defaultValuesSurveyTestEdition);
    api.createTest$(survey).subscribe(res => {
      expect(res).toEqual('new_id');
    }, fail);

    const testRequest = httpTestingController.expectOne({ method: 'POST' });
    expect(testRequest.request.body).toEqual(survey);
    testRequest.flush('new_id');
    done();
  });

  it('should update test survey', done => {
    const survey: SurveyTestEdition = cloneDeep(defaultValuesSurveyTestEdition);
    api.updateTest$(survey).subscribe(res => {
      expect(res).toEqual('updated_id');
    }, fail);

    const testRequest = httpTestingController.expectOne({ method: 'PUT' });
    expect(testRequest.request.body).toEqual(survey);
    testRequest.flush('updated_id');
    done();
  });

  it('should get test survey by id', done => {
    const expectedSurvey: SurveyTestEdition = cloneDeep(defaultValuesSurveyTestEdition);
    expectedSurvey.id = 'searched_id';
    api.getTestById$('searched_id').subscribe(res => {
      expect(res).toEqual(expectedSurvey);
    }, fail);

    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: api.apiCreateOrUpdateTest + '/' + expectedSurvey.id
    });
    testRequest.flush(expectedSurvey);
    done();
  });

  it('should get survey by id to display modal', done => {
    const survey: SurveyDetails = {
      id: '1',
      lastUpdate: new Date(2023, 2, 2),
      state: SurveyStateEnum.DRAFT,
      goal: 'goal of survey',
      nameAndLocation: 'name and location',
      issuingUserFirstName: 'firstname',
      issuingUserLastName: 'lastname',
      directionZ: SurveyZDirection.ALTITUDE,
      areaName: 'areaName',
      surveyIssuerTypes: [SurveyIssuerType.OWNER],
      verticalRef: SurveyVerticalRef.ZERO_ALTI,
      geographicFormat: false,
      epsg: 'epsg',
      fileSeparator: 'fileSeparator',
      externalAnalysisEnabled: true,
      coordinatesOrder: SurveyCoordinatesOrder.XYZ,
      broadcastRestriction: SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION,
      activityChoice: SurveyActivity.EXCAVATION_GEOPHYSICAL,
      technicalManagerEmail: 'technicalManagerEmail',
      ownerEmail: 'ownerEmail',
      ownerOrganization: 'ownerOrganization',
      producerOrganization: 'producerOrganization',
      featureParts: null,
      technicalMetadataFile: null,
      technicalMetadataId: '1',
      externalAnalysisInProgress: false,
      canBeReported: false
    };
    api.getSurveyModalById$(survey.id).subscribe(res => expect(res).toEqual(survey), fail);

    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: `${api.apiGetSurveyModalById.replace('{{id}}', survey.id)}`
    });
    testRequest.flush(survey);
    done();
  });

  it('should clone survey', done => {
    const surveyId = '1';
    const nameAndLocation = 'nameAndLocation';
    const areaId = '2';
    api.clone$(surveyId, nameAndLocation, areaId).subscribe(res => {
      expect(res).toEqual('newSurveyId');
    }, fail);

    const testRequest = httpTestingController.expectOne({ method: 'PUT' });
    expect(testRequest.request.body).toEqual({ nameAndLocation, areaId });
    testRequest.flush('newSurveyId');
    done();
  });

  it('should delete survey deposit draft', done => {
    const surveyId = '1';
    api.deleteDeposit$(surveyId).subscribe();

    const testRequest = httpTestingController.expectOne({ method: 'DELETE', url: `${api.apiDeleteDeposit.replace('{{id}}', surveyId)}` });
    expect(testRequest.request.method).toBe('DELETE');
    expect(testRequest.cancelled).toBeFalsy();
    httpTestingController.verify();
    done();
  });

  it('should report survey', done => {
    const infosourceId = '1';
    api.report$(infosourceId).subscribe(res => {
      expect(res).toEqual('newInfosoureId');
    }, fail);

    const testRequest = httpTestingController.expectOne({ method: 'PUT' });
    expect(testRequest.request.body).toEqual({});
    testRequest.flush('newInfosoureId');
    done();
  });

  it('should transmit survey deposit draft', done => {
    const survey: SurveyDepositEdition = cloneDeep(defaultValuesSurveyDepositEdition);
    api.transmitDeposit$(survey).subscribe();

    const testRequest = httpTestingController.expectOne({ method: 'PUT', url: `${api.apiTransmitDeposit.replace('{{id}}', survey.id)}`});
    expect(testRequest.request.method).toBe('PUT');
    expect(testRequest.request.body).toEqual(survey);
    expect(testRequest.cancelled).toBeFalsy();
    httpTestingController.verify();
    done();
  });
});
