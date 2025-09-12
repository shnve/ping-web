import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaticFile } from '@app/static-file/models/static-file.model';
import { Scavenger } from '@wishtack/rx-scavenger';
import { StaticFileAdminService } from '../../services/static-file-admin.service';

@Component({
  selector: 'static-file-details',
  templateUrl: './static-file-details.component.html',
  styleUrls: ['./static-file-details.component.scss']
})
export class StaticFileDetailsComponent implements OnInit, OnDestroy {

  private readonly scavenger = new Scavenger(this);

  protected staticFile: StaticFile;
  protected disabled = this.router.url.endsWith('/details');

  constructor(private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly staticFileAdminService: StaticFileAdminService
  ) { }

  ngOnDestroy(): void { }

  ngOnInit(): void {
    this.staticFileAdminService.findOne$(this.route.snapshot.params.id)
      .pipe(this.scavenger.collect())
      .subscribe(staticFile => this.staticFile = staticFile);
  }
}
