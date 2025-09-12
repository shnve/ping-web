import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { StaticPageAdminApi } from '@app/api/admin/static-page-admin.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticPage } from '@app/models/static-page.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';


@Component({
  selector: 'app-static-page-list',
  templateUrl: './static-page-list.component.html',
  styleUrls: ['./static-page-list.component.scss']
})
export class StaticPageListComponent extends AbstractSearchComponent<StaticPage> {
  readonly baseStaticPath = '/static';
  enableCreate = false;
  enableEdit = false;
  enablePreview = false;

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService,
              private readonly translate: TranslateService,
              private readonly alertMessageService: AlertMessageService,
              private readonly confirmationService: ConfirmationService,
              private readonly staticPageAdminApi: StaticPageAdminApi) {
    super(http, authService);
    this.enablePreview = this.canPreviewModel;
    this.enableEdit = this.canEditModel;
    this.enableCreate = this.canCreateModel;
  }

  getUriForSearch(): string {
    return `${environment.baseApiUrl}${environment.adminApi.staticPage.crud}`;
  }

  confirmDelete(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('static-page-confirm-delete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteStaticPage(id);
      }
    });
  }

  private deleteStaticPage(id: string): void {
    this.staticPageAdminApi.delete(id)
      .subscribe(() => {
        this.reloadData();
        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.delete-staticPage`
        });
      },
      err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.cannot-delete-staticPage'
        });
        return throwError(err);
      });
  }
}
