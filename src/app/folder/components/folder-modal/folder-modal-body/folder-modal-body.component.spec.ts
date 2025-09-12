import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { CapitalizeFirstPipe } from '@app/shared/pipes/capitalize-first.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FolderModalBodyComponent } from './folder-modal-body.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MockProvider } from 'ng-mocks';
import { AuthService } from '@app/auth/auth.service';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { FolderStatusEnum } from '@app/folder/models/folder.model';
import { FormatDatetimePipe } from '@app/shared/pipes/format-datetime.pipe';
import { LocalizedDatePipe } from '@shared/pipes/localized-date.pipe';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('FolderModalBodyComponent', () => {
  let component: FolderModalBodyComponent;
  let fixture: ComponentFixture<FolderModalBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        FolderModalBodyComponent,
        CapitalizeFirstPipe,
        LocalizedDatePipe,
    ],
    imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
    providers: [
        PermissionsProvider,
        FormatDatetimePipe,
        CapitalizeFirstPipe,
        MockProvider(AuthService, {
            getAuthenticatedUser(): AuthenticatedUser {
                return {
                    serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36'
                } as any as AuthenticatedUser;
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderModalBodyComponent);
    component = fixture.componentInstance;
    component.folder = {
      number: 'snoop_doggy_dog-01-2022',
      status: FolderStatusEnum.OPEN,
      comment: 'a comment',
      object: 'an object',
      issuingService: 'Test',
      reviewDate: new Date(),
      creationDate: new Date(),
      lastUpdate: new Date(),
      concernedMaritimeEntities: [],
      sharedMaritimeServices: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
