import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@app/auth/auth.service';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { AttachmentApi } from './attachment.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AttachmentApi', () => {
  let api: AttachmentApi;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        AttachmentApi,
        PermissionsProvider,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(AttachmentApi);
    authService = TestBed.inject(AuthService);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(api).toBeTruthy();
    done();
  });

  it('should check file requirements (admin)', done => {
    const filename = 'filename.txt';
    const fileSize = 2051651;
    const checkResult = '';

    api.checkFileRequirements$(filename, fileSize, true)
      .subscribe(result => {
        expect(result).toEqual('');
        done();
      },
      err => {
        done.fail(err);
      }
    );

    const testRequest = httpTestingController.expectOne(api.adminApiCheckFileRequirementsUrl
      .replace('{{filename}}', filename).replace('{{fileSize}}', `${fileSize}`).replace('{{isBathy}}', 'false').replace('{{isSurvey}}', 'false').replace('{{isTechnicalMetadata}}', 'false'));
    expect(testRequest.request.method).toEqual('GET');
    testRequest.flush(checkResult);
  });

  it('should check file requirements (public)', done => {
    const filename = 'filename.txt';
    const fileSize = 2051651;
    const checkResult = '';

    api.checkFileRequirements$(filename, fileSize, false)
      .subscribe(result => {
        expect(result).toEqual('');
        done();
      },
      err => {
        done.fail(err);
      }
    );

    const testRequest = httpTestingController.expectOne(api.securedApiCheckFileRequirementsUrl
      .replace('{{filename}}', filename).replace('{{fileSize}}', `${fileSize}`).replace('{{isBathy}}', 'false').replace('{{isSurvey}}', 'false').replace('{{isTechnicalMetadata}}', 'false'));
    expect(testRequest.request.method).toEqual('GET');
    testRequest.flush(checkResult);
  });

});
