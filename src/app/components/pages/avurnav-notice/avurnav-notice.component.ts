import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { WarningModalComponent } from '@app/shared/components/warning-modal/warning-modal.component';
import { PageInfo } from '@app/shared/models/paginated-table-view.model';
import { checkIfDeviceIsMobile, isLocalLangSelected, translatedTypeDetails } from '@app/shared/ui-utils';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { NotificationState } from '@app/states/notification.state';
import { StaticSectionApi } from '@app/static-section/api/static-section.api';
import { StaticSection } from '@app/static-section/models/static-section.model';
import { TranslateService } from '@ngx-translate/core';
import { ChipValue } from '@shared/components/filter-banner/filter-banner.component';
import { createOlGeometryFrom } from '@sig/utils/geometry';
import { format } from 'date-fns';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Extent } from 'ol/extent';
import { Observable, Subscription } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { WarningApi } from '../../../api/warning.api';
import { AlertMessageService } from '../../../core/alert-message.service';
import { AreasFacade } from '../../../facades/areas.facade';
import { MapWarningsFacade } from '../../../facades/map-warnings.facade';
import { SeriesFacade } from '../../../facades/series.facade';
import { WarningTableFacade } from '../../../facades/warnings-table.facade';
import Area from '../../../models/area.model';
import { Serie } from '../../../models/serie.model';
import {
  MapFilterValues, TableFilterValues,
  defaultValuesMapFilter, defaultValuesTableFilter
} from '../../../models/warning-filters.model';
import { JsonWarning, MainWarningPart, MapWarning, TableWarning } from '../../../models/warning.model';
import { SelectButtonOption } from '../../../shared/components/select-button/select-button.component';
import { TableState } from '../../../states/table.state';
import { ModelItemFilterState } from '../../../states/warning-filter.state';

export enum VisualizationMode {
  MAP = 'map',
  TABLE = 'table'
}

@Localize()
@Component({
  selector: 'app-avurnav-notice',
  styleUrls: ['./avurnav-notice.component.scss'],
  templateUrl: './avurnav-notice.component.html',
  providers: [
    { provide: ModelItemFilterState },
    { provide: WarningTableFacade, deps: [WarningApi] },
    { provide: TableState }
  ]
})
export class AvurnavNoticeComponent implements OnInit, OnDestroy, OnChangeLang {
  @ViewChild('modal', { static: false }) modal: WarningModalComponent;
  visualisationMode: VisualizationMode = VisualizationMode.MAP;
  visualisationModeOptions: SelectButtonOption[] = [
    { code: VisualizationMode.MAP, translateKey: 'visualization.options.map' },
    { code: VisualizationMode.TABLE, translateKey: 'visualization.options.table' }
  ];
  mapWarnings$: Observable<MapWarning[]>;
  tableWarnings: TableWarning[] | JsonWarning[];
  totalWarnings = 0;
  tableLoading = true;
  private readonly subscriptions: Subscription;
  public readonly mapFilterState: ModelItemFilterState<MapFilterValues>;
  public readonly tableFilterState: ModelItemFilterState<TableFilterValues>;
  warnings: Partial<MainWarningPart>[];
  selectedArea$: Observable<Area>;
  selectedAreaExtent: Extent;
  series: Serie[];
  showModal = false;
  isDetailedTable = false;
  displayMapDisclaimer: boolean;
  displayTableDisclaimer: boolean;
  displayDeviceOrientationModeDisclaimer = false;
  mapDisclaimerContent: string;
  currentMapDisclaimerId: string;
  isRendering = true;

  private staticSectionDisclaimer: StaticSection;

