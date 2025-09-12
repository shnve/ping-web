import { Injectable } from '@angular/core';
import { Feature } from 'ol';
import { Fill, Stroke } from 'ol/style';
import Text from 'ol/style/Text';
import { GREY_BLUE_TOOL_STYLE_ALPHA, setFeatureLabel, showFeatureLabel } from '../utils/feature';
import { MaritimeReportTypeStyleOptions } from '../utils/style';
import { MaritimeReportStyleFactory } from './maritime-report-style.factory';

export const ORANGE_COLOR = '#FFA500';
export const DARK_COLOR = '#000000FC'

@Injectable({
  providedIn: 'root'
})
export class MaritimeEntityStyleFactory extends MaritimeReportStyleFactory {

  constructor() {
    super();
  }

  getStyleTextLabel(options: MaritimeReportTypeStyleOptions): Text {
    return new Text({
      text: '',
      scale: 1,
      font: '12px Marianne, arial, sans-serif',
      fill: new Fill({
        color: options?.text?.fillColor ?? '#FFF'
      }),
      stroke: new Stroke({
        color: options?.text?.strokeColor ?? DARK_COLOR,
        width: options?.text?.strokeWidth ?? 1,
      })
    });
  }

  setFeatureStyle(feature: Feature, label: string): void {
    feature.setStyle(GREY_BLUE_TOOL_STYLE_ALPHA);
    const options: MaritimeReportTypeStyleOptions = {
      text: {
        baseline: 'middle',
        fillColor: DARK_COLOR,
        strokeColor: '#00000066'
      }
    };

    const featureStyleText = this.getStyleTextLabel(options);

    this.setAndDisplayFeatureLabel(feature, label, featureStyleText, options);
  }

  setAndDisplayFeatureLabel(feature: Feature, label: string, styleText: Text, options: MaritimeReportTypeStyleOptions): void {
    setFeatureLabel(feature, label, styleText, options);
    showFeatureLabel(feature, true, false, styleText, options);
  }
}
