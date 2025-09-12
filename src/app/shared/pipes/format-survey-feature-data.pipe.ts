import { Pipe, PipeTransform } from '@angular/core';
import { DEFAULT_NUMERIC_VALUE, FEATURE_PROPERTY_DEPTH, FEATURE_PROPERTY_DIFFERENCE, FEATURE_PROPERTY_NATURE, FeatureType } from '@app/sig/utils/feature';
import { GeometryType } from '@app/sig/utils/geometry';
import { SurveyDanger, SurveyDangerTypeOfValue } from '@app/survey/models/survey.model';
import { TranslateService } from '@ngx-translate/core';
import SimpleGeometry from 'ol/geom/SimpleGeometry';

const POINT_INFO_SUFFIX_LABEL = 'danger-type-point-info';
const POLYGON_INFO_SUFFIX_LABEL = 'danger-type-polygon-info';

@Pipe({
  name: 'formatSurveyFeatureData'
})
export class FormatSurveyFeatureDataPipe implements PipeTransform {

  constructor(private readonly translate: TranslateService) { }

  transform(surveyFeatureData: SurveyDanger | SimpleGeometry, type: FeatureType): string {
    let dangerType;
    let value;

    switch (type) {
      case FeatureType.DANGER:
        const danger = (surveyFeatureData as SurveyDanger);
        dangerType = danger.typeOfValue === SurveyDangerTypeOfValue.DEPTH ? POINT_INFO_SUFFIX_LABEL : POLYGON_INFO_SUFFIX_LABEL;
        dangerType += '-' + danger.nature.toLowerCase();
        value = danger.value;
        break;

      case FeatureType.SIMPLE_GEOMETRY:
        const geom = surveyFeatureData as SimpleGeometry;
        const isPoint = geom.getType() === GeometryType.POINT;
        dangerType = isPoint ? POINT_INFO_SUFFIX_LABEL : POLYGON_INFO_SUFFIX_LABEL;
        const nature = geom.get(FEATURE_PROPERTY_NATURE);
        dangerType += '-' + (nature ?? 'depth').toLowerCase();
        value = isPoint ? geom.get(FEATURE_PROPERTY_DEPTH) : geom.get(FEATURE_PROPERTY_DIFFERENCE);
        break;

      default:
        break;
    }
    return this.translate.instant(`survey.details.overlay.${dangerType}`).replace('{{value}}', value ?? DEFAULT_NUMERIC_VALUE);
  }
}
