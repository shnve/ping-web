import {Component, Input, OnDestroy} from '@angular/core';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {UsersApi} from '@app/api/users.api';
import {AlertMessageService} from "@app/core/alert-message.service";
import { environment } from '@env/environment';

@Component({
  selector: 'app-update-email',
  templateUrl: './update-email.component.html',
  styleUrls: ['./update-email.component.scss']
})
export class UpdateEmailComponent implements OnDestroy {
  @Input() userId: string;
  sub = new Subscription();
  form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(environment.emailRegexPattern)]]
  });

  constructor(private readonly formBuilder: UntypedFormBuilder, private readonly userApi: UsersApi,
              private readonly alertMessageService: AlertMessageService) {

  }

  send(): void {
    if (this.form.invalid) {
      return;
    }

    this.sub = this.userApi.updateEmail(this.userId, this.form.get('email').value).subscribe(() =>
      this.alertMessageService.add({
        id: 'email-updated',
        severity: 'info',
        summary: 'message.summary.success',
        detail: 'message.success.api.email-updated'
      }), () => this.alertMessageService.add({
      id: 'email-updated',
      severity: 'error',
      summary: 'message.summary.error',
      detail: 'message.error.api.email-updated'
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
