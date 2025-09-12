import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { SupportedGeometryType } from '@app/shared/components/shared-map/shared-map.component';
import { environment } from '@env/environment';
import { CartoModulesOptions } from '@shom2/carto';
import { DistanceUnit } from '@shom2/carto/modules/DrawingModule/common/CoordinateFormCommon';
import { PROJECTION_WGS84_DECIMAL, PROJECTION_WGS84_DMS } from '@shom2/carto/utils/coordinate';
import { MapComponent } from '@sig/components/map/map.component';
import { JsonGeometry } from '@sig/models/geometry';
import { checkIfKmlContainsNotSupportedPolygon, DEFAULT_TOOL_STYLE } from '@sig/utils/feature';
import { Feature } from 'ol';
import KMLFormat from 'ol/format/KML';
import { LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

const GEOMETRY_TYPE_CLASS = {
  MultiPolygon,
  LineString,
  Point,
  Polygon,
};

@Component({
  selector: 'app-view-geometry',
  templateUrl: './view-geometry.component.html',
  styleUrls: ['./view-geometry.component.scss']
})
export class ViewGeometryComponent implements OnInit {
  @ViewChild('map') map: MapComponent;
  @Input() geometry: JsonGeometry;
  @Input() isEditionMode: boolean;
  @Input() enableKmlImport = false;

  modulesOptions: CartoModulesOptions;
  geometriesLayer = new VectorLayer({ source: new VectorSource() });
  inputKmlFile: HTMLInputElement;
  readonly kmlImportAccept = environment.carto.kmlImport.acceptableFileExtensions;


  constructor(protected readonly alertMessages: AlertMessageService) {
  }

  ngOnInit(): void {
    this.addGeomOnMap();
    this.canEditGeometry();
  }

  /**
   * Retrieves geometry related to a region, maritime entity, or sub-area
   */
  addGeomOnMap(): void {
    // geometry in a sub-area is not required
    if (!this.geometry) { return; }

    const feature = new Feature({
      geometry: new GEOMETRY_TYPE_CLASS[this.geometry.type](this.geometry.coordinates)
    });
    feature.setStyle(DEFAULT_TOOL_STYLE);
    this.geometriesLayer.getSource().clear();
    this.geometriesLayer.getSource().addFeature(feature);
  }

  /**
   * Allows you to check that there is only one geometry on the map
   */
  canSaveGeometry(): boolean {
    return this.geometriesLayer?.getSource().getFeatures().length === 1;
  }

  getGeometry(): JsonGeometry {
    const geom = this.geometriesLayer?.getSource().getFeatures()[0]?.getGeometry() as Polygon;
    return {
      type: geom?.getType(),
      coordinates: geom?.getCoordinates()
        .map(coordinate => coordinate.map(coordinates => coordinates.slice(0, 2)))
    };
  }

  /**
   * Manages the click on the KML import button
   */
  onImportKmlClick(): void {
    this.inputKmlFile.click();
  }

  /**
   * Open browse file window, then read file content as string and call import function
   */
  chooseAndImportKml(): void {
    const file = this.inputKmlFile.files[0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = readerEvent => {
      const kmlContentAsString = readerEvent.target.result;
      const hasUnsupportedGeometryType = this.checkIfKmlContainsUnsupportedGeometryType(kmlContentAsString);

      if (!hasUnsupportedGeometryType) {
        this.map.importKml(kmlContentAsString as string, this.geometriesLayer);
      }
    };
  }

  checkIfKmlContainsUnsupportedGeometryType(kmlContent: string | ArrayBuffer): boolean {
    const kmlFormat = new KMLFormat({ showPointNames: false });
    const options = {
      'dataProjection': PROJECTION_WGS84_DECIMAL.code,
      'featureProjection': this.map.map.view.getProjection()
    };

    const features = kmlFormat.readFeatures(kmlContent, options);
    const unsupportedTypePresent = features?.some(feature => !Object.values(SupportedGeometryType).includes(feature.get('geometry').getType()));
    if (unsupportedTypePresent) {
      this.alertMessages.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'carto.error-import-multigeometry'
      });
      return true;
    }

    if (checkIfKmlContainsNotSupportedPolygon(features)) {
      this.alertMessages.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'carto.error-import-polygon'
      });
      return true;
    }
    return false;
  }

  /**
   *  Returns a boolean according to the mode (viewing or editing)
   */
  canEditGeometry(): boolean {
    if (!this.isEditionMode) {
      return;
    }
    this.enableKmlImport = true;
    this.modulesOptions = {
      drawingModule: {
        enable: true,
        layerZIndex: environment.carto.drawingModule.drawingLayerZindex,
        layer: this.geometriesLayer,
        distanceUnit: DistanceUnit.METERS,
        centerTool: {
          paddingLeft: environment.carto.drawingModule.centerTool.paddingLeft,
          paddingTop: environment.carto.drawingModule.centerTool.paddingTop,
          paddingRight: environment.carto.drawingModule.centerTool.paddingRight,
          paddingBottom: environment.carto.drawingModule.centerTool.paddingBottom
        },
        modal: {
          draggable: true,
          titleBar: {
            buttons: {
              cross: {
                enable: false
              }
            }
          }
        },
        mainMenu: {
          editionForm: {
            enablePositionForm: true,
            enableStyleForm: false,
            positionFormOptions: {
              displayVertexLabels: true,
              displayFeatureLabel: true
            }
          },
          availableTools: ['polygon', 'dragging', 'center']
        },
        defaultProjectionSystemId: PROJECTION_WGS84_DMS.id
      },
      kmlModule: {}
    };

    this.inputKmlFile = document.getElementById('kmlFile') as HTMLInputElement;
    this.inputKmlFile.onchange = this.chooseAndImportKml.bind(this);
  }
}
