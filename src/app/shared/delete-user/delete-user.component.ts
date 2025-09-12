import { Component, OnDestroy, OnInit } from '@angular/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { AlertMessageService } from '@app/core/alert-message.service';
import { UsersApi } from '@app/api/users.api';
import { MessageSeverity } from '@app/models/alert-message.model';
import { AuthService } from '@app/auth/auth.service';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss']
})
export class DeleteUserComponent implements OnDestroy, OnInit {
  accessToken: string;
  private readonly scavenger = new Scavenger(this);
  constructor(private readonly userService: UsersApi,
              private readonly authService: AuthService,
              private readonly translate: TranslateService,
              private readonly confirmationService: ConfirmationService,
              private readonly alertMessageService: AlertMessageService) { }
  ngOnInit(): void {
    this.accessToken = this.authService.getToken();
  }

  ngOnDestroy(): void { }

  confirm() {
    this.confirmationService.confirm({
      message: this.translate.instant('public-user-list.confirm-message'),
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteAccompte();
      }
    });
  }

  deleteAccompte() { 
    this.userService.publicUserDeleteProfile(this.accessToken)
    .pipe(this.scavenger.collect())
        .subscribe(
          () => {
            this.showMessage('success','public-user-list.desactive-profile-sucess');
            this.authService.logout();
          },
          () => this.showMessage('error','public-user-list.desactive-profile-error'));
  }

  showMessage(severity: MessageSeverity = 'error',detailMessage:string) {
    this.alertMessageService.add({
      id: 'assign-user-maritime-service',
      severity,
      summary: `message.summary.${severity}`,
      detail: detailMessage,
    });
  }
}
