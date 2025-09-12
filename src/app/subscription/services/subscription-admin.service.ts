import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { TableStateValue } from '@app/states/table.state';
import { SubscriptionAdminApi } from '@app/subscription/api/subscription-admin.api';
import { CreationSubscriptionDto } from '@app/subscription/models/subscription-creation.model';
import { SubscriptionTableFilterValues } from '@app/subscription/models/subscription-filters.model';
import { TableSubscription } from '@app/subscription/models/subscription-table.model';
import { Subscription, SubscriptionTypeEnum } from '@app/subscription/models/subscription.model';
import { AbstractSubscriptionService } from '@app/subscription/services/subscription.service';
import { ModelItemTablePage, PaginatedModelItemTableViewDtos } from '@shared/models/paginated-table-view.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionAdminService extends AbstractSubscriptionService {

  constructor(protected readonly authService: AuthService,
    private readonly subscriptionAdminApi: SubscriptionAdminApi) {
    super(authService);
  }

  loadFilteredPage$({ pageInfo, sortInfo }: TableStateValue, type: SubscriptionTypeEnum, filterValues: SubscriptionTableFilterValues)
    : Observable<ModelItemTablePage<TableSubscription>> {
    return this.subscriptionAdminApi.getTableView$(
      {
        page: '' + pageInfo.page,
        size: '' + pageInfo.rows,
        ...SubscriptionAdminService.convertFilterToRequestParams(type),
        ...(sortInfo && sortInfo.field && { sort: SubscriptionAdminService.convertSortInfoToString(sortInfo) })
      }
    ).pipe(
      map<PaginatedModelItemTableViewDtos<TableSubscription>, ModelItemTablePage<TableSubscription>>(paginedTable => ({
        modelItems: paginedTable?._embedded?.items || [],
        totalElements: paginedTable.page.totalElements
      }))
    );
  }

  createWarningSubscription$(subscription: CreationSubscriptionDto): Observable<string> {
    return this.subscriptionAdminApi.createWarningSubscription$(subscription);
  }

  createGeoregulationSubscription$(subscription: CreationSubscriptionDto): Observable<string> {
    return this.subscriptionAdminApi.createGeoregulationSubscription$(subscription);
  }

  getSubscriptionById$(id: string): Observable<Subscription> {
    return this.subscriptionAdminApi.getSubscriptionById$(id);
  }

  delete$(id: string): Observable<void> {
    return this.subscriptionAdminApi.delete$(id);
  }
}
