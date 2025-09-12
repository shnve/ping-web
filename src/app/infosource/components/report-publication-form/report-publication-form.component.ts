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
import { convertDateToISOString, formatDate, formatFrenchDateToIsoDate } from '@app/shared/date-utils';
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
  selector: 'infosource-report-publication-form',
  templateUrl: './report-publication-form.component.html',
  styleUrls: ['./report-publication-form.component.scss'],
  providers: [infosourceServiceProvider]
})
export class ReportPublicationFormComponent extends SharedReportFormComponent implements OnDestroy {
  publicationReportForm: UntypedFormGroup;
  createSubscription: Subscription;
  infosSourcePublicationAnomalyReport: InfosourceReportServiceUser = {};
  @ViewChild('sharedReport') sharedReport: SharedReportFormComponent;
  getSubscription: Subscription;
  updateSubscription: Subscription;
  hasAttachmentsIdsBeenChanged: boolean;

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
        this.infosSourcePublicationAnomalyReport = infosourceReport;
        this.infosourceId = infosourceReport.id;
        this.initForm();
      });
    }

    this.initForm();

    if (this.infosSourcePublicationAnomalyReport && !this.infosSourcePublicationAnomalyReport.localisation) {
      this.infosSourcePublicationAnomalyReport.localisation = [];
    }

    if (this.isNotDraftStatus()) {
      this.publicationReportForm.disable();
    }
  }


  initForm(): void {
    this.publicationReportForm = this.formBuilder.group({
      issueReference: [this.infosSourcePublicationAnomalyReport.issueReference, [Validators.required, noWhitespaceValidator]],
      upToDateAt: this.infosSourcePublicationAnomalyReport.upToDateAt ? formatDate(this.infosSourcePublicationAnomalyReport.upToDateAt) : null,
      chapterOrPage: [this.infosSourcePublicationAnomalyReport.chapterOrPage, noWhitespaceValidator],
      localisation: this.infosSourcePublicationAnomalyReport.localisation,
      attachments: [this.infosSourcePublicationAnomalyReport.attachmentIds],
      sharedReportForm: [{
        contributorServiceId: this.infosSourcePublicationAnomalyReport.serviceId ?? this.authService.getAuthenticatedUser()?.serviceId,
        observationDate: this.infosSourcePublicationAnomalyReport?.date ?? null,
        timezone: this.infosSourceReport.timezone ?? GlobalConstants.USER_TIMEZONE,
        anomalyDescription: this.infosSourcePublicationAnomalyReport.description,
        internalComment: this.infosSourcePublicationAnomalyReport.internalComment,
        concernedMaritimeEntityIds: this.infosSourcePublicationAnomalyReport.concernedMaritimeEntityIds
      }]
    });
  }

  getSharedReportFormValue(): any {
    return this.publicationReportForm.get('sharedReportForm').value;
  }

  saveForm(): boolean {
    if (!this.publicationReportForm.valid || !this.sharedReport.isFormSaveable()) {
      return false;
    }

    this.infosSourcePublicationAnomalyReport = {
      id: this.infosSourcePublicationAnomalyReport?.id,
      date: convertDateToISOString(this.getSharedReportFormValue().observationDate),
      localisation: convertFeatureToJsonFeature(this.sharedReport.getGeometries()),
      description: this.getSharedReportFormValue().anomalyDescription,
      attachmentIds: this.hasAttachmentsIdsBeenChanged ? this.sharedReport.getAttachmentsIds() : this.infosSourcePublicationAnomalyReport.attachmentIds,
      attachmentFiles: this.infosSourcePublicationAnomalyReport.attachmentFiles,
      serviceId: this.getSharedReportFormValue().contributorServiceId ?? this.authService.getAuthenticatedUser()?.serviceId,
      timezone: this.getSharedReportFormValue().timezone,
      internalComment: this.getSharedReportFormValue().internalComment,
      issueReference: this.issueReference.value,
      upToDateAt: this.upToDateAt.value ? formatFrenchDateToIsoDate(this.upToDateAt.value) : '',
      chapterOrPage: this.chapterOrPage.value,
      concernedMaritimeEntityIds: this.getSharedReportFormValue().concernedMaritimeEntityIds
    };

    return true;
  }

  get issueReference(): AbstractControl {
    return this.publicationReportForm.get('issueReference');
  }

  get upToDateAt(): AbstractControl {
    return this.publicationReportForm.get('upToDateAt');
  }

  get chapterOrPage(): AbstractControl {
    return this.publicationReportForm.get('chapterOrPage');
  }

  validate(): void {
    if (this.saveForm()) {
      this.isCreationMode() ? this.createInfosourcesAnomaly() : this.updateInfosourcesAnomaly();
    }
    this.submitted = true;
  }

  hasAttachmentsIdsChangedValues(event: boolean) {
    this.hasAttachmentsIdsBeenChanged = event;
  }

  parseDate(date: string): Date {
    const newDate = new Date(date);
    let offset = newDate.getTimezoneOffset(); // returns offset from GMT in minutes
    offset *= 60000;
    return new Date(newDate.valueOf() + offset);
  }

  getInformationsRequired(): InfosourceReportServiceUser {
    return pick(this.infosSourcePublicationAnomalyReport, [
      'id',
      'date',
      'localisation',
      'description',
      'attachmentIds',
      'serviceId',
      'timezone',
      'internalComment',
      'issueReference',
      'upToDateAt',
      'chapterOrPage',
      'concernedMaritimeEntityIds'
    ]);
  }

  createInfosourcesAnomaly(): void {
    const infosSourcePublicationAnomalyReport = this.getInformationsRequired();
    this.createSubscription = this.abstractInfosourceService.createInfosourcePublicationReport(infosSourcePublicationAnomalyReport)
      .subscribe(id => {
        this.showToast('message.success.api.create-publication-report.created', 'success');
        this.infosSourcePublicationAnomalyReport.id = id;
        this.infosourceId = id;
        if (this.sharedReport.canShowSendPanel) {
          this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
        }
        if (this.sharedReport.changedValue) {
          this.sharedReport.linkTagsToInfosource(this.infosourceId);
        }
      },
        err => this.handleSaveError(err, 'create', 'publication-report')
      );
  }

  updateInfosourcesAnomaly(): void {
    const infosSourcePublicationAnomalyReport = this.getInformationsRequired();
    this.updateSubscription = this.abstractInfosourceService
      .updateInfosourcePublicationReport(this.infosSourcePublicationAnomalyReport.id, infosSourcePublicationAnomalyReport)
      .subscribe(
        () => {
          if (this.sharedReport.canShowSendPanel) {
            this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
          }
          if (this.sharedReport.changedValue) {
            this.sharedReport.linkTagsToInfosource(this.infosourceId);
          }
          this.showToast('message.success.api.update-publication-report.updated', 'success');
        },
        err => this.handleSaveError(err, 'update', 'publication-report')
      );
  }

  ngOnDestroy(): void {
    if (this.createSubscription) { this.createSubscription.unsubscribe(); }
    if (this.updateSubscription) { this.updateSubscription.unsubscribe(); }
    if (this.getSubscription) { this.getSubscription.unsubscribe(); }
  }

  isCreationMode(): boolean {
    return !this.infosSourcePublicationAnomalyReport.id;
  }
}
