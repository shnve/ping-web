import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceTagsApi } from '@app/api/admin/service-tags-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize } from '@app/core/localize';
import { GlobalConstants } from '@app/global-constants';
import { InfosourceReportServiceUser, MarkupType } from '@app/infosource/models/infosource.model';
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
  selector: 'infosource-hazard-report-form',
  templateUrl: './report-hazard-form.component.html',
  styleUrls: ['./report-hazard-form.component.scss'],
  providers: [infosourceServiceProvider]
})

@Localize()
export class HazardReportFormComponent extends SharedReportFormComponent implements OnDestroy {
  reportMapAnoForm: UntypedFormGroup;
  markupTypes = Object.keys(MarkupType).map(k => MarkupType[k as any]);
  createSubscription: Subscription;
  infosourceHazardReport: InfosourceReportServiceUser = {};
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
      this.getSubscription = this.infosourceReport$.subscribe(infosourceReport => {
        this.infosourceHazardReport = infosourceReport;
        this.infosourceId = infosourceReport.id;
        this.initForm();
      });
    }
    this.initForm();

    if (this.infosourceHazardReport && !this.infosourceHazardReport.localisation) {
      this.infosourceHazardReport.localisation = [];
    }

    if (this.isNotDraftStatus()) {
      this.reportMapAnoForm.disable();
    }
  }


  initForm(): void {
    this.reportMapAnoForm = this.formBuilder.group({
      markupType: [this.infosourceHazardReport.type ?? '', Validators.required],
      objectName: this.infosourceHazardReport.objectName ?? '',
      attachments: [this.infosourceHazardReport.attachmentIds],
      localisation: this.infosourceHazardReport.localisation,
      sharedReportForm: [{
        contributorServiceId: this.infosourceHazardReport.serviceId ?? this.authService.getAuthenticatedUser()?.serviceId,
        observationDate: this.infosourceHazardReport?.date ?? null,
        timezone: this.infosSourceReport.timezone ?? GlobalConstants.USER_TIMEZONE,
        anomalyDescription: this.infosourceHazardReport.description,
        internalComment: this.infosourceHazardReport.internalComment,
        concernedMaritimeEntityIds: this.infosourceHazardReport.concernedMaritimeEntityIds
      }]
    });
  }

  get markupType(): AbstractControl {
    return this.reportMapAnoForm.get('markupType');
  }

  get objectName(): AbstractControl {
    return this.reportMapAnoForm.get('objectName');
  }

  getSharedReportFormValue(): any {
    return this.reportMapAnoForm.get('sharedReportForm').value;
  }

  saveForm(): boolean {
    if (!this.reportMapAnoForm.valid || !this.sharedReport.isFormSaveable()) {
      return false;
    }

    this.infosourceHazardReport = {
      id: this.infosourceHazardReport?.id,
      date: convertDateToISOString(this.getSharedReportFormValue().observationDate),
      localisation: convertFeatureToJsonFeature(this.sharedReport.getGeometries()),
      type: this.markupType.value,
      objectName: this.objectName.value,
      description: this.getSharedReportFormValue().anomalyDescription,
      attachmentIds: this.hasAttachmentsIdsBeenChanged ? this.sharedReport.getAttachmentsIds() : this.infosourceHazardReport.attachmentIds,
      attachmentFiles: this.infosourceHazardReport.attachmentFiles,
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
    return pick(this.infosourceHazardReport, [
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
    const infosourceHazardReport = this.getInformationsRequired();
    this.createSubscription = this.abstractInfosourceService.createInfosourceHazardReport(infosourceHazardReport)
      .subscribe(id => {
        this.infosourceHazardReport.id = id;
        this.infosourceId = id;
        if (this.sharedReport.canShowSendPanel) {
          this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
        }
        if (this.sharedReport.changedValue) {
          this.sharedReport.linkTagsToInfosource(this.infosourceId);
        }
        this.showToast('message.success.api.create-hazard-report.created', 'success');
      },
        err => this.handleSaveError(err, 'create', 'hazard-report')
      );
  }


  hasAttachmentsIdsChangedValues(event: boolean) {
    this.hasAttachmentsIdsBeenChanged = event;
  }

  updateInfosourcesAnomaly(): void {
    const infosourceHazardReport = this.getInformationsRequired();
    this.createSubscription = this.abstractInfosourceService.updateInfosourceHazardReport(this.infosourceHazardReport.id, infosourceHazardReport)
      .subscribe(
        () => {
          if (this.sharedReport.canShowSendPanel) {
            this.sharedReport.confirmSending(this.sharedReport.submitButtonEvent, this.infosourceId);
          }
          if (this.sharedReport.changedValue) {
            this.sharedReport.linkTagsToInfosource(this.infosourceId);
          }
          this.showToast('message.success.api.update-hazard-report.updated', 'success');
        },
        err => this.handleSaveError(err, 'update', 'hazard-report')
      );
  }

  ngOnDestroy(): void {
    if (this.createSubscription) { this.createSubscription.unsubscribe(); }
    if (this.updateSubscription) { this.updateSubscription.unsubscribe(); }
    if (this.getSubscription) { this.getSubscription.unsubscribe(); }
  }

  isCreationMode(): boolean {
    return !this.infosourceHazardReport.id;
  }
}
