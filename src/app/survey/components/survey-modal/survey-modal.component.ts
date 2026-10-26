import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { LangService } from '@app/core/lang.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption, AreasFacade } from '@app/facades/areas.facade';
import { DetailsModalComponent } from '@app/shared/components/details-modal/details-modal.component';
import { getFilenameFromResponse } from '@app/shared/http-utils';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { SurveyDangerFactory } from '@app/sig/core/survey-danger.factory';
import { SurveyDetails, SurveyStateEnum } from '@app/survey/models/survey.model';
import { AbstractSurveyService } from '@app/survey/services/survey.service';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ExportPdfService } from '@shared/services/export-pdf.service';
import { saveAs } from 'file-saver';
import { isEmpty } from 'lodash-es';
import { MenuItem } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable } from 'rxjs';

const SURVEY_TABLES = '/survey/tables';

@Localize()
@Component({
  selector: 'survey-modal',
  templateUrl: './survey-modal.component.html',
  styleUrls: [
    '../../../shared/components/details-modal/details-modal.component.scss',
    './survey-modal.component.scss'
  ]
})
export class SurveyModalComponent extends DetailsModalComponent implements OnInit, OnChanges, OnChangeLang {

  @Input() surveyIds: string[];

  @Output() stateChanged = new EventEmitter<SurveyStateEnum>();

  @ViewChild('manageButton') manageButton: ElementRef;
  @ViewChild('clonePanel') clonePanel: OverlayPanel;

  protected surveyId: string;
  protected currentSurvey: SurveyDetails;
  protected items: MenuItem[] = [];
  protected canEdit = false;
  protected canClone = false;

  protected areas$: Observable<AreaSelectOption[]>;
  protected displayedAreaLabel: string;
  protected selectedNameAndLocation: string;
  protected selectedAreaId: string;
  protected canConfirmClone = false;

  protected isBri: boolean;
  protected enableBathyDangersIntegration: boolean;

  constructor(protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly langService: LangService,
    protected readonly authService: AuthService,
    protected readonly elRef: ElementRef,
    protected readonly getNumberForSearchedPart: GetNumberForSearchedPartPipe,
    protected readonly surveyDangerFactory: SurveyDangerFactory,
    private readonly surveyService: AbstractSurveyService,
    private readonly exportPdfService: ExportPdfService,
    private readonly router: Router,
    private readonly areasFacade: AreasFacade) {
    super(translate, alertMessageService, langService, elRef, authService, getNumberForSearchedPart);
    this.enableBathyDangersIntegration = environment.enableBathyDangersIntegration ?? false;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.isBri = this.authService.isBri();
    this.displayedAreaLabel = SurveyModalComponent.getDisplayedAreaLabel(this.translate.currentLang);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.surveyIds && this.surveyIds) {
      this.surveyId = this.surveyIds[this.currentPosition];
      this.loadSurvey();
      this.show();
    }
  }

  protected loadSurvey(): void {
    this.surveyService.getSurveyModalById$(this.surveyId)
      .pipe(this.scavenger.collect())
      .subscribe(survey => {
        this.currentSurvey = survey;
        // In the case of surveys, the condition for the boudingBox is that the user must enter at least one bathy file and that the analysis must be correct, otherwise no DETECT analysis will be performed.
        // If all is well, the map will be displayed with the boundingBox to indicate where the hazards will be after the analysis results are received.
        this.canDisplayMap = !!this.currentSurvey.boundingBox;
        this.formatSurveyDangerToFeature();
        this.stateChanged.emit(this.currentSurvey.state);
        this.updateSharedLinkUrl();
        this.canEdit = SurveyModalComponent.checkIfCanEdit(survey);
        this.buildManagementMenu();
      });
  }

  private formatSurveyDangerToFeature(): void {
    this.currentSurvey.featureParts = [];
    const surveyDangers = this.currentSurvey.surveyExternalAnalysisResults?.dangers ?? [];
    const surveyDetections = this.currentSurvey.surveyExternalAnalysisResults?.detections ?? [];

    // use same structure as other data for convenience purpose and compatibility with existing code
    const featureParts = [{
      dangers: this.surveyDangerFactory.createGeometries(surveyDangers),
      detections: this.surveyDangerFactory.createGeometries(surveyDetections, true)
    }];

    this.currentSurvey.featureParts = [...featureParts];
  }

  generatePdf(event: any): void {
    this.exportPdfService.exportSurveyModal(this.currentSurvey, this.mapComponent?.map.olMap);
    event.preventDefault();
  }

  public static getDisplayedAreaLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  private updateSharedLinkUrl(): void {
    if (!this.currentSurvey?.id) { return; }
    const url = window.location.href.split(SURVEY_TABLES)[0];
    this.currentSharedLinkUrl = `${url.concat(SURVEY_TABLES)}/${this.currentSurvey.id}`;
  }

  private static checkIfCanEdit(survey: SurveyDetails): boolean {
    return [SurveyStateEnum.DRAFT, SurveyStateEnum.TEST].includes(survey.state) && !survey.externalAnalysisInProgress;
  }

  edit(): void {
    const surveyState = this.currentSurvey.state === SurveyStateEnum.TEST ? 'notdeposit' : 'deposit';
    this.router.navigate([`/survey/${surveyState}/edition/${this.currentSurvey.id}`], { state: { status: this.currentSurvey.state } });
  }

  clone(event: Event): void {
    this.canConfirmClone = false;
    this.selectedNameAndLocation = '';
    this.selectedAreaId = '';
    this.areas$ = this.areasFacade.getAreaSelectOptions$();
    this.clonePanel.show(event, this.manageButton.nativeElement);
  }

  cancelClone(): void {
    this.clonePanel.hide();
  }

  confirmClone(): void {
    this.surveyService.clone$(this.currentSurvey.id, this.selectedNameAndLocation, this.selectedAreaId)
      .pipe(this.scavenger.collect())
      .subscribe(
        (clonedSurveyId: string) => {
          this.showToast(this.translate.instant('survey.details.clone.clone-success'), 'success');
          const surveyStateRoute = this.currentSurvey.state === SurveyStateEnum.TEST ? 'notdeposit' : 'deposit';
          const surveyState = this.currentSurvey.state === SurveyStateEnum.TEST ? SurveyStateEnum.TEST : SurveyStateEnum.DRAFT;
          this.router.navigate([`/survey/${surveyStateRoute}/edition/${clonedSurveyId}`], { state: { status: surveyState } });
        },
        () => this.showToast(this.translate.instant('survey.details.clone.clone-error'), 'error'));
  }

  private buildManagementMenu(): void {
    this.items = [];

    if (this.canEdit) {
      this.items.push({
        label: this.translate.instant('detail.edit'),
        command: () => this.edit(),
        title: this.translate.instant('detail.edit')
      });
    }

    this.items.push({
      id: 'clone',
      label: this.translate.instant('detail.clone'),
      command: (event: any) => this.clone(event.originalEvent),
      title: this.translate.instant('detail.clone')
    });
  }

  onChangeLang(event: LangChangeEvent): void {
    this.buildManagementMenu();
  }

  cloneInfoChanged(): void {
    this.canConfirmClone = !isEmpty(this.selectedNameAndLocation?.trim()) && !isEmpty(this.selectedAreaId);
  }

  downloadSurveyAsZipArchive(): void {
    this.surveyService.downloadSurveyAsZipArchive$(this.currentSurvey.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        response => saveAs(response.body, getFilenameFromResponse(response)),   // date_transmission_id_ping.zip
        (err) => {
          this.showToast(this.translate.instant('detail.download-survey-error'), 'error');
          console.error(err);
        }
      );
  }
}
