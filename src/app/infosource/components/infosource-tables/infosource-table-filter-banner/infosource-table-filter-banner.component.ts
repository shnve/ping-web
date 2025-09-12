import {Component, EventEmitter, OnDestroy, Output, Input, SimpleChanges, OnChanges, ContentChild, TemplateRef} from '@angular/core';
import {InfosourceTableFilterValues} from '../../../models/infosource-filters.model';
import {TranslateService} from '@ngx-translate/core';
import { ChipValue, FilterBannerComponent } from '@shared/components/filter-banner/filter-banner.component';
import { Localize } from '@app/core/localize';
import { cloneDeep } from 'lodash-es';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { Subscription } from 'rxjs';
import MaritimeService from '@app/models/maritime-service.model';

@Component({
  selector: 'infosource-table-filter-banner',
  templateUrl: './infosource-table-filter-banner.component.html',
  styleUrls: [
    '../../../../shared/components/filter-banner/filter-banner.component.scss',
    './infosource-table-filter-banner.component.scss'
  ]
})
@Localize()
export class InfosourceTableFilterBannerComponent extends FilterBannerComponent<InfosourceTableFilterValues> implements OnChanges, OnDestroy {
  @ContentChild(TemplateRef) advancedFilterComponent!: TemplateRef<any>;
  private subscriptions: Subscription;
  quickFilterAccessChips: ChipValue[] = [];
  @Input() serviceSelected: MaritimeService;

  // Function that generate chip from used filters
  @Input() chipGenerator?: (nwFilterValues: InfosourceTableFilterValues) => ChipValue[];
  @Output() onFilterChange = new EventEmitter<InfosourceTableFilterValues>();
  @Input() set filterState(filterState: ModelItemFilterState<InfosourceTableFilterValues>) {
    if(this._filterState) {
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
    if (changes.serieSelected) {
      this.selectService();
    }
    if (changes.services) {
      this.serviceSelected = this._filterState.getValues().service;
      if (this.serviceSelected) {
        this._filterState.setValues({
          ...this._filterState.getValues(),
          service: this.serviceSelected
        });
      }
    }
  }

  selectService() {
    // Update filter state
    this._filterState.setValues({
      service: this.serviceSelected
    });
  }

  filterChanged(nwFilterValues: InfosourceTableFilterValues): void {
    this.filterValues = cloneDeep(nwFilterValues);
    if (this.filterValues.service) {
      const selectedId = this.filterValues.service.id;
      // Wait next event loop cycle to force dropdown refresh
      setTimeout(() => this.serviceSelected = this.services.find(service => service.id === selectedId));
    }
    if (this.chipGenerator) {
      this.quickFilterAccessChips = this.chipGenerator(nwFilterValues);
    }
    if (!this.filterValues.service) { return; }
    this.onFilterChange.emit(this.filterValues);
  }

  ngOnDestroy(): void {
    this.subscriptions && this.subscriptions.unsubscribe();
  }
}
