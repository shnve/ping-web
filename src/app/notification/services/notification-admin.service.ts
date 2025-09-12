import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { Observable } from 'rxjs';
import { NotificationAdminApi } from '../api/notification-admin.api';
import { PingNotification } from '../models/notification.model';
import { AbstractNotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationAdminService extends AbstractNotificationService {
  constructor(protected readonly authService: AuthService,
    private readonly notificationAdminApi: NotificationAdminApi) {
    super(authService);
  }

  updateReadStatus$(notificationIds: string[], readStatus: boolean): Observable<void> {
    return this.notificationAdminApi.updateReadStatus$(notificationIds, readStatus);
  }

  getNotifications$(): Observable<PingNotification[]> {
    return this.notificationAdminApi.getNotifications$();
  }

  delete$(notificationIds: string[]): Observable<void> {
    return this.notificationAdminApi.delete$(notificationIds);
  }
}
