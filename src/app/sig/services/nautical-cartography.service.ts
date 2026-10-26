import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

@Injectable({
  providedIn: 'root'
})
export class NauticalCartographyService {

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
        // request WFS with bbox strategy
        return `${geoServerWfsUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=pisac_shn:detalles_wfs&outputFormat=application/json&srsname=EPSG:4326&bbox=${extent.join(',')},EPSG:4326`;
      },
      strategy: bboxStrategy
    });
  }
}
