import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { UTC_TIMEZONE_ZERO } from '@app/shared/date-utils';
import { InputDateRangeComponent } from './input-date-range.component';


describe('InputDateRangeComponent', () => {
  let component: InputDateRangeComponent;
  let fixture: ComponentFixture<InputDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputDateRangeComponent],
      imports: [TranslateModule.forRoot()]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', done => {
    expect(component).toBeTruthy();
    done();
  });

  it('should set timezone on selection', done => {
    // Given
    component.dateRange.timezone = UTC_TIMEZONE_ZERO;
    const newTimezone = 'UTC+1';

    // When
    component['onSelectTimezone'](newTimezone);

    // Then
    expect(component.dateRange.timezone).toEqual(newTimezone);
    done();
  });

  it('should check date time range', done => {
    // Given
    component.dateRange = { dateStart: '01/01/2021', timeOfDayStart: '00:00:00', dateEnd: '31/12/2021', timeOfDayEnd: '23:59:59' };

    // When
    component.checkDateTimeRange();

    // Then
    expect(component.invalidDateTime).toEqual(false);
    done();
  });
});
