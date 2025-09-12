import { HttpHeaders, HttpResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ElementRef, SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { LangService } from '@app/core/lang.service';
import { WarningTableFacade } from '@app/facades/warnings-table.facade';
import { InfosourceFormatDateRangePipe } from '@app/infosource/pipes/infosource-format-date-range.pipe';
import { InfosourceFormatInformationPipe } from '@app/infosource/pipes/infosource-format-information.pipe';
import {
  InfosourcePartFormatDetailsModalObjectPipe
} from '@app/infosource/pipes/infosource-part-format-details-modal-object.pipe';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { FormatDateRangePipe } from '@app/shared/pipes/format-date-range.pipe';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { FormatLocalizedTextPipe } from '@app/shared/pipes/format-localized-text.pipe';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { GeometryType } from '@app/sig/utils/geometry';
import { SurveyApi } from '@app/survey/api/survey.api';
import { surveyServiceProvider } from '@app/survey/providers/survey.service.provider';
import { AbstractSurveyService, SurveyService } from '@app/survey/services/survey.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormatFeaturePartDetailsPipe } from '@shared/pipes/format-feature-part-details.pipe';
import { FormatMonthPipe } from '@shared/pipes/format-month.pipe';
import { FormatWarningNumberPipe } from '@shared/pipes/format-warning-number.pipe';
import { FormatWarningTitlePipe } from '@shared/pipes/format-warning-title.pipe';
import { ExportPdfService } from '@shared/services/export-pdf.service';
import * as FileSaver from 'file-saver';
import { MockProvider } from 'ng-mocks';
import { ConfirmationService } from 'primeng/api';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Observable, of } from 'rxjs';
import {
  SurveyActivity,
  SurveyBroadcastRestriction,
  SurveyCoordinatesOrder,
  SurveyDangerNature,
  SurveyDangerTypeOfValue,
  SurveyDetails,
  SurveyIssuerType,
  SurveyProcessingStatusEnum, SurveyStateEnum,
  SurveyVerticalRef,
  SurveyZDirection
} from '../../models/survey.model';
import { SurveyAdminService } from '../../services/survey-admin.service';
import { SurveyModalComponent } from './survey-modal.component';
import Spy = jasmine.Spy;

