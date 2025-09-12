import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { StaticLogo, StaticLogoBase } from '../models/static-logo.model';

@Injectable({
  providedIn: 'root'
})
export class StaticLogoAdminApi {

  readonly adminApi = environment.baseApiUrl + environment.adminApi.staticLogo.crud;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {}

  saveStaticLogo(id: string, staticLogo: StaticLogoBase): Observable<StaticLogo> {
    if (id) {
      return this.http.put<StaticLogo>(`${this.adminApi}/${id}`, staticLogo, this.httpOptions);
    }
    return this.http.post<StaticLogo>(this.adminApi, staticLogo, this.httpOptions);
  }

  findOne(id: string): Observable<StaticLogo> {
    return this.http.get<StaticLogo>(`${this.adminApi}/${id}`, this.httpOptions);
  }

  delete$(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${id}`);
  }
}
