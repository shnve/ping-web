import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import MaritimeServiceUserRole from '@app/models/maritime-service-user-role';
import MaritimeService, { MaritimeServiceBase } from '@app/models/maritime-service.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MaritimeServicesApi {
  readonly api = environment.baseApiUrl + environment.api.maritimeServices;
  readonly adminApi = environment.baseApiUrl + environment.adminApi.maritimeServices;
  private readonly apiGetAvailableAuthorities = environment.baseApiUrl + environment.adminApi.getAvailableAuthorities;

  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {
  }

  getMaritimeServices(): Observable<MaritimeService[]> {
    return this.http.get<MaritimeService[]>(this.api)
      .pipe(retry(1));
  }

  saveMaritimeService(service: MaritimeService): Observable<MaritimeService> {
    if (service.id) {
      return this.http.put<MaritimeService>(`${this.adminApi}/${service.id}`, service, this.httpOptions);
    }
    return this.http.post<MaritimeService>(`${this.adminApi}`, service, this.httpOptions);
  }

  findOne(id: string): Observable<MaritimeService> {
    return this.http.get<MaritimeService>(`${this.adminApi}/${id}`, this.httpOptions);
  }

  findUsers(id: string): Observable<MaritimeServiceUserRole[]> {
    return this.http.get<MaritimeServiceUserRole[]>(`${this.adminApi}/${id}/users`, this.httpOptions);
  }

  findByServiceIds(ids: string[]): Observable<MaritimeService[]> {
    return this.http.get<MaritimeService[]>(this.adminApi, { params: new HttpParams().set('serviceIds', ids.join(',')) });
  }

  addRole(serviceId: string, userId: string, role: string): Observable<void> {
    return this.http.post<void>(`${this.adminApi}/${serviceId}/users/${userId}/${role}`, this.httpOptions);
  }

  deleteRole(serviceId: string, userId: string, role: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${serviceId}/users/${userId}/${role}`, this.httpOptions);
  }

  getAvailableAuthorities$(serviceId: string): Observable<MaritimeServiceBase[]> {
    return this.http.get<MaritimeServiceBase[]>(this.apiGetAvailableAuthorities.replace('{{serviceId}}', serviceId));
  }
}