describe('SurveyModalComponent', () => {
  let component: SurveyModalComponent;
  let fixture: ComponentFixture<SurveyModalComponent>;
  let spySurveyService: Spy<any>;
  let router: Router;
  let authService: AuthService;
  let mockSurveyService: AbstractSurveyService;
  let survey: SurveyDetails = {
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
    miscAttachmentIds: null,
    technicalMetadataFile: null,
    technicalMetadataId: '1',
    surveyExternalAnalysisResults: {
      globalErrorMessage: null,
      processingStatus: SurveyProcessingStatusEnum.FINISHED,
      surveyFilesExternalAnalysisResults: [],
      dangers: [
        {
          geometry: {
            type: GeometryType.POLYGON,
            coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]]
          },
          nature: SurveyDangerNature.DEPTH,
          typeOfValue: SurveyDangerTypeOfValue.DEPTH,
          value: 1.1
        }
      ],
      detections: [
        {
          geometry: {
            type: GeometryType.POINT,
            coordinates: [10, 0]
          },
          depth: 3.2,
          difference: 0.3,
          color: 2
        },
        {
          geometry: {
            type: GeometryType.POINT,
            coordinates: [10, 10]
          },
          depth: 3.2,
          difference: 0.3,
          color: 2
        }
      ],
      receptionDate: undefined
    },
    externalAnalysisInProgress: false,
    canBeReported: true
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        SurveyModalComponent
    ],
    imports: [OverlayPanelModule,
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        SurveyService,
        SurveyAdminService,
        TranslateService,
        ConfirmationService,
        AuthService,
        AlertMessageService,
        ExportPdfService,
        FormatWarningNumberPipe,
        FormatWarningTitlePipe,
        FormatFeaturePartDetailsPipe,
        FormatLocalizedTextPipe,
        FormatDateRangePipe,
        LocalizedDatePipe,
        FormatDatetimePipe,
        WarningTableFacade,
        InfosourcePartFormatDetailsModalObjectPipe,
        InfosourceFormatDateRangePipe,
        CapitalizeFirstPipe,
        InfosourceFormatInformationPipe,
        FormatMonthPipe,
        LangService,
        GetNumberForSearchedPartPipe,
        surveyServiceProvider,
        MockProvider(AbstractSurveyService, {
            getSurveyModalById$(id: string): Observable<SurveyDetails> {
                return of(survey);
            },
            report$(id: string): Observable<string> {
                return of('1b60a992-c6c5-4559-998b-05189caf523a');
            },
            downloadSurveyAsZipArchive$(id: string): Observable<HttpResponse<Blob>> {
                return of(new HttpResponse({ status: 200, body: new Blob([''], { type: 'text/html' }) }));
            }
        }),
        MockProvider(SurveyApi, {
            getSurveyModalById$(id: string): Observable<SurveyDetails> {
                return of(survey);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    authService = TestBed.inject(AuthService);
    mockSurveyService = TestBed.inject(AbstractSurveyService);
    spySurveyService = spyOn(mockSurveyService, 'getSurveyModalById$').and.returnValues(of(survey));
    fixture = TestBed.createComponent(SurveyModalComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should get survey by id', done => {

    //given
    component.surveyIds = [survey.id];
    component.currentPosition = 0;

    //when
    component.ngOnChanges(
      { surveyIds: new SimpleChange(null, [survey.id], true) }
    );

    //then
    expect(component['surveyId']).toEqual(survey.id);
    expect(component['currentSurvey']).toEqual(survey);
    expect(component.display).toBeTrue();
    expect(spySurveyService).toHaveBeenCalled();

    done();
  });

  it('should format survey danger to feature', done => {
    //given
    component.surveyIds = [survey.id];
    component.currentPosition = 0;
    const spyComponentFormatSurveyDangerToFeature = spyOn<any>(component, 'formatSurveyDangerToFeature').and.callThrough();
    const spyComponentLoadSurvey = spyOn<any>(component, 'loadSurvey').and.callThrough();
    survey.boundingBox = {
      type: GeometryType.POLYGON,
      coordinates: [
        [
          [
            -532107.34410303,
            6182049.97961228
          ],
          [
            -532107.34410303,
            6190388.57125068
          ],
          [
            -536381.55613958,
            6190388.57125068
          ],
          [
            -536381.55613958,
            6182049.97961228
          ],
          [
            -532107.34410303,
            6182049.97961228
          ]
        ]
      ]
    };
    survey.surveyExternalAnalysisResults = {
      globalErrorMessage: null,
      receptionDate: new Date('2023-03-08T23:00:00Z'),
      processingStatus: SurveyProcessingStatusEnum.FINISHED,
      surveyFilesExternalAnalysisResults: [],
      dangers: [
        {
          geometry: {
            type: GeometryType.POLYGON,
            coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]]
          },
          nature: SurveyDangerNature.DEPTH,
          typeOfValue: SurveyDangerTypeOfValue.DEPTH,
          value: 1.1
        }
      ],
      detections: [
        {
          geometry: {
            type: GeometryType.POINT,
            coordinates: [10, 0]
          },
          depth: 3.2,
          difference: 0.3,
          color: 2
        },
        {
          geometry: {
            type: GeometryType.POINT,
            coordinates: [10, 10]
          },
          depth: 3.2,
          difference: 0.3,
          color: 2
        }
      ],
      enc: [
        {
          name: 'FR571420',
          updateNumber: 2.1,
          updateDate: new Date('2020-03-08T23:00:00Z')
        },
        {
          name: 'FR470320',
          updateNumber: 2.1,
          updateDate: new Date('2020-03-08T23:00:00Z')
        },
        {
          name: 'FR470330',
          updateNumber: 2.3,
          updateDate: new Date('2019-11-19T23:00:00Z')
        },
        {
          name: 'FR571430',
          updateNumber: 2.5,
          updateDate: new Date('2019-05-06T22:00:00Z')
        }
      ],
      resultFiles: [
        {
          id: '1',
          filename: 'file'
        }
      ]
    }

    //when
    component.ngOnChanges(
      { surveyIds: new SimpleChange(null, [survey.id], true) }
    );

    //then
    expect(component['surveyId']).toEqual(survey.id);
    expect(component['currentSurvey']).toEqual(survey);
    expect(component.display).toBeTrue();
    expect(spySurveyService).toHaveBeenCalled();
    expect(spyComponentFormatSurveyDangerToFeature).toHaveBeenCalled();
    expect(spyComponentLoadSurvey).toHaveBeenCalled();
    expect(component.canDisplayMap).toBeTrue();

    done();
  });

  it('should edit survey test', done => {
    const spyRouter = spyOn(router, 'navigate');
    survey.state = SurveyStateEnum.TEST;

    component.surveyIds = [survey.id];
    component.currentPosition = 0;

    component.ngOnChanges(
      { surveyIds: new SimpleChange(null, [survey.id], true) }
    );
    component.edit();

    expect(spyRouter).toHaveBeenCalledWith([`/survey/notdeposit/edition/${survey.id}`], { state: { status: survey.state } });
    done();
  });

  it('should edit survey deposit', done => {
    const spyRouter = spyOn(router, 'navigate');
    survey.state = SurveyStateEnum.DRAFT;

    component.surveyIds = [survey.id];
    component.currentPosition = 0;

    component.ngOnChanges(
      { surveyIds: new SimpleChange(null, [survey.id], true) }
    );
    component.edit();

    expect(spyRouter).toHaveBeenCalledWith([`/survey/deposit/edition/${survey.id}`], { state: { status: survey.state } });
    done();
  });

  it('should manage survey', done => {
    // Given
    const changes: SimpleChanges = { surveyIds: new SimpleChange(null, [survey.id], true) }
    survey.state = SurveyStateEnum.DRAFT;
    component.surveyIds = [survey.id];
    component.currentPosition = 0;
    survey.surveyExternalAnalysisResults = null;
    survey.canBeReported = false;
    survey.externalAnalysisInProgress = false;
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();
    const spyComponentCheckIfCanEdit = spyOn<any>(SurveyModalComponent, 'checkIfCanEdit').and.callThrough();
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadSurvey = spyOn<any>(component, 'loadSurvey').and.callThrough();
    const spyComponentBuildManagementMenu = spyOn<any>(component, 'buildManagementMenu').and.callThrough();

    // When
    component.ngOnChanges(changes);

    // Then
    expect(component['currentSurvey']).toEqual(survey);
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(spyComponentLoadSurvey).toHaveBeenCalled();
    expect(spyComponentBuildManagementMenu).toHaveBeenCalled();
    expect(spyComponentCheckIfCanEdit).toHaveBeenCalled();
    expect(component['canEdit']).toBe(true);
    expect(component['items'].length).toEqual(2);
    expect(component['items'].map(item => item.label)).toEqual(['detail.edit', 'detail.clone']);
    done();
  });

  it('should have option to report in management button', done => {
    // Given
    const changes: SimpleChanges = { surveyIds: new SimpleChange(null, [survey.id], true) }
    survey.state = SurveyStateEnum.TRANSMITTED;
    component.surveyIds = [survey.id];
    component.currentPosition = 0;
    survey.externalAnalysisInProgress = true;
    survey.canBeReported = true;
    survey.surveyExternalAnalysisResults = {
      globalErrorMessage: null,
      receptionDate: new Date('2023-03-08T23:00:00Z'),
      processingStatus: SurveyProcessingStatusEnum.FINISHED,
      surveyFilesExternalAnalysisResults: [],
      dangers: [
        {
          geometry: {
            type: GeometryType.POLYGON,
            coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]]
          },
          nature: SurveyDangerNature.DEPTH,
          typeOfValue: SurveyDangerTypeOfValue.DEPTH,
          value: 1.1
        }
      ],
      detections: [
        {
          geometry: {
            type: GeometryType.POINT,
            coordinates: [10, 0]
          },
          depth: 3.2,
          difference: 0.3,
          color: 2
        },
        {
          geometry: {
            type: GeometryType.POINT,
            coordinates: [10, 10]
          },
          depth: 3.2,
          difference: 0.3,
          color: 2
        }
      ],
      enc: [
        {
          name: 'FR571420',
          updateNumber: 2.1,
          updateDate: new Date('2020-03-08T23:00:00Z')
        },
        {
          name: 'FR470320',
          updateNumber: 2.1,
          updateDate: new Date('2020-03-08T23:00:00Z')
        },
        {
          name: 'FR470330',
          updateNumber: 2.3,
          updateDate: new Date('2019-11-19T23:00:00Z')
        },
        {
          name: 'FR571430',
          updateNumber: 2.5,
          updateDate: new Date('2019-05-06T22:00:00Z')
        }
      ],
      resultFiles: [
        {
          id: '1',
          filename: 'file'
        }
      ]
    };
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();
    const spyComponentFormatSurveyDangerToFeature = spyOn<any>(component, 'formatSurveyDangerToFeature').and.callThrough();
    const spyComponentCheckIfCanEdit = spyOn<any>(SurveyModalComponent, 'checkIfCanEdit').and.callThrough();
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadSurvey = spyOn<any>(component, 'loadSurvey').and.callThrough();
    const spyComponentBuildManagementMenu = spyOn<any>(component, 'buildManagementMenu').and.callThrough();

    // When
    component.ngOnChanges(changes);

    // Then
    expect(component['currentSurvey']).toEqual(survey);
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(spyComponentFormatSurveyDangerToFeature).toHaveBeenCalled();
    expect(spyComponentLoadSurvey).toHaveBeenCalled();
    expect(spyComponentBuildManagementMenu).toHaveBeenCalled();
    expect(spyComponentCheckIfCanEdit).toHaveBeenCalled();
    expect(component['items'].length).toEqual(1);
    expect(component['items'].map(item => item.label)).toEqual(['detail.clone']);
    done();
  });

  it('should get displayed area label', done => {
    expect(SurveyModalComponent.getDisplayedAreaLabel('fr')).toEqual('name');
    expect(SurveyModalComponent.getDisplayedAreaLabel('en')).toEqual('internationalName');
    done();
  });

  it('should enable confirm clone button status when no info missing', done => {
    component['selectedNameAndLocation'] = 'name and location';
    component['selectedAreaId'] = '1';
    component.cloneInfoChanged();
    expect(component['canConfirmClone']).toBe(true);
    done();
  });

  it('should disable confirm clone button status when nameAndLocation is missing', done => {
    component['selectedAreaId'] = '1';
    component.cloneInfoChanged();
    expect(component['canConfirmClone']).toBe(false);
    done();
  });

  it('should disable confirm clone button status when areaId is missing', done => {
    component['selectedNameAndLocation'] = 'name and location';
    component.cloneInfoChanged();
    expect(component['canConfirmClone']).toBe(false);
    done();
  });

  it('should disable confirm clone button status when nameAndLocation is whitespaces only', done => {
    component['selectedNameAndLocation'] = '      ';
    component['selectedAreaId'] = '1';
    component.cloneInfoChanged();
    expect(component['canConfirmClone']).toBe(false);
    done();
  });

  it('should hide clone panel', done => {
    // Given
    const spyClonePanelHide = spyOn(component.clonePanel, 'hide').and.stub();

    // When
    component.cancelClone();

    // Then
    expect(spyClonePanelHide).toHaveBeenCalled();
    done();
  });

  it('should show clone panel', done => {
    // Given
    const spyClonePanelShow = spyOn(component.clonePanel, 'show').and.stub();
    component.manageButton = new ElementRef({});

    // When
    component.clone(new Event('testEvent'));

    // Then
    expect(component['canConfirmClone']).toBe(false);
    expect(component['selectedNameAndLocation']).toEqual('');
    expect(component['selectedAreaId']).toEqual('');
    expect(spyClonePanelShow).toHaveBeenCalled();
    done();
  });

  it('should download zip archive', done => {
    // Given
    component['currentSurvey'] = survey;
    const headers = new HttpHeaders().set('content-disposition', 'attachment;filename=file.txt');
    const response: HttpResponse<Blob> = new HttpResponse({ headers });
    const spyDownload = spyOn(mockSurveyService, 'downloadSurveyAsZipArchive$').and.returnValue(of(response));
    const spySaveAs = spyOn(FileSaver, 'saveAs').and.callFake(() => null);


    // When
    component.downloadSurveyAsZipArchive();

    // Then
    expect(spySaveAs).toHaveBeenCalled();
    expect(spyDownload).toHaveBeenCalledWith(survey.id);
    done();
  });
});
