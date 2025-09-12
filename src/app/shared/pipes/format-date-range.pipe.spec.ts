import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FormatDateRangePipe } from './format-date-range.pipe';

describe('FormatDateRangePipe', () => {
  let pipe;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService, {
          instant(key: string): string {
            switch (key) {
              case 'detail.range-from-date': return 'From Date';
              case 'detail.range-from-to-time': return 'From To Time';
              case 'detail.range-to-date': return 'To Date';
            }
          }
        })
      ]
    });
  });

  beforeEach(() => {
    const translateService: TranslateService = TestBed.inject(TranslateService);
    translateService.currentLang = 'en';

    pipe = new FormatDateRangePipe(translateService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('create an instance', done => {
    expect(pipe).toBeTruthy();
    done();
  });

  it('should return formatted date range with time', done => {
    // Given
    const range = { dateStart: '2021-01-01', timeOfDayStart: '00:00:00', dateEnd: '2021-12-31', timeOfDayEnd: '23:59:59', timezone: 'UTC+1' };

    // When
    const text = pipe.transform(range);

    // Then
    expect(text).toEqual('From Date 2021/01/01 00:00:00 UTC +01:00 To Date 2021/12/31 23:59:59 UTC +01:00');
    done();
  });

  it('should return formatted date range without time', done => {
    // Given
    const range = { dateStart: '2021-01-01', timeOfDayStart: null, dateEnd: '2021-12-31', timeOfDayEnd: null, timezone: 'UTC' };

    // When
    const text = pipe.transform(range, 'UTC');

    // Then
    expect(text).toEqual('From Date 2021/01/01 To Date 2021/12/31');
    done();
  });
});