  constructor(private readonly mapWarningsFacade: MapWarningsFacade,
    private readonly alertMessages: AlertMessageService,
    private readonly warningTableFacade: WarningTableFacade,
    private readonly tableState: TableState,
    private readonly areasFacade: AreasFacade,
    private readonly seriesFacade: SeriesFacade,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly disclaimerService: DisclaimerService,
    private readonly notificationState: NotificationState,
    private readonly deviceDetectorService: DeviceDetectorService,
    private readonly authService: AuthService,
    private readonly staticSectionApi: StaticSectionApi
  ) {
    this.mapFilterState = new ModelItemFilterState<MapFilterValues>();
    this.tableFilterState = new ModelItemFilterState<TableFilterValues>();

    // Initialize filters with defaultValues
    this.mapFilterState.initFilter(defaultValuesMapFilter);
    this.tableFilterState.initFilter(defaultValuesTableFilter);
    this.subscriptions = this.mapFilterState.getValues$().subscribe(this.loadMapWarnings.bind(this));
    this.subscriptions.add(this.tableFilterState.getValues$().subscribe(this.tableFilterChange.bind(this)));
    this.displayDeviceOrientationModeDisclaimer = checkIfDeviceIsMobile(this.deviceDetectorService) && this.disclaimerService.showDisplayDeviceOrientationModeDisclaimer();

    this.showGlobalDisclaimerOnMap();
    this.selectedArea$ = this.areasFacade.getSelectedArea$();
    this.subscriptions.add(this.selectedArea$.pipe(
      tap(area => this.displayTableDisclaimer = !!this.getTableDisclaimerContent(area)?.length && this.disclaimerService.showDisplayTableDisclaimerForArea(area.id))
    ).subscribe(this.onSelectArea.bind(this)));

    this.subscriptions.add(
      this.notificationState.getNotificationObjectId$().subscribe((warningId: string) => this.displayWarningModal([{ id: warningId }]))
    );

    this.staticSectionApi.findOneByKey$('home-page-global-disclaimer-warning')
      .pipe(take(1))
      .subscribe((staticSection: StaticSection) => {
        this.staticSectionDisclaimer = staticSection;
        this.loadMapGlobalDisclaimerContent();
      });

    this.isRendering = false;
  }

  ngOnInit(): void {
    // Get warningId from url if there is one
    const warningId = this.route.snapshot.paramMap.get('warningId');
    if (warningId !== null) {
      this.displayWarningModal([{ id: warningId }]);
    }
  }

  loadMapWarnings(filterValues: MapFilterValues) {
    if (filterValues.disableFilter) {
      return;
    }
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
  }

  tableFilterChange() {
    this.tableState.setPageInfo({ page: 0 });
    this.loadTableWarnings();
  }

  tableChange(pageInfo: PageInfo) {
    this.tableState.setPageInfo({ ...pageInfo });
    this.loadTableWarnings();
  }

