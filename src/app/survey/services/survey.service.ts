import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { TableStateValue } from '@app/states/table.state';
import { default as formatDate } from 'date-fns/format';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SurveyApi, SurveysTableApiParams } from '../api/survey.api';
import { SurveyTableFilterValues } from '../models/survey-filters.model';
import { TableSurvey } from '../models/survey-table.model';
import { SurveyDepositEdition, SurveyDetails, SurveyTestEdition } from '../models/survey.model';

const DATE_FORMAT = 'yyyy-MM-dd';

@Injectable({
  providedIn: 'root'
})
export abstract class AbstractSurveyService {
  constructor() { }

  public abstract loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, state: string, isBri: boolean, filterValues: SurveyTableFilterValues): Observable<ModelItemTablePage<TableSurvey>>;

  public abstract createDeposit$(survey: SurveyDepositEdition): Observable<string>;

  public abstract updateDeposit$(survey: SurveyDepositEdition): Observable<string>;

  public abstract getDepositById$(id: string): Observable<SurveyDepositEdition>;

  public abstract createTest$(survey: SurveyTestEdition): Observable<string>;

  public abstract updateTest$(survey: SurveyTestEdition): Observable<string>;

  public abstract getTestById$(id: string): Observable<SurveyTestEdition>;

  public abstract getSurveyModalById$(id: string): Observable<SurveyDetails>;

  public abstract clone$(id: string, nameAndLocation: string, areaId: string): Observable<string>;

  public abstract deleteDeposit$(id: string): Observable<void>;

  public abstract report$(id: string): Observable<string>;

  public abstract transmitDeposit$(survey: SurveyDepositEdition): Observable<void>;

  public abstract downloadSurveyAsZipArchive$(id: string): Observable<HttpResponse<Blob>>;

  public abstract updateBriInternalComment$(id: string, comment: string): Observable<string>;

  static convertSortInfoToString(sortInfo: SortInfo): string {
    if (!sortInfo) {
      return '';
    }
    const order = sortInfo.order === 1 ? 'asc' : 'desc';
    return `${sortInfo.field},${order}`;
  }

  static convertFilterToRequestParams(state: string, filter: SurveyTableFilterValues): SurveysTableApiParams {
    const params: SurveysTableApiParams = {
      state
    };

    if (filter.service?.id) {
      params.issuingServiceId = filter.service.id;
    }

    if (filter.identifier) {
      params.identifier = filter.identifier;
    }

    if (filter.nameAndLocation) {
      params.nameAndLocation = filter.nameAndLocation;
    }

    if (filter.period?.startDate) {
      params.startDate = formatDate(filter.period.startDate, DATE_FORMAT);
    }

    if (filter.period?.endDate) {
      params.endDate = formatDate(filter.period.endDate, DATE_FORMAT);
    }

    if (filter.transmissionPeriod?.startDate) {
      params.transmissionStartDate = formatDate(filter.transmissionPeriod.startDate, DATE_FORMAT);
    }

    if (filter.transmissionPeriod?.endDate) {
      params.transmissionEndDate = formatDate(filter.transmissionPeriod.endDate, DATE_FORMAT);
    }

    if (filter.shomId) {
      params.shomId = filter.shomId;
    }

    if (filter.producerOrganization) {
      params.producerOrganization = filter.producerOrganization;
    }

    if (filter.ownerOrganization) {
      params.ownerOrganization = filter.ownerOrganization;
    }

    if (filter.notCompliant) {
      params.notCompliant = '' + filter.notCompliant;
    }

    if (filter.transmissionStatus) {
      params.transmissionStatus = filter.transmissionStatus;
    }

    if (filter.expectedDeletionDate) {
      params.expectedDeletionDate = formatDate(filter.expectedDeletionDate, DATE_FORMAT);
    }

    if (filter.briInternalComment) {
      params.briInternalComment = filter.briInternalComment;
    }

    return params;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SurveyService extends AbstractSurveyService {
  private static readonly implementationError = new Error('Should not be called by public user');

  constructor(private readonly surveyApi: SurveyApi) {
    super();
  }

  public loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, state: string, isBri: boolean, filterValues: SurveyTableFilterValues): Observable<ModelItemTablePage<TableSurvey>> {
    return this.surveyApi.getTableView$(
      {
        page: '' + pageInfo.page,
        size: '' + pageInfo.rows,
        ...SurveyService.convertFilterToRequestParams(state, filterValues),
        ...(sortInfo && sortInfo.field && { sort: SurveyService.convertSortInfoToString(sortInfo) })
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
    return this.surveyApi.createDeposit$(survey);
  }

  public updateDeposit$(survey: SurveyDepositEdition): Observable<string> {
    return this.surveyApi.updateDeposit$(survey);
  }

  public getDepositById$(id: string): Observable<SurveyDepositEdition> {
    return this.surveyApi.getDepositById$(id);
  }

  public createTest$(survey: SurveyTestEdition): Observable<string> {
    return this.surveyApi.createTest$(survey);
  }

  public updateTest$(survey: SurveyTestEdition): Observable<string> {
    return this.surveyApi.updateTest$(survey);
  }

  public getTestById$(id: string): Observable<SurveyTestEdition> {
    return this.surveyApi.getTestById$(id);
  }

  public getSurveyModalById$(id: string): Observable<SurveyDetails> {
    return this.surveyApi.getSurveyModalById$(id);
  }

  public clone$(id: string, nameAndLocation: string, areaId: string): Observable<string> {
    return this.surveyApi.clone$(id, nameAndLocation, areaId);
  }

  public deleteDeposit$(id: string): Observable<void> {
    return this.surveyApi.deleteDeposit$(id);
  }

  public report$(id: string): Observable<string> {
    return this.surveyApi.report$(id);
  }

  public transmitDeposit$(survey: SurveyDepositEdition): Observable<void> {
    return this.surveyApi.transmitDeposit$(survey);
  }

  public downloadSurveyAsZipArchive$(id: string): Observable<HttpResponse<Blob>> {
    throw SurveyService.implementationError;
  }

  public updateBriInternalComment$(id: string, comment: string): Observable<string> {
    throw SurveyService.implementationError;
  }
}
