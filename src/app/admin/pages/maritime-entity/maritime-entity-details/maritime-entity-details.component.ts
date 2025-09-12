import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {MaritimeEntitiesApi} from '@app/api/maritime-entities.api';
import MaritimeEntity from '@app/models/maritime-entity.model';

@Component({
  selector: 'app-maritime-entity-details',
  templateUrl: './maritime-entity-details.component.html',
  styleUrls: ['./maritime-entity-details.component.scss']
})
export class MaritimeEntityDetailsComponent implements OnInit, OnDestroy {
  maritimeEntity: MaritimeEntity;
  maritimeEntitySub: Subscription;
  disabled = this.router.url.endsWith('/details');

  constructor(private readonly maritimeEntitiesApi: MaritimeEntitiesApi,
              private readonly route: ActivatedRoute,
              private readonly router: Router) {
  }

  ngOnInit(): void {
    this.maritimeEntitySub = this.maritimeEntitiesApi.findOne(this.route.snapshot.params.id)
      .subscribe(me => this.maritimeEntity = me);

  }

  ngOnDestroy(): void {
    this.maritimeEntitySub.unsubscribe();
  }
}
