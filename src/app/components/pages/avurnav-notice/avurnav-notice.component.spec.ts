import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaticSection } from '@app/static-section/models/static-section.model';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { WarningModalComponent } from '@app/shared/components/warning-modal/warning-modal.component';
import { PageInfo } from '@app/shared/models/paginated-table-view.model';
import { GeometryType } from '@app/sig/utils/geometry';
import { DisclaimerService } from '@app/states/disclaimer.service';
import { StaticSectionApi } from '@app/static-section/api/static-section.api';
import { TranslateModule } from '@ngx-translate/core';
import { ChipValue } from '@shared/components/filter-banner/filter-banner.component';
import { MockComponent, MockProvider } from 'ng-mocks';
import { boundingExtent } from 'ol/extent';
import { MessagesModule } from 'primeng/messages';
import { Observable, of } from 'rxjs';
import { WarningApi } from '../../../api/warning.api';
import { WarningFactory } from '../../../core/warning/warning.factory';
import { AreasFacade } from '../../../facades/areas.facade';
import { MapWarningsFacade } from '../../../facades/map-warnings.facade';
import { SeriesFacade } from '../../../facades/series.facade';
import { WarningTableFacade } from '../../../facades/warnings-table.facade';
import Area from '../../../models/area.model';
import { Serie, SerieType } from '../../../models/serie.model';
import { TableFilterValues } from '../../../models/warning-filters.model';
import { GlobalWarningType, JsonWarning, MapWarning, TableWarning } from '../../../models/warning.model';
import { SelectButtonComponent } from '../../../shared/components/select-button/select-button.component';
import { TableFilterBannerComponent } from '../../../shared/components/table-filter-banner/table-filter-banner.component';
import { WarningTableComponent } from '../../../shared/components/warning-table/warning-table.component';
import { MapComponent } from '../../../sig/components/map/map.component';
import { TableState } from '../../../states/table.state';
import { ModelItemFilterState } from '../../../states/warning-filter.state';
import { WarningsState } from '../../../states/warnings.state';
import { MapFilterBannerComponent } from '../../shared/map-filter-banner/map-filter-banner.component';
import { AvurnavNoticeComponent, VisualizationMode } from './avurnav-notice.component';

class ExtendsAvurnavNoticeComponent extends AvurnavNoticeComponent {

