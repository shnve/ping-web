import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { AttachmentService } from '@app/shared/services/attachment.service';
import { formatSize } from '@app/shared/ui-utils';
import { environment } from '@env/environment';
import { FlowFile } from '@flowjs/flow.js';
import { FlowDirective } from '@flowjs/ngx-flow';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Subscription, throwError } from 'rxjs';
import { CreationAttachment, CreationAttachments } from './attachment.model';

@Component({
  selector: 'shared-abstract-attachments',
  template: ''
})
export abstract class AbstractAttachmentsComponent implements AfterViewInit, OnDestroy {
  protected readonly scavenger = new Scavenger(this);
  readonly fileTypes = environment.api.attachments.fileTypes;
  readonly urlAdminUploadChunk = environment.baseAdminApiUrl + environment.api.attachments.uploadChunk;

  @Input() maxFileSize?: number;
  @Input() isBathy = false;
  @Input() isSurvey = false;
  @Input() isTechnicalMetadata = false;
  @Output() uploadError = new EventEmitter<boolean>();

  @ViewChild('flow') flow: FlowDirective;

  autoUploadSubscription: Subscription;
  flowAttributes = { accept: this.fileTypes };
  uploading: boolean;
  files: Array<CreationAttachment> = [];
  attachments: CreationAttachments;

  constructor(
    protected readonly translate: TranslateService,
    protected readonly downloadService: DownloadService,
    protected readonly attachmentService: AttachmentService,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly authService: AuthService) {
  }

  ngOnDestroy(): void {
    if (this.autoUploadSubscription) { this.autoUploadSubscription.unsubscribe(); }
  }

  ngAfterViewInit(): void {
    this.autoUploadSubscription = this.flow?.events$.subscribe({
      next: event => {
        this.uploadError.emit(false);
        this.flow.flowJs.opts.headers = { ...this.flow.flowJs.opts.headers, Authorization: 'Bearer ' + this.authService.getNonExpiredToken() };

        if (event.type === 'filesSubmitted') {
          const uploadedFile: FlowFile = event.event[0] as FlowFile;
          if (!uploadedFile || !uploadedFile[0]) {
            return;
          }
          const filename = uploadedFile[0].name;
          const totalSize = uploadedFile[0].size;
          if (this.maxFileSize && totalSize > this.maxFileSize) {
            this.showToast(`message.error.api.validation.file-size-exceed`, 'error');
            this.uploadError.emit(true);
            return;
          }

          this.attachmentService.checkFileRequirements$(filename, totalSize, this.authService.isProUser(), this.isBathy, this.isSurvey, this.isTechnicalMetadata)
            .pipe(
              this.scavenger.collect(),
            )
            .subscribe(
              fileRequirementsCheckResult => {
                if (fileRequirementsCheckResult === '') {
                  this.uploading = true;
                  this.flow.upload();
                } else {
                  this.showToast(`message.error.api.${fileRequirementsCheckResult}`, 'error');
                }
              }
            );
        } else if (event.type === 'fileSuccess') {
          const uploadedFile: FlowFile = event.event[0] as FlowFile;
          this.createAttachment(uploadedFile);
        } else if (event.type === 'complete') {
          this.uploading = false;
        } else if (event.type === 'fileError') {
          const errors = event.event[1].toString().replace('[', '').replace(']', '').replaceAll('"', '').split(',').map(s => s.trim());
          errors.forEach(error => this.showToast(`message.${error}`, 'error'));
          this.flow.cancel();
        }
      },
      error: err => {
        this.showToast('message.error.api.cannot-save-attachment', 'error');
        return throwError(err);
      }
    });
  }

  formatFileSize(bytes: number): string {
    const suffix = this.translate.instant('attachments.byte-unit');
    return formatSize(bytes, suffix);
  }

  createAttachment(uploadedFile: FlowFile): void {
    const file: File = uploadedFile.file;
    const filename = file.name;
    const totalSize = file.size;
    const identifier = uploadedFile.uniqueIdentifier;
    const type = file.type;
    const creationAttachment: CreationAttachment = {
      isSurvey: this.isSurvey,
      isBathy: this.isBathy,
      isTechnicalMetadata: this.isTechnicalMetadata,
      filename,
      identifier,
      totalSize,
      type
    };
    this.attachmentService.saveAttachment(creationAttachment).subscribe(
      uuid => {
        this.processAttachmentCreationResult(uuid, creationAttachment);
        this.showToast('message.info.api.attachment.added', 'success');
      },
      err => {
        if (err.error?.message === 'clamav.detection.positive') {
          this.showToast('message.error.api.malicious-attachment', 'error');
        } else if (err.error?.message === 'clamav.detection.failure') {
          this.showToast('message.error.api.antivirus-analysis-unavailable', 'error');
        } else {
          this.showToast('message.error.api.cannot-save-attachment', 'error');
        }
        return throwError(err);
      });
  }

  abstract hasFiles(): boolean;

  abstract open(event: Event, index: number): void;

  abstract remove(event: Event, index: number): void;

  abstract showToast(detail: string, severity: MessageSeverity): void;

  abstract processAttachmentCreationResult(uuid: string, creationAttachment: CreationAttachment): void;

}
