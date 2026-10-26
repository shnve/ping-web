import { AfterViewInit, Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { checkNumber as checkNumberUtil } from '@app/georegulation/georegulation-utils';
import { GeoregulationNumber } from '@app/georegulation/models/georegulation.model';
import { GeoregulationFormatNumberPipe } from '@app/georegulation/pipes/georegulation-format-number.pipe';
import MaritimeService, { MaritimeServiceBase } from '@app/models/maritime-service.model';
import { TranslateService } from '@ngx-translate/core';
import { Dropdown } from 'primeng/dropdown';


@Component({
  selector: 'georegulation-number-input',
  templateUrl: './georegulation-number-input.component.html',
  styleUrls: ['./georegulation-number-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GeoregulationNumberInputComponent),
      multi: true
    }
  ]
})
@Localize()
export class GeoregulationNumberInputComponent implements ControlValueAccessor, OnChangeLang, AfterViewInit, OnChanges {

  @ViewChild('dropdownYear') dropdownYear?: Dropdown;

  @Input() availableYears: string[] = [];

  @Input() availableAuthorities: Array<MaritimeServiceBase> = [];

  @Input() yearRange: string;

  @Input() disabled = false;

  @Output() numberValidated = new EventEmitter<boolean>();

  grNumber: GeoregulationNumber;
  invalidNumber = false;
  formattedNumber = '';
  authoritiesOptionLabel: 'name' | 'internationalName';
  year: string = null;
  text: string = null;
  authorities: MaritimeServiceBase[] = [];
  date: string = null;

  constructor(private readonly translate: TranslateService,
    private readonly formatNumberPipe: GeoregulationFormatNumberPipe) {
    this.buildLocalizedItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.grNumber && changes.availableAuthorities && this.availableAuthorities) {
      this.grNumber.authorities = this.availableAuthorities.filter(authority => this.grNumber.authorityIds.includes(authority.id));
      this.authorities = this.grNumber.authorities ? [...this.grNumber.authorities] : [];
      this.grNumber.authorityCodes = this.grNumber.authorities ? this.grNumber.authorities.map(authority => authority.authorityCode)
        : [];
    }
  }

  ngAfterViewInit(): void {
    this.fixYearFiltering();
  }

  private fixYearFiltering() {
    if (this.dropdownYear) {
      (this.dropdownYear.filterBy as any) = {
        split: (_: any) => [(item: any) => item]
      };
    }
  }

  onChange = (grNumber: GeoregulationNumber) => { };
  onTouched = () => { };

  writeValue(grNumber: GeoregulationNumber): void {
    if (!grNumber) {
      return;
    }
    this.grNumber = grNumber;
    this.year = '' + grNumber.year;
    this.text = grNumber.text;

    this.date = this.grNumber.date ?? null;
  }

  private getAuthorities(authorityIds: string[]): MaritimeServiceBase[] {
    return authorityIds ? this.availableAuthorities.filter(authority => authorityIds.includes(authority.id)) : [];
  }

  registerOnChange(fn: (grNumber: GeoregulationNumber) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  checkNumber(): void {
    this.invalidNumber = !checkNumberUtil(this.grNumber);
    this.formattedNumber = this.formatNumberPipe.transform(this.grNumber);
    this.numberValidated.emit(!this.invalidNumber);
  }

  private yearChanged(year: number): void {
    if (!year) {
      this.grNumber.year = null;
      return;
    }
    this.grNumber.year = year;
  }

  private textChanged(text: string): void {
    if (!text) {
      this.grNumber.text = null;
      return;
    }
    this.grNumber.text = text;
  }

  private dateChanged(date: string): void {
    if (!date) {
      this.grNumber.date = null;
      return;
    }
    this.grNumber.date = date;
  }

  // assuming date format is: ddmmyyyy
  private parseDate(date: string): Date {
    const year = +date.substring(4, date.length);
    const monthIndex = +date.substring(2, 4) - 1;
    const day = +date.substring(0, 2);
    return new Date(year, monthIndex, day);
  }

  private authoritiesChanged(authorities: MaritimeService[]): void {
    if (!authorities) {
      this.grNumber.authorityIds = [];
      this.grNumber.authorities = [];
      this.grNumber.authorityCodes = [];
      return;
    }
    this.grNumber.authorityIds = authorities.map(authority => authority.id);
    this.grNumber.authorityCodes = authorities.map(authority => authority.authorityCode);
    this.grNumber.authorities = [...authorities];
  }

  propertiesChanged(): void {
    if (!this.grNumber) { return; }
    this.yearChanged(+this.year);
    this.textChanged(this.text);
    this.authoritiesChanged(this.authorities);
    this.dateChanged(this.date);
    this.checkNumber();
    this.numberChanged();
  }

  numberChanged(): void {
    this.onChange(this.grNumber);
  }

  private buildLocalizedItems(): void {
    this.authoritiesOptionLabel = this.translate.currentLang === 'es' ? 'name' : 'internationalName';
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }
}
