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
  error?: string;
  convertedSizeBytes?: number;
  processingTimeMs?: number;
  pixelSize?: string;
}

export const CARTOGRAPHY_BANDS: CartographyBand[] = [
  {
    id: 'banda1',
    code: 'Banda 1',
    name: 'Banda 1 - Resumen General',
    scaleDescription: 'Escala 1:1.500.000 y menores (Visión oceánica y regional)',
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
    scaleDescription: 'Escala 1:500.000 a 1:1.500.000 (Rutas de navegación)',
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
    scaleDescription: 'Escala 1:150.000 a 1:500.000 (Aguas territoriales y costas)',
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
    scaleDescription: 'Escala 1:50.000 a 1:150.000 (Canales y accesos marítimos)',
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
    scaleDescription: 'Escala 1:10.000 a 1:50.000 (Bahías, dársenas e instalaciones portuarias)',
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
    scaleDescription: 'Escala mayor a 1:10.000 (Terminales, muelles y fondeaderos)',
    layerName: 'pisac_shn:banda6',
    storageFolder: '/mnt/geotiff/banda6',
    colorBadge: '#9333ea',
    storeType: 'ImageMosaic',
    isSingleChart: false
  }
];
