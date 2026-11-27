import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Extent } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';

/** Tupla [banda, minLon, minLat, maxLon, maxLat] en grados WGS84. */
export type BandExtentTuple = [number, number, number, number, number];

/** Margen limpio de encuadre para polígonos, líneas y áreas en el PDF (reemplaza el antiguo 1.8x + 50 px). */
export const PDF_GEOMETRY_EXTENT_MULTIPLIER = 1.25;

/** Escala óptima de encuadre en el PDF para puntos o áreas diminutas según la banda más detallada disponible. */
const OPTIMAL_SCALE_BY_BAND: Record<number, number> = {
  6: 5000,
  5: 18000,
  4: 55000,
  3: 180000,
  2: 600000
};

const BAND_EXTENTS_TIMEOUT_MS = 1500;
const WMS_GETMAP_TIMEOUT_MS = 4000;

@Injectable({
  providedIn: 'root'
})
export class NauticalCartographyService {
  private static bandExtentsPromise: Promise<BandExtentTuple[]> | null = null;

  constructor() { }

  /**
   * Crea un VectorSource para consumir una capa WFS de GeoServer
   * utilizando la estrategia de carga por bbox para optimizar la red.
   */
  public getWfsDetailsSource(): VectorSource {
    const geoServerWfsUrl = environment.carto['localWfsUrl'] || 'http://localhost:8082/geoserver/pisac_shn/wfs';

    return new VectorSource({
      format: new GeoJSON(),
      url: (extent) => {
        return `${geoServerWfsUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=pisac_shn:detalles_wfs&outputFormat=application/json&srsname=EPSG:4326&bbox=${extent.join(',')},EPSG:4326`;
      },
      strategy: bboxStrategy
    });
  }

  /**
   * Carga una sola vez por sesión el índice liviano de cobertura por banda (~2-4 KB JSON) desde ping-api.
   * Si el backend no responde a tiempo, devuelve arreglo vacío sin bloquear la generación del PDF.
   */
  public getBandExtents(): Promise<BandExtentTuple[]> {
    if (!NauticalCartographyService.bandExtentsPromise) {
      const baseApi = (environment as any).baseApiUrl || '/';
      const normalizedBase = baseApi.endsWith('/') ? baseApi : `${baseApi}/`;
      const endpoint = (environment.api as any)?.cartography?.bandExtents || 'api/cartography/band-extents';
      const url = `${normalizedBase}${endpoint.replace(/^\/+/, '')}`;

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), BAND_EXTENTS_TIMEOUT_MS) : null;

