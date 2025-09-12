import {TestBed} from '@angular/core/testing';

import {FunctionalAdminGuard} from './functional-admin.guard';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MockProvider} from 'ng-mocks';
import {AuthService} from '@app/auth/auth.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('FunctionalAdminGuard', () => {
  let guard: FunctionalAdminGuard;
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
    guard = TestBed.inject(FunctionalAdminGuard);
  });

  it('should be access', () => {
    spyOn(authMock, 'hasRoleFunctionalAdmin').and.returnValue(true);
    expect(guard.canActivate(null, null)).toBeTrue();
  });

  it('should be deny', () => {
    spyOn(authMock, 'hasRoleFunctionalAdmin').and.returnValue(false);
    expect(guard.canActivate(null, null)).toBeFalse();
  });
});
