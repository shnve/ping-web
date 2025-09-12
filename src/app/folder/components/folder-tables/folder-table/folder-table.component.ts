import { Component, Input } from '@angular/core';
import { PaginatedTableComponent } from '@app/shared/components/paginated-table/paginated-table.component';
import { FolderTableFilterValues } from '@app/folder/models/folder-filters.model';


@Component({
  selector: 'folder-paginated-table',
  templateUrl: '../../../../shared/components/paginated-table/paginated-table.component.html',
  styleUrls: ['../../../../shared/components/paginated-table/paginated-table.component.scss']
})
export class FolderPaginatedTableComponent<FolderTableType> extends PaginatedTableComponent<FolderTableType> {

  @Input() appliedFilterValues: FolderTableFilterValues;

  constructor() {
    super();
    this.msgHasNoRequiredSelection = 'folder-table.no-service-selected';
    this.defaultSortField = 'number';
    this.defaultSortOrder = -1;
  }
}
