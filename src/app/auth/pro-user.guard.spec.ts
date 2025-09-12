import { TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@app/auth/auth.service';
import { MockProvider } from 'ng-mocks';
import { ProUserGuard } from './pro-user.guard';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProUserGuard', () => {
  let guard: ProUserGuard;
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
    guard = TestBed.inject(ProUserGuard);
  });

  it('should be access', () => {
    spyOn(authMock, 'isProUser').and.returnValue(true);
    spyOn(authMock, 'isLoggedIn').and.returnValue(true);
    expect(guard.canActivate(null, null)).toBeTrue();
  });

  it('should be deny', () => {
    spyOn(authMock, 'isProUser').and.returnValue(false);
    expect(guard.canActivate(null, null)).toBeFalse();
  });
});
