import { AuthService } from '@app/auth/auth.service';
import { InfosourceAdminApi } from '../api/infosource-admin.api';
import { InfosourceApi } from '../api/infosource.api';
import { InfosourceAdminService } from '../services/infosource-admin.service';
import { AbstractInfosourceService, InfosourceService } from '../services/infosource.service';

const infosourceServiceFactory = (
  authService: AuthService,
  infosourceApi: InfosourceApi,
  infosourceAdminApi: InfosourceAdminApi) => {
  if (authService.isPublicUser()) {
    return new InfosourceService(authService, infosourceApi);
  } else {
    return new InfosourceAdminService(authService, infosourceAdminApi);
  }
};

export const infosourceServiceProvider = {
  provide: AbstractInfosourceService,
  useFactory: infosourceServiceFactory,
  deps: [
    AuthService,
    InfosourceApi,
    InfosourceAdminApi
  ]
};
