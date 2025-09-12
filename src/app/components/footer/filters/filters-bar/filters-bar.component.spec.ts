import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersBarComponent } from './filters-bar.component';
import {TranslateModule} from '@ngx-translate/core';
import {By} from '@angular/platform-browser';
import { ModelItemFilterState } from '@app/states/warning-filter.state';
import { MapFilterValues } from '@app/models/warning-filters.model';

describe('FiltersBarComponent', () => {
  let component: FiltersBarComponent;
  let fixture: ComponentFixture<FiltersBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiltersBarComponent ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersBarComponent);
    component = fixture.componentInstance;
    component._filterState = new ModelItemFilterState<MapFilterValues>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle filter content', () => {
    const valueBefore = component.isShowFilters;
    const btnClose = fixture.debugElement.query(By.css('.p-overlaypanel-close'));
    btnClose.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(component.isShowFilters).toBe(!valueBefore);
  });
});
