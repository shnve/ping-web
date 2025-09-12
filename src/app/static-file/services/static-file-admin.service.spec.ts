import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StaticFileAdminService } from './static-file-admin.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticFileAdminService', () => {
  let service: StaticFileAdminService;

  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(StaticFileAdminService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
