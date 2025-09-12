import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SubAreasApi } from './sub-areas.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SubAreasApi', () => {
  let service: SubAreasApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [SubAreasApi, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SubAreasApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should delete', done => {
    // Given
    const id = 'idSubArea';

    // When
    service.delete$(id).subscribe();

    // then
    const testRequest = httpTestingController.expectOne(service.adminApi + '/' + id);
    expect(testRequest.request.method).toEqual('DELETE');
    done();
  });
});
