import Area from '@app/models/area.model';
import { MaritimeServiceType, ServiceNetwork } from '@app/models/maritime-service.model';
import { ServiceUserRole } from './pro-user.model';

export default interface PublicUser {
  id?: string;
  title: string;  // gender
  firstname: string;
  lastname: string;
  email: string;
  identifier?: string;
  password: string;
  hasEmailNotification: boolean;
  mobilePhoneNumber: string;
  phoneNumber: string;
  hasAcceptedTos: boolean;
  registrationNumber?: string;
  preferredArea?: Area;
  organization?: string;
  shipName?: string;
  homePort?: string;
  status?: string;
  hasNotificationsSound: boolean;
  hasSubscriptionEmailNotifications: boolean;
  proAccount: boolean;
}

export interface AuthenticatedUser {
  id?: string;
  title: string;  // gender
  firstname: string;
  lastname: string;
  role?: string;
  noticeProducer?: boolean;
  serviceId?: string;
  serviceName?: string;
  serviceType?: MaritimeServiceType;
  serviceNetwork?: ServiceNetwork;
  serviceRoles?: ServiceUserRole[];
  preferredAreaId?: string;
  hasNotificationsSound: boolean;
  proAccount?: boolean;
}
