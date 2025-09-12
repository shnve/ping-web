import {Component, EventEmitter, OnDestroy, Output, Input, SimpleChanges, OnChanges, ContentChild, TemplateRef} from '@angular/core';
import {TableFilterValues} from '../../../models/warning-filters.model';
import {TranslateService} from '@ngx-translate/core';
import { ChipValue, FilterBannerComponent } from '@shared/components/filter-banner/filter-banner.component';
import { Localize } from '@app/core/localize';
import { cloneDeep } from 'lodash-es';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { Serie } from '@app/models/serie.model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'shared-table-filter-banner',
  templateUrl: './table-filter-banner.component.html',
  styleUrls: [
    '../filter-banner/filter-banner.component.scss',
    './table-filter-banner.component.scss'
  ]
})
@Localize()
export class TableFilterBannerComponent extends FilterBannerComponent<TableFilterValues> implements OnChanges, OnDestroy {
  @ContentChild(TemplateRef) advancedFilterComponent!: TemplateRef<any>;
  private subscriptions: Subscription;
  quickFilterAccessChips: ChipValue[] = [];
  readonly tableViewOptions = [
    {code: 'list', translateKey: 'filter.filter-bar.table-view.list', icon: 'pi pi-list', hide: true},
    {code: 'detail', translateKey: 'filter.filter-bar.table-view.details', icon: 'pi pi-th-large', hide: true}
  ];
  @Input() serieSelected: Serie;
  @Input() listDetailSwitcher: boolean;
  @Input() tableView: 'list' | 'detail' = 'list';
  // Function that generate chip from used filters
  @Input() chipGenerator?: (nwFilterValues: TableFilterValues) => ChipValue[];
  @Output() onFilterChange = new EventEmitter<TableFilterValues>();
  @Output() onChangeTableView  = new EventEmitter<boolean>();
  @Input() set filterState(filterState: ModelItemFilterState<TableFilterValues>) {
    if(this._filterState) {
      this.subscriptions.unsubscribe();
    }
    this._filterState = filterState;
    this.subscriptions = this._filterState.getValues$().subscribe(this.filterChanged.bind(this));
  }
  @Input() series: Serie[];

  constructor(private readonly translate: TranslateService) {
    super({})
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.serieSelected && changes.serieSelected.currentValue?.id !== changes.serieSelected.previousValue?.id) {
      this.selectSerie();
    }
    if(changes.series) {
      this.serieSelected = this._filterState.getValues().serie;
      if(this.serieSelected) {
        this._filterState.setValues({
          ...this._filterState.getValues(),
          serie: this.serieSelected
        });
      }
    }
  }

  selectSerie() {
    // Update filter state
    this._filterState.setValues({
      serie: this.serieSelected,
      subAreaIds: []
    });
  }

  filterChanged(nwFilterValues: TableFilterValues) {
    this.filterValues = cloneDeep(nwFilterValues);
    if(this.filterValues.serie) {
      const selectedId = this.filterValues.serie.id;
      // Wait next event loop cycle to force dropdown refresh
      setTimeout(() => this.serieSelected = this.series.find(serie => serie.id === selectedId));
    }
    if(this.chipGenerator) {
      this.quickFilterAccessChips = this.chipGenerator(nwFilterValues);
    }

  }

  changeTableView() {
    this.onChangeTableView.emit(this.tableView === 'detail');
  }

  ngOnDestroy(): void {
    this.subscriptions && this.subscriptions.unsubscribe();
  }
}
