import {
  Component,
  ElementRef,
  Input
} from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Warning } from '@app/models/warning.model';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { DetailsMapComponent } from '@app/shared/components/details-map/details-map.component';
import { MaritimeEntityFactory } from '@app/sig/core/maritime-entity.factory';
import { FEATURE_LABEL_PROPERTY, VERTEX_LABELS_PROPERTY, setFeatureLabel, setVertexLabels } from '@app/sig/utils/feature';
import { showHideLayers, showHideZoneX } from '@app/sig/utils/map';
import { TranslateService } from '@ngx-translate/core';
import { WarningStyleFactory } from '@sig/core/warning-style.factory';
import { LayersFacade } from '@sig/facades/layers.facade';
import { MousePositionFormatterService } from '@sig/services/mouse-position-formatter.service';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';

@Component({
  selector: 'sig-warning-detail-map',
  templateUrl: '../../../shared/components/details-map/details-map.component.html',
  styleUrls: ['../../../shared/components/details-map/details-map.component.scss']
})
export class WarningDetailMapComponent extends DetailsMapComponent {

  @Input() modelItem: Warning;

  constructor(protected readonly layersFacade: LayersFacade,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly mousePositionFormatter: MousePositionFormatterService,
    protected readonly translate: TranslateService,
    protected readonly styleFactory: WarningStyleFactory,
    protected readonly element: ElementRef,
    protected readonly authService: AuthService,
    protected readonly maritimeEntityFactory: MaritimeEntityFactory,
    protected readonly maritimeEntityService: MaritimeEntitiesService) {
    super(layersFacade, alertMessageService, mousePositionFormatter, translate, element, authService, maritimeEntityFactory, maritimeEntityService);
  }

  protected showLayersIfRequired(show: boolean): void {
    if (this.carto?.map) { showHideLayers(this.carto.map, show, false, this.modelItem.nameOfSeries); }
  }

  protected showZoneXIfRequired(show: boolean): void {
    if (this.carto?.map) { showHideZoneX(this.carto.map, show); }
  }

  protected getAllFeatures(featurePart: any): Feature[] {
    return [...featurePart.geometries, ...featurePart.affectedAreas];
  }

  /**
  * Apply "highlight style" to all features to highlight
  */
  protected doHighlightingFeatures() {
    if (this.previousHighlightedFeatures.geometries) {
      this.previousHighlightedFeatures.geometries.forEach(
        this.applyStyleToFeature.bind(this, this.styleFactory.getStyleForGeometry)
      );
      this.previousHighlightedFeatures.affectedAreas.forEach(
        this.applyStyleToFeature.bind(this, this.styleFactory.getStyleForAffectedArea)
      );
    }
    // Set features as previous features
    this.previousHighlightedFeatures = {
      geometries: [...this.featuresToHighlight.geometries],
      affectedAreas: [...this.featuresToHighlight.affectedAreas]
    };
    if (!this.modelItem) {
      return;
    }
    this.featuresToHighlight.geometries.forEach(
      this.applyStyleToFeature.bind(this, this.styleFactory.getRollOverStyleForGeometry)
    );
    this.featuresToHighlight.affectedAreas.forEach(
      this.applyStyleToFeature.bind(this, this.styleFactory.getRollOverStyleForAffectedArea)
    );
  }

  protected applyStyleToFeature(styleFunction: () => Style[], feature: Feature) {
    feature.setStyle(
      styleFunction.call(
        this.styleFactory,
        this.modelItem.globalWarningType,
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
