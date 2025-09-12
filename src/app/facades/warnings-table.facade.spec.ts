import { TestBed } from '@angular/core/testing';

import { TableWarning } from '@app/models/warning.model';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { Observable, Subject, of } from 'rxjs';
import { WarningApi, WarningsTableApiParams } from '../api/warning.api';
import { SerieType } from '../models/serie.model';
import { TableFilterValues } from '../models/warning-filters.model';
import { WarningTableFacade } from './warnings-table.facade';
import Spy = jasmine.Spy;

class MockWarningApi {
  getTableView$(): Subject<any> {
    return new Subject();
  }
}

describe('WarningsTableFacade', () => {
  let service: WarningTableFacade;
  let apiGetTableViewSpy: Spy<(params: WarningsTableApiParams) => Observable<PaginatedModelItemTableViewDtos<TableWarning>>>;
  let mockWarningApi: WarningApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WarningTableFacade,
        {provide: WarningApi, useClass: MockWarningApi}
      ]
    });
    service = TestBed.inject(WarningTableFacade);
    mockWarningApi = TestBed.inject<WarningApi>(WarningApi);
    apiGetTableViewSpy = spyOn(mockWarningApi, 'getTableView$');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert "TableFilterValues" to "WarningsTableApiParams"', () => {
    const filter: TableFilterValues = {
      serie: {
        id: '1',
        subAreas: [],
        type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
        name: 'série1',
        internationalName: 'serie1',
        maritimeService: '1',
        ranges: [[1, 999]]
      },
      subAreaIds: ['123', '456'],
      categories: [
        'DRIFTING_HAZARD', 'DANGEROUS_WRECK'
      ],
      concernedMaritimeEntityIds: ['1'],
      entityCoverIds: ['1'],
      publishDate: new Date(2021, 11, 2),
      period: {
        startDate: new Date(2011, 0, 1),
        endDate: new Date(2021, 0, 25)
      },
      reservationNumberAndYear: '30/20'
    };
    const resultParams = WarningTableFacade.convertFilterToRequestParams(filter);
    expect(resultParams.serieId).toEqual('1');
    expect(resultParams.subAreaIds).toEqual('123,456');
    expect(resultParams.warningHazardTypeGenerals).toEqual('DRIFTING_HAZARD,DANGEROUS_WRECK');
    expect(resultParams.publishedFromIncludingDate).toEqual('2021-12-02');
    expect(resultParams.dateStart).toEqual('2011-01-01');
    expect(resultParams.dateEnd).toEqual('2021-01-25');
    expect(resultParams.reservationNumberAndYear).toEqual('30/20');
  });

  it('should load a "PaginatedWarningTableViewDtos" and return it converted in "WarningTablePage"', (done) => {
    apiGetTableViewSpy.and.returnValues(
      of<PaginatedModelItemTableViewDtos<TableWarning>>({
        _embedded: {
          items: [{
              id: '1',
              generalAreas: {},
              localities: {},
              nameOfSeries: 'serie',
              warningNumber: 1,
              year: 21,
              warningTypeDetails: '',
              warningHazardTypeGeneral: ''
            }
          ]
        },
        page: {
          totalElements: 2,
          number: 0,
          size: 1,
          totalPages: 2
        }
      }
    ));

    const expectedResult = {
      warnings: [{
        id: '1',
        nameOfSeries: 'serie',
        warningNumber: 1,
        year: 21,
        generalAreas: {},
        localities: {},
        warningTypeDetails: '',
        warningHazardTypeGeneral: ''
      }],
      totalElements: 2
    };

    const res$ = service.loadFilteredPage$({page: 1, rows: 1}, null);
    expect(apiGetTableViewSpy).toHaveBeenCalled();
    res$.subscribe(res => {
      expect(res.modelItems).toEqual(expectedResult.warnings);
      expect(res.totalElements).toEqual(expectedResult.totalElements);
      done();
    });
  });
});
