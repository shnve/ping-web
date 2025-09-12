import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { cloneDeep } from 'lodash-es';
import { TableSurvey } from '../models/survey-table.model';
import {
  SurveyActivity,
  SurveyBroadcastRestriction,
  SurveyCoordinatesOrder,
  SurveyDepositEdition,
  SurveyDetails,
  SurveyFileComplianceAnalysisState,
  SurveyIssuerType,
  SurveyStateEnum,
  SurveyTestEdition,
  SurveyVerticalRef,
  SurveyZDirection,
  defaultValuesSurveyDepositEdition,
  defaultValuesSurveyTestEdition
} from '../models/survey.model';
import { SurveyAdminApi } from './survey-admin.api';
import { SurveysTableApiParams } from './survey.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SurveyAdminApi', () => {
  let api: SurveyAdminApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [SurveyAdminApi, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(SurveyAdminApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(api).toBeTruthy();
    done();
  });

  it('should get table items', done => {
    const params: SurveysTableApiParams = {
      state: SurveyStateEnum.TEST,
      page: '0',
      size: '2'
    };
    const item1: TableSurvey = {
      id: '1',
      identifier: '1',
      nameAndLocation: '1',
      lastUpdate: undefined,
      startDate: undefined,
      endDate: undefined,
      compliant: SurveyFileComplianceAnalysisState.NOT_COMPLIANT,
      expectedDeletionDate: undefined
    };
    const item2: TableSurvey = {
      id: '2',
      identifier: '2',
      nameAndLocation: '2',
      lastUpdate: undefined,
      startDate: undefined,
      endDate: undefined,
      compliant: SurveyFileComplianceAnalysisState.NOT_COMPLIANT,
      expectedDeletionDate: undefined
    };
    const tableViewDtos: PaginatedModelItemTableViewDtos<TableSurvey> = {
      _embedded: {
        items: [item1, item2]
      },
      page: {
        size: 2,
        totalElements: 2,
        totalPages: 6,
        number: 1
      }
    };

    api.getTableView$(params).subscribe(res => {
      expect(res.page.size).toEqual(2);
      expect(res.page.totalElements).toEqual(2);
      expect(res._embedded.items).toContain(item1);
    }, fail);

    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: api.apiTableUrl + '?state=TEST&page=0&size=2'
    });
    expect(testRequest.request.params.get('state')).toEqual(SurveyStateEnum.TEST);
    expect(testRequest.request.params.get('page')).toEqual('0');
    expect(testRequest.request.params.get('size')).toEqual('2');
    testRequest.flush(tableViewDtos);

    done();
  });

  it('should get table items for BRI', done => {
    const params: SurveysTableApiParams = {
      state: SurveyStateEnum.TRANSMITTED,
      page: '0',
      size: '2'
    };
    const item1: TableSurvey = {
      id: '1',
      identifier: '1',
      nameAndLocation: '1',
      lastUpdate: undefined,
      startDate: undefined,
      endDate: undefined,
      compliant: SurveyFileComplianceAnalysisState.NOT_COMPLIANT,
      expectedDeletionDate: undefined
    };
    const item2: TableSurvey = {
      id: '2',
      identifier: '2',
      nameAndLocation: '2',
      lastUpdate: undefined,
      startDate: undefined,
      endDate: undefined,
      compliant: SurveyFileComplianceAnalysisState.NOT_COMPLIANT,
      expectedDeletionDate: undefined
    };
    const tableViewDtos: PaginatedModelItemTableViewDtos<TableSurvey> = {
      _embedded: {
        items: [item1, item2]
      },
      page: {
        size: 2,
        totalElements: 2,
        totalPages: 6,
        number: 1
      }
    };

    api.getTableView$(params, true).subscribe(res => {
      expect(res.page.size).toEqual(2);
      expect(res.page.totalElements).toEqual(2);
      expect(res._embedded.items).toContain(item1);
    }, fail);

    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: api.apiTableUrl + '/bri?state=TRANSMITTED&page=0&size=2'
    });
    expect(testRequest.request.params.get('state')).toEqual(SurveyStateEnum.TRANSMITTED);
    expect(testRequest.request.params.get('page')).toEqual('0');
    expect(testRequest.request.params.get('size')).toEqual('2');
    testRequest.flush(tableViewDtos);

    done();
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

  it('should get SurveyModal by id', done => {
    // Given
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
    const nameAndLocation= 'nameAndLocation';
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

    const testRequest = httpTestingController.expectOne({ method: 'DELETE', url: `${api.apiAdminDeleteDeposit.replace('{{id}}', surveyId)}` });
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

    const testRequest = httpTestingController.expectOne({ method: 'PUT', url: `${api.apiAdminTransmitDeposit.replace('{{id}}', survey.id)}` });
    expect(testRequest.request.method).toBe('PUT');
    expect(testRequest.request.body).toEqual(survey);
    expect(testRequest.cancelled).toBeFalsy();
    httpTestingController.verify();
    done();
  });

  it('should download zip archive admin', done => {
    const surveyId = '1';
    const blob = new Blob([''], { type: 'text/html' });
    api.downloadSurveyAsZipArchive$(surveyId).subscribe(res => {
      expect(res.body).toEqual(blob);
    }, fail);

    const testRequest = httpTestingController.expectOne({ method: 'GET', url: `${api.apiDownload.replace('{{id}}', surveyId)}` });
    testRequest.flush(blob);
    done();
  });

  it('should update bri internal comment', done => {
    const surveyId = '1';
    const newComment = 'new comment';
    api.updateBriInternalComment$(surveyId, newComment).subscribe(res => {
      expect(res).toEqual('1');
    }, fail);

    const testRequest = httpTestingController.expectOne({ method: 'PUT', url: `${api.apiUpdateBriInternalComment.replace('{{id}}', surveyId)}` });
    expect(testRequest.request.body).toEqual({briInternalComment: 'new comment'});
    testRequest.flush('1');
    done();
  });
});
