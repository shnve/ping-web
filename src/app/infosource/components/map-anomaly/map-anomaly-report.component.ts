import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceTagsApi } from '@app/api/admin/service-tags-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { GlobalConstants } from '@app/global-constants';
import { InfosourceReportServiceUser } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { convertDateToISOString } from '@app/shared/date-utils';
import { handleEnterKeyPress, noWhitespaceValidator } from '@app/shared/ui-utils';
import { convertFeatureToJsonFeature } from '@app/sig/utils/feature';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { TranslateService } from '@ngx-translate/core';
import { pick } from 'lodash-es';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SharedReportFormComponent } from '../shared-report/shared-report-form.component';

@Component({
  selector: 'infosource-map-anomaly-report',
  templateUrl: './map-anomaly-report.component.html',
  styleUrls: ['./map-anomaly-report.component.scss'],
  providers: [infosourceServiceProvider]

})
export class MapAnomalyReportComponent extends SharedReportFormComponent implements OnDestroy {
  mapAnomalyReportForm: UntypedFormGroup;
  createSubscription: Subscription;
  infosSourceMapAnomalyReport: InfosourceReportServiceUser = {};
  @ViewChild('sharedReport') sharedReport: SharedReportFormComponent;
  getSubscription: Subscription;
  updateSubscription: Subscription;

  enterKeyEvent = handleEnterKeyPress;

  constructor(protected readonly formBuilder: UntypedFormBuilder,
    protected readonly authService: AuthService,
    protected readonly usersApi: UsersApi,
    protected readonly cdRef: ChangeDetectorRef,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly abstractInfosourceService: AbstractInfosourceService,
    protected readonly router: Router,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly translateService: TranslateService,
    protected readonly confirmationService: ConfirmationService,
    protected readonly serviceTagsApi: ServiceTagsApi,
    protected readonly maritimeServicesApi: MaritimeServicesApi,
    protected readonly disclaimerService: DisclaimerService,
    protected readonly deviceDetectorService: DeviceDetectorService
  ) {
    super(formBuilder, authService, usersApi, cdRef, alertMessageService, abstractInfosourceService, router,
      activatedRoute, translateService, confirmationService, serviceTagsApi, maritimeServicesApi, disclaimerService, deviceDetectorService);

    if (this.activatedRoute.snapshot?.params?.id) {
      this.getSubscription = this.infosourceReport$.subscribe(infosourceReport => {
        this.infosSourceMapAnomalyReport = infosourceReport;
        this.infosourceId = infosourceReport.id;
        this.initForm();
      });
    }

    this.initForm();

    if (this.infosSourceMapAnomalyReport && !this.infosSourceMapAnomalyReport.localisation) {
      this.infosSourceMapAnomalyReport.localisation = [];
    }

    if (this.isNotDraftStatus()) {
      this.mapAnomalyReportForm.disable();
    }
  }

  initForm(): void {
    this.mapAnomalyReportForm = this.formBuilder.group({
      mapNumber: [this.infosSourceMapAnomalyReport.mapNumber, [Validators.required, noWhitespaceValidator]],
      editionNumber: [this.infosSourceMapAnomalyReport.editionNumber, noWhitespaceValidator],
      lastPatchNumber: [this.infosSourceMapAnomalyReport.lastPatchNumber, noWhitespaceValidator],
      attachments: [this.infosSourceMapAnomalyReport.attachmentIds],
      localisation: this.infosSourceMapAnomalyReport.localisation,
      sharedReportForm: [{
        contributorServiceId: this.infosSourceMapAnomalyReport.serviceId ?? this.authService.getAuthenticatedUser()?.serviceId,
        observationDate: this.infosSourceMapAnomalyReport?.date ?? null,
        timezone: this.infosSourceReport.timezone ?? GlobalConstants.USER_TIMEZONE,
        anomalyDescription: this.infosSourceMapAnomalyReport.description,
        internalComment: this.infosSourceMapAnomalyReport.internalComment,
        concernedMaritimeEntityIds: this.infosSourceMapAnomalyReport.concernedMaritimeEntityIds
      }]
    });
  }

  getSharedReportFormValue(): any {
    return this.mapAnomalyReportForm.get('sharedReportForm').value;
  }

