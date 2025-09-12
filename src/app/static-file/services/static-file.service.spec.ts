import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StaticFileService } from './static-file.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticFileService', () => {
  let service: StaticFileService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(StaticFileService);
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
