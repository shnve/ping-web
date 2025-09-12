import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { AuthService } from '@app/auth/auth.service';
import { Localize, OnChangeLang } from '@app/core/localize';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { SubArea } from '@app/models/sub-area.model';
import {
  TableAdvancedFilterValues,
  TableFilterValues,
  defaultValuesTableFilter
} from '@app/models/warning-filters.model';
import { listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { cloneDeep, defaultsDeep, isEqual, pick } from 'lodash-es';
import { Subscription } from 'rxjs';

@Localize()
@Component({
  selector: 'app-table-advanced-filter',
  templateUrl: './table-advanced-filter.component.html',
  styleUrls: ['./table-advanced-filter.component.scss']
})
export class TableAdvancedFilterComponent implements OnInit, OnDestroy, OnChangeLang, OnChanges {
  private readonly scavenger = new Scavenger(this);

  filterForm = this.fb.group({
    subAreaIds: [[]],
    categories: [[]],
    concernedMaritimeEntityIds: [[]],
    entityCoverIds: [[]],
    period: this.fb.group({
      startDate: [null],
      endDate: [null]
    }),
    publishDate: [null],
    reservationNumberAndYear: ''
  });
  readonly yearRange: string = `${(new Date()).getFullYear() - 20}:${(new Date()).getFullYear() + 20}`;
  protected availableSubAreas: SubArea[] = [];
  protected availableCategories: Array<{ key: string, value: string }>;
  protected sectorOptionLabel: 'name' | 'internationalName';

  private subscriptions: Subscription;
  protected previousFormValues: TableAdvancedFilterValues;
  private filterStateSubscription: Subscription;
  _filterState: ModelItemFilterState<TableFilterValues>;

  protected availableEntities: MaritimeEntityBase[] = [];
  protected availableLinkedEntities: MaritimeEntityBase[] = [];
  protected isProUser = false;

  @Input() selectedSerieId: string;

  @Input() set filterState(filterState: ModelItemFilterState<TableFilterValues>) {
    if (this._filterState) {
      this.filterStateSubscription.unsubscribe();
    }
    this._filterState = filterState;
    this.filterStateSubscription = this._filterState.getValues$().subscribe(this.onFilterStateChange.bind(this));
  }

  constructor(private readonly fb: UntypedFormBuilder,
    public readonly translate: TranslateService,
    private readonly authService: AuthService,
    private readonly maritimeEntitiesService: MaritimeEntitiesService
  ) {
    this.buildLocalizedItems();
    // Before filterState setted
    this.setQuietlyFilterValues(TableAdvancedFilterComponent.pickAdvancedFiltersValues(defaultValuesTableFilter));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedSerieId && this.selectedSerieId && this.authService.isLoggedIn() && this.authService.isProUser()) {
      this.isProUser = true;

      // get concerned maritime entities to filter
      this.maritimeEntitiesService.getEntitiesManagedOrObservedByService$()
        .pipe(this.scavenger.collect())
        .subscribe(availableEntities => this.availableEntities = availableEntities);

      // get linked entities to filter cover
      this.maritimeEntitiesService.getLinkedEntitiesForCoverFiltering$(this.selectedSerieId, true)
        .pipe(this.scavenger.collect())
        .subscribe(availableLinkedEntities => this.availableLinkedEntities = availableLinkedEntities);
    }
  }

  /**
   * Compare 2 filterValues and returns true if they are diffrents
   * @param {TableAdvancedFilterValues} previousValues
   * @param {TableAdvancedFilterValues} values
   * @returns {boolean}
   */
  protected static checkIfValuesChange(previousValues: TableAdvancedFilterValues, values: TableAdvancedFilterValues): boolean {
    return this.checkIfSimplesValuesChange(previousValues, values);
  }

  protected static checkIfSimplesValuesChange(previousValues: TableAdvancedFilterValues, values: TableAdvancedFilterValues): boolean {
    return previousValues.publishDate !== values.publishDate
      || previousValues.period.startDate !== values.period.startDate
      || previousValues.period.endDate !== values.period.endDate
      || previousValues.reservationNumberAndYear !== values.reservationNumberAndYear
      || !isEqual(previousValues.subAreaIds, values.subAreaIds)
      || !isEqual(previousValues.concernedMaritimeEntityIds, values.concernedMaritimeEntityIds)
      || !isEqual(previousValues.entityCoverIds, values.entityCoverIds)
      || !isEqual(previousValues.categories, values.categories);
  }

  /**
   * Pick only usefull key from MapFilterFormValues to create an AdvacedMapFilterFormValues object
   * @param {TableFilterValues} filterValues
   * @returns {TableFilterValues}
   */
  protected static pickAdvancedFiltersValues(filterValues: TableFilterValues): TableAdvancedFilterValues {
    return pick(filterValues, ['publishDate', 'period', 'subAreaIds', 'categories', 'concernedMaritimeEntityIds', 'entityCoverIds', 'reservationNumberAndYear']);
  }

  ngOnInit(): void {
    this.subscriptions = this.subscribeToFormValueChanges();
  }

  notifyStateChange(advancedFilterValues: TableAdvancedFilterValues) {
    const allFilterValues = this._filterState.getValues();
    this._filterState.setValues({
      ...allFilterValues,
      ...advancedFilterValues
    });
  }

  onFilterStateChange(values: TableFilterValues) {
    this.availableSubAreas = values.serie ? values.serie.subAreas as SubArea[] : [];
    const advancedFilterValues = TableAdvancedFilterComponent.pickAdvancedFiltersValues(values);
    if (!TableAdvancedFilterComponent.checkIfValuesChange(this.filterForm.value, advancedFilterValues)) {
      return;
    }
    const formatedValues = defaultsDeep(
      advancedFilterValues,
      TableAdvancedFilterComponent.pickAdvancedFiltersValues(this._filterState.getDefaultValues())
    );
    this.setQuietlyFilterValues(formatedValues);
  }

  protected subscribeToFormValueChanges(): Subscription {
    return this.filterForm.valueChanges.subscribe((values: TableAdvancedFilterValues) => {
      // Check if REALLY change, because FormGroup detects all 'valueChanges' but sometimes date inputs did not change
      if (TableAdvancedFilterComponent.checkIfValuesChange(this.previousFormValues, values)) {
        this.previousFormValues = values;
        this.notifyStateChange(values);
      }
    });
  }

  protected setQuietlyFilterValues(values: TableAdvancedFilterValues) {
    // Cloned to avoid edition of existing values
    const clonedValues = cloneDeep(values);
    this.filterForm.setValue(clonedValues, { emitEvent: false });
    this.previousFormValues = clonedValues;
  }

  protected buildLocalizedItems(): void {
    this.availableCategories =
      listWarningHazardTypeGeneral.map(({ key, value }) =>
      ({
        key,
        value: this.translate.instant(value)
      })
      );

    this.sectorOptionLabel = this.translate.currentLang === 'fr' ? 'name' : 'internationalName';
  }

  ngOnDestroy(): void {
    this.subscriptions && this.subscriptions.unsubscribe();
    this.filterStateSubscription && this.filterStateSubscription.unsubscribe();
  }

  onChangeLang(langChangeEvent: LangChangeEvent): void {
    this.buildLocalizedItems();
  }
}
