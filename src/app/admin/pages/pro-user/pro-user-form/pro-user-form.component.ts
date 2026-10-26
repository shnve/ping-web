import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AreasApi } from '@app/api/areas.api';
import { MaritimeServicesApi } from '@app/api/maritime-services.api';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { checkPhoneNumber } from '@app/components/shared/validators/phone-numbers-required.validator';
import { AlertMessageService } from '@app/core/alert-message.service';
import { OnChangeLang } from '@app/core/localize';
import Area from '@app/models/area.model';
import MaritimeService, { ServiceRole } from '@app/models/maritime-service.model';
import ProUser, { Phone, ProUserRole } from '@app/models/pro-user.model';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Scavenger } from '@wishtack/rx-scavenger';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pro-user-form',
  templateUrl: './pro-user-form.component.html',
  styleUrls: ['./pro-user-form.component.scss']
})
export class ProUserFormComponent implements OnInit, OnDestroy, OnChangeLang {
  @Input() disabled = false;
  @Input() user: ProUser = {
    id: null,
    title: null,
    firstname: null,
    lastname: null,
    email: null,
    role: null,
    hasNotificationsSound: false,
    hasSubscriptionEmailNotifications: true
  };
  serviceRoles = Object.keys(ServiceRole).map(k => ServiceRole[k as any]);
  innerSubToDelete = new Subscription();
  form: UntypedFormGroup;
  preferredCountries = [CountryISO.Venezuela, CountryISO.UnitedKingdom];
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  areas$: Observable<Area[]>;
  maritimeServices$: Observable<MaritimeService[]>;
  displayedLabel: string;
  USER_SERVICE_ROLE = ProUserRole.SERVICE_USER;
  cannotEditServiceAndRole: boolean;
  readonly phoneNumberUtil = PhoneNumberUtil.getInstance();
  private readonly scavenger = new Scavenger(this);
  isCurrentUser: boolean;
  booleanOptions = [true, false];
  isFunctionalAdmin: boolean;
  isEnabled: boolean;
  canControlUserStatus: boolean;

  constructor(private readonly userApi: UsersApi,
    private readonly authService: AuthService,
    private readonly areaApi: AreasApi,
    private readonly router: Router,
    private readonly maritimeServicesApi: MaritimeServicesApi,
    private readonly alertMessageService: AlertMessageService,
    private readonly formBuilder: UntypedFormBuilder,
    public readonly translate: TranslateService) {
  }

  get availableRole(): any {
    return this.isFunctionalAdmin || this.disabled ?
      Object.keys(ProUserRole).map(k => ProUserRole[k as any]) :
      [ProUserRole.SERVICE_USER];
  }

  ngOnInit(): void {
    this.isFunctionalAdmin = this.authService.hasRoleFunctionalAdmin();
    this.isEnabled = this.user.status === 'ENABLED';
    this.cannotEditServiceAndRole = this.authService.hasRoleServiceUser() && this.router.url.endsWith('/edition');
    this.form = this.buildForm();
    this.areas$ = this.areaApi.getAreas();
    const authenticatedUser = this.authService.getAuthenticatedUser();
    this.isCurrentUser = authenticatedUser.id === this.user.id;
    this.canControlUserStatus = !this.isCurrentUser && this.isFunctionalAdmin && !!this.user.identifier;
    this.maritimeServices$ = this.maritimeServicesApi.getMaritimeServices()
      .pipe(map(maritimeServices => {
        if (this.isFunctionalAdmin) {
          return maritimeServices;
        }

        // Case when updating own account
        if (this.isCurrentUser) {
          return maritimeServices.filter(maritimeService => maritimeService.id === authenticatedUser.serviceId);
        }

        // Case when creating new account, only show services where user has SERVICE_ADMIN role or all services if user has FUNCTIONAL_ADMIN role
        if (!this.user.id) {
          if (this.authService.hasRoleFunctionalAdmin()) {
            return maritimeServices;
          }

          const serviceUserRole = this.authService.getAuthenticatedUserServiceRoles().filter(sur => sur.serviceRole === ServiceRole.SERVICE_ADMIN);
          return maritimeServices.filter(maritimeService => serviceUserRole.some(sur => sur.serviceId === maritimeService.id));
        }

        // Case else
        return maritimeServices.filter(maritimeService => maritimeService.id === this.user.serviceId);

      }));
    this.displayedLabel = this.getDisplayedLabel(this.translate.currentLang);
  }

  private getDisplayedLabel(lang: string): string {
    return lang === 'es' ? 'name' : 'internationalName';
  }

  onChangeLang(event): void {
    this.displayedLabel = this.getDisplayedLabel(event.lang);
  }

  ngOnDestroy(): void {
    this.innerSubToDelete.unsubscribe();
  }

