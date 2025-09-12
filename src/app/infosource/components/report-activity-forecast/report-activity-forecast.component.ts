import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceTagsApi } from '@app/api/admin/service-tags-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { GlobalConstants } from '@app/global-constants';
import { convertFeaturePartsToJsonFeatureParts } from '@app/infosource/infosource-utils';
import { InfosourceFeaturePart, InfosourcePartForm, InfosourcePartFormMainInfo, InfosourceReportActivityForecast, JsonInfosourcePart } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { Tag } from '@app/models/maritime-service.model';
import { ProUserServices, ServiceRole } from '@app/models/pro-user.model';
import { FRENCH_DATE_REGEX_PATTERN, formatDate, formatFrenchDateToIsoDate, listTheTimeZones } from '@app/shared/date-utils';
import { uniq } from '@app/shared/generic-utils';
import { checkIfDeviceIsMobile, checkIfSpacesOnly, handleEnterKeyPress, noWhitespaceValidator } from '@app/shared/ui-utils';
import { convertJsonInfosourcePartsToFeatureParts } from '@app/sig/utils/feature';
import { convertFeaturesToJsonGeometries } from '@app/sig/utils/geometry';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import * as _ from 'lodash';
import { isEmpty, pick } from 'lodash-es';
import { DeviceDetectorService } from 'ngx-device-detector';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { VectorSourceEvent } from 'ol/source/Vector';
import { ConfirmationService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, Subscription, of, throwError } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import { InfosourcePartsComponent } from '../infosource-parts/infosource-parts.component';

@Component({
  selector: 'infosource-report-activity-forecast',
  templateUrl: './report-activity-forecast.component.html',
  styleUrls: ['../shared-report/shared-report-form.component.scss', './report-activity-forecast.component.scss'],
  providers: [infosourceServiceProvider]
})
export class ReportActivityForecastComponent implements OnInit, OnDestroy {

  protected scavenger = new Scavenger(this);

  @ViewChild('infosourceParts') infosourceParts: InfosourcePartsComponent;
  @ViewChild('sendPanel') sendPanel: OverlayPanel;

  private subscriptions: Subscription[] = [];
  submitted: boolean;
  isMissingLocalisation = true;
  isMissingInformation = true;
  isWrongInformation = true;
  form: UntypedFormGroup;
  infosourceId?: string;
  infosourceReport$: Observable<InfosourceReportActivityForecast>;
  proUserServices$: Observable<ProUserServices[]>;
  report: InfosourceReportActivityForecast = {
    serviceId: null,
    timezone: null,
    parts: [],
    concernedMaritimeEntityIds: []
  };
  isSavedWithoutPart = false;
  attachmentIds: string[] = [];
  hasAttachmentsIdsBeenChanged = false;
  timezones: Array<{ label: string, value: string }>;
  featurePartsConverted: InfosourceFeaturePart[];
  canShowSendPanel = false;
  submitButtonEvent: Event;
  availableMaritimeServicesRecipients: MaritimeService[] = [];
  selectedMaritimeServicesRecipients: Array<string> = [];
  availableMaritimeEntities: MaritimeEntityBase[];

  displayModal = false;
  tagName = '';
  maritimeService$: Observable<MaritimeService>;
  optionsMaritimeServiceTags = [];
  grouped: boolean;
  displayedMaritimeServiceLabel: string;
  changedValue = false;
  canAddAndLinkTag = false;
  maritimeService: MaritimeService;
  maritimeServiceTagsIds = [];

  displayDeviceOrientationModeDisclaimer = false;

  hasRoleServiceUser: boolean;

  enterKeyEvent = handleEnterKeyPress;

