import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersApi } from '@app/api/users.api';
import PublicUser from '@app/models/public-user.model';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { NgxCaptchaComponent, NgxCaptchaService } from '@binssoft/ngx-captcha';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { AccountCreationComponent } from './account-creation.component';
import { CaptchaComponent } from './captcha/captcha.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AccountCreationComponent', () => {
  let component: AccountCreationComponent;
  let fixture: ComponentFixture<AccountCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AccountCreationComponent, NgxCaptchaComponent, CaptchaComponent],
    imports: [FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()],
    providers: [PermissionsProvider,
        MockProvider(UsersApi, {
            createUser(): Observable<PublicUser> {
                return of({
                    id: '1',
                    title: 'MR',
                    firstname: 'toto',
                    lastname: 'tata',
                    email: 'toto@gmail.com',
                    identifier: '',
                    password: '&Ad5!54kn,?',
                    hasEmailNotification: false,
                    mobilePhoneNumber: '+33666666666',
                    phoneNumber: '+33666666666',
                    hasAcceptedTos: false,
                    hasNotificationsSound: false,
                    hasSubscriptionEmailNotifications: false,
                    proAccount: false
                });
            }
        }),
        MockProvider(NgxCaptchaService, {
            captchStatus: of(true) as any
        }), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should create all fields', done => {
    const debugElement = fixture.debugElement;

    const email = debugElement.nativeElement.querySelector('#email');
    expect(email).toBeTruthy();

    const password = debugElement.nativeElement.querySelector('#password');
    expect(password).toBeTruthy();

    const gender1 = debugElement.nativeElement.querySelector('#gender1');
    expect(gender1).toBeTruthy();

    const gender2 = debugElement.nativeElement.querySelector('#gender2');
    expect(gender2).toBeTruthy();

    const firstName = debugElement.nativeElement.querySelector('#firstName');
    expect(firstName).toBeTruthy();

    const lastName = debugElement.nativeElement.querySelector('#lastName');
    expect(lastName).toBeTruthy();

    const mobile = debugElement.nativeElement.querySelector('#mobile');
    expect(mobile).toBeTruthy();

    const home = debugElement.nativeElement.querySelector('#home');
    expect(home).toBeTruthy();

    const organization = debugElement.nativeElement.querySelector('#organization');
    expect(organization).toBeTruthy();

    const shipName = debugElement.nativeElement.querySelector('#organization');
    expect(shipName).toBeTruthy();

    const homeport = debugElement.nativeElement.querySelector('#homeport');
    expect(homeport).toBeTruthy();

    const registrationNumber = debugElement.nativeElement.querySelector('#registrationNumber');
    expect(registrationNumber).toBeTruthy();

    const subscriptionEmailNotifications = debugElement.nativeElement.querySelector('#has-subscription-email-notifications');
    expect(subscriptionEmailNotifications).toBeTruthy();

    const notification = debugElement.nativeElement.querySelector('#notification-accept');
    expect(notification).toBeTruthy();

    const btnSubmit = debugElement.nativeElement.querySelector('#btn-submit');
    expect(btnSubmit).toBeTruthy();
    done();
  });

  it('should show modal dialog', done => {
    component.showModalDialog();
    expect(component.displayConfirmModal).toBe(true);
    done();
  });

  it('should handle onKeypressEventl', done => {
    component.onKeypressEvent({ target: { id: 'email' } });
    expect(component.submitError).toBeNull();

    component.onKeypressEvent({ target: { type: 'password' } });
    expect(component.submitError).toBeNull();
    done();
  });

  it('should handle onSubmit', done => {
    component.onSubmit();
    expect(component.captchaTouched).toBe(true);
    done();
  });

  it('should not submit form if proAccount equals true and organization empty', done => {
    // When
    component.initForm();
    component.profileForm.get('gender').setValue('MR');
    component.profileForm.get('firstName').setValue('toto');
    component.profileForm.get('lastName').setValue('tata');
    component.profileForm.get('email').setValue('toto@gmail.com');
    component.profileForm.get('password').setValue('&Ad5!54kn,?');
    component.profileForm.get('organization').setValue('');
    component.profileForm.get('proAccount').setValue(true);

    component.onSubmit();

    // Then
    expect(component.proAccount.value).toBe(true);
    expect(component.organization.value.trim()).toEqual('');
    expect(component.submitting).toBe(false);
    done();
  });

  it('should submit form if proAccount equals true and organization not empty', done => {
    // When
    component.initForm();
    component.profileForm.get('gender').setValue('MR');
    component.profileForm.get('firstName').setValue('toto');
    component.profileForm.get('lastName').setValue('tata');
    component.profileForm.get('email').setValue('toto@gmail.com');
    component.profileForm.get('password').setValue('&Ad5!54kn,?');
    component.profileForm.get('organization').setValue('');
    component.profileForm.get('proAccount').setValue(true);
    component.profileForm.get('organization').setValue('    organization   ');

    component.onSubmit();

    // Then
    expect(component.proAccount.value).toBe(true);
    expect(component.organization.value.trim()).toEqual('organization');
    expect(component.displayConfirmModal).toBe(true);
    done();
  });

});
