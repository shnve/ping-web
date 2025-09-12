import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '@app/auth/auth.service';
import { ProfileMode } from '@app/types/profile';
import { MockProvider } from 'ng-mocks';
import { Subject, of } from 'rxjs';
import { SignInUpComponent } from './sign-in-up.component';

import { CONTRIBUTION_SECTION } from './sign-in-up.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';



describe('SignInUpComponent', () => {
  let component: SignInUpComponent;
  let fixture: ComponentFixture<SignInUpComponent>;
  let authService: AuthService;
  let queryParams: Subject<Params> = new Subject();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SignInUpComponent],
    imports: [RouterModule.forRoot([]),
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        {
            provide: ActivatedRoute,
            useValue: {
                queryParams: queryParams,
                data: of({ section: CONTRIBUTION_SECTION })
            },
        },
        MockProvider(AuthService, {
            redirectToLoginPage(profileMode: ProfileMode, redirectToAfterAuthentication?: string): void {
                return;
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInUpComponent);
    authService = TestBed.inject(AuthService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should redirect to public login page to contribution access', done => {
    queryParams.next({ urlToRedirectAfterSigningCompleted: CONTRIBUTION_SECTION });
    fixture.detectChanges();

    component.goToPublicLoginPage();
    expect(component.section).toEqual(CONTRIBUTION_SECTION);
    expect(component['activatedRoute'].queryParams).toBeDefined();
    done();
  });

  it('should redirect to pro login page to contribution access', done => {
    queryParams.next({ urlToRedirectAfterSigningCompleted: CONTRIBUTION_SECTION });
    fixture.detectChanges();

    component.goToProLoginPage();
    expect(component.section).toEqual(CONTRIBUTION_SECTION);
    expect(component['activatedRoute'].queryParams).toBeDefined();
    done();
  });
});
