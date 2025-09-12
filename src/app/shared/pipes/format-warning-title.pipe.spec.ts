import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FormatWarningTitlePipe } from './format-warning-title.pipe';

describe('FormatWarningTitlePipe', () => {
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
    pipe = new FormatWarningTitlePipe(translateServiceSpy);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return localized title based on user preferred language', () => {
    // Given
    const warningData = {
      generalAreas: {
        fr: ['General Area FR 1', 'General Area FR 2'],
        en: ['General Area EN 1', 'General Area EN 2']
      },
      localities: {
        fr: ['Locality FR 1', 'Locality FR 2'],
        en: ['Locality EN 1', 'Locality EN 2']
      }
    }

    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');

    // When
    const text = pipe.transform(warningData);

    // Then
    expect(text).toEqual('General Area FR 1 - General Area FR 2 - Locality FR 1 - Locality FR 2');
  });

  it('should return english localized title if no user preferred language', () => {
    // Given
    const warningData = {
      generalAreas: {
        fr: ['General Area FR 1', 'General Area FR 2'],
        en: ['General Area EN 1', 'General Area EN 2']
      },
      localities: {
        fr: ['Locality FR 1', 'Locality FR 2'],
        en: ['Locality EN 1', 'Locality EN 2']
      }
    }

    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('es');

    // When
    const text = pipe.transform(warningData);

    // Then
    expect(text).toEqual('General Area EN 1 - General Area EN 2 - Locality EN 1 - Locality EN 2');
  });

  it('should return first localized title if no user preferred language and no english translation', () => {
    // Given
    const warningData = {
      generalAreas: {
        fr: ['General Area FR 1', 'General Area FR 2']
      },
      localities: {
        fr: ['Locality FR 1', 'Locality FR 2']
      }
    }

    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('es');

    // When
    const text = pipe.transform(warningData);

    // Then
    expect(text).toEqual('General Area FR 1 - General Area FR 2 - Locality FR 1 - Locality FR 2');
  });

  it('should return only general area localized title if no locality', () => {
    // Given
    const warningData = {
      generalAreas: {
        fr: ['General Area FR 1', 'General Area FR 2']
      },
      localities: {}
    }

    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');

    // When
    const text = pipe.transform(warningData);

    // Then
    expect(text).toEqual('General Area FR 1 - General Area FR 2');
  });
});
