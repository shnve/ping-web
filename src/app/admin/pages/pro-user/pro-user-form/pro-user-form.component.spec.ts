import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AreasApi } from '@app/api/areas.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { InfosourceAdminService } from '@app/infosource/services/infosource-admin.service';
import MaritimeService, { MaritimeServiceType, ServiceNetwork } from '@app/models/maritime-service.model';
import { ServiceRole } from '@app/models/pro-user.model';
import { TranslateModule } from '@ngx-translate/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { of } from 'rxjs';
import { ProUserFormComponent } from './pro-user-form.component';

const area1 = {
  id: '1',
  name: 'Atlantique sous zone 1',
  internationalName: 'Atlantic sub area 1',
  geom: null
};
const area2 = {
  id: '2',
  name: 'Atlantique sous zone 2',
  internationalName: 'Atlantic sub area 2',
  geom: null
};
const maritimeService: MaritimeService = {
  id: '1',
  urn: '',
  name: 'Méditerannée',
  internationalName: 'Mediteranean',
  information: '',
  localizedInformation: '',
  type: '1111',
  productionAgency: 'agency',
  serviceNetwork: ServiceNetwork.GOVERNMENT_SERVICE,
  pingPartner: true,
  maritimeNoticeProducer: false,
  areas: []
};
const maritimeService2: MaritimeService = {
  id: '2',
  urn: '',
  name: 'Méditerannée',
  internationalName: 'Mediteranean',
  information: '',
  localizedInformation: '',
  type: '1111',
  productionAgency: 'agency',
  serviceNetwork: ServiceNetwork.GOVERNMENT_SERVICE,
  pingPartner: true,
  maritimeNoticeProducer: false,
  areas: []
};
const serviceUserRole1 = {
  serviceRole: ServiceRole.SERVICE_ADMIN,
  serviceId: '2',
  type: MaritimeServiceType.NATIONAL_DELEGATED_COORDINATOR,
  shomService: true,
  surveyOwner: true,
  folderManager: false
};
const serviceUser1 = {
  id: '1',
  title: 'Mr',
  firstname: 'Homer',
  lastname: 'Simpson',
  hasNotificationsSound: false
}

describe('ProUserFormComponent', () => {
  let component: ProUserFormComponent;
  let fixture: ComponentFixture<ProUserFormComponent>;
  let mockUsersApi: jasmine.SpyObj<UsersApi>;
  let mockMaritimeServicesApi: jasmine.SpyObj<MaritimeServicesApi>;
  let mockAreasApi: jasmine.SpyObj<AreasApi>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Création des spies
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'hasRoleFunctionalAdmin',
      'hasRoleServiceUser',
      'getAuthenticatedUser',
      'getAuthenticatedUserServiceRoles',
      'updateAuthenticatedUserInfo',
      'refreshAccessToken'
    ]);

    mockMaritimeServicesApi = jasmine.createSpyObj('MaritimeServicesApi', ['getMaritimeServices']);
    mockUsersApi = jasmine.createSpyObj('UsersApi', ['saveProUser']);
    mockAreasApi = jasmine.createSpyObj('AreasApi', ['getAreas']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], { url: '/test' });

    mockAuthService.hasRoleFunctionalAdmin.and.returnValue(true);
    mockAuthService.hasRoleServiceUser.and.returnValue(false);
    mockAuthService.getAuthenticatedUser.and.returnValue(serviceUser1);
    mockAuthService.getAuthenticatedUserServiceRoles.and.returnValue([serviceUserRole1]);
    mockAuthService.refreshAccessToken.and.returnValue(of(null));

    mockMaritimeServicesApi.getMaritimeServices.and.returnValue(of([maritimeService, maritimeService2]));
    mockAreasApi.getAreas.and.returnValue(of([area1, area2]));
    mockUsersApi.saveProUser.and.returnValue(of());

    await TestBed.configureTestingModule({
      declarations: [ProUserFormComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
        DropdownModule,
        NoopAnimationsModule,
        RxReactiveFormsModule
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: MaritimeServicesApi, useValue: mockMaritimeServicesApi },
        { provide: AreasApi, useValue: mockAreasApi },
        { provide: UsersApi, useValue: mockUsersApi },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: InfosourceAdminService,
          useValue: {
            getAvailableMaritimeEntitiesForCreation$: () => of([{ id: '1', name: 'name1' }])
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProUserFormComponent);
    component = fixture.componentInstance;
    component.user = {
      id: null,
      title: null,
      firstname: null,
      lastname: null,
      email: null,
      role: null,
      hasNotificationsSound: false,
      hasSubscriptionEmailNotifications: true,
      status: 'ENABLED'
    };
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should have dropdown filled with maritime services and select maritime service for functional admin', async () => {
    // When
    component.ngOnInit();
    fixture.detectChanges();

    // Then
    expect(mockMaritimeServicesApi.getMaritimeServices).toHaveBeenCalled();

    const userForm: HTMLElement = fixture.nativeElement;
    const roleDropdown: Dropdown = fixture.debugElement.query(By.css('.user-role > .p-dropdown')).componentInstance;

    roleDropdown.onOptionSelect(new Event('change'), roleDropdown.options[1]);
    fixture.detectChanges();

    expect(userForm.querySelector('.user-service-role')).toBeTruthy();
    expect(userForm.querySelector('.user-service')).toBeTruthy();

    await (userForm.querySelector('.user-service > .p-dropdown') as HTMLDivElement).click();
    expect(userForm.querySelectorAll('.p-dropdown-item').length).toEqual(2);
  });

  it('should add phone numbers', async () => {
    const areaForm: HTMLElement = fixture.nativeElement;
    expect((areaForm.querySelector('.button-delete') as HTMLButtonElement).disabled).toEqual(true);
    expect(component.form.value.phoneNumbers.length).toEqual(1);

    fixture.debugElement.query(By.css('.add-phone')).triggerEventHandler('onClick', null);
    fixture.detectChanges();

    expect(component.form.value.phoneNumbers.length).toEqual(2);
  });
});
