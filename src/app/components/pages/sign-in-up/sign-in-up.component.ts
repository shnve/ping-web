import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { ProfileMode } from '@app/types/profile';
import { take } from 'rxjs/operators';

export const CONTRIBUTION_SECTION = 'contribution';
export const CONTRIBUTION_LOGIN = 'infosource';

export const SUBSCRIPTION_SECTION = 'subscription';
export const SUBSCRIPTION_PRO_LOGIN = 'subscription';
export const SUBSCRIPTION_PUBLIC_LOGIN = 'subscription/warning';

@Component({
  selector: 'app-sign-in-up',
  templateUrl: './sign-in-up.component.html',
  styleUrls: ['./sign-in-up.component.scss']
})
export class SignInUpComponent {



  section: string;

  constructor(private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService) {
    this.activatedRoute.data.subscribe(data => {
      this.section = data.section;
    });
  }

  goToAccountCreation(): void {
    this.router.navigate(['/account-creation']);
  }

  goToPublicLoginPage(): void {
    if (this.section === CONTRIBUTION_SECTION) {
      this.redirectToRightLoginPage(ProfileMode.PUBLIC, CONTRIBUTION_LOGIN);
    } else if (this.section === SUBSCRIPTION_SECTION) {
      this.authService.redirectToLoginPage(ProfileMode.PUBLIC, SUBSCRIPTION_PUBLIC_LOGIN);
    }
  }

  goToProLoginPage(): void {
    if (this.section === CONTRIBUTION_SECTION) {
      this.redirectToRightLoginPage(ProfileMode.PRO, CONTRIBUTION_LOGIN);
    } else if (this.section === SUBSCRIPTION_SECTION) {
      this.authService.redirectToLoginPage(ProfileMode.PRO, SUBSCRIPTION_PRO_LOGIN);
    }
  }

  redirectToRightLoginPage(profileMode: ProfileMode, redirectToAfterAuthentication: string): void {
    if (this.activatedRoute.queryParams) {
      this.activatedRoute.queryParams?.pipe(take(1))
        .subscribe(params =>
          this.authService.redirectToLoginPage(profileMode, params?.urlToRedirectAfterSigningCompleted ?? redirectToAfterAuthentication));
    } else {
      this.authService.redirectToLoginPage(profileMode, redirectToAfterAuthentication);
    }
  }
}
