import { CreationAttachment } from '@app/shared/components/attachments/attachment.model';
import { JsonGeometry } from '@sig/models/geometry';

export enum MaritimeEntityType {
  SERVICE_AREA = 'SERVICE_AREA'
}

export interface MaritimeEntityBase {
  id: string;
  name: string;
  internationalName?: string;
}

export interface MaritimeEntityReference {
  id?: string;
  maritimeEntityId: string;
  title: string;
  internationalTitle?: string;
  url?: string;
  isPublic: boolean;
  attachmentId?: string;
  attachmentFile?: CreationAttachment;
  creationDate?: Date;
}

export default interface MaritimeEntity extends MaritimeEntityBase {
  urn?: string;
  information?: string;
  localizedInformation?: string;
  type?: MaritimeEntityType;
  maritimeServiceId: string;
  geom: JsonGeometry;
  areas?: Array<string>;
  sissyId?: string;
  references?: MaritimeEntityReference[];
  additionalServices?: string[];
}

export interface MapMaritimeEntity extends MaritimeEntityBase {
  geom: JsonGeometry;
}
