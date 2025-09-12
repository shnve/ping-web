import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StaticFileAdminApi } from './static-file-admin.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticFileAdminApi', () => {
  let api: StaticFileAdminApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(StaticFileAdminApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(api).toBeTruthy();
  });
});
