import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { AreaSelectOption, AreasFacade } from '@app/facades/areas.facade';
import { ProUserServices, ServiceRole } from '@app/models/pro-user.model';
import { dateValidated } from '@app/shared/date-utils';
import { DateRange } from '@app/shared/models/date-range.model';
import { noWhitespaceValidator } from '@app/shared/ui-utils';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SharedSurveyDescriptionFormData {
  nameAndLocation: string;
  areaId: string;
  achievementPeriod: DateRange;
  serviceId?: string;
}

@Component({
  selector: 'shared-survey-description',
  templateUrl: './shared-survey-description.component.html',
  styleUrls: ['../../abstract-survey.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedSurveyDescriptionComponent),
      multi: true
    }
  ]
})
@Localize()
export class SharedSurveyDescriptionComponent implements ControlValueAccessor, OnInit, OnChangeLang {
  @Input() submitted: boolean;
  @Input() achievementPeriodRequired = true;
  @Input() achievementPeriodAsterisk = false;
  @Output() dateTimeValidated = new EventEmitter<boolean>();

  survey: SharedSurveyDescriptionFormData;
  protected form: UntypedFormGroup;
  protected displayedAreaLabel: string;
  protected areas$: Observable<AreaSelectOption[]>;
  protected invalidDate = false;
  protected hasRoleServiceUser: boolean;
  protected proUserServices$: Observable<ProUserServices[]>;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly areasFacade: AreasFacade,
    private readonly translate: TranslateService,
    private readonly authService: AuthService,
    private readonly usersApi: UsersApi) {
    this.areas$ = this.areasFacade.getAreaSelectOptions$();
    this.displayedAreaLabel = this.getDisplayedAreaLabel(this.translate.currentLang);
  }

  onChange = (survey: SharedSurveyDescriptionFormData) => { };
  onTouched = () => { };

  writeValue(survey: SharedSurveyDescriptionFormData): void {
    if (!survey) { return; }
    this.survey = survey;
  }

  registerOnChange(fn: (survey: SharedSurveyDescriptionFormData) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  ngOnInit(): void {
    this.hasRoleServiceUser = this.authService.hasRoleServiceUser();
    if (this.hasRoleServiceUser) {
      const proUserId = this.authService.getAuthenticatedUser()?.id;
      this.proUserServices$ = this.usersApi.findProServices(proUserId)
        .pipe(
          map(proServices =>
            proServices.filter(proService => 
              !!proService.surveyOwner && [ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_ADMIN].includes(proService.serviceRole)
            )
          )
        );
    }
    this.initForm();
  }

  onChangeLang(event: LangChangeEvent): void {
    this.displayedAreaLabel = this.getDisplayedAreaLabel(event.lang);
  }

  private getDisplayedAreaLabel(lang: string): string {
    return lang === 'fr' ? 'name' : 'internationalName';
  }

  protected initForm(): void {
    this.form = this.formBuilder.group({
      nameAndLocation: [this.survey?.nameAndLocation, [Validators.required, noWhitespaceValidator]],
      areaId: [this.survey?.areaId, Validators.required],
      achievementPeriod: [this.survey?.achievementPeriod, this.achievementPeriodRequired ? Validators.required : null],
      serviceId: [this.survey?.serviceId ?? this.authService.getAuthenticatedUser()?.serviceId, this.hasRoleServiceUser ? Validators.required : null]
    });
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }

  get nameAndLocation(): AbstractControl {
    return this.form?.get('nameAndLocation');
  }

  get areaId(): AbstractControl {
    return this.form?.get('areaId');
  }

  get achievementPeriod(): AbstractControl {
    return this.form?.get('achievementPeriod');
  }

  get serviceId(): AbstractControl {
    return this.form?.get('serviceId');
  }

  protected dateValidated(validDate: boolean): void {
    this.invalidDate = dateValidated(validDate, this.achievementPeriod.value, this.achievementPeriodRequired);
    this.dateTimeValidated.emit(!this.invalidDate);
  }
}
