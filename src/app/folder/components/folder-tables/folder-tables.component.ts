import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { AreasFacade } from '@app/facades/areas.facade';
import { defaultValuesFolderTableFilter, FolderTableFilterValues } from '@app/folder/models/folder-filters.model';
import { TableFolder } from '@app/folder/models/folder-table.model';
import { Folder, FolderStatusEnum } from '@app/folder/models/folder.model';
import { folderServiceProvider } from '@app/folder/providers/folder.service.provider';
import { FolderService } from '@app/folder/services/folder.service';
import Area from '@app/models/area.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService from '@app/models/maritime-service.model';
import { StudyBase } from '@app/models/study.model';
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
  selector: 'folder-tables',
  templateUrl: './folder-tables.component.html',
  styleUrls: ['./folder-tables.component.scss'],
  providers: [
    folderServiceProvider,
    { provide: TableState }
  ]
})
export class FolderTablesComponent implements OnDestroy, OnInit {

  private readonly scavenger = new Scavenger(this);

  @ViewChild('FolderTable') folderTable: PaginatedTableComponent<TableFolder>;
  displayFilters = true;
  tabs: SelectButtonOption[] = [];
  tabsClass: string;
  columns = {};
  folders: TableFolder[];
  selectedState = FolderStatusEnum.OPEN;
  areaSelected: Area = null;
  areas: Area[] = [];
  services: MaritimeService[] = [];
  maritimeEntities: MaritimeEntityBase[] = [];
  protected studies: StudyBase[] = [];
  totalFolders = 0;
  tableLoading = true;
  showModal = false;
  selectedFolders: Partial<Folder>[];
  params: Params;
  private refreshMaritimeEntities = true;
  private refreshStudies = true;
  private readonly subscriptions: Subscription[] = [];
  public readonly filterState: ModelItemFilterState<FolderTableFilterValues>;

