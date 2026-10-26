import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FeaturePart } from '@app/admin/admin-warning/models/creation-warning.model';
import { ServiceTagsApi } from '@app/api/admin/service-tags-admin.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { GlobalConstants } from '@app/global-constants';
import { InfosourceJsonFeaturePart, InfosourceNature, InfosourceReportServiceUser, InfosourceStatus } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { Tag } from '@app/models/maritime-service.model';
import { ProUserServices, ServiceRole } from '@app/models/pro-user.model';
import { listTheTimeZones } from '@app/shared/date-utils';
import { checkIfDeviceIsMobile, noWhitespaceValidator } from '@app/shared/ui-utils';
import { convertInfosourceJsonFeaturePartsToFeatureParts } from '@app/sig/utils/feature';
import { convertFeaturesToJsonGeometries } from '@app/sig/utils/geometry';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { DeviceDetectorService } from 'ngx-device-detector';
import Geometry from 'ol/geom/Geometry';
import { VectorSourceEvent } from 'ol/source/Vector';
import { ConfirmationService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, Subscription, of, throwError } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import { ValueAccessorBase } from '../../../shared/value-accessor';
import { InfosourceMapComponent } from '../infosource-map/infosource-map.component';

export interface SharedReportFormData {
  contributorServiceId: string;
  observationDate: string;
  timezone: string;
  anomalyDescription: string;
  internalComment: string;
}

@Component({
  selector: 'infosource-shared-report-form',
  templateUrl: './shared-report-form.component.html',
  styleUrls: ['./shared-report-form.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: SharedReportFormComponent, multi: true },
    infosourceServiceProvider
  ]

})
export class SharedReportFormComponent extends ValueAccessorBase<SharedReportFormData> implements OnChanges, OnDestroy, AfterViewInit {
  protected scavenger = new Scavenger(this);

  sharedReportForm: UntypedFormGroup;
  timezones: Array<{ label: string, value: string }>;
  @Input() submitted: boolean;
  isMissingLocalisation = true;
  @Input() titleLabel: string;
  @Input() isFutureUpdates?: boolean;
  @Input() locationMessage?: string;
  @Input() isBathy = false;
  @Input() contributorLabel = 'infosource.report-hazard.contributor-service';
  @Input() contributorChoicePlaceholder = 'infosource.report-hazard.contributor-service-placeholder';

  selectedPart: InfosourceJsonFeaturePart = {
    geometries: []
  };
  selectedPartConverted: FeaturePart;
  @Output() hasAttachmentsIdsChanged = new EventEmitter<boolean>();

  infosourceStatus?: string;
  canShowSendPanel = false;
  submitButtonEvent: Event;

  @ViewChild('geometriesForm') geometriesForm: InfosourceMapComponent;
  @ViewChild('sendPanel') sendPanel: OverlayPanel;

  proUserServices$: Observable<ProUserServices[]>;
  hasRoleServiceUser: boolean;
  attachmentIds: string[] = [];
  readonly dateFormat = 'dd/mm/yy';
  infosourceReport$: Observable<InfosourceReportServiceUser>;
  @Input() infosSourceReport: InfosourceReportServiceUser = {};
  hasAttachmentsIdsBeenChanged = false;
  getSubscription: Subscription;
  @Input() infosourceId?: string;

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

  private geometriesLoaded = false;
  protected infosourceNature: InfosourceNature;

