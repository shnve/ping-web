import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Extent } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';

/** Tupla [banda, minLon, minLat, maxLon, maxLat] en grados WGS84. */
export type BandExtentTuple = [number, number, number, number, number];

/** Resultado de resolución de banda única y encuadre para el mapa estático del PDF. */
export interface PdfBandFrame {
  /** Banda náutica única seleccionada (2..6), o null si no se dispone del índice de cobertura. */
  band: number | null;
  /** BBOX en EPSG:3857 con proporción exacta del lienzo PDF y encajado en la carta de la banda elegida. */
  bbox3857: Extent;
}

/** Margen limpio de encuadre para polígonos, líneas y áreas en el PDF (reemplaza el antiguo 1.8x + 50 px). */
export const PDF_GEOMETRY_EXTENT_MULTIPLIER = 1.25;

/** Margen mínimo admisible al compactar un polígono amplio para caber 100% dentro de una carta sin desbordarla. */
const MIN_GEOMETRY_FIT_MULTIPLIER = 1.08;

/** Ancho mínimo proyectado (m) para evitar sobre-ampliaciones extremas en micro-gránulos. */
const MIN_PDF_FRAME_WIDTH_3857 = 450;

/** Cobertura mínima exigida sobre la geometría del aviso y sobre el recuadro final del mapa PDF. */
const MIN_GEOMETRY_COVERAGE_RATIO = 0.80;
const MIN_FRAME_COVERAGE_RATIO = 0.85;
const COVERAGE_GRID_STEPS = 11;

/** Escala óptima de encuadre en el PDF para puntos o áreas diminutas según la banda más detallada disponible. */
const OPTIMAL_SCALE_BY_BAND: Record<number, number> = {
  6: 5000,
  5: 18000,
  4: 55000,
  3: 180000,
  2: 600000
};

