import { TestBed } from '@angular/core/testing';

import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoaderService } from '@app/sig/services/loader.service';
import { environment } from '@env/environment';
import { LoadingInterceptor } from './loading.interceptor';

describe('LoadingInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let loadingService: LoaderService;
  let client: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoaderService);
    client = TestBed.inject(HttpClient);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should not call loading service if not related to url need to listening', done => {
    // Given
    const url = environment.api.users;
    const spyLoadingService = spyOn(loadingService, 'toggleLoadingSpinner');

    // When
    client.get(url).subscribe(res => {
      expect(res).toEqual('');
    });

    // Then
    httpTestingController.expectOne({ url });
    expect(spyLoadingService).not.toHaveBeenCalled();
    done();
  });

  it('should call loading service if related to GR map', done => {
    // Given
    const url = environment.api.georegulations.map;
    const spyLoadingService = spyOn(loadingService, 'toggleLoadingSpinner');

    // When
    client.get(url).subscribe(res => {
      expect(res).toEqual('');
    });

    // Then
    httpTestingController.expectOne({ url });
    expect(spyLoadingService).toHaveBeenCalled();
    done();
  });

  it('should call loading service if related to AN map', done => {
    // Given
    const url = environment.api.warnings.map;
    const spyLoadingService = spyOn(loadingService, 'toggleLoadingSpinner');

    // When
    client.get(url).subscribe(res => {
      expect(res).toEqual('');
    });

    // Then
    httpTestingController.expectOne({ url });
    expect(spyLoadingService).toHaveBeenCalled();
    done();
  });
});
