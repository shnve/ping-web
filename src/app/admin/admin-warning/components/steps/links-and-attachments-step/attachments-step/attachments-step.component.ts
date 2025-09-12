import { WarningCreationData } from '@admin-warning/models/creation-warning.model';
import { CreationService } from '@admin-warning/services/creation.service';
import { DownloadService } from '@admin-warning/services/download.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { CreationAttachment, CreationAttachments } from '@app/shared/components/attachments/attachment.model';
import { AttachmentService } from '@app/shared/services/attachment.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'aw-attachments-step',
  templateUrl: './attachments-step.component.html',
  styleUrls: ['../../step.component.scss', 'attachments-step.component.scss']
})
export class AttachmentsStepComponent {

  @Output() hasAttachmentsIdsChanged = new EventEmitter<boolean>();

  attachments: CreationAttachments;

  files: Array<CreationAttachment> = [];

  constructor(
    protected readonly translate: TranslateService,
    protected readonly downloadService: DownloadService,
    protected readonly creationService: CreationService,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly authService: AuthService,
    protected readonly attachmentService: AttachmentService) {
    this.attachments = this.creationService.getWarningData().attachments;
    this.files = this.attachments.attachmentFiles;
  }

  resetStep(warningData: WarningCreationData): void {
    this.attachments = warningData.attachments;
    this.files = this.attachments.attachmentFiles;
  }

  setAttachmentFiles(event: CreationAttachments): void {
    this.hasAttachmentsIdsChanged.emit(true);
    this.attachments = event;
  }

  saveForm(force = false): boolean {
    this.creationService.getWarningData().attachments = this.attachments;
    return true;
  }
}
