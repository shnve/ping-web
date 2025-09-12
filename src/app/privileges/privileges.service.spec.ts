import { TestBed } from '@angular/core/testing';

import { PrivilegesService } from './privileges.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {PermissionsProvider} from '@app/privileges/permissions-provider';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PrivilegesService', () => {
  let service: PrivilegesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PrivilegesService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check if user has access', () => {
    service.permissions = {
      permissions: [{
        scope: 'warning',
        access: {
          guest: false,
          public_user: false,
          guest_service: false,
          operator_service: true,
          admin_service: false,
          FUNCTIONAL_ADMIN: true,
          SERVICE_USER: true
        },
        actions: [
          {
            mgmtRule: 'DPC_07',
            label: 'creation',
            access: {
              guest: false,
              public_user: false,
              guest_service: false,
              operator_service: true,
              admin_service: false,
              FUNCTIONAL_ADMIN: true,
              SERVICE_USER: true
            }
          }
        ]
      }]
    };
    const access = service.hasAccess('warning', 'creation', 'SERVICE_USER', 'FUNCTIONAL_ADMIN');
    expect(access).toBeTrue();
  });

  it('should check if user has access to scope', () => {
    service.permissions = {
      permissions: [{
        scope: 'warning',
        access: {
          guest: false,
          public_user: false,
          guest_service: false,
          operator_service: true,
          admin_service: false,
          FUNCTIONAL_ADMIN: true,
          SERVICE_USER: true
        },
        actions: [
          {
            mgmtRule: 'DPC_07',
            label: 'creation',
            access: {
              guest: false,
              public_user: false,
              guest_service: false,
              operator_service: true,
              admin_service: false,
              FUNCTIONAL_ADMIN: true,
              SERVICE_USER: true
            }
          }
        ]
      }]
    };
    const access = service.hasAccessToScope('warning', 'SERVICE_USER', 'FUNCTIONAL_ADMIN');
    expect(access).toBeTrue();
  });

});
