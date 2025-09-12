import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StaticFileApi } from '../api/static-file.api';

@Injectable({
  providedIn: 'root'
})
export class StaticFileService {

  constructor(private readonly staticFileApi: StaticFileApi) { }

  download$(staticFilePath: string): Observable<HttpResponse<Blob>> {
    return this.staticFileApi.download$(staticFilePath);
  }
}
