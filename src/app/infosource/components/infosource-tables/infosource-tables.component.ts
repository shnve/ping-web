import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { InfosourceTableFilterValues, defaultValuesInfosourceTableFilter } from '@app/infosource/models/infosource-filters.model';
import { InfosourceState, TableInfosource } from '@app/infosource/models/infosource-table.model';
import { Infosource, TRANSLATIONS_LIST_INFOSOURCE_NATURE } from '@app/infosource/models/infosource.model';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService, InfosourceService } from '@app/infosource/services/infosource.service';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import MaritimeService, { MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { ChipValue } from '@app/shared/components/filter-banner/filter-banner.component';
import { PaginatedTableComponent } from '@app/shared/components/paginated-table/paginated-table.component';
import { SelectButtonOption } from '@app/shared/components/select-button/select-button.component';
import { uniq } from '@app/shared/generic-utils';
import { PageInfo, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { checkIfDeviceIsMobile, getI18nValue } from '@app/shared/ui-utils';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { NotificationState } from '@app/states/notification.state';
import { TableState } from '@app/states/table.state';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { format } from 'date-fns';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Localize, OnChangeLang } from '../../../core/localize';
const DESC = -1;

@Component({
  selector: 'infosource-tables',
  templateUrl: './infosource-tables.component.html',
  styleUrls: ['./infosource-tables.component.scss'],
  providers: [
    infosourceServiceProvider,
    { provide: TableState }
  ]
})
@Localize()
export class InfosourceTablesComponent implements OnDestroy, OnInit, OnChangeLang {

  private readonly scavenger = new Scavenger(this);

  @ViewChild('InfosourceTable') infosourceTable: PaginatedTableComponent<TableInfosource>;
  displayFilters = false;
  tabs: SelectButtonOption[] = [];
  tabsClass: string;
  columns = {};
  infosources: TableInfosource[];
  selectedState = 'SENT';
  serviceSelected: MaritimeService = null;
  services: MaritimeService[] = [];
  maritimeEntities: MaritimeEntityBase[] = [];
  tags: string[] = [];
  recipients: MaritimeServiceInfosourceRecipient[] = [];
  totalInfosSources = 0;
  tableLoading = true;
  showModal = false;
  selectedInfosources: Partial<Infosource>[];
  maritimeServices$: Observable<MaritimeService[]>;
  private refreshMaritimeEntities = true;
  private readonly uuidParamsQueue = new Set<string>();
  private readonly subscriptions: Subscription[] = [];
  public readonly filterState: ModelItemFilterState<InfosourceTableFilterValues>;

  displayDeviceOrientationModeDisclaimer = false;

  constructor(public readonly tableState: TableState,
    private readonly alertMessages: AlertMessageService,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly infosourceService: AbstractInfosourceService,
    private readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly disclaimerService: DisclaimerService,
    private readonly deviceDetectorService: DeviceDetectorService,
    private readonly route: ActivatedRoute,
    private readonly notificationState: NotificationState) {
    this.filterState = new ModelItemFilterState<InfosourceTableFilterValues>();
    this.filterState.initFilter(defaultValuesInfosourceTableFilter);
    this.loadResources();
    this.subscriptions.push(
      this.notificationState.getNotificationObjectId$()
        .subscribe((infosourceId: string) => this.displayInfosourceModal([{ id: infosourceId }]))
    );
  }

  ngOnInit(): void {
    if (this.authService.hasRoleServiceUser()) {
      this.displayFilters = true;
      this.tabs = [{
        code: 'DRAFT',
        translateKey: 'info-management.tabs.drafts'
      }, {
        code: 'SENT',
        translateKey: 'info-management.tabs.sent'
      }, {
        code: 'RECEIVED',
        translateKey: 'info-management.tabs.received'
      }
      ];
      this.columns = {
        DRAFT: [
          { field: 'nature', translateKey: 'info-table.columns.nature', sortable: true },
          { field: 'description', translateKey: 'info-table.columns.description' },
          { field: 'concernedMaritimeEntities', translateKey: 'info-table.columns.concernedMaritimeEntities' },
          { field: 'tags', translateKey: 'info-table.columns.tags' },
          /*{ field: 'internalComment', translateKey: 'info-table.columns.internalComment' },*/
          { field: 'lastUpdate', translateKey: 'info-table.columns.lastUpdate', sortable: true },
          { field: 'expectedDeletionDate', translateKey: 'info-table.columns.expectedDeletionDate' }
        ],
        SENT: [
          { field: 'status', translateKey: 'info-table.columns.status', sortable: true },
          { field: 'number', translateKey: 'info-table.columns.number', sortable: true },
          { field: 'nature', translateKey: 'info-table.columns.nature', sortable: true },
          { field: 'description', translateKey: 'info-table.columns.description' },
          { field: 'concernedMaritimeEntities', translateKey: 'info-table.columns.concernedMaritimeEntities' },
          { field: 'tags', translateKey: 'info-table.columns.tags' },
          /*{ field: 'internalComment', translateKey: 'info-table.columns.internalComment' },*/
          { field: 'validationTime', translateKey: 'info-table.columns.validationTime', sortable: true },
          { field: 'recipients', translateKey: 'info-table.columns.recipients' },
          { field: 'affairs', translateKey: 'info-table.columns.affairs' },
          { field: 'nauticalInformationsProduced', translateKey: 'info-table.columns.nauticalInformationsProduced' }
        ],
        RECEIVED: [
          { field: 'status', translateKey: 'info-table.columns.status', sortable: true },
          { field: 'serviceStatus', translateKey: 'info-table.columns.stateService', sortable: true },
          { field: 'number', translateKey: 'info-table.columns.number', sortable: true },
          { field: 'emitter', translateKey: 'info-table.columns.emitter', sortable: true },
          { field: 'nature', translateKey: 'info-table.columns.nature', sortable: true },
          { field: 'description', translateKey: 'info-table.columns.truncatedDescription' },
          { field: 'concernedMaritimeEntities', translateKey: 'info-table.columns.concernedMaritimeEntities' },
          { field: 'tags', translateKey: 'info-table.columns.tags' },
          /*{ field: 'internalComment', translateKey: 'info-table.columns.internalComment' },*/
          { field: 'validationTime', translateKey: 'info-table.columns.validationTime', sortable: true },
          { field: 'recipients', translateKey: 'info-table.columns.recipients' },
          { field: 'affairs', translateKey: 'info-table.columns.affairs' },
          { field: 'nauticalInformationsProduced', translateKey: 'info-table.columns.nauticalInformationsProduced' }
        ]
      };
      this.selectedState = 'RECEIVED';
    } else if (this.authService.isPublicUser()) {
      this.tabs = [{
        code: 'DRAFT',
        translateKey: 'info-management.tabs.drafts'
      }, {
        code: 'SENT',
        translateKey: 'info-management.tabs.sent'
      }
      ];
      this.columns = {
        DRAFT: [
          { field: 'nature', translateKey: 'info-table.columns.nature', sortable: true },
          { field: 'description', translateKey: 'info-table.columns.description' },
          { field: 'lastUpdate', translateKey: 'info-table.columns.lastUpdate', sortable: true },
          { field: 'expectedDeletionDate', translateKey: 'info-table.columns.expectedDeletionDate' }
        ],
        SENT: [
          { field: 'status', translateKey: 'info-table.columns.status', sortable: true },
          { field: 'number', translateKey: 'info-table.columns.number', sortable: true },
          { field: 'nature', translateKey: 'info-table.columns.nature', sortable: true },
          { field: 'description', translateKey: 'info-table.columns.description' },
          { field: 'validationTime', translateKey: 'info-table.columns.validationTime', sortable: true },
          { field: 'recipients', translateKey: 'info-table.columns.recipients' },
          { field: 'nauticalInformationsProduced', translateKey: 'info-table.columns.nauticalInformationsProduced' }
        ]
      };
    }
    this.tabsClass = this.tabs.length === 2 ? 'two-tabs' : 'three-tabs';

    this.displayDeviceOrientationModeDisclaimer = checkIfDeviceIsMobile(this.deviceDetectorService) && this.disclaimerService.showDisplayDeviceOrientationModeDisclaimer();

    const infosourceId = this.route.snapshot.paramMap.get('infosourceId');
    if (infosourceId) {
      this.displayInfosourceModal([{ id: infosourceId }]);
    }
  }

  private getServices(): string[] {
    return this.authService.getAuthenticatedUser()?.serviceRoles?.map(serviceRole => serviceRole.serviceId);
  }

  protected loadResources() {
    if (this.authService.isPublicUser()) {
      this.loadTableInfosources();
      return;
    }

    this.subscriptions.push(
      this.maritimeServicesApi.findByServiceIds(this.getServices())
        .pipe(tap(services => this.receiveServices(services)))
        .pipe(switchMap(() => this.getTags$(this.serviceSelected.id).pipe(tap(tags => this.tags = tags))))
        .pipe(switchMap(() => this.getRecipients$(this.serviceSelected.id)))
        .subscribe(
          (recipients: MaritimeServiceInfosourceRecipient[]) => this.recipients = recipients,
          (err: Error) => this.handleErrorLoadingServices(err)
        )
    );
  }

  protected handleErrorLoadingServices(err: Error): void {
    this.handleErrorLoading(err, 'cannot-get-services');
  }

  protected handleErrorLoadingTags(err: Error): void {
    this.handleErrorLoading(err, 'cannot-get-tags');
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
    this.services = services;
    if (services?.length) {
      this.serviceSelected = this.services.find(service => service.id === this.authService.getAuthenticatedUser()?.serviceId);
      this.filterState.setValues({
        service: this.serviceSelected
      });
    }
  }

  private getRecipients$(issuingServiceId: string): Observable<MaritimeServiceInfosourceRecipient[]> {
    return this.infosourceService.getRecipientsFromSentInfosources$(issuingServiceId, InfosourceState[this.selectedState]);
  }

  private getTags$(issuingServiceId: string): Observable<string[]> {
    return this.infosourceService.getTagsFromInfosources$(issuingServiceId, InfosourceState[this.selectedState]);
  }

  selectedStateChanged() {
    // Reinit sort when user change tab and reinit recipients filter
    if (this.authService.isProUser()) {
      this.getTags$(this.serviceSelected?.id).subscribe(
        (tags: string[]) => this.tags = tags,
        (err: Error) => this.handleErrorLoadingTags(err)
      );

      if (this.selectedState !== InfosourceState.DRAFT) {
        this.getRecipients$(this.serviceSelected?.id).subscribe(
          (recipients: MaritimeServiceInfosourceRecipient[]) => this.recipients = recipients,
          (err: Error) => this.handleErrorLoadingServices(err)
        );
      }
    }
    this.refreshMaritimeEntities = true;
    this.resetFilterWithRequiredValues();
    this.tableState.setPageInfo({ page: 0 });
    this.infosourceTable.reset();
    this.resetSort();
    this.tableState.resetSortInfo();
    this.loadTableInfosources(true);
  }

  truncateDescription(description: string): string {
    if (!description) { return ''; }
    return description.length >= environment.infosourceTruncatedDescriptionLength ?
      `${description.substring(0, environment.infosourceTruncatedDescriptionLength)}...` : description;
  }

  private resetFilterWithRequiredValues(): void {
    const requiredFilterValues: InfosourceTableFilterValues = {
      state: InfosourceState[this.selectedState]
    };
    if (this.authService.hasRoleServiceUser() && this.serviceSelected) {
      requiredFilterValues.service = this.serviceSelected;
    }
    this.filterState.setValues(requiredFilterValues);
  }

  private resetSort(): void {
    switch (InfosourceState[this.selectedState]) {
      case InfosourceState.DRAFT:
        this.infosourceTable.resetSort('lastUpdate', DESC);
        break;
      case InfosourceState.RECEIVED:
      case InfosourceState.SENT:
      default:
        this.infosourceTable.resetSort('validationTime', DESC);
        break;
    }
  }

  filterChange(filterValues: InfosourceTableFilterValues): void {
    this.infosources = [];
    this.tableState.setPageInfo({ page: 0 });
    if (this.serviceSelected?.id !== filterValues.service?.id) {
      this.updateAvailableRecipientsFromSelectedService(filterValues);
      this.updateAvailableTagsFromSelectedService(filterValues);
      return;
    }
    this.loadTableInfosources(this.refreshMaritimeEntities);
  }

  private updateAvailableRecipientsFromSelectedService(filterValues: InfosourceTableFilterValues): void {
    this.serviceSelected = filterValues.service;
    this.getRecipients$(filterValues.service?.id)
      .pipe(
        tap((recipients: MaritimeServiceInfosourceRecipient[]) => this.recipients = recipients)
      )
      .subscribe(
        () => this.loadTableInfosources(true),
        (err: Error) => this.handleErrorLoadingServices(err)
      );
  }

  private updateAvailableTagsFromSelectedService(filterValues: InfosourceTableFilterValues): void {
    this.serviceSelected = filterValues.service;
    this.getTags$(filterValues.service?.id)
      .pipe(
        tap((tags: string[]) => this.tags = tags)
      )
      .subscribe(
        () => this.loadTableInfosources(true),
        (err: Error) => this.handleErrorLoadingServices(err)
      );
  }

  pageChange(pageInfo: PageInfo) {
    this.infosources = [];
    this.tableState.setPageInfo({ ...pageInfo });
    this.loadTableInfosources();
  }

  sortChange(sortInfo: SortInfo) {
    this.infosources = [];
    this.tableState.setSortInfo({ ...sortInfo });
    this.loadTableInfosources();
  }

  private loadTableInfosources(refreshAvailableMaritimeEntities = false): void {
    const uuidParams = Object.values({
      page: '' + this.tableState.getValues()['pageInfo'].page,
      size: '' + this.tableState.getValues()['pageInfo'].rows,
      ...InfosourceService.convertFilterToRequestParams(this.selectedState, this.translate.currentLang, this.filterState.getValues()),
      ...(this.tableState.getValues()['sortInfo'] && this.tableState.getValues()['sortInfo'].field && { sort: InfosourceService.convertSortInfoToString(this.tableState.getValues()['sortInfo']) })
    }).join('');

    if (this.uuidParamsQueue.has(uuidParams)) { return; }

    this.uuidParamsQueue.add(uuidParams);

    this.refreshMaritimeEntities = !this.refreshMaritimeEntities;
    // Load infosources only if a service is selected
    if (this.authService.hasRoleServiceUser() && !this.filterState.getValues().service) {
      this.tableLoading = false;
      this.cdRef.detectChanges();
      return;
    }
    this.tableLoading = true;

    this.infosourceService.loadFilteredPage$(
      this.tableState.getValues(),
      this.selectedState,
      this.translate.currentLang,
      this.filterState.getValues()
    ).pipe(
      this.scavenger.collect(),
      tap(infosourcePage => {
        if (!infosourcePage?.modelItems?.length) {
          this.alertMessages.add({
            severity: 'warn',
            summary: 'message.summary.warn',
            detail: 'message.warn.filter.no-infosource-found'
          });
        } else if (refreshAvailableMaritimeEntities) {
          this.maritimeEntities = infosourcePage?.modelItems.reduce((acc, curr) => {
            acc.push(curr.concernedMaritimeEntities);
            return acc;
          }, []).flat().filter(item => !!item);
          this.maritimeEntities = uniq(this.maritimeEntities, 'id');
        }
      })
    ).subscribe(infosourcePage => {
      this.infosources = infosourcePage.modelItems;
      this.totalInfosSources = infosourcePage.totalElements;
      this.tableLoading = false;
      this.uuidParamsQueue.has(uuidParams) && this.uuidParamsQueue.delete(uuidParams);
    }, () => {
      this.infosources = [];
      this.tableLoading = false;
      this.alertMessages.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.filter.cannot-get-infosources'
      });
      this.uuidParamsQueue.has(uuidParams) && this.uuidParamsQueue.delete(uuidParams);
    });
  }

  /**
   * Generate chips in filter banner
   * @param filterValues
   * @returns
   */
  generateFilterChipsText(filterValues: InfosourceTableFilterValues): ChipValue[] {
    const chips: ChipValue[] = [];

    if (filterValues.rejected) {
      chips.push({
        key: 'rejected',
        translateKey: 'filter.filter-bar.chip.rejected-infosources',
        translateParams: {
          choice: this.translate.instant(
            'filter.filter-bar.choice.' + (filterValues.rejected ? 'yes' : 'no')
          )
        }
      });
    }

    if (filterValues.archived) {
      chips.push({
        key: 'archived',
        translateKey: 'filter.filter-bar.chip.archived-infosources',
        translateParams: {
          choice: this.translate.instant(
            'filter.filter-bar.choice.' + (filterValues.archived ? 'yes' : 'no')
          )
        }
      });
    }

    if (filterValues.natures?.length) {
      chips.push({
        key: 'natures',
        translateKey: 'filter.filter-bar.chip.natures',
        translateKeyOne: 'filter.filter-bar.chip.nature',
        translateParams: { count: filterValues.natures.length }
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

    if (filterValues.tags?.length) {
      chips.push({
        key: 'tags',
        translateKey: 'filter.filter-bar.chip.tags',
        translateKeyOne: 'filter.filter-bar.chip.tag',
        translateParams: { count: filterValues.tags.length }
      });
    }

    if (filterValues.lastUpdatePeriod?.startDate || filterValues?.lastUpdatePeriod?.endDate) {
      chips.push(this.transformDatePeriodeToChip(filterValues.lastUpdatePeriod, 'lastUpdatePeriod'));
    }

    if (filterValues.number) {
      chips.push({
        key: 'number',
        translateKey: 'filter.filter-bar.chip.infosource-number',
        translateParams: { number: filterValues.number }
      });
    }

    if (filterValues.sendingPeriod?.startDate || filterValues?.sendingPeriod?.endDate) {
      chips.push(this.transformDatePeriodeToChip(filterValues.sendingPeriod, 'sendingPeriod'));
    }

    if (filterValues.sendingYear) {
      chips.push({
        key: 'sendingYear',
        translateKey: 'filter.filter-bar.chip.sending-year',
        translateParams: { year: filterValues.sendingYear }
      });
    }

    if (filterValues.recipientIds?.length) {
      chips.push({
        key: 'recipientIds',
        translateKey: 'filter.filter-bar.chip.recipients',
        translateKeyOne: 'filter.filter-bar.chip.recipient',
        translateParams: { count: filterValues.recipientIds.length }
      });
    }

    if (filterValues.affairNumber) {
      chips.push({
        key: 'affairNumber',
        translateKey: 'filter.filter-bar.chip.affair-number',
        translateParams: { number: filterValues.affairNumber }
      });
    }

    if (filterValues.serviceStatuses?.length) {
      chips.push({
        key: 'serviceStatuses',
        translateKey: 'filter.filter-bar.chip.service-statuses',
        translateKeyOne: 'filter.filter-bar.chip.service-status',
        translateParams: { count: filterValues.serviceStatuses.length }
      });
    }

    return chips;
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

  getI18nValueFromNature(translationKey: string): string {
    return getI18nValue(TRANSLATIONS_LIST_INFOSOURCE_NATURE, translationKey);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  displayInfosourceModal(infosources?: Partial<Infosource>[]) {
    this.selectedInfosources = infosources;
    this.showModal = true;
  }

  onStatusChangeAction(): void {
    this.showModal = false;
    this.loadTableInfosources();
  }

  closeModal(): void {
    this.showModal = false;
    this.loadTableInfosources();
  }

  onCloseDeviceOrientationModeDisclaimer(neverShowAgain: boolean): void {
    this.displayDeviceOrientationModeDisclaimer = false;
    if (neverShowAgain) {
      this.disclaimerService.neverShowAgainDisplayDeviceOrientationModeDisclaimer();
    }
  }

  onChangeLang(): void {
    this.loadTableInfosources();
  }

  stopEventPropagation(event: any): void {
    if (event?.originalEvent) {
      event.originalEvent.stopPropagation();
    }
  }
}
