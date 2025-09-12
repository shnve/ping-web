import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';
import { StaticPage } from '@app/models/static-page.model';

@Injectable({
  providedIn: 'root'
})
export class StaticPageApi {
  readonly api = environment.baseApiUrl + environment.api.staticPage;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {}

  findOneByPath(path: string): Observable<StaticPage> {
    return this.http.get<StaticPage>(`${this.api}/${path}`, this.httpOptions);
  }
}
