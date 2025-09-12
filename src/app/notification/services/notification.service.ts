import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { Observable } from 'rxjs/internal/Observable';
import { NotificationApi } from '../api/notification.api';
import { PingNotification } from '../models/notification.model';

export abstract class AbstractNotificationService {
  constructor(protected readonly authService: AuthService) { }

  abstract updateReadStatus$(notificationIds: string[], readStatus: boolean): Observable<void>;

  abstract getNotifications$(): Observable<PingNotification[]>;

  abstract delete$(notificationIds: string[]): Observable<void>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends AbstractNotificationService {
  constructor(protected readonly authService: AuthService,
    private readonly notificationApi: NotificationApi) {
    super(authService);
  }

  getNotifications$(): Observable<PingNotification[]> {
    return this.notificationApi.getNotifications$();
  }

  updateReadStatus$(notificationIds: string[], readStatus: boolean): Observable<void> {
    return this.notificationApi.updateReadStatus$(notificationIds, readStatus);
  }

  delete$(notificationIds: string[]): Observable<void> {
    return this.notificationApi.delete$(notificationIds);
  }
}
