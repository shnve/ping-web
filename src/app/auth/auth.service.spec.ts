import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MaritimeServiceType } from '@app/models/maritime-service.model';
import { ServiceRole } from '@app/models/pro-user.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { SessionState } from '@app/states/session.state';
import { environment } from '@env/environment';
import * as CryptoJS from 'crypto-js';
import { MockProvider } from 'ng-mocks';
import { AuthService } from './auth.service';

const tokenKey = 'access_token';
const SERVICE_USER_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJRd1FSRTFwbnIxNkMzdTNVZzJCcm9hSUdmcVBPM1pkNWpqQ3RnNW9jQkZrIn0.eyJleHAiOjE2MjczODQ2OTcsImlhdCI6MTYyNzM4NDM5NywiYXV0aF90aW1lIjoxNjI3Mzg0MzkzLCJqdGkiOiJhMTRhMTBiMi03OGM2LTRiM2EtOWM4NS04ODk2NDE5ZmM5NzUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODIvYXV0aC9yZWFsbXMvcGluZy1wcm8iLCJhdWQiOlsicGluZy1hcGkiLCJhY2NvdW50Il0sInN1YiI6IjE3YTVlMDM4LTczZjMtNDUzYi05ZjhhLTgxMjU3MjRkODc0NyIsInR5cCI6IkJlYXJlciIsImF6cCI6InBpbmctd2ViIiwic2Vzc2lvbl9zdGF0ZSI6IjQ2MTNlY2M4LTdjYmMtNDJkNC1iNTAzLTdiOTMxN2RjYzE2OCIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InBpbmctYXBpIjp7InJvbGVzIjpbInNlcnZpY2UtdXNlciJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtdXNlciJ9.WzfqiR49RJxlyt2ZagjbWGHI6eAoXgw0KvKiYm93PIIstrnZRprK9LZm_pY9YprcbODKKNOplQUCzK2sSLF4_nQclkxfDvDCz8beF8t7zkWr6s4lYIStlvlgkzmaRilFOmTQI5ILgY2DKuT1iiyB7K3Qmudb-7rqc3N0g6ct_oaaNcP_WZ6pEWAXDnZmFs_6hqnJKFEQg5-eQn-9i_SUdyrzmeFvRYUToSeL5nSDZt9N1NFaLEjS4joz1aujMNY4ByFtV-xzYyK1P6RxDkxoi-4YcOWAe94Xtv2nWj_vYtRy9CKkOxsTlTso2iO0HJAiKE6maCCmvIr_CNZUr_CYFA';
const FUNCTIONAL_ADMIN_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJRd1FSRTFwbnIxNkMzdTNVZzJCcm9hSUdmcVBPM1pkNWpqQ3RnNW9jQkZrIn0.eyJleHAiOjE2MjczOTA2MDgsImlhdCI6MTYyNzM5MDMwOCwiYXV0aF90aW1lIjoxNjI3MzkwMzAwLCJqdGkiOiI1Mzk4Mjg4OC01MjlkLTQwZjAtODU3MS0yMGE2YjBlYTlhZDIiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODIvYXV0aC9yZWFsbXMvcGluZy1wcm8iLCJhdWQiOlsicGluZy1hcGkiLCJhY2NvdW50Il0sInN1YiI6IjczOGI5ZDY4LTVmYmQtNDI3Mi05M2FkLTczNjNhMGE4ZTkwYSIsInR5cCI6IkJlYXJlciIsImF6cCI6InBpbmctd2ViIiwic2Vzc2lvbl9zdGF0ZSI6IjgzNjcyOGIxLTI0NzYtNDY0My04YmVjLTU4Nzg4MWNjZjJjMiIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InBpbmctYXBpIjp7InJvbGVzIjpbImZ1bmN0aW9uYWwtYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJmdW5jdGlvbmFsLWFkbWluIn0.RXmgbb9iMSiUuIOhfesWGTab9b15UCcTHCzIkJFhnH1NdNamRJ2m2PLiO0ukeibx2FmipPjXAx7tINtJe_-b9WXCtVu4dbjO7qUuwtT6E1G8iThmoTnFHrPyte8mxFNzIP_grFx6hRFCWqu-TbgLEJT38zTnbxTtjMg_wwROACp_H9wFPkDQCgGSSX6ueuwAkp0a6bkaQXQN3RElix7CjE6oezqfcJwwhw_7G6DbKTPLpmMR2pzVk0_Lc-90PtGbZWYeLCeyc7c6Zba7ZtpHm9moA7l0T2sHwuvlhTJMJ9Nmw6OBeXEOhYpzWhIVBMsI1QJkn3eflPVSY_684MxjlA';

