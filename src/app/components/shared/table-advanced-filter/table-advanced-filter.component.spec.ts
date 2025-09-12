import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PermissionsProvider } from '@app/privileges/permissions-provider';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { OrderByPipe } from 'ngx-pipes';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable, Subscription } from 'rxjs';
import { TableAdvancedFilterValues, TableFilterValues } from '../../../models/warning-filters.model';
import { ModelItemFilterState } from '../../../states/warning-filter.state';
import { TableAdvancedFilterComponent } from './table-advanced-filter.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class ExtendsFilterTable extends TableAdvancedFilterComponent {
  previousFormValues: TableAdvancedFilterValues;

  public static checkIfValuesChange(previousValues: TableAdvancedFilterValues, values: TableAdvancedFilterValues) {
    return TableAdvancedFilterComponent.checkIfValuesChange(previousValues, values);
  }

  public setQuietlyFilterValues(values: TableAdvancedFilterValues) {
    super.setQuietlyFilterValues(values);
  }

  public subscribeToFormValueChanges(): Subscription {
    return super.subscribeToFormValueChanges();
  }
}
describe('TableAdvancedFilterComponent', () => {
  let component: ExtendsFilterTable;
  let fixture: ComponentFixture<ExtendsFilterTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        ExtendsFilterTable,
        OrderByPipe
    ],
    imports: [ReactiveFormsModule,
        TranslateModule.forRoot(),
        CalendarModule,
        MultiSelectModule],
    providers: [
        PermissionsProvider,
        OrderByPipe,
        MockProvider(ModelItemFilterState, {
            getValues$(): Observable<TableFilterValues> {
                return new Observable();
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendsFilterTable);
    component = fixture.componentInstance;
    component.filterState = TestBed.inject(ModelItemFilterState);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('checkIfValuesChange - Should detect values changes', done => {
    // Given
    const prev: TableAdvancedFilterValues = {
      publishDate: null,
      period: {
        startDate: new Date(2021, 0, 1),
        endDate: null
      }
    };

    const current: TableAdvancedFilterValues = {
      publishDate: null,
      period: {
        startDate: new Date(2021, 0, 1),
        endDate: new Date(2022, 0, 1)
      }
    };

    // When
    const res = ExtendsFilterTable.checkIfValuesChange(prev, current);

    // Expect
    expect(res).toEqual(true);
    done();
  });


  it('should check notifiyStateChange notify right values', done => {
    // Given
    const spyGetValues = spyOn(component._filterState, 'getValues').and.returnValues({
      period: {
        startDate: null,
        endDate: null
      },
      publishDate: new Date(2021, 0, 1)
    });
    const spySetValues = spyOn(component._filterState, 'setValues').and.callThrough();

    const advancedFilterValues: TableAdvancedFilterValues = {
      period: {
        startDate: new Date(2022, 0, 1),
        endDate: null
      },
      publishDate: new Date(2021, 0, 1)
    };

    // When
    component.notifyStateChange(advancedFilterValues);

    // Expect
    expect(spyGetValues).toHaveBeenCalled();
    const callArg = spySetValues.calls.mostRecent().args[0];
    expect(callArg.period.startDate).toEqual(new Date(2022, 0, 1));
    expect(callArg.publishDate).toEqual(new Date(2021, 0, 1));
    done();
  });

  it('onFilterStateChange - should pick advanced values, merge it with defaults and update form', done => {
    // Given
    const spySetQuietlyFilterValues = spyOn(component, 'setQuietlyFilterValues').and.stub();
    const values: TableFilterValues = {
      subAreaIds: [],
      categories: ['DRIFTING_HAZARD'],
      concernedMaritimeEntityIds: ['1'],
      entityCoverIds: ['1'],
      publishDate: new Date(2021, 0, 1),
      period: {
        startDate: null,
        endDate: null
      },
      reservationNumberAndYear: null,
    };
    component.filterForm.setValue({
      subAreaIds: [],
      categories: ['DRIFTING_HAZARD'],
      concernedMaritimeEntityIds: ['1'],
      entityCoverIds: ['1'],
      publishDate: null,
      period: {
        startDate: null,
        endDate: null
      },
      reservationNumberAndYear: null,
    }, { emitEvent: false });

    // When
    component.onFilterStateChange(values);

    // Expect
    expect(spySetQuietlyFilterValues).toHaveBeenCalled();
    const callArg = spySetQuietlyFilterValues.calls.mostRecent().args[0];
    expect(callArg.publishDate).toEqual(new Date(2021, 0, 1));
    expect(callArg.period.endDate).toBeNull();
    done();
  });

  it('subscribeToFormValueChanges - subscribe on form changes and notify when publishDate values change', done => {
    // Given
    component.previousFormValues = {
      subAreaIds: [],
      categories: [],
      period: {
        startDate: null,
        endDate: null
      },
      publishDate: null,
      reservationNumberAndYear: null,
    };
    const changeFormValues = {
      subAreaIds: [],
      categories: [],
      concernedMaritimeEntityIds: ['1'],
      entityCoverIds: ['1'],
      period: {
        startDate: null,
        endDate: null
      },
      publishDate: new Date(2021, 0, 1),
      reservationNumberAndYear: null,
    };
    const spyNotifyStateChange = spyOn(component, 'notifyStateChange').and.stub();

    // When
    const subcription = component.subscribeToFormValueChanges();
    component.filterForm.setValue(changeFormValues);
    fixture.detectChanges();

    // Expect
    expect(subcription).toBeTruthy();
    expect(spyNotifyStateChange).toHaveBeenCalledOnceWith(changeFormValues);
    expect(component.previousFormValues).toEqual(changeFormValues);
    done();
  });

  it('subscribeToFormValueChanges - subscribe on form changes and notify when categories selected change', done => {
    // Given
    component.previousFormValues = {
      subAreaIds: [],
      categories: ['PIPE_OR_CABLE_LAYING_OPERATIONS'],
      period: {
        startDate: null,
        endDate: null
      },
      publishDate: null,
      reservationNumberAndYear: null,
    };
    const changeFormValues = {
      subAreaIds: [],
      categories: ['NEW_ROUTEING_MEASURES', 'PIPE_OR_CABLE_LAYING_OPERATIONS'],
      concernedMaritimeEntityIds: ['1'],
      entityCoverIds: ['1'],
      period: {
        startDate: null,
        endDate: null
      },
      publishDate: null,
      reservationNumberAndYear: null,
    };
    const spyNotifyStateChange = spyOn(component, 'notifyStateChange').and.stub();

    // When
    const subcription = component.subscribeToFormValueChanges();
    component.filterForm.setValue(changeFormValues);
    fixture.detectChanges();

    // Expect
    expect(subcription).toBeTruthy();
    expect(spyNotifyStateChange).toHaveBeenCalledOnceWith(changeFormValues);
    expect(component.previousFormValues).toEqual(changeFormValues);
    done();
  });

  it('should set form filter values without emit event', done => {
    // Given
    const values: TableAdvancedFilterValues = {
      subAreaIds: ['1', '2', '3'],
      categories: ['NEWLY_DISCOVERED_DANGERS'],
      concernedMaritimeEntityIds: ['1'],
      entityCoverIds: ['1'],
      publishDate: new Date(2021, 0, 11),
      period: {
        startDate: null,
        endDate: new Date(2022, 0, 1)
      },
      reservationNumberAndYear: null,
    };
    component.previousFormValues = {
      subAreaIds: [],
      categories: [],
      concernedMaritimeEntityIds: [],
      entityCoverIds: [],
      publishDate: null,
      period: {
        startDate: null,
        endDate: null
      },
      reservationNumberAndYear: null,
    };
    component.filterForm.setValue(component.previousFormValues, { emitEvent: false });

    // When
    component.setQuietlyFilterValues(values);
    fixture.detectChanges();

    // Expect
    expect(component.filterForm.value).toEqual(values);
    expect(component.previousFormValues).toEqual(values);
    expect(component.previousFormValues).not.toBe(values);
    done();
  });
});
