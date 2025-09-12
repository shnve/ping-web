import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AttachmentApi } from '@app/api/attachment.api';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CreationAttachment } from '../components/attachments/attachment.model';
import { AttachmentService } from './attachment.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let mockAttachmentApi: AttachmentApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        AttachmentService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(AttachmentService);
    mockAttachmentApi = TestBed.inject(AttachmentApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', done => {
    expect(service).toBeTruthy();
    done();
  });

  it('should save attachment', done => {
    // Given
    const attachment: CreationAttachment = {
      filename: '',
      identifier: '',
      totalSize: 0,
      type: ''
    }
    const spyApi = spyOn(mockAttachmentApi, 'createAttachment$').and.returnValues(of('created_id'));

    // When
    const res$ = service.saveAttachment(attachment);

    // Then
    expect(spyApi).toHaveBeenCalledWith(attachment)
    res$.subscribe(res => {
      expect(res).toEqual('created_id');
      done();
    });
  });
});
