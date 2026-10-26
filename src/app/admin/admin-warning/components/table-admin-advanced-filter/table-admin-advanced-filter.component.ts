import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Localize, OnChangeLang } from '@app/core/localize';
import { FolderBase } from '@app/folder/models/folder.model';
import { FolderService } from '@app/folder/services/folder.service';
import { TableAdminAdvancedFilterValues, TableAdminFilterValues, defaultValuesTableAdminFilter } from '@app/models/admin/warning-admin-filter.model';
import { MaritimeEntityBase } from '@app/models/maritime-entity.model';
import { SubArea } from '@app/models/sub-area.model';
import { listWarningHazardTypeDetails, listWarningHazardTypeGeneral } from '@app/models/warning.model';
import { MaritimeEntitiesService } from '@app/services/maritime-entities.service';
import { TranslateService } from '@ngx-translate/core';
import { Scavenger } from '@wishtack/rx-scavenger';
import { cloneDeep, defaultsDeep, isEqual, pick } from 'lodash-es';
import { Subscription } from 'rxjs';
import { ModelItemFilterState } from '../../../../states/warning-filter.state';

@Component({
  selector: 'app-table-admin-advanced-filter',
  templateUrl: './table-admin-advanced-filter.component.html',
  styleUrls: ['./table-admin-advanced-filter.component.scss']
})
@Localize()
export class TableAdminAdvancedFilterComponent implements OnInit, OnDestroy, OnChangeLang {

  private readonly scavenger = new Scavenger(this);

  filterForm = this.fb.group({
    todo: false,
    warningNumber: '',
    modelName: '',
    subAreaIds: [[]],
    generalCategory: null,
    detailsCategories: [[]],
    localityOrInformation: '',
    referenceNumber: '',
    concernedMaritimeEntityIds: [[]],
    entityCoverIds: [[]],
    folderIds: [[]],
    period: this.fb.group({
      startDate: [null],
      endDate: [null]
    })
  });

  @Input('subAreas') availableSubAreas: SubArea[] = [];
  @Input('selectedStatus') selectedStatus: string;
  @Input() selectedSerieId: string;

  sectorOptionLabel: 'name' | 'internationalName';
  availableGeneralCategories: Array<{ key: string, value: string }>;
  availableDetailsCategories: Array<{ key: string, value: string }>;

  readonly yearRange: string = `${(new Date()).getFullYear() - 20}:${(new Date()).getFullYear() + 20}`;

  private subscriptions: Subscription[] = [];
  protected previousFormValues: TableAdminAdvancedFilterValues;
  private filterStateSubscription: Subscription;
  _filterState: ModelItemFilterState<TableAdminFilterValues>;
  @Input() set filterState(filterState: ModelItemFilterState<TableAdminFilterValues>) {
    if (this._filterState) {
      this.filterStateSubscription.unsubscribe();
    }
    this._filterState = filterState;
    this.filterStateSubscription = this._filterState.getValues$().subscribe(this.onFilterStateChange.bind(this));
  }

  availableEntities: MaritimeEntityBase[] = [];
  availableLinkedEntities: MaritimeEntityBase[] = [];
  availableFolders: FolderBase[] = [];

  constructor(private readonly fb: UntypedFormBuilder,
    private readonly translate: TranslateService,
    private readonly maritimeEntitiesService: MaritimeEntitiesService,
    private readonly folderService: FolderService
  ) {
    this.buildLocalizedItems();
    // Before filterState setted
    this.setQuietlyFilterValues(TableAdminAdvancedFilterComponent.pickAdvancedFiltersValues(defaultValuesTableAdminFilter));
  }

  ngOnInit(): void {
    this.subscriptions.push(this.subscribeToFormValueChanges());
    // get concerned maritime entities to filter
    this.maritimeEntitiesService.getAvailableWarningEntities$()
      .pipe(this.scavenger.collect())
      .subscribe(availableEntities => this.availableEntities = availableEntities);

    // get linked entities to filter cover
    this.maritimeEntitiesService.getLinkedEntitiesForCoverFiltering$(this.selectedSerieId, false)
      .pipe(this.scavenger.collect())
      .subscribe(availableLinkedEntities => this.availableLinkedEntities = availableLinkedEntities);

    // get folders to filter
    this.folderService.getAvailableWarningFolders$()
      .pipe(this.scavenger.collect())
      .subscribe(availableFolders => this.availableFolders = availableFolders);
  }

