import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import Layer, { default as CartoLayer } from '@shom2/carto/core/Layer';
import { default as MapCarto } from '@shom2/carto/core/Map';
import { Map } from 'ol';
import { boundingExtent } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { OSM, TileWMS } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LayersApi } from '../api/layers.api';
import { LayersState } from '../states/layers.state';

@Injectable({
  providedIn: 'root'
})
export class LayersFacade {
  constructor(
    private readonly layersApi: LayersApi,
    private readonly layersState: LayersState
  ) { }

  getBaseLayers$(showRasterMarineWithAdditionalLayerForWestAfrica = false): Observable<CartoLayer[]> {
    if (showRasterMarineWithAdditionalLayerForWestAfrica) {
      return this.loadLayersFromGetCap(showRasterMarineWithAdditionalLayerForWestAfrica);
    }

    if (!this.layersState.isLoaded()) {
      return this.loadLayersFromGetCap();
    }
    return this.layersState.getLayers$();
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
      }
      olMap.removeLayer(layer);
    }
    olMap.setTarget(null);
    olMap = null;
  }

  private loadLayersFromGetCap(showRasterMarineWithAdditionalLayerForWestAfrica = false) {
    return this.layersApi.getLayersFromGetCap(showRasterMarineWithAdditionalLayerForWestAfrica).pipe(
      map(getCapInfo => {
        // Filter only 'base layer' from the getCap
        const baseLayerOptions = optionsFromCapabilities(getCapInfo,
          {
            layer: environment.carto.baseLayerId,
            crossOrigin: 'anonymous'
          }
        );

        const layersToAdd = [
          new CartoLayer(
            {
              name: 'OSM',
              olLayer: new TileLayer({
                source: new OSM()
              })
            }
          ),
          new CartoLayer({
            name: environment.carto.rasterMarineLayerName,
            olLayer: new TileLayer({
              source: new WMTS(baseLayerOptions)
            })
          })
        ];

        if (showRasterMarineWithAdditionalLayerForWestAfrica) {
          this.addWestAfricaRasterMarineLayer(layersToAdd, getCapInfo);
        }

        return this.layersState.addLayers(layersToAdd);
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

  addRasterMarineLayer(mapCarto: MapCarto, opacity: number): Observable<void> {
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

  addOrthoGeoLittoralV2Layer(mapCarto: MapCarto, opacity: number): void {
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

  removeLayer(mapCarto: MapCarto, layerName: string): void {
    const findLayer = name => mapCarto.layers.find(layer => layer.name === name);
    const layerToRemove = findLayer(layerName);
    if (layerToRemove) {
      mapCarto.removeLayer(layerToRemove);
    }
  }

}
