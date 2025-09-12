import { Component, ContentChild, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, TemplateRef } from '@angular/core';
import MaritimeService from '@app/models/maritime-service.model';
import { ChipValue, FilterBannerComponent } from '@app/shared/components/filter-banner/filter-banner.component';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { SurveyTableFilterValues } from '@app/survey/models/survey-filters.model';
import { cloneDeep } from 'lodash-es';
import { Subscription } from 'rxjs';

@Component({
  selector: 'survey-table-filter-banner',
  templateUrl: './survey-table-filter-banner.component.html',
  styleUrls: [
    '../../../../shared/components/filter-banner/filter-banner.component.scss',
    './survey-table-filter-banner.component.scss'
  ]
})
export class SurveyTableFilterBannerComponent extends FilterBannerComponent<SurveyTableFilterValues> implements OnChanges, OnDestroy {

  private subscriptions: Subscription;

  @ContentChild(TemplateRef) advancedFilterComponent!: TemplateRef<any>;

  @Input() chipGenerator?: (nwFilterValues: SurveyTableFilterValues) => ChipValue[];
  @Input() selectedService: MaritimeService;
  @Input() services: MaritimeService[] = [];
  @Input() displayServiceFilter = false;
  @Input() set filterState(filterState: ModelItemFilterState<SurveyTableFilterValues>) {
    if (this._filterState) {
      this.subscriptions.unsubscribe();
    }
    this._filterState = filterState;
    this.subscriptions = this._filterState.getValues$().subscribe(this.filterChanged.bind(this));
  }

  @Output() filterHasChanged = new EventEmitter<SurveyTableFilterValues>();

  constructor() {
    super({});
  }

  ngOnDestroy(): void {
    if (this.subscriptions) { this.subscriptions.unsubscribe(); }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedService) {
      this.selectService();
    }

    if (changes.services) {
      this.selectedService = this._filterState.getValues().service;
      if (this.selectedService) {
        this._filterState.setValues({
          ...this._filterState.getValues(),
          service: this.selectedService
        });
      }
    }
  }

  selectService(): void {
    this._filterState.setValues({
      service: this.selectedService
    });
  }

  filterChanged(nwFilterValues: SurveyTableFilterValues): void {
    this.filterValues = cloneDeep(nwFilterValues);
    if (this.filterValues.service) {
      const selectedId = this.filterValues.service.id;
      // Wait next event loop cycle to force dropdown refresh
      setTimeout(() => this.selectedService = this.services.find(service => service.id === selectedId));
    }

    if (this.chipGenerator) {
      this.quickFilterAccessChips = this.chipGenerator(nwFilterValues);
    }

    if (this.displayServiceFilter && !this.filterValues.service) { return; }
    this.filterHasChanged.emit(this.filterValues);
  }
}
