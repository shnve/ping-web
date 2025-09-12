import { JsonWarningAdminDetails, JsonWarningCreationData } from '@admin-warning/models/creation-warning.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableAdminWarning } from '@app/models/admin/warning-admin-table.model';
import { AdminJsonWarning, AttachmentDownload, MainWarningPart, Warning, WarningMaritimeEntityReference, WarningReferenceAsPublicReference, WarningReferenceCategoryEnum } from '@app/models/warning.model';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';


export type WarningsTableApiParams = {
  serieId: string;
  status: string;
  warningNumber?: string;
  modelName?: string;
  localityOrInformation?: string;
  dateEnd?: string;
  dateStart?: string;
  page?: string;
  size?: string;
  toBeDone?: string;
  subAreaIds?: string;
  concernedMaritimeEntityIds?: string;
  entityCoverIds?: string;
  folderIds?: string;
  warningHazardTypeGeneral?: string;
  warningHazardTypeDetails?: string;
  referenceNumber?: string;
  sort?: string;
};

@Injectable({
  providedIn: 'root'
})
export class WarningAdminApi {

  readonly apiTableUrl = environment.baseAdminApiUrl + environment.adminApi.warnings.tableView;
  readonly apiCreateWarning = environment.baseAdminApiUrl + environment.adminApi.warnings.create;
  readonly apiGetWarningById = environment.baseAdminApiUrl + environment.adminApi.warnings.get;
  readonly apiCancellableWarnings = environment.baseAdminApiUrl + environment.adminApi.warnings.cancellable;
  readonly apiReplaceableWarnings = environment.baseAdminApiUrl + environment.adminApi.warnings.replaceable;
  readonly apiReferenceableWarnings = environment.baseAdminApiUrl + environment.adminApi.warnings.referenceable;
  readonly apiWarningAdminById = environment.baseAdminApiUrl + environment.adminApi.warnings.one;
  readonly apiPublish = environment.baseAdminApiUrl + environment.adminApi.warnings.publish;
  readonly apiDelete = environment.baseAdminApiUrl + environment.adminApi.warnings.delete;
  readonly apiCancel = environment.baseAdminApiUrl + environment.adminApi.warnings.cancel;
  readonly apiClone = environment.baseAdminApiUrl + environment.adminApi.warnings.clone;
  readonly apiTelex = environment.baseAdminApiUrl + environment.adminApi.warnings.telex;
  readonly apiNavtex = environment.baseAdminApiUrl + environment.adminApi.warnings.navtex;
  private readonly apiSetReviewed = environment.baseAdminApiUrl + environment.adminApi.warnings.setReviewed;
  private readonly apiGetAvailableAttachmentsToLinkAsWarningReference = environment.baseAdminApiUrl + environment.adminApi.warnings.getAvailableAttachmentsToLinkAsWarningReference;
  private readonly apiGetAvailableEntitiesReferencesToLinkAsWarningReference = environment.baseAdminApiUrl + environment.adminApi.warnings.getAvailableEntitiesReferencesToLinkAsWarningReference;
  private readonly apiGetAvailableWarningsReferencesAsPublicReference = environment.baseAdminApiUrl + environment.adminApi.warnings.getAvailableWarningsReferencesAsPublicReference;
  private readonly apiGetWarningIdsWhichCanBeCancelled = environment.baseAdminApiUrl + environment.adminApi.warnings.getWarningIdsWhichCanBeCancelled ;

  constructor(private readonly http: HttpClient) { }

  getTableView$(params: WarningsTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableAdminWarning>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<PaginatedModelItemTableViewDtos<TableAdminWarning>>(this.apiTableUrl, { params: httpParams });
  }

  getById$(id: string): Observable<AdminJsonWarning> {
    return this.http.get<AdminJsonWarning>(`${this.apiGetWarningById.replace('{{id}}', id)}`);
  }

  getBySerieIdAndStatus$(serieId: string, status: string): Observable<PaginatedModelItemTableViewDtos<TableAdminWarning>> {
    return this.http.get<PaginatedModelItemTableViewDtos<TableAdminWarning>>(`${this.apiTableUrl}?serieId=${serieId}&status=${status}`);
  }

  getCancellable$(serieId: string): Observable<MainWarningPart[]> {
    return this.http.get<MainWarningPart[]>(`${this.apiCancellableWarnings}?serieId=${serieId}`);
  }

