import { environment } from '@env/environment';
import Layer from '@shom2/carto/core/Layer';
import { default as MapCarto } from '@shom2/carto/core/Map';
import { metersToKms, metersToNMiles } from '@shom2/carto/utils/conversions';
import { Image } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { ImageWMS } from 'ol/source';
import VectorSource from 'ol/source/Vector';

const KM_FRACTION_DIGITS = environment.carto.drawingModule.formatFunction.milesNautiqueFractionDigits;
const MILES_NAUTIQUES_FRACTION_DIGITS = environment.carto.drawingModule.formatFunction.milesNautiqueFractionDigits;

export const PING_LAYER_NAME_PREFIX = 'ping:';

export function showHideLayers(map: MapCarto, shouldShow = true, parentLayers = true, serieName = ''): void {

  const formattedSerieName = serieName.replace('Brest', 'BREST');
  const nameToId = name => name.replace(/\s/g, '_').toLowerCase();

  const layerType = parentLayers ? environment.carto.getWmsImage.layers.subAreasParents : environment.carto.getWmsImage.layers.subAreasSeries;
  const name = parentLayers ? layerType : `${environment.carto.getWmsImage.layers.subAreasSeries}_${nameToId(formattedSerieName)}`;

  if (shouldShow) {
    const mandatoryParams = { 'LAYERS': layerType };
    let optionalParams = {};
    if (!parentLayers) {
      optionalParams = { 'viewparams': environment.carto.getWmsImage.layers.viewParamsSerieNamePrefix + formattedSerieName };
    }
    const layer = new Layer({
      name,
      olLayer: new Image({
        source: new ImageWMS({
          url: environment.carto.getWmsImage.url,
          params: { ...mandatoryParams, ...optionalParams },
          ratio: environment.carto.getWmsImage.ratio
        })
      })
    });
    map.addLayer(layer);
  } else {
    const layerToRemove = map.layers.find(layer => layer.name === name);
    if (layerToRemove) {
      map.removeLayer(layerToRemove);
    }
  }
}

export function showHideZoneX(map: MapCarto, shouldShow = true): void {

  const name = environment.carto.getCswImage.name;

  if (shouldShow) {
    const url = environment.carto.getCswImage.url.replace('{{key}}', environment.baseMapKey);
    const params = { 'LAYERS': environment.carto.getCswImage.name };
    const layer = new Layer({
      name,
      olLayer: new Image({
        source: new ImageWMS({
          url,
          params
        })
      })
    });
    map.addLayer(layer);
  } else {
    const layerToRemove = map.layers.find(layer => layer.name === name);
    if (layerToRemove) {
      map.removeLayer(layerToRemove);
    }
  }
}

export function removePingLayers(map: MapCarto): void {
  map.layers.filter(layer => layer.name?.startsWith(PING_LAYER_NAME_PREFIX)).forEach(layerToRemove => map.removeLayer(layerToRemove));
}

/**
 * Function for formatting the radius value displayed in the tooltip
 *
 * @param {number} sphereRadius radius value
 * @return {string} the text to display in the tooltip
 */
export const circleRadiusFormatFunction = function (sphereRadius: number): string {
  return `${this.i18n.dict.MEASUREMENT_RADIUS_RESULT} ${metersToKms(sphereRadius)
    .toFixed(KM_FRACTION_DIGITS)}
           ${this.i18n.dict.KILOMETERS}
           (${metersToNMiles(sphereRadius)
      .toFixed(MILES_NAUTIQUES_FRACTION_DIGITS)}
           ${this.i18n.dict.NAUTIC_MILES})`;
};

export function removeLayer(vectorLayer: VectorLayer<VectorSource>, map: MapCarto): void {
  if (map?.olMap?.getLayers()?.getArray()?.find(layer => layer === vectorLayer)) {
    map.olMap.removeLayer(vectorLayer);
  }
}

export function addLayer(vectorLayer: VectorLayer<VectorSource>, map: MapCarto): void {
  if (map?.olMap?.getLayers() && !map.olMap.getLayers().getArray()?.find(layer => layer === vectorLayer)) {
    map.olMap.addLayer(vectorLayer);
  }
}
