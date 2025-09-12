import { of } from 'rxjs';
import { NotificationAdminService } from '@app/notification/services/notification-admin.service';
import { NotificationAdminApi } from '@app/notification/api/notification-admin.api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { NotificationService } from '@app/notification/services/notification.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NotificationAdminService', () => {
  let service: NotificationAdminService;
  let mockNotificationAdminApi: NotificationAdminApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        PermissionsProvider,
        NotificationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(NotificationAdminService);
    mockNotificationAdminApi = TestBed.inject(NotificationAdminApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should delete notification', done => {
    // Given
    const notificationIds: string[] = [
      'id_1',
      'id_2'
    ];
    const spyApi = spyOn(mockNotificationAdminApi, 'delete$');

    // When
    service.delete$(notificationIds);

    // Then
    expect(spyApi).toHaveBeenCalledWith(notificationIds);
    done();
  });
});
