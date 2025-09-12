import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UsersApi } from '@app/api/users.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-control-user-enabled-status',
  templateUrl: './control-user-enabled-status.component.html',
  styleUrls: ['./control-user-enabled-status.component.scss']
})
export class ControlUserEnabledStatusComponent implements OnInit, OnDestroy {

  private readonly scavenger = new Scavenger(this);

  @Input() userId: string;
  @Input() enabled: boolean;
  @Input() isPublicUser = false;
  @Input() disabled = false;

  booleanOptions = [true, false];
  form: UntypedFormGroup;

  constructor(private readonly userService: UsersApi,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly alertMessageService: AlertMessageService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      userStatus: [{ value: this.enabled, disabled: this.disabled }]
    });
  }

  ngOnDestroy(): void { }

  confirmSave(event: Event): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('account.creation.information.user-status-update-confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.save()
    });
  }

  get userStatus(): AbstractControl {
    return this.form.get('userStatus');
  }

  private save(): void {
    const newStatus = this.userStatus.value as boolean;
    if (newStatus !== this.enabled) {
      this.updateUserStatus(this.userId, newStatus);
    }
  }

  private updateUserStatus(userId: string, enabled: boolean): void {
    this.userService.updateUserStatus$(userId, enabled, this.isPublicUser)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => this.showMessage('success'),
        () => this.showMessage('error')
      );
  }

  private showMessage(severity: MessageSeverity = 'error') {
    this.alertMessageService.add({
      severity,
      summary: `message.summary.${severity}`,
      detail: `message.${severity}.api.user-status-updated`
    });
  }
}
