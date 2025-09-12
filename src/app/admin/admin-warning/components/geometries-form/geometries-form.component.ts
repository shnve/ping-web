import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { SharedMapComponent } from '@app/shared/components/shared-map/shared-map.component';
import { MapComponent } from '@app/sig/components/map/map.component';
import {
  affectedAreaToolsStyle, geometryToolsStyle, otherPartsAffectedAreaStyle, otherPartsGeometryStyle, showFeatureLabel
} from '@app/sig/utils/feature';
import { removePingLayers } from '@app/sig/utils/map';
import { environment } from '@env/environment';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { FeaturePart } from '../../models/creation-warning.model';

const DRAWING_LAYER_ZINDEX_OTHER_PARTS = 500;


@Component({
  selector: 'aw-geometries-form',
  templateUrl: './geometries-form.component.html',
  styleUrls: ['./geometries-form.component.scss']
})
export class GeometriesFormComponent extends SharedMapComponent implements OnChanges, AfterViewInit {
  @ViewChild('map') map: MapComponent;
  @Input() featurePart: FeaturePart;
  @Input() featureParts: FeaturePart[];
  @Input() serieName: string;
  @Input() serieId: string;

  selectedGeomAreaOption = 'geometries';
  selectGeomAreaOptions: Array<SelectButtonOption> = [
    { code: 'geometries', translateKey: 'admin-warning.creation.labels.select-geom.geometries' },
    { code: 'affectedAreas', translateKey: 'admin-warning.creation.labels.select-geom.affected-areas' }
  ];
  affectedAreasSource = new VectorSource();
  affectedAreasLayer = new VectorLayer({ source: this.affectedAreasSource });
  otherPartsGeometriesLayer = new VectorLayer({
    source: new VectorSource(),
    style: otherPartsGeometryStyle,
    zIndex: DRAWING_LAYER_ZINDEX_OTHER_PARTS
  });
  otherPartsAffectedAreasLayer = new VectorLayer({
    source: new VectorSource(),
    style: otherPartsAffectedAreaStyle,
    zIndex: DRAWING_LAYER_ZINDEX_OTHER_PARTS
  });

  selectedKmlLayer: VectorLayer<VectorSource>;

  constructor(protected readonly areasFacade: AreasFacade,
    protected readonly alertMessages: AlertMessageService) {
    super(areasFacade, alertMessages);

    // force style of the layer
    this.affectedAreasSource.on('addfeature', (event: VectorSourceEvent) => event.feature.setStyle(affectedAreaToolsStyle));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.featurePart) {
      this.updateFormFromFeaturePart(this.featurePart);
    }
  }

  changeGeomArea(): void {
    if (this.selectedGeomAreaOption === 'geometries') {
      this.map.carto.command('drawing.setLayer', this.geometriesLayer);

      // Geometries of AN Bathy allowed are only Polygon, Circle and Point
      const availableTools = environment.carto.availableTools.forGeometryMode;
      const indexOfPathTool = environment.carto.availableTools.forGeometryMode.indexOf('path');
      if (this.isBathy && indexOfPathTool !== -1) {
        availableTools.splice(indexOfPathTool, 1);
      }
      this.map.setAvailableTools(availableTools);

      this.selectedKmlLayer = this.geometriesLayer;
      this.map.centerOnFeatures(this.geometriesLayer);
    } else {
      this.map.carto.command('drawing.setLayer', this.affectedAreasLayer);
      this.map.setAvailableTools(environment.carto.availableTools.forAffectedArea);
      this.selectedKmlLayer = this.affectedAreasLayer;
      this.map.centerOnFeatures(this.affectedAreasLayer);
    }
  }

  getAffectedAreas(): Array<Feature> {
    return this.affectedAreasLayer.getSource().getFeatures();
  }

  mapLoaded(): void {
    this.affectedAreasLayer.setZIndex(environment.carto.drawingModule.drawingLayerZindex);
    this.map.carto.map.olMap.addLayer(this.affectedAreasLayer);
    this.map.carto.map.olMap.addLayer(this.otherPartsGeometriesLayer);
    this.map.carto.map.olMap.addLayer(this.otherPartsAffectedAreasLayer);
    if (this.featurePart.geometries) {
      this.changeGeomArea();
    }

    this.geometriesLayer.getSource().forEachFeature((feature: Feature<Geometry>) => showFeatureLabel(feature));
    this.affectedAreasLayer.getSource().forEachFeature((feature: Feature<Geometry>) => showFeatureLabel(feature));
    removePingLayers(this.map.carto.map);

    this.map.centerOnFeatures(this.geometriesLayer);
  }

  updateFormFromFeaturePart(part: FeaturePart): void {
    this.selectedGeomAreaOption = 'geometries';
    if (this.map?.carto) {
      this.changeGeomArea();
    }
    this.geometriesLayer.getSource().clear();
    this.geometriesLayer.getSource().addFeatures(part.geometries);
    this.affectedAreasLayer.getSource().clear();
    this.affectedAreasLayer.getSource().addFeatures(part.affectedAreas);

    this.otherPartsGeometriesLayer.getSource().clear();
    this.otherPartsAffectedAreasLayer.getSource().clear();

    // we need to load the featuresPart (geom/affected area) that are not in the selected featurePart.
    this.featureParts.forEach(featurePart => {
      if (part !== featurePart) {
        this.otherPartsAffectedAreasLayer.getSource().addFeatures(featurePart.affectedAreas);
        this.otherPartsGeometriesLayer.getSource().addFeatures(featurePart.geometries);
      }
    });

    // reset style
    this.resetStyle(this.otherPartsGeometriesLayer, otherPartsGeometryStyle);
    this.resetStyle(this.otherPartsAffectedAreasLayer, otherPartsAffectedAreaStyle);
    this.resetStyle(this.geometriesLayer, geometryToolsStyle);
    this.resetStyle(this.affectedAreasLayer, affectedAreaToolsStyle);

    if (this.map) {
      if (!part.geometries.length && !part.affectedAreas.length) {
        this.map.fitToGivenExtent(this.selectedAreaExtent);
      } else {
        if (this.geometriesLayer) {
          this.map.centerOnFeatures(this.geometriesLayer);
        } else if (this.affectedAreasLayer) {
          this.map.centerOnFeatures(this.affectedAreasLayer);
        }
      }
    }
  }

  chooseAndImportKml(): void {
    const isGeometryLayer = this.selectedGeomAreaOption === 'geometries';
    const styleToApply = isGeometryLayer ? geometryToolsStyle : affectedAreaToolsStyle
    super.chooseAndImportKml(this.selectedKmlLayer, styleToApply, isGeometryLayer);
  }
}
