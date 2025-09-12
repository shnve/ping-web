import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Serie } from '@app/models/serie.model';
import { environment } from '@env/environment';
import { Observable, of } from 'rxjs';

export type SeriesAdminApiParams = {
  serviceId: string;
};

@Injectable({
  providedIn: 'root'
})
export class SeriesAdminApi {
  readonly seriesAdminUrl = environment.baseAdminApiUrl + environment.adminApi.series;
  readonly seriesByUserUrl = environment.baseApiUrl +  environment.adminApi.seriesByUser;
  readonly isWarningNumberAvailableApi = environment.baseApiUrl + environment.adminApi.isWarningNumberAvailable;
  readonly nextAvailableNumberApi = environment.baseApiUrl + environment.adminApi.nextAvailableNumber;

  constructor(private readonly http: HttpClient) { }

  getSeriesByServiceIds$(serviceIds: string[]): Observable<Serie[]> {
    if (!serviceIds) { return of([]); }
    const httpParams = new HttpParams().append('serviceIds', serviceIds.join(','));
    return this.http.get<Serie[]>(this.seriesAdminUrl, { params: httpParams });
  }

  saveSerie(serie: Serie): Observable<Serie> {
    if (serie.id) {
      return this.http.put<Serie>(`${this.seriesAdminUrl}/${serie.id}`, serie);
    }
    return this.http.post<Serie>(`${this.seriesAdminUrl}`, serie);
  }

  findOne(id: string): Observable<Serie> {
    return this.http.get<Serie>(`${this.seriesAdminUrl}/${id}`);
  }

  isWarningNumberAvailable$(serieId: string, warningNumber: number, year: number): Observable<boolean> {
    return this.http.get<boolean>(this.isWarningNumberAvailableApi.replace('{{serieId}}', serieId),
      { params: new HttpParams().set('warningNumber', warningNumber.toString()).set('year', year.toString()) });
  }

  nextAvailableNumber$(serieId: string, year: number): Observable<number> {
    return this.http.get<number>(this.nextAvailableNumberApi.replace('{{serieId}}', serieId),
      { params: new HttpParams().set('year', year.toString()) });
  }

  getSeriesByUser$(): Observable<Serie[]> {
    return this.http.get<Serie[]>(this.seriesByUserUrl);
  }
}
