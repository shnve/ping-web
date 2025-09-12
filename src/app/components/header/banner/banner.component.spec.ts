import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import MaritimeService from '@app/models/maritime-service.model';
import { NotificationType, PingNotification } from '@app/notification/models/notification.model';
import { NotificationService } from '@app/notification/services/notification.service';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { MockComponent, MockProvider } from 'ng-mocks';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Observable, of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { LangDropdownComponent } from '../lang-dropdown/lang-dropdown.component';
import { BannerComponent } from './banner.component';

describe('BannerComponent', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let router: Router;
  let authService: AuthService;
  let publicNotificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        BannerComponent,
        MockComponent(LangDropdownComponent)
      ],
      imports: [RouterModule.forRoot([]),
      TranslateModule.forRoot(),
        ButtonModule,
        OverlayPanelModule],
      providers: [
        PermissionsProvider,
        ConfirmationService,
        MockProvider(MaritimeServicesApi, {
          findByServiceIds(ids: string[]): Observable<MaritimeService[]> {
            return of([{ id: '1', name: 'my-service', maritimeEntities: [] }]);
          }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerComponent);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    publicNotificationService = TestBed.inject(NotificationService);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go to account creation', () => {
    // Given
    const spyLoginPanelHide = spyOn(component.loginPanel, 'hide').and.stub();
    const spyRouterNavigate = spyOn(router, 'navigate');

    // When
    component.goToAccountCreation();

    // Expect
    expect(spyLoginPanelHide).toHaveBeenCalled();
    expect(spyRouterNavigate).toHaveBeenCalledWith(['/account-creation']);
  });

  it('should go to login page', () => {
    // Given
    const spyLoginPanelHide = spyOn(component.loginPanel, 'hide').and.stub();
    const spyAuthServiceRedirectToLoginPage = spyOn(authService, 'redirectToLoginPage');

    // When
    component.goToPublicLoginPage();

    // Expect
    expect(spyLoginPanelHide).toHaveBeenCalled();
    expect(spyAuthServiceRedirectToLoginPage).toHaveBeenCalled();
  });

  it('should log out', () => {
    // Given
    const spyLoginPanelHide = spyOn(component.loginPanel, 'hide').and.stub();
    const spyAuthServiceLogout = spyOn(authService, 'logout');

    // When
    component.logout();

    // Expect
    expect(spyLoginPanelHide).toHaveBeenCalled();
    expect(spyAuthServiceLogout).toHaveBeenCalled();
  });

  it('should get icon for INFOSOURCE_RECEIVED', done => {
    // Given
    const notificationType = NotificationType.INFOSOURCE_RECEIVED;

    // When
    const result = component.getNotificationIcon(notificationType);

    // Then
    expect(result).toEqual('pi-inbox');

    done();
  });

  it('should navigate to IS when INFOSOURCE_RECEIVED notification clicked', done => {
    // Given
    const notification: PingNotification = {
      title: 'IS number',
      type: NotificationType.INFOSOURCE_RECEIVED,
      creationDate: new Date(),
      read: false,
      infosourceId: 'infosourceId'
    };
    const spyNavigateAndUpdateReadStatus = spyOn(component, 'navigateAndUpdateReadStatus');

    // When
    component.onClickNotification(notification);

    // Then
    expect(spyNavigateAndUpdateReadStatus).toHaveBeenCalledWith('infosource/tables', 'infosourceId', notification);
    done();
  });

  it('should update read status for notification', done => {
    // Given
    const notification: PingNotification = {
      title: 'IS number',
      type: NotificationType.INFOSOURCE_RECEIVED,
      creationDate: new Date(),
      read: false,
      infosourceId: 'infosourceId',
      id: 'notificationId'
    };
    const spyAuthServiceIsPublicUser = spyOn(authService, 'isPublicUser').and.returnValue(true);
    const spyPublicNotificationServiceUpdateReadStatus = spyOn(publicNotificationService, 'updateReadStatus$').and.returnValue(of());
    component.notifications = [notification];
    component.selectedNotifications = [notification];
    component.numberUnreadNotifications = 1;
    component['areAllSelectionRead'] = true;
    const event = {
      originalEvent: {
        stopPropagation() { }
      },
      checked: true
    }

    // When
    component.toggleReadStatus(event, notification);

    // Then
    expect(spyAuthServiceIsPublicUser).toHaveBeenCalled();
    expect(spyPublicNotificationServiceUpdateReadStatus).toHaveBeenCalledWith([notification.id], true);
    done();
  });

  it('should delete notification', done => {
    // Given
    const notification: PingNotification = {
      title: 'IS number',
      type: NotificationType.INFOSOURCE_RECEIVED,
      creationDate: new Date(),
      read: false,
      infosourceId: 'infosourceId',
      id: 'notificationId'
    };
    const spyAuthService = spyOn(authService, 'isPublicUser').and.returnValue(true);
    const spyPublicNotificationServiceDelete = spyOn(publicNotificationService, 'delete$').and.returnValue(of());
    component.selectedNotifications = [notification];
    component.notifications = [notification];
    component['areAllSelectionRead'] = true;

    // When
    component.delete([notification.id]);

    // Then
    expect(spyAuthService).toHaveBeenCalled();
    expect(spyPublicNotificationServiceDelete).toHaveBeenCalledWith([notification.id]);
    done();
  });
});
