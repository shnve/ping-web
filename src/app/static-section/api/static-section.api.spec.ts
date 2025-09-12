import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StaticSection } from '../models/static-section.model';
import { StaticSectionApi } from './static-section.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticSectionApi', () => {
  let api: StaticSectionApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(StaticSectionApi);
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
    const key = 'section-key';
    const staticSection: StaticSection = {
      id: '1',
      key: 'section-key',
      location: 'location',
      path: 'path',
      name: 'name'
    };

    // When
    api.findOneByKey$(key).subscribe(res => {
      expect(res).toEqual(staticSection);
    }, fail);

    // Then
    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: api.api + '/' + key
    });
    testRequest.flush(staticSection);
    done();
  });
});