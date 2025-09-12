import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {TableFiltersComponent} from '@app/components/shared/table-filters/table-filters.component';
import { Caretaker, Originator } from '@app/core/patterns/memento/memento';
import { TableFilterValues } from '@app/models/warning-filters.model';

@Component({
  selector: 'app-table-filters-bar',
  templateUrl: './table-filters-bar.component.html',
  styleUrls: ['./table-filters-bar.component.scss']
})
export class TableFiltersBarComponent extends TableFiltersComponent {

  private readonly caretaker: Caretaker<TableFilterValues>;

  private readonly originator: Originator<TableFilterValues>;

  isShowFilters = false;

  constructor(private readonly translateService: TranslateService) {
    super(translateService);
    this.caretaker = new Caretaker<TableFilterValues>();
    this.originator = new Originator<TableFilterValues>();
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
