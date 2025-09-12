import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { NotificationState } from '@app/states/notification.state';
import { TableState } from '@app/states/table.state';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { defaultValuesSubscriptionTableFilter, SubscriptionTableFilterValues } from '@app/subscription/models/subscription-filters.model';
import { TableSubscription } from '@app/subscription/models/subscription-table.model';
import { Subscription, SubscriptionTypeEnum } from '@app/subscription/models/subscription.model';
import { subscriptionServiceProvider } from '@app/subscription/providers/subscription.service.provider';
import { AbstractSubscriptionService } from '@app/subscription/services/subscription.service';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { PageInfo, SortInfo } from '@shared/models/paginated-table-view.model';
import { Scavenger } from '@wishtack/rx-scavenger';
import { Subscription as RxjsSubscription } from 'rxjs';


@Component({
  selector: 'subscription-tables',
  templateUrl: './subscription-tables.component.html',
  styleUrls: ['./subscription-tables.component.scss'],
  providers: [
    subscriptionServiceProvider,
    { provide: TableState }
  ]
})
export class SubscriptionTablesComponent implements OnDestroy, OnInit {

  private readonly scavenger = new Scavenger(this);

  @ViewChild('SubscriptionTable') subscriptionTable: PaginatedTableComponent<TableSubscription>;
  columns = {};
  subscriptions: TableSubscription[];
  selectedType = SubscriptionTypeEnum.WARNING;
  totalSubscriptions = 0;
  tableLoading = true;
  showModal = false;
  selectedSubscriptions: Partial<Subscription>[];
  private readonly subs: RxjsSubscription[] = [];
  public readonly filterState: ModelItemFilterState<SubscriptionTableFilterValues>;

  constructor(public readonly tableState: TableState,
    private readonly subscriptionService: AbstractSubscriptionService,
    private readonly alertMessages: AlertMessageService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationState: NotificationState
  ) {
    this.selectedType = this.router.url.includes('warning') ? SubscriptionTypeEnum.WARNING : SubscriptionTypeEnum.GEOREGULATION;

    this.filterState = new ModelItemFilterState<SubscriptionTableFilterValues>();
    this.filterState.initFilter(defaultValuesSubscriptionTableFilter);
    this.loadTableSubscriptions();
    this.subs.push(
      this.notificationState.getNotificationObjectId$().subscribe((subscriptionId: string) => {
        this.displaySubscriptionModal([{ id: subscriptionId }]);
      })
    );
  }

  ngOnInit(): void {
    this.columns = {
      WARNING: SubscriptionTablesComponent.getWarningColumns(this.authService.hasRoleServiceUser()),
      GEOREGULATION: [
        { field: 'maritimeServiceSubscriber', translateKey: 'subscription-table.columns.maritimeServiceSubscriber', sortable: true },
        { field: 'title', translateKey: 'subscription-table.columns.title', sortable: true },
        { field: 'creationDate', translateKey: 'subscription-table.columns.creation-date', sortable: true },
        { field: 'areaName', translateKey: 'subscription-table.columns.area-name' },
        { field: 'sendingMail', translateKey: 'subscription-table.columns.sending-mail' }
      ]
    };
  }

  private static getWarningColumns(isProUser: boolean): any[] {
    const warningColumns = [];
    if (isProUser) {
      warningColumns.push(
        { field: 'maritimeServiceSubscriber', translateKey: 'subscription-table.columns.maritimeServiceSubscriber', sortable: true }
      );
    }
    warningColumns.push(
      { field: 'title', translateKey: 'subscription-table.columns.title', sortable: true },
      { field: 'creationDate', translateKey: 'subscription-table.columns.creation-date', sortable: true },
      { field: 'areaName', translateKey: 'subscription-table.columns.area-name' },
      { field: 'sendingMail', translateKey: 'subscription-table.columns.sending-mail' }
    );
    return warningColumns;
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  pageChange(pageInfo: PageInfo): void {
    this.subscriptions = [];
    this.tableState.setPageInfo({ ...pageInfo });
    this.loadTableSubscriptions();
  }

  sortChange(sortInfo: SortInfo): void {
    this.subscriptions = [];
    this.tableState.setSortInfo({ ...sortInfo });
    this.loadTableSubscriptions();
  }

  loadTableSubscriptions(): void {
    this.tableLoading = true;
    this.subscriptionService.loadFilteredPage$(
      this.tableState.getValues(),
      this.selectedType,
      this.filterState.getValues()
    ).pipe(
      this.scavenger.collect()
    ).subscribe(subscriptionPage => {
      this.subscriptions = subscriptionPage.modelItems;
      this.totalSubscriptions = subscriptionPage.totalElements;
      this.tableLoading = false;
    }, () => {
      this.subscriptions = [];
      this.tableLoading = false;
      this.alertMessages.add({
        severity: 'error',
        summary: 'message.summary.error',
        detail: 'message.error.api.filter.cannot-get-subscriptions'
      });
    });
  }

  onStatusChangeAction(): void {
    this.showModal = false;
    this.loadTableSubscriptions();
  }

  displaySubscriptionModal(subscriptions?: Partial<Subscription>[]): void {
    this.selectedSubscriptions = subscriptions;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.loadTableSubscriptions();
  }
}
