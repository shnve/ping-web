import { environment as base } from './environment.default';


export const environment = {
  ...base,
  basePortalUrl: '<%= @replace_string[BASE_PORTAL_URL] %>',
  baseApiUrl: '<%= @replace_string[BASE_API_URL] %>',
  baseAdminApiUrl: '<%= @replace_string[BASE_API_URL] %>admin-api/',
  baseSecuredApiUrl: '<%= @replace_string[BASE_API_URL] %>secured-api/',
  baseMapKey: '<%= @replace_string[BASE_MAP_KEY] %>',
  baseMapKeyForShomService: '<%= @replace_string[BASE_MAP_KEY_FOR_SHOM_SERVICE] %>',
  production: true,
  enableSurveyModule: '<%= @replace_string[ENABLE_SURVEY_MODULE] %>',
  keycloak: {
    ...base.keycloak,
    rootUrl: '<%= @replace_string[KEYCLOAK_ROOT_URL] %>',
    redirectUri: {
      default: '<%= @replace_string[KEYCLOAK_REDIRECT_URI_DEFAULT] %>'
    }
  },
  carto: {
    ...base.carto,
    getWmsImage: {
      ...base.carto.getWmsImage,
      url: '<%= @replace_string[BASE_API_URL] %>geoserver/wms'
    }
  }
};
