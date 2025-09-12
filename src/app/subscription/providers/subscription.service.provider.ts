import { AuthService } from '@app/auth/auth.service';
import { SubscriptionAdminApi } from '@app/subscription/api/subscription-admin.api';
import { SubscriptionApi } from '@app/subscription/api/subscription.api';
import { SubscriptionAdminService } from '@app/subscription/services/subscription-admin.service';
import { AbstractSubscriptionService, SubscriptionService } from '@app/subscription/services/subscription.service';

const subscriptionServiceFactory = (
  authService: AuthService,
  subscriptionApi: SubscriptionApi,
  subscriptionAdminApi: SubscriptionAdminApi) => {
  if (authService.isPublicUser()) {
    return new SubscriptionService(authService, subscriptionApi);
  } else {
    return new SubscriptionAdminService(authService, subscriptionAdminApi);
  }
};

export const subscriptionServiceProvider = {
  provide: AbstractSubscriptionService,
  useFactory: subscriptionServiceFactory,
  deps: [
    AuthService,
    SubscriptionApi,
    SubscriptionAdminApi
  ]
};
