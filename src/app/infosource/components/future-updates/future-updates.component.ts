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
  selector: 'infosource-future-updates',
  templateUrl: './future-updates.component.html',
  styleUrls: ['./future-updates.component.scss'],
  providers: [infosourceServiceProvider]
})
export class FutureUpdatesComponent extends SharedReportFormComponent implements OnDestroy {
  reportFutureUpdatesForm: UntypedFormGroup;
  createSubscription: Subscription;
  infosourceFutureUpdates: InfosourceReportServiceUser = {};
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
        this.infosourceFutureUpdates = infosourceReport;
        this.infosourceId = infosourceReport.id;
        this.initForm();
      });
    }

    this.initForm();

    if (this.infosourceFutureUpdates && !this.infosourceFutureUpdates.localisation) {
      this.infosourceFutureUpdates.localisation = [];
    }

    if (this.isNotDraftStatus()) {
      this.reportFutureUpdatesForm.disable();
    }
  }

  initForm(): void {
    this.reportFutureUpdatesForm = this.formBuilder.group({
      attachments: [this.infosourceFutureUpdates.attachmentIds],
      localisation: this.infosourceFutureUpdates.localisation,
      objectFutureInfo: [this.infosourceFutureUpdates.objectFutureInfo, [Validators.required, noWhitespaceValidator]],
      sharedReportForm: [{
        contributorServiceId: this.infosourceFutureUpdates.serviceId ?? this.authService.getAuthenticatedUser()?.serviceId,
        observationDate: this.infosourceFutureUpdates?.date ?? null,
        timezone: this.infosSourceReport.timezone ?? GlobalConstants.USER_TIMEZONE,
        anomalyDescription: this.infosourceFutureUpdates.description,
        internalComment: this.infosourceFutureUpdates.internalComment,
        concernedMaritimeEntityIds: this.infosourceFutureUpdates.concernedMaritimeEntityIds
      }]
    });
  }

  getSharedReportFormValue(): any {
    return this.reportFutureUpdatesForm.get('sharedReportForm').value;
  }

  hasAttachmentsIdsChangedValues(event: boolean) {
    this.hasAttachmentsIdsBeenChanged = event;
  }

  get objectFutureInfo(): AbstractControl {
    return this.reportFutureUpdatesForm.get('objectFutureInfo');
  }

  saveForm(): boolean {
    if (!this.reportFutureUpdatesForm.valid || !this.sharedReport.isFormSaveable()) {
      return false;
    }

    this.infosourceFutureUpdates = {
      id: this.infosourceFutureUpdates?.id,
      date: convertDateToISOString(this.getSharedReportFormValue().observationDate),
      localisation: convertFeatureToJsonFeature(this.sharedReport.getGeometries()),
      description: this.getSharedReportFormValue().anomalyDescription,
      objectFutureInfo: this.objectFutureInfo.value,
      attachmentIds: this.hasAttachmentsIdsBeenChanged ? this.sharedReport.getAttachmentsIds() : this.infosourceFutureUpdates.attachmentIds,
      attachmentFiles: this.infosourceFutureUpdates.attachmentFiles,
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
    return pick(this.infosourceFutureUpdates, [
      'id',
      'date',
      'localisation',
      'description',
      'objectFutureInfo',
      'attachmentIds',
      'serviceId',
      'timezone',
      'internalComment',
      'concernedMaritimeEntityIds'
    ]);
  }

  createInfosourcesAnomaly(): void {
    const infosourceFutureUpdates = this.getInformationsRequired();
    this.createSubscription = this.abstractInfosourceService.createInfosourceFutureUpdates(infosourceFutureUpdates)
      .subscribe(id => {
        this.infosourceFutureUpdates.id = id;
        this.infosourceId = id;
        if (this.sharedReport.canShowSendPanel) {
          this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
        }
        if (this.sharedReport.changedValue) {
          this.sharedReport.linkTagsToInfosource(this.infosourceId);
        }
        this.showToast('message.success.api.create-future-updates.created', 'success');
      }, err => this.handleSaveError(err, 'create', 'future-updates'));
  }

  updateInfosourcesAnomaly(): void {
    const infosourceFutureUpdates = this.getInformationsRequired();
    this.updateSubscription = this.abstractInfosourceService.updateInfosourceFutureUpdates(this.infosourceFutureUpdates.id, infosourceFutureUpdates)
      .subscribe(
        () => {
          if (this.sharedReport.canShowSendPanel) {
            this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
          }
          if (this.sharedReport.changedValue) {
            this.sharedReport.linkTagsToInfosource(this.infosourceId);
          }
          this.showToast('message.success.api.update-future-updates.updated', 'success');
        },
        err => this.handleSaveError(err, 'update', 'future-updates')
      );
  }

  ngOnDestroy(): void {
    if (this.createSubscription) { this.createSubscription.unsubscribe(); }
    if (this.updateSubscription) { this.updateSubscription.unsubscribe(); }
    if (this.getSubscription) { this.getSubscription.unsubscribe(); }
  }

  isCreationMode(): boolean {
    return !this.infosourceFutureUpdates.id;
  }
}
