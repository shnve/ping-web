import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SeasonalPeriodFormElement } from '@app/georegulation/models/georegulation.model';

@Component({
  selector: 'georegulation-seasonal-periods',
  templateUrl: './georegulation-seasonal-periods.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GeoregulationSeasonalPeriodsComponent),
    multi: true
  }]
})
export class GeoregulationSeasonalPeriodsComponent implements ControlValueAccessor {
  @Input() disabled = false;

  seasonalPeriods: SeasonalPeriodFormElement[] = [];

  onChange = (seasonPeriods: SeasonalPeriodFormElement[]) => { };
  onTouched = () => { };

  constructor() { }

  writeValue(seasonalPeriods: SeasonalPeriodFormElement[]): void {
    this.seasonalPeriods = seasonalPeriods;
  }

  registerOnChange(fn: (seasonalPeriods: SeasonalPeriodFormElement[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  add(): void {
    this.seasonalPeriods.push({
      dayStart: null,
      monthStart: null,
      dayEnd: null,
      monthEnd: null,
      isInvalid: true
    });
  }

  seasonalPeriodsChanged(): void {
    this.onChange(this.seasonalPeriods);
  }

  remove(index: number): void {
    this.seasonalPeriods.splice(index, 1);
    this.seasonalPeriodsChanged();
  }
}
