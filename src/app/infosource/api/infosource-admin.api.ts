import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import MaritimeEntity, { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { JsonGeometry } from '@app/sig/models/geometry';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InfosourceState, TableInfosource } from '../models/infosource-table.model';
import { InfosourceActionType, InfosourceAdminWithJsonParts, InfosourceReference, InfosourceReportActivityForecast, InfosourceReportServiceUser, InfosourceStatusByService, MapInfosource } from '../models/infosource.model';
import { AbstractInfosourceApi, InfosourcesTableApiParams } from './infosource.api';

@Injectable({
  providedIn: 'root'
})
export class InfosourceAdminApi extends AbstractInfosourceApi {

  readonly apiTableUrl = environment.baseAdminApiUrl + environment.adminApi.infosources.tableView;
  readonly apiGetInfosourceById = environment.baseAdminApiUrl + environment.adminApi.infosources.getDetailsById;
  readonly apiCreate = environment.baseAdminApiUrl + environment.adminApi.infosources.create;
  readonly apiUpdate = environment.baseAdminApiUrl + environment.adminApi.infosources.update;
  readonly apiReject = environment.baseAdminApiUrl + environment.adminApi.infosources.reject;
  readonly apiSend = environment.baseAdminApiUrl + environment.adminApi.infosources.send;
  readonly apiGetRoutingServices = environment.baseAdminApiUrl + environment.adminApi.infosources.getRoutingServices;
  readonly apiGetStatusByService = environment.baseAdminApiUrl + environment.adminApi.infosources.getStatusByService;
  readonly apiUpdateServiceStatus = environment.baseAdminApiUrl + environment.adminApi.infosources.apiUpdateServiceStatus;
  readonly apiGetTransferableServices = environment.baseAdminApiUrl + environment.adminApi.infosources.apiGetTransferableServices;
  readonly apiTransfer = environment.baseAdminApiUrl + environment.adminApi.infosources.apiTransfer;
  readonly apiClone = environment.baseAdminApiUrl + environment.adminApi.infosources.apiClone;
  readonly apiGetRecipientsFromSentInfosources = environment.baseAdminApiUrl + environment.adminApi.infosources.getRecipientsFromSentInfosources;
  readonly apiInfosourceReportById = environment.baseAdminApiUrl + environment.adminApi.infosources.getInfosourceReportById;
  readonly apiCreateWarning = environment.baseAdminApiUrl + environment.adminApi.infosources.createWarning;
  readonly apiGetAvailableInfosourcesToLink = environment.baseAdminApiUrl + environment.adminApi.infosources.getAvailableInfosourcesToLink;
  readonly apiGetAvailableMaritimeEntities = environment.baseAdminApiUrl + environment.adminApi.infosources.getAvailableEntitiesForCreation;
  readonly apiGetTagsFromInfosources = environment.baseAdminApiUrl + environment.adminApi.infosources.getTagsFromInfosources;
  readonly apiLinkTagsToInfosource = environment.baseAdminApiUrl + environment.adminApi.infosources.linkTagsToInfosource;
  readonly apiGetTagsIdsFromInfosourceId = environment.baseAdminApiUrl + environment.adminApi.infosources.getTagsIdsFromInfosourceId;
  readonly apiDelete = environment.baseAdminApiUrl + environment.adminApi.infosources.delete;

  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  createInfosourceHazardReportServiceUser(infosourceHazardReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/hazard-report`, infosourceHazardReportServiceUser, this.httpOptions);
  }

  createInfosourceOtherReportServiceUser(infosourceOtherReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/other-report`, infosourceOtherReportServiceUser, this.httpOptions);
  }

  createInfosourceMapAnomalyReportServiceUser(infosourceMapAnomalyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/map-anomaly`, infosourceMapAnomalyReportServiceUser, this.httpOptions);
  }

  createInfosourceFutureUpdatesServiceUser(infosourceFutureUpdatesServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/future-updates`, infosourceFutureUpdatesServiceUser, this.httpOptions);
  }

  createInfosourcePublicationReportServiceUser(infosourcePublicationReportReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/publication-anomaly`, infosourcePublicationReportReportPublicUser, this.httpOptions);
  }

  updateInfosourceHazardReportServiceUser(id: string, infosourceHazardReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/hazard-report/` + id, infosourceHazardReportServiceUser, this.httpOptions);
  }

  updateInfosourceOtherReportServiceUser(id: string, infosourceOtherReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/other-report/` + id, infosourceOtherReportServiceUser, this.httpOptions);
  }

  updateInfosourceMapAnomalyReportServiceUser(id: string, infosourceMapAnomalyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/map-anomaly/` + id, infosourceMapAnomalyReportServiceUser, this.httpOptions);
  }

  updateInfosourceFutureUpdatesServiceUser(id: string, infosourceFutureUpdatesServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/future-updates/` + id, infosourceFutureUpdatesServiceUser, this.httpOptions);
  }

  updateInfosourcePublicationReportServiceUser(id: string, infosourcePublicationReportReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/publication-anomaly/` + id, infosourcePublicationReportReportPublicUser, this.httpOptions);
  }

  updateInfosourceActivityForecast(id: string, InfosourceReportActivityForecast: InfosourceReportActivityForecast): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/activity-forecast/` + id, InfosourceReportActivityForecast, this.httpOptions);
  }

  updateInfosourceComment$(id: string, comment: string): Observable<string> {
    return this.httpClient.put<string>(`${this.apiUpdate}/${id}/comment`, { comment });
  }

  getAdminMapInfoSource$(infosourceId: string): Observable<MapInfosource[]> {
    let params = new HttpParams();
    if (infosourceId) {
      params = new HttpParams().set('infosourceId', infosourceId);
    }
    return this.httpClient.get<MapInfosource[]>(`${this.apiCreate}/for-creation-map`, { params: params, headers: this.httpOptions.headers });
  }

  createInfosourceActivityForecast(report: InfosourceReportActivityForecast): Observable<string> {
    return this.httpClient.post<string>(`${this.apiCreate}/activity-forecast`, report, this.httpOptions);
  }

  getTableView$(params: InfosourcesTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableInfosource>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.httpClient.get<PaginatedModelItemTableViewDtos<TableInfosource>>(this.apiTableUrl,
      { params: httpParams, headers: this.httpOptions.headers });
  }

  public getInfosourceById$(id: string): Observable<InfosourceAdminWithJsonParts> {
    return this.httpClient.get<InfosourceAdminWithJsonParts>(`${this.apiGetInfosourceById.replace('{{id}}', id)}`);
  }

  public getActivityForecastInfosourceById$(id: string): Observable<InfosourceReportActivityForecast> {
    return this.httpClient.get<InfosourceReportActivityForecast>(`${this.apiCreate}/activity-forecast/${id}`);
  }

  public reject$(id: string, optionalComment?: string): Observable<void> {
    return this.httpClient.put<void>(`${this.apiReject.replace('{{id}}', id)}`, optionalComment);
  }

  public send$(id: string, recipientIds: Array<string>): Observable<void> {
    return this.httpClient.put<void>(`${this.apiSend.replace('{{id}}', id)}`, recipientIds)
      .pipe(
        catchError(this.handleError)
      );
  }

  getRoutingServices$(id: string): Observable<MaritimeService[]> {
    return this.httpClient.get<MaritimeService[]>(`${this.apiGetRoutingServices.replace('{{id}}', id)}`, this.httpOptions);
  }

  public getServiceStatuses$(id: string): Observable<InfosourceStatusByService[]> {
    return this.httpClient.get<InfosourceStatusByService[]>(`${this.apiGetStatusByService.replace('{{id}}', id)}`, this.httpOptions);
  }

  public updateServiceStatus$(id: string, serviceId: string, actionType: InfosourceActionType): Observable<void> {
    return this.httpClient.put<void>(`${this.apiUpdateServiceStatus.replace('{{id}}', id)}`, { serviceId, actionType });
  }

  public findTransferableServices$(id: string): Observable<MaritimeEntity[]> {
    return this.httpClient.get<MaritimeEntity[]>(`${this.apiGetTransferableServices.replace('{{id}}', id)}`);
  }

  public transfer$(id: string, serviceIdsToTransferTo: string[]): Observable<void> {
    return this.httpClient.put<void>(`${this.apiTransfer.replace('{{id}}', id)}`, serviceIdsToTransferTo);
  }

  public clone$(id: string): Observable<string> {
    return this.httpClient.put<string>(`${this.apiClone.replace('{{id}}', id)}`, {});
  }

  public delete$(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiDelete.replace('{{id}}', id)}`, {});
  }

  getRecipientsFromSentInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<MaritimeServiceInfosourceRecipient[]> {
    return this.httpClient.get<MaritimeServiceInfosourceRecipient[]>(
      `${this.apiGetRecipientsFromSentInfosources.replace('{{issuingServiceId}}', issuingServiceId).replace('{{infosourceState}}', infosourceState)}`
    );
  }

  public getInfosourceReportById$(id: string): Observable<InfosourceReportServiceUser> {
    return this.httpClient.get<InfosourceReportServiceUser>(this.apiInfosourceReportById.replace('{{id}}', id));
  }

  public createWarning$(id: string, serieId: string, copyDataFromInfosource: boolean): Observable<string> {
    return this.httpClient.put<string>(this.apiCreateWarning.replace('{{id}}', id).replace('{{serieId}}', serieId).replace('{{copyDataFromInfosource}}', `${copyDataFromInfosource}`), {});
  }

  public getAvailableInfosourcesToLink$(serieId: string): Observable<InfosourceReference[]> {
    return this.httpClient.get<InfosourceReference[]>(`${this.apiGetAvailableInfosourcesToLink.replace('{{serieId}}', serieId)}`);
  }

  getAvailableMaritimeEntities$(serviceId: string, geometries?: JsonGeometry[]): Observable<MaritimeEntityBase[]> {
    return this.httpClient.post<MaritimeEntityBase[]>(this.apiGetAvailableMaritimeEntities.replace('{{serviceId}}', serviceId), geometries, this.httpOptions);
  }

  getTagsFromInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.apiGetTagsFromInfosources.replace('{{issuingServiceId}}', issuingServiceId).replace('{{infosourceState}}', infosourceState)}`);
  }

  linkTagsToInfosource$(infosourceId: string, tagsIdsToLink: Array<string>): Observable<void> {
    return this.httpClient.put<void>(`${this.apiLinkTagsToInfosource.replace('{{id}}', infosourceId)}`, infosourceId,
      {
        params: new HttpParams().set('tagsIdsToLink', tagsIdsToLink.join(',')),
        headers: this.httpOptions.headers
      });
  }

  getTagsIdsFromInfosourceId$(infosourceId: string): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.apiGetTagsIdsFromInfosourceId.replace('{{id}}', infosourceId)}`);
  }

  updateInfosourceBathyReportServiceUser(infosourceBathyReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreate}/bathy-report/${infosourceBathyReportPublicUser.id}`, infosourceBathyReportPublicUser, this.httpOptions);
  }
}
