import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import ProUser, {ProUserRole} from '@app/models/pro-user.model';
import {UsersApi} from '@app/api/users.api';

@Component({
  selector: 'app-pro-user-details',
  templateUrl: './pro-user-details.component.html',
  styleUrls: ['./pro-user-details.component.scss']
})
export class ProUserDetailsComponent implements OnInit, OnDestroy {
  proUser: ProUser;
  proUserSub: Subscription;
  disabled = this.router.url.endsWith('/details');

  constructor(private readonly usersApi: UsersApi,
              private readonly route: ActivatedRoute,
              private readonly router: Router) { }

  ngOnInit(): void {
    this.proUserSub = this.usersApi.findOnePro(this.route.snapshot.params.id)
      .subscribe(pro => this.proUser = pro);
  }

  ngOnDestroy(): void {
    this.proUserSub.unsubscribe();
  }

  get hasServicesLink(): boolean {
    return this.proUser?.role === ProUserRole.SERVICE_USER;
  }
}
