import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateRange } from '@app/shared/models/date-range.model';

@Component({
  selector: 'shared-input-date-ranges',
  templateUrl: './input-date-ranges.component.html',
  styleUrls: ['./input-date-ranges.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputDateRangesComponent),
    multi: true
  }]
})
export class InputDateRangesComponent implements ControlValueAccessor {
  @Input() showDateTimeToggleButton = true;
  @Input() disabled = false;
  @Input() enableTimezone = false;

  dateRanges: Array<DateRange> = [];
  invalidDateTime: Map<number, boolean> = new Map();

  onChange = (dateRange: DateRange[]) => { };
  onTouched = () => { };

  constructor() { }

  writeValue(dateRanges: DateRange[]) {
    this.dateRanges = dateRanges;
  }

  registerOnChange(fn: (dateRanges: DateRange[]) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  addDateRange() {
    this.dateRanges.push({
      dateStart: null,
      dateEnd: null,
      timeOfDayStart: null,
      timeOfDayEnd: null
    });
  }

  removeDateRange(index: number) {
    this.dateRanges.splice(index, 1);

    // rearrange map used to display invalid datetime message
    const mapLength = this.invalidDateTime.size;
    this.invalidDateTime.delete(index);
    if (index < mapLength - 1) {
      let newIndex = index;
      let oldIndex = index + 1;
      while (oldIndex < mapLength) {
        this.invalidDateTime.set(newIndex, this.invalidDateTime.get(oldIndex));
        this.invalidDateTime.delete(oldIndex);
        newIndex++;
        oldIndex++;
      }
    }
    this.dateRangesChanged();
  }

  dateRangesChanged() {
    this.onChange(this.dateRanges);
  }

  onDateTimeValidated(validDateTime: boolean, idx: number): void {
    this.invalidDateTime.set(idx, !validDateTime);
  }

  isInvalidDateTime(idx: number): boolean {
    return this.invalidDateTime.get(idx);
  }
}
