import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GeoregulationPartFormComponent } from '@app/georegulation/components/georegulation-parts/georegulation-part-form/georegulation-part-form.component';
import { CalendarPeriod, GeoregulationPartForm, SeasonalPeriodFormElement } from '@app/georegulation/models/georegulation.model';
import { isDateRangeValid } from '@app/shared/date-utils';
import Feature from 'ol/Feature';
import { GeoregulationPartsMapComponent } from './georegulation-parts-map/georegulation-parts-map.component';
import { fromLonLat } from 'ol/proj';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

@Component({
  selector: 'georegulation-parts',
  templateUrl: './georegulation-parts.component.html',
  styleUrls: ['./georegulation-parts.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GeoregulationPartsComponent),
    multi: true
  }]
})
export class GeoregulationPartsComponent implements OnChanges, ControlValueAccessor {

  @ViewChild('geometriesForm') geometriesForm: GeoregulationPartsMapComponent;
  @ViewChild('georegulationPartForm') georegulationPartForm: GeoregulationPartFormComponent;

  selectedPart: GeoregulationPartForm;

  @Input() disabled = false;
  @Input() timezone: string;
  @Input() featureParts: GeoregulationPartForm[] = [];
  @Input() showRestrictionCategories = false;
  @Input() showCalendarPeriods = false;
  @Input() issuingServiceId: string;
  @Input() submitted: boolean;

  onChange = (featureParts: GeoregulationPartForm[]) => { };
  onTouched = () => { };

  constructor(private readonly cdRef: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.featureParts?.length) {
      this.featureParts = [];
      return;
    }

    if (changes.featureParts && this.featureParts) {
      this.selectedPart = this.featureParts?.length ? this.featureParts[0] : null;
      this.updateFeaturePartsFromForm();
    }
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
      features: [],
      calendarPeriods: [],
      seasonalPeriods: [],
      types: [],
      informations: {},
      lengthVessel: null,
      choiceLengthVessel: null,
      grossTonnageVessel: null,
      choiceGrossTonnageVessel: null,
      unitsGrossTonnageVessel: null,
      isCommercialShip: false,
    };

    this.featureParts = [...this.featureParts, this.selectedPart];
    this.featurePartsChanged();
  }

  selectPart(featurePart: GeoregulationPartForm): void {
    if (featurePart === this.selectedPart) {
      return;
    }
    this.updateFeaturePartsFromForm();
    this.selectedPart = featurePart;
    this.cdRef.detectChanges();
  }

  partChanged(partMainInfo: GeoregulationPartForm): void {
    const selectedPartIndex = this.featureParts.findIndex(part => part === this.selectedPart);
    this.featureParts[selectedPartIndex].informations = partMainInfo.informations;
    this.featureParts[selectedPartIndex].types = partMainInfo.types;
    this.featureParts[selectedPartIndex].lengthVessel = partMainInfo.lengthVessel;
    this.featureParts[selectedPartIndex].choiceLengthVessel = partMainInfo.choiceLengthVessel;
    this.featureParts[selectedPartIndex].grossTonnageVessel = partMainInfo.grossTonnageVessel;
    this.featureParts[selectedPartIndex].choiceGrossTonnageVessel = partMainInfo.choiceGrossTonnageVessel;
    this.featureParts[selectedPartIndex].unitsGrossTonnageVessel = partMainInfo.unitsGrossTonnageVessel;
    this.featureParts[selectedPartIndex].isCommercialShip = partMainInfo.isCommercialShip;
    // Copy array to detect change
    this.featureParts = [...this.featureParts];
    this.featurePartsChanged();
  }

  updateFeaturePartsFromForm(): void {
    if (!this.geometriesForm) {
      return;
    }
    const selectedPartIndex = this.featureParts.findIndex(part => part === this.selectedPart);
    this.selectedPart.features = this.geometriesForm.getGeometries();
    this.featureParts[selectedPartIndex] = this.selectedPart;
    // Copy array to detect change
    this.featureParts = [...this.featureParts];
    this.featurePartsChanged();
  }

  removePart(partToRemove: GeoregulationPartForm): void {
    const partToRemoveIndex = this.featureParts.findIndex(part => part === partToRemove);
    this.featureParts.splice(partToRemoveIndex, 1);
    if (partToRemove === this.selectedPart) {
      this.selectedPart = null;
    }
    this.featureParts = [...this.featureParts];
    this.featurePartsChanged();
  }

  areFeaturePartsValid(): Map<number, boolean> {
    return this.featureParts.reduce((map, featurePart, index) => {
      const valid = this.hasValidPart(featurePart) && this.hasValidCalendarPeriods(featurePart.calendarPeriods) && this.hasValidSeasonalPeriods(featurePart.seasonalPeriods);
      map.set(index, valid);
      return map;
    }, new Map<number, boolean>());
  }

  hasValidPart(featurePart: GeoregulationPartForm): boolean {
    return !!featurePart;
  }

  getNumberForSearchedPart(searchedPart: GeoregulationPartForm): number {
    return this.featureParts.findIndex(part => part === searchedPart) + 1;
  }

  private hasValidCalendarPeriods(calendarPeriods: CalendarPeriod[]): boolean {
    return calendarPeriods.every(calendarPeriod =>
      isDateRangeValid(calendarPeriod.dateStart, null, calendarPeriod.dateEnd, null)
    );
  }

  private hasValidSeasonalPeriods(seasonalPeriods: SeasonalPeriodFormElement[]): boolean {
    return seasonalPeriods.every(seasonalPeriod => !seasonalPeriod.isInvalid);
  }

  private featurePartsChanged(): void {
    this.onChange(this.featureParts);
  }

  writeValue(featureParts: GeoregulationPartForm[]): void {
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
}
