import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AttachmentApi } from '@app/api/attachment.api';
import { AuthService } from '@app/auth/auth.service';
import { NotionTypeEnum } from '@app/shared/components/add-notion-to-folder-selection/notion-type-enum';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(
    private readonly attachmentApi: AttachmentApi,
    private readonly authService: AuthService
  ) { }

  download(attachmentId: string, notionType?: NotionTypeEnum, notionItemId?: string): Observable<HttpResponse<Blob>> {
    return this.authService.isLoggedIn() ? this.attachmentApi.downloadAttachment$(attachmentId)
      : this.attachmentApi.downloadPublicFileByNotionType$(attachmentId, notionType, notionItemId);
  }
}
