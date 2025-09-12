import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { AlertMessageService } from '@app/core/alert-message.service';
import { SurveyActivity, SurveyBroadcastRestriction, SurveyCoordinatesOrder, SurveyDepositEdition, SurveyFileComplianceAnalysisState, SurveyIssuerType, SurveyTransmissionStatus, SurveyVerticalRef, SurveyZDirection } from '@app/survey/models/survey.model';
import { SurveyCompliantStatusTxtPipe } from '@app/survey/pipes/survey-compliant-status-txt.pipe';
import { SurveyCompliantStatusPipe } from '@app/survey/pipes/survey-compliant-status.pipe';
import { AbstractSurveyService } from '@app/survey/services/survey.service';
import { MockProvider } from 'ng-mocks';
import { SurveyDepositComponent } from './survey-deposit.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SurveyDepositComponent', () => {
  let component: SurveyDepositComponent;
  let fixture: ComponentFixture<SurveyDepositComponent>;
  let alertMessageService: AlertMessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        SurveyDepositComponent,
        SurveyCompliantStatusPipe,
        SurveyCompliantStatusTxtPipe
    ],
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        ConfirmationService,
        UntypedFormBuilder,
        TranslateService,
        {
            provide: ActivatedRoute,
            useValue: {
                paramMap: of(new Map(Object.entries({ id: 123 })))
            }
        },
        MockProvider(AbstractSurveyService, {
            deleteDeposit$(id: string): Observable<void> {
                return of();
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    alertMessageService = TestBed.inject(AlertMessageService);
    fixture = TestBed.createComponent(SurveyDepositComponent);
    component = fixture.componentInstance;
    const initSurvey: SurveyDepositEdition = {
      id: '1',
      nameAndLocation: 'nameAndLocation',
      areaId: 'areaId',
      goal: 'goal',
      surveyIssuerTypes: [SurveyIssuerType.OWNER],
      geographicFormat: true,
      epsg: 'epsg',
      coordinatesOrder: SurveyCoordinatesOrder.LAT_LONG_Z,
      directionZ: SurveyZDirection.ALTITUDE,
      verticalRef: SurveyVerticalRef.INSTANT_SEA_LEVEL,
      fileSeparator: '#',
      externalAnalysisEnabled: true,
      broadcastRestriction: SurveyBroadcastRestriction.WITHOUT_BROADCAST_RESTRICTION,
      activityChoice:  SurveyActivity.EXCAVATION_GEOPHYSICAL,
      ownerOrganization: 'ownerOrganization',
      producerOrganization: 'producerOrganization',
      ownerEmail: 'ownerEmail',
      technicalManagerEmail: 'technicalManagerEmail',
      bathyAttachmentIds: [],
      bathyAttachmentFiles: [],
      miscAttachmentIds: [],
      miscAttachmentFiles: [],
      technicalMetadataId: 'technicalMetadataId',
      technicalMetadataFile: null,
      achievementPeriod: {
        dateStart: '12/04/2023',
        dateEnd: '13/04/2023'
      },
      compliant: SurveyFileComplianceAnalysisState.NOT_AVAILABLE,
      transmissionStatus: SurveyTransmissionStatus.NOT_AVAILABLE,
      serviceId: 'issuingServiceId'
    };
    component['survey'] = initSurvey;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should call initForm on init', done => {
    spyOn((component as any), 'initForm');
    component.ngOnInit();
    expect((component as any).initForm).toHaveBeenCalled();
    done();
  });

  it('should init form', done => {
    (component as any).initForm();
    expect((component as any).surveyForm).toBeTruthy();
    expect(component.surveyDescription.value).toEqual({
      nameAndLocation: 'nameAndLocation',
      areaId: 'areaId',
      achievementPeriod: {
        dateStart: '12/04/2023',
        dateEnd: '13/04/2023'
      },
      serviceId: 'issuingServiceId'
    });
    expect(component.surveyBathyData.value).toEqual({
      geographicFormat: true,
      epsg: 'epsg',
      coordinatesOrder: SurveyCoordinatesOrder.LAT_LONG_Z,
      directionZ: SurveyZDirection.ALTITUDE,
      verticalRef: SurveyVerticalRef.INSTANT_SEA_LEVEL,
      fileSeparator: '#'
    });
    expect(component.goal.value).toEqual('goal');
    expect(component.surveyIssuerTypes.value).toEqual([SurveyIssuerType.OWNER]);
    expect(component.ownerOrganization.value).toEqual('ownerOrganization');
    expect(component.producerOrganization.value).toEqual('producerOrganization');
    expect(component.ownerEmail.value).toEqual('ownerEmail');
    expect(component.technicalManagerEmail.value).toEqual('technicalManagerEmail');
    done();
  });

  it('should delete survey deposit', done => {
    spyOn(component['surveyService'], 'deleteDeposit$').and.callThrough();
    component.delete();
    expect(component['surveyService'].deleteDeposit$).toHaveBeenCalledWith(component['survey'].id);
    done();
  });

  it('should not be able to transmit if no achievement period', done => {
    // Given
    component['survey'].achievementPeriod = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.achievement-period-missing-or-invalid',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no survey issuer type', done => {
    // Given
    component['survey'].surveyIssuerTypes = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.issuer-types-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no producer organization', done => {
    // Given
    component['survey'].producerOrganization = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.producer-organization-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no owner organization', done => {
    // Given
    component['survey'].producerOrganization = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.producer-organization-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no goal', done => {
    // Given
    component['survey'].goal = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.goal-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no activity choice nor broadcast restriction', done => {
    // Given
    component['survey'].activityChoice = null;
    component['survey'].broadcastRestriction = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.activity-broadcast-restriction-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no epsg', done => {
    // Given
    component['survey'].epsg = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.epsg-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no coordinates order', done => {
    // Given
    component['survey'].coordinatesOrder = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.coordinates-order-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no z-direction', done => {
    // Given
    component['survey'].directionZ = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.z-direction-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no vertical ref', done => {
    // Given
    component['survey'].verticalRef = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.vertical-ref-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no file separator', done => {
    // Given
    component['survey'].fileSeparator = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.file-separator-missing',
      life: 10000
    });
    done();
  });

  it('should not be able to transmit if no technical metadata file', done => {
    // Given
    component['survey'].technicalMetadataId = null;
    fixture.detectChanges();
    const spyAlertMessageService = spyOn(alertMessageService, 'add').and.callThrough();

    // When
    const result = component.checkTransmitRequirements();

    // Then
    expect(result).toEqual(false);
    expect(spyAlertMessageService).toHaveBeenCalledWith({
      summary: 'message.summary.error',
      severity: 'error',
      detail: 'message.error.api.cannot-update-survey-deposit : survey.form.errors.technical-metadata-file-missing',
      life: 10000
    });
    done();
  });
});
