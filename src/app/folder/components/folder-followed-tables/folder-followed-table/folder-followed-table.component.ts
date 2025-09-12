import { Component, Input } from '@angular/core';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';

@Component({
  selector: 'folder-followed-paginated-table',
  templateUrl: '../../../../shared/components/paginated-table/paginated-table.component.html',
  styleUrls: ['../../../../shared/components/paginated-table/paginated-table.component.scss']
})
export class FolderFollowedTableComponent<FolderFollowedTableType> extends PaginatedTableComponent<FolderFollowedTableType> {

  @Input() appliedFilterValues: FolderFollowedTableType;

  constructor() {
    super();
    this.msgHasNoRequiredSelection = 'folder-table.no-service-selected';
    this.defaultSortField = 'number';
    this.defaultSortOrder = -1;
  }
}
