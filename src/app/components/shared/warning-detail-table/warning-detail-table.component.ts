import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { MessageSeverity } from '@app/models/alert-message.model';
import { TableFilterValues } from '@app/models/warning-filters.model';
import { JsonWarning } from '@app/models/warning.model';
import { PageInfo } from '@app/shared/models/paginated-table-view.model';
import { ExportGpxService } from '@app/shared/services/export-gpx.service';
import { ExportPdfService } from '@app/shared/services/export-pdf.service';
import { ExportS124Service } from '@app/shared/services/export-s124.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { showToast as showToastUtil } from '@shared/ui-utils';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-warning-detail-table',
  templateUrl: './warning-detail-table.component.html',
  styleUrls: ['./warning-detail-table.component.scss']
})
export class WarningDetailTableComponent {
  private readonly scavenger = new Scavenger();

  @ViewChild('downloadPanel') downloadPanel: OverlayPanel;

  rowPerPageOptions = environment.tableRowsPerPageOptions;

  @Input() warnings: JsonWarning[] = [];
  @Input() totalRecords = 0;
  @Input() pageInfo: PageInfo = { page: 0, rows: environment.tableDefaultRowsCount };
  @Input() loading = true;
  @Input() appliedFilterValues: TableFilterValues;
  @Output() warningSelect = new EventEmitter<JsonWarning>();


  /**
   * Change page or number of row for a page
   */
  @Output() onPageChange = new EventEmitter<PageInfo>();

  constructor(private readonly exportPdfService: ExportPdfService,
    private readonly exportS124Service: ExportS124Service,
    private readonly exportGpxService: ExportGpxService,
    private readonly alertMessageService: AlertMessageService,
    private readonly translate: TranslateService) {}

  pageChange({ first, rows }: { first: number, rows: number }) {
    this.onPageChange.emit({
      page: first / rows,
      rows
    });
  }

  generatePdf(): void {
    this.exportPdfService.exportWarningTableDetails(this.appliedFilterValues, this.totalRecords);
  }

  generateS124(): void {
    this.exportS124Service.exportWarningTable(this.appliedFilterValues, this.totalRecords)
      .pipe(this.scavenger.collect())
      .subscribe({
        next: blob => {
          saveAs(blob, 'export.xml');
          this.downloadPanel.hide();
        },
        error: () => this.showToast(this.translate.instant('message.generate-s124.error'), 'error')
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
        error: () => this.showToast(this.translate.instant('message.generate-gpx-zip.error'), 'error')
      });
  }

  private showToast(detail: string, severity: MessageSeverity = 'error'): void {
    showToastUtil(this.alertMessageService, detail, severity);
  }
}
