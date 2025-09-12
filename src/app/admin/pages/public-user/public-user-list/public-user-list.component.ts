import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { AuthService } from "@app/auth/auth.service";
import PublicUser from '@app/models/public-user.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-public-user-list',
  templateUrl: './public-user-list.component.html',
  styleUrls: ['./public-user-list.component.scss']
})
export class PublicUserListComponent extends AbstractSearchComponent<PublicUser> {

  filteredLastname: string;
  filteredFirstname: string;
  filteredEmail: string;

  constructor(private readonly http: HttpClient,
              public readonly translate: TranslateService,
              private readonly authService: AuthService) {
    super(http, authService);
  }

  getUriForSearch(): string {
    return `${environment.baseApiUrl}${environment.adminApi.publicUsers}`;
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
