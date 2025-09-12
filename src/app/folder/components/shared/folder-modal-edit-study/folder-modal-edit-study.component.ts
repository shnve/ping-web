import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { StudyApi } from '@app/api/admin/study-admin.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StudyReferencesComponent } from '@app/folder/components/shared/folder-modal-edit-study/study-references/study-references.component';
import { FolderAttachment } from '@app/folder/models/folder-attachments.model';
import { FolderService } from '@app/folder/services/folder.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { Notion, NotionType } from '@app/models/notion.model';
import { FolderStudy, StudyBase } from '@app/models/study.model';
import { FormatWarningNumberPipe } from '@app/shared/pipes/format-warning-number.pipe';
import { TranslateService } from '@ngx-translate/core';
import { showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { ConfirmationService } from 'primeng/api';

const INFONAUT_NUMBER_REGEX = /^\s*(?<digit>\d{4})[\/](?<year>\d{2})\s*$/;

@Component({
  selector: 'folder-modal-edit-study',
  templateUrl: './folder-modal-edit-study.component.html',
  styleUrls: ['./folder-modal-edit-study.component.scss']
})
export class FolderModalEditStudyComponent implements OnDestroy {
  private readonly scavenger = new Scavenger();

  @Input() folderNotions: Notion[] = [];
  @Input() folderAttachments: FolderAttachment[] = [];
  @Input() folderStudies: FolderStudy[] = [];
  @Output() studySaved = new EventEmitter<void>();
  @Output() studyCreated = new EventEmitter<void>();
  @Input() folderId: string;

  @ViewChild('references') studyReferences: StudyReferencesComponent;

  displayModal = false;
  studyForm: UntypedFormGroup;
  studyIdToUpdate: string;
  optionsFolderNotions = [];
  selectedNotionsIds = [];
  serviceId: string;

  constructor(protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly confirmationService: ConfirmationService,
    protected readonly folderService: FolderService,
    protected readonly studyApi: StudyApi,
    protected readonly formBuilder: UntypedFormBuilder,
    protected readonly formatWarningNumberPipe: FormatWarningNumberPipe) {
    this.studyForm = this.formBuilder.group({
      number: ['', Validators.required],
      notionsIds: [[]],
      attachmentsIds: [[]],
      references: [[]]
    });
  }

  saveStudy(): void {
    if (!this.studyForm.valid || !this.studyForm.get('number').value.match(INFONAUT_NUMBER_REGEX)) {
      this.showToast(this.translate.instant('study.errors.invalid-infonaut-number-pattern'));
      return;
    }

    this.studyReferences.saveReferences();
    const isAllReferencesValid = this.studyReferences.references.every(reference => reference.value) || this.studyReferences.references.length === 0;
    if (!isAllReferencesValid) {
      this.showToast(this.translate.instant('study.errors.reference-invalid'));
      return;
    }

    const infonautNumberAlreadyExist = this.folderStudies?.some(folderStudy => this.studyIdToUpdate !== folderStudy.id && folderStudy.number === this.studyForm.get('number').value);

    if (infonautNumberAlreadyExist) {
      this.showToast(this.translate.instant('study.errors.infonaut-number-already-exist'));
      return;
    }

    const study: StudyBase = {
      id: this.studyIdToUpdate ?? null,
      folderId: this.folderId,
      ...this.studyForm.getRawValue(),
      references: this.studyReferences.references
    };

    const messageDetail = this.studyIdToUpdate ? 'update' : 'create';

    this.studyApi.saveStudy$(study).pipe(this.scavenger.collect()).subscribe(
      () => {
        this.studyForm.get('number').setValue([]);
        this.studyForm.get('notionsIds').setValue('');
        this.studyForm.get('attachmentsIds').setValue([]);
        this.displayModal = false;
        this.showToast(this.translate.instant(`study.${messageDetail}.${messageDetail}-success`), 'success');
        this.studyIdToUpdate ? this.studySaved.emit() : this.studyCreated.emit();
      },
      () => this.showToast(this.translate.instant(`study.${messageDetail}.${messageDetail}-error`))
    );
  }

  buildNotionsItems(studyNotionsIds: string[]): void {
    this.optionsFolderNotions = [];
    this.selectedNotionsIds = [];

    this.optionsFolderNotions = [
      {
        label: this.translate.instant('study.type.warnings'),
        items: []
      },
      {
        label: this.translate.instant('study.type.infosources'),
        items: []
      },
      {
        label: this.translate.instant('study.type.georegulations'),
        items: []
      }
    ];

    this.folderNotions.forEach(notion => {
      switch (notion.type) {
        case NotionType.WARNING:
          this.optionsFolderNotions[0].items.push({ key: notion.id, number: this.formatWarningNumberPipe.transform(notion.warning) });
          break;
        case NotionType.WARNING_TP:
          this.optionsFolderNotions[0].items.push({ key: notion.id, number: this.formatWarningNumberPipe.transform(notion.warningTP) });
          break;
        case NotionType.INFOSOURCE:
          this.optionsFolderNotions[1].items.push({ key: notion.id, number: notion.number });
          break;
        case NotionType.GEOREGULATION:
          this.optionsFolderNotions[2].items.push({ key: notion.id, number: notion.number });
          break;
        default:
          break;
      }
    });

    this.studyForm.get('notionsIds').setValue(studyNotionsIds);
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  cancel(): void {
    this.displayModal = false;
  }

  ngOnDestroy(): void { }

  get references(): FormArray {
    return this.studyForm.get('references') as FormArray;
  }

  isFormInvalid() {
    return !this.studyForm.valid;
  }
}
