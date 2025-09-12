import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WarningLinkPublicReference } from '@app/models/warning.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarningLinkApi {
  private readonly adminApi = environment.baseAdminApiUrl + environment.adminApi.warningLinks;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  saveWarningLink(warningLink: WarningLinkPublicReference): Observable<WarningLinkPublicReference> {
    if (warningLink.id) {
      return this.http.put<WarningLinkPublicReference>(`${this.adminApi}/${warningLink.id}`, warningLink, this.httpOptions);
    }
    return this.http.post<WarningLinkPublicReference>(this.adminApi, warningLink, this.httpOptions);
  }

  delete(warningLinkId: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApi}/${warningLinkId}`);
  }
}
