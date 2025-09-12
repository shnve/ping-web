import { HttpHeaders, HttpParams, HttpResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { environment } from '../../environments/environment';
import PublicUser, { AuthenticatedUser } from '../models/public-user.model';
import { UsersApi } from './users.api';

describe('UsersApi', () => {
  let userService: UsersApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [UsersApi, PermissionsProvider, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UsersApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  describe('#UsersApi.createUser()', () => {

    it('should create', () => {
      expect(userService).toBeTruthy();
    });

    it('should create user', () => {
      const newUser: PublicUser = {
        title: 'MR',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@great-company.com',
        password: 'Ch0ucr@ut3',
        hasEmailNotification: true,
        mobilePhoneNumber: '+33123456789',
        phoneNumber: '+33123456789',
        hasAcceptedTos: true,
        registrationNumber: null,
        preferredArea: null,
        organization: null,
        shipName: null,
        homePort: null,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: true,
        proAccount: false
      };
      userService.createUser(newUser).subscribe(user => {
        expect(user).toBe(null);
      }, fail);

      // createUser should have made one request to POST user
      const req = httpTestingController.expectOne(userService.createUserUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newUser);

      // Expect server to return status 201 created
      const expectedResponse = new HttpResponse({ status: 201, statusText: 'Created' });
      req.event(expectedResponse);
    });

    it('should fail to create user - client-side/network error', () => {
      const newUser: PublicUser = {
        title: 'MR',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@great-company.com',
        password: 'Ch0ucr@ut3',
        hasEmailNotification: true,
        mobilePhoneNumber: '+33123456789',
        phoneNumber: '+33123456789',
        hasAcceptedTos: true,
        registrationNumber: null,
        preferredArea: null,
        organization: null,
        shipName: null,
        homePort: null,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: true,
        proAccount: false
      };

      userService.createUser(newUser).subscribe(
        fail,
        error => expect(error).toEqual({ unknown: 'message.network-error' }));

      // createUser should have made one request to POST user
      const req = httpTestingController.expectOne(userService.createUserUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newUser);

      // Expect server to return status 0
      req.flush({
          status: 0
        },
        {
          status: 0,
          statusText: 'Bad Request'
        });
    });

    it('should fail to create user - bad password', () => {
      const newUser: PublicUser = {
        title: 'MR',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@great-company.com',
        password: 'P@ssw0rd',
        hasEmailNotification: true,
        mobilePhoneNumber: '+33123456789',
        phoneNumber: '+33123456789',
        hasAcceptedTos: true,
        registrationNumber: null,
        preferredArea: null,
        organization: null,
        shipName: null,
        homePort: null,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: true,
        proAccount: false
      };

      userService.createUser(newUser).subscribe(
        fail,
        error => expect(error).toEqual({ password: 'user-creation-error-message.password-policy-not-met' }));

      // createUser should have made one request to POST user
      const req = httpTestingController.expectOne(userService.createUserUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newUser);

      // Expect server to return status 400 bad request
      req.flush({
          status: 400,
          error: 'Bad Request',
          'invalid-arguments': { password: 'user-creation-error-message.password-policy-not-met' }
        },
        {
          status: 400,
          statusText: 'Bad Request'
        });
    });

    it('should fail to create user - email already used', () => {
      const newUser: PublicUser = {
        title: 'MR',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@great-company.com',
        password: 'Ch0ucr@ut3',
        hasEmailNotification: true,
        mobilePhoneNumber: '+33123456789',
        phoneNumber: '+33123456789',
        hasAcceptedTos: true,
        registrationNumber: null,
        preferredArea: null,
        organization: null,
        shipName: null,
        homePort: null,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: true,
        proAccount: false
      };

      userService.createUser(newUser).subscribe(
        fail,
        error => expect(error).toEqual({ email: 'user-creation-error-message.user-already-exists' }));

      // createUser should have made one request to POST user
      const req = httpTestingController.expectOne(userService.createUserUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newUser);

      // Expect server to return status 400 bad request
      req.flush({
          status: 400,
          error: 'Bad Request',
          'invalid-arguments': { email: 'user-creation-error-message.user-already-exists' }
        },
        {
          status: 400,
          statusText: 'Bad Request'
        });
    });

    it('should fail to create user - unkwnown error', () => {
      const newUser: PublicUser = {
        title: 'MR',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@great-company.com',
        password: 'Ch0ucr@ut3',
        hasEmailNotification: true,
        mobilePhoneNumber: '+33123456789',
        phoneNumber: '+33123456789',
        hasAcceptedTos: true,
        registrationNumber: null,
        preferredArea: null,
        organization: null,
        shipName: null,
        homePort: null,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: true,
        proAccount: false
      };

      userService.createUser(newUser).subscribe(
        fail,
        error => expect(error).toEqual({ user: 'user-creation-error-message.unknown-error' }));

      // createUser should have made one request to POST user
      const req = httpTestingController.expectOne(userService.createUserUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newUser);

      // Expect server to return status 400 Bad Request
      req.flush({
          status: 400,
          error: 'Bad Request',
          'invalid-arguments': { user: 'user-creation-error-message.unknown-error' }
        },
        {
          status: 400,
          statusText: 'Bad Request'
        });
    });

    it('should fail to create user - unhandled unknown server-side error', () => {
      const newUser: PublicUser = {
        title: 'MR',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@great-company.com',
        password: 'Ch0ucr@ut3',
        hasEmailNotification: true,
        mobilePhoneNumber: '+33123456789',
        phoneNumber: '+33123456789',
        hasAcceptedTos: true,
        registrationNumber: null,
        preferredArea: null,
        organization: null,
        shipName: null,
        homePort: null,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: true,
        proAccount: false
      };

      userService.createUser(newUser).subscribe(
        fail,
        error => expect(error).toEqual({ unhandled: 'message.unhandled-error' }));

      // createUser should have made one request to POST user
      const req = httpTestingController.expectOne(userService.createUserUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newUser);

      // Expect server to return status 500 Internal Server Error
      req.flush({
          status: 500
        },
        {
          status: 500,
          statusText: 'Internal Server Error'
        });
    });

    it('should handle error code from keycloak - invalid-grant: Code not valid', () => {
      const newUser: PublicUser = {
        title: 'MR',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@great-company.com',
        password: 'Ch0ucr@ut3',
        hasEmailNotification: true,
        mobilePhoneNumber: '+33123456789',
        phoneNumber: '+33123456789',
        hasAcceptedTos: true,
        registrationNumber: null,
        preferredArea: null,
        organization: null,
        shipName: null,
        homePort: null,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: true,
        proAccount: false
      };

      userService.createUser(newUser).subscribe(
        fail,
        error => expect(error).toEqual({ code: 'invalid-grant.invalid-code' })
      );

      // createUser should have made one request to POST user
      const req = httpTestingController.expectOne(userService.createUserUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newUser);

      // Expect server to return status 400 bad request
      req.flush({
          error: 'invalid_grant',
          'error_description': 'Code not valid'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        });
    });


  });


  describe('#UsersApi.authenticateUser()', () => {

    it('should create', () => {
      expect(userService).toBeTruthy();
    });

    it('should authenticate user and get access_token', () => {
      let authResponse;
      const accessToken = 'my_access_token';
      const authorizationCode = '8bd24b64-09e3-4563-944e-b360b4e48b9f.72c75e54-45fd-4eb0-a0ba-9c6edac8372c.076c4b07-f548-4bac-a2e0-239d373ab05b';
      const body = new HttpParams()
        .set('client_id', 'ping-web')
        .set('grant_type', 'authorization_code')
        .set('code', authorizationCode)
        .set('state', 'state')
        .set('nonce', 'nonce')
        .set('redirect_uri', environment.keycloak.redirectUri.default);
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      userService.authenticateUser(authorizationCode, true, 'state', 'nonce').subscribe(
        res => authResponse = res
      );

      // should have made one request to POST authorization code
      const req = httpTestingController.expectOne(userService.buildKeycloakUrlToken(true));
      expect(req.request.method).toEqual('POST');
      expect(JSON.stringify(req.request.headers)).toEqual(JSON.stringify(headers));
      expect(req.request.body).toEqual(body.toString());

      req.flush({ access_token: accessToken });

      expect(authResponse.access_token).toEqual(accessToken);
    });

    it('should not authenticate user - invalid-grant: Code is missing', () => {
      const authorizationCode = undefined;
      userService.authenticateUser(authorizationCode, true, 'state', 'nonce').subscribe(
        () => {},
        error => expect(error).toEqual({ code: 'invalid-grant.missing-code' })
      );

      // should have made one request to POST authorization code
      httpTestingController.expectNone(userService.buildKeycloakUrlToken(true));
    });
  });

  describe('#UsersApi.enableUser()', () => {

    it('should create', () => {
      expect(userService).toBeTruthy();
    });

    it('should enable user', () => {
      const expectAuthenticatedPublicUser: AuthenticatedUser = {title: 'MR', firstname: 'firstname', lastname: 'lastname', hasNotificationsSound: false};
      const accessToken = 'my_access_token';
      const body = {};
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`);
      userService.enableUser(accessToken).subscribe(
        authenticatedPublicUser => {
          expect(authenticatedPublicUser).toEqual(expectAuthenticatedPublicUser);
        }
      );

      // should have made one request to POST user enable
      const req = httpTestingController.expectOne(userService.enableUserUrl);
      expect(req.request.method).toEqual('POST');
      expect(JSON.stringify(req.request.headers)).toEqual(JSON.stringify(headers));
      expect(JSON.stringify(req.request.body)).toEqual(JSON.stringify(body));

      req.flush(expectAuthenticatedPublicUser);
    });

    it('should get current user', () => {
      const expectAuthenticatedPublicUser: AuthenticatedUser = {title: 'MR', firstname: 'firstname', lastname: 'lastname', hasNotificationsSound: false};
      const accessToken = 'my_access_token';
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`);
      userService.me(accessToken).subscribe(
        authenticatedPublicUser => {
          expect(authenticatedPublicUser).toEqual(expectAuthenticatedPublicUser);
        }
      );

      // should have made one request to GET user
      const req = httpTestingController.expectOne(userService.getUserUrl());
      expect(req.request.method).toEqual('GET');
      expect(JSON.stringify(req.request.headers)).toEqual(JSON.stringify(headers));

      req.flush(expectAuthenticatedPublicUser);
    });

  });

  describe('#UsersApi.findPublicUser()', () => {
    it('should find public user from public context', done => {
      // Given
      const accessToken = 'my_access_token';
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`);
      const id = 'id_user';
      const expectedPublicUser: PublicUser = {
        title: 'MR',
        firstname: 'firstname',
        lastname: 'lastname',
        email: 'email',
        password: 'passowrd',
        hasEmailNotification: false,
        mobilePhoneNumber: 'mobile',
        phoneNumber: 'phone',
        hasAcceptedTos: false,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: false,
        proAccount: false
      };

      // When
      userService.findOnePublic(id, accessToken).subscribe(publicUser => expect(publicUser).toEqual(expectedPublicUser));

      // Then
      const req = httpTestingController.expectOne(userService.findUserById + '/id_user');
      expect(req.request.method).toEqual('GET');
      expect(JSON.stringify(req.request.headers)).toEqual(JSON.stringify(headers));

      req.flush(expectedPublicUser);
      done();
    });

    it('should find public user from admin context', done => {
      // Given
      const id = 'id_user';
      const expectedPublicUser: PublicUser = {
        title: 'MR',
        firstname: 'firstname',
        lastname: 'lastname',
        email: 'email',
        password: 'passowrd',
        hasEmailNotification: false,
        mobilePhoneNumber: 'mobile',
        phoneNumber: 'phone',
        hasAcceptedTos: false,
        hasNotificationsSound: false,
        hasSubscriptionEmailNotifications: false,
        proAccount: false
      };

      // When
      userService.findOnePublicFromAdmin(id).subscribe(publicUser => expect(publicUser).toEqual(expectedPublicUser));

      // Then
      const req = httpTestingController.expectOne(userService.findUserByIdFromAdmin + '/id_user');
      expect(req.request.method).toEqual('GET');
     
      req.flush(expectedPublicUser);
      done();
    });
  });

});
