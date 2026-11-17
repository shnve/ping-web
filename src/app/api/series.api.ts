import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Serie } from '@app/models/serie.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

/** PISAC: serie distribuida en S-124 (GET api/series/s124), para la página «Servicios de datos». */
export interface DataServiceSerie {
  name: string;
  internationalName: string;
  s124Identifier: string;
  /** Idiomas obligatorios de la serie, con «es» primero */
  languages: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SeriesApi {
  readonly api = environment.baseApiUrl + environment.api.series;

  constructor(private readonly http: HttpClient) { }

  getSeriesByAreaId$(areaId: string): Observable<Serie[]> {
    return this.http.get<Serie[]>(this.api, { params: new HttpParams().set('areaId', areaId) });
  }

  getS124Series$(): Observable<DataServiceSerie[]> {
    return this.http.get<DataServiceSerie[]>(`${this.api}/s124`);
  }

  /** PISAC: todas las series (sin filtro de área), para traducir sus nombres al inglés */
  getAllSeries$(): Observable<Serie[]> {
    return this.http.get<Serie[]>(this.api);
  }
}
