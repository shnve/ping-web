import { fakeAsync, TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {PermissionsProvider} from '@app/privileges/permissions-provider';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PermissionsProvider', () => {
  let permissionsProvider: PermissionsProvider;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    permissionsProvider = TestBed.inject(PermissionsProvider);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should fail to load permissions - client-side/network error', done => {
    permissionsProvider.load()
      .then(() => done.fail('should have fail with error'))
      .catch(error => {
        expect(error).toEqual('Something bad happened; please try again later.');
        done();
      });


    const req = httpTestingController.expectOne(permissionsProvider.permissionsUrl);
    expect(req.request.method).toEqual('GET');

    // Expect server to return status 0
    req.flush({
        status: 0
      },
      {
        status: 0,
        statusText: 'Bad Request'
      });
  });

  it('should fail to load permissions - internal server error', done => {
    permissionsProvider.load()
      .then(() => done.fail('should have fail with error'))
      .catch(error => {
        expect(error).toEqual('Something bad happened; please try again later.');
        done();
      });

    const req = httpTestingController.expectOne(permissionsProvider.permissionsUrl);
    expect(req.request.method).toEqual('GET');

    // Expect server to return status 500 Internal Server Error
    req.flush({
        status: 500
      },
      {
        status: 500,
        statusText: 'Internal Server Error'
      });
  });
});
