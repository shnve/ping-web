import { DownloadService } from '@admin-warning/services/download.service';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { AttachmentService } from '@app/shared/services/attachment.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { AbstractAttachmentsComponent } from './abstract-attachments.component';
import { CreationAttachment, CreationAttachments } from './attachment.model';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AttachmentsComponent extends AbstractAttachmentsComponent implements OnInit {

  readonly urlSecuredUploadChunk = environment.baseSecuredApiUrl + environment.api.attachments.uploadChunk;

  @Output() onChange = new EventEmitter<string[] | string>();
  @Output() onChangeFiles = new EventEmitter<CreationAttachments>();

  urlUploadChunk: string;
  protected readonly chunkSize = environment.api.attachments.chunkSize;

  @Input() manageManyAttachments: boolean;
  @Input() attachmentFiles?: Array<CreationAttachment> | CreationAttachment;
  @Input() attachmentIds?: string[] | string;
  @Input() showChooseFile = true;
  @Input() showSuccessMessage = true;
  @Input() disabled = false;
  @Input() inputId: string;
  @Input() filteredExtensions?: string;

  constructor(
    protected readonly translate: TranslateService,
    protected readonly downloadService: DownloadService,
    protected readonly attachmentService: AttachmentService,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly authService: AuthService) {
    super(translate, downloadService, attachmentService, alertMessageService, authService);
    this.attachments = {
      attachmentIds: [],
      attachmentFiles: []
    };
    this.files = this.attachments.attachmentFiles;
    this.urlUploadChunk = this.authService.isProUser() ? this.urlAdminUploadChunk : this.urlSecuredUploadChunk;
  }

  ngOnInit(): void {
    if (this.manageManyAttachments && !(this.attachmentFiles as CreationAttachment[])?.length) {
      this.attachmentFiles = [];
    } else if (!this.manageManyAttachments && !(this.attachmentFiles as CreationAttachment)?.filename?.length) {
      this.attachmentFiles = {} as CreationAttachment;
    }

    if (this.manageManyAttachments && !(this.attachmentIds as string[])?.length) {
      this.attachmentIds = [];
    } else if (!this.manageManyAttachments && !(this.attachmentIds as string)?.length) {
      this.attachmentIds = '';
    }

    if (this.filteredExtensions) {
      this.flowAttributes.accept = this.filteredExtensions;
    }
  }

  hasFiles(): boolean {
    return Array.isArray(this.attachmentFiles) && !!this.attachmentFiles?.length;
  }

  hasOneFile(): boolean {
    return !Array.isArray(this.attachmentFiles) && !!this.attachmentFiles?.filename?.length;
  }

  processAttachmentCreationResult(uuid: string, creationAttachment: CreationAttachment): void {
    if (Array.isArray(this.attachmentIds) && Array.isArray(this.attachmentFiles)) {
      this.attachmentIds.push(uuid);
      this.attachmentFiles.push(creationAttachment);
    } else {
      this.attachmentIds = uuid;
      this.attachmentFiles = creationAttachment;
    }
    this.flow.cancel();
    creationAttachment.id = uuid;
    this.emitFilesChange();
  }

  private emitFilesChange(): void {
    this.onChange.emit(this.attachmentIds);
    const attachments: CreationAttachments = {
      attachmentIds: Array.isArray(this.attachmentIds) ? this.attachmentIds : [this.attachmentIds],
      attachmentFiles: Array.isArray(this.attachmentFiles) ? this.attachmentFiles : [this.attachmentFiles]
    };
    this.onChangeFiles.emit(attachments);
  }

  open(event: Event, index: number): void {
    const attachmentId: string = (Array.isArray(this.attachmentFiles) || Array.isArray(this.attachmentIds)) ?
      (this.attachmentFiles[index].id ?? this.attachmentFiles[index].uuid) : this.attachmentIds;

    this.downloadService.download(attachmentId)
      .pipe(this.scavenger.collect())
      .subscribe(response => saveAs(response.body, response.headers.get('filename')));
    event.preventDefault();
  }

  remove(event: Event, index: number): void {
    if (Array.isArray(this.attachmentFiles) && Array.isArray(this.attachmentIds)) {
      this.attachmentFiles.splice(index, 1);
      this.attachmentIds.splice(index, 1);
    } else {
      this.attachmentFiles = {} as CreationAttachment;
      this.attachmentIds = '';
    }
    this.flow.cancel();

    this.emitFilesChange();
  }

  showToast(detail: string, severity: MessageSeverity = 'error'): void {
    if (this.showSuccessMessage || severity === 'error') {
      this.alertMessageService.add({
        summary: `message.summary.${severity === 'error' ? 'error' : 'success'}`,
        severity,
        detail
      });
    }
  }
}
