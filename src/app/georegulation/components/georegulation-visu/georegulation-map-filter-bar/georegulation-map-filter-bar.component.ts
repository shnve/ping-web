import { Component } from '@angular/core';
import { Caretaker, Originator } from '@app/core/patterns/memento/memento';
import { GeoregulationMapFilterValues } from '@app/georegulation/models/georegulation-filters.model';
import { TranslateService } from '@ngx-translate/core';
import { GeoregulationMapFilterBannerComponent } from '../georegulation-map-filter-banner/georegulation-map-filter-banner.component';

@Component({
  selector: 'georegulation-map-filter-bar',
  templateUrl: './georegulation-map-filter-bar.component.html',
  styleUrls: ['./georegulation-map-filter-bar.component.scss']
})
export class GeoregulationMapFilterBarComponent extends GeoregulationMapFilterBannerComponent {

  private readonly caretaker: Caretaker<GeoregulationMapFilterValues>;

  private readonly originator: Originator<GeoregulationMapFilterValues>;

  isShowFilters = false;

  constructor(protected readonly translate: TranslateService) {
    super(translate);
    this.caretaker = new Caretaker<GeoregulationMapFilterValues>();
    this.originator = new Originator<GeoregulationMapFilterValues>();
  }

  toggleFilterContent($event: MouseEvent): void {
    if (!this.isShowFilters) {
      this.originator.setState(this._filterState.getValues());
      this.caretaker.setMemento(this.originator.commit());
    } else {
      this.originator.rollback(this.caretaker.getMemento());
      this._filterState.setValues({...this.originator.getState()});
    }
    this.isShowFilters = !this.isShowFilters;
    $event.preventDefault();
  }

  applyFilterContent($event: MouseEvent): void {
    if (this.isShowFilters) {
      this.originator.setState(this._filterState.getValues());
      this.caretaker.setMemento(this.originator.commit());
      this._filterState.getValues().disableFilter = false;
      this._filterState.emitValues();
      this._filterState.getValues().disableFilter = true;
    }
    this.toggleFilterContent($event);
  }

}
