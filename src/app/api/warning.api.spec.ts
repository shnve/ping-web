import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WarningApi } from './warning.api';
import { JsonMapWarning, JsonWarning, TableWarning } from '../models/warning.model';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WarningApi', () => {
  let service: WarningApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [WarningApi, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(WarningApi);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('returned Observable should match the 2 mapWarnings', () => {
    const areas = [{
      id: '1',
      geometries: [],
      globalWarningType: 'WARNING',
      nameOfSeries: 'series 1',
      warningNumber: 0,
      warningTypeDetails: 'details 1',
      year: 1994
    }, {
      id: '2',
      geometries: [],
      globalWarningType: 'NOTICE',
      nameOfSeries: 'series 2',
      warningNumber: 0,
      warningTypeDetails: 'details 1',
      year: 2001
    }] as JsonMapWarning[];
    service.getMapWarnings$().subscribe((mapWarnings) => {
      expect(mapWarnings.length).toEqual(2);
      const [firstWarning, secondWarning] = mapWarnings;
      expect(firstWarning.id).toEqual('1');
      expect(firstWarning.year).toEqual(1994);
      expect(secondWarning.id).toEqual('2');
      expect(secondWarning.year).toEqual(2001);
    });

    const testRequest = httpTestingController.expectOne({
      url: service.apiWarningsMap
    });

    expect(testRequest.request.method).toEqual('GET');
    testRequest.flush(areas);
  });

  it('should return JsonMapWarning', () => {
    const warning = {
      id: '1',
    } as JsonWarning;
    service.getWarningById$('1').subscribe((warning) => {
      expect(warning.id).toEqual('1');
    });

    const testRequest = httpTestingController.expectOne({
      url: service.apiWarningById + '/1'
    });

    expect(testRequest.request.method).toEqual('GET');
    testRequest.flush(warning);
  });

  it('should get warning for a "tableView"', (done) => {
    const tableViewDtos: PaginatedModelItemTableViewDtos<TableWarning> = {
      _embedded: {
        items: [
          {
            id: '1',
            warningNumber: 1002,
            nameOfSeries: 'serie',
            year: 21,
            generalAreas: {},
            localities: {},
            warningTypeDetails: '',
            warningHazardTypeGeneral: ''
          },
          {
            id: '2',
            warningNumber: 1002,
            nameOfSeries: 'serie',
            year: 22,
            generalAreas: {},
            localities: {},
            warningTypeDetails: '',
            warningHazardTypeGeneral: ''
          }
        ]
      },
      page: {
        size: 2,
        totalElements: 52,
        totalPages: 6,
        number: 1
      }
    };

    service.getTableView$({
      dateStart: '2021/12/25',
      dateEnd: '2022/12/25',
      publishedFromIncludingDate: '2012/12/21',
      page: '0',
      size: '2'
    }, false).subscribe(res => {
      expect(res.page.size).toEqual(2);
      expect(res.page.totalElements).toEqual(52);
      expect(res._embedded.items).toContain( {
        id: '2',
        warningNumber: 1002,
        nameOfSeries: 'serie',
        year: 22,
        generalAreas: {},
        localities: {},
        warningTypeDetails: '',
        warningHazardTypeGeneral: ''
      });
      done();
    }, (e) => {
      fail(e);
    });

    const testRequest = httpTestingController.expectOne({
      method: 'GET'
    });
    expect(testRequest.request.params.get('dateStart')).toEqual('2021/12/25');
    expect(testRequest.request.params.get('dateEnd')).toEqual('2022/12/25');
    expect(testRequest.request.params.get('publishedFromIncludingDate')).toEqual('2012/12/21');
    expect(testRequest.request.params.get('page')).toEqual('0');
    expect(testRequest.request.params.get('size')).toEqual('2');
    testRequest.flush(tableViewDtos);
  })
});
