import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeoregulationSelectOption } from '@app/models/georegulation.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { MaritimeServiceBase, MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { TableGeoregulation } from '../models/georegulation-table.model';
import { GeoregulationCreation, GeoregulationPartTypes, GeoregulationStatusEnum, GeoregulationType, JsonGeoregulationModalDetails, MapGeoregulation } from '../models/georegulation.model';
import { AbstractGeoregulationApi } from './abstract-georegulation.api';

export type GeoregulationsTableApiParams = {
  status: GeoregulationStatusEnum;
  issuingServiceId: string;
  mainNumberYear?: number;
  mainNumberText?: string;
  mainNumberAuthorityIds?: string;
  mainNumberDate?: string;
  activities?: string;
  maritimeEntityIds?: string;
  isPublic?: boolean;
  isNew?: boolean;
  isExpired?: boolean;
  type?: string;
  page?: string;
  size?: string;
  sort?: string;
};

@Injectable({
  providedIn: 'root'
})
export class GeoregulationAdminApi extends AbstractGeoregulationApi {

  private readonly apiGetAvailableMaritimeEntities = environment.baseAdminApiUrl + environment.adminApi.infosources.getAvailableEntitiesForCreation;
  private readonly apiCreateOrUpdate = environment.baseAdminApiUrl + environment.adminApi.georegulations.createOrUpdate;
  private readonly apiGetGeoregulationsByTypeForCreationMap = environment.baseAdminApiUrl + environment.adminApi.georegulations.getGeoregulationsByTypeForCreationMap;
  private readonly apiTableUrl = environment.baseAdminApiUrl + environment.adminApi.georegulations.tableView;
  private readonly apiGetAuthoritiesToSelect = environment.baseAdminApiUrl + environment.adminApi.georegulations.authoritiesToSelect;
  private readonly apiGetAuthoritiesToFilter = environment.baseAdminApiUrl + environment.adminApi.georegulations.authoritiesToFilter;
  private readonly apiGetEntitiesToFilter = environment.baseAdminApiUrl + environment.adminApi.georegulations.entitiesToFilter;
  private readonly apiGetModalDetails = environment.baseAdminApiUrl + environment.adminApi.georegulations.modalDetails;
  private readonly apiPublish = environment.baseAdminApiUrl + environment.adminApi.georegulations.publish;
  private readonly apiRepeal = environment.baseAdminApiUrl + environment.adminApi.georegulations.repeal;
  private readonly apiGetRecipients = environment.baseAdminApiUrl + environment.adminApi.georegulations.getRecipients;
  private readonly apiSend = environment.baseAdminApiUrl + environment.adminApi.georegulations.send;
  private readonly apiGetGeoregulationById = environment.baseAdminApiUrl + environment.adminApi.georegulations.byId;
  private readonly apiGetAvailableGeoregulationsToLink = environment.baseAdminApiUrl + environment.adminApi.georegulations.getAvailableGeoregulationsToLink;
  private readonly apiUpdateSummaryAndRestrictionCategories = environment.baseAdminApiUrl + environment.adminApi.georegulations.updateSummary;
  private readonly apiDelete = environment.baseAdminApiUrl + environment.adminApi.georegulations.delete;
  private readonly apiClone = environment.baseAdminApiUrl + environment.adminApi.georegulations.clone;
  private readonly apiGetAvailableGeoregulationsToLinkAsWarningReference = environment.baseAdminApiUrl + environment.adminApi.georegulations.getAvailableGeoregulationsToLinkAsWarningReference;


  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  getAvailableMaritimeEntities$(serviceId: string): Observable<MaritimeEntityBase[]> {
    return this.httpClient.post<MaritimeEntityBase[]>(this.apiGetAvailableMaritimeEntities.replace('{{serviceId}}', serviceId), null);
  }

  create$(georegulation: GeoregulationCreation): Observable<string> {
    return this.httpClient.post<string>(this.apiCreateOrUpdate, georegulation);
  }

