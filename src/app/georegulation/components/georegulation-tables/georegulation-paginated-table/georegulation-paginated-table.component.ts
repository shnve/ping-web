import { Component, Input } from '@angular/core';
import { GeoregulationTableFilterValues } from '@app/georegulation/models/georegulation-filters.model';
import { PaginatedTableComponent } from '@app/shared/components/paginated-table/paginated-table.component';

@Component({
  selector: 'georegulation-paginated-table',
  templateUrl: '../../../../shared/components/paginated-table/paginated-table.component.html',
  styleUrls: ['../../../../shared/components/paginated-table/paginated-table.component.scss']
})
export class GeoregulationPaginatedTableComponent<GeoregulationTableType> extends PaginatedTableComponent<GeoregulationTableType> {

  @Input() appliedFilterValues: GeoregulationTableFilterValues;

  constructor() {
    super();
    this.defaultSortField = 'number';
    this.defaultSortOrder = -1;
  }
}
