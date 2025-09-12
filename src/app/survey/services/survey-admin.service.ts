import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { TableStateValue } from '@app/states/table.state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SurveyAdminApi } from '../api/survey-admin.api';
import { SurveyTableFilterValues } from '../models/survey-filters.model';
import { TableSurvey } from '../models/survey-table.model';
import { SurveyDepositEdition, SurveyDetails, SurveyTestEdition } from '../models/survey.model';
import { AbstractSurveyService } from './survey.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyAdminService extends AbstractSurveyService {

  constructor(private readonly surveyAdminApi: SurveyAdminApi) {
    super();
  }

  public loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, state: string, isBri: boolean, filterValues: SurveyTableFilterValues): Observable<ModelItemTablePage<TableSurvey>> {
    return this.surveyAdminApi.getTableView$(
      {
        page: '' + pageInfo.page,
        size: '' + pageInfo.rows,
        ...SurveyAdminService.convertFilterToRequestParams(state, filterValues),
        ...(sortInfo && sortInfo.field && { sort: SurveyAdminService.convertSortInfoToString(sortInfo) })
      },
      isBri
    ).pipe(
      map<PaginatedModelItemTableViewDtos<TableSurvey>, ModelItemTablePage<TableSurvey>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  public createDeposit$(survey: SurveyDepositEdition): Observable<string> {
    return this.surveyAdminApi.createDeposit$(survey);
  }

  public updateDeposit$(survey: SurveyDepositEdition): Observable<string> {
    return this.surveyAdminApi.updateDeposit$(survey);
  }

  public getDepositById$(id: string): Observable<SurveyDepositEdition> {
    return this.surveyAdminApi.getDepositById$(id);
  }

  public createTest$(survey: SurveyTestEdition): Observable<string> {
    return this.surveyAdminApi.createTest$(survey);
  }

  public updateTest$(survey: SurveyTestEdition): Observable<string> {
    return this.surveyAdminApi.updateTest$(survey);
  }

  public getTestById$(id: string): Observable<SurveyTestEdition> {
    return this.surveyAdminApi.getTestById$(id);
  }

  public getSurveyModalById$(id: string): Observable<SurveyDetails> {
    return this.surveyAdminApi.getSurveyModalById$(id);
  }

  public clone$(id: string, nameAndLocation: string, areaId: string): Observable<string> {
    return this.surveyAdminApi.clone$(id, nameAndLocation, areaId);
  }

  public deleteDeposit$(id: string): Observable<void> {
    return this.surveyAdminApi.deleteDeposit$(id);
  }

  public report$(id: string): Observable<string> {
    return this.surveyAdminApi.report$(id);
  }

  public transmitDeposit$(survey: SurveyDepositEdition): Observable<void> {
    return this.surveyAdminApi.transmitDeposit$(survey);
  }

  public downloadSurveyAsZipArchive$(id: string): Observable<HttpResponse<Blob>> {
    return this.surveyAdminApi.downloadSurveyAsZipArchive$(id);
  }

  public updateBriInternalComment$(id: string, comment: string): Observable<string> {
    return this.surveyAdminApi.updateBriInternalComment$(id, comment);
  }
}
