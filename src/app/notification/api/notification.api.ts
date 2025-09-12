import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { PingNotification } from '../models/notification.model';

export abstract class AbstractNotificationApi {

  protected readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(protected readonly httpClient: HttpClient) { }

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

  abstract getNotifications$(): Observable<PingNotification[]>;

  abstract updateReadStatus$(notificationIds: string[], readStatus: boolean): Observable<void>;

  abstract delete$(notificationIds: string[]): Observable<void>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationApi extends AbstractNotificationApi {

  private readonly apiFindAllNotifications = environment.baseSecuredApiUrl + environment.securedApi.notifications.findAll;
  private readonly apiUpdateReadStatus = environment.baseSecuredApiUrl + environment.securedApi.notifications.updateReadStatus;
  private readonly apiDelete = environment.baseSecuredApiUrl + environment.securedApi.notifications.delete;

  constructor(protected readonly httpClient: HttpClient) {
    super(httpClient);
  }

  getNotifications$(): Observable<PingNotification[]> {
    return this.httpClient.get<PingNotification[]>(this.apiFindAllNotifications);
  }

  updateReadStatus$(notificationIds: string[], readStatus: boolean): Observable<void> {
    return this.httpClient.post<void>(`${this.apiUpdateReadStatus}?readStatus=${readStatus}`, notificationIds, this.httpOptions);
  }

  delete$(notificationIds: string[]): Observable<void> {
    return this.httpClient.post<void>(this.apiDelete, notificationIds);
  }
}
