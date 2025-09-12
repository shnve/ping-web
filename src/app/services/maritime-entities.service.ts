import { Injectable } from '@angular/core';
import { MaritimeEntitiesApi } from '@app/api/maritime-entities.api';
import { MapMaritimeEntity, MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaritimeEntitiesService {
  constructor(private readonly maritimeEntitiesApi: MaritimeEntitiesApi) { }

  getAvailableWarningEntities$(): Observable<MaritimeEntityBase[]> {
    return this.maritimeEntitiesApi.getAvailableWarningEntities$();
  }

  getEntitiesManagedOrObservedByService$(): Observable<MaritimeEntityBase[]> {
    return this.maritimeEntitiesApi.getEntitiesManagedOrObservedByService$();
  }

  getLinkedEntitiesForCoverFiltering$(serieId: string, isFromAvurnavNoticeTable: boolean): Observable<MaritimeEntityBase[]> {
    if (isFromAvurnavNoticeTable) {
      return this.getEntitiesManagedOrObservedByService$();
    }
    return this.maritimeEntitiesApi.getLinkedEntitiesForCoverFiltering$(serieId, isFromAvurnavNoticeTable);
  }

  getEntitiesManagedOrObservedByServiceToDisplayOnMap$(): Observable<MapMaritimeEntity[]> {
    return this.maritimeEntitiesApi.getEntitiesManagedOrObservedByServiceToDisplayOnMap$();
  }
}
