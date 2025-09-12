import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { SurveyTestEdition, defaultValuesSurveyTestEdition } from '@app/survey/models/survey.model';
import { surveyServiceProvider } from '@app/survey/providers/survey.service.provider';
import { AbstractSurveyService } from '@app/survey/services/survey.service';
import { TranslateService } from '@ngx-translate/core';
import { pick } from 'lodash-es';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';
import { AbstractSurveyCreationComponent } from '../abstract-survey.component';

@Component({
  selector: 'survey-test',
  templateUrl: './survey-test.component.html',
  styleUrls: ['../abstract-survey.component.scss'],
  providers: [ surveyServiceProvider ]
})
@Localize()
export class SurveyTestComponent extends AbstractSurveyCreationComponent<SurveyTestEdition> implements OnChangeLang {

  constructor(protected readonly formBuilder: UntypedFormBuilder,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly router: Router,
    protected readonly confirmationService: ConfirmationService,
    protected readonly surveyService: AbstractSurveyService) {
    super(formBuilder, alertMessageService, translate, activatedRoute, router, confirmationService, surveyService);
    this.initData(defaultValuesSurveyTestEdition);
  }

  protected getSurveyById$(id: string): Observable<SurveyTestEdition> {
    return this.surveyService.getTestById$(id);
  }

  protected initForm(): void {
    this.surveyForm = this.formBuilder.group({
      surveyDescription: [{
        nameAndLocation: this.survey.nameAndLocation,
        areaId: this.survey.areaId,
        achievementPeriod: this.survey.achievementPeriod,
        serviceId: this.survey.serviceId
      }],
      surveyBathyData: [{
        geographicFormat: this.survey.geographicFormat,
        epsg: this.survey.epsg,
        coordinatesOrder: this.survey.coordinatesOrder,
        directionZ: this.survey.directionZ,
        verticalRef: this.survey.verticalRef,
        fileSeparator: this.survey.fileSeparator
      }]
    });
  }

  protected getFormFields(formValue: any): any {
    return pick(formValue, [
      'geographicFormat',
      'epsg',
      'coordinatesOrder',
      'directionZ',
      'verticalRef',
      'fileSeparator'
    ]);
  }

  protected saveForm(): boolean {

    if (!this.surveyForm.valid || !this.surveyDescriptionForm.isFormValid || !this.bathyMetadataForm.isFormValid || this.invalidDate) {
      this.showError('survey.form.errors.field-invalid');
      return false;
    }

    if (!this.survey.bathyAttachmentIds?.length) {
      this.showError('survey.form.errors.bathy-file-missing');
      return false;
    }

    this.survey = {
      ...this.survey,
      ...this.surveyDescription.value,
      ...this.surveyBathyData.value
    };

    this.survey.serviceId = this.surveyDescriptionForm.serviceId.value;

    this.formatDatesForCreation(this.survey);

    return true;
  }

  protected buildLocalizedItems(): void { }

  protected createSurvey(): void {
    this.surveyService.createTest$(this.survey)
      .pipe(this.scavenger.collect())
      .subscribe(
        id => {
          this.survey.id = id;
          this.showToast('message.success.api.survey-test.created', 'success');
          this.goToTables();
        },
        err => this.handleSaveError(err)
      );
  }

  protected updateSurvey(): void {
    this.surveyService.updateTest$(this.survey)
      .pipe(this.scavenger.collect())
      .subscribe(
        id => {
          this.survey.id = id;
          this.showToast('message.success.api.survey-test.updated', 'success');
          this.goToTables();
        },
        err => this.handleSaveError(err, 'update')
      );
  }

  protected confirmCancel(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('survey.form.confirm.cancel-message'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.goToTables()
    });
  }

  private goToTables(): void {
    this.router.navigate(['survey/tables']);
  }
}
