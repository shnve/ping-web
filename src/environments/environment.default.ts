import packageInfo from '../../package.json';

/**
 * Default environment contains all environment keys/value.
 * If a key is not defined in an inheriting environment, the value will be which is defined in this file
 */
export const environment = {
  production: false,
  availableLanguages: ['es', 'en'],
  defaultLanguage: 'es',
  defaultToasterLifetimeInMilliseconds: 10000,
  sseEventsTimeout: 900000,
  sseHeartbeatTimeout: 35000,
  xsrfHeaderName: 'X-XSRF-TOKEN',
  emailRegexPattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
  staticPagePathRegexPattern: '^[a-z\\d-]+$',
  staticFilePathRegexPattern: '^[a-z\\d-]+$',
  kmlFixRegexPatternId: '<Placemark[^>]*?(/?)>',
  infosourceTruncatedDescriptionLength: 60,
  georegulationSharedUrlContext: 'georegulation-visu',
  warningsSharedUrlContext: 'avurnav-notice',
  infosourcesSharedUrlContext: 'infosource/tables',
  folderSharedUrlContext: 'folder/tables',
  followedFolderSharedUrlContext: 'folder/followed',
  surveySharedUrlContext: 'survey/tables',
  enableBathyDangersIntegration: false,
  enableSurveyModule: 'false',
  minYearForWarningNumber: 2000,
  tableDefaultRowsCount: 20,
  tableRowsPerPageOptions: [5, 10, 15, 20],
  staticPageEditorConfig: {
    height: '320px',
    styleTags: ['p', 'h1', 'h2', 'h3'],
    toolbar: [
      ['para', ['style', 'ul', 'ol', 'paragraph']],
      ['fontsize', ['fontsize', 'color']],
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['insert', ['picture', 'link', 'hr']],
      ['misc', ['codeview', 'undo', 'redo']]
    ]
  },
  staticLogoFormConfig: {
    minHeight: 5,
    maxHeight: 500
  },
  carto: {
    defaultCenter: [-4.28, 48.2],
    projection: 'EPSG:3857',
    defaultZoom: 5,
    defaultRadiusForPointExtent: 16,
    baseLayerId: 'XXXX',
    rasterMarineLayerName: 'Raster Marine',
    westAfricaRasterMarineId: 'XXXX',
    westAfricaRasterMarineLayerName: 'Assemblage des cartes marines Afrique de l\'Ouest',
    detectionLayerOpacity: 0.9,
    getCapBaseMapUrl: 'https://XXXX/{{key}}/wmts?service=wmts&version=1.0.0&request=GetCapabilities',
    getWmsImage: {
      url: 'https://XXXX/geoserver/wms',
      ratio: 1,
      layers: {
        subAreasParents: 'ping:sub_areas_parents',
        subAreasSeries: 'ping:sub_areas_series',
        viewParamsSerieNamePrefix: 'SERIE_NAME:'
      }
    },
    getCswImage: {
      url: 'https://XXXX/{{key}}/wms/v',
      name: 'ZONEX'
    },
    circleDistanceUnit: {
      kilometers: 'km',
      meters: 'm',
      nauticMiles: 'NM'
    },
    drawingModule: {
      drawingLayerZindex: 1000,
      polygonMaxVerticesForIsBathy: 4,
      centerTool: {
        paddingLeft: 50,
        paddingTop: 30,
        paddingRight: 50,
        paddingBottom: 30,
        maxZoom: 12
      },
      formatFunction: {
        kilometersFractionDigits: 3,
        milesNautiqueFractionDigits: 3
      }
    },
    measurementModule: {
      formatFunction: {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }
    },
    aggregation: {
      distance: 40,
      maxZoomLevel: 10,
      feautreExtentSizeMuliplier: 1
    },
    polygonFromCircleSides: 64,
    availableTools: {
      forGeometryMode: ['point', 'path', 'polygon', 'circle', 'dragging', 'center'],
      forAffectedArea: ['polygon', 'circle', 'dragging', 'center']

    },
    kmlImport: {
      acceptableFileExtensions: '.kml,.xml'
    },
    legendUrl: '/static/legende',
    mapDataUrl: '/map/'
  },
  api: {
    areas: 'api/areas',
    epsgGeometric: 'api/epsg/geometric',
    epsgProjection: 'api/epsg/projection',
    maritimeEntities: 'api/maritime-entities',
    maritimeServices: 'api/maritime-services',
    subAreas: 'api/sub-areas',
    warnings: {
      list: 'api/warnings',
      map: 'api/warnings/map',
      tableView: 'api/warnings/table',
      detailedTableView: 'api/warnings/detailed-table',
      downloadGeometries: 'api/warnings/{{id}}/geometries/{{format}}?lang={{lang}}',
      downloadS124: 'nw/v1/Get_NW_Message',
      downloadS124Messages: 'nw/v1/Get_NW_Messages',
      downloadGpxZip: 'api/warnings/download-gpx-zip'
    },
    series: 'api/series',
    users: 'api/users',
    maritimeServiceTypes: 'api/maritime-service-types',
    staticPage: 'api/static-pages',
    staticFile: {
      download: 'api/static-file/{{path}}'
    },
    attachments: {
      uploadChunk: 'attachments/chunk',
      chunkSize: 4 * 1024 * 1024,
      delete: 'attachments/{{id}}',
      create: 'attachments',
      download: 'attachments/{{id}}',
      maxFileSize: 5000000,
      fileTypes: '.csv,.xyz,.pts,.lgz,.glz,.asc,.rar,.dat,.csar,.LAS,.odt,.ods,.gml,.gpkg,.dxf,.dwg,.tiff,.docx,.xlsx,.pptx,.doc,.xls,.ppt,.tar,.7z,.zip,.gz,.eml,.pdf,.txt,.xml,.svg,.jpg,.png,.gif,.jfif,.kml,.shp,.gpx,.dbf,.shx,.sbn,.sbx,.fbn,.fbx,.ain,.aih,.prj,.shp.xml,.atx,.ixs,.mxs,.cpg,.qix',
      checkFileRequirements: 'attachments/check-file-requirements?filename={{filename}}&fileSize={{fileSize}}&isBathy={{isBathy}}&isSurvey={{isSurvey}}&isTechnicalMetadata={{isTechnicalMetadata}}',
      downloadPublicFileByNotionType: 'api/attachments/{{id}}?notionType={{notionType}}&notionItemId={{notionItemId}}'
    },
    georegulations: {
      modalDetails: 'api/georegulations/{{id}}/modal-details',
      map: 'api/georegulations/map',
      downloadGeometries: 'api/georegulations/{{id}}/geometries/{{format}}?lang={{lang}}'
    },
    events: {
      securedApi: 'secured-api/events?userId={{userId}}',
      adminApi: 'admin-api/events?userId={{userId}}'
    },
    staticSection: {
      findByKey: 'api/static-sections'
    },
    staticLogo: {
      findByKey: 'api/static-logos'
    }
  },
  securedApi: {
    userEnable: 'secured-api/users/enable',
    userMe: 'secured-api/users/me',
    userUpdate: 'secured-api/users',
    resetPassword: 'secured-api/users/reset-password',
    infosources: {
      create: 'infosources',
      update: 'infosources',
      tableView: 'infosources',
      getDetailsById: 'infosources/{{id}}/details-view',
      send: 'infosources/{{id}}/send',
      getStatusByService: 'infosources/{{id}}/service-statuses',
      getInfosourceReportById: 'infosources/{{id}}',
      delete: 'infosources/{{id}}'
    },
    notifications: {
      findAll: 'notifications',
      updateReadStatus: 'notifications/update',
      delete: 'notifications/delete'
    },
    surveys: {
      tableView: 'surveys',
      createOrUpdateDeposit: 'surveys/deposit',
      createOrUpdateTest: 'surveys/notdeposit',
      getSurveyModalById: 'surveys/{{id}}/details-view',
      clone: 'surveys/{{id}}/clone',
      deleteDeposit: 'surveys/deposit/{{id}}',
      report: 'surveys/{{id}}/report'
    }
  },
  adminApi: {
    userMe: 'admin-api/users/me',
    maritimeEntities: 'admin-api/maritime-entities',
    getAvailableEntitiesToLink: 'admin-api/maritime-entities/available-entities-to-link?serieId={{serieId}}',
    areas: 'admin-api/areas',
    maritimeServices: 'admin-api/maritime-services',
    getAvailableAuthorities: 'admin-api/maritime-services/{{serviceId}}/authorities',
    maritimeServiceTags: 'maritime-service-tags',
    maritimeEntityReference: 'maritime-entity-references',
    warningLinks: 'warning-links',
    subAreas: 'admin-api/sub-areas',
    addLocality: 'admin-api/sub-areas/{{parentSubAreaId}}/localities',
    series: 'series',
    entitiesManagedOrObservedToDisplayOnMap: 'maritime-entities/entities-managed-or-observed',
    seriesByUser: 'admin-api/series/by-user',
    isWarningNumberAvailable: 'admin-api/series/{{serieId}}/isWarningNumberAvailable',
    nextAvailableNumber: 'admin-api/series/{{serieId}}/nextAvailableNumber',
    serviceUsers: 'admin-api/service-users',
    proUser: 'admin-api/users',
    staticPage: {
      crud: 'admin-api/static-pages'
    },
    staticFile: {
      crud: 'static-file'
    },
    staticSection: {
      crud: 'admin-api/static-sections'
    },
    publicUsers: 'admin-api/public-users',
    warnings: {
      tableView: 'warnings',
      create: 'warnings',
      one: 'warnings/{{warningId}}',
      get: 'warnings/{{id}}/details-view',
      cancellable: 'warnings/cancellable',
      replaceable: 'warnings/replaceable',
      referenceable: 'warnings/referenceable',
      publish: 'warnings/{{id}}/publish',
      delete: 'warnings/{{id}}',
      cancel: 'warnings/{{id}}/cancel',
      clone: 'warnings/{{id}}/clone',
      telex: 'warnings/{{id}}/telex',
      navtex: 'warnings/{{id}}/navtex',
      entitiesToFilter: 'warnings/entities-to-filter',
      entitiesManagedOrObservedToFilter: 'warnings/entities-managed-or-observed-to-filter',
      linkedEntitiesForCoverFiltering: 'warnings/linked-entities',
      foldersToFilter: 'warnings/folders-to-filter',
      setReviewed: 'warnings/{{id}}/set-reviewed',
      getAvailableAttachmentsToLinkAsWarningReference: 'warnings/available-attachments-to-link-as-reference',
      getAvailableEntitiesReferencesToLinkAsWarningReference: 'warnings/available-entities-references-to-link-as-reference',
      getAvailableWarningsReferencesAsPublicReference: 'warnings/available-warnings-references-to-link-as-reference',
      getWarningIdsWhichCanBeCancelled: 'warnings/get-warning-ids-which-can-be-cancelled'
    },
    subscriptions: {
      tableView: 'subscriptions',
      createWarning: 'subscriptions/warning',
      createGeoregulation: 'subscriptions/georegulation',
      getDetailsById: 'subscriptions/{{id}}',
      delete: 'subscriptions/{{id}}'
    },
    infosources: {
      create: 'infosources',
      update: 'infosources',
      tableView: 'infosources',
      getDetailsById: 'infosources/{{id}}/details-view',
      reject: 'infosources/{{id}}/reject',
      send: 'infosources/{{id}}/send',
      getRoutingServices: 'infosources/{{id}}/routing-services',
      getStatusByService: 'infosources/{{id}}/service-statuses',
      apiUpdateServiceStatus: 'infosources/{{id}}/service-statuses',
      apiGetTransferableServices: 'infosources/{{id}}/transferable-services',
      apiTransfer: 'infosources/{{id}}/transfer',
      apiClone: 'infosources/{{id}}/clone',
      getRecipientsFromSentInfosources: 'infosources/available-recipients-sent?issuingServiceId={{issuingServiceId}}&state={{infosourceState}}',
      getInfosourceReportById: 'infosources/{{id}}',
      createWarning: 'infosources/{{id}}/create-warning?serieId={{serieId}}&copyDataFromInfosource={{copyDataFromInfosource}}',
      getAvailableInfosourcesToLink: 'infosources/available-infosources-to-link?serieId={{serieId}}',
      getAvailableEntitiesForCreation: 'infosources/available-entities-for-creation?serviceId={{serviceId}}',
      getTagsFromInfosources: 'infosources/available-tags?issuingServiceId={{issuingServiceId}}&state={{infosourceState}}',
      delete: 'infosources/{{id}}',
      linkTagsToInfosource: 'infosources/{{id}}/tags',
      getTagsIdsFromInfosourceId: 'infosources/{{id}}/tags'
    },
    folders: {
      tableView: 'folders',
      getById: 'folders/{{id}}',
      getDetailById: 'folders/{{id}}/details',
      create: 'folders',
      update: 'folders/{{id}}',
      delete: 'folders/{{id}}',
      getAvailableByNotion: 'folders/available-by-notion?notionId={{notionId}}&type={{type}}',
      addFolderToNotion: 'folders/{{id}}/notions?notionId={{notionId}}&type={{type}}',
      removeNotionFromFolder: 'folders/{{id}}/notions/{{notionId}}',
      addAttachmentToFolder: 'folders/{{id}}/attachment',
      updateFolderAttachment: 'folders/attachment/{{folderAttachmentId}}',
      deleteAttachmentFromFolder: 'folders/attachment/{{folderAttachmentId}}',
      clone: 'folders/{{id}}/clone',
      notify: 'folders/{{id}}/notify',
      getAvailableMaritimeServicesToFollow: 'folders/available-maritime-services?folderId={{folderId}}',
      follow: 'folders/{{id}}/follow',
      unFollow: 'folders/{{id}}/un-follow?serviceId={{serviceId}}'
    },
    studies: {
      create: 'studies',
      updateStatus: 'studies/{{id}}/status',
      delete: 'studies/{{id}}'
    },
    georegulations: {
      createOrUpdate: 'georegulations',
      getGeoregulationsByTypeForCreationMap: 'georegulations/for-creation-map',
      tableView: 'georegulations',
      authoritiesToSelect: 'georegulations/authorities-to-select',
      authoritiesToFilter: 'georegulations/authorities-to-filter',
      entitiesToFilter: 'georegulations/entities-to-filter',
      modalDetails: 'georegulations/{{id}}/modal-details',
      publish: 'georegulations/{{id}}/publish',
      repeal: 'georegulations/{{id}}/repeal',
      getRecipients: 'georegulations/{{id}}/recipients',
      send: 'georegulations/{{id}}/send',
      byId: 'georegulations/{{id}}',
      getAvailableGeoregulationsToLink: 'georegulations/available-georegulations-to-link',
      updateSummary: 'georegulations/{{id}}/summary-and-restriction-categories',
      delete: 'georegulations/{{id}}',
      clone: 'georegulations/{{id}}/clone',
      getAvailableGeoregulationsToLinkAsWarningReference: 'georegulations/available-georegulations-to-link-as-reference',
    },
    attachments: {
      uploadChunk: 'attachments/chunk',
      delete: 'attachments/{{id}}',
      create: 'attachments',
      download: 'attachments/{{id}}',
      maxFileSize: 5000000,
      fileTypes: 'image/*,.csv,.pdf'
    },
    notifications: {
      findAll: 'notifications',
      updateReadStatus: 'notifications/update',
      delete: 'notifications/delete'
    },
    staticLogo: {
      crud: 'admin-api/static-logos'
    },
    surveys: {
      tableView: 'surveys',
      createOrUpdateDeposit: 'surveys/deposit',
      createOrUpdateTest: 'surveys/notdeposit',
      getSurveyModalById: 'surveys/{{id}}/details-view',
      clone: 'surveys/{{id}}/clone',
      deleteDeposit: 'surveys/deposit/{{id}}',
      report: 'surveys/{{id}}/report',
      transmitDeposit: 'surveys/{{id}}/transmit',
      download: 'surveys/{{id}}/download',
      updateBriInternalComment: 'surveys/{{id}}/comment'
    }
  },
  keycloak: {
    urlLogin: '{{root_url}}/realms/{{realm}}/protocol/openid-connect/auth?client_id=ping-web&response_type=code&state={{state}}&nonce={{nonce}}&redirect_uri={{redirect_uri}}&ui_locales={{lang}}&scope=openid',
    urlLogout: '{{root_url}}/realms/{{realm}}/protocol/openid-connect/logout?id_token_hint={{id_token_hint}}&post_logout_redirect_uri={{redirect_uri}}&ui_locales={{lang}}',
    urlToken: '{{root_url}}/realms/{{realm}}/protocol/openid-connect/token',
    publicRealm: 'ping-public',
    proRealm: 'ping-pro',
    clientId: 'ping-web',
    authMethod: {
      code: 'authorization_code'
    }
  },
  survey: {
    attachments: {
      maxFileSize: 10 * 1024 * 1024 * 1024,
      misc: {
        fileTypes: '.csv,.txt,.xyz,.pts,.lgz,.glz,.asc,.zip,.7z,.gz,.rar,.dat,.csar,.LAS,.pdf,.xls,.xlsx,.doc,.docx,.odt,.ods,.gml,.shp,.gpkg,.dxf,.dwg,.tiff,.png'
      },
      bathy: {
        fileTypes: '.csv,.txt,.xyz,.pts,.lgz,.glz,.asc,.zip,.7z,.gz,.rar,.dat'
      }
    }
  },
  templates: {
    information: {
      warning: {
        informationRootTranslationKey: 'admin-warning.creation.parts.information.templates.',
        informationChildrenTranslationsKeys: [
          'currentWarning', 'noOtherWarning', 'category', 'published', 'fullPeriods', 'startPeriod', 'endPeriod', 'autoCancellation',
          'polylineWithoutLabel', 'polylineWithLabel', 'polygonWithoutLabel', 'polygonWithLabel',
          'polygonWithoutLabelAffected', 'polygonWithLabelAffected', 'circleWithoutLabelInNq', 'circleWithLabelInNq',
          'circleWithoutLabelInNqAffected', 'circleWithLabelInNqAffected', 'bathy.polygon.withDepthAndZ', 'bathy.polygon.withObstructionAndZ',
          'bathy.polygon.withDepthWithoutZ', 'bathy.polygon.withObstructionWithoutZ', 'bathy.point.withDepthAndZ', 'bathy.point.withShoalAndZ', 'bathy.point.withWreckAndZ',
          'bathy.point.withObstructionAndZ', 'bathy.point.withDepthWithoutZ', 'bathy.point.withShoalWithoutZ', 'bathy.point.withWreckWithoutZ', 'bathy.point.withObstructionWithoutZ',
          'bathy.circle.withDepthAndZ', 'bathy.circle.withObstructionAndZ', 'bathy.circle.withDepthWithoutZ', 'bathy.circle.withObstructionWithoutZ'
        ]
      },
      infosource: {
        informationRootTranslationKey: 'infosource.information.templates.',
        informationChildrenTranslationsKeys: [
          'fullPeriods', 'startPeriod', 'endPeriod',
          'polylineWithoutLabel', 'polylineWithLabel', 'polygonWithoutLabel', 'polygonWithLabel',
          'circleWithoutLabelInNq', 'circleWithLabelInNq'
        ]
      },
      georegulation: {
        informationRootTranslationKey: 'georegulation.information.templates.',
        informationChildrenTranslationsKeys: [
          'polylineWithoutLabel', 'polylineWithLabel', 'polygonWithoutLabel', 'polygonWithLabel',
          'circleWithoutLabelInNq', 'circleWithLabelInNq'
        ]
      }
    }
  },
  version: packageInfo.version,
  wmts: {
    baseUrl: 'http://localhost:8082/geoserver/gwc/service/wmts',
    layerName: 'pisac_shn:cartografia_ve',
    matrixSet: 'EPSG:900913',
    style: '',
    format: 'image/png'
  },
  localStorageKey: 'XXXX',
  loadingSpinnerTimeout: 200
};
