import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractSubscriptionApi, SubscriptionsTableApiParams } from '@app/subscription/api/subscription.api';
import { CreationSubscriptionDto } from '@app/subscription/models/subscription-creation.model';
import { TableSubscription } from '@app/subscription/models/subscription-table.model';
import { Subscription } from '@app/subscription/models/subscription.model';
import { environment } from '@env/environment';
import { PaginatedModelItemTableViewDtos } from '@shared/models/paginated-table-view.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionAdminApi extends AbstractSubscriptionApi {

  private readonly apiTableUrl = environment.baseAdminApiUrl + environment.adminApi.subscriptions.tableView;
  private readonly apiCreateWarningUrl = environment.baseAdminApiUrl + environment.adminApi.subscriptions.createWarning;
  private readonly apiCreateGeoregulationUrl = environment.baseAdminApiUrl + environment.adminApi.subscriptions.createGeoregulation;
  private readonly apiGetSubscriptionById = environment.baseAdminApiUrl + environment.adminApi.subscriptions.getDetailsById;
  private readonly apiDelete = environment.baseAdminApiUrl + environment.adminApi.subscriptions.delete;

  readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  getTableView$(tableParams: SubscriptionsTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableSubscription>> {
    const params = new HttpParams({ fromObject: tableParams });
    return this.httpClient.get<PaginatedModelItemTableViewDtos<TableSubscription>>(this.apiTableUrl,
      { headers: this.httpOptions.headers, params });
  }

  createWarningSubscription$(subscription: CreationSubscriptionDto): Observable<string> {
    return this.httpClient.post<string>(this.apiCreateWarningUrl, subscription, this.httpOptions);
  }

  createGeoregulationSubscription$(subscription: CreationSubscriptionDto): Observable<string> {
    return this.httpClient.post<string>(this.apiCreateGeoregulationUrl, subscription, this.httpOptions);
  }

  getSubscriptionById$(id: string): Observable<Subscription> {
    return this.httpClient.get<Subscription>(this.apiGetSubscriptionById.replace('{{id}}', id));
  }

  delete$(id: string): Observable<void> {
    return this.httpClient.delete<void>(this.apiDelete.replace('{{id}}', id));
  }

}
