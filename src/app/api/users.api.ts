import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import ProUser, { ProUserServices } from '@app/models/pro-user.model';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, flatMap, map, reduce } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import PublicUser, { AuthenticatedUser } from '../models/public-user.model';

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersApi {

  readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' })
  };

  readonly createUserUrl = environment.baseApiUrl + environment.api.users;
  readonly updateUserUrl = environment.baseApiUrl + environment.securedApi.userUpdate;
  readonly resetPasswordUserUrl = environment.baseApiUrl + environment.securedApi.resetPassword;
  readonly enableUserUrl = environment.baseApiUrl + environment.securedApi.userEnable;
  readonly adminApi = environment.baseApiUrl + environment.adminApi.proUser;
  readonly serviceUsersApi = environment.baseApiUrl + environment.adminApi.serviceUsers;
  readonly adminApiEditPublicUser = environment.baseApiUrl + environment.adminApi.publicUsers;
  readonly findUserById = this.updateUserUrl;
  readonly findUserByIdFromAdmin = environment.baseApiUrl + environment.adminApi.publicUsers;

  readonly clientId = environment.keycloak.clientId;

  readonly authMethod = environment.keycloak.authMethod.code;


  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) {
  }

  findAllServiceUser(serviceId: string): any {
    return this.http.get<any>(`${environment.baseApiUrl}${environment.adminApi.serviceUsers}`, { params: new HttpParams().set('serviceId', serviceId) });
  }

  /**
   * Create a User through HTTP POST on users api. Can be subscribed.
   * @param user the user to be created
   */
  createUser(user: PublicUser): Observable<PublicUser> {
    return this.http.post<PublicUser>(this.createUserUrl, user, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  editPublicUser(userId: string, user: any): Observable<PublicUser> {
    return this.http.put<PublicUser>(`${this.adminApiEditPublicUser}/${userId}`, user, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  publicUserEditProfile(accessToken: string, user: PublicUser): Observable<PublicUser> {
    return this.http.put<PublicUser>(this.updateUserUrl, user, { headers: this.buildAuthorizationHeader(accessToken) })
      .pipe(
        catchError(this.handleError)
      );
  }

  publicUserDeleteProfile(accessToken: string): Observable<any> {
    return this.http.delete<void>(this.updateUserUrl, { headers: this.buildAuthorizationHeader(accessToken) })
      .pipe(
        catchError(this.handleError)
      );
  }

  resetPassword(userId: string, password: string): Observable<void> {
    return this.http.put<void>(`${this.createUserUrl}/${userId}/reset-password`, { password }, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  resetPasswordPublicUser(accessToken: string): Observable<void> {
    return this.http.get<void>(`${this.resetPasswordUserUrl}`, { headers: this.buildAuthorizationHeader(accessToken) })
      .pipe(
        catchError(this.handleError)
      );
  }

  updateEmail(userId: string, email: string): Observable<void> {
    return this.http.put<void>(`${this.createUserUrl}/${userId}/email`, { email }, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Authenticate a user keycloak-side with an authorization code received before.
   * @param authorizationCode the authorization code received from keycloak when redirected to account-validation page
   */
  authenticateUser(authorizationCode: string, isPublicUser: boolean, state: string, nonce: string, redirectUri?: string): Observable<TokenResponse> {
    const body = new HttpParams()
      .set('client_id', this.clientId)
      .set('grant_type', this.authMethod)
      .set('code', authorizationCode)
      .set('state', state)
      .set('nonce', nonce)
      .set('redirect_uri', redirectUri ?? environment.keycloak.redirectUri.default);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    if (!authorizationCode) {
      return throwError({ code: 'invalid-grant.missing-code' });
    }
    return this.http.post(this.buildKeycloakUrlToken(isPublicUser), body.toString(), { headers, observe: 'response' })
      .pipe(
        catchError(this.handleError),
        map((res: HttpResponse<any>) => res.body)
      );
  }

  /**
   * Enable a user ping-side with an access token received from keycloak.
   * @param accessToken the access-token received from keycloak
   */
  enableUser(accessToken: string): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(this.enableUserUrl, {}, { headers: this.buildAuthorizationHeader(accessToken) })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get current user information
   * @param accessToken the access-token received from keycloak
   */
  me(accessToken: string): Observable<AuthenticatedUser> {
    return this.http.get<AuthenticatedUser>(this.getUserUrl(), { headers: this.buildAuthorizationHeader(accessToken) })
      .pipe(
        catchError(this.handleError)
      );
  }

  findOnePublic(id: string, accessToken: string): Observable<PublicUser> {
    return this.http.get<PublicUser>(`${this.findUserById}/${id}`, { headers: this.buildAuthorizationHeader(accessToken) });
  }

  findOnePublicFromAdmin(id: string): Observable<PublicUser> {
    return this.http.get<PublicUser>(`${this.findUserByIdFromAdmin}/${id}`);
  }

  findOnePro(id: string): Observable<ProUser> {
    return this.http.get<ProUser>(`${this.adminApi}/${id}`);
  }

  findProServices(id: string): Observable<ProUserServices[]> {
    return this.http.get<ProUserServices[]>(`${this.serviceUsersApi}/${id}/services`)
      .pipe(
        flatMap(s => [...s]),
        map(service => {
          // if no international name available then use name instead
          service.internationalName = service.internationalName ?? service.name;
          return service;
        }),
        reduce((acc, service) => {
          acc.push(service);
          return acc;
        }, [])
      );
  }

  private buildAuthorizationHeader(accessToken: string): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', `Bearer ${accessToken}`);
  }

  buildKeycloakUrlToken(isPublicUser: boolean): string {
    return environment.keycloak.urlToken
      .replace('{{root_url}}', environment.keycloak.rootUrl)
      .replace('{{realm}}', isPublicUser ? environment.keycloak.publicRealm : environment.keycloak.proRealm);
  }

  getUserUrl(): string {
    return environment.baseApiUrl + (this.authService.isProUser() ? environment.adminApi.userMe : environment.securedApi.userMe);
  }

  /**
   * Handler return ErrorObservable with user-friendly error message
   * @param error server or client side errors captured by HttpClient in HttpErrorResponse
   * @private
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      // A client-side or network error occurred
      console.error('An error occurred:', error.error);
      return throwError({ unknown: 'message.network-error' });
    }

    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong.
    if (error.status === 400) {
      const invalidApiArgs = error.error['invalid-arguments'];

      // return error related to email
      if (invalidApiArgs?.hasOwnProperty('email')) {
        return throwError({ email: invalidApiArgs.email });
      }

      // return error related to password
      if (invalidApiArgs?.hasOwnProperty('password')) {
        return throwError({ password: invalidApiArgs.password });
      }

      // return error related to user creation keycloak-side
      if (invalidApiArgs?.hasOwnProperty('user')) {
        return throwError({ user: invalidApiArgs.user });
      }

      const errorCodeFromKeycloak = error.error.error;
      const errorDescriptionFromKeycloak = error.error.error_description;
      // return error related to code sent to /token
      if (errorCodeFromKeycloak === 'invalid_grant' && errorDescriptionFromKeycloak === 'Code not valid') {
        return throwError({ code: 'invalid-grant.invalid-code' });
      }
    }

    // return unhandled error
    console.error(error);
    console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
    return throwError({ unhandled: 'message.unhandled-error' });
  }

  saveProUser(userId: string, user: ProUser): Observable<ProUser> {
    if (userId) {
      return this.http.put<ProUser>(`${this.adminApi}/${userId}`, user, this.httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
    return this.http.post<ProUser>(`${this.adminApi}`, user, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  resetProUserPassword$(): Observable<void> {
    return this.http.get<void>(`${this.adminApi}/reset-password`);
  }

  updateUserStatus$(userId: string, enabled: boolean, isPublicUser: boolean): Observable<void> {
    const newStatus = enabled ? 'enable' : 'disable';
    const contextUrl = isPublicUser ? 'public/' : '';
    return this.http.put<void>(`${this.adminApi}/${contextUrl}${userId}/${newStatus}`, {});
  }
}
