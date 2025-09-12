import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { WarningAdminApi } from '@app/api/admin/warning-admin.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { SeriesAdminFacade } from '@app/facades/admin/series-admin.facade';
import { WarningAdminTableFacade } from '@app/facades/admin/warning-admin-table.facade';
import { TableAdminFilterValues, defaultValuesTableAdminFilter } from '@app/models/admin/warning-admin-filter.model';
import { TableAdminWarning } from '@app/models/admin/warning-admin-table.model';
import { Serie } from '@app/models/serie.model';
import { MainWarningPart, TableWarning, listWarningHazardTypeDetails, listWarningHazardTypeGeneral, listWarningStatus } from '@app/models/warning.model';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { WarningTableComponent } from '@app/shared/components/warning-table/warning-table.component';
import { PageInfo, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { TableState } from '@app/states/table.state';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import { ChipValue } from '@shared/components/filter-banner/filter-banner.component';
import { differenceInMilliseconds, format, parseISO } from 'date-fns';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';

@Component({
  selector: 'aw-tables',
  templateUrl: './tables-page.component.html',
  styleUrls: ['./tables-page.component.scss'],
  providers: [
    { provide: ModelItemFilterState },
    { provide: WarningAdminTableFacade, deps: [WarningAdminApi] },
    { provide: TableState }
  ]
})
export class TablesPageComponent implements OnDestroy {
  @ViewChild('warningTable') warningTable: WarningTableComponent<TableWarning>;
  tabs: SelectButtonOption[] = [{
    code: 'MODEL',
    translateKey: 'an-management.tabs.models'
  }, {
    code: 'DRAFT',
    translateKey: 'an-management.tabs.drafts'
  }, {
    code: 'PUBLISHED',
    translateKey: 'an-management.tabs.in-effect'
  }, {
    code: 'CANCELLED',
    translateKey: 'an-management.tabs.canceled'
  }];
  columns = {
    MODEL: [
      { field: 'lastUpdate', translateKey: 'table.columns.lastUpdate' },
      { field: 'model', translateKey: 'table.columns.model', sortable: true },
      { field: 'references', translateKey: 'table.columns.references' },
      { field: 'title', translateKey: 'table.columns.title' },
      { field: 'entities', translateKey: 'table.columns.entities', sortable: true },
      { field: 'estimatedPublicationDate', translateKey: 'table.columns.estimatedPublicationDate', sortable: true },
      { field: 'endOfBroadcastDate', translateKey: 'table.columns.endOfBroadcastDate', sortable: true },
      { field: 'reviewDate', translateKey: 'table.columns.reviewDate', sortable: true },
      { field: 'folders', translateKey: 'table.columns.folders', sortable: true },
      { field: 'internalComment', translateKey: 'table.columns.internalComment' }
    ],
    DRAFT: [
      { field: 'state', translateKey: 'table.columns.state', sortable: true },
      { field: 'lastUpdate', translateKey: 'table.columns.lastUpdate' },
      { field: 'number', translateKey: 'table.columns.number', sortable: true },
      { field: 'references', translateKey: 'table.columns.references' },
      { field: 'title', translateKey: 'table.columns.title' },
      { field: 'entities', translateKey: 'table.columns.entities', sortable: true },
      { field: 'estimatedPublicationDate', translateKey: 'table.columns.estimatedPublicationDate', sortable: true },
      { field: 'endOfBroadcastDate', translateKey: 'table.columns.endOfBroadcastDate', sortable: true },
      { field: 'reviewDate', translateKey: 'table.columns.reviewDate', sortable: true },
      { field: 'folders', translateKey: 'table.columns.folders', sortable: true },
      { field: 'internalComment', translateKey: 'table.columns.internalComment' }
    ],
    PUBLISHED: [
      { field: 'state', translateKey: 'table.columns.state', sortable: true },
      { field: 'number', translateKey: 'table.columns.number', sortable: true },
      { field: 'references', translateKey: 'table.columns.references' },
      { field: 'title', translateKey: 'table.columns.title' },
      { field: 'entities', translateKey: 'table.columns.entities', sortable: true },
      { field: 'publicationDate', translateKey: 'table.columns.publicationDate', sortable: true },
      { field: 'cancellationDate', translateKey: 'table.columns.cancellationDate', sortable: true },
      { field: 'endOfBroadcastDate', translateKey: 'table.columns.endOfBroadcastDate', sortable: true },
      { field: 'reviewDate', translateKey: 'table.columns.reviewDate', sortable: true },
      { field: 'folders', translateKey: 'table.columns.folders', sortable: true },
      { field: 'internalComment', translateKey: 'table.columns.internalComment' }
    ],
    CANCELLED: [
      { field: 'number', translateKey: 'table.columns.number', sortable: true },
      { field: 'references', translateKey: 'table.columns.references' },
      { field: 'title', translateKey: 'table.columns.title' },
      { field: 'entities', translateKey: 'table.columns.entities', sortable: true },
      { field: 'publicationDate', translateKey: 'table.columns.publicationDate', sortable: true },
      { field: 'cancellationDate', translateKey: 'table.columns.cancellationDate', sortable: true },
      { field: 'folders', translateKey: 'table.columns.folders', sortable: true },
      { field: 'internalComment', translateKey: 'table.columns.internalComment' }
    ]
  };
  selectedStatus = 'PUBLISHED';
  serieSelected = null;
  series: Serie[] = [];
  warnings: TableAdminWarning[];
  totalWarnings = 0;
  tableLoading = true;
  showModal = false;
  selectedWarnings: Partial<MainWarningPart>[];
  params: Params;
  private readonly uuidParamsQueue = new Set();
  private readonly subscriptions: Subscription[] = [];
  public readonly filterState: ModelItemFilterState<TableAdminFilterValues>;

  constructor(public readonly tableState: TableState,
    private readonly alertMessages: AlertMessageService,
    private readonly warningAdminTableFacade: WarningAdminTableFacade,
    private readonly seriesAdminFacade: SeriesAdminFacade,
    private readonly translate: TranslateService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute) {
    this.filterState = new ModelItemFilterState<TableAdminFilterValues>();
    this.filterState.initFilter(defaultValuesTableAdminFilter);
    const serviceIds = this.authService.getAuthenticatedUser()?.serviceRoles?.map(serviceRole => serviceRole.serviceId);
    this.route.queryParams?.pipe(take(1)).subscribe({
      next: params => {
        this.params = params;
        if (Object.values(listWarningStatus).includes(params?.tab)) {
          this.selectedStatus = params?.tab;
        }
      }
    });
    this.loadSeriesAndWarnings(serviceIds);
  }

  protected loadSeriesAndWarnings(serviceIds: string[]) {
    this.subscriptions.push(
      this.seriesAdminFacade
        .getSeriesByServiceIds$(serviceIds)
        .subscribe(
          this.receiveSeries.bind(this),
          this.handleErrorLoadingSeries.bind(this)
        )
    );
    this.subscriptions.push(
      this.filterState.getValues$()
        .subscribe(this.filterChange.bind(this))
    );
  }

  protected handleErrorLoadingSeries() {
    this.tableLoading = false;
    this.alertMessages.add({
      severity: 'error',
      summary: 'message.summary.error',
      detail: 'message.error.api.cannot-get-series'
    });
  }

  protected receiveSeries(series) {
    this.series = series;
    if (series.length) {
      this.serieSelected = series[0];
    }
  }

  selectedStatusChanged() {
    // Reinit sort when user change tab
    this.tableState.setPageInfo({ page: 0 });
    this.warningTable.reset();
    this.resetSort();
    this.tableState.resetSortInfo();
    this.loadTableWarnings();
  }

  private resetSort(): void {
    if (this.selectedStatus === 'CANCELLED') {
      this.warningTable.resetSort('cancellationDate', -1);
    } else {
      this.warningTable.resetSort('state');
    }
  }

  filterChange() {
    this.tableState.setPageInfo({ page: 0 });
    const serieToRedirectTo: Serie = this.series.find(serie => serie.id === this.params?.serieId);
    this.serieSelected = serieToRedirectTo ?? (this.filterState.getValues().serie ?? this.series[0]);
    this.loadTableWarnings();
  }

  pageChange(pageInfo: PageInfo) {
    this.tableState.setPageInfo({ ...pageInfo });
    this.loadTableWarnings();
  }

  sortChange(sortInfo: SortInfo) {
    this.tableState.setSortInfo({ ...sortInfo });
    this.loadTableWarnings();
  }

  loadTableWarnings() {
    // Load warnings if only is selected series
    if (!this.filterState.getValues().serie) {
      return;
    }

    const uuidParams = Object.values({
      page: '' + this.tableState.getValues()['pageInfo'].page,
      size: '' + this.tableState.getValues()['pageInfo'].rows,
      ...WarningAdminTableFacade.convertFilterToRequestParams(this.selectedStatus, this.filterState.getValues()),
      ...(this.tableState.getValues()['sortInfo'] && this.tableState.getValues()['sortInfo'].field && { sort: WarningAdminTableFacade.convertSortInfoToString(this.tableState.getValues()['sortInfo']) })
    }).join('');

    if (this.uuidParamsQueue.has(uuidParams)) { return; }

    this.uuidParamsQueue.add(uuidParams);

    this.tableLoading = true;
    this.warningAdminTableFacade.loadFilteredPage$(
      this.tableState.getValues(),
      this.selectedStatus,
      this.filterState.getValues()
    ).pipe(
      tap(warningPage => {
        if (!warningPage?.modelItems?.length) {
          this.alertMessages.add({
            severity: 'warn',
            summary: 'message.summary.warn.filter.no-warning-found',
            detail: 'message.warn.filter.no-warning.found'
          });
        }
      })
    ).subscribe(warningPage => {
      this.warnings = warningPage.modelItems;
      this.totalWarnings = warningPage.totalElements;
      this.tableLoading = false;
      this.uuidParamsQueue.has(uuidParams) && this.uuidParamsQueue.delete(uuidParams);
    }, () => {
      this.warnings = [];
      this.tableLoading = false;
      this.alertMessages.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.filter.cannot-get-warnings'
      });
      this.uuidParamsQueue.has(uuidParams) && this.uuidParamsQueue.delete(uuidParams);
    });
  }

  /**
   * Generate chips in filter banner
   * @param filterValues
   * @returns
   */
  generateFilterChipsText(filterValues: TableAdminFilterValues): ChipValue[] {
    const chips: ChipValue[] = [];
    if (filterValues.subAreaIds.length) {
      chips.push({
        key: 'subAreaIds',
        translateKey: 'filter.filter-bar.chip.sub-areas',
        translateParams: { count: filterValues.subAreaIds.length },
        translateKeyOne: 'filter.filter-bar.chip.sub-area'
      });
    }
    if (filterValues.todo) {
      chips.push({
        key: 'todo',
        translateKey: 'filter.filter-bar.chip.todo'
      });
    }
    if (filterValues.warningNumber) {
      chips.push({
        key: 'warningNumber',
        translateKey: 'filter.filter-bar.chip.warning-number',
        translateParams: { number: filterValues.warningNumber }
      });
    }
    if (filterValues.generalCategory) {
      const { value } = listWarningHazardTypeGeneral.find(({ key }) => key === filterValues.generalCategory);
      chips.push({
        key: 'generalCategory',
        translateKey: value
      });
    }
    if (filterValues.detailsCategories?.length) {
      chips.push({
        key: 'detailsCategories',
        translateKey: 'filter.filter-bar.chip.details-categories',
        translateKeyOne: 'filter.filter-bar.chip.details-category',
        translateParams: { count: filterValues.detailsCategories.length }
      });
    }
    if (filterValues.localityOrInformation) {
      chips.push({
        key: 'localityOrInformation',
        translateKey: 'filter.filter-bar.chip.locality-information',
        translateParams: { locality: filterValues.localityOrInformation }
      });
    }
    if (filterValues.referenceNumber) {
      chips.push({
        key: 'referenceNumber',
        translateKey: 'filter.filter-bar.chip.replace',
        translateParams: { referenceNumber: filterValues.referenceNumber }
      });
    }
    if (filterValues.period?.startDate || filterValues?.period?.endDate) {
      chips.push(this.transformDatePeriodeToChip(filterValues.period));
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

    if (filterValues.folderIds?.length) {
      chips.push({
        key: 'folderIds',
        translateKey: 'filter.filter-bar.chip.folders',
        translateKeyOne: 'filter.filter-bar.chip.folder',
        translateParams: { count: filterValues.folderIds.length }
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

  /**
   * To compute countdown
   * @param date1
   * @returns
   */
  daysBetweenDateAndToday(date1: string): number {
    const difference = differenceInMilliseconds(parseISO(date1), new Date) / 86400000; // divide by one day in milliseconds
    if (difference >= -1 && difference <= 0) {
      return 0;
    }

    return Math.ceil(difference);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  displayWarningModal(warnings?: Partial<MainWarningPart>[]) {
    this.selectedWarnings = warnings;
    this.showModal = true;
  }

  onStatusChangeAction(): void {
    this.showModal = false;
    this.loadTableWarnings();
  }

  getTranslateKeyFromTypeDetails(translateKey: string) {
    const typeGeneral = listWarningHazardTypeGeneral.find(({ key }) => key === translateKey);
    if (typeGeneral) {
      return typeGeneral.value;
    }
    const typeDetail = listWarningHazardTypeDetails.find(({ key }) => key === translateKey);
    return typeDetail.value;
  }
}
