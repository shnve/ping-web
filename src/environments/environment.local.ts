import { environment as base } from './environment.default';


export const environment = {
  ...base,
  basePortalUrl: 'http://localhost:4200/',
  baseApiUrl: 'http://localhost:8080/',
  baseAdminApiUrl: 'http://localhost:8080/admin-api/',
  baseSecuredApiUrl: 'http://localhost:8080/secured-api/',
  baseMapKey: 'XXXX',
  baseMapKeyForShomService: 'XXXX',
  enableSurveyModule: 'true',
  production: false,
  keycloak: {
    ...base.keycloak,
    rootUrl: 'http://localhost:8082',
    redirectUri: {
      default: 'http://localhost:4200'
    }
  }
};
