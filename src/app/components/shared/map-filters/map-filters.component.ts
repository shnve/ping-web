import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { WarningTypeOption } from '@app/components/shared/map-filter-banner/map-filter-banner.component';
import { Localize, OnChangeLang } from '@app/core/localize';
import { SerieType } from '@app/models/serie.model';
import { MapFilterValues } from '@app/models/warning-filters.model';
import { GlobalWarningType } from '@app/models/warning.model';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateService } from '@ngx-translate/core';
import { FilterBannerComponent } from '@shared/components/filter-banner/filter-banner.component';
import { isFilterBarShown } from '@shared/ui-utils';
import { cloneDeep } from 'lodash-es';
import { Subscription } from 'rxjs';

type CheckedDisplayType = { checked: WarningTypeOption[] };

@Component({
  selector: 'app-map-filters',
  template: ''
})
@Localize()
export class MapFiltersComponent extends FilterBannerComponent<MapFilterValues> implements OnInit, OnDestroy, OnChangeLang, AfterViewInit {

  warningTypeOptions: WarningTypeOption[];
  selectedWarningType: WarningTypeOption[];
  filterValues: MapFilterValues = { displayTypes: [] };
  _filterState: ModelItemFilterState<MapFilterValues>;
  nbFilters = 0;

  @Output() onFilterChange = new EventEmitter<MapFilterValues>();
  @Input() set filterState(filterState: ModelItemFilterState<MapFilterValues>) {
    if (this._filterState) {
      this.subscriptions.unsubscribe();
    }
    this._filterState = filterState;
    this.subscriptions = this._filterState.getValues$().subscribe(this.filterChanged.bind(this));
  }
  protected subscriptions: Subscription;

  constructor(protected readonly translate: TranslateService) {
    super({});
  }

  ngOnInit(): void {
    this.buildWarningTypeOptions();
  }

  ngAfterViewInit(): void {
    if (this.filterValues) {
      this.filterValues.disableFilter = isFilterBarShown();
      this._filterState?.setValues(this.filterValues);
    }
  }

  buildWarningTypeOptions(): void {
    const selectedCode = this.selectedWarningType?.map(({ code }) => code) ?? [];
    this.warningTypeOptions = [
      { code: SerieType.NAVAREA_NAVIGATIONAL_WARNING, text: this.translate.instant('serie-type.' + SerieType.NAVAREA_NAVIGATIONAL_WARNING) },
      { code: SerieType.COASTAL_NAVIGATIONAL_WARNING, text: this.translate.instant('serie-type.' + SerieType.COASTAL_NAVIGATIONAL_WARNING) },
      { code: SerieType.LOCAL_NAVIGATIONAL_WARNING, text: this.translate.instant('serie-type.' + SerieType.LOCAL_NAVIGATIONAL_WARNING) },
      { code: GlobalWarningType.NOTICE, text: this.translate.instant('filter.filter-bar.' + GlobalWarningType.NOTICE) }
    ];
    // To 'reselect' option the options are rebuild
    this.selectedWarningType = this.warningTypeOptions.filter(({ code }) => selectedCode.includes(code));
  }

  /**
   * Click on SelectButton to select or unselect GlobalWarningType options
   * @param {{option: WarningTypeOption}} event
   */
  onWarningTypeOptionClick(event: CheckedDisplayType): void {
    this.filterValues.displayTypes = cloneDeep(event.checked.map(option => option.code));

    this.filterValues.disableFilter = isFilterBarShown();
    this._filterState.setValues(this.filterValues);
  }

  filterChanged(nwFilterValues: MapFilterValues): void {
    this.filterValues = cloneDeep(nwFilterValues);
    this.filterValues.disableFilter = isFilterBarShown();
    // Wait event loop cycle to force selectButton refresh
    setTimeout(() => {
      this.selectedWarningType = [];
      this.filterValues.displayTypes.forEach(displayType => {
        const wto = this.warningTypeOptions.find(type => type.code === displayType);
        if (wto) {
          this.selectedWarningType.push(wto);
        }
      });
      this.countFilters();
    });
  }

  countFilters(): void {
    this.nbFilters = 0;
    if (this.filterValues.displayTypes) { this.nbFilters += this.filterValues.displayTypes.length; }
    if (this.filterValues.period?.startDate) { this.nbFilters++; }
    if (this.filterValues.period?.endDate) { this.nbFilters++; }
    if (this.filterValues.publishDate) { this.nbFilters++; }
  }

  onChangeLang(): void {
    this.buildWarningTypeOptions();
  }

  ngOnDestroy(): void {
    this.subscriptions && this.subscriptions.unsubscribe();
  }
}
