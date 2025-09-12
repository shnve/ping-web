import { Component, OnDestroy, OnInit } from '@angular/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { AlertMessageService } from '@app/core/alert-message.service';
import { UsersApi } from '@app/api/users.api';
import { MessageSeverity } from '@app/models/alert-message.model';
import { AuthService } from '@app/auth/auth.service';

@Component({
  selector: 'app-send-reset-password-email',
  templateUrl: './send-reset-password-email.component.html',
  styleUrls: ['./send-reset-password-email.component.scss']
})
export class SendResetPasswordEmailComponent implements OnDestroy, OnInit {
  accessToken: string;
  private readonly scavenger = new Scavenger(this);
  constructor(private readonly userService: UsersApi,
              private readonly authService: AuthService,
              private readonly alertMessageService: AlertMessageService) { }
  ngOnInit(): void {
    this.accessToken = this.authService.getToken();
  }

  ngOnDestroy(): void { }

  resetPassword(): void {
    if (this.authService.isPublicUser()) {
      this.userService.resetPasswordPublicUser(this.accessToken)
        .pipe(this.scavenger.collect())
        .subscribe(
          () => this.showMessage('success'),
          () => this.showMessage('error')
        );
    } else {
      this.userService.resetProUserPassword$()
        .pipe(this.scavenger.collect())
        .subscribe(
          () => this.showMessage('success'),
          () => this.showMessage('error')
        );
    }

  }

  showMessage(severity: MessageSeverity = 'error') {
    this.alertMessageService.add({
      severity,
      summary: `message.summary.${severity}`,
      detail: `message.${severity}.api.reset-password`
    });
  }
}
