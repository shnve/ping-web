import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { NotionTypeEnum } from '@app/shared/components/add-notion-to-folder-selection/notion-type-enum';
import { CreationAttachment } from '@app/shared/components/attachments/attachment.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class AttachmentApi {
  readonly apiDeleteUrl = environment.baseAdminApiUrl + environment.api.attachments.delete;
  readonly adminApiCreateUrl = environment.baseAdminApiUrl + environment.api.attachments.create;
  readonly securedApiCreateUrl = environment.baseSecuredApiUrl + environment.api.attachments.create;
  readonly adminApiDownloadUrl = environment.baseAdminApiUrl + environment.api.attachments.download;
  readonly securedApiDownloadUrl = environment.baseSecuredApiUrl + environment.api.attachments.download;
  readonly adminApiCheckFileRequirementsUrl = environment.baseAdminApiUrl + environment.api.attachments.checkFileRequirements;
  readonly securedApiCheckFileRequirementsUrl = environment.baseSecuredApiUrl + environment.api.attachments.checkFileRequirements;
  readonly apiDownloadByNotionTypeUrl = environment.baseApiUrl + environment.api.attachments.downloadPublicFileByNotionType;

  constructor(private readonly http: HttpClient, private readonly authService: AuthService) { }

  deleteAttachment$(id: string, accessToken: string): Observable<any> {
    return this.http.delete(this.apiDeleteUrl.replace('{{id}}', id), { headers: this.buildAuthorizationHeader(accessToken) });
  }

  createAttachment$(attachment: CreationAttachment): Observable<string> {
    const apiUrl = this.authService.isProUser() ? this.adminApiCreateUrl : this.securedApiCreateUrl;
    return this.http.post<string>(apiUrl, attachment);
  }

  downloadAttachment$(id: string): Observable<HttpResponse<Blob>> {
    const apiDownloadUrl = this.authService.isProUser() ? this.adminApiDownloadUrl : this.securedApiDownloadUrl;
    return this.http.get(apiDownloadUrl.replace('{{id}}', id), { responseType: 'blob', observe: 'response' });
  }

  private buildAuthorizationHeader(accessToken: string): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', `Bearer ${accessToken}`);
  }

  checkFileRequirements$(filename: string, fileSize: number, admin: boolean, isBathy = false, isSurvey = false, isTechnicalMetadata = false): Observable<string> {
    return this.http.get((admin ? this.adminApiCheckFileRequirementsUrl : this.securedApiCheckFileRequirementsUrl)
      .replace('{{filename}}', filename).replace('{{fileSize}}', `${fileSize}`).replace('{{isBathy}}', `${isBathy}`).replace('{{isSurvey}}', `${isSurvey}`)
      .replace('{{isTechnicalMetadata}}', `${isTechnicalMetadata}`),{ responseType: 'text' });
  }

  downloadPublicFileByNotionType$(id: string, notionType: NotionTypeEnum, notionItemId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(
      this.apiDownloadByNotionTypeUrl.replace('{{id}}', id).replace('{{notionType}}', notionType).replace('{{notionItemId}}', notionItemId),
      { responseType: 'blob', observe: 'response' }
    );
  }
}
