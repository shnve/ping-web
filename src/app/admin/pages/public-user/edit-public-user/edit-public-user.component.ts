import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersApi } from '@app/api/users.api';
import { AuthService } from '@app/auth/auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import PublicUser from '../../../../models/public-user.model';


@Component({
  selector: 'app-edit-public-user',
  templateUrl: './edit-public-user.component.html',
  styleUrls: ['./edit-public-user.component.scss']
})
export class EditPublicUserComponent implements OnInit {

  userId = this.route.snapshot.params.id;
  disabled = this.router.url.endsWith('/details');

  isFunctionalAdmin: boolean;
  isEnabled: boolean;
  user$: Observable<PublicUser>;

  constructor(private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userApi: UsersApi,
    private readonly route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.isFunctionalAdmin = this.authService.hasRoleFunctionalAdmin();
    this.user$ = (this.isFunctionalAdmin ? this.userApi.findOnePublicFromAdmin(this.userId) : this.userApi.findOnePublic(this.userId, this.authService.getToken()))
      .pipe(tap(user => this.isEnabled = user.status === 'ENABLED'));
  }
}
