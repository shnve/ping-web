import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Map as MapLibreMap, StyleSpecification, addProtocol } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { layers, namedFlavor } from '@protomaps/basemaps';
import Layer from 'ol/layer/Layer';
import { FrameState } from 'ol/PluggableMap';
import { toLonLat } from 'ol/proj';

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
  private readonly activeMaps = new Set<MapLibreMap>();
  private currentLang: 'es' | 'en' = 'es';

  // Color para cursos de agua (ríos, arroyos, canales) — más intenso que el relleno de mar/lagos
  private static readonly RIVER_COLOR = '#7bbfdc';

  // Paleta base clara con agua ligeramente oscurecida y etiquetas legibles de alto contraste
  private static readonly FLAVOR = {
    ...namedFlavor('light'),
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
        // Protocol may already be registered in hot-reload environments
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
      layerSpec.id === 'places_country' ||
      layerSpec.id === 'places_region'
    );
  }

  /**
   * Genera las capas de estilo para una fuente PMTiles ('world' o 'detail')
   * aplicando las optimizaciones de rangos de zoom y orden de hidrografía.
   */
  private styleSource(source: 'world' | 'detail', prefix: string, lang: 'es' | 'en'): any[] {
    const out = layers(source, LocalBasemapService.FLAVOR, { lang }).filter((l: any) => !this.isPolitical(l));
    const rivers: any[] = [];
    const rest: any[] = [];

    for (const l of out as any[]) {
      if (l.id === 'water_stream' || l.id === 'water_river') {
        rivers.push({
          ...l,
          paint: { ...l.paint, 'line-color': LocalBasemapService.RIVER_COLOR }
        });
      } else {
        rest.push(l);
      }
    }

    // Dibujar ríos ANTES del polígono de agua para que lagos/mares cubran el trazo interior
    const waterIdx = rest.findIndex((l: any) => l.id === 'water');
    if (waterIdx >= 0) {
      rest.splice(waterIdx, 0, ...rivers);
    } else {
      rest.push(...rivers);
    }

    return rest.map((l: any) => {
      const layerCopy: any = { ...l, id: `${prefix}_${l.id}` };

      // Optimización 2: Evitar doble consulta/renderizado en zooms globales (z0-z5)
      if (source === 'detail') {
        layerCopy.minzoom = Math.max(layerCopy.minzoom ?? 0, 6);
      } else if (source === 'world') {
        // Ocultar etiquetas y vialidad de baja resolución de 'world' al entrar en zoom >= 7
        if (layerCopy.type === 'symbol' || layerCopy['source-layer'] === 'roads') {
          layerCopy.maxzoom = Math.min(layerCopy.maxzoom ?? 24, 7);
        }
      }

      return layerCopy;
    });
  }

  public buildStyle(lang: 'es' | 'en' = this.currentLang): StyleSpecification {
    const baseUrl = this.resolveMapBaseUrl();
    const worldLayers = this.styleSource('world', 'world', lang);
    const detailLayers = this.styleSource('detail', 'detail', lang);

    return {
      version: 8,
      glyphs: `${baseUrl}fonts/{fontstack}/{range}.pbf`,
      sprite: `${baseUrl}sprites/light`,
      sources: {
        world: {
          type: 'vector',
          url: `pmtiles://${baseUrl}world.pmtiles`,
          maxzoom: 6
        },
        detail: {
          type: 'vector',
          url: `pmtiles://${baseUrl}venezuela.pmtiles`,
          bounds: [-74.0, 0.5, -56.5, 16.5],
          maxzoom: 15
        }
      },
      layers: [...worldLayers, ...detailLayers]
    } as StyleSpecification;
  }

  /**
   * Cambia el idioma de las etiquetas del mapa base en caliente ('es' | 'en')
   * sin recargar el estilo ni parpadear.
   */
  public setLanguage(lang: 'es' | 'en'): void {
    this.currentLang = lang;
    const referenceLayers = [
      ...this.styleSource('world', 'world', lang),
      ...this.styleSource('detail', 'detail', lang)
    ];
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
          if (nextTextField !== undefined) {
            mlMap.setLayoutProperty(layer.id, 'text-field', nextTextField);
          }
        }
      } catch {
        // Style might still be loading; initial buildStyle already uses currentLang
      }
    });
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
    let lastWidth = 0;
    let lastHeight = 0;

    const initMapLibre = (frameState: FrameState) => {
      if (mlMap || initFailed || typeof window === 'undefined') {
        return;
      }
      try {
        const centerLonLat = toLonLat(frameState.viewState.center, frameState.viewState.projection);
        const zoom = Math.max(0, (frameState.viewState.zoom ?? 5) - 1);
        const bearing = (-(frameState.viewState.rotation || 0) * 180) / Math.PI;

        mlMap = new MapLibreMap({
          container,
          style: this.buildStyle(initialLang),
          center: [centerLonLat[0], centerLonLat[1]],
          zoom,
          bearing,
          pitch: 0,
          interactive: false,
          attributionControl: false,
          renderWorldCopies: false,
          maxZoom: 20,
          fadeDuration: 0,
          pixelRatio: preserveDrawingBuffer ? 1 : undefined,
          canvasContextAttributes: {
            preserveDrawingBuffer
          }
        });

        this.activeMaps.add(mlMap);

        mlMap.on('load', () => {
          // Aplicar el idioma activo por si cambió durante la carga inicial
          if (this.currentLang !== initialLang) {
            this.setLanguage(this.currentLang);
          }
        });
      } catch (err) {
        initFailed = true;
        console.warn('No se pudo inicializar WebGL para el mapa base local:', err);
      }
    };

    const olLayer = new Layer({
      zIndex,
      render: (frameState: FrameState) => {
        if (!frameState) {
          return container;
        }

        const [width, height] = frameState.size;
        if (width > 0 && height > 0 && (width !== lastWidth || height !== lastHeight)) {
          lastWidth = width;
          lastHeight = height;
          container.style.width = `${width}px`;
          container.style.height = `${height}px`;
          if (mlMap) {
            mlMap.resize();
          }
        }

        if (!mlMap && !initFailed && width > 0 && height > 0) {
          initMapLibre(frameState);
        }

        if (mlMap) {
          const opacity = olLayer.getOpacity();
          container.style.opacity = opacity < 1 ? String(opacity) : '';
          container.style.display = olLayer.getVisible() ? 'block' : 'none';

          const viewState = frameState.viewState;
          const [lon, lat] = toLonLat(viewState.center, viewState.projection);
          const zoom = Math.max(0, (viewState.zoom ?? 5) - 1);
          const bearing = (-(viewState.rotation || 0) * 180) / Math.PI;

          mlMap.jumpTo({
            center: [lon, lat],
            zoom,
            bearing,
            pitch: 0
          });

          // Forzar repintado síncrono dentro del ciclo de frame de OpenLayers
          if (typeof (mlMap as any)._render === 'function') {
            (mlMap as any)._render();
          } else {
            mlMap.triggerRepaint();
          }
        }

        return container;
      }
    });

    (olLayer as any).disposeBasemap = () => {
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
