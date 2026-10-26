import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { SharedMapComponent } from '@app/shared/components/shared-map/shared-map.component';
import { MapComponent } from '@app/sig/components/map/map.component';
import {
  affectedAreaToolsStyle, geometryToolsStyle, otherPartsAffectedAreaStyle, otherPartsGeometryStyle, showFeatureLabel
} from '@app/sig/utils/feature';
import { formatCoordinateToDMS, removePingLayers, parseSHOMtoDecimal, formatDecimalToSHOM } from '@app/sig/utils/map';
import { environment } from '@env/environment';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { FeaturePart } from '../../models/creation-warning.model';

import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import { Feature } from 'ol';
import { Point, LineString, Polygon } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

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

  // NUEVAS VARIABLES PARA TEXTO SHOM
  latText: string | null = null;
  lonText: string | null = null;

  manualGeometriesVertices: number[][] = [];
  manualAffectedAreasVertices: number[][] = [];
  verticesLayer: VectorLayer<VectorSource> | null = null;
  affectedVerticesLayer: VectorLayer<VectorSource> | null = null;
  isEditionMode: boolean = true;
  private isUpdatingManualCoords = false;

  get manualVertices(): number[][] {
    return this.selectedGeomAreaOption === 'affectedAreas'
      ? this.manualAffectedAreasVertices
      : this.manualGeometriesVertices;
  }

  set manualVertices(val: number[][]) {
    if (this.selectedGeomAreaOption === 'affectedAreas') {
      this.manualAffectedAreasVertices = val;
    } else {
      this.manualGeometriesVertices = val;
    }
  }

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
      // Geometries of AN Bathy allowed are only Polygon, Circle and Point
      const availableTools = [...environment.carto.availableTools.forGeometryMode];
      const indexOfPathTool = availableTools.indexOf('path');
      if (this.isBathy && indexOfPathTool !== -1) {
        availableTools.splice(indexOfPathTool, 1);
      }
      if (this.map) {
        this.map.geometriesLayer = this.geometriesLayer;
        this.map.setAvailableTools(availableTools);
        this.map.centerOnFeatures(this.geometriesLayer);
      }
      this.selectedKmlLayer = this.geometriesLayer;
    } else {
      if (this.map) {
        this.map.geometriesLayer = this.affectedAreasLayer;
        this.map.setAvailableTools(environment.carto.availableTools.forAffectedArea);
        this.map.centerOnFeatures(this.affectedAreasLayer);
      }
      this.selectedKmlLayer = this.affectedAreasLayer;
    }
  }

  getAffectedAreas(): Array<Feature> {
    return this.affectedAreasLayer?.getSource().getFeatures() || [];
  }

  private registerLayerInterceptors(layer: VectorLayer<VectorSource>, isAffectedArea: boolean): void {
    const strokeColor = isAffectedArea ? '#ff3300' : '#0055ff';
    const fillColor = isAffectedArea ? 'rgba(255, 51, 0, 0.25)' : 'rgba(0, 153, 255, 0.4)';
    const lineDash = isAffectedArea ? [6, 4] : undefined;

    layer.getSource().on('addfeature', (event: VectorSourceEvent) => {
      const feature = event.feature;

      setTimeout(() => {
        const geometry = feature.getGeometry();
        let coords = [];

        if (geometry) {
          const type = geometry.getType();
          if (type === 'Polygon') {
            coords = (geometry as any).getCoordinates()[0] || [];
          } else if (type === 'LineString') {
            coords = (geometry as any).getCoordinates() || [];
          } else if (type === 'Point') {
            coords = [(geometry as any).getCoordinates()];
          }
        }

        const customStyles = [
          new Style({
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: strokeColor, width: 2, lineDash })
          })
        ];

        coords.forEach(coord => {
          if (coord && coord.length >= 2) {
            customStyles.push(new Style({
              geometry: new Point(coord),
              image: new CircleStyle({
                radius: 6, fill: new Fill({ color: strokeColor }), stroke: new Stroke({ color: '#ffffff', width: 2 })
              }),
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

        feature.setStyle(customStyles);
      }, 10);
    });

    layer.getSource().on('removefeature', () => {
      if (this.map?.map?.olMap) {
        this.map.map.olMap.getInteractions().forEach((interaction: any) => {
          if (interaction.getFeatures && typeof interaction.getFeatures().clear === 'function') {
            interaction.getFeatures().clear();
          }
        });
      }
      if (!this.isUpdatingManualCoords && layer.getSource().getFeatures().length === 0) {
        if (isAffectedArea) {
          this.manualAffectedAreasVertices = [];
          this.affectedVerticesLayer?.getSource()?.clear();
        } else {
          this.manualGeometriesVertices = [];
          this.verticesLayer?.getSource()?.clear();
        }
      }
    });
  }

  mapLoaded(): void {
    this.affectedAreasLayer.setZIndex(environment.carto.drawingModule.drawingLayerZindex);
    this.map.map.olMap.addLayer(this.affectedAreasLayer);
    this.map.map.olMap.addLayer(this.otherPartsGeometriesLayer);
    this.map.map.olMap.addLayer(this.otherPartsAffectedAreasLayer);

    if (this.featurePart.geometries) {
      this.changeGeomArea();
    }

    this.geometriesLayer.getSource().forEachFeature((feature: Feature<Geometry>) => showFeatureLabel(feature));
    this.affectedAreasLayer.getSource().forEachFeature((feature: Feature<Geometry>) => showFeatureLabel(feature));
    if (this.map?.map) {
      removePingLayers(this.map.map);
    }

    this.map.centerOnFeatures(this.geometriesLayer);

    this.registerLayerInterceptors(this.geometriesLayer, false);
    this.registerLayerInterceptors(this.affectedAreasLayer, true);
  }

  updateFormFromFeaturePart(part: FeaturePart): void {
    this.selectedGeomAreaOption = 'geometries';
    this.manualGeometriesVertices = [];
    this.manualAffectedAreasVertices = [];
    this.verticesLayer?.getSource()?.clear();
    this.affectedVerticesLayer?.getSource()?.clear();

    if (this.map) {
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

  addPointToMap(): void {
    if (!this.latText || !this.lonText) {
      this.alertMessages.add({
        severity: 'warn',
        summary: 'carto.manual-coords.alert-title',
        detail: 'carto.manual-coords.alert-detail'
      });
      return;
    }

    // Parsear el texto usando el parseador SHOM
    const decimalLat = parseSHOMtoDecimal(this.latText.trim());
    const decimalLon = parseSHOMtoDecimal(this.lonText.trim());

    if (decimalLat === null || decimalLon === null) {
      this.alertMessages.add({ severity: 'error', summary: 'Error', detail: 'El formato ingresado no es válido.' });
      return;
    }

    const mapCoord = fromLonLat([decimalLon, decimalLat], environment.carto.projection);
    const isAffected = this.selectedGeomAreaOption === 'affectedAreas';
    this.manualVertices.push(mapCoord);

    // 1. CAPA VISUAL (Garantizamos que esté en el mapa)
    if (!isAffected && !this.verticesLayer && this.map?.map?.olMap) {
      this.verticesLayer = new VectorLayer({ source: new VectorSource(), zIndex: 999 });
      this.map.map.olMap.addLayer(this.verticesLayer);
    }
    if (isAffected && !this.affectedVerticesLayer && this.map?.map?.olMap) {
      this.affectedVerticesLayer = new VectorLayer({ source: new VectorSource(), zIndex: 999 });
      this.map.map.olMap.addLayer(this.affectedVerticesLayer);
    }

    const activeVerticesLayer = isAffected ? this.affectedVerticesLayer : this.verticesLayer;
    const targetLayer = isAffected ? this.affectedAreasLayer : this.geometriesLayer;
    const strokeColor = isAffected ? '#ff3300' : '#0055ff';
    const fillColor = isAffected ? 'rgba(255, 51, 0, 0.25)' : 'rgba(0, 153, 255, 0.4)';

    this.isUpdatingManualCoords = true;
    try {
      // Limpiamos el lienzo visual de la pestaña activa antes de redibujar
      activeVerticesLayer?.getSource().clear();

      // 2A. DIBUJO DE PUNTO (Si hay 1 punto)
      if (this.manualVertices.length === 1) {
        const pointFeature = new Feature({ geometry: new Point(this.manualVertices[0]) });

        if (targetLayer) {
          targetLayer.getSource().clear();
          targetLayer.getSource().addFeature(pointFeature.clone());
        }
      }
      // 2B. DIBUJO DE LÍNEAS (Si hay 2 puntos)
      else if (this.manualVertices.length === 2) {
        const lineFeature = new Feature({ geometry: new LineString(this.manualVertices) });
        lineFeature.setStyle(new Style({ stroke: new Stroke({ color: strokeColor, width: 2 }) }));
        activeVerticesLayer?.getSource().addFeature(lineFeature);

        if (targetLayer) {
          targetLayer.getSource().clear();
          targetLayer.getSource().addFeature(lineFeature.clone());
        }
      }
      // 2C. DIBUJO DEL POLÍGONO (Si hay 3 o más puntos)
      else if (this.manualVertices.length >= 3) {
        const polygonCoords = [...this.manualVertices, this.manualVertices[0]];
        const polyFeature = new Feature({ geometry: new Polygon([polygonCoords]) });

        polyFeature.setStyle(new Style({
          fill: new Fill({ color: fillColor }),
          stroke: new Stroke({ color: strokeColor, width: 2 })
        }));

        activeVerticesLayer?.getSource().addFeature(polyFeature);

        if (targetLayer) {
          targetLayer.getSource().clear();
          targetLayer.getSource().addFeature(polyFeature.clone());
        }
      }

      // 3. ETIQUETAS Y VÉRTICES VISUALES
      this.manualVertices.forEach(coord => {
        const pointFeature = new Feature({ geometry: new Point(coord) });

        pointFeature.setStyle(new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: strokeColor }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: formatCoordinateToDMS(coord),
            offsetY: -20,
            font: 'bold 11px Arial, sans-serif',
            fill: new Fill({ color: '#333333' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            textAlign: 'center'
          })
        }));

        activeVerticesLayer?.getSource().addFeature(pointFeature);
      });
    } finally {
      this.isUpdatingManualCoords = false;
    }

    // 4. Ajuste de cámara inteligente según cantidad de vértices
    if (this.map?.map?.olMap) {
      const view = this.map.map.olMap.getView();
      if (this.manualVertices.length === 1) {
        view.setCenter(mapCoord);
        view.setZoom(13);
      } else if (targetLayer) {
        const extent = targetLayer.getSource()?.getExtent();
        if (extent) {
          view.fit(extent, {
            padding: [80, 80, 80, 80],
            maxZoom: 14,
            duration: 400
          });
        }
      }
    }

    this.latText = null;
    this.lonText = null;
  }

  clearManualCoords(): void {
    this.latText = null;
    this.lonText = null;
    this.manualVertices = [];

    if (this.selectedGeomAreaOption === 'affectedAreas') {
      this.affectedAreasLayer?.getSource().clear();
      this.affectedVerticesLayer?.getSource().clear();
    } else {
      this.geometriesLayer?.getSource().clear();
      this.verticesLayer?.getSource().clear();
    }
  }

  getGeometries(): Array<Feature> {
    return this.geometriesLayer?.getSource().getFeatures() || [];
  }

}
