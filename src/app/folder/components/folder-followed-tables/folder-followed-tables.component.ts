import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { defaultValuesFolderTableFilter, FolderTableFilterValues } from '@app/folder/models/folder-filters.model';
import { TableFolder } from '@app/folder/models/folder-table.model';
import { Folder, FolderStatusEnum } from '@app/folder/models/folder.model';
import { folderServiceProvider } from '@app/folder/providers/folder.service.provider';
import { FolderService } from '@app/folder/services/folder.service';
import { AreaBase } from '@app/models/area.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService from '@app/models/maritime-service.model';
import { NotificationState } from '@app/states/notification.state';
import { TableState } from '@app/states/table.state';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { ChipValue } from '@shared/components/filter-banner/filter-banner.component';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { SelectButtonOption } from '@shared/components/select-button/select-button.component';
import { uniq } from '@shared/generic-utils';
import { PageInfo, SortInfo } from '@shared/models/paginated-table-view.model';
import { Scavenger } from '@wishtack/rx-scavenger';
import { format } from 'date-fns';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';

const DESC = -1;

@Component({
  selector: 'folder-followed-tables',
  templateUrl: './folder-followed-tables.component.html',
  styleUrls: ['./folder-followed-tables.component.scss'],
  providers: [
    folderServiceProvider,
    { provide: TableState }
  ]
})
export class FolderFollowedTablesComponent implements OnInit, OnDestroy {
  private readonly scavenger = new Scavenger(this);

  @ViewChild('FolderTable') folderTable: PaginatedTableComponent<TableFolder>;
  displayFilters = true;
  tabs: SelectButtonOption[] = [];
  tabsClass: string;
  columns = {};
  folders: TableFolder[];
  selectedState = FolderStatusEnum.OPEN;
  serviceSelected: MaritimeService = null;
  services: MaritimeService[] = [];
  maritimeEntities: MaritimeEntityBase[] = [];
  areas: AreaBase[] = [];
  totalFolders = 0;
  tableLoading = true;
  showModal = false;
  selectedFolders: Partial<Folder>[];
  params: Params;
  private refreshMaritimeEntities = true;
  private readonly subscriptions: Subscription[] = [];
  public readonly filterState: ModelItemFilterState<FolderTableFilterValues>;

  folderIdOfFolderToDisplay: string;

  constructor(public readonly tableState: TableState,
    private readonly folderService: FolderService,
    private readonly alertMessages: AlertMessageService,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly notificationState: NotificationState
  ) {
    this.filterState = new ModelItemFilterState<FolderTableFilterValues>();
    this.filterState.initFilter(defaultValuesFolderTableFilter);
    this.loadResources();
    this.subscriptions.push(
      this.notificationState.getNotificationObjectId$().subscribe((folderId: string) => {
        this.folderIdOfFolderToDisplay = folderId;
        this.displayFolderModal([{ id: folderId }]);
      })
    );
  }

  ngOnInit(): void {
    this.tabs = [{
      code: 'OPEN',
      translateKey: 'folder-management.tabs.open'
    }, {
      code: 'CLOSED',
      translateKey: 'folder-management.tabs.closed'
    }];
    this.columns = {
      OPEN: [
        { field: 'number', translateKey: 'folder-table.columns.number', sortable: true },
        { field: 'issuingService', translateKey: 'folder-table.columns.folderManager' },
        { field: 'locality', translateKey: 'folder-table.columns.locality' },
        { field: 'area', translateKey: 'folder-table.columns.area' },
        { field: 'concernedMaritimeEntities', translateKey: 'folder-table.columns.concernedMaritimeEntities' },
        { field: 'object', translateKey: 'folder-table.columns.object' },
        { field: 'lastUpdate', translateKey: 'folder-table.columns.lastUpdate', sortable: true }
      ],
      CLOSED: [
        { field: 'number', translateKey: 'folder-table.columns.number', sortable: true },
        { field: 'issuingService', translateKey: 'folder-table.columns.folderManager' },
        { field: 'locality', translateKey: 'folder-table.columns.locality' },
        { field: 'area', translateKey: 'folder-table.columns.area' },
        { field: 'concernedMaritimeEntities', translateKey: 'folder-table.columns.concernedMaritimeEntities' },
        { field: 'object', translateKey: 'folder-table.columns.object' },
        { field: 'lastUpdate', translateKey: 'folder-table.columns.lastUpdate', sortable: true }
      ]
    };
    this.tabsClass = this.tabs.length === 2 ? 'two-tabs' : 'three-tabs';

    const folderId = this.route.snapshot.paramMap.get('folderId');
    if (folderId) {
      this.folderIdOfFolderToDisplay = folderId;
      this.displayFolderModal([{ id: folderId }]);
    }

    this.route.queryParams?.pipe(take(1)).subscribe(params => {
      this.params = params;
      if (Object.values(FolderStatusEnum).includes(params?.tab)) {
        this.selectedState = params?.tab;
      }
    });
  }

