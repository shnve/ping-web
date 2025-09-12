import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DownloadService } from '@app/admin/admin-warning/services/download.service';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-folder-attachment-download-page',
  templateUrl: './folder-attachment-download-page.component.html',
  styleUrls: ['./folder-attachment-download-page.component.scss']
})
export class FolderAttachmentDownloadPageComponent implements OnInit {
  private readonly scavenger = new Scavenger();

  attachmentId: string;

  constructor(private readonly route: ActivatedRoute,
    private readonly downloadService: DownloadService) { }

  ngOnInit(): void {
    this.attachmentId = this.route.snapshot.paramMap.get('attachmentId');
    if (this.attachmentId) {
      this.downloadAttachment();
    }
  }

  downloadAttachment(): void {
    this.downloadService.download(this.attachmentId)
      .pipe(this.scavenger.collect())
      .subscribe(response => saveAs(response.body, response.headers.get('filename')));
  }
}
