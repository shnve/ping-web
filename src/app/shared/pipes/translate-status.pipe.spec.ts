import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { TranslateStatusPipe } from './translate-status.pipe';

describe('translateStatus', () => {
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
    pipe = new TranslateStatusPipe(translateServiceSpy);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should translate status', () => {
    // Given
    const spyOnTranslateServiceInstant = spyOn(translateServiceSpy, 'instant').and.returnValue('Publié');

    // When
    const translatedStatus = pipe.transform('enum.warning-status', 'published');

    // Then
    expect(spyOnTranslateServiceInstant).toHaveBeenCalled();
    expect(translatedStatus).toEqual('publié');
  });
});

