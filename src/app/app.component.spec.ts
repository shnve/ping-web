import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { PrimeNGConfig } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToasterComponent } from './components/global/toaster/toaster.component';
import { HeaderComponent } from './components/header/header.component';
import { LangService } from './core/lang.service';
import Spy = jasmine.Spy;

class MockTranslateService {
  get(s: string) {}
  use(s: string) {}
  get onLangChange() {
    return new Observable();
  }
}
class MockLangService {
  getUserPreferredLang() {}
  setUserPreferredLang(s: string) {}
}
class MockPrimeNGConfig {
  public ripple: boolean;
  setTranslation(s: string) {}
}


describe('AppComponent', () => {
  let spyTranslateUse: Spy<any>;
  let spyTranslateGet: Spy<any>;
  let spyTranslateOnLangChange: Spy<any>;
  let spyLangGetUserPreferredLang: Spy<any>;
  let spyLangSetUserPreferredLang: Spy<any>;
  let spyPrimeSetTranslation: Spy<any>;
  let mockTranslate: TranslateService;
  let mockLang: LangService;
  let mockPrime: PrimeNGConfig;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        AppComponent,
        MockComponent(HeaderComponent),
        MockComponent(ToasterComponent),
        MockComponent(FooterComponent)
      ],
      providers: [
        {provide: TranslateService, useClass: MockTranslateService},
        {provide: LangService, useClass: MockLangService},
        {provide: PrimeNGConfig, useClass: MockPrimeNGConfig}
      ]
    }).compileComponents();

    mockTranslate = TestBed.inject(TranslateService);
    mockLang = TestBed.inject(LangService);
    mockPrime = TestBed.inject(PrimeNGConfig);
    spyTranslateGet = spyOn(mockTranslate, 'get');
    spyTranslateUse = spyOn(mockTranslate, 'use');
    spyTranslateOnLangChange = spyOnProperty(mockTranslate, 'onLangChange');
    spyLangGetUserPreferredLang = spyOn(mockLang, 'getUserPreferredLang');
    spyLangSetUserPreferredLang = spyOn(mockLang, 'setUserPreferredLang');
    spyPrimeSetTranslation = spyOn(mockPrime, 'setTranslation');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should ngInit calls initAppLanguage ', () => {
    const comp = TestBed.createComponent(AppComponent).componentInstance;
    const spyInitAppLanguague = spyOn(comp, 'initAppLanguage').and.returnValues();
    comp.ngOnInit();
    expect(spyInitAppLanguague).toHaveBeenCalled();
    expect(mockPrime.ripple).toEqual(true);
  });

  it('should initAppLanguage no change lang', fakeAsync(() => {
    spyTranslateUse.and.returnValues(of('en'));
    spyTranslateGet.and.returnValues(of({
      primeng: {
        cancel: 'cancel'
      }
    }));
    spyTranslateOnLangChange.and.returnValues(new Observable());
    spyLangGetUserPreferredLang.and.returnValues('fr');
    spyLangSetUserPreferredLang.and.callThrough();
    spyPrimeSetTranslation.and.callThrough();

    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.initAppLanguage();
    flushMicrotasks();
    expect(spyPrimeSetTranslation).toHaveBeenCalledWith({primeng: {cancel: 'cancel'}});
    expect(app.isAppLoaded).toEqual(true);
  }));

  it('should initAppLanguage and change lang', fakeAsync(() => {
    spyTranslateUse.and.returnValues(of('en'));
    spyTranslateGet.and.returnValues(of({
      primeng: {
        cancel: 'cancel'
      }
    }));
    spyTranslateOnLangChange.and.returnValues(of({
      translations: {
        primeng: {
          cancel: 'annuler'
        }
      }
    }));
    spyLangGetUserPreferredLang.and.returnValues('fr');
    spyLangSetUserPreferredLang.and.callThrough();
    spyPrimeSetTranslation.and.callThrough();

    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.initAppLanguage();
    flushMicrotasks();
    // Called 2 times, the lastest change definitly primeng translation
    expect(spyPrimeSetTranslation).toHaveBeenCalledTimes(2);
    const setTranslationPirmeArgs = spyPrimeSetTranslation.calls.mostRecent().args;
    expect(setTranslationPirmeArgs).toEqual([{ cancel: 'annuler'}]);
    expect(app.isAppLoaded).toEqual(true);
  }));
});
