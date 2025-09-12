import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tokenKey } from '@app/auth/auth.service';
import { environment } from '@env/environment';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/**
 * Intercepts all request which starts with /environment.baseAdminApiUrl/ or /environment.baseSecuredApiUrl/
 * And add authToken in Authorization header
 */
export class ApiInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(environment.baseAdminApiUrl) && !request.url.startsWith(environment.baseSecuredApiUrl)) {
      return next.handle(request);
    }

    const authToken = CryptoJS.AES.decrypt(localStorage.getItem(tokenKey), environment.localStorageKey).toString(CryptoJS.enc.Utf8);
    const authenticatedRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${authToken}`),
    });
    return next.handle(authenticatedRequest);
  }
}
