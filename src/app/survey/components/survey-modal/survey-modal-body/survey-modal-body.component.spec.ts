import { DownloadService } from '@admin-warning/services/download.service';
import { HttpHeaders, HttpResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InfosourceStatus } from '@app/infosource/models/infosource.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { GeometryType } from '@app/sig/utils/geometry';
import { SurveyApi } from '@app/survey/api/survey.api';
import { AttachmentSurveyResult, SurveyActivity, SurveyBroadcastRestriction, SurveyCoordinatesOrder, SurveyDangerNature, SurveyDangerTypeOfValue, SurveyDetails, SurveyIssuerType, SurveyProcessingStatusEnum, SurveyStateEnum, SurveyVerticalRef, SurveyZDirection } from '@app/survey/models/survey.model';
import { AbstractSurveyService } from '@app/survey/services/survey.service';
import { TranslateModule } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { MockProvider } from 'ng-mocks';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { SurveyModalBodyComponent } from './survey-modal-body.component';

describe('SurveyModalBodyComponent', () => {
  let component: SurveyModalBodyComponent;
  let fixture: ComponentFixture<SurveyModalBodyComponent>;
  let downloadService: jasmine.SpyObj<DownloadService>;
  let mockSurveyService: AbstractSurveyService;
  let router: Router;
  let survey: SurveyDetails = {
    id: '1',
    lastUpdate: new Date(2023, 2, 2),
    state: SurveyStateEnum.TRANSMITTED,
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
    externalAnalysisInProgress: false,
    canBeReported: false,
    surveyExternalAnalysisResults: {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        SurveyModalBodyComponent,
        CapitalizeFirstPipe,
        LocalizedDatePipe,
    ],
    imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
    providers: [
        PermissionsProvider,
        ConfirmationService,
        MockProvider(AbstractSurveyService, {
            report$(id: string): Observable<string> {
                return of('1b60a992-c6c5-4559-998b-05189caf523a');
            }
        }),
        MockProvider(SurveyApi, {
            report$(id: string): Observable<string> {
                return of('1b60a992-c6c5-4559-998b-05189caf523a');
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
    downloadService = TestBed.inject(DownloadService) as jasmine.SpyObj<DownloadService>;
  });

  beforeEach(() => {
    mockSurveyService = TestBed.inject(AbstractSurveyService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SurveyModalBodyComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should download survey attachment', done => {
    // Given
    const event = jasmine.createSpyObj<Event>('Event', ['preventDefault', 'stopPropagation']);
    const attachment = { id: '123', name: 'test-file.pdf', identifier: 'test', filename: 'TEST', totalSize: 1000, type: 'application/pdf' };
    const spyDownloadService = spyOn(downloadService, 'download').and.returnValue(of(new HttpResponse({ body: new Blob(['test'], { type: 'application/pdf' }), headers: new HttpHeaders({ 'filename': 'test-file.pdf' }) })));

    // When
    component['open'](event, attachment);

    // Expect
    expect(spyDownloadService).toHaveBeenCalledWith('123');
    done();
  });

  it('should can display data processed', done => {
    // Given
    const changes: SimpleChanges = { survey: new SimpleChange(null, survey, true) };
    component.survey = survey;

    // When
    component.ngOnChanges(changes);

    // Then
    expect(component['canShowDataProcessed']).toBe(true);
    done();
  });

  it('should open attachment of type AttachmentSurveyResult', done => {
    // Given
    const event: Event = new Event('click');
    const attachmentDownload: AttachmentSurveyResult = {
      id: '1',
      resultFileName: 'resultFile.zip',
      analyzedFileName: 'file.csv'
    };
    const headers = new HttpHeaders().set('filename', 'resultFile.zip');
    const response: HttpResponse<Blob> = new HttpResponse({ headers });
    const spyDownloadService = spyOn(downloadService, 'download').and.returnValue(of(response));
    const spySaveAs = spyOn(FileSaver, 'saveAs').and.callFake(() => null);

    // When
    component['open'](event, attachmentDownload);

    // Then
    expect(spySaveAs).toHaveBeenCalled();
    expect(spyDownloadService).toHaveBeenCalledWith(attachmentDownload.id);
    done();
  });

  it('should report and go to IS bathy form update page', done => {
    // Given
    const changes: SimpleChanges = { survey: new SimpleChange(null, survey, true) };
    component.survey = survey;

    // When
    component.ngOnChanges(changes);
    const spySurveyServiceReport = spyOn(mockSurveyService, 'report$').and.returnValues(of('1b60a992-c6c5-4559-998b-05189caf523a'));
    const spyRouterNavigate = spyOn(router, 'navigate');

    // When
    component['report']();

    // Expect
    expect(spySurveyServiceReport).toHaveBeenCalled();
    expect(spyRouterNavigate).toHaveBeenCalledWith(['/infosource/report-bathy-danger/1b60a992-c6c5-4559-998b-05189caf523a'], { state: { status: InfosourceStatus.DRAFT } });
    done();
  });
});