  loadTableWarnings() {
    // Serie is required to load warnings
    if (!this.tableFilterState.getValues().serie) {
      return;
    }
    this.tableLoading = true;
    this.warningTableFacade.loadFilteredPage$(this.tableState.getValues().pageInfo, this.tableFilterState.getValues(), this.isDetailedTable).pipe(
      tap(warningPage => {
        if (!warningPage?.modelItems?.length && !this.tableFilterState.getValues().disableFilter) {
          this.alertMessages.add({
            severity: 'warn',
            summary: 'message.summary.warn.filter.no-warning-found',
            detail: 'message.warn.filter.no-warning.found'
          });
        }
      })
    ).subscribe(warningPage => {
      this.tableWarnings = warningPage.modelItems;
      this.totalWarnings = warningPage.totalElements;
      this.tableLoading = false;
    }, () => {
      this.tableWarnings = [];
      this.tableLoading = false;
      this.alertMessages.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.filter.cannot-get-warnings'
      });
    });
  }

  onSelectArea(area: Area) {
    const geom = createOlGeometryFrom(area.geom);
    this.selectedAreaExtent = geom.getExtent();
    this.tableFilterState.clearFilter();
    this.mapFilterState.clearFilter();
    this.seriesFacade.getSeriesByAreaId$(area.id).subscribe(series => this.series = series);
    this.updateMapDisclaimer(area);
  }

  displayWarningModal(warnings?: Partial<MainWarningPart>[]) {
    this.warnings = warnings;
    this.showModal = true;
  }

  /**
   * Generate chip in filter banner for table
   * @param filterValues
   * @returns
   */
  generateTableFilterChipsText(filterValues: TableFilterValues): ChipValue[] {
    const chips: ChipValue[] = [];
    if (filterValues.serie) {
      chips.push({
        key: 'serie',
        translateKey: 'filter.filter-bar.chip.serie',
        translateParams: {
          serie: isLocalLangSelected(this.translate) ? filterValues.serie.name : filterValues.serie.internationalName
        }
      });
    }
    if (filterValues.subAreaIds.length) {
      chips.push({
        key: 'subAreaIds',
        translateKey: 'filter.filter-bar.chip.sub-areas',
        translateParams: { count: filterValues.subAreaIds.length },
        translateKeyOne: 'filter.filter-bar.chip.sub-area'
      });
    }
    if (filterValues.categories?.length) {
      chips.push({
        key: 'categories',
        translateKey: 'filter.filter-bar.chip.categories',
        translateParams: { count: filterValues.categories.length }
      });
    }
    if (filterValues.period?.startDate || filterValues?.period?.endDate) {
      chips.push(this.transformDatePeriodeToChip(filterValues.period));
    }
    if (filterValues.publishDate) {
      chips.push({
        key: 'publishDate',
        translateKey: 'filter.filter-bar.chip.publish-date',
        translateParams: { date: format(filterValues.publishDate, 'dd/MM/yy') }
      });
    }

    if (filterValues.concernedMaritimeEntityIds?.length) {
      chips.push({
        key: 'concernedMaritimeEntityIds',
        translateKey: 'filter.filter-bar.chip.maritime-entities',
        translateKeyOne: 'filter.filter-bar.chip.maritime-entity',
        translateParams: { count: filterValues.concernedMaritimeEntityIds.length }
      });
    }

    if (filterValues.entityCoverIds?.length) {
      chips.push({
        key: 'entityCoverIds',
        translateKey: 'filter.filter-bar.chip.maritime-entities-cover',
        translateKeyOne: 'filter.filter-bar.chip.maritime-entity-cover',
        translateParams: { count: filterValues.entityCoverIds.length }
      });
    }

    if (filterValues.reservationNumberAndYear) {
      chips.push({
        key: 'reservationNumberAndYear',
        translateKey: 'filter.filter-bar.chip.warning-number',
        translateParams: { number: filterValues.reservationNumberAndYear }
      });
    }
    return chips;
  }

  protected transformDatePeriodeToChip({ startDate, endDate }: { startDate?: Date, endDate?: Date }): ChipValue {
    const periodFormated = [
      startDate ? format(startDate, 'dd/MM/yy') : '',
      endDate ? format(endDate, 'dd/MM/yy') : '',
    ];
    return {
      key: 'period',
      translateKey: 'filter.filter-bar.chip.period',
      translateParams: { period: periodFormated.join(' - ') }
    };
  }

  translatedWarningTypeDetails(typeDetails: string): string {
    return translatedTypeDetails(this.translate, typeDetails);
  }

  onChangeTableView(isDetailedTable: boolean) {
    this.tableWarnings = []; // Prevent rendering view with inconsistent model
    this.isDetailedTable = isDetailedTable;
    this.loadTableWarnings();
  }

  ngOnDestroy(): void {
    this.subscriptions && this.subscriptions.unsubscribe();
  }

  protected onCloseMapDisclaimer(neverShowAgain: boolean): void {
    this.displayMapDisclaimer = false;
    if (neverShowAgain) {
      this.disclaimerService.neverShowAgainDisplayMapDisclaimerForArea(this.currentMapDisclaimerId);
    }
  }

  protected onCloseTableDisclaimer(neverShowAgain: boolean, areaId: string): void {
    this.displayTableDisclaimer = false;
    if (neverShowAgain) {
      this.disclaimerService.neverShowAgainDisplayTableDisclaimerForArea(areaId);
    }
  }

  protected onCloseDeviceOrientationModeDisclaimer(neverShowAgain: boolean): void {
    this.displayDeviceOrientationModeDisclaimer = false;
    if (neverShowAgain) {
      this.disclaimerService.neverShowAgainDisplayDeviceOrientationModeDisclaimer();
    }
  }

  protected getTableDisclaimerContent(currArea: Area): string {
    return isLocalLangSelected(this.translate) ? currArea.disclaimer : currArea.internationalDisclaimer;
  }

  private showGlobalDisclaimerOnMap(): void {
    this.displayMapDisclaimer = this.disclaimerService.showDisplayMapDisclaimerForArea('global');
    if (this.displayMapDisclaimer) {
      this.loadMapGlobalDisclaimerContent();
      this.currentMapDisclaimerId = 'global';
    }
  }

  private loadMapGlobalDisclaimerContent(): void {
    this.mapDisclaimerContent = isLocalLangSelected(this.translate) ? this.staticSectionDisclaimer?.content : this.staticSectionDisclaimer?.internationalContent;
  }

  onChangeLang(): void {
    this.loadMapGlobalDisclaimerContent();
  }

  private updateMapDisclaimer(currArea: Area): void {
    if (!this.isRendering || !this.currentMapDisclaimerId) {
      this.mapDisclaimerContent = isLocalLangSelected(this.translate) ? currArea.disclaimer : currArea.internationalDisclaimer;
      this.currentMapDisclaimerId = currArea.id;
      this.displayMapDisclaimer = !!this.mapDisclaimerContent?.length && this.disclaimerService.showDisplayMapDisclaimerForArea(this.currentMapDisclaimerId);
    }
  }
}
