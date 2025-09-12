import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { JsonGeometry } from '@app/sig/models/geometry';
import { TableStateValue } from '@app/states/table.state';
import { Observable } from 'rxjs';
import { flatMap, map, reduce } from 'rxjs/operators';
import { InfosourceAdminApi } from '../api/infosource-admin.api';
import { InfosourceTableFilterValues } from '../models/infosource-filters.model';
import { InfosourceState, TableInfosource } from '../models/infosource-table.model';
import { InfosourceActionType, InfosourceAdminWithJsonParts, InfosourceReference, InfosourceReportActivityForecast, InfosourceReportServiceUser, InfosourceStatusByService, MapInfosource } from '../models/infosource.model';
import { AbstractInfosourceService } from './infosource.service';

@Injectable({
  providedIn: 'root'
})
export class InfosourceAdminService extends AbstractInfosourceService {

  constructor(protected readonly authService: AuthService,
              private readonly infosourceAdminApi: InfosourceAdminApi) {
    super(authService, infosourceAdminApi);
  }

  public createInfosourceHazardReport(infosourceHazardReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.createInfosourceHazardReportServiceUser(infosourceHazardReportServiceUser);
  }

  public createInfosourceOtherReport(infosourceOtherReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.createInfosourceOtherReportServiceUser(infosourceOtherReportServiceUser);
  }

  public createInfosourceMapAnomalyReport(infosourceMapAnomalyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.createInfosourceMapAnomalyReportServiceUser(infosourceMapAnomalyReportServiceUser);
  }

  public createInfosourceFutureUpdates(infosourceFutureUpdatesServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.createInfosourceFutureUpdatesServiceUser(infosourceFutureUpdatesServiceUser);
  }

  public createInfosourcePublicationReport(infosourcePublicationReportReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.createInfosourcePublicationReportServiceUser(infosourcePublicationReportReportServiceUser);
  }

  public updateInfosourceHazardReport(id: string, infosourceHazardReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.updateInfosourceHazardReportServiceUser(id, infosourceHazardReportServiceUser);
  }

  public updateInfosourceOtherReport(id: string, infosourceOtherReportServiceUser: InfosourceReportServiceUser)
    : Observable<string> {
    return this.infosourceAdminApi.updateInfosourceOtherReportServiceUser(id, infosourceOtherReportServiceUser);
  }

  public updateInfosourceMapAnomalyReport(id: string, infosourceMapAnomalyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.updateInfosourceMapAnomalyReportServiceUser(id, infosourceMapAnomalyReportServiceUser);
  }

  public updateInfosourceFutureUpdates(id: string, infosourceFutureUpdatesServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.updateInfosourceFutureUpdatesServiceUser(id, infosourceFutureUpdatesServiceUser);
  }

  public updateInfosourcePublicationReport(id: string, infosourcePublicationReportReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.updateInfosourcePublicationReportServiceUser(id, infosourcePublicationReportReportServiceUser);
  }

  public getMapInfoSource$(id: string): Observable<MapInfosource[]> {
    return this.infosourceAdminApi.getAdminMapInfoSource$(id);
  }

  public createInfosourceActivityForecast(report: InfosourceReportActivityForecast): Observable<string> {
    return this.infosourceAdminApi.createInfosourceActivityForecast(report);
  }

  public updateInfosourceActivityForecast(id: string, report: InfosourceReportActivityForecast): Observable<string> {
    return this.infosourceAdminApi.updateInfosourceActivityForecast(id, report);
  }

  public updateInfosourceComment$(id: string, comment: string): Observable<string> {
    return this.infosourceAdminApi.updateInfosourceComment$(id, comment);
  }

  loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, state: string, lang: string, filterValues: InfosourceTableFilterValues): Observable<ModelItemTablePage<TableInfosource>> {
    return this.infosourceAdminApi.getTableView$(
      {
        page: '' + pageInfo.page,
        size: '' + pageInfo.rows,
        ...InfosourceAdminService.convertFilterToRequestParams(state, lang, filterValues),
        ...(sortInfo && sortInfo.field && { sort: InfosourceAdminService.convertSortInfoToString(sortInfo) })
      }
    ).pipe(
      map<PaginatedModelItemTableViewDtos<TableInfosource>, ModelItemTablePage<TableInfosource>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  public getInfosourceById$(id: string): Observable<InfosourceAdminWithJsonParts> {
    return this.infosourceAdminApi.getInfosourceById$(id);
  }

  public getActivityForecastInfosourceById$(id: string): Observable<InfosourceReportActivityForecast> {
    return this.infosourceAdminApi.getActivityForecastInfosourceById$(id);
  }

  public reject(id: string, optionalComment?: string): Observable<void> {
    return this.infosourceAdminApi.reject$(id, optionalComment);
  }

  public send$(id: string, recipientIds: Array<string>): Observable<void> {
    return this.infosourceAdminApi.send$(id, recipientIds);
  }

  public getRoutingServices$(id: string): Observable<MaritimeService[]> {
    return this.infosourceAdminApi.getRoutingServices$(id);
  }

  public getServiceStatuses$(id: string): Observable<InfosourceStatusByService[]> {
    return this.infosourceAdminApi.getServiceStatuses$(id);
  }

  public updateServiceStatus$(id: string, serviceId: string, actionType: InfosourceActionType): Observable<void> {
    return this.infosourceAdminApi.updateServiceStatus$(id, serviceId, actionType);
  }

  public findTransferableServices$(id: string): Observable<MaritimeService[]> {
    return this.infosourceAdminApi.findTransferableServices$(id);
  }

  public transfer$(id: string, serviceIdsToTransferTo: string[]): Observable<void> {
    return this.infosourceAdminApi.transfer$(id, serviceIdsToTransferTo);
  }

  public clone$(id: string): Observable<string> {
    return this.infosourceAdminApi.clone$(id);
  }

  public getRecipientsFromSentInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<MaritimeServiceInfosourceRecipient[]> {
    return this.infosourceAdminApi.getRecipientsFromSentInfosources$(issuingServiceId, infosourceState);
  }

  public getInfosourceReportById$(id: string): Observable<InfosourceReportServiceUser> {
    return this.infosourceAdminApi.getInfosourceReportById$(id);
  }

  public createWarning$(id: string, serieId: string, copyDataFromInfosource: boolean): Observable<string> {
    return this.infosourceAdminApi.createWarning$(id, serieId, copyDataFromInfosource);
  }

  public getAvailableInfosourcesToLink$(serieId: string): Observable<InfosourceReference[]> {
    return this.infosourceAdminApi.getAvailableInfosourcesToLink$(serieId);
  }

  public getAvailableMaritimeEntitiesForCreation$(serviceId: string, geometries?: JsonGeometry[]): Observable<MaritimeEntityBase[]> {
    return this.infosourceAdminApi.getAvailableMaritimeEntities$(serviceId, geometries)
      .pipe(
        flatMap(s => [...s]),
        map(entity => {
          // if no international name available then use name instead
          entity.internationalName = entity.internationalName ?? entity.name;
          return entity;
        }),
        reduce((acc, entity) => {
          acc.push(entity);
          return acc;
        }, [])
      );
  }

  public getTagsFromInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<string[]> {
    return this.infosourceAdminApi.getTagsFromInfosources$(issuingServiceId, infosourceState);
  }

  public delete$(id: string): Observable<void> {
    return this.infosourceAdminApi.delete$(id);
  }

  public linkTagsToInfosource$(infosourceId: string, tagsIdsToLink: Array<string>): Observable<void> {
    return this.infosourceAdminApi.linkTagsToInfosource$(infosourceId, tagsIdsToLink);
  }

  public getTagsIdsFromInfosourceId$(infosourceId: string): Observable<string[]> {
    return this.infosourceAdminApi.getTagsIdsFromInfosourceId$(infosourceId);
  }

  public updateInfosourceBathyReport(infosourceBathyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceAdminApi.updateInfosourceBathyReportServiceUser(infosourceBathyReportServiceUser);
  }
}
