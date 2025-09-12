import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FolderAttachment } from '@app/folder/models/folder-attachments.model';
import { TableFolder } from '@app/folder/models/folder-table.model';
import { Folder, FolderBase, FolderStatusEnum, MaritimeServiceAvailableToFollowFolder } from '@app/folder/models/folder.model';
import { NotionTypeEnum } from '@app/shared/components/add-notion-to-folder-selection/notion-type-enum';
import { environment } from '@env/environment';
import { PaginatedModelItemTableViewDtos } from '@shared/models/paginated-table-view.model';
import { Observable, throwError } from 'rxjs';
import { CreationFolderDto } from '../models/folder-creation.model';
import { ReferencesByFolder } from '../models/folder-study.model';

export type FoldersTableApiParams = {
  status: FolderStatusEnum;
  areaId?: string;
  followerServiceId?: string;
  secondPartNumber?: string;
  number?: string;
  localityOrObject?: string;
  areaIds?: string;
  maritimeEntityIds?: string;
  lastUpdatePeriodDateStart?: string;
  lastUpdatePeriodDateEnd?: string;
  lastUpdateYear?: string;
  studyId?: string;
  page?: string;
  size?: string;
  sort?: string;
};

export abstract class AbstractFolderApi {

  constructor(protected readonly httpClient: HttpClient) { }
  public abstract getTableView$(params: FoldersTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableFolder>>;

  /**
   * Handler return ErrorObservable with user-friendly error message
   * @param error server or client side errors captured by HttpClient in HttpErrorResponse
   * @private
   */
  protected handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      // A client-side or network error occurred
      return throwError({ unknown: 'message.network-error' });
    }

    // return unhandled error
    return throwError({ unhandled: 'message.unhandled-error' });
  }
}


