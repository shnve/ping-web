import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { GeoregulationPartForm } from '@app/georegulation/models/georegulation.model';
import { SharedMapComponent } from '@app/shared/components/shared-map/shared-map.component';
import { MapComponent } from '@app/sig/components/map/map.component';
import { georegulationGeometryToolsStyle, otherPartsGeometryStyle, showFeatureLabel } from '@app/sig/utils/feature';
import { removePingLayers, parseSHOMtoDecimal, formatCoordinateToDMS } from '@app/sig/utils/map';
import { environment } from '@env/environment.default';
import { Extent } from 'ol/extent';
import VectorLayer from 'ol/layer/Vector';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';


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

  // VARIABLES PARA COORDENADAS MANUALES
  latText: string = '';
  lonText: string = '';

  manualVertices: number[][] = [];
  verticesLayer: VectorLayer<VectorSource> | null = null;
  private isUpdatingManualCoords = false;

  showModal = false;

  selectedAreaExtent: Extent;



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

    this.map.setAvailableTools(environment.carto.availableTools.forGeometryMode);
  }

  mapLoaded(): void {
    if (!this.map?.map?.olMap) {
      setTimeout(() => this.mapLoaded(), 100);
      return;
    }

    this.geometriesLayer.setZIndex(environment.carto.drawingModule.drawingLayerZindex);
    this.map.map.olMap.addLayer(this.otherPartsGeometriesLayer);

    this.geometriesLayer.getSource().forEachFeature(feature => showFeatureLabel(feature));
    removePingLayers(this.map.map);

    this.map.centerOnFeatures(this.geometriesLayer);

    // --- INTERCEPTOR 1: GANAR LA GUERRA DE ESTILOS AL DIBUJAR ---
    this.geometriesLayer.getSource().on('addfeature', (event: VectorSourceEvent) => {
      const feature = event.feature;

      // Esperamos 10ms a que la librería termine para estampar nuestro estilo por encima
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

    // --- INTERCEPTOR 2: ARREGLAR LA PAPELERA (BORRAR SELECCIÓN FANTASMA Y VÉRTICES MANUALES) ---
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
  }

  private updateFormFromFeaturePart(part: GeoregulationPartForm): void {
    if (this.map) {
      this.changeGeomLayer();
    }
    this.manualVertices = [];
    this.verticesLayer?.getSource()?.clear();

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

    // 3. Inicializamos la capa auxiliar
    if (!this.verticesLayer && this.map?.map?.olMap) {
      this.verticesLayer = new VectorLayer({
        source: new VectorSource(),
        zIndex: 999,
        style: this.getLabeledStyle.bind(this)
      });
      this.map.map.olMap.addLayer(this.verticesLayer);
    }

    this.isUpdatingManualCoords = true;
    try {
      // 4. Limpiamos las capas para redibujar
      this.verticesLayer?.getSource()?.clear();
      if (this.geometriesLayer) {
        this.geometriesLayer.getSource()?.clear();
      }

      // 5. Dibujamos los puntos en la capa visual auxiliar
      this.manualVertices.forEach(coord => {
        const pointFeature = new Feature({ geometry: new Point(coord) });
        this.verticesLayer?.getSource()?.addFeature(pointFeature);
      });

      // 6A. Si es 1 punto -> Guardamos el Point también en geometriesLayer
      if (this.manualVertices.length === 1 && this.geometriesLayer) {
        const singlePointFeature = new Feature({ geometry: new Point(this.manualVertices[0]) });
        this.geometriesLayer.getSource()?.addFeature(singlePointFeature);
      }
      // 6B. Si son 2 puntos -> Dibujamos y guardamos LineString en verticesLayer y geometriesLayer
      else if (this.manualVertices.length === 2) {
        const lineFeature = new Feature({ geometry: new LineString(this.manualVertices) });
        this.verticesLayer?.getSource()?.addFeature(lineFeature);
        if (this.geometriesLayer) {
          this.geometriesLayer.getSource()?.addFeature(lineFeature.clone());
        }
      }
      // 6C. Si son 3 o más puntos -> Dibujamos y guardamos Polygon cerrado en verticesLayer y geometriesLayer
      else if (this.manualVertices.length >= 3) {
        const polygonCoords = [...this.manualVertices, this.manualVertices[0]];
        const polyFeature = new Feature({ geometry: new Polygon([polygonCoords]) });
        this.verticesLayer?.getSource()?.addFeature(polyFeature);
        if (this.geometriesLayer) {
          this.geometriesLayer.getSource()?.addFeature(polyFeature.clone());
        }
      }
    } finally {
      this.isUpdatingManualCoords = false;
    }

    // 8. Ajuste inteligente de la cámara (Zoom y Centrado)
    if (this.map?.map?.olMap) {
      if (this.manualVertices.length === 1) {
        this.map.map.olMap.getView().setCenter(mapCoord);
        this.map.map.olMap.getView().setZoom(13);
      } else {
        const extent = this.geometriesLayer?.getSource()?.getExtent();
        if (extent) {
          this.map.map.olMap.getView().fit(extent, {
            padding: [80, 80, 80, 80],
            maxZoom: 14,
            duration: 400
          });
        }
      }
    }

    // 9. Limpiamos los inputs
    this.latText = '';
    this.lonText = '';
  }

  clearManualCoords(): void {
    this.latText = '';
    this.lonText = '';
    this.manualVertices = [];

    if (this.geometriesLayer) {
      this.geometriesLayer.getSource()?.clear();
    }
    if (this.verticesLayer) {
      this.verticesLayer.getSource()?.clear();
    }
  }

  // FUNCION MAESTRA DE ESTILOS
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
