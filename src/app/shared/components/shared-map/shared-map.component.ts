import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { MapComponent } from '@app/sig/components/map/map.component';
import { BasicControl } from '@app/sig/core/controls/basic-control';
import { checkIfKmlContainsNotSupportedPolygon, FEATURE_LABEL_PROPERTY, setFeatureLabel, setVertexLabels, VERTEX_LABELS_PROPERTY } from '@app/sig/utils/feature';
import { environment } from '@env/environment';
import { CartoModulesOptions } from '@shom2/carto';
import { DistanceUnit } from '@shom2/carto/modules/DrawingModule/common/CoordinateFormCommon';
import { ToolKey } from '@shom2/carto/modules/DrawingModule/DrawingMainMenu';
import { metersToKms, metersToNMiles } from '@shom2/carto/utils/conversions';
import { PROJECTION_WGS84_DECIMAL, PROJECTION_WGS84_DMS } from '@shom2/carto/utils/coordinate';
import { createOlGeometryFrom } from '@sig/utils/geometry';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Extent } from 'ol/extent';
import Feature from 'ol/Feature';
import KMLFormat from 'ol/format/KML';
import { Geometry, Polygon } from 'ol/geom';
import { Modify } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style } from 'ol/style';
import { filter } from 'rxjs/operators';

const KM_FRACTION_DIGITS = environment.carto.drawingModule.formatFunction.kilometersFractionDigits;
const MILES_NAUTIQUES_FRACTION_DIGITS = environment.carto.drawingModule.formatFunction.milesNautiqueFractionDigits;

export enum SupportedGeometryType {
  POINT = 'Point',
  LINE_STRING = 'LineString',
  POLYGON = 'Polygon',
  CIRCLE = 'Circle'
}

export enum SupportedAreaType {
  POLYGON = 'Polygon',
  CIRCLE = 'Circle'
}

type SupportedGeometryTypeMixed = typeof SupportedGeometryType | typeof SupportedAreaType | typeof SupportedGeometryTypeBathyIS;

export enum SupportedGeometryTypeBathyIS {
  POINT = 'Point',
  POLYGON = 'Polygon',
  CIRCLE = 'Circle'
}

/**
 * Function for formatting the radius value displayed in the tooltip
 *
 * @param {number} sphereRadius radius value
 * @return {string} the text to display in the tooltip
 */
const circleRadiusFormatFunction = function (sphereRadius: number): string {
  return `${this.i18n.dict.MEASUREMENT_RADIUS_RESULT} ${metersToKms(sphereRadius)
    .toFixed(KM_FRACTION_DIGITS)}
           ${this.i18n.dict.KILOMETERS}
           (${metersToNMiles(sphereRadius)
      .toFixed(MILES_NAUTIQUES_FRACTION_DIGITS)}
           ${this.i18n.dict.NAUTIC_MILES})`;
};

const COMMON_TOOLS: Array<ToolKey> = ['point', 'path', 'polygon', 'circle', 'dragging', 'center'];

