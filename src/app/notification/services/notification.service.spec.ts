import { of } from 'rxjs';
import { NotificationService } from '@app/notification/services/notification.service';
import { NotificationApi } from '@app/notification/api/notification.api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockNotificationApi: NotificationApi;
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
    service = TestBed.inject(NotificationService);
    mockNotificationApi = TestBed.inject(NotificationApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should update read status', done => {
    // Given
    const notificationIds: string[] = [
      'id_1',
      'id_2'
    ];
    const spyApi = spyOn(mockNotificationApi, 'updateReadStatus$');

    // When
    service.updateReadStatus$(notificationIds, true);

    // Then
    expect(spyApi).toHaveBeenCalledWith(notificationIds, true);
    done();
  });
});
