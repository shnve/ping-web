import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { defaultValuesGeoregulationTableFilter, GeoregulationTableFilterValues } from '@app/georegulation/models/georegulation-filters.model';
import { TableGeoregulation } from '@app/georegulation/models/georegulation-table.model';
import { GeoregulationStatusEnum } from '@app/georegulation/models/georegulation.model';
import { georegulationServiceProvider } from '@app/georegulation/providers/georegulation.service.provider';
import { GeoregulationAdminService } from '@app/georegulation/services/georegulation-admin.service';
import { MaritimeServiceBase } from '@app/models/maritime-service.model';
import { ChipValue } from '@app/shared/components/filter-banner/filter-banner.component';
import { PaginatedTableComponent } from '@app/shared/components/paginated-table/paginated-table.component';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { PageInfo, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { TableState } from '@app/states/table.state';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { Scavenger } from '@wishtack/rx-scavenger';
import { format } from 'date-fns';
import { tap } from 'rxjs/operators';

const DESC = -1;

@Component({
  selector: 'georegulation-tables',
  templateUrl: './georegulation-tables.component.html',
  styleUrls: ['./georegulation-tables.component.scss'],
  providers: [
    georegulationServiceProvider,
    { provide: TableState }
  ]
})
export class GeoregulationTablesComponent implements OnInit, OnDestroy {

  private readonly scavenger = new Scavenger(this);

  @ViewChild('georegulationTable') georegulationTable: PaginatedTableComponent<TableGeoregulation>;
  tableLoading = false;
  columns = {};
  selectedStatus: GeoregulationStatusEnum;
  tabs: SelectButtonOption[] = [];
  tabsClass = 'three-tabs';

  georegulations: TableGeoregulation[] = [];
  totalGeoregulations = 0;

  services: MaritimeServiceBase[] = [];
  selectedService: MaritimeServiceBase = null;
  public readonly filterState: ModelItemFilterState<GeoregulationTableFilterValues>;

  showModal = false;
  selectedGeoregulationIds: string[] = [];

  constructor(public readonly tableState: TableState,
    private readonly alertMessageService: AlertMessageService,
    private readonly georegulationAdminService: GeoregulationAdminService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute) {
    this.filterState = new ModelItemFilterState<GeoregulationTableFilterValues>();
    this.filterState.initFilter(defaultValuesGeoregulationTableFilter);
    this.loadResources();
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.tabs = [{
      code: 'DRAFT',
      translateKey: 'georegulation-management.tabs.draft'
    }, {
      code: 'PUBLISHED',
      translateKey: 'georegulation-management.tabs.published'
    }, {
      code: 'REPEALED',
      translateKey: 'georegulation-management.tabs.repealed'
    }];

    this.columns = {
      DRAFT: [
        { field: 'number', translateKey: 'georegulation-table.columns.number', sortable: true },
        { field: 'type', translateKey: 'georegulation-table.columns.type' },
        { field: 'activities', translateKey: 'georegulation-table.columns.activities' },
        { field: 'title', translateKey: 'georegulation-table.columns.title' },
        { field: 'entities', translateKey: 'georegulation-table.columns.entities' },
        { field: 'internalComment', translateKey: 'georegulation-table.columns.internal-comment' },
        { field: 'lastUpdate', translateKey: 'georegulation-table.columns.last-update', sortable: true }
      ],
      PUBLISHED: [
        { field: 'number', translateKey: 'georegulation-table.columns.number', sortable: true },
        { field: 'type', translateKey: 'georegulation-table.columns.type' },
        { field: 'activities', translateKey: 'georegulation-table.columns.activities' },
        { field: 'title', translateKey: 'georegulation-table.columns.title' },
        { field: 'entities', translateKey: 'georegulation-table.columns.entities' },
        { field: 'publicationDate', translateKey: 'georegulation-table.columns.publication-date', sortable: true },
        { field: 'isPublic', translateKey: 'georegulation-table.columns.is-public' },
        { field: 'isNew', translateKey: 'georegulation-table.columns.is-new' },
        { field: 'internalComment', translateKey: 'georegulation-table.columns.internal-comment' }
      ],
      REPEALED: [
        { field: 'number', translateKey: 'georegulation-table.columns.number', sortable: true },
        { field: 'type', translateKey: 'georegulation-table.columns.type' },
        { field: 'activities', translateKey: 'georegulation-table.columns.activities' },
        { field: 'title', translateKey: 'georegulation-table.columns.title' },
        { field: 'entities', translateKey: 'georegulation-table.columns.entities' },
        { field: 'repealDate', translateKey: 'georegulation-table.columns.repeal-date', sortable: true },
        { field: 'internalComment', translateKey: 'georegulation-table.columns.internal-comment' }
      ]
    };

    this.route.queryParams.subscribe(params => {
      this.selectedStatus = Object.values(GeoregulationStatusEnum).includes(params.status) ? params.status : GeoregulationStatusEnum.DRAFT;
    });
  }

  private loadResources(): void {
    this.georegulationAdminService.getAuthoritiesToSelect$()
      .pipe(this.scavenger.collect())
      .subscribe(services => {
        if (!services.length) {
          this.router.navigate(['/']);
          this.alertMessageService.add({
            severity: 'warn',
            summary: 'message.summary.warn',
            detail: 'message.warn.api.georegulation.tables'
          });
          return;
        }
        this.services = services;
        const currentUserServiceId = this.authService.getAuthenticatedUser().serviceId;
        this.selectedService = this.services.find(service => service.id === currentUserServiceId) ?? this.services[0];
        this.loadGeoregulations();
      });
  }

  private loadGeoregulations(): void {
    this.tableLoading = true;
    this.georegulationAdminService.loadFilteredPage$(
      this.tableState.getValues(),
      this.selectedStatus,
      this.selectedService.id,
      this.filterState.getValues()
    ).pipe(
      this.scavenger.collect(),
      tap(georegulationPage => {
        if (!georegulationPage?.modelItems?.length) {
          this.alertMessageService.add({
            severity: 'warn',
            summary: 'message.summary.warn',
            detail: 'message.warn.filter.no-georegulation-found'
          });
        }
      })
    ).subscribe(georegulationPage => {
      this.georegulations = georegulationPage.modelItems;
      this.totalGeoregulations = georegulationPage.totalElements;
      this.tableLoading = false;
    }, () => {
      this.georegulations = [];
      this.tableLoading = false;
      this.alertMessageService.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.filter.cannot-get-folders'
      });
    });
  }

  selectedStatusChanged(): void {
    this.tableState.setPageInfo({ page: 0 });
    this.georegulationTable.reset();
    this.resetSort();
    this.tableState.resetSortInfo();
    this.loadGeoregulations();
  }

  sortChange(sortInfo: SortInfo): void {
    this.georegulations = [];
    this.tableState.setSortInfo({ ...sortInfo });
    this.loadGeoregulations();
  }

  private resetSort(): void {
    this.georegulationTable.resetSort('number', DESC);
  }

  pageChange(pageInfo: PageInfo): void {
    this.georegulations = [];
    this.tableState.setPageInfo({ ...pageInfo });
    this.loadGeoregulations();
  }

  filterChange(filterValues: GeoregulationTableFilterValues): void {
    this.georegulations = [];
    this.tableState.setPageInfo({ page: 0 });
    if (this.selectedService?.id !== filterValues.service?.id) {
      this.selectedService = filterValues.service;
    }
    this.loadGeoregulations();
  }

  generateFilterChipsText(filterValues: GeoregulationTableFilterValues): ChipValue[] {
    const chips: ChipValue[] = [];

    if (filterValues.mainNumberYear) {
      chips.push({
        key: 'mainNumberYear',
        translateKey: 'filter.filter-bar.chip.georegulation.main-number-year',
        translateParams: { number: filterValues.mainNumberYear }
      });
    }

    if (filterValues.mainNumberText) {
      chips.push({
        key: 'mainNumberText',
        translateKey: 'filter.filter-bar.chip.georegulation.main-number-text',
        translateParams: { number: filterValues.mainNumberText }
      });
    }

    if (filterValues.mainNumberAuthorities?.length) {
      chips.push({
        key: 'mainNumberAuthorities',
        translateKey: 'filter.filter-bar.chip.georegulation.main-number-authorities',
        translateKeyOne: 'filter.filter-bar.chip.georegulation.main-number-authority',
        translateParams: { count: filterValues.mainNumberAuthorities.length }
      });
    }

    if (filterValues.mainNumberDate) {
      chips.push({
        key: 'mainNumberDate',
        translateKey: 'filter.filter-bar.chip.georegulation.main-number-date',
        translateParams: { date: format(filterValues.mainNumberDate, 'dd/MM/yy') }
      });
    }

    if (filterValues.type) {
      chips.push({
        key: 'type',
        translateKey: `georegulation.type.${filterValues.type}`
      });
    }

    if (filterValues.activities?.length) {
      chips.push({
        key: 'activities',
        translateKey: 'filter.filter-bar.chip.georegulation.activities',
        translateKeyOne: 'filter.filter-bar.chip.georegulation.activity',
        translateParams: { count: filterValues.activities.length }
      });
    }

    if (filterValues.entities?.length) {
      chips.push({
        key: 'entities',
        translateKey: 'filter.filter-bar.chip.georegulation.entities',
        translateKeyOne: 'filter.filter-bar.chip.georegulation.entity',
        translateParams: { count: filterValues.entities.length }
      });
    }

    if (filterValues.isPublic !== null && filterValues.isPublic !== undefined) {
      if (filterValues.isPublic) {
        chips.push({
          key: 'isPublicYes',
          translateKey: 'filter.filter-bar.chip.georegulation.is-public-yes'
        });
      } else {
        chips.push({
          key: 'isPublicNo',
          translateKey: 'filter.filter-bar.chip.georegulation.is-public-no'
        });
      }
    }

    if (filterValues.isNew !== null && filterValues.isNew !== undefined) {
      if (filterValues.isNew) {
        chips.push({
          key: 'isNewYes',
          translateKey: 'filter.filter-bar.chip.georegulation.is-new-yes'
        });
      } else {
        chips.push({
          key: 'isNewNo',
          translateKey: 'filter.filter-bar.chip.georegulation.is-new-no'
        });
      }
    }

    if (filterValues.isExpired !== null && filterValues.isExpired !== undefined) {
      if (filterValues.isExpired) {
        chips.push({
          key: 'isExpiredYes',
          translateKey: 'filter.filter-bar.chip.georegulation.is-expired-yes'
        });
      } else {
        chips.push({
          key: 'isExpiredNo',
          translateKey: 'filter.filter-bar.chip.georegulation.is-expired-no'
        });
      }
    }

    return chips;
  }

  displayModal(georegulations?: TableGeoregulation[]) {
    this.selectedGeoregulationIds = georegulations.map(georegulation => georegulation.id);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  statusChanged(): void {
    this.showModal = false;
    this.loadGeoregulations();
  }
}
