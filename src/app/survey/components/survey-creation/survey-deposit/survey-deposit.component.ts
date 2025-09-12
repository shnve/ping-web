import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { TranslatedOptionList, checkIfSpacesOnly, noWhitespaceValidator, translateI18nKeyValueArray } from '@app/shared/ui-utils';
import { SurveyDepositEdition, SurveyFileComplianceAnalysisState, SurveyIssuerType, SurveyTransmissionStatus, TRANSLATIONS_LIST_SURVEY_ACTIVITY_BROADCAST_GROUP, TRANSLATIONS_LIST_SURVEY_ISSUER_TYPE, defaultValuesSurveyDepositEdition } from '@app/survey/models/survey.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { pick } from 'lodash-es';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { surveyServiceProvider } from '../../../providers/survey.service.provider';
import { AbstractSurveyService } from '../../../services/survey.service';
import { AbstractSurveyCreationComponent } from '../abstract-survey.component';

@Component({
  selector: 'survey-deposit',
  templateUrl: './survey-deposit.component.html',
  styleUrls: ['../abstract-survey.component.scss'],
  providers: [surveyServiceProvider]
})
@Localize()
export class SurveyDepositComponent extends AbstractSurveyCreationComponent<SurveyDepositEdition> implements OnChangeLang, OnInit, OnDestroy {

  protected readonly listSurveyFileComplianceAnalysisState = SurveyFileComplianceAnalysisState;

  protected availableSurveyIssuerType: TranslatedOptionList;

  protected readonly listSurveyActivityBroadcast = TRANSLATIONS_LIST_SURVEY_ACTIVITY_BROADCAST_GROUP;
  protected selectedBroadcastRestriction: string;
  private surveyBroadcastRestrictionSubscription: Subscription;
  protected displayPopup = false;

  DASH = '-';
  OWNER = SurveyIssuerType.OWNER;
  PRODUCER = SurveyIssuerType.PRODUCER;

  protected canDelete = false;
  protected transmitted = false;
  protected enableAnalysis = false;
  protected disableSave = false;
  protected disableTransmit = true;

  constructor(protected readonly formBuilder: UntypedFormBuilder,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly router: Router,
    protected readonly confirmationService: ConfirmationService,
    protected readonly surveyService: AbstractSurveyService) {
    super(formBuilder, alertMessageService, translate, activatedRoute, router, confirmationService, surveyService);
    this.initData(defaultValuesSurveyDepositEdition);
  }

  protected getSurveyById$(id: string): Observable<SurveyDepositEdition> {
    return this.surveyService.getDepositById$(id);
  }

  protected initForm(): void {
    this.selectedBroadcastRestriction = this.survey.broadcastRestriction + this.DASH + this.survey.activityChoice;
    this.surveyForm = this.formBuilder.group({
      surveyDescription: [{
        nameAndLocation: this.survey.nameAndLocation,
        areaId: this.survey.areaId,
        achievementPeriod: this.survey.achievementPeriod,
        serviceId: this.survey.serviceId
      }],
      goal: [this.survey.goal, noWhitespaceValidator],    // required
      surveyIssuerTypes: [this.survey.surveyIssuerTypes],   // required
      surveyBathyData: [{
        geographicFormat: this.survey.geographicFormat,
        epsg: this.survey.epsg,
        coordinatesOrder: this.survey.coordinatesOrder,
        directionZ: this.survey.directionZ,
        verticalRef: this.survey.verticalRef,
        fileSeparator: this.survey.fileSeparator
      }],
      ownerOrganization: [this.survey.ownerOrganization, noWhitespaceValidator],        // required
      producerOrganization: [this.survey.producerOrganization, noWhitespaceValidator],  // required
      ownerEmail: [this.survey.ownerEmail, Validators.pattern(environment.emailRegexPattern)],
      technicalManagerEmail: [this.survey.technicalManagerEmail, Validators.pattern(environment.emailRegexPattern)],
      activityChoice: this.survey.activityChoice,                   // required
      broadcastRestriction: this.selectedBroadcastRestriction,       // required
      confidentialityInformation: [this.survey.confidentialityInformation, noWhitespaceValidator]
    });

    this.refreshButtonsStatus();
  }

