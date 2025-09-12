import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { WarningCreationData } from '@app/admin/admin-warning/models/creation-warning.model';
import { CreationService } from '@app/admin/admin-warning/services/creation.service';
import { DiffusionNavtexSource } from '@app/models/serie.model';
import { DiffusionNavtexEmergencyLevel, DiffusionNavtexType } from '@app/models/warning.model';
import { shouldHaveFilledEndDayAndEndHourTogetherValidator } from './diffusion-navtex-configuration-end-validator';

const NUMERIC_PATTERN = /^\d{1,2}$/;
const NUMERIC_VALIDATOR = Validators.pattern(NUMERIC_PATTERN);

@Component({
  selector: 'aw-diffusion-navtex-configuration',
  templateUrl: './diffusion-navtex-configuration.component.html',
  styleUrls: ['./diffusion-navtex-configuration.component.scss']
})
export class DiffusionNavtexConfigurationComponent implements OnInit {
  @Input() disabled = false;
  @Input() warning: WarningCreationData;

  navtexConfigurationForm: UntypedFormGroup;
  displayEndDayHour = false;
  displayNitonNumber = false;
  displayCommunicationType = false;
  submitted = false;

  emergencyLevels = Object.keys(DiffusionNavtexEmergencyLevel).map(k => DiffusionNavtexEmergencyLevel[k as any]);
  communicationTypes = Object.keys(DiffusionNavtexType);

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly creationService: CreationService) {
  }

  ngOnInit(): void {
    this.buildNavtexConfigurationForm();
  }

  private buildNavtexConfigurationForm(): void {
    this.navtexConfigurationForm = this.fb.group({
      emergencyLevel: [{ value: this.warning?.navtexConfig?.emergencyLevel ?? this.emergencyLevels[0], disabled: this.disabled }, Validators.required],
      communicationType: [{ value: this.warning?.navtexConfig?.communicationType, disabled: this.disabled }, Validators.required]
    });

    const currentNavtexSource = this.creationService.getNavtexSource();
    const shouldAddEndDayHourControls = [DiffusionNavtexSource.B, DiffusionNavtexSource.T].includes(currentNavtexSource);

    this.displayCommunicationType = DiffusionNavtexSource.N !== currentNavtexSource;
    this.displayCommunicationType ? !this.communicationType.value && this.navtexConfigurationForm.get('communicationType').setValue('A')
      : this.navtexConfigurationForm.controls['communicationType'].disable();

    if (shouldAddEndDayHourControls) {
      this.addEndDayHourControls();
    } else if (DiffusionNavtexSource.N === currentNavtexSource) {
      this.addNitonControls();
    }
  }

  private addEndDayHourControls(): void {
    this.displayEndDayHour = true;
    // Source B or T -> day + hour
    this.navtexConfigurationForm = this.fb.group(
      {
        ...this.navtexConfigurationForm.controls,
        endDay: [{ value: this.warning?.navtexConfig?.endDay, disabled: this.disabled }, [NUMERIC_VALIDATOR, Validators.min(1), Validators.max(31)]],
        endHour: [{ value: this.warning?.navtexConfig?.endHour, disabled: this.disabled }, [NUMERIC_VALIDATOR, Validators.min(0), Validators.max(23)]]
      },
      {
        validators: [shouldHaveFilledEndDayAndEndHourTogetherValidator()]
      }
    );
    if (this.disabled) {
      this.endDay.disable();
      this.endHour.disable();
    } else {
      this.endDay.enable();
      this.endHour.enable();
    }
  }

  private addNitonControls(): void {
    this.displayNitonNumber = true;
    const nitonNumberValidators = [NUMERIC_VALIDATOR, Validators.min(1), Validators.max(99), Validators.required];
    const cancelNitonNumberValidators = [NUMERIC_VALIDATOR, Validators.min(1), Validators.max(99)];
    // Source N -> nitonNumber + cancelNitonNumber
    this.navtexConfigurationForm = this.fb.group({
      ...this.navtexConfigurationForm.controls,
      nitonNumber: [{ value: this.warning?.navtexConfig?.nitonNumber, disabled: this.disabled }, nitonNumberValidators],
      cancelNitonNumber: [{ value: this.warning?.navtexConfig?.cancelNitonNumber, disabled: this.disabled }, cancelNitonNumberValidators]
    });
    if (this.disabled) {
      this.nitonNumber.disable();
      this.cancelNitonNumber.disable();
    } else {
      this.nitonNumber.enable();
      this.cancelNitonNumber.enable();
    }
  }

  get emergencyLevel(): AbstractControl {
    return this.navtexConfigurationForm.get('emergencyLevel');
  }

  get communicationType(): AbstractControl {
    return this.navtexConfigurationForm.get('communicationType');
  }

  get endDay(): AbstractControl {
    return this.navtexConfigurationForm.get('endDay');
  }

  get endHour(): AbstractControl {
    return this.navtexConfigurationForm.get('endHour');
  }

  get nitonNumber(): AbstractControl {
    return this.navtexConfigurationForm.get('nitonNumber');
  }

  get cancelNitonNumber(): AbstractControl {
    return this.navtexConfigurationForm.get('cancelNitonNumber');
  }

  saveNavtexConfiguration(): boolean {
    this.submitted = true;
    const formValue = this.navtexConfigurationForm.value;
    this.creationService.getWarningData().navtexConfig = {
      emergencyLevel: formValue.emergencyLevel,
      communicationType: formValue.communicationType,
      endDay: formValue.endDay,
      endHour: formValue.endHour,
      nitonNumber: formValue.nitonNumber,
      cancelNitonNumber: formValue.cancelNitonNumber
    };
    if (!this.navtexConfigurationForm.valid && this.navtexConfigurationForm.touched) { return false; }
    return true;
  }
}
