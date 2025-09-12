export interface Notion {
  id: string;
  objectId: string;
  number: string;
  type: NotionType
  creationDate: Date;
  endDate: Date;
  validationTime?: Date;
  publicationDate?: Date;
  cancellationDate?: Date;
  repealDate?: Date;
  infosource: NotionInfosource;
  warning: NotionWarning;
  warningTP: NotionWarning;
  georegulation: NotionGeoregulation;
  canBeAccessed: boolean;
}

export interface NotionBase {
  id: string;
  creationDate: Date;
  linkedNotionIds?: Array<string>;
}

export interface NotionInfosource extends NotionBase {
  number: string;
  lastUpdate: Date;
  linkedNotionIds?: Array<string>;
}

export interface NotionWarning extends NotionBase {
  nameOfSeries: string;
  warningNumber: number;
  year: number;
  publicationTime: Date;
}

export interface NotionGeoregulation extends NotionBase {
  number: string;
  publicationDate: Date;
}

export enum NotionType {
  INFOSOURCE = 'INFOSOURCE',
  WARNING = 'WARNING',
  WARNING_TP = 'WARNING_TP',
  GEOREGULATION = 'GEOREGULATION'
}
