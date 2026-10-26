import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GlobalConstants } from '@app/global-constants';
import { InfosourcePartForm, InfosourcePartFormMainInfo } from '@app/infosource/models/infosource.model';
import { isDateRangeValid } from '@app/shared/date-utils';
import { DateRange } from '@app/shared/models/date-range.model';
import { checkIfSpacesOnly } from '@app/shared/ui-utils';
import { isEmpty } from 'lodash-es';
import { Feature } from 'ol';
import Geometry from 'ol/geom/Geometry';
import { VectorSourceEvent } from 'ol/source/Vector';
import { InfosourcePartsMapComponent } from '../infosource-parts-map/infosource-parts-map.component';
import { initValidFeaturePartTypeDefaultValue, ValidFeaturePartType } from './infosource-feature-part-form/infosource-input-information/infosource-input-information.component';

@Component({
  selector: 'infosource-parts',
  templateUrl: './infosource-parts.component.html',
  styleUrls: ['./infosource-parts.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InfosourcePartsComponent),
    multi: true
  }]
})
export class InfosourcePartsComponent implements OnInit, ControlValueAccessor {

  @ViewChild('geometriesForm') geometriesForm: InfosourcePartsMapComponent;
  selectedPart: InfosourcePartForm;
  @Input() disabled = false;
  @Input() timezone: string;
  @Input() featureParts: InfosourcePartForm[] = [];
  @Input() submitted = false;
  isMissingLocalisation = true;

  @Output() eventOnFeature = new EventEmitter<VectorSourceEvent<Geometry>>();
  @Output() eventOnChangeInfosourcePartsForms = new EventEmitter<InfosourcePartForm>();
  @Output() eventOnInputInformation = new EventEmitter<InfosourcePartFormMainInfo>();

  onChange = (featureParts: InfosourcePartForm[]) => { };
  onTouched = () => { };

  constructor(private readonly cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (!this.featureParts?.length) {
      this.featureParts = [];
    }
    this.updateFeaturePartsFromForm();
  }

  getGeometries(): Feature[] {
    if (!this.geometriesForm) {
      return [];
    }
    return this.geometriesForm.getGeometries();
  }

  addFeaturePart(): void {
    this.updateFeaturePartsFromForm();
    this.selectedPart = {
      localisation: [],
      dateRanges: [],
      information: {},
      geometries: []
    };

    this.featureParts = [...this.featureParts, this.selectedPart];
    this.featurePartsChanged();
    this.checkIfMissingLocalisation(true);
    this.eventOnChangeInfosourcePartsForms.emit();
  }

  selectPart(featurePart: InfosourcePartForm): void {
    if (featurePart === this.selectedPart) {
      return;
    }
    this.updateFeaturePartsFromForm();
    this.selectedPart = featurePart;
    this.checkIfMissingLocalisation(true);
    this.cdRef.detectChanges();
  }

  checkIfMissingLocalisation(isSelectedPart?: boolean): void {
    this.isMissingLocalisation = isSelectedPart ? !this.selectedPart.geometries.length : !this.getGeometries().length;
  }

  changeSelectedPart(partMainInfo: InfosourcePartFormMainInfo): void {
    const selectedPartIndex = this.featureParts.findIndex(part => part === this.selectedPart);
    this.featureParts[selectedPartIndex].information = partMainInfo.information;
    this.eventOnInputInformation.emit(partMainInfo);
    // Copy array to detect change
    this.featureParts = [...this.featureParts];
    this.featurePartsChanged();
  }

  updateFeaturePartsFromForm(): void {
    if (!this.geometriesForm) {
      return;
    }
    const selectedPartIndex = this.featureParts.findIndex(part => part === this.selectedPart);
    this.selectedPart.localisation = this.geometriesForm.getGeometries();
    this.selectedPart.geometries = this.geometriesForm.getGeometries();
    this.checkIfMissingLocalisation();
    this.featureParts[selectedPartIndex] = this.selectedPart;
    // Copy array to detect change
    this.featureParts = [...this.featureParts];
    this.featurePartsChanged();
    this.eventOnChangeInfosourcePartsForms.emit();
  }

  removePart(partToRemove: InfosourcePartForm): void {
    const partToRemoveIndex = this.featureParts.findIndex(part => part === partToRemove);
    this.featureParts.splice(partToRemoveIndex, 1);
    if (partToRemove === this.selectedPart) {
      this.selectedPart = null;
    }
    this.featureParts = [...this.featureParts];
    this.featurePartsChanged();
    this.eventOnChangeInfosourcePartsForms.emit();
  }

  areFeaturePartsValid(): Map<number, boolean> {
    return this.featureParts.reduce((map, featurePart, index) => {
      const langsValid = this.hasValidInformation(featurePart);
      const valid = langsValid['es'] && langsValid['en'] && this.hasValidDateRanges(featurePart.dateRanges);
      map.set(index, valid);
      return map;
    }, new Map<number, boolean>());
  }

  hasValidInformation(featurePart: InfosourcePartForm): ValidFeaturePartType {
    if (!featurePart) { return initValidFeaturePartTypeDefaultValue; }
    const informationEs = featurePart?.information?.['es'] ?? featurePart?.information?.['fr'];
    const informationEn = featurePart?.information?.['en'];
    return {
      'es': !isEmpty(informationEs) && !checkIfSpacesOnly(informationEs),
      'en': !checkIfSpacesOnly(informationEn)
    };
  }

  getNumberForSearchedPart(searchedPart: InfosourcePartForm): number {
    return this.featureParts.findIndex(part => part === searchedPart) + 1;
  }

  private hasValidDateRanges(dateRanges: DateRange[], timeZone = GlobalConstants.USER_TIMEZONE): boolean {
    return dateRanges.every(dateRange =>
      isDateRangeValid(dateRange.dateStart, dateRange.timeOfDayStart, dateRange.dateEnd, dateRange.timeOfDayEnd)
    );
  }

  featurePartsChanged(): void {
    this.onChange(this.featureParts);
  }

  writeValue(featureParts: InfosourcePartForm[]): void {
    if (!featureParts) { return; }
    this.featureParts = [...featureParts];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onGeometryFormFeatureChange(event: VectorSourceEvent<Geometry>): void {
    if (['addfeature', 'removefeature'].includes(event.type)) {
      this.updateFeaturePartsFromForm();
    }
    this.eventOnFeature.emit(event);
  }
}