const BAND_EXTENTS_TIMEOUT_MS = 3500;
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
   * Resuelve para el PDF una ÚNICA banda náutica (priorizando mayor detalle: 6 > 5 > 4 > 3 > 2) y encaja el
   * BBOX dentro de los bordes reales de la carta de esa banda para evitar tanto la mezcla de múltiples bandas
   * como franjas vacías fuera del límite de la carta. Si un polígono extenso desborda una carta local, desciende
   * automáticamente a la banda inferior inmediata que cubra el aviso y el recuadro.
   */
  public resolveSingleBandPdfFrame(
    rawExtent3857: Extent,
    widthPx: number,
    heightPx: number,
    dpi: number,
    extents: BandExtentTuple[]
  ): PdfBandFrame {
    const [minX, minY, maxX, maxY] = rawExtent3857;
    const [minLon, minLat] = toLonLat([minX, minY], 'EPSG:3857');
    const [maxLon, maxLat] = toLonLat([maxX, maxY], 'EPSG:3857');

    const centerLat = (minLat + maxLat) / 2;
    const cosLat = Math.max(0.2, Math.cos((centerLat * Math.PI) / 180));
    const aspect = widthPx / heightPx;
    const logicalPaperWidthM = widthPx * (0.0254 / dpi);

    const nominalWidthForBand = (band: number): number => {
      const scale = this.getOptimalScaleForBand(band);
      return (logicalPaperWidthM * scale) / cosLat;
    };

    if (!extents || extents.length === 0) {
      const fallbackBbox = this.fitAndClampBboxToEnvelope(
        rawExtent3857,
        nominalWidthForBand(2),
        aspect,
        null
      );
      return { band: null, bbox3857: fallbackBbox };
    }

    const granulesByBand = new Map<number, Extent[]>();
    for (const [bandRaw, eMinLon, eMinLat, eMaxLon, eMaxLat] of extents) {
      const band = Math.min(6, Math.max(2, Math.round(bandRaw)));
      const [eMinX, eMinY] = fromLonLat([eMinLon, eMinLat], 'EPSG:3857');
      const [eMaxX, eMaxY] = fromLonLat([eMaxLon, eMaxLat], 'EPSG:3857');
      if (![eMinX, eMinY, eMaxX, eMaxY].every(Number.isFinite) || eMinX >= eMaxX || eMinY >= eMaxY) {
        continue;
      }
      const list = granulesByBand.get(band) ?? [];
      list.push([eMinX, eMinY, eMaxX, eMaxY]);
      granulesByBand.set(band, list);
    }

    let bestPartial: { band: number; bbox3857: Extent; geomCov: number; frameCov: number } | null = null;

    for (let band = 6; band >= 2; band--) {
      const allBandGranules = granulesByBand.get(band);
      if (!allBandGranules?.length) {
        continue;
      }
      const intersecting = allBandGranules.filter(
        e => minX <= e[2] && maxX >= e[0] && minY <= e[3] && maxY >= e[1]
      );
      if (!intersecting.length) {
        continue;
      }

      const geomCov = this.computeCoverageRatio(rawExtent3857, allBandGranules);
      const targetEnvelope = this.selectBestChartEnvelope(rawExtent3857, intersecting);
      const candidateBbox = this.fitAndClampBboxToEnvelope(
        rawExtent3857,
        nominalWidthForBand(band),
        aspect,
        targetEnvelope
      );
      const frameCov = this.computeCoverageRatio(candidateBbox, allBandGranules);

      if (geomCov >= MIN_GEOMETRY_COVERAGE_RATIO && frameCov >= MIN_FRAME_COVERAGE_RATIO) {
        return { band, bbox3857: candidateBbox };
      }

      if (
        !bestPartial ||
        (geomCov >= MIN_GEOMETRY_COVERAGE_RATIO && bestPartial.geomCov < MIN_GEOMETRY_COVERAGE_RATIO) ||
        (geomCov >= MIN_GEOMETRY_COVERAGE_RATIO &&
          bestPartial.geomCov >= MIN_GEOMETRY_COVERAGE_RATIO &&
          frameCov > bestPartial.frameCov + 0.05) ||
        (geomCov < MIN_GEOMETRY_COVERAGE_RATIO &&
          bestPartial.geomCov < MIN_GEOMETRY_COVERAGE_RATIO &&
          geomCov > bestPartial.geomCov + 0.05)
      ) {
        bestPartial = { band, bbox3857: candidateBbox, geomCov, frameCov };
      }
    }

    if (bestPartial) {
      return { band: bestPartial.band, bbox3857: bestPartial.bbox3857 };
    }

    const b2Granules = granulesByBand.get(2);
    const b2Envelope = b2Granules?.length ? this.unionEnvelopes(b2Granules) : null;
    return {
      band: 2,
      bbox3857: this.fitAndClampBboxToEnvelope(rawExtent3857, nominalWidthForBand(2), aspect, b2Envelope)
    };
  }

  /**
   * Calcula el BBOX exacto en EPSG:3857 para la imagen del PDF delegando en {@link resolveSingleBandPdfFrame}.
   */
  public computePdfExtent3857(
    rawExtent3857: Extent,
    widthPx: number,
    heightPx: number,
    dpi: number,
    extents: BandExtentTuple[]
  ): Extent {
    return this.resolveSingleBandPdfFrame(rawExtent3857, widthPx, heightPx, dpi, extents).bbox3857;
  }

  /**
   * Si una sola carta de la banda cubre >= 95% de la geometría, devuelve la carta donde el aviso queda más
   * holgado respecto a sus bordes; si el aviso abarca varias cartas contiguas de la misma banda, devuelve su unión.
   */
  private selectBestChartEnvelope(geomExtent: Extent, intersectingGranules: Extent[]): Extent {
    if (intersectingGranules.length === 1) {
      return intersectingGranules[0];
    }
    const [gMinX, gMinY, gMaxX, gMaxY] = geomExtent;
    let bestSingle: Extent | null = null;
    let bestClearance = -Infinity;

    for (const gran of intersectingGranules) {
      if (this.computeCoverageRatio(geomExtent, [gran]) >= 0.95) {
        const clearance = Math.min(
          gMinX - gran[0],
          gran[2] - gMaxX,
          gMinY - gran[1],
          gran[3] - gMaxY
        );
        if (clearance > bestClearance) {
          bestClearance = clearance;
          bestSingle = gran;
        }
      }
    }
    return bestSingle ?? this.unionEnvelopes(intersectingGranules);
  }

  private unionEnvelopes(envelopes: Extent[]): Extent {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x0, y0, x1, y1] of envelopes) {
      if (x0 < minX) { minX = x0; }
      if (y0 < minY) { minY = y0; }
      if (x1 > maxX) { maxX = x1; }
      if (y1 > maxY) { maxY = y1; }
    }
    return [minX, minY, maxX, maxY];
  }

  private computeCoverageRatio(targetBox: Extent, granules: Extent[]): number {
    const [minX, minY, maxX, maxY] = targetBox;
    const spanX = Math.max(0, maxX - minX);
    const spanY = Math.max(0, maxY - minY);
    const steps = COVERAGE_GRID_STEPS;
    let covered = 0;
    const total = steps * steps;

    for (let i = 0; i < steps; i++) {
      const x = spanX === 0 ? minX : minX + (spanX * i) / (steps - 1);
      for (let j = 0; j < steps; j++) {
        const y = spanY === 0 ? minY : minY + (spanY * j) / (steps - 1);
        for (let k = 0; k < granules.length; k++) {
          const g = granules[k];
          if (x >= g[0] && x <= g[2] && y >= g[1] && y <= g[3]) {
            covered++;
            break;
          }
        }
      }
    }
    return covered / total;
  }

  private fitAndClampBboxToEnvelope(
    rawExtent3857: Extent,
    nominalWidth3857: number,
    aspect: number,
    envelope: Extent | null
  ): Extent {
    const [gMinX, gMinY, gMaxX, gMaxY] = rawExtent3857;
    const cx = (gMinX + gMaxX) / 2;
    const cy = (gMinY + gMaxY) / 2;
    const rawW = Math.max(0, gMaxX - gMinX);
    const rawH = Math.max(0, gMaxY - gMinY);

    const prefGeomW = Math.max(
      rawW * PDF_GEOMETRY_EXTENT_MULTIPLIER,
      rawH * PDF_GEOMETRY_EXTENT_MULTIPLIER * aspect
    );
    const minTightGeomW = Math.max(
      rawW * MIN_GEOMETRY_FIT_MULTIPLIER,
      rawH * MIN_GEOMETRY_FIT_MULTIPLIER * aspect,
      MIN_PDF_FRAME_WIDTH_3857
    );

    let targetWidth = Math.max(prefGeomW, nominalWidth3857);

    if (envelope) {
      const cWidth = Math.max(0, envelope[2] - envelope[0]);
      const cHeight = Math.max(0, envelope[3] - envelope[1]);
      const maxChartFitW = Math.min(cWidth, cHeight * aspect);
      if (targetWidth > maxChartFitW && maxChartFitW >= minTightGeomW) {
        targetWidth = maxChartFitW;
      }
    }

    const targetHeight = targetWidth / aspect;
    let outMinX = cx - targetWidth / 2;
    let outMinY = cy - targetHeight / 2;

    if (envelope) {
      const [cMinX, cMinY, cMaxX, cMaxY] = envelope;
      const cWidth = cMaxX - cMinX;
      const cHeight = cMaxY - cMinY;

      if (targetWidth <= cWidth) {
        outMinX = Math.max(cMinX, Math.min(outMinX, cMaxX - targetWidth));
      } else {
        outMinX = (cMinX + cMaxX - targetWidth) / 2;
      }

      if (targetHeight <= cHeight) {
        outMinY = Math.max(cMinY, Math.min(outMinY, cMaxY - targetHeight));
      } else {
        outMinY = (cMinY + cMaxY - targetHeight) / 2;
      }

      // Guarda de seguridad para que el símbolo/geometría nunca quede recortado en el borde del recuadro
      const safePadX = Math.min(targetWidth * 0.045, Math.max(0, (targetWidth - rawW) / 2));
      const safePadY = Math.min(targetHeight * 0.06, Math.max(0, (targetHeight - rawH) / 2));
      outMinX = Math.max(gMaxX + safePadX - targetWidth, Math.min(outMinX, gMinX - safePadX));
      outMinY = Math.max(gMaxY + safePadY - targetHeight, Math.min(outMinY, gMinY - safePadY));
    }

    return [
      outMinX,
      outMinY,
      outMinX + targetWidth,
      outMinY + targetHeight
    ];
  }

  /**
   * Solicita a GeoServer una única imagen WMS GetMap sobre el BBOX exacto del aviso.
   * Cuando se conoce la banda seleccionada (`selectedBand` 2..6), consulta EXCLUSIVAMENTE la capa de esa banda
   * (`pisac_shn:bandaN`) con el estilo nativo `raster` (sin límites de escala y sin apilar otras bandas debajo).
   */
  public async fetchAtomicWmsImage(
    bbox3857: Extent,
    widthPx: number,
    heightPx: number,
    dpi: number,
    selectedBand?: number | null
  ): Promise<HTMLImageElement | null> {
    const wmsBaseUrl = this.resolveWmsUrl();
    const pdfLayer = (environment.carto as any)?.pdfLayerId || 'pisac_shn:cartografia_ve_pdf';
    const fallbackLayer = environment.carto?.baseLayerId
      && environment.carto.baseLayerId !== 'XXXX'
      ? environment.carto.baseLayerId
      : ((environment as any).wmts?.layerName || 'pisac_shn:cartografia_ve');
    const workspace = pdfLayer.includes(':')
      ? pdfLayer.split(':')[0]
      : (fallbackLayer.includes(':') ? fallbackLayer.split(':')[0] : 'pisac_shn');

    if (selectedBand && selectedBand >= 2 && selectedBand <= 6) {
      const singleBandLayer = `${workspace}:banda${selectedBand}`;
      const singleBandImg = await this.requestSingleWmsGetMap(
        wmsBaseUrl,
        singleBandLayer,
        bbox3857,
        widthPx,
        heightPx,
        dpi,
        'raster'
      );
      if (singleBandImg) {
        return singleBandImg;
      }
      if (selectedBand !== 2) {
        const band2Img = await this.requestSingleWmsGetMap(
          wmsBaseUrl,
          `${workspace}:banda2`,
          bbox3857,
          widthPx,
          heightPx,
          dpi,
          'raster'
        );
        if (band2Img) {
          return band2Img;
        }
      }
    }

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
    dpi: number,
    style = ''
  ): Promise<HTMLImageElement | null> {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), WMS_GETMAP_TIMEOUT_MS) : null;
    try {
      const params = new URLSearchParams({
        service: 'WMS',
        version: '1.1.1',
        request: 'GetMap',
        layers: layer,
        styles: style,
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
