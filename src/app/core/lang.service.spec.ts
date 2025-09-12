import {LangService} from './lang.service';
import {TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LangService', () => {
  let service: LangService;
  let translateServiceSpy: TranslateService;
  let localStorageGetItemSpy: jasmine.Spy<(key: string) => string | null>;
  let localStorageSetItemSpy: jasmine.Spy<(key: string, value: string) => void>;
  let navigatorLanguagePropSpy: jasmine.Spy;
  let translateServiceGetDefaultLangSpy: jasmine.Spy<() => string>;
  let savedLocalStorage: any;
  let savedNavigator: any;

  beforeEach(() => {
    savedLocalStorage = window.localStorage;
    savedNavigator = window.navigator;
    Object.defineProperty(window, 'localStorage', {value: {
      getItem() {},
      setItem() {}
    }});
    Object.defineProperty(window, 'navigator', {value: {
      get language() {return 'fr';}
    }});

    localStorageGetItemSpy = spyOn(window.localStorage, 'getItem');
    localStorageSetItemSpy = spyOn(window.localStorage, 'setItem');
    navigatorLanguagePropSpy = spyOnProperty(window.navigator, 'language');

    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [
        LangService,
        TranslateService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(LangService);
    translateServiceSpy = TestBed.inject(TranslateService);
    spyOn(translateServiceSpy, 'getLangs').and.returnValues(['en', 'fr']);
    translateServiceGetDefaultLangSpy =
      spyOn(translateServiceSpy, 'getDefaultLang').and.returnValues('fr');
  });

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {value: savedNavigator});
    Object.defineProperty(window, 'localStorage', {value: savedLocalStorage});
  });

  it('should return "fr" language from localstorage', () => {
    // Given
    localStorageGetItemSpy.and.callFake((key: string) => key === 'lang' ? 'fr-CA' : undefined);
    navigatorLanguagePropSpy.and.returnValues('en-UK');

    // When
    const lang = service.getUserPreferredLang();

    // Then
    expect(lang).toBe('fr');
    expect(localStorageGetItemSpy.calls.count()).toBe(1);
    expect(navigatorLanguagePropSpy.calls.any()).toBeFalse();
  });

  it('should return "en" language from navigator', () => {
    // Given
    localStorageGetItemSpy.and.returnValues(undefined);
    navigatorLanguagePropSpy.and.returnValues('en-UK');

    // When
    const lang = service.getUserPreferredLang();

    // Then
    expect(lang).toBe('en');
    expect(localStorageGetItemSpy.calls.count()).toBe(1);
    expect(navigatorLanguagePropSpy.calls.count()).toBe(1);
  });

  it('should return "fr" language from TranslateService.getDefaultLang', () => {
    // Given
    localStorageGetItemSpy.and.returnValues(undefined);
    navigatorLanguagePropSpy.and.returnValues('xx');

    // When
    const lang = service.getUserPreferredLang();

    // Then
    expect(lang).toBe('fr');
    expect(localStorageGetItemSpy.calls.count()).toBe(1);
    expect(navigatorLanguagePropSpy.calls.count()).toBe(1);
    expect(translateServiceGetDefaultLangSpy.calls.count()).toBe(1);
  });

  it('should set item lang "en" in localstorage', () => {
    // Given
    const storage = {};
    const translateServiceCurrentLangGetterSpy = spyOnProperty(translateServiceSpy, 'currentLang', 'get');
    localStorageSetItemSpy.and.callFake((key, value) => {
      storage[key] = value;
    });

    // When
    service.setUserPreferredLang('en');

    // Then
    expect(storage['lang']).toBe('en');
    expect(translateServiceCurrentLangGetterSpy.calls.any()).toBeFalse();
  })
});
