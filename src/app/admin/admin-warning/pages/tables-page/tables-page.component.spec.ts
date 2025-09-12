import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WarningAdminApi, WarningsTableApiParams } from '@app/api/admin/warning-admin.api';
import { SeriesAdminFacade } from '@app/facades/admin/series-admin.facade';
import { WarningAdminTableFacade } from '@app/facades/admin/warning-admin-table.facade';
import { Serie, SerieType } from '@app/models/serie.model';
import { TableState } from '@app/states/table.state';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';

import { AuthService } from '@app/auth/auth.service';
import { TableAdminFilterValues } from '@app/models/admin/warning-admin-filter.model';
import { TableAdminWarning } from '@app/models/admin/warning-admin-table.model';
import { ServiceNetwork } from '@app/models/maritime-service.model';
import { AuthenticatedUser } from '@app/models/public-user.model';
import { PaginatedModelItemTableViewDtos } from '@shared/models/paginated-table-view.model';
import { GeometryType } from '@sig/utils/geometry';
import { delay } from 'rxjs/operators';
import { TablesPageComponent } from './tables-page.component';


const SAMPLE_WARNING_TABLE_PAGE = of({
  modelItems: [
    {
      id: 'df0d9942-3371-4688-8705-a79ea37e546f',
      nameOfSeries: 'AVURNAV Local Brest',
      warningNumber: 1001,
      year: 2021,
      references: [
        { nameOfSeries: 'AVURNAV Local Brest', warningNumber: 13, year: 2021 },
        { nameOfSeries: 'AVINAV Brest', warningNumber: 1, year: 2021 },
        { nameOfSeries: 'AVURNAV Local Brest', warningNumber: 206, year: 2021 },
        { nameOfSeries: 'AVINAV Brest', warningNumber: 2, year: 2021 }
      ],
      creationDate: '2024-03-15',
      lastUpdate: '2024-03-15',
      publicationDate: '2021-01-15',
      cancellationDate: '2099-12-31',
      endOfBroadcastDate: '2099-01-01',
      reviewDate: '2021-01-15',
      internalComment: 'Ceci est un commentaire interne',
      state: 'TO_REVIEW',
      status: 'PUBLISHED',
      entities: [],
      folders: [],
      generalAreas: {
        fr: ['Finistère']
      },
      localities: {},
      warningTypeDetails: 'ROUTING_INFORMATION'
    },
    {
      id: '260f0c13-3b98-41a8-8516-6aa2501a0909',
      nameOfSeries: 'AVURNAV Local Brest',
      warningNumber: 1002,
      year: 2021,
      references: [],
      creationDate: '2024-03-15',
      lastUpdate: '2024-03-15',
      publicationDate: '2021-01-30',
      state: 'OUTDATED',
      status: 'PUBLISHED',
      entities: [],
      folders: [],
      generalAreas: {
        fr: ['Finistère']
      },
      localities: {
        fr: ['La gamelle']
      },
      warningTypeDetails: 'SPECIAL_OPERATIONS'
    },
    {
      id: '33ab1dd5-e362-40dc-8172-dc8e47f43b5f',
      nameOfSeries: 'AVURNAV Local Brest',
      warningNumber: 13,
      year: 2021,
      references: [],
      creationDate: '2024-03-15',
      lastUpdate: '2024-03-15',
      publicationDate: '2021-02-01',
      state: 'ACTIVE',
      status: 'PUBLISHED',
      entities: [],
      folders: [],
      generalAreas: {
        fr: ['Finistère']
      },
      localities: {
        fr: ['Ile-de-Sein']
      },
      warningTypeDetails: 'NEWLY_DISCOVERED_DANGERS'
    },
    {
      id: '8ff5ba91-6af4-43a7-8079-77b4d5c9101d',
      nameOfSeries: 'AVURNAV Local Brest',
      warningNumber: 7,
      year: 2021,
      references: [],
      creationDate: '2024-03-15',
      lastUpdate: '2024-03-15',
      publicationDate: '2021-02-01',
      state: 'ACTIVE',
      status: 'PUBLISHED',
      entities: [],
      folders: [],
      generalAreas: {
        fr: ['Finistère']
      },
      localities: {
        fr: ['Pointe du milier']
      },
      warningTypeDetails: 'AIDS_TO_NAVIGATION'
    },
    {
      id: '3550f4c4-37e6-42a4-8196-e50b86104f2b',
      nameOfSeries: 'AVURNAV Local Brest',
      warningNumber: 1004,
      year: 2021,
      references: [],
      creationDate: '2024-03-15',
      lastUpdate: '2024-03-15',
      publicationDate: '2021-01-31',
      state: 'ACTIVE',
      status: 'PUBLISHED',
      entities: [],
      folders: [],
      generalAreas: {
        fr: ['Finistère']
      },
      localities: {},
      warningTypeDetails: 'ROUTING_INFORMATION'
    },
    {
      id: 'd3bf9427-fb5d-44fd-bee0-9c72ca44659b',
      nameOfSeries: 'AVURNAV Local Brest',
      warningNumber: 1003,
      year: 2021,
      references: [],
      creationDate: '2024-03-15',
      lastUpdate: '2024-03-15',
      publicationDate: '2021-01-30',
      state: 'ACTIVE',
      status: 'PUBLISHED',
      entities: [],
      folders: [],
      generalAreas: {
        fr: ['Finistère']
      },
      localities: {},
      warningTypeDetails: 'NEWLY_DISCOVERED_DANGERS'
    },
    {
      id: '8e4ccc61-6b15-47d7-9649-43d2829f01ee',
      nameOfSeries: 'AVURNAV Local Brest',
      warningNumber: 206,
      year: 2021,
      references: [],
      creationDate: '2024-03-15',
      lastUpdate: '2024-03-15',
      publicationDate: '2021-01-19',
      state: 'ACTIVE',
      status: 'PUBLISHED',
      entities: [],
      folders: [],
      generalAreas: {
        fr: ['Finistère']
      },
      localities: {
        fr: ['Ile-de-Sein']
      },
      warningTypeDetails: 'DRIFTING_HAZARDS'
    }
  ],
  totalElements: 7
});

