import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';
import { StaticPage } from '@app/models/static-page.model';

@Injectable({
  providedIn: 'root'
})
export class StaticPageAdminApi {
  readonly adminApi = environment.baseApiUrl + environment.adminApi.staticPage.crud;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {}

  saveStaticPage(staticPage: StaticPage): Observable<StaticPage> {
    if (staticPage.id) {
      return this.http.put<StaticPage>(`${this.adminApi}/${staticPage.id}`, staticPage, this.httpOptions);
    }
    return this.http.post<StaticPage>(`${this.adminApi}`, staticPage, this.httpOptions);
  }

  findOne(id: string): Observable<StaticPage> {
    return this.http.get<StaticPage>(`${this.adminApi}/${id}`, this.httpOptions);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${id}`);
  }
}
