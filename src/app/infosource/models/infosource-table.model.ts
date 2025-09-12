import { StudyReferencesTypeEnum } from '@app/folder/models/folder-study.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { InfosourceNature, InfosourceServiceStatus, InfosourceStatus } from './infosource.model';

export interface TableInfosource {
  id: string;
  serviceStatus?: InfosourceServiceStatus;
  number: string;
  emitter?: string;
  nature: InfosourceNature;
  status: InfosourceStatus;
  description: string;
  comment: string;
  validationTime: Date;
  recipients: Array<InfosourceRecipient>;
  folders?: Array<String>;
  warnings?: Array<String>;
  concernedMaritimeEntities?: Array<MaritimeEntityBase>;
  tags?: Array<string>;
  referenceFolderStudies?: Array<ReferenceFolderStudyDto>;
}

export enum InfosourceState {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED'
}

export interface InfosourceRecipient {
  id: string;
  name: string;
  information: string;
  localizedInformation: string;
  actionType: InfosourceServiceStatus;
  transferredBy?: string;
}

export interface Affair {
  name: string;
}

export interface ReferenceFolderStudyDto {
  studyId: string;
  type: StudyReferencesTypeEnum;
  value: string;
}
