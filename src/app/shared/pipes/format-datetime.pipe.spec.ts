import { FormatDatetimePipe } from './format-datetime.pipe';
import { TranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { LOCALE_ID } from '@angular/core';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';

describe('FormatDatetimePipe', () => {
  let pipe;

  beforeEach(async () => {
    registerLocaleData(localeFr);
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService, {
          get currentLang(): string {
            return 'fr';
          }
        }),
        { provide: LOCALE_ID, useValue: 'fr' }
      ]
    });
  });

  beforeEach(() => {
    const translateService: TranslateService = TestBed.inject(TranslateService);
    pipe = new FormatDatetimePipe(translateService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return formatted datetime', () => {
    // Given
    const currDateTime = '2021-01-01T07:00:00Z';

    // When
    const text = pipe.transform(currDateTime, 'UTC+1');

    // Then
    expect(text).toEqual('01/01/2021 07:00 UTC +01:00');
  });
});
