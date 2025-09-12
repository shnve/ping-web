import { Component, Input } from '@angular/core';
import { SurveyTableFilterValues } from '@app/survey/models/survey-filters.model';
import { PaginatedTableComponent } from '../../../../shared/components/paginated-table/paginated-table.component';

@Component({
  selector: 'survey-paginated-table',
  templateUrl: '../../../../shared/components/paginated-table/paginated-table.component.html',
  styleUrls: ['../../../../shared/components/paginated-table/paginated-table.component.scss']
})
export class SurveyPaginatedTableComponent<SurveyTableType> extends PaginatedTableComponent<SurveyTableType> {

  @Input() appliedFilterValues: SurveyTableFilterValues;

  constructor() {
    super();
    this.defaultSortField = 'identifier';
    this.defaultSortOrder = -1;
  }
}