  private getServices(): string[] {
    return this.authService.getAuthenticatedUser()?.serviceRoles?.map(serviceRole => serviceRole.serviceId) ?? [];
  }

  protected loadResources() {
    this.subscriptions.push(
      this.maritimeServicesApi.findByServiceIds(this.getServices())
        .pipe(tap(services => this.receiveServices(services)))
        .subscribe(
          (services: MaritimeService[]) => this.services = services,
          (err: Error) => this.handleErrorLoadingServices(err)
        )
    );
  }

  protected handleErrorLoadingServices(err: Error): void {
    this.handleErrorLoading(err, 'cannot-get-services');
  }

  protected handleErrorLoadingAreas(err: Error): void {
    this.handleErrorLoading(err, 'cannot-get-areas');
  }

  private handleErrorLoading(err: Error, errorKey: string): void {
    this.tableLoading = false;
    this.alertMessages.add({
      severity: 'error',
      summary: 'message.summary.error',
      detail: `message.error.api.${errorKey}`
    });
    throw err;
  }

  protected receiveServices(services: MaritimeService[]): void {
    if (services?.length) {
      this.serviceSelected = services.find(service => service.id === this.authService.getAuthenticatedUser()?.serviceId);
      this.filterState.setValues({
        followerService: this.serviceSelected
      });
    }
  }

  selectedStateChanged(): void {
    // Reinit sort when user change tab
    this.refreshMaritimeEntities = true;
    this.tableState.setPageInfo({ page: 0 });
    this.folderTable.reset();
    this.resetSort();
    this.tableState.resetSortInfo();
    this.loadTableFolders(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private resetSort(): void {
    this.folderTable.resetSort('lastUpdate', DESC);
  }

  filterChange(service?: MaritimeService): void {
    this.folders = [];
    this.tableState.setPageInfo({ page: 0 });
    this.serviceSelected = service ?? this.filterState.getValues().followerService;
    this.loadTableFolders(this.refreshMaritimeEntities);
  }

  pageChange(pageInfo: PageInfo): void {
    this.folders = [];
    this.tableState.setPageInfo({ ...pageInfo });
    this.loadTableFolders();
  }

  sortChange(sortInfo: SortInfo): void {
    this.folders = [];
    this.tableState.setSortInfo({ ...sortInfo });
    this.loadTableFolders();
  }

  loadTableFolders(refreshAvailableMaritimeEntities = false): void {
    this.tableLoading = true;
    this.folderService.loadFilteredPage$(
      this.tableState.getValues(),
      this.selectedState,
      this.filterState.getValues()
    ).pipe(
      this.scavenger.collect(),
      tap(folderPage => {
        if (!folderPage?.modelItems?.length) {
          this.alertMessages.add({
            severity: 'warn',
            summary: 'message.summary.warn',
            detail: 'message.warn.filter.no-folder-found'
          });
        } else if (refreshAvailableMaritimeEntities) {
          if (!this.areas.length) {
            this.areas = folderPage?.modelItems.reduce((acc, curr) => {
              acc.push(curr.sharedAreas);
              return acc;
            }, []).flat().filter(item => !!item);
            this.areas = uniq(this.areas, 'id');
            this.areas.forEach(area =>
              area.internationalName = area.internationalName ?? area.name
            );
          }

          this.maritimeEntities = folderPage?.modelItems.reduce((acc, curr) => {
            acc.push(curr.concernedMaritimeEntities);
            return acc;
          }, []).flat().filter(item => !!item);
          this.maritimeEntities = uniq(this.maritimeEntities, 'id');
          this.maritimeEntities.forEach(maritimeEntity =>
            maritimeEntity.internationalName = maritimeEntity.internationalName ?? maritimeEntity.name
          );
        }
      })
    ).subscribe(folderPage => {
      this.folders = folderPage.modelItems;
      this.totalFolders = folderPage.totalElements;
      this.tableLoading = false;
    }, () => {
      this.folders = [];
      this.tableLoading = false;
      this.alertMessages.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.filter.cannot-get-folders'
      });
    });
  }

