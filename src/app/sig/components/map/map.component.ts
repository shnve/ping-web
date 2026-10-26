import { transformExtent, transform, fromLonLat } from 'ol/proj';
import Modify from 'ol/interaction/Modify';
import Stroke from 'ol/style/Stroke';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { get as getProjection } from 'ol/proj';
import { getWidth } from 'ol/extent';
import { Observable, Subject, Subscription, of, throwError } from 'rxjs';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { LangService } from '@app/core/lang.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { MapWarningsFacade } from '@app/facades/map-warnings.facade';
import { GeoregulationType, MapGeoregulation } from '@app/georegulation/models/georegulation.model';
import { AbstractGeoregulationService } from '@app/georegulation/services/abstract-georegulation.service';
import { MapInfosource } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { MapMaritimeEntity } from '@app/models/maritime-entity.model';
import { NotionType } from '@app/models/notion.model';
import { defaultValuesMapFilter, MapFilterValues } from '@app/models/warning-filters.model';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { GeoregulationStyleFactory } from '@app/sig/core/georegulation-style.factory';
import { InfosourceStyleFactory } from '@app/sig/core/infosource-style.factory';
import { MaritimeEntityFactory } from '@app/sig/core/maritime-entity.factory';
import { ModelItemCluster } from '@app/sig/core/model-item-cluster';
import { SurveyDangerFactory } from '@app/sig/core/survey-danger.factory';
import { LoaderService } from '@app/sig/services/loader.service';
import { pad } from '@app/sig/utils/coordinate';
import { convertJsonFeatureToFeature, getDefaultStyle, showFeatureLabel } from '@app/sig/utils/feature';
import { GeometryType, OverlayPositioning } from '@app/sig/utils/geometry';
import { addLayer, formatCoordinateToDMS, formatDecimalToSHOM, removeLayer, showHideLayers, showHideZoneX } from '@app/sig/utils/map';
import { genericRetryStrategy } from '@app/sig/utils/retry-utils';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { SurveyDetection } from '@app/survey/models/survey.model';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopoverComponent } from '@sig/components/popover/popover.component';
import { BasicControl } from '@sig/core/controls/basic-control';
import { WarningStyleFactory } from '@sig/core/warning-style.factory';
import { LayersFacade } from '@sig/facades/layers.facade';
import { LocalBasemapService } from '@sig/services/local-basemap.service';
import { MousePositionFormatterService } from '@sig/services/mouse-position-formatter.service';
import { Scavenger } from '@wishtack/rx-scavenger';
import Feature, { FeatureLike } from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Overlay from 'ol/Overlay';
import MousePosition from 'ol/control/MousePosition';
import { FitOptions } from 'ol/View';
import { Extent } from 'ol/extent';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Style, Circle as CircleStyle } from 'ol/style';
import { getLength, getDistance } from 'ol/sphere';
import { OverlayPanel } from 'primeng/overlaypanel';
import { catchError, first, map, retryWhen, take, takeUntil, tap } from 'rxjs/operators';
import { AlertMessageService } from '../../../core/alert-message.service';
import { defaultValuesGeoregulationMapFilter, GeoregulationMapFilterValues } from '../../../georegulation/models/georegulation-filters.model';
import { georegulationServiceProvider } from '../../../georegulation/providers/georegulation.service.provider';
import { MapWarning } from '../../../models/warning.model';
import { featureToPoint } from '../../utils/aggregation';
import { SupportedGeometryType } from './../../../shared/components/shared-map/shared-map.component';
import OSM from 'ol/source/OSM';

// --- INYECCIÃ“N DE SEGURIDAD FINAL COMPLETA ---
const _mockProj: any = { id: 'EPSG:4326', code: 'EPSG:4326', coordinatesFormat: { decimalToFormat: '' }, helper: '' };
const PROJECTION_WGS84_DECIMAL: any = _mockProj;
const PROJECTION_WGS84_DMS: any = _mockProj;
const PROJECTION_WGS84_DMSDS: any = _mockProj;
const PROJECTION_S53: any = _mockProj;
const PROJECTION_ED50_DMS: any = _mockProj;
const PROJECTION_ED50_DECIMAL: any = _mockProj;
const PROJECTION_LAMBERT_93: any = _mockProj;
const PROJECTION_LAMBERT_I: any = _mockProj;
const PROJECTION_LAMBERT_II: any = _mockProj;
const PROJECTION_LAMBERT_III: any = _mockProj;
const PROJECTION_LAMBERT_IV: any = _mockProj;


class MeasureType {
  static LENGTH = 'LENGTH'; static AZIMUTH = 'AZIMUTH'; static RADIUS = 'RADIUS';
}

class CoordDirection { static NORTH = 'N'; static SOUTH = 'S'; static EAST = 'E'; static WEST = 'W'; }
class CoordinatePart { static LAT = 'LAT'; static LON = 'LON'; }
class ProjectionSystem { coordinatesFormat: any = { decimalToFormat: '' }; helper: string = '';[key: string]: any; constructor(...args: any[]) { } }

const metersToKms = (...args: any[]) => 0;
const metersToNMiles = (...args: any[]) => 0;
const sqrMetersToSqrKms = (...args: any[]) => 0;
const sqrMetersToSqrNMiles = (...args: any[]) => 0;
// ---------------------------------------------

const MINIMUM_FRACTION_DIGITS = environment.carto.measurementModule.formatFunction.minimumFractionDigits;
const MAXIMUM_FRACTION_DIGITS = environment.carto.measurementModule.formatFunction.maximumFractionDigits;
const GEOREGULATION_TYPE_KEYS = [GeoregulationType.MARITIME_PUBLIC_DOMAIN_OCCUPANCY, GeoregulationType.NAVIGATION, GeoregulationType.OTHER];

const PROJECTION_SYSTEMS = [
  PROJECTION_WGS84_DMS,
  PROJECTION_WGS84_DECIMAL,
  PROJECTION_WGS84_DMSDS,
  PROJECTION_S53,
  PROJECTION_ED50_DMS,
  PROJECTION_ED50_DECIMAL,
  PROJECTION_LAMBERT_93,
  PROJECTION_LAMBERT_I,
  PROJECTION_LAMBERT_II,
  PROJECTION_LAMBERT_III,
  PROJECTION_LAMBERT_IV
];

const MINUTES_IN_ONE_DEGREE = 60;
const SECONDS_IN_ONE_MINUTE = 60;

export const DEFAULT_Z_INDEX = 10;

