import { TestBed } from '@angular/core/testing';

import { PublicUserGuard } from './public-user.guard';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MockProvider} from 'ng-mocks';
import {AuthService} from '@app/auth/auth.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PublicUserGuard', () => {
  let guard: PublicUserGuard;
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
    guard = TestBed.inject(PublicUserGuard);
  });

  it('should be access', () => {
    spyOn(authMock, 'isLoggedIn').and.returnValue(true);
    spyOn(authMock, 'isPublicUser').and.returnValue(true);
    expect(guard.canActivate(null, null)).toBeTrue();
  });

  it('should be deny if not logged in', () => {
    spyOn(authMock, 'isLoggedIn').and.returnValue(false);
    expect(guard.canActivate(null, null)).toBeFalse();
  });

  it('should be deny if logged in but is not public user', () => {
    spyOn(authMock, 'isLoggedIn').and.returnValue(true);
    spyOn(authMock, 'isPublicUser').and.returnValue(false);
    expect(guard.canActivate(null, null)).toBeFalse();
  });
});