  getMapGeoregulations$(georegulationType: GeoregulationType, issuingServiceId: string): Observable<MapGeoregulation[]> {
    const params = new HttpParams().set('georegulationType', georegulationType).set('issuingServiceId', issuingServiceId);
    return this.httpClient.get<MapGeoregulation[]>(this.apiGetGeoregulationsByTypeForCreationMap, { params });
  }

  getTableView$(tableParams: GeoregulationsTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableGeoregulation>> {
    const params = new HttpParams({ fromObject: tableParams });
    return this.httpClient.get<PaginatedModelItemTableViewDtos<TableGeoregulation>>(this.apiTableUrl, { params });
  }

  getAuthoritiesToSelect$(): Observable<MaritimeServiceBase[]> {
    return this.httpClient.get<MaritimeServiceBase[]>(this.apiGetAuthoritiesToSelect);
  }

  getAuthoritiesToFilter$(issuingServiceId: string): Observable<MaritimeServiceBase[]> {
    const params = new HttpParams().set('issuingServiceId', issuingServiceId);
    return this.httpClient.get<MaritimeServiceBase[]>(this.apiGetAuthoritiesToFilter, { params });
  }

  getEntitiesToFilter$(): Observable<MaritimeEntityBase[]> {
    return this.httpClient.get<MaritimeEntityBase[]>(this.apiGetEntitiesToFilter);
  }

  getModalDetails$(id: string): Observable<JsonGeoregulationModalDetails> {
    return this.httpClient.get<JsonGeoregulationModalDetails>(this.apiGetModalDetails.replace('{{id}}', id));
  }

  publish$(id: string): Observable<void> {
    return this.httpClient.put<void>(`${this.apiPublish.replace('{{id}}', id)}`, {});
  }

  repeal$(id: string): Observable<void> {
    return this.httpClient.put<void>(this.apiRepeal.replace('{{id}}', id), {});
  }

  getRecipients$(id: string): Observable<MaritimeServiceInfosourceRecipient[]> {
    return this.httpClient.get<MaritimeServiceInfosourceRecipient[]>(this.apiGetRecipients.replace('{{id}}', id), {});
  }

  send$(id: string, recipientIds: string[]): Observable<void> {
    return this.httpClient.put<void>(this.apiSend.replace('{{id}}', id), recipientIds);
  }

  getGeoregulationById$(id: string): Observable<GeoregulationCreation> {
    return this.httpClient.get<GeoregulationCreation>(this.apiGetGeoregulationById.replace('{{id}}', id));
  }

  update$(georegulation: GeoregulationCreation, onlySummaryAndRestrictionCategories = false): Observable<void> {
    if (onlySummaryAndRestrictionCategories) {
      const parts: GeoregulationPartTypes[] = [];
      georegulation.parts.forEach(part => {
        parts.push({ types: part.types });
      });
      return this.httpClient.put<void>(this.apiUpdateSummaryAndRestrictionCategories.replace('{{id}}', georegulation.id),
        {
          summary: georegulation.summary,
          internationalSummary: georegulation.internationalSummary,
          parts
        }
      );
    }
    return this.httpClient.put<void>(this.apiCreateOrUpdate, georegulation);
  }

  getAvailableGeoregulationsToLink$(serieId: string): Observable<GeoregulationSelectOption[]> {
    const params = new HttpParams().set('serieId', serieId);
    return this.httpClient.get<GeoregulationSelectOption[]>(this.apiGetAvailableGeoregulationsToLink, { params });
  }


  delete$(id: string): Observable<void> {
    return this.httpClient.delete<void>(this.apiDelete.replace('{{id}}', id));
  }

  clone$(id: string, clonedGeoregulationNumberText: string): Observable<string> {
    return this.httpClient.post<string>(this.apiClone.replace('{{id}}', id), clonedGeoregulationNumberText);
  }

  getAvailableGeoregulationsToLinkAsWarningReference$(warningId: string): Observable<GeoregulationSelectOption[]> {
    const params = new HttpParams().set('warningId', warningId);
    return this.httpClient.get<GeoregulationSelectOption[]>(this.apiGetAvailableGeoregulationsToLinkAsWarningReference, { params });
  }
}
