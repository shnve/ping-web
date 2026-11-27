import { environment as base } from './environment.default';

const origin = typeof window !== 'undefined' ? window.location.origin : '';

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
    // PISAC: Keycloak servido detrás de Nginx en /auth (mismo origen que el portal, sin exponer :8180)
    rootUrl: `${origin}/auth`,
    redirectUri: {
      default: `${origin}/`
    }
  },

  carto: {
    ...base.carto,
    getCapBaseMapUrl: `${origin}/geoserver/gwc/service/wmts?request=GetCapabilities`,
    baseLayerId: 'pisac_shn:cartografia_ve',
    pdfLayerId: 'pisac_shn:cartografia_ve_pdf',
    westAfricaRasterMarineId: 'pisac_shn:cartografia_ve',
    defaultCenter: [-66.00, 12.45],
    defaultZoom: 7.1,
    localWmsUrl: `${origin}/geoserver/pisac_shn/wms`,
    layerRegionalEsequiba: 'pisac_shn:VE300700',
    layerDetalleLocal: 'pisac_shn:cartografia_costera_ve',
    detalleMinZoom: 11,
    localWfsUrl: `${origin}/geoserver/pisac_shn/wfs`,
    mapDataUrl: `${origin}/map/`
  },
  wmts: {
    baseUrl: `${origin}/geoserver/gwc/service/wmts`,
    layerName: 'pisac_shn:cartografia_ve',
    matrixSet: 'EPSG:900913',
    format: 'image/png',
    style: ''
  }
};