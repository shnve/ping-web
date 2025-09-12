import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EpsgApi {
  readonly apiGetEpsgCodesGeometric = environment.baseApiUrl + environment.api.epsgGeometric;
  readonly apiGetEpsgCodesProjection = environment.baseApiUrl + environment.api.epsgProjection;

  constructor(private readonly http: HttpClient) { }

  getEpsgCodes$(geometric: boolean): Observable<string[]> {
    return this.http.get<string[]>(geometric ? this.apiGetEpsgCodesGeometric : this.apiGetEpsgCodesProjection);
  }
}