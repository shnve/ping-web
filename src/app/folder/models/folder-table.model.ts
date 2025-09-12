import { Folder } from '@app/folder/models/folder.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { MaritimeServiceBase } from '@app/models/maritime-service.model';
import { AreaBase } from './../../models/area.model';

type TableFolderBase = {
  sharedAreas?: Array<AreaBase>;
  concernedMaritimeEntities?: Array<MaritimeEntityBase>;
  sharedMaritimeServices?: Array<MaritimeServiceBase>;
  reviewStatus?: string;
};

export type TableFolder = Required<Pick<Folder, 'id'>> & Omit<Folder, 'id' | 'concernedMaritimeEntities' | 'sharedMaritimeServices'
  | 'sharedAreas' | 'locality' | 'area' | 'issuingService'> & TableFolderBase;

export type TableFolderGraph = {
  id: string;
  number: string;
  type?: string;
  creationDate?: Date;
  endDate?: Date;
};
