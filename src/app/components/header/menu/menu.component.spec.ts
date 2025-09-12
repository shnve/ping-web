import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { AuthService } from '@app/auth/auth.service';
import MaritimeService, { MaritimeServiceType, ServiceRole } from '@app/models/maritime-service.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { MenubarModule } from 'primeng/menubar';
import { Observable, of } from 'rxjs';
import { MenuComponent } from './menu.component';


describe('MenuComponent not connected', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let mockAuthService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MenuComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule,
        MenubarModule],
    providers: [
        PermissionsProvider,
        MockProvider(MaritimeServicesApi, {
            findOne(): Observable<MaritimeService> {
                return of({ id: '1', name: 'my-service', maritimeEntities: [] });
            },
            findByServiceIds(ids: string[]): Observable<MaritimeService[]> {
                return of([{ id: '1', name: 'my-service', maritimeEntities: [] }]);
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  }));

  beforeEach(() => {
    mockAuthService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu buttons for non-connected user', () => {
    spyOn(mockAuthService, 'getConnected$').and.returnValue(of(false));
    const items = [
      'menu.home',
      'menu.avurnav-notice',
      'menu.georegulation-visu',
      'menu.subscriptions',
      'menu.contributions'
    ];

    checkMenuItems(fixture, items);
  });
});


describe('MenuComponent connected as public user', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let mockAuthService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MenuComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule,
        MenubarModule],
    providers: [
        PermissionsProvider,
        MockProvider(MaritimeServicesApi, {
            findOne(): Observable<MaritimeService> {
                return of({ id: '1', name: 'my-service', maritimeEntities: [] });
            }
        }),
        MockProvider(AuthService, {
            isLoggedIn(): boolean {
                return true;
            },
            isPublicUser(): boolean {
                return true;
            },
            getConnected$(): Observable<boolean> {
                return of(true);
            },
            hasRoleServiceUser(): boolean {
                return false;
            },
            hasRightsOnAnyAuthorityService(): boolean {
                return false;
            },
            hasAccess(): boolean {
                return false;
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  beforeEach(() => {
    mockAuthService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu buttons for public connected user', () => {
    spyOn(mockAuthService, 'getConnected$').and.returnValue(of(true));
    const items = [
      'menu.home',
      'menu.avurnav-notice',
      'menu.georegulation-visu',
      'menu.subscriptions',
      'menu.contributions',
      'menu.admin.contributions',
      'menu.admin.new-contribution',
      'menu.survey.my-surveys',
      'menu.survey.new-test',
      'menu.survey.new-deposit'
    ];

    checkMenuItems(fixture, items);
  });
});


describe('MenuComponent connected as functional admin', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let mockAuthService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MenuComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule,
        MenubarModule],
    providers: [
        PermissionsProvider,
        MockProvider(MaritimeServicesApi, {
            findOne(id: string): Observable<MaritimeService> {
                return of({ id: '1', name: 'my-service', maritimeEntities: [] });
            }
        }),
        MockProvider(AuthService, {
            isLoggedIn(): boolean {
                return true;
            },
            isPublicUser(): boolean {
                return false;
            },
            getConnected$(): Observable<boolean> {
                return of(true);
            },
            hasRoleServiceUser(): boolean {
                return false;
            },
            hasRoleFunctionalAdmin(): boolean {
                return true;
            },
            hasRightsOnAnyAuthorityService(): boolean {
                return false;
            },
            hasAccess(): boolean {
                return false;
            },
            isProUser(): boolean {
                return true;
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  }));

  beforeEach(() => {
    mockAuthService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu buttons for functional admin connected user', () => {
    spyOn(mockAuthService, 'getConnected$').and.returnValue(of(true));
    const items = [
      'menu.home',
      'menu.avurnav-notice',
      'menu.georegulation-visu',
      'menu.admin.title',
      'menu.admin.area',
      'menu.admin.maritime-entity',
      'menu.admin.serie',
      'menu.admin.maritime-service',
      'menu.admin.sub-area',
      'menu.admin.pro-user',
      'menu.admin.public-user',
      'menu.admin.static-page',
      'menu.admin.static-file',
      'menu.admin.static-logo',
      'menu.admin.static-section'
    ];

    checkMenuItems(fixture, items);
  });
});


describe('MenuComponent connected as service user', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let mockAuthService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MenuComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot(),
        RouterTestingModule,
        MenubarModule],
    providers: [
        PermissionsProvider,
        MockProvider(MaritimeServicesApi, {
            findOne(): Observable<MaritimeService> {
                return of({ id: '1', name: 'my-service', maritimeEntities: [] });
            },
            findByServiceIds(): Observable<MaritimeService[]> {
                return of([{ id: '1', name: 'my-service', maritimeEntities: [], folderManager: true }]);
            }
        }),
        MockProvider(AuthService, {
            isLoggedIn(): boolean {
                return true;
            },
            isPublicUser(): boolean {
                return false;
            },
            getConnected$(): Observable<boolean> {
                return of(true);
            },
            hasRoleServiceUser(): boolean {
                return true;
            },
            hasRoleFunctionalAdmin(): boolean {
                return false;
            },
            hasRightsOnAnyAuthorityService(): boolean {
                return true;
            },
            hasAutorityType(): boolean {
                return true;
            },
            hasAccess(): boolean {
                return true;
            },
            isProUser(): boolean {
                return true;
            },
            hasAnyRoleOnService(): boolean {
                return true;
            },
            getAuthenticatedUser(): AuthenticatedUser {
                return {
                    id: 'id',
                    serviceRoles: [
                        {
                            serviceRole: ServiceRole.SERVICE_ADMIN,
                            serviceId: '1',
                            type: MaritimeServiceType.AUTHORITY,
                            folderManager: true
                        }
                    ]
                } as AuthenticatedUser;
            },
            isSurveyOwnerOnAnyServiceWithAnyRole(): boolean {
                return true;
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  }));

  beforeEach(() => {
    mockAuthService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu buttons for service connected user', () => {
    spyOn(mockAuthService, 'getConnected$').and.returnValue(of(true));
    const items = [
      'menu.home',
      'menu.avurnav-notice',
      'menu.georegulation-visu',
      'menu.subscriptions',
      'menu.contributions',
      'menu.admin.contributions',
      'menu.admin.new-contribution',
      'menu.survey.my-surveys',
      'menu.survey.new-test',
      'menu.survey.new-deposit',
      'menu.folders',
      'menu.admin.folders-followed',
      'menu.admin.folders',
      'menu.admin.new-folder',
      'menu.admin-warning.management',
      'menu.admin-warning.tables',
      'menu.admin-warning.creation',
      'menu.georegulation.manage',
      'menu.georegulation.tables',
      'menu.georegulation.creation',
      'menu.admin.title',
      'menu.admin.area',
      'menu.admin.maritime-entity',
      'menu.admin.serie',
      'menu.admin.maritime-service',
      'menu.admin.sub-area'
    ];

    checkMenuItems(fixture, items);
  });


});

function checkMenuItems(fixture: ComponentFixture<MenuComponent>, items: string[]): void {
  const menuItemDe: DebugElement = fixture.debugElement;
  const menuItemEl: HTMLElement = menuItemDe.nativeElement;
  const menuItems = menuItemEl.querySelectorAll('.p-menubar .p-menuitem-text');
  const mapMenuItems = new Map(items.map((value, index) => [index, value]));
  expect(menuItems.length).toEqual(items.length);
  mapMenuItems.forEach((value, key) => expect(menuItems[key].textContent).toEqual(value));
}
