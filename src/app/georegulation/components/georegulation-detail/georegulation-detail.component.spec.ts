import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpHeaders, HttpResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { AttachmentApi } from '@app/api/attachment.api';
import { AuthService } from '@app/auth/auth.service';
import { GeoregulationActivity, GeoregulationModalDetails, GeoregulationStatusEnum, GeoregulationType } from '@app/georegulation/models/georegulation.model';
import { AttachmentDownload } from '@app/models/warning.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { NotionTypeEnum } from '@app/shared/components/add-notion-to-folder-selection/notion-type-enum';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { MockProvider } from 'ng-mocks';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { of } from 'rxjs';
import { GeoregulationDetailComponent } from './georegulation-detail.component';

describe('GeoregulationDetailComponent', () => {
  let component: GeoregulationDetailComponent;
  let fixture: ComponentFixture<GeoregulationDetailComponent>;
  let downloadService: DownloadService;
  let authService: AuthService;
  const georegulation: GeoregulationModalDetails = {
    id: '1',
    issuingService: {
      id: 'service id',
      name: 'service name',
      internationalName: 'service international_name'
    },
    mainNumber: {
      year: 2022,
      text: 'some text',
      authorityIds: ['auth_id01', 'auth_id02'],
      date: '26042022',
      authorityCodes: ['Code1', 'Code2']
    },
    parts: [
      {
        features: [
          new Feature(
            new Polygon([[[0, 0], [10, 0], [10, 10], [0, 10]]])
          )
        ]
      }
    ],
    temporary: false,
    type: GeoregulationType.NAVIGATION,
    hasCoastlineLimit: false,
    activities: [GeoregulationActivity.NAVIGATION],
    status: GeoregulationStatusEnum.DRAFT,
    canBeSent: true,
    lastUpdate: new Date(2023, 6, 15),
    lastUpdateUser: 'service user'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GeoregulationDetailComponent, TranslatePipe],
    imports: [TranslateModule.forRoot()],
    providers: [PermissionsProvider, TranslatePipe,
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

    fixture = TestBed.createComponent(GeoregulationDetailComponent);
    component = fixture.componentInstance;
    downloadService = TestBed.inject(DownloadService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should open attachment as private file if user connected', done => {
    // Given
    component.georegulation = georegulation;
    component.georegulation.status = GeoregulationStatusEnum.DRAFT;
    const event: Event = new Event('click');
    const attachmentDownload: AttachmentDownload = {
      id: '1',
      filename: 'file'
    };
    const headers = new HttpHeaders().set('filename', 'file.txt');
    const response: HttpResponse<Blob> = new HttpResponse({ headers });
    const spyDownload = spyOn(downloadService, 'download').and.returnValue(of(response));
    const spyAuthServiceLoggedIn = spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const spySaveAs = spyOn(FileSaver, 'saveAs').and.callFake(() => null);

    // When
    component.open(event, attachmentDownload);

    // Then
    expect(spyAuthServiceLoggedIn).toHaveBeenCalled();
    expect(spySaveAs).toHaveBeenCalled();
    expect(spyDownload).toHaveBeenCalledWith(attachmentDownload.id, null, null);
    done();
  });

  it('should open attachment as public file', done => {
    // Given
    component.georegulation = georegulation;
    component.georegulation.status = GeoregulationStatusEnum.PUBLISHED;
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
    component.open(event, attachmentDownload);

    // Then
    expect(spySaveAs).toHaveBeenCalled();
    expect(spyDownloadPublicFileByNotionType).toHaveBeenCalledWith(attachmentDownload.id, NotionTypeEnum.GEOREGULATION, georegulation.id);
    done();
  });
});
