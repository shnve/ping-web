import { AfterViewInit, Component, ContentChildren, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize } from '@app/core/localize';
import { TableFolderGraph } from '@app/folder/models/folder-table.model';
import { Folder } from '@app/folder/models/folder.model';
import { folderServiceProvider } from '@app/folder/providers/folder.service.provider';
import { FolderService } from '@app/folder/services/folder.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { Notion } from '@app/models/notion.model';
import { accessLinkToNotion } from '@app/shared/notion-utils';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { TranslateService } from '@ngx-translate/core';
import { Column } from '@shared/components/paginated-table/paginated-table.component';
import { TemplateIdDirective } from '@shared/directives/template-id.directive';
import { showToast as showToastUtil } from '@shared/ui-utils';
import moment from 'moment/moment';
import { ConfirmationService } from 'primeng/api';
import { FolderModalAttachmentsComponent } from './../folder-modal-attachments/folder-modal-attachments.component';

@Component({
  selector: 'folder-modal-table',
  templateUrl: './folder-modal-table.component.html',
  styleUrls: [
    './folder-modal-table.component.scss'
  ],
  providers: [
    folderServiceProvider
  ]
})
@Localize()
export class FolderModalTableComponent implements AfterViewInit, OnInit, OnChanges {

  @Input() folder: Folder;
  @Input() canEditOrDeleteAttachments: boolean;
  @Output() notionOrAttachmentChanged = new EventEmitter<void>();
  @Output() notionRemoved = new EventEmitter<void>();
  @Output() notionSelected = new EventEmitter<string[]>();
  @Output() attachmentSelected = new EventEmitter<string[]>();

  tableFolderGraph: TableFolderGraph[] = [];

  columns: Column[] = [];
  columnCellsMap: Map<string, TemplateRef<any>> = new Map();
  @ContentChildren(TemplateIdDirective) cells: QueryList<TemplateIdDirective>;

  selectedNotionsForCreatingStudy: Notion[] = [];

  @ViewChild('modalFolderAttachmentTable') modalFolderAttachmentTable: FolderModalAttachmentsComponent;

  constructor(
    protected readonly alertMessageService: AlertMessageService,
    protected readonly translate: TranslateService,
    private readonly confirmationService: ConfirmationService,
    protected readonly folderService: FolderService,
    private readonly formatDatetimePipe: FormatDatetimePipe) {
  }

  ngOnInit(): void {
    this.columns = [
      { key: 'type', translateKey: 'folder-modal-table.columns.type' },
      { key: 'number', translateKey: 'folder-modal-table.columns.number' },
      { key: 'creationDate', translateKey: 'folder-modal-table.columns.creationDate' },
      { key: 'endDate', translateKey: 'folder-modal-table.columns.endDate' }
    ];

    if (this.canEditOrDeleteAttachments) {
      this.columns.push({ key: 'action', translateKey: 'folder-modal-table.columns.action' });
    }

    this.constructTableFolderGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.folder && this.folder) {
      this.constructTableFolderGraph();
    }
  }

  ngAfterViewInit(): void {
    // Map cells templates with their id
    this.cells.forEach(cell => cell.id && this.columnCellsMap.set(cell.id, cell.template));
  }

  private constructTableFolderGraph(): void {
    this.tableFolderGraph = [];
    this.tableFolderGraph.push(...this.folder.notions);
    this.tableFolderGraph.sort((a, b) => moment(a.creationDate) >= moment(b.creationDate) ? 1 : -1);
  }

  confirmDelete(event: Event, notion: Notion): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('notion.delete.delete-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete(notion);
      }
    });
  }

  delete(notion: Notion): void {
    this.folderService.deleteNotion$(this.folder.id, notion.id).subscribe(
      () => {
        this.showToast(this.translate.instant('notion.delete.delete-success'), 'success');
        this.notionOrAttachmentChanged.emit();
      },
      () => this.showToast(this.translate.instant('notion.delete.delete-error'))
    );
  }

  formatDate(date: Date): string {
    return this.formatDatetimePipe.transform(date);
  }

  formatNotionTableHeader(tableFolderLength: number): string {
    return this.translate.instant('folder-modal-table.folder-notions').replace('{{number}}', tableFolderLength);
  }

  accessLinkToNotion(notion: Notion) {
    return accessLinkToNotion(notion);
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  onAttachmentChanged(): void {
    this.notionOrAttachmentChanged.emit();
  }

  selectNotion(): void {
    this.notionSelected.emit(this.selectedNotionsForCreatingStudy.map(notion => notion.id));
  }

  selectAttachment(attachmentsIds: string[]): void {
    this.attachmentSelected.emit(attachmentsIds);
  }
}
