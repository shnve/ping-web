import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StaticSection, StaticSectionBase } from '@app/static-section/models/static-section.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaticSectionAdminApi {
  readonly adminApi = environment.baseApiUrl + environment.adminApi.staticSection.crud;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {}

  saveStaticSection(id: string, staticSection: StaticSectionBase): Observable<StaticSection> {
    return this.http.put<StaticSection>(`${this.adminApi}/${id}`, staticSection, this.httpOptions);
  }

  findOne(id: string): Observable<StaticSection> {
    return this.http.get<StaticSection>(`${this.adminApi}/${id}`, this.httpOptions);
  }
}
