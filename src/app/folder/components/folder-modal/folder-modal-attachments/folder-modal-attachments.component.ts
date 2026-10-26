import { DownloadService } from '@admin-warning/services/download.service';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { FolderAttachment } from '@app/folder/models/folder-attachments.model';
import { Folder } from '@app/folder/models/folder.model';
import { folderServiceProvider } from '@app/folder/providers/folder.service.provider';
import { FolderService } from '@app/folder/services/folder.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { MaritimeServiceGroup } from '@app/models/maritime-service.model';
import { AttachmentService } from '@app/shared/services/attachment.service';
import { TranslateService } from '@ngx-translate/core';
import { Column } from '@shared/components/paginated-table/paginated-table.component';
import { isIsoDate } from '@shared/date-utils';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { formatSize, showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import moment from 'moment/moment';
import { Accordion } from 'primeng/accordion';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'folder-modal-attachments',
  templateUrl: './folder-modal-attachments.component.html',
  styleUrls: ['./folder-modal-attachments.component.scss'],
  providers: [
    folderServiceProvider
  ]
})
@Localize()
export class FolderModalAttachmentsComponent implements OnInit, OnChanges, OnDestroy, OnChangeLang {
  private readonly scavenger = new Scavenger(this);
  readonly dateFormat = 'dd/mm/yy';

  @Input() folder: Folder;
  @Input() canEditOrDelete: boolean;
  @Output() attachmentsChanged = new EventEmitter<void>();
  maritimeServices$: Observable<MaritimeServiceGroup[]>;
  displayedLabel: string;

  tableFolderAttachments: FolderAttachment[] = [];
  clonedAttachments: { [id: string]: FolderAttachment } = {};
  @Input() editMode: boolean;
  columns: Column[] = [];
  now: Date;
  @ViewChild('attachmentsAccordion') attachmentsAccordion: Accordion;

  @Output() attachmentSelected = new EventEmitter<string[]>();
  selectedAttachmentsIdsForCreatingStudy: FolderAttachment[] = [];

  canSelectAttachment = false;

  constructor(
    protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    protected readonly confirmationService: ConfirmationService,
    protected readonly maritimeServicesApi: MaritimeServicesApi,
    protected readonly folderService: FolderService,
    protected readonly downloadService: DownloadService,
    protected readonly cdRef: ChangeDetectorRef,
    protected readonly attachmentService: AttachmentService,
    protected readonly formatDatetimePipe: FormatDatetimePipe) {
  }

