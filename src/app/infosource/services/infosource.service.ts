import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { ReferencesByFolder } from '@app/folder/models/folder-study.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { JsonGeometry } from '@app/sig/models/geometry';
import { TableStateValue } from '@app/states/table.state';
import { default as formatDate } from 'date-fns/format';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractInfosourceApi, InfosourceApi, InfosourcesTableApiParams } from '../api/infosource.api';
import { InfosourceTableFilterValues } from '../models/infosource-filters.model';
import { InfosourceState, TableInfosource } from '../models/infosource-table.model';
import { InfosourceActionType, InfosourceReference, InfosourceReportActivityForecast, InfosourceReportPublicUser, InfosourceReportServiceUser, InfosourceStatusByService, InfosourceWithJsonParts, MapInfosource } from '../models/infosource.model';

const DATE_FORMAT = 'yyyy-MM-dd';

export abstract class AbstractInfosourceService {

  constructor(protected readonly authService: AuthService,
    protected readonly infosourceApi: AbstractInfosourceApi) { }

  public abstract loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, state: string, lang: string, filterValues: InfosourceTableFilterValues): Observable<ModelItemTablePage<TableInfosource>>;

  public abstract createInfosourceHazardReport(infosourceHazardReportServiceUser: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract createInfosourceOtherReport(infosourceHazardReportServiceUser: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract createInfosourceMapAnomalyReport(infosourceHazardReportServiceUser: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract createInfosourcePublicationReport(infosourcePublicationReport: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract createInfosourceFutureUpdates(infosourceHazardReportServiceUser: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract updateInfosourceHazardReport(id: string, infosourceHazardReportServiceUser: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract updateInfosourceOtherReport(id: string, infosourceHazardReportServiceUser: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract updateInfosourceMapAnomalyReport(id: string, infosourceHazardReportServiceUser: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract updateInfosourcePublicationReport(id: string, infosourcePublicationReport: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract updateInfosourceFutureUpdates(id: string, infosourceHazardReportServiceUser: InfosourceReportServiceUser)
    : Observable<string>;

  public abstract updateInfosourceActivityForecast(id: string, infosourceReportActivityForecast: InfosourceReportActivityForecast)
    : Observable<string>;

  public abstract updateInfosourceComment$(id: string, comment: string): Observable<string>;

  public abstract getMapInfoSource$(id: string): Observable<MapInfosource[]>;

  public abstract createInfosourceActivityForecast(report: InfosourceReportActivityForecast): Observable<string>;

  public abstract getInfosourceById$(id: string): Observable<InfosourceWithJsonParts>;

  public abstract reject(id: string, optionalComment?: string): Observable<void>;

  public abstract send$(id: string, recipientIds?: Array<string>): Observable<void>;

  public abstract getRoutingServices$(id: string): Observable<MaritimeService[]>;

  public abstract getInfosourceReportById$(id: string): Observable<InfosourceReportServiceUser>;

  public abstract getActivityForecastInfosourceById$(id: string): Observable<InfosourceReportActivityForecast>;

  public abstract getServiceStatuses$(id: string): Observable<InfosourceStatusByService[]>;

  public abstract updateServiceStatus$(id: string, serviceId: string, actionType: InfosourceActionType): Observable<void>;

  public abstract findTransferableServices$(id: string): Observable<MaritimeService[]>;

  public abstract transfer$(id: string, serviceIdsToTransferTo: string[]): Observable<void>;

  public abstract getRecipientsFromSentInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<MaritimeServiceInfosourceRecipient[]>;

  public abstract createWarning$(id: string, serieId: string, copyDataFromInfosource: boolean): Observable<string>;

  public abstract getAvailableInfosourcesToLink$(serieId: string): Observable<InfosourceReference[]>;

  public abstract getAvailableMaritimeEntitiesForCreation$(serviceId: string, geometries?: JsonGeometry[]): Observable<MaritimeEntityBase[]>;

  public abstract getTagsFromInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<string[]>;

  public abstract clone$(id: string): Observable<string>;

  public abstract delete$(id: string): Observable<void>;

  public abstract linkTagsToInfosource$(infosourceId: string, tagsIdsToLink: Array<string>): Observable<void>;

  public abstract getTagsIdsFromInfosourceId$(infosourceId: string): Observable<string[]>;

  public abstract updateInfosourceBathyReport(infosourceBathyReportServiceUser: InfosourceReportServiceUser): Observable<string>;

  public abstract updateInfosourceBathyReport(infosourceBathyReportPublicUser: InfosourceReportPublicUser): Observable<string>;

  static convertFilterToRequestParams(state: string, lang: string, filter: InfosourceTableFilterValues): InfosourcesTableApiParams {
    const params: InfosourcesTableApiParams = {
      state,
      lang
    };

    if (filter.service?.id) {
      params.issuingServiceId = filter.service.id;
    }

    if (filter.archived) {
      params.archived = '' + filter.archived;
    }

    if (filter.rejected) {
      params.rejected = '' + filter.rejected;
    }

    if (filter.natures?.length) {
      params.natures = filter.natures.join(',');
    }

    if (filter.maritimeEntityIds?.length) {
      params.maritimeEntityIds = filter.maritimeEntityIds.join(',');
    }

    if (filter.tags?.length) {
      params.tags = filter.tags.join(',');
    }

    if (filter.lastUpdatePeriod?.startDate) {
      params.lastUpdatePeriodDateStart = formatDate(filter.lastUpdatePeriod.startDate, DATE_FORMAT);
    }

    if (filter.lastUpdatePeriod?.endDate) {
      params.lastUpdatePeriodDateEnd = formatDate(filter.lastUpdatePeriod.endDate, DATE_FORMAT);
    }

    if (filter.number) {
      params.number = filter.number;
    }

    if (filter.sendingPeriod?.startDate) {
      params.sendingPeriodDateStart = formatDate(filter.sendingPeriod.startDate, DATE_FORMAT);
    }

    if (filter.sendingPeriod?.endDate) {
      params.sendingPeriodDateEnd = formatDate(filter.sendingPeriod.endDate, DATE_FORMAT);
    }

    if (filter.sendingYear) {
      params.sendingYear = filter.sendingYear;
    }

    if (filter.recipientIds?.length) {
      params.recipientIds = filter.recipientIds.join(',');
    }

    if (filter.affairNumber) {
      params.affairNumber = filter.affairNumber;
    }

    if (filter.serviceStatuses?.length) {
      params.serviceStatuses = filter.serviceStatuses.join(',');
    }

    return params;
  }

  static convertSortInfoToString(sortInfo: SortInfo): string {
    if (!sortInfo) {
      return '';
    }
    const order = sortInfo.order === 1 ? 'asc' : 'desc';
    return `${sortInfo.field},${order}`;
  }

  public getFolderReferencesByFolderLinkedToInfosource$(infosourceId: string): Observable<ReferencesByFolder[]> {
    return this.infosourceApi.getFolderReferencesByFolderLinkedToInfosource$(infosourceId);
  }
}


@Injectable({
  providedIn: 'root'
})
export class InfosourceService extends AbstractInfosourceService {

  private readonly errorMessageNotImplemented = 'Should not be called by public user';

  constructor(protected readonly authService: AuthService,
              protected readonly infosourceApi: InfosourceApi) {
    super(authService, infosourceApi);
  }

  loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, state: string, lang: string, filterValues: InfosourceTableFilterValues): Observable<ModelItemTablePage<TableInfosource>> {
    return this.infosourceApi.getTableView$(
      {
        page: '' + pageInfo.page,
        size: '' + pageInfo.rows,
        ...InfosourceService.convertFilterToRequestParams(state, lang, filterValues),
        ...(sortInfo && sortInfo.field && { sort: InfosourceService.convertSortInfoToString(sortInfo) })
      }
    ).pipe(
      map<PaginatedModelItemTableViewDtos<TableInfosource>, ModelItemTablePage<TableInfosource>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  public createInfosourceHazardReport(infosourceHazardReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceApi.createInfosourceHazardReportPublicUser(infosourceHazardReportServiceUser);
  }

  public createInfosourceOtherReport(infosourceOtherReportServiceUser: InfosourceReportServiceUser)
    : Observable<string> {
    return this.infosourceApi.createInfosourceOtherReportPublicUser(infosourceOtherReportServiceUser);
  }

  public createInfosourceMapAnomalyReport(infosourceMapAnomalyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceApi.createInfosourceMapAnomalyReportPublicUser(infosourceMapAnomalyReportServiceUser);
  }

  public createInfosourceFutureUpdates(infosourceFutureUpdatesServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceApi.createInfosourceFutureUpdatesPublicUser(infosourceFutureUpdatesServiceUser);
  }

  public createInfosourcePublicationReport(infosourcePublicationReportReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceApi.createInfosourcePublicationReportPublicUser(infosourcePublicationReportReportPublicUser);
  }

  public createInfosourceActivityForecast(report: InfosourceReportActivityForecast): Observable<string> {
    return this.infosourceApi.createInfosourceActivityForecastReportPublicUser(report);
  }

  public updateInfosourceHazardReport(id: string, infosourceHazardReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceApi.updateInfosourceHazardReportPublicUser(id, infosourceHazardReportServiceUser);
  }

  public updateInfosourceOtherReport(id: string, infosourceOtherReportServiceUser: InfosourceReportServiceUser)
    : Observable<string> {
    return this.infosourceApi.updateInfosourceOtherReportPublicUser(id, infosourceOtherReportServiceUser);
  }

  public updateInfosourceMapAnomalyReport(id: string, infosourceMapAnomalyReportServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceApi.updateInfosourceMapAnomalyReportPublicUser(id, infosourceMapAnomalyReportServiceUser);
  }

  public updateInfosourceFutureUpdates(id: string, infosourceFutureUpdatesServiceUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceApi.updateInfosourceFutureUpdatesPublicUser(id, infosourceFutureUpdatesServiceUser);
  }

  public updateInfosourcePublicationReport(id: string, infosourcePublicationReportReportPublicUser: InfosourceReportServiceUser): Observable<string> {
    return this.infosourceApi.updateInfosourcePublicationReportPublicUser(id, infosourcePublicationReportReportPublicUser);
  }

  public updateInfosourceActivityForecast(id: string, report: InfosourceReportActivityForecast): Observable<string> {
    return this.infosourceApi.updateInfosourceActivityForecastReportPublicUser(id, report);
  }

  public getMapInfoSource$(id: string): Observable<MapInfosource[]> {
    return this.infosourceApi.getMapInfoSource$(id);
  }

  public getInfosourceById$(id: string): Observable<InfosourceWithJsonParts> {
    return this.infosourceApi.getInfosourceById$(id);
  }

  public reject(id: string, optionalComment?: string): Observable<void> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public send$(id: string): Observable<void> {
    return this.infosourceApi.send$(id);
  }

  public getRoutingServices$(id: string): Observable<MaritimeService[]> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public getServiceStatuses$(id: string): Observable<InfosourceStatusByService[]> {
    return this.infosourceApi.getServiceStatuses$(id);
  }

  public updateServiceStatus$(id: string, serviceId: string, actionType: InfosourceActionType): Observable<void> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public findTransferableServices$(id: string): Observable<MaritimeService[]> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public transfer$(id: string, serviceIdsToTransferTo: string[]): Observable<void> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public clone$(id: string): Observable<string> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public getRecipientsFromSentInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<MaritimeServiceInfosourceRecipient[]> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public createWarning$(id: string, serieId: string, copyDataFromInfosource: boolean): Observable<string> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public getInfosourceReportById$(id: string): Observable<InfosourceReportServiceUser> {
    return this.infosourceApi.getInfosourceReportById$(id);
  }

  public getAvailableInfosourcesToLink$(serieId: string): Observable<InfosourceReference[]> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public updateInfosourceComment$(id: string, comment: string): Observable<string> {
    return this.infosourceApi.updateInfosourceComment$(id, comment);
  }

  public getActivityForecastInfosourceById$(id: string): Observable<InfosourceReportActivityForecast> {
    return this.infosourceApi.getActivityForecastInfosourceById$(id);
  }

  public getAvailableMaritimeEntitiesForCreation$(serviceId: string, geometries?: JsonGeometry[]): Observable<MaritimeEntityBase[]> {
    return of([]);
  }

  public getTagsFromInfosources$(issuingServiceId: string, infosourceState: InfosourceState): Observable<string[]> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public delete$(id: string): Observable<void> {
    return this.infosourceApi.delete$(id);
  }

  public linkTagsToInfosource$(infosourceId: string, tagsIdsToLink: Array<string>): Observable<void> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public getTagsIdsFromInfosourceId$(infosourceId: string): Observable<string[]> {
    throw new Error(this.errorMessageNotImplemented);
  }

  public updateInfosourceBathyReport(infosourceBathyReportPublicUser: InfosourceReportPublicUser): Observable<string> {
    return this.infosourceApi.updateInfosourceBathyReportPublicUser(infosourceBathyReportPublicUser);
  }
}
