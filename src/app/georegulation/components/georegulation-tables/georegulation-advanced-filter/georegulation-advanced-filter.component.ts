import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { GeoregulationTableAdvancedFilterValues, GeoregulationTableFilterValues } from '@app/georegulation/models/georegulation-filters.model';
import { GeoregulationActivity, GeoregulationType } from '@app/georegulation/models/georegulation.model';
import { GeoregulationAdminService } from '@app/georegulation/services/georegulation-admin.service';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { MaritimeServiceBase } from '@app/models/maritime-service.model';
import { generateYearsBetween } from '@app/shared/ui-utils';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { Scavenger } from '@wishtack/rx-scavenger';
import { cloneDeep, defaultsDeep, isEqual, pick } from 'lodash';
import { Subscription } from 'rxjs';

type LabelValue = { label: string, value: string };

const CURRENT_YEAR = (new Date()).getFullYear();
const YEAR_RANGE_START = 1800;
const YEAR_RANGE_END = CURRENT_YEAR + 1;

@Component({
  selector: 'georegulation-advanced-filter',
  templateUrl: './georegulation-advanced-filter.component.html',
  styleUrls: ['./georegulation-advanced-filter.component.scss']
})
export class GeoregulationAdvancedFilterComponent implements OnInit, OnDestroy {

  private readonly scavenger = new Scavenger(this);

  @Input() selectedStatus: string;
  @Input() selectedIssuingServiceId: string;
  @Input() set filterState(filterState: ModelItemFilterState<GeoregulationTableAdvancedFilterValues>) {
    if (this._filterState) {
      this.filterStateSubscription.unsubscribe();
    }
    this._filterState = filterState;
    this.filterStateSubscription = this._filterState.getValues$().subscribe(this.onFilterStateChange.bind(this));
  }

  private readonly subscriptions: Subscription[] = [];
  private filterStateSubscription: Subscription;
  _filterState: ModelItemFilterState<GeoregulationTableFilterValues>;
  filterForm: UntypedFormGroup;
  private previousFormValues: GeoregulationTableAdvancedFilterValues;

  availableYears: LabelValue[] = [];
  availableTypes: LabelValue[] = [];
  availableActivities: LabelValue[] = [];
  availableEntities: MaritimeEntityBase[] = [];
  availableAuthorities: MaritimeServiceBase[] = [];

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly georegulationAdminService: GeoregulationAdminService) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.subscriptions.push(this.subscribeToFormValueChanges());
    this.buildAvailableYears();
    this.buildAvailableTypes();
    this.buildAvailableActivities();
    this.georegulationAdminService.getAuthoritiesToFilter$(this.selectedIssuingServiceId)
      .pipe(this.scavenger.collect())
      .subscribe(availableAuthorities => this.availableAuthorities = availableAuthorities);
    this.georegulationAdminService.getEntitiesToFilter$()
      .pipe(this.scavenger.collect())
      .subscribe(availableEntities => this.availableEntities = availableEntities);
  }

  ngOnDestroy(): void {
  }

  private buildAvailableYears(): void {
    this.availableYears = generateYearsBetween(YEAR_RANGE_START, YEAR_RANGE_END).reverse().map(v => { return { label: v.toString(), value: v.toString() }; });
  }

  private buildAvailableTypes(): void {
    this.availableTypes = Object.keys(GeoregulationType).map(type => { return { label: `georegulation.type.${type}`, value: type }; });
  }

  private buildAvailableActivities(): void {
    this.availableActivities = Object.keys(GeoregulationActivity).map(activitity => { return { label: `enum.georegulation-activities.${activitity.toLowerCase()}`, value: activitity }; });
  }

  protected subscribeToFormValueChanges(): Subscription {
    return this.filterForm.valueChanges.subscribe((values: GeoregulationTableAdvancedFilterValues) => {
      if (GeoregulationAdvancedFilterComponent.checkIfValuesChanged(this.previousFormValues, values)) {
        this.previousFormValues = values;
        this.notifyStateChange(values);
      }
    });
  }

  notifyStateChange(advancedFilterValues: GeoregulationTableAdvancedFilterValues): void {
    const allFilterValues = this._filterState.getValues();
    this._filterState.setValues({
      ...allFilterValues,
      ...advancedFilterValues
    });
  }

  private buildForm(): void {
    this.filterForm = this.fb.group({
      mainNumberYear: '',
      mainNumberText: '',
      mainNumberAuthorities: [],
      mainNumberDate: '',
      type: '',
      activities: [],
      entities: [],
      isPublic: false,
      isNew: false,
      isExpired: false
    });
  }

  onFilterStateChange(values: GeoregulationTableFilterValues): void {
    const advancedFilterValues = GeoregulationAdvancedFilterComponent.pickAdvancedFiltersValues(values);
    if (!GeoregulationAdvancedFilterComponent.checkIfValuesChanged(this.filterForm.value, advancedFilterValues)) {
      return;
    }
    const formatedValues = defaultsDeep(
      advancedFilterValues,
      GeoregulationAdvancedFilterComponent.pickAdvancedFiltersValues(this._filterState.getDefaultValues())
    );
    this.setQuietlyFilterValues(formatedValues);
  }

  protected setQuietlyFilterValues(values: GeoregulationTableAdvancedFilterValues): void {
    const clonedValues = cloneDeep(values);
    this.filterForm.setValue(clonedValues, { emitEvent: false });
    this.previousFormValues = clonedValues;
  }

  protected static checkIfValuesChanged(previousValues: GeoregulationTableAdvancedFilterValues, values: GeoregulationTableAdvancedFilterValues): boolean {
    return previousValues.mainNumberYear !== values.mainNumberYear ||
      previousValues.mainNumberText !== values.mainNumberText ||
      !isEqual(previousValues.mainNumberAuthorities, values.mainNumberAuthorities) ||
      previousValues.mainNumberDate !== values.mainNumberDate ||
      previousValues.type !== values.type ||
      !isEqual(previousValues.activities, values.activities) ||
      !isEqual(previousValues.entities, values.entities) ||
      previousValues.isPublic !== values.isPublic ||
      previousValues.isNew !== values.isNew ||
      previousValues.isExpired !== values.isExpired;
  }

  protected static pickAdvancedFiltersValues(filterValues: GeoregulationTableFilterValues): GeoregulationTableAdvancedFilterValues {
    return pick(
      filterValues,
      [
        'mainNumberYear',
        'mainNumberText',
        'mainNumberAuthorities',
        'mainNumberDate',
        'type',
        'activities',
        'entities',
        'isPublic',
        'isNew',
        'isExpired'
      ]
    );
  }

}
