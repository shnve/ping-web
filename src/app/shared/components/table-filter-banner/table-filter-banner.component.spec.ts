import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent, MockProvider } from 'ng-mocks';
import { OrderByPipe } from 'ngx-pipes';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Observable, Subject } from 'rxjs';
import { TableFilterValues, defaultValuesTableFilter } from '../../../models/warning-filters.model';
import { ModelItemFilterState } from '../../../states/warning-filter.state';
import { SelectButtonComponent } from '../select-button/select-button.component';
import { TableFilterBannerComponent } from './table-filter-banner.component';

describe('TableFilterBannerComponent', () => {
  let component: TableFilterBannerComponent;
  let fixture: ComponentFixture<TableFilterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TableFilterBannerComponent,
        MockComponent(SelectButtonComponent),
        OrderByPipe
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
        OverlayPanelModule,
        ChipModule,
        SelectButtonModule,
        ButtonModule,
        DropdownModule
      ],
      providers: [
        OrderByPipe,
        MockProvider(ModelItemFilterState, {
          getValues$(): Observable<TableFilterValues> {
            return (new Subject()).asObservable();
          },
          getDefaultValues(): TableFilterValues {
            return defaultValuesTableFilter;
          }
        })
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableFilterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

 
  it('should remove "period" from filter when "period" chip is removed', () => {
    const filterState = TestBed.inject(ModelItemFilterState);
    const spySetValues = spyOn(filterState, 'setValues').and.callThrough();
    component.filterState = filterState;
    component.filterValues = {
      period: {
        startDate: new Date(), endDate: new Date()
      }
    };
    component.removeQuickFilterChip('period');
    expect(spySetValues).toHaveBeenCalled();
    expect(component.filterValues).toEqual({
      period: {
        startDate: null,
        endDate: null
      }
    });
  });

  it('should remove "publishDate" from filter when "publishDate" chip is removed', () => {
    const filterState = TestBed.inject(ModelItemFilterState);
    const spySetValues = spyOn(filterState, 'setValues').and.callThrough();
    component.filterState = filterState;
    component.filterValues = {
      publishDate: new Date(),
      period: {
        startDate: null,
        endDate: null
      }
    };
    component.removeQuickFilterChip('publishDate');
    expect(spySetValues).toHaveBeenCalled();
    expect(component.filterValues).toEqual({
      publishDate: null,
      period: {
        startDate: null,
        endDate: null
      }
    });
  });

  it('should remove "subAreaIds" from filter when "subAreaIds" chip is removed', () => {
    const filterState = TestBed.inject(ModelItemFilterState);
    const spySetValues = spyOn(filterState, 'setValues').and.callThrough();
    component.filterState = filterState;
    component.filterValues = {
      subAreaIds: [ 'id01', 'id02' ]
    };
    component.removeQuickFilterChip('subAreaIds');
    expect(spySetValues).toHaveBeenCalled();
    expect(component.filterValues).toEqual({
      subAreaIds: []
    });
  });

  it('should remove "categories" from filter when "categories" chip is removed', () => {
    const filterState = TestBed.inject(ModelItemFilterState);
    const spySetValues = spyOn(filterState, 'setValues').and.callThrough();
    component.filterState = filterState;
    component.filterValues = {
      categories: [ 'cat01', 'cat02' ]
    };
    component.removeQuickFilterChip('categories');
    expect(spySetValues).toHaveBeenCalled();
    expect(component.filterValues).toEqual({
      categories: []
    });
  });
});
