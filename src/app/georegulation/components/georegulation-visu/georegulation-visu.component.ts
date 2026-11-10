import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { Localize } from '@app/core/localize';
import { AreasFacade } from '@app/facades/areas.facade';
import {
  GeoregulationMapFilterValues,
  defaultValuesGeoregulationMapFilter
} from '@app/georegulation/models/georegulation-filters.model';
import { MapGeoregulation } from '@app/georegulation/models/georegulation.model';
import { GeoregulationService } from '@app/georegulation/services/georegulation.service';
import Area from '@app/models/area.model';
import { createOlGeometryFrom } from '@app/sig/utils/geometry';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { NotificationState } from '@app/states/notification.state';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { StaticSectionApi } from '@app/static-section/api/static-section.api';
import { StaticSection } from '@app/static-section/models/static-section.model';
import { TranslateService } from '@ngx-translate/core';
import { MapListPanelLabels } from '@shared/components/map-list-panel/map-list-panel.component';
import { checkIfDeviceIsMobile, isLocalLangSelected } from '@shared/ui-utils';
import { MapComponent } from '@sig/components/map/map.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import Feature from 'ol/Feature';
import { createEmpty, extend, Extent, isEmpty } from 'ol/extent';
import { Observable, Subscription } from 'rxjs';
import { catchError, shareReplay, take, tap } from 'rxjs/operators';

