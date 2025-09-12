import { Component, Inject } from '@angular/core';
import { ModelItemFilterState } from '@app/states/warning-filter.state';

export type ChipValue = {
  key: string;
  translateKey: string,
  translateKeyOne?: string,
  translateParams?: {[key: string]: string|number}
};

export const FILTER_VALUES_TOKEN = 'filterValues';

@Component({
  selector: 'shared-filter-banner',
  templateUrl: './filter-banner.component.html',
  styleUrls: ['./filter-banner.component.scss']
})
export class FilterBannerComponent<FilterValues> {
  quickFilterAccessChips: ChipValue[] = [];
  protected _filterState: ModelItemFilterState<FilterValues>;

  constructor(@Inject(FILTER_VALUES_TOKEN) public filterValues?: FilterValues) {}

  removeQuickFilterChip(chipKey: string) {
    // Clone filterValues to angular ngModel change detection
    this.filterValues = {...this.filterValues};
    this.filterValues[chipKey] = this._filterState.getDefaultValues()[chipKey];
    this._filterState.setValues(this.filterValues);
  }

}
