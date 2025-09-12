import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FeaturePart } from '@app/admin/admin-warning/models/creation-warning.model';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { InfosourceFeaturePart } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { MainWarningPart } from '@app/models/warning.model';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { SharedMapComponent } from '@app/shared/components/shared-map/shared-map.component';
import { MapComponent } from '@app/sig/components/map/map.component';
import { infosourceGeometryToolsStyle, showFeatureLabel } from '@app/sig/utils/feature';
import { removePingLayers } from '@app/sig/utils/map';
import { SurveyDetection } from '@app/survey/models/survey.model';
import { environment } from '@env/environment';
import { Extent } from 'ol/extent';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { VectorSourceEvent } from 'ol/source/Vector';

@Component({
  selector: 'infosource-map',
  templateUrl: './infosource-map.component.html',
  styleUrls: ['./infosource-map.component.scss'],
  providers: [infosourceServiceProvider]
})
export class InfosourceMapComponent extends SharedMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('map') map: MapComponent;
  showModal = false;
  @Input() featureParts?: FeaturePart[];

  warnings: Partial<MainWarningPart>[];
  @Input() featurePart: InfosourceFeaturePart;
  @Input() serieName: string;
  @Input() infosourceId?: string;
  @Input() surveyDetections: SurveyDetection[];
  @Output() eventOnFeature = new EventEmitter<VectorSourceEvent<Geometry>>();
  selectedGeomAreaOption = 'geometries';
  selectGeomAreaOptions: Array<SelectButtonOption> = [
    { code: 'geometries', translateKey: 'admin-warning.creation.labels.select-geom.geometries' }
  ];

  selectedAreaExtent: Extent;
  callbackFeatureEvent: (evt: any) => void;

  constructor(protected readonly areasFacade: AreasFacade,
    protected readonly alertMessages: AlertMessageService,
    protected readonly authService: AuthService) {
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
    this.map.carto.command('drawing.setLayer', this.geometriesLayer);
    this.map.setAvailableTools(environment.carto.availableTools.forGeometryMode);
  }

  mapLoaded(): void {
    this.geometriesLayer.setZIndex(environment.carto.drawingModule.drawingLayerZindex);

    this.addFeatureEventsHandler();

    this.geometriesLayer.getSource().forEachFeature((feature: Feature<Geometry>) => showFeatureLabel(feature));
    removePingLayers(this.map.carto.map);

    if (!this.geometriesLayer.getSource().getFeatures()?.length && !!this.surveyDetections?.length) {
      this.map?.centerOnFeatures(this.map?.vectorLayerDetections);
    } else {
      this.map?.centerOnFeatures(this.geometriesLayer);
    }
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

  displayWarningModal(warnings?: Partial<MainWarningPart>[]) {
    const hasWarning: boolean = warnings.some(warning => warning?.id);
    if (hasWarning) {
      this.warnings = warnings;
      this.showModal = true;
    }
  }

  updateFormFromFeaturePart(part: InfosourceFeaturePart): void {
    if (!part?.geometries.length) { return; }

    this.geometriesLayer.getSource().clear();
    this.geometriesLayer.getSource().addFeatures(part.geometries);

    // reset style
    this.resetStyle(this.geometriesLayer, infosourceGeometryToolsStyle);
    this.map?.centerOnFeatures(this.geometriesLayer);
  }

  chooseAndImportKml(): void {
    super.chooseAndImportKml(this.geometriesLayer, infosourceGeometryToolsStyle);
  }
}
