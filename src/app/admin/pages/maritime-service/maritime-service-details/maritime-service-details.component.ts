import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {MaritimeServicesApi} from '@app/api/maritime-services.api';
import MaritimeService, {ServiceRole} from '@app/models/maritime-service.model';
import {AuthService} from "@app/auth/auth.service";

@Component({
  selector: 'app-maritime-service-details',
  templateUrl: './maritime-service-details.component.html',
  styleUrls: ['./maritime-service-details.component.scss']
})
export class MaritimeServiceDetailsComponent implements OnInit, OnDestroy {
  maritimeService: MaritimeService;
  maritimeServiceSub: Subscription;
  disabled = this.router.url.endsWith('/details');
  serviceId = this.route.snapshot.params.id;

  constructor(private readonly maritimeServicesApi: MaritimeServicesApi,
              private readonly route: ActivatedRoute,
              private readonly authService: AuthService,
              private readonly router: Router) {
  }

  ngOnInit(): void {
    this.maritimeServiceSub = this.maritimeServicesApi.findOne(this.serviceId)
      .subscribe(a => this.maritimeService = a);

  }

  get canDisplayRoleAssign(): boolean {
    return this.authService.hasRoleFunctionalAdmin() || this.authService.hasAccessToService(this.serviceId, ServiceRole.SERVICE_ADMIN);
  }

  ngOnDestroy(): void {
    this.maritimeServiceSub.unsubscribe();
  }
}
