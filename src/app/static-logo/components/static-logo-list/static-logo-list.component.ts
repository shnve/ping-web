import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticLogoAdminApi } from '@app/static-logo/api/static-logo-admin.api';
import { StaticLogo } from '@app/static-logo/models/static-logo.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';

@Component({
  selector: 'static-logo-list',
  templateUrl: './static-logo-list.component.html',
  styleUrls: ['./static-logo-list.component.scss']
})
export class StaticLogoListComponent extends AbstractSearchComponent<StaticLogo> implements OnDestroy {
  private readonly scavenger = new Scavenger(this);

  protected enableCreate = false;
  protected enableEdit = false;
  protected enablePreview = false;

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly staticLogoAdminApi: StaticLogoAdminApi,        
    private readonly alertMessageService: AlertMessageService,
    private readonly confirmationService: ConfirmationService) {
    super(http, authService);
    this.enablePreview = this.canPreviewModel;
    this.enableEdit = this.canEditModel;
    this.enableCreate = this.canCreateModel;
  }

  ngOnDestroy(): void {
    // empty because scavenger
  }

  getUriForSearch(): string {
    return `${environment.baseApiUrl}${environment.adminApi.staticLogo.crud}`;
  }

  protected confirmDelete(event: Event, id: string): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('static-logo.delete.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteStaticImage(id)
    });
  }

  private deleteStaticImage(id: string): void {
    this.staticLogoAdminApi.delete$(id)
      .pipe(this.scavenger.collect())
      .subscribe(() => {
        this.reloadData();
        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.delete-static-logo`
        });
      },
      err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.cannot-delete-static-logo'
        });
        return throwError(err);
      });
  }
}
