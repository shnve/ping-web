import { AuthService } from '@app/auth/auth.service';
import { GeoregulationAdminApi } from '@app/georegulation/api/georegulation-admin.api';
import { GeoregulationAdminService } from '@app/georegulation/services/georegulation-admin.service';
import { GeoregulationApi } from '../api/georegulation.api';
import { AbstractGeoregulationService } from '../services/abstract-georegulation.service';
import { GeoregulationService } from '../services/georegulation.service';

const georegulationServiceFactory = (
  authService: AuthService,
  georegulationApi: GeoregulationApi,
  georegulationAdminApi: GeoregulationAdminApi) => {
  if (!authService.isLoggedIn() || authService.isPublicUser()) {
    return new GeoregulationService(georegulationApi);
  }
  return new GeoregulationAdminService(georegulationAdminApi);
};

export const georegulationServiceProvider = {
  provide: AbstractGeoregulationService,
  useFactory: georegulationServiceFactory,
  deps: [
    AuthService,
    GeoregulationApi,
    GeoregulationAdminApi
  ]
};
