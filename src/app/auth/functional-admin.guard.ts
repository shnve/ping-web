import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '@app/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class FunctionalAdminGuard  {
    constructor(private authService: AuthService) {
    }

    canActivate(route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.authService.hasRoleFunctionalAdmin();
    }

}
