import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { defaultValuesFolderTableFilter, FolderTableAdvancedFilterValues, FolderTableFilterValues } from '@app/folder/models/folder-filters.model';
import Area from '@app/models/area.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { StudyBase } from '@app/models/study.model';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import { generateYearsBetween } from '@shared/ui-utils';
import { cloneDeep, defaultsDeep, isEqual, pick } from 'lodash-es';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';

const YEAR_OFFSET = 20;
const CURRENT_YEAR = (new Date()).getFullYear();
const YEAR_RANGE_START = CURRENT_YEAR - YEAR_OFFSET;
const YEAR_RANGE_END = CURRENT_YEAR + YEAR_OFFSET;


@Component({
  selector: 'folder-advanced-filter',
  templateUrl: './folder-advanced-filter.component.html',
  styleUrls: ['./folder-advanced-filter.component.scss']
})
@Localize()
export class FolderAdvancedFilterComponent implements OnInit, AfterViewInit, OnDestroy, OnChangeLang {
  @ViewChild('dropdown') dropdown?: Dropdown;

  @Input('selectedState') selectedState: string;

  @Input('maritimeEntities') availableMaritimeEntities: MaritimeEntityBase[] = [];

  @Input() canShowFilterByareaIds: string;

  @Input() availableAreas: Area[] = [];

  @Input() canShowFilterByStudyId = false;

  @Input('studies') availableStudies: StudyBase[] = [];

  readonly yearRange = `${YEAR_RANGE_START}:${YEAR_RANGE_END}`;

  private readonly subscriptions: Subscription[] = [];

  private previousFormValues: FolderTableAdvancedFilterValues;

  private filterStateSubscription: Subscription;

  maritimeEntitiesOptionLabel: 'name' | 'internationalName';

  areasOptionLabel: 'name' | 'internationalName';

  studiesOptionLabel: 'number';

  availableLastUpdateYear: string[] = [];

  filterForm: UntypedFormGroup;

  _filterState: ModelItemFilterState<FolderTableFilterValues>;

  @Input() set filterState(filterState: ModelItemFilterState<FolderTableAdvancedFilterValues>) {
    if (this._filterState) {
      this.filterStateSubscription.unsubscribe();
    }
    this._filterState = filterState;
    this.filterStateSubscription = this._filterState.getValues$().subscribe(this.onFilterStateChange.bind(this));
  }

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly translate: TranslateService
  ) {
    this.availableLastUpdateYear = generateYearsBetween(YEAR_RANGE_START, CURRENT_YEAR).reverse().map(y => y.toString());
    this.buildForm();
    this.buildLocalizedItems();
    // Before filterState setted
    this.setQuietlyFilterValues(FolderAdvancedFilterComponent.pickAdvancedFiltersValues(defaultValuesFolderTableFilter));
  }

  protected static checkIfValuesChanged(previousValues: FolderTableAdvancedFilterValues, values: FolderTableAdvancedFilterValues): boolean {
    const dateChanged = previousValues.lastUpdatePeriod?.startDate !== values.lastUpdatePeriod?.startDate ||
                        previousValues.lastUpdatePeriod?.endDate !== values.lastUpdatePeriod?.endDate;
    const areaIdsChanged = !isEqual(previousValues.areaIds, values.areaIds);
    const maritimeEntityIdsChanged = !isEqual(previousValues.maritimeEntityIds, values.maritimeEntityIds);

    return previousValues.number !== values.number
        || areaIdsChanged
        || previousValues.secondPartNumber !== values.secondPartNumber
        || previousValues.localityOrObject !== values.localityOrObject
        || dateChanged
        || previousValues.lastUpdateYear !== values.lastUpdateYear
        || maritimeEntityIdsChanged
        || previousValues.studyId !== values.studyId;
  }

  
  protected static pickAdvancedFiltersValues(filterValues: FolderTableFilterValues): FolderTableAdvancedFilterValues {
    return pick(
      filterValues,
      [
        'secondPartNumber',
        'number',
        'localityOrObject',
        'areaIds',
        'maritimeEntityIds',
        'lastUpdatePeriod',
        'lastUpdateYear',
        'studyId'
      ]
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(this.subscribeToFormValueChanges());
  }

  private buildForm(): void {
    this.filterForm = this.fb.group({
      number: '',
      secondPartNumber: '',
      localityOrObject: '',
      areaIds: [[]],
      maritimeEntityIds: [[]],
      lastUpdatePeriod: this.fb.group({
        startDate: [null],
        endDate: [null]
      }),
      lastUpdateYear: '',
      studyId: ''
    });
  }

  notifyStateChange(advancedFilterValues: FolderTableAdvancedFilterValues): void {
    const allFilterValues = this._filterState.getValues();
    this._filterState.setValues({
      ...allFilterValues,
      ...advancedFilterValues
    });
  }

  onFilterStateChange(values: FolderTableFilterValues): void {
    const advancedFilterValues = FolderAdvancedFilterComponent.pickAdvancedFiltersValues(values);
    if (!FolderAdvancedFilterComponent.checkIfValuesChanged(this.filterForm.value, advancedFilterValues)) {
      return;
    }
    const formatedValues = defaultsDeep(
      advancedFilterValues,
      FolderAdvancedFilterComponent.pickAdvancedFiltersValues(this._filterState.getDefaultValues())
    );
    this.setQuietlyFilterValues(formatedValues);
  }

  protected subscribeToFormValueChanges(): Subscription {
    return this.filterForm.valueChanges.subscribe((values: FolderTableAdvancedFilterValues) => {
      // Check if REALLY change, because FormGroup detects all 'valueChanges' but sometimes date inputs did not change
      if (FolderAdvancedFilterComponent.checkIfValuesChanged(this.previousFormValues, values)) {
        this.previousFormValues = values;
        this.notifyStateChange(values);
      }
    });
  }

  protected setQuietlyFilterValues(values: FolderTableAdvancedFilterValues): void {
    // Cloned to avoid edition of existing values
    const clonedValues = cloneDeep(values);
    this.filterForm.setValue(clonedValues, { emitEvent: false });
    this.previousFormValues = clonedValues;
  }

  protected buildLocalizedItems(): void {
    this.maritimeEntitiesOptionLabel = this.translate.currentLang === 'es' ? 'name' : 'internationalName';
    this.areasOptionLabel = this.translate.currentLang === 'es' ? 'name' : 'internationalName';
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }

  ngAfterViewInit(): void {
    if (this.dropdown) {
      (this.dropdown.filterBy as any) = {
        split: (_: any) => [(item: any) => item],
      };
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.filterStateSubscription.unsubscribe();
  }
}
