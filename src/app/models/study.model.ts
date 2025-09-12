import { FolderAttachment } from '@app/folder/models/folder-attachments.model';
import { StudyReference } from '@app/folder/models/folder-study.model';
import { Notion } from '@app/models/notion.model';

export enum StudyStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}
export interface StudyBase {
  id?: string;
  folderId?: string;
  number: string;
  notions?: Array<Notion>;
  attachments?: Array<FolderAttachment>;
  references?: Array<StudyReference>;
}
export interface FolderStudy extends StudyBase {
  type?: string;
  creationDate?: Date;
  endDate?: Date;
  validationTime?: Date;
  publicationDate?: Date;
  cancellationDate?: Date;
  repealDate?: Date;
  lastUpdate?: Date;
  lastUpdateUser?: string;
  status?: StudyStatusEnum;
}

