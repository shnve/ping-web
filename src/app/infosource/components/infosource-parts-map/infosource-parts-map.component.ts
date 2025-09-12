import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { InfosourcePartForm } from '@app/infosource/models/infosource.model';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { SharedMapComponent } from '@app/shared/components/shared-map/shared-map.component';
import { MapComponent } from '@app/sig/components/map/map.component';
import { infosourceGeometryToolsStyle, otherPartsGeometryStyle, showFeatureLabel } from '@app/sig/utils/feature';
import { removePingLayers } from '@app/sig/utils/map';
import { environment } from '@env/environment';
import { Extent } from 'ol/extent';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';

const DRAWING_LAYER_ZINDEX_OTHER_PARTS = 500;

@Component({
  selector: 'infosource-parts-map',
  templateUrl: './infosource-parts-map.component.html',
  styleUrls: ['./infosource-parts-map.component.scss']
})
export class InfosourcePartsMapComponent extends SharedMapComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('map') map: MapComponent;
  @Input() featurePart: InfosourcePartForm;
  @Input() featureParts: InfosourcePartForm[] = [];
  @Input() serieName: string;
  @Input() serieId: string;
  @Output() eventOnFeature = new EventEmitter<VectorSourceEvent<Geometry>>();

  selectedGeomAreaOption = 'geometries';
  selectGeomAreaOptions: Array<SelectButtonOption> = [
    { code: 'geometries', translateKey: 'admin-warning.creation.labels.select-geom.geometries' }
  ];
  otherPartsGeometriesLayer = new VectorLayer({
    source: new VectorSource(),
    style: otherPartsGeometryStyle,
    zIndex: DRAWING_LAYER_ZINDEX_OTHER_PARTS
  });

  selectedAreaExtent: Extent;
  callbackFeatureEvent: (evt: any) => void;

  constructor(protected readonly areasFacade: AreasFacade,
    protected readonly alertMessages: AlertMessageService) {
    super(areasFacade, alertMessages);

    this.callbackFeatureEvent = evt => this.eventOnFeature.emit(evt);
  }

  ngOnDestroy(): void {
    this.removeFeatureEventsHandler();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.featurePart) {
      this.updateFormFromFeaturePart(this.featurePart);
    }
  }

  changeGeomArea(): void {
    this.map?.carto?.command('drawing.setLayer', this.geometriesLayer);
    this.map?.setAvailableTools(environment.carto.availableTools.forGeometryMode);
  }

  mapLoaded(): void {
    this.map.carto.map.olMap.addLayer(this.otherPartsGeometriesLayer);
    if (this.featurePart.geometries) {
      this.changeGeomArea();
    }

    this.addFeatureEventsHandler();

    this.geometriesLayer.getSource().forEachFeature((feature: Feature<Geometry>) => showFeatureLabel(feature));
    removePingLayers(this.map.carto.map);

    this.map.centerOnFeatures(this.geometriesLayer);
  }

  private addFeatureEventsHandler(): void {
    this.geometriesLayer.getSource().on('addfeature', this.callbackFeatureEvent);
    this.geometriesLayer.getSource().on('removefeature', this.callbackFeatureEvent);
  }

  private removeFeatureEventsHandler(): void {
    if (!this.geometriesLayer.getSource()) { return; }
    this.geometriesLayer.getSource().un('addfeature', this.callbackFeatureEvent);
    this.geometriesLayer.getSource().un('removefeature', this.callbackFeatureEvent);
  }

  updateFormFromFeaturePart(part: InfosourcePartForm): void {
    if (this.map) {
      this.changeGeomArea();
    }
    this.geometriesLayer.getSource().clear(true);
    this.geometriesLayer.getSource()?.addFeatures(part.geometries);

    this.otherPartsGeometriesLayer.getSource().clear();

    this.featureParts.forEach(featurePart => {
      if (part !== featurePart) {
        this.otherPartsGeometriesLayer.getSource().addFeatures(featurePart.geometries);
      }
    });

    // reset style
    this.resetStyle(this.otherPartsGeometriesLayer, otherPartsGeometryStyle);
    this.resetStyle(this.geometriesLayer, infosourceGeometryToolsStyle);

    this.map?.centerOnFeatures(this.geometriesLayer);
  }

  chooseAndImportKml(): void {
    super.chooseAndImportKml(this.geometriesLayer, infosourceGeometryToolsStyle);
  }
}
