import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { InfosourceAdminApi } from '@app/infosource/api/infosource-admin.api';
import { EMPTY } from 'rxjs';
import { ApiSanitizerInterceptor } from './api-sanitizer.interceptor';

describe('ApiSanitizerInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let api: InfosourceAdminApi;
  let client: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiSanitizerInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(InfosourceAdminApi);
    client = TestBed.inject(HttpClient);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should cancel request if malicious url parameters (encoded)', () => {
    const url = api.apiGetInfosourceById.replace('{{id}}', '..%2F..%2FunAutreApi%3FwithEvil%3Dparams&void%3D?toto=titi');

    client.get(url).subscribe(res => {
        expect(res).toEqual(EMPTY);
      });

    httpTestingController.expectNone({ url });
  });

  it('should cancel request if malicious url parameters (decoded)', () => {
    const url = api.apiGetInfosourceById.replace('{{id}}', '../../unAutreApi?withEvil=params&void=?toto=titi');

    client.get(url).subscribe(res => {
        expect(res).toEqual(EMPTY);
      });

    httpTestingController.expectNone({ url });
  });
});