  constructor(protected readonly formBuilder: UntypedFormBuilder,
    protected readonly authService: AuthService,
    protected readonly usersApi: UsersApi,
    protected readonly alertMessageService: AlertMessageService,
    private readonly abstractInfosourceService: AbstractInfosourceService,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly translateService: TranslateService,
    protected readonly router: Router,
    protected readonly confirmationService: ConfirmationService,
    protected readonly serviceTagsApi: ServiceTagsApi,
    protected readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly disclaimerService: DisclaimerService,
    private readonly deviceDetectorService: DeviceDetectorService) {
    this.timezones = listTheTimeZones();
    this.infosourceReport$ = this.activatedRoute.paramMap
      .pipe(
        switchMap(paramMap => {
          if (paramMap.get('id')) {
            return this.abstractInfosourceService.getActivityForecastInfosourceById$(paramMap.get('id'));
          }
          return null;
        }),
        share()
      );
    if (this.activatedRoute.snapshot?.params?.id) {
      this.infosourceReport$.subscribe(infosourceReport => {
        this.report = infosourceReport;
        this.infosourceId = infosourceReport.id;
        const timezone = this.report.timezone ?? GlobalConstants.USER_TIMEZONE;
        this.featurePartsConverted = convertJsonInfosourcePartsToFeatureParts(infosourceReport.parts, timezone);
        this.initForm();
      });
    } else {
      if (this.report && !this.report.attachmentFiles?.length) {
        this.report.attachmentFiles = [];
      }
      if (this.report && !this.report.attachmentIds?.length) {
        this.report.attachmentIds = [];
      }
    }

    this.initForm();
    this.buildTagsItems();

    this.displayDeviceOrientationModeDisclaimer = checkIfDeviceIsMobile(this.deviceDetectorService) && this.disclaimerService.showDisplayDeviceOrientationModeDisclaimer();
  }

