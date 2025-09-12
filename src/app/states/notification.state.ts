import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationState {
  public readonly notificationObjectId$ = new Subject<string>();
  public readonly notificationObjectDeleted$ = new Subject<void>();

  setNotificationObjectId$(id: string): void {
    this.notificationObjectId$.next(id);
  }

  getNotificationObjectId$(): Observable<string> {
    return this.notificationObjectId$.asObservable();
  }

  setNotificationObjectDeleted$(): void {
    this.notificationObjectDeleted$.next();
  }

  getNotificationObjectDeleted$(): Observable<void> {
    return this.notificationObjectDeleted$.asObservable();
  }
}
