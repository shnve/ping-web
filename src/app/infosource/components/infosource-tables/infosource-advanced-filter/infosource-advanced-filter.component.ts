import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import {
  defaultValuesInfosourceTableFilter,
  InfosourceTableAdvancedFilterValues,
  InfosourceTableFilterValues
} from '@app/infosource/models/infosource-filters.model';
import { InfosourceState } from '@app/infosource/models/infosource-table.model';
import { TRANSLATIONS_LIST_INFOSOURCE_NATURE, TRANSLATIONS_LIST_INFOSOURCE_SERVICE_STATUS } from '@app/infosource/models/infosource.model';
import MaritimeEntity from '@app/models/maritime-entity.model';
import { MaritimeServiceInfosourceRecipient } from '@app/models/maritime-service.model';
import { generateYearsBetween, translateI18nKeyValueArray } from '@app/shared/ui-utils';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, defaultsDeep, isEqual, pick } from 'lodash-es';
import { Subscription } from 'rxjs';

const YEAR_OFFSET = 20;
const CURRENT_YEAR = (new Date()).getFullYear();
const YEAR_RANGE_START = CURRENT_YEAR - YEAR_OFFSET;
const YEAR_RANGE_END = CURRENT_YEAR + YEAR_OFFSET;

@Component({
  selector: 'infosource-advanced-filter',
  templateUrl: './infosource-advanced-filter.component.html',
  styleUrls: ['./infosource-advanced-filter.component.scss']
})
@Localize()
export class InfosourceAdvancedFilterComponent implements OnInit, OnDestroy, OnChangeLang {

  @Input('selectedState') selectedState: string;

  @Input('maritimeEntities') availableMaritimeEntities: MaritimeEntity[] = [];

  @Input('tags') tags: string[] = [];

  @Input('recipients') availableRecipients: MaritimeServiceInfosourceRecipient[] = [];

  availableNatures: Array<{ key: string, value: string }>;
  availableTags = [];

  availableServiceStatuses: Array<{ key: string, value: string }>;

  maritimeEntitiesOrRecipientsOptionLabel: 'name' | 'internationalName';

  availableSendingYear: string[] = [];

  readonly yearRange = `${YEAR_RANGE_START}:${YEAR_RANGE_END}`;

  readonly infosourceState = InfosourceState;

  private readonly subscriptions: Subscription[] = [];

  private previousFormValues: InfosourceTableAdvancedFilterValues;

  private filterStateSubscription: Subscription;

  filterForm: UntypedFormGroup;

  _filterState: ModelItemFilterState<InfosourceTableFilterValues>;