@Component({
  selector: 'shared-map',
  template: ''
})
export class SharedMapComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly scavenger = new Scavenger(this);

  @Input() disabled = false;
  @Input() isBathy = false;

  @ViewChild('map') map: MapComponent;
  geometriesLayer = new VectorLayer({ source: new VectorSource() });

  modulesOptions: CartoModulesOptions;

  inputKmlFile: HTMLInputElement;
  selectedAreaExtent: Extent;
  readonly kmlImportAccept = environment.carto.kmlImport.acceptableFileExtensions;

  btnShowDrawingTool: BasicControl;
  btnShowDrawingToolElement: HTMLElement;
  modalContainerElement: HTMLElement;

  private polygonMaxVerticesForIsBathy = Infinity;

  constructor(protected readonly areasFacade: AreasFacade,
    protected readonly alertMessages: AlertMessageService) {
  }

  ngOnInit(): void {
    if (!this.disabled) {
      const availableTools: Array<ToolKey> = [...COMMON_TOOLS];
      if (this.isBathy) {
        availableTools.splice(1, 1);
        this.polygonMaxVerticesForIsBathy = environment.carto.drawingModule.polygonMaxVerticesForIsBathy;
      }

      this.modulesOptions = {
        drawingModule: {
          enable: true,
          layerZIndex: environment.carto.drawingModule.drawingLayerZindex,
          layer: this.geometriesLayer,
          distanceUnit: DistanceUnit.METERS,
          circleRadiusFormatFunction,
          polygonMaxVertices: this.polygonMaxVerticesForIsBathy,
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
                },
                minimize: {
                  enable: true,
                  onClick: this.hideDrawingTool.bind(this)
                }
              }
            }
          },
          mainMenu: {
            editionForm: {
              enablePositionForm: true,
              enableStyleForm: false,
              enableBathyForm: this.isBathy,
              positionFormOptions: {
                displayVertexLabels: true,
                displayFeatureLabel: true
              }
            },
            availableTools
          },
          defaultProjectionSystemId: PROJECTION_WGS84_DMS.id
        },
        kmlModule: {}
      };
    }

    this.areasFacade.getSelectedArea$().pipe(
      this.scavenger.collect(),
      filter(area => !!area)
    ).subscribe(
      area => {
        const geom = createOlGeometryFrom(area.geom);
        this.selectedAreaExtent = geom.getExtent();
      }
    );
  }

  hideDrawingTool(): void {
    if (!this.modalContainerElement) {
      this.modalContainerElement = document
        .querySelector('.sc-module-container.sc-drawing-block')
        .querySelector('.sc-modal');
    }

    this.modalContainerElement.style.display = 'none';

    const btnHideEditionFormElement: HTMLElement = document.querySelector('.sc-title-up');
    if (btnHideEditionFormElement) {
      btnHideEditionFormElement.click();
    }

    if (!this.btnShowDrawingTool) {
      this.btnShowDrawingTool = new BasicControl({
        className: 'button-control control-btn-display-drawing-tool',
        iconClassName: 'fas fa-pencil-alt',
        actionOnClick: () => {
          this.modalContainerElement.style.display = 'initial';
          this.btnShowDrawingToolElement.style.display = 'none';
        }
      });

      this.map.map.olMap.addControl(this.btnShowDrawingTool);
      this.btnShowDrawingToolElement = document.querySelector('.button-control.control-btn-display-drawing-tool');

      this.addFeatureInteractionsEventsHandler();
    } else {
      this.btnShowDrawingToolElement.style.display = 'initial';
    }
  }

  addFeatureInteractionsEventsHandler(): void {
    this.map.map.olMap.getInteractions().on('add', interaction => {
      if (interaction.element instanceof Modify) {
        this.modalContainerElement.style.display = 'initial';
        this.btnShowDrawingToolElement.style.display = 'none';
      }
    });
  }

  ngOnDestroy(): void { }

  ngAfterViewInit(): void {
    this.inputKmlFile = document.getElementById('kmlFile') as HTMLInputElement;
    if (this.inputKmlFile) {
      this.inputKmlFile.onchange = this.chooseAndImportKml.bind(this);
    }
  }

  onImportKmlClick(): void {
    this.inputKmlFile.click();
  }

  chooseAndImportKml(layer?: VectorLayer<VectorSource>, style?: Style, isGeometryLayer = true): void {
    // open browse file window, then read file content as string and call import function
    const file = this.inputKmlFile.files[0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = readerEvent => {
      const kmlContentAsString = readerEvent.target.result;
      const hasUnsupportedGeometryType = this.isBathy ? !this.checkIfKmlIsValidForIsBathy(kmlContentAsString) : this.checkIfKmlContainsUnsupportedGeometryType(kmlContentAsString, isGeometryLayer);

      if (hasUnsupportedGeometryType) {
        return;
      }

      this.map.importKml(kmlContentAsString as string, layer);
      if (layer && style) {
        this.resetStyle(layer, style);
      }
    };
  }

  private extractFeaturesFromKml(kmlContent: string | ArrayBuffer): Feature<Geometry>[] {
    const kmlFormat = new KMLFormat({ showPointNames: false });
    const options = {
      'dataProjection': PROJECTION_WGS84_DECIMAL.code,
      'featureProjection': this.map.map.view.getProjection()
    };

    return kmlFormat.readFeatures(kmlContent, options);
  }

  private checkIfKmlContainsUnsupportedGeometryTypeMixed(features: Feature<Geometry>[], type: SupportedGeometryTypeMixed, msg: string): boolean {
    const unsupportedTypePresent = features?.some(feature => !Object.values(type).includes(feature.get('geometry').getType()));
    const unsupportedPointWithName = features.some(feature => feature.get('geometry').getType() === SupportedGeometryType.POINT && !!feature.get('name'));
    if (unsupportedTypePresent || unsupportedPointWithName) {
      this.displayErrorMsg(msg);
      return true;
    } else if (checkIfKmlContainsNotSupportedPolygon(features)) {
      this.displayErrorMsg('error-import-polygon');
      return true;
    }

    return false;
  }

  private displayErrorMsg(msg: string): void {
    this.alertMessages.add({
      severity: 'error',
      summary: 'message.summary.error',
      detail: `carto.${msg}`
    });
  }

  private checkIfKmlContainsUnsupportedGeometryType(kmlContent: string | ArrayBuffer, isGeometryLayer = true): boolean {
    const features = this.extractFeaturesFromKml(kmlContent);
    return this.checkIfKmlContainsUnsupportedGeometryTypeMixed(features, isGeometryLayer ? SupportedGeometryType : SupportedAreaType, 'error-import-multigeometry');
  }

  private static checkIfInvalidPolygonVerticesNumber(features: Feature<Geometry>[], polygonMaxVertices: number): boolean {
    return features?.filter(feature => feature.getGeometry().getType() === Polygon.name)
      .map(feature => (feature.getGeometry() as Polygon))
      .some(polygon => polygon.getCoordinates()[0].length - 1 > polygonMaxVertices);
  }

  private checkIfKmlIsValidForIsBathy(kmlContent: string | ArrayBuffer): boolean {
    const features = this.extractFeaturesFromKml(kmlContent);
    const unsupportedTypePresent = this.checkIfKmlContainsUnsupportedGeometryTypeMixed(features, SupportedGeometryTypeBathyIS, 'bathy.invalid-geometry-type');
    if (unsupportedTypePresent) {
      return false;
    }

    const invalidPolygonVerticesNumber = SharedMapComponent.checkIfInvalidPolygonVerticesNumber(features, this.polygonMaxVerticesForIsBathy);

    if (invalidPolygonVerticesNumber) {
      this.displayErrorMsg('bathy.invalid-polygon-vertices-number');
      return false;
    }
    return true;
  }

  getGeometries(): Array<Feature> {
    return this.geometriesLayer.getSource().getFeatures();
  }

  resetStyle(layer: VectorLayer<VectorSource>, style: Style): void {
    layer.getSource().getFeatures().forEach(feature => {
      feature.setStyle(style.clone());

      if (feature.get(VERTEX_LABELS_PROPERTY)) {
        setVertexLabels(feature, feature.get(VERTEX_LABELS_PROPERTY));
      }
      if (feature.get(FEATURE_LABEL_PROPERTY)) {
        setFeatureLabel(feature, feature.get(FEATURE_LABEL_PROPERTY));
      }
    });
  }
}
