import { TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@app/auth/auth.service';
import { MockProvider } from 'ng-mocks';
import { FunctionalAdminOrNoticeProducerGuard } from './functional-admin-or-notice-producer.guard';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('FunctionalAdminOrNoticeProducerGuard', () => {
  let guard: FunctionalAdminOrNoticeProducerGuard;
  let authMock: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
        MockProvider(AuthService),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    authMock = TestBed.inject(AuthService);
    guard = TestBed.inject(FunctionalAdminOrNoticeProducerGuard);
  });

  it('should access if functional admin', () => {
    spyOn(authMock, 'hasRoleFunctionalAdmin').and.returnValue(true);
    expect(guard.canActivate(null, null)).toBeTrue();
  });

  it('should access if maritime notice producer', () => {
    spyOn(authMock, 'hasRoleFunctionalAdmin').and.returnValue(false);
    spyOn(authMock, 'isMaritimeNoticeProducer').and.returnValue(true);
    expect(guard.canActivate(null, null)).toBeTrue();
  });

  it('should deny', () => {
    spyOn(authMock, 'hasRoleFunctionalAdmin').and.returnValue(false);
    spyOn(authMock, 'isMaritimeNoticeProducer').and.returnValue(false);
    expect(guard.canActivate(null, null)).toBeFalse();
  });
});