  constructor(public readonly tableState: TableState,
    private readonly folderService: FolderService,
    private readonly alertMessages: AlertMessageService,
    private readonly areasFacade: AreasFacade,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly notificationState: NotificationState
  ) {
    this.filterState = new ModelItemFilterState<FolderTableFilterValues>();
    this.filterState.initFilter(defaultValuesFolderTableFilter);
    this.loadResources();
    this.subscriptions.push(
      this.notificationState.getNotificationObjectId$().subscribe((folderId: string) => {
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
        { field: 'reviewStatus', translateKey: 'folder-table.columns.reviewStatus' },
        { field: 'number', translateKey: 'folder-table.columns.number', sortable: true },
        { field: 'locality', translateKey: 'folder-table.columns.locality' },
        { field: 'concernedMaritimeEntities', translateKey: 'folder-table.columns.concernedMaritimeEntities' },
        { field: 'object', translateKey: 'folder-table.columns.object' },
        { field: 'sharedMaritimeServices', translateKey: 'folder-table.columns.sharedMaritimeServices' },
        { field: 'reviewDate', translateKey: 'folder-table.columns.reviewDate', sortable: true },
        { field: 'comment', translateKey: 'folder-table.columns.comment' },
        { field: 'lastUpdate', translateKey: 'folder-table.columns.lastUpdate', sortable: true },
        { field: 'studies', translateKey: 'folder-table.columns.studies', sortable: true }
      ],
      CLOSED: [
        { field: 'reviewStatus', translateKey: 'folder-table.columns.reviewStatus' },
        { field: 'number', translateKey: 'folder-table.columns.number', sortable: true },
        { field: 'locality', translateKey: 'folder-table.columns.locality' },
        { field: 'concernedMaritimeEntities', translateKey: 'folder-table.columns.concernedMaritimeEntities' },
        { field: 'object', translateKey: 'folder-table.columns.object' },
        { field: 'sharedMaritimeServices', translateKey: 'folder-table.columns.sharedMaritimeServices' },
        { field: 'reviewDate', translateKey: 'folder-table.columns.reviewDate', sortable: true },
        { field: 'comment', translateKey: 'folder-table.columns.comment' },
        { field: 'lastUpdate', translateKey: 'folder-table.columns.lastUpdate', sortable: true },
        { field: 'studies', translateKey: 'folder-table.columns.studies', sortable: true }
      ]
    };
    this.tabsClass = this.tabs.length === 2 ? 'two-tabs' : 'three-tabs';

    const folderId = this.route.snapshot.paramMap.get('folderId');
    if (folderId) {
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

  protected loadResources(): void {
    this.subscriptions.push(
      this.areasFacade.getAreasByServices$(this.getServices())
        .pipe(tap(areas => this.receiveAreas(areas)))
        .subscribe(
          (areas: Area[]) => {
            this.areas = areas;
            const areaToRedirectTo: Area = this.areas.find(area => area.id === this.params?.areaId);
            if (areaToRedirectTo) {
              this.areaSelected = areaToRedirectTo;
            }
          },
          (err: Error) => this.handleErrorLoadingAreas(err)
        )
    );
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

  protected receiveAreas(areas: Area[]): void {
    if (areas?.length) {
      this.areaSelected = areas.find(a => a.id === this.authService.getAuthenticatedUser()?.preferredAreaId) || areas[0];
      this.filterState.setValues({
        area: this.areaSelected
      });
    }
  }

  selectedStateChanged(): void {
    // Reinit sort when user change tab
    this.refreshMaritimeEntities = true;
    this.refreshStudies = true;
    this.tableState.setPageInfo({ page: 0 });
    this.folderTable.reset();
    this.resetSort();
    this.tableState.resetSortInfo();
    this.loadTableFolders(this.refreshMaritimeEntities, this.refreshStudies);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private resetSort(): void {
    this.folderTable.resetSort('lastUpdate', DESC);
  }

  filterChange(area?: Area): void {
    this.folders = [];
    this.tableState.setPageInfo({ page: 0 });
    this.areaSelected = area ?? this.filterState.getValues().area;
    this.loadTableFolders(this.refreshMaritimeEntities, this.refreshStudies);
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

  loadTableFolders(refreshAvailableMaritimeEntities = false, refreshAvailableStudies = false): void {
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
        } else {
          if (refreshAvailableMaritimeEntities) {
            this.maritimeEntities = folderPage?.modelItems.reduce((acc, curr) => {
              acc.push(curr.concernedMaritimeEntities);
              return acc;
            }, []).flat().filter(item => !!item);
            this.maritimeEntities = uniq(this.maritimeEntities, 'id');
            this.maritimeEntities.forEach(maritimeEntity =>
              maritimeEntity.internationalName = maritimeEntity.internationalName ?? maritimeEntity.name
            );
          }

          if (refreshAvailableStudies) {
            this.studies = folderPage?.modelItems.reduce((acc, curr) => {
              acc.push(curr.studies);
              return acc;
            }, []).flat().filter(item => !!item);
          }
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

    if (filterValues.maritimeEntityIds?.length) {
      chips.push({
        key: 'maritimeEntityIds',
        translateKey: 'filter.filter-bar.chip.maritime-entities',
        translateKeyOne: 'filter.filter-bar.chip.maritime-entity',
        translateParams: { count: filterValues.maritimeEntityIds.length }
      });
    }

    if (filterValues.studyId) {
      chips.push({
        key: 'studyId',
        translateKey: 'filter.filter-bar.chip.study',
        translateParams: { study: filterValues.studyId }
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
      endDate ? format(endDate, 'dd/MM/yy') : '',
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
    this.loadTableFolders(false, true);
  }

  onFolderAreaSet(areaId: string): void {
    if (this.areaSelected.id !== areaId) {
      const areaInFolderModal = this.areas.filter(area => area.id === areaId)[0];
      if (areaInFolderModal) {
        this.filterChange(areaInFolderModal);
      }
    }
  }
}
