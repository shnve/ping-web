import { MaritimeServiceBase, MaritimeServiceType } from './maritime-service.model';

export enum ProUserRole {
  FUNCTIONAL_ADMIN = 'FUNCTIONAL_ADMIN',
  SERVICE_USER = 'SERVICE_USER'
}

export enum ServiceRole {
  SERVICE_ADMIN = 'SERVICE_ADMIN',
  SERVICE_OPERATOR = 'SERVICE_OPERATOR',
  SERVICE_VISITOR = 'SERVICE_VISITOR'
}

export interface ServiceUserRole {
  serviceRole: ServiceRole;
  serviceId: string;
  type: MaritimeServiceType;
  shomService: boolean;
  surveyOwner: boolean;
  folderManager: boolean;
}

export interface ProUserServices extends MaritimeServiceBase {
  serviceRole: ServiceRole;
  type: MaritimeServiceType;
  surveyOwner?: boolean;
}

export default interface ProUser {
  id: string;
  title: string;  // gender
  firstname: string;
  lastname: string;
  email: string;
  identifier?: string;
  role: ProUserRole;
  phoneNumbers?: Phone[];
  organization?: string;
  preferredAreaId?: string;
  serviceId?: string;
  serviceRole?: ServiceRole;
  status?: string;
  hasNotificationsSound: boolean;
  hasSubscriptionEmailNotifications: boolean;
}

export interface Phone {
  description: string;
  number: string;
}
