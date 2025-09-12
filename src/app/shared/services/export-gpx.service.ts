import { Injectable } from '@angular/core';
import { WarningApi, WarningsDownloadGpxApiParams } from '@app/api/warning.api';
import { WarningTableFacade } from '@app/facades/warnings-table.facade';
import { TableFilterValues } from '@app/models/warning-filters.model';
import { TableWarning } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { mergeMap, reduce, switchMap } from 'rxjs/operators';
import { ModelItemTablePage } from '../models/paginated-table-view.model';

@Injectable({
  providedIn: 'root'
})
export class ExportGpxService {
  constructor(private readonly warningApi: WarningApi,
    private readonly translate: TranslateService,
    private readonly warningTableFacade: WarningTableFacade) { }

  private getWarningTableList(appliedFilterValues: TableFilterValues, totalRecords: number, isDetailedTable = false): Observable<ModelItemTablePage<TableWarning>> {
    return this.warningTableFacade.loadFilteredPage$({ page: 0, rows: totalRecords }, appliedFilterValues, isDetailedTable);
  }

  private buildWarningTableList(appliedFilterValues: TableFilterValues, totalRecords: number): Observable<Array<TableWarning>> {
    return this.getWarningTableList(appliedFilterValues, totalRecords, false).pipe(
      mergeMap(warningTablePage => warningTablePage.modelItems),
      reduce((acc, val) => {
        acc.push(val);
        return acc;
      }, [])
    );
  }

  exportWarningTable(appliedFilterValues: TableFilterValues, totalRecords: number): Observable<Blob> {
    const serie = appliedFilterValues.serie;
    if (!serie) { return; }
    return this.buildWarningTableList(appliedFilterValues, totalRecords).pipe(
      switchMap(tableWarnings => this.exportGpx( tableWarnings))
    );
  }

  private exportGpx(warnings: TableWarning[]): Observable<Blob> {
    const params: WarningsDownloadGpxApiParams = {
      warningIds: warnings.map(warning => warning.id).join(','),
      lang: this.translate.instant('lang')
    };
    return this.warningApi.downloadGpxAsZip$(params);
  }
}
