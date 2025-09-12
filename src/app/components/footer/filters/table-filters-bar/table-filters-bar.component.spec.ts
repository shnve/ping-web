import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableFiltersBarComponent } from './table-filters-bar.component';
import {TranslateModule} from '@ngx-translate/core';
import {By} from '@angular/platform-browser';

describe('TableFiltersBarComponent', () => {
  let component: TableFiltersBarComponent;
  let fixture: ComponentFixture<TableFiltersBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableFiltersBarComponent ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableFiltersBarComponent);
    component = fixture.componentInstance;
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
    expect(component.isShowFilters).toBe(valueBefore);
  });
});
