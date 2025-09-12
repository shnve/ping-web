import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { JsonGeoregulationModalDetails } from '../models/georegulation.model';
import { AbstractGeoregulationApi } from './abstract-georegulation.api';

export type GeoregulationsMapApiParams = {
  permanent?: boolean;
  temporary?: boolean;
  allTerritorialSea?: boolean;
  notAllTerritorialSea?: boolean;
  seasonalPeriod?: boolean;
  notSeasonalPeriod?: boolean;
  concernedActivities?: string;
  dateStart?: string;
  dateEnd?: string;
  publishedFromIncludingDate?: string;
};

@Injectable({
  providedIn: 'root'
})
export class GeoregulationApi extends AbstractGeoregulationApi {

  private readonly apiGetModalDetails = environment.baseApiUrl + environment.api.georegulations.modalDetails;

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  getModalDetails$(id: string): Observable<JsonGeoregulationModalDetails> {
    return this.httpClient.get<JsonGeoregulationModalDetails>(this.apiGetModalDetails.replace('{{id}}', id));
  }
}
