import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
import { handleEnterKeyPress } from '@app/shared/ui-utils';
import { convertFeatureToJsonFeature } from '@app/sig/utils/feature';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { TranslateService } from '@ngx-translate/core';
import { pick } from 'lodash-es';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SharedReportFormComponent } from '../shared-report/shared-report-form.component';

@Component({
  selector: 'infosource-report-other-form',
  templateUrl: './report-other-form.component.html',
  styleUrls: ['./report-other-form.component.scss'],
  providers: [infosourceServiceProvider]
})
export class ReportOtherFormComponent extends SharedReportFormComponent implements OnDestroy {
  reportMapAnoForm: UntypedFormGroup;
  createSubscription: Subscription;
  infosSourceOtherReport: InfosourceReportServiceUser = {};
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
        this.infosSourceOtherReport = infosourceReport;
        this.infosourceId = infosourceReport.id;
        this.initForm();
      });
    }

    this.initForm();

    if (this.infosSourceOtherReport && !this.infosSourceOtherReport.localisation) {
      this.infosSourceOtherReport.localisation = [];
    }

    if (this.isNotDraftStatus()) {
      this.reportMapAnoForm.disable();
    }
  }

  initForm(): void {
    this.reportMapAnoForm = this.formBuilder.group({
      attachments: [this.infosSourceOtherReport.attachmentIds],
      localisation: this.infosSourceOtherReport.localisation,
      sharedReportForm: [{
        contributorServiceId: this.infosSourceOtherReport.serviceId ?? this.authService.getAuthenticatedUser()?.serviceId,
        observationDate: this.infosSourceOtherReport?.date ?? null,
        timezone: this.infosSourceReport.timezone ?? GlobalConstants.USER_TIMEZONE,
        anomalyDescription: this.infosSourceOtherReport.description,
        internalComment: this.infosSourceOtherReport.internalComment,
        concernedMaritimeEntityIds: this.infosSourceOtherReport.concernedMaritimeEntityIds
      }]
    });
  }

  getSharedReportFormValue(): any {
    return this.reportMapAnoForm.get('sharedReportForm').value;
  }

  hasAttachmentsIdsChangedValues(event: boolean) {
    this.hasAttachmentsIdsBeenChanged = event;
  }

  saveForm(): boolean {
    if (!this.reportMapAnoForm.valid || !this.sharedReport.isFormSaveable()) {
      return false;
    }

    this.infosSourceOtherReport = {
      id: this.infosSourceOtherReport?.id,
      date: convertDateToISOString(this.getSharedReportFormValue().observationDate),
      localisation: convertFeatureToJsonFeature(this.sharedReport.getGeometries()),
      description: this.getSharedReportFormValue().anomalyDescription,
      attachmentIds: this.hasAttachmentsIdsBeenChanged ? this.sharedReport.getAttachmentsIds() : this.infosSourceOtherReport.attachmentIds,
      attachmentFiles: this.infosSourceOtherReport.attachmentFiles,
      serviceId: this.getSharedReportFormValue().contributorServiceId ?? this.authService.getAuthenticatedUser()?.serviceId,
      timezone: this.getSharedReportFormValue().timezone,
      internalComment: this.getSharedReportFormValue().internalComment,
      concernedMaritimeEntityIds: this.getSharedReportFormValue().concernedMaritimeEntityIds
    };

    return true;
  }

  validate(): void {
    if (this.saveForm()) {
      this.isCreationMode() ? this.createInfosourcesAnomaly() : this.updateInfosourcesAnomaly();
    }
    this.submitted = true;
  }

  getInformationsRequired(): InfosourceReportServiceUser {
    return pick(this.infosSourceOtherReport, [
      'id',
      'date',
      'localisation',
      'type',
      'objectName',
      'description',
      'attachmentIds',
      'serviceId',
      'timezone',
      'internalComment',
      'concernedMaritimeEntityIds'
    ]);
  }

  createInfosourcesAnomaly(): void {
    const infosSourceOtherReport = this.getInformationsRequired();
    this.createSubscription = this.abstractInfosourceService.createInfosourceOtherReport(infosSourceOtherReport)
      .subscribe(id => {
        this.infosSourceOtherReport.id = id;
        this.infosourceId = id;
        if (this.sharedReport.canShowSendPanel) {
          this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
        }
        if (this.sharedReport.changedValue) {
          this.sharedReport.linkTagsToInfosource(this.infosourceId);
        }
        this.showToast('message.success.api.create-other-report.created', 'success');
      },
        err => this.handleSaveError(err, 'create', 'other-report')
      );
  }

  updateInfosourcesAnomaly(): void {
    const infosSourceOtherReport = this.getInformationsRequired();
    this.updateSubscription = this.abstractInfosourceService.updateInfosourceOtherReport(this.infosSourceOtherReport.id, infosSourceOtherReport)
      .subscribe(
        () => {
          if (this.sharedReport.canShowSendPanel) {
            this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
          }
          if (this.sharedReport.changedValue) {
            this.sharedReport.linkTagsToInfosource(this.infosourceId);
          }
          this.showToast('message.success.api.update-other-report.updated', 'success');
        },
        err => this.handleSaveError(err, 'update', 'other-report')
      );
  }

  ngOnDestroy(): void {
    if (this.createSubscription) { this.createSubscription.unsubscribe(); }
    if (this.updateSubscription) { this.updateSubscription.unsubscribe(); }
    if (this.getSubscription) { this.getSubscription.unsubscribe(); }
  }

  isCreationMode(): boolean {
    return !this.infosSourceOtherReport.id;
  }
}
