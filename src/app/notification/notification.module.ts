import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormatNotificationTitlePipe } from './pipes/format-notification-title.pipe';
import { notificationServiceProvider } from './providers/notification.service.provider';


@NgModule({
  declarations: [
    FormatNotificationTitlePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FormatNotificationTitlePipe
  ],
  providers: [
    notificationServiceProvider
  ]
})
export class NotificationModule { }
