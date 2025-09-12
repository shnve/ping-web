import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import {
  InfosourceNature,
  InfosourceReference,
  TRANSLATIONS_LIST_INFOSOURCE_NATURE
} from '@app/infosource/models/infosource.model';
import { AttachmentDownload } from '@app/models/warning.model';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';

@Component({
  selector: 'aw-infosources-list-item',
  templateUrl: './infosources-list-item.component.html',
  styleUrls: ['./infosources-list-item.component.scss']
})
export class InfosourcesListItemComponent implements OnInit, OnDestroy {

  @Input() infosource: InfosourceReference;
  @Output() showInfosourceModal = new EventEmitter<InfosourceReference>();

  private readonly scavenger = new Scavenger();
  infosourceNature: string;
  isNatureGeoregulation: boolean;

  constructor(private readonly downloadService: DownloadService) { }

  ngOnInit(): void {
    this.infosourceNature = TRANSLATIONS_LIST_INFOSOURCE_NATURE.find(type => type.key === this.infosource.nature).value;
    this.isNatureGeoregulation = this.infosource.nature === InfosourceNature.GEOREGULATION;
  }

  ngOnDestroy(): void { }

  displayInfosourceModal($event: MouseEvent): void {
    this.showInfosourceModal.emit(this.infosource);
    $event.preventDefault();
  }

  openAttachment(event: Event, attachment: AttachmentDownload): void {
    this.downloadService.download(attachment.id)
      .pipe(this.scavenger.collect())
      .subscribe(response => saveAs(response.body, response.headers.get('filename')));
    event.preventDefault();
  }
}
