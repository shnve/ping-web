import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { checkNumbers as checkNumbersUtil } from '@app/georegulation/georegulation-utils';
import { GeoregulationNumber } from '@app/georegulation/models/georegulation.model';
import MaritimeService from '@app/models/maritime-service.model';

@Component({
  selector: 'georegulation-number-list',
  templateUrl: './georegulation-number-list.component.html',
  styleUrls: ['./georegulation-number-list.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GeoregulationNumberListComponent),
    multi: true
  }]
})
export class GeoregulationNumberListComponent implements ControlValueAccessor {

  @Input() availableYears: string[] = [];

  @Input() availableAuthorities: Array<MaritimeService> = [];

  @Input() yearRange: string;

  @Input() disabled = false;

  @Output() allNumbersValidated = new EventEmitter<boolean>();

  additionalNumbers: Array<GeoregulationNumber> = [];

  invalidNumbers = false;

  onChange = (additionalNumbers: GeoregulationNumber[]) => { };
  onTouched = () => { };

  constructor() { }

  writeValue(additionalNumbers: GeoregulationNumber[]): void {
    if (!additionalNumbers) {
      return;
    }
    this.additionalNumbers = additionalNumbers;
  }

  registerOnChange(fn: (additionalNumbers: GeoregulationNumber[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  addAdditionalNumber(): void {
    this.additionalNumbers.push({
      year: null,
      text: null,
      authorityIds: [],
      date: null
    });
    this.checkNumbers(this.additionalNumbers);
  }

  removeAdditionalNumber(index: number): void {
    this.additionalNumbers.splice(index, 1);
    this.additionalNumbersChanged();
  }

  additionalNumbersChanged() {
    this.checkNumbers(this.additionalNumbers);
    this.onChange(this.additionalNumbers);
  }

  checkNumbers(additionalNumbers: GeoregulationNumber[]): void {
    this.invalidNumbers = !checkNumbersUtil(additionalNumbers);
    this.allNumbersValidated.emit(!this.invalidNumbers);
  }
}
