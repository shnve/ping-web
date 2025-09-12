import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalWarningType } from '@app/models/warning.model';
import { TranslateModule } from '@ngx-translate/core';
import { MapFiltersComponent } from './map-filters.component';

describe('MapFiltersComponent', () => {
  let component: MapFiltersComponent;
  let fixture: ComponentFixture<MapFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapFiltersComponent],
      imports: [
        TranslateModule.forRoot()
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapFiltersComponent);
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

  it('should count filters', done => {
    component.filterValues = {
      period: {
        startDate: new Date(2021, 3, 6),
        endDate: new Date(2022, 3, 7)
      },
      displayTypes: [GlobalWarningType.NOTICE, GlobalWarningType.WARNING]
    };
    component.countFilters();
    expect(component.nbFilters).toEqual(4);
    done();
  });
});
