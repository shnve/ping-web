import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { FilterSelectOption, FilterSelectOptionType, MaritimeEntityFilterValues } from './model/maritime-entity-filter-values';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-maritime-entity-filter',
  templateUrl: './maritime-entity-filter.component.html',
  styleUrls: [
    './maritime-entity-filter.component.scss'
  ]
})

@Localize()
export class MaritimeEntityFilterComponent implements OnInit, OnChangeLang {

  @Input() filterType: FilterSelectOptionType;
  @Input() options: FilterSelectOption[];
  @Input() values: string[] | FilterSelectOption[];
  @Input() value: string[];
  @Input() displayedLabel: string;
  @Input() id: string;
  @Input() placeholder: string;
  @Input() multiSelectMode = true;
  @Output() filterSelected = new EventEmitter<MaritimeEntityFilterValues>();
  maritimeEntityFilterValues: MaritimeEntityFilterValues;

  constructor(
    public translate: TranslateService
  ) { }

  onChangeLang(event: LangChangeEvent): void {

  }

  ngOnInit(): void {
    this.initMaritimeEntityFilterValues(this.filterType);
  }

  selectedValues(values: string[] | FilterSelectOption[]): void {
    switch (this.maritimeEntityFilterValues.filterType) {
      case FilterSelectOptionType.TYPE:
        this.maritimeEntityFilterValues.selectedTypeValues = values as string[];
        break;
      case FilterSelectOptionType.AREAS:
        this.maritimeEntityFilterValues.selectedAreasValues = values as FilterSelectOption[];
        break;
      case FilterSelectOptionType.ADDITIONAL_SERVICES:
        this.maritimeEntityFilterValues.selectedAdditionalServices = values as string[];
        break;
    }
    this.filterSelected.emit(this.maritimeEntityFilterValues);
  }

  selectedValue(value: string): void {
    if (FilterSelectOptionType.MAIN_SERVICE === this.maritimeEntityFilterValues.filterType) {
      this.maritimeEntityFilterValues.selectedMainService = value;
    }
    this.filterSelected.emit(this.maritimeEntityFilterValues);
  }

  private initMaritimeEntityFilterValues(filterType: FilterSelectOptionType): void {
    this.maritimeEntityFilterValues = {
      selectedMainService: '',
      selectedAdditionalServices: [],
      selectedAreasValues: [],
      selectedTypeValues: [],
      nameValue: '',
      filterType
    };
  }
}