  get isFolderToDisplayIsFollowed(): boolean {
    return this.folders?.map(folder => folder.id).includes(this.folderIdOfFolderToDisplay)
      || this.selectedFolders.every(selectedFolder => this.folders?.map(folder => folder.id).includes(selectedFolder.id));
  }

  generateFilterChipsText(filterValues: FolderTableFilterValues): ChipValue[] {
    const chips: ChipValue[] = [];

    if (filterValues.number) {
      chips.push({
        key: 'number',
        translateKey: 'filter.filter-bar.chip.number',
        translateParams: { number: filterValues.number }
      });
    }

    if (filterValues.secondPartNumber) {
      chips.push({
        key: 'secondPartNumber',
        translateKey: 'filter.filter-bar.chip.second-part-number',
        translateParams: { number: filterValues.secondPartNumber }
      });
    }

    if (filterValues.localityOrObject) {
      chips.push({
        key: 'localityOrObject',
        translateKey: 'filter.filter-bar.chip.locality-object',
        translateParams: { locality: filterValues.localityOrObject }
      });
    }

    if (filterValues.areaIds?.length) {
      chips.push({
        key: 'areaIds',
        translateKey: 'filter.filter-bar.chip.areas',
        translateKeyOne: 'filter.filter-bar.chip.area',
        translateParams: { count: filterValues.areaIds.length }
      });
    }

    if (filterValues.maritimeEntityIds?.length) {
      chips.push({
        key: 'maritimeEntityIds',
        translateKey: 'filter.filter-bar.chip.maritime-entities',
        translateKeyOne: 'filter.filter-bar.chip.maritime-entity',
        translateParams: { count: filterValues.maritimeEntityIds.length }
      });
    }

    if (filterValues.lastUpdatePeriod?.startDate || filterValues?.lastUpdatePeriod?.endDate) {
      chips.push(this.transformDatePeriodeToChip(filterValues.lastUpdatePeriod, 'lastUpdatePeriod'));
    }

    if (filterValues.lastUpdateYear) {
      chips.push({
        key: 'lastUpdateYear',
        translateKey: 'filter.filter-bar.chip.last-update-year',
        translateParams: { year: filterValues.lastUpdateYear }
      });
    }

    return chips;
  }

  onStatusChangeAction(): void {
    this.showModal = false;
    this.loadTableFolders();
  }

  protected transformDatePeriodeToChip({ startDate, endDate }: { startDate?: Date, endDate?: Date }, key = 'period'): ChipValue {
    const periodFormated = [
      startDate ? format(startDate, 'dd/MM/yy') : '',
      endDate ? format(endDate, 'dd/MM/yy') : ''
    ];
    return {
      key,
      translateKey: 'filter.filter-bar.chip.period',
      translateParams: { period: periodFormated.join(' - ') }
    };
  }

  displayFolderModal(folders?: Partial<Folder>[]): void {
    this.selectedFolders = folders;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.loadTableFolders();
  }
}