  protected bathyNature = InfosourceNature.BATHY;

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
    protected readonly deviceDetectorService: DeviceDetectorService) {
    super();
    this.timezones = listTheTimeZones();
    this.infosourceReport$ = this.activatedRoute.paramMap
      .pipe(
        switchMap(paramMap => {
          const id = paramMap.get('id');
          if (id) {
            this.infosourceId = id;
            return this.abstractInfosourceService.getInfosourceReportById$(id);
          }
          return null;
        }),
        share()
      );

    this.availableMaritimeEntities = [];
    this.initSharedForm();

    if (this.infosSourceReport && !this.infosSourceReport.attachmentFiles?.length) {
      this.infosSourceReport.attachmentFiles = [];
    }
    if (this.infosSourceReport && !this.infosSourceReport.attachmentIds?.length) {
      this.infosSourceReport.attachmentIds = [];
    }

    this.infosourceStatus = this.router.getCurrentNavigation()?.extras?.state?.status;

    if (this.isNotDraftStatus()) {
      this.sharedReportForm.disable();
    }

    this.canAddAndLinkTag = this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN], this.contributorServiceId.value);

    if (this.canAddAndLinkTag) {
      this.buildTagsItems();
    }

    this.displayDeviceOrientationModeDisclaimer = checkIfDeviceIsMobile(this.deviceDetectorService) && this.disclaimerService.showDisplayDeviceOrientationModeDisclaimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.activatedRoute.snapshot?.params?.id) {
      this.infosSourceReport = this.infosSourceReport;
      this.selectedPart.geometries = this.infosSourceReport.localisation;
      this.selectedPartConverted = convertInfosourceJsonFeaturePartsToFeatureParts([this.selectedPart])[0];
      this.initSharedForm();
      this.isMissingLocalisation = !this.getGeometries()?.length;
      if (this.canAddAndLinkTag) {
        this.buildTagsItems();
      }
      if (!this.infosourceNature && this.infosSourceReport.nature) {
        this.infosourceNature = this.infosSourceReport.nature;
      }
    }
  }

  ngAfterViewInit(): void {
    if (!!this.infosSourceReport.localisation) {
      this.refreshAvailableMaritimeEntitiesList();
    }
  }

  addFeaturePart(): void {
    this.updateFeaturePartsFromForm();
    this.selectedPart = {
      geometries: []
    };
  }

  initSharedForm() {
    const proUserId = this.authService.getAuthenticatedUser()?.id;
    const proUserServiceId = this.authService.getAuthenticatedUser()?.serviceId;
    this.proUserServices$ = this.usersApi.findProServices(proUserId)
      .pipe(
        map(proServices => proServices.filter(proService => [ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN].includes(proService.serviceRole)))
      );

    this.sharedReportForm = this.formBuilder.group({
      contributorServiceId: this.infosSourceReport?.serviceId ?? proUserServiceId,
      observationDate: this.infosSourceReport.date ? this.parseDate(this.infosSourceReport.date) : null,
      timezone: this.infosSourceReport.timezone ?? GlobalConstants.USER_TIMEZONE,
      anomalyDescription: [this.infosSourceReport.description ?? '', !this.isBathy ? [Validators.required, noWhitespaceValidator] : noWhitespaceValidator],
      internalComment: [this.infosSourceReport.internalComment ?? '', noWhitespaceValidator],
      concernedMaritimeEntityIds: [this.infosSourceReport?.concernedMaritimeEntityIds],
      selectedTagsIds: [this.maritimeServiceTagsIds]
    });

    this.hasRoleServiceUser = this.authService.hasRoleServiceUser();
  }

  get anomalyDescription() {
    return this.sharedReportForm.get('anomalyDescription');
  }

  handleInput(prop: string, value: string): void {
    this.value[prop] = value;
    this.value = { ...this.value };
    if (prop === 'contributorServiceId') {
      this.changedValue = !!this.maritimeServiceTagsIds.length && !!this.infosourceId;
      this.maritimeServiceTagsIds = [];
      this.buildTagsItems();
    }
  }

  onGeometryFormFeatureChange(event: VectorSourceEvent<Geometry>): void {
    if (['addfeature', 'removefeature'].includes(event.type) && this.geometriesLoaded) {
      this.refreshAvailableMaritimeEntitiesList();
      this.isMissingLocalisation = !this.getGeometries()?.length;
    }
  }

  refreshAvailableMaritimeEntitiesList(): void {
    this.geometriesLoaded = false;
    const proUserServiceId = this.authService.getAuthenticatedUser()?.serviceId;
    this.abstractInfosourceService.getAvailableMaritimeEntitiesForCreation$(proUserServiceId, convertFeaturesToJsonGeometries(this.geometriesForm.getGeometries()))
      .pipe(this.scavenger.collect())
      .subscribe(maritimeEntities => {
        this.availableMaritimeEntities = maritimeEntities;
        this.geometriesLoaded = true;
      });
  }

  setAttachmentsIds(event: string[]) {
    this.hasAttachmentsIdsChanged.emit(true);
    this.attachmentIds = event;
  }

  getAttachmentsIds(): string[] {
    return this.attachmentIds;
  }

  isNotDraftStatus(): boolean {
    return this.infosourceStatus && this.infosourceStatus !== InfosourceStatus.DRAFT;
  }

  selectPart(featurePart: FeaturePart): void {
    if (featurePart === this.selectedPart) {
      return;
    }
    this.updateFeaturePartsFromForm();
    this.selectedPart = featurePart;
    this.cdRef.detectChanges();
  }

  updateFeaturePartsFromForm(): void {
    if (!this.geometriesForm) {
      return;
    }
    this.selectedPart.geometries = this.geometriesForm.getGeometries();
  }

  getGeometries(): any[] {
    if (!this.geometriesForm) {
      return [];
    }
    return this.geometriesForm.getGeometries();
  }

  parseDate(date: string): Date {
    const newDate = new Date(date);
    let offset = newDate.getTimezoneOffset(); // returns offset from GMT in minutes
    offset *= 60000;
    return new Date(newDate.valueOf() + offset);
  }

  get internalComment(): AbstractControl {
    return this.sharedReportForm.get('internalComment');
  }

  protected showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  submitContribution(event: Event) {
    this.canShowSendPanel = true;
    this.submitButtonEvent = event;
  }

  confirmSending(event: Event, infosourceId: string): void {
    if (this.authService.isPublicUser()) {
      this.confirmationService.confirm({
        target: event.target,
        message: this.translate.instant('detail.send-confirm'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.send(infosourceId);
        }
      });
    } else {
      this.retrieveRecipients(event, infosourceId);
    }

    this.canShowSendPanel = false;
    this.submitButtonEvent = null;
  }

  retrieveRecipients(event: Event, infosourceId: string): void {
    this.abstractInfosourceService.getRoutingServices$(infosourceId)
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
          detail: this.translate.instant('detail.infosource-rejected')
        })
      );
  }

  send(infosourceId: string): void {
    this.abstractInfosourceService.send$(infosourceId, this.selectedMaritimeServicesRecipients)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.showToast(this.translate.instant('detail.send-success'), 'success');
          this.showToast(this.translate.instant('detail.send-welcome-contribution'), 'success');
          this.router.navigate(['/infosource/tables']);
        },
        err => {
          const errorsPayload = Object.keys(err);
          if (errorsPayload.length) {
            const responsePayload = err[errorsPayload[0]];
            this.alertMessageService.add({
              summary: 'message.summary.warn',
              severity: 'warn',
              detail: this.translate.instant(responsePayload)
            });
            return;
          }
          this.showToast(this.translate.instant('detail.send-error'), 'error');
        }
      );
  }

  cancelSend(): void {
    this.sendPanel.hide();
    this.canShowSendPanel = false;
    this.submitButtonEvent = null;
    this.selectedMaritimeServicesRecipients = [];
  }

  updateMaritimeServiceTagsIds() {
    this.changedValue = !(this.selectedTagsIds.value.length === 0 && !this.infosourceId);
    this.maritimeServiceTagsIds = this.selectedTagsIds.value;
  }

  buildTagsItems(): void {
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

        this.getTagsIdsFromInfosourceId$().pipe(this.scavenger.collect()).subscribe(tagsIds => {
          this.selectedTagsIds.setValue([...new Set([...this.maritimeServiceTagsIds, ...tagsIds.filter(id => maritimeService.tags.findIndex(tag => tag.id === id) !== -1)])]);
        });
      }
    );

    this.displayedMaritimeServiceLabel = this.getDisplayedMaritimeServiceLabel(this.translate.currentLang);
  }

  private getDisplayedMaritimeServiceLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  get concernedMaritimeEntityIds(): AbstractControl {
    return this.sharedReportForm.get('concernedMaritimeEntityIds');
  }

  get contributorServiceId(): AbstractControl {
    return this.sharedReportForm.get('contributorServiceId');
  }

  get selectedTagsIds(): AbstractControl {
    return this.sharedReportForm.get('selectedTagsIds');
  }

  saveTag(tag: Tag): void {
    this.serviceTagsApi.saveTag(tag)
      .pipe(this.scavenger.collect())
      .subscribe(serviceTag => {
        this.tagName = '';
        this.showToast(this.translate.instant('message.success.api.add-service-tag'), 'success');
        this.selectedTagsIds.value.push(serviceTag.id);
        this.changedValue = true;
        this.linkTagsToInfosource(this.infosourceId);
        this.buildTagsItems();
      },
        err => {
          this.showToast(this.translate.instant('message.error.api.cannot-add-service-tag'));
          return throwError(err);
        });
  }

  saveNewTag(): void {
    this.maritimeService$.pipe(this.scavenger.collect()).subscribe(
      maritimeService => {
        const index = maritimeService.tags?.findIndex(tag => tag.value === this.tagName) ?? -1;
        if (index > -1) {
          this.showToast(this.translate.instant('message.error.api.already-exist-service-tag'));
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

  linkTagsToInfosource(infosourceId: string): void {
    if (!this.changedValue || !infosourceId) {
      return;
    }

    const messageDetail = this.selectedTagsIds.value.length ? 'add' : 'del';

    this.abstractInfosourceService.linkTagsToInfosource$(infosourceId, this.selectedTagsIds.value)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.changedValue = false;
          this.showToast(this.translate.instant(`infosource.details.update-service-status.success-${messageDetail}-link-infosource-tag`), 'success');
        },
        (err: Error) => {
          this.showToast(this.translate.instant('infosource.details.update-service-status.error-link-infosource-tag'));
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

  isFormSaveable(): boolean {
    // fix geometries no more editable after saving if drawing tool is opened
    
    this.isMissingLocalisation = !this.getGeometries()?.length;
    return !(this.isMissingLocalisation || !this.sharedReportForm.valid);
  }

  onCloseDeviceOrientationModeDisclaimer(neverShowAgain: boolean): void {
    this.displayDeviceOrientationModeDisclaimer = false;
    if (neverShowAgain) {
      this.disclaimerService.neverShowAgainDisplayDeviceOrientationModeDisclaimer();
    }
  }

  protected handleSaveError(err: any, saveKey: string, infosourceTypeKey: string): Observable<Error> {
    let toastMessageKey = `message.error.api.cannot-${saveKey}-${infosourceTypeKey}`;

    if (Object.values(err.error?.['invalid-arguments']).some(errorMessage => errorMessage === 'validation.no-html-content-allowed')) {
      toastMessageKey = 'message.error.api.cannot-save-form.validation.no-html-content-allowed';
    }

    this.showToast(toastMessageKey);
    return throwError(err);
  }

  ngOnDestroy(): void {
    if (this.getSubscription) { this.getSubscription.unsubscribe(); }
  }
}
