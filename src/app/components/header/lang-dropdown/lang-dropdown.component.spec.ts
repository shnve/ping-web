import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LangDropdownComponent } from '@app/components/header/lang-dropdown/lang-dropdown.component';
import { DOCUMENT } from '@angular/common';

describe('LangDropdownComponent', () => {
  let component: LangDropdownComponent;
  let fixture: ComponentFixture<LangDropdownComponent>;
  let mockTranslateService: TranslateService;
  let document: Document;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LangDropdownComponent],
      imports: [
        TranslateModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    document = TestBed.inject(DOCUMENT);
    mockTranslateService = TestBed.inject(TranslateService);
    mockTranslateService.currentLang = 'fr';
    spyOn(mockTranslateService, 'instant').and.callFake(() =>
      mockTranslateService.currentLang === 'fr' ? 'meta description fr' : 'meta description en'
    );
    fixture = TestBed.createComponent(LangDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should create', (done) => {
    expect(component).toBeTruthy();
    done();
  });

  it('should set html meta description and lang to current language on init', (done) => {
    // WHEN
    component.ngOnInit();

    // THEN
    const description = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(description.content).toBe('meta description fr');
    expect(document.documentElement.lang).toBe('fr');
    done();
  });

  it('should update html meta description and lang on change lang', (done) => {
    // WHEN
    component.onChangeLanguage('en');

    // THEN
    const description = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(description.content).toBe('meta description en');
    expect(document.documentElement.lang).toBe('en');
    done();
  });
});

