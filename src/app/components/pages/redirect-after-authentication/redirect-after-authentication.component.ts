import { Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersApi } from '@app/api/users.api';
import { AuthService, nonceKey } from '@app/auth/auth.service';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { ProfileMode } from '@app/types/profile';
import { environment } from '@env/environment';
import { Scavenger } from '@wishtack/rx-scavenger';
import { throwError } from 'rxjs';
import { flatMap, take } from 'rxjs/operators';
import { stateKey } from '../../../auth/auth.service';

@Component({
  selector: 'app-redirect-after-authentication',
  templateUrl: './redirect-after-authentication.component.html',
  styleUrls: ['./redirect-after-authentication.component.scss']
})
export class RedirectAfterAuthenticationComponent implements OnInit, OnDestroy {
  token: string;
  redirectTo: string;
  submitting = true;

  private readonly scavenger = new Scavenger(this);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly usersApi: UsersApi,
    private readonly authService: AuthService,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(

        take(1),

        this.scavenger.collect(),
        flatMap(params => {
          let bulkProfileMode = params.profileMode;
          if (params.profileMode) {
            bulkProfileMode = (bulkProfileMode as string).replace('&to=/', '');
          }
          const profileMode = +(bulkProfileMode ?? 0);
          const url = this.router.parseUrl(this.router.url);
          this.redirectTo = this.sanitizer.sanitize(SecurityContext.URL, url.queryParams.to) ?? '/';
          const state = this.authService.getSecureLocalStorageItem(stateKey);
          const nonce = this.authService.getSecureLocalStorageItem(nonceKey);
          const stateFromUrl = url.queryParams.state;
          if (stateFromUrl !== state) {
            throwError(new Error('OpenId state parameter invalid value'));
          }

          url.queryParams = {};
          const redirectUri = environment.keycloak.redirectUri.default + '/redirect/?profileMode=' + profileMode + '&to=' + this.redirectTo;
          return this.usersApi.authenticateUser(params.code, profileMode === ProfileMode.PUBLIC, state, nonce, redirectUri);
        }),
        flatMap(token => {
          const nonce = this.authService.getSecureLocalStorageItem(nonceKey);
          const nonceFromToken = this.authService.getNonceFromToken(token.access_token);
          if (nonceFromToken !== nonce) {
            throwError(new Error('OpenId nonce parameter invalid value'));
          }

          this.token = token.access_token;
          this.authService.setToken(this.token);
          this.authService.setRefreshToken(token.refresh_token);
          this.authService.setIdToken(token.id_token);
          return this.usersApi.me(this.token);
        })
      )
      .subscribe(
        (authenticatedUser: AuthenticatedUser) => {
          this.authService.login(authenticatedUser, this.token);
          // Remove query params (prevent F5 from user and refresh this treatment with informations already use)
          this.router.navigate([this.redirectTo], {
            queryParams: {
              profileMode: null,
              session_state: null,
              code: null,
              state: null,
              to: null
            },
            queryParamsHandling: 'merge'
          });
        },
        err => {
          console.error(err);
          this.submitting = false;
        }
      );
  }

  ngOnDestroy(): void { }
}