  hasAttachmentsIdsChangedValues(event: boolean) {
    this.hasAttachmentsIdsBeenChanged = event;
  }

  saveForm(): boolean {
    if (!this.mapAnomalyReportForm.valid || !this.sharedReport.isFormSaveable()) {
      return false;
    }

    this.infosSourceMapAnomalyReport = {
      id: this.infosSourceMapAnomalyReport?.id,
      date: convertDateToISOString(this.getSharedReportFormValue().observationDate),
      localisation: convertFeatureToJsonFeature(this.sharedReport.getGeometries()),
      description: this.getSharedReportFormValue().anomalyDescription,
      attachmentIds: this.hasAttachmentsIdsBeenChanged ? this.sharedReport.getAttachmentsIds() : this.infosSourceMapAnomalyReport.attachmentIds,
      attachmentFiles: this.infosSourceMapAnomalyReport.attachmentFiles,
      serviceId: this.getSharedReportFormValue().contributorServiceId ?? this.authService.getAuthenticatedUser()?.serviceId,
      timezone: this.getSharedReportFormValue().timezone,
      internalComment: this.getSharedReportFormValue().internalComment,
      mapNumber: this.mapNumber.value,
      editionNumber: this.editionNumber.value,
      lastPatchNumber: this.lastPatchNumber.value,
      concernedMaritimeEntityIds: this.getSharedReportFormValue().concernedMaritimeEntityIds
    };

    return true;
  }

  get mapNumber(): AbstractControl {
    return this.mapAnomalyReportForm.get('mapNumber');
  }

  get editionNumber(): AbstractControl {
    return this.mapAnomalyReportForm.get('editionNumber');
  }

  get lastPatchNumber(): AbstractControl {
    return this.mapAnomalyReportForm.get('lastPatchNumber');
  }

  validate(): void {
    if (this.saveForm()) {
      this.isCreationMode() ? this.createInfosourcesAnomaly() : this.updateInfosourcesAnomaly();
    }
    this.submitted = true;
  }

  getInformationsRequired(): InfosourceReportServiceUser {
    return pick(this.infosSourceMapAnomalyReport, [
      'id',
      'date',
      'localisation',
      'description',
      'attachmentIds',
      'serviceId',
      'timezone',
      'internalComment',
      'mapNumber',
      'editionNumber',
      'lastPatchNumber',
      'concernedMaritimeEntityIds'
    ]);
  }

  createInfosourcesAnomaly(): void {
    const infosSourceMapAnomalyReport = this.getInformationsRequired();
    this.createSubscription = this.abstractInfosourceService.createInfosourceMapAnomalyReport(infosSourceMapAnomalyReport)
      .subscribe(id => {
        this.infosSourceMapAnomalyReport.id = id;
        this.infosourceId = id;
        if (this.sharedReport.canShowSendPanel) {
          this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
        }
        if (this.sharedReport.changedValue) {
          this.sharedReport.linkTagsToInfosource(this.infosourceId);
        }
        this.showToast('message.success.api.create-map-anomaly-report.created', 'success');
      }, err => this.handleSaveError(err, 'create', 'map-anomaly-report'));
  }

  updateInfosourcesAnomaly(): void {
    const infosSourceMapAnomalyReport = this.getInformationsRequired();
    this.updateSubscription = this.abstractInfosourceService
      .updateInfosourceMapAnomalyReport(this.infosSourceMapAnomalyReport.id, infosSourceMapAnomalyReport)
      .subscribe(
        () => {
          if (this.sharedReport.canShowSendPanel) {
            this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
          }
          if (this.sharedReport.changedValue) {
            this.sharedReport.linkTagsToInfosource(this.infosourceId);
          }
          this.showToast('message.success.api.update-map-anomaly-report.updated', 'success');
        },
        err => this.handleSaveError(err, 'update', 'map-anomaly-report')
      );
  }

  ngOnDestroy(): void {
    if (this.createSubscription) { this.createSubscription.unsubscribe(); }
    if (this.updateSubscription) { this.updateSubscription.unsubscribe(); }
    if (this.getSubscription) { this.getSubscription.unsubscribe(); }
  }

  isCreationMode(): boolean {
    return !this.infosSourceMapAnomalyReport.id;
  }
}
