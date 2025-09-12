import { FeaturePart, JsonWarningAdminDetails, WarningCreationData } from '@admin-warning/models/creation-warning.model';
import { CreationService } from '@admin-warning/services/creation.service';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { listWarningStatus } from '@app/models/warning.model';
import { formatDate, isDateRangeValid } from '@app/shared/date-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { filter, pairwise, take } from 'rxjs/operators';
import { LoaderService } from '@sig/services/loader.service';

const avurnavNoticeRoute = '/avurnav-notice';
const warningsTablesRoute = '/administration/warnings/tables';
const PREREQUISITES_STEP_NUMBER = '0';
@Component({
  selector: 'aw-step',
  template: ''
})
export abstract class StepComponent implements OnInit, OnDestroy {
  protected readonly scavenger = new Scavenger(this);
  protected loaderSubscription: Subscription;

  prevStep: string;
  nextStep: string;
  rootUrl: string;
  submitted = false;
  currentDateFormat: string;
  protected activeStepChangedSubscription: Subscription;
  protected warningChangedSubscription: Subscription;
  anInformation: WarningCreationData;
  updateSubscription: Subscription;
  createSubscription: Subscription;
  isSaved = false;
  isModelCreation = false;
  currentStep = 'prerequisites';
  protected validWarningNumber = true;
  protected baseElementRef : ElementRef;
  @Output() quickSaved = new EventEmitter<boolean>();

  protected constructor(protected readonly router: Router,
    protected readonly creationService: CreationService,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly loader: LoaderService
  ) {
    this.anInformation = this.creationService.getWarningData();
    this.currentDateFormat = 'dd/mm/yy';
    localStorage.setItem('stepNumber', PREREQUISITES_STEP_NUMBER);
  }

  ngOnInit(): void {
    this.loaderSubscription = this.loader.listenToLoading(this.baseElementRef);
    this.rootUrl = this.getParentUrl(this.getUrlWithoutParams());
    this.warningChangedSubscription = this.creationService.warningChange.subscribe(warningData => this.resetStep(warningData));
    const serieId = this.creationService.getWarningData().prerequisites.serieId;

    // If serie is not set and user is not on first step, navigate to first step
    if (!serieId && this.prevStep) {
      this.router.navigate([this.rootUrl]);
    }

    this.router.events
      .pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
      .subscribe((events: RoutesRecognized[]) => localStorage.setItem('previousUrl', events[0].urlAfterRedirects));
  }

  ngOnDestroy(): void {
    if (this.loaderSubscription) {
      this.loaderSubscription.unsubscribe();
    }
    if (this.activeStepChangedSubscription) {
      this.activeStepChangedSubscription.unsubscribe();
    }
    if (this.warningChangedSubscription) {
      this.warningChangedSubscription.unsubscribe();
    }
    if (this.createSubscription) {
      this.createSubscription.unsubscribe();
    }
  }

  getUrlWithoutParams(): string {
    const urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    return urlTree.toString();
  }

  getParentUrl(url: string): string {
    return url.substring(0, url.lastIndexOf('/'));
  }

  nextPage(event?: string): void {
    if (this.nextStep) {
      this.router.navigate([this.rootUrl + this.nextStep]);
      return;
    }
    this.submitted = true;
  }

  jumpToStep(event?: string): void {
    if (this.saveForm()) {
      this.update(false, event);
    } else {
      this.handleSaveError(null, 'form-invalid');
    }
  }

  prevPage(): void {
    if (this.prevStep) {
      this.router.navigate([this.rootUrl + this.prevStep]);
      return;
    }
    this.submitted = true;
  }

  checkWarningNumber(event?: string): Observable<boolean> {
    return of(true);
  }

  saveForm(force = false): boolean {
    return true;
  }

  checkIfPrerequisitesFormSavable(): void {
    return;
  }

  private createOrUpdateWhenPrerequisite(): void {
    this.checkWarningNumber()
      .pipe(this.scavenger.collect())
      .subscribe(isAvailable => {
        this.validWarningNumber = isAvailable;
        this.checkIfPrerequisitesFormSavable();
        if (!isAvailable || !this.saveForm()) {
          this.handleSaveError(null, 'form-invalid');
          return;
        }

        this.isCreationMode() ? this.create(true) : this.update(true);
      });
  }

  private createOrUpdate(): void {
    if (!this.saveForm()) {
      this.handleSaveError(null, 'form-invalid');
      return;
    }

    this.isCreationMode() ? this.create(true) : this.update(true);
  }

  save(): void {
    this.submitted = true;
    if (this.currentStep === '/prerequisites') {
      this.createOrUpdateWhenPrerequisite();
    } else {
      this.createOrUpdate();
    }
  }

