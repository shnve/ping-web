import { DownloadService } from '@admin-warning/services/download.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize } from '@app/core/localize';
import { InfosourceStatus } from '@app/infosource/models/infosource.model';
import { MessageSeverity } from '@app/models/alert-message.model';
import { noWhitespaceValidator } from '@app/shared/ui-utils';
import { AttachmentSurveyResult, SurveyDetails, SurveyFileComplianceAnalysisState, SurveyFileStatisticFields, SurveyIssuerType, SurveyProcessingStatusEnum, SurveyStateEnum, TRANSLATIONS_LIST_SURVEY_ACTIVITY, TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION } from '@app/survey/models/survey.model';
import { SurveyTranslateWithListPipe } from '@app/survey/pipes/survey-translate-with-list.pipe';
import { AbstractSurveyService } from '@app/survey/services/survey.service';
import { TranslateService } from '@ngx-translate/core';
import { CreationAttachment } from '@shared/components/attachments/attachment.model';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';

@Component({
  selector: 'survey-modal-body',
  templateUrl: './survey-modal-body.component.html',
  styleUrls: ['./survey-modal-body.component.scss'],
  providers: [SurveyTranslateWithListPipe]
})
@Localize()
export class SurveyModalBodyComponent implements OnChanges, OnDestroy {

  @Input() survey: SurveyDetails;
  public readonly enumIssuerType = SurveyIssuerType;
  private readonly scavenger = new Scavenger(this);
  protected readonly listSurveyActivity = TRANSLATIONS_LIST_SURVEY_ACTIVITY;
  protected readonly listSurveyBroadcastRestriction = TRANSLATIONS_LIST_SURVEY_BROADCAST_RESTRICTION;
  protected canShowDataProcessed = false;
  protected processingStatus: string;

  protected canShowFieldForDraftAndTransmittedSurvey: boolean = false;
  protected readonly SurveyFileComplianceAnalysisState = SurveyFileComplianceAnalysisState;
  protected readonly SurveyFileStatisticFields = SurveyFileStatisticFields;

  protected readonly confirmReport = 'confirmReport';

  protected commentForm: UntypedFormGroup;
  private commentFormInitialValues: UntypedFormGroup;
  protected canUpdateComment = false;

  constructor(protected readonly translate: TranslateService,
    private readonly downloadService: DownloadService,
    private readonly surveyService: AbstractSurveyService,
    private readonly confirmationService: ConfirmationService,
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    protected readonly alertMessageService: AlertMessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.survey && this.survey) {
      this.initForm();
      this.canUpdateComment = this.checkIfCanEditComment();
      this.canShowFieldForDraftAndTransmittedSurvey = SurveyStateEnum.TEST !== this.survey?.state;
      this.processingStatus = this.survey.surveyExternalAnalysisResults?.processingStatus ?? SurveyProcessingStatusEnum.NOT_AVAILABLE;
      this.canShowDataProcessed = !!this.survey.surveyExternalAnalysisResults?.enc?.length
        || !!this.survey.surveyExternalAnalysisResults?.resultFiles?.length
        || !!this.survey.surveyExternalAnalysisResults?.surveyFilesExternalAnalysisResults?.length;
    }
  }

  ngOnDestroy() { }

  initForm(): void {
    this.commentForm = this.formBuilder.group({
      comment: [this.survey.briInternalComment, noWhitespaceValidator]
    });
    this.commentForm.disable();
    this.commentFormInitialValues = this.commentForm.value;
  }

  protected checkIfCanEditComment(): boolean {
    return this.authService.isBri() && this.survey.state === SurveyStateEnum.TRANSMITTED;
  }

  onSubmit(): void {
    this.commentForm.disable();
    this.saveForm();
  }

  saveForm(): void {
    this.surveyService.updateBriInternalComment$(this.survey.id, this.commentForm.value.comment)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.commentFormInitialValues = this.commentForm.value;
          this.showToast(this.translate.instant('infosource.details.update-comment.success'), 'success');
        },
        () => {
          this.commentForm.enable();
          this.showToast(this.translate.instant('infosource.details.update-comment.error'));
        }
      );
  }

  cancel(): void {
    this.commentForm.reset(this.commentFormInitialValues);
    this.commentForm.disable();
  }

  protected open(event: Event, attachment: AttachmentSurveyResult | CreationAttachment): void {
    this.downloadService.download(attachment.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        response => saveAs(response.body, response.headers.get('filename')),
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-download-file'
          });
          return throwError(err);
        });
    event.preventDefault();
  }

  get comment() {
    return this.commentForm.get('comment');
  }

  get hasAtLeastOneValidSurveyFile(): boolean {
    return !!this.survey.bathyAttachmentFiles.find(f =>
      !f.archive && f.compliant === SurveyFileComplianceAnalysisState.COMPLIANT
      || f.archive && f.filesInArchive.find(fia => fia.compliant === SurveyFileComplianceAnalysisState.COMPLIANT)
    );
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  protected confirmReporting(event: Event): void {
    this.confirmationService.confirm({
      key: this.confirmReport,
      target: event.target,
      message: this.translate.instant('survey.form.confirm.report-message'),
      acceptLabel: this.translate.instant('infosource.choice.new-danger-confirmation.acceptLabel'),
      rejectLabel: this.translate.instant('detail.cancel'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.report()
    });
  }

  private report(): void {
    this.surveyService.report$(this.survey.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        (infosourceIdLinkToReportedSurvey: string) => {
          this.showToast(this.translate.instant('survey.details.report.report-success'), 'success');
          this.router.navigate([`/infosource/report-bathy-danger/${infosourceIdLinkToReportedSurvey}`],
            { state: { status: InfosourceStatus.DRAFT } });
        },
        () => this.showToast(this.translate.instant('survey.details.report.report-error'), 'error'));
  }
}
