import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicOrServiceUserGuard  {
  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (state.url.includes('/survey') && environment.enableSurveyModule !== 'true') {
      this.router.navigate(['/']);
      return false;
    }
    if (this.authService.isLoggedIn() && (this.authService.isPublicUser() || this.authService.hasRoleServiceUser())) {
      return true;
    }
    const signInUpUrl = `/sign-in-up${state?.url.includes('subscription') ? '-subscription' : '' }`;
    this.router.navigate([signInUpUrl], state?.url ? { queryParams: { urlToRedirectAfterSigningCompleted: state?.url } } : {});
    return false;
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }
}
