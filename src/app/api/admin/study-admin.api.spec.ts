import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StudyBase } from '@app/models/study.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { StudyApi } from './study-admin.api';

describe('StudyApi', () => {
  let api: StudyApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [],
        providers: [StudyApi, PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(StudyApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(api).toBeTruthy();
    done();
  });

  it('should update study', done => {
    const idToUpdate = '1';
    const newStudy: StudyBase = {
      id: idToUpdate,
      number: 'number_1'
    };
    api.saveStudy$(newStudy).subscribe(folderStudy => expect(folderStudy).toEqual(newStudy), fail);

    // call should have made one request to POST report
    const req = httpTestingController.expectOne(`${api.apiCreate}/${idToUpdate}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(newStudy);

    req.flush(newStudy);

    done();
  });

  it('should create study', done => {
    const newStudy: StudyBase = {
      number: 'number_1'
    };
    api.saveStudy$(newStudy).subscribe(folderStudy => expect(folderStudy).toEqual(newStudy), fail);

    // call should have made one request to POST report
    const req = httpTestingController.expectOne(api.apiCreate);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(newStudy);

    req.flush(newStudy);

    done();
  });
});