import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { SubAreasApi } from '@app/api/sub-areas.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { ServiceRole } from '@app/models/pro-user.model';
import { SubArea } from '@app/models/sub-area.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-subarea-list',
  templateUrl: './sub-area-list.component.html',
  styleUrls: ['./sub-area-list.component.scss']
})
export class SubAreaListComponent extends AbstractSearchComponent<SubArea> implements OnDestroy {

  private readonly scavenger = new Scavenger(this);

  filteredName: string;
  filteredTechnicalIdentifier: string;
  filteredSeriesName: string;
  filteredParentName: string;

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService,
              private readonly translate: TranslateService,
              private readonly alertMessageService: AlertMessageService,
              private readonly confirmationService: ConfirmationService,
              private readonly subAreasApi: SubAreasApi) {
    super(http, authService);
  }

  ngOnDestroy(): void {
    // empty because use of scavenger
  }

  get canCreateModel(): boolean {
    return this.authService.hasRoleFunctionalAdmin() || this.authService.isMaritimeNoticeProducer();
  }

  get canPreviewModel(): boolean {
    return this.authService.isProUser();
  }

  onFilteredTableChange(): void {
    this.reloadData();
  }

  protected checkWritableAccess(maritimeServiceIds: string[], seriesLength: number): boolean {
    if (this.authService.hasRoleFunctionalAdmin()) {
      return true;
    }
    // service user can edit subarea if admin right on service and subarea not associated with serie (secteur)
    return seriesLength === 0 && this.authService.isMaritimeNoticeProducer() && this.checkRightsOnMaritimeServices(maritimeServiceIds);
  }

  private checkRightsOnMaritimeServices(maritimeServiceIds: string[]): boolean {
    return maritimeServiceIds.some(maritimeServiceId => this.authService.hasAccessToService(maritimeServiceId, ServiceRole.SERVICE_ADMIN));
  }

  getUriForSearch(): string {
    return `${environment.baseApiUrl}${environment.adminApi.subAreas}`;
  }

  confirmDelete(event: Event, id: string): void {
    this.confirmationService.confirm({
      target: event.target,
      message: this.translate.instant('sub-area-list.confirm-delete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteSubArea(id)
    });
  }

  private deleteSubArea(id: string): void {
    this.subAreasApi.delete$(id)
      .pipe(this.scavenger.collect())
      .subscribe(() => {
        this.reloadData();
        this.alertMessageService.add({
          severity: 'success',
          summary: 'message.summary.success',
          detail: `message.success.api.delete-locality`
        });
      },
      err => {
        this.alertMessageService.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.cannot-delete-locality'
        });
        return throwError(err);
      });
  }

  get pageableInfos(): HttpParams {
    let params = super.pageableInfos;
    if (this.filteredTechnicalIdentifier && this.filteredTechnicalIdentifier !== '') {
      params = params.append('technicalIdentifier', this.filteredTechnicalIdentifier);
    }

    if (this.filteredName && this.filteredName !== '') {
      params = params.append('name', this.filteredName);
    }

    if (this.filteredSeriesName && this.filteredSeriesName !== '') {
      params = params.append('serieName', this.filteredSeriesName);
    }

    if (this.filteredParentName && this.filteredParentName !== '') {
      params = params.append('parentName', this.filteredParentName);
    }

    return params;
  }
}