  private quickCreateOrUpdateWhenPrerequisite(): void {
    this.checkWarningNumber()
      .pipe(this.scavenger.collect())
      .subscribe(isAvailable => {
        this.validWarningNumber = isAvailable;
        this.checkIfPrerequisitesFormSavable();
        if (!isAvailable || !this.saveForm()) {
          this.handleSaveError(null, 'form-invalid');
          return;
        }

        this.isCreationMode() ? this.quickCreate() : this.quickUpdate();
      });
  }

  private quickCreateOrUpdate(): void {
    if (!this.saveForm()) {
      this.handleSaveError(null, 'form-invalid');
      return;
    }

    this.isCreationMode() ? this.quickCreate() : this.quickUpdate();
  }

  protected quickSave(): void {
    this.submitted = true;
    if (this.currentStep === '/prerequisites') {
      this.quickCreateOrUpdateWhenPrerequisite();
    } else {
      this.quickCreateOrUpdate();
    }
  }

  isCreationMode(): boolean {
    return !this.creationService.getWarningData().id;
  }

  create(isComplete = false, stepRoute?: string): void {
    if (!this.saveForm()) { return; }
    this.createSubscription = this.creationService.create()
      .subscribe(warning => {
        this.creationService.getWarningData().id = warning.id;
        this.creationService.getWarningData().status = (warning as unknown as WarningCreationData).status;
        localStorage.setItem('warningId', warning.id);
        this.showToast(`message.success.api.warning${this.isModel() ? '-model' : ''}.created`, 'success');
        if (isComplete) {
          this.redirectToNextPageAfterValidation();
          this.creationService.initWarningData();
        } else {
          this.nextStep = stepRoute ?? this.nextStep;
          this.router.navigate([this.rootUrl + this.nextStep]);
        }
      }, err => this.handleSaveError(err)
      );
  }

  private quickCreate(): void {
    if (!this.saveForm()) {
      this.handleSaveError(null, 'form-invalid');
      return;
    }

    this.createSubscription = this.creationService.create()
      .subscribe(
        warning => {
          this.creationService.getWarningData().id = warning.id;
          this.creationService.getWarningData().status = (warning as unknown as WarningCreationData).status;
          localStorage.setItem('warningId', warning.id);
          this.quickSaved.emit();
          this.showToast(`message.success.api.warning${this.isModel() ? '-model' : ''}.created`, 'success');
        },
        err => this.handleSaveError(err)
      );
  }

  protected handleSaveError(err: any, saveKey = 'create'): Observable<Error> {
    if (['form-invalid', 'number-reservation-invalid'].includes(saveKey)) {
      this.showToast(`admin-warning.creation.errors.${saveKey}`);
      return;
    }

    let toastMessageKey = `message.error.api.cannot-${saveKey}-warning`;

    if (this.isDraft()) {
      toastMessageKey += '-draft';
    } else if (this.isModel()) {
      toastMessageKey += '-model';
    }

    const hasInvalidArguments = Object.values(err.error?.['invalid-arguments'] ?? []).some(errorMessage => errorMessage === 'validation.no-html-content-allowed');
    if (hasInvalidArguments) {
      toastMessageKey = 'message.error.api.cannot-save-form.validation.no-html-content-allowed';
    }

    this.showToast(toastMessageKey);
    return throwError(err);
  }

  update(isComplete = false, stepRoute?: string): void {
    let toastSuccessMessage = 'message.success.api.warning.updated';
    if (this.creationService.getWarningData()?.status === listWarningStatus.DRAFT) {
      toastSuccessMessage = 'message.success.api.warning.updated-draft';
    } else if (this.creationService.getWarningData()?.status === listWarningStatus.MODEL) {
      toastSuccessMessage = 'message.success.api.warning-model.updated';
    }

    this.updateSubscription = this.creationService.update()
      .pipe(take(1))
      .subscribe(warning => {
        const warningCreationData = (warning as unknown as JsonWarningAdminDetails);
        this.creationService.getWarningData().references = {
          attachmentReferenceIds: warningCreationData?.attachmentReferenceIds,
          georegulationReferenceIds: warningCreationData?.georegulationReferenceIds,
          warningPublicsReferences: warningCreationData?.warningPublicsReferences,
          entityReferenceIds: warningCreationData?.entityReferenceIds,
          warningLinksPublicsReferences: warningCreationData?.warningLinksPublicsReferences
        };
        this.showToast(toastSuccessMessage, 'success');
        if (isComplete) {
          this.redirectToNextPageAfterValidation();
          this.creationService.initWarningData();
        } else {
          this.nextStep = stepRoute ? stepRoute : this.nextStep;
          this.router.navigate([this.rootUrl + this.nextStep]);
        }
      },
        err => this.handleSaveError(err, 'update')
      );
  }

