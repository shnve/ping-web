import { environment as base } from './environment.default';

export const environment = {
  ...base,
  basePortalUrl: 'http://localhost:4200/',
  baseApiUrl: 'http://localhost:8080/',
  baseAdminApiUrl: 'http://localhost:8080/admin-api/',
  baseSecuredApiUrl: 'http://localhost:8080/secured-api/',
  enableSurveyModule: 'true',
  production: false,
  baseMapKey: 'http://localhost:8082/geoserver/sh1_124/wms',
  baseMapKeyForShomService: 'http://localhost:8082/geoserver/sh1_124/wms',
  keycloak: {
    ...base.keycloak,
    rootUrl: 'http://localhost:8180', // O el puerto que tengas para keycloak
    redirectUri: {
      default: 'http://localhost:4200'
    }
  },
  // AQUÃ ESTÃ LA MAGIA: Sobreescribimos la ofuscaciÃ³n del Shom
  carto: {
    ...base.carto,
    // 1. Apuntamos al WMTS nativo de GeoServer (esto ignora el {{key}} problemÃ¡tico)
    getCapBaseMapUrl: 'http://localhost:8082/geoserver/gwc/service/wmts?request=GetCapabilities',

    // 2. Le decimos a PING exactamente quÃ© capa buscar dentro del XML que descargarÃ¡
    baseLayerId: 'pisac_shn:cartografia_ve',
    westAfricaRasterMarineId: 'pisac_shn:cartografia_ve',

    // 3. Centramos la cÃ¡mara en Venezuela por defecto (Longitud, Latitud)
    defaultCenter: [-66.60, 10.90],
    defaultZoom: 8.1,

    // Configuracion Hibrida WMS
    localWmsUrl: 'http://localhost:8082/geoserver/pisac_shn/wms',
    layerRegionalEsequiba: 'pisac_shn:VE300700',
    layerDetalleLocal: 'pisac_shn:cartografia_costera_ve',
    detalleMinZoom: 11,
    localWfsUrl: 'http://localhost:8082/geoserver/pisac_shn/wfs'
  }
};