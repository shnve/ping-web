import { AfterViewInit, Component, ContentChildren, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { StudyApi } from '@app/api/admin/study-admin.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { OnChangeLang } from '@app/core/localize';
import { FolderAttachment } from '@app/folder/models/folder-attachments.model';
import {
  StudyReference,
  StudyReferencesTypeEnum,
  StudyTable
} from '@app/folder/models/folder-study.model';
import { Folder, TRANSLATIONS_LIST_FOLDER_STATUS } from '@app/folder/models/folder.model';
import { MessageSeverity } from '@app/models/alert-message.model';
import { Notion } from '@app/models/notion.model';
import { FolderStudy, StudyStatusEnum } from '@app/models/study.model';
import { TemplateIdDirective } from '@app/shared/directives/template-id.directive';
import { sortAlphabetically } from '@app/shared/generic-utils';
import { accessLinkToNotion } from '@app/shared/notion-utils';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Column } from '@shared/components/paginated-table/paginated-table.component';
import { showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import moment from 'moment/moment';
import { ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';
import { FolderModalEditStudyComponent } from '../../shared/folder-modal-edit-study/folder-modal-edit-study.component';
import { FolderFormatReferenceTypeLabelPipe } from './../../../pipes/folder-format-reference-type-label.pipe';

@Component({
  selector: 'folder-modal-studies',
  templateUrl: './folder-modal-studies.component.html',
  styleUrls: ['./folder-modal-studies.component.scss']
})
export class FolderModalStudiesComponent implements AfterViewInit, OnInit, OnChanges, OnChangeLang, OnDestroy {
  @Input() folder: Folder;
  @Output() studyChanged = new EventEmitter<void>();
  @Input() canManageStudy = false;
  @Input() canEscape = false;

  @ViewChild('modalEditStudy') modalEditStudy: FolderModalEditStudyComponent;
  private readonly scavenger = new Scavenger();

  studyTable: StudyTable[];

  columns: Column[] = [];
  columnCellsMap: Map<string, TemplateRef<any>> = new Map();
  @ContentChildren(TemplateIdDirective) cells: QueryList<TemplateIdDirective>;

  availableStatus: Array<{ key: string, value: string }>;

  constructor(
    private readonly alertMessageService: AlertMessageService,
    private readonly translate: TranslateService,
    private readonly confirmationService: ConfirmationService,
    private readonly studyApi: StudyApi,
    private readonly formatDatetimePipe: FormatDatetimePipe,
    private readonly downloadService: DownloadService,
    private readonly folderFormatReferenceTypeLabelPipe: FolderFormatReferenceTypeLabelPipe) {
  }

  ngOnInit(): void {
    this.columns = [
      { key: 'number', translateKey: 'folder-modal-study.columns.number' },
      { key: 'studyDatas', translateKey: 'folder-modal-study.columns.study-datas' },
      { key: 'references', translateKey: 'folder-modal-study.columns.references' },
      { key: 'lastUpdate', translateKey: 'folder-modal-study.columns.last-update' }
    ];

    if (this.canManageStudy) {
      this.columns.push({ key: 'status', translateKey: 'folder-modal-study.columns.status' });
      this.columns.push({ key: 'action', translateKey: 'folder-modal-study.columns.actions' });
    }

    this.constructStudyFolderGraph();
    this.buildLocalizedStatusItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.folder && this.folder) {
      this.constructStudyFolderGraph();
    }
  }

  ngAfterViewInit(): void {
    // Map cells templates with their id
    this.cells.forEach(cell => cell.id && this.columnCellsMap.set(cell.id, cell.template));
  }

  private constructStudyFolderGraph(): void {
    this.studyTable = [];
    this.studyTable.push(...this.folder.studies);
    this.studyTable.sort((a, b) => moment(b.creationDate) >= moment(a.creationDate) ? 1 : -1);
    this.studyTable.forEach(study => {
      study.references = this.sortReferencesByValue(study.references);
    });
  }

  confirmDelete(event: Event, study: FolderStudy): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('study.delete.delete-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete(study);
      }
    });
  }

  updateStatus(statusId: string, status: StudyStatusEnum): void {
    this.studyApi.updateStatus$(statusId, status)
      .pipe(this.scavenger.collect())
      .subscribe(id => {
        this.showToast('study.update.status-update-success', 'success');
        this.studyChanged.emit();
      }, err => {
        this.showToast('study.update.status-update-error');
        return throwError(err);
      });
  }

  formatLastupdate(lastUpdate: Date): string {
    return this.formatDatetimePipe.transform(lastUpdate);
  }

  modifyStudy(study: FolderStudy): void {
    this.modalEditStudy.studyIdToUpdate = study.id;
    this.modalEditStudy.buildNotionsItems(
      this.folder.studies.find(folderStudy => folderStudy.id === this.modalEditStudy.studyIdToUpdate)?.notions.map(notion => notion.id) ?? []
    );
    const studyReferences = _.cloneDeep(study.references);
    studyReferences.sort((a, b) => {
      const typeA: string = this.getReferenceLabel(a.type);
      const typeB: string = this.getReferenceLabel(b.type);
      return typeA.localeCompare(typeB);
    });
    this.modalEditStudy.studyForm.get('attachmentsIds').setValue(study.attachments.map(attachment => attachment.id));
    this.modalEditStudy.studyForm.get('number').setValue(study.number);
    this.modalEditStudy.studyForm.get('references').setValue(studyReferences);
    this.modalEditStudy.displayModal = true;
  }

  delete(study: FolderStudy): void {
    this.studyApi.delete$(study.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.showToast(this.translate.instant('study.delete.delete-success'), 'success');
          this.studyChanged.emit();
        },
        () => this.showToast(this.translate.instant('study.delete.delete-error'))
      );
  }

  onStudySaved(): void {
    this.studyChanged.emit();
  }

  accessLinkToNotion(notion: Notion) {
    return accessLinkToNotion(notion);
  }

  downloadStudyDatas($event: any, notions: Notion[], folderAttachment: FolderAttachment[], infonautNumber: string) {
    let datas = 'notions: \n';
    notions.forEach(notion => {
      datas += accessLinkToNotion(notion) + '\n';
    });

    datas += '\nattachments: \n';
    folderAttachment.forEach(attachment => datas += `${environment.basePortalUrl.concat('/folder/attachments')}/${attachment.attachmentId}\n`);

    const blob = new Blob([datas], {
      type: 'text/plain;charset=utf-8'
    });
    saveAs(blob, `study-${infonautNumber}-notions-attachments-links.txt`);
    $event.preventDefault();
  }

  openAttachment(event: Event, folderAttachment: FolderAttachment): void {
    this.downloadService.download(folderAttachment.attachmentId)
      .pipe(this.scavenger.collect())
      .subscribe(response => saveAs(response.body, response.headers.get('filename')));
    event.preventDefault();
  }

  formatHeaderStudyDatas(notionsLength: number, attachmentsLength: number): string {
    return this.translate.instant('study.header-study-datas').replace('{{notionsLength}}', notionsLength).replace('{{attachmentsLength}}', attachmentsLength);
  }

  private sortReferencesByValue(references: StudyReference[]): StudyReference[] {
    return sortAlphabetically(references, 'value');
  }

  buildLocalizedStatusItems(): void {
    this.availableStatus = TRANSLATIONS_LIST_FOLDER_STATUS.map(({ key, value }) => ({
      key,
      value: this.translate.instant(value)
    }));
  }

  onChangeLang(): void {
    this.buildLocalizedStatusItems();
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  ngOnDestroy(): void { }

  getReferenceLabel(referenceType: StudyReferencesTypeEnum): string {
    return this.folderFormatReferenceTypeLabelPipe.transform(referenceType);
  }
}
