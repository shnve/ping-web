import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import Area from '../models/area.model';
import { AreasApi } from './areas.api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AreasApi', () => {
  let service: AreasApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [AreasApi, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AreasApi);
  });

  afterAll(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('returned Observable should match the 2 areas', () => {
    const areas = [{
      id: '1',
      name: 'area 1',
      geom: null
    }, {
      id: '2',
      name: 'area 2',
      geom: null
    }] as Area[];
    service.getAreas().subscribe((areas) => {
      expect(areas.length).toEqual(2);
      const [firstArea, secondArea] = areas;
      expect(firstArea.id).toEqual('1');
      expect(firstArea.name).toEqual('area 1');
      expect(secondArea.id).toEqual('2');
      expect(secondArea.name).toEqual('area 2');
    });

    const testRequest = httpTestingController.expectOne({
      url: service.api
    });

    expect(testRequest.request.method).toEqual('GET');

    testRequest.flush(areas);
  });
});
