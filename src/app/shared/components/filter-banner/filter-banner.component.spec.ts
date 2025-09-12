import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableFilterValues } from '@app/models/warning-filters.model';
import { TranslateModule } from '@ngx-translate/core';

import { FilterBannerComponent, FILTER_VALUES_TOKEN } from './filter-banner.component';

describe('FilterBannerComponent', () => {
  let component: FilterBannerComponent<TableFilterValues>;
  let fixture: ComponentFixture<FilterBannerComponent<TableFilterValues>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterBannerComponent ],
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        {provide: FILTER_VALUES_TOKEN, useValue: {name: 'test'}},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
