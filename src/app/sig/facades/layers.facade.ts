import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
//import Layer, { default as CartoLayer } from '@shom2/carto/core/Layer';
//import { default as MapCarto } from '@shom2/carto/core/Map';
import { Map } from 'ol';
import { boundingExtent, getWidth } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, get as getProjection } from 'ol/proj';
import { OSM, TileWMS, XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LayersApi } from '../api/layers.api';
import { LayersState } from '../states/layers.state';

import { NauticalCartographyService } from '../services/nautical-cartography.service';
import { S52CartographyStyleFactory } from '../core/s52-cartography-style.factory';
import { LocalBasemapLayerOptions, LocalBasemapService } from '../services/local-basemap.service';

// --- INYECCIÓN DE SEGURIDAD ---
class Layer {
  opacity?: any;
  [key: string]: any;
  constructor(initData?: any) {
    Object.assign(this, initData);
  }
}

class CartoLayer {
  opacity?: any;
  name?: string;
  olLayer?: any;
  [key: string]: any;
  constructor(initData?: any) {
    Object.assign(this, initData);
  }
}

class MapCarto {
  map: any = { layers: [] };
  [key: string]: any;
  constructor(initData?: any) {
    Object.assign(this, initData);
  }
}
// -----------------------------

@Injectable({
  providedIn: 'root'
})
export class LayersFacade {
  constructor(
    private readonly layersApi: LayersApi,
    private readonly layersState: LayersState,
    private readonly nauticalCartographyService: NauticalCartographyService,
    private readonly s52StyleFactory: S52CartographyStyleFactory,
    private readonly localBasemapService: LocalBasemapService
  ) { }

  getBaseLayers$(showRasterMarineWithAdditionalLayerForWestAfrica = false): Observable<CartoLayer[]> {
    if (showRasterMarineWithAdditionalLayerForWestAfrica) {
      return this.loadLayersFromGetCap(showRasterMarineWithAdditionalLayerForWestAfrica);
    }

    if (!this.layersState.isLoaded()) {
      return this.loadLayersFromGetCap();
    }
    return this.layersState.getLayers$().pipe(
      map(layers => layers.map(layer =>
        layer.name === 'OSM'
          ? new CartoLayer({
              ...layer,
              olLayer: this.localBasemapService.createBasemapLayer({
                preserveDrawingBuffer: false,
                zIndex: 0
              })
            })
          : layer
      ))
    );
  }

  createBasemapLayer(options?: LocalBasemapLayerOptions) {
    return this.localBasemapService.createBasemapLayer(options);
  }

  /**
   * Reinitialize layers to avoid duplicate layers
   */
  reinitializeLayers(olMap: Map): void {
    this.destroyLayersAndMapInstance(olMap);
    this.layersState.reinitializeLayers();
  }

  private destroyLayersAndMapInstance(olMap: Map): void {
    if (!olMap) { return; }
    const layers = olMap.getLayers();
    while (layers.getLength() > 0) {
      const layer = layers.item(0);
      if (layer instanceof VectorLayer) {
        const vectorLayer = layer as VectorLayer<VectorSource>;
        vectorLayer.getSource().clear();
        vectorLayer.getRenderer().dispose();
        vectorLayer.setSource(null);
      } else if (layer && typeof (layer as any).disposeBasemap === 'function') {
        (layer as any).disposeBasemap();
      }
      olMap.removeLayer(layer);
    }
    olMap.setTarget(null);
    olMap = null;
  }

