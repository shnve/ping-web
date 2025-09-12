import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaticFileApi {
  readonly apiDownloadUrl = environment.baseApiUrl + environment.api.staticFile.download;

  constructor(private readonly http: HttpClient) { }

  download$(staticFilePath: string): Observable<HttpResponse<Blob>> {
    return this.http.get(this.apiDownloadUrl.replace('{{path}}', staticFilePath), { responseType: 'blob', observe: 'response' });
  }
}
