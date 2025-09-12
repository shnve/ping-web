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

  it('should set page title to PING when title is not provided', fakeAsync(() => {
    // GIVEN
    router.resetConfig([
      {
        path: 'home',
        component: TestComponent
      }
    ]);

    // WHEN
    router.navigateByUrl('/home');
    tick();

    // THEN
    expect(document.title).toBe('PING');
  }));

  it('should prefix page title with "PING - " when title is provided', fakeAsync(() => {
    // GIVEN
    router.resetConfig([
      {
        path: 'avurnav-notice',
        title: 'Avertissements et avis',
        component: TestComponent
      }
    ]);

    // WHEN
    router.navigateByUrl('/avurnav-notice');
    tick();

    // THEN
    expect(document.title).toBe('PING - Avertissements et avis');
  }));
});

@Component({template: ''})
export class TestComponent {
}