  ngOnInit(): void {
    this.hasRoleServiceUser = this.authService.hasRoleServiceUser();
    if (this.hasRoleServiceUser) {
      this.canAddAndLinkTag = this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN], this.contributorServiceId.value);
      const proUserId = this.authService.getAuthenticatedUser()?.id;
      const proUserServiceId = this.authService.getAuthenticatedUser()?.serviceId;
      this.proUserServices$ = this.usersApi.findProServices(proUserId)
        .pipe(
          map(proServices =>
            proServices.filter(proService =>
              [ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN].includes(proService.serviceRole)
            )
          )
        );
      this.abstractInfosourceService.getAvailableMaritimeEntitiesForCreation$(proUserServiceId)
        .pipe(this.scavenger.collect())
        .subscribe(maritimeEntities => this.availableMaritimeEntities = maritimeEntities);
    }
    this.initForm();
    this.buildTagsItems();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      attachments: [this.report.attachmentIds],
      parts: [this.report?.parts ?? []],
      contributorServiceId: this.report.serviceId ?? this.authService.getAuthenticatedUser()?.serviceId,
      timezone: [this.report.timezone ?? GlobalConstants.USER_TIMEZONE, Validators.required],
      internalComment: [this.report.internalComment ?? '', noWhitespaceValidator],
      concernedMaritimeEntityIds: [this.report?.concernedMaritimeEntityIds],
      selectedTagsIds: [this.maritimeServiceTagsIds]
    });

    if (this.hasRoleServiceUser) {
      const proUserServiceId = this.authService.getAuthenticatedUser()?.serviceId;
      this.contributorServiceId.setValue(proUserServiceId);
    }
  }

  get concernedMaritimeEntityIds(): AbstractControl {
    return this.form.get('concernedMaritimeEntityIds');
  }

  get contributorServiceId(): AbstractControl {
    return this.form.get('contributorServiceId');
  }

  get timezone(): AbstractControl {
    return this.form.get('timezone');
  }

  get parts(): AbstractControl {
    return this.form.get('parts');
  }

  get selectedTagsIds(): AbstractControl {
    return this.form.get('selectedTagsIds');
  }

  get internalComment(): AbstractControl {
    return this.form.get('internalComment');
  }

  setAttachmentsIds(ids: string[]) {
    this.attachmentIds = ids;
    this.hasAttachmentsIdsBeenChanged = true;
  }

  private convertToJsonInfosourceParts(featureParts: InfosourcePartForm[]): JsonInfosourcePart[] {
    if (!featureParts) { return []; }
    return convertFeaturePartsToJsonFeatureParts(featureParts.map(partForm => {
      const fr = partForm.information['fr'];
      const en = partForm.information['en'];
      const description = !fr || fr === '' ? null : fr;
      const internationalDescription = !en || en === '' ? null : en;
      return {
        ...partForm,
        description,
        internationalDescription
      }
    }));
  }

  private hasMissingLocalisation(parts: InfosourcePartForm[]): boolean {
    return parts.some(part => !part.localisation?.length);
  }

  private hasMissingInformation(parts: InfosourcePartForm[]): boolean {
    return parts.some(part => isEmpty(part.information['fr']));
  }

  private hasWrongInformation(parts: InfosourcePartForm[]): boolean {
    return parts.some(part => checkIfSpacesOnly(part.information['fr'])) || parts.some(part => checkIfSpacesOnly(part.information['en']));
  }

  validate(): void {
    if (this.saveForm()) {
      this.isCreationMode() ? this.createReport() : this.updateReport();
    }
    this.submitted = true;
  }

  submitContribution(event: Event) {
    this.canShowSendPanel = true;
    this.submitButtonEvent = event;
  }

  confirmSending(): void {
    if (this.authService.isPublicUser()) {
      this.confirmationService.confirm({
        target: this.submitButtonEvent.target,
        message: this.translateService.instant('detail.send-confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.send();
        }
      });
    } else {
      this.retrieveRecipients(this.submitButtonEvent);
    }

    this.canShowSendPanel = false;
    this.submitButtonEvent = null;
  }

  retrieveRecipients(event: Event): void {
    this.abstractInfosourceService.getRoutingServices$(this.infosourceId)
      .pipe(this.scavenger.collect())
      .subscribe(recipients => {
        this.availableMaritimeServicesRecipients = recipients;
        this.selectedMaritimeServicesRecipients = this.availableMaritimeServicesRecipients
          .filter(maritimeServiceRecipient => maritimeServiceRecipient.defaultService === true)
          .map(maritimeServiceRecipient => maritimeServiceRecipient.id);

        this.sendPanel.toggle(event);
      },
        () => this.alertMessageService.add({
          summary: 'message.summary.warn',
          severity: 'warn',
          detail: this.translateService.instant('detail.infosource-rejected')
        })
      );
  }

  send(): void {
    this.abstractInfosourceService.send$(this.infosourceId, this.selectedMaritimeServicesRecipients)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.showToast(this.translateService.instant('detail.send-success'), 'success');
          this.showToast(this.translateService.instant('detail.send-welcome-contribution'), 'success');
          this.router.navigate(['/infosource/tables']);
        },
        err => {
          const errorsPayload = Object.keys(err);
          if (errorsPayload.length) {
            const responsePayload = err[errorsPayload[0]];
            this.alertMessageService.add({
              summary: 'message.summary.warn',
              severity: 'warn',
              detail: this.translateService.instant(responsePayload)
            });
            return;
          }
          this.showToast(this.translateService.instant('detail.send-error'), 'error');
        }
      );
  }

  cancelSend(): void {
    this.sendPanel.hide();
    this.canShowSendPanel = false;
    this.submitButtonEvent = null;
    this.selectedMaritimeServicesRecipients = [];
  }


  saveForm(): boolean {
    this.infosourceParts.updateFeaturePartsFromForm();
    const formValue = this.form.value;
    const parts = [...formValue.parts];
    const hasNoPart = !parts?.length;
    if (hasNoPart) {
      this.isSavedWithoutPart = true;
      return false;
    }
    if (!this.form.valid || this.hasMissingLocalisation(parts) || this.hasMissingInformation(parts) || this.hasWrongInformation(parts)) { return false; }
    this.formatDateRangeForCreation(parts);
    const part = this.isCreationMode() ? this.convertToJsonInfosourceParts(parts) :
      (_.isEqual(this.report.parts, parts) ? this.report.parts : this.convertToJsonInfosourceParts(parts));

    this.report = {
      id: this.report?.id,
      serviceId: formValue.contributorServiceId,
      timezone: formValue.timezone,
      internalComment: formValue.internalComment,
      attachmentIds: this.hasAttachmentsIdsBeenChanged ? this.attachmentIds : this.report.attachmentIds,
      attachmentFiles: this.report.attachmentFiles,
      parts: part,
      concernedMaritimeEntityIds: formValue.concernedMaritimeEntityIds ?? []
    };

    return true;
  }

  getInformationsRequired(): InfosourceReportActivityForecast {
    return pick(this.report, [
      'id',
      'serviceId',
      'timezone',
      'internalComment',
      'attachmentIds',
      'parts',
      'concernedMaritimeEntityIds'
    ]);
  }

  createReport(): void {
    const report = this.getInformationsRequired();
    this.subscriptions.push(
      this.abstractInfosourceService.createInfosourceActivityForecast(report)
        .subscribe(id => {
          this.showToast('message.success.api.create-activity-forecast-report.created', 'success');
          this.report.id = id;
          this.infosourceId = id;
          if (this.canShowSendPanel) {
            this.confirmSending();
          }
          if (this.changedValue) {
            this.linkTagsToInfosource();
          }
          this.hasAttachmentsIdsBeenChanged = false;
          this.report.parts.forEach(feature => this.parseDateRanges(feature));
        }, err => this.handleSaveError(err)));
  }

  updateReport(): void {
    const report = this.getInformationsRequired();
    this.subscriptions.push(this.abstractInfosourceService
      .updateInfosourceActivityForecast(this.report.id, report)
      .subscribe(
        () => {
          if (this.canShowSendPanel) {
            this.confirmSending();
          }
          if (this.changedValue) {
            this.linkTagsToInfosource();
          }
          this.hasAttachmentsIdsBeenChanged = false;
          this.report.parts.forEach(feature => this.parseDateRanges(feature));
          this.showToast('message.success.api.update-activity-forecast-report.updated', 'success');
        },
        err => this.handleSaveError(err, 'update'))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  isCreationMode(): boolean {
    return !this.report.id;
  }

  private formatDateRangeForCreation(parts: InfosourcePartForm[]): void {
    if (!parts) { return; }
    for (let part of parts) {
      for (const dateRange of part?.dateRanges) {
        if (dateRange.dateStart && FRENCH_DATE_REGEX_PATTERN.test(dateRange.dateStart)) {
          dateRange.dateStart = formatFrenchDateToIsoDate(dateRange.dateStart);
        }

        if (dateRange.dateEnd && FRENCH_DATE_REGEX_PATTERN.test(dateRange.dateEnd)) {
          dateRange.dateEnd = formatFrenchDateToIsoDate(dateRange.dateEnd);
        }
      }
    }
  }

  private showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  private parseDateRanges(featurePart: JsonInfosourcePart): void {
    return featurePart.dateRanges.forEach(dateRange => {
      dateRange.dateStart = formatDate(dateRange.dateStart);
      dateRange.dateEnd = formatDate(dateRange.dateEnd);
    });
  }

  handleInput(): void {
    if (!this.hasRoleServiceUser) { return; }
    this.changedValue = !!this.maritimeServiceTagsIds.length && !!this.infosourceId;
    this.maritimeServiceTagsIds = [];
    this.buildTagsItems();
  }

  onGeometryFormFeatureChange(event: VectorSourceEvent<Geometry>): void {
    if (['addfeature', 'removefeature'].includes(event.type)) {
      this.refreshAvailableMaritimeEntitiesList();
      this.isMissingLocalisation = this.hasMissingLocalisation(this.infosourceParts.featureParts);
    }
  }

  onInputInformationChange(partMainInfo: InfosourcePartFormMainInfo): void {
    this.isMissingInformation = this.hasMissingInformation(this.infosourceParts.featureParts);
    this.isWrongInformation = this.hasWrongInformation(this.infosourceParts.featureParts);
  }

  onChangeInfosourcePartsForms(part: InfosourcePartForm) {
    this.isMissingInformation = this.hasMissingInformation(this.infosourceParts.featureParts);
    this.isMissingLocalisation = this.hasMissingLocalisation(this.infosourceParts.featureParts);
    this.isWrongInformation = this.hasWrongInformation(this.infosourceParts.featureParts);
  }

  refreshAvailableMaritimeEntitiesList(): void {
    const geometriesOfReport: Array<Feature> = [];
    if (this.form.value?.parts) {
      (this.form.value?.parts as InfosourceFeaturePart[]).filter(infosourceFeaturePart => Array.isArray(infosourceFeaturePart.geometries) && infosourceFeaturePart.geometries.length)
        .forEach(infosourceFeaturePart => geometriesOfReport.push(...infosourceFeaturePart.geometries));
    }
    const geometriesToCheck = uniq([...geometriesOfReport, ...this.infosourceParts.getGeometries()], 'ol_uid');
    const proUserServiceId = this.authService.getAuthenticatedUser()?.serviceId;
    this.abstractInfosourceService.getAvailableMaritimeEntitiesForCreation$(proUserServiceId, convertFeaturesToJsonGeometries(geometriesToCheck))
      .pipe(this.scavenger.collect())
      .subscribe(maritimeEntities => this.availableMaritimeEntities = maritimeEntities);
  }

  updateMaritimeServiceTagsIds() {
    this.changedValue = !(this.selectedTagsIds.value.length === 0 && !this.infosourceId);
    this.maritimeServiceTagsIds = this.selectedTagsIds.value;
  }

  buildTagsItems(): void {
    if (!this.hasRoleServiceUser) { return; }

    this.optionsMaritimeServiceTags = [];

    this.maritimeService$ = this.maritimeServicesApi.findOne(this.contributorServiceId.value);

    this.maritimeService$.pipe(this.scavenger.collect()).subscribe(
      maritimeService => {
        const items = [];
        maritimeService.tags.forEach(tag => items.push({ key: tag.id, value: tag.value }));

        this.optionsMaritimeServiceTags.push({
          label: maritimeService.name,
          items
        });

        this.selectedTagsIds.setValue([]);

        this.getTagsIdsFromInfosourceId$().pipe(this.scavenger.collect()).subscribe(tagsIds => {
          this.selectedTagsIds.setValue([...new Set([...this.maritimeServiceTagsIds, ...tagsIds.filter(id => maritimeService.tags.findIndex(tag => tag.id === id) !== -1)])]);
        });
      }
    );

    this.displayedMaritimeServiceLabel = this.getDisplayedMaritimeServiceLabel(this.translateService.currentLang);
  }

  private getDisplayedMaritimeServiceLabel(lang: string): string {
    return lang === 'fr' ? 'name' : 'internationalName';
  }

  saveTag(tag: Tag): void {
    this.serviceTagsApi.saveTag(tag)
      .pipe(this.scavenger.collect())
      .subscribe(serviceTag => {
        this.tagName = '';
        this.showToast(this.translateService.instant('message.success.api.add-service-tag'), 'success');
        this.selectedTagsIds.value.push(serviceTag.id);
        this.changedValue = true;
        this.linkTagsToInfosource();
      },
        err => {
          this.showToast(this.translateService.instant('message.error.api.cannot-add-service-tag'));
          return throwError(err);
        });
  }

  saveNewTag(): void {
    this.maritimeService$.pipe(this.scavenger.collect()).subscribe(
      maritimeService => {
        const index = maritimeService.tags?.findIndex(tag => tag.value === this.tagName) ?? -1;
        if (index > -1) {
          this.showToast(this.translateService.instant('message.error.api.already-exist-service-tag'));
          return;
        }

        this.displayModal = false;
        this.saveTag({
          value: this.tagName.trim(),
          maritimeServiceId: this.contributorServiceId.value
        });
      }
    );
  }

  linkTagsToInfosource(): void {
    if (!this.changedValue || !this.infosourceId) {
      return;
    }

    const messageDetail = this.selectedTagsIds.value.length ? 'add' : 'del';

    this.abstractInfosourceService.linkTagsToInfosource$(this.infosourceId, this.selectedTagsIds.value)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.changedValue = false;
          this.showToast(this.translateService.instant(`infosource.details.update-service-status.success-${messageDetail}-link-infosource-tag`), 'success');
        },
        (err: Error) => {
          this.showToast(this.translateService.instant('infosource.details.update-service-status.error-link-infosource-tag'));
          return throwError(err);
        }
      );
  }

  getTagsIdsFromInfosourceId$(): Observable<string[]> {
    if (!this.infosourceId) {
      this.selectedTagsIds.setValue([...new Set([...this.maritimeServiceTagsIds])]);
      return of([]);
    }

    return this.abstractInfosourceService.getTagsIdsFromInfosourceId$(this.infosourceId);
  }

  private handleSaveError(err: any, saveKey = 'create'): Observable<Error> {
    let toastMessageKey = `message.error.api.cannot-${saveKey}-activity-forecast-report`;

    if (Object.values(err.error?.['invalid-arguments']).some(errorMessage => errorMessage === 'validation.no-html-content-allowed')) {
      toastMessageKey = 'message.error.api.cannot-save-form.validation.no-html-content-allowed';
    }

    this.showToast(toastMessageKey);
    return throwError(err);
  }

  onCloseDeviceOrientationModeDisclaimer(neverShowAgain: boolean): void {
    this.displayDeviceOrientationModeDisclaimer = false;
    if (neverShowAgain) {
      this.disclaimerService.neverShowAgainDisplayDeviceOrientationModeDisclaimer();
    }
  }
}
