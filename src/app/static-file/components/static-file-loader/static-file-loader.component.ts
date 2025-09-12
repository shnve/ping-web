import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertMessageService } from '@app/core/alert-message.service';
import { StaticFileService } from '@app/static-file/services/static-file.service';
import { Scavenger } from '@wishtack/rx-scavenger';
import { saveAs } from 'file-saver';
import { throwError } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

/**
 * usage examples :
 *    <a href="/static-file/my-file" rel="noopener noreferrer">the file to download</a>
 *    <a [routerLink]="[baseStaticPath, staticFile.path]" rel="noopener noreferrer" href="">{{staticFile.path}}</a>
 */
@Component({
  selector: 'static-file-loader',
  template: '<router-outlet></router-outlet>'
})
export class StaticFileLoaderComponent implements OnInit, OnDestroy {

  private readonly scavenger = new Scavenger(this);

  constructor(private readonly route: ActivatedRoute,
    private readonly staticFileService: StaticFileService,
    private readonly alertMessageService: AlertMessageService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      this.scavenger.collect(),
      map(paramMap => paramMap.get('path')),
      filter(path => path !== null),
      switchMap(path => this.staticFileService.download$(path))
    )
    .subscribe(
      response => {
        saveAs(response.body, response.headers.get('filename'));
        setTimeout(() => window.close(), 200);
      },
        err => {
          this.alertMessageService.add({
            severity: 'error',
            summary: 'message.summary.error',
            detail: 'message.error.api.cannot-download-static-file'
          });
          return throwError(err);
        }
    );
  }
  ngOnDestroy(): void { }

}