@Injectable({
  providedIn: 'root'
})
export class FolderAdminApi extends AbstractFolderApi {
  readonly apiTableUrl = environment.baseAdminApiUrl + environment.adminApi.folders.tableView;
  private readonly apiGetFolderById = environment.baseAdminApiUrl + environment.adminApi.folders.getById;
  private readonly apiGetFolderDetailById = environment.baseAdminApiUrl + environment.adminApi.folders.getDetailById;
  private readonly apiCreateUrl = environment.baseAdminApiUrl + environment.adminApi.folders.create;
  private readonly apiUpdateUrl = environment.baseAdminApiUrl + environment.adminApi.folders.update;
  private readonly apiDelete = environment.baseAdminApiUrl + environment.adminApi.folders.delete;
  private readonly apitGetFoldersToAddNotionTo = environment.baseAdminApiUrl + environment.adminApi.folders.getAvailableByNotion;
  private readonly apiAddFolderToNotion = environment.baseAdminApiUrl + environment.adminApi.folders.addFolderToNotion;
  private readonly apiRemoveNotionFromFolder = environment.baseAdminApiUrl + environment.adminApi.folders.removeNotionFromFolder;
  private readonly apiAddAttachmentToFolder = environment.baseAdminApiUrl + environment.adminApi.folders.addAttachmentToFolder;
  private readonly apiUpdateFolderAttachment = environment.baseAdminApiUrl + environment.adminApi.folders.updateFolderAttachment;
  private readonly apiDeleteAttachmentFromFolder = environment.baseAdminApiUrl + environment.adminApi.folders.deleteAttachmentFromFolder;
  private readonly apiClone = environment.baseAdminApiUrl + environment.adminApi.folders.clone;
  private readonly apiNotify = environment.baseAdminApiUrl + environment.adminApi.folders.notify;
  private readonly apiGetWarningsFoldersToFilter = environment.baseAdminApiUrl + environment.adminApi.warnings.foldersToFilter;
  private readonly apiGetAvailableServicesToFollowFolder = environment.baseAdminApiUrl + environment.adminApi.folders.getAvailableMaritimeServicesToFollow;
  private readonly apiFollow = environment.baseAdminApiUrl + environment.adminApi.folders.follow;
  private readonly apiUnFollow = environment.baseAdminApiUrl + environment.adminApi.folders.unFollow;


  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  getTableView$(tableParams: FoldersTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableFolder>> {
    const params = new HttpParams({ fromObject: tableParams });
    return this.httpClient.get<PaginatedModelItemTableViewDtos<TableFolder>>(this.apiTableUrl,
      { headers: this.httpOptions.headers, params });
  }

  getFolderById$(id: string): Observable<Folder> {
    return this.httpClient.get<Folder>(`${this.apiGetFolderById.replace('{{id}}', id)}`);
  }

  getFolderDetailById$(id: string): Observable<Folder> {
    return this.httpClient.get<Folder>(this.apiGetFolderDetailById.replace('{{id}}', id));
  }

  createFolder$(folder: CreationFolderDto): Observable<string> {
    return this.httpClient.post<string>(this.apiCreateUrl, folder, this.httpOptions);
  }

  updateFolder$(id: string, folder: CreationFolderDto): Observable<string> {
    return this.httpClient.put<string>(this.apiUpdateUrl.replace('{{id}}', id), folder, this.httpOptions);
  }

  delete$(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiDelete.replace('{{id}}', id)}`);
  }

  getFoldersToAddNotionTo$(notionId: string, notionType: NotionTypeEnum): Observable<Folder[]> {
    return this.httpClient.get<Folder[]>(this.apitGetFoldersToAddNotionTo.replace('{{notionId}}', notionId).replace('{{type}}', notionType));
  }

  addNotionToFolder$(folderId: string, notionId: string, notionType: NotionTypeEnum): Observable<void> {
    return this.httpClient.post<void>(this.apiAddFolderToNotion
      .replace('{{id}}', folderId)
      .replace('{{notionId}}', notionId)
      .replace('{{type}}', notionType), this.httpOptions);
  }

  deleteNotion$(id: string, notionId: string): Observable<void> {
    return this.httpClient.delete<void>(this.apiRemoveNotionFromFolder
      .replace('{{id}}', id)
      .replace('{{notionId}}', notionId), this.httpOptions);
  }

  addAttachmentToFolder$(folderId: string, folderAttachment: FolderAttachment): Observable<void> {
    return this.httpClient.post<void>(this.apiAddAttachmentToFolder.replace('{{id}}', folderId), folderAttachment, this.httpOptions);
  }

  updateFolderATtachment$(folderAttachment: FolderAttachment): Observable<void> {
    return this.httpClient.put<void>(this.apiUpdateFolderAttachment.replace('{{folderAttachmentId}}', folderAttachment.id), folderAttachment, this.httpOptions);
  }

  deleteAttachmentFromFolder$(folderAttachmentId: string): Observable<void> {
    return this.httpClient.delete<void>(this.apiDeleteAttachmentFromFolder.replace('{{folderAttachmentId}}', folderAttachmentId), this.httpOptions);
  }

  clone$(id: string): Observable<string> {
    return this.httpClient.post<string>(this.apiClone.replace('{{id}}', id), {}, this.httpOptions);
  }

  notify$(id: string, serviceIds: Array<string>) {
    return this.httpClient.post<void>(this.apiNotify.replace('{{id}}', id), serviceIds, this.httpOptions);
  }

  getAvailableWarningFolders$(): Observable<FolderBase[]> {
    return this.httpClient.get<FolderBase[]>(this.apiGetWarningsFoldersToFilter);
  }

  getMaritimeServicesAvailableToFollowFolder$(folderId: string): Observable<MaritimeServiceAvailableToFollowFolder[]> {
    return this.httpClient.get<MaritimeServiceAvailableToFollowFolder[]>(this.apiGetAvailableServicesToFollowFolder.replace('{{folderId}}', folderId));
  }

  follow$(id: string, serviceIds: Array<string>) {
    return this.httpClient.post<void>(this.apiFollow.replace('{{id}}', id), serviceIds, this.httpOptions);
  }

  unFollow$(id: string, serviceId: string): Observable<void> {
    return this.httpClient.post<void>(this.apiUnFollow.replace('{{id}}', id).replace('{{serviceId}}', serviceId), this.httpOptions);
  }

  getReferencesByFolderIds$(folderIds: string[]): Observable<ReferencesByFolder[]> {
    const httpParams = new HttpParams().append('folderIds', folderIds.join(','));
    return this.httpClient.get<ReferencesByFolder[]>(`${this.apiTableUrl}/references`, { params: httpParams });
  }
}
