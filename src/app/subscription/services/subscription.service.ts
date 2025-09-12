import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { TableStateValue } from '@app/states/table.state';
import { SubscriptionApi, SubscriptionsTableApiParams } from '@app/subscription/api/subscription.api';
import { CreationSubscriptionDto } from '@app/subscription/models/subscription-creation.model';
import { SubscriptionTableFilterValues } from '@app/subscription/models/subscription-filters.model';
import { TableSubscription } from '@app/subscription/models/subscription-table.model';
import { Subscription, SubscriptionTypeEnum } from '@app/subscription/models/subscription.model';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos, SortInfo } from '@shared/models/paginated-table-view.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export abstract class AbstractSubscriptionService {

  constructor(protected readonly authService: AuthService) { }

  public abstract loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, type: SubscriptionTypeEnum, filterValues: SubscriptionTableFilterValues)
    : Observable<ModelItemTablePage<TableSubscription>>;

  public abstract createWarningSubscription$(subscription: CreationSubscriptionDto): Observable<string>;

  public abstract createGeoregulationSubscription$(subscription: CreationSubscriptionDto): Observable<string>;

  public abstract getSubscriptionById$(id: string): Observable<Subscription>;

  public abstract delete$(id: string): Observable<void>;

  static convertSortInfoToString(sortInfo: SortInfo): string {
    if (!sortInfo) {
      return '';
    }
    const order = sortInfo.order === 1 ? 'asc' : 'desc';
    return `${sortInfo.field},${order}`;
  }

  static convertFilterToRequestParams(type: SubscriptionTypeEnum): SubscriptionsTableApiParams {
    return { type };
  }
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends AbstractSubscriptionService {

  private readonly errorMessageNotImplemented = 'Should not be called by public user';

  constructor(protected readonly authService: AuthService,
    private readonly subscriptionApi: SubscriptionApi) {
    super(authService);
  }

  loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, type: SubscriptionTypeEnum, filterValues: SubscriptionTableFilterValues)
    : Observable<ModelItemTablePage<TableSubscription>> {
    return this.subscriptionApi.getTableView$(
      {
        page: '' + pageInfo.page,
        size: '' + pageInfo.rows,
        ...SubscriptionService.convertFilterToRequestParams(type),
        ...(sortInfo && sortInfo.field && { sort: SubscriptionService.convertSortInfoToString(sortInfo) })
      }
    ).pipe(
      map<PaginatedModelItemTableViewDtos<TableSubscription>, ModelItemTablePage<TableSubscription>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  createWarningSubscription$(subscription: CreationSubscriptionDto): Observable<string> {
    return this.subscriptionApi.createWarningSubscription$(subscription);
  }

  createGeoregulationSubscription$(subscription: CreationSubscriptionDto): Observable<string> {
    throw new Error(this.errorMessageNotImplemented);
  }

  getSubscriptionById$(id: string): Observable<Subscription> {
    return this.subscriptionApi.getSubscriptionById$(id);
  }

  delete$(id: string): Observable<void> {
    return this.subscriptionApi.delete$(id);
  }
}
