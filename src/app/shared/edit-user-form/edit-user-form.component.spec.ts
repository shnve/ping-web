import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { ResetPasswordComponent } from '@app/admin/components/reset-password/reset-password.component';
import { UpdateEmailComponent } from '@app/admin/components/update-email/update-email.component';
import { AreasApi } from '@app/api/areas.api';
import { UsersApi } from '@app/api/users.api';
import Area from '@app/models/area.model';
import PublicUser from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { DropdownModule } from 'primeng/dropdown';
import { Observable, of } from 'rxjs';
import { EditUserFormComponent } from './edit-user-form.component';
import Spy = jasmine.Spy;

describe('EditUserFormComponent', () => {
  let component: EditUserFormComponent;
  let fixture: ComponentFixture<EditUserFormComponent>;
  let mockAreaApi: AreasApi;
  let spyFacadeGetAreas: Spy<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EditUserFormComponent, UpdateEmailComponent, ResetPasswordComponent],
    imports: [ReactiveFormsModule,
        TranslateModule.forRoot(),
        DropdownModule,
        NoopAnimationsModule],
    providers: [
        PermissionsProvider,
        MockProvider(UsersApi, {
            editPublicUser(): Observable<PublicUser> {
                return of();
            },
            findOnePublic(): Observable<PublicUser> {
                return of({
                    title: 'MR',
                    firstname: 'John',
                    lastname: 'Doe',
                    email: 'john.doe@great-company.com',
                    password: 'Ch0ucr@ut3',
                    hasEmailNotification: true,
                    mobilePhoneNumber: '+33123456789',
                    phoneNumber: '+33123456789',
                    hasAcceptedTos: true,
                    registrationNumber: null,
                    preferredArea: null,
                    organization: null,
                    shipName: null,
                    homeport: null,
                    hasNotificationsSound: false,
                    hasSubscriptionEmailNotifications: true,
                    proAccount: false
                });
            }
        }),
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    params: {
                        id: '1',
                    }
                }
            }
        },
        MockProvider(AreasApi, {
            getAreas(): Observable<Area[]> {
                return of([{
                        id: '1',
                        urn: '',
                        name: 'Atlantique',
                        internationalName: 'Atlantic',
                        information: '',
                        localizedInformation: '',
                        country: 'France',
                        geom: null,
                        borderAreas: []
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
    mockAreaApi = TestBed.inject(AreasApi);
    spyFacadeGetAreas = spyOn(mockAreaApi, 'getAreas').and.returnValues(of([{
      id: '1',
      urn: '',
      name: 'Atlantique',
      internationalName: 'Atlantic',
      information: '',
      localizedInformation: '',
      country: 'France',
      geom: null,
      borderAreas: []
    }, {
      id: '1',
      urn: '',
      name: 'Méditerannée',
      internationalName: 'Mediteranean',
      information: '',
      localizedInformation: '',
      country: 'France',
      geom: null,
      borderAreas: []
    }]));

    fixture = TestBed.createComponent(EditUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