  ngOnInit() {
    super.ngOnInit();
    this.surveyBroadcastRestrictionSubscription = this.broadcastRestriction.valueChanges.subscribe(() => {
      const [broadcastRestriction, activityChoice] = this.broadcastRestriction.value.split(this.DASH);
      this.activityChoice.setValue(activityChoice);
      this.selectedBroadcastRestriction = broadcastRestriction + this.DASH + activityChoice;
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.surveyBroadcastRestrictionSubscription) {
      this.surveyBroadcastRestrictionSubscription.unsubscribe();
    }
  }

  private static isNotCompliantOrInAnalysis(survey: SurveyDepositEdition): boolean {
    return [SurveyFileComplianceAnalysisState.NOT_COMPLIANT, SurveyFileComplianceAnalysisState.PENDING].includes(survey.compliant);
  }

  protected getFormFields(formValue: any): any {
    return pick(formValue, [
      'goal',
      'surveyIssuerTypes',
      'ownerOrganization',
      'producerOrganization',
      'ownerEmail',
      'technicalManagerEmail',
      'activityChoice',
      'broadcastRestriction',
      'confidentialityInformation'
    ]);
  }

  get surveyIssuerTypes(): AbstractControl {
    return this.surveyForm.get('surveyIssuerTypes');
  }

  get ownerEmail(): AbstractControl {
    return this.surveyForm.get('ownerEmail');
  }

  get technicalManagerEmail(): AbstractControl {
    return this.surveyForm.get('technicalManagerEmail');
  }

  get goal(): AbstractControl {
    return this.surveyForm.get('goal');
  }

  get ownerOrganization(): AbstractControl {
    return this.surveyForm.get('ownerOrganization');
  }

  get producerOrganization(): AbstractControl {
    return this.surveyForm.get('producerOrganization');
  }

  get activityChoice(): AbstractControl {
    return this.surveyForm.get('activityChoice');
  }

  get broadcastRestriction(): AbstractControl {
    return this.surveyForm.get('broadcastRestriction');
  }

  get confidentialityInformation(): AbstractControl {
    return this.surveyForm.get('confidentialityInformation');
  }

  protected saveForm(): boolean {

    // if both issuer types selected then copy owner organization to producer organization to have the same value
    if (this.surveyIssuerTypes.value?.length === 2) {
      this.producerOrganization.setValue(this.ownerOrganization.value);
    }

    if (!this.surveyForm.valid || !this.surveyDescriptionForm.isFormValid || !this.bathyMetadataForm.isFormValid || this.invalidDate) {
      this.showError('survey.form.errors.field-invalid');
      return false;
    }

    if (checkIfSpacesOnly(this.producerOrganization.value)) {
      this.showError('survey.form.errors.producer-organization-invalid');
      return false;
    }

    const formValue = this.surveyForm.value;

    this.survey = {
      ...this.survey,
      ...this.getFormFields(formValue),
      ...this.surveyDescription.value,
      ...this.surveyBathyData.value
    };

    this.survey.ownerEmail = !this.survey.ownerEmail || this.survey.ownerEmail === '' ? null : this.survey.ownerEmail;
    this.survey.technicalManagerEmail = !this.survey.technicalManagerEmail || this.survey.technicalManagerEmail === '' ? null : this.survey.technicalManagerEmail;

    this.survey.serviceId = this.surveyDescriptionForm.serviceId.value;

    this.formatDatesForCreation(this.survey);

    [this.survey.broadcastRestriction, this.survey.activityChoice] = this.broadcastRestriction.getRawValue().split(this.DASH);

    return true;
  }

  private refreshButtonsStatus(): void {
    this.canDelete = !!this.survey.id;
    this.disableSave = SurveyTransmissionStatus.FINISHED === this.survey.transmissionStatus;
    this.disableTransmit = !this.survey?.id || this.disableSave || SurveyDepositComponent.isNotCompliantOrInAnalysis(this.survey);
  }

  protected createSurvey(): void {
    this.surveyService.createDeposit$(this.survey)
      .pipe(this.scavenger.collect())
      .subscribe(
        id => {
          this.survey.id = id;
          this.refreshButtonsStatus();
          this.showToast('message.success.api.survey-deposit.created', 'success');
        },
        err => this.handleSaveError(err)
      );
  }

  protected updateSurvey(): void {
    this.surveyService.updateDeposit$(this.survey)
      .pipe(this.scavenger.collect())
      .subscribe(
        id => {
          this.survey.id = id;
          this.refreshButtonsStatus();
          this.showToast('message.success.api.survey-deposit.updated', 'success');
        },
        err => this.handleSaveError(err, 'update')
      );
  }

  protected buildLocalizedItems(): void {
    this.availableSurveyIssuerType = translateI18nKeyValueArray(this.translate, TRANSLATIONS_LIST_SURVEY_ISSUER_TYPE);
  }

  protected setMiscAttachmentIds(event: string[]): void {
    this.survey.miscAttachmentIds = event;
  }

  protected setTechnicalMetadataId(event: string): void {
    this.survey.technicalMetadataId = event;
  }

  protected confirmCancel(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('survey.form.confirm.cancel-message'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.router.navigate([`/${environment.surveySharedUrlContext}`])
    });
  }

