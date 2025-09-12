import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { FormatTypeGeneralPipe } from './format-type-general.pipe';

describe('formatTypeGeneral', () => {
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
    pipe = new FormatTypeGeneralPipe(translateServiceSpy);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format type general', () => {
    // Given
    const spyOnTranslateServiceInstant = spyOn(translateServiceSpy, 'instant').and.returnValue('dangers à la dérive');

    // When
    const translatedStatus = pipe.transform('DRIFTING_HAZARDS');

    // Then
    expect(spyOnTranslateServiceInstant).toHaveBeenCalled();
    expect(translatedStatus).toEqual('dangers à la dérive');
  });

  it('should not format type general', () => {
    // Given
    const spyOnTranslateServiceInstant = spyOn(translateServiceSpy, 'instant');

    // When
    const translatedStatus = pipe.transform('CONTAINER_ADRIFT');

    // Then
    expect(spyOnTranslateServiceInstant).toHaveBeenCalledTimes(0);
    expect(translatedStatus).toEqual('');
  });
});

