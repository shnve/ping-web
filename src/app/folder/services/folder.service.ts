import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { FolderAdminApi, FoldersTableApiParams } from '@app/folder/api/folder-admin.api';
import { FolderAttachment } from '@app/folder/models/folder-attachments.model';
import { FolderTableFilterValues } from '@app/folder/models/folder-filters.model';
import { TableFolder } from '@app/folder/models/folder-table.model';
import { Folder, FolderBase, FolderStatusEnum, MaritimeServiceAvailableToFollowFolder } from '@app/folder/models/folder.model';
import { TableStateValue } from '@app/states/table.state';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos, SortInfo } from '@shared/models/paginated-table-view.model';
import { default as formatDate } from 'date-fns/format';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FolderApi } from '../api/folder.api';
import { CreationFolderDto } from '../models/folder-creation.model';
import { ReferencesByFolder } from '../models/folder-study.model';

const DATE_FORMAT = 'yyyy-MM-dd';

@Injectable({
  providedIn: 'root'
})
export class FolderService {

  constructor(protected readonly authService: AuthService,
    private readonly folderApi: FolderApi,
    private readonly folderAdminApi: FolderAdminApi) { }


  static convertSortInfoToString(sortInfo: SortInfo): string {
    if (!sortInfo) {
      return '';
    }
    const order = sortInfo.order === 1 ? 'asc' : 'desc';
    return `${sortInfo.field},${order}`;
  }

  static convertFilterToRequestParams(state: FolderStatusEnum, filter: FolderTableFilterValues): FoldersTableApiParams {
    const params: FoldersTableApiParams = {
      status: state
    };

    if (filter.area?.id) {
      params.areaId = filter.area.id;
    }

    if (filter.followerService?.id) {
      params.followerServiceId = filter.followerService.id;
    }

    if (filter.maritimeEntityIds?.length) {
      params.maritimeEntityIds = filter.maritimeEntityIds.join(',');
    }

    if (filter.lastUpdatePeriod?.startDate) {
      params.lastUpdatePeriodDateStart = formatDate(filter.lastUpdatePeriod.startDate, DATE_FORMAT);
    }

    if (filter.lastUpdatePeriod?.endDate) {
      params.lastUpdatePeriodDateEnd = formatDate(filter.lastUpdatePeriod.endDate, DATE_FORMAT);
    }

    if (filter.lastUpdateYear) {
      params.lastUpdateYear = filter.lastUpdateYear;
    }

    if (filter.number) {
      params.number = filter.number;
    }

    if (filter.secondPartNumber) {
      params.secondPartNumber = filter.secondPartNumber;
    }

    if (filter.localityOrObject) {
      params.localityOrObject = filter.localityOrObject;
    }

    if (filter.areaIds) {
      params.areaIds = filter.areaIds.join(',');
    }

    if (filter.studyId) {
      params.studyId = filter.studyId;
    }

    return params;
  }

  loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, state: FolderStatusEnum, filterValues: FolderTableFilterValues)
    : Observable<ModelItemTablePage<TableFolder>> {
    return this.folderAdminApi.getTableView$(
      {
        page: '' + pageInfo.page,
        size: '' + pageInfo.rows,
        ...FolderService.convertFilterToRequestParams(state, filterValues),
        ...(sortInfo && sortInfo.field && { sort: FolderService.convertSortInfoToString(sortInfo) })
      }
    ).pipe(
      map<PaginatedModelItemTableViewDtos<TableFolder>, ModelItemTablePage<TableFolder>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  getFolderById$(id: string): Observable<Folder> {
    return this.folderAdminApi.getFolderById$(id);
  }

  getFolderDetailById$(id: string): Observable<Folder> {
    return this.folderAdminApi.getFolderDetailById$(id);
  }

  public createFolder$(folder: CreationFolderDto): Observable<string> {
    return this.folderAdminApi.createFolder$(folder);
  }

  public updateFolder$(id: string, folder: CreationFolderDto): Observable<string> {
    return this.folderAdminApi.updateFolder$(id, folder);
  }

  delete$(id: string): Observable<void> {
    return this.folderAdminApi.delete$(id);
  }

  deleteNotion$(id: string, notionId: string): Observable<void> {
    return this.folderAdminApi.deleteNotion$(id, notionId);
  }

  addAttachmentToFolder$(id: string, folderAttachment: FolderAttachment): Observable<void> {
    return this.folderAdminApi.addAttachmentToFolder$(id, folderAttachment);
  }

  updateFolderAttachment$(folderAttachment: FolderAttachment): Observable<void> {
    return this.folderAdminApi.updateFolderATtachment$(folderAttachment);
  }

  deleteAttachmentFromFolder$(id: string): Observable<void> {
    return this.folderAdminApi.deleteAttachmentFromFolder$(id);
  }

  clone$(id: string): Observable<string> {
    return this.folderAdminApi.clone$(id);
  }

  notify$(id: string, serviceIds: Array<string>): Observable<void> {
    return this.folderAdminApi.notify$(id, serviceIds);
  }

  getAvailableWarningFolders$(): Observable<FolderBase[]> {
    return this.folderAdminApi.getAvailableWarningFolders$();
  }

  getMaritimeServiceAvailableToFollowFolder$(folderId: string): Observable<MaritimeServiceAvailableToFollowFolder[]> {
    return this.folderAdminApi.getMaritimeServicesAvailableToFollowFolder$(folderId);
  }

  follow$(folderId: string, serviceIds: Array<string>): Observable<void> {
    return this.folderAdminApi.follow$(folderId, serviceIds);
  }

  unFollow$(folderId: string, serviceId: string): Observable<void> {
    return this.folderAdminApi.unFollow$(folderId, serviceId);
  }

  getReferencesByFolderIds$(folderIds: string[]): Observable<ReferencesByFolder[]> {
    return this.folderAdminApi.getReferencesByFolderIds$(folderIds);
  }
}
