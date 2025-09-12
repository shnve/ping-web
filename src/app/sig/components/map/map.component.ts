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
import { addLayer, removeLayer, showHideLayers, showHideZoneX } from '@app/sig/utils/map';
import { genericRetryStrategy } from '@app/sig/utils/retry-utils';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { SurveyDetection } from '@app/survey/models/survey.model';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Carto, { CartoModulesOptions } from '@shom2/carto';
import { default as CartoLayer } from '@shom2/carto/core/Layer';
import { default as MapCarto } from '@shom2/carto/core/Map';
import { MeasureType } from '@shom2/carto/modules/MeasurementModule/MeasurementModule';
import { metersToKms, metersToNMiles, sqrMetersToSqrKms, sqrMetersToSqrNMiles } from '@shom2/carto/utils/conversions';
import { CoordDirection, CoordinatePart, functionDecimalToFormat, PROJECTION_ED50_DECIMAL, PROJECTION_ED50_DMS, PROJECTION_LAMBERT_93, PROJECTION_LAMBERT_I, PROJECTION_LAMBERT_II, PROJECTION_LAMBERT_III, PROJECTION_LAMBERT_IV, PROJECTION_S53, PROJECTION_WGS84_DECIMAL, PROJECTION_WGS84_DMS, PROJECTION_WGS84_DMSDS, ProjectionSystem } from '@shom2/carto/utils/coordinate';
import { PopoverComponent } from '@sig/components/popover/popover.component';
import { BasicControl } from '@sig/core/controls/basic-control';
import { WarningStyleFactory } from '@sig/core/warning-style.factory';
import { LayersFacade } from '@sig/facades/layers.facade';
import { MousePositionFormatterService } from '@sig/services/mouse-position-formatter.service';
import { Scavenger } from '@wishtack/rx-scavenger';
import Feature, { FeatureLike } from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Overlay from 'ol/Overlay';
import { FitOptions } from 'ol/View';
import { Extent } from 'ol/extent';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Style } from 'ol/style';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, first, map, retryWhen, take, tap } from 'rxjs/operators';
import { AlertMessageService } from '../../../core/alert-message.service';
import { defaultValuesGeoregulationMapFilter, GeoregulationMapFilterValues } from '../../../georegulation/models/georegulation-filters.model';
import { georegulationServiceProvider } from '../../../georegulation/providers/georegulation.service.provider';
import { MapWarning } from '../../../models/warning.model';
import { featureToPoint } from '../../utils/aggregation';
import { SupportedGeometryType } from './../../../shared/components/shared-map/shared-map.component';

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

  carto: Carto;
  subscriptions: Subscription;
  map: MapCarto;
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  vectorSourceMaritimeEntities: VectorSource;
  vectorLayerMaritimeEntities: VectorLayer<VectorSource>;
  vectorSourceInfosources: VectorSource;
  vectorLayerInfosources: VectorLayer<VectorSource>;
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

  measurementFormatFunction = function (measurementValue): string {
    const format = {
      minimumFractionDigits: MINIMUM_FRACTION_DIGITS,
      maximumFractionDigits: MAXIMUM_FRACTION_DIGITS
    };

    const locale = this.i18n.language;

    return (measurementValue.surface
      ? `${this.i18n.dict.MEASUREMENT_SURFACE_RESULT}
           ${sqrMetersToSqrKms(measurementValue.surface).toLocaleString(locale, format)}
           ${this.i18n.dict.KILOMETERS}²
           (${sqrMetersToSqrNMiles(measurementValue.surface).toLocaleString(locale, format)}
           ${this.i18n.dict.NAUTIC_MILES}²)`
      : ``)
      + (measurementValue.azimuth
        ? `${this.i18n.dict.MEASUREMENT_AZIMUTH_RESULT}
           ${measurementValue.azimuth.toLocaleString(locale, format)}°
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
 * Converti des coordonnées en degrés décimaux vers un format DMS particulier
 *
 * @param coordinate  la coordonnée en degrés décimaux à formater
 * @param coordinatePart  partie de la coordonnée (lon/lat)
 * @param format Le format vers lequel la conversion va s'effectuer
 * @param decMinPrecision le nombre de chiffres de la partie décimale de minutes dans le format DMS
 * @param decSecPrecision le nombre de chiffres de la partie décimale de secondes dans le format DMS
 *
 * @returns {string} la coordonnée formattée
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
    protected readonly surveyDangerFactory: SurveyDangerFactory
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
    if (this.shouldShowDetections && !this.showDetectionData) {
      this.displayDetectionsData();
    } else {
      this.detectionFeatures = [];
      this.showDetectionData = false;
      removeLayer(this.vectorLayerDetections, this.map);
    }
  }

  updateMapIfShouldShowRasterMarineLayer(): void {
    if (this.shouldShowOrthoGeoLittoralV2Layer && this.shouldShowRasterMarineLayer) {
      this.updateMapIfShouldShowRasterMarineLayerAndOrthoIGNLayer();
    } else {
      if (this.shouldShowOrthoGeoLittoralV2Layer) {
        this.carto.map.layers.find(layer => layer.name === environment.carto.orthoGeoLittoralV2LayerName).opacity = 0.8;
      }

      this.shouldShowRasterMarineLayer ?
        this.layersFacade.addRasterMarineLayer(this.carto.map, 1).pipe(take(1)).subscribe()
        : this.layersFacade.removeLayer(this.carto.map, environment.carto.rasterMarineLayerName);
    }
  }

  updateMapIfshouldShowOrthoGeoLittoralV2Layer(): void {
    if (this.shouldShowOrthoGeoLittoralV2Layer && this.shouldShowRasterMarineLayer) {
      this.updateMapIfShouldShowRasterMarineLayerAndOrthoIGNLayer();
    } else {
      if (this.shouldShowRasterMarineLayer) {
        this.carto.map.layers.find(layer => layer.name === environment.carto.rasterMarineLayerName).opacity = 1;
      }

      this.shouldShowOrthoGeoLittoralV2Layer ?
        this.layersFacade.addOrthoGeoLittoralV2Layer(this.carto.map, 0.8)
        : this.layersFacade.removeLayer(this.carto.map, environment.carto.orthoGeoLittoralV2LayerName);
    }
  }

  updateMapIfShouldShowRasterMarineLayerAndOrthoIGNLayer(): void {
    this.layersFacade.removeLayer(this.carto.map, environment.carto.orthoGeoLittoralV2LayerName);
    this.layersFacade.removeLayer(this.carto.map, environment.carto.rasterMarineLayerName);
    this.layersFacade.addOrthoGeoLittoralV2Layer(this.carto.map, 1);
    this.layersFacade.addRasterMarineLayer(this.carto.map, 0.3).pipe(take(1)).subscribe();
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

    if (changes.surveyDetections && this.surveyDetections && this.showDetections) {
      this.updateMapIfShouldShowDetections();
    }
  }

  ngAfterViewInit(): void {
    this.showLabelsPreviousValue = this.showLabels;
    const showRasterMarineWithAdditionalLayerForWestAfrica = this.shouldShowRasterMarineWithAdditionalLayerForWestAfrica && this.authService.hasAnyRoleOnShomService();
    this.subscriptions = this.layersFacade.getBaseLayers$(showRasterMarineWithAdditionalLayerForWestAfrica)
      .pipe(
        first(),
        map(val => {
          if (!this.serieName && this.shouldShowSubAreas) {
            throw new Error('no serieName');
          }
          return val;
        }),
        retryWhen(genericRetryStrategy({
          maxRetryAttempts: 10,
          scalingDuration: 200,
          excludedStatusCodes: [500]
        })),
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
      .subscribe(this.createCarto.bind(this));
  }

  private updateSystem(system: ProjectionSystem): void {
    system.coordinatesFormat.decimalToFormat = (system.coordinatesFormat.decimalToFormat as string).replace(/\s/g, '');
    system.helper = system.helper.replace(/\s/g, '');
    const format: string | functionDecimalToFormat = system.coordinatesFormat.decimalToFormat;
    system.coordinatesFormat.decimalToFormat = (coordinate: number, coordinatePart: CoordinatePart) =>
      this.convertCoordinateDecimalToFormattedDMS(coordinate, coordinatePart, format, 4, 3);
  }

  protected createCarto(layers: CartoLayer[]): void {
    PROJECTION_SYSTEMS.filter(system => typeof system.coordinatesFormat?.decimalToFormat === 'string')
      .forEach(system => this.updateSystem(system));

    this.carto = new Carto({
      layers,
      projection: 'EPSG:3857',
      center: environment.carto.defaultCenter,
      zoom: environment.carto.defaultZoom,
      target: '#' + this.mapId,
      styleService: {
        style: getDefaultStyle(this.isNotDefaultStyle, this.isGeoregulationStyle)
      },
      modules: {
        contextMenuModule: {
          enable: false
        },
        mousePositionModule: {
          placement: 'bottom-right',
          undefinedHTML: '',
          coordinateFormatter: {
            formatFunction: this.mousePositionFormatter.covertCoordinateToDms.bind(this.mousePositionFormatter),
            template: 'DD-MM.mmC',
            precision: 2
          }
        },
        zoomModule: {
          animation: {
            duration: 200,
            easing: 'easeinout'
          }
        },
        measurementModule: {
          enable: true,
          formatFunction: this.measurementFormatFunction,
          availableMeasurementTools: [MeasureType.LENGTH, MeasureType.AZIMUTH, MeasureType.RADIUS]
        },
        ...this.modulesOptions
      },
      availableProjectionSystems: PROJECTION_SYSTEMS,
      i18n: {
        language: this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US',
        dict: {
          'fr-FR': {
            NAUTIC_MILES: environment.carto.circleDistanceUnit.nauticMiles,
            PROJECTION_ED50_DEGREES_MINUTES: 'Géodesique ED50 (degrés minutes)',
            PROJECTION_WGS84_DEGREES_MINUTES_SECONDES_NAME: 'Géographique WGS84 (degrés minutes secondes)',
            DRAWING_EDITFORM_POLYGON_DRAWING_TITLE_PRE: 'Cliquez sur la carte pour dessiner votre polygone en plaçant les points dans le sens horaire ou ',
            DRAWING_EDITFORM_POLYGON_DRAWING_TITLE_LINK: 'saisissez ses coordonnées (sens horaire)',
            COORDINATES_INPUT_POLYGON_HEADER_TITLE: 'Ajout d\'un polygone par saisie des coordonnées (sens horaire)',
            DRAWING_TOOL_POLYGON_END_DRAWING_MESSAGE: 'Ajoutez un point (sens horaire). Double cliquez ou fermez le polygone pour terminer le dessin'
          },
          'en-US': {
            NAUTIC_MILES: environment.carto.circleDistanceUnit.nauticMiles,
            PROJECTION_ED50_DEGREES_MINUTES: 'Geodetic ED50 (degrees minutes)',
            PROJECTION_WGS84_DEGREES_MINUTES_SECONDES_NAME: 'Geographical WGS84 (degrees minutes seconds)',
            DRAWING_EDITFORM_POLYGON_DRAWING_TITLE_PRE: 'Click on the map to draw your polygon by placing the points clockwise or ',
            DRAWING_EDITFORM_POLYGON_DRAWING_TITLE_LINK: 'enter its coordinates (clockwise)',
            COORDINATES_INPUT_POLYGON_HEADER_TITLE: 'Add a polygon from coordinates entry (clockwise)',
            DRAWING_TOOL_POLYGON_END_DRAWING_MESSAGE: 'Add new point (clockwise). Double click or complete the shape to finish your draw'
          }
        }
      }
    });

    this.map = this.carto.map;
    const olMap = this.map.olMap;

    this.fitToExtent();

    if (this.enableKmlImport && !this.disabled) {
      this.btnKml = new BasicControl({
        className: 'button-control control-btn-kml-import',
        iconClassName: 'fas fa-file-import',
        actionOnClick: this.kmlImportCallback
      });
      olMap.addControl(this.btnKml);
    }

    if (this.enableGotoLegend) {
      this.btnLegend = new BasicControl({
        className: 'button-control control-btn-goto-legend-page',
        iconClassName: 'fas fa-book',
        actionOnClick: this.gotoLegendPage.bind(this)
      });
      olMap.addControl(this.btnLegend);
    }

    if (this.enableLabelsShowHide) {
      this.btnLabels = new BasicControl({
        className: `button-control control-btn-show-hide-labels ${this.showLabels ? 'enabled' : ''}`,
        iconClassName: 'fas fa-tags',
        actionOnClick: this.showHideLabels.bind(this)
      });
      olMap.addControl(this.btnLabels);
    }

    if (this.enableLayersShowHide) {
      this.btnLayers = new BasicControl({
        className: 'button-control control-btn-show-hide-layers',
        iconClassName: 'fas fa-layer-group',
        actionOnClick: this.showCategoryPanel.bind(this)
      });
      olMap.addControl(this.btnLayers);
    }

    this.translateBtnTitle();

    if (this.popover) {
      this.popoverOverlay = new Overlay({
        element: this.popoverComponent.element.nativeElement,
        offset: [0, -12],
        positioning: OverlayPositioning.BOTTOM_CENTER
      });
      olMap.addOverlay(this.popoverOverlay);
    }

    // Displays warnings and areas only after map loading
    if (this.showWarnings) {
      this.updateMapIfShouldShowWarnings();
      this.addEventForDisplayingDatasOnHover();
    } else if (this.warnings?.length) {
      this.displaysWarningData();
      this.addEventForDisplayingDatasOnHover();
    }

    if (this.showGeoregulations) {
      this.updateMapIfShouldShowGeoregulationsVisu();
      this.addEventForDisplayingDatasOnHover();
    } else if (this.georegulations?.length) {
      this.displayGeoregulationsDataVisu();
      this.addEventForDisplayingDatasOnHover();
    }

    if (this.showInfosources) {
      this.shouldShowInfosources = !this.modulesOptions.drawingModule.mainMenu.editionForm.enableBathyForm;
      this.updateMapIfShouldShowInfosources();
      this.addEventForDisplayingDatasOnHover();
    }

    if (this.showDetections) {
      this.shouldShowDetections = true;
      this.updateMapIfShouldShowDetections();
    }

    if (!this.modulesOptions?.drawingModule && this.geometriesLayer) {
      this.geometriesLayer.setZIndex(environment.carto.drawingModule.drawingLayerZindex);
      this.map.olMap.addLayer(this.geometriesLayer);
    }

    this.isLoaded = true;

    this.onLoad.emit();

    window.dispatchEvent(new Event('resize'));

    if (this.showLayers) {
      this.updateMapIfShouldShowSubAreas();
    }

    if (this.showZoneX) {
      this.updateMapIfShouldShowZoneX();
    }

    // Focus the map on the features
    this.centerOnFeatures(this.geometriesLayer);
  }

  addEventForDisplayingDatasOnHover() {
    if (this.hasEventForDisplayingDatasOnHover) {
      return;
    }

    this.map.olMap.on('pointermove', this.manageDatasPopoverDisplayingHandler);
    this.hasEventForDisplayingDatasOnHover = true;
  }

  translateBtnTitle(): void {
    this.btnKml?.updateTitle(this.translate.instant('carto.controls.title-btn-import-kml'));
    this.btnLegend?.updateTitle(this.translate.instant('carto.controls.title-btn-goto-legend-page'));
    this.btnLayers?.updateTitle(this.translate.instant('carto.controls.title-btn-show-hide-layers'));
    this.btnLabels?.updateTitle(this.translate.instant('carto.controls.title-btn-show-hide-labels'));
  }

  setAvailableTools(tools: Array<string>): void {
    this.carto.command('drawing.setAvailableTools', tools);
  }

  removeInfosourcesDataLayer(): void {
    removeLayer(this.vectorLayerInfosources, this.map);
  }

  removeGeoregulationsDataLayer(georegulationType: GeoregulationType): void {
    removeLayer(this.vectorLayerGeoregulations[georegulationType], this.map);
  }

  removeGeoregulationsDataLayerVisu(): void {
    removeLayer(this.vectorLayerGeoregulationsVisu, this.map);
  }

  removeDatasLayer(): void {
    removeLayer(this.vectorLayer, this.map);
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
    showHideLayers(this.carto.map, canShow, this.parentLayers, this.serieName);
  }

  private showHideZoneX(canShow: boolean): void {
    showHideZoneX(this.carto.map, canShow);
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

  protected fitToExtent(): void {
    this.fitToGivenExtent(this.extent);
  }

  fitToGivenExtent(extent: Extent): void {
    extent && this.map.view.fit(extent);
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

    this.carto.command('kml.import', drawingLayer, false, fixedKmlContent);

    // Permet d'activer les interactions avec les nouvelles features importées
    this.carto.command('drawing.reset');

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
    const cartoLanguage = lang === 'fr' ? 'fr-FR' : 'en-US';
    this.carto?.changeLanguage(cartoLanguage);
    this.translateBtnTitle();
  }

  ngOnDestroy(): void {
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

    this.carto && this.carto.destroy();
    this.subscriptions && this.subscriptions.unsubscribe();
    this.layersFacade.reinitializeLayers(this.map?.olMap);
    if (this.map) {
      this.map.destroy();
    }
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