      NauticalCartographyService.bandExtentsPromise = fetch(url, {
        method: 'GET',
        signal: controller?.signal
      })
        .then(resp => (resp.ok ? resp.json() : Promise.reject(new Error(`HTTP ${resp.status}`))))
        .then((data: unknown) => {
          if (timer) { clearTimeout(timer); }
          if (!Array.isArray(data)) {
            return [] as BandExtentTuple[];
          }
          return data.filter(
            (row): row is BandExtentTuple =>
              Array.isArray(row) && row.length >= 5 && row.every(v => typeof v === 'number' && Number.isFinite(v))
          );
        })
        .catch(() => {
          if (timer) { clearTimeout(timer); }
          // Permitir reintento posterior si el primer intento falló
          NauticalCartographyService.bandExtentsPromise = null;
          return [] as BandExtentTuple[];
        });
    }
    return NauticalCartographyService.bandExtentsPromise;
  }

  /**
   * Detecta en 0 ms (en memoria) cuál es la banda más detallada (6 > 5 > 4 > 3 > 2) cuya cobertura
   * intersecta la coordenada o extensión WGS84 del aviso. Si cae en altamar fuera de 3..6, devuelve 2.
   */
  public findHighestCoveringBand(
    minLon: number,
    minLat: number,
    maxLon: number,
    maxLat: number,
    extents: BandExtentTuple[]
  ): number {
    let highest = 2;
    for (const [band, eMinLon, eMinLat, eMaxLon, eMaxLat] of extents) {
      if (band <= highest) {
        continue;
      }
      if (minLon <= eMaxLon && maxLon >= eMinLon && minLat <= eMaxLat && maxLat >= eMinLat) {
        highest = band;
        if (highest >= 6) {
          return 6;
        }
      }
    }
    return highest;
  }

  public getOptimalScaleForBand(band: number): number {
    if (band >= 6) { return OPTIMAL_SCALE_BY_BAND[6]; }
    if (band <= 2) { return OPTIMAL_SCALE_BY_BAND[2]; }
    return OPTIMAL_SCALE_BY_BAND[band] ?? OPTIMAL_SCALE_BY_BAND[2];
  }

  /**
   * Calcula el BBOX exacto en EPSG:3857 para la imagen del PDF:
   * - Polígono / línea / área amplia: margen limpio de 1.25x (sin doble relleno 1.8x + 50 px).
   * - Punto o área diminuta: ajusta al radio de escala óptima según la banda más alta presente
   *   (Banda 6 -> 1:5.000, Banda 5 -> 1:18.000, Banda 4 -> 1:55.000, Banda 3 -> 1:180.000, Banda 2 -> 1:600.000).
   */
  public computePdfExtent3857(
    rawExtent3857: Extent,
    widthPx: number,
    heightPx: number,
    dpi: number,
    extents: BandExtentTuple[]
  ): Extent {
    const [minX, minY, maxX, maxY] = rawExtent3857;
    const [minLon, minLat] = toLonLat([minX, minY], 'EPSG:3857');
    const [maxLon, maxLat] = toLonLat([maxX, maxY], 'EPSG:3857');

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const centerLat = (minLat + maxLat) / 2;
    const cosLat = Math.max(0.2, Math.cos((centerLat * Math.PI) / 180));

    const tightWidth3857 = Math.max(0, maxX - minX) * PDF_GEOMETRY_EXTENT_MULTIPLIER;
    const tightHeight3857 = Math.max(0, maxY - minY) * PDF_GEOMETRY_EXTENT_MULTIPLIER;

    const highestBand = this.findHighestCoveringBand(minLon, minLat, maxLon, maxLat, extents);
    const optimalScale = this.getOptimalScaleForBand(highestBand);

    // Ancho físico equivalente del mapa a la resolución DPI solicitada (920 px @ 181 DPI ≈ 0.129 m)
    const logicalPaperWidthM = widthPx * (0.0254 / dpi);
    const minGroundWidthM = logicalPaperWidthM * optimalScale;
    const minWidth3857 = minGroundWidthM / cosLat;
    const aspect = widthPx / heightPx;
    const minHeight3857 = minWidth3857 / aspect;

    let targetWidth = Math.max(tightWidth3857, minWidth3857);
    let targetHeight = Math.max(tightHeight3857, minHeight3857);

    if (targetWidth / targetHeight < aspect) {
      targetWidth = targetHeight * aspect;
    } else {
      targetHeight = targetWidth / aspect;
    }

    return [
      cx - targetWidth / 2,
      cy - targetHeight / 2,
      cx + targetWidth / 2,
      cy + targetHeight / 2
    ];
  }

  /**
   * Solicita a GeoServer una única imagen compuesta atómica (WMS GetMap) sobre el BBOX exacto del aviso.
   * Intenta primero el grupo dedicado de impresión (`cartografia_ve_pdf`) y, si aún no existiera en un entorno
   * externo, recurre de forma transparente al grupo principal (`cartografia_ve`).
   */
  public async fetchAtomicWmsImage(
    bbox3857: Extent,
    widthPx: number,
    heightPx: number,
    dpi: number
  ): Promise<HTMLImageElement | null> {
    const wmsBaseUrl = this.resolveWmsUrl();
    const pdfLayer = (environment.carto as any)?.pdfLayerId || 'pisac_shn:cartografia_ve_pdf';
    const fallbackLayer = environment.carto?.baseLayerId
      && environment.carto.baseLayerId !== 'XXXX'
      ? environment.carto.baseLayerId
      : ((environment as any).wmts?.layerName || 'pisac_shn:cartografia_ve');

    const primaryImg = await this.requestSingleWmsGetMap(wmsBaseUrl, pdfLayer, bbox3857, widthPx, heightPx, dpi);
    if (primaryImg) {
      return primaryImg;
    }
    if (fallbackLayer !== pdfLayer) {
      return this.requestSingleWmsGetMap(wmsBaseUrl, fallbackLayer, bbox3857, widthPx, heightPx, dpi);
    }
    return null;
  }

  private resolveWmsUrl(): string {
    const configured = (environment.carto as any)?.localWmsUrl || (environment as any).baseMapKey;
    if (configured && typeof configured === 'string' && !configured.includes('XXXX')) {
      return configured.split('?')[0];
    }
    const wmtsUrl = (environment as any).wmts?.baseUrl as string | undefined;
    if (wmtsUrl && !wmtsUrl.includes('XXXX')) {
      return wmtsUrl.replace('/gwc/service/wmts', '/pisac_shn/wms');
    }
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:8082';
    return `${origin}/geoserver/pisac_shn/wms`;
  }

  private async requestSingleWmsGetMap(
    wmsUrl: string,
    layer: string,
    bbox3857: Extent,
    widthPx: number,
    heightPx: number,
    dpi: number
  ): Promise<HTMLImageElement | null> {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), WMS_GETMAP_TIMEOUT_MS) : null;
    try {
      const params = new URLSearchParams({
        service: 'WMS',
        version: '1.1.1',
        request: 'GetMap',
        layers: layer,
        styles: '',
        bbox: bbox3857.map(v => v.toFixed(3)).join(','),
        width: String(widthPx),
        height: String(heightPx),
        srs: 'EPSG:3857',
        format: 'image/png',
        transparent: 'true',
        format_options: `dpi:${dpi}`
      });
      const resp = await fetch(`${wmsUrl}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        signal: controller?.signal
      });
      const contentType = resp.headers.get('content-type') || '';
      if (!resp.ok || !contentType.startsWith('image/')) {
        return null;
      }
      const blob = await resp.blob();
      return await this.blobToImage(blob);
    } catch {
      return null;
    } finally {
      if (timer) { clearTimeout(timer); }
    }
  }

  private blobToImage(blob: Blob): Promise<HTMLImageElement | null> {
    return new Promise(resolve => {
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      img.src = objectUrl;
    });
  }
}
