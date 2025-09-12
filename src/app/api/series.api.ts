import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Serie } from '@app/models/serie.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeriesApi {
  readonly api = environment.baseApiUrl + environment.api.series;

  constructor(private readonly http: HttpClient) { }

  getSeriesByAreaId$(areaId: string): Observable<Serie[]> {
    return this.http.get<Serie[]>(this.api, { params: new HttpParams().set('areaId', areaId) });
  }
}
