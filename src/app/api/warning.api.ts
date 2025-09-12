import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { JsonMapWarning, JsonWarning, TableWarning } from '../models/warning.model';

export type WarningsMapApiParams = {
  dateEnd?: string;
  dateStart?: string;
  publishedFromIncludingDate?: string;
  globalWarningType?: string;
  serieType?: string;
};

export type WarningsTableApiParams = {
  serieId?: string;
  subAreaIds?: string;
  warningHazardTypeGenerals?: string;
  dateEnd?: string;
  dateStart?: string;
  publishedFromIncludingDate?: string;
  concernedMaritimeEntityIds?: string;
  entityCoverIds?: string;
  reservationNumberAndYear?: string;
  page?: string;
  size?: string;
};

export type WarningsDownloadS124ApiParams = {
  nameOfSeries: string;
  warningNumber: number;
  year: number;
  lang?: string;
};

export type WarningsDownloadS124MessagesApiParams = {
  nameOfSeries: string;
  warningNumbers?: string;
  lang?: string;
};

export type WarningsDownloadGpxApiParams = {
  warningIds: string;
  lang?: string;
};

@Injectable({
  providedIn: 'root'
})
export class WarningApi {
  readonly apiWarningsMap = environment.baseApiUrl + environment.api.warnings.map;
  private readonly apiTableView = environment.baseApiUrl + environment.api.warnings.tableView;
  private readonly apiDetailedTableView = environment.baseApiUrl + environment.api.warnings.detailedTableView;
  readonly apiWarningById = environment.baseApiUrl + environment.api.warnings.list;
  private readonly apiDownloadGeometries = environment.baseApiUrl + environment.api.warnings.downloadGeometries;
  private readonly apiDownloadS124 = environment.baseApiUrl + environment.api.warnings.downloadS124;
  private readonly apiDownloadS124Messages = environment.baseApiUrl + environment.api.warnings.downloadS124Messages;
  private readonly apiDownloadGpxZip = environment.baseApiUrl + environment.api.warnings.downloadGpxZip;

  constructor(private readonly http: HttpClient) { }

  getMapWarnings$(params?: WarningsMapApiParams): Observable<JsonMapWarning[]> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<JsonMapWarning[]>(this.apiWarningsMap, { params: httpParams })
      .pipe(retry(1));
  }

  getMapWarningsBySerie$(serieId: string): Observable<JsonMapWarning[]> {
    return this.http.get<JsonMapWarning[]>(
      `${this.apiWarningsMap}?globalWarningType=NOTICE&serieType=NAVAREA_NAVIGATIONAL_WARNING,COASTAL_NAVIGATIONAL_WARNING,LOCAL_NAVIGATIONAL_WARNING`,
      { params: new HttpParams().set('serieId', serieId) }
    )
      .pipe(retry(1));
  }

  getTableView$(params: WarningsTableApiParams, isDetailedTable: boolean): Observable<PaginatedModelItemTableViewDtos<TableWarning>> {
    const httpParams = new HttpParams({ fromObject: params });
    const apiUrl = isDetailedTable ? this.apiDetailedTableView : this.apiTableView;
    return this.http.get<PaginatedModelItemTableViewDtos<TableWarning>>(apiUrl, { params: httpParams });
  }

  getWarningById$(warningId: string): Observable<JsonWarning> {
    return this.http.get<JsonWarning>(this.apiWarningById + '/' + warningId);
  }

  downloadGeometries$(warningId: string, format: string, lang = 'fr'): Observable<Blob> {
    return this.http.get(this.apiDownloadGeometries.replace('{{id}}', warningId).replace('{{format}}', format).replace('{{lang}}', lang), { responseType: 'blob' });
  }

  downloadS124$(params: WarningsDownloadS124ApiParams): Observable<Blob> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get(this.apiDownloadS124, { params: httpParams, responseType: 'blob' });
  }

  downloadS124Messages$(params: WarningsDownloadS124MessagesApiParams): Observable<Blob> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get(this.apiDownloadS124Messages, { params: httpParams, responseType: 'blob' });
  }

  downloadGpxAsZip$(params: WarningsDownloadGpxApiParams): Observable<Blob> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get(this.apiDownloadGpxZip, { params: httpParams, responseType: 'blob' });
  }
}
