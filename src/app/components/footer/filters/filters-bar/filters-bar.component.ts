import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MapFiltersComponent} from '@app/components/shared/map-filters/map-filters.component';
import {MapFilterValues} from '@app/models/warning-filters.model';
import {Caretaker, Originator} from '@app/core/patterns/memento/memento';

@Component({
  selector: 'app-filters-bar',
  templateUrl: './filters-bar.component.html',
  styleUrls: ['./filters-bar.component.scss']
})
export class FiltersBarComponent extends MapFiltersComponent {

  private readonly caretaker: Caretaker<MapFilterValues>;

  private readonly originator: Originator<MapFilterValues>;

  isShowFilters = false;

  constructor(private readonly translateService: TranslateService) {
    super(translateService);
    this.caretaker = new Caretaker<MapFilterValues>();
    this.originator = new Originator<MapFilterValues>();
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
