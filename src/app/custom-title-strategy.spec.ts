import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { CustomTitleStrategy } from '@app/custom-title-strategy';
import { TranslateService } from '@ngx-translate/core';

class MockTranslateService {
  getLangs(): string[] {
    return ['en', 'fr'];
  }

  instant(s: string): string {
    return s;
  }
}

describe('AppTitleStrategyService', () => {
  let router: Router;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: TitleStrategy, useClass: CustomTitleStrategy},
        {provide: TranslateService, useClass: MockTranslateService}
      ],
    });
    router = TestBed.inject(Router);
    document = TestBed.inject(DOCUMENT);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should prefix page title with "PISAC - " when title is provided', fakeAsync(() => {
    router.resetConfig([
      { path: 'home', component: TestComponent, title: 'home' }
    ]);
    router.navigateByUrl('/home');
    tick();

    expect(document.title).toBe('PISAC - Accueil');
  }));

  it('should translate page title', fakeAsync(() => {
    router.resetConfig([
      { path: 'avurnav', component: TestComponent, title: 'avurnav' }
    ]);
    router.navigateByUrl('/avurnav');
    tick();

    expect(document.title).toBe('PISAC - Avertissements et avis');
  }));
});

@Component({template: ''})
export class TestComponent {
}
