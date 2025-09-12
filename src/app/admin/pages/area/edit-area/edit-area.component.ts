import {Component, OnDestroy, OnInit} from '@angular/core';
import {AreasApi} from '@app/api/areas.api';
import {ActivatedRoute, Router} from '@angular/router';
import Area from '@app/models/area.model';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-edit-area',
  templateUrl: './edit-area.component.html',
  styleUrls: ['./edit-area.component.scss']
})
export class EditAreaComponent implements OnInit, OnDestroy {
  area: Area;
  areaSubscription: Subscription;
  disabled = this.router.url.endsWith('/details');

  constructor(private readonly areaApi: AreasApi,
              private readonly route: ActivatedRoute,
              private readonly router: Router) {
  }


  ngOnInit(): void {
    this.areaSubscription = this.areaApi.findOne(this.route.snapshot.params.areaId)
      .subscribe(a => this.area = a);
  }

  ngOnDestroy(): void {
    this.areaSubscription.unsubscribe();
  }
}
