import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapAdvancedFilterComponent } from './map-advanced-filter.component';
import {ReactiveFormsModule} from '@angular/forms';
import {ModelItemFilterState} from '../../../states/warning-filter.state';
import {TranslateModule} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {CalendarModule} from 'primeng/calendar';
import {MapFilterValues} from '../../../models/warning-filters.model';
import {Component} from '@angular/core';

class MockWarningFilterState {
  getValues$() {
    return new Subject();
  }
}

class MockFilterState {}


@Component({
  selector: 'test-filter-wrapper',
  template: '<app-map-advanced-filter [filterState]="mockFilterState"></app-map-advanced-filter>'
})
class TestFilterWrapper {
  mockFilterState = new MockFilterState as ModelItemFilterState<MapFilterValues>
}
describe('MapAdvancedFilterComponent', () => {
  let component: MapAdvancedFilterComponent;
  let fixture: ComponentFixture<MapAdvancedFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestFilterWrapper,
        MapAdvancedFilterComponent
      ],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        CalendarModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapAdvancedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
