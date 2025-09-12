import { Component, Input, OnDestroy } from '@angular/core';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticFileService } from '@app/static-file/services/static-file.service';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { throwError } from 'rxjs';

@Component({
  selector: 'static-file',
  template: '<a (click)="downloadFile($event, path)" href="" rel="noopener noreferrer">{{display}}</a>'
})
export class StaticFileComponent implements OnDestroy {

  private readonly scavenger = new Scavenger(this);

  @Input() path: string;
  @Input() display: string;

  constructor(private readonly staticFileService: StaticFileService,
    private readonly alertMessageService: AlertMessageService
  ) { }

  ngOnDestroy(): void { }

  protected downloadFile(event: Event, staticFilePath: string): void {
    this.staticFileService.download$(staticFilePath)
      .pipe(this.scavenger.collect())
      .subscribe(
        response => saveAs(response.body, response.headers.get('filename')),
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-download-static-file'
          });
          return throwError(err);
        }
      );
    event.preventDefault();
  }

}
