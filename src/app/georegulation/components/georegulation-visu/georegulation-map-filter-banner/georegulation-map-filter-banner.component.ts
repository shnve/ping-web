import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { GeoregulationDisplayType, GeoregulationDisplayTypeOption, GeoregulationMapFilterValues } from '@app/georegulation/models/georegulation-filters.model';
import { FilterBannerComponent } from '@app/shared/components/filter-banner/filter-banner.component';
import { isFilterBarShown } from '@app/shared/ui-utils';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import format from 'date-fns/format';
import { cloneDeep } from 'lodash-es';
import { Subscription } from 'rxjs';

type ChipValue = {
  key: string;
  translateKey: string,
  translateKeyOne?: string,
  translateParams?: { [key: string]: string | number }
};

type CheckedDisplayType = { checked: GeoregulationDisplayTypeOption[] };

@Component({
  selector: 'georegulation-map-filter-banner',
  templateUrl: './georegulation-map-filter-banner.component.html',
  styleUrls: [
    '../../../../shared/components/filter-banner/filter-banner.component.scss',
    './georegulation-map-filter-banner.component.scss'
  ]
})
@Localize()
export class GeoregulationMapFilterBannerComponent extends FilterBannerComponent<GeoregulationMapFilterValues> implements OnInit, OnChangeLang {

  georegulationDisplayTypeOptions: GeoregulationDisplayTypeOption[];
  selectedGeoregulationDisplayTypes: GeoregulationDisplayTypeOption[];

  quickFilterAccessChips: ChipValue[] = [];
  filterValues: GeoregulationMapFilterValues = { displayTypes: [] };
  _filterState: ModelItemFilterState<GeoregulationMapFilterValues>;
  nbFilters = 0;

  private subscriptions: Subscription;

  @Input() set filterState(filterState: ModelItemFilterState<GeoregulationMapFilterValues>) {
    if (this._filterState) {
      this.subscriptions.unsubscribe();
    }
    this._filterState = filterState;
    this.subscriptions = this._filterState.getValues$().subscribe(this.filterChanged.bind(this));
  }

  @Output() filterHasChanged = new EventEmitter<GeoregulationMapFilterValues>();

  constructor(protected readonly translate: TranslateService) {
    super({});
  }

  ngOnInit(): void {
    this.buildDisplayTypeOptions();
  }

  onChangeLang(): void {
    this.buildDisplayTypeOptions();
  }

  buildDisplayTypeOptions(): void {
    const selectedCode = this.selectedGeoregulationDisplayTypes?.map(({ code }) => code) ?? [];

    this.georegulationDisplayTypeOptions = [
      {code: GeoregulationDisplayType.ALL_TERRITORIAL_SEA , text: this.translate.instant('filter.filter-bar.' + GeoregulationDisplayType.ALL_TERRITORIAL_SEA)},
      {code: GeoregulationDisplayType.NOT_ALL_TERRITORIAL_SEA , text: this.translate.instant('filter.filter-bar.' + GeoregulationDisplayType.NOT_ALL_TERRITORIAL_SEA)},
      {code: GeoregulationDisplayType.PERMANENT, text: this.translate.instant('filter.filter-bar.' + GeoregulationDisplayType.PERMANENT)},
      {code: GeoregulationDisplayType.TEMPORARY, text: this.translate.instant('filter.filter-bar.' + GeoregulationDisplayType.TEMPORARY)},
      {code: GeoregulationDisplayType.NOT_SEASONAL_PERIOD , text: this.translate.instant('filter.filter-bar.' + GeoregulationDisplayType.NOT_SEASONAL_PERIOD)},
      {code: GeoregulationDisplayType.SEASONAL_PERIOD , text: this.translate.instant('filter.filter-bar.' + GeoregulationDisplayType.SEASONAL_PERIOD)}
    ];

    // To 'reselect' option the options are rebuild
    this.selectedGeoregulationDisplayTypes = this.georegulationDisplayTypeOptions.filter(({ code }) => selectedCode.includes(code));
  }