  @Input() set filterState(filterState: ModelItemFilterState<InfosourceTableFilterValues>) {
    if (this._filterState) {
      this.filterStateSubscription.unsubscribe();
    }
    this._filterState = filterState;
    this.filterStateSubscription = this._filterState.getValues$().subscribe(this.onFilterStateChange.bind(this));
  }

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly translate: TranslateService
  ) {
    this.availableSendingYear = generateYearsBetween(YEAR_RANGE_START, YEAR_RANGE_END).map(y => y.toString());
    this.buildForm();
    this.buildLocalizedItems();
    // Before filterState setted
    this.setQuietlyFilterValues(InfosourceAdvancedFilterComponent.pickAdvancedFiltersValues(defaultValuesInfosourceTableFilter));
  }

  ngOnInit(): void {
    this.subscriptions.push(this.subscribeToFormValueChanges());
    this.availableTags = this.tags.reduce((acc, curr) => { acc.push({ value: curr }); return acc; }, []);
  }

  private buildForm(): void {
    this.filterForm = this.fb.group({
      rejected: false,
      archived: false,
      natures: [[]],
      maritimeEntityIds: [[]],
      tags: [[]],
      lastUpdatePeriod: this.fb.group({
        startDate: [null],
        endDate: [null]
      }),
      number: '',
      sendingPeriod: this.fb.group({
        startDate: [null],
        endDate: [null]
      }),
      sendingYear: '',
      recipientIds: [[]],
      affairNumber: '',
      serviceStatuses: [[]]
    });
  }

  /**
   * Compare 2 filterValues and returns true if they are diffrents
   * @param {InfosourceTableAdvancedFilterValues} previousValues
   * @param {InfosourceTableAdvancedFilterValues} values
   * @returns {boolean}
   */
  protected static checkIfValuesChanged(previousValues: InfosourceTableAdvancedFilterValues, values: InfosourceTableAdvancedFilterValues): boolean {
    return previousValues.lastUpdatePeriod?.startDate !== values.lastUpdatePeriod?.startDate
      || previousValues.lastUpdatePeriod?.endDate !== values.lastUpdatePeriod?.endDate
      || previousValues.sendingPeriod?.startDate !== values.sendingPeriod?.startDate
      || previousValues.sendingPeriod?.endDate !== values.sendingPeriod?.endDate
      || !isEqual(previousValues.natures, values.natures)
      || !isEqual(previousValues.maritimeEntityIds, values.maritimeEntityIds)
      || !isEqual(previousValues.tags, values.tags)
      || !isEqual(previousValues.recipientIds, values.recipientIds)
      || !isEqual(previousValues.serviceStatuses, values.serviceStatuses)
      || previousValues.archived !== values.archived
      || previousValues.rejected !== values.rejected
      || previousValues.number !== values.number
      || previousValues.sendingYear !== values.sendingYear
      || previousValues.affairNumber !== values.affairNumber;
  }

  notifyStateChange(advancedFilterValues: InfosourceTableAdvancedFilterValues) {
    const allFilterValues = this._filterState.getValues();
    this._filterState.setValues({
      ...allFilterValues,
      ...advancedFilterValues
    });
  }

  onFilterStateChange(values: InfosourceTableFilterValues) {
    const advancedFilterValues = InfosourceAdvancedFilterComponent.pickAdvancedFiltersValues(values);
    if (!InfosourceAdvancedFilterComponent.checkIfValuesChanged(this.filterForm.value, advancedFilterValues)) {
      return;
    }
    const formatedValues = defaultsDeep(
      advancedFilterValues,
      InfosourceAdvancedFilterComponent.pickAdvancedFiltersValues(this._filterState.getDefaultValues())
    );
    this.setQuietlyFilterValues(formatedValues);
  }

  protected subscribeToFormValueChanges(): Subscription {
    return this.filterForm.valueChanges.subscribe((values: InfosourceTableAdvancedFilterValues) => {
      // Check if REALLY change, because FormGroup detects all 'valueChanges' but sometimes date inputs did not change
      if (InfosourceAdvancedFilterComponent.checkIfValuesChanged(this.previousFormValues, values)) {
        this.previousFormValues = values;
        this.notifyStateChange(values);
      }
    });
  }

  protected setQuietlyFilterValues(values: InfosourceTableAdvancedFilterValues) {
    // Cloned to avoid edition of existing values
    const clonedValues = cloneDeep(values);
    this.filterForm.setValue(clonedValues, { emitEvent: false });
    this.previousFormValues = clonedValues;
  }

  /**
   * Pick only usefull key from InfosourceTableFilterValues to create an InfosourceTableAdvancedFilterValues object
   * @param {InfosourceTableFilterValues} filterValues
   * @returns {InfosourceTableAdvancedFilterValues}
   */
  protected static pickAdvancedFiltersValues(filterValues: InfosourceTableFilterValues): InfosourceTableAdvancedFilterValues {
    return pick(
      filterValues,
      [
        'natures',
        'maritimeEntityIds',
        'tags',
        'lastUpdatePeriod',
        'number',
        'sendingPeriod',
        'sendingYear',
        'recipientIds',
        'affairNumber',
        'serviceStatuses',
        'rejected',
        'archived'
      ]
    );
  }

  protected buildLocalizedItems() {
    this.availableNatures = translateI18nKeyValueArray(this.translate, TRANSLATIONS_LIST_INFOSOURCE_NATURE);

    this.availableServiceStatuses = translateI18nKeyValueArray(this.translate, TRANSLATIONS_LIST_INFOSOURCE_SERVICE_STATUS);

    this.maritimeEntitiesOrRecipientsOptionLabel = this.translate.currentLang === 'es' ? 'name' : 'internationalName';
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.filterStateSubscription && this.filterStateSubscription.unsubscribe();
  }
}
