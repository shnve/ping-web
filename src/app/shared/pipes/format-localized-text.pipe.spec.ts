import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FormatLocalizedTextPipe } from './format-localized-text.pipe';

describe('FormatLocalizedTextPipe', () => {
  let pipe;
  let translateServiceSpy: TranslateService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService)
      ]
    });

    translateServiceSpy = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    pipe = new FormatLocalizedTextPipe(translateServiceSpy);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return localized text based on user preferred language', () => {
    // Given
    const localizedText = {
      fr: 'Texte FR',
      en: 'Text EN'
    }

    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');

    // When
    const text = pipe.transform(localizedText);

    // Then
    expect(text).toEqual('Texte FR');
  });

  it('should return first localized text is no translation for user preferred language', () => {
    // Given
    const localizedText = {
      en: 'Text EN'
    }

    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');

    // When
    const text = pipe.transform(localizedText);

    // Then
    expect(text).toEqual('Text EN');
  });
});
