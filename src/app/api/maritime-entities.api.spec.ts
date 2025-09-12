import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MapMaritimeEntity } from '@app/models/maritime-entity.model';
import { GeometryType } from '@app/sig/utils/geometry';
import { MaritimeEntitiesApi } from './maritime-entities.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MaritimeEntitiesApi', () => {
  let api: MaritimeEntitiesApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [MaritimeEntitiesApi, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    api = TestBed.inject(MaritimeEntitiesApi);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(api).toBeTruthy();
    done();
  });

  it('should get entities managed or observed by service to display on map', done => {
    const entitiesObservedOrManagedByService: MapMaritimeEntity[] = [
      {
        id: '1',
        name: 'entity1',
        geom: {
          coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10]]],
          type: GeometryType.POLYGON
        }
      },
      {
        id: '2',
        name: 'entity2',
        geom: {
          coordinates: [[[0, 0], [10, 0], [10, 15], [0, 10]]],
          type: GeometryType.POLYGON
        }
      }
    ];

    api.getEntitiesManagedOrObservedByServiceToDisplayOnMap$().subscribe((entities) => {
      expect(entities).toEqual(entitiesObservedOrManagedByService);
      done();
    },
      (e) => done.fail(e)
    );

    const testRequest = httpTestingController.expectOne(api['apiGetEntitiesManagedOrObservedToDisplayOnMap']);
    expect(testRequest.request.method).toEqual('GET');
    testRequest.flush(entitiesObservedOrManagedByService);
  });

});
