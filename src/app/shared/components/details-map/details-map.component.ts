import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { Map, View } from 'ol';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { GeoregulationPartModalDetails } from '@app/georegulation/models/georegulation.model';
import { InfosourcePart } from '@app/infosource/models/infosource.model';
import { MapMaritimeEntity } from '@app/models/maritime-entity.model';
import { NotionType } from '@app/models/notion.model';
import { WarningFeaturePart } from '@app/models/warning.model';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { DEFAULT_Z_INDEX } from '@app/sig/components/map/map.component';
import { PopoverComponent } from '@app/sig/components/popover/popover.component';
import { BasicControl } from '@app/sig/core/controls/basic-control';
import { MaritimeEntityFactory } from '@app/sig/core/maritime-entity.factory';
import { LayersFacade } from '@app/sig/facades/layers.facade';
import { MousePositionFormatterService } from '@app/sig/services/mouse-position-formatter.service';
import { FEATURE_PROPERTY_DEPTH, FEATURE_PROPERTY_DIFFERENCE, FEATURE_PROPERTY_NATURE, FeatureType } from '@app/sig/utils/feature';
import { GeometryType, OverlayPositioning, getGeometryType } from '@app/sig/utils/geometry';
import { PING_LAYER_NAME_PREFIX, addLayer, removeLayer, removePingLayers } from '@app/sig/utils/map';
import { SurveyDanger, SurveyDetection } from '@app/survey/models/survey.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
//import Carto from '@shom2/carto';
//import { default as CartoLayer } from '@shom2/carto/core/Layer';
//import { default as MapCarto } from '@shom2/carto/core/Map';
import { scaleExtent } from '@sig/utils/extent';
import Feature from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Overlay from 'ol/Overlay';
import { FitOptions } from 'ol/View';
import { Extent, createEmpty, extend, isEmpty as isExtentEmpty } from 'ol/extent';
import Geometry from 'ol/geom/Geometry';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subscription, throwError } from 'rxjs';
import { catchError, first, take } from 'rxjs/operators';
import { SupportedGeometryType } from '../shared-map/shared-map.component';

// --- INYECCI�N DE SEGURIDAD ---
class Carto {
  map: any = { layers: [] };
  [key: string]: any;
  constructor(...args: any[]) { }
}

class CartoLayer {
  name: any;
  olLayer: any;
  opacity: any;
  [key: string]: any;
  constructor(initData?: any) {
    if (initData) Object.assign(this, initData);
  }
}
// -----------------------------

/**
 * Multiplier to display all geometries and affectedAreas with acceptable zoom
 */
export const MODEL_EXTENT_MULTIPLIER = 1.8;

export type HilightFeatures = { geometries?: Feature[], affectedAreas?: Feature[], localisation?: Feature[], features?: Feature[] };

