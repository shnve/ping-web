import {Component, Input, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {UsersApi} from '@app/api/users.api';
import {AlertMessageService} from '@app/core/alert-message.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnDestroy {
  @Input() userId: string;
  sub = new Subscription();
  form = this.formBuilder.group({
    password: ['', Validators.required]
  });

  constructor(private readonly formBuilder: UntypedFormBuilder, private readonly userApi: UsersApi,
              private readonly alertMessageService: AlertMessageService) { }

  send(): void {
    if (this.form.invalid) {
      return;
    }

    this.sub = this.userApi.resetPassword(this.userId, this.form.get('password').value).subscribe(() =>
      this.alertMessageService.add({
        id: 'password-updated',
        severity: 'info',
        summary: 'message.summary.success',
        detail: 'message.success.api.password-updated'
      }), () => this.alertMessageService.add({
      id: 'password-updated',
      severity: 'error',
      summary: 'message.summary.error',
      detail: 'message.error.api.password-updated'
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
