import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { StaticFile } from '../models/static-file.model';

@Injectable({
  providedIn: 'root'
})
export class StaticFileAdminApi {
  readonly adminApi = environment.baseAdminApiUrl + environment.adminApi.staticFile.crud;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  saveStaticFile$(staticFile: StaticFile): Observable<StaticFile> {
    if (staticFile.id) {
      return this.http.put<StaticFile>(`${this.adminApi}/${staticFile.id}`, staticFile, this.httpOptions);
    }
    return this.http.post<StaticFile>(`${this.adminApi}`, staticFile, this.httpOptions);
  }

  findOne$(id: string): Observable<StaticFile> {
    return this.http.get<StaticFile>(`${this.adminApi}/${id}`, this.httpOptions);
  }

  delete$(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${id}`);
  }
}
