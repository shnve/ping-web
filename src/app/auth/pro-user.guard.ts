import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { ProfileMode } from '@app/types/profile';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProUserGuard  {
  constructor(private authService: AuthService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let canAccessed = true;
    if (!this.authService.isProUser() || !this.authService.isLoggedIn()) {
      canAccessed = false;
      this.authService.redirectToLoginPage(ProfileMode.PRO, state?.url ?? '');
    }

    return canAccessed;
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }
}
