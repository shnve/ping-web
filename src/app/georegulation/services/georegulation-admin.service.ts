import { Injectable } from '@angular/core';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { MaritimeServiceBase, MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { TableStateValue } from '@app/states/table.state';
import { format } from 'date-fns';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeoregulationAdminApi, GeoregulationsTableApiParams } from '../api/georegulation-admin.api';
import { GeoregulationTableFilterValues } from '../models/georegulation-filters.model';
import { TableGeoregulation } from '../models/georegulation-table.model';
import { GeoregulationCreation, GeoregulationStatusEnum, GeoregulationType, JsonGeoregulationModalDetails, MapGeoregulation } from '../models/georegulation.model';
import { AbstractGeoregulationService } from './abstract-georegulation.service';

@Injectable({
  providedIn: 'root'
})
export class GeoregulationAdminService extends AbstractGeoregulationService {

  constructor(private readonly georegulationAdminApi: GeoregulationAdminApi) {
    super(georegulationAdminApi);
  }

  getAvailableMaritimeEntitiesForCreation$(serviceId: string): Observable<MaritimeEntityBase[]> {
    return this.georegulationAdminApi.getAvailableMaritimeEntities$(serviceId);
  }

  create$(georegulation: GeoregulationCreation): Observable<string> {
    return this.georegulationAdminApi.create$(georegulation);
  }

  getMapGeoregulations$(georegulationType: GeoregulationType, issuingServiceId: string): Observable<MapGeoregulation[]> {
    return this.georegulationAdminApi.getMapGeoregulations$(georegulationType, issuingServiceId);
  }

  loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, status: GeoregulationStatusEnum, issuingServiceId: string, filterValues: GeoregulationTableFilterValues): Observable<ModelItemTablePage<TableGeoregulation>> {
    return this.georegulationAdminApi.getTableView$(
      {
        page: '' + pageInfo.page,
        size: '' + pageInfo.rows,
        ...GeoregulationAdminService.convertFilterToRequestParams(status, issuingServiceId, filterValues),
        ...(sortInfo && sortInfo.field && { sort: GeoregulationAdminService.convertSortInfoToString(sortInfo) })
      }
    ).pipe(
      map<PaginatedModelItemTableViewDtos<TableGeoregulation>, ModelItemTablePage<TableGeoregulation>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  private static convertSortInfoToString(sortInfo: SortInfo): string {
    if (!sortInfo) {
      return '';
    }
    const order = sortInfo.order === 1 ? 'asc' : 'desc';
    return `${sortInfo.field},${order}`;
  }

  private static convertFilterToRequestParams(status: GeoregulationStatusEnum, issuingServiceId: string, filter: GeoregulationTableFilterValues): GeoregulationsTableApiParams {
    const params: GeoregulationsTableApiParams = { status, issuingServiceId };

    if (filter.mainNumberYear) {
      params.mainNumberYear = filter.mainNumberYear;
    }

    if (filter.mainNumberText) {
      params.mainNumberText = filter.mainNumberText;
    }

    if (filter.mainNumberAuthorities?.length) {
      params.mainNumberAuthorityIds = filter.mainNumberAuthorities.map(authority => authority.id).join(',');
    }

    if (filter.mainNumberDate) {
      params.mainNumberDate = format(filter.mainNumberDate, 'yyyy-MM-dd');
    }

    if (filter.type) {
      params.type = filter.type;
    }

    if (filter.activities?.length) {
      params.activities = filter.activities.join(',');
    }

    if (filter.entities?.length) {
      params.maritimeEntityIds = filter.entities.map(entity => entity.id).join(',');
    }

    if (filter.isPublic !== null && filter.isPublic !== undefined) {
      params.isPublic = filter.isPublic;
    }

    if (filter.isNew !== null && filter.isNew !== undefined) {
      params.isNew = filter.isNew;
    }

    if (filter.isExpired !== null && filter.isExpired !== undefined) {
      params.isExpired = filter.isExpired;
    }

    return params;
  }

  getAuthoritiesToSelect$(): Observable<MaritimeServiceBase[]> {
    return this.georegulationAdminApi.getAuthoritiesToSelect$();
  }

  getAuthoritiesToFilter$(issuingServiceId: string): Observable<MaritimeServiceBase[]> {
    return this.georegulationAdminApi.getAuthoritiesToFilter$(issuingServiceId);
  }

  getEntitiesToFilter$(): Observable<MaritimeEntityBase[]> {
    return this.georegulationAdminApi.getEntitiesToFilter$();
  }

  getModalDetails$(id: string): Observable<JsonGeoregulationModalDetails> {
    return this.georegulationAdminApi.getModalDetails$(id);
  }

  publish$(id: string): Observable<void> {
    return this.georegulationAdminApi.publish$(id);
  }

  repeal$(id: string): Observable<void> {
    return this.georegulationAdminApi.repeal$(id);
  }

  getRecipients$(id: string): Observable<MaritimeServiceInfosourceRecipient[]> {
    return this.georegulationAdminApi.getRecipients$(id);
  }

  send$(id: string, recipientIds: string[]): Observable<void> {
    return this.georegulationAdminApi.send$(id, recipientIds);
  }

  getGeoregulationById$(id: string): Observable<GeoregulationCreation> {
    return this.georegulationAdminApi.getGeoregulationById$(id);
  }

  update$(georegulation: GeoregulationCreation, onlySummaryAndRestrictionCategories = false): Observable<void> {
    return this.georegulationAdminApi.update$(georegulation, onlySummaryAndRestrictionCategories);
  }

  delete$(id: string): Observable<void> {
    return this.georegulationAdminApi.delete$(id);
  }

  clone$(id: string, clonedGeoregulationNumberText: string): Observable<string> {
    return this.georegulationAdminApi.clone$(id, clonedGeoregulationNumberText);
  }
}
