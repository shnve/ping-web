import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StaticLogo } from '../models/static-logo.model';
import { StaticLogoAdminApi } from './static-logo-admin.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticLogoAdminApi', () => {
  let api: StaticLogoAdminApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(StaticLogoAdminApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(api).toBeTruthy();
  });

  it('should find by id', done => {
    // Given
    const id = '1';
    const staticLogo: StaticLogo = {
      id: '1',
      key: 'key',
      description: 'description',
      content: 'content',
      altTxt: 'altFr',
      altTxtInternational: 'altEn',
      locked: true
    };

    // When
    api.findOne(id).subscribe(res => {
      expect(res).toEqual(staticLogo);
    }, fail);

    // Then
    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: api.adminApi + '/' + id
    });
    testRequest.flush(staticLogo);
    done();
  });

  it('should create logo', done => {
    // Given
    const staticLogo: StaticLogo = {
      id: null,
      key: 'key',
      description: 'description',
      content: 'content',
      altTxt: 'altFr',
      altTxtInternational: 'altEn',
      locked: true
    };

    // When
    api.saveStaticLogo(null, staticLogo).subscribe(res => {
      expect(res).toEqual(staticLogo);
    }, fail);

    // Then
    const testRequest = httpTestingController.expectOne({ method: 'POST' });
    expect(testRequest.request.body).toEqual(staticLogo);
    testRequest.flush(staticLogo);
    done();
  });


});
