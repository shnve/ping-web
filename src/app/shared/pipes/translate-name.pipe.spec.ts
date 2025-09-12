import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { TranslateNamePipe } from './translate-name.pipe';

describe('TranslateNamePipe', () => {
  let translateServiceSpy: TranslateService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TranslateService)
      ]
    });

    translateServiceSpy = TestBed.inject(TranslateService);
  });

  it('create an instance', () => {
    const pipe = new TranslateNamePipe(translateServiceSpy);
    expect(pipe).toBeTruthy();
  });

  it('should use name if currentLang is fr', () => {
    const pipe = new TranslateNamePipe(translateServiceSpy);
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('fr');

    const result = pipe.transform({ 'name': 'test fr', 'internationalName': 'test en' });
    expect(result).toBe('test fr')
  });

  it('should use internationalName if currentLang is en', () => {
    const pipe = new TranslateNamePipe(translateServiceSpy);
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('en');

    const result = pipe.transform({ 'name': 'test fr', 'internationalName': 'test en' });
    expect(result).toBe('test en')
  });

  it('should use name if currentLang is en and internationalName is missing', () => {
    const pipe = new TranslateNamePipe(translateServiceSpy);
    spyOnProperty(translateServiceSpy, 'currentLang', 'get').and.returnValue('en');

    const result = pipe.transform({ 'name': 'test fr' });
    expect(result).toBe('test fr')
  });
});
