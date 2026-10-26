import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Map as MapLibreMap, StyleSpecification, addProtocol } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { layers, namedFlavor } from '@protomaps/basemaps';
import Layer from 'ol/layer/Layer';
import { FrameState } from 'ol/PluggableMap';
import { toLonLat } from 'ol/proj';
import Source from 'ol/source/Source';

export interface LocalBasemapLayerOptions {
  preserveDrawingBuffer?: boolean;
  lang?: 'es' | 'en';
  zIndex?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocalBasemapService {
  private static protocolRegistered = false;
  // Resolución en metros/píxel en el ecuador para zoom 0 con teselas de 512px (estándar MapLibre GL)
  private static readonly MAPLIBRE_ZOOM0_RESOLUTION = (2 * Math.PI * 6378137) / 512;

  private readonly activeMaps = new Set<MapLibreMap>();
  private currentLang: 'es' | 'en' = 'es';

  // Color para cursos de agua (ríos, arroyos, canales) — más intenso que el relleno de mar/lagos
  private static readonly RIVER_COLOR = '#7bbfdc';
  private static readonly RIVER_LINES = new Set(['water_stream', 'water_river']);
  private static readonly POLITICAL_NAMES = new Set(['places_country', 'places_region']);
  private static readonly ATTRIBUTION_HTML =
    '© SHN Venezuela · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> · <a href="https://protomaps.com" target="_blank" rel="noopener noreferrer">Protomaps</a>';

  // Paleta base clara con agua ligeramente oscurecida y etiquetas legibles de alto contraste
  private static readonly FLAVOR = {
    ...namedFlavor('light'),
    background: '#e3f4fa',
    water: '#e3f4fa',
    ocean_label: '#2c5a71',
    water_label_ocean: '#2c5a71',
    water_label_lakes: '#2c5a71',
    city_label: '#222222',
    state_label: '#222222',
    subplace_label: '#333333',
    neighbourhood_label: '#333333',
    address_label: '#333333',
    poi_label: '#333333',
    roads_label_major: '#2a2a2a',
    roads_label_minor: '#3a3a3a',
    peak_label: '#2d4a3a'
  };

  constructor(private readonly translateService: TranslateService) {
    this.ensureProtocolRegistered();
    const initialLang = this.translateService.currentLang || this.translateService.defaultLang || environment.defaultLanguage || 'es';
    this.currentLang = initialLang.startsWith('en') ? 'en' : 'es';

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      const nextLang = event?.lang?.startsWith('en') ? 'en' : 'es';
      this.setLanguage(nextLang);
    });
  }

  private ensureProtocolRegistered(): void {
    if (!LocalBasemapService.protocolRegistered) {
      try {
        const protocol = new Protocol();
        addProtocol('pmtiles', protocol.tile);
        LocalBasemapService.protocolRegistered = true;
      } catch {
        LocalBasemapService.protocolRegistered = true;
      }
    }
  }

  private resolveMapBaseUrl(): string {
    const configured = (environment.carto as any)?.mapDataUrl as string | undefined;
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:4200';
    if (!configured) {
      return `${origin}/map/`;
    }
    if (configured.startsWith('http://') || configured.startsWith('https://')) {
      return configured.endsWith('/') ? configured : `${configured}/`;
    }
    const normalizedPath = configured.startsWith('/') ? configured : `/${configured}`;
    const fullUrl = `${origin}${normalizedPath}`;
    return fullUrl.endsWith('/') ? fullUrl : `${fullUrl}/`;
  }

  /**
   * Sin fronteras ni nombres de países/estados (neutralidad geopolítica + fachadas marítimas)
   */
  private isPolitical(layerSpec: any): boolean {
    return (
      layerSpec['source-layer'] === 'boundaries' ||
      LocalBasemapService.POLITICAL_NAMES.has(layerSpec.id)
    );
  }

  /**
   * Genera las capas de un nivel ('world' o 'detail'): sin fronteras ni etiquetas políticas,
   * con los ríos recoloreados y movidos debajo de los polígonos de agua, y con el id prefijado.
   */
  private levelLayers(source: 'world' | 'detail', prefix: string, lang: 'es' | 'en'): any[] {
    const all = layers(source, LocalBasemapService.FLAVOR, { lang })
      .filter((layer: any) => !this.isPolitical(layer))
      .map((layer: any) =>
        layer.type === 'line' && LocalBasemapService.RIVER_LINES.has(layer.id)
          ? { ...layer, paint: { ...layer.paint, 'line-color': LocalBasemapService.RIVER_COLOR } }
          : layer
      );

    const rivers = all.filter((l: any) => LocalBasemapService.RIVER_LINES.has(l.id));
    const rest = all.filter((l: any) => !LocalBasemapService.RIVER_LINES.has(l.id));
    const waterIdx = rest.findIndex((l: any) => l.id === 'water');
    const ordered = waterIdx === -1 ? all : [...rest.slice(0, waterIdx), ...rivers, ...rest.slice(waterIdx)];

    return ordered.map((l: any) => {
      const copy: any = { ...l, id: `${prefix}_${l.id}` };
      if (source === 'detail') {
        copy.minzoom = Math.max(copy.minzoom ?? 0, 6);
      }
      return copy;
    });
  }

  /**
   * Los dos niveles apilados: el mundo abajo y el detalle encima.
   * CRÍTICO: Solo 'world' conserva la capa 'background'; la de 'detail' se filtra
   * porque una capa 'background' no tiene límites geográficos y taparía todo el planeta.
   */
  private basemapLayers(lang: 'es' | 'en'): any[] {
    const world = this.levelLayers('world', 'world', lang);
    const detail = this.levelLayers('detail', 'detail', lang).filter((l: any) => l.type !== 'background');
    return [...world, ...detail];
  }

  public buildStyle(lang: 'es' | 'en' = this.currentLang): StyleSpecification {
    const baseUrl = this.resolveMapBaseUrl();

    return {
      version: 8,
      glyphs: `${baseUrl}fonts/{fontstack}/{range}.pbf`,
      sprite: `${baseUrl}sprites/light`,
      sources: {
        world: {
          type: 'vector',
          url: `pmtiles://${baseUrl}world.pmtiles`,
          attribution: LocalBasemapService.ATTRIBUTION_HTML
        },
        detail: {
          type: 'vector',
          url: `pmtiles://${baseUrl}venezuela.pmtiles`,
          attribution: LocalBasemapService.ATTRIBUTION_HTML
        }
      },
      layers: this.basemapLayers(lang)
    } as StyleSpecification;
  }

  /**
   * Cambia el idioma de las etiquetas del mapa base en caliente ('es' | 'en')
   * sin recargar el estilo ni parpadear.
   */
  public setLanguage(lang: 'es' | 'en'): void {
    this.currentLang = lang;
    const referenceLayers = this.basemapLayers(lang);
    const textFieldByLayerId = new Map<string, any>();
    for (const refLayer of referenceLayers) {
      if (refLayer.type === 'symbol' && refLayer.layout?.['text-field']) {
        textFieldByLayerId.set(refLayer.id, refLayer.layout['text-field']);
      }
    }

    this.activeMaps.forEach((mlMap) => {
      try {
        const style = mlMap.getStyle();
        if (!style?.layers) {
          return;
        }
        for (const layer of style.layers) {
          const nextTextField = textFieldByLayerId.get(layer.id);
          if (nextTextField !== undefined && mlMap.getLayer(layer.id)) {
            mlMap.setLayoutProperty(layer.id, 'text-field', nextTextField);
          }
        }
      } catch {
        // Style might still be loading; initial buildStyle already uses currentLang
      }
    });
  }

  /**
   * Convierte la resolución de OpenLayers (EPSG:3857) al nivel de zoom exacto de MapLibre GL (teselas de 512px)
   */
  private computeMapLibreZoom(viewState: FrameState['viewState']): number {
    if (viewState.resolution && viewState.resolution > 0) {
      const z = Math.log2(LocalBasemapService.MAPLIBRE_ZOOM0_RESOLUTION / viewState.resolution);
      return Math.max(0, Math.min(20, z));
    }
    return Math.max(0, Math.min(20, (viewState.zoom ?? 5) - 1));
  }

  /**
   * Crea una capa OpenLayers (ol/layer/Layer) sincronizada cuadro a cuadro con MapLibre GL + PMTiles.
   */
  public createBasemapLayer(options?: LocalBasemapLayerOptions): Layer {
    this.ensureProtocolRegistered();
    const preserveDrawingBuffer = !!options?.preserveDrawingBuffer;
    const zIndex = options?.zIndex ?? 0;
    const initialLang = options?.lang ?? this.currentLang;

    const container = document.createElement('div');
    container.className = 'ol-layer ol-local-basemap-layer';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';

    let mlMap: MapLibreMap | null = null;
    let initFailed = false;
    let pendingRafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const syncCameraAndSize = (frameState: FrameState) => {
      if (!mlMap || !frameState) {
        return;
      }

      const [width, height] = frameState.size;
      const canvas = mlMap.getCanvas();
      if (
        width > 0 &&
        height > 0 &&
        (Math.abs(canvas.clientWidth - width) > 1 ||
          Math.abs(canvas.clientHeight - height) > 1 ||
          (mlMap as any).transform?.width !== width ||
          (mlMap as any).transform?.height !== height)
      ) {
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        mlMap.resize();
      }

      const opacity = olLayer.getOpacity();
      container.style.opacity = opacity < 1 ? String(opacity) : '';
      container.style.display = olLayer.getVisible() ? 'block' : 'none';

      const viewState = frameState.viewState;
      const [lon, lat] = toLonLat(viewState.center, viewState.projection);
      const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
      const zoom = this.computeMapLibreZoom(viewState);
      const bearing = (-(viewState.rotation || 0) * 180) / Math.PI;

      mlMap.jumpTo({
        center: [lon, clampedLat],
        zoom,
        bearing,
        pitch: 0
      });

      if (typeof (mlMap as any)._render === 'function') {
        (mlMap as any)._render();
      } else {
        mlMap.triggerRepaint();
      }
    };

    const initMapLibre = (frameState: FrameState) => {
      if (mlMap || initFailed || typeof window === 'undefined') {
        return;
      }
      try {
        const [width, height] = frameState.size;
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;

        const centerLonLat = toLonLat(frameState.viewState.center, frameState.viewState.projection);
        const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, centerLonLat[1]));
        const zoom = this.computeMapLibreZoom(frameState.viewState);
        const bearing = (-(frameState.viewState.rotation || 0) * 180) / Math.PI;

        mlMap = new MapLibreMap({
          container,
          style: this.buildStyle(initialLang),
          center: [centerLonLat[0], clampedLat],
          zoom,
          bearing,
          pitch: 0,
          interactive: false,
          attributionControl: false,
          // CRÍTICO: renderWorldCopies: true evita que MapLibre aplique _constrain()
          // y desplace el centro o el zoom respecto a OpenLayers. El límite de mundo único
          // lo gobierna exclusivamente el ol/View de OpenLayers.
          renderWorldCopies: true,
          maxZoom: 20,
          fadeDuration: 0,
          pixelRatio: preserveDrawingBuffer ? 1 : undefined,
          canvasContextAttributes: {
            preserveDrawingBuffer
          }
        });

        this.activeMaps.add(mlMap);

        // Asegurar redimensionamiento exacto una vez montado en el DOM
        mlMap.resize();

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            if (mlMap && container.isConnected && container.clientWidth > 0 && container.clientHeight > 0) {
              mlMap.resize();
              olLayer.changed();
            }
          });
          resizeObserver.observe(container);
        }

        // Cuando MapLibre termina de cargar teselas/glifos nuevos, notificar a OpenLayers
        mlMap.on('idle', () => {
          olLayer.changed();
        });

        mlMap.on('load', () => {
          if (mlMap) {
            mlMap.resize();
          }
          if (this.currentLang !== initialLang) {
            this.setLanguage(this.currentLang);
          }
          olLayer.changed();
        });
      } catch (err) {
        initFailed = true;
        console.warn('No se pudo inicializar WebGL para el mapa base local:', err);
      }
    };

    const olSource = new Source({
      attributions: LocalBasemapService.ATTRIBUTION_HTML,
      state: 'ready'
    });

    const olLayer = new Layer({
      zIndex,
      source: olSource,
      render: (frameState: FrameState) => {
        if (!frameState) {
          return container;
        }

        const [width, height] = frameState.size;
        if (width > 0 && height > 0) {
          container.style.width = `${width}px`;
          container.style.height = `${height}px`;
        }

        if (!mlMap && !initFailed && width > 0 && height > 0) {
          if (container.isConnected && container.clientWidth > 0 && container.clientHeight > 0) {
            initMapLibre(frameState);
          } else if (pendingRafId === null && typeof requestAnimationFrame === 'function') {
            // En el primer frame OpenLayers aún no ha insertado 'container' en '.ol-layers'.
            // Esperamos al siguiente frame de animación cuando ya está en el DOM con dimensiones reales.
            pendingRafId = requestAnimationFrame(() => {
              pendingRafId = null;
              if (!mlMap && !initFailed && container.isConnected) {
                initMapLibre(frameState);
                syncCameraAndSize(frameState);
                olLayer.changed();
              }
            });
          }
        }

        if (mlMap) {
          syncCameraAndSize(frameState);
        }

        return container;
      }
    });

    (olLayer as any).disposeBasemap = () => {
      if (pendingRafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(pendingRafId);
        pendingRafId = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (mlMap) {
        this.activeMaps.delete(mlMap);
        try {
          mlMap.remove();
        } catch {
          // Ignore cleanup errors
        }
        mlMap = null;
      }
    };

    return olLayer;
  }
}
