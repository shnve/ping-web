import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { Page } from '@app/models/page.model';
import { EventPage } from '@app/shared/components/ping-paginator/ping-paginator.component';

/**
 * Composant de recherche pour les pages d'aministration du site
 */
@Component({ template: '' })
export abstract class AbstractSearchComponent<T> implements OnInit {
  currentPage = 0;
  currentSize = 20;
  totalElements = 0;

  searchDelay = 300;
  timeOut: any;

  pageItem: any;

  // Doublon avec les composants qui l'extend sinon (donc _http)
  constructor(private readonly _http: HttpClient, private readonly _authService: AuthService) { }

  ngOnInit(): void {
    this.reloadData();
  }

  get pageableInfos(): HttpParams {
    let params = new HttpParams();
    params = params.append('page', this.currentPage.toString());
    params = params.append('size', this.currentSize.toString());

    return params;
  }

  get canCreateModel(): boolean {
    return this._authService.hasRoleFunctionalAdmin();
  }

  get canEditModel(): boolean {
    return this._authService.hasRoleFunctionalAdmin();
  }

  get canPreviewModel(): boolean {
    return this._authService.isProUser();
  }

  handlePageEvent(pageEvt: EventPage): void {
    this.currentSize = pageEvt.pageSize;
    this.currentPage = pageEvt.pageIndex;
    this.reloadData();
  }

  reloadData(): void {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      this._http.get<Page<T>>(`${this.getUriForSearch()}/search`, {
        params: this.pageableInfos
      }).subscribe(values =>
        this.pageItem = values);
    }, this.searchDelay);
  }

  abstract getUriForSearch(): string;
}