  public transformDatePeriodeToChip({ startDate, endDate }: { startDate?: Date; endDate?: Date }): ChipValue {
    return super.transformDatePeriodeToChip({ startDate, endDate });
  }
}
describe('AvurnavNoticeComponent', () => {
  let component: ExtendsAvurnavNoticeComponent;
  let fixture: ComponentFixture<ExtendsAvurnavNoticeComponent>;

  beforeEach(async () => {
    spyOn(ModelItemFilterState.prototype, 'initFilter').and.stub();
    spyOn(ModelItemFilterState.prototype, 'getValues$').and.callFake(() => {
      return new Observable();
    });
    spyOn(DisclaimerService.prototype, 'showDisplayMapDisclaimerForArea').and.callFake(() => {
      return true;
    });

    TestBed.configureTestingModule({
    declarations: [
        ExtendsAvurnavNoticeComponent,
        MockComponent(MapComponent),
        MockComponent(MapFilterBannerComponent),
        MockComponent(SelectButtonComponent),
        MockComponent(WarningModalComponent),
        MockComponent(WarningTableComponent),
        MockComponent(TableFilterBannerComponent)
    ],
    imports: [FormsModule,
        MessagesModule,
        TranslateModule.forRoot()],
    providers: [
        PermissionsProvider,
        MockProvider(WarningApi),
        MockProvider(WarningTableFacade),
        MockProvider(WarningsState),
        MockProvider(WarningFactory),
        MockProvider(StaticSectionApi, {
          findOneByKey$(key: string): Observable<StaticSection> {
            return of({
              id: '1',
              key: 'key',
              location: 'location',
              path: 'path',
              name: 'name',
              content: 'warning disclaimer content',
              internationalContent: 'warning disclaimer internationalContent'
            });
          }
        }),
        MockProvider(MapWarningsFacade, {
            getFiltredMapWarnings$(): Observable<MapWarning[]> {
                return new Observable<MapWarning[]>();
            },
            getWarningById$(warningId: string): Observable<JsonWarning> {
                return new Observable<JsonWarning>();
            }
        }),
        MockProvider(TableState, {
            pageInfo$: new Observable<any>()
        }),
        MockProvider(ModelItemFilterState, {
            getValues$(): Observable<any> {
                return new Observable();
            }
        }),
        MockProvider(SeriesFacade),
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: { paramMap: convertToParamMap({ warningId: '6cac9acb-927e-4394-b523-edfe754f335c' }) }
            },
        },
        MockProvider(AreasFacade, {
            getSelectedArea$(): Observable<Area> {
                return new Observable<Area>();
            }
        }),
        MockProvider(TableState),
        UntypedFormBuilder,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendsAvurnavNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    expect(component.visualisationMode).toEqual(VisualizationMode.MAP);
    done();
  });

  it('should load 2 MapWarnings without error', () => {
    // Given
    const warnings: MapWarning[] = [{
      id: '1',
      geometries: [],
      affectedAreas: [],
      globalWarningType: GlobalWarningType.WARNING,
      nameOfSeries: 'serie1',
      warningNumber: 1000,
      warningTypeDetails: '',
      year: 21
    }, {
      id: '2',
      geometries: [],
      affectedAreas: [],
      globalWarningType: GlobalWarningType.WARNING,
      nameOfSeries: 'serie2',
      warningNumber: 1001,
      warningTypeDetails: '',
      year: 21
    }];
    const filter = {
      globalWarningType: GlobalWarningType.WARNING,
      period: {
        startDate: null,
        endDate: null
      },
      publishDate: null
    };
    const mapWarningFacade = TestBed.inject(MapWarningsFacade);
    const spyLoadWarnings = spyOn(mapWarningFacade, 'getFiltredMapWarnings$').and
      .returnValues(of(warnings));

    // When
    component.loadMapWarnings(filter);

    // Expect
    component.mapWarnings$.subscribe(res => {
      expect(res).toEqual(warnings);
    }, err => {
      fail(err);
    });
    expect(spyLoadWarnings).toHaveBeenCalledWith(filter);
  });

  it('tableFilterChange - should notify set table on page 1 and loadTableWarnings', done => {
    // Given
    const tableState = fixture.componentRef.injector.get(TableState);
    const spySetPageInfo = spyOn(tableState, 'setPageInfo').and.callThrough();
    const spyLoadTableWarnings = spyOn(component, 'loadTableWarnings').and.stub();

    // When
    component.tableFilterChange();

    // Expect
    expect(spySetPageInfo).toHaveBeenCalledWith({ page: 0 });
    expect(spyLoadTableWarnings).toHaveBeenCalled();
    done();
  });

  it('tableChange - should change table page and load tableWarnings', done => {
    // Given
    const tableState = fixture.componentRef.injector.get(TableState);
    const spySetPageInfo = spyOn(tableState, 'setPageInfo').and.callThrough();
    const spyLoadTableWarnings = spyOn(component, 'loadTableWarnings').and.stub();

    // When
    component.tableChange({ page: 10, rows: 20 });

    // Expect
    expect(spySetPageInfo).toHaveBeenCalledWith({ page: 10, rows: 20 });
    expect(spyLoadTableWarnings).toHaveBeenCalled();
    done();
  });

  it('loadTableWarnings - should load 2 TableWarnings according to page, rows and filters', done => {
    // Given
    const warnings: TableWarning[] = [{
      id: '1',
      generalAreas: {},
      localities: {},
      nameOfSeries: 'serie1',
      warningNumber: 1000,
      year: 21,
      warningTypeDetails: '',
      warningHazardTypeGeneral: '',
      publicationTime: new Date()
    }, {
      id: '2',
      generalAreas: {},
      localities: {},
      nameOfSeries: 'serie2',
      warningNumber: 1001,
      year: 21,
      warningTypeDetails: '',
      warningHazardTypeGeneral: '',
      publicationTime: new Date()
    }];
    const filter: TableFilterValues = {
      serie: {
        id: '50',
        type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
        subAreas: [],
        name: 'Avurnav Brest',
        maritimeService: '1',
        ranges: [[1, 999]]
      },
      period: {
        startDate: null,
        endDate: null
      },
      publishDate: null
    };

    const pageInfo: PageInfo = {
      page: 1,
      rows: 20
    };

    // Get component instance of this service
    const tableWarningFacade = fixture.componentRef.injector.get(WarningTableFacade);

    const tableState = fixture.componentRef.injector.get(TableState);
    const spyLoadWarnings = spyOn(tableWarningFacade, 'loadFilteredPage$').and
      .returnValues(of({
        modelItems: warnings,
        totalElements: 22
      }));
    spyOn(component.tableFilterState, 'getValues').and.returnValue(filter);
    spyOn(tableState, 'getValues').and.returnValues({ pageInfo, sortInfo: null });

    // When
    component.loadTableWarnings();

    // Expect
    expect(spyLoadWarnings).toHaveBeenCalledWith(pageInfo, filter, false);
    expect(component.tableWarnings).toEqual(warnings);
    expect(component.totalWarnings).toEqual(22);
    done();
  });

  it('onSelectArea - should change in map and clear map and table filter', done => {
    // Given
    const series: Serie[] = [{
      id: '1',
      name: 'serie1',
      subAreas: [],
      type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
      maritimeService: '1',
      ranges: [[1, 999]]
    }];
    const seriesFacade = TestBed.inject(SeriesFacade);
    const spyFilterStateClearFilter = spyOn(ModelItemFilterState.prototype, 'clearFilter').and.stub();
    const spySerieGetSeriesByAreaId$ = spyOn(seriesFacade, 'getSeriesByAreaId$').and.returnValues(of(series));
    const polygonCoordinates = [
      [346297.74265686, 5303090.32621223],
      [333565.18675086, 5378766.20176415],
      [834379.05238708, 5449172.94943688],
      [1076297.61460119, 5408037.17485917],
      [1169669.69124523, 4701940.96638389],
      [409960.52218689, 4701940.96638389],
      [346297.74265686, 5303090.32621223]
    ];
    const extent = boundingExtent(polygonCoordinates);
    const area: Area = {
      id: '1',
      internationalName: 'Atlantic',
      name: 'Atlantique',
      information: '',
      localizedInformation: '',
      urn: 'urn1',
      country: 'France',
      geom: {
        type: GeometryType.MULTI_POLYGON,
        coordinates: [
          [
            polygonCoordinates
          ]
        ]
      }
    };

    // When
    component.onSelectArea(area);

    // Expect
    expect(spyFilterStateClearFilter).toHaveBeenCalledTimes(2);
    expect(component.selectedAreaExtent).toEqual(extent);
    expect(spySerieGetSeriesByAreaId$).toHaveBeenCalledWith(area.id);
    expect(component.series).toEqual(series);
    done();
  });

  it('onChangeTableView - should set isDetailedTable and loadTableWarnings', done => {
    // Given
    component.isDetailedTable = false;
    const spyLoadTableWarnings = spyOn(component, 'loadTableWarnings').and.stub();

    // When
    component.onChangeTableView(true);

    // Expect
    expect(component.isDetailedTable).toBeTruthy();
    expect(spyLoadTableWarnings).toHaveBeenCalled();
    done();
  });

  it('should create chip for "publishDate" and "period"', done => {
    const chipValues = component.generateTableFilterChipsText({
      serie: {
        id: '1',
        name: 'name',
        type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
        subAreas: [],
        maritimeService: '1',
        ranges: [[1, 999]]
      },
      subAreaIds: [],
      categories: ['NEW_ROUTEING_MEASURES'],
      publishDate: new Date(2021, 0, 21),
      period: {
        startDate: new Date(2021, 0, 1),
        endDate: new Date(2022, 0, 1),
      }
    });

    expect(chipValues.length).toEqual(4);
    expect(chipValues[3]).toEqual({
      key: 'publishDate',
      translateKey: 'filter.filter-bar.chip.publish-date',
      translateParams: { date: '21/01/21' }
    });
    done();
  });

  it('should transformDate period to chip text', done => {
    // When
    const chip = component.transformDatePeriodeToChip({
      startDate: new Date(2021, 11, 21),
      endDate: new Date(2021, 11, 22)
    });

    // Expect
    expect(chip.translateKey).toEqual('filter.filter-bar.chip.period');
    expect(chip.translateParams).toEqual({ period: '21/12/21 - 22/12/21' });
    done();
  });

  it('should put global disclaimer on fr', done => {
    // When
    component['translate'].currentLang = 'fr';
    component['showGlobalDisclaimerOnMap']();

    // Expect
    expect(component.mapDisclaimerContent).toEqual('warning disclaimer content');
    expect(component.currentMapDisclaimerId).toEqual('global');
    done();
  });

  it('should put global disclaimer on en', done => {
    // When
    component['translate'].currentLang = 'en';
    component['showGlobalDisclaimerOnMap']();

    // Expect
    expect(component.mapDisclaimerContent).toEqual('warning disclaimer internationalContent');
    expect(component.currentMapDisclaimerId).toEqual('global');
    done();
  });

  it('should put area disclaimer', done => {
    // Given
    const area: Area = {
      id: '1',
      internationalName: 'Atlantic',
      name: 'Atlantique',
      information: '',
      localizedInformation: '',
      urn: 'urn1',
      country: 'France',
      geom: {
        type: GeometryType.MULTI_POLYGON,
        coordinates: []
      },
      internationalDisclaimer: 'internationalDisclaimer',
      disclaimer: 'disclaimer'
    };

    // When
    component['updateMapDisclaimer'](area);

    // Expect
    expect(component.mapDisclaimerContent).toEqual('internationalDisclaimer');
    expect(component.currentMapDisclaimerId).toEqual('1');
    done();
  });

});
