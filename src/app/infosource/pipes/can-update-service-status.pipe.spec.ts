import { TestBed } from '@angular/core/testing';
import { AuthService } from '@app/auth/auth.service';
import { MockProvider } from 'ng-mocks';
import { CanUpdateServiceStatusPipe } from './can-update-service-status.pipe';

describe('CanUpdateServiceStatusPipe', () => {
  let pipe;
  let authService: AuthService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(AuthService, {
        })
      ]
    });
  });

  beforeEach(() => {
    authService = TestBed.inject(AuthService);
    pipe = new CanUpdateServiceStatusPipe(authService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false if user has no role on service', () => {
    spyOn(authService, 'hasAnyRoleOnService').and.returnValues(false);
    const result = pipe.transform('serviceId');
    expect(result).toBeFalse();
  });

  it('should return true if user has role on service', () => {
    spyOn(authService, 'hasAnyRoleOnService').and.returnValues(true);
    const result = pipe.transform('serviceId');
    expect(result).toBeTrue();
  });
});
