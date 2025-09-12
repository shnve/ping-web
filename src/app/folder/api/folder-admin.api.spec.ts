import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { ReferencesByFolder } from '../models/folder-study.model';
import { FolderAdminApi } from './folder-admin.api';

describe('FolderAdminApi', () => {
  let api: FolderAdminApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [],
        providers: [FolderAdminApi, PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(FolderAdminApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(api).toBeTruthy();
    done();
  });

  it('should getReferencesByFolderIds$', done => {
    // Given
    const folderIds = ['1', '2'];
    const expectedResult: ReferencesByFolder[] = [
      {
        folderId: '1',
        studyNumber: 'studyNumber_1',
        studyReferences: []
      },
      {
        folderId: '2',
        studyNumber: 'studyNumber_2',
        studyReferences: []
      }
    ];

    // When
    api.getReferencesByFolderIds$(folderIds).subscribe(
      referencesByFolder => expect(referencesByFolder).toEqual(expectedResult)
    );

    // Then
    // should have made one request to GET report
    const req = httpTestingController.expectOne(`${api.apiTableUrl}/references?folderIds=1,2`);
    expect(req.request.method).toEqual('GET');

    req.flush(expectedResult);

    done();
  });
});
