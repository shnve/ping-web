import { Component, ElementRef, Input } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { InfosourceWithParts } from '@app/infosource/models/infosource.model';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { DetailsMapComponent } from '@app/shared/components/details-map/details-map.component';
import { InfosourceStyleFactory } from '@app/sig/core/infosource-style.factory';
import { MaritimeEntityFactory } from '@app/sig/core/maritime-entity.factory';
import { LayersFacade } from '@app/sig/facades/layers.facade';
import { MousePositionFormatterService } from '@app/sig/services/mouse-position-formatter.service';
import { FEATURE_LABEL_PROPERTY, VERTEX_LABELS_PROPERTY, setFeatureLabel, setVertexLabels } from '@app/sig/utils/feature';
import { TranslateService } from '@ngx-translate/core';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';

@Component({
  selector: 'infosource-details-map',
  templateUrl: '../../../shared/components/details-map/details-map.component.html',
  styleUrls: ['../../../shared/components/details-map/details-map.component.scss']
})
export class InfosourceDetailsMapComponent extends DetailsMapComponent {

  @Input() modelItem: InfosourceWithParts;

  constructor(protected readonly layersFacade: LayersFacade,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly mousePositionFormatter: MousePositionFormatterService,
    protected readonly translate: TranslateService,
    protected readonly styleFactory: InfosourceStyleFactory,
    protected readonly element: ElementRef,
    protected readonly authService: AuthService,
    protected readonly maritimeEntityFactory: MaritimeEntityFactory,
    protected readonly maritimeEntityService: MaritimeEntitiesService) {
    super(layersFacade, alertMessageService, mousePositionFormatter, translate, element, authService, maritimeEntityFactory, maritimeEntityService);
  }

  protected getAllFeatures(featurePart: any): Feature[] {
    if (this.shouldShowDetections) {
      return [...featurePart.localisation, ...featurePart.detections];
    }

    return [...featurePart.localisation];
  }

  /**
  * Apply "highlight style" to all features to highlight
  */
  protected doHighlightingFeatures() {
    if (this.previousHighlightedFeatures.localisation) {
      this.previousHighlightedFeatures.localisation.forEach(
        this.applyStyleToFeature.bind(this, this.styleFactory.getStyleForLocalisation)
      );
    }
    // Set features as previous features
    this.previousHighlightedFeatures = {
      localisation: [...this.featuresToHighlight.localisation]
    };
    if (!this.modelItem) {
      return;
    }
    this.featuresToHighlight.localisation.forEach(
      this.applyStyleToFeature.bind(this, this.styleFactory.getRollOverStyleForLocalisation)
    );
  }

  protected showLayersIfRequired(show: boolean): void { }

  protected applyStyleToFeature(styleFunction: () => Style[], feature: Feature) {
    feature.setStyle(
      styleFunction.call(
        this.styleFactory,
        feature.getGeometry().getType()
      )
    );
    const currentLabels = feature.get(VERTEX_LABELS_PROPERTY);
    if (currentLabels) {
      setVertexLabels(feature, currentLabels);
    }

    const featureLabel = feature.get(FEATURE_LABEL_PROPERTY);
    if (featureLabel) {
      setFeatureLabel(feature, featureLabel);
    }
  }
}
