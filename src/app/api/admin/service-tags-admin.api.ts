import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tag } from '@app/models/maritime-service.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceTagsApi {
  readonly adminApi = environment.baseAdminApiUrl + environment.adminApi.maritimeServiceTags;
  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  saveTag(tag: Tag): Observable<Tag> {
    if (tag.id) {
      return this.http.put<Tag>(`${this.adminApi}/${tag.id}`, tag, this.httpOptions);
    }
    return this.http.post<Tag>(`${this.adminApi}`, tag, this.httpOptions);
  }

  delete(tagId: string, maritimeServiceId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${tagId}`, { params: new HttpParams().set('maritimeServiceId', maritimeServiceId) });
  }
}
