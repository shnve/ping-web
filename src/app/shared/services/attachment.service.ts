import { Injectable } from '@angular/core';
import { AttachmentApi } from '@app/api/attachment.api';
import { AuthService } from '@app/auth/auth.service';
import { Observable } from 'rxjs';
import { CreationAttachment } from '../components/attachments/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  constructor(private readonly attachmentApi: AttachmentApi,
    private readonly authService: AuthService) { }

  saveAttachment(attachment: CreationAttachment): Observable<string> {
    return this.attachmentApi.createAttachment$(attachment);
  }

  removeAttachment(attachmentId: string): Observable<any> {
    return this.attachmentApi.deleteAttachment$(attachmentId, this.authService.getToken());
  }

  checkFileRequirements$(filename: string, fileSize: number, admin: boolean, isBathy = false, isSurvey = false, isTechnicalMetadata = false): Observable<string> {
    return this.attachmentApi.checkFileRequirements$(filename, fileSize, admin, isBathy, isSurvey, isTechnicalMetadata);
  }
}