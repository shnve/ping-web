import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableFiltersComponent } from './table-filters.component';
import {TranslateModule} from '@ngx-translate/core';
import {ModelItemFilterState} from '@app/states/warning-filter.state';
import {MockProvider} from 'ng-mocks';
import {Observable, Subject} from 'rxjs';
import { TableFilterValues} from '@app/models/warning-filters.model';
import {SerieType} from '@app/models/serie.model';

describe('TableFiltersComponent', () => {
  let component: TableFiltersComponent;
  let fixture: ComponentFixture<TableFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableFiltersComponent ],
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        MockProvider(ModelItemFilterState, {
          getValues$(): Observable<TableFilterValues> {
            return (new Subject()).asObservable();
          }
        })
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should count filters', () => {
    component.filterValues = {
      period: {
        startDate: new Date(2021, 3, 6),
        endDate: new Date(2022, 3, 7)
      },
      categories: ['cat01', 'cat02'],
      subAreaIds: ['id01', 'id02'],
      publishDate: new Date(2021, 3, 6)
    };
    component.countFilters();
    expect(component.nbFilters).toEqual(7);
  });

  it('should set values on filter state when select serie', () => {
    // Given
    const filterState = TestBed.inject(ModelItemFilterState);
    const spySetValues = spyOn(filterState, 'setValues').and.callThrough();
    const spyFilterChanged = spyOn(component, 'filterChanged').and.callThrough();

    component.filterState = filterState;

    component.serieSelected = {
      id: '1',
      name: 'name',
      type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
      subAreas: [],
      maritimeService: '1',
      ranges: [[1, 999]]
    };

    component.series = [
      {
        id: '1',
        name: 'name',
        type: SerieType.COASTAL_NAVIGATIONAL_WARNING,
        subAreas: [],
        maritimeService: '1',
        ranges: [[1, 999]]
      }
    ];

    // When
    component.selectSerie();
    component.filterChanged({
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

    // Expect
    expect(spySetValues).toHaveBeenCalled();
    expect(spyFilterChanged).toHaveBeenCalled();
  });

});
