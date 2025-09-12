import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { PingNotification } from '../models/notification.model';
import { AbstractNotificationApi } from './notification.api';

@Injectable({
  providedIn: 'root'
})
export class NotificationAdminApi extends AbstractNotificationApi {

  private readonly apiFindAllNotifications = environment.baseAdminApiUrl + environment.adminApi.notifications.findAll;
  private readonly apiUpdateReadStatus = environment.baseAdminApiUrl + environment.adminApi.notifications.updateReadStatus;
  private readonly apiDelete = environment.baseAdminApiUrl + environment.adminApi.notifications.delete;

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