describe('AuthService', () => {
  let service: AuthService;
  let mockSessionState: SessionState;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
        PermissionsProvider,
        MockProvider(SessionState),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(AuthService);
    mockSessionState = TestBed.inject(SessionState);

    // Mock local storage
    let store = {};

    spyOn(localStorage, 'getItem').and.callFake((key) => {
      return store[key];
    });
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      return store[key] = value + '';
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  it('should isProUser true', () => {
    localStorage.setItem(tokenKey, CryptoJS.AES.encrypt(SERVICE_USER_TOKEN, environment.localStorageKey).toString());
    expect(service.isProUser()).toBeTrue();
  });

  it('should isMaritimeNoticeProducer', done => {
    // Given
    spyOn(service, 'hasRoleServiceUser').and.returnValue(true);
    spyOn(service, 'getAuthenticatedUser').and.returnValue({
      serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      serviceRoles: [ServiceRole.SERVICE_OPERATOR],
      noticeProducer: true
    } as any as AuthenticatedUser);

    // When
    const result = service.isMaritimeNoticeProducer();

    // Then
    expect(result).toBeTrue();
    done();
  });

  it('should not isMaritimeNoticeProducer (1)', done => {
    // Given
    spyOn(service, 'hasRoleServiceUser').and.returnValue(true);
    spyOn(service, 'getAuthenticatedUser').and.returnValue({
      serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      serviceRoles: [ServiceRole.SERVICE_OPERATOR],
      noticeProducer: false
    } as any as AuthenticatedUser);

    // When
    const result = service.isMaritimeNoticeProducer();

    // Then
    expect(result).toBeFalse();
    done();
  });

  it('should not isMaritimeNoticeProducer (2)', done => {
    // Given
    spyOn(service, 'hasRoleServiceUser').and.returnValue(false);
    spyOn(service, 'getAuthenticatedUser').and.returnValue({
      serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      serviceRoles: [ServiceRole.SERVICE_OPERATOR],
      noticeProducer: true
    } as any as AuthenticatedUser);

    // When
    const result = service.isMaritimeNoticeProducer();

    // Then
    expect(result).toBeFalse();
    done();
  });

  it('should return true when calling isBri()', done => {
    // Given
    const user: AuthenticatedUser = {
      title: '',
      firstname: '',
      lastname: '',
      hasNotificationsSound: false,
      serviceRoles: [{
        serviceRole: ServiceRole.SERVICE_ADMIN,
        serviceId: 'service-id',
        type: MaritimeServiceType.BRI,
        surveyOwner: true,
        shomService: true,
        folderManager: false
      }]
    };
    spyOn(mockSessionState, 'getUserInfo').and.returnValue(user);
    spyOn(service, 'isLoggedIn').and.returnValue(true);

    // When
    const res = service.isBri();

    // Then
    expect(res).toBeTrue();

    done();
  });

  it('should return false when calling isBri()', done => {
    // Given
    const user: AuthenticatedUser = {
      title: '',
      firstname: '',
      lastname: '',
      hasNotificationsSound: false,
      serviceRoles: [{
        serviceRole: ServiceRole.SERVICE_ADMIN,
        serviceId: 'service-id',
        type: MaritimeServiceType.NAVAREA_COORDINATOR,
        surveyOwner: true,
        shomService: true,
        folderManager: false
      }]
    };
    spyOn(mockSessionState, 'getUserInfo').and.returnValue(user);
    spyOn(service, 'isLoggedIn').and.returnValue(true);

    // When
    const res = service.isBri();

    // Then
    expect(res).toBeFalse();

    done();
  });
});