  private buildForm(): UntypedFormGroup {
    return this.formBuilder.group({
      title: [{ value: this.user.title, disabled: this.disabled }, Validators.required],
      firstname: [{ value: this.user.firstname, disabled: this.disabled }, Validators.required],
      lastname: [{ value: this.user.lastname, disabled: this.disabled }, Validators.required],
      role: [{ value: this.user.role, disabled: this.disabled }, Validators.required],
      email: [{ value: this.user.email, disabled: this.disabled }, [Validators.required, Validators.pattern(environment.emailRegexPattern)]],
      identifier: { value: this.user.identifier, disabled: true },
      preferredAreaId: [{ value: this.user.preferredAreaId, disabled: this.disabled }],
      serviceId: [{ value: this.user.serviceId, disabled: this.disabled || this.cannotEditServiceAndRole },
      RxwebValidators.required({ conditionalExpression: (x, y) => x.role === ProUserRole.SERVICE_USER })],
      serviceRole: [{ value: this.user.serviceRole, disabled: this.disabled || this.cannotEditServiceAndRole },
      RxwebValidators.required({ conditionalExpression: (x, y) => x.role === ProUserRole.SERVICE_USER })],
      phoneNumbers: this.formBuilder.array(this.user.phoneNumbers && this.user.phoneNumbers.length > 0 ?
        this.user.phoneNumbers.map(phoneNUmber => this.createPhoneNumber(phoneNUmber)) :
        [this.createPhoneNumber(null)]),
      hasNotificationsSound: [{ value: this.user.hasNotificationsSound, disabled: this.disabled }],
      hasSubscriptionEmailNotifications: [{ value: this.user.hasSubscriptionEmailNotifications, disabled: this.disabled }]
    });
  }

  editUser(): void {
    if (this.form.invalid) {
      return;
    }
    const formValue = this.form.getRawValue();
    formValue.phoneNumbers = this.form.value.phoneNumbers.map(phoneNumber => {
      const { internationalNumber, countryCode } = phoneNumber.number;
      const normalizedPhoneNumber = this.phoneNumberUtil.parseAndKeepRawInput(internationalNumber, countryCode);
      const formattedPhoneNumber = this.phoneNumberUtil.format(normalizedPhoneNumber, PhoneNumberFormat.E164);
      return {
        description: phoneNumber.description,
        number: formattedPhoneNumber
      };
    });
    this.innerSubToDelete.add(this.userApi.saveProUser(this.user.id, formValue).subscribe(() => {
      let messageDetail = 'create';
      if (this.user.id) {
        messageDetail = 'edit';
      } else {
        this.router.navigate(['/administration/utilisateur-pro']);
      }
      this.alertMessageService.add({
        severity: 'success',
        summary: 'message.summary.success',
        detail: `message.success.api.${messageDetail}-pro-user`
      });

      const authenticatedUser = this.authService.getAuthenticatedUser();

      // Case when updating own account, force refresh current token
      if (authenticatedUser.id === this.user.id) {
        this.authService.updateAuthenticatedUserInfo(this.form.value);
        this.authService.refreshAccessToken()
          .pipe(this.scavenger.collectByKey('refreshAccessToken'))
          .subscribe();
      }

    }, () => this.alertMessageService.add({
      id: 'account-saved',
      severity: 'error',
      summary: 'message.summary.error',
      detail: 'message.error.api.account-saved'
    })));
  }

  isInvalidOrDirty(fieldName: string): boolean {
    return this.isInvalidOrDirtyByFormGroup(fieldName, this.form);
  }

  isInvalidOrDirtyByFormGroup(fieldName: string, group: UntypedFormGroup): boolean {
    const field = group.get(fieldName);
    return field.invalid && field.dirty;
  }

  private createPhoneNumber(phoneNumber: Phone): UntypedFormGroup {
    if (phoneNumber?.number) {
      const normalized = this.phoneNumberUtil.parse(phoneNumber.number);
      phoneNumber.number = this.phoneNumberUtil.format(normalized, PhoneNumberFormat.INTERNATIONAL);
    }
    return this.formBuilder.group({
      description: [{ value: phoneNumber?.description, disabled: this.disabled }, Validators.required],
      number: [{ value: phoneNumber?.number, disabled: this.disabled }, [Validators.required, checkPhoneNumber()]]
    });
  }

  addPhoneNumber(): void {
    (this.form.get('phoneNumbers') as UntypedFormArray).push(this.createPhoneNumber(null));
  }

  removePhoneNumber(index): void {
    (this.form.get('phoneNumbers') as UntypedFormArray).controls.splice(index, 1);
    this.form.value.phoneNumbers.splice(index, 1);
  }
}
