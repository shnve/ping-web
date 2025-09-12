import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubArea} from '@app/models/sub-area.model';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {SubAreasApi} from '@app/api/sub-areas.api';

@Component({
  selector: 'app-sub-area-details',
  templateUrl: './sub-area-details.component.html',
  styleUrls: ['./sub-area-details.component.scss']
})
export class SubAreaDetailsComponent implements OnInit, OnDestroy {
  subArea: SubArea;
  subAreaSub: Subscription;
  disabled = this.router.url.endsWith('/details');
  subAreaId = this.route.snapshot.params.id;

  constructor(private readonly subAreasApi: SubAreasApi,
              private readonly route: ActivatedRoute,
              private readonly router: Router) { }

  ngOnInit(): void {
    this.subAreaSub = this.subAreasApi.findOne(this.subAreaId)
      .subscribe(sa => this.subArea = sa);
  }

  ngOnDestroy(): void {
    this.subAreaSub.unsubscribe();
  }
}
