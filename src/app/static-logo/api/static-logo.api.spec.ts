import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StaticLogo } from '../models/static-logo.model';
import { StaticLogoApi } from './static-logo.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticLogoApi', () => {
  let api: StaticLogoApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(StaticLogoApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(api).toBeTruthy();
  });

  it('should find by key', done => {
    // Given
    const key = 'key';
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
    api.findOneByKey$(key).subscribe(res => {
      expect(res).toEqual(staticLogo);
    }, fail);

    // Then
    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: api.api + '/' + key
    });
    testRequest.flush(staticLogo);
    done();
  });

});
