export enum DistanceUnit {
  METERS = 'METERS',
  KILOMETERS = 'KILOMETERS',
  NAUTICAL_MILES = 'NAUTICAL_MILES'
}

const PROJECTION_WGS84_DECIMAL = {
  code: 'EPSG:4326',
  id: 'EPSG:4326'
};

const PROJECTION_WGS84_DMS = {
  code: 'EPSG:4326',
  id: 'EPSG:4326'
};

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { SupportedGeometryType } from '@app/shared/components/shared-map/shared-map.component';
import { environment } from '@env/environment';
import { MapComponent } from '@sig/components/map/map.component';
import { JsonGeometry } from '@sig/models/geometry';
import { checkIfKmlContainsNotSupportedPolygon, DEFAULT_TOOL_STYLE } from '@sig/utils/feature';
import { Feature } from 'ol';
import KMLFormat from 'ol/format/KML';
import { LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style';
import { formatCoordinateToDMS, parseSHOMtoDecimal } from '@app/sig/utils/map';
import { Draw } from 'ol/interaction';
import { fromLonLat } from 'ol/proj';


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

  //modulesOptions: CartoModulesOptions;
  geometriesLayer = new VectorLayer({ source: new VectorSource() });
  inputKmlFile: HTMLInputElement;
  readonly kmlImportAccept = environment.carto.kmlImport.acceptableFileExtensions;

  // NUEVAS VARIABLES PARA GRADOS Y MINUTOS
  latText: string = '';
  lonText: string = '';
  manualVertices: number[][] = [];
  verticesLayer: VectorLayer<VectorSource> | null = null;
  private isUpdatingManualCoords = false;

  // Declarar la variable en tu clase
  modulesOptions: any = {
    drawingModule: {
      enable: true,
      layer: this.geometriesLayer, // Asegúrate de que esta variable exista y esté inicializada
      mainMenu: {
        // En Avisos querías estas tres herramientas específicamente:
        availableTools: ['polygon', 'point', 'linestring']
      }
    }
  };

  constructor(protected readonly alertMessages: AlertMessageService) {
  }

  ngOnInit(): void {
    this.addGeomOnMap();
    this.canEditGeometry();

    setTimeout(() => {
      if (this.map?.map?.olMap) {
        const olMap = this.map.map.olMap;

        // Capa independiente (A prueba de balas) para nuestros textos
        if (!this.verticesLayer) {
          this.verticesLayer = new VectorLayer({ source: new VectorSource(), zIndex: 999 });
          olMap.addLayer(this.verticesLayer);
        }

        const actualizarEtiquetas = () => {
          this.verticesLayer.getSource().clear();
          this.geometriesLayer.getSource().getFeatures().forEach((feature: any) => {
            const geometry = feature.getGeometry();
            let coords = [];

            if (geometry) {
              if (geometry.getType() === 'Polygon') coords = geometry.getCoordinates()[0] || [];
              else if (geometry.getType() === 'LineString') coords = geometry.getCoordinates() || [];
              else if (geometry.getType() === 'Point') coords = [geometry.getCoordinates()];
            }

            coords.forEach((coord: any) => {
              if (coord && coord.length >= 2) {
                const labelFeature = new Feature({ geometry: new Point(coord) });
                labelFeature.setStyle(new Style({
                  image: new CircleStyle({ radius: 5, fill: new Fill({ color: '#0055ff' }), stroke: new Stroke({ color: '#ffffff', width: 2 }) }),
                  text: new Text({
                    text: formatCoordinateToDMS(coord),
                    offsetY: -20,
                    font: 'bold 11px Arial, sans-serif',
                    fill: new Fill({ color: '#333333' }),
                    stroke: new Stroke({ color: '#ffffff', width: 3 }),
                    textAlign: 'center'
                  })
                }));
                this.verticesLayer.getSource().addFeature(labelFeature);
              }
            });
          });
        };

        // 3. ETIQUETAR Y VOLAR HACIA EL POLÍGONO
        // Al arrancar, le ponemos las coordenadas a la figura que acabamos de transformar
        actualizarEtiquetas();

        if (this.geometriesLayer.getSource().getFeatures().length > 0) {
          const extent = this.geometriesLayer.getSource().getExtent();
          // Hacemos que la cámara vuele directo a Puerto Cabello (maxZoom evita que quede demasiado cerca)
          olMap.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 12 });
        }

        // Mantenemos la sincronización pasiva original por si el usuario decide dibujar o borrar
        this.geometriesLayer.getSource().on('addfeature', () => setTimeout(actualizarEtiquetas, 50));
        this.geometriesLayer.getSource().on('removefeature', () => {
          if (!this.isUpdatingManualCoords && this.geometriesLayer.getSource().getFeatures().length === 0) {
            this.manualVertices = [];
          }
          setTimeout(actualizarEtiquetas, 50);
        });
        this.geometriesLayer.getSource().on('changefeature', () => setTimeout(actualizarEtiquetas, 50));

      }
    }, 1000);
  }

  /**
   * Retrieves geometry related to a region, maritime entity, or sub-area
   */
  addGeomOnMap(): void {
    if (!this.geometry || !this.geometriesLayer) { return; }

    // Creamos la geometría con los datos crudos
    const geom = new GEOMETRY_TYPE_CLASS[this.geometry.type](this.geometry.coordinates);

    // Si algún registro previo viene en grados (WGS84), lo proyectamos a Web Mercator (EPSG:3857)
    const extent = geom.getExtent();
    if (extent && Math.abs(extent[0]) <= 180 && Math.abs(extent[1]) <= 90) {
      geom.transform('EPSG:4326', environment.carto.projection);
    }

    const feature = new Feature({ geometry: geom });

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
    const geom = this.geometriesLayer?.getSource().getFeatures()[0]?.getGeometry() as any;
    if (!geom) { return null; }
    const type = geom.getType();
    const rawCoords = geom.getCoordinates();
    let coordinates: any;
    if (type === 'Point') {
      coordinates = rawCoords.slice(0, 2);
    } else if (type === 'LineString') {
      coordinates = rawCoords.map((coord: number[]) => coord.slice(0, 2));
    } else if (type === 'Polygon') {
      coordinates = rawCoords.map((ring: number[][]) => ring.map((coord: number[]) => coord.slice(0, 2)));
    } else {
      coordinates = rawCoords;
    }
    return {
      type,
      coordinates
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

  addPointToMap(): void {
    if (!this.latText || !this.lonText) {
      this.alertMessages.add({
        severity: 'warn',
        summary: 'carto.manual-coords.alert-title',
        detail: 'carto.manual-coords.alert-detail'
      });
      return;
    }

    const decimalLat = parseSHOMtoDecimal(this.latText.trim());
    const decimalLon = parseSHOMtoDecimal(this.lonText.trim());

    if (decimalLat === null || decimalLon === null) {
      this.alertMessages.add({ severity: 'error', summary: 'Error', detail: 'El formato ingresado no es válido.' });
      return;
    }

    const mapCoord = fromLonLat([decimalLon, decimalLat], environment.carto.projection);
    this.manualVertices.push(mapCoord);

    // 1. Inicializamos la capa auxiliar si no existe
    if (!this.verticesLayer && this.map?.map?.olMap) {
      this.verticesLayer = new VectorLayer({ source: new VectorSource(), zIndex: 999 });
      this.map.map.olMap.addLayer(this.verticesLayer);
    }

    this.isUpdatingManualCoords = true;
    try {
      // Limpiamos las capas para redibujar
      this.verticesLayer?.getSource().clear();
      if (this.geometriesLayer) {
        this.geometriesLayer.getSource().clear();
      }

      // 2. ETIQUETAS Y VÉRTICES VISUALES
      this.manualVertices.forEach(coord => {
        const pointFeature = new Feature({ geometry: new Point(coord) });
        pointFeature.setStyle(this.getLabeledStyle(pointFeature));
        this.verticesLayer?.getSource().addFeature(pointFeature);
      });

      // 3A. Si hay 1 punto -> creamos Point en geometriesLayer
      if (this.manualVertices.length === 1 && this.geometriesLayer) {
        const singlePointFeature = new Feature({ geometry: new Point(this.manualVertices[0]) });
        singlePointFeature.setStyle(this.getLabeledStyle(singlePointFeature));
        this.geometriesLayer.getSource().addFeature(singlePointFeature);
      }
      // 3B. Si hay 2 puntos -> creamos LineString en verticesLayer y geometriesLayer
      else if (this.manualVertices.length === 2) {
        const lineFeature = new Feature({ geometry: new LineString(this.manualVertices) });
        lineFeature.setStyle(this.getLabeledStyle(lineFeature));
        this.verticesLayer?.getSource().addFeature(lineFeature);
        if (this.geometriesLayer) {
          const clonedLine = lineFeature.clone();
          clonedLine.setStyle(this.getLabeledStyle(clonedLine));
          this.geometriesLayer.getSource().addFeature(clonedLine);
        }
      }
      // 3C. Si hay 3 o más puntos -> creamos Polygon cerrado en verticesLayer y geometriesLayer
      else if (this.manualVertices.length >= 3) {
        const polygonCoords = [...this.manualVertices, this.manualVertices[0]];
        const polyFeature = new Feature({ geometry: new Polygon([polygonCoords]) });
        polyFeature.setStyle(this.getLabeledStyle(polyFeature));
        this.verticesLayer?.getSource().addFeature(polyFeature);
        if (this.geometriesLayer) {
          const clonedPoly = polyFeature.clone();
          clonedPoly.setStyle(this.getLabeledStyle(clonedPoly));
          this.geometriesLayer.getSource().addFeature(clonedPoly);
        }
      }
    } finally {
      this.isUpdatingManualCoords = false;
    }

    if (this.map?.map?.olMap) {
      const view = this.map.map.olMap.getView();
      if (this.manualVertices.length === 1) {
        view.setCenter(mapCoord);
        view.setZoom(13);
      } else {
        const extent = this.geometriesLayer?.getSource()?.getExtent();
        if (extent) {
          view.fit(extent, {
            padding: [80, 80, 80, 80],
            maxZoom: 14,
            duration: 400
          });
        }
      }
    }

    this.latText = '';
    this.lonText = '';
  }

  clearManualCoords(): void {
    this.latText = '';
    this.lonText = '';
    this.manualVertices = [];

    if (this.geometriesLayer) {
      this.geometriesLayer.getSource().clear();
    }

    // Limpiamos también la capa auxiliar visual
    if (this.verticesLayer) {
      this.verticesLayer.getSource().clear();
    }
  }

  // FUNCIÓN MAESTRA DE ESTILOS
  private getLabeledStyle(feature: any): Style[] {
    const geometry = feature.getGeometry();
    let coords = [];

    if (geometry) {
      const type = geometry.getType();
      if (type === 'Polygon') {
        coords = geometry.getCoordinates()[0] || [];
      } else if (type === 'LineString') {
        coords = geometry.getCoordinates() || [];
      } else if (type === 'Point') {
        coords = [geometry.getCoordinates()];
      }
    }

    const customStyles = [
      new Style({
        fill: new Fill({ color: 'rgba(0, 153, 255, 0.4)' }),
        stroke: new Stroke({ color: '#0055ff', width: 2 })
      })
    ];

    coords.forEach((coord: any) => {
      if (coord && coord.length >= 2) {
        customStyles.push(new Style({
          geometry: new Point(coord),
          image: new CircleStyle({ radius: 6, fill: new Fill({ color: '#0055ff' }), stroke: new Stroke({ color: '#ffffff', width: 2 }) }),
          text: new Text({
            text: formatCoordinateToDMS(coord),
            offsetY: -20,
            font: 'bold 11px Arial, sans-serif',
            fill: new Fill({ color: '#333333' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            textAlign: 'center'
          })
        }));
      }
    });
    return customStyles;
  }
}


