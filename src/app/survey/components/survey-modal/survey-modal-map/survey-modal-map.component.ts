import { Component, ElementRef, Input } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { DetailsMapComponent, MODEL_EXTENT_MULTIPLIER } from '@app/shared/components/details-map/details-map.component';
import { DEFAULT_Z_INDEX } from '@app/sig/components/map/map.component';
import { MaritimeEntityFactory } from '@app/sig/core/maritime-entity.factory';
import { SurveyDangerFactory } from '@app/sig/core/survey-danger.factory';
import { SurveyStyleFactory } from '@app/sig/core/survey-style.factory';
import { LayersFacade } from '@app/sig/facades/layers.facade';
import { MousePositionFormatterService } from '@app/sig/services/mouse-position-formatter.service';
import { scaleExtent } from '@app/sig/utils/extent';
import { SurveyDetails } from '@app/survey/models/survey.model';
import { TranslateService } from '@ngx-translate/core';
import Feature from 'ol/Feature';
import { createEmpty, extend } from 'ol/extent';
import Geometry from 'ol/geom/Geometry';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';

@Component({
  selector: 'survey-modal-map',
  templateUrl: '../../../../shared/components/details-map/details-map.component.html',
  styleUrls: ['../../../../shared/components/details-map/details-map.component.scss']
})
export class SurveyModalMapComponent extends DetailsMapComponent {

  @Input() modelItem: SurveyDetails;

  constructor(protected readonly layersFacade: LayersFacade,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly mousePositionFormatter: MousePositionFormatterService,
    protected readonly translate: TranslateService,
    protected readonly styleFactory: SurveyStyleFactory,
    protected readonly surveyFactory: SurveyDangerFactory,
    protected readonly element: ElementRef,
    protected readonly authService: AuthService,
    protected readonly maritimeEntityFactory: MaritimeEntityFactory,
    protected readonly maritimeEntityService: MaritimeEntitiesService) {
    super(layersFacade, alertMessageService, mousePositionFormatter, translate, element, authService, maritimeEntityFactory, maritimeEntityService);
  }

  protected getAllFeatures(featurePart: any): Feature[] {
    this.setDangerAndDetectionsFromModelItem();

    if (this.shouldShowDangers && this.shouldShowDetections) {
      this.setDangerAndDetectionFeatures(featurePart);
      return [...featurePart.dangers, ...featurePart.detections];
    }

    if (!this.shouldShowDangers && !this.shouldShowDetections) {
      return [];
    }

    return [...this.shouldShowDangers ? featurePart.dangers : featurePart.detections];
  }

  private setDangerAndDetectionsFromModelItem(): void {
    this.allDangers = this.shouldShowDangers ? this.modelItem.surveyExternalAnalysisResults?.dangers : [];
    this.allDetections = this.shouldShowDetections ? this.modelItem.surveyExternalAnalysisResults?.detections : [];
  }

  private setDangerAndDetectionFeatures(featurePart: any): void {
    this.dangerFeatures = [...featurePart.dangers];
    this.detectionFeatures = [...featurePart.detections];
  }

  protected doHighlightingFeatures(): void { }

  protected showLayersIfRequired(show: boolean): void { }

  protected applyStyleToFeature(styleFunction: () => Style[], feature: Feature): void {
    feature.setStyle(
      styleFunction.call(
        this.styleFactory,
        this.modelItem.surveyExternalAnalysisResults.dangers,
        feature.getGeometry().getType()
      )
    );
  }

  protected displayBoundingBoxOnTheMapIfPresent(): void {
    const boundingBox = this.modelItem.boundingBox;
    if (!boundingBox) { return; }

    this.vectorSourceBoundingBox = new VectorSource<Geometry>();
    this.vectorLayerBoundingBox = new VectorLayer({ zIndex: DEFAULT_Z_INDEX - 5 });
    this.map?.olMap?.addLayer(this.vectorLayerBoundingBox);

    this.vectorSourceBoundingBox.clear(true);

    const boundingBoxFeature = this.surveyFactory.createBoundingBoxGeometry(boundingBox);
    this.vectorSourceBoundingBox.addFeature(boundingBoxFeature);
    this.vectorLayerBoundingBox.setSource(this.vectorSourceBoundingBox);
    const globalExtent = extend(createEmpty(), boundingBoxFeature.getGeometry().getExtent());
    this.modelExtent = scaleExtent(globalExtent, MODEL_EXTENT_MULTIPLIER);
    this.isBoundingBoxPresent = true;
    this.fitToModelItem();
  }
}
