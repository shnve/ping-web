import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GlobalConstants } from '@app/global-constants';
import {
  isDateRangeValid,
  listTheTimeZones,
  UTC_TIMEZONE_ZERO
} from '@app/shared/date-utils';
import { DateRange } from '@app/shared/models/date-range.model';
import { Calendar } from 'primeng/calendar';

const NB_YEAR_AVAILABLE = 20;

@Component({
  selector: 'shared-input-date-range',
  templateUrl: './input-date-range.component.html',
  styleUrls: ['./input-date-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputDateRangeComponent),
    multi: true
  }]
})
export class InputDateRangeComponent implements ControlValueAccessor {

  @Input() showDateTimeToggleButton = true;
  @Input() disabled = false;
  @Input() enableTimezone = false;
  @Output() dateTimeValidated = new EventEmitter<boolean>();
  @ViewChild('pCalendarDateStart') pCalendarDateStart: Calendar;
  @ViewChild('pCalendarDateEnd') pCalendarDateEnd: Calendar;

  readonly yearRange: string = `${new Date().getFullYear()}:${(new Date()).getFullYear() + NB_YEAR_AVAILABLE}`;
  dateRange: DateRange = {};
  dateStart: string = null;
  dateEnd: string = null;
  invalidDateTime = false;
  timeForStartDateEnabled = false;
  timeForEndDateEnabled = false;

  timezones: Array<{ label: string, value: string }>;
  timezoneReadonly = false;
  periodTimezone: string;

  onChange = (dateRange: DateRange) => { };
  onTouched = () => { };

  constructor() {
    this.timezones = listTheTimeZones();
  }

  protected resetDefaultTimeForStartDateIfNeeded(): void {
    if (this.timeForStartDateEnabled && !this.dateRange.timeOfDayStart) {
      this.pCalendarDateStart.currentHour = 0;
      this.pCalendarDateStart.currentMinute = 0;
    }
  }

  protected resetDefaultTimeForEndDateIfNeeded(): void {
    if (this.timeForEndDateEnabled && !this.dateRange.timeOfDayEnd) {
      this.pCalendarDateEnd.currentHour = 0;
      this.pCalendarDateEnd.currentMinute = 0;
    }
  }

  writeValue(dateRange: DateRange) {
    if (!dateRange) {
      return;
    }
    this.dateRange = dateRange;
    this.timeForStartDateEnabled = !!this.dateRange.timeOfDayStart;
    this.timeForEndDateEnabled = !!this.dateRange.timeOfDayEnd;
    if (this.dateRange.dateStart) {
      this.dateStart = `${this.dateRange.dateStart}${this.dateRange.timeOfDayStart ? (' ' + this.dateRange.timeOfDayStart) : ''}`;
    }
    if (this.dateRange.dateEnd) {
      this.dateEnd = `${this.dateRange.dateEnd}${this.dateRange.timeOfDayEnd ? (' ' + this.dateRange.timeOfDayEnd) : ''}`;
    }
    this.onDateStartChanged(this.dateStart);
    this.onDateEndChanged(this.dateEnd);

    if (this.enableTimezone) {
      this.periodTimezone = dateRange.timezone ?? UTC_TIMEZONE_ZERO;
      this.onSelectTimezone(this.periodTimezone);
    }

    this.checkDateTimeRange();
  }

  registerOnChange(fn: (dateRanges: DateRange) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  onDateStartChanged(dateStart: string): void {
    if (!dateStart) {
      this.dateRange.dateStart = null;
      this.dateRange.timeOfDayStart = null;
      return;
    }

    if (this.timeForStartDateEnabled) {
      const [date, time] = dateStart.split(' ');
      this.dateRange.dateStart = date;
      this.dateRange.timeOfDayStart = time;
    } else {
      this.dateRange.dateStart = dateStart;
      this.dateRange.timeOfDayStart = null;
    }
  }

  onDateEndChanged(dateEnd: string): void {
    if (!dateEnd) {
      this.dateRange.dateEnd = null;
      this.dateRange.timeOfDayEnd = null;
      return;
    }

    if (this.timeForEndDateEnabled) {
      const [date, time] = dateEnd.split(' ');
      this.dateRange.dateEnd = date;
      this.dateRange.timeOfDayEnd = time;
    } else {
      this.dateRange.dateEnd = dateEnd;
      this.dateRange.timeOfDayEnd = null;
    }
  }

  dateRangeChanged() {
    this.onDateStartChanged(this.dateStart);
    this.onDateEndChanged(this.dateEnd);
    this.checkDateTimeRange();
    this.onChange(this.dateRange);
  }

  protected onSelectTimezone(timezone: string): void {
    this.dateRange.timezone = timezone;
    this.onChange(this.dateRange);
  }

  timeForStartDateChanged() {
    this.dateRange.timeOfDayStart = this.timeForStartDateEnabled ? GlobalConstants.DEFAULT_TIME : null;
    this.onChange(this.dateRange);
  }

  timeForEndDateChanged() {
    this.dateRange.timeOfDayEnd = this.timeForEndDateEnabled ? GlobalConstants.DEFAULT_TIME : null;
    this.onChange(this.dateRange);
  }

  checkDateTimeRange(): void {
    this.invalidDateTime = !isDateRangeValid(this.dateRange.dateStart, this.dateRange.timeOfDayStart, this.dateRange.dateEnd, this.dateRange.timeOfDayEnd);
    this.dateTimeValidated.emit(!this.invalidDateTime);
  }
}
