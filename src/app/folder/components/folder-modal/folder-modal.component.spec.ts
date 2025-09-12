import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import { FolderAdminApi } from '@app/folder/api/folder-admin.api';
import { Folder, FolderStatusEnum } from '@app/folder/models/folder.model';
import { FolderFormatDetailsModalTitlePipe } from '@app/folder/pipes/folder-format-details-modal-title.pipe';
import { FolderService } from '@app/folder/services/folder.service';
import MaritimeService, { MaritimeServiceType } from '@app/models/maritime-service.model';
import { ServiceRole } from '@app/models/pro-user.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { GetNumberForSearchedPartPipe } from '@app/shared/pipes/get-number-for-searched-part.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { ReferencesByFolder, StudyReferencesTypeEnum } from './../../models/folder-study.model';
import { FolderModalComponent } from './folder-modal.component';

describe('FolderModalComponent', () => {
  let component: FolderModalComponent;
  let fixture: ComponentFixture<FolderModalComponent>;
  const folder: Folder = {
    id: '1',
    number: '1',
    status: FolderStatusEnum.OPEN,
    object: 'an object',
    creationDate: new Date(2023, 26, 6),
    lastUpdate: new Date(2023, 26, 6),
    reviewDate: new Date(2023, 30, 6),
    comment: '',
    issuingService: 'CND BREST',
    notions: []
  };
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FolderModalComponent,
        FolderFormatDetailsModalTitlePipe
      ],
      imports: [RouterTestingModule,
        TranslateModule.forRoot()],
      providers: [
        PermissionsProvider,
        LocalizedDatePipe,
        ConfirmationService,
        GetNumberForSearchedPartPipe,
        MockProvider(MaritimeServicesApi, {
          findOne(id: string): Observable<MaritimeService> {
            return of({ id: '1', name: 'my-service', maritimeEntities: [] });
          }
        }),
        MockProvider(FolderService, {
          getFolderById$(id: string): Observable<Folder> {
            return of(folder);
          }
        }),
        MockProvider(FolderAdminApi, {
          getFolderById$(id: string): Observable<Folder> {
            return of(folder);
          },
          getReferencesByFolderIds$(folderIds: string[]): Observable<ReferencesByFolder[]> {
            return of([{
              folderId: '1',
              studyNumber: '1',
              studyReferences: [{ type: StudyReferencesTypeEnum.NAUTICAL_MAP_CORRECTION, value: 'value' }]
            }]);
          }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderModalComponent);
    component = fixture.componentInstance;
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

  it('should hide', done => {
    // Given
    component.display = true;
    spyOn(component.onClose, 'emit');

    // When
    component.hide();

    // Then
    expect(component.display).toBeFalse();
    expect(component.onClose.emit).toHaveBeenCalled();
    done();
  });

  it('should load folder on changes', done => {
    // Given
    const changes: SimpleChanges = {
      mainFolders: new SimpleChange(null, [folder], true)
    };
    component.mainFolders = [folder];
    const spyComponentLoadFolder = spyOn<any>(component, 'loadFolder').and.callThrough();
    const spyComponentShow = spyOn(component, 'show').and.callThrough();

    // When
    component.ngOnChanges(changes);

    // Then
    expect(spyComponentLoadFolder).toHaveBeenCalled();
    expect(spyComponentShow).toHaveBeenCalled();
    expect(component.display).toBeTrue();
    done();
  });

  it('should manage folder', done => {
    // Given
    const changes: SimpleChanges = {
      mainFolders: new SimpleChange(null, [folder], true)
    };
    component.mainFolders = [folder];
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadFolder = spyOn<any>(component, 'loadFolder').and.callThrough();
    const spyComponentBuildManagementMenu = spyOn(component, 'buildManagementMenu').and.callThrough();
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const spyAuthServiceGetAuthenticatedUser = spyOn(authService, 'getAuthenticatedUser').and.returnValue(
      {
        serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
        role: ServiceRole.SERVICE_ADMIN,
        serviceRoles: [{
          serviceRole: ServiceRole.SERVICE_ADMIN,
          serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
          type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR
        }]
      } as any as AuthenticatedUser
    );

    // When
    component.ngOnChanges(changes);

    // Then
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(spyComponentLoadFolder).toHaveBeenCalled();
    expect(spyComponentBuildManagementMenu).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(spyAuthServiceGetAuthenticatedUser).toHaveBeenCalled();
    expect(component.canEditOrDelete).toBe(true);
    expect(component['canManage']).toBe(true);
    expect(component['items'].length).toEqual(5);
    expect(component['items'].map(item => item.id)).toEqual(
      ['edit', 'delete', 'clone', 'notify', 'follow']
    );
    done();
  });

  it('should add create study option to management menu on notion selected', done => {
    // Given
    const changes: SimpleChanges = {
      mainFolders: new SimpleChange(null, [folder], true)
    };
    component.mainFolders = [folder];
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadFolder = spyOn<any>(component, 'loadFolder').and.callThrough();
    const spyComponentBuildManagementMenu = spyOn(component, 'buildManagementMenu').and.callThrough();
    const spyComponentAddOrRemoveCreateStudyOptionIfCanCreateStudy = spyOn(component, 'addOrRemoveCreateStudyOptionIfCanCreateStudy').and.callThrough();
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const spyAuthServiceGetAuthenticatedUser = spyOn(authService, 'getAuthenticatedUser').and.returnValue(
      {
        serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
        role: ServiceRole.SERVICE_ADMIN,
        serviceRoles: [{
          serviceRole: ServiceRole.SERVICE_ADMIN,
          serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
          type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR
        }]
      } as any as AuthenticatedUser
    );
    component.ngOnChanges(changes);

    // When
    component.selectNotion(['notionId']);

    // Then
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(spyComponentLoadFolder).toHaveBeenCalled();
    expect(spyComponentBuildManagementMenu).toHaveBeenCalled();
    expect(spyComponentAddOrRemoveCreateStudyOptionIfCanCreateStudy).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(spyAuthServiceGetAuthenticatedUser).toHaveBeenCalled();
    expect(component.canEditOrDelete).toBe(true);
    expect(component['canManage']).toBe(true);
    expect(component['items'].length).toEqual(6);
    expect(component['items'].map(item => item.id)).toEqual(
      ['edit', 'delete', 'clone', 'notify', 'follow', 'create-study']
    );
    done();
  });


  it('should add create study option to management menu on attachment selected', done => {
    // Given
    const changes: SimpleChanges = {
      mainFolders: new SimpleChange(null, [folder], true)
    };
    component.mainFolders = [folder];
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadFolder = spyOn<any>(component, 'loadFolder').and.callThrough();
    const spyComponentBuildManagementMenu = spyOn(component, 'buildManagementMenu').and.callThrough();
    const spyComponentAddOrRemoveCreateStudyOptionIfCanCreateStudy = spyOn(component, 'addOrRemoveCreateStudyOptionIfCanCreateStudy').and.callThrough();
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const spyAuthServiceGetAuthenticatedUser = spyOn(authService, 'getAuthenticatedUser').and.returnValue(
      {
        serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
        role: ServiceRole.SERVICE_ADMIN,
        serviceRoles: [{
          serviceRole: ServiceRole.SERVICE_ADMIN,
          serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
          type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR
        }]
      } as any as AuthenticatedUser
    );
    component.ngOnChanges(changes);

    // When
    component.selectAttachment(['attachmentId']);

    // Then
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(spyComponentLoadFolder).toHaveBeenCalled();
    expect(spyComponentBuildManagementMenu).toHaveBeenCalled();
    expect(spyComponentAddOrRemoveCreateStudyOptionIfCanCreateStudy).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(spyAuthServiceGetAuthenticatedUser).toHaveBeenCalled();
    expect(component.canEditOrDelete).toBe(true);
    expect(component['canManage']).toBe(true);
    expect(component['items'].length).toEqual(6);
    expect(component['items'].map(item => item.id)).toEqual(
      ['edit', 'delete', 'clone', 'notify', 'follow', 'create-study']
    );
    done();
  });


  it('should remove create study option to management menu if none notion and attachment selected', done => {
    // Given
    const changes: SimpleChanges = {
      mainFolders: new SimpleChange(null, [folder], true)
    };
    component.mainFolders = [folder];
    const spyComponentUpdateSharedLinkUrl = spyOn<any>(component, 'updateSharedLinkUrl').and.callThrough();
    const spyComponentShow = spyOn(component, 'show').and.callThrough();
    const spyComponentLoadFolder = spyOn<any>(component, 'loadFolder').and.callThrough();
    const spyComponentBuildManagementMenu = spyOn(component, 'buildManagementMenu').and.callThrough();
    const spyComponentAddOrRemoveCreateStudyOptionIfCanCreateStudy = spyOn(component, 'addOrRemoveCreateStudyOptionIfCanCreateStudy').and.callThrough();
    const spyAuthServiceHasAnyRole = spyOn(authService, 'hasAnyRoleOnService').and.returnValue(true);
    const spyAuthServiceGetAuthenticatedUser = spyOn(authService, 'getAuthenticatedUser').and.returnValue(
      {
        serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
        role: ServiceRole.SERVICE_ADMIN,
        serviceRoles: [{
          serviceRole: ServiceRole.SERVICE_ADMIN,
          serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
          type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR
        }]
      } as any as AuthenticatedUser
    );
    component.ngOnChanges(changes);
    component.selectNotion(['notionId']);
    expect(component['items'].map(item => item.id)).toEqual(
      ['edit', 'delete', 'clone', 'notify', 'follow', 'create-study']
    );

    // When
    component.selectNotion([]);


    // Then
    expect(spyComponentShow).toHaveBeenCalled();
    expect(spyComponentUpdateSharedLinkUrl).toHaveBeenCalled();
    expect(spyComponentLoadFolder).toHaveBeenCalled();
    expect(spyComponentBuildManagementMenu).toHaveBeenCalled();
    expect(spyComponentAddOrRemoveCreateStudyOptionIfCanCreateStudy).toHaveBeenCalled();
    expect(spyAuthServiceHasAnyRole).toHaveBeenCalled();
    expect(spyAuthServiceGetAuthenticatedUser).toHaveBeenCalled();
    expect(component.canEditOrDelete).toBe(true);
    expect(component['canManage']).toBe(true);
    expect(component['items'].length).toEqual(5);
    expect(component['items'].map(item => item.id)).toEqual(
      ['edit', 'delete', 'clone', 'notify', 'follow']
    );
    done();
  });
});
