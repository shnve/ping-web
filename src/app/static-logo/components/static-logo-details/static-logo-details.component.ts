import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaticLogoAdminApi } from '@app/static-logo/api/static-logo-admin.api';
import { StaticLogo } from '@app/static-logo/models/static-logo.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'static-logo-details',
  templateUrl: './static-logo-details.component.html'
})
export class StaticLogoDetailsComponent implements OnInit, OnDestroy {

  staticLogo: StaticLogo;
  readonly disabled = this.router.url.endsWith('/details');
  staticLogoFindOneSubscription: Subscription;

  constructor(private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly staticLogoAdminApi: StaticLogoAdminApi) { }

  ngOnInit(): void {
    this.staticLogoFindOneSubscription =  this.staticLogoAdminApi.findOne(this.route.snapshot.params.id)
      .subscribe(staticLogo => this.staticLogo = staticLogo);
  }

  ngOnDestroy(): void {
    if (this.staticLogoFindOneSubscription) { this.staticLogoFindOneSubscription.unsubscribe(); }
  }
}

