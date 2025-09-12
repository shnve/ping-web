import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { MapGeoregulation } from '../models/georegulation.model';
import { GeoregulationsMapApiParams } from './georegulation.api';

@Injectable({
  providedIn: 'root'
})
export class AbstractGeoregulationApi {

  protected readonly apiGeoregulationsMap = environment.baseApiUrl + environment.api.georegulations.map;
  protected readonly apiDownloadGeometries = environment.baseApiUrl + environment.api.georegulations.downloadGeometries;

  constructor(protected readonly httpClient: HttpClient) { }

  getFilteredMapGeoregulations$(params?: GeoregulationsMapApiParams): Observable<MapGeoregulation[]> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.httpClient.get<MapGeoregulation[]>(this.apiGeoregulationsMap, { params: httpParams }).pipe(retry(1));
  }

  downloadGeometries$(georegulationId: string, format: string, lang = 'fr'): Observable<Blob> {
    return this.httpClient.get(`${this.apiDownloadGeometries.replace('{{id}}', georegulationId).replace('{{format}}', format).replace('{{lang}}', lang)}`, { responseType: 'blob' });
  }
}
