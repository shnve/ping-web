import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReferencesByFolder } from '@app/folder/models/folder-study.model';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TableInfosource } from '../models/infosource-table.model';
import { InfosourceReportActivityForecast, InfosourceReportPublicUser, InfosourceReportServiceUser, InfosourceStatusByService, InfosourceWithJsonParts, MapInfosource } from '../models/infosource.model';

export type InfosourcesTableApiParams = {
  issuingServiceId?: string;
  state: string;
  rejected?: string;
  archived?: string;
  natures?: string;
  maritimeEntityIds?: string;
  tags?: string;
  lastUpdatePeriodDateStart?: string;
  lastUpdatePeriodDateEnd?: string;
  number?: string;
  sendingPeriodDateStart?: string;
  sendingPeriodDateEnd?: string;
  sendingYear?: string;
  recipientIds?: string;
  affairNumber?: string;
  serviceStatuses?: string;
  page?: string;
  size?: string;
  sort?: string;
  lang?: string;
};

export abstract class AbstractInfosourceApi {
  constructor(protected readonly httpClient: HttpClient) { }
  public abstract getTableView$(params: InfosourcesTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableInfosource>>;
  public abstract getInfosourceById$(id: string): Observable<InfosourceWithJsonParts>;
  public abstract send$(id: string, recipientIds?: Array<string>): Observable<void>;
  public abstract getServiceStatuses$(id: string): Observable<InfosourceStatusByService[]>;
  public abstract getActivityForecastInfosourceById$(id: string): Observable<InfosourceReportActivityForecast>;

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

    if (error.status === 500) {
      const message = error.error.message;

      // return error related to infosource routing
      if (message === 'infosource-routing.rejected') {
        return throwError({ routing: 'detail.infosource-rejected' });
      }
    }

    // return unhandled error
    return throwError({ unhandled: 'message.unhandled-error' });
  }

  public getFolderReferencesByFolderLinkedToInfosource$(infosourceId: string): Observable<ReferencesByFolder[]> {
    const httpParams = new HttpParams().append('infosourceId', infosourceId);
    return this.httpClient.get<ReferencesByFolder[]>(`${InfosourceApi.apiTableUrl}/folder-references`, { params: httpParams });
  }
}


@Injectable({
  providedIn: 'root'
})
export class InfosourceApi extends AbstractInfosourceApi {

  static readonly apiTableUrl = environment.baseSecuredApiUrl + environment.securedApi.infosources.tableView;
  readonly apiGetInfosourceById = environment.baseSecuredApiUrl + environment.securedApi.infosources.getDetailsById;
  readonly apiCreate = environment.baseSecuredApiUrl + environment.securedApi.infosources.create;
  readonly apiUpdate = environment.baseSecuredApiUrl + environment.securedApi.infosources.update;
  readonly apiSend = environment.baseSecuredApiUrl + environment.securedApi.infosources.send;
  readonly apiGetStatusByService = environment.baseSecuredApiUrl + environment.securedApi.infosources.getStatusByService;
  readonly apiInfosourceReportById = environment.baseSecuredApiUrl + environment.securedApi.infosources.getInfosourceReportById;
  readonly apiDelete = environment.baseSecuredApiUrl + environment.securedApi.infosources.delete;

  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  createInfosourceHazardReportPublicUser(infosourceHazardReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/hazard-report`, infosourceHazardReportPublicUser, this.httpOptions);
  }

  createInfosourceOtherReportPublicUser(infosourceOtherReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/other-report`, infosourceOtherReportPublicUser, this.httpOptions);
  }

  createInfosourceMapAnomalyReportPublicUser(infosourceMapAnomalyReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/map-anomaly`, infosourceMapAnomalyReportPublicUser, this.httpOptions);
  }

  createInfosourceFutureUpdatesPublicUser(infosourceFutureUpdatesPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/future-updates`, infosourceFutureUpdatesPublicUser, this.httpOptions);
  }

  createInfosourcePublicationReportPublicUser(infosourcePublicationReportReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/publication-anomaly`, infosourcePublicationReportReportPublicUser, this.httpOptions);
  }

  createInfosourceActivityForecastReportPublicUser(report: InfosourceReportActivityForecast): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/activity-forecast`, report, this.httpOptions);
  }

  updateInfosourceHazardReportPublicUser(id: string, infosourceHazardReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/hazard-report/` + id, infosourceHazardReportPublicUser, this.httpOptions);
  }

  updateInfosourceOtherReportPublicUser(id: string, infosourceOtherReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/other-report/` + id, infosourceOtherReportPublicUser, this.httpOptions);
  }

  updateInfosourceMapAnomalyReportPublicUser(id: string, infosourceMapAnomalyReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/map-anomaly/` + id, infosourceMapAnomalyReportPublicUser, this.httpOptions);
  }

  updateInfosourceFutureUpdatesPublicUser(id: string, infosourceFutureUpdatesPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/future-updates/` + id, infosourceFutureUpdatesPublicUser, this.httpOptions);
  }

  updateInfosourcePublicationReportPublicUser(id: string, infosourcePublicationReportReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/publication-anomaly/` + id, infosourcePublicationReportReportPublicUser, this.httpOptions);
  }

  updateInfosourceActivityForecastReportPublicUser(id: string, report: InfosourceReportActivityForecast): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/activity-forecast/` + id, report, this.httpOptions);
  }

  updateInfosourceComment$(id: string, comment: string): Observable<string> {
    return this.httpClient.put<string>(`${this.apiUpdate}/${id}/comment`, { comment });
  }

  getMapInfoSource$(infosourceId: string): Observable<MapInfosource[]> {
    let params = new HttpParams();
    if (infosourceId) {
      params = new HttpParams().set('infosourceId', infosourceId);
    }
    return this.httpClient.get<MapInfosource[]>(`${this.apiCreate}/for-creation-map`, { params, headers: this.httpOptions.headers });
  }

  getTableView$(params: InfosourcesTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableInfosource>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.httpClient.get<PaginatedModelItemTableViewDtos<TableInfosource>>(InfosourceApi.apiTableUrl,
      { params: httpParams, headers: this.httpOptions.headers });
  }

  public getInfosourceById$(id: string): Observable<InfosourceWithJsonParts> {
    return this.httpClient.get<InfosourceWithJsonParts>(`${this.apiGetInfosourceById.replace('{{id}}', id)}`);
  }

  public getActivityForecastInfosourceById$(id: string): Observable<InfosourceReportActivityForecast> {
    return this.httpClient.get<InfosourceReportActivityForecast>(`${this.apiCreate}/activity-forecast/${id}`);
  }

  public send$(id: string): Observable<void> {
    return this.httpClient.put<void>(`${this.apiSend.replace('{{id}}', id)}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  public getServiceStatuses$(id: string): Observable<InfosourceStatusByService[]> {
    return this.httpClient.get<InfosourceStatusByService[]>(`${this.apiGetStatusByService.replace('{{id}}', id)}`, this.httpOptions);
  }

  public getInfosourceReportById$(id: string): Observable<InfosourceReportServiceUser> {
    return this.httpClient.get<InfosourceReportServiceUser>(`${this.apiInfosourceReportById.replace('{{id}}', id)}`);
  }

  public delete$(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiDelete.replace('{{id}}', id)}`, {});
  }

  updateInfosourceBathyReportPublicUser(infosourceBathyReportPublicUser: InfosourceReportPublicUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/bathy-report/${infosourceBathyReportPublicUser.id}`, infosourceBathyReportPublicUser, this.httpOptions);
  }
}