  /**
   * Compare 2 filterValues and returns true if they are diffrents
   * @param {TableAdminAdvancedFilterValues} previousValues
   * @param {TableAdminAdvancedFilterValues} values
   * @returns {boolean}
   */
  protected static checkIfValuesChange(previousValues: TableAdminAdvancedFilterValues, values: TableAdminAdvancedFilterValues): boolean {
    return previousValues.period.startDate !== values.period?.startDate
      || previousValues.period.endDate !== values.period?.endDate
      || previousValues.todo !== values.todo
      || previousValues.warningNumber !== values.warningNumber
      || previousValues.modelName !== values.modelName
      || previousValues.referenceNumber !== values.referenceNumber
      || previousValues.localityOrInformation !== values.localityOrInformation
      || !isEqual(previousValues.subAreaIds, values.subAreaIds)
      || previousValues.generalCategory !== values.generalCategory
      || !isEqual(previousValues.detailsCategories, values.detailsCategories)
      || !isEqual(previousValues.concernedMaritimeEntityIds, values.concernedMaritimeEntityIds)
      || !isEqual(previousValues.entityCoverIds, values.entityCoverIds)
      || !isEqual(previousValues.folderIds, values.folderIds)
  }

  notifyStateChange(advancedFilterValues: TableAdminAdvancedFilterValues): void {
    const allFilterValues = this._filterState.getValues();
    this._filterState.setValues({
      ...allFilterValues,
      ...advancedFilterValues
    });
  }

  onFilterStateChange(values: TableAdminFilterValues): void {
    const advancedFilterValues = TableAdminAdvancedFilterComponent.pickAdvancedFiltersValues(values);
    if (!TableAdminAdvancedFilterComponent.checkIfValuesChange(this.filterForm.value, advancedFilterValues)) {
      return;
    }
    const formatedValues = defaultsDeep(
      advancedFilterValues,
      TableAdminAdvancedFilterComponent.pickAdvancedFiltersValues(this._filterState.getDefaultValues())
    );
    this.setQuietlyFilterValues(formatedValues);
  }

  protected subscribeToFormValueChanges(): Subscription {
    return this.filterForm.valueChanges.subscribe((values: TableAdminAdvancedFilterValues) => {
      // Check if REALLY change, because FormGroup detects all 'valueChanges' but sometimes date inputs did not change
      if (TableAdminAdvancedFilterComponent.checkIfValuesChange(this.previousFormValues, values)) {
        this.previousFormValues = values;
        this.notifyStateChange(values);
      }
    });
  }

  protected setQuietlyFilterValues(values: TableAdminAdvancedFilterValues): void {
    // Cloned to avoid edition of existing values
    const clonedValues = cloneDeep(values);
    this.filterForm.setValue(clonedValues, { emitEvent: false });
    this.previousFormValues = clonedValues;
  }

  /**
   * Pick only usefull key from MapFilterFormValues to create an AdvacedMapFilterFormValues object
   * @param {TableAdminFilterValues} filterValues
   * @returns {TableAdminFilterValues}
   */
  protected static pickAdvancedFiltersValues(filterValues: TableAdminFilterValues): TableAdminAdvancedFilterValues {
    return pick(
      filterValues,
      [
        'period',
        'todo',
        'warningNumber',
        'modelName',
        'generalCategory',
        'detailsCategories',
        'localityOrInformation',
        'subAreaIds',
        'concernedMaritimeEntityIds',
        'entityCoverIds',
        'folderIds',
        'referenceNumber'
      ]
    );
  }

  protected buildLocalizedItems(): void {
    this.availableGeneralCategories = listWarningHazardTypeGeneral.map(({ key, value }) => ({
      key,
      value: this.translate.instant(value)
    })
    );
    this.availableDetailsCategories = listWarningHazardTypeDetails.map(({ key, value }) => ({
      key,
      value: this.translate.instant(value)
    }
    ));
    this.sectorOptionLabel = this.translate.currentLang === 'es' ? 'name' : 'internationalName';
  }

  onChangeLang(): void {
    this.buildLocalizedItems();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.filterStateSubscription && this.filterStateSubscription.unsubscribe();
  }
}