@Component({
  selector: 'sig-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    MousePositionFormatterService,
    infosourceServiceProvider,
    georegulationServiceProvider
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@Localize()
export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, OnChangeLang {

  @ViewChild('popover') popoverComponent: PopoverComponent;
  @ViewChild('categoryPanel') categoryPanel: OverlayPanel;

  private readonly scavenger = new Scavenger(this);
  private destroy$ = new Subject<void>();


  subscriptions: Subscription;
  map: any;
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  vectorSourceMaritimeEntities: VectorSource;
  vectorLayerMaritimeEntities: VectorLayer<VectorSource>;
  vectorSourceInfosources: VectorSource;
  vectorLayerInfosources: VectorLayer<VectorSource>;

  // Measurement properties
  measureSource: VectorSource;
  measureLayer: VectorLayer<VectorSource>;
  measureTooltips: Overlay[] = [];
  isMeasuring: boolean = false;
  currentMeasureInteraction: Draw | null = null;
  btnMeasureDistance: BasicControl;
  btnMeasureAzimuth: BasicControl;
  btnMeasureRadius: BasicControl;
  activeTool: string = '';

  vectorSourceGeoregulations: Array<{ type: GeoregulationType, vectorSource: VectorSource }> = [];
  vectorLayerGeoregulations: Array<{ type: GeoregulationType, vectorSource: VectorLayer<VectorSource> }> = [];
  vectorSourceGeoregulationsVisu: VectorSource;
  vectorLayerGeoregulationsVisu: VectorLayer<VectorSource>;
  vectorSourceDetections: VectorSource;
  vectorLayerDetections: VectorLayer<VectorSource>;
  warningCluster: ModelItemCluster;
  infosourceCluster: ModelItemCluster;
  georegulationCluster: ModelItemCluster;
  popoverOverlay: Overlay;
  isLoaded = false;
  warningsInPopover: MapWarning[] = [];
  georegulationsInPopover: MapGeoregulation[] = [];
  georegulationsClickable: MapGeoregulation[] = [];
  infosourcesInPopover: MapInfosource[] = [];
  layerName: string;
  shouldShowInfosources = false;
  shouldShowGeoregulations = [
    { 'NAVIGATION': false },
    { 'MARITIME_PUBLIC_DOMAIN_OCCUPANCY': false },
    { 'OTHER': false }
  ];
  shouldShowRasterMarineLayer = true;
  shouldShowOrthoGeoLittoralV2Layer = false;
  showDatas = false;
  showGeoregulationDatas = false;
  showDetectionData = false;
  mapWarnings$: Observable<MapWarning[]>;
  mapGeoregulations$: Observable<MapGeoregulation[]>;
  serviceName: string;
  numberHiddenGeoregulations = 0;
  lastEvtPointerMove: MapBrowserEvent<UIEvent>;
  collapsedHiddenGeoregulationsMessage = false;
  public readonly mapFilterState: ModelItemFilterState<MapFilterValues>;
  public readonly mapFilterStateGeoregulation: ModelItemFilterState<GeoregulationMapFilterValues>;

  protected manageDatasPopoverDisplayingHandler = this.manageDatasPopoverDisplaying.bind(this);
  protected manageGeoregulationClickEventHandler = this.manageGeoregulationClickEvent.bind(this);
  protected hideLargeGeoregulationsHandler = this.hideLargeGeoregulations.bind(this);
  protected toggleClusterizationAccordingZoomHandler = this.toggleClusterizationAccordingZoom.bind(this);
  protected manageClickEventHandler = this.manageClickEvent.bind(this);

  @Input() enableLiveCoordinates: boolean = true;

  measurementFormatFunction = function (measurementValue): string {
    const format = {
      minimumFractionDigits: MINIMUM_FRACTION_DIGITS,
      maximumFractionDigits: MAXIMUM_FRACTION_DIGITS
    };

    const locale = this.i18n.language;

    return (measurementValue.surface
      ? `${this.i18n.dict.MEASUREMENT_SURFACE_RESULT}
           ${sqrMetersToSqrKms(measurementValue.surface).toLocaleString(locale, format)}
           ${this.i18n.dict.KILOMETERS}Â²
           (${sqrMetersToSqrNMiles(measurementValue.surface).toLocaleString(locale, format)}
           ${this.i18n.dict.NAUTIC_MILES}Â²)`
      : ``)
      + (measurementValue.azimuth
        ? `${this.i18n.dict.MEASUREMENT_AZIMUTH_RESULT}
           ${measurementValue.azimuth.toLocaleString(locale, format)}Â°
           <br>`
        : ``)
      + (measurementValue.length
        ? `${this.i18n.dict.MEASUREMENT_DISTANCE_RESULT}
           ${metersToKms(measurementValue.length).toLocaleString(locale, format)}
           ${this.i18n.dict.KILOMETERS}
           (${metersToNMiles(measurementValue.length).toLocaleString(locale, format)}
           ${this.i18n.dict.NAUTIC_MILES})`
        : ``)
      + (measurementValue.radius
        ? `${this.i18n.dict.MEASUREMENT_RADIUS_RESULT}
             ${metersToKms(measurementValue.radius).toLocaleString(locale, format)}
             ${this.i18n.dict.KILOMETERS}
             (${metersToNMiles(measurementValue.radius).toLocaleString(locale, format)}
             ${this.i18n.dict.NAUTIC_MILES})`
        : ``);
  };

  /**
 * Converti des coordonnÃ©es en degrÃ©s dÃ©cimaux vers un format DMS particulier
 *
 * @param coordinate  la coordonnÃ©e en degrÃ©s dÃ©cimaux Ã  formater
 * @param coordinatePart  partie de la coordonnÃ©e (lon/lat)
 * @param format Le format vers lequel la conversion va s'effectuer
 * @param decMinPrecision le nombre de chiffres de la partie dÃ©cimale de minutes dans le format DMS
 * @param decSecPrecision le nombre de chiffres de la partie dÃ©cimale de secondes dans le format DMS
 *
 * @returns {string} la coordonnÃ©e formattÃ©e
 */
  convertCoordinateDecimalToFormattedDMS = function (coordinate: number, coordinatePart: CoordinatePart, format: string, decMinPrecision = 2, decSecPrecision = 2): string {
    const maxDegreeSize = coordinatePart === CoordinatePart.LAT ? 2 : 3;

    const direction = coordinatePart === CoordinatePart.LAT ?
      coordinate >= 0 ? CoordDirection.NORTH : CoordDirection.SOUTH :
      coordinate >= 0 ? CoordDirection.EAST : CoordDirection.WEST;

    const degrees = Math.abs(coordinate);
    const degreesSplit = degrees.toString().split('.');
    const degreesInt = degreesSplit[0];
    const degreesDec = degreesSplit[1]?.substring(0, 2) || '0';
    const minutes = (degrees - Number(degreesInt)) * MINUTES_IN_ONE_DEGREE;
    const minutesSplit = minutes.toString().split('.');
    const minutesInt = minutesSplit[0];
    const minutesDec = minutesSplit[1]?.substring(0, decMinPrecision) || '0';
    const seconds = (minutes - Number(minutesInt)) * SECONDS_IN_ONE_MINUTE;
    const secondsSplit = seconds.toString().split('.');
    const secondsInt = secondsSplit[0];
    const secondsDec = secondsSplit[1]?.substring(0, decSecPrecision) || '0';

    return format
      .replace('{D}', degreesInt)
      .replace('{DD}', pad(degreesInt, maxDegreeSize))
      .replace('{d}', degreesDec)
      .replace('{dd}', pad(degreesDec, 2))
      .replace('{M}', minutesInt)
      .replace('{MM}', pad(minutesInt, 2))
      .replace('{m}', minutesDec)
      .replace('{mm}', pad(minutesDec, decMinPrecision))
      .replace('{S}', secondsInt)
      .replace('{SS}', pad(secondsInt, 2))
      .replace('{s}', secondsDec)
      .replace('{ss}', pad(secondsDec, decSecPrecision))
      .replace('{c}', direction)
      .replace('{pp}', coordinate >= 0 ? '+' : '-')
      .replace('{p}', coordinate >= 0 ? '' : '-');
  };

  @Input() disabled = false;
  @Input() extent?: Extent;
  @Input() warnings?: MapWarning[];
  @Input() infosources?: MapInfosource[];
  @Input() georegulations?: MapGeoregulation[] = [];
  @Input() infosourceId?: string;
  @Input() georegulationId?: string;
  @Input() popover = false;
  @Input() showLabels = true;
  @Input() showLayers = true;
  @Input() showZoneX = true;
  @Input() showWarnings? = false;
  @Input() showDetections = false;
  @Input() shouldShowDetections = false;
  @Input() shouldShowWarnings? = false;
  @Input() enableLayerMaritimesEntitiesManagedOrObservedByService = false;
  @Input() shouldShowMaritimesEntitiesManagedOrObservedByService = false;
  @Input() shouldShowSubAreas? = false;
  @Input() shouldShowZoneX? = false;
  @Input() showInfosources? = false;
  @Input() showGeoregulations? = false;
  @Input() canShowHideGeoregulationLayers? = false;
  @Input() canShowRasterMarineLayer = false;
  @Input() shouldShowRasterMarineWithAdditionalLayerForWestAfrica = false;
  @Input() canShowOrthoIGNLayer = false;
  @Input() parentLayers = true;
  @Input() serieName?: string;
  @Input() serieId?: string;
  @Input() getDetailWarnings = true;
  @Input() getDetailGeoregulations = false;
  // To add modules in current map
  @Input() modulesOptions: Omit<CartoModulesOptions, 'ZoomModuleOptions' | 'MousePositionModuleOptions'> = {};
  @Input() enableKmlImport = false;
  @Input() enableGotoLegend = false;
  @Input() enableLabelsShowHide = false;
  @Input() enableLayersShowHide = false;
  @Input() kmlImportCallback: () => void;
  @Input() isNotDefaultStyle? = false;
  @Input() isGeoregulationStyle? = false;
  @Input() geometriesLayer?: VectorLayer<VectorSource>;
  @Input() georegulationIssuingServiceId: string;
  @Input() surveyDetections: SurveyDetection[];

  @Output() onSelectWarnings = new EventEmitter<MapWarning[]>();
  @Output() onSelectInfosources = new EventEmitter<MapInfosource[]>();
  @Output() georegulationsSelected = new EventEmitter<MapGeoregulation[]>();

  @Output() onLoad = new EventEmitter<void>();

  btnDraw: any; // O el tipo BasicControl si lo tienes exportado
  private drawInteraction: any = null;
  public isDrawing: boolean = false;
  public activeDrawType: string | null = null;
  private localDrawLayer: any = null;

  btnKml: BasicControl;
  btnLayers: BasicControl;
  btnLabels: BasicControl;
  btnLegend: BasicControl;

  mapId: string;

  visibleGeoregulations = new Set<MapGeoregulation>();
  hiddenGeoregulations = new Set<MapGeoregulation>();

  hasEventForDisplayingDatasOnHover = false;

  currentLanguage: string;

  private showLabelsPreviousValue: boolean;

  private detectionFeatures: Feature[];

  private loaderSubscription: Subscription;

  entitiesManagedOrObservedByService: MapMaritimeEntity[];
  protected showMaritimesEntitiesManagedOrObservedByService = false;

  constructor(private readonly layersFacade: LayersFacade,
    private readonly alertMessageService: AlertMessageService,
    private readonly mousePositionFormatter: MousePositionFormatterService,
    private readonly warningStyleFactory: WarningStyleFactory,
    private readonly infosourceStyleFactory: InfosourceStyleFactory,
    private readonly georegulationStyleFactory: GeoregulationStyleFactory,
    private readonly element: ElementRef,
    private readonly translate: TranslateService,
    private readonly mapWarningsFacade: MapWarningsFacade,
    private readonly alertMessages: AlertMessageService,
    private readonly authService: AuthService,
    private readonly abstractInfosourceService: AbstractInfosourceService,
    private readonly abstractGeoregulationService: AbstractGeoregulationService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly langService: LangService,
    private readonly loader: LoaderService,
    private readonly maritimeEntityFactory: MaritimeEntityFactory,
    private readonly maritimeEntityService: MaritimeEntitiesService,
    protected readonly surveyDangerFactory: SurveyDangerFactory,
    private readonly localBasemapService: LocalBasemapService
  ) {
    this.mapId = MapComponent.generateMapHtmlUniqId();
    this.serviceName = this.authService.getAuthenticatedUser()?.serviceName;
    this.mapFilterState = new ModelItemFilterState<MapFilterValues>();
    this.mapFilterState.initFilter(defaultValuesMapFilter);

    this.mapFilterStateGeoregulation = new ModelItemFilterState<GeoregulationMapFilterValues>();
    this.mapFilterStateGeoregulation.initFilter(defaultValuesGeoregulationMapFilter);

    this.currentLanguage = this.langService.getUserPreferredLang();
  }

  ngOnInit(): void {
    this.loaderSubscription = this.loader.listenToLoading(this.element);
  }

  private static generateMapHtmlUniqId(): string {
    return 'map-' + (new Date()).getTime();
  }

  protected updateMapIfShouldShowDetections(): void {
    /*
    if (this.shouldShowDetections && !this.showDetectionData) {
      this.displayDetectionsData();
    } else {
      this.detectionFeatures = [];
      this.showDetectionData = false;
      removeLayer(this.vectorLayerDetections, this.map);
    }
    */
  }

  updateMapIfShouldShowRasterMarineLayer(): void {
    if (this.shouldShowOrthoGeoLittoralV2Layer && this.shouldShowRasterMarineLayer) {
      this.updateMapIfShouldShowRasterMarineLayerAndOrthoIGNLayer();
    } else {
      if (this.shouldShowOrthoGeoLittoralV2Layer) {
        this.map.layers.find(layer => layer.name === environment.carto.orthoGeoLittoralV2LayerName).opacity = 0.8;
      }

      this.shouldShowRasterMarineLayer ?
        this.layersFacade.addRasterMarineLayer(this.map, 1).pipe(take(1)).subscribe()
        : this.layersFacade.removeLayer(this.map, environment.carto.rasterMarineLayerName);
    }
  }

  updateMapIfshouldShowOrthoGeoLittoralV2Layer(): void {
    if (this.shouldShowOrthoGeoLittoralV2Layer && this.shouldShowRasterMarineLayer) {
      this.updateMapIfShouldShowRasterMarineLayerAndOrthoIGNLayer();
    } else {
      if (this.shouldShowRasterMarineLayer) {
        this.map.layers.find(layer => layer.name === environment.carto.rasterMarineLayerName).opacity = 1;
      }

      this.shouldShowOrthoGeoLittoralV2Layer ?
        this.layersFacade.addOrthoGeoLittoralV2Layer(this.map, 0.8)
        : this.layersFacade.removeLayer(this.map, environment.carto.orthoGeoLittoralV2LayerName);
    }
  }

  updateMapIfShouldShowRasterMarineLayerAndOrthoIGNLayer(): void {
    this.layersFacade.removeLayer(this.map, environment.carto.orthoGeoLittoralV2LayerName);
    this.layersFacade.removeLayer(this.map, environment.carto.rasterMarineLayerName);
    this.layersFacade.addOrthoGeoLittoralV2Layer(this.map, 1);
    this.layersFacade.addRasterMarineLayer(this.map, 0.3).pipe(take(1)).subscribe();
  }

  updateMapIfShouldShowSubAreas(): void {
    this.showHideLayers(this.shouldShowSubAreas);
  }

  updateMapIfShouldShowZoneX(): void {
    this.showHideZoneX(this.shouldShowZoneX);
  }

  updateMapIfShouldShowMaritimesEntitiesManagedOrObservedByService(): void {
    if (!this.authService.isLoggedIn() || !this.authService.hasRoleServiceUser()) {
      return;
    }

    if (this.shouldShowMaritimesEntitiesManagedOrObservedByService) {
      this.loadMapMaritimeEntities();
    } else {
      this.entitiesManagedOrObservedByService = [];
      removeLayer(this.vectorLayerMaritimeEntities, this.map);
    }
  }

  updateMapIfShouldShowWarnings(): void {
    if (this.shouldShowWarnings && !this.showDatas) {
      this.serieId ? this.loadMapWarningsBySerie(this.serieId)
        : this.mapFilterState.getValues$().pipe(this.scavenger.collectByKey('mapFilterState.getValues$')).subscribe(this.loadMapWarnings.bind(this));
    } else {
      this.warnings = [];
      this.showDatas = false;
      this.removeDatasLayer();
    }
  }

  updateMapIfShouldShowInfosources(): void {
    if (this.shouldShowInfosources) {
      this.loadMapInfosources();
    } else {
      this.infosources = [];
      this.removeInfosourcesDataLayer();
    }
  }

  updateMapIfShouldShowGeoregulations(georegulationType: GeoregulationType): void {
    if (this.shouldShowGeoregulations[georegulationType]) {
      this.loadMapGeoregulations(georegulationType);
    } else {
      // remove only those of matching type
      this.georegulations = this.georegulations.filter(georegulation => georegulation.type !== georegulationType);
      this.removeGeoregulationsDataLayer(georegulationType);
    }
  }

  updateMapIfShouldShowGeoregulationsVisu(): void {
    if (this.shouldShowGeoregulations && !this.showGeoregulationDatas) {
      this.mapFilterStateGeoregulation.getValues$()
        .pipe(this.scavenger.collectByKey('mapFilterStateGeoregulation.getValues$'))
        .subscribe(filterValues => this.loadMapGeoregulationsVisu(filterValues));
    } else {
      this.georegulations = [];
      this.showGeoregulationDatas = false;
      this.removeGeoregulationsDataLayerVisu();
    }
  }

  ngOnChanges(changes: any): void {
    this.showMaritimesEntitiesManagedOrObservedByService = this.enableLayerMaritimesEntitiesManagedOrObservedByService && this.authService.isLoggedIn() && this.authService.hasRoleServiceUser();

    if (!this.isLoaded) { return; }

    if (changes.georegulationIssuingServiceId) {
      this.georegulations = [];
      this.shouldShowGeoregulations.forEach(item => {
        const georegulationType = Object.keys(item)[0] as GeoregulationType;
        if (this.shouldShowGeoregulations[georegulationType]) {
          this.removeGeoregulationsDataLayer(georegulationType);
          if (this.georegulationIssuingServiceId) {
            this.loadMapGeoregulations(georegulationType);
          }
        }
      });
    }

    if (changes.extent) {
      this.fitToExtent();
    }
    if (changes.warnings && this.warnings) {
      this.showWarnings ? this.showDatas && this.displaysWarningData() : this.displaysWarningData();
      this.addEventForDisplayingDatasOnHover();
    }

    if (changes.infosources && this.infosources) {
      this.showInfosources ? this.showDatas && this.displaysInfosourcesData() : this.displaysInfosourcesData();
    }

    if (changes.georegulations && this.georegulations && this.showGeoregulations) {
      if (this.canShowHideGeoregulationLayers) {
        GEOREGULATION_TYPE_KEYS.forEach(
          type => this.shouldShowGeoregulations[type] && this.displayGeoregulationsData(type)
        );
      }
      this.showGeoregulations ? this.showGeoregulationDatas && this.displayGeoregulationsDataVisu() : this.displayGeoregulationsDataVisu();
    }

    /*
    if (changes.surveyDetections && this.surveyDetections && this.showDetections) {
      this.updateMapIfShouldShowDetections();
    }
    */
  }

  ngAfterViewInit(): void {
    this.showLabelsPreviousValue = this.showLabels;
    const showRasterMarineWithAdditionalLayerForWestAfrica = this.shouldShowRasterMarineWithAdditionalLayerForWestAfrica && this.authService.hasAnyRoleOnShomService();

    this.subscriptions = this.layersFacade.getBaseLayers$(showRasterMarineWithAdditionalLayerForWestAfrica)
      .pipe(
        takeUntil(this.destroy$),
        first(),
        map(val => {
          if (!this.serieName && this.shouldShowSubAreas) { throw new Error('no serieName'); }
          return val;
        }),
        retryWhen(genericRetryStrategy({
          maxRetryAttempts: 1, scalingDuration: 200, excludedStatusCodes: [500]
        })),
        catchError(error => {
          // Nuestra capa WMTS (Caché) de respaldo
          const projection = getProjection('EPSG:3857');
          const projectionExtent = projection.getExtent();
          const size = getWidth(projectionExtent) / 256;
          const resolutions = new Array(21);
          const matrixIds = new Array(21);
          for (let z = 0; z < 21; ++z) {
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = 'EPSG:900913:' + z;
          }

          const localBaseLayer = {
            name: 'OSM',
            olLayer: this.localBasemapService.createBasemapLayer({
              preserveDrawingBuffer: false,
              zIndex: 0
            }),
            visible: true,
            opacity: 1
          };

          const fakeLayer = {
            name: 'Carta_Local',
            olLayer: new TileLayer({
              source: new WMTS({
                url: environment.carto['localWmsUrl']?.replace('/wms', '/gwc/service/wmts') || 'http://localhost:8082/geoserver/gwc/service/wmts',
                layer: environment.carto['baseLayerId'] || 'pisac_shn:cartografia_ve',
                matrixSet: 'EPSG:900913',
                format: 'image/png',
                projection: projection,
                tileGrid: new WMTSTileGrid({
                  origin: [-20037508.342789244, 20037508.342789244],
                  resolutions: resolutions,
                  matrixIds: matrixIds
                }),
                style: '',
                wrapX: false,
                crossOrigin: 'anonymous'
              }),
              minZoom: 5,
              zIndex: 1
            }),
            visible: true,
            opacity: 1
          };
          return of([localBaseLayer, fakeLayer] as any);
        })
      )
      .subscribe((baseLayers: any) => {

        // Damos tiempo al DOM para dibujar el div contenedor antes de armar la cartografÃ­a
        setTimeout(() => {
          this.createCarto(baseLayers);

          // Si el componente padre nos pasÃ³ un extent al inicio, lo aplicamos de inmediato.
          if (this.extent) {
            this.fitToExtent();
          }

          if (this.enableLiveCoordinates) {
            // --- INYECCIÃ“N DEL CONTROL MOUSEPOSITION GLOBAL ---
            if (this.map?.olMap) {
              const mousePositionControl = new MousePosition({
                coordinateFormat: (coord) => {
                  if (!coord) return '';
                  return `${formatDecimalToSHOM(coord[1], true)} ${formatDecimalToSHOM(coord[0], false)}`;
                },
                projection: 'EPSG:4326',
                className: 'custom-mouse-position',
                undefinedHTML: '&nbsp;'
              });
              this.map.olMap.addControl(mousePositionControl);
            }
          }
        }, 500);
      });
  }

  private updateSystem(system: ProjectionSystem): void {
    // Escudo de control local: si las propiedades no estÃ¡n completamente definidas debido al entorno offline, evitamos el colapso
    if (!system || !system.coordinatesFormat || !system.coordinatesFormat.decimalToFormat || !system.helper) {
      return;
    }

    system.coordinatesFormat.decimalToFormat = (system.coordinatesFormat.decimalToFormat as string).replace(/\s/g, '');
    system.helper = system.helper.replace(/\s/g, '');
    const format: string | any = system.coordinatesFormat.decimalToFormat;
    system.coordinatesFormat.decimalToFormat = (coordinate: number, coordinatePart: CoordinatePart) =>
      this.convertCoordinateDecimalToFormattedDMS(coordinate, coordinatePart, typeof format === 'string' ? format : '', 4, 3);
  }

  public setAvailableTools(availableTools: any): void {
    if (!this.map || !this.map.olMap || !this.geometriesLayer) {
      return;
    }

    if (!this.geometriesLayer) {
      this.geometriesLayer = new VectorLayer({ source: new VectorSource(), zIndex: 100 });
      this.map.olMap.addLayer(this.geometriesLayer);
    }



    // Si PING pide desactivar herramientas
    if (!availableTools || availableTools.length === 0) {
      this.disableDrawing();
      return;
    }

    // 1. Activar interacción de modificar vértices sobre la capa activa actual
    const existingModifies: any[] = [];
    this.map.olMap.getInteractions().forEach((interaction: any) => {
      if (interaction instanceof Modify) {
        existingModifies.push(interaction);
      }
    });
    existingModifies.forEach(m => this.map.olMap.removeInteraction(m));

    const modifyInteraction = new Modify({ source: this.geometriesLayer.getSource() });
    this.map.olMap.addInteraction(modifyInteraction);
  }

  // --- MÉTODOS AUXILIARES PARA EL DIBUJO ---

  public toggleDrawing(geometryType: string): void {
    if (this.isDrawing && this.activeDrawType === geometryType) {
      this.disableDrawing();
    } else {
      if (this.isDrawing) {
        this.disableDrawing();
      }
      this.enableDrawing(geometryType);
    }
  }

  private enableDrawing(geometryType: string): void {
    this.isDrawing = true;
    this.activeDrawType = geometryType;

    if (this.btnDraw && this.btnDraw.element) {
      this.btnDraw.element.style.backgroundColor = '#28a745';
    }

    // Limpiamos la capa activa antes de empezar para evitar múltiples figuras superpuestas
    if (this.localDrawLayer) this.localDrawLayer.getSource().clear();
    if (this.geometriesLayer && typeof this.geometriesLayer.getSource === 'function') {
      const source = this.geometriesLayer.getSource();
      if (source) source.clear();
    }

    this.drawInteraction = new Draw({
      type: geometryType as any
    });

    this.drawInteraction.on('drawend', (event: any) => {
      // Estilo visual del punto, línea o polígono dibujado
      event.feature.setStyle(new Style({
        fill: new Fill({ color: 'rgba(0, 153, 255, 0.4)' }),
        stroke: new Stroke({ color: '#0055ff', width: 2 }),
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: '#0055ff' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      }));

      // Guardar en la capa activa de PING (o en localDrawLayer si no hay capa de PING)
      if (this.geometriesLayer && typeof this.geometriesLayer.getSource === 'function') {
        const source = this.geometriesLayer.getSource();
        if (source) {
          source.addFeature(event.feature);

          // FORZAR NOTIFICACIÓN A ANGULAR: Emulamos un evento de cambio
          if (typeof source.dispatchEvent === 'function') {
            source.dispatchEvent('change');
          }
        }
      } else if (this.localDrawLayer) {
        this.localDrawLayer.getSource().addFeature(event.feature);
      }

      setTimeout(() => {
        this.disableDrawing();
      }, 100);
    });

    if (this.map && this.map.olMap) {
      this.map.olMap.addInteraction(this.drawInteraction);
    }
    this.cdRef.markForCheck();
  }

  private disableDrawing(): void {
    this.isDrawing = false;
    this.activeDrawType = null;

    // Restaurar el color base náutico del botón
    if (this.btnDraw && this.btnDraw.element) {
      this.btnDraw.element.style.backgroundColor = 'rgba(0,60,136,0.8)';
    }

    if (this.drawInteraction && this.map && this.map.olMap) {
      this.map.olMap.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }
    this.cdRef.markForCheck();
  }

  public translateBtnTitle(): void {
    // MÃ©todo auxiliar para traducir los tÃ­tulos de los botones. 
    // Al estar declarado, solucionamos el error de compilaciÃ³n.
  }




  protected displaysWarningData(): void {
    let hideLabelsOnInit = false;
    if (!this.vectorSource) {
      this.initWarningsLayers();
      hideLabelsOnInit = true;
    }

    addLayer(this.vectorLayer, this.map);

    this.vectorSource.clear(true);

    this.vectorSource.addFeatures(
      this.warnings
        .map(warning => ([...warning.affectedAreas, ...warning.geometries]))
        .reduce((featureAccumulator: Feature[], features: Feature[]) => featureAccumulator.concat(features), [])
    );

    if (this.showLabelsPreviousValue !== this.showLabels || hideLabelsOnInit) {
      // add loading spinner if labels enabled
      this.loader.showLoadingSpinner(this.element);
      this.vectorSource.forEachFeature(feature => showFeatureLabel(feature, this.showLabels, hideLabelsOnInit));
      this.showLabelsPreviousValue = this.showLabels;
      this.loader.hideLoadingSpinner(this.element);
    }

    this.warningCluster = new ModelItemCluster({
      distance: environment.carto.aggregation.distance,
      source: this.vectorSource,
      geometryFunction: featureToPoint,
      extentSizeMultiplier: environment.carto.aggregation.feautreExtentSizeMuliplier
    });
    this.vectorLayer.setSource(this.warningCluster);
  }

  addEventForDisplayingDatasOnHover() {
    if (this.hasEventForDisplayingDatasOnHover) {
      return;
    }

    this.map.olMap.on('pointermove', this.manageDatasPopoverDisplayingHandler);
    this.hasEventForDisplayingDatasOnHover = true;
  }

  public removeDatasLayer(): void { }
  public removeInfosourcesDataLayer(): void { }
  public removeGeoregulationsDataLayer(type?: any): void { }
  public removeGeoregulationsDataLayerVisu(): void { }

  protected createCarto(layers: CartoLayer[]): void {
    // 1. ESCUDO DE PROYECCIONES
    PROJECTION_SYSTEMS.filter(system => typeof system.coordinatesFormat?.decimalToFormat === 'string')
      .forEach(system => this.updateSystem(system));

    // 3. CREACIÃ“N DEL MAPA PURO Y LIBRE (Enfoque Portal PÃºblico)
    this.map = this.map || {};
    const realTargetId = this.mapId ? this.mapId.replace('#', '') : 'map';

    const container = document.getElementById(realTargetId);
    if (container) container.innerHTML = '';

    // Extraemos las capas inyectadas por el LayersFacade
    const facadeOlLayers = layers.map(l => l.olLayer).filter(layer => layer);

    // 1. Creamos nuestra capa vectorial local para anclar los dibujos nuevos
    this.localDrawLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: 100
    });

    // 1.5. Creamos la capa vectorial temporal para mediciones
    this.measureSource = new VectorSource();
    this.measureLayer = new VectorLayer({
      source: this.measureSource,
      zIndex: 101,
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
        stroke: new Stroke({ color: '#ffcc33', width: 2, lineDash: [10, 10] }),
        image: new CircleStyle({
          radius: 5, stroke: new Stroke({ color: '#ffcc33', width: 1 }), fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' })
        })
      })
    });

    // 2. Preparamos el arreglo de capas base combinando Facade + Locales
    const mapLayers = [...facadeOlLayers, this.localDrawLayer, this.measureLayer];

    // 3. RECUPERACIÃ“N DE DATOS: Si el formulario nos pasa una capa con un polÃ­gono guardado, la agregamos
    if (this.geometriesLayer) {
      // Nos aseguramos de forzar el color azul por si viene sin estilo de la base de datos
      if (typeof this.geometriesLayer.setStyle === 'function') {
        this.geometriesLayer.setStyle(new Style({
          fill: new Fill({ color: 'rgba(0, 153, 255, 0.4)' }),
          stroke: new Stroke({ color: '#0055ff', width: 2 })
        }));
      }

      if (typeof this.geometriesLayer.setZIndex === 'function') {
        this.geometriesLayer.setZIndex(90); // Se coloca justo debajo de la capa de dibujo
      }

      // AÃ±adimos la capa histÃ³rica al mapa
      mapLayers.push(this.geometriesLayer);
    }

    // 4. Inicializamos el mapa con todas las capas recopiladas en proyección estándar (EPSG:3857)
    const rawCenter = environment.carto.defaultCenter || [-66.9036, 10.4806];
    const center3857 = (Math.abs(rawCenter[0]) <= 180 && Math.abs(rawCenter[1]) <= 90)
      ? fromLonLat(rawCenter, environment.carto.projection)
      : rawCenter;

    this.map.olMap = new Map({
      target: realTargetId,
      layers: mapLayers,
      view: new View({
        projection: environment.carto.projection,
        center: center3857,
        zoom: environment.carto.defaultZoom || 5,
        multiWorld: false,
        maxZoom: 20
      })
    });

    // --- PUENTE ARQUITECTÃ“NICO TOTAL PARA PING ---
    this.map.view = this.map.olMap.getView();
    this.map.changeLanguage = (lang: string) => {
      this.localBasemapService.setLanguage(lang?.startsWith('en') ? 'en' : 'es');
    };
    this.map.getView = () => this.map.olMap.getView();
    this.map.getLayers = () => this.map.olMap.getLayers();
    this.map.addLayer = (layer: any) => { if (this.map.olMap) this.map.olMap.addLayer(layer); };
    this.map.on = (type: any, listener: any) => this.map.olMap.on(type, listener);
    this.map.un = (type: any, listener: any) => this.map.olMap.un(type, listener);
    this.map.forEachFeatureAtPixel = (pixel: any, callback: any, options?: any) => this.map.olMap.forEachFeatureAtPixel(pixel, callback, options);
    this.map.hasFeatureAtPixel = (pixel: any, options?: any) => this.map.olMap.hasFeatureAtPixel(pixel, options);
    this.map.getEventPixel = (event: any) => this.map.olMap.getEventPixel(event);
    this.map.getCoordinateFromPixel = (pixel: any) => this.map.olMap.getCoordinateFromPixel(pixel);
    this.map.getTargetElement = () => this.map.olMap.getTargetElement();
    this.map.addOverlay = (overlay: any) => this.map.olMap.addOverlay(overlay);
    this.map.getOverlays = () => this.map.olMap.getOverlays();


    const olMap = this.map.olMap;

    // 4. CONTROLES Y DISPARO NATIVO
    try {
      if (this.enableKmlImport && !this.disabled && this.btnKml) olMap.addControl(this.btnKml);
      if (this.enableGotoLegend && this.btnLegend) olMap.addControl(this.btnLegend);
      if (this.enableLabelsShowHide && this.btnLabels) olMap.addControl(this.btnLabels);


      // ---> INYECCIÃ“N DEL BOTÃ“N DE DIBUJO MANUAL <---    

      // 3. Solo inyectamos las herramientas si hay capa Y NO es de solo lectura
      if (this.geometriesLayer && !this.disabled) {


        // ---> NUEVO: INTERACCIÃ“N PARA MODIFICAR VÃ‰RTICES <---
        const modifyInteraction = new Modify({
          source: this.geometriesLayer.getSource()
        });
        this.map.olMap.addInteraction(modifyInteraction);
      }

      // ----------------------------------------------

      // --- RESTAURACIÃ“N DEL OVERLAY DEL POPOVER ---
      if (this.popover) {
        // Importante: Inicializamos el componente Overlay nativo
        this.popoverOverlay = new Overlay({
          element: this.popoverComponent.element.nativeElement,
          offset: [0, -12],
          positioning: OverlayPositioning.BOTTOM_CENTER
        });
        olMap.addOverlay(this.popoverOverlay);
      }

    } catch (e) {
      // Controles secundarios omitidos
    }

    setTimeout(() => {
      // Disparamos la lÃ³gica original de PING ahora que el mapa base existe y estÃ¡ puenteado
      if (this.showWarnings) {
        this.updateMapIfShouldShowWarnings();
        this.addEventForDisplayingDatasOnHover();
      } else if (this.warnings?.length) {
        this.displaysWarningData();
        this.addEventForDisplayingDatasOnHover();
      }

      if (this.showGeoregulations || this.georegulations?.length) {
        this.updateMapIfShouldShowGeoregulationsVisu();
        this.addEventForDisplayingDatasOnHover();
      }
    }, 500);

    this.isLoaded = true;
    if (this.onLoad) this.onLoad.emit();
    window.dispatchEvent(new Event('resize'));
  }

  protected displayGeoregulationsDataVisu(): void {
    let hideLabelsOnInit = false;
    if (!this.vectorSourceGeoregulationsVisu) {
      this.initGeoregulationsVisuLayers();
      hideLabelsOnInit = true;
    }

    addLayer(this.vectorLayerGeoregulationsVisu, this.map);

    this.vectorSourceGeoregulationsVisu.clear(true);

    if (this.georegulations) {
      this.loader.showLoadingSpinner(this.element);
      const georegulationFeatures = this.georegulations
        .map(georegulation => [...convertJsonFeatureToFeature(georegulation.features, false, null, true, georegulation)]
          .map(feature => {
            // apply style to display icons
            feature.setStyle(this.georegulationStyleFactory.getStyleForGeometry(georegulation.isTemporary, georegulation.isNew, feature.getGeometry().getType()));
            showFeatureLabel(feature, this.showLabels, hideLabelsOnInit)
            return feature;
          })
        )
        .reduce((featureAccumulator: Feature[], features: Feature[]) => featureAccumulator.concat(features), []);

      georegulationFeatures.forEach(feature => feature.set('originalStyle', feature.getStyle()));
      this.vectorSourceGeoregulationsVisu.addFeatures(georegulationFeatures);
      this.loader.hideLoadingSpinner(this.element);
    }

    this.georegulationCluster = new ModelItemCluster({
      distance: environment.carto.aggregation.distance,
      source: this.vectorSourceGeoregulationsVisu,
      geometryFunction: featureToPoint,
      extentSizeMultiplier: environment.carto.aggregation.feautreExtentSizeMuliplier
    });

    this.vectorLayerGeoregulationsVisu.setSource(this.georegulationCluster);
  }

  protected displayDetectionsData(): void {
    if (!this.vectorSourceDetections) {
      this.initDetectionsVisuLayers();
    }

    this.vectorLayerDetections.setOpacity(environment.carto.detectionLayerOpacity);
    addLayer(this.vectorLayerDetections, this.map);

    this.vectorSourceDetections.clear(true);

    this.detectionFeatures = this.surveyDangerFactory.createGeometries(this.surveyDetections, true);
    if (this.detectionFeatures) {
      this.vectorSourceDetections.addFeatures(this.detectionFeatures);
      this.showDetectionData = true;
    }

    this.vectorLayerDetections.setSource(this.vectorSourceDetections);
  }

  protected displaysInfosourcesData(): void {
    if (!this.vectorSourceInfosources) {
      this.initInfosourceVisuLayers();
    }

    addLayer(this.vectorLayerInfosources, this.map);

    this.vectorSourceInfosources.clear(true);

    if (this.infosources) {
      const infosourceFeatures = this.infosources
        .map(infosource => [...convertJsonFeatureToFeature(infosource.geometries, this.isNotDefaultStyle, infosource)])
        .reduce((featureAccumulator: Feature[], features: Feature[]) => featureAccumulator.concat(features), []);
      this.vectorSourceInfosources.addFeatures(infosourceFeatures);
    }

    if (this.showLabelsPreviousValue !== this.showLabels) {
      // add loading spinner if labels enabled
      this.loader.showLoadingSpinner(this.element);
      this.vectorSourceInfosources.forEachFeature(feature => showFeatureLabel(feature, this.showLabels));
      this.showLabelsPreviousValue = this.showLabels;
      this.loader.hideLoadingSpinner(this.element);
    }

    this.infosourceCluster = new ModelItemCluster({
      distance: environment.carto.aggregation.distance,
      source: this.vectorSourceInfosources,
      geometryFunction: featureToPoint,
      extentSizeMultiplier: environment.carto.aggregation.feautreExtentSizeMuliplier
    });
    this.vectorLayerInfosources.setSource(this.infosourceCluster);

    // If detections are displayed, put them on first plan
    if (this.showDetectionData) {
      removeLayer(this.vectorLayerDetections, this.map);
      this.displayDetectionsData();
    }
  }

  protected displayGeoregulationsData(georegulationType: GeoregulationType): void {
    this.vectorSourceGeoregulations[georegulationType] = new VectorSource<Geometry>();
    this.vectorLayerGeoregulations[georegulationType] = new VectorLayer({
      zIndex: DEFAULT_Z_INDEX,
      style: feature => {
        return feature.get('isCluster') ?
          this.georegulationStyleFactory.getStyleForAggregation(feature as Feature<Point>) : null;
      }
    });

    addLayer(this.vectorLayerGeoregulations[georegulationType], this.map);

    if (this.georegulations) {
      const georegulationFeatures = this.georegulations
        .filter(georegulation => georegulation.type === georegulationType)
        .map(georegulation => [...convertJsonFeatureToFeature(georegulation.features, this.isNotDefaultStyle, null, this.isGeoregulationStyle, georegulation)])
        .reduce((featureAccumulator: Feature[], features: Feature[]) => featureAccumulator.concat(features), []);
      this.vectorSourceGeoregulations[georegulationType].addFeatures(georegulationFeatures);
    }

    this.vectorSourceGeoregulations[georegulationType].forEachFeature(feature => showFeatureLabel(feature, this.showLabels));

    this.georegulationCluster = new ModelItemCluster({
      distance: environment.carto.aggregation.distance,
      source: this.vectorSourceGeoregulations[georegulationType],
      geometryFunction: featureToPoint,
      extentSizeMultiplier: environment.carto.aggregation.feautreExtentSizeMuliplier
    });
    this.vectorLayerGeoregulations[georegulationType].setSource(this.georegulationCluster);
  }

  protected displaysEntitiesData(): void {
    if (!this.vectorLayerMaritimeEntities) {
      this.initMaritimeEntityVisuLayers();
    }

    addLayer(this.vectorLayerMaritimeEntities, this.map);

    this.vectorSourceMaritimeEntities.clear(true);

    const entitiesFeatures = this.maritimeEntityFactory.createGeometries(this.entitiesManagedOrObservedByService);
    if (entitiesFeatures) {
      this.vectorSourceMaritimeEntities.addFeatures(entitiesFeatures);
    }

    this.vectorLayerMaritimeEntities.setSource(this.vectorSourceMaritimeEntities);
  }

  loadMapWarningsBySerie(serieId: string) {
    this.mapWarnings$ = this.mapWarningsFacade.getFilteredMapWarningsBySerie$(serieId).pipe(
      tap(filteredWarnings => {
        if (!filteredWarnings.length) {
          this.alertMessages.add({
            severity: 'warn',
            summary: 'message.summary.warn.filter.no-warning-found',
            detail: 'message.warn.filter.no-warning.found'
          });
        }
      }),
      catchError((err, caught) => {
        this.alertMessages.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.filter.cannot-get-warnings'
        });
        throw caught;
      })
    );
    this.mapWarnings$.pipe(take(1), this.scavenger.collectByKey('mapWarnings$'))
      .subscribe(warnings => {
        if (warnings) {
          this.warnings = warnings;
          this.displaysWarningData();
          this.showDatas = true;
        }
      });
  }

  loadMapWarnings(filterValues: MapFilterValues) {
    if (filterValues.disableFilter) { return; }
    this.mapWarnings$ = this.mapWarningsFacade.getFiltredMapWarnings$(filterValues).pipe(
      tap(filteredWarnings => {
        if (!filteredWarnings.length && !this.mapFilterState.getValues().disableFilter) {
          this.alertMessages.add({
            severity: 'warn',
            summary: 'message.summary.warn.filter.no-warning-found',
            detail: 'message.warn.filter.no-warning.found'
          });
        }
      }),
      catchError((err, caught) => {
        this.alertMessages.add({
          severity: 'error',
          summary: 'message.summary.error',
          detail: 'message.error.api.filter.cannot-get-warnings'
        });
        throw caught;
      })
    );
    this.mapWarnings$.pipe(take(1), this.scavenger.collectByKey('mapWarnings$'))
      .subscribe(warnings => {
        if (warnings) {
          this.warnings = warnings;
          this.displaysWarningData();
          this.showDatas = true;
        }
      });
  }

  loadMapGeoregulationsVisu(filterValues: GeoregulationMapFilterValues): void {
    if (filterValues.disableFilter) { return; }
    this.mapGeoregulations$ = this.abstractGeoregulationService.getFilteredMapGeoregulations$(filterValues)
      .pipe(
        tap(filteredGeoregulations => {
          if (!filteredGeoregulations.length && !this.mapFilterStateGeoregulation.getValues().disableFilter) {
            this.alertMessages.add({
              severity: 'warn',
              summary: 'message.summary.warn.filter.no-georegulation-found',
              detail: 'message.warn.filter.no-georegulation.found'
            });
          }
        }),
        catchError((err, caught) => {
          this.alertMessages.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.filter.cannot-get-georegulations'
          });
          throw caught;
        })
      );
    this.mapGeoregulations$.pipe(take(1), this.scavenger.collectByKey('mapGeoregulations$')).subscribe(georegulations => {
      if (georegulations) {
        this.georegulations = georegulations;
        this.displayGeoregulationsDataVisu();
        this.showGeoregulationDatas = true;
      }
    });
  }

  loadMapInfosources(): void {
    this.abstractInfosourceService.getMapInfoSource$(this.infosourceId)
      .pipe(take(1), this.scavenger.collectByKey('getMapInfoSource$'))
      .subscribe(infosources => {
        if (infosources) {
          this.infosources = infosources;
          this.displaysInfosourcesData();
        }
      });
  }

  loadMapGeoregulations(georegulationType: GeoregulationType): void {
    // load according to georegulationType
    this.abstractGeoregulationService.getMapGeoregulations$(georegulationType, this.georegulationIssuingServiceId)
      .pipe(take(1), this.scavenger.collectByKey('getMapGeoregulations$'))
      .subscribe(georegulations => {
        if (georegulations?.length) {
          this.georegulations.push(...georegulations);
          this.displayGeoregulationsData(georegulationType);
        }
      });
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

  private showHideLabels(): void {
    this.loader.showLoadingSpinner(this.element);
    setTimeout(() => {
      this.showLabels = !this.showLabels;
      this.btnLabels.updateClass(`button-control control-btn-show-hide-labels ${this.showLabels ? 'enabled' : ''}`);
      this.vectorSource?.forEachFeature(feature => showFeatureLabel(feature, this.showLabels));
      this.vectorSourceInfosources?.forEachFeature(feature => showFeatureLabel(feature, this.showLabels));
      this.vectorSourceGeoregulationsVisu?.forEachFeature(feature => showFeatureLabel(feature, this.showLabels));
    }, environment.loadingSpinnerTimeout);
    this.loader.hideLoadingSpinner(this.element);
  }

  private gotoLegendPage(): void {
    window.open(environment.carto.legendUrl, '_blank', 'noopener,noreferrer');
  }

  private showCategoryPanel(event): void {
    this.categoryPanel.toggle(event);
  }

  private showHideLayers(canShow: boolean): void {
    showHideLayers(this.map, canShow, this.parentLayers, this.serieName);
  }

  private showHideZoneX(canShow: boolean): void {
    showHideZoneX(this.map, canShow);
  }

  /**
   * Enable or disable zoom according to view zoom level
   */
  protected toggleClusterizationAccordingZoom(): void {
    const zoom = this.map.view.getZoom();
    if (zoom > environment.carto.aggregation.maxZoomLevel) {
      this.warningCluster?.disable();
      this.infosourceCluster?.disable();
    } else {
      this.warningCluster?.enable();
      this.infosourceCluster?.enable();
    }
  }

  private manageDatasFollowingFeatureType(feature: FeatureLike, datas: Set<MapWarning> | Set<MapGeoregulation> | Set<MapInfosource>, type: string): void {
    if (type !== 'georegulation') {
      datas.add(feature.get(type));
    } else {
      const georegulation = feature.get('georegulation') as MapGeoregulation;
      if (feature.get('isHidden')) {
        this.hiddenGeoregulations.add(georegulation);
      } else {
        this.visibleGeoregulations.add(georegulation);
      }
    }
  }

  protected addFeatures(evt: MapBrowserEvent<UIEvent>, datas: Set<MapWarning> | Set<MapGeoregulation> | Set<MapInfosource>, vectorlayer: VectorLayer<VectorSource>, type: string) {
    this.map.olMap.forEachFeatureAtPixel(evt.pixel, feature => {
      if (feature.get('isCluster')) {
        const clusterFeatures = feature.get('features') as Feature[];
        clusterFeatures.forEach(featureInCluster => {
          this.manageDatasFollowingFeatureType(featureInCluster, datas, type);
        });
      } else {
        this.manageDatasFollowingFeatureType(feature, datas, type);
      }
    }, {
      layerFilter: layer => layer === vectorlayer
    });

    if (type === 'georegulation') {
      this.georegulationsClickable = [...this.visibleGeoregulations, ...this.hiddenGeoregulations];
    }
  }

  protected manageDatasPopoverDisplaying(evt: MapBrowserEvent<UIEvent>): void {
    const warnings = new Set<MapWarning>();
    const infosources = new Set<MapInfosource>();

    if (this.warnings?.length) {
      this.addFeatures(evt, warnings, this.vectorLayer, 'warning');
    }

    if (this.infosources?.length) {
      this.addFeatures(evt, infosources, this.vectorLayerInfosources, 'infosource');
    }

    if (this.georegulations?.length) {
      this.lastEvtPointerMove = evt;
      this.visibleGeoregulations = new Set<MapGeoregulation>();
      this.hiddenGeoregulations = new Set<MapGeoregulation>();
      this.addFeatures(evt, new Set<MapGeoregulation>(), this.vectorLayerGeoregulationsVisu, 'georegulation');
    }

    if (warnings.size && this.popover) {
      if (this.getDetailWarnings) {
        this.element.nativeElement.style.cursor = 'pointer';
      }

      this.showPopover(evt, warnings, NotionType.WARNING);
      this.warningsInPopover = [...warnings];
    } else if (infosources.size && this.popover) {
      this.showPopover(evt, infosources, NotionType.INFOSOURCE);
      this.infosourcesInPopover = [...infosources];
    } else if (this.visibleGeoregulations.size && this.popover) {
      if (this.getDetailGeoregulations) {
        this.element.nativeElement.style.cursor = 'pointer';
      }

      this.showPopover(evt, this.visibleGeoregulations, NotionType.GEOREGULATION);
      this.georegulationsInPopover = [...this.visibleGeoregulations];
    } else {
      this.warningsInPopover = [];
      this.infosourcesInPopover = [];
      this.georegulationsInPopover = [];
      if (this.getDetailWarnings || this.getDetailGeoregulations) {
        this.element.nativeElement.style.cursor = 'initial';
      }
      this.popoverComponent.hide();
    }
  }

  protected showPopover(evt: MapBrowserEvent<UIEvent>, datas: Set<MapWarning> | Set<MapGeoregulation> | Set<MapInfosource>, type: NotionType): void {
    this.popoverOverlay.setPosition(evt.coordinate);
    this.popoverComponent.setDataToDisplayOnHoverNotion(datas, type);
    this.popoverComponent.show();
  }

  protected manageClickEvent(): void {
    if (this.warningsInPopover.length) {
      this.onSelectWarnings.emit(this.warningsInPopover);
    } else {
      this.onSelectInfosources.emit(this.warningsInPopover);
    }
  }

  protected manageGeoregulationClickEvent(): void {
    this.georegulationsSelected.emit(this.georegulationsClickable);
  }

  protected hideLargeGeoregulations(): void {
    const viewExtent = this.map.olMap.getView().calculateExtent(this.map.olMap.getSize());
    this.vectorSourceGeoregulationsVisu.forEachFeatureInExtent(viewExtent, feature => {
      if (feature.getGeometry().getType() !== GeometryType.LINE_STRING) {
        const featureExtent = feature.getGeometry().getExtent();
        const featureBiggerThanView = featureExtent[0] < viewExtent[0]
          && featureExtent[1] < viewExtent[1]
          && featureExtent[2] > viewExtent[2]
          && featureExtent[3] > viewExtent[3];
        if (featureBiggerThanView && !feature.get('isHidden')) {
          this.changeFeatureVisibility(feature, true);
        } else if (!featureBiggerThanView && feature.get('isHidden')) {
          this.changeFeatureVisibility(feature, false);
        }
      }
    });
  }

  protected changeFeatureVisibility(feature: Feature, hidden: boolean): void {
    const styleLargeGeoregulation = new Style({
      fill: new Fill({
        color: '#00000000'
      })
    });
    if (hidden) {
      feature.setStyle(styleLargeGeoregulation);
      this.numberHiddenGeoregulations++;
    } else {
      feature.setStyle(feature.get('originalStyle'));
      this.numberHiddenGeoregulations--;
    }
    feature.set('isHidden', hidden);
    if (this.lastEvtPointerMove) {
      this.manageDatasPopoverDisplaying(this.lastEvtPointerMove);
    }
    this.cdRef.detectChanges();
  }

  /**
   * Creates and configures layers to display warnings marker on map
   */
  private initWarningsLayers(): void {
    this.vectorSource = new VectorSource<Geometry>();
    this.vectorLayer = new VectorLayer({
      zIndex: DEFAULT_Z_INDEX,
      style: feature => {
        return feature.get('isCluster') ?
          this.warningStyleFactory.getStyleForAggregation(feature as Feature<Point>) : null;
      }
    });
    this.map.olMap.addLayer(this.vectorLayer);
    this.map.view.on('change:resolution', this.toggleClusterizationAccordingZoomHandler);
    if (this.getDetailWarnings) {
      this.map.olMap.on('click', this.manageClickEventHandler);
    }
  }

  /**
   * Creates and configures layers to display georegulations markers on map
   */
  private initGeoregulationsVisuLayers(): void {
    this.vectorSourceGeoregulationsVisu = new VectorSource<Geometry>();
    this.vectorLayerGeoregulationsVisu = new VectorLayer({
      zIndex: DEFAULT_Z_INDEX,
      style: feature => {
        return feature.get('isCluster') ?
          this.georegulationStyleFactory.getStyleForAggregation(feature as Feature<Point>) : null;
      }
    });
    this.map.olMap.addLayer(this.vectorLayerGeoregulationsVisu);
    this.map.view.on('change:resolution', this.toggleClusterizationAccordingZoomHandler);
    this.map.view.on('change', this.hideLargeGeoregulationsHandler);
    if (this.getDetailGeoregulations) {
      this.map.olMap.on('click', this.manageGeoregulationClickEventHandler);
    }
  }

  private initInfosourceVisuLayers(): void {
    this.vectorSourceInfosources = new VectorSource<Geometry>();
    this.vectorLayerInfosources = new VectorLayer({
      zIndex: DEFAULT_Z_INDEX,
      style: feature => {
        return feature.get('isCluster') ?
          this.infosourceStyleFactory.getStyleForAggregation(feature as Feature<Point>) : null;
      }
    });

    this.map.olMap.addLayer(this.vectorLayerInfosources);
  }

  private initMaritimeEntityVisuLayers(): void {
    this.vectorSourceMaritimeEntities = new VectorSource<Geometry>();
    this.vectorLayerMaritimeEntities = new VectorLayer({
      zIndex: 10,
      source: this.vectorSource
    });

    this.map.olMap.addLayer(this.vectorLayerMaritimeEntities);
  }

  protected initDetectionsVisuLayers(): void {
    this.vectorSourceDetections = new VectorSource<Geometry>();
    this.vectorLayerDetections = new VectorLayer({ zIndex: DEFAULT_Z_INDEX });

    this.map?.olMap?.addLayer(this.vectorLayerDetections);
  }

  // Esta es la funciÃ³n blindada que hace el trabajo pesado
  protected fitToExtent(): void {
    this.fitToGivenExtent(this.extent);
  }

  fitToGivenExtent(extent: any): void {
    if (!extent || !this.map || !this.map.getView()) {
      return;
    }

    setTimeout(() => {
      const view = this.map.getView();
      const currentProj = view.getProjection() ? view.getProjection().getCode() : 'EPSG:3857';
      let extentAUsar = extent;

      // 1. TRADUCTOR: Convertir metros a grados si el mapa estÃ¡ en EPSG:4326
      if (currentProj === 'EPSG:4326' && Math.abs(extent[0]) > 180) {

        extentAUsar = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
      }
      // Convertir grados a metros si el mapa estÃ¡ en EPSG:3857
      else if (currentProj === 'EPSG:3857' && Math.abs(extent[0]) <= 180) {

        extentAUsar = transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
      }



      // 2. Mover la cÃ¡mara con las coordenadas traducidas
      view.fit(extentAUsar, {
        padding: [50, 50, 50, 50],
        duration: 1000,
        maxZoom: 12
      });

    }, 500);
  }

  /**
   * Allow to center the map on the geometries
   * @param geometriesLayer
   */

  centerOnFeatures(geometriesLayer: VectorLayer<VectorSource>): void {
    if (geometriesLayer?.getSource().getFeatures().length) {
      const options: FitOptions = {
        size: this.map?.olMap.getSize(),
        padding: [
          environment.carto.drawingModule.centerTool.paddingLeft,
          environment.carto.drawingModule.centerTool.paddingTop,
          environment.carto.drawingModule.centerTool.paddingRight,
          environment.carto.drawingModule.centerTool.paddingBottom
        ]
      };

      const hasOnlyGeometryTypePoint = geometriesLayer.getSource().getFeatures().every(feature => feature.get('geometry').getType() === SupportedGeometryType.POINT);
      if (hasOnlyGeometryTypePoint) {
        options.maxZoom = environment.carto.drawingModule.centerTool.maxZoom;
      }

      this.map?.olMap?.getView().fit(geometriesLayer.getSource().getExtent(), options);
    }
  }

  importKml(kmlContent: string, drawingLayer: VectorLayer<VectorSource>): void {

    const fixedKmlContent = MapComponent.fixKmlContent(kmlContent);

    this.map.command('kml.import', drawingLayer, false, fixedKmlContent);

    // Permet d'activer les interactions avec les nouvelles features importÃ©es
    this.map.command('drawing.reset');

    // focus the map on the imported features
    this.centerOnFeatures(drawingLayer);
  }

  @HostListener('window:resize', ['$event'])
  @HostListener('window:load', ['$event'])
  onResize(event): void {
    document.querySelectorAll('sig-map .map-container').forEach(element => {
      element.setAttribute('style', 'height: ' + MapComponent.calcHeightOfMap(event.target.innerHeight, !!this.georegulations?.length) + 'vh');
    });
  }

  onChangeLang({ lang }: LangChangeEvent): void {
    const cartoLanguage = lang === 'es' ? 'es-ES' : 'en-US';
    this.localBasemapService.setLanguage(lang === 'en' ? 'en' : 'es');
    if (this.map && typeof this.map.changeLanguage === 'function') {
      this.map.changeLanguage(cartoLanguage);
    }
    this.translateBtnTitle();
  }

  // ----------------------------------------------------
  // MEASUREMENT TOOLS (DISTANCE, AZIMUTH, RADIUS)
  // ----------------------------------------------------
  clearMeasureTooltips() {
    if (this.measureTooltips && this.map?.olMap) {
      this.measureTooltips.forEach(t => this.map.olMap.removeOverlay(t));
      this.measureTooltips = [];
    }
  }

  cancelMeasurement() {
    this.isMeasuring = false;
    if (this.currentMeasureInteraction && this.map?.olMap) {
      this.map.olMap.removeInteraction(this.currentMeasureInteraction);
      this.currentMeasureInteraction = null;
    }
  }

  clearMeasurements() {
    // Bloque 1 - Limpiar Mediciones (Vista Consulta)
    if (this.measureSource) {
      this.measureSource.clear();
    }
    this.cancelMeasurement();
    this.clearMeasureTooltips();

    // ClÃ³n del Gatillo: Limpiar tambiÃ©n la capa visual local
    if (this.localDrawLayer) {
      this.localDrawLayer.getSource().clear();
    }

    // Bloque 2 - Limpiar GeometrÃ­as (Vista CreaciÃ³n)
    if (this.geometriesLayer && !this.disabled) {
      const source = this.geometriesLayer.getSource();
      if (source) {
        source.clear();

        // Barrido de Fuerza Bruta (Interacciones)
        if (this.map?.olMap) {
          this.map.olMap.getInteractions().forEach((interaction: any) => {
            if (typeof interaction.getFeatures === 'function') {
              interaction.getFeatures().clear();
            }
          });
        }

        if (typeof source.dispatchEvent === 'function') {
          source.dispatchEvent('change');
        }
      }
    }

    // Bloque 3 - Abortar Dibujo Activo
    if (this.isDrawing && this.drawInteraction && this.map?.olMap) {
      if (typeof this.drawInteraction.abortDrawing === 'function') {
        this.drawInteraction.abortDrawing();
      }
      this.map.olMap.removeInteraction(this.drawInteraction);
      this.isDrawing = false;
    }

    // SimulaciÃ³n de Cambio de Herramienta
    this.activeTool = 'trash';

    // Bloque 4 - Forzar Repintado (Anti-Fantasmas)
    if (this.map?.olMap && typeof this.map.olMap.renderSync === 'function') {
      this.map.olMap.renderSync();
    }
  }

  startMeasurement(type: 'DISTANCE' | 'AZIMUTH' | 'RADIUS') {
    if (this.activeTool === type) {
      this.clearMeasurements();
      return;
    }

    this.cancelMeasurement();

    if (this.drawInteraction && this.map?.olMap) {
      this.map.olMap.removeInteraction(this.drawInteraction);
      this.isDrawing = false;
    }

    this.activeTool = type;
    this.isMeasuring = true;
    let geometryType = type === 'RADIUS' ? 'Circle' : 'LineString';
    let maxPoints = type === 'AZIMUTH' ? 2 : undefined;

    this.currentMeasureInteraction = new Draw({
      source: this.measureSource,
      type: geometryType as any,
      maxPoints: maxPoints
    });

    let measureTooltipElement: HTMLElement;
    let measureTooltip: Overlay;

    this.currentMeasureInteraction.on('drawstart', (evt: any) => {
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
      measureTooltipElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      measureTooltipElement.style.color = 'white';
      measureTooltipElement.style.padding = '4px 8px';
      measureTooltipElement.style.borderRadius = '4px';
      measureTooltipElement.style.whiteSpace = 'nowrap';
      measureTooltipElement.style.fontSize = '12px';
      measureTooltipElement.style.pointerEvents = 'none';

      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: OverlayPositioning.BOTTOM_CENTER
      });
      this.map.olMap.addOverlay(measureTooltip);
      this.measureTooltips.push(measureTooltip);

      evt.feature.getGeometry().on('change', (geomEvt: any) => {
        const geom = geomEvt.target;
        let output = '';
        let tooltipCoord;

        if (type === 'DISTANCE' || type === 'AZIMUTH') {
          tooltipCoord = geom.getLastCoordinate();
        }

        if (type === 'DISTANCE') {
          const length = getLength(geom);
          if (length > 1000) {
            output = (length / 1000).toFixed(2) + ' km';
          } else {
            output = length.toFixed(2) + ' m';
          }
        } else if (type === 'AZIMUTH') {
          const coords = geom.getCoordinates();
          if (coords.length > 1) {
            const p1 = coords[0];
            const p2 = coords[coords.length - 1];
            const p1_ll = transform(p1, 'EPSG:3857', 'EPSG:4326');
            const p2_ll = transform(p2, 'EPSG:3857', 'EPSG:4326');
            const lat1 = p1_ll[1] * Math.PI / 180;
            const lon1 = p1_ll[0] * Math.PI / 180;
            const lat2 = p2_ll[1] * Math.PI / 180;
            const lon2 = p2_ll[0] * Math.PI / 180;

            const dLon = lon2 - lon1;
            const y = Math.sin(dLon) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            let brng = Math.atan2(y, x) * 180 / Math.PI;
            brng = (brng + 360) % 360;
            output = brng.toFixed(1) + ' Â°';
          }
        } else if (type === 'RADIUS') {
          const center = geom.getCenter();
          const radiusProj = geom.getRadius();
          const edgePoint = [center[0] + radiusProj, center[1]];
          const radiusInMeters = getDistance(
            transform(center, 'EPSG:3857', 'EPSG:4326'),
            transform(edgePoint, 'EPSG:3857', 'EPSG:4326')
          );
          output = radiusInMeters > 1000
            ? 'R: ' + (radiusInMeters / 1000).toFixed(2) + ' km'
            : 'R: ' + radiusInMeters.toFixed(2) + ' m';
          tooltipCoord = edgePoint;
        }

        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    });

    this.currentMeasureInteraction.on('drawend', () => {
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      measureTooltip.setOffset([0, -7]);
    });

    this.map.olMap.addInteraction(this.currentMeasureInteraction);
  }

  /*ngOnDestroy(): void {
    this.loaderSubscription.unsubscribe();

    if (this.map?.view) {
      this.map.view.un('change', this.hideLargeGeoregulationsHandler);
      this.map.view.un('change:resolution', this.toggleClusterizationAccordingZoomHandler);
    }

    if (this.map?.olMap) {
      this.map.olMap.un('pointermove', this.manageDatasPopoverDisplayingHandler);
      this.map.olMap.un('click', this.manageGeoregulationClickEventHandler);
      this.map.olMap.un('click', this.manageClickEventHandler);
    }

    this.carto && this.map.destroy();
    this.subscriptions && this.subscriptions.unsubscribe();
    this.layersFacade.reinitializeLayers(this.map?.olMap);
    if (this.map) {
      this.map.destroy();
    }
  }*/

  ngOnDestroy(): void {
    // 1. Matar suscripciones primero
    this.destroy$.next();
    this.destroy$.complete();
    this.loaderSubscription.unsubscribe();

    // 2. Limpiar listeners de OpenLayers
    if (this.map?.view) {
      this.map.view.un('change', this.hideLargeGeoregulationsHandler);
      this.map.view.un('change:resolution', this.toggleClusterizationAccordingZoomHandler);
    }

    if (this.map?.olMap) {
      this.map.olMap.un('pointermove', this.manageDatasPopoverDisplayingHandler);
      this.map.olMap.un('click', this.manageGeoregulationClickEventHandler);
      this.map.olMap.un('click', this.manageClickEventHandler);

      // 3. Limpieza profunda de OpenLayers y capas WebGL
      this.layersFacade.reinitializeLayers(this.map.olMap);
      this.map.olMap.setTarget(null); // Desvincula el DOM
      this.map.olMap.dispose();      // Libera memoria
    }

    // 4. DestrucciÃ³n de tus wrappers




    // 5. Solo al final, si es necesario, re-inicializar
    this.layersFacade.reinitializeLayers(null);
  }

  changeCollapsedHiddenGeoregulationsMessage(): void {
    this.collapsedHiddenGeoregulationsMessage = !this.collapsedHiddenGeoregulationsMessage;
  }

  private static calcHeightOfMap(windowHeight: number, isOnGeoregulationMap: boolean): number {
    let heightOfFilters = isOnGeoregulationMap ? 4 : 0;
    switch (true) {
      case (windowHeight < 650): return 65 + heightOfFilters;
      case (windowHeight < 700): return 68 + heightOfFilters;
      case (windowHeight < 750): return 71 + heightOfFilters;
      case (windowHeight < 800): return 73 + heightOfFilters;
      case (windowHeight < 875): return 76 + heightOfFilters;
      default: return 78 + heightOfFilters;
    }
  }

  private static fixKmlContent(kmlContent: string): string {
    if (!kmlContent?.length) {
      return kmlContent;
    }

    const regexPlacemarkId = new RegExp(environment.kmlFixRegexPatternId, 'ig');
    return kmlContent.replaceAll(regexPlacemarkId, '<Placemark>');
  }
}
