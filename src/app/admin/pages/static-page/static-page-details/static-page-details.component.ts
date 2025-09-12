import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaticPageAdminApi } from '@app/api/admin/static-page-admin.api';
import { StaticPage } from '@app/models/static-page.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-static-page-details',
  templateUrl: './static-page-details.component.html',
  styleUrls: ['./static-page-details.component.scss']
})
export class StaticPageDetailsComponent implements OnInit, OnDestroy {

  staticPage: StaticPage;
  disabled = this.router.url.endsWith('/details');
  staticPageFindOneSubscription: Subscription;

  constructor(private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly staticPageAdminApi: StaticPageAdminApi) { }

  ngOnInit(): void {
    this.staticPageFindOneSubscription =  this.staticPageAdminApi.findOne(this.route.snapshot.params.id)
      .subscribe(staticPage => this.staticPage = staticPage);
  }

  ngOnDestroy(): void {
    if (this.staticPageFindOneSubscription) { this.staticPageFindOneSubscription.unsubscribe(); }
  }
}
