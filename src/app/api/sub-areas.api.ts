import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SubArea } from '@app/models/sub-area.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SubAreasApi {
  readonly api = environment.baseApiUrl + environment.api.subAreas;
  readonly adminApi = environment.baseApiUrl + environment.adminApi.subAreas;
  readonly saveLocalityApi = environment.baseApiUrl + environment.adminApi.addLocality;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {
  }

  getSubAreas(): Observable<SubArea[]> {
    return this.http.get<SubArea[]>(this.api)
      .pipe(retry(1));
  }

  getSubAreasByAreaId$(areaId: string): Observable<SubArea[]> {
    return this.http.get<SubArea[]>(this.adminApi, { params: new HttpParams().set('areaId', areaId) });
  }

  saveSubArea(subArea: SubArea): Observable<SubArea> {
    if (subArea.id) {
      return this.http.put<SubArea>(`${this.adminApi}/${subArea.id}`, subArea, this.httpOptions);
    }
    return this.http.post<SubArea>(`${this.adminApi}`, subArea, this.httpOptions);
  }

  saveLocality(subAreaParentId: string, localityName: string, localityInternationalName: string): Observable<SubArea> {
    return this.http.post<SubArea>(`${this.saveLocalityApi.replace('{{parentSubAreaId}}', subAreaParentId)}`,
      { parentSubAreaId: subAreaParentId, name: localityName, internationalName: localityInternationalName }, this.httpOptions);
  }

  findOne(id: string): Observable<SubArea> {
    return this.http.get<SubArea>(`${this.adminApi}/${id}`, this.httpOptions);
  }

  delete$(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${id}`);
  }
}
