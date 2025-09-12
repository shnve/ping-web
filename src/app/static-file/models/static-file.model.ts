import { CreationAttachment } from '@app/shared/components/attachments/attachment.model';

export interface StaticFile {
  id?: string;
  path: string;
  description: string;
  attachmentId: string;
  attachmentFile: CreationAttachment;
  locked: boolean;
}

export const defaultStaticFile: StaticFile = {
  path: null,
  description: null,
  attachmentId: null,
  attachmentFile: null,
  locked: false
}