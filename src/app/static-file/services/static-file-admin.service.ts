import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StaticFileAdminApi } from '../api/static-file-admin.api';
import { StaticFile } from '../models/static-file.model';

@Injectable({
  providedIn: 'root'
})
export class StaticFileAdminService {

  constructor(private readonly staticFileAdminApi: StaticFileAdminApi) { }

  saveStaticFile$(staticFile: StaticFile): Observable<StaticFile> {
    return this.staticFileAdminApi.saveStaticFile$(staticFile);
  }

  findOne$(id: string): Observable<StaticFile> {
    return this.staticFileAdminApi.findOne$(id);
  }

  delete$(id: string): Observable<void> {
    return this.staticFileAdminApi.delete$(id);
  }
}
