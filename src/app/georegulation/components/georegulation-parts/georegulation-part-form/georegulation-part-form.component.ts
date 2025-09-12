import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { GeoregulationPart, GeoregulationPartForm, GeoregulationPartRestrictionVessel, GeoregulationPartUnitGrossTonnage, RestrictionGrossTonnageVessel, RestrictionLengthVessel, TRANSLATIONS_LIST_GEOREGULATION_PART_RESTRICTION_VESSEL, TRANSLATIONS_LIST_GEOREGULATION_PART_VESSEL_UNIT_TONNAGE, restrictionCategories } from '@app/georegulation/models/georegulation.model';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { pick } from 'lodash-es';
import Feature from 'ol/Feature';

export type LabelValueArray = Array<{label: string, value: string}>;

@Component({
  selector: 'georegulation-part-form',
  templateUrl: './georegulation-part-form.component.html',
  styleUrls: ['./georegulation-part-form.component.scss']
})
@Localize()
export class GeoregulationPartFormComponent implements OnDestroy, OnChanges, OnChangeLang {

  @Input() geometries: Feature[] = [];
  @Input() validFeaturePart = false;
  @Input() featurePart: GeoregulationPartForm;
  @Input() timezone: string;
  @Input() showRestrictionCategories = false;
  @Input() showCalendarPeriods = false;
  @Input() disabled = false;
  @Input() partIndex = 0;
  @Input() submitted = false;

  @Output() partChanged = new EventEmitter<GeoregulationPart>();
  @Output() restrictionVesselChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  private readonly scavenger = new Scavenger(this);

  form: UntypedFormGroup;
  availableRestrictionCategories = [];


  protected listGeoregulationRestrictionVessel: LabelValueArray;
  protected listGeoregulationPartVesselUnitGrossTonnage: LabelValueArray;

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly translate: TranslateService) {

    this.buildLocalizedItems();

    this.form = this.fb.group({
        calendarPeriods: [[[]]],
        seasonalPeriods: [[[]]],
        types: [[[]]],
        informations: [{}],
        lengthVessel: [null, this.restrictionValidator('lengthVessel')],
        choiceLengthVessel: [null, this.restrictionValidator('choiceLengthVessel')],
        grossTonnageVessel: [null, this.restrictionValidator('grossTonnageVessel')],
        choiceGrossTonnageVessel: [null, this.restrictionValidator('choiceGrossTonnageVessel')],
        unitsGrossTonnageVessel: [null, this.restrictionValidator('unitsGrossTonnageVessel')],
        isCommercialShip: false,
      }
    );

    this.form.valueChanges.pipe(this.scavenger.collect())
      .subscribe(values => this.partChanged.emit(values));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.featurePart) {
      this.updateFormFromFeaturePart(this.featurePart);
    }
  }

  ngOnDestroy(): void { }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }

  get isCommercialShip(): AbstractControl {
    return this.form.get('isCommercialShip');
  }

  get lengthVessel(): AbstractControl {
    return this.form.get('lengthVessel');
  }

  get choiceLengthVessel(): AbstractControl {
    return this.form.get('choiceLengthVessel');
  }

  get grossTonnageVessel(): AbstractControl {
    return this.form.get('grossTonnageVessel');
  }

  get choiceGrossTonnageVessel(): AbstractControl {
    return this.form.get('choiceGrossTonnageVessel');
  }

  get unitsGrossTonnageVessel(): AbstractControl {
    return this.form.get('unitsGrossTonnageVessel');
  }

  private buildLocalizedItems(): void {
    this.availableRestrictionCategories = restrictionCategories.map(({ key, value }) => this.translateRestrictionCategories(key, value));
    this.listGeoregulationRestrictionVessel = Object.keys(GeoregulationPartRestrictionVessel).map(key => ({
      label: this.translate.instant(TRANSLATIONS_LIST_GEOREGULATION_PART_RESTRICTION_VESSEL[key]).toLowerCase(),
      value: GeoregulationPartRestrictionVessel[key] !== 'null' ? GeoregulationPartRestrictionVessel[key] : null
    }));
  
    this.listGeoregulationPartVesselUnitGrossTonnage = Object.keys(GeoregulationPartUnitGrossTonnage).map(key => ({
      label: this.translate.instant(TRANSLATIONS_LIST_GEOREGULATION_PART_VESSEL_UNIT_TONNAGE[key]),
      value: GeoregulationPartUnitGrossTonnage[key] !== 'null' ? GeoregulationPartUnitGrossTonnage[key] : null
    }));
  }

  private translateRestrictionCategories(key: string, value: string): any {
    return {
      key,
      value: this.translate.instant(value)
    };
  }

  private updateFormFromFeaturePart(part: GeoregulationPartForm): void {
    this.form.setValue(
      pick(part, [
        'calendarPeriods',
        'seasonalPeriods',
        'informations',
        'types',
        'lengthVessel',
        'choiceLengthVessel',
        'grossTonnageVessel',
        'choiceGrossTonnageVessel',
        'unitsGrossTonnageVessel',
        'isCommercialShip'
      ]),
      { emitEvent: false }
    );
    this.form.updateValueAndValidity();
  }

  public choiceRestrictionUpdate($event: any): void {
    const controlName = $event.target.id;
    const isLengthVessel = controlName === RestrictionLengthVessel.LENGTH_VESSEL;
    const enumDepend = isLengthVessel ? RestrictionLengthVessel : RestrictionGrossTonnageVessel;
    const control = this.form.get(controlName);
    const dependControlsName = Object.values(enumDepend).filter(key => key !== controlName);
    const isControlNull = control.value === null || control.value === '' || control.value === ' ';
    const isDependControlNull = Object.values(dependControlsName).every(value => this.form.get(value).value === null);

    if (isDependControlNull && !isControlNull) {
      if (isLengthVessel) {
        this.choiceLengthVessel.setValue(GeoregulationPartRestrictionVessel.GREATER_OR_EQUAL);
      } else {
        this.choiceGrossTonnageVessel.setValue(GeoregulationPartRestrictionVessel.GREATER_OR_EQUAL);
        this.unitsGrossTonnageVessel.setValue(GeoregulationPartUnitGrossTonnage.UMS);
      }
    }
  }

  private restrictionValidator(mainControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const customValidator = { restrictionVessel: true };
      const enumDepend = control === control.parent?.controls['lengthVessel'] || control === control.parent?.controls['choiceLengthVessel'] ? RestrictionLengthVessel : RestrictionGrossTonnageVessel;
      const isControlNull = !control.value;
      let allDependControlNotNull = true;
      let allDependControlNull = true;
      const dependControlsName = Object.values(enumDepend).filter(key => key !== mainControlName);
      const setErrorOnControlNull = (): void => {
        Object.values(dependControlsName).forEach(value => {
          const errors = control.parent.controls[value].value === null ? customValidator : null;
          control.parent.controls[value].setErrors(errors);
        });
      };

      if (this.form) {
        dependControlsName.forEach(controlName => {
          const dependControl = control.parent.controls[controlName].value;
          if (!dependControl && dependControl !== 0) {
            allDependControlNotNull = false;
          } else {
            allDependControlNull = false;
          }
        });

        if (isControlNull && control.value !== 0) {
          if (!allDependControlNull) {
            return customValidator;
          }
          Object.values(enumDepend).forEach(value => control.parent.controls[value].setErrors(null));
          return null;
        } else {
          setErrorOnControlNull();
        }
        this.form.updateValueAndValidity();
      }
      return null;
    };
  }

}
