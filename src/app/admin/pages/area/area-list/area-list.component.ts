import {Component} from '@angular/core';
import Area from '@app/models/area.model';
import {AbstractSearchComponent} from '@app/admin/components/abstract-search/abstract-search.component';
import {AreasApi} from '@app/api/areas.api';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '@app/auth/auth.service';

@Component({
  selector: 'app-area-list',
  templateUrl: './area-list.component.html',
  styleUrls: ['./area-list.component.scss']
})
export class AreaListComponent extends AbstractSearchComponent<Area> {
  constructor(private readonly areasApi: AreasApi,
              private readonly http: HttpClient,
              private readonly authService: AuthService) {
    super(http, authService);
  }

  getUriForSearch(): string {
    return this.areasApi.adminApi;
  }
}
