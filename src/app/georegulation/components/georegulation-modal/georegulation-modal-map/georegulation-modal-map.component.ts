import { Component, ElementRef, Input } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { GeoregulationPartModalDetails, MapGeoregulation } from '@app/georegulation/models/georegulation.model';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { DetailsMapComponent } from '@app/shared/components/details-map/details-map.component';
import { GeoregulationStyleFactory } from '@app/sig/core/georegulation-style.factory';
import { MaritimeEntityFactory } from '@app/sig/core/maritime-entity.factory';
import { LayersFacade } from '@app/sig/facades/layers.facade';
import { MousePositionFormatterService } from '@app/sig/services/mouse-position-formatter.service';
import { FEATURE_LABEL_PROPERTY, VERTEX_LABELS_PROPERTY, setFeatureLabel, setVertexLabels } from '@app/sig/utils/feature';
import { TranslateService } from '@ngx-translate/core';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';

@Component({
  selector: 'georegulation-modal-map',
  templateUrl: '../../../../shared/components/details-map/details-map.component.html',
  styleUrls: ['../../../../shared/components/details-map/details-map.component.scss']
})
export class GeoregulationModalMapComponent extends DetailsMapComponent {

  @Input() modelItem: MapGeoregulation;

  constructor(protected readonly layersFacade: LayersFacade,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly mousePositionFormatter: MousePositionFormatterService,
    protected readonly translate: TranslateService,
    protected readonly styleFactory: GeoregulationStyleFactory,
    protected readonly element: ElementRef,
    protected readonly authService: AuthService,
    protected readonly maritimeEntityFactory: MaritimeEntityFactory,
    protected readonly maritimeEntityService: MaritimeEntitiesService) {
    super(layersFacade, alertMessageService, mousePositionFormatter, translate, element, authService, maritimeEntityFactory, maritimeEntityService);
  }

  protected getAllFeatures(featurePart: GeoregulationPartModalDetails): Feature[] {
    return [...featurePart.features];
  }

  protected doHighlightingFeatures(): void {
    this.previousHighlightedFeatures.features?.forEach(
      this.applyStyleToFeature.bind(this, this.styleFactory.getStyleForGeometry)
    );
    this.previousHighlightedFeatures = {
      features: [...this.featuresToHighlight.features]
    };

    if (!this.modelItem) {
      return;
    }

    this.featuresToHighlight.features.forEach(
      this.applyStyleToFeature.bind(this, this.styleFactory.getRollOverStyleForGeometry)
    );
  }

  protected showLayersIfRequired(show: boolean): void { }

  protected applyStyleToFeature(styleFunction: () => Style[], feature: Feature): void {
    feature.setStyle(
      styleFunction.call(
        this.styleFactory,
        this.modelItem.isTemporary,
        this.modelItem.isNew,
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
