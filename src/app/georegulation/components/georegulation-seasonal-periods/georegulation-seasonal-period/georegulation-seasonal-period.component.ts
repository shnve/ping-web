import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SeasonalPeriod, SeasonalPeriodFormElement } from '@app/georegulation/models/georegulation.model';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'georegulation-seasonal-period',
  templateUrl: './georegulation-seasonal-period.component.html',
  styleUrls: ['./georegulation-seasonal-period.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GeoregulationSeasonalPeriodComponent),
    multi: true
  }]
})
export class GeoregulationSeasonalPeriodComponent implements OnInit, ControlValueAccessor {

  @Input() disabled = false;

  seasonalPeriod: SeasonalPeriodFormElement;
  availableDays: number[] = [];
  availableMonths: SelectItem[] = [];
  dayStart: number;
  monthStart: number;
  dayEnd: number;
  monthEnd: number;
  isInvalid: boolean;

  onChange = (seasonalPeriod: SeasonalPeriodFormElement) => { };
  onTouched = () => { };

  constructor() { }

  ngOnInit(): void {
    this.availableDays = [...Array(32).keys()];
    this.availableDays = this.availableDays.splice(1);
    this.availableMonths = [
      { 'label': 'months.january', value: 1 },
      { 'label': 'months.february', value: 2 },
      { 'label': 'months.march', value: 3 },
      { 'label': 'months.april', value: 4 },
      { 'label': 'months.may', value: 5 },
      { 'label': 'months.june', value: 6 },
      { 'label': 'months.july', value: 7 },
      { 'label': 'months.august', value: 8 },
      { 'label': 'months.september', value: 9 },
      { 'label': 'months.october', value: 10 },
      { 'label': 'months.november', value: 11 },
      { 'label': 'months.december', value: 12 }
    ];
  }

  writeValue(seasonalPeriod: SeasonalPeriodFormElement): void {
    if (!seasonalPeriod) {
      return;
    }
    this.seasonalPeriod = seasonalPeriod;
    this.dayStart = this.seasonalPeriod.dayStart;
    this.monthStart = this.seasonalPeriod.monthStart;
    this.dayEnd = this.seasonalPeriod.dayEnd;
    this.monthEnd = this.seasonalPeriod.monthEnd;
    this.validate();
  }

  registerOnChange(fn: (seasonalPeriod: SeasonalPeriod) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  dayStartChanged(): void {
    this.validate();
    this.seasonalPeriod.dayStart = this.dayStart;
  }

  monthStartChanged(): void {
    this.validate();
    this.seasonalPeriod.monthStart = this.monthStart;
  }

  dayEndChanged(): void {
    this.validate();
    this.seasonalPeriod.dayEnd = this.dayEnd;
  }

  monthEndChanged(): void {
    this.validate();
    this.seasonalPeriod.monthEnd = this.monthEnd;
  }

  private validate(): void {
    const noDate = !this.dayStart && !this.monthStart && !this.dayEnd && !this.monthEnd;
    const invalidDateStart = !!((this.dayStart && !this.monthStart) || (!this.dayStart && this.monthStart));
    const invalidDateEnd = !!((this.dayEnd && !this.monthEnd) || (!this.dayEnd && this.monthEnd));
    this.seasonalPeriod.isInvalid = this.isInvalid = noDate || invalidDateStart || invalidDateEnd;
  }

}
