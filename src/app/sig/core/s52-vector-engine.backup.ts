import { Injectable } from '@angular/core';
import { Feature } from 'ol';
import { Fill, Icon, Stroke, Style, Text, Circle } from 'ol/style';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { TileWMS } from 'ol/source';
// import { NauticalCartographyService } from '../services/nautical-cartography.service';

/**
 * BACKUP DEL MOTOR VECTORIAL S-52
 * PropÃ³sito: AnÃ¡lisis dinÃ¡mico y procesamiento de profundidades en WFS.
 * Los usuarios la requerirÃ¡n en fases avanzadas.
 */

@Injectable({
  providedIn: 'root'
})
export class S52CartographyStyleFactory {

  constructor() { }

  /**
   * StyleFunction para capas cartogrÃ¡ficas S-57 (Sondajes, Boyas, etc.)
   */
  public getStyleFunction() {
    return (feature: Feature, resolution: number): Style | Style[] => {
      const type = feature.get('type') || feature.get('TYPE') || 'unknown';
      const token = feature.get('token') || feature.get('TOKEN') || feature.get('SY') || null;

      // 1. Si es un sondaje (SOUNDG en S-57)
      if (type.toLowerCase() === 'sounding' || type.toLowerCase() === 'soundg' || token === 'SOUNDG' || feature.get('depth') !== undefined) {
        let depthVal = feature.get('depth');
        if (depthVal === undefined) {
          depthVal = '0.0';
        }

        const depthNum = parseFloat(depthVal);
        const depthStr = isNaN(depthNum) ? depthVal.toString() : depthNum.toFixed(1);

        return new Style({
          text: new Text({
            text: depthStr,
            font: 'bold 12px Arial, sans-serif',
            fill: new Fill({ color: '#001a33' }), // azul marino oscuro
            stroke: new Stroke({ color: 'rgba(255, 255, 255, 0.9)', width: 3 }), // borde blanco
            offsetX: 0,
            offsetY: 0
          }),
          zIndex: 1
        });
      }

      // 2. Si es una entidad puntual (Boya, Baliza, Faro, etc.)
      if (token) {
        const fallbackStyle = new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'black', width: 1 })
          }),
          zIndex: 0
        });

        const iconStyle = new Style({
          image: new Icon({
            src: `assets/nautical-icons/${token}.svg`,
            scale: 1, 
            crossOrigin: 'anonymous',
          }),
          zIndex: 2
        });

        return [fallbackStyle, iconStyle];
      }

      // 3. Fallback genÃ©rico para cualquier otro punto no reconocido
      return new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({ color: '#CCCCCC' }),
          stroke: new Stroke({ color: 'black', width: 1 })
        }),
        zIndex: 0
      });
    };
  }
}

/**
 * EJEMPLO ARCHIVADO DE CAPAS WMS/WFS
 *
 *      // 2. Capa Regional: Carta General de Venezuela
 *      const regionalLayer = new CartoLayer({
 *        name: 'Capa_Regional_VE200002',
 *        olLayer: new TileLayer({
 *          source: new TileWMS({
 *            url: 'http://localhost:8082/geoserver/pisac_shn/wms',
 *            params: { 'LAYERS': 'pisac_shn:VE200002', 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png' },
 *            serverType: 'geoserver',
 *            crossOrigin: 'anonymous'
 *          }),
 *          minZoom: 5,
 *          maxZoom: 9,
 *          zIndex: 1
 *        })
 *      });
 *
 *      // 3. Capa de Detalle (WMS Base): Cartas de Detalle / Puertos
 *      const detalleLayer = new CartoLayer({
 *        name: 'Capa_Detalle_VE3_VE6',
 *        olLayer: new TileLayer({
 *          source: new TileWMS({
 *            url: 'http://localhost:8082/geoserver/pisac_shn/wms',
 *            params: { 'LAYERS': 'pisac_shn:VE3_VE6_Detalle', 'TILED': true, 'TRANSPARENT': true, 'FORMAT': 'image/png' },
 *            serverType: 'geoserver',
 *            crossOrigin: 'anonymous'
 *          }),
 *          minZoom: 9,
 *          zIndex: 2
 *        })
 *      });
 *
 *      // 4. Capa WFS de Detalles (S-52 decluttering)
 *      const wfsDetailsLayer = new CartoLayer({
 *        name: 'Capa_Detalle_WFS_S52',
 *        olLayer: new VectorLayer({
 *          source: this.nauticalCartographyService.getWfsDetailsSource(),
 *          style: this.s52StyleFactory.getStyleFunction(),
 *          declutter: true,
 *          minZoom: 9,
 *          zIndex: 3
 *        })
 *      });
 */
