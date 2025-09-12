import { Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { ServiceRole } from '@app/models/pro-user.model';
import { NotificationType, PingNotification } from '@app/notification/models/notification.model';
import { NotificationAdminService } from '@app/notification/services/notification-admin.service';
import { EventSourceService } from '@app/shared/services/eventsource.service';
import { NotificationState } from '@app/states/notification.state';
import { ProfileMode } from '@app/types/profile';
import { TranslateService } from '@ngx-translate/core';
import { showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { ConfirmationService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../auth/auth.service';
import { AuthenticatedUser } from '../../../models/public-user.model';
import { AbstractNotificationService, NotificationService } from '../../../notification/services/notification.service';
import { isEmpty } from 'lodash-es';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {
  protected scavenger = new Scavenger(this);
  protected readonly isEmpty = isEmpty;


  @ViewChild('loginPanel') loginPanel: OverlayPanel;
  @ViewChild('notificationsBell') notificationsBell: ElementRef;
  @ViewChild('notificationsPanel') notificationsPanel: OverlayPanel;

  private readonly sseEndpointSecuredApi = environment.baseApiUrl + environment.api.events.securedApi;
  private readonly sseEndpointAdminApi = environment.baseApiUrl + environment.api.events.adminApi;

  private readonly subscriptions: Subscription[] = [];

  notifications: PingNotification[] = [];
  selectedNotifications: PingNotification[] = [];
  protected areAllSelectionRead = false;
  numberUnreadNotifications = 0;
  notificationSound: HTMLAudioElement;
  canManageFolder = false;
  readonly regexNotificationType = /_/g;
  protected isServiceUser = false;

  constructor(private readonly router: Router,
    private readonly authService: AuthService,
    private readonly eventSourceService: EventSourceService,
    private readonly notificationService: NotificationService,
    private readonly notificationAdminService: NotificationAdminService,
    private readonly translateService: TranslateService,
    private readonly alertMessageService: AlertMessageService,
    private readonly notificationState: NotificationState,
    private readonly confirmationService: ConfirmationService,
    private readonly maritimeServiceApi: MaritimeServicesApi) {
    this.subscribeToSubscriptionsNotifications();
    this.loadNotificationSound();
  }

  ngOnInit() {
    this.isServiceUser = this.authService.hasRoleServiceUser();
  }

  private getNotificationService(): AbstractNotificationService {
    if (this.authService.isPublicUser()) {
      return this.notificationService;
    }
    return this.notificationAdminService;
  }

  get canShowNotificationPanel(): boolean {
    return this.authService.isPublicUser() || this.authService.hasRoleServiceUser();
  }

  public subscribeToSubscriptionsNotifications(): void {
    if (!this.canShowNotificationPanel) {
      return;
    }

    this.subscriptions.push(
      this.authService.getConnected$()
        .pipe(
          filter(() => this.authService.isConnected),
          tap(() => this.getNotifications()),
          tap(() => this.checkIfCanManageFolder())
        )
        .subscribe(() => this.initNotificationsSubscription())
    );

    this.subscriptions.push(this.notificationState.getNotificationObjectDeleted$().subscribe(() => this.getNotifications()));
  }

  private initNotificationsSubscription(): void {
    const sseEndPoint = this.authService.isPublicUser() ? this.sseEndpointSecuredApi : this.sseEndpointAdminApi;
    this.subscriptions.push(
      this.eventSourceService.newObservable(sseEndPoint.replace('{{userId}}', this.user.id))
        .pipe(filter(event => event !== null))
        .subscribe(event => {
          const notificationSse = JSON.parse(event as string) as PingNotification;
          this.notifications.unshift(notificationSse);
          this.numberUnreadNotifications++;
          if (this.authService.getAuthenticatedUser().hasNotificationsSound) {
            this.notificationSound.play();
          }
        })
    );
  }

  private getNotifications(): void {
    if (!this.canShowNotificationPanel) {
      return;
    }

    this.subscriptions.push(
      this.getNotificationService().getNotifications$()
        .subscribe(notifications => {
          this.notifications = notifications;
          this.numberUnreadNotifications = notifications.filter(notification => !notification.read).length;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  get user(): AuthenticatedUser {
    return this.authService.getAuthenticatedUser();
  }

  get loggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  goToAccountCreation(): void {
    this.loginPanel.hide();
    this.router.navigate(['/account-creation']);
  }

  goToPublicLoginPage(): void {
    this.loginPanel.hide();
    this.authService.redirectToLoginPage(ProfileMode.PUBLIC);
  }

  goToProLoginPage(): void {
    this.loginPanel.hide();
    this.authService.redirectToLoginPage(ProfileMode.PRO);
  }

  logout(): void {
    this.loginPanel.hide();
    this.authService.logout();
  }

  get isConnected(): boolean {
    return this.authService.isConnected;
  }

  redirectToEdit(): void {
    const serviceUserId = this.authService.getAuthenticatedUser().id;
    if (this.authService.isPublicUser()) {
      this.router.navigate([`account-edition/${serviceUserId}`]);
    } else {
      this.router.navigate([`/administration/utilisateur-pro/${serviceUserId}/edition`]);
    }
    this.loginPanel.hide();
  }

  getNotificationIcon(notificationType: NotificationType): string {
    switch (notificationType) {
      case NotificationType.WARNING_SUBSCRIPTION_CREATION:
      case NotificationType.GEOREGULATION_SUBSCRIPTION_CREATION:
        return 'pi-bell';
      case NotificationType.FOLDER:
        return 'pi-folder';
      case NotificationType.WARNING_PUBLICATION:
      case NotificationType.SURVEY_EXTERNAL_ANALYSIS_END_WITH_CRITICAL_PROBES:
        return 'pi-exclamation-triangle';
      case NotificationType.GEOREGULATION_PUBLISHED:
        return 'pi-send';
      case NotificationType.GEOREGULATION_UPDATED:
        return 'pi-pencil';
      case NotificationType.GEOREGULATION_REPEALED:
        return 'pi-ban';
      case NotificationType.INFOSOURCE_RECEIVED:
        return 'pi-inbox';
      case NotificationType.SURVEY_ANALYSIS_IN_PROGRESS:
        return 'pi-chevron-circle-right';
      case NotificationType.SURVEY_ANALYSIS_FAILURE:
      case NotificationType.SURVEY_EXTERNAL_ANALYSIS_END_WITH_FAILURE:
        return 'pi-times-circle';
      case NotificationType.SURVEY_ANALYSIS_SUCCESS:
      case NotificationType.SURVEY_EXTERNAL_ANALYSIS_END_WITHOUT_CRITICAL_PROBE:
        return 'pi-check-circle';
      default:
        return '';
    }
  }

  private showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }

  toggleReadStatus(event: any, notification: PingNotification = null): void {
    event.originalEvent.stopPropagation();
    const readStatus = event.checked;
    const notificationsToUpdate = notification
      ? [notification]
      : this.selectedNotifications.filter(selectedNotification => selectedNotification.read !== readStatus) ?? [];
    this.updateReadStatus(readStatus, notificationsToUpdate);
  }

  private updateReadStatus(readStatus: boolean, notifications: PingNotification[]): void {
    const notificationIds: string[] = notifications.map(notification => notification.id);
    this.subscriptions.push(
      this.getNotificationService().updateReadStatus$(notificationIds, readStatus)
        .subscribe(
          () => {
            notifications.forEach(notification => notification.read = readStatus);

            if (readStatus) {
              this.numberUnreadNotifications -= notifications.length;
            } else {
              this.numberUnreadNotifications += notifications.length;
            }
            this.selectedNotifications = [];
            this.areAllSelectionRead = false;
          },
          () => this.showToast(this.translateService.instant('notification.action-read.error'), 'error'))
    );
  }

  checkIfCanManageFolder(): void {
    if (!this.authService.hasRoleServiceUser()) {
      return;
    }

    const maritimeServiceIds = this.authService.getAuthenticatedUser()?.serviceRoles ? [
      ...this.authService.getAuthenticatedUser().serviceRoles
        .map(serviceRole => serviceRole.serviceId)
        .filter(serviceId => this.authService.hasAnyRoleOnService([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR], serviceId))
    ] : [];

    if (maritimeServiceIds.length) {
      this.maritimeServiceApi.findByServiceIds(maritimeServiceIds)
        .pipe(this.scavenger.collect())
        .subscribe(services =>
          this.canManageFolder = services.some(service => service.folderManager)
        );
    }
  }

  onClickNotification(notification: PingNotification): void {
    let route: string;
    let objectId: string;
    switch (notification.type) {
      case NotificationType.WARNING_SUBSCRIPTION_CREATION:
        route = 'subscription/warning';
        objectId = notification.subscriptionId;
        break;
      case NotificationType.GEOREGULATION_SUBSCRIPTION_CREATION:
        route = 'subscription/georegulation';
        objectId = notification.subscriptionId;
        break;
      case NotificationType.FOLDER:
      case NotificationType.LIGHTHOUSE_AND_BEACON_FOLDER_TO_REVIEW:
        route = `folder/${this.canManageFolder ? 'tables' : 'followed'}`;
        objectId = notification.folderId;
        break;
      case NotificationType.WARNING_PUBLICATION:
      case NotificationType.LIGHTHOUSE_AND_BEACON_PREVIOUS_NOTICE_NUMBER:
        route = 'avurnav-notice';
        objectId = notification.warningId;
        break;
      case NotificationType.GEOREGULATION_PUBLISHED:
      case NotificationType.GEOREGULATION_UPDATED:
      case NotificationType.GEOREGULATION_REPEALED:
        route = 'georegulation-visu';
        objectId = notification.georegulationId;
        break;
      case NotificationType.INFOSOURCE_RECEIVED:
        route = 'infosource/tables';
        objectId = notification.infosourceId;
        break;
      case NotificationType.SURVEY_ANALYSIS_IN_PROGRESS:
      case NotificationType.SURVEY_ANALYSIS_SUCCESS:
      case NotificationType.SURVEY_ANALYSIS_FAILURE:
      case NotificationType.SURVEY_EXTERNAL_ANALYSIS_END_WITH_CRITICAL_PROBES:
      case NotificationType.SURVEY_EXTERNAL_ANALYSIS_END_WITHOUT_CRITICAL_PROBE:
      case NotificationType.SURVEY_EXTERNAL_ANALYSIS_END_WITH_FAILURE:
        route = 'survey/tables';
        objectId = notification.surveyId;
        break;
      default:
        return;
    }
    this.navigateAndUpdateReadStatus(route, objectId, notification);
  }

  navigateAndUpdateReadStatus(route: string, objectId: string, notification: PingNotification) {
    this.router.navigate([route])
      .then(() => {
        this.notificationState.setNotificationObjectId$(objectId);
        this.notificationsPanel.hide();
        if (!notification.read) {
          this.updateReadStatus(true, [notification]);
        }
      });
  }

  loadNotificationSound() {
    this.notificationSound = new Audio();
    this.notificationSound.src = 'assets/sounds/notification-sound.wav';
    this.notificationSound.load();
  }

  confirmDelete(event: Event, notification: PingNotification = null): void {
    event.stopPropagation();
    const message = this.translateService.instant('notification.delete' + (notification ? '' : '-all') + '.delete-confirm');
    this.confirmationService.confirm({
      target: event.target,
      message,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.showNotificationsPanelOnCloseConfirmPopup(true, notification);
      },
      reject: () => {
        this.showNotificationsPanelOnCloseConfirmPopup(false);
      }
    });
  }

  showNotificationsPanelOnCloseConfirmPopup(deleteNotification: boolean, notification?: PingNotification): void {
    const observer = new MutationObserver(() => {
      setTimeout(() => this.notificationsPanel.show(new MouseEvent('click'), this.notificationsBell.nativeElement));
      observer.disconnect();
      if (deleteNotification && (!!notification || this.selectedNotifications.length)) {
        const notificationsToDelete = this.selectedNotifications.map(selectedNotification => selectedNotification.id)
        this.delete(!!notification ? [notification.id]: notificationsToDelete);
      }
    });
    observer.observe(document.body, { subtree: false, childList: true });
  }

  delete(notificationIds: string[]): void {
    const message = this.translateService.instant(`notification.delete${notificationIds.length === 1 ? '' : '-all'}.delete`);
    this.subscriptions.push(
      this.getNotificationService().delete$(notificationIds)
        .subscribe(
          () => {
            this.showToast(`${message}-success`, 'success');
            this.getNotifications();
            this.selectedNotifications = [];
            this.areAllSelectionRead = false;
          },
          () => {
            this.showToast(`${message}-error`, 'error');
          })
    );
  }

  notificationComesFromSubscription(notification: PingNotification): boolean {
    return notification.subscriptionId &&
      ![NotificationType.WARNING_SUBSCRIPTION_CREATION, NotificationType.GEOREGULATION_SUBSCRIPTION_CREATION].includes(notification.type);
  }

  navigateToSubscription(event: Event, notification: PingNotification): void {
    event.stopPropagation();
    const route = 'subscription/' + (notification.warningId ? 'warning' : 'georegulation');
    this.router.navigate([route])
      .then(() => {
        this.notificationState.setNotificationObjectId$(notification.subscriptionId);
        this.notificationsPanel.hide();
      });
  }

  protected onNotificationSelect(): void {
    this.areAllSelectionRead = this.selectedNotifications.length && !this.selectedNotifications.some(notification => !notification.read);
  }
}
