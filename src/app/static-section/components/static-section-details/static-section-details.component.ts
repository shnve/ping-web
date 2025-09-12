import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaticSectionAdminApi } from '@app/static-section/api/static-section-admin.api';
import { StaticSection } from '@app/static-section/models/static-section.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'static-section-details',
  templateUrl: './static-section-details.component.html',
  styleUrls: ['./static-section-details.component.scss']
})
export class StaticSectionDetailsComponent implements OnInit, OnDestroy {

  staticSection: StaticSection;
  disabled = this.router.url.endsWith('/details');
  staticSectionFindOneSubscription: Subscription;

  constructor(private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly staticSectionAdminApi: StaticSectionAdminApi) { }

    ngOnInit(): void {
      this.staticSectionFindOneSubscription =  this.staticSectionAdminApi.findOne(this.route.snapshot.params.id)
        .subscribe(staticSection => this.staticSection = staticSection);
    }
  
    ngOnDestroy(): void {
      if (this.staticSectionFindOneSubscription) { this.staticSectionFindOneSubscription.unsubscribe(); }
    }
}
