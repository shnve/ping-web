import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { checkIfDeviceIsMobile, isLocalLangSelected } from '@shared/ui-utils';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Extent } from 'ol/extent';
import { Observable, Subscription } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';

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
        })
      );
  }

  displayGeoregulationModal(georegulations?: Partial<MapGeoregulation>[]): void {
    if (!georegulations?.length) {
      return;
    }
    this.selectedGeoregulationIds = georegulations.map(georegulation => georegulation.id);
    this.showModal = true;
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
