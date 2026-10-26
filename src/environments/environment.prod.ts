import { environment as base } from './environment.default';

const origin = typeof window !== 'undefined' ? window.location.origin : '';
const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const environment = {
  ...base,
  basePortalUrl: `${origin}/`,
  baseApiUrl: `${origin}/`,
  baseAdminApiUrl: `${origin}/admin-api/`,
  baseSecuredApiUrl: `${origin}/secured-api/`,
  baseMapKey: `${origin}/geoserver/pisac_shn/wms`,
  baseMapKeyForShomService: `${origin}/geoserver/pisac_shn/wms`,

  production: true,
  enableSurveyModule: 'true',

  keycloak: {
    ...base.keycloak,
    rootUrl: `${protocol}//${hostname}:8180`,
    redirectUri: {
      default: `${origin}/`
    }
  },

  carto: {
    ...base.carto,
    getCapBaseMapUrl: `${origin}/geoserver/gwc/service/wmts?request=GetCapabilities`,
    baseLayerId: 'pisac_shn:cartografia_ve',
    westAfricaRasterMarineId: 'pisac_shn:cartografia_ve',
    defaultCenter: [-66.60, 10.90],
    defaultZoom: 8.1,
    localWmsUrl: `${origin}/geoserver/pisac_shn/wms`,
    layerRegionalEsequiba: 'pisac_shn:VE300700',
    layerDetalleLocal: 'pisac_shn:cartografia_costera_ve',
    detalleMinZoom: 11,
    localWfsUrl: `${origin}/geoserver/pisac_shn/wfs`
  },
  wmts: {
    baseUrl: `${origin}/geoserver/gwc/service/wmts`,
    layerName: 'pisac_shn:cartografia_ve',
    matrixSet: 'EPSG:900913',
    format: 'image/png',
    style: ''
  }
};