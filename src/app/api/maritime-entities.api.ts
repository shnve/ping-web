import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import MaritimeEntity, { MapMaritimeEntity, MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaritimeEntitiesApi {
  readonly adminApi = environment.baseApiUrl + environment.adminApi.maritimeEntities;
  readonly api = environment.baseApiUrl + environment.api.maritimeEntities;
  readonly apiGetAvailableEntitiesToLink = environment.baseApiUrl + environment.adminApi.getAvailableEntitiesToLink;
  private readonly apiGetEntitiesToFilter = environment.baseAdminApiUrl + environment.adminApi.warnings.entitiesToFilter;
  private readonly apiGetLinkedEntitiesForCoverFiltering = environment.baseAdminApiUrl + environment.adminApi.warnings.linkedEntitiesForCoverFiltering;
  private readonly apiGetEntitiesManagedOrObservedToFilter = environment.baseAdminApiUrl + environment.adminApi.warnings.entitiesManagedOrObservedToFilter;
  private readonly apiGetEntitiesManagedOrObservedToDisplayOnMap = environment.baseAdminApiUrl + environment.adminApi.entitiesManagedOrObservedToDisplayOnMap;

  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {
  }

  saveMaritimeEntity(entity: MaritimeEntity): Observable<MaritimeEntity> {
    if (entity.id) {
      return this.http.put<MaritimeEntity>(`${this.adminApi}/${entity.id}`, entity, this.httpOptions);
    }
    return this.http.post<MaritimeEntity>(this.adminApi, entity, this.httpOptions);
  }

  findAll(): Observable<MaritimeEntity[]> {
    return this.http.get<MaritimeEntity[]>(this.api);
  }

  findOne(id: string): Observable<MaritimeEntity> {
    return this.http.get<MaritimeEntity>(`${this.api}/${id}`);
  }

  findByEntityIds$(ids: string[]): Observable<MaritimeEntity[]> {
    return this.http.get<MaritimeEntity[]>(this.adminApi, { params: new HttpParams().set('serviceIds', ids.join(',')) });
  }

  public getAvailableEntitiesToLink$(serieId: string): Observable<MaritimeEntity[]> {
    return this.http.get<MaritimeEntity[]>(`${this.apiGetAvailableEntitiesToLink.replace('{{serieId}}', serieId)}`);
  }

  getAvailableWarningEntities$(): Observable<MaritimeEntityBase[]> {
    return this.http.get<MaritimeEntityBase[]>(this.apiGetEntitiesToFilter);
  }

  getEntitiesManagedOrObservedByService$(): Observable<MaritimeEntityBase[]> {
    return this.http.get<MaritimeEntityBase[]>(this.apiGetEntitiesManagedOrObservedToFilter);
  }

  getLinkedEntitiesForCoverFiltering$(serieId: string, isFromAvurnavNoticeTable: boolean): Observable<MaritimeEntityBase[]> {
    return this.http.get<MaritimeEntityBase[]>(this.apiGetLinkedEntitiesForCoverFiltering,
      { params: new HttpParams().set('serieId', serieId).set('isFromAvurnavNoticeTable', isFromAvurnavNoticeTable) });
  }

  getEntitiesManagedOrObservedByServiceToDisplayOnMap$(): Observable<MapMaritimeEntity[]> {
    return this.http.get<MapMaritimeEntity[]>(this.apiGetEntitiesManagedOrObservedToDisplayOnMap);
  }
}
