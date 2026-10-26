import { environment as base } from './environment.default';

export const environment = {
    ...base,
    basePortalUrl: 'http://localhost:4200/',
    baseApiUrl: 'http://localhost:8080/',
    baseAdminApiUrl: 'http://localhost:8080/admin-api/',
    baseSecuredApiUrl: 'http://localhost:8080/secured-api/',
    enableSurveyModule: 'true',
    production: false,
    baseMapKey: 'http://localhost:8082/geoserver/shn_124/wms',
    baseMapKeyForShomService: 'http://localhost:8082/geoserver/shn_124/wms',
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
        defaultCenter: [-69.2, 11.5],

        // Configuracion Hibrida WMS y WFS
        localWmsUrl: 'http://localhost:8082/geoserver/pisac_shn/wms',
        localWfsUrl: 'http://localhost:8082/geoserver/pisac_shn/wfs'
    },
    wmts: {
        baseUrl: 'http://localhost:8082/geoserver/gwc/service/wmts',
        layerName: 'pisac_shn:cartografia_ve', // Valor por defecto temporal
        matrixSet: 'EPSG:900913',
        style: '',
        format: 'image/png'
    }
};