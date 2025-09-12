import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subject } from 'rxjs';
import { defaultValuesMapFilter, MapFilterValues } from '../../../models/warning-filters.model';
import { GlobalWarningType } from '../../../models/warning.model';
import { ModelItemFilterState } from '../../../states/warning-filter.state';
import { MapFilterBannerComponent } from './map-filter-banner.component';

class MockWarningFilterState {
  public getValues$() {
    return (new Subject()).asObservable();
  }
  public setValues(v: any) { };
  public getDefaultValues() {
    return defaultValuesMapFilter;
  }
}

class ExtendsMapFilterBannerComponent extends MapFilterBannerComponent {
  public generateFilterChipsText(filterValues: MapFilterValues): void {
    super.generateFilterChipsText(filterValues);
  }

  public transformDatePeriodeToChip({ startDate, endDate }: { startDate?: Date; endDate?: Date }): void {
    super.transformDatePeriodeToChip({ startDate, endDate });
  }
}

describe('MapFilterBannerComponent', () => {
  let component: ExtendsMapFilterBannerComponent;
  let fixture: ComponentFixture<ExtendsMapFilterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ExtendsMapFilterBannerComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
        OverlayPanelModule,
        ChipModule,
        CheckboxModule,
        SelectButtonModule,
        ButtonModule
      ],
      providers: [
        { provide: ModelItemFilterState, useClass: MockWarningFilterState }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendsMapFilterBannerComponent);
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

  it('should update options "onWarningTypeOptionClick" on click on selected option', fakeAsync(() => {
    const filterState = TestBed.inject(ModelItemFilterState);
    const spySetValues = spyOn(filterState, 'setValues').and.callThrough();
    const clickedOptionValue = { code: GlobalWarningType.NOTICE, text: 'notice' };
    fixture.detectChanges();
    component.selectedWarningType = [];
    component.selectedWarningType.push(clickedOptionValue);
    component.filterState = filterState;
    component.onWarningTypeOptionClick({ checked: [clickedOptionValue] });
    expect(spySetValues).toHaveBeenCalled();
    expect(component.filterValues.displayTypes).toEqual([GlobalWarningType.NOTICE]);
    // Must be null only after next event loop step
    expect(component.selectedWarningType).not.toBe(null);
    expect(component.selectedWarningType).toEqual([clickedOptionValue]);
  }));

  it('should update filter value when filter changed', fakeAsync(() => {
    // Given
    const spyGenerateFilterChipsText = spyOn(component, 'generateFilterChipsText').and.stub();
    component.filterValues = {};
    component.warningTypeOptions = [{ code: GlobalWarningType.WARNING, text: 'warning' }];
    const nwFilter: MapFilterValues = {
      publishDate: new Date(2021),
      displayTypes: [GlobalWarningType.WARNING],
      disableFilter: false
    };

    const spyCountFilters = spyOn(component, 'countFilters').and.callThrough();

    // When
    component.filterChanged(nwFilter);
    tick();

    // Expect
    expect(spyCountFilters).toHaveBeenCalled();
    expect(component.filterValues).toEqual(nwFilter);
    expect(component.filterValues).not.toBe(nwFilter);
    expect(component.selectedWarningType[0]).toBe(component.warningTypeOptions[0]);
    expect(spyGenerateFilterChipsText).toHaveBeenCalled();
  }));

  it('should update create chips', done => {
    // When
    component.generateFilterChipsText({
      publishDate: new Date(2021, 0, 21),
      period: {
        startDate: new Date(2021, 0, 1),
        endDate: new Date(2022, 0, 1),
      }
    });
    const chips = component.quickFilterAccessChips;

    // Expect
    expect(component.quickFilterAccessChips.length).toEqual(2);
    expect(chips[1]).toEqual({
      key: 'publishDate',
      translateKey: 'filter.filter-bar.chip.publish-date',
      translateParams: { date: '21/01/21' }
    });
    done();
  });

  it('should remove "period" from filter when "period" chip is removed', done => {
    // Given
    const filterState = TestBed.inject(ModelItemFilterState);
    const spySetValues = spyOn(filterState, 'setValues').and.callThrough();
    component.filterState = filterState;
    component.filterValues = {
      period: {
        startDate: new Date(), endDate: new Date()
      },
      displayTypes: [GlobalWarningType.NOTICE]
    };

    // When
    component.removeQuickFilterChip('period');

    // Expect
    expect(spySetValues).toHaveBeenCalled();
    expect(component.filterValues).toEqual({
      period: {
        startDate: null,
        endDate: null
      },
      displayTypes: [GlobalWarningType.NOTICE]
    });
    done();
  });

  it('should remove "publishDate" from filter when "publishDate" chip is removed', done => {
    // Given
    const filterState = TestBed.inject(ModelItemFilterState);
    const spySetValues = spyOn(filterState, 'setValues').and.callThrough();
    component.filterState = filterState;
    const period = {
      startDate: new Date(), endDate: new Date()
    };
    component.filterValues = {
      period,
      publishDate: new Date(),
      displayTypes: [GlobalWarningType.NOTICE]
    };

    // When
    component.removeQuickFilterChip('publishDate');

    // Expect
    expect(spySetValues).toHaveBeenCalled();
    expect(component.filterValues).toEqual({
      period,
      publishDate: null,
      displayTypes: [GlobalWarningType.NOTICE]
    });
    done();
  });

  it('should transform period to chip', done => {
    // Given
    const period = {
      startDate: new Date(2021, 3, 6),
      endDate: new Date(2022, 3, 7)
    };
    component.quickFilterAccessChips = [];

    // When
    component.transformDatePeriodeToChip(period);

    // Expect
    expect(component.quickFilterAccessChips[0]).toEqual({
      key: 'period',
      translateKey: 'filter.filter-bar.chip.period',
      translateParams: { period: '06/04/21 - 07/04/22' }
    });
    done();
  });
});
