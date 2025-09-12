import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { SeriesAdminApi } from '@app/api/admin/series-admin.api';
import { AuthService } from "@app/auth/auth.service";
import { Serie } from '@app/models/serie.model';

@Component({
  selector: 'app-serie-list',
  templateUrl: './serie-list.component.html',
  styleUrls: ['./serie-list.component.scss']
})
export class SerieListComponent extends AbstractSearchComponent<Serie> {
  constructor(private readonly seriesAdminApi: SeriesAdminApi,
              private readonly http: HttpClient,
              private readonly authService: AuthService) {
    super(http, authService);
  }

  getUriForSearch(): string {
    return this.seriesAdminApi.seriesAdminUrl;
  }
}
