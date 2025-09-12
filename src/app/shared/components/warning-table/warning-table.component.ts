import { Component, Input, OnDestroy } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { TableFilterValues } from '@app/models/warning-filters.model';
import { ExportPdfService } from '@app/shared/services/export-pdf.service';
import { TranslateService } from '@ngx-translate/core';
import { showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { ExportGpxService } from '../../services/export-gpx.service';
import { ExportS124Service } from '../../services/export-s124.service';
import { PaginatedTableComponent } from '../paginated-table/paginated-table.component';

@Component({
  selector: 'shared-warning-table',
  templateUrl: '../paginated-table/paginated-table.component.html',
  styleUrls: ['../paginated-table/paginated-table.component.scss']
})
export class WarningTableComponent<WarningTableType> extends PaginatedTableComponent<WarningTableType> implements OnDestroy {

  private readonly scavenger = new Scavenger();

  @Input() appliedFilterValues: TableFilterValues;

  constructor(private readonly exportPdfService: ExportPdfService,
    private readonly exportS124Service: ExportS124Service,
    private readonly exportGpxService: ExportGpxService,
    private readonly alertMessageService: AlertMessageService,
    private readonly translateService: TranslateService
    ) {
    super();
    this.msgHasNoRequiredSelection = 'table.no-serie-selected';
  }

  ngOnDestroy(): void {}

  generatePdf(): void {
    this.exportPdfService.exportWarningTable(this.appliedFilterValues, this.totalRecords, this.columns);
  }

  generateS124(): void {
    this.exportS124Service.exportWarningTable(this.appliedFilterValues, this.totalRecords)
      .pipe(this.scavenger.collect())
      .subscribe({
        next: blob => {
          saveAs(blob, 'export.xml');
          this.downloadPanel.hide();
        },
        error: () => this.showToast(this.translateService.instant('message.generate-s124.error'), 'error')
      });
  }

  generateGpx(): void {
    this.exportGpxService.exportWarningTable(this.appliedFilterValues, this.totalRecords)
      .pipe(this.scavenger.collect())
      .subscribe({
        next: blob => {
          saveAs(blob, 'gpx.zip');
          this.downloadPanel.hide();
        },
        error: () => this.showToast(this.translateService.instant('message.generate-gpx-zip.error'), 'error')
      });
  }

  private showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }
}
