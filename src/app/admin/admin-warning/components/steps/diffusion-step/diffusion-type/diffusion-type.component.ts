import { Component, Input, OnDestroy } from '@angular/core';
import { WarningCreationData } from '@app/admin/admin-warning/models/creation-warning.model';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { listWarningStatus } from '@app/models/warning.model';
import { copyToClipboard } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Message } from 'primeng/api';

@Component({
  selector: 'aw-diffusion-type',
  template: ''
})
export abstract class DiffusionTypeComponent implements OnDestroy {
  protected readonly scavenger = new Scavenger(this);
  
  @Input() warning: WarningCreationData;
  @Input() isPrerequisitesStep: boolean;

  showReloadButton = false;
  diffusionContent: string;
  diffusionType: string;
  displayDiffusionTypePart = true;

  constructor(protected readonly alertMessageService: AlertMessageService,
              protected readonly translateService: TranslateService,
              protected readonly warningAdminApi: WarningAdminApi) {}

  ngOnDestroy(): void {}

  protected isPublished(): boolean {
    return this.isAnPublishedStatus(this.warning);
  }

  protected isAnPublishedStatus(warning: WarningCreationData): boolean {
    return this.isAnInStatus(warning, listWarningStatus.PUBLISHED);
  }

  protected isCancelled(): boolean {
    return this.isAnCancelledStatus(this.warning);
  }

  protected isAnCancelledStatus(warning: WarningCreationData): boolean {
    return this.isAnInStatus(warning, listWarningStatus.CANCELLED);
  }

  protected isDraft(): boolean {
    return this.isAnDraftStatus(this.warning);
  }

  protected isAnDraftStatus(warning: WarningCreationData): boolean {
    return this.isAnInStatus(warning, listWarningStatus.DRAFT);
  }

  protected isModel(): boolean {
    return this.isAnModelStatus(this.warning);
  }

  protected isAnModelStatus(warning: WarningCreationData): boolean {
    return this.isAnInStatus(warning, listWarningStatus.MODEL);
  }

  protected isAnInStatus(warning: WarningCreationData, status: string): boolean {
    return warning.status === status;
  }

  protected showToast(detail: string, severity: MessageSeverity = 'error'): void {
    this.alertMessageService.add({
      summary:  `message.summary.${severity === 'error' ? 'error' : 'success'}`,
      severity,
      detail
    });
  }

  abstract generateDiffusion(): void;

  copyDiffusionContent($event: any): void {
    copyToClipboard(this.diffusionContent, true);
    this.showToast(this.translateService.instant('admin-warning.creation.labels.copyContent-success-' + this.diffusionType), 'success');
    $event.preventDefault();
  }
}
