import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractSearchComponent } from '@app/admin/components/abstract-search/abstract-search.component';
import { AuthService } from '@app/auth/auth.service';
import { StaticSection } from '@app/static-section/models/static-section.model';
import { environment } from '@env/environment';

@Component({
  selector: 'static-section-list',
  templateUrl: './static-section-list.component.html',
  styleUrls: ['./static-section-list.component.scss']
})
export class StaticSectionListComponent extends AbstractSearchComponent<StaticSection> {
  enableEdit = false;
  enablePreview = false;

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) {
    super(http, authService);
    this.enablePreview = this.canPreviewModel;
    this.enableEdit = this.canEditModel;
  }

  getUriForSearch(): string {
    return `${environment.baseApiUrl}${environment.adminApi.staticSection.crud}`;
  }
}
