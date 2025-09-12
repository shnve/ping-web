import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { AuthService } from '@app/auth/auth.service';
import ProUser, { ServiceRole } from '@app/models/pro-user.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pro-user-list',
  templateUrl: './pro-user-list.component.html',
  styleUrls: ['./pro-user-list.component.scss']
})
export class ProUserListComponent extends AbstractSearchComponent<ProUser> {

  filteredLastname: string;
  filteredFirstname: string;
  filteredEmail: string;

  constructor(private readonly http: HttpClient,
              public readonly translate: TranslateService,
              private readonly authService: AuthService) {
    super(http, authService);
  }

  get canCreate(): boolean {
    return this.canCreateModel || this.authService.hasServiceRole(ServiceRole.SERVICE_ADMIN);
  }

  canEdit(id: string): boolean {
    return this.canEditModel || this.authService.getAuthenticatedUser().id === id;
  }

  getUriForSearch(): string {
    return `${environment.baseApiUrl}${environment.adminApi.proUser}`;
  }

  onFilterChange(): void {
    this.reloadData();
  }

  get pageableInfos(): HttpParams {
    let params = super.pageableInfos;

    if (this.filteredLastname && this.filteredLastname !== '') {
      params = params.append('lastname', this.filteredLastname);
    }

    if (this.filteredFirstname && this.filteredFirstname !== '') {
      params = params.append('firstname', this.filteredFirstname);
    }

    if (this.filteredEmail && this.filteredEmail !== '') {
      params = params.append('email', this.filteredEmail);
    }

    return params;
  }
}
