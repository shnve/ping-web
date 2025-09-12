import MaritimeService from '@app/models/maritime-service.model';
import { CreationAttachment } from '@shared/components/attachments/attachment.model';

export interface FolderAttachment {
  attachmentId?: string;
  attachmentFile?: CreationAttachment;
  creationDate?: Date;
  receptionDate?: Date;
  maritimeServiceId?: string;
  maritimeService?: MaritimeService;
  comment?: string;
  id?: string;
  objectId?: string;
}
