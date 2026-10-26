import { Injectable } from '@angular/core';
import { Feature } from 'ol';
import { Fill, Icon, Stroke, Style, Text, Circle } from 'ol/style';

@Injectable({
  providedIn: 'root'
})
export class S52CartographyStyleFactory {

  constructor() { }

  /**
   * StyleFunction para capas cartográficas S-57 (Sondajes, Boyas, etc.)
   */
  public getStyleFunction() {
    return (feature: Feature, resolution: number): Style | Style[] => {
      // Intentamos extraer el token o tipo de la entidad
      // El backend en GeoServer normalmente los exporta como properties del GeoJSON
      const type = feature.get('type') || feature.get('TYPE') || 'unknown';
      const token = feature.get('token') || feature.get('TOKEN') || feature.get('SY') || null;

      // 1. Si es un sondaje (SOUNDG en S-57)
      if (type.toLowerCase() === 'sounding' || type.toLowerCase() === 'soundg' || token === 'SOUNDG' || feature.get('depth') !== undefined) {
        let depthVal = feature.get('depth');
        if (depthVal === undefined) {
          depthVal = '0.0';
        }

        // Parsear el número a float para un mejor display
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
          // Para asegurar que los textos participen en el declutter
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

      // 3. Fallback genérico para cualquier otro punto no reconocido
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
