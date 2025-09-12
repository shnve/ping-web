import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { GeoregulationPartForm } from '@app/georegulation/models/georegulation.model';
import { SharedMapComponent } from '@app/shared/components/shared-map/shared-map.component';
import { MapComponent } from '@app/sig/components/map/map.component';
import { georegulationGeometryToolsStyle, otherPartsGeometryStyle, showFeatureLabel } from '@app/sig/utils/feature';
import { removePingLayers } from '@app/sig/utils/map';
import { environment } from '@env/environment.default';
import { CartoModulesOptions } from '@shom2/carto';
import { Extent } from 'ol/extent';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

const DRAWING_LAYER_ZINDEX_OTHER_PARTS = 500;

@Component({
  selector: 'georegulation-parts-map',
  templateUrl: './georegulation-parts-map.component.html',
  styleUrls: ['./georegulation-parts-map.component.scss']
})
export class GeoregulationPartsMapComponent extends SharedMapComponent implements AfterViewInit, OnChanges {
  @Input() featureParts?: GeoregulationPartForm[];
  @Input() featurePart: GeoregulationPartForm;
  @Input() georegulationId?: string;
  @Input() disabled = false;
  @Input() issuingServiceId: string;

  @ViewChild('map') map: MapComponent;

  showModal = false;

  selectedAreaExtent: Extent;

  modulesOptions: CartoModulesOptions;

  private readonly otherPartsGeometriesLayer = new VectorLayer({
    source: new VectorSource(),
    style: otherPartsGeometryStyle,
    zIndex: DRAWING_LAYER_ZINDEX_OTHER_PARTS
  });

  constructor(protected readonly areasFacade: AreasFacade,
    protected readonly alertMessages: AlertMessageService) {
    super(areasFacade, alertMessages);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.featurePart) {
      this.updateFormFromFeaturePart(this.featurePart);
    }
  }

  private changeGeomLayer(): void {
    if (this.disabled) { return; }
    this.map.carto.command('drawing.setLayer', this.geometriesLayer);
    this.map.setAvailableTools(environment.carto.availableTools.forGeometryMode);
  }

  mapLoaded(): void {
    this.geometriesLayer.setZIndex(environment.carto.drawingModule.drawingLayerZindex);
    this.map.carto.map.olMap.addLayer(this.otherPartsGeometriesLayer);

    this.geometriesLayer.getSource().forEachFeature(feature => showFeatureLabel(feature));
    removePingLayers(this.map.carto.map);

    this.map.centerOnFeatures(this.geometriesLayer);
  }

  private updateFormFromFeaturePart(part: GeoregulationPartForm): void {
    if (this.map) {
      this.changeGeomLayer();
    }

    this.geometriesLayer.getSource().clear();
    this.geometriesLayer.getSource().addFeatures(part.features);

    this.otherPartsGeometriesLayer.getSource().clear();

    // load features from other parts that are not in the selected featurePart.
    this.featureParts.forEach(featurePart => {
      if (part !== featurePart) {
        this.otherPartsGeometriesLayer.getSource().addFeatures(featurePart.features);
      }
    });

    // reset style
    this.resetStyle(this.otherPartsGeometriesLayer, otherPartsGeometryStyle);
    this.resetStyle(this.geometriesLayer, georegulationGeometryToolsStyle);

    if (this.map) {
      this.map.centerOnFeatures(this.geometriesLayer);
    }
  }

  chooseAndImportKml(): void {
    super.chooseAndImportKml(this.geometriesLayer, georegulationGeometryToolsStyle);
  }
}
