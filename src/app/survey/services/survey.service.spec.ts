import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { TableStateValue } from '@app/states/table.state';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { SurveyApi, SurveysTableApiParams } from '../api/survey.api';
import { TableSurvey } from '../models/survey-table.model';
import { defaultValuesSurveyDepositEdition, defaultValuesSurveyTestEdition, SurveyActivity, SurveyBroadcastRestriction, SurveyCoordinatesOrder, SurveyDepositEdition, SurveyDetails, SurveyFileComplianceAnalysisState, SurveyIssuerType, SurveyProcessingStatusEnum, SurveyStateEnum, SurveyTestEdition, SurveyVerticalRef, SurveyZDirection } from '../models/survey.model';

import { cloneDeep } from 'lodash-es';
import { defaultValuesSurveyTableFilter, SurveyTableFilterValues } from '../models/survey-filters.model';
import { SurveyService } from './survey.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SurveyService', () => {
  let service: SurveyService;
  let httpTestingController: HttpTestingController;
  let mockSurveyApi: SurveyApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        PermissionsProvider,
        SurveyService,
        MockProvider(SurveyApi),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SurveyService);
    mockSurveyApi = TestBed.inject(SurveyApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should get table items', done => {
    // Given
    const params: SurveyTableFilterValues = {
      state: SurveyStateEnum.TEST,
      service: {
        id: 'serviceId',
        name: 'service1'
      },
      identifier: 'identifier',
      nameAndLocation: 'nameAndLocation',
      period: {
        startDate: new Date(2023, 3, 24),
        endDate: new Date(2023, 3, 26)
      },
      transmissionPeriod: {
        startDate: new Date(2023, 3, 24),
        endDate: new Date(2023, 3, 26)
      },
      shomId: 'shomId',
      producerOrganization: 'producer',
      ownerOrganization: 'owner',
      notCompliant: true,
      transmissionStatus: SurveyProcessingStatusEnum.FINISHED,
      expectedDeletionDate: new Date(2023, 3, 26),
      briInternalComment: 'comment'
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

    const expectedResult = {
      modelItems: [item1, item2],
      totalElements: 2
    };

    const tableStateValue: TableStateValue = {
      pageInfo: {
        page: 1,
        rows: 5
      },
      sortInfo: {
        field: 'my-field',
        order: 1
      }
    };
    const apiParams: SurveysTableApiParams = {
      state: params.state,
      issuingServiceId: params.service.id,
      identifier: params.identifier,
      nameAndLocation: params.nameAndLocation,
      startDate: '2023-04-24',
      endDate: '2023-04-26',
      transmissionStartDate: '2023-04-24',
      transmissionEndDate: '2023-04-26',
      shomId: 'shomId',
      producerOrganization: 'producer',
      ownerOrganization: 'owner',
      notCompliant: 'true',
      transmissionStatus: SurveyProcessingStatusEnum.FINISHED,
      expectedDeletionDate: '2023-04-26',
      briInternalComment: 'comment',
      page: '' + tableStateValue.pageInfo.page,
      size: '' + tableStateValue.pageInfo.rows,
      sort: `${tableStateValue.sortInfo.field},asc`
    };
    const spyApi = spyOn(mockSurveyApi, 'getTableView$').and.returnValues(of(tableViewDtos));

    // When
    const res$ = service.loadFilteredPage$(tableStateValue, SurveyStateEnum.TEST, false, params);

    // Then
    expect(spyApi).toHaveBeenCalledWith(apiParams, false);
    res$.subscribe(res => {
      expect(res.modelItems).toEqual(expectedResult.modelItems);
      expect(res.totalElements).toEqual(expectedResult.totalElements);
      done();
    });
  });

  it('should get table empty items array', done => {
    // Given
    const params: SurveyTableFilterValues = defaultValuesSurveyTableFilter;
    const expectedResult = {
      modelItems: [],
      totalElements: 0
    };

    const tableStateValue: TableStateValue = {
      pageInfo: {
        page: 1,
        rows: 5
      },
      sortInfo: null
    };
    const apiParams: SurveysTableApiParams = {
      state: SurveyStateEnum.TEST,
      page: '' + tableStateValue.pageInfo.page,
      size: '' + tableStateValue.pageInfo.rows
    };
    const spyApi = spyOn(mockSurveyApi, 'getTableView$').and.returnValues(of({
      page: {
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0
      }
    }));

    // When
    const res$ = service.loadFilteredPage$(tableStateValue, SurveyStateEnum.TEST, false, params);

    // Then
    expect(spyApi).toHaveBeenCalledWith(apiParams, false);
    res$.subscribe(res => {
      expect(res.modelItems).toEqual(expectedResult.modelItems);
      expect(res.totalElements).toEqual(expectedResult.totalElements);
      done();
    });
  });

  it('should create deposit survey', done => {
    // Given
    const survey: SurveyDepositEdition = cloneDeep(defaultValuesSurveyDepositEdition);
    const spyApi = spyOn(mockSurveyApi, 'createDeposit$').and.returnValues(of('new_id'));

    // When
    const res$ = service.createDeposit$(survey);

    // Then
    expect(spyApi).toHaveBeenCalledWith(survey)
    res$.subscribe(res => {
      expect(res).toEqual('new_id');
      done();
    });
  });

  it('should update deposit survey', done => {
    // Given
    const survey: SurveyDepositEdition = cloneDeep(defaultValuesSurveyDepositEdition);
    const spyApi = spyOn(mockSurveyApi, 'updateDeposit$').and.returnValues(of('updated_id'));

    // When
    const res$ = service.updateDeposit$(survey);

    // Then
    expect(spyApi).toHaveBeenCalledWith(survey)
    res$.subscribe(res => {
      expect(res).toEqual('updated_id');
      done();
    });
  });

  it('should get deposit survey', done => {
    // Given
    const survey: SurveyDepositEdition = cloneDeep(defaultValuesSurveyDepositEdition);
    const spyApi = spyOn(mockSurveyApi, 'getDepositById$').and.returnValues(of(survey));

    // When
    const res$ = service.getDepositById$('searched_id');

    // Then
    expect(spyApi).toHaveBeenCalledWith('searched_id')
    res$.subscribe(res => {
      expect(res).toEqual(survey);
      done();
    });
  });

  it('should create test survey', done => {
    // Given
    const survey: SurveyTestEdition = cloneDeep(defaultValuesSurveyTestEdition);
    const spyApi = spyOn(mockSurveyApi, 'createTest$').and.returnValues(of('new_id'));

    // When
    const res$ = service.createTest$(survey);

    // Then
    expect(spyApi).toHaveBeenCalledWith(survey)
    res$.subscribe(res => {
      expect(res).toEqual('new_id');
      done();
    });
  });

  it('should update test survey', done => {
    // Given
    const survey: SurveyTestEdition = cloneDeep(defaultValuesSurveyTestEdition);
    const spyApi = spyOn(mockSurveyApi, 'updateTest$').and.returnValues(of('updated_id'));

    // When
    const res$ = service.updateTest$(survey);

    // Then
    expect(spyApi).toHaveBeenCalledWith(survey)
    res$.subscribe(res => {
      expect(res).toEqual('updated_id');
      done();
    });
  });

  it('should get test survey', done => {
    // Given
    const survey: SurveyTestEdition = cloneDeep(defaultValuesSurveyTestEdition);
    const spyApi = spyOn(mockSurveyApi, 'getTestById$').and.returnValues(of(survey));

    // When
    const res$ = service.getTestById$('searched_id');

    // Then
    expect(spyApi).toHaveBeenCalledWith('searched_id')
    res$.subscribe(res => {
      expect(res).toEqual(survey);
      done();
    });
  });

  it('should get Survey by id to modal', done => {
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
    const spyApi = spyOn(mockSurveyApi, 'getSurveyModalById$').and.returnValues(of(survey));

    // When
    const res$ = mockSurveyApi.getSurveyModalById$('1');

    // Then
    expect(spyApi).toHaveBeenCalledWith('1');
    res$.subscribe(res => {
      expect(res).toEqual(survey);
      done();
    });
  });

  it('should clone survey', done => {
    // Given
    const surveyId = '1';
    const nameAndLocation= 'nameAndLocation';
    const areaId = '2';
    const spyApi = spyOn(mockSurveyApi, 'clone$').and.returnValues(of('newSurveyId'));

    // When
    const res$ = service.clone$(surveyId, nameAndLocation, areaId);

    // Then
    expect(spyApi).toHaveBeenCalledWith(surveyId, nameAndLocation, areaId);
    res$.subscribe(res => {
      expect(res).toEqual('newSurveyId');
      done();
    });
  });

  it('should delete survey deposit draft', done => {
    // Given
    const surveyId = '1';
    const spyApi = spyOn(mockSurveyApi, 'deleteDeposit$').and.callThrough();

    // When
    service.deleteDeposit$(surveyId);

    // Then
    expect(spyApi).toHaveBeenCalledWith(surveyId);
    done();
  });

  it('should report survey', done => {
    // Given
    const infosourceId = '1';
    const spyApi = spyOn(mockSurveyApi, 'report$').and.returnValues(of('newInfosourceId'));

    // When
    const res$ = service.report$(infosourceId);

    // Then
    expect(spyApi).toHaveBeenCalledWith(infosourceId);
    res$.subscribe(res => {
      expect(res).toEqual('newInfosourceId');
      done();
    });
  });

  it('should transmit survey deposit draft', done => {
    // Given
    const survey: SurveyDepositEdition = cloneDeep(defaultValuesSurveyDepositEdition);
    const spyApi = spyOn(mockSurveyApi, 'transmitDeposit$').and.callThrough();

    // When
    service.transmitDeposit$(survey);

    // Then
    expect(spyApi).toHaveBeenCalledWith(survey);
    done();
  });

  it('should throw error when download zip archive', done => {
    // Given
    const surveyId = '1';

    // When
    // Then
    expect(() => service.downloadSurveyAsZipArchive$(surveyId)).toThrow(new Error('Should not be called by public user'));

    done();
  });

  it('should throw error when update bri internal comment', done => {
    // Given
    const surveyId = '1';

    // When
    // Then
    expect(() => service.updateBriInternalComment$(surveyId, '')).toThrow(new Error('Should not be called by public user'));

    done();
  });
});