const SAMPLE_SERIE: Serie = {
  id: '7bb1f490-9c5b-4ee9-b4e9-d0de15b74ab0',
  name: 'AVURNAV Local BREST',
  type: SerieType.LOCAL_NAVIGATIONAL_WARNING,
  mandatoryLanguages: [
    'fr'
  ],
  optionalLanguages: [],
  maritimeService: {
    id: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36',
    name: 'CND BREST',
    internationalName: 'CND BREST',
    productionAgency: 'CECLANT',
    type: 'AUTHORITY',
    serviceNetwork: ServiceNetwork.GOVERNMENT_SERVICE,
    pingPartner: true,
    maritimeNoticeProducer: true,
    folderManager: true,
    areas: [],
    authorityCode: 'AUTHORITY',
    shomService: true
  },
  ranges: [[1, 999]],
  subAreas: [
    {
      id: 'f08af189-ee71-47f6-af03-cded6a1f238f',
      name: 'Finistère',
      internationalName: 'Finistère',
      geom: {
        type: GeometryType.POLYGON,
        coordinates: [
          [[-559114.55236538, 6199189.65370721], [-390341.59391171, 6267982.97916386], [-337752.91845151, 6162805.62824346], [-407769.23636074, 6039283.39053463], [-539852.42123752, 6098598.52448392], [-559114.55236538, 6199189.65370721]]
        ]
      },
      subAreas: []
    }
  ],
  internationalName: 'AVURNAV Local BREST'
};

const SAMPLE_FILTER_VALUES: TableAdminFilterValues = {
  'serie': SAMPLE_SERIE,
  subAreaIds: []
};

const SAMPLE_PAGE_SORT_INFO = {
  pageInfo: {
    page: 0,
    rows: 10,
    silent: false
  },
  sortInfo: { field: 'field', order: 1 as 1 }
};

