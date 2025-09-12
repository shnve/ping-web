import { Component, Input } from '@angular/core';
import { InfosourceTableFilterValues } from '@app/infosource/models/infosource-filters.model';
import { PaginatedTableComponent } from '@app/shared/components/paginated-table/paginated-table.component';


@Component({
  selector: 'infosource-paginated-table',
  templateUrl: '../../../../shared/components/paginated-table/paginated-table.component.html',
  styleUrls: ['../../../../shared/components/paginated-table/paginated-table.component.scss']
})
export class InfosourcePaginatedTableComponent<InfosourceTableType> extends PaginatedTableComponent<InfosourceTableType> {

  @Input() appliedFilterValues: InfosourceTableFilterValues;

  constructor() {
    super();
    this.msgHasNoRequiredSelection = 'info-table.no-service-selected';
    this.defaultSortField = 'validationTime';
    this.defaultSortOrder = -1;
  }
}