  getReplaceable$(serieId: string): Observable<MainWarningPart[]> {
    return this.http.get<MainWarningPart[]>(`${this.apiReplaceableWarnings}?serieId=${serieId}`);
  }

  getReferenceable$(): Observable<MainWarningPart[]> {
    return this.http.get<MainWarningPart[]>(this.apiReferenceableWarnings);
  }

  create$(jsonWarningCreationData: JsonWarningCreationData, accessToken: string): Observable<Warning> {
    return this.http.post<Warning>(this.apiCreateWarning, jsonWarningCreationData,
      { headers: this.buildAuthorizationHeader(accessToken) });
  }

  update$(jsonWarningCreationData: JsonWarningCreationData, isPublished: boolean): Observable<Warning> {
    const updateUrl = this.apiWarningAdminById.replace('{{warningId}}', jsonWarningCreationData.id) + (isPublished ? '/published' : '');
    return this.http.put<Warning>(updateUrl, jsonWarningCreationData);
  }

  publish$(id: string, accessToken: string): Observable<void> {
    return this.http.put<void>(`${this.apiPublish.replace('{{id}}', id)}`, {}, { headers: this.buildAuthorizationHeader(accessToken) });
  }

  delete$(id: string, accessToken: string): Observable<void> {
    return this.http.delete<void>(`${this.apiDelete.replace('{{id}}', id)}`, { headers: this.buildAuthorizationHeader(accessToken) });
  }

  cancel$(id: string, accessToken: string): Observable<string> {
    return this.http.put<string>(`${this.apiCancel.replace('{{id}}', id)}`, {}, { headers: this.buildAuthorizationHeader(accessToken) });
  }

  clone$(id: string, serieId: string, warningReferenceCategoryEnum?: WarningReferenceCategoryEnum, warningStatus?: string): Observable<string> {
    let params = new HttpParams().set('serieId', serieId);
    if (warningReferenceCategoryEnum) {
      params = params.set('warningReferenceCategoryEnum', warningReferenceCategoryEnum);
    }

    if (warningStatus) {
      params = params.set('warningStatus', warningStatus);
    }

    return this.http.put<string>(this.apiClone.replace('{{id}}', id), {}, { params });
  }

  private buildAuthorizationHeader(accessToken: string): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', `Bearer ${accessToken}`);
  }

  getWarningById$(warningId: string): Observable<JsonWarningAdminDetails> {
    return this.http.get<JsonWarningAdminDetails>(this.apiWarningAdminById.replace('{{warningId}}', warningId));
  }

  generateTelex$(warningId: string): Observable<string> {
    return this.http.get(this.apiTelex.replace('{{id}}', warningId), { responseType: 'text' });
  }

  generateNavtex$(warningId: string): Observable<string> {
    return this.http.get(this.apiNavtex.replace('{{id}}', warningId), { responseType: 'text' });
  }

  setReviewed$(warningId: string): Observable<void> {
    return this.http.put<void>(this.apiSetReviewed.replace('{{id}}', warningId), {});
  }

  getAvailableAttachmentToLinkAsWarningReference$(warningId: string): Observable<AttachmentDownload[]> {
    const params = new HttpParams().set('warningId', warningId);
    return this.http.get<AttachmentDownload[]>(this.apiGetAvailableAttachmentsToLinkAsWarningReference, { params });
  }

  getAvailableEntitiesReferencesToLinkAsWarningReference$(warningId: string): Observable<WarningMaritimeEntityReference[]> {
    const params = new HttpParams().set('warningId', warningId);
    return this.http.get<WarningMaritimeEntityReference[]>(this.apiGetAvailableEntitiesReferencesToLinkAsWarningReference, { params });
  }

  getAvailableWarningsReferencesAsPublicReference$(warningId: string): Observable<WarningReferenceAsPublicReference[]> {
    const params = new HttpParams().set('warningId', warningId);
    return this.http.get<WarningReferenceAsPublicReference[]>(this.apiGetAvailableWarningsReferencesAsPublicReference, { params });
  }

  getWarningIdsWhichCanBeCancelled$(warningId: string): Observable<string[]> {
    const params = new HttpParams().set('warningId', warningId);
    return this.http.get<string[]>(this.apiGetWarningIdsWhichCanBeCancelled, { params });
  }
}