  displayTypeOptionClicked(event: CheckedDisplayType): void {
    this.filterValues.displayTypes = cloneDeep(event.checked.map(option => option.code));
    this.filterValues.disableFilter = isFilterBarShown();
    this._filterState.setValues(this.filterValues);
  }


  filterChanged(filterValues: GeoregulationMapFilterValues): void {
    this.filterValues = cloneDeep(filterValues);
    this.filterValues.disableFilter = isFilterBarShown();
    // Wait event loop cycle to force selectButton refresh
    setTimeout(() => {
      this.selectedGeoregulationDisplayTypes = [];
      this.filterValues.displayTypes.forEach(displayType => {
        const displayTypeOption = this.georegulationDisplayTypeOptions.find(type => type.code === displayType);
        if (displayTypeOption) {
          this.selectedGeoregulationDisplayTypes.push(displayTypeOption);
        }
      });
      this.countFilters();
    });
    this.quickFilterAccessChips = this.generateFilterChipsText(filterValues);
  }

  countFilters(): void {
    this.nbFilters = 0;
    if (this.filterValues.displayTypes) { this.nbFilters += this.filterValues.displayTypes.length; }
    if (this.filterValues.concernedActivities) { this.nbFilters += this.filterValues.concernedActivities.length; }
    if (this.filterValues.period?.startDate) { this.nbFilters++; }
    if (this.filterValues.period?.endDate) { this.nbFilters++; }
    if (this.filterValues.publishDate) { this.nbFilters++; }
  }

  /**
   * Generate chips in filter banner
   * @param filterValues
   * @returns
   */
  private generateFilterChipsText(filterValues: GeoregulationMapFilterValues): ChipValue[] {
    const chips: ChipValue[] = [];

    if (filterValues.concernedActivities?.length) {
      chips.push({
        key: 'concernedActivities',
        translateKey: 'filter.filter-bar.chip.georegulation.activities',
        translateKeyOne: 'filter.filter-bar.chip.georegulation.activity',
        translateParams: { count: filterValues.concernedActivities.length }
      });
    }

    if (filterValues.period?.startDate || filterValues?.period?.endDate) {
      chips.push(this.transformDatePeriodeToChip(filterValues.period));
    }

    if (filterValues.publishDate) {
      chips.push({
        key: 'publishDate',
        translateKey: 'filter.filter-bar.chip.published-since',
        translateParams: { date: format(filterValues.publishDate, 'dd/MM/yy') }
      });
    }

    return chips;
  }

  private transformDatePeriodeToChip({ startDate, endDate }: { startDate?: Date, endDate?: Date }, key = 'period'): ChipValue {
    const periodFormated = [
      startDate ? format(startDate, 'dd/MM/yy') : '',
      endDate ? format(endDate, 'dd/MM/yy') : ''
    ];
    return {
      key,
      translateKey: 'filter.filter-bar.chip.period',
      translateParams: { period: periodFormated.join(' - ') }
    };
  }

  removeQuickFilterChip(chipKey: string): void {
    if (chipKey.startsWith('displayType')) {
      const found = this.filterValues.displayTypes.find(displayType => chipKey === 'displayType' + displayType);
      if (!found) {
        return;
      }
      const idxDisplayType = this.filterValues.displayTypes.findIndex(displayType => displayType === found);
      if (idxDisplayType > -1) {
        this.filterValues.displayTypes.splice(idxDisplayType, 1);
      }
      const idx = this.selectedGeoregulationDisplayTypes.findIndex(opt => opt.code === found);
      if (idx > -1) {
        this.selectedGeoregulationDisplayTypes.splice(idx, 1);
      }
      this._filterState.setValues(this.filterValues);
      return;
    }
    super.removeQuickFilterChip(chipKey);
  }
}
