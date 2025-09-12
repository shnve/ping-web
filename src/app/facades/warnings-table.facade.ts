import { Injectable } from '@angular/core';
import { TableWarning } from '@app/models/warning.model';
import { ModelItemTablePage, PageInfo, PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { default as formatDate } from 'date-fns/format';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarningApi, WarningsTableApiParams } from '../api/warning.api';
import { TableFilterValues } from '../models/warning-filters.model';

@Injectable()
export class WarningTableFacade {
  constructor(private readonly warningApi: WarningApi) { }

  loadFilteredPage$(pageInfo: PageInfo, filterValues: TableFilterValues, isDetailedTable = false): Observable<ModelItemTablePage<TableWarning>> {
    return this.warningApi.getTableView$({
      page: '' + pageInfo.page,
      size: '' + pageInfo.rows,
      ...(filterValues ? WarningTableFacade.convertFilterToRequestParams(filterValues) : {})
    }, isDetailedTable).pipe(
      map<PaginatedModelItemTableViewDtos<TableWarning>, ModelItemTablePage<TableWarning>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  static convertFilterToRequestParams(filter: TableFilterValues): WarningsTableApiParams {
    const params: WarningsTableApiParams = {};
    if (filter.serie) {
      params.serieId = filter.serie.id;
    }
    if (filter.subAreaIds.length) {
      params.subAreaIds = filter.subAreaIds.join(',');
    }
    if (filter.categories?.length) {
      params.warningHazardTypeGenerals = filter.categories.join(',');
    }
    if (filter.period?.startDate) {
      params.dateStart = formatDate(filter.period.startDate, 'yyyy-MM-dd');
    }
    if (filter.period?.endDate) {
      params.dateEnd = formatDate(filter.period.endDate, 'yyyy-MM-dd');
    }
    if (filter.publishDate) {
      params.publishedFromIncludingDate = formatDate(filter.publishDate, 'yyyy-MM-dd');
    }
    if (filter.concernedMaritimeEntityIds?.length) {
      params.concernedMaritimeEntityIds = filter.concernedMaritimeEntityIds.join(',');
    }
    if (filter.entityCoverIds?.length) {
      params.entityCoverIds = filter.entityCoverIds.join(',');
    }
    if (filter.reservationNumberAndYear?.length) {
      params.reservationNumberAndYear = filter.reservationNumberAndYear;
    }
    return params;
  }
}