  ngOnInit(): void {
    this.columns = [
      { key: 'filename', translateKey: 'folder-modal-attachments.columns.filename' },
      { key: 'comment', translateKey: 'folder-modal-attachments.columns.comment' },
      { key: 'receptionDate', translateKey: 'folder-modal-attachments.columns.receptionDate' },
      { key: 'maritimeService', translateKey: 'folder-modal-attachments.columns.maritimeService' }
    ];

    if (this.canEditOrDelete) {
      this.columns.push({ key: 'action', translateKey: 'folder-modal-attachments.columns.action' });
    }

    this.editMode = false;
    this.now = new Date();
    this.onChangeLang();
    this.checkIfCanSelectAttachment();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.folder && this.folder) {
      this.constructTableFolderAttachments();
    }
  }

  private constructTableFolderAttachments(): void {
    this.tableFolderAttachments = [];
    this.cdRef.detectChanges();
    this.tableFolderAttachments.push(...this.folder.attachments);
    this.tableFolderAttachments.forEach(folderAttachment => {
      if (folderAttachment.maritimeService) {
        folderAttachment.maritimeService.internationalName = folderAttachment.maritimeService.internationalName ?? folderAttachment.maritimeService.name;
      }
    });
    this.tableFolderAttachments.sort((a, b) => moment(a.receptionDate) >= moment(b.receptionDate) ? 1 : -1);
  }

  onRowEditInit(folderAttachment: FolderAttachment): void {
    this.now = new Date();
    this.clonedAttachments[folderAttachment.id] = { ...folderAttachment };
    folderAttachment.receptionDate = new Date(folderAttachment.receptionDate);
    this.editMode = true;
    this.canSelectAttachment = false;
  }

  onRowEditSave(folderAttachment: FolderAttachment, index: number): void {
    if (folderAttachment.id) {
      this.folderService.updateFolderAttachment$(folderAttachment)
        .pipe(this.scavenger.collect())
        .subscribe(
          () => {
            this.showToast(this.translate.instant('message.success.api.folder-attachment.updated'), 'success');
            this.attachmentsChanged.emit();
            delete this.clonedAttachments[folderAttachment.id];
            this.canSelectAttachment = true;
          },
          () => {
            this.tableFolderAttachments[index] = this.clonedAttachments[folderAttachment.id];
            delete this.clonedAttachments[folderAttachment.id];
            this.showToast(this.translate.instant('message.error.api.cannot-update-folder-attachment'), 'error');
          }
        );
    } else {
      this.folderService.addAttachmentToFolder$(this.folder.id, folderAttachment)
        .pipe(this.scavenger.collect())
        .subscribe(
          () => {
            this.showToast(this.translate.instant('message.success.api.folder-attachment.added'), 'success');
            this.attachmentsChanged.emit();
            this.canSelectAttachment = true;
          },
          () => {
            if (folderAttachment.attachmentId) {
              this.attachmentService.removeAttachment(folderAttachment.attachmentId)
                .pipe(this.scavenger.collect())
                .subscribe();
            }
            this.tableFolderAttachments.pop();
            this.showToast(this.translate.instant('message.error.api.cannot-add-folder-attachment'), 'error');
          }
        );
    }

    this.editMode = false;
  }

  onRowEditCancel(folderAttachment: FolderAttachment, index: number): void {
    if (folderAttachment.id) {
      this.tableFolderAttachments[index] = this.clonedAttachments[folderAttachment.id];
      delete this.clonedAttachments[folderAttachment.id];
    } else {
      if (folderAttachment.attachmentId) {
        this.attachmentService.removeAttachment(folderAttachment.attachmentId)
          .pipe(this.scavenger.collect())
          .subscribe();
      }

      this.tableFolderAttachments.pop();
    }

    this.editMode = false;
    this.checkIfCanSelectAttachment();
  }

  confirmDelete(event: Event, folderAttachment: FolderAttachment): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('folder-modal-attachments.delete-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete(folderAttachment);
      }
    });
  }

  delete(folderAttachment: FolderAttachment): void {
    this.folderService.deleteAttachmentFromFolder$(folderAttachment.id)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          this.showToast(this.translate.instant('message.success.api.folder-attachment.deleted'), 'success');
          this.attachmentsChanged.emit();
          this.checkIfCanSelectAttachment();
        },
        () => {
          this.showToast(this.translate.instant('message.error.api.cannot-delete-folder-attachment'), 'error');
        });
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  setAttachmentsIds(attachmentId: string, folderAttachment: FolderAttachment): void {
    folderAttachment.attachmentId = attachmentId;
  }

  onChangeLang(): void {
    this.displayedLabel = this.translate.currentLang === 'es' ? 'name' : 'internationalName';
    this.maritimeServices$ = this.maritimeServicesApi.getMaritimeServices()
      .pipe(map(maritimeServices => {
        const maritimeServicesOfFolderArea: MaritimeServiceGroup = {
          name: this.translate.instant('folder-modal-attachments.maritime-services-of-folder-area'),
          maritimeServices: []
        };

        const otherMaritimeServices: MaritimeServiceGroup = {
          name: this.translate.instant('folder-modal-attachments.other-maritime-services'),
          maritimeServices: []
        };

        maritimeServices.forEach(maritimeService => {
          maritimeService.internationalName = maritimeService.internationalName ?? maritimeService.name;
          if (maritimeService.areas.includes(this.folder.areaId)) {
            maritimeServicesOfFolderArea.maritimeServices.push(maritimeService);
          } else {
            otherMaritimeServices.maritimeServices.push(maritimeService);
          }
        });

        return [maritimeServicesOfFolderArea, otherMaritimeServices];
      }));
  }

  open(event: Event, folderAttachment: FolderAttachment): void {
    this.downloadService.download(folderAttachment.attachmentId)
      .pipe(this.scavenger.collect())
      .subscribe(response => saveAs(response.body, response.headers.get('filename')));
    event.preventDefault();
  }

  formatFileSize(bytes): string {
    const suffix = this.translate.instant('attachments.byte-unit');
    return formatSize(bytes, suffix);
  }

  formatReceptionDate(receptionDate: Date): string {
    if (receptionDate && isIsoDate(receptionDate.toString().replace(/\.\d*Z/, 'Z'))) {
      return this.formatDatetimePipe.transform(receptionDate);
    }

    return '';
  }

  newAttachmentRow(): FolderAttachment {
    return {
      maritimeService: {
        id: '',
        name: '',
        internationalName: ''
      }
    };
  }

  setEditMode(event: Event): void {
    this.editMode = true;
    this.canSelectAttachment = false;
    if (this.attachmentsAccordion.tabs[0].selected) {
      event.stopPropagation();
    }
  }

  selectAttachment(): void {
    this.attachmentSelected.emit(this.selectedAttachmentsIdsForCreatingStudy.map(attachment => attachment.id));
  }

  checkIfCanSelectAttachment(): void {
    this.canSelectAttachment = this.canEditOrDelete && this.tableFolderAttachments.every(attachment => attachment.id);
  }

  ngOnDestroy(): void {
  }
}
