import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TableSurvey } from '../models/survey-table.model';
import { SurveyDepositEdition, SurveyDetails, SurveyTestEdition } from '../models/survey.model';

export type SurveysTableApiParams = {
  state: string;
  issuingServiceId?: string;
  identifier?: string;
  nameAndLocation?: string;
  startDate?: string;
  endDate?: string;
  transmissionStartDate?: string;
  transmissionEndDate?: string;
  shomId? :string;
  producerOrganization?: string;
  ownerOrganization?: string;
  notCompliant?: string;
  transmissionStatus?: string;
  expectedDeletionDate?: string;
  briInternalComment?: string;
  page?: string;
  size?: string;
  sort?: string;
};

export abstract class AbstractSurveyApi {

  protected readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(protected readonly httpClient: HttpClient) { }

  public abstract getTableView$(params: SurveysTableApiParams, isBri: boolean): Observable<PaginatedModelItemTableViewDtos<TableSurvey>>;

  public abstract createDeposit$(survey: SurveyDepositEdition): Observable<string>;

  public abstract updateDeposit$(survey: SurveyDepositEdition): Observable<string>;

  public abstract getDepositById$(id: string): Observable<SurveyDepositEdition>;

  public abstract clone$(id: string, nameAndLocation: string, areaId: string): Observable<string>;

  public abstract report$(id: string): Observable<string>;

  public abstract deleteDeposit$(id: string): Observable<void>;

  public abstract transmitDeposit$(survey: SurveyDepositEdition): Observable<void>;

  /**
   * Handler return ErrorObservable with user-friendly error message
   * @param error server or client side errors captured by HttpClient in HttpErrorResponse
   * @private
   */
  public handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      // A client-side or network error occurred
      return throwError({ unknown: 'message.network-error' });
    }

    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong.
    if (error.status === 500) {
      const message = error.error.message;
      if (message === 'check.survey.name-and-location.already-used') {
        return throwError({ nameAndLocation: 'name-and-location.already-used' });
      }

      // return error related to infosource routing
      if (message === 'infosource-routing.rejected') {
        return throwError({ routing: 'detail.infosource-rejected' });
      }
    }

    // return unhandled error
    return throwError({ unhandled: 'message.unhandled-error' });
  }
}

@Injectable({
  providedIn: 'root'
})
export class SurveyApi extends AbstractSurveyApi {
  readonly apiTableUrl = environment.baseSecuredApiUrl + environment.securedApi.surveys.tableView;
  readonly apiCreateOrUpdateDeposit = environment.baseSecuredApiUrl + environment.securedApi.surveys.createOrUpdateDeposit;
  readonly apiCreateOrUpdateTest = environment.baseSecuredApiUrl + environment.securedApi.surveys.createOrUpdateTest;
  readonly apiGetSurveyModalById = environment.baseSecuredApiUrl + environment.securedApi.surveys.getSurveyModalById;
  readonly apiClone = environment.baseSecuredApiUrl + environment.securedApi.surveys.clone;
  readonly apiDeleteDeposit = environment.baseSecuredApiUrl + environment.securedApi.surveys.deleteDeposit;
  readonly apiReport = environment.baseSecuredApiUrl + environment.securedApi.surveys.report;
  readonly apiTransmitDeposit = environment.baseSecuredApiUrl + environment.adminApi.surveys.transmitDeposit;

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  public getTableView$(params: SurveysTableApiParams, isBri = false): Observable<PaginatedModelItemTableViewDtos<TableSurvey>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.httpClient.get<PaginatedModelItemTableViewDtos<TableSurvey>>(this.apiTableUrl,
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

  public getSurveyModalById$(id: string): Observable<SurveyDetails> {
    return this.httpClient.get<SurveyDetails>(this.apiGetSurveyModalById.replace('{{id}}', id));
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

  public clone$(id: string, nameAndLocation: string, areaId: string): Observable<string> {
    return this.httpClient.put<string>(this.apiClone.replace('{{id}}', id), { nameAndLocation, areaId }, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public deleteDeposit$(id: string): Observable<void> {
    return this.httpClient.delete<void>(this.apiDeleteDeposit.replace('{{id}}', id));
  }

  public report$(id: string): Observable<string> {
    return this.httpClient.put<string>(this.apiReport.replace('{{id}}', id), {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public transmitDeposit$(survey: SurveyDepositEdition): Observable<void> {
    return this.httpClient.put<void>(this.apiTransmitDeposit.replace('{{id}}', survey.id), survey, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
}
