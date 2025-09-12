import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { StudyReference, StudyReferencesTypeEnum, TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE } from '@app/folder/models/folder-study.model';
import {
  InfosourceNature,
  InfosourceObjectMapKeys,
  InfosourcePart,
  InfosourceStatus,
  InfosourceWithParts
} from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { ServiceRole } from '@app/models/maritime-service.model';
import { AttachmentDownload } from '@app/models/warning.model';
import { NotionTypeEnum } from '@app/shared/components/add-notion-to-folder-selection/notion-type-enum';
import { sortAlphabetically } from '@app/shared/generic-utils';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { noWhitespaceValidator, showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { Observable, throwError } from 'rxjs';

@Component({
  selector: 'infosource-modal-body',
  templateUrl: './infosource-modal-body.component.html',
  styleUrls: ['./infosource-modal-body.component.scss'],
  providers: [
    infosourceServiceProvider
  ]
})
@Localize()
export class InfosourceModalBodyComponent implements OnChangeLang, OnDestroy, OnChanges {

  readonly infosourceObjectMapKeys = InfosourceObjectMapKeys;
  private readonly scavenger = new Scavenger();
  private commentFormInitalValues: UntypedFormGroup;

  @Input() infosource: InfosourceWithParts;
  @Input() displayAdminParts = true;
  @Input() canUpdateComment = false;
  @Input() commentForm: UntypedFormGroup;
  @Input() transferred = new Observable<void>();
  @Input() serviceSelectedId: string;
  @Input() issuingServiceId: string;
  @Input() shouldDisplayStatusByService = false;
  @Output() featurePartClicked = new EventEmitter<InfosourcePart>();
  @Output() allFeaturesVisualized = new EventEmitter<void>();
  isNatureGeoregulation = false;
  isForecast = false;

  featurePartBeingVisualized: number;
  notionType = NotionTypeEnum;

  private studyReferences: StudyReference[] = [];

  protected folderReferences: string[] = [];

  constructor(
    private readonly downloadService: DownloadService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly translate: TranslateService,
    private readonly alertMessageService: AlertMessageService,
    private readonly infosourceService: AbstractInfosourceService,
    private readonly authService: AuthService,
    private readonly userApi: UsersApi
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.infosource && this.infosource) {
      this.initForm();
      this.canUpdateComment = this.checkIfCanEditComment();
      this.isNatureGeoregulation = this.infosource.nature === InfosourceNature.GEOREGULATION;
      this.isForecast = this.infosource.nature === InfosourceNature.ACTIVITY_FORECAST;

      this.loadFolderReferencesLinkedToInfosource();
    }
  }

  initForm(): void {
    this.commentForm = this.formBuilder.group({
      comment: [this.infosource.comment, noWhitespaceValidator]
    });
    this.commentForm.disable();
    this.commentFormInitalValues = this.commentForm.value;
  }

  onChangeLang(langChangeEvent: LangChangeEvent): void {
    this.buildFolderReferences();
  }

  get comment() {
    return this.commentForm.get('comment');
  }

  get infosourceStatus(): string {
    return `enum.infosource-status.${this.infosource.status.toLowerCase()}`;
  }

  get infosourceRejectComment(): string {
    return this.infosource.status === InfosourceStatus.REJECTED && !!this.infosource.rejectComment?.length ? `(${this.infosource.rejectComment})` : '';
  }

  get infosourceCreationDate(): string {
    return `${this.infosource.creationDate}`;
  }

  get infosourceLastUpdate(): string {
    return `${this.infosource.lastUpdate}`;
  }

  private loadFolderReferencesLinkedToInfosource(): void {
    this.infosourceService.getFolderReferencesByFolderLinkedToInfosource$(this.infosource.id)
      .pipe(this.scavenger.collectByKey('infosourceService.getFolderReferencesByFolderLinkedToInfosource$'))
      .subscribe(ref => {
        const references = ref.flatMap(reference => reference.studyReferences);
        this.studyReferences = sortAlphabetically(references, 'value');
        this.buildFolderReferences();
      });
  }

  private buildFolderReferences(): void {
    this.folderReferences = this.studyReferences
      .map((studyReference: StudyReference) => `${this.getReferenceTypeLabel(studyReference.type)} - ${studyReference.value}`).reverse();
  }

  private getReferenceTypeLabel(referenceType: StudyReferencesTypeEnum): string {
    return this.translate.instant(TRANSLATIONS_LIST_STUDY_REFERENCES_TYPE.find(reference => reference.type === referenceType).label);
  }

  get infosourceUserName(): string {
    const issuingUserFirstname = this.infosource.issuingUserFirstname ?? '';
    const issuingUserLastname = this.infosource.issuingUserLastname ?? '';
    if (!issuingUserFirstname.length && !issuingUserLastname.length) {
      return '';
    }
    return `(${issuingUserFirstname} ${issuingUserLastname})`;
  }

  private hasLocalisation(part: InfosourcePart): boolean {
    return part.localisation?.length > 0;
  }

  open(event: Event, attachment: AttachmentDownload): void {
    this.downloadService.download(attachment.id)
      .pipe(this.scavenger.collect())
      .subscribe(response => saveAs(response.body, response.headers.get('filename')));
    event.preventDefault();
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  checkIfCanEditComment(): boolean {
    const authUser = this.authService.getAuthenticatedUser();
    return this.authService.isProUser() &&
      (authUser.serviceId === this.infosource.issuingServiceId || this.infosource.recipients
        .map(recipient => recipient.id)
        .some(serviceId => this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], serviceId)));
  }

  onSubmit(): void {
    this.commentForm.disable();
    this.saveForm();
  }

  saveForm(): void {
    this.infosourceService.updateInfosourceComment$(this.infosource.id, this.commentForm.value.comment)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.commentFormInitalValues = this.commentForm.value;
          this.showToast(this.translate.instant('infosource.details.update-comment.success'), 'success');
        },
        err => {
          this.commentForm.enable();
          this.handleSaveError(err);
        }
      );
  }

  protected handleSaveError(err: any): Observable<Error> {
    let toastMessageKey = 'infosource.details.update-comment.error';

    if (Object.values(err.error?.['invalid-arguments']).some(errorMessage => errorMessage === 'validation.no-html-content-allowed')) {
      toastMessageKey = 'message.error.api.cannot-save-form.validation.no-html-content-allowed';
    }

    this.showToast(toastMessageKey);
    return throwError(err);
  }

  cancel(): void {
    this.commentForm.reset(this.commentFormInitalValues);
    this.commentForm.disable();
  }

  ngOnDestroy(): void {
    // mandatory empty method for scavenger
  }

}
