import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import Area from '../models/area.model';

@Injectable({
  providedIn: 'root'
})
export class AreasApi {
  readonly api = environment.baseApiUrl + environment.api.areas;
  readonly adminApi = environment.baseApiUrl + environment.adminApi.areas;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {
  }

  getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.api)
      .pipe(retry(1));
  }

  getAreasByServices(serviceIds: string[]): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.api}/services`, { params: new HttpParams().set('serviceIds', serviceIds.join(',')) });
  }

  saveArea(area: Area): Observable<Area> {
    if (area.id) {
      return this.http.put<Area>(`${this.adminApi}/${area.id}`, area, this.httpOptions);
    }
    return this.http.post<Area>(`${this.adminApi}`, area, this.httpOptions);
  }

  findOne(id: string): Observable<Area> {
    return this.http.get<Area>(`${this.api}/${id}`);
  }
}
