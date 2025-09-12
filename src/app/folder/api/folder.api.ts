import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { PaginatedModelItemTableViewDtos } from '@shared/models/paginated-table-view.model';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { TableFolder } from '@app/folder/models/folder-table.model';

export type FoldersTableApiParams = {
  status: string;
  areaId?: string;
  secondPartNumber?: string;
  number?: string;
  localityOrObject?: string;
  maritimeEntityIds?: string;
  lastUpdatePeriodDateStart?: string;
  lastUpdatePeriodDateEnd?: string;
  lastUpdateYear?: string;
  page?: string;
  size?: string;
  sort?: string;
};

export abstract class AbstractFolderApi {

  constructor(protected readonly httpClient: HttpClient) { }
  public abstract getTableView$(params: FoldersTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableFolder>>;

  /**
   * Handler return ErrorObservable with user-friendly error message
   * @param error server or client side errors captured by HttpClient in HttpErrorResponse
   * @private
   */
  protected handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      // A client-side or network error occurred
      return throwError({ unknown: 'message.network-error' });
    }

    // return unhandled error
    return throwError({ unhandled: 'message.unhandled-error' });
  }
}


@Injectable({
  providedIn: 'root'
})
export class FolderApi extends AbstractFolderApi {

  private readonly apiTableUrl = environment.baseAdminApiUrl + environment.adminApi.folders.tableView;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  getTableView$(tableParams: FoldersTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableFolder>> {
    const params = new HttpParams({fromObject: tableParams});
    return this.httpClient.get<PaginatedModelItemTableViewDtos<TableFolder>>(this.apiTableUrl,
      {headers: this.httpOptions.headers, params});
  }

}
