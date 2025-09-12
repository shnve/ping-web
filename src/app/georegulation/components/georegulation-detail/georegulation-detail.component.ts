import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { AuthService } from '@app/auth/auth.service';
import { AlertMessageService } from '@app/core/alert-message.service';
import { GeoregulationModalDetails, GeoregulationPartModalDetails, GeoregulationStatusEnum } from '@app/georegulation/models/georegulation.model';
import { AttachmentDownload } from '@app/models/warning.model';
import { NotionTypeEnum } from '@app/shared/components/add-notion-to-folder-selection/notion-type-enum';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { throwError } from 'rxjs';


@Component({
  selector: 'georegulation-detail',
  templateUrl: './georegulation-detail.component.html',
  styleUrls: ['./georegulation-detail.component.scss']
})
export class GeoregulationDetailComponent implements OnInit, OnDestroy {
  private readonly scavenger = new Scavenger(this);

  @Input() displayDetailsButton = false;
  @Input() georegulation: GeoregulationModalDetails;
  @Output() featurePartClicked = new EventEmitter<GeoregulationPartModalDetails>();
  @Output() allFeaturesVisualized = new EventEmitter<void>();
  @Input() proUser = false;

  featurePartBeingVisualized: number;
  notionType = NotionTypeEnum;
  georegulationStatus = GeoregulationStatusEnum;

  constructor(private readonly authService: AuthService,
    private readonly alertMessageService: AlertMessageService,
    private readonly downloadService: DownloadService) { }

  ngOnDestroy(): void { }

  ngOnInit(): void { }

  open(event: Event, attachment: AttachmentDownload): void {
    let notionItemId = null;
    let notionType = null;
    if (this.georegulation.status !== GeoregulationStatusEnum.DRAFT || !this.authService.isLoggedIn()) {
      notionItemId = this.georegulation.id;
      notionType = NotionTypeEnum.GEOREGULATION;
    }

    this.downloadService.download(attachment.id, notionType, notionItemId)
      .pipe(this.scavenger.collect())
      .subscribe(
        response => saveAs(response.body, response.headers.get('filename')),
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-download-file'
          });
          return throwError(err);
        });
    event.preventDefault();
  }

}
