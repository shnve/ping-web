import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenResponse } from '@app/api/users.api';
import { AreasFacade } from '@app/facades/areas.facade';
import { MaritimeServiceType, ServiceNetwork, ServiceRole } from '@app/models/maritime-service.model';
import { ServiceUserRole } from '@app/models/pro-user.model';
import { PrivilegesService } from '@app/privileges/privileges.service';
import { SessionState } from '@app/states/session.state';
import { ProfileMode } from '@app/types/profile';
import { SCOPE } from '@app/types/scope';
import { environment } from '@env/environment';
import { JwtHelperService } from 'angular-jwt-updated';
import * as CryptoJS from 'crypto-js';
import { pick } from 'lodash-es';
import { nanoid } from 'nanoid';
import { Observable, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthenticatedUser } from '../models/public-user.model';

const helper = new JwtHelperService();
export const tokenKey = 'access_token';
const idTokenKey = 'id_token';
const refreshKey = 'refresh_token';
const authenticatedUserKey = 'authenticated_user';
const pingApiKey = 'ping-api';
const roleFunctionalAdmin = 'functional-admin';
const roleServiceUser = 'service-user';
export const stateKey = '_state';
export const nonceKey = '_nonce';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isConnected: boolean;
  readonly connected$ = new ReplaySubject<boolean>(1);
  private readonly key = environment.localStorageKey;

  private refreshTimeout: any;

  constructor(private readonly privilegesService: PrivilegesService,
    private readonly httpClient: HttpClient,
    private readonly areasFacade: AreasFacade,
    private readonly sessionState: SessionState) {

    // If expired, we remove token (come back from a user after long time ago)
    if (this.getToken() && this.isExpired(this.getToken())) {
      localStorage.removeItem(authenticatedUserKey);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshKey);
      localStorage.removeItem(idTokenKey);
    }

    // If already in storage, we load user from this informations (F5, open a new tab with ping ...)
    if (this.getToken() && !this.isExpired(this.getToken()) && this.getAuthenticatedUser()) {
      const authenticatedUser = this.getAuthenticatedUser();
      this.loadLoginInformationInState(authenticatedUser);
      this.setPreferredArea(authenticatedUser);
    }
  }

  private encrypt(txt: string): string {
    if (!txt) { return txt; }
    return CryptoJS.AES.encrypt(txt, this.key).toString();
  }

  private decrypt(txtToDecrypt: string): string {
    if (!txtToDecrypt) { return txtToDecrypt; }
    return CryptoJS.AES.decrypt(txtToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
  }

  public setLocalStorageItem(key: string, value: string, encrypted = false): void {
    localStorage.setItem(key, encrypted ? this.encrypt(value) : value);
  }

  public setSecureLocalStorageItem(key: string, value: string): void {
    this.setLocalStorageItem(key, value, true);
  }

  public getLocalStorageItem(key: string, encrypted = false): string {
    const value = localStorage.getItem(key);
    if (!value) { return value; }
    return encrypted ? this.decrypt(value) : value;
  }

  public getSecureLocalStorageItem(key: string): string {
    return this.getLocalStorageItem(key, true);
  }

  public login(authenticatedUser: AuthenticatedUser, token: string): void {
    this.setSecureLocalStorageItem(authenticatedUserKey, JSON.stringify(authenticatedUser));
    this.setToken(token);
    this.loadLoginInformationInState(authenticatedUser);
    this.setPreferredArea(authenticatedUser);
  }

  private setPreferredArea(authenticatedUser: AuthenticatedUser): void {
    if (authenticatedUser.preferredAreaId) {
      this.areasFacade.getAreas$().pipe(take(1)).subscribe(() => this.areasFacade.selectAreaById(authenticatedUser.preferredAreaId));
    }
  }

  private loadLoginInformationInState(authenticatedUser: AuthenticatedUser): void {
    this.sessionState.setUserInfo(authenticatedUser);
    this.isConnected = true;
    this.connected$.next(this.isConnected);
    this.startRefresh();
  }

  public getConnected$(): Observable<boolean> {
    return this.connected$;
  }

  public redirectToLoginPage(profileMode: ProfileMode, redirectToAfterAuthentication = '/'): void {
    window.location.href = this.buildKeycloakUrlLogin(profileMode, redirectToAfterAuthentication);
  }

  public logout(): void {
    const logoutUrl = this.buildKeycloakUrlLogout();
    localStorage.removeItem(authenticatedUserKey);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(idTokenKey);
    this.isConnected = false;
    this.connected$.next(this.isConnected);
    clearTimeout(this.refreshTimeout);
    window.location.href = logoutUrl;
  }

  public setToken(token: string): void {
    this.setSecureLocalStorageItem(tokenKey, token);
  }

  public setRefreshToken(token: string): void {
    this.setSecureLocalStorageItem(refreshKey, token);
  }

  public setIdToken(token: string): void {
    this.setSecureLocalStorageItem(idTokenKey, token);
  }

  public getToken(): string {
    return this.getSecureLocalStorageItem(tokenKey);
  }

  public getRefreshToken(): string {
    return this.getSecureLocalStorageItem(refreshKey);
  }

  public getIdToken(): string {
    return this.getSecureLocalStorageItem(idTokenKey);
  }

  public getNonExpiredToken(): string {
    const token = this.getSecureLocalStorageItem(tokenKey);
    if (token && !this.isExpired(token)) {
      return token;
    }

    const keycloakUrl = environment.keycloak.urlToken
      .replace('{{root_url}}', environment.keycloak.rootUrl)
      .replace('{{realm}}', helper.decodeToken(this.getToken()).iss.endsWith(environment.keycloak.publicRealm)
        ? environment.keycloak.publicRealm : environment.keycloak.proRealm);
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', environment.keycloak.clientId)
      .set('refresh_token', this.getRefreshToken());
    this.httpClient.post<TokenResponse>(keycloakUrl, body, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }).pipe(map(value => {
      this.setRefreshToken(value.refresh_token);
      this.setToken(value.access_token);
      this.setIdToken(value.id_token);
    }));
  }

  public getAuthenticatedUser(): AuthenticatedUser {
    let authUser = this.sessionState.getUserInfo();
    if (authUser) {
      return authUser;
    }
    authUser = JSON.parse(this.getSecureLocalStorageItem(authenticatedUserKey)) as AuthenticatedUser;
    this.sessionState.setUserInfo(authUser);
    return authUser;
  }

  public updateAuthenticatedUserInfo(formValue: any) {
    const valuesFromForm = pick(formValue, ['firstname', 'lastname', 'preferredAreaId', 'title', 'hasNotificationsSound', 'proAccount']);
    const authenticatedUser = {
      ...this.getAuthenticatedUser(),
      ...valuesFromForm
    };
    this.setSecureLocalStorageItem(authenticatedUserKey, JSON.stringify(authenticatedUser));
    this.sessionState.setUserInfo(authenticatedUser);
    this.setPreferredArea(authenticatedUser);
  }

  public isLoggedIn(): boolean {
    // get the token
    const token = this.getToken();
    // return a boolean reflecting
    // whether or not the token is expired
    return token !== null && token !== undefined && !this.isExpired(token) && this.getAuthenticatedUser() !== null;
  }

  private isExpired(token: string): boolean {
    return helper.isTokenExpired(token);
  }

  private getResourceAccess(): any {
    const decodedToken = helper.decodeToken(this.getToken());
    return decodedToken?.resource_access;
  }

  private getRoles(): Array<string> {
    const resourceAccess = this.getResourceAccess();
    return resourceAccess?.[pingApiKey]?.roles ?? [];
  }

  public hasRoleFunctionalAdmin(): boolean {
    return this.getRoles().includes(roleFunctionalAdmin);
  }

  public hasRoleServiceUser(): boolean {
    return this.getRoles().includes(roleServiceUser);
  }

  public isProUser(): boolean {
    return this.hasRoleFunctionalAdmin() || this.hasRoleServiceUser();
  }

  public isPublicUser(): boolean {
    return !this.isProUser();
  }

  public isMaritimeNoticeProducer(): boolean {
    return this.hasRoleServiceUser() && this.getAuthenticatedUser().noticeProducer;
  }

  public isPublicUserWithProAccount(): boolean {
    return this.isLoggedIn() && this.isPublicUser() && this.isProAccount();
  }

  public isProAccount(): boolean {
    return !!this.getAuthenticatedUser().proAccount;
  }

  public belongsToGovernmentService(): boolean {
    return this.hasRoleServiceUser() && this.getAuthenticatedUser().serviceNetwork === ServiceNetwork.GOVERNMENT_SERVICE;
  }

  public hasAutorityType(): boolean {
    return this.hasRoleServiceUser() && this.getAuthenticatedUser().serviceType === MaritimeServiceType.AUTHORITY;
  }

  public hasShomGeographicAreaType(): boolean {
    return this.hasRoleServiceUser() && this.getAuthenticatedUser().serviceType === MaritimeServiceType.SHOM_GEOGRAPHIC_AREA;
  }

  private buildKeycloakUrlLogin(profileMode: ProfileMode, redirectToAfterAuthentication: string): string {
    return this.buildKeycloakUrl(environment.keycloak.urlLogin, profileMode === ProfileMode.PUBLIC, environment.keycloak.redirectUri.default + '/redirect', redirectToAfterAuthentication);
  }

  private buildKeycloakUrlLogout(): string {
    return this.buildKeycloakUrl(environment.keycloak.urlLogout, this.isPublicUser(), environment.keycloak.redirectUri.default);
  }

  private buildKeycloakUrl(urlTemplate: string, isPublicUser: boolean, redirectUri: string, redirectToAfterAuthentication?: string): string {
    const state = nanoid();
    const nonce = nanoid();
    this.setSecureLocalStorageItem(stateKey, state);
    this.setSecureLocalStorageItem(nonceKey, nonce);
    const profileModeParam = '/?profileMode=' + (isPublicUser ? ProfileMode.PUBLIC : ProfileMode.PRO);
    const redirectToParam = redirectToAfterAuthentication ? '%26to=' + redirectToAfterAuthentication : '';
    const redirectUriWithParams = redirectUri + profileModeParam + redirectToParam;
    return urlTemplate
      .replace('{{root_url}}', environment.keycloak.rootUrl)
      .replace('{{realm}}', isPublicUser ? environment.keycloak.publicRealm : environment.keycloak.proRealm)
      .replace('{{state}}', state)
      .replace('{{nonce}}', nonce)
      .replace('{{id_token_hint}}', this.getIdToken())
      .replace('{{redirect_uri}}', redirectUriWithParams)
      .replace('{{lang}}', window.localStorage.lang);
  }

  public hasAccess(scope: string, action?: string): boolean {
    if (!this.isLoggedIn()
      || (action ? !this.privilegesService.hasAccess(scope, action, this.getAuthenticatedUser()?.role)
        : !this.privilegesService.hasAccessToScope(scope, this.getAuthenticatedUser()?.role))
      || !this.getAuthenticatedUser().noticeProducer) {
      return false;
    }
    return true;
  }

  public hasAccessToService(serviceId: string, role: ServiceRole): boolean {
    return this.isLoggedIn() && this.getAuthenticatedUser()?.serviceRoles.filter(r => r.serviceId === serviceId
      && r.serviceRole === role).length === 1;
  }

  private startRefresh(): void {
    const exp = helper.decodeToken(this.getToken()).exp;

    // exp - 1 min
    const expLimit = new Date((exp * 1000) - (60000));
    const now = Date.now();
    // @ts-ignore
    const diff = expLimit - now;

    this.refreshTimeout = setTimeout(() => this.refreshAccessToken().subscribe(), diff);
  }

  public getNonceFromToken(token: string): string {
    return helper.decodeToken(token).nonce;
  }

  public refreshAccessToken(): Observable<void> {
    const keycloakUrl = environment.keycloak.urlToken
      .replace('{{root_url}}', environment.keycloak.rootUrl)
      .replace('{{realm}}', helper.decodeToken(this.getToken()).iss.endsWith(environment.keycloak.publicRealm)
        ? environment.keycloak.publicRealm : environment.keycloak.proRealm);
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', environment.keycloak.clientId)
      .set('refresh_token', this.getRefreshToken());
    return this.httpClient.post<TokenResponse>(keycloakUrl, body, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }).pipe(map(value => {
      this.setRefreshToken(value.refresh_token);
      this.setToken(value.access_token);
      this.setIdToken(value.id_token);
      this.startRefresh();
    }));
  }

  public hasSomeRoleOnService(serviceId: string): boolean {
    return this.isLoggedIn() && this.getAuthenticatedUser()?.serviceRoles.filter(r => r.serviceId === serviceId).length === 1;
  }

  public hasServiceRole(serviceRole: ServiceRole): boolean {
    return this.isLoggedIn() && this.getAuthenticatedUser()?.serviceRoles.filter(r => r.serviceRole === serviceRole).length > 0;
  }

  public hasAnyRole(serviceRoles: ServiceRole[]): boolean {
    return this.isLoggedIn() && this.getAuthenticatedUser()?.serviceRoles.some(r => serviceRoles.includes(r.serviceRole));
  }

  public getAuthenticatedUserServiceRoles(): ServiceUserRole[] {
    return this.getAuthenticatedUser()?.serviceRoles ?? [];
  }

  public hasAnyRoleOnService(serviceRoles: ServiceRole[], serviceId: string): boolean {
    return this.isLoggedIn() &&
      this.getAuthenticatedUserServiceRoles()
        .filter(role => role.serviceId === serviceId)
        .some(role => serviceRoles.includes(role.serviceRole));
  }

  public hasRightsOnAnyAuthorityService(roles: ServiceRole[]): boolean {
    return this.isLoggedIn() &&
      this.getAuthenticatedUserServiceRoles()
        .filter(role => role.type === MaritimeServiceType.AUTHORITY)
        .some(role => roles.includes(role.serviceRole));
  }

  public isSurveyOwnerOnAnyServiceWithAdminOrOperatorRole(): boolean {
    return this.isSurveyOwnerOnAnyServiceWithRoles([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR]);
  }

  public isSurveyOwnerOnAnyServiceWithAnyRole(): boolean {
    return this.isSurveyOwnerOnAnyServiceWithRoles([ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_VISITOR]);
  }

  public isSurveyOwnerOnAnyServiceWithRoles(roles: ServiceRole[]): boolean {
    return this.isLoggedIn() &&
      this.getAuthenticatedUserServiceRoles()
        .filter(role => role.surveyOwner === true)
        .some(role => roles.includes(role.serviceRole));
  }

  public hasAnyRoleOnAnyService(serviceRoles: ServiceRole[], serviceIds: string[]): boolean {
    return this.isLoggedIn() && serviceIds.some(serviceId => this.hasAnyRoleOnService(serviceRoles, serviceId));
  }

  public canCreateWarning(): boolean {
    return this.isLoggedIn() && this.hasRoleServiceUser() && this.hasAccess(SCOPE.WARNING, 'creation');
  }

  public hasAnyRoleOnShomService(): boolean {
    return this.isLoggedIn() && this.getAuthenticatedUserServiceRoles().some(role => role.shomService);
  }

  public isBri(): boolean {
    return this.isLoggedIn() &&
      this.getAuthenticatedUserServiceRoles()
        .filter(role => role.surveyOwner === true)                  // enable survey module access
        .filter(role => role.type === MaritimeServiceType.BRI)      // find BRI service
        .some(role => [ServiceRole.SERVICE_ADMIN, ServiceRole.SERVICE_OPERATOR, ServiceRole.SERVICE_VISITOR].includes(role.serviceRole));     // any role
  }


  public isServiceAdminOnAnyService(): boolean {
    return this.isLoggedIn() &&
      this.getAuthenticatedUserServiceRoles()
        .some(role => role.serviceRole === ServiceRole.SERVICE_ADMIN);
  }
}