describe('TablesPageComponent', () => {
  let component: TablesPageComponent;
  let fixture: ComponentFixture<TablesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TablesPageComponent
      ],
      providers: [
        MockProvider(ModelItemFilterState),
        MockProvider(WarningAdminApi),
        MockProvider(WarningAdminTableFacade),
        MockProvider(TableState),
        MockProvider(SeriesAdminFacade, {
          getSeriesByServiceIds$(serviceIds: string[]): Observable<Serie[]> {
            return of([{
              id: '1',
              name: 'serie1',
              type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
              subAreas: [],
              maritimeService: '1',
              ranges: [[1, 999]]
            }])
          }
        }),
        MockProvider(AuthService, {
          getAuthenticatedUser(): AuthenticatedUser {
            return {
              serviceId: '69a6e75d-4b15-41e6-a65a-dc739f8e7d36'
            } as any as AuthenticatedUser;
          }
        }),
        MockProvider(WarningAdminApi, {
          getTableView$(params: WarningsTableApiParams): Observable<PaginatedModelItemTableViewDtos<TableAdminWarning>> {
            return of();
          }
        })
      ],
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should load table warnings with request in a row for normal use and remove in paramsQueue', done => {
    // Given
    const countRequest = 3;
    const spyLoadFilteredPage = spyOn<any>(component['warningAdminTableFacade'], 'loadFilteredPage$').and.returnValue(SAMPLE_WARNING_TABLE_PAGE);
    component.filterState.setValues(SAMPLE_FILTER_VALUES);
    component.tableState.setPageInfo(SAMPLE_PAGE_SORT_INFO.pageInfo);
    component.tableState.setSortInfo(SAMPLE_PAGE_SORT_INFO.sortInfo);

    // When
    for (let i = 0; i < countRequest; i++) {
      component['loadTableWarnings']();
    }

    // Then
    expect(spyLoadFilteredPage).toHaveBeenCalledTimes(countRequest + 1);
    expect(component['uuidParamsQueue']).toHaveSize(0);
    done();
  });

  it('should not load table warnings with response request on error and remove in paramsQueue', done => {
    // Given
    const spyWarningService = spyOn<any>(component['warningAdminTableFacade'], 'loadFilteredPage$')
      .and.returnValue(throwError('Test message in should not load table warnings with request on error'));
    component.filterState.setValues(SAMPLE_FILTER_VALUES);
    component.tableState.setPageInfo(SAMPLE_PAGE_SORT_INFO.pageInfo);
    component.tableState.setSortInfo(SAMPLE_PAGE_SORT_INFO.sortInfo);

    // When
    component['loadTableWarnings']();

    // Then
    expect(spyWarningService).toHaveBeenCalled();
    expect(component['uuidParamsQueue']).toHaveSize(0);
    done();
  });

  it('should load table warnings with asynchronous request in a row', async () => {
    // Given
    const numberRequestInit = 1;
    const spyWarningService = spyOn<any>(component['warningAdminTableFacade'], 'loadFilteredPage$')
      .and.returnValue(of(SAMPLE_WARNING_TABLE_PAGE).pipe(delay(500)));
    component.filterState.setValues(SAMPLE_FILTER_VALUES);
    component.tableState.setPageInfo(SAMPLE_PAGE_SORT_INFO.pageInfo);
    component.tableState.setSortInfo(SAMPLE_PAGE_SORT_INFO.sortInfo);

    // When
    for (let i = 0; i < 3; i++) {
      component['loadTableWarnings']();
    }

    // Then
    await fixture.whenStable().then(res => {
      expect(spyWarningService).toHaveBeenCalledTimes(1 + numberRequestInit);
    });
  });

  it('should load table warnings with different asynchronous request in a row', async () => {
    // Given
    const sampleTest = [1, 2, 3]
    const spyWarningService = spyOn<any>(component['warningAdminTableFacade'], 'loadFilteredPage$')
      .and.returnValue(of(SAMPLE_WARNING_TABLE_PAGE).pipe(delay(500)));
    component.filterState.setValues(SAMPLE_FILTER_VALUES);
    component.tableState.setPageInfo(SAMPLE_PAGE_SORT_INFO.pageInfo);
    component.tableState.setSortInfo(SAMPLE_PAGE_SORT_INFO.sortInfo);

    // When
    sampleTest.forEach(sample => {
      component.tableState.setPageInfo({ page: sample });
      component['loadTableWarnings']();
    });

    // Then
    await fixture.whenStable().then(res => {
      expect(spyWarningService).toHaveBeenCalledTimes(sampleTest.length + 1);
    });
  });

  it('should display today in publication date column of table AN', done => {
    // Given
    const testCases = [
      {
        date: new Date().toISOString().split('T')[0], // Today's date
        expected: 0,
        call: 1
      },
      {
        date: (() => {
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - 1); // 1 days in the past
          return pastDate.toISOString().split('T')[0];
        })(),
        expected: -1,
        call: 2
      },
      {
        date: (() => {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 1); // 1 days in the future
          return futureDate.toISOString().split('T')[0];
        })(),
        expected: 1,
        call: 3
      }
    ];
    const spyDaysBetweenDateAndToday = spyOn(component, 'daysBetweenDateAndToday').and.callThrough();

    // When
    testCases.forEach(testCase => {
      const resultDifference = component.daysBetweenDateAndToday(testCase.date);

    // Then
      expect(spyDaysBetweenDateAndToday).toHaveBeenCalledTimes(testCase.call);
      expect(spyDaysBetweenDateAndToday).toHaveBeenCalledWith(testCase.date);
      expect(resultDifference).toBe(testCase.expected);
    });
    done();
  });
})
