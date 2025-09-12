import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceTagsApi } from '@app/api/admin/service-tags-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { InfosourceReportServiceUser } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { dateValidated, formatPeriodForCreation, formatPeriodForEdition } from '@app/shared/date-utils';
import { handleEnterKeyPress, noWhitespaceValidator } from '@app/shared/ui-utils';
import { convertFeatureToJsonFeature } from '@app/sig/utils/feature';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { TranslateService } from '@ngx-translate/core';
import { pick } from 'lodash-es';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ConfirmationService } from 'primeng/api';
import { Subscription, throwError } from 'rxjs';
import { SharedReportFormComponent } from '../shared-report/shared-report-form.component';

@Component({
  selector: 'infosource-report-bathy-danger-form',
  templateUrl: './report-bathy-danger.component.html',
  styleUrls: ['../shared-report/shared-report-form.component.scss'],
  providers: [infosourceServiceProvider]
})
export class ReportBathyDangerComponent extends SharedReportFormComponent implements OnDestroy {
  @ViewChild('sharedReport') sharedReport: SharedReportFormComponent;
  protected reportBathyDangerForm: UntypedFormGroup;
  protected infosourceDangerReport: InfosourceReportServiceUser = {};
  private reportSubscription: Subscription;
  private updateSubscription: Subscription;

  enterKeyEvent = handleEnterKeyPress;

  protected invalidDate = true;

  constructor(protected readonly formBuilder: UntypedFormBuilder,
    protected readonly authService: AuthService,
    protected readonly usersApi: UsersApi,
    protected readonly cdRef: ChangeDetectorRef,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly abstractInfosourceService: AbstractInfosourceService,
    protected readonly router: Router,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly translate: TranslateService,
    protected readonly confirmationService: ConfirmationService,
    protected readonly serviceTagsApi: ServiceTagsApi,
    protected readonly maritimeServicesApi: MaritimeServicesApi,
    protected readonly disclaimerService: DisclaimerService,
    protected readonly deviceDetectorService: DeviceDetectorService
  ) {
    super(formBuilder, authService, usersApi, cdRef, alertMessageService, abstractInfosourceService, router,
      activatedRoute, translate, confirmationService, serviceTagsApi, maritimeServicesApi, disclaimerService, deviceDetectorService);
    if (this.activatedRoute.snapshot?.params?.id) {
      this.reportSubscription = this.infosourceReport$.subscribe(infosourceReport => {
        this.infosourceDangerReport = infosourceReport;
        this.infosourceDangerReport.surveyPeriod = formatPeriodForEdition(this.infosourceDangerReport.surveyPeriod);
        this.infosourceId = infosourceReport.id;
        this.initForm();
      });
    }

    this.initForm();

    if (this.infosourceDangerReport && !this.infosourceDangerReport.localisation) {
      this.infosourceDangerReport.localisation = [];
    }

    if (this.isNotDraftStatus()) {
      this.reportBathyDangerForm.disable();
    }
  }

  initForm(): void {
    this.reportBathyDangerForm = this.formBuilder.group({
      localisation: this.infosourceDangerReport.localisation,
      surveyPeriod: [this.infosourceDangerReport.surveyPeriod, Validators.required],
      confidentialityInformation: [this.infosourceDangerReport.confidentialityInformation, noWhitespaceValidator],
      sharedReportForm: [{
        contributorServiceId: this.infosourceDangerReport.serviceId ?? this.authService.getAuthenticatedUser()?.serviceId,
        concernedMaritimeEntityIds: this.infosourceDangerReport.concernedMaritimeEntityIds,
        anomalyDescription: this.infosourceDangerReport.description,
        internalComment: this.infosourceDangerReport.internalComment
      }]
    });
  }

  getSharedReportForm(): AbstractControl {
    return this.reportBathyDangerForm.get('sharedReportForm');
  }

  get confidentialityInformation(): AbstractControl {
    return this.reportBathyDangerForm.get('confidentialityInformation');
  }

  saveForm(): boolean {
    if (!this.reportBathyDangerForm.valid || !this.sharedReport.isFormSaveable() || this.invalidDate) {
      return false;
    }

    this.infosourceDangerReport = {
      id: this.infosourceDangerReport.id,
      surveyPeriod: formatPeriodForCreation(this.surveyPeriod.value),
      localisation: convertFeatureToJsonFeature(this.sharedReport.getGeometries(), true),
      attachmentIds: this.hasAttachmentsIdsBeenChanged ? this.sharedReport.getAttachmentsIds() : this.infosourceDangerReport.attachmentIds,
      attachmentFiles: this.infosourceDangerReport.attachmentFiles,
      serviceId: this.getSharedReportForm().value.contributorServiceId ?? this.authService.getAuthenticatedUser()?.serviceId,
      internalComment: this.getSharedReportForm().value.internalComment,
      description: this.getSharedReportForm().value.anomalyDescription,
      confidentialityInformation: this.confidentialityInformation.value,
      concernedMaritimeEntityIds: this.getSharedReportForm().value.concernedMaritimeEntityIds
    };

    return true;
  }

  getInformationsRequired(): InfosourceReportServiceUser {
    return pick(this.infosourceDangerReport, [
      'id',
      'surveyPeriod',
      'localisation',
      'serviceId',
      'internalComment',
      'confidentialityInformation',
      'description',
      'attachmentIds',
      'concernedMaritimeEntityIds'
    ]);
  }

  validate(): void {
    if (this.saveForm()) {
      this.updateInfosourceBathy();
    }
    this.submitted = true;
  }

  updateInfosourceBathy(): void {
    const infosourceDangerReport = this.getInformationsRequired();
    this.updateSubscription = this.abstractInfosourceService.updateInfosourceBathyReport(infosourceDangerReport)
      .subscribe(
        () => {
          if (this.sharedReport.canShowSendPanel) {
            this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
          }
          if (this.sharedReport.changedValue) {
            this.sharedReport.linkTagsToInfosource(this.infosourceId);
          }
          this.showToast('message.success.api.update-bathy-report.updated', 'success');
        },
        err => {
          this.showToast('message.error.api.cannot-update-bathy-report');
          return throwError(err);
        }
      );
  }

  get surveyPeriod(): AbstractControl {
    return this.reportBathyDangerForm?.get('surveyPeriod');
  }

  protected dateValidated(validDate: boolean): void {
    this.invalidDate = dateValidated(validDate, this.surveyPeriod.value, true);
  }

  ngOnDestroy(): void {
    if (this.reportSubscription) { this.reportSubscription.unsubscribe(); }
    if (this.updateSubscription) { this.updateSubscription.unsubscribe(); }
  }

}
