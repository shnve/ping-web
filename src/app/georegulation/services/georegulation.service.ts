import { Injectable } from '@angular/core';
import { MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { Observable } from 'rxjs';
import { GeoregulationApi } from '../api/georegulation.api';
import { GeoregulationType, JsonGeoregulationModalDetails, MapGeoregulation } from '../models/georegulation.model';
import { AbstractGeoregulationService } from './abstract-georegulation.service';


@Injectable({
  providedIn: 'root'
})
export class GeoregulationService extends AbstractGeoregulationService {

  constructor(protected readonly georegulationApi: GeoregulationApi) {
    super(georegulationApi);
  }

  private static readonly implementationError = new Error('Should not be called by public user');

  getModalDetails$(id: string): Observable<JsonGeoregulationModalDetails> {
    return this.georegulationApi.getModalDetails$(id);
  }

  getMapGeoregulations$(georegulationType: GeoregulationType): Observable<MapGeoregulation[]> {
    throw GeoregulationService.implementationError;
  }

  publish$(id: string): Observable<void> {
    throw GeoregulationService.implementationError;
  }

  repeal$(id: string): Observable<void> {
    throw GeoregulationService.implementationError;
  }

  getRecipients$(id: string): Observable<MaritimeServiceInfosourceRecipient[]> {
    throw GeoregulationService.implementationError;
  }

  send$(id: string, recipientIds: string[]): Observable<void> {
    throw GeoregulationService.implementationError;
  }

  delete$(id: string): Observable<void> {
    throw GeoregulationService.implementationError;
  }

  clone$(id: string, clonedGeoregulationNumberText: string): Observable<string> {
    throw GeoregulationService.implementationError;
  }
}
