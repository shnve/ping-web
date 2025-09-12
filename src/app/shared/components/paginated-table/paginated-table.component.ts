import { AfterViewInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { Serie } from '@app/models/serie.model';
import { TemplateIdDirective } from '@app/shared/directives/template-id.directive';
import { PageInfo, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { environment } from '@env/environment';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Table } from 'primeng/table';

export type Column = {key: string, translateKey: string, sortable?: boolean};

@Component({
  selector: 'shared-paginated-table',
  templateUrl: './paginated-table.component.html',
  styleUrls: ['./paginated-table.component.scss']
})
export class PaginatedTableComponent<ItemType> implements AfterViewInit {
  @ViewChild('table') table: Table;
  @ViewChild('downloadPanel') downloadPanel: OverlayPanel;
  rowPerPageOptions = environment.tableRowsPerPageOptions;
  hasRequiredSelection = true;
  msgHasNoRequiredSelection: string;
  series: Serie[];
  columnCellsMap: Map<string, TemplateRef<any>> = new Map();

  @ContentChildren(TemplateIdDirective) cells: QueryList<TemplateIdDirective>;
  @Input() items: ItemType[] = [];
  @Input() totalRecords = 0;
  @Input() pageInfo: PageInfo = {page: 0, rows: environment.tableDefaultRowsCount};
  @Input() loading = true;
  /**
   * List of columns names
   */
  @Input() columns: Column[] = [];
  @Input() showPdfExport = false;
  @Input() showS124Export = false;
  @Input() showGpxZipExport = false;

  /**
   * Change page or number of row for a page
   */
  @Output() onPageChange = new EventEmitter<PageInfo>();
  @Output() onModelItemSelect = new EventEmitter<ItemType>();
  @Output() onSort = new EventEmitter<SortInfo>();

  protected defaultSortField = 'state';

  protected defaultSortOrder = 1;

  constructor() {}

  reset(): void {
    this.table.reset();
  }

  resetSort(fieldName: string, sortOrder = 1): void {
    this.table.sortField = fieldName;
    this.table.sortOrder = sortOrder;
  }

  pageChange({first, rows}: {first: number, rows: number}): void {
    this.onPageChange.emit({
      page: first / rows,
      rows
    });
  }

  ngAfterViewInit(): void {
    // Map cells templates with their id
    this.cells.forEach(cell => cell.id && this.columnCellsMap.set(cell.id, cell.template));
  }
}
