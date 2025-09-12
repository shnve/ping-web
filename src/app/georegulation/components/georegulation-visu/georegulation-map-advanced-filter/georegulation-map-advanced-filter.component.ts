import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { GeoregulationMapAdvancedFilterValues, GeoregulationMapFilterValues, defaultValuesGeoregulationMapFilter } from '@app/georegulation/models/georegulation-filters.model';
import { activities } from '@app/georegulation/models/georegulation.model';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, defaultsDeep, isEqual, pick } from 'lodash-es';
import { Subscription } from 'rxjs';

@Component({
  selector: 'georegulation-map-advanced-filter',
  templateUrl: './georegulation-map-advanced-filter.component.html',
  styleUrls: ['./georegulation-map-advanced-filter.component.scss']
})
@Localize()
export class GeoregulationMapAdvancedFilterComponent implements OnInit, OnDestroy, OnChangeLang {

  yearRange = `${(new Date()).getFullYear() - 20}:${(new Date()).getFullYear() + 20}`;

  availableActivities: Array<{ key: string, value: string }>;

  filterForm: UntypedFormGroup;

  private formChangesSubscription: Subscription;
  private filterStateSubscription: Subscription;
  private previousFromValues: GeoregulationMapAdvancedFilterValues;
  _filterState: ModelItemFilterState<GeoregulationMapFilterValues>;

  @Input() set filterState(filterState: ModelItemFilterState<GeoregulationMapFilterValues>) {
    if (this._filterState) {
      this.filterStateSubscription.unsubscribe();
    }
    this._filterState = filterState;
    this.filterStateSubscription = this._filterState.getValues$().subscribe(this.filterStateChanged.bind(this));
  }

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly translate: TranslateService) {
    this.filterForm = this.fb.group({
      concernedActivities: [[]],
      period: this.fb.group({
        startDate: [null],
        endDate: [null]
      }),
      publishDate: [null]
    });

    this.buildLocalizedItems();
    // Before filterState setted
    this.setQuietlyFilterValues(GeoregulationMapAdvancedFilterComponent.pickAdvancedFiltersValues(defaultValuesGeoregulationMapFilter));
  }

  ngOnInit(): void {
    this.formChangesSubscription = this.subscribeToFormValueChanges();
  }

  private static checkIfValuesChange(previousValues: GeoregulationMapAdvancedFilterValues, values: GeoregulationMapAdvancedFilterValues): boolean {
    return previousValues.publishDate !== values.publishDate
      || previousValues.period.startDate !== values.period.startDate
      || previousValues.period.endDate !== values.period.endDate
      || !isEqual(previousValues.concernedActivities, values.concernedActivities);
  }

  notifyStateChange(advancedFilterValues: GeoregulationMapAdvancedFilterValues) {
    const allFilterValues = this._filterState.getValues();
    this._filterState.setValues({
      ...allFilterValues,
      ...advancedFilterValues
    });
  }

  private filterStateChanged(values: GeoregulationMapFilterValues) {
    // Check if Avurnav is selected to display or not avurnavType SelectButton
    const advancedFilterValues = GeoregulationMapAdvancedFilterComponent.pickAdvancedFiltersValues(values);
    if (!GeoregulationMapAdvancedFilterComponent.checkIfValuesChange(this.filterForm.value, advancedFilterValues)) {
      return;
    }
    const formatedValues = defaultsDeep(advancedFilterValues,
      GeoregulationMapAdvancedFilterComponent.pickAdvancedFiltersValues(this._filterState.getDefaultValues())
    );
    this.setQuietlyFilterValues(formatedValues);
  }

  private subscribeToFormValueChanges(): Subscription {
    return this.filterForm.valueChanges.subscribe((values: GeoregulationMapAdvancedFilterValues) => {
      // Check if REALLY change, because FormGroup detects all 'valueChanges' but sometimes date inputs did not change
      if (GeoregulationMapAdvancedFilterComponent.checkIfValuesChange(this.previousFromValues, values)) {
        this.previousFromValues = this.filterForm.value;
        this.notifyStateChange(values);
      }
    });
  }

  private setQuietlyFilterValues(values: GeoregulationMapFilterValues) {
    this.filterForm.setValue(values, { emitEvent: false });
    this.previousFromValues = cloneDeep(values);
  }

  private static pickAdvancedFiltersValues(filterValues: GeoregulationMapFilterValues): GeoregulationMapAdvancedFilterValues {
    return pick(filterValues, ['publishDate', 'period', 'concernedActivities']);
  }

  private buildLocalizedItems(): void {
    this.availableActivities = activities.map(({ key, value }) => this.translateActivities(key, value));
  }

  private translateActivities(key: string, value: string): any {
    return {
      key,
      value: this.translate.instant(value)
    };
  }

  ngOnDestroy(): void {
    if (this.formChangesSubscription) { this.formChangesSubscription.unsubscribe(); }
    if (this.filterStateSubscription) { this.filterStateSubscription.unsubscribe(); }
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }
}
