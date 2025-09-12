import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaritimeEntitiesApi } from '@app/api/maritime-entities.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { checkNumber, checkNumbers, convertFeaturePartsToJsonFeatureParts, convertFromJsonGeoregulationNumberDate, convertToJsonGeoregulationNumberDate } from '@app/georegulation/georegulation-utils';
import { CalendarPeriod, GeoregulationCreation, GeoregulationNumber, GeoregulationPartForm, GeoregulationType, JsonGeoregulationPart, SeasonalPeriodFormElement, activities, georegulationCreationInitValues, monthsForMarkAsNew } from '@app/georegulation/models/georegulation.model';
import { GeoregulationAdminService } from '@app/georegulation/services/georegulation-admin.service';
import { GlobalConstants } from '@app/global-constants';
import { MessageSeverity } from '@app/models/alert-message.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { MaritimeServiceBase, MaritimeServiceType } from '@app/models/maritime-service.model';
import { ProUserServices, ServiceRole } from '@app/models/pro-user.model';
import { FRENCH_DATE_REGEX_PATTERN, formatFrenchDateToIsoDate, listTheTimeZones } from '@app/shared/date-utils';
import { generateYearsBetween, handleEnterKeyPress } from '@app/shared/ui-utils';
import { convertJsonCalendarPeriodToCalendarPeriod, convertJsonGeoregulationPartsToFeatureParts } from '@app/sig/utils/feature';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { cloneDeep, isEqual, uniq } from 'lodash-es';
import { ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api/selectitem';
import { Observable, throwError } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import MaritimeService from '../../../models/maritime-service.model';
import { MaritimeServiceService } from '../../../services/maritime-services.service';
import { GeoregulationPartsComponent } from '../georegulation-parts/georegulation-parts.component';


const CURRENT_YEAR = (new Date()).getFullYear();
const YEAR_RANGE_START = 1800;
const YEAR_RANGE_END = CURRENT_YEAR + 1;

@Component({
  selector: 'georegulation-creation',
  templateUrl: './georegulation-creation.component.html',
  styleUrls: ['./georegulation-creation.component.scss']
})
@Localize()
export class GeoregulationCreationComponent implements OnInit, OnDestroy, OnChangeLang {

  @Output() hasAttachmentsIdsChanged = new EventEmitter<boolean>();

  @ViewChild('georegulationParts') georegulationParts: GeoregulationPartsComponent;

  protected scavenger = new Scavenger(this);

  submitted: boolean;
  form: UntypedFormGroup;
  timezones: Array<{ label: string, value: string }>;
  issuingServices$: Observable<ProUserServices[] | MaritimeService[]>;
  availableTypes: GeoregulationType[];
  temporary: boolean;
  allTerritorialSea: boolean;
  announcedByAvurnavAvirade: boolean;
  availableMaritimeEntities: MaritimeEntityBase[];
  availableActivities = [];
  coastlineLimit: boolean;
  publicEnabled: boolean;

  isMainNumberInvalid = false;
  isMainNumberUnavailable = false;

  areAdditionalNumbersInvalid = false;

  georegulation: GeoregulationCreation = cloneDeep(georegulationCreationInitValues);

  availableYears: string[] = [];

  availableAuthorities: MaritimeServiceBase[] = [];

  availableMonths: SelectItem[] = [];

  featurePartsConverted: GeoregulationPartForm[] = [];

  showRestrictionCategories = false;

  isSavedWithoutPart = false;

  hasAtLeastOnePartWithoutGeometry = false;

  private selectedIssuingServiceId: string = null;

  readonly yearRange: string = `${YEAR_RANGE_START}:${YEAR_RANGE_END}`;

  private readonly georegulation$: Observable<GeoregulationCreation>;

  georegulationId: string;
  disabled = false;

  enterKeyEvent = handleEnterKeyPress;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly usersApi: UsersApi,
    private readonly georegulationAdminService: GeoregulationAdminService,
    private readonly maritimeServiceService: MaritimeServiceService,
    private readonly alertMessageService: AlertMessageService,
    private readonly translateService: TranslateService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly maritimeEntitiesApi: MaritimeEntitiesApi,
    private readonly confirmationService: ConfirmationService) {
    this.disabled = this.isReadonlyExceptSummaries();
    this.timezones = listTheTimeZones();
    this.availableTypes = Object.keys(GeoregulationType).map(k => GeoregulationType[k as string]);
    this.availableYears = generateYearsBetween(YEAR_RANGE_START, YEAR_RANGE_END).reverse().map(y => y.toString());
    this.buildLocalizedItems();
    monthsForMarkAsNew.forEach(i => this.availableMonths.push({ label: `${i}`, value: i }));
    this.georegulation$ = this.activatedRoute.paramMap
      .pipe(
        switchMap(paramMap => {
          if (paramMap.get('id')) {
            return this.georegulationAdminService.getGeoregulationById$(paramMap.get('id'));
          }
          return null;
        }),
        share()
      );

    if (this.activatedRoute.snapshot?.params?.id) {
      this.georegulation$.pipe(this.scavenger.collect())
        .subscribe(georegulation => {
          this.georegulation = georegulation;
          this.georegulationId = georegulation.id;
          this.temporary = georegulation.isTemporary;
          this.allTerritorialSea = georegulation.isAllTerritorialSea;
          this.announcedByAvurnavAvirade = georegulation.isAnnouncedByAvurnavAvirade;
          this.showRestrictionCategories = this.shouldShowRestrictionCategories(this.georegulation.type);
          this.selectedIssuingServiceId = this.georegulation.serviceId ?? this.getDefaultIssuingServiceId();
          if (this.disabled) {
            this.issuingServices$ = this.maritimeServiceService.findByServiceIds$([this.selectedIssuingServiceId]);
          }
          this.updateAvailableMaritimeEntities(this.selectedIssuingServiceId);
          this.updateAvailableAuthorities(this.selectedIssuingServiceId);
          this.initGeoregulation(this.georegulation);
          this.initForm();
        });
    }
  }

  private initGeoregulation(georegulation: GeoregulationCreation): void {
    this.featurePartsConverted = this.convertToGeoregulationPartForms(georegulation);
    georegulation.calendarPeriods = georegulation.calendarPeriods.map(calendarPeriod => convertJsonCalendarPeriodToCalendarPeriod(calendarPeriod));
    this.initNumbers(georegulation);
  }

  ngOnDestroy(): void { }

  ngOnInit(): void {
    const proUserId = this.authService.getAuthenticatedUser()?.id;
    if (!this.disabled) {
      this.issuingServices$ = this.usersApi.findProServices(proUserId)
        .pipe(
          map(proServices =>
            proServices.filter(proService =>
              [ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN].includes(proService.serviceRole)
              && proService.type === MaritimeServiceType.AUTHORITY
            )
          )
        );
    }
    this.selectedIssuingServiceId = this.georegulation.serviceId ?? this.getDefaultIssuingServiceId();
    this.updateAvailableMaritimeEntities(this.selectedIssuingServiceId);
    this.updateAvailableAuthorities(this.selectedIssuingServiceId);
    this.temporary = false;
    this.initForm();
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }

  private buildLocalizedItems(): void {
    this.availableActivities = activities.map(({ key, value }) => this.translateActivities(key, value));
  }

  private translateActivities(key: string, value: string): any {
    return {
      key,
      value: this.translateService.instant(value)
    };
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      parts: [this.georegulation.parts ?? []],
      issuingServiceId: [this.selectedIssuingServiceId, Validators.required],
      type: [this.georegulation.type ?? '', Validators.required],
      timezone: [this.georegulation.timezone ?? GlobalConstants.USER_TIMEZONE, Validators.required],
      isTemporary: [this.georegulation.isTemporary, Validators.required],
      isAllTerritorialSea: [this.georegulation.isAllTerritorialSea, Validators.required],
      isAnnouncedByAvurnavAvirade: [this.georegulation.isAnnouncedByAvurnavAvirade, Validators.required],
      concernedMaritimeEntityIds: [this.georegulation.maritimeEntityIds],
      mainNumber: [this.georegulation.mainNumber, Validators.required],
      activities: [this.georegulation.activities],
      title: this.georegulation.title,
      internationalTitle: this.georegulation.internationalTitle,
      summary: this.georegulation.summary,
      internationalSummary: this.georegulation.internationalSummary,
      internalComment: this.georegulation.internalComment,
      calendarPeriods: [this.georegulation.calendarPeriods],
      seasonalPeriods: [this.georegulation.seasonalPeriods],
      hasCoastlineLimit: this.georegulation.hasCoastlineLimit,
      isPublic: [this.georegulation.isPublic, Validators.required],
      markAsNewInMonths: this.georegulation.markAsNewInMonths,
      links: [this.georegulation.links]
    });

    this.issuingServiceId.valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(selectedValue => {
        this.updateAvailableMaritimeEntities(selectedValue);
        this.updateAvailableAuthorities(selectedValue);
      });

    this.type.valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(selectedValue => this.showRestrictionCategories = this.shouldShowRestrictionCategories(selectedValue));

    this.isTemporary.valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(selectedValue => this.temporary = selectedValue);

    this.hasCoastlineLimit.valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(selectedValue => this.coastlineLimit = selectedValue);

    this.isAllTerritorialSea.valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(selectedValue => this.allTerritorialSea = selectedValue);

    this.isAnnouncedByAvurnavAvirade.valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(selectedValue => this.announcedByAvurnavAvirade = selectedValue);

    this.isPublic.valueChanges
      .pipe(this.scavenger.collect())
      .subscribe(selectedValue => this.publicEnabled = selectedValue);

  }

  private shouldShowRestrictionCategories(georegulationType: GeoregulationType): boolean {
    return georegulationType === GeoregulationType.NAVIGATION;
  }

  private updateAvailableMaritimeEntities(serviceId: string): void {
    if (!serviceId) { return; }
    if (!this.disabled) {
      this.georegulationAdminService.getAvailableMaritimeEntitiesForCreation$(serviceId)
        .pipe(this.scavenger.collect())
        .subscribe(maritimeEntities => this.availableMaritimeEntities = maritimeEntities);
    } else {
      this.maritimeEntitiesApi.findByEntityIds$(this.georegulation.maritimeEntityIds)
        .pipe(this.scavenger.collect())
        .subscribe(maritimeEntities => this.availableMaritimeEntities = maritimeEntities);
    }
  }

  private updateAvailableAuthorities(serviceId: string): void {
    if (!serviceId) { return; }
    if (!this.disabled) {
      this.maritimeServiceService.getAvailableAuthorities$(serviceId)
        .pipe(this.scavenger.collect())
        .subscribe(authorities => this.availableAuthorities = authorities);
    } else {
      const authorityIds = uniq([
        ...this.georegulation.mainNumber.authorityIds,
        ...this.georegulation.additionalNumbers.flatMap(georegulationNumber => georegulationNumber.authorityIds)
      ]);
      this.maritimeServiceService.findByServiceIds$(authorityIds)
        .pipe(this.scavenger.collect())
        .subscribe(authorities => this.availableAuthorities = authorities);
    }
  }

  private getDefaultIssuingServiceId() {
    return this.authService.hasAutorityType() ? this.authService.getAuthenticatedUser()?.serviceId : null;
  }

  private isReadonlyExceptSummaries() {
    return this.authService.hasShomGeographicAreaType();
  }

  get issuingServiceId(): AbstractControl {
    return this.form.get('issuingServiceId');
  }

  get type(): AbstractControl {
    return this.form.get('type');
  }

  get timezone(): AbstractControl {
    return this.form.get('timezone');
  }

  get isTemporary(): AbstractControl {
    return this.form.get('isTemporary');
  }

  get isAllTerritorialSea(): AbstractControl {
    return this.form.get('isAllTerritorialSea');
  }

  get isAnnouncedByAvurnavAvirade(): AbstractControl {
    return this.form.get('isAnnouncedByAvurnavAvirade');
  }

  get concernedMaritimeEntityIds(): AbstractControl {
    return this.form.get('concernedMaritimeEntityIds');
  }

  get mainNumber(): AbstractControl {
    return this.form.get('mainNumber');
  }

  get activities(): AbstractControl {
    return this.form.get('activities');
  }

  get title(): AbstractControl {
    return this.form.get('title');
  }

  get internationalTitle(): AbstractControl {
    return this.form.get('internationalTitle');
  }

  get summary(): AbstractControl {
    return this.form.get('summary');
  }

  get internationalSummary(): AbstractControl {
    return this.form.get('internationalSummary');
  }

  get internalComment(): AbstractControl {
    return this.form.get('internalComment');
  }

  get hasCoastlineLimit(): AbstractControl {
    return this.form.get('hasCoastlineLimit');
  }

  get isPublic(): AbstractControl {
    return this.form.get('isPublic');
  }

  get parts(): AbstractControl {
    return this.form.get('parts');
  }

  get markAsNewInMonths(): AbstractControl {
    return this.form.get('markAsNewInMonths');
  }

  get links(): AbstractControl {
    return this.form.get('links');
  }

  setAttachmentsIds(event: string[]): void {
    this.hasAttachmentsIdsChanged.emit(true);
    this.georegulation.attachmentIds = event;
  }

  private formatCalendarPeriodsForCreation(calendarPeriods: CalendarPeriod[]): CalendarPeriod[] {
    if (!calendarPeriods) { return; }

    const formattedCalendarPeriods = cloneDeep(calendarPeriods);

    for (const calendarPeriod of formattedCalendarPeriods) {
      if (calendarPeriod.dateStart && FRENCH_DATE_REGEX_PATTERN.test(calendarPeriod.dateStart)) {
        calendarPeriod.dateStart = formatFrenchDateToIsoDate(calendarPeriod.dateStart);
      }

      if (calendarPeriod.dateEnd && FRENCH_DATE_REGEX_PATTERN.test(calendarPeriod.dateEnd)) {
        calendarPeriod.dateEnd = formatFrenchDateToIsoDate(calendarPeriod.dateEnd);
      }
    }
    return formattedCalendarPeriods;
  }

  private formatPartsCalendarPeriods(parts: GeoregulationPartForm[]): void {
    parts.forEach(part => part.calendarPeriods = this.formatCalendarPeriodsForCreation(part.calendarPeriods));
  }

  private convertToJsonGeoregulationParts(featureParts: GeoregulationPartForm[]): JsonGeoregulationPart[] {
    if (!featureParts) { return []; }
    return convertFeaturePartsToJsonFeatureParts(featureParts.map(partForm => {
      const { informations, ...partFormRest } = partForm;
      return {
        ...partFormRest,
        information: partForm.informations['fr'],
        internationalInformation: partForm.informations['en']
      };
    }));
  }

  private isCreationMode(): boolean {
    return !this.georegulation.id;
  }

  private formatParts(parts: GeoregulationPartForm[]): JsonGeoregulationPart[] {
    this.formatPartsCalendarPeriods(parts);
    return this.isCreationMode() ? this.convertToJsonGeoregulationParts(parts) :
      (isEqual(this.georegulation.parts, parts) ? this.georegulation.parts : this.convertToJsonGeoregulationParts(parts));
  }

  private convertToGeoregulationPartForms(georegulation: GeoregulationCreation): GeoregulationPartForm[] {
    if (!georegulation?.parts) { return []; }
    const featureParts: JsonGeoregulationPart[] = georegulation?.parts;
    return convertJsonGeoregulationPartsToFeatureParts(featureParts)
      .map(georegulationPart => {
        const informations = { fr: georegulationPart.information, en: georegulationPart.internationalInformation };
        const seasonalPeriods = georegulationPart.seasonalPeriods.map(seasonalPeriod => {
          return {
            isInvalid: false,
            ...seasonalPeriod
          } as SeasonalPeriodFormElement;
        });
        return {
          ...georegulationPart,
          seasonalPeriods,
          informations
        };
      });
  }

  private initNumbers(georegulation: GeoregulationCreation): void {
    if (!georegulation) { return; }
    georegulation.mainNumber = this.initNumber(georegulation.mainNumber);
    georegulation.additionalNumbers = georegulation.additionalNumbers.map(additionalNumber => this.initNumber(additionalNumber));
  }

  private initNumber(georegulationNumber: GeoregulationNumber): GeoregulationNumber {
    georegulationNumber.date = convertFromJsonGeoregulationNumberDate(georegulationNumber.date);
    georegulationNumber.authorities = this.availableAuthorities.filter(authority => georegulationNumber.authorityIds.includes(authority.id));
    georegulationNumber.authorityCodes = georegulationNumber.authorities.map(authority => authority.authorityCode);
    return georegulationNumber;
  }

  private cleanNumber(grNumber: GeoregulationNumber): GeoregulationNumber {
    grNumber.authorityIds = grNumber.authorities.map(authority => authority.id);
    const { authorities, ...grNumberRest } = grNumber;
    return { ...grNumberRest, date: convertToJsonGeoregulationNumberDate(grNumberRest.date) };
  }

  private cleanNumbers(grNumbers: GeoregulationNumber[]): GeoregulationNumber[] {
    if (!grNumbers) { return []; }
    return grNumbers.map(grNumber => this.cleanNumber(grNumber));
  }

  private checkGeometries(parts: JsonGeoregulationPart[]): boolean {
    if (!parts) {
      return true;
    }
    return parts.every(part => part.features?.length);
  }

  private saveForm(): boolean {
    this.isMainNumberUnavailable = false;
    this.hasAtLeastOnePartWithoutGeometry = false;
    this.georegulationParts.updateFeaturePartsFromForm();
    const formValue = this.form.value;
    const parts = [...formValue.parts];
    let errorDetected = '';

    switch (true) {
      case (!parts?.length):
        this.isSavedWithoutPart = true;
        errorDetected = 'georegulation.creation.errors.missing-part';
        break;
      case (!this.georegulationParts?.georegulationPartForm?.form?.valid):
        this.isSavedWithoutPart = false;
        errorDetected = 'georegulation.creation.errors.missing-part-error';
        break;
      case (!checkNumber(formValue.mainNumber)):
        this.isMainNumberInvalid = true;
        errorDetected = 'georegulation.creation.errors.missing-main-number';
        break;
      case (!checkNumbers(this.georegulation.additionalNumbers)):
        this.areAdditionalNumbersInvalid = true;
        errorDetected = 'georegulation.creation.errors.invalid-additional-number';
        break;
      case (!this.checkGeometries(parts as JsonGeoregulationPart[])):
        this.hasAtLeastOnePartWithoutGeometry = true;
        errorDetected = 'georegulation.creation.errors.at-least-one-missing-geometry';
        break;
      case (formValue.seasonalPeriods.some(seasonalPeriod => seasonalPeriod.isInvalid)):
      case (parts.some(part => part.seasonalPeriods.some(seasonalPeriod => seasonalPeriod.isInvalid))):
        errorDetected = 'georegulation.creation.errors.at-least-one-invalid-seasonal-period';
        break;
      case (!this.form.valid):
        errorDetected = 'georegulation.creation.errors.form-invalid';
        break;
    }

    if (errorDetected) {
      this.showToast(this.translateService.instant('message.error.api.cannot-create-georegulation') + ' : ' + this.translateService.instant(errorDetected), 'error');
      return false;
    }
    return true;
  }

  private createGeoregulation(georegulation: GeoregulationCreation): void {
    this.georegulationAdminService.create$(georegulation)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.router.navigate([`georegulation/tables`], { queryParams: { status: georegulation.status } });
          this.showToast('message.success.api.georegulation.created', 'success');
        },
        err => this.handleSaveError(err)
      );
  }

  private updateGeoregulation(georegulation: GeoregulationCreation): void {
    this.georegulationAdminService.update$(georegulation, this.disabled)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.router.navigate([`georegulation/tables`], { queryParams: { status: georegulation.status } });
          this.showToast('message.success.api.georegulation.updated', 'success');
        },
        err => this.handleSaveError(err, 'update')
      );
  }

  private handleSaveError(err: any, saveKey = 'create'): Observable<Error> {
    let toastMessageKey = `message.error.api.cannot-${saveKey}-georegulation`;
    if (err.error?.message === 'validation.georegulation.number.not-available') {
      this.isMainNumberUnavailable = true;
      toastMessageKey = 'georegulation.creation.errors.main-number-unavailable';
    }

    if (Object.values(err.error?.['invalid-arguments']).some(errorMessage => errorMessage === 'validation.no-html-content-allowed')) {
      toastMessageKey = 'message.error.api.cannot-save-form.validation.no-html-content-allowed';
    }

    this.showToast(toastMessageKey);
    return throwError(err);
  }

  validate(): void {
    if (this.saveForm()) {
      const formValue = this.form.value;
      const parts = [...formValue.parts];
      const georegulation = {
        ...this.georegulation,
        serviceId: formValue.issuingServiceId,
        type: formValue.type,
        timezone: formValue.timezone,
        activities: formValue.activities,
        title: formValue.title,
        internationalTitle: formValue.internationalTitle,
        maritimeEntityIds: formValue.concernedMaritimeEntityIds,
        summary: formValue.summary,
        internationalSummary: formValue.internationalSummary,
        isTemporary: formValue.isTemporary,
        isAllTerritorialSea: formValue.isAllTerritorialSea,
        isAnnouncedByAvurnavAvirade: formValue.isAnnouncedByAvurnavAvirade,
        calendarPeriods: this.formatCalendarPeriodsForCreation(formValue.calendarPeriods),
        seasonalPeriods: formValue.seasonalPeriods,
        hasCoastlineLimit: formValue.hasCoastlineLimit,
        links: formValue.links,
        isPublic: formValue.isPublic,
        markAsNewInMonths: formValue.markAsNewInMonths,
        internalComment: formValue.internalComment,
        parts: this.formatParts(parts),
        mainNumber: this.cleanNumber(this.georegulation.mainNumber),
        additionalNumbers: this.cleanNumbers(this.georegulation.additionalNumbers)
      };
      this.isCreationMode() ? this.createGeoregulation(georegulation) : this.updateGeoregulation(georegulation);
    }
    this.submitted = true;
  }

  private showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  mainNumberValidated(valid: boolean): void {
    this.isMainNumberInvalid = !valid;
  }

  additionalNumbersValidated(valid: boolean): void {
    this.areAdditionalNumbersInvalid = !valid;
  }

  confirmCancel(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translateService.instant('georegulation.edition.cancel-message'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.router.navigate(['georegulation/tables'])
    });
  }

}
