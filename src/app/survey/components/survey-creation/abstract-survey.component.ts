import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { MessageSeverity } from '@app/models/alert-message.model';
import { formatPeriodForCreation, formatPeriodForEdition } from '@app/shared/date-utils';
import { handleEnterKeyPress } from '@app/shared/ui-utils';
import { SurveyBase, SurveyWithAchievementPeriodMandatory } from '@app/survey/models/survey.model';
import { surveyServiceProvider } from '@app/survey/providers/survey.service.provider';
import { AbstractSurveyService } from '@app/survey/services/survey.service';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { cloneDeep } from 'lodash-es';
import { ConfirmationService } from 'primeng/api';
import { Observable, throwError } from 'rxjs';
import { share, switchMap } from 'rxjs/operators';
import { SharedSurveyBathyMetadataDescriptionComponent } from './shared-survey/shared-survey-bathy-metadata-description/shared-survey-bathy-metadata-description.component';
import { SharedSurveyDescriptionComponent } from './shared-survey/shared-survey-description/shared-survey-description.component';

@Component({
  selector: 'abstract-survey-creation',
  template: '',
  styleUrls: ['./abstract-survey.component.scss'],
  providers: [surveyServiceProvider]
})
@Localize()
export abstract class AbstractSurveyCreationComponent<T extends SurveyBase> implements OnInit, OnDestroy, OnChangeLang {

  @ViewChild('surveyDescription') surveyDescriptionForm: SharedSurveyDescriptionComponent;
  @ViewChild('bathyMetadata') bathyMetadataForm: SharedSurveyBathyMetadataDescriptionComponent;

  protected readonly scavenger = new Scavenger(this);
  protected readonly fileTypes = environment.survey.attachments.misc.fileTypes;
  protected readonly bathyFileTypes = environment.survey.attachments.bathy.fileTypes;
  protected readonly maxFileSize = environment.survey.attachments.maxFileSize;

  protected survey: T;
  protected survey$: Observable<T>;

  protected submitted = false;
  protected surveyForm: UntypedFormGroup;
  protected invalidDate = false;
  protected attachmentFields = {
    bathyAttachments: false,
    technicalMetadata: false,
    miscAttachments: false
  }

  enterKeyEvent = handleEnterKeyPress;

  constructor(protected readonly formBuilder: UntypedFormBuilder,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly router: Router,
    protected readonly confirmationService: ConfirmationService,
    protected readonly surveyService: AbstractSurveyService) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void { }

  onChangeLang(event: LangChangeEvent): void {
    this.buildLocalizedItems();
  }

  protected abstract buildLocalizedItems(): void;

  protected abstract createSurvey(): void;

  protected abstract updateSurvey(): void;

  protected abstract saveForm(): boolean;

  protected abstract initForm(): void;

  protected abstract getSurveyById$(id: string): Observable<T>;

  protected abstract getFormFields(formValue: any): any;

  protected initData(surveyInit: T): void {
    this.survey = cloneDeep(surveyInit);
    this.survey$ = this.activatedRoute.paramMap
      .pipe(
        switchMap(paramMap => paramMap.get('id') ? this.getSurveyById$(paramMap.get('id')) : null),
        share()
      );

    if (this.activatedRoute.snapshot?.params?.id) {
      this.survey$.pipe(this.scavenger.collect()).subscribe(survey => {
        this.survey = survey;
        this.formatDatesForEdition(this.survey);
        this.initForm();
      });
    }

    this.buildLocalizedItems();
  }


  get surveyDescription(): AbstractControl {
    return this.surveyForm?.get('surveyDescription');
  }

  get surveyBathyData(): AbstractControl {
    return this.surveyForm?.get('surveyBathyData');
  }

  protected handleSaveError(err: any, saveKey = 'create'): Observable<Error> {
    if (Object.keys(err).length) {
      if (err.hasOwnProperty('nameAndLocation')) {
        this.alertMessageService.add({
          summary: 'message.summary.error',
          severity: 'error',
          detail: `message.error.api.${err['nameAndLocation']}`
        });
        return;
      }

      if (err.hasOwnProperty('routing')) {
        this.alertMessageService.add({
          summary: 'message.summary.warn',
          severity: 'warn',
          detail: this.translate.instant(`${err['routing']}`)
        });
        return;
      }
    }
    this.showToast(`message.error.api.cannot-${saveKey}-survey`);
    return throwError(err);
  }

  protected showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  protected showError(msg: string): void {
    this.showToast(this.translate.instant(`message.error.api.cannot-${this.isCreationMode() ? 'create' : 'update'}-survey-deposit`) + ' : ' + this.translate.instant(msg), 'error');
  }

  protected getDisplayedAreaLabel(lang: string): string {
    return lang === 'fr' ? 'name' : 'internationalName';
  }

  protected isCreationMode(): boolean {
    return !this.survey?.id;
  }

  protected dateValidated(validDate: boolean): void {
    this.invalidDate = !validDate;
  }

  protected formatDatesForCreation(survey: Partial<SurveyWithAchievementPeriodMandatory>): void {
    survey.achievementPeriod = formatPeriodForCreation(survey.achievementPeriod);
  }

  protected formatDatesForEdition(survey: Partial<SurveyWithAchievementPeriodMandatory>): void {
    survey.achievementPeriod = formatPeriodForEdition(survey.achievementPeriod);
  }

  protected setBathyAttachmentIds(event: string[]): void {
    this.survey.bathyAttachmentIds = event;
  }

  protected handleUploadError(fieldId: string, event: boolean): void {
    this.attachmentFields[fieldId] = event;
  }

  validate(): void {
    if (this.saveForm()) {
      this.isCreationMode() ? this.createSurvey() : this.updateSurvey();
    }
    this.submitted = true;
  }
}