export interface MapModelItem {
  featureParts: Array<any>;
};
@Component({
  selector: 'shared-details-map',
  templateUrl: './details-map.component.html',
  styleUrls: ['./details-map.component.scss']
})
export class DetailsMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('popover') popoverComponent: PopoverComponent;
  @ViewChild('categoryPanel') categoryPanel: OverlayPanel;
  @ViewChild('legendPanel') legendPanel: OverlayPanel;

  @Input() height = 600;
  @Input() modelItem: MapModelItem;
  @Input() featuresToHighlight: HilightFeatures;
  @Input() enableLayersShowHide = false;
  @Input() showLayers = true;
  @Input() showZoneX = true;
  @Input() shouldShowRasterMarineWithAdditionalLayerForWestAfrica = false;
  @Input() showDetections = false;
  @Input() showDangers = false;
  @Input() shouldShowDangers = false;
  @Input() shouldShowDetections = false;
  @Input() canShowRasterMarineLayer = false;
  @Input() partsAttributeName = 'featureParts';
  @Input() canClickOnGeometry = false;
  @Input() notionType: NotionType;
  @Input() shouldShowMaritimesEntitiesManagedOrObservedByService = false;
  @Input() enableLayerMaritimesEntitiesManagedOrObservedByService = false;
  @Input() shouldMaintainCategoryPanelOpened = false;
  @Input() popover = false;
  @Input() shouldDisplayInfoOnHoverGeometry = false;
  @Input() enableLegend = false;
  @Output() geometriesBeingClicked = new EventEmitter<Set<SimpleGeometry>>();
  previousHighlightedFeatures: HilightFeatures = { geometries: [], affectedAreas: [], localisation: [], features: [] };
  carto: Carto;
  baseLayerSubscription: Subscription;
  map: MapCarto;
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  vectorSourceMaritimeEntities: VectorSource;
  vectorLayerMaritimeEntities: VectorLayer<VectorSource>;
  vectorSourceDetections: VectorSource;
  vectorLayerDetections: VectorLayer<VectorSource>;
  vectorSourceBoundingBox: VectorSource;
  vectorLayerBoundingBox: VectorLayer<VectorSource>;
  mapLoaded = false;
  protected modelExtent = createEmpty();
  shouldShowSubAreas = false;
  shouldShowZoneX = false;
  showSubAreas = false;
  shouldShowRasterMarineLayer = true;
  hasEventForAllowToClickOnFeatureHover = false;
  geometries: Set<SimpleGeometry>;
  entitiesManagedOrObservedByService: MapMaritimeEntity[];
  protected detectionFeatures: Feature[] = [];
  protected dangerFeatures: Feature[] = [];

  private popoverOverlay: Overlay;
  protected allDangers: SurveyDanger[] = [];
  protected allDetections: SurveyDetection[] = [];

  private hasEventForDisplayingDataOnHover = false;
  protected manageDataPopoverDisplayedHandler = this.manageDataPopoverDisplayed.bind(this);

  protected manageFeatureAndFeaturePartOnClickOnFeatureHandler = this.manageFeatureAndFeaturePartOnClickOnFeature.bind(this);
  protected manageClickEventHandler = this.manageClickEvent.bind(this);
  protected showMaritimesEntitiesManagedOrObservedByService = false;
  protected noAvailableLayerToDisplay = false;

  protected isBoundingBoxPresent = false;
  protected hasAtLeastOneLayerToShow = false;

  constructor(protected readonly layersFacade: LayersFacade,
    protected readonly alertMessageService: AlertMessageService,
    protected readonly mousePositionFormatter: MousePositionFormatterService,
    protected readonly translate: TranslateService,
    protected readonly element: ElementRef,
    protected readonly authService: AuthService,
    protected readonly maritimeEntityFactory: MaritimeEntityFactory,
    protected readonly maritimeEntityService: MaritimeEntitiesService) {
    this.vectorSource = new VectorSource<Geometry>();
    this.vectorLayer = new VectorLayer({
      zIndex: 10,
      source: this.vectorSource
    });
  }

  ngOnDestroy(): void {
    this.baseLayerSubscription && this.baseLayerSubscription.unsubscribe();
    if (this.hasEventForAllowToClickOnFeatureHover) {
      this.hasEventForAllowToClickOnFeatureHover = false;
      if (this.map?.olMap) {
        this.map.olMap.un('pointermove', this.manageFeatureAndFeaturePartOnClickOnFeatureHandler);
        this.map.olMap.un('click', this.manageClickEventHandler);
      }
    }

    if (this.hasEventForDisplayingDataOnHover && this.map?.olMap) {
      this.map.olMap.un('pointermove', this.manageDataPopoverDisplayedHandler);
    }

    this.layersFacade.reinitializeLayers(this.map?.olMap);

    if (this.map) {
      this.map.destroy();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.showMaritimesEntitiesManagedOrObservedByService = this.enableLayerMaritimesEntitiesManagedOrObservedByService && this.authService.isLoggedIn() && this.authService.hasRoleServiceUser();
    this.noAvailableLayerToDisplay = !this.showMaritimesEntitiesManagedOrObservedByService && !this.canShowRasterMarineLayer
      && !this.showMaritimesEntitiesManagedOrObservedByService && !this.showLayers && !this.showZoneX;

    if (changes.modelItem && this.mapLoaded && this.modelItem) {
      this.displaysModelItemFeatures();

      if (this.hasEventForDisplayingDataOnHover) {
        this.map.olMap.un('pointermove', this.manageDataPopoverDisplayedHandler);
      }

      this.addEventToDisplayDataOnHover();
    }
    if (changes.featuresToHighlight) {
      this.doHighlightingFeatures();
    }
  }

  ngAfterViewInit(): void {
    const showRasterMarineWithAdditionalLayerForWestAfrica = this.shouldShowRasterMarineWithAdditionalLayerForWestAfrica && this.authService.hasAnyRoleOnShomService();
    this.baseLayerSubscription = this.layersFacade.getBaseLayers$(showRasterMarineWithAdditionalLayerForWestAfrica)
      .pipe(
        first(),
        catchError(error => {
          this.alertMessageService.add({
            id: 'cannot-get-base-map-layer',
            severity: 'error',
            summary: 'message.summary.error',
            sticky: true,
            detail: 'message.error.api.cannot-get-base-map-layer'
          });
          return throwError(error);
        }))
      .subscribe(layers => {
        this.hasAtLeastOneLayerToShow = this.canShowRasterMarineLayer || this.showLayers || this.showZoneX || this.showDangers || this.showDetections;
        // Deep clone carto layers (excluding OSM base layer which is instantiated locally with preserveDrawingBuffer: true)
        this.createCarto(layers.filter(layer => !layer.name?.startsWith(PING_LAYER_NAME_PREFIX) && layer.name !== 'OSM')
          .map(
            layer => new CartoLayer({ name: layer.name, olLayer: new TileLayer({ ...layer.olLayer.getProperties(), source: layer.olLayer.getSource() }) })
          ));

        if (this.canClickOnGeometry) {
          this.addEventForAllowToClickOnFeatureHover();
        }

        if (this.shouldMaintainCategoryPanelOpened) {
          this.categoryPanel.show('', document.getElementsByClassName('control-btn-show-hide-layers')[0]);
        }
      });
  }

  fitToModelItem(): void {
    if (!this.map?.view || !this.modelExtent || isExtentEmpty(this.modelExtent) || !this.modelExtent.every(v => Number.isFinite(v))) {
      return;
    }
    this.map.view.fit(this.modelExtent, {
      size: this.map.olMap?.getSize(),
      padding: [50, 50, 50, 50],
      maxZoom: 13
    });
  }

  centerOnGeomOfFeaturePartSelected(featurePart: WarningFeaturePart | GeoregulationPartModalDetails | InfosourcePart): void {
    const options: FitOptions = {
      size: this.map?.olMap.getSize(),
      padding: [
        environment.carto.drawingModule.centerTool.paddingLeft,
        environment.carto.drawingModule.centerTool.paddingTop,
        environment.carto.drawingModule.centerTool.paddingRight,
        environment.carto.drawingModule.centerTool.paddingBottom
      ]
    };

    let allFeatures = [];
    switch (this.notionType) {
      case NotionType.WARNING:
        allFeatures = [...(featurePart as WarningFeaturePart).geometries, ...(featurePart as WarningFeaturePart).affectedAreas];
        break;
      case NotionType.GEOREGULATION:
        allFeatures = [...(featurePart as GeoregulationPartModalDetails).features];
        break;
      case NotionType.INFOSOURCE:
        allFeatures = [...(featurePart as InfosourcePart).localisation];
        break;

      default:
        break;
    }

    const hasOnlyGeometryTypePoint = allFeatures.every(feature => feature.get('geometry').getType() === SupportedGeometryType.POINT);
    if (hasOnlyGeometryTypePoint) {
      options.maxZoom = environment.carto.drawingModule.centerTool.maxZoom;
    }

    const sourceOnWhichToFitMap = new VectorSource<Geometry>();
    sourceOnWhichToFitMap.addFeatures(allFeatures);

    this.map?.olMap.getView().fit(sourceOnWhichToFitMap.getExtent(), options);
  }

  protected createCarto(layers: any[]): void {
    // 1. Extraemos las capas nativas
    const nativeLayers = layers.map(l => l.olLayer).filter(l => l);

    // 2. Creamos la capa base vectorial local autohospedada (con preserveDrawingBuffer: true para captura PDF)
    const baseLayer = this.layersFacade.createBasemapLayer({
      preserveDrawingBuffer: true,
      zIndex: 0
    });

    const targetEl = this.element?.nativeElement?.querySelector('.map-container') || 'simple-map';
    const rawCenter = environment.carto.defaultCenter || [-66.5, 10.5];
    const center3857 = (Math.abs(rawCenter[0]) <= 180 && Math.abs(rawCenter[1]) <= 90)
      ? fromLonLat(rawCenter, environment.carto.projection)
      : rawCenter;

    // 3. Instanciamos el mapa de OpenLayers con la proyección estándar del sistema (EPSG:3857)
    const olMap = new Map({
      target: targetEl,
      layers: [baseLayer, ...nativeLayers],
      view: new View({
        projection: environment.carto.projection,
        center: center3857,
        zoom: environment.carto.defaultZoom,
        extent: [-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244],
        multiWorld: false,
        maxZoom: 20
      })
    });

    // Añadimos el polígono si existe
    if (this.vectorLayer) {
      olMap.addLayer(this.vectorLayer);
    }

    // 4. Creamos el puente para el resto del componente
    this.carto = {
      layers: layers,
      getView: () => olMap.getView(),
      map: {
        olMap: olMap,
        layers: layers,
        view: olMap.getView(),
        getView: () => olMap.getView(),
        getSize: () => olMap.getSize(),
        updateSize: () => olMap.updateSize(),
        removeLayer: (capaAEliminar: any) => {
          if (capaAEliminar && capaAEliminar.olLayer) {
            olMap.removeLayer(capaAEliminar.olLayer);
          }
        },
        destroy: () => {
          if (olMap) {
            olMap.setTarget(null);
          }
        }
      }
    };
    this.map = this.carto.map;

    this.mapLoaded = true;

    // 5. Renderizado final
    if (this.modelItem) {
      this.displaysModelItemFeatures();
      this.addEventToDisplayDataOnHover();
    }

    if (this.popover) {
      this.popoverOverlay = new Overlay({
        element: this.popoverComponent.element.nativeElement,
        offset: [0, -12],
        positioning: OverlayPositioning.BOTTOM_CENTER
      });
      olMap.addOverlay(this.popoverOverlay);
    }

    // 6. Actualizamos el tamaño real del modal y re-aplicamos el zoom/encuadre
    setTimeout(() => {
      olMap.updateSize();
      if (this.modelItem && !this.isBoundingBoxPresent) {
        this.fitToModelItem();
      }
    }, 200);
  }

  protected addEventToDisplayDataOnHover(): void {
    if (this.popover && !this.hasEventForDisplayingDataOnHover) {
      this.map.olMap.on('pointermove', this.manageDataPopoverDisplayedHandler);
      this.hasEventForDisplayingDataOnHover = true;
    }
  }

  protected manageDataPopoverDisplayed(evt: MapBrowserEvent<UIEvent>): void {
    const dangers = new Set<SurveyDanger>();
    const geometriesOnHover = new Set<SimpleGeometry>();

    if (this.allDangers?.length) {
      this.addFeatures(evt, dangers, this.vectorLayer, 'danger');
    }

    if (this.shouldDisplayInfoOnHoverGeometry && this.geometries?.size) {
      this.vectorLayer.getSource().forEachFeature(feature => {
        const featureProperties = feature.getProperties();
        const canAddBathyProperties =
          featureProperties?.isBathy && [GeometryType.POINT, GeometryType.CIRCLE, GeometryType.POLYGON].includes(getGeometryType(feature.getGeometry().getType()));
        if (canAddBathyProperties) {
          const isPoint = feature.getGeometry().getType() === GeometryType.POINT;
          feature.getGeometry().set(isPoint ? FEATURE_PROPERTY_DEPTH : FEATURE_PROPERTY_DIFFERENCE, isPoint ? featureProperties.depth : featureProperties.difference);
          feature.getGeometry().set(FEATURE_PROPERTY_NATURE, featureProperties.nature);
        }
      });

      this.addFeatures(evt, geometriesOnHover, this.vectorLayer, 'geometry');
    }

    if (dangers.size && this.popover) {
      this.element.nativeElement.style.cursor = 'pointer';
      this.showPopover(evt, dangers, FeatureType.DANGER);
    } else if (this.shouldDisplayInfoOnHoverGeometry && geometriesOnHover.size && this.popover) {
      this.element.nativeElement.style.cursor = 'pointer';
      this.showPopover(evt, geometriesOnHover, FeatureType.SIMPLE_GEOMETRY);
    } else {
      this.element.nativeElement.style.cursor = 'initial';
      this.popoverComponent.hide();
    }
  }

  protected showPopover(evt: MapBrowserEvent<UIEvent>, data: Set<SurveyDanger> | Set<SimpleGeometry>, type: FeatureType): void {
    this.popoverOverlay.setPosition(evt.coordinate);
    this.popoverComponent.setSurveyFeaturesDataToDisplay(data, type);
    this.popoverComponent.show();
  }

  protected addFeatures(evt: MapBrowserEvent<UIEvent>, data: Set<SurveyDanger> | Set<SurveyDetection> | Set<SimpleGeometry>, vectorLayer: VectorLayer<VectorSource>, type: string): void {
    this.map.olMap.forEachFeatureAtPixel(evt.pixel, feature => data.add(feature.get(type)),
      {
        layerFilter: layer => layer === vectorLayer
      });
  }

  protected displaysModelItemFeatures(): void {
    if (this.carto?.map) { removePingLayers(this.carto.map); }

    // the boundingBox delimits the zone in which the geometries will be located.
    // Its layer is displayed before any other data layer if bounding coordinates are available, and can be displayed alone on the map even if there are no geometries.
    this.displayBoundingBoxOnTheMapIfPresent();

    // If data is available with the boundingBox shown on the map, the geometries will be located in the boundingBox. If no boundingBox, the geometries will just be added to the map.
    if (this.modelItem[this.partsAttributeName].length) {
      this.vectorSource.clear();
      const globalExtent = createEmpty();
      const features = this.retrieveFeaturesFromModelItem(globalExtent);
      this.vectorSource.addFeatures(features);
      this.modelExtent = scaleExtent(globalExtent, MODEL_EXTENT_MULTIPLIER);
      this.map?.olMap?.set('modelExtent', this.modelExtent);
    }

    if (!this.isBoundingBoxPresent) {
      this.fitToModelItem();
    }
    this.showLayersIfRequired(this.shouldShowSubAreas);
  }

  private retrieveFeaturesFromModelItem(globalExtent: Extent): Feature[] {
    return this.modelItem[this.partsAttributeName]
      .map(featurePart => {
        const features = this.getAllFeatures(featurePart);
        features.forEach(feature => {
          const geom = feature.getGeometry();
          if (geom) {
            const ext = geom.getExtent();
            if (Math.abs(ext[0]) <= 180 && Math.abs(ext[1]) <= 90 && Math.abs(ext[2]) <= 180 && Math.abs(ext[3]) <= 90 && (ext[0] !== 0 || ext[1] !== 0)) {
              geom.transform('EPSG:4326', environment.carto.projection);
            }
            globalExtent = extend(globalExtent, geom.getExtent());
          }
        });
        return features;
      })
      .reduce((featureAccumulator: Feature[], features: Feature[]) => featureAccumulator.concat(features), []);
  }

  protected getAllFeatures(featurePart: any): Feature[] {
    return new Array<Feature>();
  }

  protected displayBoundingBoxOnTheMapIfPresent(): void { }

  updateMapIfShouldShowSubAreas(): void {
    this.shouldShowSubAreas ? this.showHideLayers(true) : this.showHideLayers(false);
  }

  updateMapIfShouldShowZoneX(): void {
    this.shouldShowZoneX ? this.showHideZoneX(true) : this.showHideZoneX(false);
  }

  updateMapIfShouldShowRasterMarineLayer(): void {
    this.shouldShowRasterMarineLayer ?
      this.layersFacade.addRasterMarineLayer(this.carto.map, 1).pipe(take(1)).subscribe()
      : this.layersFacade.removeLayer(this.carto.map, environment.carto.rasterMarineLayerName);
  }

  updateMapIfShouldShowMaritimesEntitiesManagedOrObservedByService(): void {
    if (!this.authService.isLoggedIn() || !this.authService.hasRoleServiceUser()) {
      return;
    }

    if (this.shouldShowMaritimesEntitiesManagedOrObservedByService) {
      this.loadMapMaritimeEntities();
    } else {
      this.entitiesManagedOrObservedByService = [];
      this.removeLayer(this.vectorLayerMaritimeEntities);
    }
  }

  loadMapMaritimeEntities(): void {
    this.maritimeEntityService.getEntitiesManagedOrObservedByServiceToDisplayOnMap$()
      .pipe(take(1))
      .subscribe(entities => {
        if (entities) {
          this.entitiesManagedOrObservedByService = entities;
          this.displaysEntitiesData();
        }
      });
  }

  protected displaysEntitiesData(): void {
    if (!this.vectorLayerMaritimeEntities) {
      this.initMaritimeEntityVisuLayers();
    }

    this.addLayer(this.vectorLayerMaritimeEntities);

    this.vectorSourceMaritimeEntities.clear(true);

    const entitiesFeatures = this.maritimeEntityFactory.createGeometries(this.entitiesManagedOrObservedByService);
    if (entitiesFeatures) {
      this.vectorSourceMaritimeEntities.addFeatures(entitiesFeatures);
    }

    this.vectorLayerMaritimeEntities.setSource(this.vectorSourceMaritimeEntities);
  }

  private initMaritimeEntityVisuLayers(): void {
    this.vectorSourceMaritimeEntities = new VectorSource<Geometry>();
    this.vectorLayerMaritimeEntities = new VectorLayer({
      zIndex: 10,
      source: this.vectorSource
    });

    this.map.olMap.addLayer(this.vectorLayerMaritimeEntities);
  }

  private showCategoryPanel(event): void {
    this.categoryPanel.toggle(event);
  }

  private showLegendPanel(event): void {
    this.legendPanel.toggle(event);
  }

  protected showHideLayers(canShow: boolean): void {
    this.showSubAreas = canShow;
    this.showLayersIfRequired(canShow);
  }

  protected showHideZoneX(canShow: boolean): void {
    this.showZoneXIfRequired(canShow);
  }

  protected doHighlightingFeatures() {
    throw new Error('Not implemented');
  }

  protected showLayersIfRequired(show: boolean): void {
    throw new Error('Not implemented');
  }

  protected showZoneXIfRequired(show: boolean): void {
    throw new Error('Not implemented');
  }

  private findLayer(vectorLayer: VectorLayer<VectorSource>): boolean {
    return this.map.olMap.getLayers().getArray().find(layer => layer === vectorLayer) !== undefined;
  }

  private addLayer(vectorLayer: VectorLayer<VectorSource>): void {
    if (!this.findLayer(vectorLayer)) {
      this.map.olMap.addLayer(vectorLayer);
    }
  }

  private removeLayer(vectorLayer: VectorLayer<VectorSource>): void {
    if (this.findLayer(vectorLayer)) {
      this.map.olMap.removeLayer(vectorLayer);
    }
  }

  addEventForAllowToClickOnFeatureHover(): void {
    if (this.hasEventForAllowToClickOnFeatureHover) {
      return;
    }

    this.map.olMap.on('pointermove', this.manageFeatureAndFeaturePartOnClickOnFeatureHandler);
    this.hasEventForAllowToClickOnFeatureHover = true;

    this.map.olMap.on('click', this.manageClickEventHandler);
  }

  protected manageFeatureAndFeaturePartOnClickOnFeature(evt: MapBrowserEvent<UIEvent>): void {
    this.geometries = new Set<SimpleGeometry>();
    this.addFeatures(evt, this.geometries, this.vectorLayer, 'geometry');
    this.element.nativeElement.style.cursor = this.geometries.size ? 'pointer' : 'initial';
  }

  protected manageClickEvent(): void {
    this.geometriesBeingClicked.emit(this.geometries);
  }

  protected updateMapIfShouldShowDetections(): void {
    this.detectionFeatures = [];
    this.removeDetectionsLayer();

    if (this.shouldShowDangers && this.shouldShowDetections) {
      this.updateMapIfShouldShowDangersAndDetections();
    } else if (this.shouldShowDetections) {
      this.displayDetectionsData();
    } else {
      this.detectionFeatures = [];
      this.removeDetectionsLayer();
    }
  }

  protected updateMapIfShouldShowDangers(): void {
    if (this.shouldShowDangers && this.shouldShowDetections) {
      this.updateMapIfShouldShowDangersAndDetections();
    } else if (this.shouldShowDangers) {
      this.displayDangersData();
    } else {
      this.dangerFeatures = [];
      this.removeDangersLayer();
    }
  }

  private updateMapIfShouldShowDangersAndDetections(): void {
    const globalExtent = createEmpty();
    this.retrieveFeaturesFromModelItem(globalExtent);

    this.removeDetectionsLayer();
    this.removeDangersLayer();
    this.displayDangersData();
    this.displayDetectionsData();
  }

  private initDetectionsVisuLayers(): void {
    this.vectorSourceDetections = new VectorSource<Geometry>();
    this.vectorLayerDetections = new VectorLayer({ zIndex: DEFAULT_Z_INDEX });

    this.map?.olMap?.addLayer(this.vectorLayerDetections);
  }

  private removeDangersLayer(): void {
    removeLayer(this.vectorLayer, this.map);
  }

  private removeDetectionsLayer(): void {
    removeLayer(this.vectorLayerDetections, this.map);
  }

  private displayDetectionsData(): void {
    if (!this.vectorSourceDetections) {
      this.initDetectionsVisuLayers();
    }

    addLayer(this.vectorLayerDetections, this.map);

    this.vectorSourceDetections.clear(true);

    const extent = createEmpty();
    if (!this.shouldShowDangers) {
      this.detectionFeatures = this.retrieveFeaturesFromModelItem(extent);
    }

    if (this.detectionFeatures) {
      this.vectorSourceDetections.addFeatures(this.detectionFeatures);
    }

    this.vectorLayerDetections.setSource(this.vectorSourceDetections);
  }

  private displayDangersData(): void {
    addLayer(this.vectorLayer, this.map);

    this.vectorSource.clear(true);

    const extent = createEmpty();
    if (!this.shouldShowDetections) {
      this.dangerFeatures = this.retrieveFeaturesFromModelItem(extent);
    }

    if (this.dangerFeatures) {
      this.vectorSource.addFeatures(this.dangerFeatures);
    }

    this.vectorLayer.setSource(this.vectorSource);
  }
}
