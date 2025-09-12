import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticFile } from '@app/static-file/models/static-file.model';
import { StaticFileAdminService } from '@app/static-file/services/static-file-admin.service';
import { StaticFileService } from '@app/static-file/services/static-file.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';

@Component({
  selector: 'static-file-list',
  templateUrl: './static-file-list.component.html',
  styleUrls: ['./static-file-list.component.scss']
})
export class StaticFileListComponent extends AbstractSearchComponent<StaticFile> implements OnDestroy {
  private readonly scavenger = new Scavenger(this);
  private readonly uriForSearch = environment.baseAdminApiUrl + environment.adminApi.staticFile.crud;
  protected readonly baseStaticPath = '/static-file';
  protected enableCreate = false;
  protected enableEdit = false;
  protected enablePreview = false;

  constructor(protected readonly http: HttpClient,
    protected readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly alertMessageService: AlertMessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly staticFileAdminService: StaticFileAdminService,
    private readonly staticFileService: StaticFileService
  ) {
    super(http, authService);
    this.enablePreview = this.canPreviewModel;
    this.enableEdit = this.canEditModel;
    this.enableCreate = this.canCreateModel;
  }

  ngOnDestroy(): void { }

  getUriForSearch(): string {
    return this.uriForSearch;
  }

  confirmDelete(event: Event, id: string): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('static-file.delete.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteStaticFile(id)
    });
  }

  private deleteStaticFile(id: string): void {
    this.staticFileAdminService.delete$(id)
      .pipe(this.scavenger.collect())
      .subscribe(() => {
        this.reloadData();
        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.delete-static-file`
        });
      },
      err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.cannot-delete-static-file'
        });
        return throwError(err);
      });
  }

  protected downloadFile(event: Event, staticFilePath: string): void {
    this.staticFileService.download$(staticFilePath)
      .pipe(this.scavenger.collect())
      .subscribe(
        response => saveAs(response.body, response.headers.get('filename')),
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-download-static-file'
          });
          return throwError(err);
        }
      );

    event.preventDefault();
  }
}
