import { Component, ContentChild, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { Localize } from '@app/core/localize';
import { FolderTableFilterValues } from '@app/folder/models/folder-filters.model';
import MaritimeService from '@app/models/maritime-service.model';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import { ChipValue, FilterBannerComponent } from '@shared/components/filter-banner/filter-banner.component';
import { cloneDeep } from 'lodash-es';
import { Subscription } from 'rxjs';


@Component({
  selector: 'folder-followed-table-filter-banner',
  templateUrl: './folder-followed-table-filter-banner.component.html',
  styleUrls: [
    '../../../../shared/components/filter-banner/filter-banner.component.scss',
    './folder-followed-table-filter-banner.component.scss'
  ]
})
@Localize()
export class FolderFollowedTableFilterBannerComponent extends FilterBannerComponent<FolderTableFilterValues> implements OnChanges, OnDestroy {
  @ContentChild(TemplateRef) advancedFilterComponent!: TemplateRef<any>;
  private subscriptions: Subscription;
  quickFilterAccessChips: ChipValue[] = [];
  @Input() serviceSelected: MaritimeService;

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
  @Input() services: MaritimeService[] = [];

  constructor(private readonly translate: TranslateService) {
    super({});
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.serieSelected && changes.serieSelected.currentValue?.id !== changes.serieSelected.previousValue?.id) {
      this.selectService();
    }
    if (changes.services) {
      this.serviceSelected = this._filterState.getValues().followerService;
      if (this.serviceSelected) {
        this._filterState.setValues({
          ...this._filterState.getValues(),
          followerService: this.serviceSelected
        });
      }
    }
  }

  selectService() {
    // Update filter state
    this._filterState.setValues({
      followerService: this.serviceSelected
    });
  }

  filterChanged(nwFilterValues: FolderTableFilterValues): void {
    this.filterValues = cloneDeep(nwFilterValues);
    if (this.filterValues.followerService) {
      const selectedId = this.filterValues.followerService.id;
      // Wait next event loop cycle to force dropdown refresh
      setTimeout(() => this.serviceSelected = this.services.find(service => service.id === selectedId));
    }
    if (this.chipGenerator) {
      this.quickFilterAccessChips = this.chipGenerator(nwFilterValues);
    }
    if (!this.filterValues.followerService) { return; }
    this.onFilterChange.emit(this.filterValues);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
