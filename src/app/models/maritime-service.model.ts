export enum ServiceNetwork {
  GOVERNMENT_SERVICE = 'GOVERNMENT_SERVICE',
  NON_STATE_OWNED_PUBLIC_SERVICE = 'NON_STATE_OWNED_PUBLIC_SERVICE',
  PRIVATE_SERVICE = 'PRIVATE_SERVICE'
}

export enum ServiceRole {
  SERVICE_ADMIN = 'SERVICE_ADMIN',
  SERVICE_OPERATOR = 'SERVICE_OPERATOR',
  SERVICE_VISITOR = 'SERVICE_VISITOR'
}

export enum MaritimeServiceType {
  NATIONAL_DELEGATED_COORDINATOR = 'NATIONAL_DELEGATED_COORDINATOR',
  SHOM_GEOGRAPHIC_AREA = 'SHOM_GEOGRAPHIC_AREA',
  NAVAREA_COORDINATOR = 'NAVAREA_COORDINATOR',
  SEMAPHORE = 'SEMAPHORE',
  LIGHTHOUSES_AND_BEACONS = 'LIGHTHOUSES_AND_BEACONS',
  CAPTAINCY = 'CAPTAINCY',
  AUTHORITY = 'AUTHORITY',
  CROSS_VTS = 'CROSS_VTS',
  PORT_VTS = 'PORT_VTS',
  CROSS = 'CROSS',
  BRI = 'BRI',
  OLD_USERS = 'OLD_USERS',
  OPERATOR = 'OPERATOR'
}

export interface Tag {
  id?: string;
  value: string;
  maritimeServiceId: string;
}

export interface MaritimeServiceBase {
  id: string;
  name: string;
  internationalName?: string;
}

export type MaritimeServiceConcerned = Pick<MaritimeServiceBase, 'id' | 'name'>;

export interface MaritimeServiceInfosourceRecipient extends MaritimeServiceBase {
  defaultService?: boolean
}

export default interface MaritimeService extends MaritimeServiceInfosourceRecipient {
  urn?: string;
  information?: string;
  localizedInformation?: string;
  productionAgency?: string;
  country?: string;
  type?: string;
  serviceNetwork?: ServiceNetwork;
  pingPartner?: boolean;
  s124DataProducer?: boolean;
  maritimeNoticeProducer?: boolean;
  folderManager?: boolean;
  surveyOwner?: boolean;
  areas?: Array<string>;
  maritimeEntities?: Array<string>;
  tags?: Array<Tag>
  sissyId?: string;
  authorityCode?: string;
  shomService?: boolean;
  observedMaritimeEntities?: string[];
  ihoProducerCode?: string;
}

export interface MaritimeServiceGroup {
  name: string;
  maritimeServices: MaritimeService[];
}
