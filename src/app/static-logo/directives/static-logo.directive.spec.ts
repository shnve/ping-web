import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { StaticLogoApi } from '../api/static-logo.api';
import { StaticLogo } from '../models/static-logo.model';
import { StaticLogoDirective } from './static-logo.directive';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
  template: `<span [staticLogoDirective]="'logo-armada'"></span>`
})
class TestStaticLogoDirectiveComponent {
}

describe('StaticLogoDirective', () => {

  let component: TestStaticLogoDirectiveComponent;
  let fixture: ComponentFixture<TestStaticLogoDirectiveComponent>;
  let divEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [
        TestStaticLogoDirectiveComponent,
        StaticLogoDirective
    ],
    imports: [TranslateModule.forRoot()],
    providers: [
        MockProvider(StaticLogoApi, {
            findOneByKey$(key: string): Observable<StaticLogo> {
                return of({
                    id: '1',
                    key: 'logo-armada',
                    description: 'logo shom',
                    locked: false,
                    content: 'contenu base64',
                    altTxt: 'altFr',
                    altTxtInternational: 'altEn'
                });
            }
        }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(TestStaticLogoDirectiveComponent);
    component = fixture.componentInstance;
    divEl = fixture.debugElement.query(By.css('span'));
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should load logo-armada', () => {
    fixture.detectChanges();
    const htmlElement = divEl.nativeElement as HTMLElement;
    expect(htmlElement.innerHTML).toEqual('<span><img class="logo-armada" src="contenu base64" alt="altEn" title=""></span>');
  });
});
