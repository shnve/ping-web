import { Injectable } from '@angular/core';
import { WarningApi } from '@app/api/warning.api';
import { Serie } from '@app/models/serie.model';
import { TableFilterValues } from '@app/models/warning-filters.model';
import { TableWarning } from '@app/models/warning.model';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { mergeMap, reduce, switchMap } from 'rxjs/operators';
import { WarningsDownloadS124MessagesApiParams } from '../../api/warning.api';
import { WarningTableFacade } from '../../facades/warnings-table.facade';
import { ModelItemTablePage } from '../models/paginated-table-view.model';

@Injectable({
  providedIn: 'root'
})
export class ExportS124Service {
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
      switchMap(tableWarnings => this.exportS124(serie, tableWarnings))
    );
  }

  private exportS124(serie: Serie, warnings: TableWarning[]): Observable<Blob> {
    const params: WarningsDownloadS124MessagesApiParams = {
      nameOfSeries: serie.name,
      warningNumbers: warnings.map(warning => `${warning.warningNumber}:${warning.year}`).join(','),
      lang: this.translate.instant('lang')
    };
    return this.warningApi.downloadS124Messages$(params);
  }
}