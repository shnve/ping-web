import { HttpHeaders, HttpResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { AttachmentApi } from '@app/api/attachment.api';
import { AuthService } from '@app/auth/auth.service';
import { SerieType } from '@app/models/serie.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { FormatTypeGeneralPipe } from '@app/shared/pipes/format-type-general.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FormatWarningNumberPipe } from '@shared/pipes/format-warning-number.pipe';
import { FormatWarningTitlePipe } from '@shared/pipes/format-warning-title.pipe';
import * as FileSaver from 'file-saver';
import { MockProvider } from 'ng-mocks';
import { ButtonModule } from 'primeng/button';
import { of } from 'rxjs';
import { AdminWarning, AttachmentDownload, listWarningStatus } from '../../../models/warning.model';
import { NotionTypeEnum } from '../add-notion-to-folder-selection/notion-type-enum';
import { WarningDetailComponent } from './warning-detail.component';


describe('WarningDetailComponent', () => {
  let component: WarningDetailComponent;
  let fixture: ComponentFixture<WarningDetailComponent>;
  let downloadService: DownloadService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FormatWarningNumberPipe, FormatWarningTitlePipe, WarningDetailComponent, FormatDatetimePipeMock, LocalizedDatePipe, FormatTypeGeneralPipe],
    imports: [TranslateModule.forRoot(),
        ButtonModule],
    providers: [PermissionsProvider,
        MockProvider(AttachmentApi, {
            downloadAttachment$(id: string) {
                return of();
            },
            downloadPublicFileByNotionType$(id: string, notionType: NotionTypeEnum, notionItemId: string) {
                return of();
            }
        }), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningDetailComponent);
    component = fixture.componentInstance;
    const warning: AdminWarning = {
      featureParts: [],
      globalWarningType: 'WARNING',
      id: '1',
      nameOfSeries: 'nameOfSeries',
      warningNumber: 1001,
      year: 21,
      generalAreas: { fr: ['generalArea'] },
      localities: {},
      warningHazardTypeGeneral: 'AIDS_TO_NAVIGATION',
      publicationTime: new Date(),
      serieType: SerieType.LOCAL_NAVIGATIONAL_WARNING,
      serieId: '1',
      canBePublished: false
    };

    component.warning = warning;
    downloadService = TestBed.inject(DownloadService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open attachment as private file if user connected', done => {
    // Given
    component.warning.status = listWarningStatus.DRAFT;
    const event: Event = new Event('click');
    const headers = new HttpHeaders().set('filename', 'file.txt');
    const response: HttpResponse<Blob> = new HttpResponse({ headers });
    const spyDownload = spyOn(downloadService, 'download').and.returnValue(of(response));
    const spyAuthServiceLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const spySaveAs = spyOn(FileSaver, 'saveAs').and.callFake(() => null);

    // When
    component.open(event, '1');

    // Then
    expect(spyAuthServiceLoggedIn).toHaveBeenCalled();
    expect(spySaveAs).toHaveBeenCalled();
    expect(spyDownload).toHaveBeenCalledWith('1', null, null);
    done();
  });

  it('should open attachment as public file', done => {
    // Given
    component.warning.status = listWarningStatus.DRAFT;
    const event: Event = new Event('click');
    const attachmentDownload: AttachmentDownload = {
      id: '1',
      filename: 'file'
    };
    const headers = new HttpHeaders().set('filename', 'file.txt');
    const response: HttpResponse<Blob> = new HttpResponse({ headers });
    const spyDownloadPublicFileByNotionType = spyOn(downloadService, 'download').and.returnValue(of(response));
    const spySaveAs = spyOn(FileSaver, 'saveAs').and.callFake(() => null);

    // When
    component.open(event, '1');

    // Then
    expect(spySaveAs).toHaveBeenCalled();
    expect(spyDownloadPublicFileByNotionType).toHaveBeenCalledWith(attachmentDownload.id, NotionTypeEnum.WARNING, '1');
    done();
  });
});

@Pipe({ name: 'formatDatetime' })
class FormatDatetimePipeMock implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}
