import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { StaticLogo } from '../models/static-logo.model';

@Injectable({
  providedIn: 'root'
})
export class StaticLogoApi {

  readonly api = environment.baseApiUrl + environment.api.staticLogo.findByKey;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {}

  findOneByKey$(key: string): Observable<StaticLogo> {
    return this.http.get<StaticLogo>(`${this.api}/${key}`, this.httpOptions);
  }

}
