import { Component, Input } from '@angular/core';
import { PaginatedTableComponent } from '@app/shared/components/paginated-table/paginated-table.component';
import { SubscriptionTableFilterValues } from '@app/subscription/models/subscription-filters.model';


@Component({
  selector: 'subscription-paginated-table',
  templateUrl: '../../../../shared/components/paginated-table/paginated-table.component.html',
  styleUrls: ['../../../../shared/components/paginated-table/paginated-table.component.scss']
})
export class SubscriptionPaginatedTableComponent<SubscriptionTableType> extends PaginatedTableComponent<SubscriptionTableType> {

  @Input() appliedFilterValues: SubscriptionTableFilterValues;

  constructor() {
    super();
    this.defaultSortField = 'creationDate';
    this.defaultSortOrder = -1;
  }
}
