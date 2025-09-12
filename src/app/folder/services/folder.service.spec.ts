import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { PermissionsProvider } from '../../privileges/permissions-provider';
import { FolderAdminApi } from '../api/folder-admin.api';
import { ReferencesByFolder } from '../models/folder-study.model';
import { FolderService } from './folder.service';

describe('FolderService', () => {
  let httpTestingController: HttpTestingController;
  let service: FolderService;
  let mockApi: FolderAdminApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        PermissionsProvider,
        FolderService,
        MockProvider(FolderAdminApi),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(FolderService);
    mockApi = TestBed.inject(FolderAdminApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should getReferencesByFolderIds$', done => {
    // Given
    const ids = ['1', '2'];
    const found: ReferencesByFolder[] = [
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

    const spyApi = spyOn(mockApi, 'getReferencesByFolderIds$').and.returnValues(of(found));

    // When
    const res$ = service.getReferencesByFolderIds$(ids);

    // Then
    res$.subscribe(res => {
      expect(spyApi).toHaveBeenCalledWith(ids)
      expect(res).toEqual(found);
      done();
    });
  });
});
