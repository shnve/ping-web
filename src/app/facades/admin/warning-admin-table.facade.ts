import { Injectable } from '@angular/core';
import { WarningAdminApi, WarningsTableApiParams } from '@app/api/admin/warning-admin.api';
import { TableAdminFilterValues } from '@app/models/admin/warning-admin-filter.model';
import { TableAdminWarning } from '@app/models/admin/warning-admin-table.model';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { TableStateValue } from '@app/states/table.state';
import { default as formatDate } from 'date-fns/format';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WarningAdminTableFacade {
  constructor(private readonly warningAdminApi: WarningAdminApi) { }

  loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, status: string, filterValues: TableAdminFilterValues): Observable<ModelItemTablePage<TableAdminWarning>> {
    return this.warningAdminApi.getTableView$({
      page: '' + pageInfo.page,
      size: '' + pageInfo.rows,
      ...WarningAdminTableFacade.convertFilterToRequestParams(status, filterValues),
      ...(sortInfo && sortInfo.field && { sort: WarningAdminTableFacade.convertSortInfoToString(sortInfo) })
    }).pipe(
      map<PaginatedModelItemTableViewDtos<TableAdminWarning>, ModelItemTablePage<TableAdminWarning>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  static convertFilterToRequestParams(status: string, filter: TableAdminFilterValues): WarningsTableApiParams {
    const params: WarningsTableApiParams = {
      serieId: filter.serie.id,
      status
    };

    if (filter.subAreaIds.length) {
      params.subAreaIds = filter.subAreaIds.join(',');
    }
    if (filter.todo) {
      params.toBeDone = '' + filter.todo;
    }
    if (filter.generalCategory) {
      params.warningHazardTypeGeneral = filter.generalCategory;
    }
    if (filter.detailsCategories?.length) {
      params.warningHazardTypeDetails = filter.detailsCategories.join(',');
    }
    if (filter.modelName?.length) {
      params.modelName = filter.modelName;
    }
    if (filter.referenceNumber) {
      params.referenceNumber = filter.referenceNumber;
    }
    if (filter.localityOrInformation) {
      params.localityOrInformation = filter.localityOrInformation;
    }
    if (filter.period?.startDate) {
      params.dateStart = formatDate(filter.period.startDate, 'yyyy-MM-dd');
    }
    if (filter.period?.endDate) {
      params.dateEnd = formatDate(filter.period.endDate, 'yyyy-MM-dd');
    }

    if (filter.warningNumber) {
      params.warningNumber = filter.warningNumber;
    }

    if (filter.concernedMaritimeEntityIds?.length) {
      params.concernedMaritimeEntityIds = filter.concernedMaritimeEntityIds.join(',');
    }

    if (filter.entityCoverIds?.length) {
      params.entityCoverIds = filter.entityCoverIds.join(',');
    }

    if (filter.folderIds?.length) {
      params.folderIds = filter.folderIds.join(',');
    }

    return params;
  }

  static convertSortInfoToString(sortInfo: SortInfo): string {
    if (!sortInfo) {
      return '';
    }
    const order = sortInfo.order === 1 ? 'asc' : 'desc';
    return `${sortInfo.field},${order}`;
  }
}
