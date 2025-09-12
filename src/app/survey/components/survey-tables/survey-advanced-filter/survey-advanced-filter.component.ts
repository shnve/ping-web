import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { TranslatedOptionList, translateI18nKeyValueArray } from '@app/shared/ui-utils';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { SurveyTableAdvancedFilterValues, SurveyTableFilterValues } from '@app/survey/models/survey-filters.model';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, defaultsDeep, pick } from 'lodash-es';
import { Subscription } from 'rxjs';
import { SurveyStateEnum, TRANSLATIONS_LIST_SURVEY_TRANSMISSION_STATUS } from '../../../models/survey.model';

export type GeographicArea = { name: string, internationalName: string };

@Component({
  selector: 'survey-advanced-filter',
  templateUrl: './survey-advanced-filter.component.html',
  styleUrls: ['./survey-advanced-filter.component.scss']
})
@Localize()
export class SurveyAdvancedFilterComponent implements OnInit, OnChangeLang {

  @Input() selectedState: string;
  @Input() isBri = false;
  @Input() set filterState(filterState: ModelItemFilterState<SurveyTableAdvancedFilterValues>) {
    if (this._filterState) {
      this.filterStateSubscription.unsubscribe();
    }
    this._filterState = filterState;
    this.filterStateSubscription = this._filterState.getValues$().subscribe(this.onFilterStateChange.bind(this));
  }

  protected readonly surveyState = SurveyStateEnum;

  private readonly subscriptions: Subscription[] = [];
  private filterStateSubscription: Subscription;
  private previousFormValues: SurveyTableAdvancedFilterValues;

  _filterState: ModelItemFilterState<SurveyTableFilterValues>;
  filterForm: UntypedFormGroup;
  protected availableTransmissionStatus: TranslatedOptionList;
  protected showBriFilters = false;

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly translate: TranslateService
  ) {
    this.buildForm();
    this.buildLocalizedItems();
  }

  ngOnInit(): void {
    this.showBriFilters = this.isBri && this.selectedState === SurveyStateEnum.TRANSMITTED;
    this.subscriptions.push(this.subscribeToFormValueChanges());
  }

  private buildForm(): void {
    this.filterForm = this.fb.group({
      identifier: '',
      shomId: '',
      nameAndLocation: '',
      producerOrganization: '',
      ownerOrganization: '',
      period: this.fb.group({
        startDate: [null],
        endDate: [null]
      }),
      notCompliant: false,
      transmissionStatus: '',
      transmissionPeriod: this.fb.group({
        startDate: [null],
        endDate: [null]
      }),
      expectedDeletionDate: [null],
      briInternalComment: ''
    });
  }

  protected subscribeToFormValueChanges(): Subscription {
    return this.filterForm.valueChanges.subscribe((values: SurveyTableAdvancedFilterValues) => {
      if (SurveyAdvancedFilterComponent.checkIfValuesChanged(this.showBriFilters, this.previousFormValues, values)) {
        this.previousFormValues = values;
        this.notifyStateChange(values);
      }
    });
  }

  notifyStateChange(advancedFilterValues: SurveyTableAdvancedFilterValues): void {
    const allFilterValues = this._filterState.getValues();
    this._filterState.setValues({
      ...allFilterValues,
      ...advancedFilterValues
    });
  }

  onFilterStateChange(values: SurveyTableFilterValues): void {
    const advancedFilterValues = SurveyAdvancedFilterComponent.pickAdvancedFiltersValues(values);
    if (!SurveyAdvancedFilterComponent.checkIfValuesChanged(this.showBriFilters, this.filterForm.value, advancedFilterValues)) {
      return;
    }
    const formatedValues = defaultsDeep(
      advancedFilterValues,
      SurveyAdvancedFilterComponent.pickAdvancedFiltersValues(this._filterState.getDefaultValues())
    );
    this.setQuietlyFilterValues(formatedValues);
  }

  protected setQuietlyFilterValues(values: SurveyTableAdvancedFilterValues): void {
    const clonedValues = cloneDeep(values);
    this.filterForm.setValue(clonedValues, { emitEvent: false });
    this.previousFormValues = clonedValues;
  }

  protected static checkIfValuesChanged(isBri: boolean, previousValues: SurveyTableAdvancedFilterValues, values: SurveyTableAdvancedFilterValues): boolean {
    let otherChange = false;

    if (isBri) {
      otherChange = previousValues.shomId !== values.shomId ||
        previousValues.producerOrganization !== values.producerOrganization ||
        previousValues.ownerOrganization !== values.ownerOrganization ||
        previousValues.notCompliant !== values.notCompliant ||
        previousValues.transmissionStatus !== values.transmissionStatus ||
        previousValues.expectedDeletionDate !== values.expectedDeletionDate ||
        previousValues.briInternalComment !== values.briInternalComment;
    }

    return previousValues.nameAndLocation !== values.nameAndLocation ||
      previousValues.identifier !== values.identifier ||
      previousValues.period?.startDate !== values.period?.startDate ||
      previousValues.period?.endDate !== values.period?.endDate ||
      previousValues.transmissionPeriod?.startDate !== values.transmissionPeriod?.startDate ||
      previousValues.transmissionPeriod?.endDate !== values.transmissionPeriod?.endDate
      || otherChange;
  }

  protected static pickAdvancedFiltersValues(filterValues: SurveyTableFilterValues): SurveyTableAdvancedFilterValues {
    return pick(
      filterValues,
      [
        'identifier',
        'nameAndLocation',
        'period',
        'transmissionPeriod',
        'shomId',
        'producerOrganization',
        'ownerOrganization',
        'notCompliant',
        'transmissionStatus',
        'expectedDeletionDate',
        'briInternalComment'
      ]
    );
  }

  protected buildLocalizedItems() {
    this.availableTransmissionStatus = translateI18nKeyValueArray(this.translate, TRANSLATIONS_LIST_SURVEY_TRANSMISSION_STATUS);
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }
}
