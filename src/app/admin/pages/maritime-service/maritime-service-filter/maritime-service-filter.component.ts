import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AreaSelectOption } from '@app/facades/areas.facade';
import { MaritimeServiceFilterValues } from './model/maritime-service-filter-values';

@Component({
  selector: 'app-maritime-service-filter',
  templateUrl: './maritime-service-filter.component.html',
  styleUrls: ['./maritime-service-filter.component.scss']
})
@Localize()
export class MaritimeServiceFilterComponent implements OnInit, OnChangeLang {

  @Input() areas: AreaSelectOption[];
  @Input() values: string[] | AreaSelectOption[];
  @Input() maritimeServiceTypes: AreaSelectOption[];
  @Input() displayedLabel: string;
  @Input() id: string;
  @Input() placeholder: string;
  @Output() filterSelected = new EventEmitter<MaritimeServiceFilterValues>();
  maritimeServiceFilterValues: MaritimeServiceFilterValues;

  constructor(
    public translate: TranslateService
  ) { }

  onChangeLang(event: LangChangeEvent): void {

  }

  ngOnInit(): void {
    if (this.maritimeServiceTypes) {
      this.areas = this.maritimeServiceTypes;
    }
    this.maritimeServiceFilterValues = {
      isTypeFiltered: false,
      selectedAreasValues: [],
      selectedTypeValues: [],
      nameValue: ''
    };
  }

  selectedValues(values: string[] | AreaSelectOption[]): void {
    this.maritimeServiceFilterValues.isTypeFiltered = !!this.maritimeServiceTypes;
    if (this.maritimeServiceTypes) {
      this.maritimeServiceFilterValues.selectedTypeValues = values as string[];
    } else {
      this.maritimeServiceFilterValues.selectedAreasValues = values as AreaSelectOption[];
    }
    this.filterSelected.emit(this.maritimeServiceFilterValues);
  }
}