  private loadLayersFromGetCap(showRasterMarineWithAdditionalLayerForWestAfrica = false) {
    return this.layersApi.getLayersFromGetCap(showRasterMarineWithAdditionalLayerForWestAfrica).pipe(
      map(getCapInfo => {
        // 1. Capa Base: Mapa Vectorial Local Autohospedado (MapLibre GL + PMTiles)
        const osmLayer = new CartoLayer({
          name: 'OSM',
          olLayer: this.localBasemapService.createBasemapLayer({
            preserveDrawingBuffer: false,
            zIndex: 0
          })
        });

        // Configuración de la cuadrícula de teselas para EPSG:3857
        const projection = getProjection('EPSG:3857');
        const projectionExtent = projection.getExtent();
        const size = getWidth(projectionExtent) / 256;
        const wmtsConfig = (environment as any).wmts;
        const resolutions = new Array(21);
        const matrixIds = new Array(21);
        for (let z = 0; z < 21; ++z) {
          resolutions[z] = size / Math.pow(2, z);
          matrixIds[z] = wmtsConfig.matrixSet + ':' + z;
        }

        // 2. Capa WMTS Principal (delimitada a la cobertura de la cartografía náutica del SHN para evitar 400 Out of Bounds)
        const wmtsExtent = boundingExtent([
          fromLonLat([-76.1082, 0.5]),
          fromLonLat([-54.8764, 21.1625])
        ]);
        const wmtsLayer = new CartoLayer({
          name: wmtsConfig.layerName,
          olLayer: new TileLayer({
            extent: wmtsExtent,
            source: new WMTS({
              url: wmtsConfig.baseUrl,
              layer: wmtsConfig.layerName,
              matrixSet: wmtsConfig.matrixSet,
              format: wmtsConfig.format,
              projection: projection,
              tileGrid: new WMTSTileGrid({
                origin: [-20037508.342789244, 20037508.342789244], // Top left corner of the EPSG:3857 extent
                resolutions: resolutions,
                matrixIds: matrixIds
              }),
              style: wmtsConfig.style,
              wrapX: false,
              crossOrigin: 'anonymous'
            }),
            minZoom: 5,
            zIndex: 1
          })
        });

        return this.layersState.addLayers([osmLayer, wmtsLayer]);
      })
    );
  }

  /**
   * Add the West Africa maritime layer to the layersArray
   * only if user has rights on any SHOM service
   * @param layersArray
   * @param getCapInfo
   */
  private addWestAfricaRasterMarineLayer(layersArray: Layer[], getCapInfo: any): void {
    const westAfricaRasterMarineOptions = optionsFromCapabilities(getCapInfo, {
      layer: environment.carto.westAfricaRasterMarineId,
      crossOrigin: 'anonymous'
    });

    const westAfricaRasterMarineLayerFromGetCapInfo = getCapInfo.Contents.Layer.find(layer => layer.Title === environment.carto.westAfricaRasterMarineLayerName);

    // to limit the extent of the layer only to the West Africa area
    const extent = boundingExtent([fromLonLat(westAfricaRasterMarineLayerFromGetCapInfo.WGS84BoundingBox.slice(0, 2)), fromLonLat(westAfricaRasterMarineLayerFromGetCapInfo.WGS84BoundingBox.slice(2, 4))]);

    layersArray.push(new CartoLayer({
      name: environment.carto.westAfricaRasterMarineLayerName,
      olLayer: new TileLayer({
        source: new WMTS(westAfricaRasterMarineOptions),
        extent
      })
    }));
  }

  addRasterMarineLayer(mapCarto: any, opacity: number): Observable<void> {
    return this.layersApi.getLayersFromGetCap().pipe(
      map(getCapInfo => {
        const baseLayerOptions = optionsFromCapabilities(getCapInfo, {
          layer: environment.carto.baseLayerId,
          crossOrigin: 'anonymous'
        });
        const layer = new CartoLayer({
          name: environment.carto.rasterMarineLayerName,
          olLayer: new TileLayer({
            source: new WMTS(baseLayerOptions)
          })
        });

        layer.opacity = opacity;
        mapCarto.addLayer(layer);
      })
    );
  }

  addOrthoGeoLittoralV2Layer(mapCarto: any, opacity: number): void {
    const mandatoryParams = { 'LAYERS': environment.carto.orthoGeoLittoralV2Id };
    const optionalParams = {};
    const layer = new Layer({
      name: environment.carto.orthoGeoLittoralV2LayerName,
      olLayer: new TileLayer({
        source: new TileWMS({
          url: 'https://geolittoral.din.developpement-durable.gouv.fr/wxs?SERVICE=WMS&VERSION=1.3.0',
          params: { ...mandatoryParams, ...optionalParams },
        })
      })
    });

    layer.opacity = opacity;
    mapCarto.addLayer(layer);
  }

  removeLayer(mapCarto: any, layerName: string): void {
    const findLayer = name => mapCarto.layers.find(layer => layer.name === name);
    const layerToRemove = findLayer(layerName);
    if (layerToRemove) {
      mapCarto.removeLayer(layerToRemove);
    }
  }

}
