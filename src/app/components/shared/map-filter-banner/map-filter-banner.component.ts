import { Component, OnInit } from '@angular/core';
import { Localize, OnChangeLang } from '@app/core/localize';
import { TranslateService } from '@ngx-translate/core';
import { ChipValue } from '@shared/components/filter-banner/filter-banner.component';
import format from 'date-fns/format';
import { MapFilterValues, WarningDisplayType } from '../../../models/warning-filters.model';
import { MapFiltersComponent } from '../map-filters/map-filters.component';

export type WarningTypeOption = { code: WarningDisplayType, text: string };
@Component({
  selector: 'app-map-filter-banner',
  templateUrl: './map-filter-banner.component.html',
  styleUrls: [
    '../../../shared/components/filter-banner/filter-banner.component.scss',
    './map-filter-banner.component.scss'
  ]
})
@Localize()
export class MapFilterBannerComponent extends MapFiltersComponent implements OnInit, OnChangeLang {

  quickFilterAccessChips: ChipValue[] = [];

  ngOnInit(): void {
    this.buildWarningTypeOptions();
  }

  constructor(readonly translate: TranslateService) {
    super(translate);
  }

  filterChanged(nwFilterValues: MapFilterValues) {
    super.filterChanged(nwFilterValues);
    this.generateFilterChipsText(nwFilterValues);
  }

  protected generateFilterChipsText(filterValues: MapFilterValues): void {
    this.quickFilterAccessChips = [];
    if (filterValues.period?.startDate || filterValues?.period?.endDate) {
      this.transformDatePeriodeToChip(filterValues.period);
    }
    if (filterValues.publishDate) {
      this.quickFilterAccessChips.push({
        key: 'publishDate',
        translateKey: 'filter.filter-bar.chip.publish-date',
        translateParams: { date: format(filterValues.publishDate, 'dd/MM/yy') }
      });
    }
  }

  protected transformDatePeriodeToChip({ startDate, endDate }: { startDate?: Date, endDate?: Date }): void {
    const periodFormated = [
      startDate ? format(startDate, 'dd/MM/yy') : '',
      endDate ? format(endDate, 'dd/MM/yy') : '',
    ];
    this.quickFilterAccessChips.push({
      key: 'period',
      translateKey: 'filter.filter-bar.chip.period',
      translateParams: { period: periodFormated.join(' - ') }
    });
  }

  removeQuickFilterChip(chipKey: string): void {
    if (chipKey.startsWith('displayType')) {
      const found = this.filterValues.displayTypes.find(displayType => chipKey === 'displayType' + displayType);
      if (!found) {
        return;
      }
      const idxDisplayType = this.filterValues.displayTypes.findIndex(gbt => gbt === found);
      if (idxDisplayType > -1) {
        this.filterValues.displayTypes.splice(idxDisplayType, 1);
      }
      const idx = this.selectedWarningType.findIndex(opt => opt.code === found);
      if (idx > -1) {
        this.selectedWarningType.splice(idx, 1);
      }
      this._filterState.setValues(this.filterValues);
      return;
    }
    super.removeQuickFilterChip(chipKey);
  }

  onChangeLang(): void {
    this.buildWarningTypeOptions();
  }
}
