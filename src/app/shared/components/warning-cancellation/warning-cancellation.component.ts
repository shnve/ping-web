import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AdminWarning } from '@app/models/warning.model';
import { showToast } from '@app/shared/ui-utils';
import { TranslateService } from '@ngx-translate/core';
import {
  CancellationWorkflow,
  CHOICE_CANCEL_WARNING,
  CHOICE_CREATE_REPLACEMENT_NOTICE,
  WarningCancellationService,
  WorkflowCreationSettings,
  WorkflowSelectionParams
} from '@shared/services/warning-cancellation-service';
import { Scavenger } from '@wishtack/rx-scavenger';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'shared-warning-cancellation',
  templateUrl: './warning-cancellation.component.html',
  styleUrls: ['./warning-cancellation.component.scss']
})
export class WarningCancellationComponent implements OnInit, OnDestroy {
  private readonly scavenger = new Scavenger(this);

  @Input() warning: AdminWarning;
  @Output() closeAndAbortCancellation = new EventEmitter<boolean>();
  @Output() statusChangeAction = new EventEmitter<void>();

  workflowCreationSettings: WorkflowCreationSettings;
  workflowSelectionParams: WorkflowSelectionParams;
  cancellationWorkflow = CancellationWorkflow.DEFAULT;
  cancellationChoice = CHOICE_CREATE_REPLACEMENT_NOTICE;

  constructor(private readonly translateService: TranslateService,
    private readonly alertMessageService: AlertMessageService,
    private readonly cancellationService: WarningCancellationService,
    private readonly router: Router) { }

  ngOnInit(): void {
    this.initWorkflow();
  }

  ngOnDestroy(): void { }

  private initWorkflow(): void {
    this.cancellationWorkflow = this.cancellationService.getWorkflowFromSerieType(this.warning.serieType);
    this.initWorkflowSelectionParams();
  }

  private initWorkflowSelectionParams(): void {
    this.workflowCreationSettings = {
      shouldCreateCancellationWarning: false,
      shouldCreateReplacementNotice: false,
      cancellationChoice: CHOICE_CREATE_REPLACEMENT_NOTICE
    };
    this.workflowSelectionParams = {
      workflowCreationSettings: this.workflowCreationSettings,
      cancellationWorkflow: this.cancellationWorkflow,
      warningId: this.warning.id,
      serieId: this.warning.serieId,
      serviceId: this.warning.serviceId
    };
  }

  cancel(): void {
    this.closeAndAbortCancellation.emit(true);
  }

  confirm(): void {
    this.cancellationService.runWorkflow$(this.workflowSelectionParams)
      .pipe(this.scavenger.collect())
      .pipe(
        tap(clonedWarningId => {
          this.closeAndAbortCancellation.emit(false);
          return clonedWarningId;
        }),
        tap(
          clonedWarningId => {
            let message = 'cancel-success';
            if ((this.workflowSelectionParams.cancellationWorkflow === CancellationWorkflow.LOCAL_NAVIGATIONAL_WARNING
              || this.workflowCreationSettings.shouldCreateReplacementNotice) && this.workflowCreationSettings.cancellationChoice !== CHOICE_CANCEL_WARNING) {
              message = 'create-draft-success';
            }
            showToast(this.alertMessageService, this.translateService.instant(`detail.${message}`), 'success');


            this.statusChangeAction.emit();
            return clonedWarningId;
          },
          () => {
            showToast(this.alertMessageService, this.translateService.instant('detail.create-draft-error'), 'error');
          }
        ),
        filter(clonedWarningId => clonedWarningId !== null && clonedWarningId !== '' && clonedWarningId !== this.warning.id)
      )
      .subscribe(clonedWarningId => this.router.navigate([`/administration/warnings/edition/${clonedWarningId}`]));
  }
}
