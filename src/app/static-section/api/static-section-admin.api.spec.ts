import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StaticSection, StaticSectionBase } from '../models/static-section.model';
import { StaticSectionAdminApi } from './static-section-admin.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StaticSectionAdminApi', () => {
  let api: StaticSectionAdminApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(StaticSectionAdminApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(api).toBeTruthy();
  });

  it('should update section', done => {
    // Given
    const key = 'section-key';
    const id = '1';
    const staticSectionUpdate: StaticSectionBase = {
      content: 'contenu',
      internationalContent: 'content'
    };
    const staticSection: StaticSection = {
      id: '1',
      key: 'section-key',
      location: 'location',
      path: 'path',
      name: 'name',
      content: 'contenu',
      internationalContent: 'content'
    };

    // When
    api.saveStaticSection(id, staticSectionUpdate).subscribe(res => {
      expect(res).toEqual(staticSection);
    }, fail);

    // Then
    const testRequest = httpTestingController.expectOne({ method: 'PUT' });
    expect(testRequest.request.body).toEqual(staticSectionUpdate);
    testRequest.flush(staticSection);
    done();
  });

  it('should find by id', done => {
    // Given
    const id = '1';
    const staticSection: StaticSection = {
      id: '1',
      key: 'section-key',
      location: 'location',
      path: 'path',
      name: 'name'
    };

    // When
    api.findOne(id).subscribe(res => {
      expect(res).toEqual(staticSection);
    }, fail);

    // Then
    const testRequest = httpTestingController.expectOne({
      method: 'GET',
      url: api.adminApi + '/' + id
    });
    testRequest.flush(staticSection);
    done();
  });
});