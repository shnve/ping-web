import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AreasApi } from '@app/api/areas.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import Area from '@app/models/area.model';
import PublicUser from '@app/models/public-user.model';
import { environment } from '@env/environment';
import { Scavenger } from '@wishtack/rx-scavenger';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-user-form',
  templateUrl: './edit-user-form.component.html',
  styleUrls: ['./edit-user-form.component.scss']
})
export class EditUserFormComponent implements OnInit, OnDestroy {
  private readonly scavenger = new Scavenger(this);

  @Input() userId: string;
  @Input() disabled = false;
  @Input() user?: PublicUser;

  sub: Subscription;
  innerSubToDelete = new Subscription();
  form: UntypedFormGroup;
  preferredCountries = [CountryISO.Venezuela, CountryISO.UnitedKingdom];
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  areas$: Observable<Area[]>;
  accessToken: string;
  identifier: string;
  booleanOptions = [true, false];
  isFunctionalAdmin: boolean;
  protected displayLogoutInfo = false;
  private currentEmail: string;

  constructor(private readonly userApi: UsersApi,
    private readonly areaApi: AreasApi,
    private readonly authService: AuthService,
    private readonly alertMessageService: AlertMessageService,
    private readonly formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.isFunctionalAdmin = this.authService.hasRoleFunctionalAdmin();
    this.accessToken = this.authService.getToken();
    if (!this.user) {
      this.sub = this.isFunctionalAdmin ? this.userApi.findOnePublicFromAdmin(this.userId).subscribe(u => this.initUser(u)) : this.userApi.findOnePublic(this.userId, this.accessToken).subscribe(u => this.initUser(u));
    } else {
      this.initUser(this.user);
    }

    this.areas$ = this.areaApi.getAreas();
  }

  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
    this.innerSubToDelete.unsubscribe();
  }

  private initUser(u: PublicUser): void {
    this.identifier = u.identifier;
    this.currentEmail = u.email;
    this.form = this.formBuilder.group({
      title: [{ value: u.title, disabled: this.disabled }, Validators.required],
      firstname: [{ value: u.firstname, disabled: this.disabled }, Validators.required],
      lastname: [{ value: u.lastname, disabled: this.disabled }, Validators.required],
      proAccount: { value: u.proAccount, disabled: this.disabled },
      organization: { value: u.organization, disabled: this.disabled },
      email: [{ value: u.email, disabled: this.disabled }, [Validators.required, Validators.pattern(environment.emailRegexPattern)]],
      identifier: { value: u.identifier, disabled: true },
      phoneNumber: { value: u.phoneNumber, disabled: this.disabled },
      mobilePhoneNumber: { value: u.mobilePhoneNumber, disabled: this.disabled },
      shipName: { value: u.shipName, disabled: this.disabled },
      homePort: { value: u.homePort, disabled: this.disabled },
      registrationNumber: { value: u.registrationNumber, disabled: this.disabled },
      preferredAreaId: { value: u.preferredArea?.id, disabled: this.disabled },
      hasNotificationsSound: { value: u.hasNotificationsSound, disabled: this.disabled },
      hasSubscriptionEmailNotifications: { value: u.hasSubscriptionEmailNotifications, disabled: this.disabled }
    });
  }

  logoutInfoClosed(): void {
    if (!this.authService.isPublicUser()) { return; }
    this.authService.logout();
  }

  editUser(): void {
    if (this.form.invalid) {
      return;
    }
    const organizationValue = this.form.controls['organization'].value ?? '';
    if (this.proAccount.value && (!organizationValue || organizationValue.trim() === '')) {
      return;
    }
    const phoneNumber = this.form.controls['phoneNumber'].value !== null ? this.form.controls['phoneNumber'].value['e164Number'] : null;
    const mobilePhoneNumber = this.form.controls['mobilePhoneNumber'].value !== null ? this.form.controls['mobilePhoneNumber'].value['e164Number'] : null;
    const formattedUser: PublicUser = {
      ...this.form.value,
      phoneNumber,
      mobilePhoneNumber
    };

    if (this.authService.isPublicUser()) {
      this.userApi.publicUserEditProfile(this.accessToken, formattedUser)
        .pipe(this.scavenger.collect())
        .subscribe(
          () => {
            this.showMessage('success', `message.success.api.account-updated`);
            this.authService.updateAuthenticatedUserInfo(this.form.value);
            this.displayLogoutInfo = this.currentEmail !== formattedUser.email;
          },
          () => this.showMessage('error', `message.error.api.account-updated`));
    } else {
      this.userApi.editPublicUser(this.userId, formattedUser).subscribe(
        () => {
          this.showMessage('success', `message.success.api.account-updated`);
          this.authService.updateAuthenticatedUserInfo(this.form.value);
        },
        () => this.showMessage('error', `message.error.api.account-updated`));
    }
  }

  showMessage(severity: MessageSeverity = 'error', detailMessage: string) {
    this.alertMessageService.add({
      id: 'assign-user-maritime-service',
      severity,
      summary: `message.summary.${severity}`,
      detail: detailMessage,
    });
  }

  isInvalidTouchedOrDirty(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field.invalid && (field.dirty || field.touched);
  }

  isPublicUser(): boolean {
    return this.authService.isPublicUser();
  }

  get proAccount(): AbstractControl {
    return this.form.get('proAccount');
  }

  get organization(): AbstractControl {
    return this.form.get('organization');
  }
}
