import {
  AfterViewInit,
  Component, EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output, SimpleChanges
} from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { Serie } from '@app/models/serie.model';
import { TableFilterValues } from '@app/models/warning-filters.model';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import { isFilterBarShown } from '@shared/ui-utils';
import { cloneDeep } from 'lodash-es';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table-filters',
  template: ''
})
@Localize()
export class TableFiltersComponent implements OnChanges, OnDestroy, OnChangeLang, AfterViewInit {
  private subscriptions: Subscription;
  filterValues: TableFilterValues = {};
  serieSelected: Serie;
  _filterState: ModelItemFilterState<TableFilterValues>;
  serieOptionLabel: 'name' | 'internationalName';
  nbFilters = 0;

  @Output() onFilterChange = new EventEmitter<TableFilterValues>();
  @Input() series: Serie[];
  @Input() set filterState(filterState: ModelItemFilterState<TableFilterValues>) {
    if (this._filterState) {
      this.subscriptions.unsubscribe();
    }
    this._filterState = filterState;
    this.subscriptions = this._filterState.getValues$().subscribe(this.filterChanged.bind(this));
  }

  constructor(private readonly translate: TranslateService) {
    this.onChangeLang();
  }

  ngAfterViewInit(): void {
    if (this.filterValues) {
      this.filterValues.disableFilter = isFilterBarShown();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.series) {
      this.serieSelected = this._filterState.getValues().serie;
      if (this.serieSelected) {
        this._filterState.setValues({
          ...this._filterState.getValues(),
          serie: this.serieSelected,
          disableFilter: isFilterBarShown()
        });
      }
    }
  }

  selectSerie(): void {
    // Update filter state
    this._filterState.setValues({
      ...this._filterState.getValues(),
      serie: this.serieSelected,
      subAreaIds: [],
      disableFilter: isFilterBarShown()
    });
  }

  filterChanged(nwFilterValues: TableFilterValues): void {
    this.filterValues = cloneDeep(nwFilterValues);
    this.filterValues.disableFilter = isFilterBarShown();
    if (this.filterValues.serie) {
      const selectedId = this.filterValues.serie.id;
      // Wait next event loop cycle to force dropdown refresh
      setTimeout(() => {
        this.serieSelected = this.series.find(serie => serie.id === selectedId);
        this.countFilters();
      });
    }
  }

  countFilters(): void {
    this.nbFilters = 0;
    if (this.filterValues.subAreaIds) { this.nbFilters += this.filterValues.subAreaIds.length; }
    if (this.filterValues.categories) { this.nbFilters += this.filterValues.categories.length; }
    if (this.filterValues.period?.startDate) { this.nbFilters++; }
    if (this.filterValues.period?.endDate) { this.nbFilters++; }
    if (this.filterValues.publishDate) { this.nbFilters++; }
  }

  onChangeLang(): void {
    this.serieOptionLabel = this.translate.currentLang === 'fr' ? 'name' : 'internationalName';
  }

  ngOnDestroy(): void {
    this.subscriptions && this.subscriptions.unsubscribe();
  }
}