  checkTransmitRequirements(): boolean {
    // coordinates system, order, Z, ref ver, file sep
    if (!this.survey.achievementPeriod || !this.survey.achievementPeriod.dateStart || !this.survey.achievementPeriod.dateEnd) {
      this.showError('survey.form.errors.achievement-period-missing-or-invalid');
      return false;
    }

    if (!this.survey.surveyIssuerTypes?.length) {
      this.showError('survey.form.errors.issuer-types-missing');
      return false;
    }

    if (!this.survey.producerOrganization) {
      this.showError('survey.form.errors.producer-organization-missing');
      return false;
    }

    if (!this.survey.ownerOrganization) {
      this.showError('survey.form.errors.owner-organization-missing');
      return false;
    }

    if (!this.survey.goal) {
      this.showError('survey.form.errors.goal-missing');
      return false;
    }

    if (!this.survey.activityChoice || (this.survey.activityChoice as string) === 'null'
        || !this.survey.broadcastRestriction || (this.survey.broadcastRestriction as string) === 'null') {
      this.showError('survey.form.errors.activity-broadcast-restriction-missing');
      return false;
    }

    if (!this.survey.epsg) {
      this.showError('survey.form.errors.epsg-missing');
      return false;
    }

    if (!this.survey.coordinatesOrder) {
      this.showError('survey.form.errors.coordinates-order-missing');
      return false;
    }

    if (!this.survey.directionZ) {
      this.showError('survey.form.errors.z-direction-missing');
      return false;
    }

    if (!this.survey.verticalRef) {
      this.showError('survey.form.errors.vertical-ref-missing');
      return false;
    }

    if (!this.survey.fileSeparator) {
      this.showError('survey.form.errors.file-separator-missing');
      return false;
    }

    if (!this.survey.technicalMetadataId) {
      this.showError('survey.form.errors.technical-metadata-file-missing');
      return false;
    }

    return true;
  }

  protected confirmTransmit(event: Event): void {
    if (this.disableTransmit || !this.saveForm() || !this.checkTransmitRequirements()) {
      return;
    }
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('survey.form.confirm.transmit-message'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.showTransmitPopup()
    });
  }

  private showTransmitPopup(): void {
    // popup d'info
    this.displayPopup = true;
  }

  onTransmitPopupClose(): void {
    this.displayPopup = false;
    this.transmit();
  }

  private transmit(): void {
    this.surveyService.transmitDeposit$(this.survey)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.refreshButtonsStatus();
          this.showToast('message.success.api.survey-deposit.transmitted', 'success');
          this.router.navigate([`/${environment.surveySharedUrlContext}`]);
        },
        err => {
          this.refreshButtonsStatus();
          this.handleSaveError(err, 'transmit');
        }
      );
  }

  confirmDelete(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('survey.form.confirm.delete-message'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete()
    });
  }

  public delete(): void {
    this.surveyService.deleteDeposit$(this.survey.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.showToast('message.success.api.survey-deposit.deleted', 'success');
          this.router.navigate([`/${environment.surveySharedUrlContext}`]);
        },
        err => this.handleSaveError(err, 'delete')
      );
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }
}
