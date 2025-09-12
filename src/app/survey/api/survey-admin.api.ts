import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TableSurvey } from '../models/survey-table.model';
import { SurveyDepositEdition, SurveyDetails, SurveyTestEdition } from '../models/survey.model';
import { AbstractSurveyApi, SurveysTableApiParams } from './survey.api';

@Injectable({
  providedIn: 'root'
})
export class SurveyAdminApi extends AbstractSurveyApi {

  readonly apiTableUrl = environment.baseAdminApiUrl + environment.adminApi.surveys.tableView;
  readonly apiCreateOrUpdateDeposit = environment.baseAdminApiUrl + environment.adminApi.surveys.createOrUpdateDeposit;
  readonly apiCreateOrUpdateTest = environment.baseAdminApiUrl + environment.adminApi.surveys.createOrUpdateTest;
  readonly apiGetSurveyModalById = environment.baseAdminApiUrl + environment.adminApi.surveys.getSurveyModalById;
  readonly apiClone = environment.baseAdminApiUrl + environment.adminApi.surveys.clone;
  readonly apiAdminDeleteDeposit = environment.baseAdminApiUrl + environment.adminApi.surveys.deleteDeposit;
  readonly apiReport = environment.baseAdminApiUrl + environment.adminApi.surveys.report;
  readonly apiAdminTransmitDeposit = environment.baseAdminApiUrl + environment.adminApi.surveys.transmitDeposit;
  readonly apiDownload = environment.baseAdminApiUrl + environment.adminApi.surveys.download;
  readonly apiUpdateBriInternalComment = environment.baseAdminApiUrl + environment.adminApi.surveys.updateBriInternalComment;

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  public getTableView$(params: SurveysTableApiParams, isBri = false): Observable<PaginatedModelItemTableViewDtos<TableSurvey>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.httpClient.get<PaginatedModelItemTableViewDtos<TableSurvey>>(this.apiTableUrl + (isBri ? '/bri' : ''),
      { params: httpParams, headers: this.httpOptions.headers });
  }

  public createDeposit$(survey: SurveyDepositEdition): Observable<string> {
    return this.httpClient.post<string>(this.apiCreateOrUpdateDeposit, survey, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public updateDeposit$(survey: SurveyDepositEdition): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreateOrUpdateDeposit}/${survey.id}`, survey, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public getDepositById$(id: string): Observable<SurveyDepositEdition> {
    return this.httpClient.get<SurveyDepositEdition>(`${this.apiCreateOrUpdateDeposit}/${id}`);
  }

  public createTest$(survey: SurveyTestEdition): Observable<string> {
    return this.httpClient.post<string>(this.apiCreateOrUpdateTest, survey, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public updateTest$(survey: SurveyTestEdition): Observable<string> {
    return this.httpClient.put<string>(`${this.apiCreateOrUpdateTest}/${survey.id}`, survey, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public getTestById$(id: string): Observable<SurveyTestEdition> {
    return this.httpClient.get<SurveyTestEdition>(`${this.apiCreateOrUpdateTest}/${id}`);
  }

  public getSurveyModalById$(id: string): Observable<SurveyDetails> {
    return this.httpClient.get<SurveyDetails>(this.apiGetSurveyModalById.replace('{{id}}', id));
  }

  public clone$(id: string, nameAndLocation: string, areaId: string): Observable<string> {
    return this.httpClient.put<string>(this.apiClone.replace('{{id}}', id), { nameAndLocation, areaId }, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public deleteDeposit$(id: string): Observable<void> {
    return this.httpClient.delete<void>(this.apiAdminDeleteDeposit.replace('{{id}}', id));
  }

  public report$(id: string): Observable<string> {
    return this.httpClient.put<string>(this.apiReport.replace('{{id}}', id), {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public transmitDeposit$(survey: SurveyDepositEdition): Observable<void> {
    return this.httpClient.put<void>(this.apiAdminTransmitDeposit.replace('{{id}}', survey.id), survey, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public downloadSurveyAsZipArchive$(id: string): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(`${this.apiDownload.replace('{{id}}', id)}`, { responseType: 'blob', observe: 'response' });
  }

  public updateBriInternalComment$(id: string, briInternalComment: string): Observable<string> {
    return this.httpClient.put<string>(this.apiUpdateBriInternalComment.replace('{{id}}', id), { briInternalComment });
  }
}
