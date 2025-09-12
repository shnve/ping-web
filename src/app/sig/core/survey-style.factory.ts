import { Injectable } from '@angular/core';
import { SurveyDangerTypeOfValue } from '@app/survey/models/survey.model';
import { Feature } from 'ol';
import { Fill, Stroke, Style } from 'ol/style';
import Text from 'ol/style/Text';
import { BLUE_TOOL_STYLE_ALPHA, blueColor, setFeatureLabel, showFeatureLabel } from '../utils/feature';
import { MaritimeReportTypeStyleOptions } from '../utils/style';
import { MaritimeReportStyleFactory } from './maritime-report-style.factory';

export const RED_COLOR = '#FF0000';
export const ORANGE_COLOR = '#FFA500';
export const YELLOW_COLOR = '#FFFF00';
export const RED_DARK_COLOR = '#FF000025';
export const DARK_COLOR = '#000000FC'

@Injectable({
  providedIn: 'root'
})
export class SurveyStyleFactory extends MaritimeReportStyleFactory {
  private readonly surveyDetectionColor = {
    1: YELLOW_COLOR,
    2: ORANGE_COLOR,
    3: RED_COLOR
  };

  constructor() {
    super();
  }

  getStyleTextLabel(options: MaritimeReportTypeStyleOptions): Text {
    return new Text({
      text: '',
      scale: 1.2,
      font: '15px sans-serif',
      fill: new Fill({
        color: options?.text?.fillColor ?? '#FFF'
      }),
      stroke: new Stroke({
        color: options?.text?.strokeColor ?? DARK_COLOR,
        width: options?.text?.strokeWidth ?? 2,
      })
    });
  }

  setStyleForBathyGeometries(feature: Feature, value: number, typeOfValue: SurveyDangerTypeOfValue): void {
    feature.setStyle(typeOfValue === SurveyDangerTypeOfValue.DIFFERENCE ? BLUE_TOOL_STYLE_ALPHA : new Style());

    if (typeOfValue === SurveyDangerTypeOfValue.DEPTH) {
      const options: MaritimeReportTypeStyleOptions = {
        text: {
          baseline: 'middle',
          fillColor: blueColor,
          strokeColor: DARK_COLOR,
          strokeWidth: 3
        }
      };

      const detectionStyleText: Text = this.getStyleTextLabel(options);

      this.setAndDisplayFeatureLabel(feature, value.toString(), detectionStyleText, options);
    }
  }

  setStyleForDetection(feature: Feature, depthValue: number, color: number): void {
    feature.setStyle(new Style());
    const options: MaritimeReportTypeStyleOptions = {
      text: {
        baseline: 'middle',
        fillColor: this.surveyDetectionColor[color],
        strokeColor: '#00000066'
      }
    };

    const detectionStyleText: Text = this.getStyleTextLabel(options);

    this.setAndDisplayFeatureLabel(feature, depthValue.toString(), detectionStyleText, options);
  }

  setAndDisplayFeatureLabel(feature: Feature, label: string, styleText: Text, options: MaritimeReportTypeStyleOptions): void {
    setFeatureLabel(feature, label, styleText, options);
    showFeatureLabel(feature, true, false, styleText, options);
  }
}
