import { Component, ContentChild, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { Localize } from '@app/core/localize';
import { FolderTableFilterValues } from '@app/folder/models/folder-filters.model';
import Area from '@app/models/area.model';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import { ChipValue, FilterBannerComponent } from '@shared/components/filter-banner/filter-banner.component';
import { cloneDeep } from 'lodash-es';
import { Subscription } from 'rxjs';

@Component({
  selector: 'folder-table-filter-banner',
  templateUrl: './folder-table-filter-banner.component.html',
  styleUrls: [
    '../../../../shared/components/filter-banner/filter-banner.component.scss',
    './folder-table-filter-banner.component.scss'
  ]
})
@Localize()
export class FolderTableFilterBannerComponent extends FilterBannerComponent<FolderTableFilterValues> implements OnChanges, OnDestroy {
  @ContentChild(TemplateRef) advancedFilterComponent!: TemplateRef<any>;
  private subscriptions: Subscription;
  quickFilterAccessChips: ChipValue[] = [];
  @Input() areaSelected: Area;

  // Function that generate chip from used filters
  @Input() chipGenerator?: (nwFilterValues: FolderTableFilterValues) => ChipValue[];
  @Output() onFilterChange = new EventEmitter<FolderTableFilterValues>();
  @Input() set filterState(filterState: ModelItemFilterState<FolderTableFilterValues>) {
    if (this._filterState) {
      this.subscriptions.unsubscribe();
    }
    this._filterState = filterState;
    this.subscriptions = this._filterState.getValues$().subscribe(this.filterChanged.bind(this));
  }
  @Input() areas: Area[] = [];

  constructor(private readonly translate: TranslateService) {
    super({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.areaSelected && changes.areaSelected.currentValue?.id !== changes.areaSelected.previousValue?.id) {
      this.selectArea();
    }
    if (changes.areas) {
      this.areaSelected = this._filterState.getValues().area;
      if (this.areaSelected) {
        this._filterState.setValues({
          ...this._filterState.getValues(),
          area: this.areaSelected
        });
      }
    }
  }

  selectArea(): void {
    // Update filter state
    this._filterState.setValues({
      area: this.areaSelected
    });
  }

  filterChanged(nwFilterValues: FolderTableFilterValues): void {
    this.filterValues = cloneDeep(nwFilterValues);
    if (this.filterValues.area) {
      const selectedId = this.filterValues.area.id;
      // Wait next event loop cycle to force dropdown refresh
      setTimeout(() => this.areaSelected = this.areas.find(area => area.id === selectedId));
    }
    if (this.chipGenerator) {
      this.quickFilterAccessChips = this.chipGenerator(nwFilterValues);
    }
    if (!this.filterValues.area) { return; }
    this.onFilterChange.emit(this.filterValues);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