  private quickUpdate(): void {
    let toastSuccessMessage = 'message.success.api.warning.updated';
    if (this.creationService.getWarningData()?.status === listWarningStatus.DRAFT) {
      toastSuccessMessage = 'message.success.api.warning.updated-draft';
    } else if (this.creationService.getWarningData()?.status === listWarningStatus.MODEL) {
      toastSuccessMessage = 'message.success.api.warning-model.updated';
    }

    this.updateSubscription = this.creationService.update()
      .pipe(take(1))
      .subscribe(
        warning => {
          const warningCreationData = (warning as unknown as JsonWarningAdminDetails);
          this.creationService.getWarningData().references = {
            attachmentReferenceIds: warningCreationData?.attachmentReferenceIds,
            georegulationReferenceIds: warningCreationData?.georegulationReferenceIds,
            warningPublicsReferences: warningCreationData?.warningPublicsReferences,
            entityReferenceIds: warningCreationData?.entityReferenceIds,
            warningLinksPublicsReferences: warningCreationData?.warningLinksPublicsReferences
          };
          this.quickSaved.emit();
          this.showToast(toastSuccessMessage, 'success');
        },
        err => this.handleSaveError(err, 'update')
      );
  }

  redirectToNextPageAfterValidation(): void {
    const isAvurnavNoticeRoute = localStorage.getItem('previousUrl') === avurnavNoticeRoute;
    const previousUrl = isAvurnavNoticeRoute ? avurnavNoticeRoute : warningsTablesRoute;
    this.router.navigate([previousUrl], !isAvurnavNoticeRoute ?
      {
        queryParams: {
          tab: this.getTabToRedirect(),
          serieId: this.creationService.getWarningData().prerequisites.serieId
        }
      }
      : {}
    );
  }

  getTabToRedirect() {
    if (this.isModelCreation) {
      return listWarningStatus.MODEL;
    }

    switch (this.creationService.getWarningData().status) {
      case listWarningStatus.DRAFT:
      case listWarningStatus.NOT_SAVED:
        return listWarningStatus.DRAFT;
      case listWarningStatus.MODEL:
        return listWarningStatus.MODEL;
      case listWarningStatus.PUBLISHED:
      default:
        return listWarningStatus.PUBLISHED;
    }
  }

  isNotSaved(): boolean {
    return this.isAnNotSavedStatus(this.anInformation);
  }

  isDraft(): boolean {
    return this.isAnDraftStatus(this.anInformation);
  }

  isModel(): boolean {
    return this.isAnModelStatus(this.anInformation);
  }

  isPublished(): boolean {
    return this.isAnPublishedStatus(this.anInformation);
  }

  canSaveChanges(): boolean {
    return this.isDraft() || this.isModel() || this.isPublished();
  }

  isAnNotSavedStatus(anInformation: WarningCreationData): boolean {
    return this.isAnInStatus(anInformation, listWarningStatus.NOT_SAVED);
  }

  isAnDraftStatus(anInformation: WarningCreationData): boolean {
    return this.isAnInStatus(anInformation, listWarningStatus.DRAFT);
  }

  isAnModelStatus(anInformation: WarningCreationData): boolean {
    return this.isAnInStatus(anInformation, listWarningStatus.MODEL);
  }

  isAnPublishedStatus(anInformation: WarningCreationData): boolean {
    return this.isAnInStatus(anInformation, listWarningStatus.PUBLISHED);
  }

  isAnCancelledStatus(anInformation: WarningCreationData): boolean {
    return this.isAnInStatus(anInformation, listWarningStatus.CANCELLED);
  }

  isAnInStatus(anInformation: WarningCreationData, status: string): boolean {
    return anInformation.status === status;
  }

  protected resetStep(warningData: WarningCreationData): void {
    return;
  }

  protected showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  protected hasValidInformationOrDetails(featurePart: FeaturePart, anInformation: WarningCreationData): boolean {
    if (!featurePart) { return false; }
    const hasTypeDetails = featurePart.typeDetails.length > 0;
    const languages = anInformation.warningParts.mandatoryLanguages;
    const hasMandatoryLanguaguesFilled = languages.every(language => featurePart.information[language]);
    return hasTypeDetails || hasMandatoryLanguaguesFilled;
  }

  protected checkFeatureParts(featureParts: FeaturePart[], anInformation: WarningCreationData): boolean {
    return featureParts.length
      && featureParts.every(featurePart => this.hasValidInformationOrDetails(featurePart, anInformation)
        && this.hasValidDateRanges(featurePart))
      || !featureParts.length && ([listWarningStatus.NOT_SAVED, listWarningStatus.DRAFT].includes(anInformation.status));
  }

  protected hasValidDateRanges(featurePart: FeaturePart): boolean {
    return featurePart.dateRanges.every(dateRange =>
      isDateRangeValid(dateRange.dateStart, dateRange.timeOfDayStart, dateRange.dateEnd, dateRange.timeOfDayEnd)
    );
  }

  protected parseDateRanges(featurePart: FeaturePart): void {
    return featurePart.dateRanges.forEach(dateRange => {
      dateRange.dateStart = formatDate(dateRange.dateStart);
      dateRange.dateEnd = formatDate(dateRange.dateEnd);
    });
  }
}
