import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StaticSection } from '@app/static-section/models/static-section.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaticSectionApi {
  readonly api = environment.baseApiUrl + environment.api.staticSection.findByKey;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {}

  findOneByKey$(key: string): Observable<StaticSection> {
    return this.http.get<StaticSection>(`${this.api}/${key}`, this.httpOptions);
  }
}