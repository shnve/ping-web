import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AreasApi } from '@app/api/areas.api';
import { AuthService } from '@app/auth/auth.service';
import Area from '@app/models/area.model';
import { ProfileMode } from '@app/types/profile';
import { NgxCaptchaService } from '@binssoft/ngx-captcha';
import { Scavenger } from '@wishtack/rx-scavenger';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UsersApi } from '../../../../api/users.api';
import { checkFilledInputFields } from '../../../shared/validators/phone-numbers-required.validator';
import { CaptchaComponent } from './captcha/captcha.component';


@Component({
  selector: 'app-account-creation',
  templateUrl: './account-creation.component.html',
  styleUrls: ['./account-creation.component.scss']
})
export class AccountCreationComponent implements OnInit, OnDestroy {

  protected readonly baseStaticPath = '/static';

  private scavenger = new Scavenger(this);

  profileForm: UntypedFormGroup;
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Venezuela, CountryISO.UnitedKingdom];
  captchaConfig = {
    length: 6,
    cssClass: 'ngx-captcha-custom',
    back: {
      stroke: '#2F9688',
      solid: '#f2efd2'
    },
    font: {
      color: '#000000',
      size: '35px'
    }
  };
  captchaValid = false;
  captchaTouched = false;
  submitError: string;
  emailCreationError: string;
  passwordCreationError: string;
  displayConfirmModal = false;
  submitting = false;
  areas$: Observable<Area[]>;
  booleanOptions = [true, false];

  @ViewChild('captcha')
  captcha: CaptchaComponent;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private captchaService: NgxCaptchaService,
    private authService: AuthService,
    private userService: UsersApi,
    private readonly areaApi: AreasApi) { }

  ngOnDestroy(): void { }

  ngOnInit(): void {
    this.initForm();
    this.areas$ = this.areaApi.getAreas();
  }

  initForm(): void {
    this.profileForm = this.formBuilder.group({
      gender: 'MR',
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(environment.emailRegexPattern)]],
      organization: '',
      notification: false,
      phoneNumbers: new UntypedFormGroup({
        mobile: new UntypedFormControl(''),
        home: new UntypedFormControl('')
      }, checkFilledInputFields()),
      password: ['', [Validators.required, Validators.minLength(8)]],
      shipName: '',
      homeport: '',
      registrationNumber: '',
      preferredArea: '',
      hasAcceptedTos: [false, [Validators.requiredTrue]],   // terms of service
      hasNotificationsSound: false,
      hasSubscriptionEmailNotifications: true,
      proAccount: false
    });
  }

  get form(): UntypedFormGroup {
    return this.profileForm;
  }

  get firstName(): AbstractControl {
    return this.profileForm.get('firstName');
  }

  get lastName(): AbstractControl {
    return this.profileForm.get('lastName');
  }

  get password(): AbstractControl {
    return this.profileForm.get('password');
  }

  get email(): AbstractControl {
    return this.profileForm.get('email');
  }

  get phoneNumbers(): UntypedFormArray {
    return this.profileForm.get('phoneNumbers') as UntypedFormArray;
  }

  get mobile(): AbstractControl {
    return this.profileForm.get('phoneNumbers').get('mobile');
  }

  get home(): AbstractControl {
    return this.profileForm.get('phoneNumbers').get('home');
  }

  get hasAcceptedTos(): AbstractControl {
    return this.profileForm.get('hasAcceptedTos');
  }

  get hasNotificationsSound(): AbstractControl {
    return this.profileForm.get('hasNotificationsSound');
  }

  get hasSubscriptionEmailNotifications(): AbstractControl {
    return this.profileForm.get('hasSubscriptionEmailNotifications');
  }

  get proAccount(): AbstractControl {
    return this.profileForm.get('proAccount');
  }

  get organization(): AbstractControl {
    return this.profileForm.get('organization');
  }

  onSubmit(): void {
    this.captchaTouched = true;
    // (1) trigger captcha check to set captchaService status
    this.captcha.checkCaptcha();

    // (2) set form behavior according to captchaService status
    this.captchaService.captchStatus
      .pipe(this.scavenger.collect())
      .subscribe(status => this.captchaValid = status === true);

    if (!this.captchaValid) { return; }

    const formValue = this.profileForm.value;

    const organizationValue = formValue.organization ?? '';
    if (this.proAccount.value && (!organizationValue || organizationValue.trim() === '')) {
      return;
    }

    const mobilePhoneNumber = formValue.phoneNumbers.mobile ? formValue.phoneNumbers.mobile.e164Number : null;
    const homePhoneNumber = formValue.phoneNumbers.home ? formValue.phoneNumbers.home.e164Number : null;
    const newUser = {
      title: formValue.gender,
      firstname: formValue.firstName,
      lastname: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      hasEmailNotification: formValue.notification,
      registrationNumber: formValue.registrationNumber,
      preferredAreaId: formValue.preferredArea,
      organization: formValue.organization,
      shipName: formValue.shipName,
      homeport: formValue.homeport,
      phoneNumber: homePhoneNumber,
      hasAcceptedTos: formValue.hasAcceptedTos,
      mobilePhoneNumber,
      hasNotificationsSound: formValue.hasNotificationsSound,
      hasSubscriptionEmailNotifications: formValue.hasSubscriptionEmailNotifications,
      proAccount: formValue.proAccount
    };

    // call to ping-api to create public user
    // disable submit button and display waiting button during processing to avoid submit twice
    this.submitting = true;
    this.userService.createUser(newUser)
      .pipe(this.scavenger.collect())
      .subscribe(
        () => {
          // if success then show modal dialog before redirect
          this.submitError = null;
          this.submitting = false;
          this.showModalDialog();
        },
        response => {
          // if has error then display it
          if (response.hasOwnProperty('email')) {
            this.emailCreationError = `account.creation.errors.${response.email}`;
          }

          if (response.hasOwnProperty('password')) {
            this.passwordCreationError = `account.creation.errors.${response.password}`;
          }
          const responsePayload = response[Object.keys(response)[0]];
          this.submitError = `account.creation.errors.${responsePayload}`;

          // enable submit button to allow user to change fields values
          this.submitting = false;
        }
      );
  }

  /**
   * Event triggered from password and email fields in order to hide submit creation error messages.
   * @param event the event triggered
   */
  onKeypressEvent(event: any): void {
    const target = event.target;
    if ('email' === target.id) { this.submitError = this.emailCreationError = null; }
    if ('password' === target.type) { this.submitError = this.passwordCreationError = null; }
  }

  /**
   * Show the modal dialog of account creation confirmation
   */
  showModalDialog(): void {
    this.displayConfirmModal = true;
  }

  /**
   * Hide the modal dialog of account creation confirmation,
   * then call method to redirect to login form page
   */
  hideModalDialog(): void {
    this.displayConfirmModal = false;
    this.authService.redirectToLoginPage(ProfileMode.PUBLIC, 'account-validation');
  }
}
