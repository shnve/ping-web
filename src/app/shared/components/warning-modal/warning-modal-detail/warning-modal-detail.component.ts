import { DownloadService } from '@admin-warning/services/download.service';
import { Component } from '@angular/core';
import { WarningApi } from '@app/api/warning.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { TranslateService } from '@ngx-translate/core';
import { WarningDetailComponent } from '../../warning-detail/warning-detail.component';

@Component({
  selector: 'shared-warning-modal-detail',
  templateUrl: './warning-modal-detail.component.html',
  styleUrls: ['./warning-modal-detail.component.scss']
})
export class WarningModalDetailComponent extends WarningDetailComponent {

  constructor(protected readonly authService: AuthService,
    protected readonly translate: TranslateService,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly downloadService: DownloadService,
    protected readonly warningApi: WarningApi) {
    super(authService, translate, alertMessageService, downloadService, warningApi);
  }
}
