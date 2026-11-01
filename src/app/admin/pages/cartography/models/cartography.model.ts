export interface CartographyBand {
  id: string;
  code: string;
  name: string;
  scaleDescription: string;
  layerName: string;
  storageFolder: string;
  colorBadge: string;
  storeType: 'GeoTIFF' | 'ImageMosaic';
  isSingleChart: boolean;
}

export type CartographyFileStatus =
  | 'QUEUED'
  | 'UPLOADING'
  | 'VALIDATING'
  | 'CONVERTING'
  | 'DEPLOYING'
  | 'SUCCESS'
  | 'ERROR';

export interface CartographyFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  format: 'pdf' | 'tiff';
  targetBand: string;
  status: CartographyFileStatus;
  progress: number;
  message?: string;
  details?: {
    srsDetected?: string;
    isGeoreferenced?: boolean;
    pixelSize?: string;
    convertedSize?: number;
    processingTimeMs?: number;
    errorDetails?: string;
  };
}

export interface CartographyConversionResponse {
  success: boolean;
  fileName: string;
  band: string;
  message: string;
  srsDetected?: string;
  isGeoreferenced?: boolean;
  outputFilePath?: string;
  geoserverReloaded?: boolean;
  /** Resultado real de la publicación en GeoServer (capa, estilo, grupo y verificación). */
  geoserverPublished?: boolean;
  geoserverMessage?: string;
  geoserverSteps?: string[];
  error?: string;
  convertedSizeBytes?: number;
  processingTimeMs?: number;
  pixelSize?: string;
}

export type CartographyJobStatus = 'QUEUED' | 'VALIDATING' | 'CONVERTING' | 'PUBLISHING' | 'SUCCESS' | 'ERROR';

/** Trabajo de procesamiento de carta en segundo plano. */
export interface CartographyJob {
  jobId: string;
  fileName: string;
  band: string;
  status: CartographyJobStatus;
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  result?: CartographyConversionResponse;
}

export const CARTOGRAPHY_BANDS: CartographyBand[] = [
  {
    id: 'banda1',
    code: 'Banda 1',
    name: 'Banda 1 - Resumen General',
    scaleDescription: 'Escala menor que 1:3.500.000 (zoom web 0-7)',
    layerName: 'pisac_shn:banda1',
    storageFolder: '/mnt/geotiff/banda1',
    colorBadge: '#1e3a8a',
    storeType: 'GeoTIFF',
    isSingleChart: true
  },
  {
    id: 'banda2',
    code: 'Banda 2',
    name: 'Banda 2 - Navegación General',
    scaleDescription: 'Escala 1:1.500.000 a 1:350.000 (zoom web 8-10)',
    layerName: 'pisac_shn:banda2',
    storageFolder: '/mnt/geotiff/banda2',
    colorBadge: '#0284c7',
    storeType: 'GeoTIFF',
    isSingleChart: true
  },
  {
    id: 'banda3',
    code: 'Banda 3',
    name: 'Banda 3 - Costera',
    scaleDescription: 'Escala 1:350.000 a 1:90.000 (zoom web 11-12)',
    layerName: 'pisac_shn:banda3',
    storageFolder: '/mnt/geotiff/banda3',
    colorBadge: '#0d9488',
    storeType: 'ImageMosaic',
    isSingleChart: false
  },
  {
    id: 'banda4',
    code: 'Banda 4',
    name: 'Banda 4 - Aproximación',
    scaleDescription: 'Escala 1:90.000 a 1:25.000 (zoom web 13-14)',
    layerName: 'pisac_shn:banda4',
    storageFolder: '/mnt/geotiff/banda4',
    colorBadge: '#16a34a',
    storeType: 'ImageMosaic',
    isSingleChart: false
  },
  {
    id: 'banda5',
    code: 'Banda 5',
    name: 'Banda 5 - Puerto',
    scaleDescription: 'Escala 1:25.000 a 1:4.000 (zoom web 15-17)',
    layerName: 'pisac_shn:banda5',
    storageFolder: '/mnt/geotiff/banda5',
    colorBadge: '#ea580c',
    storeType: 'ImageMosaic',
    isSingleChart: false
  },
  {
    id: 'banda6',
    code: 'Banda 6',
    name: 'Banda 6 - Atraque y Fondeo',
    scaleDescription: 'Escala mayor que 1:4.000 (zoom web 18+)',
    layerName: 'pisac_shn:banda6',
    storageFolder: '/mnt/geotiff/banda6',
    colorBadge: '#9333ea',
    storeType: 'ImageMosaic',
    isSingleChart: false
  }
];
