import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeriesAdminApi } from '@app/api/admin/series-admin.api';
import { Serie } from "@app/models/serie.model";
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-serie-details',
  templateUrl: './serie-details.component.html',
  styleUrls: ['./serie-details.component.scss']
})
export class SerieDetailsComponent implements OnInit, OnDestroy {
  serie: Serie;
  serieSub: Subscription;
  disabled = this.router.url.endsWith('/details');

  constructor(private readonly seriesAdminApi: SeriesAdminApi,
              private readonly route: ActivatedRoute,
              private readonly router: Router) {
  }

  ngOnInit(): void {
    this.serieSub = this.seriesAdminApi.findOne(this.route.snapshot.params.id)
      .subscribe(a => this.serie = a);
  }

  ngOnDestroy(): void {
    this.serieSub.unsubscribe();
  }
}