@Localize()
@Component({
  selector: 'georegulation-visu',
  templateUrl: './georegulation-visu.component.html',
  styleUrls: ['./georegulation-visu.component.scss'],
  providers: [
    { provide: ModelItemFilterState },
    { provide: GeoregulationService }
  ]
})
export class GeoregulationVisuComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: false }) map: MapComponent;

  /** PISAC (F4): textos del panel lateral de regulaciones. */
  readonly panelLabels: MapListPanelLabels = {
    title: 'georegulation-panel.title',
    search: 'georegulation-panel.search',
    collapse: 'georegulation-panel.collapse',
    expand: 'georegulation-panel.expand',
    empty: 'georegulation-panel.empty',
    noResults: 'georegulation-panel.no-results'
  };

  readonly searchTextFn = (georegulation: MapGeoregulation): string =>
    `${georegulation.mainNumber ?? ''} ${georegulation.title ?? ''} ${georegulation.internationalTitle ?? ''}`;

  mapGeoregulations$: Observable<MapGeoregulation[]>;
  selectedAreaExtent: Extent;
  selectedArea$: Observable<Area>;
  selectedGeoregulationIds: string[];
  showModal = false;
  displayDeviceOrientationModeDisclaimer = false;
  displayAreaDisclaimer: boolean;
  areaDisclaimerContent: string;
  currentAreaDisclaimerId: string;
  isRendering = true;

  private readonly subscriptions: Subscription;

  public readonly mapFilterStateGeoregulation: ModelItemFilterState<GeoregulationMapFilterValues>;

  private staticSectionDisclaimer: StaticSection;

  constructor(private readonly alertMessages: AlertMessageService,
              private readonly georegulationService: GeoregulationService,
              private readonly route: ActivatedRoute,
              private readonly disclaimerService: DisclaimerService,
              private readonly deviceDetectorService: DeviceDetectorService,
              private readonly notificationState: NotificationState,
              private readonly areasFacade: AreasFacade,
              private readonly translate: TranslateService,
              private readonly authService: AuthService,
              private readonly staticSectionApi: StaticSectionApi
  ) {
    this.mapFilterStateGeoregulation = new ModelItemFilterState<GeoregulationMapFilterValues>();

    // Initialize filters with defaultValues
    this.mapFilterStateGeoregulation.initFilter(defaultValuesGeoregulationMapFilter);
    this.subscriptions = this.mapFilterStateGeoregulation.getValues$()
      .subscribe(filterValues => this.loadMapGeoregulations(filterValues));
    this.displayDeviceOrientationModeDisclaimer = checkIfDeviceIsMobile(this.deviceDetectorService) && this.disclaimerService.showDisplayDeviceOrientationModeDisclaimer();

    this.showGlobalDisclaimerOnMap();
    this.selectedArea$ = this.areasFacade.getSelectedArea$();
    this.subscriptions.add(this.selectedArea$.subscribe(this.onSelectArea.bind(this)));

    this.subscriptions.add(
      this.notificationState.getNotificationObjectId$()
        .subscribe((georegulationId: string) => this.displayGeoregulationModal([{ id: georegulationId }]))
    );

    this.staticSectionApi.findOneByKey$('home-page-global-disclaimer-georegulation')
      .pipe(take(1))
      .subscribe((staticSection: StaticSection) => {
        this.staticSectionDisclaimer = staticSection;
        this.loadMapGlobalDisclaimerContent();
      });

    this.isRendering = false;
  }

  ngOnInit(): void {
    // Get georegulationId from url if there is one (for shared link usage)
    const georegulationId = this.route.snapshot.paramMap.get('georegulationId');
    if (georegulationId !== null) {
      this.displayGeoregulationModal([{ id: georegulationId }]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions && this.subscriptions.unsubscribe();
  }

  onSelectArea(area: Area) {
    const geom = createOlGeometryFrom(area.geom);
    this.selectedAreaExtent = geom.getExtent();
    this.mapFilterStateGeoregulation.clearFilter();
    this.updateMapDisclaimer(area);
  }

  loadMapGeoregulations(filterValues: GeoregulationMapFilterValues): void {
    if (filterValues.disableFilter) {
      return;
    }
    this.mapGeoregulations$ = this.georegulationService.getFilteredMapGeoregulations$(filterValues)
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
        }),
        // PISAC (F4): el mapa y el panel de lista comparten la misma respuesta
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  displayGeoregulationModal(georegulations?: Partial<MapGeoregulation>[]): void {
    if (!georegulations?.length) {
      return;
    }
    this.selectedGeoregulationIds = georegulations.map(georegulation => georegulation.id);
    this.showModal = true;
  }

  /** Regulación abierta en el panel de detalle (resaltada en la lista). */
  get selectedGeoregulationId(): string {
    return this.selectedGeoregulationIds?.length === 1 ? this.selectedGeoregulationIds[0] : null;
  }

  /** PISAC (F4): título en el idioma activo (con el otro idioma como respaldo). */
  georegulationTitle(georegulation: MapGeoregulation): string {
    return isLocalLangSelected(this.translate)
      ? (georegulation.title || georegulation.internationalTitle)
      : (georegulation.internationalTitle || georegulation.title);
  }

  /** PISAC (F4): regulación elegida en la lista → centrar el mapa en sus geometrías y abrir el detalle. */
  onGeoregulationListSelect(georegulation: MapGeoregulation): void {
    const extent = createEmpty();
    (georegulation.features ?? [])
      .filter(feature => !!feature?.geometry)
      .forEach(feature => extend(extent, createOlGeometryFrom(feature.geometry).getExtent()));
    this.fitMapToExtent(extent);
    this.displayGeoregulationModal([georegulation]);
  }

  /** PISAC (F4): centra el mapa en las geometrías indicadas desde el panel de detalle (todas o una parte). */
  focusFeaturesOnMap(features: Feature[]): void {
    const extent = createEmpty();
    (features ?? [])
      .map(feature => feature?.getGeometry?.())
      .filter(geometry => !!geometry)
      .forEach(geometry => extend(extent, geometry.getExtent()));
    this.fitMapToExtent(extent);
  }

  /** El mapa cambia de ancho al plegar/desplegar el panel: OpenLayers recalcula su tamaño con 'resize'. */
  onMapPanelToggle(): void {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 220);
  }

  private fitMapToExtent(extent: Extent): void {
    if (isEmpty(extent)) {
      return;
    }
    // El margen derecho deja libre el panel de detalle (en móvil el detalle ocupa toda la pantalla)
    const rightPadding = window.innerWidth > 768 ? Math.min(600, window.innerWidth) + 40 : 60;
    this.map?.fitToGivenExtent(extent, [60, rightPadding, 60, 60]);
  }

  protected closeModal(): void {
    this.showModal = false;
  }

  protected onCloseDeviceOrientationModeDisclaimer(neverShowAgain: boolean): void {
    this.displayDeviceOrientationModeDisclaimer = false;
    if (neverShowAgain) {
      this.disclaimerService.neverShowAgainDisplayDeviceOrientationModeDisclaimer();
    }
  }

  protected onCloseAreaDisclaimer(neverShowAgain: boolean): void {
    this.displayAreaDisclaimer = false;
    if (neverShowAgain) {
      this.disclaimerService.neverShowAgainDisplayGeoregulationDisclaimerForArea(this.currentAreaDisclaimerId);
    }
  }

  private showGlobalDisclaimerOnMap(): void {
    this.displayAreaDisclaimer = this.disclaimerService.showDisplayGeoregulationDisclaimerForArea('global');
    if (this.displayAreaDisclaimer) {
      this.loadMapGlobalDisclaimerContent();
      this.currentAreaDisclaimerId = 'global';
    }
  }

  private loadMapGlobalDisclaimerContent(): void {
    this.areaDisclaimerContent = isLocalLangSelected(this.translate) ? this.staticSectionDisclaimer?.content : this.staticSectionDisclaimer?.internationalContent;
  }

  onChangeLang(): void {
    this.loadMapGlobalDisclaimerContent();
  }

  private updateMapDisclaimer(currArea: Area): void {
    if (!this.isRendering || !this.currentAreaDisclaimerId) {
      this.areaDisclaimerContent = isLocalLangSelected(this.translate) ? currArea.disclaimer : currArea.internationalDisclaimer;
      this.currentAreaDisclaimerId = currArea.id;
      this.displayAreaDisclaimer = !!this.areaDisclaimerContent?.length && this.disclaimerService.showDisplayGeoregulationDisclaimerForArea(this.currentAreaDisclaimerId);
    }
  }
}
