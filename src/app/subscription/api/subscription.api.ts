import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreationSubscriptionDto } from '@app/subscription/models/subscription-creation.model';
import { TableSubscription } from '@app/subscription/models/subscription-table.model';
import { Subscription, SubscriptionTypeEnum } from '@app/subscription/models/subscription.model';
import { environment } from '@env/environment';
import { PaginatedModelItemTableViewDtos } from '@shared/models/paginated-table-view.model';
import { Observable, throwError } from 'rxjs';

export type SubscriptionsTableApiParams = {
  type: SubscriptionTypeEnum;
  page?: string;
  size?: string;
  sort?: string;
};

export abstract class AbstractSubscriptionApi {

  constructor(protected readonly httpClient: HttpClient) { }

  public abstract getTableView$(params: SubscriptionsTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableSubscription>>;

  public abstract createWarningSubscription$(subscription: CreationSubscriptionDto): Observable<string>;

  public abstract getSubscriptionById$(id: string): Observable<Subscription>;

  public abstract delete$(id: string): Observable<void>;

  /**
   * Handler return ErrorObservable with user-friendly error message
   * @param error server or client side errors captured by HttpClient in HttpErrorResponse
   * @private
   */
  protected handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      // A client-side or network error occurred
      return throwError({ unknown: 'message.network-error' });
    }

    // return unhandled error
    return throwError({ unhandled: 'message.unhandled-error' });
  }
}


@Injectable({
  providedIn: 'root'
})
export class SubscriptionApi extends AbstractSubscriptionApi {

  private readonly apiTableUrl = environment.baseSecuredApiUrl + environment.adminApi.subscriptions.tableView;
  private readonly apiCreateWarningUrl = environment.baseSecuredApiUrl + environment.adminApi.subscriptions.createWarning;
  private readonly apiGetSubscriptionById = environment.baseSecuredApiUrl + environment.adminApi.subscriptions.getDetailsById;
  private readonly apiDelete = environment.baseSecuredApiUrl + environment.adminApi.subscriptions.delete;

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

  getSubscriptionById$(id: string): Observable<Subscription> {
    return this.httpClient.get<Subscription>(this.apiGetSubscriptionById.replace('{{id}}', id));
  }

  delete$(id: string): Observable<void> {
    return this.httpClient.delete<void>(this.apiDelete.replace('{{id}}', id));
  }

}
