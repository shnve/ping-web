import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, defaultsDeep, pick } from 'lodash-es';
import { Subscription } from 'rxjs';
import {
  MapAdvancedFilterValues,
  MapFilterValues,
  defaultValuesMapFilter
} from '../../../models/warning-filters.model';
import { GlobalWarningType } from '../../../models/warning.model';
import { ModelItemFilterState } from '../../../states/warning-filter.state';


@Component({
  selector: 'app-map-advanced-filter',
  templateUrl: './map-advanced-filter.component.html',
  styleUrls: ['./map-advanced-filter.component.scss']
})
export class MapAdvancedFilterComponent implements OnInit, OnDestroy {
  filterForm = this.fb.group({
    period: this.fb.group({
      startDate: [null],
      endDate: [null]
    }),
    publishDate: [null]
  });
  yearRange = `${(new Date()).getFullYear() - 20}:${(new Date()).getFullYear() + 20}`;
  isWarningGlobalTypeSelected: boolean;
  private subscriptions: Subscription;
  private filterStateSubscription: Subscription;
  private previousFromValues: MapAdvancedFilterValues;
  _filterState: ModelItemFilterState<MapFilterValues>;

  @Input() set filterState(filterState: ModelItemFilterState<MapFilterValues>) {
    if (this._filterState) {
      this.filterStateSubscription.unsubscribe();
    }
    this._filterState = filterState;
    this.filterStateSubscription = this._filterState.getValues$().subscribe(this.onFilterStateChange.bind(this));
  }

  constructor(private readonly fb: UntypedFormBuilder,
    public readonly translate: TranslateService
  ) {
    // Before filterState setted
    this.setQuietlyFilterValues(MapAdvancedFilterComponent.pickAdvancedFiltersValues(defaultValuesMapFilter));
  }

  ngOnInit(): void {
    this.subscriptions = this.subscribeToFormValueChanges();
  }

  /**
   * Compare 2 filterValues and returns true if they are diffrents
   * @param {MapAdvancedFilterValues} previousValues
   * @param {MapAdvancedFilterValues} values
   * @returns {boolean}
   */
  private static checkIfValuesChange(previousValues: MapAdvancedFilterValues, values: MapAdvancedFilterValues): boolean {
    return previousValues.publishDate !== values.publishDate
      || previousValues.period.startDate !== values.period.startDate
      || previousValues.period.endDate !== values.period.endDate;
  }

  notifyStateChange(advancedFilterValues: MapAdvancedFilterValues) {
    const allFilterValues = this._filterState.getValues();
    this._filterState.setValues({
      ...allFilterValues,
      ...advancedFilterValues
    });
  }

  onFilterStateChange(values: MapFilterValues) {
    // Check if Avurnav is selected to display or not avurnavType SelectButton
    this.isWarningGlobalTypeSelected = values.displayTypes.includes(GlobalWarningType.WARNING);
    const advancedFilterValues = MapAdvancedFilterComponent.pickAdvancedFiltersValues(values);
    if (!MapAdvancedFilterComponent.checkIfValuesChange(this.filterForm.value, advancedFilterValues)) {
      return;
    }
    const formatedValues = defaultsDeep(advancedFilterValues,
      MapAdvancedFilterComponent.pickAdvancedFiltersValues(this._filterState.getDefaultValues())
    );
    this.setQuietlyFilterValues(formatedValues);
  }

  private subscribeToFormValueChanges(): Subscription {
    return this.filterForm.valueChanges.subscribe((values: MapAdvancedFilterValues) => {
      // Check if REALLY change, because FormGroup detects all 'valueChanges' but sometimes date inputs did not change
      if (MapAdvancedFilterComponent.checkIfValuesChange(this.previousFromValues, values)) {
        this.previousFromValues = this.filterForm.value;
        this.notifyStateChange(values);
      }
    });
  }

  private setQuietlyFilterValues(values: MapAdvancedFilterValues) {
    this.filterForm.setValue(values, { emitEvent: false });
    this.previousFromValues = cloneDeep(values);
  }

  /**
   * Pick only usefull key from MapFilterFormValues to create an AdvacedMapFilterFormValues object
   * @param {MapFilterValues} filterValues
   * @returns {MapAdvancedFilterValues}
   */
  private static pickAdvancedFiltersValues(filterValues: MapFilterValues): MapAdvancedFilterValues {
    return pick(filterValues, ['publishDate', 'period']);
  }

  ngOnDestroy(): void {
    this.subscriptions && this.subscriptions.unsubscribe();
    this.filterStateSubscription && this.filterStateSubscription.unsubscribe();
  }
}

