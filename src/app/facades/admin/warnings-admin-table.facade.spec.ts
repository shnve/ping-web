import { TestBed } from '@angular/core/testing';
import { WarningAdminApi, WarningsTableApiParams } from '@app/api/admin/warning-admin.api';
import { TableAdminFilterValues } from '@app/models/admin/warning-admin-filter.model';
import { TableAdminWarning } from '@app/models/admin/warning-admin-table.model';
import { SerieType } from '@app/models/serie.model';
import { PaginatedModelItemTableViewDtos } from '@app/shared/models/paginated-table-view.model';
import { TableStateValue } from '@app/states/table.state';
import { Observable, Subject, of } from 'rxjs';
import { WarningAdminTableFacade } from './warning-admin-table.facade';

import Spy = jasmine.Spy;

class MockWarningApi {
  getTableView$(): Subject<any> {
    return new Subject();
  }
}

describe('WarningsAdminTableFacade', () => {
  let service: WarningAdminTableFacade;
  let apiGetTableViewSpy: Spy<(params: WarningsTableApiParams) => Observable<PaginatedModelItemTableViewDtos<TableAdminWarning>>>;
  let mockWarningApi: WarningAdminApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WarningAdminTableFacade,
        {provide: WarningAdminApi, useClass: MockWarningApi}
      ]
    });
    service = TestBed.inject(WarningAdminTableFacade);
    mockWarningApi = TestBed.inject<WarningAdminApi>(WarningAdminApi);
    apiGetTableViewSpy = spyOn(mockWarningApi, 'getTableView$');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert "TableFilterValues" to "WarningsTableApiParams"', () => {
    const filter: TableAdminFilterValues = {
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
      generalCategory: 'AIDS_TO_NAVIGATION',
      detailsCategories: [
        'DRIFTING_HAZARD', 'DANGEROUS_WRECK'
      ],
      period: {
        startDate: new Date(2011, 0, 1),
        endDate: new Date(2021, 0, 25)
      },
      todo: true,
      warningNumber: '100/21',
      localityOrInformation: 'test',
      referenceNumber: '201/21'
    };
    const resultParams = WarningAdminTableFacade.convertFilterToRequestParams('PUBLISHED', filter);
    expect(resultParams.serieId).toEqual('1');
    expect(resultParams.subAreaIds).toEqual('123,456');
    expect(resultParams.warningHazardTypeGeneral).toEqual('AIDS_TO_NAVIGATION');
    expect(resultParams.warningHazardTypeDetails).toEqual('DRIFTING_HAZARD,DANGEROUS_WRECK');
    expect(resultParams.dateStart).toEqual('2011-01-01');
    expect(resultParams.dateEnd).toEqual('2021-01-25');
  });

  it('should load a "PaginatedWarningTableViewDtos" and return it converted in "WarningTablePage"', (done) => {
    apiGetTableViewSpy.and.returnValues(
      of<PaginatedModelItemTableViewDtos<TableAdminWarning>>({
        _embedded: {
          items: [{
              id: '1',
              generalAreas: {
                fr: [
                  'Finistère'
                ]
              },
              localities: {},
              nameOfSeries: 'serie',
              warningNumber: 1,
              year: 21,
              status: 'PUBLISHED',
              references: [],
              creationDate: '2021-06-22',
              publicationDate: '2021-01-15',
              state: 'TO_REVIEW',
              warningTypeDetails: 'enum.warning-hazard-type-general.aids-to-navigation'
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
        generalAreas: {
          fr: [
            'Finistère'
          ]
        },
        localities: {},
        nameOfSeries: 'serie',
        warningNumber: 1,
        year: 21,
        status: 'PUBLISHED',
        references: [],
        creationDate: '2021-06-22',
        publicationDate: '2021-01-15',
        state: 'TO_REVIEW',
        warningTypeDetails: 'enum.warning-hazard-type-general.aids-to-navigation'
      }],
      totalElements: 2
    };

    const tableStateValue: TableStateValue = {
      pageInfo: {page: 1, rows: 1},
      sortInfo: {field: 'publicationDate', order: -1}
    }

    const res$ = service.loadFilteredPage$(tableStateValue, 'PUBLISHED', {
      serie: {
        id: '2',
        name: 'serie2',
        type: SerieType.LOCAL_NOTICE_TO_MARINER,
        subAreas: [],
        maritimeService: '1',
        ranges: [[1, 999]]
      },
      subAreaIds: [],
      detailsCategories: []
    });
    expect(apiGetTableViewSpy).toHaveBeenCalled();
    res$.subscribe(res => {
      expect(res.modelItems).toEqual(expectedResult.warnings);
      expect(res.totalElements).toEqual(expectedResult.totalElements);
      done();
    })
  });
});
