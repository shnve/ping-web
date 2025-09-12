import { Injectable } from '@angular/core';
import { PageInfo, SortInfo } from '@app/shared/models/paginated-table-view.model';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

type SilentablePageEntry = PageInfo & {
  silent?: boolean;
};

type SilentSortEntry = SortInfo & {
  silent?: boolean;
}

export interface TableStateValue {
  pageInfo: PageInfo;
  sortInfo: SortInfo | null;
}

@Injectable()
export class TableState {
  public readonly pageInfo = new BehaviorSubject<SilentablePageEntry>({page: 0, rows: environment.tableDefaultRowsCount});
  public readonly sortInfo = new BehaviorSubject<SilentSortEntry>(null);
  public pageInfo$ = this.pageInfo.asObservable();
  public sortInfo$ = this.sortInfo.asObservable();

  constructor() {}

  setPageInfo(pageInfos: Partial<PageInfo>, silent = false) {
    this.pageInfo.next({
      ...this.pageInfo.getValue(),
      ...pageInfos,
      silent
    });
  }

  getPageInfo$(): Observable<PageInfo> {
    return this.pageInfo$.pipe(
      filter(pageEntry => pageEntry.silent !== true),
      // Omit 'silent' field
      map<SilentablePageEntry, PageInfo>(({page, rows}) => ({page, rows}))
    );
  }

  setSortInfo(sortInfos: Partial<SortInfo>, silent = false) {
    this.sortInfo.next({
      ...this.sortInfo.getValue(),
      ...sortInfos,
      silent
    });
  }

  resetSortInfo(silent = true): void {
    this.sortInfo.next({
      field: null,
      order: -1,
      silent
    });
  }

  getSortInfo$() {
    return this.sortInfo$.pipe(
      filter(sortEntry => sortEntry.silent !== true),
      // Omit 'silent' field
      map<SilentSortEntry, SortInfo>(({field, order}) => ({field, order}))
    )
  }

  getValues(): TableStateValue {
    return {
      pageInfo: this.pageInfo.getValue(),
      sortInfo: this.sortInfo.getValue()
    }
  }
}
