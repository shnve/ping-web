import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { InfosourcePartForm } from '@app/infosource/models/infosource.model';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { SharedMapComponent } from '@app/shared/components/shared-map/shared-map.component';
import { MapComponent } from '@app/sig/components/map/map.component';
import { infosourceGeometryToolsStyle, otherPartsGeometryStyle, showFeatureLabel } from '@app/sig/utils/feature';
import { formatCoordinateToDMS, parseSHOMtoDecimal, removePingLayers } from '@app/sig/utils/map';
import { environment } from '@env/environment';
import { Extent } from 'ol/extent';
import Feature from 'ol/Feature';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';

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

  latText: string = '';
  lonText: string = '';
  manualVertices: number[][] = [];
  verticesLayer: VectorLayer<VectorSource> | null = null;
  private isUpdatingManualCoords = false;

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
    this.map?.setAvailableTools(environment.carto.availableTools.forGeometryMode);
  }

  mapLoaded(): void {
    this.geometriesLayer.setZIndex(environment.carto.drawingModule.drawingLayerZindex);
    this.map.map.olMap.addLayer(this.otherPartsGeometriesLayer);
    if (this.featurePart?.geometries) {
      this.changeGeomArea();
    }

    this.addFeatureEventsHandler();

    this.geometriesLayer.getSource().forEachFeature((feature: Feature<Geometry>) => showFeatureLabel(feature));
    removePingLayers(this.map.map);

    // --- INTERCEPTOR 1: GANAR LA GUERRA DE ESTILOS AL DIBUJAR ---
    this.geometriesLayer.getSource().on('addfeature', (event: VectorSourceEvent) => {
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
            fill: new Fill({ color: 'rgba(0, 153, 255, 0.4)' }),
            stroke: new Stroke({ color: '#0055ff', width: 2 })
          })
        ];

        coords.forEach(coord => {
          if (coord && coord.length >= 2) {
            customStyles.push(new Style({
              geometry: new Point(coord),
              image: new CircleStyle({
                radius: 6, fill: new Fill({ color: '#0055ff' }), stroke: new Stroke({ color: '#ffffff', width: 2 })
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

    // --- INTERCEPTOR 2: ARREGLAR LA PAPELERA Y LIMPIAR VÉRTICES MANUALES ---
    this.geometriesLayer.getSource().on('removefeature', () => {
      if (this.map?.map?.olMap) {
        this.map.map.olMap.getInteractions().forEach((interaction: any) => {
          if (interaction.getFeatures && typeof interaction.getFeatures().clear === 'function') {
            interaction.getFeatures().clear();
          }
        });
      }
      if (!this.isUpdatingManualCoords && this.geometriesLayer.getSource().getFeatures().length === 0) {
        this.manualVertices = [];
        this.verticesLayer?.getSource()?.clear();
      }
    });

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
    this.manualVertices = [];
    this.verticesLayer?.getSource()?.clear();

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

    if (!this.verticesLayer && this.map?.map?.olMap) {
      this.verticesLayer = new VectorLayer({ source: new VectorSource(), zIndex: 999 });
      this.map.map.olMap.addLayer(this.verticesLayer);
    }

    this.isUpdatingManualCoords = true;
    try {
      this.verticesLayer?.getSource()?.clear();

      if (this.manualVertices.length === 1) {
        const pointFeature = new Feature({ geometry: new Point(this.manualVertices[0]) });
        if (this.geometriesLayer) {
          this.geometriesLayer.getSource().clear();
          this.geometriesLayer.getSource().addFeature(pointFeature.clone());
        }
      } else if (this.manualVertices.length === 2) {
        const lineFeature = new Feature({ geometry: new LineString(this.manualVertices) });
        lineFeature.setStyle(new Style({ stroke: new Stroke({ color: '#0055ff', width: 2 }) }));
        this.verticesLayer?.getSource()?.addFeature(lineFeature);

        if (this.geometriesLayer) {
          this.geometriesLayer.getSource().clear();
          this.geometriesLayer.getSource().addFeature(lineFeature.clone());
        }
      } else if (this.manualVertices.length >= 3) {
        const polygonCoords = [...this.manualVertices, this.manualVertices[0]];
        const polyFeature = new Feature({ geometry: new Polygon([polygonCoords]) });
        polyFeature.setStyle(new Style({
          fill: new Fill({ color: 'rgba(0, 153, 255, 0.4)' }),
          stroke: new Stroke({ color: '#0055ff', width: 2 })
        }));
        this.verticesLayer?.getSource()?.addFeature(polyFeature);

        if (this.geometriesLayer) {
          this.geometriesLayer.getSource().clear();
          this.geometriesLayer.getSource().addFeature(polyFeature.clone());
        }
      }

      this.manualVertices.forEach(coord => {
        const vertexFeature = new Feature({ geometry: new Point(coord) });
        vertexFeature.setStyle(new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: '#0055ff' }),
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
        this.verticesLayer?.getSource()?.addFeature(vertexFeature);
      });
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
    if (this.verticesLayer) {
      this.verticesLayer.getSource().clear();
    }
  }
}
