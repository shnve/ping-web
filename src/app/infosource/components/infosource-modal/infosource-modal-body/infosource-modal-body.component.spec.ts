import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/auth/auth.service';
import { ReferencesByFolder, StudyReferencesTypeEnum } from '@app/folder/models/folder-study.model';
import { GlobalConstants } from '@app/global-constants';
import { InfosourceNature, InfosourceStatus } from '@app/infosource/models/infosource.model';
import { InfosourceFormatDateRangePipe } from '@app/infosource/pipes/infosource-format-date-range.pipe';
import { InfosourceFormatInformationPipe } from '@app/infosource/pipes/infosource-format-information.pipe';
import { infosourceServiceProvider } from '@app/infosource/providers/infosource.service.provider';
import { AbstractInfosourceService } from '@app/infosource/services/infosource.service';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { LocalizedDatePipe } from '@app/shared/pipes/localized-date.pipe';
import { MapHasContentPipe } from '@app/shared/pipes/map-has-content.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { InfosourceModalBodyComponent } from './infosource-modal-body.component';


describe('InfosourceModalBodyComponent', () => {
  let component: InfosourceModalBodyComponent;
  let fixture: ComponentFixture<InfosourceModalBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        InfosourceModalBodyComponent,
        CapitalizeFirstPipe,
        LocalizedDatePipe,
        MapHasContentPipe
    ],
    imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
    providers: [
        PermissionsProvider,
        FormatDatetimePipe,
        MapHasContentPipe,
        CapitalizeFirstPipe,
        infosourceServiceProvider,
        InfosourceFormatDateRangePipe,
        InfosourceFormatInformationPipe,
        MockProvider(AuthService, {
            getAuthenticatedUser(): AuthenticatedUser {
                return {
                    serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36'
                } as any as AuthenticatedUser;
            }
        }),
        MockProvider(AbstractInfosourceService, {
          getFolderReferencesByFolderLinkedToInfosource$(infosourceId: string): Observable<ReferencesByFolder[]> {
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
    fixture = TestBed.createComponent(InfosourceModalBodyComponent);
    component = fixture.componentInstance;
    component.infosource = {
      number: 'snoop_doggy_dog-01-2022',
      nature: InfosourceNature.OTHER_REPORT,
      status: InfosourceStatus.DRAFT,
      comment: 'a comment',
      issuingServiceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
      creationDate: new Date(),
      lastUpdate: new Date(),
      validationTime: new Date(),
      timezone: GlobalConstants.USER_TIMEZONE,
      featureParts: [],
      recipients: [],
      canBeTransfered: true
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable form on init', () => {
    // When
    component.initForm();

    // Expect
    expect(component.commentForm.disabled).toBe(true);
  });

  it('should get form not valid with internal comment with space only', () => {
    // When
    component.initForm();

    // Then
    component.commentForm.get('comment').setValue('  ');
    expect(component.commentForm.controls['comment'].valid).toBe(false);
  });
});
