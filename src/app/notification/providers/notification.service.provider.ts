import { AuthService } from '@app/auth/auth.service';
import { NotificationAdminApi } from '../api/notification-admin.api';
import { NotificationApi } from '../api/notification.api';
import { NotificationAdminService } from '../services/notification-admin.service';
import { AbstractNotificationService, NotificationService } from '../services/notification.service';

const notificationServiceFactory = (
  authService: AuthService,
  notificationApi: NotificationApi, 
  notificationAdminApi: NotificationAdminApi) => {
  if (authService.isPublicUser()) {
    return new NotificationService(authService, notificationApi);
  } else {
    return new NotificationAdminService(authService, notificationAdminApi);
  }
};

export const notificationServiceProvider = {
  provide: AbstractNotificationService,
  useFactory: notificationServiceFactory,
  deps: [
    AuthService, 
    NotificationApi, 
    NotificationAdminApi
  ]
};
